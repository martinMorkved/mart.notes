import { type Ref, useImperativeHandle, useState } from 'react'
import './wikilink-menu.css'

// id is null for a note that doesn't exist yet and is made when picked
export type WikiLinkItem = { id: string | null; title: string }

export type WikiLinkMenuHandle = { onKeyDown: (event: KeyboardEvent) => boolean }

type Props = {
  items: WikiLinkItem[]
  command: (item: WikiLinkItem) => void
  ref?: Ref<WikiLinkMenuHandle>
}

export function WikiLinkMenu({ items, command, ref }: Props) {
  const [active, setActive] = useState(0)
  const [prevItems, setPrevItems] = useState(items)
  if (items !== prevItems) {
    setPrevItems(items)
    setActive(0)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown(event) {
      if (!items.length) return false
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const step = event.key === 'ArrowDown' ? 1 : -1
        setActive((i) => (i + step + items.length) % items.length)
        return true
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        command(items[active])
        return true
      }
      return false
    },
  }))

  if (!items.length) return <div className="wikilink-menu wikilink-menu-empty">Type a note’s name</div>

  return (
    <div className="wikilink-menu" role="listbox" aria-label="Link to note">
      {items.map((item, i) => (
        <button
          key={item.id ?? `new-${item.title}`}
          role="option"
          aria-selected={i === active}
          className="wikilink-option"
          data-new={!item.id || undefined}
          // mousedown would take focus from the editor and close the menu before the click
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => setActive(i)}
          onClick={() => command(item)}
        >
          {!item.id ? (
            <>
              <span className="wikilink-option-hint">New note</span> {item.title}
            </>
          ) : (
            item.title
          )}
        </button>
      ))}
    </div>
  )
}
