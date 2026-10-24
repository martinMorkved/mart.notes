import { useNavigate } from 'react-router'
import { nextCommit } from './commits'
import { preload } from './preload'
import { runViewTransition } from './runViewTransition'

type Cleanup = () => void

export type TransitionPlan = {
  types?: string[]
  // runs on the old page, right before its snapshot
  before?: () => Cleanup | void
  // runs on the new page, right before its snapshot
  after?: () => Cleanup | void
}

export function useTransitionNavigate() {
  const navigate = useNavigate()

  return async (to: string, plan: TransitionPlan = {}) => {
    await preload(to)

    const cleanups: Cleanup[] = []
    const keep = (cleanup: Cleanup | void) => cleanup && cleanups.push(cleanup)

    keep(plan.before?.())
    const transition = runViewTransition({
      types: plan.types,
      update: async () => {
        const committed = nextCommit(new URL(to, location.href).pathname)
        await navigate(to)
        await committed
        keep(plan.after?.())
      },
    })
    transition.finished.finally(() => cleanups.forEach((cleanup) => cleanup()))
  }
}
