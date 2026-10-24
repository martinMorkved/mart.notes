// view-transition-name must be unique on the page, so elements get one only for the
// transition that needs it, and lose it again when the transition ends
export function tagElement(element: Element | null | undefined, name: string) {
  if (!(element instanceof HTMLElement)) return
  element.style.viewTransitionName = name
  return () => {
    element.style.viewTransitionName = ''
  }
}

export function combine(...cleanups: (void | (() => void))[]) {
  return () => cleanups.forEach((cleanup) => cleanup?.())
}
