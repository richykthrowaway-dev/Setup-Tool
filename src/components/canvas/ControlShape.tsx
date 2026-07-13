import { useEffect, useRef } from 'react'
import { Circle, Ellipse, Group, Rect, Text, Transformer } from 'react-konva'
import type Konva from 'konva'
import type { ControlObject } from '../../types/models'

const MIN_SIZE_PERCENT = 1

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

  const pxWidth = (control.size.width / 100) * imagePixelWidth
  const pxHeight = (control.size.height / 100) * imagePixelHeight
  const centerX = (control.position.x / 100) * imagePixelWidth + pxWidth / 2
  const centerY = (control.position.y / 100) * imagePixelHeight + pxHeight / 2

  const shapeProps = {
    fill: control.style.fill,
    stroke: isSelected ? '#facc15' : control.style.stroke,
    strokeWidth: isSelected ? 3 : 2,
    opacity: dimmed ? control.style.opacity * 0.4 : control.style.opacity,
  }

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target
    const topLeftX = ((node.x() - pxWidth / 2) / imagePixelWidth) * 100
    const topLeftY = ((node.y() - pxHeight / 2) / imagePixelHeight) * 100
    onChange?.(control.id, {
      position: {
        x: clamp(topLeftX, 0, 100 - control.size.width),
        y: clamp(topLeftY, 0, 100 - control.size.height),
      },
    })
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
    const newWidthPct = Math.max((newPxWidth / imagePixelWidth) * 100, MIN_SIZE_PERCENT)
    const newHeightPct = Math.max((newPxHeight / imagePixelHeight) * 100, MIN_SIZE_PERCENT)
    const newTopLeftX = ((node.x() - newPxWidth / 2) / imagePixelWidth) * 100
    const newTopLeftY = ((node.y() - newPxHeight / 2) / imagePixelHeight) * 100

    onChange?.(control.id, {
      size: { width: newWidthPct, height: newHeightPct },
      position: {
        x: clamp(newTopLeftX, 0, 100 - newWidthPct),
        y: clamp(newTopLeftY, 0, 100 - newHeightPct),
      },
      rotation: node.rotation(),
    })
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
          <Rect x={-pxWidth / 2} y={-pxHeight / 2} width={pxWidth} height={pxHeight} {...shapeProps} />
        )}
        {control.style.shape === 'circle' && (
          <Circle radius={(pxWidth + pxHeight) / 4} {...shapeProps} />
        )}
        {control.style.shape === 'ellipse' && (
          <Ellipse radiusX={pxWidth / 2} radiusY={pxHeight / 2} {...shapeProps} />
        )}
        <Text
          text={control.label}
          fontSize={12}
          fill="#0f172a"
          align="center"
          width={Math.max(pxWidth, 60)}
          x={-Math.max(pxWidth, 60) / 2}
          y={pxHeight / 2 + 4}
        />
      </Group>
      {isSelected && editable && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 6 || newBox.height < 6 ? oldBox : newBox
          }
        />
      )}
    </>
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}
