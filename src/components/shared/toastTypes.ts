import { createContext } from 'react'

export type ToastVariant = 'info' | 'error'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

export interface ToastContextValue {
  show(message: string, variant?: ToastVariant): void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
