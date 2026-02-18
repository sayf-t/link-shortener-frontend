const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface CreateLinkResponse {
  short_code: string
  short_url: string
  target_url: string
  title: string | null
}

export interface LinkStats {
  short_code: string
  title: string | null
  total_clicks: number
  clicks_by_country: Record<string, number>
  clicks_by_date: Record<string, number>
}

export async function createShortLink(targetUrl: string): Promise<CreateLinkResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      link: { target_url: targetUrl },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to create short link')
  }

  return response.json()
}

export async function getLinkStats(shortCode: string): Promise<LinkStats> {
  const response = await fetch(`${API_BASE_URL}/api/v1/links/${shortCode}/stats`)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Failed to fetch stats')
  }

  return response.json()
}
