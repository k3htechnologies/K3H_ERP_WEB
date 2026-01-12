import React, { useState, useEffect, useCallback, useMemo } from "react";
import { THEME } from "@/core/constants/theme";
import { Clock } from "lucide-react";

interface TimePickerProps {
  label?: string;
  value?: string; // "14:30" or "02:30 PM"
  onChange?: (val: string) => void;
  size?: "sm" | "md" | "lg";
  error?: string;
  format?: 12 | 24;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  size = "md",
  error,
  format = 12,
  required = false,
  disabled = false,
  helperText,
  className = "",
  style,
}) => {
  
  const theme = THEME;

  type ParsedTime = {
    h: number;
    m: number;
    ap: "AM" | "PM";
  };
  // --- Parse value into hours, minutes, AM/PM ---
  const parseValue = useCallback(
    (val?: string): ParsedTime => {
      if (!val) {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const ap: "AM" | "PM" = h >= 12 ? "PM" : "AM";

        return format === 12
          ? { h: h % 12 || 12, m, ap }
          : { h, m, ap };
      }

      const [timePart, ampmPart] = val.split(" ");
      const [hStr, mStr] = timePart.split(":");

      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);

      if (format === 12) {
        const ap: "AM" | "PM" =
          ampmPart === "AM" || ampmPart === "PM"
            ? ampmPart
            : h >= 12
              ? "PM"
              : "AM";

        h = h % 12 || 12;
        return { h, m, ap };
      }

      return { h, m, ap: "AM" };
    },
    [format]
  );


  const initial = parseValue(value);
  const [hours, setHours] = useState(initial.h);
  const [minutes, setMinutes] = useState(initial.m);
  const [ampm, setAmpm] = useState<"AM" | "PM">(initial.ap);

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const parsed = parseValue(value);
    setHours(parsed.h);
    setMinutes(parsed.m);
    setAmpm(parsed.ap);
  }, [value, parseValue]);

  const sizeConfig = useMemo(
    () => ({
      sm: { height: "36px", padding: `${theme.spacing.sm} ${theme.spacing.md}`, fontSize: theme.fontSize.sm, iconSize: 16 },
      md: { height: "44px", padding: `${theme.spacing.md} ${theme.spacing.lg}`, fontSize: theme.fontSize.md, iconSize: 20 },
      lg: { height: "52px", padding: `${theme.spacing.lg} ${theme.spacing.xl}`, fontSize: theme.fontSize.lg, iconSize: 24 },
    }),
    [theme]
  );

  const currentSize = sizeConfig[size];

  // --- Format time string for output ---
  const formatTime = (h: number, m: number, ap: "AM" | "PM") => {
    if (format === 24) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ap}`;
  };

  const handleChange = (h: number, m: number, ap: "AM" | "PM") => {
    setHours(h);
    setMinutes(m);
    setAmpm(ap);
    onChange?.(formatTime(h, m, ap));
  };

  const getSelectStyles = (): React.CSSProperties => ({
    width: "100%",
    height: currentSize.height,
    padding: currentSize.padding,
    fontSize: currentSize.fontSize,
    fontWeight: theme.fontWeight.normal,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border}`,
    backgroundColor: disabled ? theme.colors.backgroundSecondary : theme.colors.background,
    color: disabled ? theme.colors.textLight :'',
    outline: "none",
    transition: theme.transitions.normal,
    boxSizing: "border-box",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: isFocused && !error ? theme.shadows.focus : theme.shadows.sm,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "12px",
    paddingRight: "36px",
  });

  return (

    <div className={className} style={{ position: "relative", width: "100%", ...style }}>
      
      {label && (

        <div style={{ marginBottom: "6px", fontSize: currentSize.fontSize, fontWeight: theme.fontWeight.medium, color: theme.colors.black }}>

          {label}

          {required && <span style={{ color: theme.colors.error, marginLeft: "4px" }}>*</span>}
          
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm, position: "relative" }}>
        <div style={{ position: "absolute", left: "12px", zIndex: 1, pointerEvents: "none", color: error ? theme.colors.error : theme.colors.textSecondary }}>
          <Clock size={currentSize.iconSize} />
        </div>

        {/* Hours */}
        <div style={{ flex: 1 }}>
          <select
            value={hours}
            onChange={(e) => handleChange(Number(e.target.value), minutes, ampm)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            style={{ ...getSelectStyles(), paddingLeft: "42px" }}
          >
            {Array.from({ length: format === 12 ? 12 : 24 }, (_, i) => i + (format === 12 ? 1 : 0)).map((h) => (
              <option key={h} value={h}>
                {h.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div style={{ fontSize: currentSize.fontSize, fontWeight: theme.fontWeight.bold, color: theme.colors.textSecondary, padding: `0 ${theme.spacing.xs}` }}>
          :
        </div>
        
        {/* Minutes */}
        <div style={{ flex: 1 }}>
          <select
            value={minutes}
            onChange={(e) => handleChange(hours, Number(e.target.value), ampm)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            style={getSelectStyles()}
          >
            {Array.from({ length: 60 }, (_, i) => i).map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p style={{ color: theme.colors.error, fontSize: theme.fontSize.sm, marginTop: "4px" }}>{error}</p>}
      {helperText && !error && <p style={{ color: theme.colors.textLight, fontSize: theme.fontSize.sm, marginTop: "4px" }}>{helperText}</p>}
    </div>
  );
};
