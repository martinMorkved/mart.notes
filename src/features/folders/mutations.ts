import { useMutation } from '@tanstack/react-query'
import { generateKeyBetween } from 'fractional-indexing'
import type { Counts, Folder } from '@shared/types'
import { noteTitlesQuery } from '@/features/links/queries'
import { refreshAfterRestore, trashQuery } from '@/features/trash/queries'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import { plural } from '@/lib/text'
import { showToast } from '@/ui/toast'
import { foldersQuery } from './queries'
import { byPosition, subtreeIds } from './tree'

const foldersKey = foldersQuery.queryKey
const folderWrites = { id: 'folder-writes' }

function snapshotFolders() {
  return queryClient.getQueryData(foldersKey) ?? []
}

function restoreFolders(context?: { previous: Folder[] }) {
  if (context) queryClient.setQueryData(foldersKey, context.previous)
}

function deletedMessage(name: string, counts: Counts) {
  const inside = [
    counts.folders > 1 && plural(counts.folders - 1, 'folder'),
    counts.notes > 0 && plural(counts.notes, 'note'),
  ].filter(Boolean)
  return inside.length
    ? `Moved “${name}” and ${inside.join(' and ')} to trash`
    : `Moved “${name}” to trash`
}

function archivedMessage(name: string, counts: Counts) {
  return counts.notes > 0 ? `Archived “${name}” with ${plural(counts.notes, 'note')}` : `Archived “${name}”`
}

function unarchive(id: string) {
  return api<Counts>('POST', `/folders/${id}/unarchive`)
}

export function useCreateFolder() {
  return useMutation({
    scope: folderWrites,
    mutationFn: (input: { id: string; parentId: string | null; name: string }) =>
      api<Folder>('POST', '/folders', input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: foldersKey })
      const previous = snapshotFolders()
      const siblings = previous.filter((f) => f.parentId === input.parentId).sort(byPosition)
      const position = generateKeyBetween(siblings.at(-1)?.position ?? null, null)
      queryClient.setQueryData(foldersKey, [...previous, { ...input, position, archivedAt: null }])
      return { previous }
    },
    onError: (_error, _input, context) => restoreFolders(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: foldersKey }),
  })
}

export function useRenameFolder() {
  return useMutation({
    scope: folderWrites,
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api<Folder>('PATCH', `/folders/${id}`, { name }),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: foldersKey })
      const previous = snapshotFolders()
      queryClient.setQueryData(
        foldersKey,
        previous.map((f) => (f.id === id ? { ...f, name } : f)),
      )
      return { previous }
    },
    onError: (_error, _input, context) => restoreFolders(context),
    onSettled: () => queryClient.invalidateQueries({ queryKey: foldersKey }),
  })
}

export function useDeleteFolder() {
  return useMutation({
    scope: folderWrites,
    mutationFn: (folder: Folder) => api<Counts>('DELETE', `/folders/${folder.id}`),
    onMutate: async (folder) => {
      await queryClient.cancelQueries({ queryKey: foldersKey })
      const previous = snapshotFolders()
      const removed = subtreeIds(previous, folder.id)
      queryClient.setQueryData(
        foldersKey,
        previous.filter((f) => !removed.has(f.id)),
      )
      return { previous }
    },
    onSuccess: (counts, folder) => {
      showToast({
        message: deletedMessage(folder.name, counts),
        action: {
          label: 'Undo',
          run: () => api('POST', `/trash/folders/${folder.id}/restore`).then(refreshAfterRestore),
        },
      })
    },
    onError: (_error, _input, context) => restoreFolders(context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: foldersKey })
      queryClient.invalidateQueries({ queryKey: trashQuery.queryKey })
      queryClient.invalidateQueries({ queryKey: noteTitlesQuery.queryKey })
    },
  })
}

export function useArchiveFolder() {
  return useMutation({
    scope: folderWrites,
    mutationFn: (folder: Folder) => api<Counts>('POST', `/folders/${folder.id}/archive`),
    onMutate: async (folder) => {
      await queryClient.cancelQueries({ queryKey: foldersKey })
      const previous = snapshotFolders()
      const archived = subtreeIds(previous, folder.id)
      const archivedAt = new Date().toISOString()
      queryClient.setQueryData(
        foldersKey,
        previous.map((f) => (archived.has(f.id) && !f.archivedAt ? { ...f, archivedAt } : f)),
      )
      return { previous }
    },
    onSuccess: (counts, folder) => {
      showToast({
        message: archivedMessage(folder.name, counts),
        action: {
          label: 'Undo',
          run: () => unarchive(folder.id).then(() => queryClient.invalidateQueries({ queryKey: foldersKey })),
        },
      })
    },
    onError: (_error, _input, context) => {
      showToast({ message: 'Couldn’t archive the folder. Check your connection.' })
      restoreFolders(context)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: foldersKey }),
  })
}

// Brings back the folders archived together with this one, and leaves any archived on their own
export function useUnarchiveFolder() {
  return useMutation({
    scope: folderWrites,
    mutationFn: (folder: Folder) => unarchive(folder.id),
    onMutate: async (folder) => {
      await queryClient.cancelQueries({ queryKey: foldersKey })
      const previous = snapshotFolders()
      const inside = subtreeIds(previous, folder.id)
      queryClient.setQueryData(
        foldersKey,
        previous.map((f) =>
          inside.has(f.id) && f.archivedAt === folder.archivedAt ? { ...f, archivedAt: null } : f,
        ),
      )
      return { previous }
    },
    onSuccess: (_counts, folder) => showToast({ message: `“${folder.name}” is back in the tree` }),
    onError: (_error, _input, context) => {
      showToast({ message: 'Couldn’t unarchive the folder. Check your connection.' })
      restoreFolders(context)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: foldersKey }),
  })
}

export function useMoveFolder() {
  return useMutation({
    scope: folderWrites,
    mutationFn: ({ id, parentId, position }: { id: string; parentId: string | null; position: string }) =>
      api<Folder>('PATCH', `/folders/${id}/move`, { parentId, position }),
    onMutate: async ({ id, parentId, position }) => {
      await queryClient.cancelQueries({ queryKey: foldersKey })
      const previous = snapshotFolders()
      queryClient.setQueryData(
        foldersKey,
        previous.map((f) => (f.id === id ? { ...f, parentId, position } : f)),
      )
      return { previous }
    },
    onError: (_error, _input, context) => {
      showToast({ message: 'Couldn’t move the folder. Check your connection.' })
      restoreFolders(context)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: foldersKey }),
  })
}
