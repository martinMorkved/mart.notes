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
