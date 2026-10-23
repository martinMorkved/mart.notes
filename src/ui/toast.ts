import { useSyncExternalStore } from 'react'

export type Toast = {
  id: number
  message: string
  action?: { label: string; run: () => void }
}

let current: Toast | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function showToast(toast: Omit<Toast, 'id'>) {
  clearTimeout(timer)
  current = { ...toast, id: Date.now() }
  emit()
  timer = setTimeout(dismissToast, 7000)
}

export function dismissToast() {
  clearTimeout(timer)
  current = null
  emit()
}

export function useToast() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
  )
}
