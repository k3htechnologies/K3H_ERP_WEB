import { useEffect, useState } from 'react'
import { getToastColors } from '../../../core/constants'

export interface ToastProps {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
    onClose: (id: string) => void
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 100)

        // Auto close timer
        const autoCloseTimer = setTimeout(() => {
            handleClose()
        }, duration)

        return () => {
            clearTimeout(timer)
            clearTimeout(autoCloseTimer)
        }
    }, [duration])

    const handleClose = () => {
        setIsLeaving(true)
        setTimeout(() => {
            onClose(id)
        }, 300)
    }

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M9 12L11 14L15 10"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )
            case 'error':
                return (
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )
            case 'warning':
                return (
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )
            case 'info':
                return (
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )
            default:
                return null
        }
    }

    const colors = getToastColors()

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                maxWidth: '400px',
                minWidth: '300px',
                transform: isVisible && !isLeaving ? 'translateX(0)' : 'translateX(100%)',
                opacity: isVisible && !isLeaving ? 1 : 0,
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                zIndex: 1000
            }}
        >
            {getIcon()}

            <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.title,
                    margin: '0 0 4px 0',
                    lineHeight: '1.4'
                }}>
                    {title}
                </h4>
                {message && (
                    <p style={{
                        fontSize: '13px',
                        color: colors.message,
                        margin: '0',
                        lineHeight: '1.4'
                    }}>
                        {message}
                    </p>
                )}
            </div>

            <button
                onClick={handleClose}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6B7280',
                    transition: 'color 0.2s ease',
                    flexShrink: 0
                }}
                onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement
                    target.style.color = '#374151'
                }}
                onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement
                    target.style.color = '#6B7280'
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    )
}

export default Toast
