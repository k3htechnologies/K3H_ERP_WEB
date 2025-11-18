import React, { forwardRef } from 'react'
import { THEME } from '@/core/constants/theme'
import type { DatePickerProps } from '@/core/types/form.types'

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({
  label,
  helperText,
  error,
  size = 'md',
  fullWidth = false,
  id,
  disabled = false,
  className = '',
  style,
  value,
  onChange,
  placeholder = 'Select date',
  ...props
}, ref) => {

  const theme = THEME

  // ------------------------------
  // Match Dropdown Height EXACT
  // ------------------------------
  const sizeConfig: Record<
    string,
    { height: number; font: number; padding: string }
  > = {
    sm: { height: 34, font: 12, padding: "6px 10px" },  // matches dropdown sm
    md: { height: 40, font: 14, padding: "8px 12px" },  // matches dropdown md
    lg: { height: 44, font: 16, padding: "8px 14px" },  // matches dropdown lg
  }

  const cfg = sizeConfig[size] || sizeConfig.md
  const inputId = id || `dtp-${Math.random().toString(36).slice(2, 9)}`

  // Wrapper
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: fullWidth ? '100%' : 'auto',
    marginBottom: theme.spacing.sm,
  }

  // Label
  const labelStyle: React.CSSProperties = {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: error ? theme.colors.error : theme.colors.text,
    marginBottom: theme.spacing.xs,
  }

  // Input
  const inputStyle: React.CSSProperties = {
    height: `${cfg.height}px`,
    fontSize: cfg.font,
    padding: cfg.padding,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
    backgroundColor: disabled ? theme.colors.disabled : theme.colors.background,
    color: theme.colors.text,
    outline: 'none',
    boxSizing: 'border-box',
    width: fullWidth ? '100%' : 'auto',
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  }

  // Helper text
  const helperStyle: React.CSSProperties = {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: error ? theme.colors.error : theme.colors.primary,
  }

  return (
    <div style={wrapperStyle} className={className}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        ref={ref}
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        style={inputStyle}
        {...props}
      />

      {(error || helperText) && (
        <div style={helperStyle} aria-live="polite">
          {error || helperText}
        </div>
      )}
    </div>
  )
})

DatePicker.displayName = 'DatePicker'

export default DatePicker
