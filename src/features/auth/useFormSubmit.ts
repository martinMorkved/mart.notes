import { useState, type FormEvent } from 'react'

export function useFormSubmit(action: (form: FormData) => Promise<string | null | void>) {
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
