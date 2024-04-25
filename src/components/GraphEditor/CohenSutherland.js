const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

function ComputeOutCode(bounds, x, y) {
	let code = INSIDE;

	if (x < bounds.min.x)
		code |= LEFT;
	else if (x > bounds.max.x)
		code |= RIGHT;
	if (y < bounds.min.y)
		code |= BOTTOM;
	else if (y > bounds.max.y)
		code |= TOP;

	return code;
}

export function lineClip(bounds, line) {

	let outcode0 = ComputeOutCode(bounds, line.x0, line.y0);
	let outcode1 = ComputeOutCode(bounds, line.x1, line.y1);
	let accept = false;

	while (true) {
		if (!(outcode0 | outcode1)) {
			accept = true;
			break;
		} else if (outcode0 & outcode1) {
			break;
		} else {
			let x, y;

			const outcodeOut = outcode1 > outcode0 ? outcode1 : outcode0;

			if (outcodeOut & TOP) {
				x = line.x0 + (line.x1 - line.x0) * (bounds.max.y - line.y0) / (line.y1 - line.y0);
				y = bounds.max.y;
			} else if (outcodeOut & BOTTOM) {
				x = line.x0 + (line.x1 - line.x0) * (bounds.min.y - line.y0) / (line.y1 - line.y0);
				y = bounds.min.y;
			} else if (outcodeOut & RIGHT) {
				y = line.y0 + (line.y1 - line.y0) * (bounds.max.x - line.x0) / (line.x1 - line.x0);
				x = bounds.max.x;
			} else if (outcodeOut & LEFT) {
				y = line.y0 + (line.y1 - line.y0) * (bounds.min.x - line.x0) / (line.x1 - line.x0);
				x = bounds.min.x;
			}

			if (outcodeOut === outcode0) {
				line.x0 = x;
				line.y0 = y;
				outcode0 = ComputeOutCode(bounds, line.x0, line.y0);
			} else {
				line.x1 = x;
				line.y1 = y;
				outcode1 = ComputeOutCode(bounds, line.x1, line.y1);
			}
		}
	}
	return accept;
}