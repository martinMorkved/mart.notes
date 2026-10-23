import { queryOptions } from '@tanstack/react-query'
import type { Folder } from '@shared/types'
import { api } from '@/lib/api'

export const foldersQuery = queryOptions({
  queryKey: ['folders'],
  queryFn: () => api<Folder[]>('GET', '/folders'),
})
