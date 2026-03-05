import React, { forwardRef } from "react";
import { THEME } from "@/core/constants/theme";

export interface RadioButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  id?: string;
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    {
      label,
      helperText,
      error,
      size = "md",
      fullWidth = false,
      id,
      disabled = false,
      className = "",
      style,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref
  ) => {
    const theme = THEME;

    const sizeConfig: Record<string, { dot: number; font: string }> = {
      sm: { dot: 14, font: theme.fontSize.sm },
      md: { dot: 18, font: theme.fontSize.md },
      lg: { dot: 22, font: theme.fontSize.lg }
    };

    const cfg = sizeConfig[size] || sizeConfig.md;
    const inputId =
      id || `radio-${Math.random().toString(36).slice(2, 9)}`;

    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
      width: fullWidth ? "100%" : "auto",
      marginBottom: theme.spacing.sm
    };

    const labelStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: theme.spacing.sm,
      cursor: disabled ? "not-allowed" : "pointer",
      color: error ? theme.colors.error : theme.colors.text,
      fontSize: cfg.font,
      userSelect: "none",
      flex: 1
    };

    const radioStyle: React.CSSProperties = {
      width: `${cfg.dot}px`,
      height: `${cfg.dot}px`,
      display: "inline-block",
      margin: 0,
      cursor: disabled ? "not-allowed" : "pointer",
      accentColor: theme.colors.primary1
    };

    const helperStyle: React.CSSProperties = {
      marginTop: theme.spacing.xs,
      fontSize: theme.fontSize.md,
      color: error ? theme.colors.error : theme.colors.primary
    };

    return (
      <div style={wrapperStyle} className={className}>
        <label htmlFor={inputId} style={labelStyle}>
          <input
            id={inputId}
            ref={ref}
            type="radio"
            disabled={disabled}
            style={{ ...radioStyle, ...(style as React.CSSProperties) }}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            {...props}
          />

          {label}
        </label>

        {(error || helperText) && (
          <div style={helperStyle} aria-live="polite">
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

RadioButton.displayName = "RadioButton";

export default RadioButton;
