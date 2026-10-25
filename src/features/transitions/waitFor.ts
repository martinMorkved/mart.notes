// The query cache passes its updates on a little later, so a transition waits for the change
// to show up in the DOM. Timers rather than frames: a view transition holds rendering meanwhile.
export async function waitFor<T>(find: () => T | null, tries = 40): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    const found = find()
    if (found) return found
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  return null
}
