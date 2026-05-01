import os
import httpx
from datetime import datetime, timezone
from collections import Counter

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
BASE_URL = "https://api.github.com"

def get_headers():
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


async def fetch_user(username: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"{BASE_URL}/users/{username}", headers=get_headers())
        if r.status_code == 404:
            raise ValueError(f"User '{username}' not found")
        r.raise_for_status()
        return r.json()


async def fetch_repos(username: str) -> list:
    repos = []
    page = 1
    async with httpx.AsyncClient(timeout=15) as client:
        while True:
            r = await client.get(
                f"{BASE_URL}/users/{username}/repos",
                headers=get_headers(),
                params={"per_page": 100, "page": page, "type": "owner", "sort": "updated"},
            )
            r.raise_for_status()
            batch = r.json()
            if not batch:
                break
            repos.extend(batch)
            if len(batch) < 100:
                break
            page += 1
            if page > 5:  # cap at 500 repos
                break
    return repos


def analyze_repos(repos: list) -> dict:
    if not repos:
        return {}

    # Filter out forks for language analysis
    own_repos = [r for r in repos if not r.get("fork")]
    all_repos = repos

    # Language breakdown
    lang_counter = Counter()
    for r in own_repos:
        if r.get("language"):
            lang_counter[r["language"]] += 1
    total_lang = sum(lang_counter.values()) or 1
    top_languages = [
        {"language": lang, "count": count, "pct": round(count / total_lang * 100)}
        for lang, count in lang_counter.most_common(6)
    ]

    # Top repos by stars
    top_repos = sorted(all_repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)[:5]
    top_repos_clean = [
        {
            "name": r["name"],
            "description": r.get("description") or "",
            "stars": r.get("stargazers_count", 0),
            "forks": r.get("forks_count", 0),
            "language": r.get("language") or "—",
            "url": r.get("html_url", ""),
            "updated_at": r.get("updated_at", ""),
        }
        for r in top_repos
    ]

    # Activity score (based on recent updates)
    now = datetime.now(timezone.utc)
    recent_count = 0
    for r in own_repos:
        pushed = r.get("pushed_at")
        if pushed:
            try:
                dt = datetime.fromisoformat(pushed.replace("Z", "+00:00"))
                days_ago = (now - dt).days
                if days_ago < 30:
                    recent_count += 3
                elif days_ago < 90:
                    recent_count += 2
                elif days_ago < 365:
                    recent_count += 1
            except Exception:
                pass

    # Stars total
    total_stars = sum(r.get("stargazers_count", 0) for r in all_repos)
    total_forks = sum(r.get("forks_count", 0) for r in all_repos)

    # Score calculation
    repo_score = min(len(own_repos) * 3, 30)        # up to 30 pts
    star_score = min(total_stars * 2, 25)             # up to 25 pts
    activity_score = min(recent_count * 2, 25)        # up to 25 pts
    diversity_score = min(len(lang_counter) * 2, 20)  # up to 20 pts
    total_score = repo_score + star_score + activity_score + diversity_score

    # Developer type
    dev_type = _classify_developer(lang_counter, own_repos, total_stars)

    return {
        "total_repos": len(own_repos),
        "total_stars": total_stars,
        "total_forks": total_forks,
        "top_languages": top_languages,
        "top_repos": top_repos_clean,
        "score": min(total_score, 100),
        "score_breakdown": {
            "repos": repo_score,
            "stars": star_score,
            "activity": activity_score,
            "diversity": diversity_score,
        },
        "dev_type": dev_type,
    }


def _classify_developer(lang_counter: Counter, repos: list, total_stars: int) -> dict:
    langs = set(lang_counter.keys())
    top_lang = lang_counter.most_common(1)[0][0] if lang_counter else ""

    # Classify
    if {"TypeScript", "JavaScript"} & langs and {"Python", "Go", "Rust"} & langs:
        label = "Full-Stack Engineer"
        color = "#4488ff"
        emoji = "⚡"
    elif top_lang in ("Python",) and {"Machine Learning", "Jupyter Notebook"} & langs:
        label = "ML / Data Engineer"
        color = "#a06aff"
        emoji = "🧠"
    elif top_lang in ("Rust", "C", "C++", "Go", "Zig"):
        label = "Systems Engineer"
        color = "#ff6b35"
        emoji = "⚙️"
    elif {"TypeScript", "JavaScript", "CSS", "HTML"} & langs:
        label = "Frontend Developer"
        color = "#00e5ff"
        emoji = "🎨"
    elif top_lang in ("Python", "Ruby", "Java", "Go", "PHP"):
        label = "Backend Developer"
        color = "#00e676"
        emoji = "🔧"
    elif total_stars > 100:
        label = "Open Source Contributor"
        color = "#ffd700"
        emoji = "⭐"
    else:
        label = "Software Engineer"
        color = "#4488ff"
        emoji = "💻"

    return {"label": label, "color": color, "emoji": emoji}


async def analyze_user(username: str) -> dict:
    user = await fetch_user(username)
    repos = await fetch_repos(username)
    analysis = analyze_repos(repos)

    return {
        "username": user.get("login"),
        "name": user.get("name") or user.get("login"),
        "avatar": user.get("avatar_url", ""),
        "bio": user.get("bio") or "",
        "location": user.get("location") or "",
        "company": user.get("company") or "",
        "followers": user.get("followers", 0),
        "following": user.get("following", 0),
        "public_repos": user.get("public_repos", 0),
        "github_url": user.get("html_url", ""),
        "created_at": user.get("created_at", ""),
        **analysis,
    }