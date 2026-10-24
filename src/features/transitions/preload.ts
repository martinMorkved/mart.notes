import { matchPath } from 'react-router'
import { foldersQuery } from '@/features/folders/queries'
import { folderNotesQuery, noteQuery } from '@/features/notes/queries'
import { queryClient } from '@/lib/queryClient'

// Fills the cache before a transition starts, so the "after" snapshot is the finished page
export async function preload(to: string) {
  const folder = matchPath('/folder/:id', to)
  const note = matchPath('/note/:id', to)

  try {
    if (folder) {
      await Promise.all([
        queryClient.ensureQueryData(foldersQuery),
        queryClient.ensureQueryData(folderNotesQuery(folder.params.id!)),
      ])
    }
    if (note) {
      await Promise.all([
        queryClient.ensureQueryData(noteQuery(note.params.id!)),
        import('@/features/notes/NoteView'),
      ])
    }
  } catch {
    // The route loader shows the error page; the transition just runs without data
  }
}
