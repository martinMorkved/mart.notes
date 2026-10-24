import type { Editor } from '@tiptap/react'

export type TableAction = {
  label: string
  run: (editor: Editor) => void
  danger?: boolean
}

export const tableActions: TableAction[] = [
  { label: 'Row above', run: (e) => e.chain().focus().addRowBefore().run() },
  { label: 'Row below', run: (e) => e.chain().focus().addRowAfter().run() },
  { label: 'Column left', run: (e) => e.chain().focus().addColumnBefore().run() },
  { label: 'Column right', run: (e) => e.chain().focus().addColumnAfter().run() },
  { label: 'Delete row', run: (e) => e.chain().focus().deleteRow().run(), danger: true },
  { label: 'Delete column', run: (e) => e.chain().focus().deleteColumn().run(), danger: true },
  { label: 'Delete table', run: (e) => e.chain().focus().deleteTable().run(), danger: true },
]
