import { useEditorState, type Editor } from '@tiptap/react'
import { formatKeys } from '@/lib/keys'
import { CloseIcon } from '@/ui/icons'
import { formatActions } from './formatActions'
import './format-panel.css'

export function FormatPanel({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const active = useEditorState({
    editor,
    selector: ({ editor }) => formatActions.map((action) => action.isActive?.(editor) ?? false),
  })

  return (
    <aside className="format-panel" aria-labelledby="format-panel-title">
      <header className="format-panel-header">
        <h2 id="format-panel-title">Formatting</h2>
        <button className="icon-button" aria-label="Close formatting" onClick={onClose}>
          <CloseIcon />
        </button>
      </header>
      <p className="format-panel-intro">
        Select some text and pick a style. The grey hint shows what you can type instead.
      </p>

      <ul className="format-list">
        {formatActions.map((action, i) => (
          <li key={action.label}>
            <button
              className="format-item"
              aria-pressed={active[i]}
              data-format={action.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => action.run(editor)}
            >
              <span className="format-label">{action.label}</span>
              <span className="format-hints">
                <code className="format-shortcut">{action.shortcut}</code>
                {action.keys && <kbd className="format-keys">{formatKeys(action.keys)}</kbd>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
