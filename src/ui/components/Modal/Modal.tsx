import React from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../forms';

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    onSubmit?: (e: React.FormEvent) => void
    children: React.ReactNode
    saveText?: string
    cancelText?: string
    onCancel?: () => void
    loading?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'half-screen' | 'small-half' | 'large-half'
    className?: string
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    onSubmit,
    children,
    saveText = '',
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
        'half-screen': 'w-1/2',
        'small-half': 'w-1/3',   // 👈 add this line
        'large-half': 'w-2/3'
    }

    const widthSize =
        size === 'half-screen' ? sizeClasses['half-screen']
            : size === 'small-half' ? sizeClasses['small-half']
                : size === 'large-half' ? sizeClasses['large-half'] : sizeClasses['half-screen'];

    // Half-screen modal layout
    if (size === 'half-screen' || size === 'small-half' || size === 'large-half') {

        return (
            <div className="fixed inset-0  bg-opacity-50 z-50">
                {/* Half-screen modal on the right */}
                <div className={`fixed right-0 top-0 h-full  bg-white shadow-2xl flex flex-col ${widthSize}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                        <Button
                            onClick={onClose}
                            color="transparent"
                            isborderRadius
                            size="sm"
                            disabled={loading}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* CHILDERN */}

                    <form onSubmit={onSubmit} className="flex-1 flex flex-col  min-h-0 overflow-hidden">
                        <div className="flex-1 flex flex-col space-y-6 min-h-0 p-6">
                            {children}
                        </div>

                        {/* Footer inside form - Fixed at bottom */}
                        {saveText !== '' ?

                            <div className="flex justify-end items-center h-16 px-6 border-t border-gray-200 bg-white flex-shrink-0 space-x-3 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-50">
                                {cancelText && onCancel && (
                                    <Button
                                        type="button"
                                        color="transparent"
                                        variant='transparent_border'
                                        size="sm"
                                        onClick={onCancel}
                                        disabled={loading}
                                    >
                                        {cancelText}
                                    </Button>
                                )}

                                <Button
                                    type="submit"
                                    color="green"
                                    size="sm"
                                    disabled={loading}
                                    
                                >
                                    <Save className="h-4 w-4  gap-2"  />
                                    <span> {loading ? 'Saving...' : saveText}</span>
                                </Button>
                            </div>

                            : ''}

                    </form>

                </div >
            </div >
        )
    }

    // Regular centered modal layout
    return (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className}`}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    <Button
                        onClick={onClose}
                        color="transparent"
                        isborderRadius
                        size="sm"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form Content */}
                <form onSubmit={onSubmit} className="p-6">
                    <div className="space-y-6">
                        {children}
                    </div>

                    {/* Footer inside form */}
                    <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 space-x-3 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-50">
                        {cancelText && onCancel && (
                            <Button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                color="transparent"
                                variant='transparent_border'
                                size="sm"
                            >
                                {cancelText}
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={loading}
                            color="green"
                            size="sm"

                        >
                            <Save className="h-4 w-4" />
                            <span>{loading ? 'Saving...' : saveText}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
