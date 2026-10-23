import { EditorContent } from '@tiptap/react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Note } from '@shared/types'
import { usePersistentState } from '@/lib/usePersistentState'
import { Menu } from '@/ui/Menu'
import { SaveStatus } from './editor/SaveStatus'
import { SourceEditor } from './editor/SourceEditor'
import { TitleInput } from './editor/TitleInput'
import { useAutosave } from './editor/useAutosave'
import { useNoteEditor } from './editor/useNoteEditor'
import { FormatPanel } from './format/FormatPanel'
import { FormatPanelButton } from './format/FormatPanelButton'
import { useDeleteNote } from './mutations'
import { NoteBar } from './NoteBar'
import './editor/prose.css'
import './note.css'

export function NoteDocument({ note, folderName }: { note: Note; folderName: string }) {
  const navigate = useNavigate()
  const deleteNote = useDeleteNote()
  const autosave = useAutosave(note.id, note.folderId)
  const [title, setTitle] = useState(note.title)
  const [source, setSource] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = usePersistentState('format-panel', true)
  const editor = useNoteEditor(note.content, (content) => autosave.change({ content }))

  function toggleSource() {
    if (source === null) return setSource(editor.getMarkdown())
    editor.commands.setContent(source, { contentType: 'markdown', emitUpdate: false })
    setSource(null)
  }

  function remove() {
    autosave.flush()
    navigate(`/folder/${note.folderId}`, { replace: true })
    deleteNote.mutate({ ...note, title })
  }

  return (
    <div className="note-layout" data-panel={(panelOpen && source === null) || undefined}>
      <article className="note">
        <NoteBar folderId={note.folderId} folderName={folderName}>
          <SaveStatus state={autosave.state} updatedAt={note.updatedAt} />
          {source === null && <FormatPanelButton open={panelOpen} onToggle={() => setPanelOpen(!panelOpen)} />}
          <Menu
            label="Note actions"
            items={[
              { label: source === null ? 'Edit as markdown' : 'Back to formatted', onSelect: toggleSource },
              { label: 'Move to trash', onSelect: remove, danger: true },
            ]}
          />
        </NoteBar>

        <TitleInput
          value={title}
          autoFocus={!note.title && !note.content}
          onChange={(value) => {
            setTitle(value)
            autosave.change({ title: value })
          }}
          onEnter={() => editor.commands.focus('start')}
        />

        {source === null ? (
          <EditorContent editor={editor} />
        ) : (
          <SourceEditor
            value={source}
            onChange={(value) => {
              setSource(value)
              autosave.change({ content: value })
            }}
          />
        )}
      </article>

      {panelOpen && source === null && <FormatPanel editor={editor} onClose={() => setPanelOpen(false)} />}
    </div>
  )
}
