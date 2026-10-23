import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { Placeholder } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { MarkdownPaste } from './MarkdownPaste'
import { MarkdownShortcuts } from './MarkdownShortcuts'
import { StrictItalic } from './StrictItalic'
import { TypedTable } from './TypedTable'
import { WikiLink } from './WikiLink'

export const extensions = [
  StarterKit.configure({
    underline: false,
    italic: false,
    link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
  }),
  StrictItalic,
  TaskList,
  TaskItem.configure({ nested: true }),
  TableKit.configure({ table: { resizable: false } }),
  Placeholder.configure({ placeholder: 'Start writing …' }),
  WikiLink,
  TypedTable,
  MarkdownShortcuts,
  MarkdownPaste,
  Markdown,
]
