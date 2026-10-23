import { useEffect, useRef, useState } from 'react'
import type { UpdateNote } from '@shared/schemas'
import { useUpdateNote } from '../mutations'

export type SaveState = 'saved' | 'pending' | 'saving' | 'error'

const DELAY = 700

export function useAutosave(noteId: string, folderId: string) {
  const updateNote = useUpdateNote()
  const [state, setState] = useState<SaveState>('saved')
  const pending = useRef<UpdateNote>({})
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const flush = useRef(() => {})
  flush.current = () => {
    clearTimeout(timer.current)
    const patch = pending.current
    if (!Object.keys(patch).length) return
    pending.current = {}
    setState('saving')
    updateNote.mutate(
      { id: noteId, folderId, patch },
      {
        onSuccess: () => setState(Object.keys(pending.current).length ? 'pending' : 'saved'),
        onError: () => setState('error'),
      },
    )
  }

  function change(patch: UpdateNote) {
    pending.current = { ...pending.current, ...patch }
    setState('pending')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => flush.current(), DELAY)
  }

  useEffect(() => {
    const saveNow = () => flush.current()
    const onHide = () => document.visibilityState === 'hidden' && saveNow()
    window.addEventListener('pagehide', saveNow)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', saveNow)
      document.removeEventListener('visibilitychange', onHide)
      saveNow()
    }
  }, [])

  return { state, change, flush: () => flush.current() }
}
