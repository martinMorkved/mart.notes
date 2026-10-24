import { generateKeyBetween } from 'fractional-indexing'

type Positioned = { position: string }

// A sort key between two neighbours; either side may be missing at the ends of a list
export function positionBetween(before?: Positioned, after?: Positioned) {
  const a = before?.position ?? null
  const b = after?.position ?? null
  // Two neighbours can share a key (a restore from trash, say), and there's nothing between those
  if (a !== null && b !== null && a >= b) return generateKeyBetween(a, null)
  return generateKeyBetween(a, b)
}

// The key for an item dropped at `index` in `list`, a sorted list that doesn't include it
export const positionAt = (list: Positioned[], index: number) => positionBetween(list[index - 1], list[index])
