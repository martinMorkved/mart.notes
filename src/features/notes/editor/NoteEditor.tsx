import type { Ref } from 'react'

type Props = {
  ref: Ref<HTMLTextAreaElement>
  value: string
  onChange: (content: string) => void
}

export function NoteEditor({ ref, value, onChange }: Props) {
  return (
    <textarea
      ref={ref}
      className="note-body"
      value={value}
      placeholder="Start writing …"
      aria-label="Content"
      spellCheck
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
