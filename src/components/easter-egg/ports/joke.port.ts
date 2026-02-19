export interface JokePort {
  getRandomJoke(): Promise<string>
}
