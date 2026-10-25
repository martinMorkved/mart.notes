import { runViewTransition } from '@/features/transitions/runViewTransition'
import { tagElement } from '@/features/transitions/tagElement'
import { waitFor } from '@/features/transitions/waitFor'

const NAME = 'task-note-moving'

// A completed note that gets an open task again leaves the bottom of the page for its place
// among the active ones. The card glides there and the page scrolls along, so it isn't lost.
export function riseIntoPlace(noteId: string, update: () => void) {
  const selector = `[data-task-note="${noteId}"]`
  const inActive = () => {
    const card = document.querySelector<HTMLElement>(selector)
    return card && !card.closest('.task-completed') ? card : null
  }

  tagElement(document.querySelector(selector), NAME)
  let untag: (() => void) | undefined
  const transition = runViewTransition({
    types: ['task-note-up'],
    update: async () => {
      update()
      const card = await waitFor(inActive)
      card?.scrollIntoView({ block: 'center' })
      untag = tagElement(card, NAME)
    },
  })
  transition.finished.finally(() => untag?.())
}
