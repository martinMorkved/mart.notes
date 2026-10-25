import { useQuery } from '@tanstack/react-query'
import { sessionQuery } from '../authClient'
import { useSignOut } from '../useSignOut'

export function AccountMenu() {
  const { data: session } = useQuery(sessionQuery)
  const signOut = useSignOut()

  return (
    <div className="sidebar-account">
      <span title={session?.user.email}>{session?.user.name}</span>
      <button className="button-quiet" onClick={signOut}>
        Sign out
      </button>
    </div>
  )
}
