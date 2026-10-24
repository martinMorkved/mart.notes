const WIKI_LINKS = /\[\[([^[\]|]+)(?:\|[^[\]]+)?\]\]/g

// Links point at a note by its title, matched without regard to case or surrounding spaces
export const titleKey = (title: string) => title.trim().toLowerCase()

export function linkTargets(markdown: string) {
  const keys = new Set<string>()
  for (const match of markdown.matchAll(WIKI_LINKS)) {
    const key = titleKey(match[1])
    if (key) keys.add(key)
  }
  return keys
}
