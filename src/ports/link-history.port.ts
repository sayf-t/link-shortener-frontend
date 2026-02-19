import type { HistoryEntry } from '../types/links'

export interface LinkHistoryPort {
  load(): HistoryEntry[]
  save(entries: HistoryEntry[]): void
}
