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
    <path class={styles.gridLinesCartesian} d={utils.minMaxGridPath(vis(), 32* aspectScale() * (props.zoom()))} />
    <path class={styles.axisLine} d={utils.minMaxCrossPath(vis())} />
    <path class={styles.arrowHead} d={utils.minMaxCrossArrowPath(vis(), aspectScale() / 2)} />
    <text font-size="18" class={[styles.axisLabel, styles.textRight, styles.textBottom].join(" ")} x={vis().max.x - 30} y="-10">X</text>
    <text font-size="18" class={[styles.axisLabel, styles.textTop, styles.textLeft].join(" ")} x="10" y={vis().min.y + 30}>Y</text>
  </>)
}

function EditorPolarAxis(props) {
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
    setPressed({x: (clickPos.x - oldPos.x), y: (clickPos.y - oldPos.y)})
  }

  function release(evt) {
    evt.currentTarget.releasePointerCapture(evt.pointerId);
    setPressed(false)
  }

  function drag(evt) {
    if(pressed()) {
      const newPos = eventToLocal(evt)
      const basePos = pressed()
      setPos({x: (newPos.x - basePos.x), y: (newPos.y - basePos.y)})
    }
  }


  return (<>    
    <path class={styles.paper} d={utils.minMaxRectPath(vis())} />
    <path class={styles.debugMargin} d={utils.minMaxRectPath(vis(),  5)} />
    <EditorPolarAxis zoom={props.zoom} />
    <EditorCartesianAxis zoom={props.zoom} />
    <path class={styles.edge} d={utils.straightLinePath(0,0,pos().x,pos().y)} />
    <circle cursor="move" onPointerDown={grab} onPointerUp={release} onPointerMove={drag} cx={pos().x} cy={pos().y} class={styles.node} r="20"/>
  </>)
}

function GraphEditor() {
  const [zoom, setZoom] = createSignal(1);


  function scroll(evt) {
    setZoom(Math.round(utils.clamp(1, 10, zoom() + evt.wheelDelta/100)))
  }


  return (<>
    <Canvas onWheel={scroll}  viewBox="-512 -512 1024 1024" preserveAspectRatio="xMidYMid meet" debug={true}>
      <EditorContent zoom={zoom} setZoom={setZoom} />
    </Canvas>
    <div class={styles.overlay}>
      <label class={styles.sliderBox}>
        <input class={styles.slider} type="range" min="1" max="10" value={zoom()} onInput={e => setZoom(e.currentTarget.valueAsNumber)} />
        <span class={styles.sliderLabel}>{zoom}</span>
      </label>
    </div>
  </>);
}

export default GraphEditor;
