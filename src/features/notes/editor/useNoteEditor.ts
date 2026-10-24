import { useEditor } from '@tiptap/react'
import { useRef } from 'react'
import { extensions } from './extensions'

export function useNoteEditor(initial: string, onChange: (markdown: string) => void) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  return useEditor({
    extensions,
    content: initial,
    contentType: 'markdown',
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    editorProps: {
      // keeps the caret clear of the mobile toolbar above the keyboard
      scrollMargin: { top: 16, bottom: 80, left: 0, right: 0 },
      scrollThreshold: { top: 16, bottom: 80, left: 0, right: 0 },
      attributes: { class: 'prose note-rich', 'aria-label': 'Content', spellcheck: 'true' },
    },
    onUpdate: ({ editor }) => onChangeRef.current(editor.getMarkdown()),
  })
}
