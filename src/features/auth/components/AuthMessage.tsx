import { Link } from 'react-router'
import { AuthShell } from './AuthShell'

type Props = {
  heading: string
  text: string
  action: { label: string; to: string }
}

export function AuthMessage({ heading, text, action }: Props) {
  return (
    <AuthShell>
      <div className="auth-form">
        <h1>{heading}</h1>
        <p className="auth-lead">{text}</p>
        <Link className="button-primary" to={action.to}>
          {action.label}
        </Link>
      </div>
    </AuthShell>
  )
}
