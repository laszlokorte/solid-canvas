import {lineClip} from './CohenSutherland'

export function minMaxRectPath(bounds, inset = 0) {
  return `M${bounds.min.x+inset},${bounds.min.y+inset}H${bounds.max.x-inset}V${bounds.max.y-inset}H${bounds.min.x+inset}z`
}

export function minMaxCrossPath(bounds) {
  return `M${bounds.min.x},0H${bounds.max.x}M0,${bounds.min.y}V${bounds.max.y}`
}

export function minMaxCrossArrowPath(bounds, scale = 1) {
  return `M${bounds.max.x},0l${-15*scale},${-10*scale}v${20*scale}zM0,${bounds.min.y}l${-10*scale},${15*scale}h${20*scale}z`
}

export function gappedSteps(start, stop, gap) {
  const total = (stop-start)
  const sign = Math.sign(total)
  return Array(Math.floor(Math.abs(total/gap))).fill(gap).map((g,i) => sign*(i+1)*g)
}

export function minMaxGridPath(bounds, gap) {
  const left = gappedSteps(0, bounds.min.x, gap).reduce((acc, x) => `${acc}M${x},${bounds.min.y}V${bounds.max.y}`, minMaxCrossPath(bounds))
  const andRight = gappedSteps(0, bounds.max.x, gap).reduce((acc, x) => `${acc}M${x},${bounds.min.y}V${bounds.max.y}`, left)
  const andTop = gappedSteps(0, bounds.min.y, gap).reduce((acc, y) => `${acc}M${bounds.min.x},${y}H${bounds.max.x}`, andRight)
  const andBottom = gappedSteps(0, bounds.max.y, gap).reduce((acc, y) => `${acc}M${bounds.min.x},${y}H${bounds.max.x}`, andTop)

  return andBottom
}

export function minMaxPolarRingsPath(bounds, gap) {
  const radius = Math.max(bounds.min.y, bounds.min.x, bounds.max.y, bounds.max.x)
  const rings = gappedSteps(0, radius, gap).reduce((acc, r) => `${acc}M${r},0a ${r} ${r} 0 1 0 ${(-2*r)} 0 a ${r} ${r} 0 1 0 ${(2*r)} 0`, '')

  return rings
}


export function minMaxPolarRaysPath(bounds, count, offset = 0) {
  const radius = Math.max(bounds.min.y, bounds.min.x, bounds.max.y, bounds.max.x)
  const offsetAngle = 360/count * offset
  const rings = gappedSteps(0, 360, 360/count).reduce((acc, angle) => {

    return `${acc}${straightLinePathClipped(bounds, 0,0,Math.cos(degree2Rad(angle+offsetAngle))*radius,Math.sin(degree2Rad(angle+offsetAngle))*radius)}`;
  }, '')

  return rings
}

const tempLine = {x0:0,y0:0,x1:0,y1:0}

export function straightLinePathClipped(bounds, startx, starty, endx, endy) {
  tempLine.x0 = startx
  tempLine.y0 = starty
  tempLine.x1 = endx
  tempLine.y1 = endy

  if(lineClip(bounds, tempLine)) {
    return `M${tempLine.x0},${tempLine.y0}L${tempLine.x1},${tempLine.y1}`
  } else {
    return ''
  }
}

export function straightLinePath(startx, starty, endx, endy) {
  return `M${startx},${starty}L${endx},${endy}`
}

export function degree2Rad(deg) {
  return deg/180 * Math.PI
}

export function rad2Degree(deg) {
  return deg*180 / Math.PI
}

export function clamp(min, max, v) {
  return Math.min(Math.max(min, v), max)
}