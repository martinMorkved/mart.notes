import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { AuthField } from './AuthField'
import { AuthMessage } from './AuthMessage'
import { AuthShell } from './AuthShell'
import { authClient } from './authClient'
import { authErrorMessage } from './authErrors'
import { FormError } from './FormError'
import { useFormSubmit } from './useFormSubmit'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [done, setDone] = useState(false)
  const { error, busy, onSubmit } = useFormSubmit(async (form) => {
    const { error } = await authClient.resetPassword({
      newPassword: String(form.get('password')),
      token: token!,
    })
    if (error) return authErrorMessage(error)
    setDone(true)
  })

  if (!token || params.get('error')) {
    return (
      <AuthMessage
        heading="Link expired"
        text="This link is no longer valid. Links work for one hour, and only once."
        action={{ label: 'Send a new link', to: '/forgot-password' }}
      />
    )
  }

  if (done) {
    return (
      <AuthMessage
        heading="Password changed"
        text="You've been signed out everywhere. Sign in with your new password."
        action={{ label: 'Sign in', to: '/sign-in' }}
      />
    )
  }

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>New password</h1>
        <AuthField
          label="New password"
          name="password"
          type="password"
          minLength={10}
          autoComplete="new-password"
          hint="At least 10 characters."
        />
        <FormError message={error} />
        <button className="button-primary" disabled={busy}>
          {busy ? 'Saving …' : 'Save password'}
        </button>
      </form>
    </AuthShell>
  )
}
