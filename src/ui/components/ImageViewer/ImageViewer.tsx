import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X, ChevronLeft, ChevronRight, Download, Eye, Minimize2, Maximize2 } from "lucide-react";
import { COLORS } from "@/core/constants";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { handleExportFile } from "@/core/utils/exportFile";
import { useToast } from "@/core/hooks/useToast";

type PanelSize = "sm" | "md" | "lg" | "xl";

interface MultiImageViewerProps {
  images: Array<string>;
  title?: string;
  triggerLabel?: React.ReactNode;
  size?: PanelSize;
  closeOnOverlayClick?: boolean;
  overlayZIndex?: number; // optional override
  isIcon?: boolean;
  isWrap?: boolean;
}

const sizeClasses: Record<PanelSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export const MultiImageViewer: React.FC<MultiImageViewerProps> = ({
  images,
  title = "Preview",
  triggerLabel,
  size = "sm",
  closeOnOverlayClick = true,
  overlayZIndex = 9999,
  isIcon = true,
  isWrap = true,
}) => {



  const imageUrls = (images || []).filter((u) => typeof u === "string" && u.trim() !== "");

  const isPdf = (url: string) => url.toLowerCase().includes(".pdf") || url.startsWith("blob:");


  const total = imageUrls.length;

  const [isOpen, setIsOpen] = useState(false);

  const [index, setIndex] = useState(0);

  const [isMaximized, setIsMaximized] = useState(false);

  // open viewer at a given index
  const open = (i = 0) => {
    setIndex(Math.max(0, Math.min(i, Math.max(0, total - 1))));
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setIsMaximized(false); // reset maximize state
  };


  useEffect(() => {

    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((p) => (p + 1) % total);
      if (e.key === "ArrowLeft") setIndex((p) => (p - 1 + total) % total);
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);

  }, [isOpen, total]);


  useEffect(() => {

    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    try {
      document.body.style.overflow = "hidden";
    } catch { }
    return () => {
      try {
        document.body.style.overflow = prevOverflow ?? "";
      } catch { }
    };

  }, [isOpen]);




  const prev = useCallback(() => setIndex((p) => (p - 1 + total) % total), [total]);
  const next = useCallback(() => setIndex((p) => (p + 1) % total), [total]);

  // TOAST
  const { addToast } = useToast();

  const handleDownload = async () => {

    const url = imageUrls[index];

    const extension = url.split('.').pop()?.toLowerCase();

    let exportType: 'Excel' | 'PDF' | 'Image' | 'Word' | 'Other' = 'Other';

    if (['xls', 'xlsx'].includes(extension || '')) {
      exportType = 'Excel';
    } else if (extension === 'pdf') {
      exportType = 'PDF';
    } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '')) {
      exportType = 'Image';
    } else if (['doc', 'docx'].includes(extension || '')) {
      exportType = 'Word';
    }

    const response = await technicalService.apiCallGetDownloadURL(url);

    handleExportFile(response, exportType, title, addToast, "Download successfully");

  };


  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) next();
    else prev();
  };


  const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (typeof document === "undefined") return <>{children}</>;
    return ReactDOM.createPortal(children, document.body);
  };


  if (total === 0) {
    return triggerLabel ? <span>{triggerLabel}</span> : null;
  }


  const ViewerContent = () => (
    <div
      className={`bg-white shadow-xl w-full flex flex-col transition-all
      ${isMaximized
          ? "fixed inset-0 rounded-none max-w-none h-screen"
          : `${sizeClasses[size]} rounded-lg max-h-[90vh]`
        }`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
        <h3 className="text-md font-semibold text-gray-900 truncate">{title}</h3>

        <div className="flex gap-2">
          <button
            onClick={() => setIsMaximized((p) => !p)}
            className="px-2 hover:bg-gray-100 rounded"
          >
            {isMaximized ? <Minimize2 className="h-5 w-5 text-gray-700" /> : <Maximize2 className="h-5 w-5 text-gray-700" />}
          </button>
          <button
            type="button"
            onClick={close}
            className="p-1.5 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center bg-gray-50" onWheel={!isPdf(imageUrls[index]) ? onWheel : undefined}>
        {isPdf(imageUrls[index]) ? (
          <iframe
            src={imageUrls[index]}
            className="w-full h-full"
            title="pdf-preview"
          />
        ) : (
          <img
            src={imageUrls[index]}
            alt={`Image ${index + 1}`}
            className="max-h-[75vh] max-w-full object-contain"
            style={{ userSelect: "none" }}
          />
        )}

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          <span className="text-xs text-gray-500">
            {index + 1} / {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Overlay render (centered)
  return (
    <div className="inline-block">

      {triggerLabel ? (
        <>
          <div className="flex items-center gap-2">

            <span className={isWrap ? 'break-all whitespace-normal max-w-full' : ''}>
              {isIcon && triggerLabel}
            </span>

            <button
              type="button"
              onClick={() => open(0)}
              className="flex items-center gap-1 text-sm font-medium p-0"
              style={{ background: 'transparent', border: 'none', color: COLORS.primary1 }}
            >
              <Eye size={16} />

            </button>
          </div>

        </>
      ) : (
        // fallback small thumbnail grid
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {imageUrls.map((u, i) => (
            <button key={u + i} type="button" onClick={() => open(i)} className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              <img src={u} alt={`thumb-${i}`} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}

      {/* Portal overlay */}
      {isOpen && (
        <Portal>
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: overlayZIndex, background: "rgba(0,0,0,0.3)" }}
            onClick={() => (closeOnOverlayClick ? close() : undefined)}
          >
            <ViewerContent />
          </div>
        </Portal>
      )}
    </div>
  );
};

export default MultiImageViewer;
