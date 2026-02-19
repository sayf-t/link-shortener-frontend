import { useCallback, useRef, useState } from 'react'
import { ToastContext, type ToastItem, type ToastVariant } from './toastTypes'
import Toast from './Toast'

const AUTO_DISMISS_MS = 2500

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = nextId.current++
      setItems((prev) => [...prev, { id, message, variant }])
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id))
      }, AUTO_DISMISS_MS)
    },
    []
  )

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Toast items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
