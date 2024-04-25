import { createMachine, assign } from 'xstate';

export default createMachine({
  context: {
    x: 0,
    y: 0,
    zoom: 1,
    pivotX: 0,
    pivotY: 0,
  },
  initial: "resting",
  states: {
    resting: {
      entry: {
        actions: assign({
          pivotX: 0,
          pivotY: 0,
        })
      },
      on: {
        'cam.zoom.in': {
          actions: assign({
            zoom: ({ context }) => context.zoom + 1,
          }),
        },
        'cam.zoom.out': {
          actions: assign({
            zoom: ({ context }) => context.zoom - 1,
          }),
        },
        'cam.zoom.to': {
          actions: assign({
            zoom: ({ event }) => event.target,
          }),
        },
        'cam.zoom.by': {
          actions: assign({
            zoom: ({ context, event }) => clamp(1,10, context.zoom + event.delta),
          }),
        },
        'camera.pan.grab': {
          target: 'panning',
          actions: assign({
            pivotX: ({event: {x}}) => x,
            pivotY: ({event: {y}}) => y,
          })
        }
      },
    },
    panning: {
      on: {
        'cam.zoom.in': {
          actions: assign({
            zoom: ({ context }) => context.zoom + 1,
          }),
        },
        'cam.zoom.out': {
          actions: assign({
            zoom: ({ context }) => context.zoom - 1,
          }),
        },
        'cam.zoom.to': {
          actions: assign({
            zoom: ({ event }) => event.target,
          }),
        },
        'cam.zoom.by': {
          actions: assign({
            zoom: ({ context, event }) => clamp(1,10, context.zoom + event.delta),
          }),
        },
        'camera.pan.release': {
          target: 'resting'
        },
        'camera.pan.move': {
          actions: assign({
            x: ({context: {x, pivotX}, event: {x: targetX}}) => x - targetX + pivotX,
            y: ({context: {y, pivotY}, event: {y: targetY}}) => y - targetY + pivotY,
          })
        }
      },
    }
  }
});

function clamp(min, max, v) {
  return Math.max(min, Math.min(max, v))
}