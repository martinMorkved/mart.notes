import { useRef, useState } from 'react'
import { NavLink } from 'react-router'
import { AccountMenu } from '@/features/auth/AccountMenu'
import { FolderTree } from '@/features/folders/FolderTree'
import { SearchField } from '@/features/search/SearchField'
import { SearchResults } from '@/features/search/SearchResults'
import { useClearOnWriting } from '@/features/search/useClearOnWriting'
import { CheckIcon, TrashIcon } from '@/ui/icons'
import { Wordmark } from '@/ui/Wordmark'
import { ThemeToggle } from './ThemeToggle'

export function Sidebar({ activeFolderId }: { activeFolderId: string | null }) {
  const [query, setQuery] = useState('')
  const resultsRef = useRef<HTMLDivElement>(null)
  const firstHit = () => resultsRef.current?.querySelector('a')
  useClearOnWriting(query !== '', () => setQuery(''))

  return (
    <nav className="sidebar-inner" aria-label="Main">
      <NavLink to="/" className="sidebar-wordmark">
        <Wordmark />
      </NavLink>

      <SearchField
        value={query}
        onChange={setQuery}
        onEnter={() => firstHit()?.click()}
        onArrowDown={() => firstHit()?.focus()}
      />

      {query.trim() ? (
        <SearchResults
          query={query}
          ref={resultsRef}
          onLeaveTop={() => document.querySelector<HTMLInputElement>('.search-field input')?.focus()}
        />
      ) : (
        <FolderTree activeFolderId={activeFolderId} />
      )}

      <div className="sidebar-footer">
        <NavLink to="/todo" className="sidebar-link">
          <CheckIcon />
          To-do
        </NavLink>
        <NavLink to="/trash" className="sidebar-link">
          <TrashIcon />
          Trash
        </NavLink>
        <ThemeToggle />
        <AccountMenu />
      </div>
    </nav>
  )
}
