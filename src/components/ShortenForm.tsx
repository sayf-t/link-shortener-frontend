import { useEffect, useState } from 'react'
import { createShortLink, getLinkStats, type CreateLinkResponse } from '../api'
import shared from '../styles/shared.module.css'
import styles from './ShortenForm.module.css'

interface Props {
  onViewStats: (shortCode: string) => void
}

const TITLE_POLL_INTERVAL_MS = 1500
const TITLE_POLL_MAX_ATTEMPTS = 6

export default function ShortenForm({ onViewStats }: Props) {
  const [targetUrl, setTargetUrl] = useState('')
  const [result, setResult] = useState<CreateLinkResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [titleLoading, setTitleLoading] = useState(false)

  useEffect(() => {
    const shortCode = result?.short_code
    if (!shortCode || result?.title) {
      setTitleLoading(false)
      return
    }

    let cancelled = false
    let timeoutId: number | undefined
    let attempts = 0

    const pollTitle = async () => {
      attempts += 1

      try {
        const stats = await getLinkStats(shortCode)
        if (cancelled) return

        if (stats.title) {
          setResult((prev) =>
            prev && prev.short_code === shortCode
              ? { ...prev, title: stats.title }
              : prev,
          )
          setTitleLoading(false)
          return
        }
      } catch {
        // Keep polling for a short window to avoid transient failures.
      }

      if (cancelled || attempts >= TITLE_POLL_MAX_ATTEMPTS) {
        setTitleLoading(false)
        return
      }

      timeoutId = window.setTimeout(pollTitle, TITLE_POLL_INTERVAL_MS)
    }

    setTitleLoading(true)
    void pollTitle()

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [result?.short_code, result?.title])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUrl.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const link = await createShortLink(targetUrl.trim())
      setResult(link)
      setTargetUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className={shared.panel}>
      <form onSubmit={handleSubmit} className={shared.form}>
        <input
          type="url"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="Paste a long URL here..."
          className={shared.urlInput}
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !targetUrl.trim()}
          className={shared.btnPrimary}
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {error && <div className={shared.alertError}>{error}</div>}

      {result && (
        <div className={styles.card}>
          <div className={styles.shortUrl}>
            <a href={result.short_url} target="_blank" rel="noopener noreferrer">
              {result.short_url}
            </a>
            <button
              onClick={() => copyToClipboard(result.short_url)}
              className={shared.btnCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className={styles.titleRow}>
            <span className={styles.titleLabel}>Title</span>
            {result.title ? (
              <p className={styles.pageTitle}>{result.title}</p>
            ) : titleLoading ? (
              <div className={styles.titleLoading} role="status" aria-live="polite">
                <span className={styles.spinner} aria-hidden="true" />
                <span>Fetching title...</span>
              </div>
            ) : (
              <p className={styles.pageTitleFallback}>Title unavailable</p>
            )}
          </div>

          <p className={styles.targetUrl}>{result.target_url}</p>

          <button
            className={shared.btnGhost}
            onClick={() => onViewStats(result.short_code)}
          >
            View stats
          </button>
        </div>
      )}
    </section>
  )
}
