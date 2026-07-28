import { Info } from "lucide-react";
import { COLORS } from "@/core/constants";
import React, { useState } from "react";
import { createPortal } from "react-dom";

interface FieldInfoTooltipProps {
  value?: string | null;
  size?: number;
}

const FieldInfoTooltip: React.FC<FieldInfoTooltipProps> = ({
  value,
  size = 16,
}) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  if (!value?.trim()) return null;

  const onEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: rect.left,
      y: rect.bottom + 8,
    });
    setShow(true);
  };

  return (
    <>
      <span
        className="inline-flex cursor-pointer"
        onMouseEnter={onEnter}
        onMouseLeave={() => setShow(false)}
      >
        <Info size={size} color={COLORS.primary1} />
      </span>

      {show &&
        createPortal(
          <div
            className="fixed z-[99999] pointer-events-none"
            style={{
              left: pos.x,
              top: pos.y,
              maxWidth: "300px",
            }}
          >
            <div
              className="text-white text-sm px-4 py-3 rounded-lg shadow-2xl border"
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