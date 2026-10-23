import { useMutation } from '@tanstack/react-query'
import type { Counts } from '@shared/types'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { refreshAfterRestore, trashQuery } from './queries'

export function useRestore() {
  return useMutation({
    mutationFn: ({ kind, id }: { kind: 'folders' | 'notes'; id: string }) =>
      api<Counts>('POST', `/trash/${kind}/${id}/restore`),
    onSettled: refreshAfterRestore,
  })
}

export function usePurge() {
  return useMutation({
    mutationFn: (target: { kind: 'folders' | 'notes'; id: string } | 'all') =>
      target === 'all'
        ? api('DELETE', '/trash')
        : api('DELETE', `/trash/${target.kind}/${target.id}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: trashQuery.queryKey }),
  })
}
