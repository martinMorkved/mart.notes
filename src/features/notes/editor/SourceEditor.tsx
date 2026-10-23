import type { Ref } from 'react'

type Props = {
  ref?: Ref<HTMLTextAreaElement>
  value: string
  onChange: (content: string) => void
}

export function SourceEditor({ ref, value, onChange }: Props) {
  return (
    <textarea
      ref={ref}
      className="note-body"
      value={value}
      placeholder="Markdown …"
      aria-label="Content"
      spellCheck
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
