import { useQuery } from '@tanstack/react-query'
import { useMatch } from 'react-router'
import { noteQuery } from '@/features/notes/queries'

export function useActiveFolderId() {
  const folderMatch = useMatch('/folder/:id')
  const noteMatch = useMatch('/note/:id')
  const { data: note } = useQuery({
    ...noteQuery(noteMatch?.params.id ?? ''),
    enabled: Boolean(noteMatch),
  })

  return folderMatch?.params.id ?? note?.folderId ?? null
}
