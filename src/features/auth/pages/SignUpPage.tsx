import { useState } from 'react'
import { Link } from 'react-router'
import { authClient } from '../authClient'
import { authErrorMessage } from '../authErrors'
import { AuthField } from '../components/AuthField'
import { AuthShell } from '../components/AuthShell'
import { CheckInbox } from '../components/CheckInbox'
import { FormError } from '../components/FormError'
import { useFormSubmit } from '../useFormSubmit'

export function SignUpPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { error, busy, onSubmit } = useFormSubmit(async (form) => {
    const email = String(form.get('email'))
    const { error } = await authClient.signUp.email({
      email,
      password: String(form.get('password')),
      name: String(form.get('name')),
      callbackURL: '/',
    })
    if (error) return authErrorMessage(error)
    setSentTo(email)
  })

  if (sentTo) {
    return <CheckInbox email={sentTo} text="Your account is ready. Confirm it with the link we sent to" />
  }

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>New account</h1>
        <AuthField label="Name" name="name" autoComplete="name" />
        <AuthField label="Email" name="email" type="email" autoComplete="email" />
        <AuthField
          label="Password"
          name="password"
          type="password"
          minLength={10}
          autoComplete="new-password"
          hint="At least 10 characters."
        />
        <FormError message={error} />
        <button className="button-primary" disabled={busy}>
          {busy ? 'Creating account …' : 'Create account'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
