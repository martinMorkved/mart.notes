type Props = {
  value: string
  autoFocus: boolean
  onChange: (title: string) => void
  onEnter: () => void
}

export function TitleInput({ value, autoFocus, onChange, onEnter }: Props) {
  return (
    <h1 className="note-title">
      <input
        value={value}
        placeholder="Untitled"
        aria-label="Title"
        maxLength={200}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          onEnter()
        }}
      />
    </h1>
  )
}
