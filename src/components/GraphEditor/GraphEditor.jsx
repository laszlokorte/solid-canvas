import { createSignal, createEffect, For, children } from "solid-js";
import Canvas from '../Canvas/Canvas.jsx'
import { useViewBox } from "../Canvas/Canvas.Context";
import styles from './GraphEditor.module.css';
import * as utils from './GraphEditor.utils';

import { createActor  } from 'xstate';
import { useActor, fromActorRef, useActorRef } from '@xstate/solid';
import cameraMachine from '../../machines/camera';
import draggerMachine from '../../machines/dragger';
import draggersMachine from '../../machines/draggers';

import { CameraProvider, useCamera } from "./GraphEditor.Context";

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
  const [camera, _] = useCamera()

  const aspectRatio = () => (vis().max.x - vis().min.x)/(vis().max.y - vis().min.y)
  const aspectScale = () => Math.max(aspectRatio(), 1/aspectRatio())

  return (<>
    <path class={styles.gridLinesCartesian} d={utils.minMaxGridPath(vis(), 32* aspectScale() * (camera().context.zoom))} />
  </>)
}

function EditorPolarGrid(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()
  const [camera, {worldToCam}] = useCamera()

  const zeroPos = () => worldToCam({x:0,y:0})

  const aspectRatio = () => (vis().max.x - vis().min.x)/(vis().max.y - vis().min.y)
  const aspectScale = () => Math.max(aspectRatio(), 1/aspectRatio())

  return (<>
    <path class={styles.gridLinesPolar} d={utils.minMaxPolarRingsPath(vis(), 64* aspectScale() * (camera().context.zoom))} />
    <path class={styles.gridLinesPolar} d={utils.minMaxPolarRaysPath(vis(), 8)} />
  </>)
}

function EditorNode(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()
  const [dragger, sendDragger] =  [fromActorRef(props.dragger.ref)(), props.dragger.ref.send];
  const [camera, {camToWorld, worldToCam}] = useCamera()

 

  function grab(evt) {
    evt.stopPropagation()
    evt.currentTarget.setPointerCapture(evt.pointerId);
    sendDragger({type: 'dragger.grab', ...camToWorld(eventToLocal(evt))})
  }

  function release(evt) {
    evt.currentTarget.releasePointerCapture(evt.pointerId);
    sendDragger({type: 'dragger.release', ...camToWorld(eventToLocal(evt))})
  }

  function drag(evt) {
    if(!evt.currentTarget.hasPointerCapture(evt.pointerId)) {
      return
    }
    sendDragger({type: 'dragger.move', ...camToWorld(eventToLocal(evt))})
  }

  const draggerCamPos = () => worldToCam(dragger.context)
  const zeroPos = () => worldToCam({x:0,y:0})

  return <>
    <path class={styles.edge} d={utils.straightLinePath(zeroPos().x, zeroPos().y,draggerCamPos().x,draggerCamPos().y)} />
    <circle cursor="move" on:pointerdown={grab} on:pointerup={release} on:pointermove={drag} cx={draggerCamPos().x} cy={draggerCamPos().y} class={styles.node} r="20"/>
  </>
}

function EditorContent(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()
  const [camera, {camToWorld, cameraSend, worldToCam, isPanning}] = useCamera()

  const anchor = () => worldToCam({x: camera().context.anchorX, y: camera().context.anchorY})

  return (<>    
    <path class={styles.paper} d={utils.minMaxRectPath(vis())} />
    <path class={styles.debugMargin} d={utils.minMaxRectPath(vis(),  5)} />
    <EditorPolarGrid />
    <EditorCartesianGrid />
   
    <For each={props.draggers.context.items}>{(item, index) => 
       <EditorNode dragger={item} />
    }</For>

    <Show when={isPanning()}>
    <circle cx={anchor().x} cy={anchor().y} r="10"></circle>
    </Show>

    <EditorCartesianAxis />
  </>)
}

function GraphEditorCamControl(props) {
  const [camera, {camToWorld, cameraSend}] = useCamera()
  const [vb, {eventToLocal}] = useViewBox()

  let node;

  function scroll(evt) {
    cameraSend({type: 'cam.zoom.by', delta: evt.wheelDelta/500})
  }

  function grab(evt) {
    evt.stopPropagation()
    evt.currentTarget.setPointerCapture(evt.pointerId);
    cameraSend({type: 'camera.pan.grab', ...camToWorld(eventToLocal(evt))})
  }

  function release(evt) {
    evt.currentTarget.releasePointerCapture(evt.pointerId);
    cameraSend({type: 'camera.pan.release', ...camToWorld(eventToLocal(evt))})
  }

  function drag(evt) {
    if(!evt.currentTarget.hasPointerCapture(evt.pointerId)) {
      return
    }
    cameraSend({type: 'camera.pan.move', ...camToWorld(eventToLocal(evt))})
  }

  createEffect(() => {
    node.ownerSVGElement.addEventListener('wheel', scroll)
    node.ownerSVGElement.addEventListener('pointerdown', grab)
    node.ownerSVGElement.addEventListener('pointerup', release)
    node.ownerSVGElement.addEventListener('pointermove', drag)

    return () => {
      node.ownerSVGElement.removeEventListener('wheel', scroll)
      node.ownerSVGElement.removeEventListener('pointerdown', grab)
      node.ownerSVGElement.removeEventListener('pointerup', release)
      node.ownerSVGElement.removeEventListener('pointermove', drag)
    }
  });

  return <g ref={node} />
}

function GraphEditor() {
  const [zoom, setZoom] = createSignal(1);
  const cameraRef = useActorRef(cameraMachine);
  const camera = fromActorRef(cameraRef)
  const [draggers, sendDraggers] = useActor(draggersMachine);


  return (<>
    <CameraProvider cameraRef={cameraRef}>
        <Canvas viewBox="-512 -512 1024 1024" preserveAspectRatio="xMidYMid meet" debug={true}>
          <GraphEditorCamControl />
          <EditorContent draggers={draggers} />
        </Canvas>
      <div class={styles.overlay}>
        <label class={styles.sliderBox}>
          <input class={styles.slider} type="range" min="1" max="10" step="0.0001" value={camera().context.zoom} onInput={e => cameraRef.send({type: 'cam.zoom.to', target: e.currentTarget.valueAsNumber})} />
          <span class={styles.sliderLabel}>{() => Math.round(camera().context.zoom*100)/100}</span>
        </label>
        <button onClick={_ => sendDraggers({type: "draggers.create"})}>add</button>
      </div>
    </CameraProvider>
  </>);
}

export default GraphEditor;
