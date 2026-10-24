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
        <h1 data-page-title>{title}</h1>
        {action}
      </div>
      {children && (
        <p className="page-subtitle" data-page-subtitle>
          {children}
        </p>
      )}
    </header>
  )
}
