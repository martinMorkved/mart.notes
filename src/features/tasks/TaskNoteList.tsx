import { closestCenter, DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo } from 'react'
import type { Folder, NoteTasks } from '@shared/types'
import { suppressNextClick } from '@/features/dnd/suppressClick'
import { useDragSensors } from '@/features/dnd/useDragSensors'
import { FolderHeading } from './FolderHeading'
import { MoveButtons } from './MoveButtons'
import { NoteTaskLists } from './NoteTaskLists'
import { SortableTaskNote } from './SortableTaskNote'
import { useTodoOrder } from './useTodoOrder'
import type { Showing } from './visibleTasks'

type Props = {
  notes: NoteTasks[]
  folders: Folder[]
  showing: Showing
  onTicked: (key: string) => void
  // notes whose done tasks start out showing
  doneOpen: Set<string>
  onRise: (noteId: string) => void
  // the active notes can be put in a new order; the completed ones just keep theirs
  reorderable?: boolean
}

// The notes in order of priority, each folder's name above them wherever it changes. A folder
// can come up more than once, since the order is the user's and not the tree's.
export function TaskNoteList({ notes, folders, showing, onTicked, doneOpen, onRise, reorderable }: Props) {
  const byId = useMemo(() => new Map(folders.map((f) => [f.id, f])), [folders])
  const { items, step, drop } = useTodoOrder(notes)
  const sensors = useDragSensors()

  const rows = items.map((note, i) => {
    const folder = byId.get(note.folderId)
    const content = (
      <>
        {folder && note.folderId !== items[i - 1]?.folderId && <FolderHeading folder={folder} folders={folders} />}
        <NoteTaskLists
          note={note}
          showing={showing}
          onTicked={onTicked}
          doneOpen={doneOpen.has(note.noteId)}
          onRise={onRise}
          controls={
            reorderable && (
              <MoveButtons
                title={note.title || 'Untitled'}
                onUp={i > 0 ? () => step(note, -1) : undefined}
                onDown={i < items.length - 1 ? () => step(note, 1) : undefined}
              />
            )
          }
        />
      </>
    )
    return reorderable ? (
      <SortableTaskNote key={note.noteId} noteId={note.noteId}>
        {content}
      </SortableTaskNote>
    ) : (
      <li key={note.noteId} className="task-item">
        {content}
      </li>
    )
  })

  if (!reorderable) return <ol className="task-groups">{rows}</ol>

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        suppressNextClick()
        if (over) drop(String(active.id), String(over.id))
      }}
    >
      <SortableContext items={items.map((n) => n.noteId)} strategy={verticalListSortingStrategy}>
        <ol className="task-groups">{rows}</ol>
      </SortableContext>
    </DndContext>
  )
}
