import { useEffect, useState } from 'react'
import { Toast } from './Toast'
import type { ToastProps } from './Toast'
import { Modal } from '../Modal/Modal'
import { LOCAL_STORAGE_KEYS } from '@/core/constants'

export interface ToastContainerProps {
    toasts: ToastProps[]
    onRemoveToast: (id: string) => void
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {

    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)

    // Whenever toasts change, check if any have title === 'Menu Changed'
    
    useEffect(() => {
        const hasMenuChangedToast = toasts.some(t => t.title === 'Menu Changed')

        if (hasMenuChangedToast) {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.MENU_MODULE);
            setIsMenuModalOpen(true)
        }
    }, [toasts])


    if (!isMenuModalOpen) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: '36px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
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
    return (
        <Modal
            isOpen={isMenuModalOpen}
            onClose={() => setIsMenuModalOpen(false)}
            title="Menu Changed"
            saveText="Restart"
            cancelText="Close"
            onCancel={() => setIsMenuModalOpen(false)}
            size="sm"
            onSubmit={(e) => {
                e.preventDefault()
                setIsMenuModalOpen(false);
                setTimeout(() => {
                    window.location.href = '/dashboard'
                }, 1500)

            }}
        >
            <div className="space-y-3">
                <p className="text-sm text-gray-700">
                    You access has been modified, please restart to use the application.
                </p>
            </div>
        </Modal>

    )
}

export default ToastContainer
