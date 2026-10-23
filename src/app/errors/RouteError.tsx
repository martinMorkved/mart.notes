import { isRouteErrorResponse, useRouteError } from 'react-router'
import { ErrorLayout } from './ErrorLayout'
import { NotFound } from './NotFound'

export function RouteError() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />
  if (import.meta.env.DEV) console.error(error)

  return (
    <ErrorLayout
      code={isRouteErrorResponse(error) ? String(error.status) : 'Error'}
      heading="Something went wrong"
      text="Try reloading the page. If it keeps happening, the server might be down."
    />
  )
}
