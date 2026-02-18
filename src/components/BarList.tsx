import styles from './BarList.module.css'

interface Item {
  label: string
  count: number
  pct: number
  showPct?: boolean
}

interface Props {
  items: Item[]
}

export default function BarList({ items }: Props) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.label}>
          <div className={styles.info}>
            <span className={styles.key}>{item.label}</span>
            <span className={styles.value}>
              {item.count}
              {item.showPct && <span className={styles.pct}> ({item.pct}%)</span>}
            </span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${item.pct}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
