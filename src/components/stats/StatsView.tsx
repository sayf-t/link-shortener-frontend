import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { LOOKUP_DEBOUNCE_MS, DEFAULT_ERROR_MESSAGE } from '../../constants'
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback'
import type { LinksPort } from '../../ports/links.port'
import { createLinkShortenerApiAdapter } from '../../adapters/link-shortener-api.adapter'
import type { LinkStats } from '../../types/links'
import BarList from './BarList'
import VisitsTable from './VisitsTable'
import shared from '../../styles/shared.module.css'
import styles from './StatsView.module.css'

interface Props {
  initialCode?: string
  linksPort?: LinksPort
}

export default function StatsView({ initialCode = '', linksPort }: Props) {
  const links = useMemo(
    () => linksPort ?? createLinkShortenerApiAdapter(),
    [linksPort]
  )
  const [code, setCode] = useState(initialCode)
  const [stats, setStats] = useState<LinkStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchStats = useCallback(
    async (shortCode: string) => {
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller
      const { signal } = controller

      setLoading(true)
      setError(null)
      setStats(null)

      try {
        const data = await links.getLinkStats(shortCode, signal)
        if (!signal.aborted) setStats(data)
      } catch (err) {
        if (!signal.aborted && (err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE)
        }
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    },
    [links]
  )

  const debouncedFetchStats = useDebouncedCallback(
    fetchStats,
    LOOKUP_DEBOUNCE_MS
  )

  useEffect(() => {
    if (!initialCode) return
    setCode(initialCode)
    fetchStats(initialCode)
  }, [initialCode, fetchStats])

  useEffect(() => {
    return () => abortControllerRef.current?.abort()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setStats(null)
    debouncedFetchStats(trimmed)
  }

  const countryItems = stats
    ? Object.entries(stats.clicks_by_country)
        .sort(([, a], [, b]) => b - a)
        .map(([country, count]) => ({
          label: country,
          count,
          pct: stats.total_clicks
            ? Math.round((count / stats.total_clicks) * 100)
            : 0,
          showPct: true,
        }))
    : []

  const maxDateCount = stats
    ? Math.max(...Object.values(stats.clicks_by_date), 1)
    : 1

  const dateItems = stats
    ? Object.entries(stats.clicks_by_date)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, count]) => ({
          label: date,
          count,
          pct: Math.round((count / maxDateCount) * 100),
        }))
    : []

  return (
    <section className={shared.panel}>
      <form onSubmit={handleSubmit} className={shared.form}>
        <label htmlFor="stats-short-code" className={shared.srOnly}>
          Short code
        </label>
        <input
          id="stats-short-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter a short code, e.g. Xk9mR2q"
          className={shared.urlInput}
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className={shared.btnPrimary}
        >
          {loading ? 'Loading...' : 'Look up'}
        </button>
      </form>

      {error && (
        <div className={shared.alertError} role="alert" aria-live="assertive">
          <div className={shared.alertErrorBody}>
            <span>{error}</span>
            {code.trim() && (
              <button
                type="button"
                className={shared.alertRetry}
                onClick={() => fetchStats(code.trim())}
              >
                Try again
              </button>
            )}
          </div>
          <button
            type="button"
            className={shared.alertErrorDismiss}
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {loading && (
        <div className={shared.skeletonCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div className={shared.skeleton} style={{ width: '50%' }} />
              <div
                className={shared.skeleton}
                style={{ width: '30%', marginTop: '0.5rem' }}
              />
            </div>
            <div className={shared.skeletonBlock} style={{ width: '3rem' }} />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div className={shared.skeletonBlock} />
            <div className={shared.skeletonBlock} />
          </div>
        </div>
      )}

      {!loading && !stats && !error && (
        <p className={styles.hint}>
          Enter a short code above to view analytics.
        </p>
      )}

      {stats && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>{stats.title || 'Untitled'}</h2>
              <span className={shared.code}>{stats.short_code}</span>
            </div>
            <div className={styles.total}>
              <span className={styles.totalNumber}>{stats.total_clicks}</span>
              <span className={styles.totalLabel}>
                {stats.total_clicks === 1 ? 'click' : 'clicks'}
              </span>
            </div>
          </div>

          {stats.total_clicks === 0 && (
            <p className={styles.emptyMessage}>
              No clicks recorded yet. Share your link to start tracking.
            </p>
          )}

          {countryItems.length > 0 && (
            <div className={styles.grid}>
              <div className={styles.section}>
                <h3 className={styles.sectionHeading}>By country</h3>
                <BarList items={countryItems} />
              </div>

              {dateItems.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionHeading}>By date</h3>
                  <BarList items={dateItems} />
                </div>
              )}
            </div>
          )}

          {stats.visits.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionHeading}>Recent visits</h3>
              <VisitsTable visits={stats.visits} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
