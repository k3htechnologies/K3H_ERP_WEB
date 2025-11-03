// src/core/ui/forms/Input.tsx
import { forwardRef } from 'react'
import { THEME } from '../../../core/constants/theme'
import type { InputProps } from '../../../core/types/form.types'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      color = 'primary',
      disabled = false,
      loading = false,
      fullWidth = true,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const theme = THEME

    const sizeConfig = {
      sm: { height: '36px', padding: `${theme.spacing.sm} ${theme.spacing.md}`, fontSize: theme.fontSize.sm, iconSize: '16px' },
      md: { height: '44px', padding: `${theme.spacing.md} ${theme.spacing.lg}`, fontSize: theme.fontSize.md, iconSize: '20px' },
      lg: { height: '52px', padding: `${theme.spacing.lg} ${theme.spacing.xl}`, fontSize: theme.fontSize.lg, iconSize: '24px' },
    }

    const currentSize = sizeConfig[size]

    const baseStyles = {
      width: fullWidth ? '100%' : 'auto',
      height: currentSize.height,
      padding: currentSize.padding,
      fontSize: currentSize.fontSize,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${theme.colors.border}`,
      transition: theme.transitions.normal,
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box' as const,
    }

    const inputStyles = {
      ...baseStyles,
      ...(disabled && { opacity: 0.6, cursor: 'not-allowed' }),
      ...(loading && { cursor: 'wait' }),
    }

    const focusStyles = {
      borderColor: error ? theme.colors.error : theme.colors.primary,
      boxShadow: `0 0 0 3px ${error ? theme.colors.errorLight : theme.colors.primaryLight}`,
    }

    return (
      <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: theme.spacing.lg }}>
        {label && (
          <label
            style={{
              fontWeight: theme.fontWeight.medium,
              color: error ? theme.colors.error : theme.colors.text,
              display: 'block',
              marginBottom: theme.spacing.sm,
            }}
          >
            {label}
            {props.required && <span style={{ color: theme.colors.error }}> *</span>}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {leftIcon && <div style={{ position: 'absolute', left: theme.spacing.md }}>{leftIcon}</div>}
          <input
            ref={ref}
            {...props}
            disabled={disabled || loading}
            style={{ ...inputStyles, ...style }}
            className={className}
            onFocus={(e) => {
              Object.assign(e.target.style, focusStyles)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, inputStyles)
              props.onBlur?.(e)
            }}
          />
          {rightIcon && <div style={{ position: 'absolute', right: theme.spacing.md }}>{rightIcon}</div>}
        </div>
        {(error || helperText) && (
          <div style={{ marginTop: theme.spacing.sm, color: error ? theme.colors.error : theme.colors.textSecondary }}>
            {error || helperText}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
