import { shortDate } from '@/lib/text'
import type { SaveState } from './useAutosave'

export function SaveStatus({ state, updatedAt }: { state: SaveState; updatedAt: string }) {
  if (state === 'error') {
    return (
      <span className="save-status" data-error role="status">
        Not saved
      </span>
    )
  }
  if (state === 'pending' || state === 'saving') {
    return (
      <span className="save-status" role="status">
        Saving …
      </span>
    )
  }
  return (
    <time className="save-status" dateTime={updatedAt}>
      Edited {shortDate(updatedAt)}
    </time>
  )
}
