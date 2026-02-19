import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SUBMIT_DEBOUNCE_MS,
  TITLE_POLL_INTERVAL_MS,
  TITLE_POLL_MAX_ATTEMPTS,
  DEFAULT_ERROR_MESSAGE,
} from '../../constants'
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback'
import type { LinksPort } from '../../ports/links.port'
import type { LinkHistoryPort } from '../../ports/link-history.port'
import { createLinkShortenerApiAdapter } from '../../adapters/link-shortener-api.adapter'
import { createLocalStorageHistoryAdapter } from '../../adapters/local-storage-history.adapter'
import type { CreateLinkResponse, HistoryEntry } from '../../types/links'
import ResultCard from './ResultCard'
import HistoryAccordion from './HistoryAccordion'
import shared from '../../styles/shared.module.css'

interface Props {
  onViewStats: (shortCode: string) => void
  linksPort?: LinksPort
  historyPort?: LinkHistoryPort
}

export default function ShortenForm({
  onViewStats,
  linksPort,
  historyPort,
}: Props) {
  const links = useMemo(
    () => linksPort ?? createLinkShortenerApiAdapter(),
    [linksPort]
  )
  const historyAdapter = useMemo(
    () => historyPort ?? createLocalStorageHistoryAdapter(),
    [historyPort]
  )

  const [targetUrl, setTargetUrl] = useState('')
  const [result, setResult] = useState<CreateLinkResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [titleLoading, setTitleLoading] = useState(false)
  const [titleLookupRetryToken, setTitleLookupRetryToken] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    historyAdapter.load()
  )
  const [accordionOpen, setAccordionOpen] = useState(false)

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
        const stats = await links.getLinkStats(shortCode)
        if (cancelled) return

        if (stats.title) {
          setResult((prev) =>
            prev && prev.short_code === shortCode
              ? { ...prev, title: stats.title }
              : prev
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
  }, [result?.short_code, result?.title, titleLookupRetryToken, links])

  const submitUrl = useCallback(
    async (url: string) => {
      setLoading(true)
      setError(null)
      setResult(null)
      setTitleLookupRetryToken(0)
      try {
        const link = await links.createShortLink(url)
        setResult(link)
        setTargetUrl('')
        const entry: HistoryEntry = {
          target_url: link.target_url,
          short_url: link.short_url,
          short_code: link.short_code,
          title: link.title ?? null,
          created_at: new Date().toISOString(),
        }
        setHistory((prev) => {
          const next = [
            entry,
            ...prev.filter((e) => e.short_code !== link.short_code),
          ]
          historyAdapter.save(next)
          return next
        })
        setAccordionOpen(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE)
      } finally {
        setLoading(false)
      }
    },
    [links, historyAdapter]
  )

  const debouncedSubmit = useDebouncedCallback(
    (url: string) => void submitUrl(url),
    SUBMIT_DEBOUNCE_MS
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = targetUrl.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    debouncedSubmit(trimmed)
  }

  const handleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyHistory = (text: string, shortCode: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(shortCode)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <section className={shared.panel}>
      <form onSubmit={handleSubmit} className={shared.form}>
        <label htmlFor="shorten-target-url" className={shared.srOnly}>
          URL to shorten
        </label>
        <input
          id="shorten-target-url"
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

      {error && (
        <div className={shared.alertError} role="alert" aria-live="assertive">
          <span className={shared.alertErrorBody}>{error}</span>
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

      {loading && !result && (
        <div className={shared.skeletonCard}>
          <div className={shared.skeleton} style={{ width: '60%' }} />
          <div
            className={shared.skeleton}
            style={{ width: '40%', marginTop: '0.5rem' }}
          />
          <div
            className={shared.skeleton}
            style={{ width: '80%', marginTop: '0.5rem' }}
          />
        </div>
      )}

      {result && (
        <ResultCard
          result={result}
          titleLoading={titleLoading}
          copied={copied}
          onCopy={handleCopyResult}
          onRetryTitle={() => setTitleLookupRetryToken((v) => v + 1)}
          onViewStats={onViewStats}
        />
      )}

      <HistoryAccordion
        history={history}
        open={accordionOpen}
        copiedCode={copiedCode}
        onToggle={() => setAccordionOpen((open) => !open)}
        onCopy={handleCopyHistory}
        onViewStats={onViewStats}
      />
    </section>
  )
}
