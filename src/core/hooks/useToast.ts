import { useState, useCallback } from 'react'
import type { ToastProps } from '../../ui/components/Toast/Toast'

export interface ToastOptions {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastProps[]>([])

    const addToast = useCallback((options: ToastOptions) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast: ToastProps = {
            id,
            type: options.type,
            title: options.title,
            message: options.message,
            duration: options.duration || 5000,
            onClose: () => { } // Will be set by ToastContainer
        }

        setToasts(prev => [...prev, newToast])
        return id
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const clearAllToasts = useCallback(() => {
        setToasts([])
    }, [])

    // Convenience methods
    const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
        return addToast({ type: 'success', title, message, duration })
    }, [addToast])

    const showError = useCallback((title: string, message?: string, duration?: number) => {
        return addToast({ type: 'error', title, message, duration })
    }, [addToast])

    const showWarning = useCallback((title: string, message?: string, duration?: number) => {
        return addToast({ type: 'warning', title, message, duration })
    }, [addToast])

    const showInfo = useCallback((title: string, message?: string, duration?: number) => {
        return addToast({ type: 'info', title, message, duration })
    }, [addToast])

    return {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }
}

export default useToast







