import type { TaskList } from './tasks'

export type Folder = {
  id: string
  parentId: string | null
  name: string
  position: string
}

export type NoteSummary = {
  id: string
  folderId: string
  title: string
  excerpt: string
  position: string
  updatedAt: string
}

export type Note = {
  id: string
  folderId: string
  title: string
  content: string
  position: string
  createdAt: string
  updatedAt: string
}

export type TrashedFolder = {
  id: string
  name: string
  parentName: string | null
  deletedAt: string
}

export type TrashedNote = {
  id: string
  title: string
  folderName: string
  deletedAt: string
}

export type Trash = {
  folders: TrashedFolder[]
  notes: TrashedNote[]
}

export type Counts = {
  folders: number
  notes: number
}

// title and snippet have their hits wrapped in ⟦ ⟧
export type SearchResult = {
  id: string
  folderId: string
  folderName: string
  title: string
  snippet: string
  updatedAt: string
}

export type NoteTitle = {
  id: string
  title: string
  folderId: string
}

export type Backlink = {
  id: string
  title: string
  folderName: string
}

export type NoteTasks = {
  noteId: string
  title: string
  folderId: string
  position: string
  lists: TaskList[]
}
