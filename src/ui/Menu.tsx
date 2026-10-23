import { useEffect, useId, useRef, useState } from 'react'
import { MoreIcon } from './icons'

export type MenuItem = {
  label: string
  onSelect: () => void
  danger?: boolean
}

export function Menu({ label, items, className }: { label: string; items: MenuItem[]; className?: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return
      if (event instanceof PointerEvent && root.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    root.current?.querySelector<HTMLButtonElement>('[role=menuitem]')?.focus()
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const buttons = [...(root.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]') ?? [])]
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
    buttons[next]?.focus()
  }

  return (
    <div className={`menu ${className ?? ''}`} ref={root} data-open={open || undefined}>
      <button
        className="icon-button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreIcon />
      </button>
      {open && (
        <div className="menu-list" role="menu" id={id} onKeyDown={onKeyDown}>
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              className="menu-item"
              data-danger={item.danger || undefined}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

