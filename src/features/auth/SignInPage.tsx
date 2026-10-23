import { useState } from 'react'
import { Link } from 'react-router'
import { AuthField } from './AuthField'
import { AuthShell } from './AuthShell'
import { authClient } from './authClient'
import { authErrorMessage } from './authErrors'
import { CheckInbox } from './CheckInbox'
import { FormError } from './FormError'
import { useEnterApp } from './useEnterApp'
import { useFormSubmit } from './useFormSubmit'

export function SignInPage() {
  const enterApp = useEnterApp()
  const [unverified, setUnverified] = useState<string | null>(null)
  const { error, busy, onSubmit } = useFormSubmit(async (form) => {
    const email = String(form.get('email'))
    const { error } = await authClient.signIn.email({
      email,
      password: String(form.get('password')),
      callbackURL: '/',
    })
    if (error?.code === 'EMAIL_NOT_VERIFIED') return void setUnverified(email)
    if (error) return authErrorMessage(error)
    await enterApp()
  })

  if (unverified) {
    return (
      <CheckInbox
        email={unverified}
        text="You need to confirm your email before signing in. We sent a new link to"
      />
    )
  }

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        <AuthField label="Email" name="email" type="email" autoComplete="email" />
        <AuthField label="Password" name="password" type="password" autoComplete="current-password" />
        <FormError message={error} />
        <div className="auth-actions">
          <button className="button-primary" disabled={busy}>
            {busy ? 'Signing in …' : 'Sign in'}
          </button>
          <Link className="auth-aside" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <p className="auth-switch">
          No account yet? <Link to="/sign-up">Sign up</Link>
        </p>
      </form>
    </AuthShell>
  )
}
