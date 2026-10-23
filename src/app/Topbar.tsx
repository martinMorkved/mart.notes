import { MenuIcon } from '@/ui/icons'
import { Wordmark } from '@/ui/Wordmark'

export function Topbar({ navOpen, onOpenNav }: { navOpen: boolean; onOpenNav: () => void }) {
  return (
    <header className="topbar">
      <button className="icon-button" aria-label="Open menu" aria-expanded={navOpen} onClick={onOpenNav}>
        <MenuIcon />
      </button>
      <Wordmark />
    </header>
  )
}
