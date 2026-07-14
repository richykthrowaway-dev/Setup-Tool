import { Layer, Image as KonvaImage, Stage } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'
import type { ControlObject } from '../../types/models'
import { useContainerWidth } from '../../lib/useContainerWidth'
import { pixelPointToNormalized } from '../../lib/coordinates'
import { ControlShape } from './ControlShape'

interface HardwareCanvasProps {
  imageUrl: string
  imageWidth: number
  imageHeight: number
  controls: ControlObject[]
  selectedControlId: string | null
  /** Creator mode allows drag/resize/rotate; configurator mode is click-only. */
  editable: boolean
  onSelectControl: (id: string | null) => void
  onChangeControl?: (id: string, partial: Partial<ControlObject>) => void
  /** Fired with normalized image coordinates when the empty canvas is clicked. */
  onCanvasClick?: (position: { x: number; y: number }) => void
  isControlDimmed?: (control: ControlObject) => boolean
}

export function HardwareCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  controls,
  selectedControlId,
  editable,
  onSelectControl,
  onChangeControl,
  onCanvasClick,
  isControlDimmed,
}: HardwareCanvasProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>()
  const [image] = useImage(imageUrl)

  const stageWidth = width || imageWidth
  const scale = imageWidth > 0 ? stageWidth / imageWidth : 1
  const stageHeight = imageHeight * scale

  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    const stage = e.target.getStage()
    const clickedBackground = e.target === stage || e.target.name() === 'canvas-background'
    if (!clickedBackground) return

    onSelectControl(null)
    if (!onCanvasClick) return

    const pointer = stage?.getPointerPosition()
    if (!pointer) return
    onCanvasClick(pixelPointToNormalized(pointer, stageWidth, stageHeight))
  }

  return (
    <div
      ref={ref}
      className="w-full min-w-0"
      style={{
        // Transparency checkerboard — the industry-standard way to signal
        // "this area is see-through," regardless of how light or dark the
        // uploaded image is. Fully opaque photos simply cover it entirely.
        backgroundImage:
          'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        backgroundColor: '#f1f5f9',
      }}
    >
      {stageWidth > 0 && (
        <Stage width={stageWidth} height={stageHeight} onClick={handleStageClick} onTap={handleStageClick}>
          <Layer>
            {image && (
              <KonvaImage name="canvas-background" image={image} width={stageWidth} height={stageHeight} />
            )}
            {controls.map((control) => (
              <ControlShape
                key={control.id}
                control={control}
                imagePixelWidth={stageWidth}
                imagePixelHeight={stageHeight}
                isSelected={control.id === selectedControlId}
                editable={editable}
                dimmed={isControlDimmed?.(control)}
                onSelect={onSelectControl}
                onChange={onChangeControl}
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
