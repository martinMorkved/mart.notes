import { useNavigate } from 'react-router'
import { queryClient } from '@/lib/queryClient'
import { authClient } from './authClient'

export function useSignOut() {
  const navigate = useNavigate()

  return async () => {
    await authClient.signOut()
    queryClient.clear()
    navigate('/sign-in', { replace: true })
  }
}
