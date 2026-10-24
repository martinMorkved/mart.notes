import { tagElement } from './tagElement'
import type { TransitionPlan } from './useTransitionNavigate'

// Going to a note through a link, a backlink or a search hit: the old title fades with the
// page, and the new one is typed out. CSS reveals it in one step per character, so it needs
// to know how many there are.
export function linkedNote(): TransitionPlan {
  return {
    types: ['linked-note'],
    after: () => {
      const title = document.querySelector<HTMLElement>('.note-title')
      const input = title?.querySelector('input')
      const chars = (input?.value || input?.placeholder || '').length || 1
      const root = document.documentElement.style
      root.setProperty('--title-chars', String(chars))
      const untag = tagElement(title, 'note-title-typed')
      return () => {
        untag?.()
        root.removeProperty('--title-chars')
      }
    },
  }
}
