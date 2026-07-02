import json
import os
import shutil
from datetime import datetime
from io import BytesIO
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.advisor import generate_resume_suggestions
from app.analyzer import analyze_resume
from app.database import (
    delete_candidate,
    get_all_candidates,
    get_candidate_by_id,
    get_candidate_history,
    save_candidate,
    update_candidate_status,
)
from app.evaluator import evaluate_candidate
from app.matcher import match_resume_with_job
from app.parser import extract_text_from_pdf
from app.ranker import rank_candidates

app = FastAPI()

users_db = {}

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class CandidateHistoryItem(BaseModel):
    candidate_name: str
    resume_score: int
    date: str
    status: str
    resume_filename: str | None = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "HireSense AI Backend Running Successfully"
    }


@app.post("/register")
def register_user(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    users_db[user.email] = {"email": user.email, "password": user.password}
    return {"message": "User registered successfully"}


@app.post("/login")
def login_user(user: UserLogin):
    stored_user = users_db.get(user.email)

    if not stored_user or stored_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful", "email": user.email}


@app.post("/save-candidate")
def save_candidate_record(candidate: CandidateHistoryItem):
    save_candidate(
        candidate_name=candidate.candidate_name,
        resume_score=candidate.resume_score,
        date=candidate.date,
        status=candidate.status,
        resume_filename=getattr(candidate, "resume_filename", None),
    )
    return {"message": "Candidate saved to history"}


@app.get("/history")
def get_history():
    return {"history": get_candidate_history()}


@app.get("/all-candidates")
def all_candidates():
    return {"candidates": get_all_candidates()}


@app.put("/update-status/{candidate_id}")
def update_status(candidate_id: int, payload: dict):
    status = payload.get("status")
    if status not in ["Selected", "Review", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    update_candidate_status(candidate_id, status)
    return {"message": "Status updated successfully"}


@app.delete("/delete-candidate/{candidate_id}")
def delete_candidate_record(candidate_id: int):
    delete_candidate(candidate_id)
    return {"message": "Candidate deleted successfully"}


@app.get("/generate-report/{candidate_id}")
def generate_report(candidate_id: int):
    candidate = get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("HireSense AI Resume Report", styles["Title"]))
    story.append(Spacer(1, 12))

    table_data = [
        ["Candidate Name", candidate.get("candidate_name", "N/A")],
        ["Resume Score", f"{candidate.get('resume_score', 'N/A')}/100"],
        ["Status", candidate.get("status", "N/A")],
        ["Date", candidate.get("date", "N/A")],
    ]
    table = Table(table_data, colWidths=[180, 320])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.whitesmoke),
                ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#3b82f6")),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("Detected Skills", styles["Heading2"]))
    skills = json.loads(candidate.get("skills") or "[]")
    story.append(Paragraph(", ".join(skills) if skills else "No skills detected", styles["BodyText"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Weak Areas", styles["Heading2"]))
    weak_areas = json.loads(candidate.get("weak_areas") or "[]")
    story.append(Paragraph("\n".join(weak_areas) if weak_areas else "No weak areas detected", styles["BodyText"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("AI Suggestions", styles["Heading2"]))
    suggestions = json.loads(candidate.get("suggestions") or "[]")
    story.append(Paragraph("\n".join(suggestions) if suggestions else "No suggestions available", styles["BodyText"]))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    filename = f"{candidate.get('candidate_name', 'candidate').replace(' ', '_')}_report.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@app.post("/upload-resume/")
def upload_resume(files: List[UploadFile] = File(default=[])):

    if not files:
        return {
            "error": "Please upload at least one PDF resume"
        }

    os.makedirs("uploads", exist_ok=True)

    ranked_candidates = []

    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            continue

        file_location = f"uploads/{file.filename}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text_from_pdf(file_location)
        analysis = analyze_resume(extracted_text)
        job_match = match_resume_with_job(analysis["skills"])
        evaluation = evaluate_candidate(analysis, job_match)
        suggestions = generate_resume_suggestions(analysis, job_match)

        candidate_id = save_candidate(
            candidate_name=file.filename.replace(".pdf", ""),
            resume_score=analysis["score"],
            date=datetime.now().strftime("%Y-%m-%d"),
            status="Review",
            resume_filename=file.filename,
            skills=json.dumps(analysis["skills"]),
            weak_areas=json.dumps(suggestions["weak_areas"]),
            suggestions=json.dumps(suggestions["suggestions"]),
        )

        ranked_candidates.append({
            "name": file.filename.replace(".pdf", ""),
            "score": analysis["score"],
            "analysis": analysis,
            "job_match": job_match,
            "evaluation": evaluation,
            "feedback": suggestions,
            "improvement_suggestions": suggestions["suggestions"],
            "db_id": candidate_id,
        })

    if not ranked_candidates:
        return {
            "error": "Only PDF files are allowed"
        }

    ranked_candidates = rank_candidates(ranked_candidates)

    return {
        "files_received": [file.filename for file in files],
        "candidate_ranking": ranked_candidates,
        "total_candidates": len(ranked_candidates)
    }