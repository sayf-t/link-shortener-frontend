/**
 * icanhazdadjoke.com API client.
 * @see https://icanhazdadjoke.com/api
 */

const BASE_URL = 'https://icanhazdadjoke.com'
const USER_AGENT = 'Link Shortener Easter Egg (https://github.com)'

export interface DadJokeResponse {
  id: string
  joke: string
  status: number
}

export async function fetchRandomJoke(): Promise<string> {
  const res = await fetch(`${BASE_URL}/`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  })
  if (!res.ok) throw new Error('Failed to fetch joke')
  const data: DadJokeResponse = await res.json()
  return data.joke
}
