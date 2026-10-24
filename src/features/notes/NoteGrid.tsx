import type { NoteSummary } from '@shared/types'
import { NoteCard } from './NoteCard'
import './notes.css'

export function NoteGrid({ notes, onNewNote }: { notes: NoteSummary[]; onNewNote: (source: Element) => void }) {
  if (!notes.length) {
    return (
      <div className="empty-state">
        <p>This folder is empty.</p>
        <button className="button-quiet" onClick={(e) => onNewNote(e.currentTarget)}>
          Write the first note
        </button>
      </div>
    )
  }

  return (
    <ul className="cards">
      {notes.map((note) => (
        <li key={note.id}>
          <NoteCard note={note} />
        </li>
      ))}
    </ul>
  )
}
