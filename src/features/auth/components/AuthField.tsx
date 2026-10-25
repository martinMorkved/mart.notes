import type { ComponentProps } from 'react'

type Props = { label: string; hint?: string } & ComponentProps<'input'>

export function AuthField({ label, hint, ...input }: Props) {
  return (
    <label className="field">
      <span>{label}</span>
      <input required {...input} />
      {hint && <small>{hint}</small>}
    </label>
  )
}
