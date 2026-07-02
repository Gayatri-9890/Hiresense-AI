def evaluate_candidate(analysis, job_match):

    score = analysis["score"]
    match_score = job_match["match_score"]

    evaluation = ""
    strengths = []
    weaknesses = []
    recommendation = ""

    # Candidate quality
    if score >= 70:
        evaluation = "Strong Candidate"
    elif score >= 40:
        evaluation = "Average Candidate"
    else:
        evaluation = "Weak Candidate"

    # Strengths
    if len(analysis["skills"]) >= 3:
        strengths.append("Multiple technical skills detected")

    if analysis["education"] is not None:
        strengths.append("Education qualification available")

    if len(analysis["projects"]) > 0:
        strengths.append("Projects section found")

    # Weaknesses
    if len(job_match["missing_skills"]) > 0:
        for skill in job_match["missing_skills"]:
            weaknesses.append(f"Missing skill: {skill}")

    # Recommendation
    if match_score >= 70:
        recommendation = "Shortlist candidate for interview"

    elif match_score >= 40:
        recommendation = "Candidate needs skill improvement"

    else:
        recommendation = "Not suitable for current job role"

    return {
        "evaluation": evaluation,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendation": recommendation
    }