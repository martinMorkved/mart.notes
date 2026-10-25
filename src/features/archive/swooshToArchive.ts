import { runViewTransition } from '@/features/transitions/runViewTransition'
import { tagElement } from '@/features/transitions/tagElement'
import { waitFor } from '@/features/transitions/waitFor'
import './archive.css'

const NAME = 'archiving-folder'

// The folder's row, with whatever is open below it, shrinks into the Archive link in the
// sidebar. The link holds an empty target where the icon is, so the row has somewhere to land
// without the link itself fading in and out. The icon bumps once it has arrived.
export function swooshToArchive(folderId: string, update: () => void) {
  const row = () => document.querySelector(`[data-tree-folder="${folderId}"]`)
  const target = document.querySelector('[data-archive-target]')
  if (!target) return update()

  const untagRow = tagElement(row(), NAME)
  let untagTarget: (() => void) | undefined
  const transition = runViewTransition({
    types: ['archive-folder'],
    update: async () => {
      untagRow?.()
      update()
      await waitFor(() => (row() ? null : true))
      untagTarget = tagElement(target, NAME)
    },
  })
  transition.finished.finally(() => {
    untagTarget?.()
    bumpArchiveLink()
  })
}

export function bumpArchiveLink() {
  const link = document.querySelector<HTMLElement>('[data-archive-link]')
  if (!link || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  link.dataset.received = ''
  link.addEventListener('animationend', () => delete link.dataset.received, { once: true })
}
