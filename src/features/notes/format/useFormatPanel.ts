import { useState } from 'react'
import { flushSync } from 'react-dom'
import { runViewTransition } from '@/features/transitions/runViewTransition'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { usePersistentState } from '@/lib/usePersistentState'

// Matches the breakpoint in format-panel.css where the panel docks beside the note
const DOCKED = '(min-width: 72rem)'

// Docked: remembered between visits. Bottom sheet on small screens: starts closed every time.
export function useFormatPanel() {
  const docked = useMediaQuery(DOCKED)
  const [remembered, setRemembered] = usePersistentState('format-panel', false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const open = docked ? remembered : sheetOpen
  const setOpen = docked ? setRemembered : setSheetOpen

  function toggle(next = !open) {
    if (next === open) return
    runViewTransition({
      types: [next ? 'panel-open' : 'panel-close'],
      update: () => flushSync(() => setOpen(next)),
    })
  }

  return { open, toggle, docked }
}
