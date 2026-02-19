/**
 * icanhazdadjoke.com adapter. Implements JokePort.
 * @see https://icanhazdadjoke.com/api
 */
import type { JokePort } from '../ports/joke.port'

const BASE_URL = 'https://icanhazdadjoke.com'
const USER_AGENT = 'Link Shortener Easter Egg (https://github.com)'

interface DadJokeResponse {
  id: string
  joke: string
  status: number
}

export function createIcanHazDadJokeAdapter(): JokePort {
  return {
    async getRandomJoke(): Promise<string> {
      const res = await fetch(`${BASE_URL}/`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
      })
      if (!res.ok) throw new Error('Failed to fetch joke')
      const data: DadJokeResponse = await res.json()
      return data.joke
    },
  }
}
