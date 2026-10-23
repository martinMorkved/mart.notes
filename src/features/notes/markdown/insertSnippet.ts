export type Snippet = {
  before: string
  after?: string
  placeholder: string
  block?: boolean
}

export function insertSnippet(field: HTMLTextAreaElement, snippet: Snippet) {
  field.focus()
  const { selectionStart: start, selectionEnd: end, value } = field
  const selected = value.slice(start, end) || snippet.placeholder
  const newline = snippet.block && start > 0 && value[start - 1] !== '\n' ? '\n' : ''
  const prefix = newline + snippet.before
  const text = prefix + selected + (snippet.after ?? '')

  // execCommand keeps the browser's undo history; setRangeText is the fallback
  if (!document.execCommand('insertText', false, text)) {
    field.setRangeText(text, start, end, 'end')
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const selectFrom = start + prefix.length
  field.setSelectionRange(selectFrom, selectFrom + selected.length)
}
