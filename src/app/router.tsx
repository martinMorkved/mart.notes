import { createBrowserRouter } from 'react-router'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage'
import { SignInPage } from '@/features/auth/SignInPage'
import { SignUpPage } from '@/features/auth/SignUpPage'
import { EmptyHome } from '@/features/folders/EmptyHome'
import { FolderView } from '@/features/folders/FolderView'
import { TasksView } from '@/features/tasks/TasksView'
import { TrashView } from '@/features/trash/TrashView'
import { AppLayout } from './AppLayout'
import { NotFound } from './errors/NotFound'
import { RouteError } from './errors/RouteError'
import { RootRoute } from './RootRoute'
import {
  loadFolder,
  loadNote,
  loadTasks,
  loadTrash,
  openFirstFolder,
  redirectIfSignedIn,
  requireSession,
} from './loaders'

export const router = createBrowserRouter([
  {
    element: <RootRoute />,
    errorElement: <RouteError />,
    children: [
      { path: '/sign-in', loader: redirectIfSignedIn, element: <SignInPage /> },
      { path: '/sign-up', loader: redirectIfSignedIn, element: <SignUpPage /> },
      { path: '/forgot-password', loader: redirectIfSignedIn, element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      {
        loader: requireSession,
        element: <AppLayout />,
        children: [
          {
            errorElement: <RouteError />,
            children: [
              { index: true, loader: openFirstFolder, element: <EmptyHome /> },
              { path: '/folder/:id', loader: loadFolder, element: <FolderView /> },
              {
                path: '/note/:id',
                loader: loadNote,
                lazy: () => import('@/features/notes/NoteView').then((m) => ({ Component: m.NoteView })),
              },
              { path: '/todo', loader: loadTasks, element: <TasksView /> },
              { path: '/trash', loader: loadTrash, element: <TrashView /> },
              { path: '*', element: <NotFound /> },
            ],
          },
        ],
      },
    ],
  },
])
