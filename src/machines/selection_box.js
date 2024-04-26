import { createMachine, assign } from 'xstate';

export default createMachine({
  context: {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  },
  initial: "idle",
  states: {
    'idle': {
    },
  }
});