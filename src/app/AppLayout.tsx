import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { DragAndDrop } from '@/features/dnd/DragAndDrop'
import { useActiveFolderId } from '@/features/folders/useActiveFolderId'
import { Toaster } from '@/ui/Toaster'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import './app.css'

export function AppLayout() {
  const { pathname } = useLocation()
  const activeFolderId = useActiveFolderId()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => setNavOpen(false), [pathname])

  return (
    <div className="app">
      <Topbar navOpen={navOpen} onOpenNav={() => setNavOpen(true)} />

      <DragAndDrop>
        <aside className="sidebar" data-open={navOpen || undefined}>
          <Sidebar activeFolderId={activeFolderId} />
        </aside>
        {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}

        <main className="content">
          <Outlet />
        </main>
      </DragAndDrop>

      <Toaster />
    </div>
  )
}
