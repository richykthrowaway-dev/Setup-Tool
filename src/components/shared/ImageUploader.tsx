import { useRef } from 'react'

interface ImageUploaderProps {
  onImageLoaded: (params: { imageUrl: string; width: number; height: number }) => void
  className?: string
  label?: string
}

function readImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = dataUrl
  })
}

export function ImageUploader({ onImageLoaded, className, label = 'Upload hardware image' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const imageUrl = reader.result as string
      const { width, height } = await readImageDimensions(imageUrl)
      onImageLoaded({ imageUrl, width, height })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
      >
        {label}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
