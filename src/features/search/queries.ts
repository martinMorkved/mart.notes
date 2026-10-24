import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { SearchResult } from '@shared/types'
import { api } from '@/lib/api'

export const searchQuery = (q: string) =>
  queryOptions({
    queryKey: ['search', q],
    queryFn: () => api<SearchResult[]>('GET', `/search?q=${encodeURIComponent(q)}`),
    // Notes change while you search, so a result list is only good until the next keystroke
    staleTime: 0,
    // The old hits stay up while the next ones load, instead of flashing empty
    placeholderData: keepPreviousData,
  })
