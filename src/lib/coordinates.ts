// Pure coordinate math shared by the canvas: converts between a control's
// normalized (0-100%, relative to the source image) position/size and pixel
// coordinates on the rendered Konva stage. Kept dependency-free so it's
// testable without a canvas/DOM.

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

interface Size {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
}

export function controlSizeToPixels(size: Size, imagePixelWidth: number, imagePixelHeight: number) {
  return {
    pxWidth: (size.width / 100) * imagePixelWidth,
    pxHeight: (size.height / 100) * imagePixelHeight,
  }
}

/** A control's top-left position + size, expressed as a pixel-space center point (matches how Konva shapes are anchored here). */
export function controlToPixelCenter(
  position: Position,
  size: Size,
  imagePixelWidth: number,
  imagePixelHeight: number,
) {
  const { pxWidth, pxHeight } = controlSizeToPixels(size, imagePixelWidth, imagePixelHeight)
  return {
    centerX: (position.x / 100) * imagePixelWidth + pxWidth / 2,
    centerY: (position.y / 100) * imagePixelHeight + pxHeight / 2,
    pxWidth,
    pxHeight,
  }
}

/** Inverse of controlToPixelCenter's position half: pixel center + size back to a normalized top-left, clamped to stay inside the image. */
export function pixelCenterToNormalizedPosition(params: {
  centerX: number
  centerY: number
  pxWidth: number
  pxHeight: number
  imagePixelWidth: number
  imagePixelHeight: number
}): Position {
  const { centerX, centerY, pxWidth, pxHeight, imagePixelWidth, imagePixelHeight } = params
  const widthPct = (pxWidth / imagePixelWidth) * 100
  const heightPct = (pxHeight / imagePixelHeight) * 100
  const topLeftX = ((centerX - pxWidth / 2) / imagePixelWidth) * 100
  const topLeftY = ((centerY - pxHeight / 2) / imagePixelHeight) * 100
  return {
    x: clamp(topLeftX, 0, 100 - widthPct),
    y: clamp(topLeftY, 0, 100 - heightPct),
  }
}

/** Pixel dimensions back to a normalized size, floored at minPercent so a control can't be resized to nothing. */
export function pixelSizeToNormalizedSize(
  pxWidth: number,
  pxHeight: number,
  imagePixelWidth: number,
  imagePixelHeight: number,
  minPercent = 1,
): Size {
  return {
    width: Math.max((pxWidth / imagePixelWidth) * 100, minPercent),
    height: Math.max((pxHeight / imagePixelHeight) * 100, minPercent),
  }
}

export function pixelPointToNormalized(
  point: Position,
  imagePixelWidth: number,
  imagePixelHeight: number,
): Position {
  return {
    x: (point.x / imagePixelWidth) * 100,
    y: (point.y / imagePixelHeight) * 100,
  }
}
