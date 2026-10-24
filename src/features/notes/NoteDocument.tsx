import { EditorContent } from '@tiptap/react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Note } from '@shared/types'
import { useShortcut } from '@/lib/useShortcut'
import { Menu } from '@/ui/Menu'
import { SaveStatus } from './editor/SaveStatus'
import { SourceEditor } from './editor/SourceEditor'
import { TitleInput } from './editor/TitleInput'
import { useAutosave } from './editor/useAutosave'
import { useNoteEditor } from './editor/useNoteEditor'
import { VIEW_SHORTCUT, ViewToggle, type NoteViewMode } from './editor/ViewToggle'
import { FormatPanel } from './format/FormatPanel'
import { FormatPanelButton } from './format/FormatPanelButton'
import { MobileToolbar } from './format/MobileToolbar'
import { useFormatPanel } from './format/useFormatPanel'
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
  const panel = useFormatPanel()
  const editor = useNoteEditor(note.content, (content) => autosave.change({ content }))

  const mode: NoteViewMode = source === null ? 'text' : 'markdown'

  function switchTo(next: NoteViewMode) {
    if (next === mode) return
    if (next === 'markdown') return setSource(editor.getMarkdown())
    editor.commands.setContent(source ?? '', { contentType: 'markdown', emitUpdate: false })
    setSource(null)
  }

  useShortcut(VIEW_SHORTCUT, () => switchTo(mode === 'text' ? 'markdown' : 'text'))

  function remove() {
    autosave.flush()
    navigate(`/folder/${note.folderId}`, { replace: true })
    deleteNote.mutate({ ...note, title })
  }

  return (
    <div className="note-layout" data-panel={(panel.open && mode === 'text') || undefined}>
      <div className="note-sheet" aria-hidden="true" />
      <article className="note">
        <NoteBar noteId={note.id} folderId={note.folderId} folderName={folderName}>
          <SaveStatus state={autosave.state} updatedAt={note.updatedAt} />
          <ViewToggle mode={mode} onChange={switchTo} />
          {mode === 'text' && <FormatPanelButton open={panel.open} onToggle={() => panel.setOpen(!panel.open)} />}
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

      {mode === 'text' && !panel.docked && !panel.open && <MobileToolbar editor={editor} />}
      {panel.open && mode === 'text' && <FormatPanel editor={editor} onClose={() => panel.setOpen(false)} />}
    </div>
  )
}
