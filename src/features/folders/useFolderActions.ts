import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Folder } from '@shared/types'
import { useCreateFolder, useDeleteFolder, useRenameFolder } from './mutations'
import { subtreeIds } from './tree'

type Options = {
  folders: Folder[]
  activeFolderId: string | null
  onExpand: (id: string) => void
}

export function useFolderActions({ folders, activeFolderId, onExpand }: Options) {
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState<string | null>(null)
  const createFolder = useCreateFolder()
  const renameFolder = useRenameFolder()
  const deleteFolder = useDeleteFolder()

  function create(parentId: string | null) {
    const id = crypto.randomUUID()
    if (parentId) onExpand(parentId)
    createFolder.mutate({ id, parentId, name: 'New folder' })
    setEditingId(id)
  }

  function finishRename(folder: Folder, name: string | null) {
    setEditingId(null)
    if (name && name !== folder.name) renameFolder.mutate({ id: folder.id, name })
  }

  function remove(folder: Folder) {
    if (activeFolderId && subtreeIds(folders, folder.id).has(activeFolderId)) {
      navigate(folder.parentId ? `/folder/${folder.parentId}` : '/', { replace: true })
    }
    deleteFolder.mutate(folder)
  }

  return { editingId, startRename: setEditingId, finishRename, create, remove }
}
