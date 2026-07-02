def generate_resume_suggestions(analysis, job_match):
    suggestions = []
    weak_areas = []

    missing_skills = job_match.get("missing_skills", [])
    if missing_skills:
        suggestions.append(f"Add stronger coverage of {', '.join(missing_skills[:3])} to your resume")
        weak_areas.append("Weak Technical Skills")
    elif len(analysis.get("skills", [])) < 3:
        suggestions.append("Expand your technical skills section with relevant tools and frameworks")
        weak_areas.append("Weak Technical Skills")

    if not analysis.get("projects"):
        suggestions.append("Add a Projects section with measurable work and links")
        weak_areas.append("Missing Projects")

    if not analysis.get("certifications"):
        suggestions.append("Include certifications to strengthen your profile")
        weak_areas.append("Missing Certifications")

    if not analysis.get("summary_present", False):
        suggestions.append("Write a stronger summary/about section that highlights your strengths")
        weak_areas.append("Weak Summary/About Section")

    if not analysis.get("experience_present", False):
        suggestions.append("Add internship or work experience details with achievements")
        weak_areas.append("Missing Internship/Experience")

    if analysis.get("score", 0) < 60:
        suggestions.append("Improve formatting and include stronger evidence of skills and impact")
        weak_areas.append("Low overall resume score")

    if not suggestions:
        suggestions.append("Your resume looks strong. Keep improving advanced technical skills.")

    return {
        "suggestions": suggestions,
        "weak_areas": weak_areas,
        "score": analysis.get("score", 0),
    }