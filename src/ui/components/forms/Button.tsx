import React, { cloneElement, forwardRef, isValidElement } from 'react'
import { THEME } from '../../../core/constants/theme'
import type { ButtonProps } from '../../../core/types/form.types'
import { COLOR_MAP } from '../../../core/constants'


export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'solid',
            colorMode = 'dark',
            size = 'md',
            color = 'primary',
            disabled = false,
            loading = false,
            fullWidth = false,
            defineWidth = false,
            leftIcon,
            rightIcon,
            loadingText,
            isborderRadius = false,
            children,
            className = '',
            style,
            ...props
        },
        ref
    ) => {
        const theme = THEME

        const sizeConfig = {
            xs: { height: '32px', width: '32px', padding: `${theme.spacing.xs} ${theme.spacing.sm}`, fontWeight: theme.fontWeight.normal, fontSize: theme.fontSize.xs, iconSize: '10px', },
            mxs: { height: '40px', width: '180px', padding: `${theme.spacing.xs} ${theme.spacing.sm}`, fontWeight: theme.fontWeight.medium, fontSize: theme.fontSize.mxs, iconSize: '10px', },
            sm: { height: '34px', width: '34px', padding: `${theme.spacing.sm} ${theme.spacing.lg}`, fontWeight: theme.fontWeight.normal, fontSize: theme.fontSize.sm, iconSize: '12px' },
            md: { height: '44px', width: '44px', padding: `${theme.spacing.md} ${theme.spacing.xl}`, fontWeight: theme.fontWeight.medium, fontSize: theme.fontSize.md, iconSize: '20px' },
            lg: { height: '52px', width: '52px', padding: `${theme.spacing.lg} ${theme.spacing.xxl}`, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.lg, iconSize: '24px' },
        }

        const currentSize = sizeConfig[size];

        const iconSizeCss = currentSize.iconSize as string

        const iconSizeNumber = (() => {
            if (!iconSizeCss) return 16
            const n = parseInt(String(iconSizeCss).replace('px', ''), 10)
            return Number.isNaN(n) ? 16 : n
        })()

        const colorStyles =
            (COLOR_MAP as any)[color]?.[variant]?.[colorMode] ??
            (COLOR_MAP as any)[color]?.[variant] ??
            (COLOR_MAP as any)[color]?.solid?.[colorMode] ??
            (COLOR_MAP.primary as any).solid

        const childCount = React.Children.count(children);
        const isIconOnly =
            !loading &&
            !leftIcon &&
            !rightIcon &&
            childCount === 1 &&
            React.Children.toArray(children).every(ch => React.isValidElement(ch));

        const buttonStyles: React.CSSProperties = {
            width: defineWidth ? currentSize.width : fullWidth ? '100%' : 'auto',
            height: currentSize.height,
            padding: currentSize.padding,
            fontSize: currentSize.fontSize,
            fontWeight: currentSize.fontWeight,
            borderRadius: isborderRadius ? '0px' : theme.borderRadius.lg,
            border: colorStyles.border,
            backgroundColor: colorStyles.backgroundColor,
            color: colorStyles.color,
            ...(colorStyles.background
                ? { background: colorStyles.background }
                : colorStyles.backgroundColor
                    ? { backgroundColor: colorStyles.backgroundColor }
                    : {}),
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
            const iconElement = el as React.ReactElement<any>
            const sizeNum = typeof forcedSize === 'number' ? forcedSize : iconSizeNumber
            const existingProps = (el as any).props || {}
            if (existingProps.size !== undefined || existingProps.width !== undefined || existingProps.height !== undefined) {
                return el
            }
            try {
                return cloneElement(iconElement, { size: sizeNum } as any)
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
                        {leftIcon && <span style={{ fontSize: iconSizeCss }}>{renderIconElement(leftIcon)}</span>}

                        {isIconOnly
                            ? renderIconElement(React.Children.only(children), iconSizeNumber)
                            : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}>{children}</span>
                        }

                        {rightIcon && <span style={{ fontSize: iconSizeCss }}>{renderIconElement(rightIcon)}</span>}

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
