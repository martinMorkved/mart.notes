import { combine, tagElement } from './tagElement'

export function tagNoteCard(noteId: string) {
  const card = document.querySelector(`[data-note-card="${CSS.escape(noteId)}"]`)
  const title = card?.querySelector('[data-note-card-title]')
  if (!card || !title) return
  return combine(tagElement(card, 'note-card'), tagElement(title, 'note-title'))
}
