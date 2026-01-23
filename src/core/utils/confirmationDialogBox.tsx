import React from 'react'
import { LogOut, Trash2, Unlock, Wand2, X } from 'lucide-react'

export interface ConfirmationDialogBoxProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    variant?: 'danger' | 'warning' | 'info' | 'logout' | 'inactive' | 'generate',
}

export const ConfirmationDialogBox: React.FC<ConfirmationDialogBoxProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    loading = false,
    variant = 'danger'
}) => {
    if (!isOpen) return null

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'text-red-500',
                    title: 'text-red-600',
                    confirmButton: 'bg-red-500 hover:bg-red-600 text-white'
                }
            case 'warning':
                return {
                    icon: 'text-yellow-500',
                    title: 'text-yellow-600',
                    confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }
            case 'info':
                return {
                    icon: 'text-blue-500',
                    title: 'text-blue-600',
                    confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white'
                }
            case 'logout':
                return {
                    icon: 'text-red-500',
                    title: 'text-red-600',
                    confirmButton: 'bg-red-500 hover:bg-red-600 text-white'
                }
            case 'inactive':
                return {
                    icon: 'text-red-500',
                    title: 'text-red-600',
                    confirmButton: 'bg-red-500 hover:bg-red-600 text-white'
                }
            case 'generate':
                return {
                    icon: 'text-red-500',
                    title: 'text-red-600',
                    confirmButton: 'bg-red-500 hover:bg-red-600 text-white'
                }
            default:
                return {
                    icon: 'text-red-500',
                    title: 'text-red-600',
                    confirmButton: 'bg-red-500 hover:bg-red-600 text-white'
                }
        }
    }

    const styles = getVariantStyles()

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">

                {/* HEADER */}

                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        {variant === 'logout' ?
                            <LogOut className={`h-6 w-6 ${styles.icon}`} />
                            :
                            variant === 'inactive' ?
                                <Unlock className={`h-6 w-6 ${styles.icon}`} />
                                :
                                variant === 'generate' ?
                                    <Wand2 className={`h-6 w-6 ${styles.icon}`} />
                                    :
                                    <Trash2 className={`h-6 w-6 ${styles.icon}`} />
                        }
                        <h3 className={`text-lg font-semibold ${styles.title}`}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* CONTENT */}


                <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>


                {/* FOOTER */}


                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
                    >
                        {loading ? 'Deleting...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationDialogBox
