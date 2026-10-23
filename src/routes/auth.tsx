import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { authClient, authErrorMessage, sessionQuery } from '../lib/auth'
import { queryClient } from '../lib/query'
import '../styles/auth.css'

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth">
      <div className="auth-mark">
        <p className="wordmark">
          mart<span>.notes</span>
        </p>
        <p className="auth-tagline">Notes, kept in folders.</p>
      </div>
      <div className="auth-panel">{children}</div>
    </main>
  )
}

function useSubmit(action: (form: FormData) => Promise<string | null | void>) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const message = await action(new FormData(event.currentTarget))
    setBusy(false)
    if (message) setError(message)
  }

  return { error, busy, onSubmit }
}

function Field({ label, hint, ...input }: { label: string; hint?: string } & React.ComponentProps<'input'>) {
  return (
    <label className="field">
      <span>{label}</span>
      <input required {...input} />
      {hint && <small>{hint}</small>}
    </label>
  )
}

function ErrorLine({ children }: { children: ReactNode }) {
  return (
    <p className="auth-error" role="alert">
      {children}
    </p>
  )
}

function CheckInbox({ email, text }: { email: string; text: string }) {
  return (
    <div className="auth-form">
      <h1>Check your inbox</h1>
      <p className="auth-lead">
        {text} <strong>{email}</strong>.
      </p>
      <p className="auth-switch">
        Nothing there? Look in the spam folder, or <Link to="/sign-in">go back to sign in</Link>.
      </p>
    </div>
  )
}

async function enterApp(navigate: ReturnType<typeof useNavigate>) {
  await queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey })
  navigate('/', { replace: true })
}

export function SignIn() {
  const navigate = useNavigate()
  const [unverified, setUnverified] = useState<string | null>(null)
  const { error, busy, onSubmit } = useSubmit(async (form) => {
    const email = String(form.get('email'))
    const { error } = await authClient.signIn.email({
      email,
      password: String(form.get('password')),
      callbackURL: '/',
    })
    if (error?.code === 'EMAIL_NOT_VERIFIED') return void setUnverified(email)
    if (error) return authErrorMessage(error)
    await enterApp(navigate)
  })

  if (unverified) {
    return (
      <AuthShell>
        <CheckInbox
          email={unverified}
          text="You need to confirm your email before signing in. We sent a new link to"
        />
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete="current-password" />
        <ErrorLine>{error}</ErrorLine>
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

export function SignUp() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { error, busy, onSubmit } = useSubmit(async (form) => {
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
    return (
      <AuthShell>
        <CheckInbox email={sentTo} text="Your account is ready. Confirm it with the link we sent to" />
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>New account</h1>
        <Field label="Name" name="name" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          minLength={10}
          autoComplete="new-password"
          hint="At least 10 characters."
        />
        <ErrorLine>{error}</ErrorLine>
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

export function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { error, busy, onSubmit } = useSubmit(async (form) => {
    const email = String(form.get('email'))
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' })
    if (error) return authErrorMessage(error)
    setSentTo(email)
  })

  if (sentTo) {
    return (
      <AuthShell>
        <CheckInbox email={sentTo} text="If there's an account, we sent a link for a new password to" />
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Forgot password</h1>
        <p className="auth-lead">Enter your email and we'll send you a link to choose a new password.</p>
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <ErrorLine>{error}</ErrorLine>
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

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [done, setDone] = useState(false)
  const { error, busy, onSubmit } = useSubmit(async (form) => {
    const { error } = await authClient.resetPassword({
      newPassword: String(form.get('password')),
      token: token!,
    })
    if (error) return authErrorMessage(error)
    setDone(true)
  })

  if (!token || params.get('error')) {
    return (
      <AuthShell>
        <div className="auth-form">
          <h1>Link expired</h1>
          <p className="auth-lead">This link is no longer valid. Links work for one hour, and only once.</p>
          <Link className="button-primary" to="/forgot-password">
            Send a new link
          </Link>
        </div>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell>
        <div className="auth-form">
          <h1>Password changed</h1>
          <p className="auth-lead">You've been signed out everywhere. Sign in with your new password.</p>
          <Link className="button-primary" to="/sign-in">
            Sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>New password</h1>
        <Field
          label="New password"
          name="password"
          type="password"
          minLength={10}
          autoComplete="new-password"
          hint="At least 10 characters."
        />
        <ErrorLine>{error}</ErrorLine>
        <button className="button-primary" disabled={busy}>
          {busy ? 'Saving …' : 'Save password'}
        </button>
      </form>
    </AuthShell>
  )
}
