import { tagElement } from './tagElement'
import { useTransitionClick } from './useTransitionClick'

// The clicked folder name glides into the page heading. The sidebar label is still on the
// new page, so the name moves from it to the heading instead of being on both.
export function useFolderClick() {
  const click = useTransitionClick()

  return (folderId: string) =>
    click(`/folder/${folderId}`, (link) => {
      let untagLabel: (() => void) | undefined
      return {
        types: ['folder'],
        before: () => (untagLabel = tagElement(link.querySelector('[data-folder-label]'), 'folder-title')),
        after: () => {
          untagLabel?.()
          return tagElement(document.querySelector('[data-page-title]'), 'folder-title')
        },
      }
    })
}
