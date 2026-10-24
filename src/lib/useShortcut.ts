import { useEffect, useRef } from 'react'
import { matchesKeys } from './keys'

// combo like "Mod-Shift-m", listened for anywhere on the page
export function useShortcut(combo: string, handler: () => void) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!matchesKeys(event, combo)) return
      event.preventDefault()
      handlerRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo])
}
