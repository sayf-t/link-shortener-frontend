import { useState, useCallback } from 'react'
import styles from './DadJokeEasterEgg.module.css'

const DAD_JOKE_API = 'https://icanhazdadjoke.com/'
const USER_AGENT = 'Link Shortener Easter Egg (https://github.com)'

interface DadJokeResponse {
  id: string
  joke: string
  status: number
}

export default function DadJokeEasterEgg() {
  const [open, setOpen] = useState(false)
  const [joke, setJoke] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJoke = useCallback(async () => {
    setLoading(true)
    setError(null)
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
              <button
                type="button"
                className={styles.another}
                onClick={handleNewJoke}
              >
                Another one
              </button>
            </>
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
