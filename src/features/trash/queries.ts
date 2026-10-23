import { queryOptions } from '@tanstack/react-query'
import type { Trash } from '@shared/types'
import { foldersQuery } from '@/features/folders/queries'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export const trashQuery = queryOptions({
  queryKey: ['trash'],
  queryFn: () => api<Trash>('GET', '/trash'),
})

export function refreshAfterRestore() {
  queryClient.invalidateQueries({ queryKey: foldersQuery.queryKey })
  queryClient.invalidateQueries({ queryKey: ['notes'] })
  queryClient.invalidateQueries({ queryKey: trashQuery.queryKey })
}
