import { HelpIcon } from '@/ui/icons'

export function MarkdownHelpButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      className="icon-button"
      aria-label="Markdown help"
      aria-expanded={open}
      title="Markdown help"
      onClick={onToggle}
    >
      <HelpIcon />
    </button>
  )
}
