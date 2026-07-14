// Konva can't measure text before laying out the chip background behind it,
// so the chip width is an approximation based on average glyph width for the
// UI font at this size. Slightly generous on purpose — a chip a little wider
// than the text reads as intentional padding; one that's too narrow clips.
const AVERAGE_CHAR_WIDTH_RATIO = 0.58
const HORIZONTAL_PADDING = 16
const MIN_CHIP_WIDTH = 36

export function estimateChipWidth(text: string, fontSize: number): number {
  const textWidth = text.length * fontSize * AVERAGE_CHAR_WIDTH_RATIO
  return Math.max(textWidth + HORIZONTAL_PADDING, MIN_CHIP_WIDTH)
}
