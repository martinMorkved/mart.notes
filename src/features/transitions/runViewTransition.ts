type Options = {
  update: () => void | Promise<void>
  types?: string[]
}

export type RunningTransition = Pick<ViewTransition, 'ready' | 'finished' | 'updateCallbackDone'>

function withoutAnimation(update: Options['update']): RunningTransition {
  const done = Promise.resolve().then(update)
  return { ready: Promise.reject(), finished: done, updateCallbackDone: done }
}

export function runViewTransition({ update, types = [] }: Options): RunningTransition {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduced) {
    const transition = withoutAnimation(update)
    transition.ready.catch(() => {})
    return transition
  }

  try {
    return document.startViewTransition({ update, types })
  } catch {
    // Safari before 18.2 only takes a callback, so the transition runs without types
    return document.startViewTransition(update)
  }
}
