import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import '../styles/error.css'

export function NotFound() {
  return (
    <ErrorLayout
      code="404"
      heading="Nothing here"
      text="This page doesn't exist, or it was moved."
    />
  )
}

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

function ErrorLayout({ code, heading, text }: { code: string; heading: string; text: string }) {
  return (
    <main className="error-page">
      <p className="wordmark">
        mart<span>.notes</span>
      </p>
      <div className="error-body">
        <p className="error-code">{code}</p>
        <h1>{heading}</h1>
        <p className="error-text">{text}</p>
        <Link className="button-primary" to="/">
          Go to your notes
        </Link>
      </div>
    </main>
  )
}
