import { useQuery } from '@tanstack/react-query'
import type { Editor } from '@tiptap/react'
import { useEffect, useRef } from 'react'
import type { Note, NoteTitle } from '@shared/types'
import { titleKey } from '@shared/wikiLinks'
import { displayTitle, linkTo, type WikiLinkAttrs, wikiLinksChanged } from '@/features/notes/editor/WikiLink'
import { draftNote } from '@/features/notes/draftNote'
import { useCreateNote } from '@/features/notes/mutations'
import { noteQuery } from '@/features/notes/queries'
import { linkedNote } from '@/features/transitions/linkedNote'
import { useTransitionNavigate } from '@/features/transitions/useTransitionNavigate'
import { queryClient } from '@/lib/queryClient'
import { showToast } from '@/ui/toast'
import { noteTitlesQuery } from './queries'

// Hands the editor the list of notes, keeps each link's text at its note's current title,
// and decides what a click on a link does. `active` is false while the markdown view is
// open, since the rich editor isn't the one being edited then.
export function useWikiLinks(editor: Editor, note: Note, active: boolean) {
  const { data: titles } = useQuery(noteTitlesQuery)
  const go = useTransitionNavigate()
  const createNote = useCreateNote()

  const create = useRef<(title: string) => string>(() => '')
  create.current = (title) => {
    const created = { ...draftNote(note.folderId), title: title.trim().slice(0, 200) }
    queryClient.setQueryData(noteQuery(created.id).queryKey, created)
    // Listed right away, so the new link doesn't show as missing while the note is saved
    const listed: NoteTitle = { id: created.id, title: created.title, folderId: created.folderId }
    queryClient.setQueryData(noteTitlesQuery.queryKey, (list = []) => [listed, ...list])
    createNote.mutate(created)
    return created.id
  }

  const open = useRef((_attrs: WikiLinkAttrs) => {})
  open.current = ({ noteId, target }) => {
    const storage = editor.storage.wikiLink
    if (noteId) {
      if (storage.byId.has(noteId)) go(`/note/${noteId}`, linkedNote())
      else showToast({ message: 'That note is in the trash or no longer exists' })
      return
    }
    const id = storage.byKey.get(titleKey(target ?? '')) ?? create.current(target ?? '')
    go(`/note/${id}`, linkedNote())
  }

  useEffect(() => {
    const storage = editor.storage.wikiLink
    const list = titles ?? []
    storage.notes = list
    storage.currentId = note.id
    storage.byId = new Map(list.map((n) => [n.id, n.title]))
    // Newest first, so a title shared by two notes leads to the newer one
    storage.byKey = new Map(list.toReversed().map((n) => [titleKey(n.title), n.id]))
    storage.byKey.delete('')
    storage.open = (attrs) => open.current(attrs)
    storage.create = (title) => create.current(title)
    if (editor.isDestroyed) return

    const tr = editor.state.tr.setMeta(wikiLinksChanged, true)
    if (active && titles) {
      // Renamed notes get their new title in the link text, and [[Title]] links whose note
      // exists become id links. Both save with the note, like any other edit.
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== 'wikiLink') return
        const attrs = node.attrs as WikiLinkAttrs
        const title = attrs.noteId ? storage.byId.get(attrs.noteId) : undefined
        if (title !== undefined && displayTitle(title) !== attrs.label) {
          tr.setNodeMarkup(pos, undefined, { ...attrs, label: displayTitle(title) })
        } else if (!attrs.noteId && attrs.target && storage.byKey.has(titleKey(attrs.target))) {
          tr.setNodeMarkup(pos, undefined, linkTo(storage, attrs.target))
        }
      })
      tr.setMeta('addToHistory', false)
    }
    editor.view.dispatch(tr)
  }, [editor, titles, note.id, active])
}
