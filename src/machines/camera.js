import { createMachine, assign } from 'xstate';

export default createMachine({
  context: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  initial: "resting",
  states: {
    resting: {
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
      },
    }
  }
});

function clamp(min, max, v) {
  return Math.max(min, Math.min(max, v))
}