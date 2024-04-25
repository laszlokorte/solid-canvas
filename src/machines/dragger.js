import { createMachine, assign } from 'xstate';

export default ({x,y}) => createMachine({
  context: {
    x: x,
    y: y,
  },
  initial: "idle",
  states: {
    'idle': {
      on: {
        'dragger.grab': {
          target: "grabbed",
          actions: assign({
            offsetX: ({ context, event }) => event.x - context.x,
            offsetY: ({ context, event }) => event.y - context.y,
          }),
        },
      },
    },
    'grabbed': {
      on: {
        'dragger.move': {
          target: 'moving',
          actions: assign({
            offsetX: ({ context, event }) => event.x - context.x,
            offsetY: ({ context, event }) => event.y - context.y,
          }),
        },
        'dragger.release': {
          target: 'idle',
          actions: assign({
            offsetX: null,
            offsetY: null,
          }),
        },
      },
    },
    'moving': {
      on: {
        'dragger.move': {
          actions: assign({
            x: ({ context, event }) => event.x - context.offsetX,
            y: ({ context, event }) => event.y - context.offsetY,
          }),
        },
        'dragger.release': {
          target: 'idle',
          actions: assign({
            offsetX: null,
            offsetY: null,
          }),
        },
      },
    }
  }
});