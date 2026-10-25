import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'

// A few pixels before a mouse drag starts, so a click is still a click
export function useDragSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // A long press, so a swipe still scrolls
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )
}
