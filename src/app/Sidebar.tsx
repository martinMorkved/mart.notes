import { NavLink } from 'react-router'
import { AccountMenu } from '@/features/auth/AccountMenu'
import { FolderTree } from '@/features/folders/FolderTree'
import { TrashIcon } from '@/ui/icons'
import { Wordmark } from '@/ui/Wordmark'
import { ThemeToggle } from './ThemeToggle'

export function Sidebar({ activeFolderId }: { activeFolderId: string | null }) {
  return (
    <nav className="sidebar-inner" aria-label="Main">
      <NavLink to="/" className="sidebar-wordmark">
        <Wordmark />
      </NavLink>

      <FolderTree activeFolderId={activeFolderId} />

      <div className="sidebar-footer">
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
