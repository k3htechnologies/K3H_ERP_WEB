import { Toast } from './Toast'
import type { ToastProps } from './Toast'

export interface ToastContainerProps {
    toasts: ToastProps[]
    onRemoveToast: (id: string) => void
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '400px',
                pointerEvents: 'none'
            }}
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    style={{
                        pointerEvents: 'auto'
                    }}
                >
                    <Toast
                        {...toast}
                        onClose={onRemoveToast}
                    />
                </div>
            ))}
        </div>
    )
}

export default ToastContainer
