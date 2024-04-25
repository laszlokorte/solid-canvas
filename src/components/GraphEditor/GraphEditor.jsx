import { createSignal } from "solid-js";
import Canvas from '../Canvas/Canvas.jsx'
import { useViewBox } from "../Canvas/Canvas.Context";
import styles from './GraphEditor.module.css';
import * as utils from './GraphEditor.utils';

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
    <path class={styles.gridLinesCartesian} d={utils.minMaxGridPath(vis(), 32* aspectScale() * (props.zoom()))} />
  </>)
}

function EditorPolarGrid(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()

  const aspectRatio = () => (vis().max.x - vis().min.x)/(vis().max.y - vis().min.y)
  const aspectScale = () => Math.max(aspectRatio(), 1/aspectRatio())

  return (<>
    <path class={styles.gridLinesPolar} d={utils.minMaxPolarRingsPath(vis(), 64* aspectScale() * (props.zoom()))} />
    <path class={styles.gridLinesPolar} d={utils.minMaxPolarRaysPath(vis(), 8)} />
  </>)
}

function EditorContent(props) {
  const [vb, {eventToLocal, visibleRange: vis}] = useViewBox()
  const [pos, setPos] = createSignal({x: 42, y: 23});
  const [pressed, setPressed] = createSignal(false);

  function grab(evt) {
    evt.currentTarget.setPointerCapture(evt.pointerId);
    const oldPos = pos()
    const clickPos = eventToLocal(evt)
    setPressed({x: (clickPos.x - oldPos.x*props.zoom())/props.zoom(), y: (clickPos.y - oldPos.y*props.zoom())/props.zoom()})
  }

  function release(evt) {
    evt.currentTarget.releasePointerCapture(evt.pointerId);
    setPressed(false)
  }

  function drag(evt) {
    if(pressed()) {
      const newPos = eventToLocal(evt)
      const basePos = pressed()
      setPos({x: (newPos.x/props.zoom() - basePos.x), y: (newPos.y/props.zoom() - basePos.y)})
    }
  }

  const x = () => pos().x * props.zoom()
  const y = () => pos().y * props.zoom()

  return (<>    
    <path class={styles.paper} d={utils.minMaxRectPath(vis())} />
    <path class={styles.debugMargin} d={utils.minMaxRectPath(vis(),  5)} />
    <EditorPolarGrid zoom={props.zoom} />
    <EditorCartesianGrid zoom={props.zoom} />
    <path class={styles.edge} d={utils.straightLinePath(0,0,x(),y())} />
    <circle cursor="move" onPointerDown={grab} onPointerUp={release} onPointerMove={drag} cx={x()} cy={y()} class={styles.node} r="20"/>
    <EditorCartesianAxis zoom={props.zoom} />
  </>)
}

function GraphEditor() {
  const [zoom, setZoom] = createSignal(1);


  function scroll(evt) {
    setZoom((utils.clamp(1, 10, zoom() + evt.wheelDelta/500)))
  }


  return (<>
    <Canvas onWheel={scroll}  viewBox="-512 -512 1024 1024" preserveAspectRatio="xMidYMid meet" debug={true}>
      <EditorContent zoom={zoom} setZoom={setZoom} />
    </Canvas>
    <div class={styles.overlay}>
      <label class={styles.sliderBox}>
        <input class={styles.slider} type="range" min="1" max="10" step="0.0001" value={zoom()} onInput={e => setZoom(e.currentTarget.valueAsNumber)} />
        <span class={styles.sliderLabel}>{() => Math.round(zoom()*100)/100}</span>
      </label>
    </div>
  </>);
}

export default GraphEditor;
