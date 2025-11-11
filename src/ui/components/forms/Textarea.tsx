import { forwardRef, useEffect, useRef } from 'react'
import { THEME } from '@/core/constants/theme'
import type { TextAreaProps } from '@/core/types/form.types'

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
            rows = 3,
            autoResize = true,
            ...props
        },
        ref
    ) => {
        const theme = THEME
        const internalRef = useRef<HTMLTextAreaElement | null>(null)

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

        const currentSize = sizeConfig[size];

        const getVariantStyles = () => {
            const baseStyles: React.CSSProperties = {
                width: fullWidth ? '100%' : 'auto',
                padding: leftIcon ? `${currentSize.padding.split(' ')[0]} ${currentSize.padding.split(' ')[1]} ${currentSize.padding.split(' ')[0]} 50px` :
                    rightIcon ? `${currentSize.padding.split(' ')[0]} 40px ${currentSize.padding.split(' ')[0]} ${currentSize.padding.split(' ')[1]}` :
                        currentSize.padding,
                fontSize: currentSize.fontSize,
                fontWeight: theme.fontWeight.normal,
                borderRadius: theme.borderRadius.lg,
                border: `1px solid ${theme.colors.border}`,
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

        const textAreaStyles = {
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
        }

        const focusStyles = {
            borderColor: error ? theme.colors.error : theme.colors.primary,
            boxShadow: error ? `0 0 0 3px ${theme.colors.errorLight}` : `0 0 0 3px ${theme.colors.primaryLight}`,
            backgroundColor: variant === 'filled' ? theme.colors.background : theme.colors.background,
        }

        // ✅ Auto-resize textarea
        useEffect(() => {
            if (autoResize && internalRef.current) {
                const el = internalRef.current
                const resize = () => {
                    el.style.height = 'auto'
                    el.style.height = `${el.scrollHeight}px`
                }
                resize()
                el.addEventListener('input', resize)
                return () => el.removeEventListener('input', resize)
            }
        }, [autoResize])

        return (
            <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: theme.spacing.lg }}>
                {label && (
                    <label
                        style={{
                            display: 'block',
                            fontSize: theme.fontSize.sm,
                            fontWeight: theme.fontWeight.medium,
                            color: error ? theme.colors.error : theme.colors.text,
                            marginBottom: theme.spacing.sm,
                        }}
                    >
                        {label}
                        {props.required && <span style={{ color: theme.colors.error, marginLeft: '4px' }}>*</span>}
                    </label>
                )}

                <textarea
                    ref={(node) => {
                        internalRef.current = node
                        if (typeof ref === 'function') ref(node)
                        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
                    }}
                    rows={rows}
                    disabled={disabled || loading}
                    style={{
                        ...textAreaStyles,
                        ...style,
                    }}
                    className={className}
                    onFocus={(e) => {
                        Object.assign(e.target.style, focusStyles)
                        props.onFocus?.(e)
                    }}
                    onBlur={(e) => {
                        Object.assign(e.target.style, textAreaStyles)
                        props.onBlur?.(e)
                    }}
                    {...props}
                />

                {(error || helperText) && (
                    <div
                        style={{
                            marginTop: theme.spacing.sm,
                            fontSize: theme.fontSize.lg,
                            color: error ? theme.colors.error : theme.colors.textSecondary,
                        }}
                    >
                        {error || helperText}
                    </div>
                )}
            </div>
        )
    }
)


