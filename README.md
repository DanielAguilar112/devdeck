# DevDeck

GitHub profile analyzer that generates a developer card with scores, stack analysis, and insights. Enter any GitHub username and get a full breakdown of their languages, top repos, activity, and developer type.

## Live Demo

[http://3.14.146.94/devdeck/](http://3.14.146.94/devdeck/)

## Features

- **Profile Analysis** — fetches up to 500 repos and analyzes language breakdown, commit activity, and repo quality
- **Developer Score** — 100-point score based on repos, stars, activity, and language diversity
- **Developer Type** — classifies the user (Full-Stack Engineer, Systems Engineer, ML Engineer, etc.)
- **Visual Card** — clean UI with score bars, language charts, and top repo links
- **Any Public Profile** — works on any GitHub username

## Tech Stack

| Layer | Technology |
|---|---|
| API fetching | Python, httpx (async) |
| Analysis | Python, collections |
| Backend | FastAPI, uvicorn |
| Frontend | React, TypeScript |
| Deployment | AWS EC2, nginx |

## Project Structure

```
devdeck/
├── backend/
│   ├── analyzer.py     # GitHub API fetching + scoring logic
│   ├── main.py         # FastAPI endpoint
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.tsx
        └── components/
            └── DeveloperCard.tsx
```

## Scoring

| Category | Max Points | How |
|---|---|---|
| Repos | 30 | 3pts per original repo |
| Stars | 25 | 2pts per star (capped) |
| Activity | 25 | Recent pushes weighted by recency |
| Diversity | 20 | 2pts per unique language |

## Setup

```bash
git clone https://github.com/DanielAguilar112/devdeck.git
cd devdeck/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export GITHUB_TOKEN=your_token_here  # optional but recommended (5000 req/hr vs 60)
uvicorn main:app --reload --port 8002
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` and enter any GitHub username.

## API

```
GET /analyze/{username}
```

Returns full profile analysis including score, languages, top repos, and developer type classification.
