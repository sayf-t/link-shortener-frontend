export interface CreateLinkResponse {
  short_code: string
  short_url: string
  target_url: string
  title: string | null
}

export interface Visit {
  timestamp: string
  geo_country: string
}

export interface LinkStats {
  short_code: string
  title: string | null
  total_clicks: number
  clicks_by_country: Record<string, number>
  clicks_by_date: Record<string, number>
  visits: Visit[]
}

export interface HistoryEntry {
  target_url: string
  short_url: string
  short_code: string
  title: string | null
  created_at: string
}
