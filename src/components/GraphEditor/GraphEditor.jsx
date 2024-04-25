import { createSignal, createEffect, For } from "solid-js";
import Canvas from '../Canvas/Canvas.jsx'
import { useViewBox } from "../Canvas/Canvas.Context";
import styles from './GraphEditor.module.css';
import * as utils from './GraphEditor.utils';

import { createActor  } from 'xstate';
import { useActor, fromActorRef } from '@xstate/solid';
import cameraMachine from '../../machines/camera';
import draggerMachine from '../../machines/dragger';
import draggersMachine from '../../machines/draggers';

function EditorCartesianAxis(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()

  const aspectRatio = () => (vis().max.x - vis().min.x)/(vis().max.y - vis().min.y)
  const aspectScale = () => Math.max(aspectRatio(), 1/aspectRatio())

  return (<>
    <path class={styles.axisLine} d={utils.minMaxCrossPath(vis())} />
    <path class={styles.arrowHead} d={utils.minMaxCrossArrowPath(vis(), aspectScale() / 2)} />
    <text font-size="18" class={[styles.axisLabel, styles.textRight, styles.textBottom].join(" ")} x={vis().max.x - 30} y="-10">X</text>
    <text font-size="18" class={[styles.axisLabel, styles.textTop, styles.textLeft].join(" ")} x="10" y={vis().min.y + 30}>Y</text>
  </>)
}

function EditorCartesianGrid(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()

  const aspectRatio = () => (vis().max.x - vis().min.x)/(vis().max.y - vis().min.y)
  const aspectScale = () => Math.max(aspectRatio(), 1/aspectRatio())

  return (<>
    <path class={styles.gridLinesCartesian} d={utils.minMaxGridPath(vis(), 32* aspectScale() * (props.camera.context.zoom))} />
  </>)
}

function EditorPolarGrid(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()

  const aspectRatio = () => (vis().max.x - vis().min.x)/(vis().max.y - vis().min.y)
  const aspectScale = () => Math.max(aspectRatio(), 1/aspectRatio())

  return (<>
    <path class={styles.gridLinesPolar} d={utils.minMaxPolarRingsPath(vis(), 64* aspectScale() * (props.camera.context.zoom))} />
    <path class={styles.gridLinesPolar} d={utils.minMaxPolarRaysPath(vis(), 8)} />
  </>)
}

function EditorNode(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()
  const [dragger, sendDragger] =  [fromActorRef(props.dragger.ref)(), props.dragger.ref.send];

  function camToWorld({x,y}) {
    return {
      x: x / props.camera.context.zoom,
      y: y / props.camera.context.zoom,
    }
  }

  function grab(evt) {
    evt.currentTarget.setPointerCapture(evt.pointerId);
    sendDragger({type: 'dragger.grab', ...camToWorld(eventToLocal(evt))})
  }

  function release(evt) {
    evt.currentTarget.releasePointerCapture(evt.pointerId);
    sendDragger({type: 'dragger.release', ...camToWorld(eventToLocal(evt))})
  }

  function drag(evt) {
    sendDragger({type: 'dragger.move', ...camToWorld(eventToLocal(evt))})
  }

  return <>
    <path class={styles.edge} d={utils.straightLinePath(0,0,dragger.context.x * props.camera.context.zoom,dragger.context.y * props.camera.context.zoom)} />
    <circle cursor="move" onPointerDown={grab} onPointerUp={release} onPointerMove={drag} cx={dragger.context.x * props.camera.context.zoom} cy={dragger.context.y * props.camera.context.zoom} class={styles.node} r="20"/>
  </>
}

function EditorContent(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()

  return (<>    
    <path class={styles.paper} d={utils.minMaxRectPath(vis())} />
    <path class={styles.debugMargin} d={utils.minMaxRectPath(vis(),  5)} />
    <EditorPolarGrid camera={props.camera} />
    <EditorCartesianGrid camera={props.camera} />
   
    <For each={props.draggers.context.items}>{(item, index) => 
       <EditorNode dragger={item} camera={props.camera} />
    }</For>

    <EditorCartesianAxis camera={props.camera} />
  </>)
}

function GraphEditor() {
  const [zoom, setZoom] = createSignal(1);
  const [camera, sendCam] = useActor(cameraMachine);
  const [draggers, sendDraggers] = useActor(draggersMachine);

  function scroll(evt) {
    sendCam({type: 'cam.zoom.by', delta: evt.wheelDelta/500})
  }


  return (<>
    <Canvas onWheel={scroll}  viewBox="-512 -512 1024 1024" preserveAspectRatio="xMidYMid meet" debug={true}>
      <EditorContent camera={camera} draggers={draggers} />
    </Canvas>
    <div class={styles.overlay}>
      <label class={styles.sliderBox}>
        <input class={styles.slider} type="range" min="1" max="10" step="0.0001" value={camera.context.zoom} onInput={e => sendCam({type: 'cam.zoom.to', target: e.currentTarget.valueAsNumber})} />
        <span class={styles.sliderLabel}>{() => Math.round(camera.context.zoom*100)/100}</span>
      </label>
      <button onClick={_ => sendDraggers({type: "draggers.create"})}>add</button>
    </div>
  </>);
}

export default GraphEditor;
