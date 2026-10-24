import type { Editor } from '@tiptap/core'
import type { MarkdownExtensionStorage } from '@tiptap/markdown'

export function markdownManager(editor: Editor) {
  return (editor.storage as unknown as { markdown: MarkdownExtensionStorage }).markdown.manager
}
