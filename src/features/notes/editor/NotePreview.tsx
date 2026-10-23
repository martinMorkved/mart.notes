import { MarkdownContent } from '../markdown/MarkdownContent'

export function NotePreview({ content, onEdit }: { content: string; onEdit: () => void }) {
  if (!content.trim()) {
    return (
      <div className="note-preview-empty">
        <p>Nothing written yet.</p>
        <button className="button-quiet" onClick={onEdit}>
          Start writing
        </button>
      </div>
    )
  }

  return (
    <div className="note-preview" onDoubleClick={onEdit} title="Double-click to edit">
      <MarkdownContent source={content} />
    </div>
  )
}
