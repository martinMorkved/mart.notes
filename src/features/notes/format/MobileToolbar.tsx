import { useEditorState, type Editor } from '@tiptap/react'
import type { CSSProperties, SyntheticEvent } from 'react'
import { useKeyboardInset } from '@/lib/useKeyboardInset'
import { formatActions } from './formatActions'
import { tableActions } from './tableActions'
import './mobile-toolbar.css'

// Keeps the editor focused, so tapping a button doesn't close the keyboard
const keepFocus = (event: SyntheticEvent) => event.preventDefault()

export function MobileToolbar({ editor }: { editor: Editor }) {
  const keyboard = useKeyboardInset()
  const { focused, inTable, active } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      focused: editor.isFocused,
      inTable: editor.isActive('table'),
      active: formatActions.map((action) => action.isActive?.(editor) ?? false),
    }),
  })
  if (!focused) return null

  return (
    <div
      className="mobile-toolbar"
      role="toolbar"
      aria-label="Formatting"
      style={
        {
          '--keyboard': `${keyboard}px`,
          // the home indicator only matters when the keyboard is closed
          '--safe-bottom': keyboard > 0 ? '0px' : 'env(safe-area-inset-bottom, 0px)',
        } as CSSProperties
      }
    >
      {inTable &&
        tableActions.map((action) => (
          <button
            key={action.label}
            className="mobile-tool"
            data-table
            data-danger={action.danger || undefined}
            onPointerDown={keepFocus}
            onMouseDown={keepFocus}
            onClick={() => action.run(editor)}
          >
            {action.label}
          </button>
        ))}
      {formatActions.map((action, i) => (
        <button
          key={action.label}
          className="mobile-tool"
          aria-label={action.label}
          aria-pressed={active[i]}
          data-format={action.label}
          onPointerDown={keepFocus}
          onMouseDown={keepFocus}
          onClick={() => action.run(editor)}
        >
          {action.short}
        </button>
      ))}
    </div>
  )
}
