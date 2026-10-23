import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { Placeholder } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { WikiLink } from './WikiLink'

export const extensions = [
  StarterKit.configure({
    underline: false,
    link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
  }),
  TaskList,
  TaskItem.configure({ nested: true }),
  TableKit.configure({ table: { resizable: false } }),
  Placeholder.configure({ placeholder: 'Start writing …' }),
  WikiLink,
  Markdown,
]
