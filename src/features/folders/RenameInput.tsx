import { useEffect, useRef } from 'react'

type Props = { initial: string; onDone: (name: string | null) => void }

export function RenameInput({ initial, onDone }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const done = useRef(false)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  function finish(name: string | null) {
    if (done.current) return
    done.current = true
    onDone(name?.trim() || null)
  }

  return (
    <input
      ref={ref}
      className="tree-rename"
      defaultValue={initial}
      aria-label="Folder name"
      maxLength={80}
      onBlur={(e) => finish(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') finish(e.currentTarget.value)
        if (e.key === 'Escape') finish(null)
      }}
    />
  )
}
