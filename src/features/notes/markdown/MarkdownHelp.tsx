import { CloseIcon } from '@/ui/icons'
import { MarkdownContent } from './MarkdownContent'
import { markdownExamples, type MarkdownExample } from './markdownExamples'
import './markdown-help.css'

type Props = {
  onInsert: (example: MarkdownExample) => void
  onClose: () => void
}

export function MarkdownHelp({ onInsert, onClose }: Props) {
  return (
    <aside className="md-help" aria-labelledby="md-help-title">
      <header className="md-help-header">
        <h2 id="md-help-title">Markdown</h2>
        <button className="icon-button" aria-label="Close markdown help" onClick={onClose}>
          <CloseIcon />
        </button>
      </header>
      <p className="md-help-intro">Click an example to add it where your cursor is. Select text first to wrap it.</p>

      <ul className="md-help-list">
        {markdownExamples.map((example) => (
          <li key={example.label}>
            <button
              className="md-help-item"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onInsert(example)}
            >
              <span className="md-help-label">{example.label}</span>
              <code className="md-help-syntax">{example.syntax}</code>
              <span className="md-help-result" inert>
                <MarkdownContent source={example.syntax} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
