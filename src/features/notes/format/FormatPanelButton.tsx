import { FormatIcon } from '@/ui/icons'

export function FormatPanelButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      className="icon-button"
      aria-label="Formatting"
      aria-expanded={open}
      title="Formatting"
      onClick={onToggle}
    >
      <FormatIcon />
    </button>
  )
}
