// https://developers.giphy.com/docs/api/endpoint#trending
import type { GifItem, GifPort, GifPortOptions } from '../ports/gif.port'

const TRENDING_URL = 'https://api.giphy.com/v1/gifs/trending'

interface GiphyImageRendition {
  url: string
  width: string
  height: string
}

interface GiphyGifObject {
  id: string
  title: string
  images: {
    downsized_medium?: GiphyImageRendition
    fixed_height?: GiphyImageRendition
    original: GiphyImageRendition
  }
}

interface GiphyTrendingResponse {
  data: GiphyGifObject[]
}

function pickImageUrl(images: GiphyGifObject['images']): string | undefined {
  return (
    images?.downsized_medium?.url ??
    images?.fixed_height?.url ??
    images?.original?.url
  )
}

export interface GiphyAdapterConfig {
  apiKey: string
}

export function createGiphyAdapter(config: GiphyAdapterConfig): GifPort {
  const { apiKey } = config

  return {
    async getTrendingGifs(options: GifPortOptions): Promise<GifItem[]> {
      const { limit = 20, rating = 'g' } = options
      const params = new URLSearchParams({
        api_key: apiKey,
        limit: String(limit),
        rating,
      })
      const res = await fetch(`${TRENDING_URL}?${params}`)
      if (!res.ok) throw new Error('Failed to fetch GIFs')
      const json: GiphyTrendingResponse = await res.json()
      const list = json.data ?? []
      return list
        .map((g) => {
          const url = pickImageUrl(g.images)
          if (!url) return null
          return {
            id: g.id,
            title: g.title ?? 'GIF',
            imageUrl: url,
          } satisfies GifItem
        })
        .filter((item): item is GifItem => item !== null)
    },
  }
}
