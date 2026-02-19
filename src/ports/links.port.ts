import type { CreateLinkResponse, LinkStats } from '../types/links'

export interface LinksPort {
  createShortLink(targetUrl: string): Promise<CreateLinkResponse>
  getLinkStats(shortCode: string, signal?: AbortSignal): Promise<LinkStats>
}
