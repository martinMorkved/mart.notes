import { redirect, type LoaderFunctionArgs } from 'react-router'
import { sessionQuery } from '@/features/auth/authClient'
import { childrenByParent } from '@/features/folders/hierarchy'
import { foldersQuery } from '@/features/folders/queries'
import { folderNotesQuery, noteQuery } from '@/features/notes/queries'
import { tasksQuery } from '@/features/tasks/queries'
import { trashQuery } from '@/features/trash/queries'
import { HttpError, queryClient } from '@/lib/queryClient'

const notFound = () => new Response(null, { status: 404 })

export async function requireSession() {
  const session = await queryClient.ensureQueryData(sessionQuery)
  if (!session) throw redirect('/sign-in')
  await queryClient.ensureQueryData(foldersQuery)
  return null
}

export async function redirectIfSignedIn() {
  const session = await queryClient.ensureQueryData(sessionQuery)
  if (session) throw redirect('/')
  return null
}

export async function openFirstFolder() {
  const folders = await queryClient.ensureQueryData(foldersQuery)
  const first = childrenByParent(folders.filter((f) => !f.archivedAt)).get(null)?.[0]
  if (first) throw redirect(`/folder/${first.id}`)
  return null
}

export async function loadFolder({ params }: LoaderFunctionArgs) {
  const folders = await queryClient.ensureQueryData(foldersQuery)
  if (!folders.some((f) => f.id === params.id)) throw notFound()
  await queryClient.ensureQueryData(folderNotesQuery(params.id!))
  return null
}

export async function loadNote({ params }: LoaderFunctionArgs) {
  try {
    await queryClient.ensureQueryData(noteQuery(params.id!))
  } catch (error) {
    if (error instanceof HttpError && (error.status === 404 || error.status === 400)) throw notFound()
    throw error
  }
  return null
}

export async function loadTrash() {
  await queryClient.ensureQueryData(trashQuery)
  return null
}

export async function loadTasks() {
  await queryClient.ensureQueryData(tasksQuery)
  return null
}
