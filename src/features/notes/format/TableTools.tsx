import { useEditorState, type Editor } from '@tiptap/react'
import { tableActions } from './tableActions'

export function TableTools({ editor }: { editor: Editor }) {
  const inTable = useEditorState({ editor, selector: ({ editor }) => editor.isActive('table') })
  if (!inTable) return null

  return (
    <section className="table-tools" aria-labelledby="table-tools-title">
      <h3 id="table-tools-title">Table</h3>
      <div className="table-tools-grid">
        {tableActions.map((action) => (
          <button
            key={action.label}
            className="table-tool"
            data-danger={action.danger || undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => action.run(editor)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  )
}
