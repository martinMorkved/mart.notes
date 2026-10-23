export type NoteViewMode = 'text' | 'markdown'

const modes: { value: NoteViewMode; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'markdown', label: 'Markdown' },
]

type Props = { mode: NoteViewMode; onChange: (mode: NoteViewMode) => void }

export function ViewToggle({ mode, onChange }: Props) {
  return (
    <div className="view-toggle" role="group" aria-label="Show note as" title="Switch with Ctrl+E">
      {modes.map((m) => (
        <button key={m.value} aria-pressed={mode === m.value} onClick={() => onChange(m.value)}>
          {m.label}
        </button>
      ))}
    </div>
  )
}
