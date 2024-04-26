import { createMachine, assign } from 'xstate';

export default createMachine({
  context: {
    polygon: [],
  },
  initial: "idle",
  states: {
    'idle': {
    },
  }
});