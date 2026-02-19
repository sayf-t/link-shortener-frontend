/**
 * Port for fetching a random joke (easter-egg feature).
 * Implemented by adapters (e.g. icanhazdadjoke).
 */
export interface JokePort {
  getRandomJoke(): Promise<string>
}
