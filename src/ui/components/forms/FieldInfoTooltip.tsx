import { Info } from "lucide-react";
import { COLORS } from "@/core/constants";
import React, {
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

  if (!value?.trim()) {
    return null;
  }

  const onEnter = () => {
    if (!iconRef.current) {
      return;
    }

    const rect = iconRef.current.getBoundingClientRect();

    let x = rect.left;

    if (
      x + TOOLTIP_WIDTH >
      window.innerWidth - SCREEN_MARGIN
    ) {
      x =
        window.innerWidth -
        TOOLTIP_WIDTH -
        SCREEN_MARGIN;
    }

    if (x < SCREEN_MARGIN) {
      x = SCREEN_MARGIN;
    }

    setPos({
      x,
      y: rect.bottom + TOOLTIP_GAP,
    });

    setShow(true);
  };

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

    const spaceBelow =
      window.innerHeight - iconRect.bottom;

    const spaceAbove = iconRect.top;

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

      if (y < SCREEN_MARGIN) {
        y = SCREEN_MARGIN;
      }
    }

    setPos({
      x,
      y,
    });
  }, [show]);


  useLayoutEffect(() => {
    if (!show) {
      return;
    }

    const handleResize = () => {
      if ( !iconRef.current || !tooltipRef.current) {
        return;
      }

      const iconRect =iconRef.current.getBoundingClientRect();

      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let x = iconRect.left;

      if (  x + tooltipRect.width >  window.innerWidth - SCREEN_MARGIN) {
        x =  window.innerWidth - tooltipRect.width - SCREEN_MARGIN;
      }

      if (x < SCREEN_MARGIN) {
        x = SCREEN_MARGIN;
      }


      const spaceBelow =  window.innerHeight - iconRect.bottom;

      const spaceAbove = iconRect.top;

      let y: number;

      if ( spaceBelow >= tooltipRect.height + TOOLTIP_GAP) {
        y = iconRect.bottom + TOOLTIP_GAP;
      } else if ( spaceAbove >=  tooltipRect.height + TOOLTIP_GAP) {
        y = iconRect.top - tooltipRect.height - TOOLTIP_GAP;
      } else if (spaceBelow >= spaceAbove) {

        y = iconRect.bottom + TOOLTIP_GAP;

        if ( y + tooltipRect.height > window.innerHeight - SCREEN_MARGIN ) {
          y = window.innerHeight - tooltipRect.height - SCREEN_MARGIN;
        }
      } else {

        y = iconRect.top - tooltipRect.height - TOOLTIP_GAP;

        if (y < SCREEN_MARGIN) {
          y = SCREEN_MARGIN;
        }
      }

      setPos({ x, y, });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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
          <Info size={size} color={COLORS.primary1} />
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