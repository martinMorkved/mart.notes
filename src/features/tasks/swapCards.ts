import { runViewTransition } from '@/features/transitions/runViewTransition'
import { combine, tagElement } from '@/features/transitions/tagElement'

const NAMES = ['todo-moving', 'todo-swapped']
// How far out to the side each card swings, and how small it gets halfway, as parts of its
// width. Halfway they're half width side by side, so they pass without covering each other.
const SWING = 0.26
const SHRINK = 0.5
// Points along the curve; the browser draws straight lines between them
const STEPS = 24

type Frame = { x: number; y: number; width: number; height: number }

function frameOf(keyframe: Keyframe): Frame {
  const matrix = new DOMMatrixReadOnly(String(keyframe.transform))
  return { x: matrix.m41, y: matrix.m42, width: parseFloat(String(keyframe.width)), height: parseFloat(String(keyframe.height)) }
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const mix = (a: number, b: number, t: number) => a + (b - a) * t

// One card's way from its old place to its new one, bowing out to one side (-1 left, 1 right)
function curve(from: Frame, to: Frame, side: -1 | 1): Keyframe[] {
  return Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS
    const along = easeInOut(t)
    const out = Math.sin(Math.PI * t)
    const width = mix(from.width, to.width, along)
    const height = mix(from.height, to.height, along)
    const scale = 1 - SHRINK * out
    const x = mix(from.x, to.x, along) + (width * (1 - scale)) / 2 + side * SWING * width * out
    const y = mix(from.y, to.y, along) + (height * (1 - scale)) / 2
    return {
      offset: t,
      transform: `translate(${x}px, ${y}px)`,
      width: `${width * scale}px`,
      height: `${height * scale}px`,
    }
  })
}

// The browser moves each card in a straight line, so the two slide through each other. Instead
// they swing round each other: the one going down out to the right, the one going up out to the
// left, smaller halfway so there's room.
function choreograph() {
  for (const name of NAMES) {
    const effect = document
      .getAnimations()
      .map((a) => a.effect as KeyframeEffect | null)
      .find((e) => e?.pseudoElement === `::view-transition-group(${name})`)
    if (!effect) continue
    const frames = effect.getKeyframes()
    const from = frameOf(frames[0])
    const to = frameOf(frames[frames.length - 1])
    effect.setKeyframes(curve(from, to, to.y > from.y ? 1 : -1))
  }
}

// Two neighbouring cards trading places, from the arrow buttons
export function swapCards(moving: Element | null, swapped: Element | null, update: () => void) {
  const untag = combine(tagElement(moving, NAMES[0]), tagElement(swapped, NAMES[1]))
  const transition = runViewTransition({ types: ['todo-swap'], update })
  transition.ready.then(choreograph).catch(() => {})
  transition.finished.finally(untag)
}
