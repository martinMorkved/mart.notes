import { useNavigate } from 'react-router'
import { queryClient } from '@/lib/queryClient'
import { sessionQuery } from './authClient'

export function useEnterApp() {
  const navigate = useNavigate()

  return async () => {
    await queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey })
    navigate('/', { replace: true })
  }
}
