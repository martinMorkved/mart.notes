import type { Editor } from '@tiptap/react'

export type FormatAction = {
  label: string
  shortcut: string
  keys?: string
  run: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
}

function toggleLink(editor: Editor) {
  if (editor.isActive('link')) {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  const url = window.prompt('Link address', 'https://')
  if (!url || url === 'https://') return
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function linkToNote(editor: Editor) {
  const { from, to, empty } = editor.state.selection
  const target = empty ? window.prompt('Name of the note to link to') : editor.state.doc.textBetween(from, to)
  if (!target?.trim()) return
  editor.chain().focus().insertContentAt({ from, to }, { type: 'wikiLink', attrs: { target: target.trim() } }).run()
}

export const formatActions: FormatAction[] = [
  {
    label: 'Heading',
    shortcut: '## ',
    keys: 'Mod-Alt-2',
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (e) => e.isActive('heading', { level: 2 }),
  },
  {
    label: 'Subheading',
    shortcut: '### ',
    keys: 'Mod-Alt-3',
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive('heading', { level: 3 }),
  },
  {
    label: 'Bold',
    shortcut: '**text**',
    keys: 'Mod-b',
    run: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive('bold'),
  },
  {
    label: 'Italic',
    shortcut: '*text*',
    keys: 'Mod-i',
    run: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive('italic'),
  },
  {
    label: 'Strikethrough',
    shortcut: '~~text~~',
    keys: 'Mod-Shift-s',
    run: (e) => e.chain().focus().toggleStrike().run(),
    isActive: (e) => e.isActive('strike'),
  },
  {
    label: 'Link',
    shortcut: '[text](url)',
    run: toggleLink,
    isActive: (e) => e.isActive('link'),
  },
  {
    label: 'Link to a note',
    shortcut: '[[Note]]',
    run: linkToNote,
    isActive: (e) => e.isActive('wikiLink'),
  },
  {
    label: 'List',
    shortcut: '- ',
    keys: 'Mod-Shift-8',
    run: (e) => e.chain().focus().toggleBulletList().run(),
    isActive: (e) => e.isActive('bulletList'),
  },
  {
    label: 'Numbered list',
    shortcut: '1. ',
    keys: 'Mod-Shift-7',
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    isActive: (e) => e.isActive('orderedList'),
  },
  {
    label: 'Checklist',
    shortcut: '[ ] ',
    keys: 'Mod-Shift-9',
    run: (e) => e.chain().focus().toggleTaskList().run(),
    isActive: (e) => e.isActive('taskList'),
  },
  {
    label: 'Quote',
    shortcut: '> ',
    keys: 'Mod-Shift-b',
    run: (e) => e.chain().focus().toggleBlockquote().run(),
    isActive: (e) => e.isActive('blockquote'),
  },
  {
    label: 'Code',
    shortcut: '`code`',
    keys: 'Mod-e',
    run: (e) => e.chain().focus().toggleCode().run(),
    isActive: (e) => e.isActive('code'),
  },
  {
    label: 'Code block',
    shortcut: '``` ',
    keys: 'Mod-Alt-c',
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
    isActive: (e) => e.isActive('codeBlock'),
  },
  {
    label: 'Table',
    shortcut: '| a | b |',
    run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run(),
    isActive: (e) => e.isActive('table'),
  },
  {
    label: 'Divider',
    shortcut: '---',
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
]
