import { useState } from 'react'
import { ShortenForm } from './components/shorten'
import { StatsView } from './components/stats'
import { DadJokeEasterEgg } from './components/easter-egg'
import styles from './App.module.css'

type Tab = 'shorten' | 'stats'

export default function App() {
  const [tab, setTab] = useState<Tab>('shorten')
  const [statsCode, setStatsCode] = useState('')

  const viewStats = (code: string) => {
    setStatsCode(code)
    setTab('stats')
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Link Shortener</h1>
        <p className={styles.subtitle}>Shorten URLs and track clicks</p>
      </header>

      <nav className={styles.tabs} role="tablist" aria-label="Main views">
        <button
          type="button"
          role="tab"
          id="shorten-tab"
          aria-selected={tab === 'shorten'}
          aria-controls="shorten-panel"
          className={tab === 'shorten' ? styles.tabActive : styles.tab}
          onClick={() => setTab('shorten')}
        >
          Shorten
        </button>
        <button
          type="button"
          role="tab"
          id="stats-tab"
          aria-selected={tab === 'stats'}
          aria-controls="stats-panel"
          className={tab === 'stats' ? styles.tabActive : styles.tab}
          onClick={() => setTab('stats')}
        >
          Stats
        </button>
      </nav>

      {tab === 'shorten' && (
        <div id="shorten-panel" role="tabpanel" aria-labelledby="shorten-tab">
          <ShortenForm onViewStats={viewStats} />
        </div>
      )}
      {tab === 'stats' && (
        <div id="stats-panel" role="tabpanel" aria-labelledby="stats-tab">
          <StatsView initialCode={statsCode} />
        </div>
      )}

      <DadJokeEasterEgg />
    </div>
  )
}
