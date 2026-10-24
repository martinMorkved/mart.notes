import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { type KeyboardEvent, type Ref, useMemo } from 'react'
import { foldersQuery } from '@/features/folders/queries'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { FolderHit } from './FolderHit'
import { NoteHit } from './NoteHit'
import { searchQuery } from './queries'

type Props = {
  query: string
  ref: Ref<HTMLDivElement>
  // Arrow up from the first hit goes back to the field
  onLeaveTop: () => void
}

export function SearchResults({ query, ref, onLeaveTop }: Props) {
  const debounced = useDebouncedValue(query.trim(), 150)
  const { data: notes, isPending } = useQuery({ ...searchQuery(debounced), enabled: debounced !== '' })

  // Folders are already loaded for the tree, so they are matched right here
  const { data: allFolders } = useSuspenseQuery(foldersQuery)
  const folders = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const byId = new Map(allFolders.map((f) => [f.id, f]))
    return allFolders
      .filter((f) => f.name.toLowerCase().includes(needle))
      .map((f) => ({ folder: f, parentName: f.parentId ? (byId.get(f.parentId)?.name ?? null) : null }))
  }, [allFolders, query])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const links = [...event.currentTarget.querySelectorAll('a')]
    const index = links.indexOf(document.activeElement as HTMLAnchorElement)
    const next = index + (event.key === 'ArrowDown' ? 1 : -1)
    if (next < 0) onLeaveTop()
    else links[Math.min(next, links.length - 1)]?.focus()
  }

  const nothing = !isPending && !notes?.length && !folders.length

  return (
    <div className="sidebar-section search-results" ref={ref} onKeyDown={onKeyDown} aria-live="polite">
      {folders.length > 0 && (
        <section>
          <div className="sidebar-heading">
            <h2>Folders</h2>
          </div>
          <ul>
            {folders.map(({ folder, parentName }) => (
              <FolderHit key={folder.id} folder={folder} parentName={parentName} />
            ))}
          </ul>
        </section>
      )}

      {notes && notes.length > 0 && (
        <section>
          <div className="sidebar-heading">
            <h2>Notes</h2>
          </div>
          <ul>
            {notes.map((note) => (
              <NoteHit key={note.id} note={note} />
            ))}
          </ul>
        </section>
      )}

      {isPending && !folders.length && <p className="sidebar-empty">Searching…</p>}
      {nothing && <p className="sidebar-empty">Nothing matches “{query.trim()}”.</p>}
    </div>
  )
}
