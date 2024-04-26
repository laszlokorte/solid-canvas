import { createMachine, assign, enqueueActions } from 'xstate';
import draggerMachine  from './dragger';

export default createMachine({
  context: {
    idSequence: 0,
    items: [],
  },
  initial: "idle",
  states: {
    'idle': {
      on: {
        'draggers.create': {
          actions: assign({
            idSequence: ({context: {idSequence}}) => idSequence + 1,
            items: ({context: {idSequence, items}, spawn }) => [...items, {
              id: idSequence,
              ref: spawn(draggerMachine(randomXY(idSequence)), {id: `dragger-${idSequence}`}),
            }]
          })
        },
        'draggers.clear': {
          actions: [
            assign({
              items: []
            }),
            enqueueActions(({ context, enqueue }) => {
              return context.items.map((item) => {
                return enqueue.stopChild(item.ref);
              });
            })
          ]
        },
        'draggers.cancel': {
          actions: [
            enqueueActions(({ context, enqueue }) => {
              return context.items.map((item) => {
                return enqueue.sendTo(item.ref, {type: 'dragger.cancel'})
              });
            }),
          ]
        },
      },
    },
  }
});

function randomXY(seed) {
  return {
    x:25*Math.cos(seed)*(10+6*Math.sin(3700*Math.sin(100*seed))), 
    y:25*Math.sin(seed)*(10+6*Math.sin(3700*Math.sin(100*seed)))
  }
}