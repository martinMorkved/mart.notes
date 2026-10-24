const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)

const macSymbols: Record<string, string> = { Mod: '⌘', Shift: '⇧', Alt: '⌥' }

// "Mod-Shift-8" → "Ctrl+Shift+8" or "⌘⇧8"
export function formatKeys(combo: string) {
  const parts = combo.split('-').map((part) => (part.length === 1 ? part.toUpperCase() : part))
  if (isMac) return parts.map((part) => macSymbols[part] ?? part).join('')
  return parts.map((part) => (part === 'Mod' ? 'Ctrl' : part)).join('+')
}

export function matchesKeys(event: KeyboardEvent, combo: string) {
  const parts = combo.split('-')
  const key = parts.at(-1)!.toLowerCase()
  return (
    (event.ctrlKey || event.metaKey) === parts.includes('Mod') &&
    event.shiftKey === parts.includes('Shift') &&
    event.altKey === parts.includes('Alt') &&
    event.key.toLowerCase() === key
  )
}
