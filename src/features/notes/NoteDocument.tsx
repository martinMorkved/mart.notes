import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router'
import type { Note } from '@shared/types'
import { usePersistentState } from '@/lib/usePersistentState'
import { Menu } from '@/ui/Menu'
import { ModeToggle } from './editor/ModeToggle'
import { NoteEditor } from './editor/NoteEditor'
import { NotePreview } from './editor/NotePreview'
import { SaveStatus } from './editor/SaveStatus'
import { TitleInput } from './editor/TitleInput'
import { useAutosave } from './editor/useAutosave'
import { useNoteMode } from './editor/useNoteMode'
import { insertSnippet } from './markdown/insertSnippet'
import { MarkdownHelp } from './markdown/MarkdownHelp'
import { MarkdownHelpButton } from './markdown/MarkdownHelpButton'
import type { MarkdownExample } from './markdown/markdownExamples'
import { useDeleteNote } from './mutations'
import { NoteBar } from './NoteBar'
import './note.css'

export function NoteDocument({ note, folderName }: { note: Note; folderName: string }) {
  const navigate = useNavigate()
  const deleteNote = useDeleteNote()
  const autosave = useAutosave(note.id, note.folderId)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [mode, setMode] = useNoteMode(note.content.trim() ? 'read' : 'write')
  const [helpOpen, setHelpOpen] = usePersistentState('markdown-help', false)
  const body = useRef<HTMLTextAreaElement>(null)

  function focusBody() {
    if (mode !== 'write') flushSync(() => setMode('write'))
    body.current?.focus()
  }

  function insert(example: MarkdownExample) {
    focusBody()
    if (body.current) insertSnippet(body.current, example.snippet)
  }

  function remove() {
    autosave.flush()
    navigate(`/folder/${note.folderId}`, { replace: true })
    deleteNote.mutate({ ...note, title })
  }

  return (
    <div className="note-layout" data-help={helpOpen || undefined}>
      <article className="note">
        <NoteBar folderId={note.folderId} folderName={folderName}>
          <SaveStatus state={autosave.state} updatedAt={note.updatedAt} />
          <ModeToggle mode={mode} onChange={setMode} />
          <MarkdownHelpButton open={helpOpen} onToggle={() => setHelpOpen(!helpOpen)} />
          <Menu label="Note actions" items={[{ label: 'Move to trash', onSelect: remove, danger: true }]} />
        </NoteBar>

        <TitleInput
          value={title}
          autoFocus={!note.title && !note.content}
          onChange={(value) => {
            setTitle(value)
            autosave.change({ title: value })
          }}
          onEnter={focusBody}
        />

        {mode === 'write' ? (
          <NoteEditor
            ref={body}
            value={content}
            onChange={(value) => {
              setContent(value)
              autosave.change({ content: value })
            }}
          />
        ) : (
          <NotePreview content={content} onEdit={focusBody} />
        )}
      </article>

      {helpOpen && <MarkdownHelp onInsert={insert} onClose={() => setHelpOpen(false)} />}
    </div>
  )
}
