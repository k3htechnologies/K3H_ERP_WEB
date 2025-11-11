import React, { forwardRef, useEffect } from 'react'
import { THEME } from '@/core/constants/theme'
import type { CheckboxProps } from '@/core/types/form.types'


export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  helperText,
  error,
  size = 'md',
  fullWidth = false,
  id,
  disabled = false,
  indeterminate = false,
  className = '',
  style,
  checked,
  defaultChecked,
  onChange,
  ...props
}, ref) => {
  const theme = THEME

  const sizeConfig: Record<string, { box: number; font: string }> = {
    sm: { box: 16, font: theme.fontSize.sm },
    md: { box: 20, font: theme.fontSize.md },
    lg: { box: 24, font: theme.fontSize.lg },
  }

  const cfg = sizeConfig[size] || sizeConfig.md
  const inputId = id || `chk-${Math.random().toString(36).slice(2, 9)}`

  useEffect(() => {
    if (!ref) return
    try {
      const el = (ref as React.RefObject<HTMLInputElement>).current
      if (el) el.indeterminate = Boolean(indeterminate)
    } catch {
      // ignore if ref is a callback or unavailable
    }
  }, [indeterminate, ref])

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    width: fullWidth ? '100%' : 'auto',
    marginBottom: theme.spacing.sm,
  }

  const labelStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: error ? theme.colors.error : theme.colors.text,
    fontSize: cfg.font,
    userSelect: 'none',
    flex: 1,
  }

  const checkboxStyle: React.CSSProperties = {
    width: `${cfg.box}px`,
    height: `${cfg.box}px`,
    display: 'inline-block',
    margin: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    accentColor: theme.colors.black, // modern browsers
  }

  const helperStyle: React.CSSProperties = {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.md,
    color: error ? theme.colors.error : theme.colors.primary,
  }

  return (
    <div style={wrapperStyle} className={className}>
      <label htmlFor={inputId} style={labelStyle}>
        <input
          id={inputId}
          ref={ref}
          type="checkbox"
          disabled={disabled}
          style={{ ...checkboxStyle, ...(style as React.CSSProperties) }}
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
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
