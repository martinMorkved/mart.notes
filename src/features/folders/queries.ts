import { queryOptions } from '@tanstack/react-query'
import type { Folder } from '@shared/types'
import { api } from '@/lib/api'

// Every folder that isn't trashed, archived ones included, so they can still be opened
export const foldersQuery = queryOptions({
  queryKey: ['folders'],
  queryFn: () => api<Folder[]>('GET', '/folders'),
})

const notArchived = (folders: Folder[]) => folders.filter((f) => !f.archivedAt)

// The folders in the tree and the places things can be moved to
export const treeFoldersQuery = queryOptions({ ...foldersQuery, select: notArchived })
