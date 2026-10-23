import { createBrowserRouter, redirect } from 'react-router'
import { sessionQuery } from './lib/auth'
import { queryClient } from './lib/query'
import { ForgotPassword, ResetPassword, SignIn, SignUp } from './routes/auth'
import { NotFound, RouteError } from './routes/error'
import { Home } from './routes/home'

async function requireSession() {
  const session = await queryClient.ensureQueryData(sessionQuery)
  if (!session) throw redirect('/sign-in')
  return null
}

async function redirectIfSignedIn() {
  const session = await queryClient.ensureQueryData(sessionQuery)
  if (session) throw redirect('/')
  return null
}

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      { path: '/sign-in', loader: redirectIfSignedIn, element: <SignIn /> },
      { path: '/sign-up', loader: redirectIfSignedIn, element: <SignUp /> },
      { path: '/forgot-password', loader: redirectIfSignedIn, element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/', loader: requireSession, element: <Home /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
