import { useState, useCallback, useMemo } from 'react'
import type { JokePort } from './ports/joke.port'
import type { GifPort, GifItem } from './ports/gif.port'
import { createIcanHazDadJokeAdapter } from './adapters/icanhazdadjoke.adapter'
import { createGiphyAdapter } from './adapters/giphy.adapter'
import styles from './DadJokeEasterEgg.module.css'

export interface DadJokeEasterEggProps {
  /** Joke port. Defaults to icanhazdadjoke adapter if not provided. */
  jokePort?: JokePort
  /** GIF port. Defaults to Giphy adapter (requires VITE_GIPHY_API_KEY) if not provided. */
  gifPort?: GifPort | null
}

function pickRandom<T>(list: T[]): T | undefined {
  if (list.length === 0) return undefined
  return list[Math.floor(Math.random() * list.length)]
}

export default function DadJokeEasterEgg({
  jokePort,
  gifPort,
}: DadJokeEasterEggProps = {}) {
  const jokeAdapter = useMemo(
    () => jokePort ?? createIcanHazDadJokeAdapter(),
    [jokePort],
  )
  const gifAdapter = useMemo(() => {
    if (gifPort !== undefined) return gifPort
    const key = import.meta.env.VITE_GIPHY_API_KEY
    return key ? createGiphyAdapter({ apiKey: key }) : null
  }, [gifPort])

  const [open, setOpen] = useState(false)
  const [joke, setJoke] = useState<string | null>(null)
  const [imageOpen, setImageOpen] = useState(false)
  const [trendingGifs, setTrendingGifs] = useState<GifItem[] | null>(null)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [gifTitle, setGifTitle] = useState<string | null>(null)
  const [gifLoading, setGifLoading] = useState(false)
  const [gifError, setGifError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJoke = useCallback(async () => {
    setLoading(true)
    setError(null)
    setImageOpen(false)
    try {
      const text = await jokeAdapter.getRandomJoke()
      setJoke(text)
    } catch {
      setError('Could not load joke.')
    } finally {
      setLoading(false)
    }
  }, [jokeAdapter])

  const showRandomFromList = useCallback((list: GifItem[]) => {
    const gif = pickRandom(list)
    if (gif) {
      setGifUrl(gif.imageUrl)
      setGifTitle(gif.title)
    }
  }, [])

  const fetchTrendingGifsHandler = useCallback(async () => {
    if (!gifAdapter) {
      setGifError('Add VITE_GIPHY_API_KEY to show trending GIFs.')
      return
    }
    setGifLoading(true)
    setGifError(null)
    try {
      const list = await gifAdapter.getTrendingGifs({
        limit: 20,
        rating: 'g',
      })
      if (list.length === 0) throw new Error('No GIFs in response')
      setTrendingGifs(list)
      showRandomFromList(list)
    } catch {
      setGifError('Could not load GIFs.')
    } finally {
      setGifLoading(false)
    }
  }, [gifAdapter, showRandomFromList])

  const handleAnotherGif = useCallback(() => {
    if (trendingGifs && trendingGifs.length > 0) {
      showRandomFromList(trendingGifs)
    } else {
      fetchTrendingGifsHandler()
    }
  }, [trendingGifs, showRandomFromList, fetchTrendingGifsHandler])

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
                    fetchTrendingGifsHandler()
                  }}
                  disabled={!gifAdapter}
                >
                  Trending GIF
                </button>
              </div>
              <p className={styles.giphyAttribution}>
                <a
                  href="https://icanhazdadjoke.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.giphyLink}
                >
                  Jokes from icanhazdadjoke.com
                </a>
              </p>
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
                <>
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
                  <p className={styles.giphyAttribution}>
                    <a
                      href="https://giphy.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.giphyLink}
                    >
                      Powered by GIPHY
                    </a>
                  </p>
                </>
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
