import { queryOptions } from '@tanstack/react-query'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

export const sessionQuery = queryOptions({
  queryKey: ['session'],
  queryFn: async () => {
    const { data, error } = await authClient.getSession()
    if (error) throw new Error(error.message)
    return data
  },
  staleTime: 5 * 60_000,
})

const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Wrong email or password.',
  INVALID_EMAIL: "That email address doesn't look right.",
  USER_ALREADY_EXISTS: 'An account with this email already exists.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'An account with this email already exists.',
  PASSWORD_TOO_SHORT: 'The password needs at least 10 characters.',
  PASSWORD_TOO_LONG: 'The password is too long.',
  TOO_MANY_REQUESTS: 'Too many attempts. Wait a moment and try again.',
  INVALID_TOKEN: 'This link is no longer valid. Ask for a new one.',
}

export function authErrorMessage(error: { code?: string; message?: string; status?: number }) {
  if (error.code && messages[error.code]) return messages[error.code]
  if (error.status === 403 && error.message) return error.message
  return 'Something went wrong. Please try again.'
}
