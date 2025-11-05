import React from 'react';
import { X, Save } from 'lucide-react';

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    onSubmit: (e: React.FormEvent) => void
    children: React.ReactNode
    saveText?: string
    cancelText?: string
    onCancel?: () => void
    loading?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'half-screen'
    className?: string
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    onSubmit,
    children,
    saveText = 'Save',
    cancelText,
    onCancel,
    loading = false,
    size = 'half-screen',
    className = ''
}) => {
    if (!isOpen) return null

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        'half-screen': 'w-1/2'
    }

    // Half-screen modal layout
    if (size === 'half-screen') {
        return (
            <div className="fixed inset-0 bg-opacity-50 z-50">
                {/* Half-screen modal on the right */}
                <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-md hover:bg-gray-100"
                            disabled={loading}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form Content - Scrollable */}
                    <form onSubmit={onSubmit} className="flex-1 flex flex-col p-6">
                        <div className="flex-1 space-y-6">
                            {children}
                        </div>

                        {/* Footer inside form - Fixed at bottom */}
                        <div className="flex justify-end items-center h-16 px-6 border-t border-gray-200 bg-white flex-shrink-0 space-x-3">
                            {cancelText && onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={loading}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                <Save className="h-4 w-4" />
                                <span>{loading ? 'Saving...' : saveText}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    // Regular centered modal layout
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className}`}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-md hover:bg-gray-100"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={onSubmit} className="p-6">
                    <div className="space-y-6">
                        {children}
                    </div>

                    {/* Footer inside form */}
                    <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 space-x-3">
                        {cancelText && onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            <Save className="h-4 w-4" />
                            <span>{loading ? 'Saving...' : saveText}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
