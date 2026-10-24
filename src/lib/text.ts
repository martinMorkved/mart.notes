export function plainExcerpt(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?(```|$)/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_, target, __, label) => label ?? target)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.)\s+(\[[ xX]\]\s+)?/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const dateYearFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function shortDate(iso: string) {
  const date = new Date(iso)
  return date.getFullYear() === new Date().getFullYear()
    ? dateFormat.format(date)
    : dateYearFormat.format(date)
}

export function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}
