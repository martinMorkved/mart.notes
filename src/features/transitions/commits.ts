// React Router renders the final page of a loader navigation in a normal React transition,
// even with flushSync, so a view transition has to wait until the new route is in the DOM.

type Waiter = { path: string; resolve: () => void }

let waiters: Waiter[] = []

export function routeCommitted(path: string) {
  waiters = waiters.filter((waiter) => {
    if (waiter.path !== path) return true
    waiter.resolve()
    return false
  })
}

// Resolves when `path` has been rendered, or after `timeout` if something else (like an error page) shows up instead
export function nextCommit(path: string, timeout = 2500) {
  return new Promise<void>((resolve) => {
    const waiter = { path, resolve }
    waiters.push(waiter)
    setTimeout(() => {
      waiters = waiters.filter((w) => w !== waiter)
      resolve()
    }, timeout)
  })
}
