import {
  closestCenter,
  type CollisionDetection,
  DndContext,
  type DragMoveEvent,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { type ReactNode, useState } from 'react'
import { type DragData, type DropData, dataOf } from './dragData'
import { DragPreview } from './DragPreview'
import { dropTargetOf } from './dropTarget'
import { type DropTarget, DropTargetContext } from './DropTargetContext'
import { suppressNextClick } from './suppressClick'
import './dnd.css'

const isType = (type: DropData['type']) => (c: { data: { current?: unknown } }) =>
  (c.data.current as DropData | undefined)?.type === type

// A folder under the pointer wins, so a card can be dropped on the sidebar. Otherwise a card
// sorts among the cards nearest to it. Only folders go to the archive.
const collision: CollisionDetection = (args) => {
  const draggingFolder = dataOf(args.active)?.type === 'folder'
  const targets = args.droppableContainers.filter(
    (c) => isType('folder')(c) || (draggingFolder && isType('archive')(c)),
  )
  const folderHits = pointerWithin({ ...args, droppableContainers: targets })
  if (folderHits.length || draggingFolder) return folderHits
  return closestCenter({ ...args, droppableContainers: args.droppableContainers.filter(isType('note')) })
}

export function DragAndDrop({ children }: { children: ReactNode }) {
  const [dragged, setDragged] = useState<DragData | null>(null)
  const [target, setTarget] = useState<DropTarget>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // A long press, so a swipe still scrolls
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  function track(event: DragMoveEvent) {
    const next = dropTargetOf(event)
    setTarget((current) => (current?.folderId === next?.folderId && current?.zone === next?.zone ? current : next))
  }

  function reset() {
    setDragged(null)
    setTarget(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={(event) => setDragged(dataOf(event.active) ?? null)}
      onDragMove={track}
      onDragOver={track}
      onDragEnd={() => {
        suppressNextClick()
        reset()
      }}
      onDragCancel={reset}
    >
      <DropTargetContext value={target}>{children}</DropTargetContext>
      <DragOverlay dropAnimation={null}>
        {dragged && <DragPreview dragged={dragged} overFolder={target !== null} />}
      </DragOverlay>
    </DndContext>
  )
}
