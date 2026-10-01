import { Info } from "lucide-react";
import { COLORS } from "@/core/constants";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
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

// Used to make sure only ONE tooltip is open at a time
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

  // Unique ID for this tooltip
  const tooltipId = useRef(Symbol());

  /*
   * Close this tooltip when another
   * FieldInfoTooltip is opened.
   */
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

  if (!value?.trim()) {
    return null;
  }

  /*
   * Open tooltip
   */
  const onEnter = () => {
    if (!iconRef.current) {
      return;
    }

    /*
     * Tell every other tooltip to close.
     */
    window.dispatchEvent(
      new CustomEvent(TOOLTIP_EVENT, {
        detail: tooltipId.current,
      })
    );

    const rect =
      iconRef.current.getBoundingClientRect();

    /*
     * Calculate horizontal position
     */
    let x = rect.left;

    // Prevent going outside right side
    if (
      x + TOOLTIP_WIDTH >
      window.innerWidth - SCREEN_MARGIN
    ) {
      x =
        window.innerWidth -
        TOOLTIP_WIDTH -
        SCREEN_MARGIN;
    }

    // Prevent going outside left side
    if (x < SCREEN_MARGIN) {
      x = SCREEN_MARGIN;
    }

    /*
     * Initially place below.
     * useLayoutEffect will change it to
     * above if there isn't enough space.
     */
    setPos({
      x,
      y: rect.bottom + TOOLTIP_GAP,
    });

    setShow(true);
  };

  /*
   * Calculate tooltip position after it
   * has been rendered.
   */
  useLayoutEffect(() => {
    if (
      !show ||
      !iconRef.current ||
      !tooltipRef.current
    ) {
      return;
    }

    const iconRect =
      iconRef.current.getBoundingClientRect();

    const tooltipRect =
      tooltipRef.current.getBoundingClientRect();

    /*
     * --------------------------------
     * HORIZONTAL POSITION
     * --------------------------------
     */

    let x = iconRect.left;

    // Right side
    if (
      x + tooltipRect.width >
      window.innerWidth - SCREEN_MARGIN
    ) {
      x =
        window.innerWidth -
        tooltipRect.width -
        SCREEN_MARGIN;
    }

    // Left side
    if (x < SCREEN_MARGIN) {
      x = SCREEN_MARGIN;
    }

    /*
     * --------------------------------
     * VERTICAL POSITION
     * --------------------------------
     */

    const spaceBelow =
      window.innerHeight - iconRect.bottom;

    const spaceAbove = iconRect.top;

    let y: number;

    /*
     * Enough space below
     */
    if (
      spaceBelow >=
      tooltipRect.height + TOOLTIP_GAP
    ) {
      y =
        iconRect.bottom +
        TOOLTIP_GAP;
    }

    /*
     * Enough space above
     */
    else if (
      spaceAbove >=
      tooltipRect.height + TOOLTIP_GAP
    ) {
      y =
        iconRect.top -
        tooltipRect.height -
        TOOLTIP_GAP;
    }

    /*
     * Not enough space either side.
     * Use side with more space.
     */
    else if (spaceBelow >= spaceAbove) {
      y =
        iconRect.bottom +
        TOOLTIP_GAP;

      // Prevent bottom overflow
      if (
        y + tooltipRect.height >
        window.innerHeight - SCREEN_MARGIN
      ) {
        y =
          window.innerHeight -
          tooltipRect.height -
          SCREEN_MARGIN;
      }
    } else {
      y =
        iconRect.top -
        tooltipRect.height -
        TOOLTIP_GAP;

      // Prevent top overflow
      if (y < SCREEN_MARGIN) {
        y = SCREEN_MARGIN;
      }
    }

    setPos({
      x,
      y,
    });
  }, [show]);

  /*
   * Recalculate position when browser
   * window is resized.
   */
  useLayoutEffect(() => {
    if (!show) {
      return;
    }

    const handleResize = () => {
      if (
        !iconRef.current ||
        !tooltipRef.current
      ) {
        return;
      }

      const iconRect =
        iconRef.current.getBoundingClientRect();

      const tooltipRect =
        tooltipRef.current.getBoundingClientRect();

      /*
       * --------------------------------
       * HORIZONTAL
       * --------------------------------
       */

      let x = iconRect.left;

      if (
        x + tooltipRect.width >
        window.innerWidth - SCREEN_MARGIN
      ) {
        x =
          window.innerWidth -
          tooltipRect.width -
          SCREEN_MARGIN;
      }

      if (x < SCREEN_MARGIN) {
        x = SCREEN_MARGIN;
      }

      /*
       * --------------------------------
       * VERTICAL
       * --------------------------------
       */

      const spaceBelow =
        window.innerHeight -
        iconRect.bottom;

      const spaceAbove =
        iconRect.top;

      let y: number;

      if (
        spaceBelow >=
        tooltipRect.height + TOOLTIP_GAP
      ) {
        y =
          iconRect.bottom +
          TOOLTIP_GAP;
      }

      else if (
        spaceAbove >=
        tooltipRect.height + TOOLTIP_GAP
      ) {
        y =
          iconRect.top -
          tooltipRect.height -
          TOOLTIP_GAP;
      }

      else if (spaceBelow >= spaceAbove) {
        y =
          iconRect.bottom +
          TOOLTIP_GAP;

        if (
          y + tooltipRect.height >
          window.innerHeight -
            SCREEN_MARGIN
        ) {
          y =
            window.innerHeight -
            tooltipRect.height -
            SCREEN_MARGIN;
        }
      }

      else {
        y =
          iconRect.top -
          tooltipRect.height -
          TOOLTIP_GAP;

        if (y < SCREEN_MARGIN) {
          y = SCREEN_MARGIN;
        }
      }

      setPos({
        x,
        y,
      });
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [show]);

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
            className="fixed z-[99999]"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: `${TOOLTIP_WIDTH}px`,
            }}
            onMouseEnter={() => {
              setShow(true);
            }}
            onMouseLeave={() => {
              setShow(false);
            }}
          >
            <div
              className="text-white text-sm px-4 py-3 rounded-lg shadow-2xl border max-h-60 overflow-y-auto thin-scroll"
              style={{
                backgroundColor:
                  COLORS.primary1,
                borderColor:
                  COLORS.primary1,
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