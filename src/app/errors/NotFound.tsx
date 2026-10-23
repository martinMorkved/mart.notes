import { ErrorLayout } from './ErrorLayout'

export function NotFound() {
  return <ErrorLayout code="404" heading="Nothing here" text="This page doesn't exist, or it was moved." />
}
