import { useQuery } from '@tanstack/react-query'
import type { Editor } from '@tiptap/react'
import { useEffect, useRef } from 'react'
import type { Note } from '@shared/types'
import { titleKey } from '@shared/wikiLinks'
import { wikiLinksChanged } from '@/features/notes/editor/WikiLink'
import { draftNote } from '@/features/notes/draftNote'
import { useCreateNote } from '@/features/notes/mutations'
import { noteQuery } from '@/features/notes/queries'
import { linkedNote } from '@/features/transitions/linkedNote'
import { useTransitionNavigate } from '@/features/transitions/useTransitionNavigate'
import { queryClient } from '@/lib/queryClient'
import { noteTitlesQuery } from './queries'

// Hands the editor the other notes' titles, and what to do when a link is clicked:
// open the note it names, or make that note in the same folder when there is none yet
export function useWikiLinks(editor: Editor, note: Note) {
  const { data: titles } = useQuery(noteTitlesQuery)
  const go = useTransitionNavigate()
  const createNote = useCreateNote()

  const open = useRef((_target: string) => {})
  open.current = (target) => {
    const match = titles?.find((t) => t.id !== note.id && titleKey(t.title) === titleKey(target))
    if (match) return go(`/note/${match.id}`, linkedNote())

    const created = { ...draftNote(note.folderId), title: target.trim().slice(0, 200) }
    queryClient.setQueryData(noteQuery(created.id).queryKey, created)
    createNote.mutate(created)
    go(`/note/${created.id}`, linkedNote())
  }

  useEffect(() => {
    const others = (titles ?? []).filter((t) => t.id !== note.id)
    const storage = editor.storage.wikiLink
    storage.titles = others.map((t) => t.title)
    storage.existing = new Set(others.map((t) => titleKey(t.title)))
    storage.open = (target) => open.current(target)
    if (!editor.isDestroyed) editor.view.dispatch(editor.state.tr.setMeta(wikiLinksChanged, true))
  }, [editor, titles, note.id])
}
