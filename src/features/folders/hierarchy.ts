import type { Folder } from '@shared/types'
import { positionBetween } from '@/lib/positions'

export const byPosition = <T extends { position: string }>(a: T, b: T) =>
  a.position < b.position ? -1 : a.position > b.position ? 1 : 0

export function childrenByParent(folders: Folder[]) {
  const map = new Map<string | null, Folder[]>()
  for (const folder of folders) {
    const list = map.get(folder.parentId) ?? []
    list.push(folder)
    map.set(folder.parentId, list)
  }
  for (const list of map.values()) list.sort(byPosition)
  return map
}

export function ancestorsOf(folders: Folder[], id: string) {
  const byId = new Map(folders.map((f) => [f.id, f]))
  const chain: Folder[] = []
  let current = byId.get(id)?.parentId
  while (current) {
    const folder = byId.get(current)
    if (!folder) break
    chain.unshift(folder)
    current = folder.parentId
  }
  return chain
}

export function subtreeIds(folders: Folder[], id: string) {
  const children = childrenByParent(folders)
  const ids = new Set<string>()
  const stack = [id]
  while (stack.length) {
    const next = stack.pop()!
    ids.add(next)
    for (const child of children.get(next) ?? []) stack.push(child.id)
  }
  return ids
}

// Where `folder` ends up when dropped next to or into `target` (null target: the top level)
export function placeFolder(
  folders: Folder[],
  folder: Folder,
  target: Folder | null,
  zone: 'before' | 'inside' | 'after',
) {
  const parentId = zone === 'inside' ? (target?.id ?? null) : (target?.parentId ?? null)
  const siblings = (childrenByParent(folders).get(parentId) ?? []).filter((f) => f.id !== folder.id)
  if (zone === 'inside' || !target) return { parentId, position: positionBetween(siblings.at(-1), undefined) }

  const i = siblings.findIndex((f) => f.id === target.id)
  const position =
    zone === 'before' ? positionBetween(siblings[i - 1], target) : positionBetween(target, siblings[i + 1])
  return { parentId, position }
}

// The whole tree in display order, each folder with its depth, leaving out `hidden` subtrees
export function flattenTree(folders: Folder[], hidden: Set<string> = new Set()) {
  const children = childrenByParent(folders)
  const rows: { folder: Folder; depth: number }[] = []
  const walk = (parentId: string | null, depth: number) => {
    for (const folder of children.get(parentId) ?? []) {
      if (hidden.has(folder.id)) continue
      rows.push({ folder, depth })
      walk(folder.id, depth + 1)
    }
  }
  walk(null, 0)
  return rows
}
