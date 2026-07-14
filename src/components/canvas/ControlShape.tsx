import { useEffect, useRef } from 'react'
import { Circle, Ellipse, Group, Rect, Text, Transformer } from 'react-konva'
import type Konva from 'konva'
import type { ControlObject } from '../../types/models'
import { controlToPixelCenter, pixelCenterToNormalizedPosition, pixelSizeToNormalizedSize } from '../../lib/coordinates'
import { estimateChipWidth } from '../../lib/labelChip'

const MIN_SIZE_PERCENT = 1
const LABEL_FONT_SIZE = 11
const LABEL_CHIP_HEIGHT = 20
const SELECTED_RING_COLOR = '#38bdf8'

interface ControlShapeProps {
  control: ControlObject
  imagePixelWidth: number
  imagePixelHeight: number
  isSelected: boolean
  editable: boolean
  dimmed?: boolean
  onSelect: (id: string) => void
  onChange?: (id: string, partial: Partial<ControlObject>) => void
}

export function ControlShape({
  control,
  imagePixelWidth,
  imagePixelHeight,
  isSelected,
  editable,
  dimmed,
  onSelect,
  onChange,
}: ControlShapeProps) {
  const groupRef = useRef<Konva.Group>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (isSelected && editable && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected, editable])

  const { centerX, centerY, pxWidth, pxHeight } = controlToPixelCenter(
    control.position,
    control.size,
    imagePixelWidth,
    imagePixelHeight,
  )

  // A thin outline "hotspot" reads as an annotation, not a paint-bucket fill:
  // low fill opacity, a crisp full-strength ring, and a soft shadow for depth.
  const nodeOpacity = dimmed ? 0.4 : 1
  const markerProps = {
    fill: control.style.fill,
    fillEnabled: true,
    stroke: isSelected ? SELECTED_RING_COLOR : control.style.stroke,
    strokeWidth: isSelected ? 2.5 : 2,
    opacity: nodeOpacity,
    shadowColor: 'black',
    shadowBlur: 8,
    shadowOpacity: 0.35,
    shadowOffsetY: 2,
  }
  const fillOpacity = control.style.opacity

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target
    const position = pixelCenterToNormalizedPosition({
      centerX: node.x(),
      centerY: node.y(),
      pxWidth,
      pxHeight,
      imagePixelWidth,
      imagePixelHeight,
    })
    onChange?.(control.id, { position })
  }

  function handleTransformEnd() {
    const node = groupRef.current
    if (!node) return
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    node.scaleX(1)
    node.scaleY(1)

    const newPxWidth = Math.max(pxWidth * scaleX, 4)
    const newPxHeight = Math.max(pxHeight * scaleY, 4)
    const size = pixelSizeToNormalizedSize(newPxWidth, newPxHeight, imagePixelWidth, imagePixelHeight, MIN_SIZE_PERCENT)
    const position = pixelCenterToNormalizedPosition({
      centerX: node.x(),
      centerY: node.y(),
      pxWidth: newPxWidth,
      pxHeight: newPxHeight,
      imagePixelWidth,
      imagePixelHeight,
    })

    onChange?.(control.id, { size, position, rotation: node.rotation() })
  }

  const chipWidth = estimateChipWidth(control.label, LABEL_FONT_SIZE)
  const chipY = pxHeight / 2 + 6

  return (
    <>
      <Group
        ref={groupRef}
        x={centerX}
        y={centerY}
        rotation={control.rotation}
        draggable={editable}
        onClick={() => onSelect(control.id)}
        onTap={() => onSelect(control.id)}
        onDragEnd={editable ? handleDragEnd : undefined}
        onTransformEnd={editable ? handleTransformEnd : undefined}
      >
        {control.style.shape === 'rect' && (
          <Rect
            x={-pxWidth / 2}
            y={-pxHeight / 2}
            width={pxWidth}
            height={pxHeight}
            cornerRadius={Math.min(pxWidth, pxHeight) * 0.2}
            fillOpacity={fillOpacity}
            {...markerProps}
          />
        )}
        {control.style.shape === 'circle' && (
          <Circle radius={(pxWidth + pxHeight) / 4} fillOpacity={fillOpacity} {...markerProps} />
        )}
        {control.style.shape === 'ellipse' && (
          <Ellipse radiusX={pxWidth / 2} radiusY={pxHeight / 2} fillOpacity={fillOpacity} {...markerProps} />
        )}

        <Group x={-chipWidth / 2} y={chipY} opacity={nodeOpacity}>
          <Rect
            width={chipWidth}
            height={LABEL_CHIP_HEIGHT}
            cornerRadius={LABEL_CHIP_HEIGHT / 2}
            fill="rgba(15, 23, 42, 0.85)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={1}
            shadowColor="black"
            shadowBlur={6}
            shadowOpacity={0.35}
            shadowOffsetY={1}
          />
          <Text
            text={control.label}
            fontSize={LABEL_FONT_SIZE}
            fontStyle="600"
            fill="#f8fafc"
            width={chipWidth}
            height={LABEL_CHIP_HEIGHT}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      </Group>
      {isSelected && editable && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio={false}
          anchorCornerRadius={4}
          anchorStroke={SELECTED_RING_COLOR}
          anchorFill="#0f172a"
          borderStroke={SELECTED_RING_COLOR}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 6 || newBox.height < 6 ? oldBox : newBox
          }
        />
      )}
    </>
  )
}
