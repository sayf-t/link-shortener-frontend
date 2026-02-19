import type { HistoryEntry } from '../../types/links'
import shared from '../../styles/shared.module.css'
import styles from './HistoryAccordion.module.css'

interface Props {
  history: HistoryEntry[]
  open: boolean
  onToggle: () => void
  onCopy: (text: string) => void
  onViewStats: (shortCode: string) => void
}

export default function HistoryAccordion({
  history,
  open,
  onToggle,
  onCopy,
  onViewStats,
}: Props) {
  if (history.length === 0) return null

  return (
    <div className={styles.accordion}>
      <button
        type="button"
        className={styles.accordionHeader}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="shorten-history-list"
        id="shorten-history-heading"
      >
        <span className={styles.accordionTitle}>Your shortened links</span>
        <span className={styles.accordionCount}>{history.length}</span>
        <span
          className={
            open ? styles.accordionChevronOpen : styles.accordionChevron
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
        className={open ? styles.accordionPanelOpen : styles.accordionPanel}
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
                  onClick={() => onCopy(entry.short_url)}
                  className={shared.btnCopy}
                >
                  Copy
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
  )
}
