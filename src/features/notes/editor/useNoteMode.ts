import { useEffect, useState } from 'react'

export type NoteMode = 'write' | 'read'

export function useNoteMode(initial: NoteMode) {
  const [mode, setMode] = useState(initial)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault()
        setMode((m) => (m === 'write' ? 'read' : 'write'))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return [mode, setMode] as const
}
