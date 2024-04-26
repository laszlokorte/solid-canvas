import { createMachine, assign } from 'xstate';

export default ({x,y}) => createMachine({
  context: {
    x: x,
    y: y,
  },
  initial: "idle",
  states: {
    'idle': {
      entry: [
        assign({
          prevX: null,
          prevY: null,
        })
      ],
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
            prevX: ({ context, event }) => context.x,
            prevY: ({ context, event }) => context.y,
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
        'dragger.cancel': {
          target: 'idle',
          actions: assign({
            offsetX: null,
            offsetY: null,
            x: ({ context, event }) => context.prevX,
            y: ({ context, event }) => context.prevY,
          }),
        },
      },
    }
  }
});