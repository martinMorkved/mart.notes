import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router'
import { routeCommitted } from './commits'

// Layout effects run after the DOM is updated but before the browser paints,
// which is exactly when a view transition may take its "after" snapshot
export function CommitSignal() {
  const { pathname } = useLocation()
  useLayoutEffect(() => routeCommitted(pathname), [pathname])
  return null
}
