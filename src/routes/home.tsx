import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authClient, sessionQuery } from '../lib/auth'
import { queryClient } from '../lib/query'

export function Home() {
  const navigate = useNavigate()
  const { data: session } = useQuery(sessionQuery)

  async function signOut() {
    await authClient.signOut()
    queryClient.clear()
    navigate('/sign-in', { replace: true })
  }

  return (
    <main className="placeholder">
      <p className="wordmark">
        mart<span>.notes</span>
      </p>
      <p>
        Signed in as <strong>{session?.user.name}</strong> ({session?.user.email})
      </p>
      <button className="button-quiet" onClick={signOut}>
        Sign out
      </button>
    </main>
  )
}
