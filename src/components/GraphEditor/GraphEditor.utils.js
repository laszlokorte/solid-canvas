import {lineClip} from './CohenSutherland'

export function minMaxRectPath(bounds, inset = 0) {
  return `M${bounds.min.x+inset},${bounds.min.y+inset}H${bounds.max.x-inset}V${bounds.max.y-inset}H${bounds.min.x+inset}z`
}

export function minMaxCrossPath(bounds, x=0,y=0) {
  return `M${bounds.min.x},${y}H${bounds.max.x}M${x},${bounds.min.y}V${bounds.max.y}`
}

export function minMaxCrossArrowPath(bounds, scale = 1, x=0, y=0) {
  return `M${bounds.max.x},${y}l${-15*scale},${-10*scale}v${20*scale}zM${x},${bounds.min.y}l${-10*scale},${15*scale}h${20*scale}z`
}

export function gappedSteps(start, stop, gap, offset = 0) {
  const total = (stop-start)
  const modOffset = (offset%gap+gap)%gap
  const sign = Math.sign(total)
  return Array(Math.ceil(Math.abs(total/gap))+1).fill(gap).map((g,i) => sign*(i)*g + modOffset)
}

export function minMaxGridPath(bounds, gap, offsetX, offsetY) {
  const modX = offsetX % gap
  const modY = offsetY % gap

  const left = gappedSteps(0, bounds.min.x, gap, modX).reduce((acc, x) => `${acc}M${x},${bounds.min.y}V${bounds.max.y}`, minMaxCrossPath(bounds, offsetX, offsetY))
  const andRight = gappedSteps(0, bounds.max.x, gap, modX).reduce((acc, x) => `${acc}M${x},${bounds.min.y}V${bounds.max.y}`, left)
  const andTop = gappedSteps(0, bounds.min.y, gap, modY).reduce((acc, y) => `${acc}M${bounds.min.x},${y}H${bounds.max.x}`, andRight)
  const andBottom = gappedSteps(0, bounds.max.y, gap, modY).reduce((acc, y) => `${acc}M${bounds.min.x},${y}H${bounds.max.x}`, andTop)

  return andBottom
}

export function minMaxPolarRingsPath(bounds, gap, offsetX, offsetY) {
  const radius = Math.max(bounds.min.y, bounds.min.x, bounds.max.y, bounds.max.x)
  const rings = gappedSteps(0, radius, gap).reduce((acc, r) => `${acc}M${offsetX+r},${offsetY}a ${r} ${r} 0 1 0 ${(-2*r)} 0 a ${r} ${r} 0 1 0 ${(2*r)} 0`, '')

  return rings
}


export function minMaxPolarRaysPath(bounds, count, offset = 0, centerX, centerY) {
  const radius = Math.abs(Math.max(bounds.min.y, bounds.min.x, bounds.max.y, bounds.max.x)) + Math.hypot(Math.abs(centerX), Math.abs(centerY))
  const offsetAngle = 360/count * offset
  const rings = gappedSteps(0, 360, 360/count).reduce((acc, angle) => {

    return `${acc}${straightLinePathClipped(bounds, centerX, centerY, centerX+Math.cos(degree2Rad(angle+offsetAngle))*radius,centerY+Math.sin(degree2Rad(angle+offsetAngle))*radius)}`;
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