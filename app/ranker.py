def rank_candidates(candidates):

    ranked_candidates = sorted(
        candidates,
        key=lambda x: x["score"],
        reverse=True
    )

    for candidate in ranked_candidates:
        score = candidate["score"]

        if score > 85:
            candidate["status"] = "Selected"
        elif 60 <= score <= 85:
            candidate["status"] = "Review"
        else:
            candidate["status"] = "Rejected"

    return ranked_candidates