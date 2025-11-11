import React, { cloneElement, forwardRef, isValidElement } from 'react'
import { THEME } from '../../../core/constants/theme'
import type { ButtonProps } from '../../../core/types/form.types'
import { COLOR_MAP } from '../../../core/constants'


export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'solid',
            size = 'md',
            color = 'primary',
            disabled = false,
            loading = false,
            fullWidth = false,
            leftIcon,
            rightIcon,
            loadingText,
            children,
            className = '',
            style,
            ...props
        },
        ref
    ) => {
        const theme = THEME

        const sizeConfig = {
            sm: { height: '34px', width: '34px', padding: `${theme.spacing.sm} ${theme.spacing.lg}`, fontSize: theme.fontSize.sm, iconSize: '12px' },
            md: { height: '44px', width: '44px', padding: `${theme.spacing.md} ${theme.spacing.xl}`, fontSize: theme.fontSize.md, iconSize: '20px' },
            lg: { height: '52px', width: '52px', padding: `${theme.spacing.lg} ${theme.spacing.xxl}`, fontSize: theme.fontSize.lg, iconSize: '24px' },
        }

        const currentSize = sizeConfig[size];

        const colorStyles =
            COLOR_MAP[color as keyof typeof COLOR_MAP]?.[variant as keyof (typeof COLOR_MAP)[keyof typeof COLOR_MAP]] ||
            COLOR_MAP.primary.solid;

        const childCount = React.Children.count(children);
        const isIconOnly =
            !loading &&
            !leftIcon &&
            !rightIcon &&
            childCount === 1 &&
            React.Children.toArray(children).every(ch => React.isValidElement(ch));

        const buttonStyles: React.CSSProperties = {
            width: fullWidth ? '100%' : currentSize.width,
            height: currentSize.height,
            padding: currentSize.padding,
            fontSize: currentSize.fontSize,
            fontWeight: theme.fontWeight.semibold,
            borderRadius: theme.borderRadius.lg,
            border: colorStyles.border,
            backgroundColor: colorStyles.backgroundColor,
            color: colorStyles.color,   
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: theme.transitions.normal,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm,
            boxShadow: 'none',
            opacity: disabled ? 0.6 : 1,
            ...(style || {}),
        }

        const LoadingSpinner = () => (
            <div
                style={{
                    width: currentSize.iconSize,
                    height: currentSize.iconSize,
                    border: `2px solid rgba(255,255,255,0.3)`,
                    borderTop: `2px solid ${variant === 'solid' ? 'white' : 'currentColor'}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }}
            />
        )

        const renderIconElement = (el: React.ReactNode, forcedSize?: number) => {
            if (!isValidElement(el)) return el
            const sizeNum = typeof forcedSize === 'number' ? forcedSize : currentSize.iconSize
            const existingProps = (el as any).props || {}
            if (existingProps.size || existingProps.width || existingProps.height) {
                return el
            }
            try {
                return cloneElement(el as React.ReactElement, { size: sizeNum })
            } catch {
                return el
            }
        }

        return (
            <button
                ref={ref}
                {...props}
                disabled={disabled || loading}
                style={buttonStyles}
                className={className}
                onMouseEnter={(e) => {
                    if (!disabled && !loading && colorStyles.hover) Object.assign(e.currentTarget.style, colorStyles.hover)
                }}
                onMouseLeave={(e) => {
                    if (!disabled && !loading) Object.assign(e.currentTarget.style, buttonStyles)
                }}
            >
                {loading ? (
                    <>
                        <LoadingSpinner />
                        {loadingText || 'Loading...'}
                    </>
                ) : (
                    <>
                        {leftIcon && <span style={{ fontSize: currentSize.iconSize }}>{leftIcon}</span>}
                        {isIconOnly
                            ? renderIconElement(React.Children.only(children), Number(currentSize.iconSize))
                            : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{children}</span>
                        }
                        {rightIcon && <span style={{ fontSize: currentSize.iconSize }}>{rightIcon}</span>}
                    </>
                )}
            </button>


        )
    }
)

Button.displayName = 'Button'

// Add CSS animation for spinner
const styleEl = document.createElement('style')
styleEl.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleEl)
