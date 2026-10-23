import type { Folder } from '@shared/types'

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
