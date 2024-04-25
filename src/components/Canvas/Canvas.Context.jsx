import { createSignal, createContext, useContext } from "solid-js";
import * as utils from './Canvas.utils.js';


const defaultViewBox = utils.parseViewBoxAspect("0 0 400 400", "xMidYMid meet")
const ViewBoxContext = createContext([
  defaultViewBox,
  {
    eventToLocal: (evt) => {
      return utils.eventToPos(defaultViewBox, evt, evt.currentTarget.ownerSVGElement)
    }
  }
]);

export function ViewBoxProvider(props) {
  const viewBox = props.viewBox
  const value = [
    viewBox,
    {
      eventToLocal: (evt) => {
        return utils.eventToPos(viewBox, evt, props.svg || evt.currentTarget.ownerSVGElement)
      },
      visibleRange: () => {
        const innerWidth = props.size().width
        const innerHeight = props.size().height

        const min = utils.screenToSVG(
          viewBox,
          0, 0,
          0, 0, 
          innerWidth, innerHeight, 
          innerWidth, innerHeight
        )
        
        const max = utils.screenToSVG(
          viewBox,
          innerWidth, innerHeight, 
          0, 0, 
          innerWidth, innerHeight, 
          innerWidth, innerHeight
        )

        return {
          min, max
        }
      },
    }
  ]

  return (
    <ViewBoxContext.Provider value={value}>
      {props.children}
    </ViewBoxContext.Provider>
  );
}

export function useViewBox() { return useContext(ViewBoxContext); }