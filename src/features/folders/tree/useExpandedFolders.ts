import { useEffect, useState } from 'react'
import type { Folder } from '@shared/types'
import { ancestorsOf } from '../hierarchy'

const STORAGE_KEY = 'expanded-folders'

function load() {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
  } catch {
    return new Set<string>()
  }
}

export function useExpandedFolders(folders: Folder[], activeFolderId: string | null) {
  const [expanded, setExpanded] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]))
    } catch {}
  }, [expanded])

  useEffect(() => {
    if (!activeFolderId) return
    const chain = ancestorsOf(folders, activeFolderId)
    if (chain.every((f) => expanded.has(f.id))) return
    setExpanded((prev) => new Set([...prev, ...chain.map((f) => f.id)]))
  }, [activeFolderId, folders, expanded])

  function toggle(id: string, open?: boolean) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (open ?? !next.has(id)) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return { expanded, toggle }
}
