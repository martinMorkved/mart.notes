import { useSuspenseQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { foldersQuery } from '@/features/folders/queries'
import { useDeleteNote, useUpdateNote } from './mutations'
import { NoteBar } from './NoteBar'
import { noteQuery } from './queries'
import './notes.css'

export function NoteView() {
  const { id } = useParams() as { id: string }
  const navigate = useNavigate()
  const { data: note } = useSuspenseQuery(noteQuery(id))
  const { data: folders } = useSuspenseQuery(foldersQuery)
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()
  const body = useRef<HTMLTextAreaElement>(null)
  const folder = folders.find((f) => f.id === note.folderId)

  function save(field: 'title' | 'content', value: string) {
    if (value === note[field]) return
    updateNote.mutate({ id, folderId: note.folderId, patch: { [field]: value } })
  }

  function remove() {
    navigate(`/folder/${note.folderId}`, { replace: true })
    deleteNote.mutate(note)
  }

  return (
    <article className="note" key={note.id}>
      <NoteBar
        folderId={note.folderId}
        folderName={folder?.name ?? 'Back'}
        updatedAt={note.updatedAt}
        onDelete={remove}
      />

      <h1 className="note-title">
        <input
          defaultValue={note.title}
          placeholder="Untitled"
          aria-label="Title"
          maxLength={200}
          autoFocus={!note.title && !note.content}
          onBlur={(e) => save('title', e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            body.current?.focus()
          }}
        />
      </h1>

      <textarea
        ref={body}
        className="note-body"
        defaultValue={note.content}
        placeholder="Start writing …"
        aria-label="Content"
        onBlur={(e) => save('content', e.currentTarget.value)}
      />
    </article>
  )
}
