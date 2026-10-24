// A link to a note is stored as a plain markdown link to its page, [Title](/note/<id>), so it
// keeps pointing at the right note whatever it's called later. [[Title]] still works as a
// fallback, matched by title, for links typed by hand in the markdown view.

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

export const NOTE_LINK = new RegExp(`^\\[([^\\]\\n]*)\\]\\(/note/(${UUID})\\)`)
export const TITLE_LINK = /^\[\[([^[\]|\n]+)(?:\|([^[\]\n]+))?\]\]/

const NOTE_LINKS = new RegExp(`\\]\\(/note/(${UUID})\\)`, 'g')
const TITLE_LINKS = new RegExp(TITLE_LINK.source.slice(1), 'g')

// Title links match without regard to case or surrounding spaces
export const titleKey = (title: string) => title.trim().toLowerCase()

export function linkTargets(markdown: string) {
  const ids = new Set<string>()
  const titles = new Set<string>()
  for (const match of markdown.matchAll(NOTE_LINKS)) ids.add(match[1])
  for (const match of markdown.matchAll(TITLE_LINKS)) {
    const key = titleKey(match[1])
    if (key) titles.add(key)
  }
  return { ids: [...ids], titles: [...titles] }
}

// Brackets would end the link text early, so they're left out of it
export const noteLinkMarkdown = (id: string, label: string) =>
  `[${label.replace(/[[\]\n]/g, '')}](/note/${id})`
