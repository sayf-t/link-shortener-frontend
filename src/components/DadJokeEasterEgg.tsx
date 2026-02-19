import { useState, useCallback } from 'react'
import styles from './DadJokeEasterEgg.module.css'

const DAD_JOKE_API = 'https://icanhazdadjoke.com/'
const USER_AGENT = 'Link Shortener Easter Egg (https://github.com)'
const GIPHY_TRENDING_API = 'https://api.giphy.com/v1/gifs/trending'

interface DadJokeResponse {
  id: string
  joke: string
  status: number
}

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

function pickGifUrl(img: GiphyGifObject['images']): string | undefined {
  return img?.downsized_medium?.url ?? img?.fixed_height?.url ?? img?.original?.url
}

export default function DadJokeEasterEgg() {
  const [open, setOpen] = useState(false)
  const [joke, setJoke] = useState<string | null>(null)
  const [imageOpen, setImageOpen] = useState(false)
  const [trendingGifs, setTrendingGifs] = useState<GiphyGifObject[] | null>(null)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [gifTitle, setGifTitle] = useState<string | null>(null)
  const [gifLoading, setGifLoading] = useState(false)
  const [gifError, setGifError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiKey = import.meta.env.VITE_GIPHY_API_KEY

  const fetchJoke = useCallback(async () => {
    setLoading(true)
    setError(null)
    setImageOpen(false)
    try {
      const res = await fetch(DAD_JOKE_API, {
        headers: {
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
      })
      if (!res.ok) throw new Error('Failed to fetch joke')
      const data: DadJokeResponse = await res.json()
      setJoke(data.joke)
    } catch {
      setError('Could not load joke.')
    } finally {
      setLoading(false)
    }
  }, [])

  const showRandomFromTrending = useCallback((list: GiphyGifObject[]) => {
    if (list.length === 0) return
    const gif = list[Math.floor(Math.random() * list.length)]
    const url = pickGifUrl(gif.images)
    if (url) {
      setGifUrl(url)
      setGifTitle(gif.title ?? 'Trending GIF')
    }
  }, [])

  const fetchTrendingGifs = useCallback(async () => {
    if (!apiKey) {
      setGifError('Add VITE_GIPHY_API_KEY to show trending GIFs.')
      return
    }
    setGifLoading(true)
    setGifError(null)
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        limit: '20',
        rating: 'g',
      })
      const res = await fetch(`${GIPHY_TRENDING_API}?${params}`)
      if (!res.ok) throw new Error('Failed to fetch GIFs')
      const json: GiphyTrendingResponse = await res.json()
      const list = json.data ?? []
      const withUrl = list.filter((g) => pickGifUrl(g.images))
      if (withUrl.length === 0) throw new Error('No GIFs in response')
      setTrendingGifs(withUrl)
      showRandomFromTrending(withUrl)
    } catch {
      setGifError('Could not load GIFs.')
    } finally {
      setGifLoading(false)
    }
  }, [apiKey, showRandomFromTrending])

  const handleAnotherGif = useCallback(() => {
    if (trendingGifs && trendingGifs.length > 0) {
      showRandomFromTrending(trendingGifs)
    } else {
      fetchTrendingGifs()
    }
  }, [trendingGifs, showRandomFromTrending, fetchTrendingGifs])

  const handleToggle = () => {
    if (!open) {
      setOpen(true)
      if (!joke && !loading && !error) fetchJoke()
    } else {
      setOpen(false)
    }
  }

  const handleNewJoke = (e: React.MouseEvent) => {
    e.stopPropagation()
    fetchJoke()
  }

  return (
    <div className={styles.wrapper}>
      {open && (
        <div className={styles.bubble} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
          {loading && <p className={styles.message}>Loading…</p>}
          {error && <p className={styles.error}>{error}</p>}
          {joke && !loading && (
            <>
              <p className={styles.joke}>{joke}</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={handleNewJoke}
                >
                  Another one
                </button>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    setImageOpen(true)
                    fetchTrendingGifs()
                  }}
                >
                  Trending GIF
                </button>
              </div>
            </>
          )}
          {imageOpen && (
            <div className={styles.subBubble} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.close}
                onClick={() => {
                  setImageOpen(false)
                  setGifUrl(null)
                  setTrendingGifs(null)
                }}
                aria-label="Close GIF"
              >
                ×
              </button>
              {gifLoading && <p className={styles.message}>Loading trending GIFs…</p>}
              {gifError && <p className={styles.error}>{gifError}</p>}
              {gifUrl && !gifLoading && (
                <img
                  src={gifUrl}
                  alt={gifTitle ?? 'Trending GIF'}
                  className={styles.jokeImage}
                />
              )}
              {gifUrl && !gifLoading && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAnotherGif()
                    }}
                  >
                    Another GIF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        className={styles.trigger}
        onClick={handleToggle}
        aria-label="Easter egg"
      />
    </div>
  )
}
