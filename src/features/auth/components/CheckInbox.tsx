import { Link } from 'react-router'
import { AuthShell } from './AuthShell'

export function CheckInbox({ email, text }: { email: string; text: string }) {
  return (
    <AuthShell>
      <div className="auth-form">
        <h1>Check your inbox</h1>
        <p className="auth-lead">
          {text} <strong>{email}</strong>.
        </p>
        <p className="auth-switch">
          Nothing there? Look in the spam folder, or <Link to="/sign-in">go back to sign in</Link>.
        </p>
      </div>
    </AuthShell>
  )
}
