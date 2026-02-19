import { useCallback, useEffect, useState } from 'react'
import { createShortLink, getLinkStats } from '../api'
import {
  SUBMIT_DEBOUNCE_MS,
  TITLE_POLL_INTERVAL_MS,
  TITLE_POLL_MAX_ATTEMPTS,
  DEFAULT_ERROR_MESSAGE,
} from '../constants'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import { loadHistory, saveHistory } from '../lib/linkHistory'
import type { CreateLinkResponse, HistoryEntry } from '../types/links'
import ResultCard from './ResultCard'
import HistoryAccordion from './HistoryAccordion'
import shared from '../styles/shared.module.css'

interface Props {
  onViewStats: (shortCode: string) => void
}

export default function ShortenForm({ onViewStats }: Props) {
  const [targetUrl, setTargetUrl] = useState('')
  const [result, setResult] = useState<CreateLinkResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [titleLoading, setTitleLoading] = useState(false)
  const [titleLookupRetryToken, setTitleLookupRetryToken] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
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
  }, [result?.short_code, result?.title, titleLookupRetryToken])

  const submitUrl = useCallback(async (url: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setTitleLookupRetryToken(0)
    try {
      const link = await createShortLink(url)
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
        const next = [entry, ...prev.filter((e) => e.short_code !== link.short_code)]
        saveHistory(next)
        return next
      })
      setAccordionOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE)
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedSubmit = useDebouncedCallback(
    (url: string) => void submitUrl(url),
    SUBMIT_DEBOUNCE_MS,
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
