import { useState } from 'react'
import DeveloperCard from './components/DeveloperCard'
import './App.css'

export interface DevData {
  username: string
  name: string
  avatar: string
  bio: string
  location: string
  company: string
  followers: number
  following: number
  public_repos: number
  github_url: string
  created_at: string
  total_repos: number
  total_stars: number
  total_forks: number
  top_languages: { language: string; count: number; pct: number }[]
  top_repos: { name: string; description: string; stars: number; forks: number; language: string; url: string }[]
  score: number
  score_breakdown: { repos: number; stars: number; activity: number; diversity: number }
  dev_type: { label: string; color: string; emoji: string }
}

const API = 'http://localhost:8002'

export default function App() {
  const [username, setUsername] = useState('')
  const [data, setData] = useState<DevData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!username.trim()) return
    setLoading(true)
    setError('')
    setData(null)
    try {
      const r = await fetch(`${API}/analyze/${username.trim()}`)
      if (!r.ok) {
        const err = await r.json()
        throw new Error(err.detail || 'Analysis failed')
      }
      const d = await r.json()
      setData(d)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="hero">
        <div className="hero-tag">github profile analyzer</div>
        <h1 className="hero-title">DEV<span>DECK</span></h1>
        <p className="hero-sub">Drop in any GitHub username. Get a developer card with scores, stack analysis, and insights.</p>

        <div className="search-row">
          <span className="search-at">@</span>
          <input
            className="search-input"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          />
          <button className="search-btn" onClick={handleAnalyze} disabled={loading || !username.trim()}>
            {loading ? <span className="btn-spinner" /> : 'analyze →'}
          </button>
        </div>

        {error && <div className="search-error">{error}</div>}
      </div>

      {data && <DeveloperCard data={data} />}

      <footer className="footer">
        DevDeck · built with the GitHub API ·
        <a href="https://github.com/DanielAguilar112/devdeck" target="_blank" rel="noreferrer"> github</a>
      </footer>
    </div>
  )
}