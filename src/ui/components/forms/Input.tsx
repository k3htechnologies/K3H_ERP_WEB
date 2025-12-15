import { forwardRef } from 'react'
import { THEME } from '@/core/constants/theme'
import type { InputProps } from '@/core/types/form.types'
import {  InfoIcon } from 'lucide-react'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
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
    required,
    ...props
  }, ref) => {
    const theme = THEME

    // Size configurations
    const sizeConfig = {
      sm: {
        height: '36px',
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.fontSize.sm,
        iconSize: '16px',
      },
      md: {
        height: '44px',
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        fontSize: theme.fontSize.md,
        iconSize: '20px',
      },
      lg: {
        height: '52px',
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
        fontSize: theme.fontSize.lg,
        iconSize: '24px',
      },
    }

    const currentSize = sizeConfig[size]

    // Variant styles
    const getVariantStyles = () => {
      const baseStyles = {
        width: fullWidth ? '100%' : 'auto',
        height: currentSize.height,
        padding: leftIcon ? `${currentSize.padding.split(' ')[0]} ${currentSize.padding.split(' ')[1]} ${currentSize.padding.split(' ')[0]} 40px` :
          rightIcon ? `${currentSize.padding.split(' ')[0]} 40px ${currentSize.padding.split(' ')[0]} ${currentSize.padding.split(' ')[1]}` :
            currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: theme.fontWeight.normal,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
        outline: 'none',
        transition: theme.transitions.normal,
        boxSizing: 'border-box' as const,
      }

      switch (variant) {
        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.sm,
          }
        case 'outlined':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderWidth: '2px',
          }
        default:
          return {
            ...baseStyles,
            backgroundColor: theme.colors.background,
            boxShadow: theme.shadows.sm,
          }
      }
    }

    const inputStyles = {
      ...getVariantStyles(),
      ...(disabled && {
        backgroundColor: theme.colors.backgroundSecondary,
        color: theme.colors.textLight,
        cursor: 'not-allowed',
        opacity: 0.6,
      }),
      ...(loading && {
        cursor: 'wait',
        opacity: 0.8,
      }),
      ...(props.readOnly && !disabled && {
        cursor: 'pointer',
      }),
    }

    const focusStyles = {
      borderColor: error ? theme.colors.error : theme.colors.primaryLight,
      boxShadow: error ? `0 0 0 1px ${theme.colors.error}` : `0 0 0 1px ${theme.colors.primaryLight}`,
      backgroundColor: variant === 'filled' ? theme.colors.background : theme.colors.background,
    }

    return (
      <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: theme.spacing.sm }}>
        {label && (
          <label style={{
            display: 'block',
            fontSize: theme.fontSize.sm,
            fontWeight: theme.fontWeight.medium,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}>
            {label}
            {required && <span style={{ color: theme.colors.error, marginLeft: '4px' }}>*</span>}
          </label>

        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <div style={{
              position: 'absolute',
              left: theme.spacing.md,
              zIndex: 1,
              color: theme.colors.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: currentSize.iconSize,
              height: currentSize.iconSize,
            }}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            disabled={disabled || loading}
            style={{
              ...inputStyles,
              ...style

            }}


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

          {rightIcon && (
            <div style={{
              position: 'absolute',
              right: theme.spacing.xl,
              zIndex: 1,
              color: theme.colors.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: currentSize.iconSize,
              height: currentSize.iconSize,
            }}>
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div
            style={{
              marginTop: theme.spacing.sm,
              fontSize: theme.fontSize.sm,
              color: error ? theme.colors.error : theme.colors.textSecondary,
              display: "flex",
              alignItems: "center",
              gap: "6px",       // spacing between icon & text
            }}
          >
            <InfoIcon
              style={{
                fontSize: theme.fontSize.xs,
                color: error ? theme.colors.error : theme.colors.textSecondary,
                height:14
              }}
            />

            {error || helperText}
          </div>
        )}

      </div>
    )
  }
)
