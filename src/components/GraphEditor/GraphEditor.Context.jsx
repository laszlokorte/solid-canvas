import { createSignal, createContext, useContext } from "solid-js";
import { fromActorRef } from '@xstate/solid';

const CameraContext = createContext();

export function CameraProvider(props) {
  const camera = fromActorRef(props.cameraRef)

  const value = [
    camera,
    {
      camToWorld: ({x,y}) => {
        return {
          x: x / camera().context.zoom + camera().context.x,
          y: y / camera().context.zoom + camera().context.y,
        }
      },
      worldToCam: ({x,y}) => {
        return {
          x: (x - camera().context.x) * camera().context.zoom,
          y: (y - camera().context.y) * camera().context.zoom,
        }
      },
      cameraSend: (action) => {
        props.cameraRef.send(action)
      }
    }
  ]

  return (
    <CameraContext.Provider value={value}>
      {props.children}
    </CameraContext.Provider>
  );
}

export function useCamera() { return useContext(CameraContext); }