import type { ReactNode } from 'react'
import { Wordmark } from '@/ui/Wordmark'
import './auth.css'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth">
      <div className="auth-mark">
        <Wordmark />
        <p className="auth-tagline">Notes, kept in folders.</p>
      </div>
      <div className="auth-panel">{children}</div>
    </main>
  )
}
