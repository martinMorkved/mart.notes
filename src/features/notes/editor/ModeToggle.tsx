import type { NoteMode } from './useNoteMode'

const modes: { value: NoteMode; label: string }[] = [
  { value: 'write', label: 'Write' },
  { value: 'read', label: 'Preview' },
]

export function ModeToggle({ mode, onChange }: { mode: NoteMode; onChange: (mode: NoteMode) => void }) {
  return (
    <div className="mode-toggle" role="group" aria-label="Editor mode" title="Switch with Ctrl+E">
      {modes.map((m) => (
        <button key={m.value} aria-pressed={mode === m.value} onClick={() => onChange(m.value)}>
          {m.label}
        </button>
      ))}
    </div>
  )
}
