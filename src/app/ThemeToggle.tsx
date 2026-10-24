import type { MouseEvent } from 'react'
import { runViewTransition } from '@/features/transitions/runViewTransition'
import { ThemeIcon } from '@/ui/icons'
import { placeInkBlots } from './inkBlots'

function isDark() {
  const theme = document.documentElement.dataset.theme
  return theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeToggle() {
  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement
    const next = isDark() ? 'light' : 'dark'
    const box = event.currentTarget.getBoundingClientRect()
    // keyboard clicks have no pointer position, so start from the button
    const x = event.clientX || box.left + box.width / 2
    const y = event.clientY || box.top + box.height / 2

    const removeBlots = placeInkBlots(root, x, y)
    root.dataset.vt = 'theme'
    const transition = runViewTransition({
      types: ['theme'],
      update: () => {
        root.dataset.theme = next
        try {
          localStorage.setItem('theme', next)
        } catch {}
      },
    })
    transition.finished.finally(() => {
      delete root.dataset.vt
      removeBlots()
    })
  }

  return (
    <button className="sidebar-link" onClick={toggle}>
      <ThemeIcon />
      Switch theme
    </button>
  )
}
