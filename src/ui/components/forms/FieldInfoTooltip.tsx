import { Info } from "lucide-react";
import { COLORS } from "@/core/constants";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";

interface FieldInfoTooltipProps {
  value?: string | null;
  size?: number;
  label?: string | null;
  isRow?: boolean;
}

const TOOLTIP_WIDTH = 300;
const TOOLTIP_GAP = 8;
const SCREEN_MARGIN = 10;

const TOOLTIP_EVENT = "field-info-tooltip-open";

const FieldInfoTooltip: React.FC<FieldInfoTooltipProps> = ({
  value,
  size = 16,
  label,
}) => {
  const [show, setShow] = useState(false);

  const [pos, setPos] = useState({
    x: 0,
    y: 0,
  });

  const iconRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const tooltipId = useRef(Symbol());

  // Close other tooltips when a new one opens
  useEffect(() => {
    const handleAnotherTooltipOpen = (event: Event) => {
      const customEvent = event as CustomEvent<symbol>;

      if (customEvent.detail !== tooltipId.current) {
        setShow(false);
      }
    };

    window.addEventListener(
      TOOLTIP_EVENT,
      handleAnotherTooltipOpen
    );

    return () => {
      window.removeEventListener(
        TOOLTIP_EVENT,
        handleAnotherTooltipOpen
      );
    };
  }, []);

  const updateTooltipPosition = useCallback(() => {
    if (!iconRef.current || !tooltipRef.current) {
      return;
    }

    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    // Horizontal position
    let x = iconRect.left;

    if (x + tooltipWidth > window.innerWidth - SCREEN_MARGIN) {
      x = window.innerWidth - tooltipWidth - SCREEN_MARGIN;
    }

    x = Math.max(SCREEN_MARGIN, x);

    // Always position below the icon
    let y = iconRect.bottom + TOOLTIP_GAP;

    // Prevent tooltip from exceeding the bottom viewport boundary
    if (y + tooltipHeight > window.innerHeight - SCREEN_MARGIN) {
      y = Math.max(
        SCREEN_MARGIN,
        window.innerHeight - tooltipHeight - SCREEN_MARGIN
      );
    }

    setPos((previous) => {
      if (previous.x === x && previous.y === y) {
        return previous;
      }

      return { x, y };
    });
  }, []);

  const onEnter = () => {
    if (!iconRef.current) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(TOOLTIP_EVENT, {
        detail: tooltipId.current,
      })
    );

    const rect = iconRef.current.getBoundingClientRect();

    let x = rect.left;

    if (x + TOOLTIP_WIDTH > window.innerWidth - SCREEN_MARGIN) {
      x = window.innerWidth - TOOLTIP_WIDTH - SCREEN_MARGIN;
    }

    x = Math.max(SCREEN_MARGIN, x);

    setPos({
      x,
      y: rect.bottom + TOOLTIP_GAP,
    });

    setShow(true);
  };

  // Recalculate position after rendering and during scrolling
  useLayoutEffect(() => {
    if (!show) {
      return;
    }

    const handlePositionUpdate = () => {
      updateTooltipPosition();
    };

    // Calculate after tooltip is rendered
    handlePositionUpdate();

    // Window resize
    window.addEventListener(
      "resize",
      handlePositionUpdate
    );

    // Capture scroll events from window and nested containers
    window.addEventListener(
      "scroll",
      handlePositionUpdate,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        handlePositionUpdate
      );

      window.removeEventListener(
        "scroll",
        handlePositionUpdate,
        true
      );
    };
  }, [show, updateTooltipPosition]);

  // Hide tooltip if icon scrolls outside the viewport
  useEffect(() => {
    if (!show) {
      return;
    }

    const handleScroll = () => {
      if (!iconRef.current) {
        setShow(false);
        return;
      }

      const rect =
        iconRef.current.getBoundingClientRect();

      const isOutsideViewport =
        rect.bottom < 0 ||
        rect.top > window.innerHeight ||
        rect.right < 0 ||
        rect.left > window.innerWidth;

      if (isOutsideViewport) {
        setShow(false);
      }
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, [show]);

  // Hide if there is no value
  if (!value?.trim()) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        {label?.trim() && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <span
          ref={iconRef}
          className="inline-flex cursor-pointer"
          onMouseEnter={onEnter}
          onFocus={onEnter}
          tabIndex={0}
          role="button"
          aria-label={label || "Field information"}
          aria-describedby={
            show ? "field-info-tooltip" : undefined
          }
        >
          <Info
            size={size}
            color={COLORS.primary1}
          />
        </span>
      </div>

      {show &&
        createPortal(
          <div
            ref={tooltipRef}
            id="field-info-tooltip"
            role="tooltip"
            className="fixed z-[99999] pointer-events-auto"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: `${TOOLTIP_WIDTH}px`,
              maxWidth: `calc(100vw - ${SCREEN_MARGIN * 2}px)`,
            }}
            onMouseEnter={() => {
              setShow(true);
            }}
            onMouseLeave={() => {
              setShow(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setShow(false);
              }
            }}
          >
            <div
              className="text-white text-sm px-4 py-3 rounded-lg shadow-2xl border max-h-60 overflow-y-auto thin-scroll"
              style={{
                backgroundColor: COLORS.primary1,
                borderColor: COLORS.primary1,
              }}
            >
              <div className="break-words whitespace-normal">
                {value}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default FieldInfoTooltip;