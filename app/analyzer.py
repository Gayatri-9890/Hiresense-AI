import re


def analyze_resume(text):

    skills_database = [
        "Python",
        "Java",
        "C++",
        "SQL",
        "FastAPI",
        "React",
        "Machine Learning",
        "JavaScript",
        "Node.js",
        "MongoDB",
        "AWS",
        "Docker",
        "Git",
        "HTML",
        "CSS",
    ]

    text_lower = text.lower()
    found_skills = [skill for skill in skills_database if skill.lower() in text_lower]

    education = None
    if "b.tech" in text_lower:
        education = "B.Tech"
    elif "bachelor" in text_lower:
        education = "Bachelor Degree"

    email_pattern = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
    emails = re.findall(email_pattern, text)
    email = emails[0] if emails else None

    certifications = []
    if "certificate" in text_lower or "certification" in text_lower:
        certifications.append("Certification Found")

    projects = []
    if "project" in text_lower:
        projects.append("Projects Mentioned")

    summary_present = any(keyword in text_lower for keyword in ["summary", "about me", "profile", "objective"])
    experience_present = any(keyword in text_lower for keyword in ["internship", "experience", "work experience", "professional experience", "employment", "job"])

    score = 0
    reason = []

    score += len(found_skills) * 8
    if len(found_skills) >= 3:
        reason.append("Strong technical skills detected")

    if education == "B.Tech":
        score += 20
        reason.append("Engineering degree found")

    if len(projects) > 0:
        score += 15
        reason.append("Projects section available")

    if len(certifications) > 0:
        score += 10
        reason.append("Certification section available")

    if summary_present:
        score += 8
        reason.append("Summary/about section present")

    if experience_present:
        score += 10
        reason.append("Experience section present")

    if score > 100:
        score = 100

    return {
        "skills": found_skills,
        "education": education,
        "email": email,
        "certifications": certifications,
        "projects": projects,
        "summary_present": summary_present,
        "experience_present": experience_present,
        "score": score,
        "reason": reason,
    }