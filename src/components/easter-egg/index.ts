/**
 * Easter egg (dad joke + trending GIF). Not rendered in App by default.
 * Uses clean architecture: ports (interfaces) + adapters (external APIs).
 *
 * To show: import { DadJokeEasterEgg } from './components/easter-egg'
 * and render <DadJokeEasterEgg /> in App.
 *
 * To inject or mock: pass jokePort and/or gifPort props.
 */
export { default as DadJokeEasterEgg } from './DadJokeEasterEgg'
export type { DadJokeEasterEggProps } from './DadJokeEasterEgg'

export type { JokePort } from './ports/joke.port'
export type { GifPort, GifItem, GifPortOptions } from './ports/gif.port'

export { createIcanHazDadJokeAdapter } from './adapters/icanhazdadjoke.adapter'
export {
  createGiphyAdapter,
  type GiphyAdapterConfig,
} from './adapters/giphy.adapter'
