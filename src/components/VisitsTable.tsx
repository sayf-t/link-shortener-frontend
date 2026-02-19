import type { Visit } from '../types/links'
import styles from './VisitsTable.module.css'

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  visits: Visit[]
}

export default function VisitsTable({ visits }: Props) {
  if (visits.length === 0) return null

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((v, i) => (
            <tr key={i}>
              <td>{formatTimestamp(v.timestamp)}</td>
              <td>{v.geo_country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
