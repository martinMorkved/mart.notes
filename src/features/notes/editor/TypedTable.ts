import { Extension } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import { markdownManager } from './markdownManager'

const ROW = /^\|.*\|$/
const SEPARATOR = /^\|(\s*:?-+:?\s*\|)+$/

// Position inside the first cell of the row after the header
function firstBodyCell(doc: Node, from: number) {
  let rows = 0
  let cursor = -1
  doc.nodesBetween(from, doc.content.size, (node, pos) => {
    if (cursor !== -1) return false
    if (node.type.name !== 'tableRow') return true
    // row > cell > paragraph
    if (rows++ === 1) cursor = pos + 3
    return false
  })
  return cursor
}

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

        const columns = rows[0].split('|').length - 2
        if (!SEPARATOR.test(rows[1])) rows.splice(1, 0, `|${' --- |'.repeat(columns)}`)
        const headerOnly = rows.length === 2
        if (headerOnly) rows.push(`|${'   |'.repeat(columns)}`)

        const table = markdownManager(editor).parse(rows.join('\n'))
        const from = $from.posAtIndex(first, $from.depth - 1)
        editor.commands.insertContentAt({ from, to: $from.after() }, table.content ?? [])
        if (headerOnly) {
          const cursor = firstBodyCell(editor.state.doc, from)
          if (cursor !== -1) editor.commands.setTextSelection(cursor)
        }
        return true
      },
    }
  },
})
