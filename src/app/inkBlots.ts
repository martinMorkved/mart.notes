// Six ink blots for the theme change. The first starts at the click and is the one that
// finally covers the screen; the others land at random and grow faster or slower.
const BLOTS = 6
const SOFT_EDGE = 32

export function placeInkBlots(root: HTMLElement, x: number, y: number) {
  const w = innerWidth
  const h = innerHeight
  const cover = Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + SOFT_EDGE
  const diagonal = Math.hypot(w, h)

  for (let i = 1; i <= BLOTS; i++) {
    const first = i === 1
    const bx = first ? x : Math.random() * w
    const by = first ? y : Math.random() * h
    const radius = first ? cover : diagonal * (0.18 + Math.random() * 0.3)
    const duration = first ? 1800 : 900 + Math.random() * 700
    const delay = first ? 0 : 100 + Math.random() * 550

    root.style.setProperty(`--blot-${i}-x`, `${bx}px`)
    root.style.setProperty(`--blot-${i}-y`, `${by}px`)
    root.style.setProperty(`--blot-${i}-r`, `${radius}px`)
    root.style.setProperty(`--blot-${i}-time`, `${duration}ms`)
    root.style.setProperty(`--blot-${i}-delay`, `${delay}ms`)
  }

  return () => {
    for (let i = 1; i <= BLOTS; i++) {
      for (const part of ['x', 'y', 'r', 'time', 'delay']) root.style.removeProperty(`--blot-${i}-${part}`)
    }
  }
}
