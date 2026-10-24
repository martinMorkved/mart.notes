import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { markdownManager } from './markdownManager'

const BLOCK_SYNTAX = /^(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```|\|.*\|\s*$)/m
const INLINE_SYNTAX = /\*\*[^*\n]+\*\*|\[\[[^\]\n]+\]\]|\[[^\]\n]+\]\([^)\n]+\)/

// Code editors like VS Code put coloured spans on the clipboard; that isn't formatting worth keeping
const RICH_HTML = /<(h[1-6]|ul|ol|li|table|strong|b|em|i|a|blockquote|img)[\s>]/i

function looksLikeMarkdown(text: string) {
  return BLOCK_SYNTAX.test(text) || INLINE_SYNTAX.test(text)
}

// Pastes that look like markdown are parsed; rich pastes from web pages keep their formatting
export const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    const editor = this.editor
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const text = event.clipboardData?.getData('text/plain')
            const html = event.clipboardData?.getData('text/html')
            if (!text || (html && RICH_HTML.test(html))) return false
            if (!looksLikeMarkdown(text)) return false
            if (editor.isActive('codeBlock')) return false
            const doc = markdownManager(editor).parse(text)
            return editor.commands.insertContent(doc.content ?? [])
          },
        },
      }),
    ]
  },
})
