import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Folder } from '@shared/types'
import { useArchive } from '@/features/archive/useArchive'
import { placeFolder, subtreeIds } from '../hierarchy'
import { useCreateFolder, useDeleteFolder, useMoveFolder, useRenameFolder } from '../mutations'

type Options = {
  folders: Folder[]
  activeFolderId: string | null
  onExpand: (id: string) => void
}

export function useFolderActions({ folders, activeFolderId, onExpand }: Options) {
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState<string | null>(null)
  // the folder whose "Move to…" picker is open
  const [moving, setMoving] = useState<Folder | null>(null)
  const createFolder = useCreateFolder()
  const renameFolder = useRenameFolder()
  const deleteFolder = useDeleteFolder()
  const archive = useArchive()
  const moveFolder = useMoveFolder()

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

  // Into the picked folder, after what's already there, or to the top level
  function moveInto(folder: Folder, target: Folder | null) {
    setMoving(null)
    if (target && target.id !== folder.parentId) onExpand(target.id)
    moveFolder.mutate({ id: folder.id, ...placeFolder(folders, folder, target, 'inside') })
  }

  return {
    editingId,
    startRename: setEditingId,
    finishRename,
    create,
    remove,
    // Stays on an archived folder that's open, which then says it's archived
    archive: archive.fromMenu,
    moving,
    startMove: setMoving,
    moveInto,
  }
}
