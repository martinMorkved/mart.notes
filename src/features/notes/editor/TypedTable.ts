import { Extension } from '@tiptap/core'
import { markdownManager } from './markdownManager'

const ROW = /^\|.*\|$/
const SEPARATOR = /^\|(\s*:?-+:?\s*\|)+$/

// Pressing Enter after two or more "| a | b |" lines turns them into a real table
export const TypedTable = Extension.create({
  name: 'typedTable',
  priority: 1000,

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection
        if (!empty || $from.parent.type.name !== 'paragraph') return false
        if ($from.parentOffset !== $from.parent.content.size) return false

        const container = $from.node(-1)
        const rows: string[] = []
        let first = $from.index(-1)
        for (let i = first; i >= 0; i--) {
          const node = container.child(i)
          const text = node.type.name === 'paragraph' ? node.textContent.trim() : ''
          if (!ROW.test(text)) break
          rows.unshift(text)
          first = i
        }
        if (rows.length < 2) return false

        if (!SEPARATOR.test(rows[1])) {
          const columns = rows[0].split('|').length - 2
          rows.splice(1, 0, `|${' --- |'.repeat(columns)}`)
        }

        const table = markdownManager(editor).parse(rows.join('\n'))
        const from = $from.posAtIndex(first, $from.depth - 1)
        return editor.chain().insertContentAt({ from, to: $from.after() }, table.content ?? []).run()
      },
    }
  },
})
