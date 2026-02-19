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
