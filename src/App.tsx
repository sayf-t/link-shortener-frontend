import { useState } from 'react'
import { createShortLink, getLinkStats, type CreateLinkResponse, type LinkStats } from './api'
import './App.css'

function App() {
  const [targetUrl, setTargetUrl] = useState('')
  const [shortLink, setShortLink] = useState<CreateLinkResponse | null>(null)
  const [statsCode, setStatsCode] = useState('')
  const [stats, setStats] = useState<LinkStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUrl.trim()) return

    setLoading(true)
    setError(null)
    try {
      const result = await createShortLink(targetUrl.trim())
      setShortLink(result)
      setTargetUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create short link')
    } finally {
      setLoading(false)
    }
  }

  const handleGetStats = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!statsCode.trim()) return

    setStatsLoading(true)
    setStatsError(null)
    try {
      const result = await getLinkStats(statsCode.trim())
      setStats(result)
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Failed to fetch stats')
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="app">
      <h1>Link Shortener</h1>
      <p className="subtitle">Create short links and track their stats</p>

      <section className="section">
        <h2>Create Short Link</h2>
        <form onSubmit={handleCreateLink} className="form">
          <div className="input-group">
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/long/url"
              className="input"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !targetUrl.trim()} className="button">
              {loading ? 'Creating...' : 'Shorten'}
            </button>
          </div>
        </form>

        {error && <div className="error">{error}</div>}

        {shortLink && (
          <div className="result">
            <div className="result-item">
              <label>Short URL:</label>
              <div className="link-display">
                <a href={shortLink.short_url} target="_blank" rel="noopener noreferrer">
                  {shortLink.short_url}
                </a>
                <button
                  onClick={() => copyToClipboard(shortLink.short_url)}
                  className="copy-button"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
            {shortLink.title && (
              <div className="result-item">
                <label>Title:</label>
                <span>{shortLink.title}</span>
              </div>
            )}
            <div className="result-item">
              <label>Target URL:</label>
              <span className="target-url">{shortLink.target_url}</span>
            </div>
            <div className="result-item">
              <label>Short Code:</label>
              <span className="code">{shortLink.short_code}</span>
            </div>
          </div>
        )}
      </section>

      <section className="section">
        <h2>View Stats</h2>
        <form onSubmit={handleGetStats} className="form">
          <div className="input-group">
            <input
              type="text"
              value={statsCode}
              onChange={(e) => setStatsCode(e.target.value)}
              placeholder="Enter short code (e.g., Xk9mR2q)"
              className="input"
              disabled={statsLoading}
            />
            <button type="submit" disabled={statsLoading || !statsCode.trim()} className="button">
              {statsLoading ? 'Loading...' : 'Get Stats'}
            </button>
          </div>
        </form>

        {statsError && <div className="error">{statsError}</div>}

        {stats && (
          <div className="stats">
            <div className="stats-header">
              <h3>{stats.title || 'Untitled Link'}</h3>
              <span className="code">{stats.short_code}</span>
            </div>

            <div className="stat-card">
              <div className="stat-value">{stats.total_clicks}</div>
              <div className="stat-label">Total Clicks</div>
            </div>

            {Object.keys(stats.clicks_by_country).length > 0 && (
              <div className="stat-section">
                <h4>Clicks by Country</h4>
                <div className="stat-list">
                  {Object.entries(stats.clicks_by_country)
                    .sort(([, a], [, b]) => b - a)
                    .map(([country, count]) => (
                      <div key={country} className="stat-row">
                        <span className="stat-key">{country}</span>
                        <span className="stat-value-small">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {Object.keys(stats.clicks_by_date).length > 0 && (
              <div className="stat-section">
                <h4>Clicks by Date</h4>
                <div className="stat-list">
                  {Object.entries(stats.clicks_by_date)
                    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                    .map(([date, count]) => (
                      <div key={date} className="stat-row">
                        <span className="stat-key">{date}</span>
                        <span className="stat-value-small">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default App
