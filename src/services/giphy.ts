/**
 * GIPHY API client (trending endpoint).
 * @see https://developers.giphy.com/docs/api/endpoint#trending
 */

const TRENDING_URL = 'https://api.giphy.com/v1/gifs/trending'

export interface GiphyImageRendition {
  url: string
  width: string
  height: string
}

export interface GiphyGifObject {
  id: string
  title: string
  images: {
    downsized_medium?: GiphyImageRendition
    fixed_height?: GiphyImageRendition
    original: GiphyImageRendition
  }
}

export interface GiphyTrendingResponse {
  data: GiphyGifObject[]
}

export function pickGifUrl(
  images: GiphyGifObject['images'],
): string | undefined {
  return (
    images?.downsized_medium?.url ??
    images?.fixed_height?.url ??
    images?.original?.url
  )
}

export interface FetchTrendingOptions {
  apiKey: string
  limit?: number
  rating?: string
}

export async function fetchTrendingGifs(
  options: FetchTrendingOptions,
): Promise<GiphyGifObject[]> {
  const { apiKey, limit = 20, rating = 'g' } = options
  const params = new URLSearchParams({
    api_key: apiKey,
    limit: String(limit),
    rating,
  })
  const res = await fetch(`${TRENDING_URL}?${params}`)
  if (!res.ok) throw new Error('Failed to fetch GIFs')
  const json: GiphyTrendingResponse = await res.json()
  const list = json.data ?? []
  return list.filter((g) => pickGifUrl(g.images))
}
