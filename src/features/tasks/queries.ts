import { queryOptions } from '@tanstack/react-query'
import type { NoteTasks } from '@shared/types'
import { api } from '@/lib/api'

export const tasksQuery = queryOptions({
  queryKey: ['tasks'],
  queryFn: () => api<NoteTasks[]>('GET', '/tasks'),
  // The tasks live in the notes, which change elsewhere, so the page reads them fresh each visit
  staleTime: 0,
})
