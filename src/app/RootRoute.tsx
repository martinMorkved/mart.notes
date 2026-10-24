import { Outlet } from 'react-router'
import { CommitSignal } from '@/features/transitions/CommitSignal'

export function RootRoute() {
  return (
    <>
      <CommitSignal />
      <Outlet />
    </>
  )
}
