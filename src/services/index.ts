/**
 * External API services (clean boundary for third-party endpoints).
 */
export { fetchRandomJoke, type DadJokeResponse } from './icanhazdadjoke'
export {
  fetchTrendingGifs,
  pickGifUrl,
  type GiphyGifObject,
  type GiphyTrendingResponse,
  type FetchTrendingOptions,
} from './giphy'
