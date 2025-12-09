// ImageCarousel.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";

interface ImageCarouselProps {
  images?: string | string[] | null;
  className?: string;                // extra classes applied to root container
  containerClassName?: string;       // tailwind class to control width e.g. "max-w-[400px] w-full"
  containerStyle?: React.CSSProperties; // inline style for width e.g. { width: 400 }
  thumbHeight?: string;              // e.g. "h-28" / "h-32"
  showDots?: boolean | null;
  onImageClick?: (index: number) => void;
  autoSlideMs?: number;
  wheelCooldownMs?: number;
}

const normalizeImages = (images?: string | string[] | null): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) return images.map((x) => (x ?? "").trim()).filter(Boolean);
  return (images || "").split(",").map((x) => x.trim()).filter(Boolean);
};

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  className = "",
  containerClassName = "w-full",
  containerStyle,
  thumbHeight = "h-28",
  showDots = null,
  onImageClick,
  autoSlideMs = 2500,
  wheelCooldownMs = 180,
}) => {
  const urls = normalizeImages(images);
  const total = urls.length;
  const [index, setIndex] = useState(0);
  const lastWheelRef = useRef(0);

  // Auto slide
  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % total), autoSlideMs);
    return () => clearInterval(id);
  }, [total, autoSlideMs]);

  // clamp index
  useEffect(() => setIndex((i) => (i >= total ? Math.max(0, total - 1) : i)), [total]);

  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  // wheel
  const onWheel = (e: React.WheelEvent) => {
    if (total <= 1) return;
    const now = Date.now();
    if (now - lastWheelRef.current < wheelCooldownMs) return;
    lastWheelRef.current = now;
    if (e.deltaY > 0) next();
    else prev();
  };

  // touch
  const startX = useRef(0);
  const touching = useRef(false);
  const onTouchStart = (e: React.TouchEvent) => {
    touching.current = true;
    startX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touching.current) return;
    const diff = e.touches[0].clientX - startX.current;
    if (Math.abs(diff) > 40) {
      touching.current = false;
      if (diff < 0) next();
      else prev();
    }
  };
  const onTouchEnd = () => { touching.current = false; };

  // pointer (trackpad gestures)
  const ptrStart = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => { ptrStart.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    const diff = e.clientX - ptrStart.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) next();
      else prev();
    }
  };

  const showDotUI = typeof showDots === "boolean" ? showDots : total > 1;
  if (total === 0) return null;

  return (
    <div className={`relative ${className} select-none`}>
      {/* container that controls width */}
      <div
        className={`${containerClassName} mx-auto rounded overflow-hidden`}
        style={containerStyle}
      >
        {/* Image area */}
        <div
          className={`w-full ${thumbHeight} flex items-center justify-center bg-gray-50`}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          style={{ touchAction: "pan-y" }}
        >
          {/* set img to cover the container while preserving aspect ratio */}
          <img
            src={urls[index]}
            alt={`carousel-img-${index + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            draggable={false}
            onClick={() => onImageClick?.(index)}
          />
        </div>
      </div>

      {/* dots */}
      {showDotUI && total > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2 mb-2">
          {urls.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${i === index ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`go-to-${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
