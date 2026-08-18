import { Info } from "lucide-react";
import { COLORS } from "@/core/constants";
import React, { useState } from "react";
import { createPortal } from "react-dom";

interface FieldInfoTooltipProps {
  value?: string | null;
  size?: number;
  label?: string | null;
  isRow?: boolean;
}

const FieldInfoTooltip: React.FC<FieldInfoTooltipProps> = ({
  value,
  size = 16,
  label,

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
      <div className="flex flex-col items-start gap-1">
        {label?.trim() && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <span
          className="inline-flex cursor-pointer"
          onMouseEnter={onEnter}
          onMouseLeave={() => setShow(false)}
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