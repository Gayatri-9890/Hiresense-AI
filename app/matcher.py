def match_resume_with_job(resume_skills):

    job_required_skills = [
        "Python",
        "SQL",
        "FastAPI",
        "Git",
        "Docker",
        "AWS"
    ]

    matched_skills = []
    missing_skills = []

    for skill in job_required_skills:
        if skill in resume_skills:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    match_score = int((len(matched_skills) / len(job_required_skills)) * 100)

    suggestions = []

    for skill in missing_skills:
        suggestions.append(f"Improve skill in {skill}")

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions
    }