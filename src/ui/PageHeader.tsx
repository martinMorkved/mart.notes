import type { ReactNode } from 'react'

type Props = {
  title: string
  above?: ReactNode
  action?: ReactNode
  children?: ReactNode
}

export function PageHeader({ title, above, action, children }: Props) {
  return (
    <header className="page-header">
      {above}
      <div className="page-title-row">
        <h1>{title}</h1>
        {action}
      </div>
      {children && <p className="page-subtitle">{children}</p>}
    </header>
  )
}
