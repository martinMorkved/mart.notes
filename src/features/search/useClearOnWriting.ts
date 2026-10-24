import { useEffect, useRef } from 'react'

// Clicking into a note to write ends the search. Opening notes from the hits does not,
// so you can go through several of them.
export function useClearOnWriting(active: boolean, clear: () => void) {
  const clearRef = useRef(clear)
  clearRef.current = clear

  useEffect(() => {
    if (!active) return
    function onFocusIn(event: FocusEvent) {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.closest('main')) return
      if (target.isContentEditable || target.matches('input, textarea')) clearRef.current()
    }
    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [active])
}
