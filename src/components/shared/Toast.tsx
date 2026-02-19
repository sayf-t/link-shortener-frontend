import styles from './Toast.module.css'

interface ToastItem {
  id: number
  message: string
  variant: 'info' | 'error'
}

interface Props {
  items: ToastItem[]
  onDismiss: (id: number) => void
}

export default function Toast({ items, onDismiss }: Props) {
  if (items.length === 0) return null

  return (
    <div className={styles.container} aria-live="polite">
      {items.map((item) => (
        <div
          key={item.id}
          className={
            item.variant === 'error' ? styles.toastError : styles.toast
          }
          role={item.variant === 'error' ? 'alert' : 'status'}
        >
          <span>{item.message}</span>
          <button
            type="button"
            className={styles.dismiss}
            onClick={() => onDismiss(item.id)}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
