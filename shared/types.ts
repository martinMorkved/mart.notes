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
