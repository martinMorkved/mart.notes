import { Link } from 'react-router'
import { Wordmark } from '@/ui/Wordmark'
import './errors.css'

type Props = { code: string; heading: string; text: string }

export function ErrorLayout({ code, heading, text }: Props) {
  return (
    <main className="error-page">
      <Wordmark />
      <div className="error-body">
        <p className="error-code">{code}</p>
        <h1>{heading}</h1>
        <p className="error-text">{text}</p>
        <Link className="button-primary" to="/">
          Go to your notes
        </Link>
      </div>
    </main>
  )
}
