import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  File,
  Download,
} from 'lucide-react'
import { COLORS } from '@/core/constants'

type PanelSize = 'half-screen' | 'small-half' | 'large-half'
type FileType = 'image' | 'pdf' | 'excel' | 'other'

export interface ViewerFile {
  url: string
  mimeType?: string // e.g. "image/jpeg", "application/pdf"
}

// 👇 images can be string OR ViewerFile
type ViewerInput = string | ViewerFile

interface MultiImageViewerProps {
  images: ViewerInput[]
  title?: string
  triggerLabel?: React.ReactNode
  size?: PanelSize
}

export const MultiImageViewer: React.FC<MultiImageViewerProps> = ({
  images,
  title,
  triggerLabel,
  size = 'large-half',
}) => {
  // Normalize to ViewerFile[]
  const normalizedFiles: ViewerFile[] = (images || []).map((item) =>
    typeof item === 'string' ? { url: item } : item
  )

  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!normalizedFiles || normalizedFiles.length === 0) {
    return triggerLabel ? <span>{triggerLabel}</span> : null
  }

  // -------- helpers ----------

  const detectFileTypeFromUrl = (url: unknown): FileType => {
    if (typeof url !== 'string') return 'other'
    const lower = url.split('?')[0].toLowerCase()
    if (lower.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) return 'image'
    if (lower.endsWith('.pdf')) return 'pdf'
    if (lower.match(/\.(xls|xlsx|xlsm|csv)$/)) return 'excel'
    return 'other'
  }

  const getFileType = (file: ViewerFile): FileType => {
    if (file.mimeType) {
      const mime = file.mimeType.toLowerCase()
      if (mime.startsWith('image/')) return 'image'
      if (mime === 'application/pdf') return 'pdf'
      if (
        mime.includes('excel') ||
        mime.includes('spreadsheet') ||
        mime.includes('csv')
      )
        return 'excel'
      return 'other'
    }
    // fallback → URL extension (for normal http://… files)
    return detectFileTypeFromUrl(file.url)
  }

  const getExcelEmbedUrl = (url: string) =>
    `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      url,
    )}`

  const sizeClasses: Record<PanelSize, string> = {
    'half-screen': 'w-1/2',
    'small-half': 'w-1/3',
    'large-half': 'w-2/3',
  }

  const widthSize = sizeClasses[size] || sizeClasses['half-screen']

  const openViewer = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const closeViewer = () => setIsOpen(false)

  const showPrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? normalizedFiles.length - 1 : prev - 1,
    )
  }, [normalizedFiles.length])

  const showNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === normalizedFiles.length - 1 ? 0 : prev + 1,
    )
  }, [normalizedFiles.length])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeViewer()
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'ArrowLeft') showPrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, showNext, showPrev])

  const currentFile = normalizedFiles[currentIndex]
  const currentUrl = currentFile.url
  const currentType = getFileType(currentFile)

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.deltaY > 0) showNext()
    else if (e.deltaY < 0) showPrev()
  }

  const handleOpenInNewTab = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadCurrent = () => {
    try {
      const link = document.createElement('a')
      link.href = currentUrl
      link.download = ''
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      handleOpenInNewTab()
    }
  }

  // ---------- thumbnails ----------

  const renderThumb = (file: ViewerFile, index: number) => {
    const type = getFileType(file)

    if (type === 'image') {
      return (
        <img
          src={file.url}
          alt={`Image ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      )
    }

    if (type === 'pdf') {
      return (
        <div className="flex flex-col items-center justify-center space-y-1">
          <FileText className="h-8 w-8 text-red-500" />
          <span className="text-[11px] text-gray-700 font-medium">
            PDF {index + 1}
          </span>
        </div>
      )
    }

    if (type === 'excel') {
      return (
        <div className="flex flex-col items-center justify-center space-y-1">
          <FileSpreadsheet className="h-8 w-8 text-green-600" />
          <span className="text-[11px] text-gray-700 font-medium">
            Excel {index + 1}
          </span>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-1">
        <File className="h-8 w-8 text-gray-500" />
        <span className="text-[11px] text-gray-700 font-medium">
          File {index + 1}
        </span>
      </div>
    )
  }

  // ---------- main viewer content ----------

  const renderViewerContent = () => {
    if (currentType === 'image') {
      return (
        <img
          src={currentUrl}
          alt={`Image ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      )
    }

    if (currentType === 'pdf') {
      return (
        <iframe
          src={currentUrl}
          title={`PDF ${currentIndex + 1}`}
          className="w-full h-full"
        />
      )
    }

    if (currentType === 'excel') {
      const excelEmbedUrl = getExcelEmbedUrl(currentUrl)
      return (
        <iframe
          src={excelEmbedUrl}
          title={`Excel ${currentIndex + 1}`}
          className="w-full h-full"
        />
      )
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <File className="h-12 w-12 text-gray-500" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-800">
            Preview not supported.
          </p>
          <p className="text-xs text-gray-500 break-all">{currentUrl}</p>
        </div>
        <button
          type="button"
          onClick={handleOpenInNewTab}
          className="px-4 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-100"
        >
          Open in new tab
        </button>
      </div>
    )
  }

  // --- UI ------------------------------------------------------
  return (
    <div className="space-y-3">
      {/* Trigger */}
      {triggerLabel ? (
        <button
          type="button"
          onClick={() => openViewer(0)}
          className="text-sm font-medium underline hover:no-underline"
          style={{ color: COLORS.primary }}
        >
          {triggerLabel}
        </button>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {normalizedFiles.map((file, index) => (
            <button
              key={`${file.url}-${index}`}
              type="button"
              onClick={() => openViewer(index)}
              className="relative group focus:outline-none"
            >
              <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                {renderThumb(file, index)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-50"
          onClick={closeViewer}
        >
          <div
            className={`fixed right-0 top-0 h-full bg-white shadow-2xl flex flex-col ${widthSize}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-900">
                  {title || 'Preview'}
                </span>
                <span className="text-xs text-gray-500">
                  {currentIndex + 1} / {normalizedFiles.length}
                </span>
              </div>
              <button
                type="button"
                onClick={closeViewer}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div
                className="relative flex-1 bg-white flex items-center justify_center overflow-hidden"
                onWheel={handleWheel}
              >
                {normalizedFiles.length > 1 && (
                  <button
                    type="button"
                    onClick={showPrev}
                    className="absolute left-3 md:left-4 z-10 p-2 rounded-full bg-white/80 border border-gray-300 hover:bg-white"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-800" />
                  </button>
                )}

                {renderViewerContent()}

                {normalizedFiles.length > 1 && (
                  <button
                    type="button"
                    onClick={showNext}
                    className="absolute right-3 md:right-4 z-10 p-2 rounded-full bg-white/80 border border-gray-300 hover:bg-white"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-800" />
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 flex-none">
                <span className="text-xs text-gray-500">
                  Scroll mouse or use ← → keys to change, Esc to close
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadCurrent}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-100"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {normalizedFiles.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2.5 w-2.5 rounded-full transition-colors ${
                          index === currentIndex
                            ? 'bg-blue-600'
                            : 'bg-gray-300 hover:bg-blue-400'
                        }`}
                        aria-label={`Go to item ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
