import { HttpError } from './queryClient'

export async function api<T>(method: string, path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (res.status === 401) {
    window.location.assign('/sign-in')
    throw new HttpError(401, 'Not signed in')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new HttpError(res.status, data?.error ?? res.statusText)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}
