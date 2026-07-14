import { useEffect, useRef } from 'react'
import { Circle, Ellipse, Group, RegularPolygon, Rect, Star, Text, Transformer } from 'react-konva'
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
  showNumbersOnly?: boolean
  controlNumber?: number
  isBound?: boolean
  assignedFunction?: string
  isHovered?: boolean
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
  showNumbersOnly,
  controlNumber,
  isBound,
  assignedFunction,
  isHovered,
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
  const chipCenterY = pxHeight / 2 + 6 + LABEL_CHIP_HEIGHT / 2

  // If showing numbers only (table view companion), render a simple numbered circle
  if (showNumbersOnly && controlNumber) {
    const circleRadius = (pxWidth + pxHeight) / 4
    const baseColor = isBound ? '#06b6d4' : '#f97316' // cyan if bound, orange if unbound
    const isHoveredOrSelected = isHovered || isSelected

    return (
      <Group
        x={centerX}
        y={centerY}
        onClick={() => onSelect(control.id)}
        onTap={() => onSelect(control.id)}
        opacity={isHoveredOrSelected ? 1 : dimmed ? 0.6 : 0.85}
        scaleX={isHoveredOrSelected ? 1.15 : 1}
        scaleY={isHoveredOrSelected ? 1.15 : 1}
      >
        <Circle
          radius={circleRadius}
          fill={baseColor}
          stroke={isSelected ? '#38bdf8' : isHoveredOrSelected ? '#fff' : baseColor}
          strokeWidth={isSelected ? 3 : isHoveredOrSelected ? 2.5 : 2}
          opacity={0.9}
        />
        <Text
          text={controlNumber.toString()}
          fontSize={16}
          fontStyle="700"
          fill="#fff"
          x={-12}
          y={-10}
          width={24}
          align="center"
          verticalAlign="middle"
        />
        {isBound && (
          <Text
            text="✓"
            fontSize={12}
            fontStyle="700"
            fill="#22c55e"
            x={circleRadius - 8}
            y={-circleRadius + 4}
            width={16}
            align="center"
            verticalAlign="middle"
          />
        )}
        {!isBound && (
          <Text
            text="○"
            fontSize={14}
            fontStyle="700"
            fill="#fff"
            x={circleRadius - 8}
            y={-circleRadius + 2}
            width={16}
            align="center"
            verticalAlign="middle"
          />
        )}
        {isBound && assignedFunction && (
          <Group x={0} y={circleRadius + 6 + 9} opacity={isHoveredOrSelected ? 1 : 0.9}>
            {(() => {
              const fnChipWidth = Math.min(estimateChipWidth(assignedFunction, 10), 120)
              return (
                <>
                  <Rect
                    x={-fnChipWidth / 2}
                    y={-9}
                    width={fnChipWidth}
                    height={18}
                    cornerRadius={9}
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth={1}
                  />
                  <Text
                    text={assignedFunction}
                    fontSize={10}
                    fontStyle="600"
                    fill="#f8fafc"
                    x={-fnChipWidth / 2}
                    y={-9}
                    width={fnChipWidth}
                    height={18}
                    align="center"
                    verticalAlign="middle"
                    ellipsis
                    wrap="none"
                  />
                </>
              )
            })()}
          </Group>
        )}
      </Group>
    )
  }

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
        {control.style.shape === 'triangle' && (
          <RegularPolygon sides={3} radius={(pxWidth + pxHeight) / 4} fillOpacity={fillOpacity} {...markerProps} />
        )}
        {control.style.shape === 'diamond' && (
          <RegularPolygon sides={4} radius={(pxWidth + pxHeight) / 4} fillOpacity={fillOpacity} {...markerProps} />
        )}
        {control.style.shape === 'hexagon' && (
          <RegularPolygon sides={6} radius={(pxWidth + pxHeight) / 4} fillOpacity={fillOpacity} {...markerProps} />
        )}
        {control.style.shape === 'star' && (
          <Star
            numPoints={5}
            innerRadius={(pxWidth + pxHeight) / 8}
            outerRadius={(pxWidth + pxHeight) / 4}
            fillOpacity={fillOpacity}
            {...markerProps}
          />
        )}

        {/*
          Counter-rotate the marker's own rotation first so this subtree is
          back to a "screen-upright" frame — otherwise the label's position
          offset below would still swing around the marker as it rotates,
          even though the earlier fix kept the text itself upright.
          labelRotation is then applied on top, independent of the marker.
        */}
        <Group rotation={-control.rotation}>
          <Group x={0} y={chipCenterY} rotation={control.labelRotation ?? 0} opacity={nodeOpacity}>
            <Rect
              x={-chipWidth / 2}
              y={-LABEL_CHIP_HEIGHT / 2}
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
              x={-chipWidth / 2}
              y={-LABEL_CHIP_HEIGHT / 2}
              width={chipWidth}
              height={LABEL_CHIP_HEIGHT}
              align="center"
              verticalAlign="middle"
            />
          </Group>
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
