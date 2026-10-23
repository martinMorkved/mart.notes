import { EditorContent } from '@tiptap/react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Note } from '@shared/types'
import { usePersistentState } from '@/lib/usePersistentState'
import { useShortcut } from '@/lib/useShortcut'
import { Menu } from '@/ui/Menu'
import { SaveStatus } from './editor/SaveStatus'
import { SourceEditor } from './editor/SourceEditor'
import { TitleInput } from './editor/TitleInput'
import { useAutosave } from './editor/useAutosave'
import { useNoteEditor } from './editor/useNoteEditor'
import { ViewToggle, type NoteViewMode } from './editor/ViewToggle'
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

  const mode: NoteViewMode = source === null ? 'text' : 'markdown'

  function switchTo(next: NoteViewMode) {
    if (next === mode) return
    if (next === 'markdown') return setSource(editor.getMarkdown())
    editor.commands.setContent(source ?? '', { contentType: 'markdown', emitUpdate: false })
    setSource(null)
  }

  useShortcut('e', () => switchTo(mode === 'text' ? 'markdown' : 'text'))

  function remove() {
    autosave.flush()
    navigate(`/folder/${note.folderId}`, { replace: true })
    deleteNote.mutate({ ...note, title })
  }

  return (
    <div className="note-layout" data-panel={(panelOpen && mode === 'text') || undefined}>
      <article className="note">
        <NoteBar folderId={note.folderId} folderName={folderName}>
          <SaveStatus state={autosave.state} updatedAt={note.updatedAt} />
          <ViewToggle mode={mode} onChange={switchTo} />
          {mode === 'text' && <FormatPanelButton open={panelOpen} onToggle={() => setPanelOpen(!panelOpen)} />}
          <Menu label="Note actions" items={[{ label: 'Move to trash', onSelect: remove, danger: true }]} />
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

        {mode === 'text' ? (
          <EditorContent editor={editor} />
        ) : (
          <SourceEditor
            value={source ?? ''}
            onChange={(value) => {
              setSource(value)
              autosave.change({ content: value })
            }}
          />
        )}
      </article>

      {panelOpen && mode === 'text' && <FormatPanel editor={editor} onClose={() => setPanelOpen(false)} />}
    </div>
  )
}
