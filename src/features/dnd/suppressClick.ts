// Cards and folders are links, and letting go after a drag still counts as a click on them.
// The click that follows a drop is swallowed so it doesn't open what was just moved.
export function suppressNextClick() {
  const swallow = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }
  window.addEventListener('click', swallow, { capture: true, once: true })
  // A drop outside any link gives no click, so the listener mustn't wait for the next real one
  setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0)
}
