import { HISTORY_STORAGE_KEY, HISTORY_MAX_ENTRIES } from '../constants'
import type { LinkHistoryPort } from '../ports/link-history.port'
import type { HistoryEntry } from '../types/links'

export function createLocalStorageHistoryAdapter(): LinkHistoryPort {
  return {
    load(): HistoryEntry[] {
      try {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw) as unknown
        if (!Array.isArray(parsed)) return []
        return parsed.filter(
          (e): e is HistoryEntry =>
            e &&
            typeof e === 'object' &&
            typeof (e as HistoryEntry).target_url === 'string' &&
            typeof (e as HistoryEntry).short_url === 'string' &&
            typeof (e as HistoryEntry).short_code === 'string' &&
            typeof (e as HistoryEntry).created_at === 'string'
        )
      } catch {
        return []
      }
    },

    save(entries: HistoryEntry[]): void {
      try {
        localStorage.setItem(
          HISTORY_STORAGE_KEY,
          JSON.stringify(entries.slice(0, HISTORY_MAX_ENTRIES))
        )
      } catch {
        // quota or other storage errors
      }
    },
  }
}
