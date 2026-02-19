import type { CreateLinkResponse } from '../../types/links'
import shared from '../../styles/shared.module.css'
import styles from './ResultCard.module.css'

interface Props {
  result: CreateLinkResponse
  titleLoading: boolean
  copied: boolean
  onCopy: (text: string) => void
  onRetryTitle: () => void
  onViewStats: (shortCode: string) => void
}

export default function ResultCard({
  result,
  titleLoading,
  copied,
  onCopy,
  onRetryTitle,
  onViewStats,
}: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.shortUrl}>
        <a href={result.short_url} target="_blank" rel="noopener noreferrer">
          {result.short_url}
        </a>
        <button onClick={() => onCopy(result.short_url)} className={shared.btnCopy}>
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
          <div className={styles.titleRetryRow}>
            <p className={styles.pageTitleFallback}>Title not ready yet.</p>
            <button type="button" className={styles.retryButton} onClick={onRetryTitle}>
              Retry lookup
            </button>
          </div>
        )}
      </div>

      <p className={styles.targetUrl}>{result.target_url}</p>

      <button className={shared.btnGhost} onClick={() => onViewStats(result.short_code)}>
        View stats
      </button>
    </div>
  )
}
