import { useRef } from 'react'
import { formatKeys } from '@/lib/keys'
import { useShortcut } from '@/lib/useShortcut'
import { CloseIcon, SearchIcon } from '@/ui/icons'
import './search.css'

type Props = {
  value: string
  onChange: (value: string) => void
  // Enter opens the first hit, arrow down moves into the list
  onEnter: () => void
  onArrowDown: () => void
}

const shortcut = 'Mod-k'

export function SearchField({ value, onChange, onEnter, onArrowDown }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  useShortcut(shortcut, () => {
    ref.current?.focus()
    ref.current?.select()
  })

  return (
    <div className="search-field">
      <SearchIcon />
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder="Search"
        aria-label="Search notes"
        aria-keyshortcuts={formatKeys(shortcut)}
        enterKeyHint="search"
        maxLength={200}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter()
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            onArrowDown()
          }
          if (e.key === 'Escape') {
            if (value) onChange('')
            else e.currentTarget.blur()
          }
        }}
      />
      {value ? (
        <button
          className="icon-button"
          aria-label="Clear search"
          onClick={() => {
            onChange('')
            ref.current?.focus()
          }}
        >
          <CloseIcon />
        </button>
      ) : (
        <kbd className="search-keys">{formatKeys(shortcut)}</kbd>
      )}
    </div>
  )
}
