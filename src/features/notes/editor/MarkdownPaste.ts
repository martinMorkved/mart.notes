import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { markdownManager } from './markdownManager'

const BLOCK_SYNTAX = /^(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```|\|.*\|\s*$)/m
const INLINE_SYNTAX = /\*\*[^*\n]+\*\*|\[\[[^\]\n]+\]\]|\[[^\]\n]+\]\([^)\n]+\)/

function looksLikeMarkdown(text: string) {
  return BLOCK_SYNTAX.test(text) || INLINE_SYNTAX.test(text)
}

// Plain-text pastes that look like markdown are parsed; rich pastes from web pages keep their formatting
export const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    const editor = this.editor
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const text = event.clipboardData?.getData('text/plain')
            if (!text || event.clipboardData?.types.includes('text/html')) return false
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
