import type { Snippet } from './insertSnippet'

export type MarkdownExample = {
  label: string
  syntax: string
  snippet: Snippet
}

export const markdownExamples: MarkdownExample[] = [
  { label: 'Heading', syntax: '## Heading', snippet: { before: '## ', placeholder: 'Heading', block: true } },
  { label: 'Bold', syntax: '**bold**', snippet: { before: '**', after: '**', placeholder: 'bold' } },
  { label: 'Italic', syntax: '*italic*', snippet: { before: '*', after: '*', placeholder: 'italic' } },
  { label: 'Strikethrough', syntax: '~~done~~', snippet: { before: '~~', after: '~~', placeholder: 'done' } },
  {
    label: 'Link',
    syntax: '[mart.notes](https://example.com)',
    snippet: { before: '[', after: '](https://)', placeholder: 'text' },
  },
  { label: 'Link to a note', syntax: '[[Note title]]', snippet: { before: '[[', after: ']]', placeholder: 'Note title' } },
  { label: 'List', syntax: '- First\n- Second', snippet: { before: '- ', placeholder: 'Item', block: true } },
  {
    label: 'Numbered list',
    syntax: '1. First\n2. Second',
    snippet: { before: '1. ', placeholder: 'Item', block: true },
  },
  {
    label: 'Checklist',
    syntax: '- [ ] To do\n- [x] Done',
    snippet: { before: '- [ ] ', placeholder: 'To do', block: true },
  },
  { label: 'Quote', syntax: '> A quote', snippet: { before: '> ', placeholder: 'Quote', block: true } },
  { label: 'Inline code', syntax: '`code`', snippet: { before: '`', after: '`', placeholder: 'code' } },
  {
    label: 'Code block',
    syntax: '```\nconst a = 1\n```',
    snippet: { before: '```\n', after: '\n```', placeholder: 'code', block: true },
  },
  {
    label: 'Table',
    syntax: '| Name | Age |\n| --- | --- |\n| Ada | 36 |',
    snippet: { before: '| Column | Column |\n| --- | --- |\n| ', after: ' |  |', placeholder: 'Cell', block: true },
  },
  { label: 'Divider', syntax: '---', snippet: { before: '---\n', placeholder: '', block: true } },
]
