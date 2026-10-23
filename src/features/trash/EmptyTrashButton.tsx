import { useState } from 'react'
import { usePurge } from './mutations'

export function EmptyTrashButton() {
  const purge = usePurge()
  const [confirming, setConfirming] = useState(false)

  function onClick() {
    if (!confirming) return setConfirming(true)
    purge.mutate('all')
    setConfirming(false)
  }

  return (
    <button
      className="button-quiet"
      data-danger={confirming || undefined}
      onBlur={() => setConfirming(false)}
      onClick={onClick}
    >
      {confirming ? 'Click again to delete everything' : 'Empty trash'}
    </button>
  )
}
