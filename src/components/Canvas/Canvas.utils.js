export function scaleViewBox(viewBox, elementWidth, elementHeight) {
	if(viewBox.scaling === 'none') {
		return {
			minX: viewBox.minX,
			minY: viewBox.minY,
			width: viewBox.width,
			height: viewBox.height,
		}
	} else {
		const relWidth = viewBox.width/elementWidth
		const relHeight = viewBox.height/elementHeight
		
		const factor = {
			'meet': Math.max,
			'slice': Math.min
		}[viewBox.scaling].call(Math, relWidth, relHeight)

		const actualWidth = elementWidth * factor
		const actualHeight = elementHeight * factor
		const extraWidth = actualWidth - viewBox.width
		const extraHeight = actualHeight - viewBox.height

		const alignmentWeights = {
			'Min': 0,
			'Mid': 0.5,
			'Max': 1,
		};
		
		const extraWeightingX = alignmentWeights[viewBox.alignmentX];
		const extraWeightingY = alignmentWeights[viewBox.alignmentY];

		return {
			minX:  viewBox.minX - extraWeightingX * extraWidth,
			minY: viewBox.minY - extraWeightingY * extraHeight,
			width: actualWidth,
			height: actualHeight,
		}
	}
}

export function screenToSVG(viewBox, x, y, elementX, elementY, elementWidth, elementHeight, localWidth, localHeight) {
		const offsetX = x - elementX
		const offsetY = y - elementY
		const relativeX = offsetX / elementWidth
		const relativeY = offsetY / elementHeight

		const scaledVB = scaleViewBox(viewBox, localWidth, localHeight)

		return {
			x: scaledVB.minX + scaledVB.width * relativeX,
			y: scaledVB.minY + scaledVB.height * relativeY,
		}
}

export function eventToPos(viewBox, evt, target = null) {
	target = target || evt.currentTarget
	const targetRect = target.getBoundingClientRect();

	return screenToSVG(
		viewBox,
		evt.clientX, evt.clientY,
		targetRect.left, targetRect.top, 
		targetRect.width, targetRect.height, 
		target.clientWidth, target.clientHeight
	)
}


export function aspectRatioString(viewBox) {
	if(viewBox.scaling === 'none') {
		return 'none'
	} else {
		return `x${viewBox.alignmentX}Y${viewBox.alignmentY} ${viewBox.scaling}`
	}
}


export function viewBoxString(viewBox) {
	return `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`
}



export function viewBoxPath(viewBox, inset) {
	return `M${viewBox.minX+inset},${viewBox.minY+inset}h${viewBox.width-inset*2}v${viewBox.height-inset*2}h${-viewBox.width-inset*2}z`
}

const aspectStringPattern = new RegExp("x(?<x>M(?:ax|id|in))Y(?<y>M(?:ax|id|in))(?:\\s+(?<ratio>meet|slice|none))?")

export function parseViewBoxAspect(viewBox, aspectRatioString) {
	const [minX,minY,width,height] = viewBox.trim().split(/\s+/, 4).map(parseFloat)
	const aspect = aspectRatioString.trim().match(aspectStringPattern).groups

	return {
		minX,
		minY,
		width,
		height,
		alignmentX: aspect.x,
		alignmentY: aspect.y,
		scaling: aspect.ratio ?? 'none',
	}
}