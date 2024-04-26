import { createMachine, assign } from 'xstate';

export default createMachine({
  context: {
    innerWidth: 1024,
    innerHeight: 1024,
    outerWidth: 1024,
    outerHeight: 1024,
    alignX: 'mid',
    alignY: 'mid',
    fitting: 'meet'
  },
  initial: "idle",
  states: {
    'idle': {
      on: {
        'viewport.resize.inner': {
          actions: assign({
            innerWidth: ({ context, event }) => event.width,
            innerHeight: ({ context, event }) => event.height,
          }),
        },
        'viewport.resize.outer': {
          actions: assign({
            outerWidth: ({ context, event }) => event.width,
            outerHeight: ({ context, event }) => event.height,
          }),
        },
        'viewport.fitting.set': {
          actions: assign({
            fitting: ({ context, event }) => event.fit,
          }),
        },
        'viewport.alignment.set': {
          actions: assign({
            alignX: ({ context, event }) => event.xAxis,
            alignY: ({ context, event }) => event.yAxis,
          }),
        },
      },
    },
  }
});