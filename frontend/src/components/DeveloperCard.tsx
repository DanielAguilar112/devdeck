import type { DevData } from '../App'
import './DeveloperCard.css'

interface Props { data: DevData }

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <span className="score-bar-val">{value}/{max}</span>
    </div>
  )
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f7df1e', Python: '#3572A5',
  Go: '#00ADD8', Rust: '#dea584', Java: '#b07219', 'C++': '#f34b7d',
  C: '#555555', Ruby: '#701516', Swift: '#FA7343', Kotlin: '#A97BFF',
  HTML: '#e34c26', CSS: '#563d7c', 'Jupyter Notebook': '#DA5B0B',
}

export default function DeveloperCard({ data }: Props) {
  const joinYear = new Date(data.created_at).getFullYear()
  const yearsOnGH = new Date().getFullYear() - joinYear

  return (
    <div className="card-wrap fade-up">
      {/* CARD HEADER */}
      <div className="card-header">
        <div className="card-header-bg" style={{ background: `radial-gradient(ellipse at top left, ${data.dev_type.color}22, transparent 60%)` }} />
        <div className="card-identity">
          <img src={data.avatar} alt={data.username} className="card-avatar" />
          <div>
            <div className="card-name">{data.name}</div>
            <a href={data.github_url} target="_blank" rel="noreferrer" className="card-username">@{data.username}</a>
            {data.bio && <div className="card-bio">{data.bio}</div>}
            <div className="card-meta">
              {data.location && <span>📍 {data.location}</span>}
              {data.company && <span>🏢 {data.company}</span>}
              <span>📅 GitHub since {joinYear} ({yearsOnGH}y)</span>
            </div>
          </div>
        </div>
        <div className="card-type-badge" style={{ borderColor: data.dev_type.color, color: data.dev_type.color }}>
          {data.dev_type.emoji} {data.dev_type.label}
        </div>
      </div>

      {/* STATS ROW */}
      <div className="stats-row">
        {[
          { label: 'repos', value: data.total_repos },
          { label: 'stars', value: data.total_stars },
          { label: 'forks', value: data.total_forks },
          { label: 'followers', value: data.followers },
        ].map(s => (
          <div key={s.label} className="stat-cell">
            <span className="stat-num">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card-body">
        <div className="card-left">
          {/* SCORE */}
          <div className="section">
            <div className="section-label">// developer score</div>
            <div className="big-score" style={{ color: data.dev_type.color }}>
              {data.score}<span className="big-score-max">/100</span>
            </div>
            <div className="score-bars">
              <ScoreBar label="repos" value={data.score_breakdown.repos} max={30} color="#4d9fff" />
              <ScoreBar label="stars" value={data.score_breakdown.stars} max={25} color="#ffc940" />
              <ScoreBar label="activity" value={data.score_breakdown.activity} max={25} color="#00ff87" />
              <ScoreBar label="diversity" value={data.score_breakdown.diversity} max={20} color="#b06aff" />
            </div>
          </div>

          {/* LANGUAGES */}
          <div className="section">
            <div className="section-label">// languages</div>
            <div className="lang-list">
              {data.top_languages.map(l => (
                <div key={l.language} className="lang-row">
                  <span className="lang-dot" style={{ background: LANG_COLORS[l.language] || '#888' }} />
                  <span className="lang-name">{l.language}</span>
                  <div className="lang-bar-track">
                    <div className="lang-bar-fill" style={{ width: `${l.pct}%`, background: LANG_COLORS[l.language] || '#888' }} />
                  </div>
                  <span className="lang-pct">{l.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP REPOS */}
        <div className="card-right">
          <div className="section-label">// top repositories</div>
          <div className="repo-list">
            {data.top_repos.map(r => (
              <a key={r.name} href={r.url} target="_blank" rel="noreferrer" className="repo-card">
                <div className="repo-name">{r.name}</div>
                {r.description && <div className="repo-desc">{r.description}</div>}
                <div className="repo-meta">
                  {r.language !== '—' && (
                    <span className="repo-lang">
                      <span className="lang-dot sm" style={{ background: LANG_COLORS[r.language] || '#888' }} />
                      {r.language}
                    </span>
                  )}
                  <span className="repo-stars">⭐ {r.stars}</span>
                  <span className="repo-forks">🍴 {r.forks}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}