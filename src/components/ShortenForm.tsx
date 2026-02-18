import { useCallback, useEffect, useState } from "react";
import { createShortLink, getLinkStats, type CreateLinkResponse } from "../api";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";
import shared from "../styles/shared.module.css";
import styles from "./ShortenForm.module.css";

interface Props {
  onViewStats: (shortCode: string) => void;
}

export interface HistoryEntry {
  target_url: string;
  short_url: string;
  short_code: string;
  title: string | null;
  created_at: string;
}

const TITLE_POLL_INTERVAL_MS = 1500;
const TITLE_POLL_MAX_ATTEMPTS = 6;
const SUBMIT_DEBOUNCE_MS = 3000;
const HISTORY_STORAGE_KEY = "link-shortener-history";
const HISTORY_MAX_ENTRIES = 50;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        e &&
        typeof e === "object" &&
        typeof (e as HistoryEntry).target_url === "string" &&
        typeof (e as HistoryEntry).short_url === "string" &&
        typeof (e as HistoryEntry).short_code === "string" &&
        typeof (e as HistoryEntry).created_at === "string",
    );
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(entries.slice(0, HISTORY_MAX_ENTRIES)),
    );
  } catch {
    // ignore quota or other storage errors
  }
}

export default function ShortenForm({ onViewStats }: Props) {
  const [targetUrl, setTargetUrl] = useState("");
  const [result, setResult] = useState<CreateLinkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleLookupRetryToken, setTitleLookupRetryToken] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [accordionOpen, setAccordionOpen] = useState(false);

  useEffect(() => {
    const shortCode = result?.short_code;
    if (!shortCode || result?.title) {
      setTitleLoading(false);
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;
    let attempts = 0;

    const pollTitle = async () => {
      attempts += 1;

      try {
        const stats = await getLinkStats(shortCode);
        if (cancelled) return;

        if (stats.title) {
          setResult((prev) =>
            prev && prev.short_code === shortCode
              ? { ...prev, title: stats.title }
              : prev,
          );
          setTitleLoading(false);
          return;
        }
      } catch {
        // Keep polling for a short window to avoid transient failures.
      }

      if (cancelled || attempts >= TITLE_POLL_MAX_ATTEMPTS) {
        setTitleLoading(false);
        return;
      }

      timeoutId = window.setTimeout(pollTitle, TITLE_POLL_INTERVAL_MS);
    };

    setTitleLoading(true);
    void pollTitle();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [result?.short_code, result?.title, titleLookupRetryToken]);

  const submitUrl = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setTitleLookupRetryToken(0);
    try {
      const link = await createShortLink(url);
      setResult(link);
      setTargetUrl("");
      const entry: HistoryEntry = {
        target_url: link.target_url,
        short_url: link.short_url,
        short_code: link.short_code,
        title: link.title ?? null,
        created_at: new Date().toISOString(),
      };
      setHistory((prev) => {
        const next = [
          entry,
          ...prev.filter((e) => e.short_code !== link.short_code),
        ];
        saveHistory(next);
        return next;
      });
      setAccordionOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSubmit = useDebouncedCallback(
    (url: string) => void submitUrl(url),
    SUBMIT_DEBOUNCE_MS,
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = targetUrl.trim();
    if (trimmed) debouncedSubmit(trimmed);
  };

  const copyToClipboard = (text: string, forCode?: string) => {
    navigator.clipboard.writeText(text);
    if (forCode !== undefined) {
      setCopiedCode(forCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </form>

      {error && <div className={shared.alertError}>{error}</div>}

      {result && (
        <div className={styles.card}>
          <div className={styles.shortUrl}>
            <a
              href={result.short_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.short_url}
            </a>
            <button
              onClick={() => copyToClipboard(result.short_url)}
              className={shared.btnCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className={styles.titleRow}>
            <span className={styles.titleLabel}>Title</span>
            {result.title ? (
              <p className={styles.pageTitle}>{result.title}</p>
            ) : titleLoading ? (
              <div
                className={styles.titleLoading}
                role="status"
                aria-live="polite"
              >
                <span className={styles.spinner} aria-hidden="true" />
                <span>Fetching title...</span>
              </div>
            ) : (
              <div className={styles.titleRetryRow}>
                <p className={styles.pageTitleFallback}>Title not ready yet.</p>
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={() => setTitleLookupRetryToken((value) => value + 1)}
                >
                  Retry lookup
                </button>
              </div>
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

      {history.length > 0 && (
        <div className={styles.accordion}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => setAccordionOpen((open) => !open)}
            aria-expanded={accordionOpen}
            aria-controls="shorten-history-list"
            id="shorten-history-heading"
          >
            <span className={styles.accordionTitle}>Your shortened links</span>
            <span className={styles.accordionCount}>{history.length}</span>
            <span
              className={
                accordionOpen
                  ? styles.accordionChevronOpen
                  : styles.accordionChevron
              }
              aria-hidden
            >
              ▼
            </span>
          </button>
          <div
            id="shorten-history-list"
            role="region"
            aria-labelledby="shorten-history-heading"
            className={
              accordionOpen ? styles.accordionPanelOpen : styles.accordionPanel
            }
          >
            <ul className={styles.historyList}>
              {history.map((entry) => (
                <li
                  key={`${entry.short_code}-${entry.created_at}`}
                  className={styles.historyItem}
                >
                  <div className={styles.historyShortUrl}>
                    <a
                      href={entry.short_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {entry.short_url}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(entry.short_url, entry.short_code)
                      }
                      className={shared.btnCopy}
                    >
                      {copiedCode === entry.short_code ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  {entry.title && (
                    <p className={styles.historyTitle}>{entry.title}</p>
                  )}
                  <p className={styles.historyTarget}>{entry.target_url}</p>
                  <button
                    type="button"
                    className={shared.btnGhost}
                    onClick={() => onViewStats(entry.short_code)}
                  >
                    View stats
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
