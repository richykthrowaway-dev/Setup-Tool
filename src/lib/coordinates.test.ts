import { describe, expect, it } from 'vitest'
import {
  clamp,
  controlSizeToPixels,
  controlToPixelCenter,
  pixelCenterToNormalizedPosition,
  pixelPointToNormalized,
  pixelSizeToNormalizedSize,
} from './coordinates'

describe('clamp', () => {
  it('passes through values already in range', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })

  it('clamps below the minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
  })

  it('clamps above the maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })

  it('treats an inverted range as a fixed point at min', () => {
    // pixelCenterToNormalizedPosition can produce a `max` below `min` when a
    // control's own size exceeds the image (100 - widthPct < 0); clamp must
    // not throw or return NaN in that case.
    expect(clamp(50, 10, 5)).toBe(10)
  })
})

describe('controlSizeToPixels', () => {
  it('converts percentage size to pixels relative to image dimensions', () => {
    expect(controlSizeToPixels({ width: 10, height: 20 }, 1000, 500)).toEqual({
      pxWidth: 100,
      pxHeight: 100,
    })
  })
})

describe('controlToPixelCenter', () => {
  it('places the center at top-left + half the pixel size', () => {
    const result = controlToPixelCenter({ x: 10, y: 20 }, { width: 8, height: 4 }, 1000, 1000)
    // top-left px = (100, 200); size px = (80, 40); center = (140, 220)
    expect(result.centerX).toBe(140)
    expect(result.centerY).toBe(220)
    expect(result.pxWidth).toBe(80)
    expect(result.pxHeight).toBe(40)
  })
})

describe('pixelCenterToNormalizedPosition', () => {
  it('round-trips with controlToPixelCenter for an in-bounds control', () => {
    const position = { x: 12, y: 34 }
    const size = { width: 8, height: 14 }
    const imagePixelWidth = 1200
    const imagePixelHeight = 700

    const { centerX, centerY, pxWidth, pxHeight } = controlToPixelCenter(
      position,
      size,
      imagePixelWidth,
      imagePixelHeight,
    )
    const roundTripped = pixelCenterToNormalizedPosition({
      centerX,
      centerY,
      pxWidth,
      pxHeight,
      imagePixelWidth,
      imagePixelHeight,
    })

    expect(roundTripped.x).toBeCloseTo(position.x, 8)
    expect(roundTripped.y).toBeCloseTo(position.y, 8)
  })

  it('clamps the top-left so the control cannot be dragged off the left/top edge', () => {
    const result = pixelCenterToNormalizedPosition({
      centerX: -500,
      centerY: -500,
      pxWidth: 100,
      pxHeight: 100,
      imagePixelWidth: 1000,
      imagePixelHeight: 1000,
    })
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  it('clamps the top-left so the control cannot be dragged off the right/bottom edge', () => {
    const result = pixelCenterToNormalizedPosition({
      centerX: 5000,
      centerY: 5000,
      pxWidth: 100,
      pxHeight: 100,
      imagePixelWidth: 1000,
      imagePixelHeight: 1000,
    })
    // widthPct = 10%, so max top-left x is 90
    expect(result.x).toBe(90)
    expect(result.y).toBe(90)
  })
})

describe('pixelSizeToNormalizedSize', () => {
  it('converts pixel dimensions back to a percentage size', () => {
    expect(pixelSizeToNormalizedSize(50, 250, 1000, 500)).toEqual({ width: 5, height: 50 })
  })

  it('floors the size at minPercent so a control cannot be resized to nothing', () => {
    const result = pixelSizeToNormalizedSize(0.1, 0.1, 1000, 1000, 2)
    expect(result.width).toBe(2)
    expect(result.height).toBe(2)
  })
})

describe('pixelPointToNormalized', () => {
  it('converts a pixel point on the stage to a percentage position', () => {
    expect(pixelPointToNormalized({ x: 300, y: 150 }, 1200, 600)).toEqual({ x: 25, y: 25 })
  })
})
