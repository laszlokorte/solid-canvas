import { createSignal, mergeProps, Show, onMount, onCleanup } from "solid-js";

import { ViewBoxProvider } from "./Canvas.Context";

import styles from './Canvas.module.css';
import * as utils from './Canvas.utils.js';

const DEFAULT_VIEWBOX = "0 0 600 400"
const DEFAULT_ASPECT = "xMidYMid meet"

function Canvas(props) {
  let svg;

  const {viewBox, preserveAspectRatio, debug} = mergeProps({viewBox: DEFAULT_VIEWBOX, preserveAspectRatio: DEFAULT_ASPECT, debug: false}, props);

  const viewBoxStruct = utils.parseViewBoxAspect(viewBox, preserveAspectRatio)

  const viewBoxString = utils.viewBoxString(viewBoxStruct)
  const aspectString = utils.aspectRatioString(viewBoxStruct)
  const viewBoxPath = utils.viewBoxPath(viewBoxStruct, 1)

  const [pos, setPos] = createSignal({x: 0, y: 0});

  function handleMouseMove(event) {
    setPos(utils.eventToPos(viewBoxStruct, event));
  }

  const [size, setSize] = createSignal({
    height: 1,
    width: 1
  });

  const sizeHandler = (event) => {
    setSize({ height: svg.clientHeight, width: svg.clientWidth });
  };

  onMount(() => {
    window.addEventListener('resize', sizeHandler);
    sizeHandler()
  });

  onCleanup(() => {
    window.removeEventListener('resize', sizeHandler);
  })

  return (
    <svg on:wheel={props.onWheel} ref={svg} onPointerMove={handleMouseMove} class={styles.Canvas} viewBox={viewBoxString} preserveAspectRatio={aspectString}>
      <ViewBoxProvider viewBox={viewBoxStruct} svg={svg} size={size}>
        {props.children}
        
        <Show
          when={debug}
        >
        <path d={viewBoxPath} class={styles.debug}></path>
        <circle r={2} cx={pos().x} cy={pos().y} class={styles.debug}></circle>
        </Show>

      </ViewBoxProvider>
    </svg>
  );
}

export default Canvas;
