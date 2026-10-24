import type { MouseEvent } from 'react'
import { useTransitionNavigate, type TransitionPlan } from './useTransitionNavigate'

// onClick for a <Link>: plain left clicks animate, while ctrl/cmd/middle clicks still open a new tab
export function useTransitionClick() {
  const go = useTransitionNavigate()

  return (to: string, plan: (link: HTMLAnchorElement) => TransitionPlan) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      go(to, plan(event.currentTarget))
    }
}
