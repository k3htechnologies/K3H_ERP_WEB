import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Input } from "@/ui/components/forms";
import { THEME } from "@/core/constants/theme";

interface MonthPickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

const formatMonthYear = (date: Date | null) => {
  if (!date) return "";
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
};

export const MonthPicker: React.FC<MonthPickerProps> = ({
  label,
  value,
  onChange,
  required,
  error,
  disabled = false,
  minYear = 1950,
  maxYear = new Date().getFullYear() + 20
}) => {

  const theme = THEME;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [portalPos, setPortalPos] = useState<{ left: number; top: number } | null>(null);

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  /* ================= Position ================= */

  const updatePosition = useCallback(() => {

    const rect = wrapperRef.current?.getBoundingClientRect();

    if (!rect) return;

    setPortalPos({
      left: rect.right - 320,
      top: rect.bottom + 8
    });

  }, []);

  useEffect(() => {

    if (!isOpen) return;

    updatePosition();

    const handle = () => updatePosition();

    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);

    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };

  }, [isOpen, updatePosition]);

  /* ================= Outside Click ================= */

  useEffect(() => {

    const close = (e: MouseEvent) => {

      const target = e.target as Node;

      if (
        wrapperRef.current?.contains(target) ||
        portalRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);

    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);

  }, []);

  /* ================= Sync Selected Value ================= */

  useEffect(() => {

    if (!value) return;

    const [, yyyy] = value.split("-").map(Number);

    if (yyyy) {
      setCurrentYear(yyyy);
    }

  }, [value]);

  /* ================= Month Click ================= */

  const handleMonthClick = (monthIndex: number) => {

    const date = new Date(currentYear, monthIndex, 1);

    const formatted = formatMonthYear(date);

    onChange(formatted);

    setIsOpen(false);

  };

  /* ================= Selected Month ================= */

  const selectedMonth = value ? Number(value.split("-")[0]) - 1 : null;
  const selectedYear = value ? Number(value.split("-")[1]) : null;

  /* ================= Years ================= */

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );

  return (

    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>

      <Input
        label={label}
        value={value || ""}
        readOnly
        required={required}
        disabled={disabled}
        error={error}
        placeholder="MM-YYYY"
        onClick={() => !disabled && setIsOpen(p => !p)}
        rightIcon={<Calendar size={18} />}
      />

      {isOpen && portalPos &&

        createPortal(

          <div
            ref={portalRef}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              left: portalPos.left,
              top: portalPos.top,
              width: 320,
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.lg,
              padding: 16,
              zIndex: 9999
            }}
          >

            {/* Header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10
              }}
            >

              <button
                onClick={() => setCurrentYear(y => Math.max(minYear, y - 1))}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer"
                }}
              >
                <ChevronLeft size={18}/>
              </button>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                style={{
                  borderRadius: 6,
                  border: `1px solid ${theme.colors.border}`,
                  padding: "4px 8px"
                }}
              >
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setCurrentYear(y => Math.min(maxYear, y + 1))}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer"
                }}
              >
                <ChevronRight size={18}/>
              </button>

            </div>

            {/* Month Grid */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8
              }}
            >

              {months.map((m, i) => {

                const isSelected =
                  selectedMonth === i &&
                  selectedYear === currentYear;

                return (

                  <button
                    key={m}
                    onClick={() => handleMonthClick(i)}
                    style={{
                      padding: "8px 0",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontSize: theme.fontSize.sm,
                      background: isSelected
                        ? theme.colors.primary1
                        : "transparent",
                      color: isSelected
                        ? "#fff"
                        : theme.colors.text
                    }}
                  >
                    {m}
                  </button>

                );

              })}

            </div>

          </div>,

          document.body

        )

      }

    </div>

  );

};

export default MonthPicker;