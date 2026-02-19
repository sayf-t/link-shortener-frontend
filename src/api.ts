import type { CreateLinkResponse, LinkStats } from './types/links'

export type { CreateLinkResponse, LinkStats, Visit, HistoryEntry } from './types/links'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function createShortLink(targetUrl: string): Promise<CreateLinkResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ link: { target_url: targetUrl } }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message =
      body?.errors?.target_url?.[0]
        ? `URL ${body.errors.target_url[0]}`
        : body?.error || 'Failed to create short link'
    throw new Error(message)
  }

  return response.json()
}

export async function getLinkStats(
  shortCode: string,
  signal?: AbortSignal,
): Promise<LinkStats> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/links/${encodeURIComponent(shortCode)}/stats`,
    { signal },
  )

  if (!response.ok) {
    throw new Error(response.status === 404 ? 'Link not found' : 'Failed to fetch stats')
  }

  return response.json()
}
