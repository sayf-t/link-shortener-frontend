/**
 * Port for fetching trending GIFs (easter-egg feature).
 * Implemented by adapters (e.g. Giphy).
 */
export interface GifItem {
  id: string
  title: string
  imageUrl: string
}

export interface GifPortOptions {
  limit?: number
  rating?: string
}

export interface GifPort {
  getTrendingGifs(options: GifPortOptions): Promise<GifItem[]>
}
