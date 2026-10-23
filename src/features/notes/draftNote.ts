import { generateKeyBetween } from 'fractional-indexing'
import type { Note } from '@shared/types'
import { byPosition } from '@/features/folders/tree'
import { queryClient } from '@/lib/queryClient'
import { folderNotesQuery } from './queries'

export function draftNote(folderId: string): Note {
  const notes = queryClient.getQueryData(folderNotesQuery(folderId).queryKey) ?? []
  const first = [...notes].sort(byPosition)[0]
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    folderId,
    title: '',
    content: '',
    position: generateKeyBetween(null, first?.position ?? null),
    createdAt: now,
    updatedAt: now,
  }
}
