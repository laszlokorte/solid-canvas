import { createMachine, assign } from 'xstate';

export default createMachine({
  context: {
    x: 0,
    y: 0,
    zoom: 1,
    anchorX: 0,
    anchorY: 0,
  },
  initial: "idle",
  states: {
    idle: {
      entry: [
        assign({
          anchorX: 0,
          anchorY: 0,
        })
      ],
      on: {
        'cam.reset': {
          actions: assign({
            x: 0,
            y: 0,
            zoom: 1,
            anchorX: 0,
            anchorY: 0,
          }),
        },
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
            anchorX: ({event: {x}}) => x,
            anchorY: ({event: {y}}) => y,
          })
        }
      },
    },
    panning: {
      entry: {
        actions: assign({
          anchorX: 0,
          anchorY: 0,
        })
      },
      on: {
        'cam.reset': {
          actions: assign({
            x: 0,
            y: 0,
            zoom: 1,
            anchorX: 0,
            anchorY: 0,
          }),
        },
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
          target: 'idle'
        },
        'camera.pan.move': {
          actions: assign({
            x: ({context: {x, anchorX}, event: {x: targetX}}) => x - targetX + anchorX,
            y: ({context: {y, anchorY}, event: {y: targetY}}) => y - targetY + anchorY,
          })
        }
      },
    }
  }
});

function clamp(min, max, v) {
  return Math.max(min, Math.min(max, v))
}