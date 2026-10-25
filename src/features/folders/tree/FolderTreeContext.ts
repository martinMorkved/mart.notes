import { createContext, useContext } from 'react'
import type { Folder } from '@shared/types'
import type { useFolderActions } from './useFolderActions'

type FolderTreeState = {
  children: Map<string | null, Folder[]>
  expanded: Set<string>
  toggle: (id: string) => void
  activeFolderId: string | null
  actions: ReturnType<typeof useFolderActions>
}

export const FolderTreeContext = createContext<FolderTreeState | null>(null)

export function useFolderTree() {
  const state = useContext(FolderTreeContext)
  if (!state) throw new Error('useFolderTree must be used inside FolderTree')
  return state
}
