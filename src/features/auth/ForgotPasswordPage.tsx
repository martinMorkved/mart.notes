import { useState } from 'react'
import { Link } from 'react-router'
import { AuthField } from './AuthField'
import { AuthShell } from './AuthShell'
import { authClient } from './authClient'
import { authErrorMessage } from './authErrors'
import { CheckInbox } from './CheckInbox'
import { FormError } from './FormError'
import { useFormSubmit } from './useFormSubmit'

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { error, busy, onSubmit } = useFormSubmit(async (form) => {
    const email = String(form.get('email'))
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' })
    if (error) return authErrorMessage(error)
    setSentTo(email)
  })

  if (sentTo) {
    return <CheckInbox email={sentTo} text="If there's an account, we sent a link for a new password to" />
  }

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Forgot password</h1>
        <p className="auth-lead">Enter your email and we'll send you a link to choose a new password.</p>
        <AuthField label="Email" name="email" type="email" autoComplete="email" />
        <FormError message={error} />
        <button className="button-primary" disabled={busy}>
          {busy ? 'Sending …' : 'Send link'}
        </button>
        <p className="auth-switch">
          Remembered it? <Link to="/sign-in">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
