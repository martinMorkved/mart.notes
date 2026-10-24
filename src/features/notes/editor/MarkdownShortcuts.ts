import { Extension, InputRule } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

const BOLD_ITALIC = /(?:^|\s)(\*\*\*(?!\s)([^*]+?)(?<!\s)\*\*\*)$/
const LINK = /(?:^|\s)(\[([^\]]+)\]\((\S+)\))$/
const TASK_IN_LIST = /^\s*\[([ xX])\]\s$/
const CODE_FENCE = /^```([\w-]*)$/

// Markdown typed straight into the formatted view that the built-in rules don't cover
export const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',
  priority: 1000,

  addInputRules() {
    const { schema } = this.editor
    return [
      new InputRule({
        find: BOLD_ITALIC,
        handler: ({ state, range, match }) => {
          const start = range.from + match[0].indexOf(match[1])
          const text = match[2]
          state.tr
            .insertText(text, start, range.to)
            .addMark(start, start + text.length, schema.marks.bold.create())
            .addMark(start, start + text.length, schema.marks.italic.create())
            .removeStoredMark(schema.marks.bold)
            .removeStoredMark(schema.marks.italic)
        },
      }),
      new InputRule({
        find: LINK,
        handler: ({ state, range, match }) => {
          const start = range.from + match[0].indexOf(match[1])
          const text = match[2]
          state.tr
            .insertText(text, start, range.to)
            .addMark(start, start + text.length, schema.marks.link.create({ href: match[3] }))
            .removeStoredMark(schema.marks.link)
        },
      }),
      new InputRule({
        find: TASK_IN_LIST,
        handler: ({ state, range, match, chain }) => {
          if (state.selection.$from.node(-2)?.type.name !== 'bulletList') return null
          chain()
            .deleteRange(range)
            .toggleTaskList()
            .updateAttributes('taskItem', { checked: match[1] !== ' ' })
            .run()
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection
        if (!empty || $from.parent.type.name !== 'paragraph') return false
        const fence = CODE_FENCE.exec($from.parent.textContent)
        if (!fence) return false
        const codeBlock = editor.schema.nodes.codeBlock.create({ language: fence[1] || null })
        return editor.commands.command(({ tr }) => {
          tr.replaceWith($from.before(), $from.after(), codeBlock)
          tr.setSelection(TextSelection.create(tr.doc, $from.before() + 1))
          return true
        })
      },
    }
  },
})
