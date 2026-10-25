import { useSuspenseQuery } from '@tanstack/react-query'
import { type CSSProperties, useEffect, useMemo, useRef } from 'react'
import type { Folder } from '@shared/types'
import { CloseIcon } from '@/ui/icons'
import { treeFoldersQuery } from './queries'
import { flattenTree } from './tree'
import './folder-picker.css'

type Props = {
  title: string
  // where the thing being moved is now, shown but not pickable
  currentId: string | null
  // folders that can't be picked at all, like a folder's own subtree
  hidden?: Set<string>
  // folders can also go to the top level; notes always need a folder
  allowTopLevel?: boolean
  onPick: (folder: Folder | null) => void
  onClose: () => void
}

// "Move to…": pick a folder from a list, the way to move things where dragging is awkward
export function FolderPicker({ title, currentId, hidden, allowTopLevel, onPick, onClose }: Props) {
  const { data: folders } = useSuspenseQuery(treeFoldersQuery)
  const rows = useMemo(() => flattenTree(folders, hidden), [folders, hidden])
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className="picker"
      aria-label={title}
      onClose={onClose}
      // A click on the backdrop lands on the dialog itself
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
    >
      <div className="picker-head">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="Close" onClick={() => ref.current?.close()}>
          <CloseIcon />
        </button>
      </div>
      <ul className="picker-list">
        {allowTopLevel && (
          <li>
            <button className="picker-option" disabled={currentId === null} onClick={() => onPick(null)}>
              Top level
            </button>
          </li>
        )}
        {rows.map(({ folder, depth }) => (
          <li key={folder.id}>
            <button
              className="picker-option"
              style={{ '--depth': depth + (allowTopLevel ? 1 : 0) } as CSSProperties}
              disabled={folder.id === currentId}
              aria-current={folder.id === currentId || undefined}
              onClick={() => onPick(folder)}
            >
              {folder.name}
            </button>
          </li>
        ))}
      </ul>
    </dialog>
  )
}
