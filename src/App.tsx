import { useState } from "react";
import { ShortenForm } from "./components/shorten";
import { StatsView } from "./components/stats";
import { DadJokeEasterEgg } from "./components/easter-egg";
import styles from "./App.module.css";

type Tab = "shorten" | "stats";

export default function App() {
  const [tab, setTab] = useState<Tab>("shorten");
  const [statsCode, setStatsCode] = useState("");

  const viewStats = (code: string) => {
    setStatsCode(code);
    setTab("stats");
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Link Shortener</h1>
        <p className={styles.subtitle}>Shorten URLs and track clicks</p>
      </header>

      <nav className={styles.tabs}>
        <button
          className={tab === "shorten" ? styles.tabActive : styles.tab}
          onClick={() => setTab("shorten")}
        >
          Shorten
        </button>
        <button
          className={tab === "stats" ? styles.tabActive : styles.tab}
          onClick={() => setTab("stats")}
        >
          Stats
        </button>
      </nav>

      {tab === "shorten" && <ShortenForm onViewStats={viewStats} />}
      {tab === "stats" && <StatsView initialCode={statsCode} />}

      <DadJokeEasterEgg />
    </div>
  );
}
