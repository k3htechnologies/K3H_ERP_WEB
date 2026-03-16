import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../forms';

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: React.ReactNode
    onSubmit?: (e: React.FormEvent) => void
    children: React.ReactNode
    saveText?: string
    cancelText?: string
    onCancel?: () => void
    resetText?: string
    onreset?: () => void
    loading?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'half-screen' | 'small-half' | 'large-half' | 'large75' | 'large80' | 'large90' | 'large100' | 'small25' | 'small30' | 'small35' | 'small40' | 'small45' | 'small50'
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
    resetText = '',
    onreset,
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
        xxl: 'max-w-6xl',
        'small25': 'w-[25%]',
        'small30': 'w-[30%]',
        'small35': 'w-[35%]',
        'small40': 'w-[40%]',
        'small45': 'w-[45%]',
        'small50': 'w-[50%]',
        'half-screen': 'w-1/2',
        'small-half': 'w-1/3',
        'large-half': 'w-2/3',
        'large75': 'w-[75%]',
        'large80': 'w-[80%]',
        'large90': 'w-[90%]',
        'large100': 'w-[100%]'
    }

    const widthSize =
        size === 'half-screen' ? sizeClasses['half-screen']
            : size === 'small-half' ? sizeClasses['small-half']
                : size === 'large-half' ? sizeClasses['large-half']
                    : size === 'large75' ? sizeClasses['large75']
                        : size === 'large80' ? sizeClasses['large80']
                            : size === 'large90' ? sizeClasses['large90']
                                : size === 'large100' ? sizeClasses['large100']
                                    : size === 'small25' ? sizeClasses['small25']
                                        : size === 'small30' ? sizeClasses['small30']
                                            : size === 'small35' ? sizeClasses['small35']
                                                : size === 'small40' ? sizeClasses['small40']
                                                    : size === 'small45' ? sizeClasses['small45']
                                                        : size === 'small50' ? sizeClasses['small50'] : sizeClasses['half-screen'];
    // Half-screen modal layout
    if (size === 'half-screen' || size === 'small-half' || size === 'large-half' || size === 'large75' || size === 'large80' || size === 'large90' || size === 'large100' || size === 'small25' || size === 'small30' || size === 'small35' || size === 'small40' || size === 'small45' || size === 'small50') {

        return (
            <div className="fixed inset-0 bg-black/30 z-50">

                {/* Half-screen modal on the right */}
                <div className={`fixed right-4 top-16 bottom-2 bg-white shadow-2xl flex flex-col ${widthSize}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between min-h-16 border-b border-gray-500 bg-white mx-5 py-3">

                        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4 leading-snug break-words">
                            {title}
                        </h3>
                        <Button
                            onClick={onClose}
                            color="transparent"
                            isborderRadius
                            size="md"
                            type='button'
                            disabled={loading}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* CHILDERN */}

                    <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 min-h-0 overflow-y-auto thin-scroll p-6 space-y-6">
                            {children}
                        </div>

                        {/* Footer inside form - Fixed at bottom */}
                        {saveText !== '' ?

                            <div className="flex justify-between items-center h-16 px-6 border-t border-gray-200 bg-white flex-shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-50">

                                {/* LEFT SIDE — Reset + Cancel */}
                                <div className="flex items-center space-x-3">
                                    {resetText && (
                                        <Button
                                            type="button"
                                            color="gray"
                                            variant="solid"
                                            colorMode="light"
                                            size="md"
                                            onClick={onreset}
                                            disabled={loading}
                                        >
                                            {resetText}
                                        </Button>
                                    )}

                                    {cancelText && onCancel && (
                                        <Button
                                            type="button"
                                            color="transparent"
                                            variant="transparent_border"
                                            size="md"
                                            onClick={onCancel}
                                            disabled={loading}
                                        >
                                            {cancelText}
                                        </Button>
                                    )}
                                </div>

                                {/* RIGHT SIDE — Save */}
                                <div>
                                    <Button
                                        type="submit"
                                        color="blue"
                                        size="md"
                                        disabled={loading}
                                    >
                                        {saveText}
                                    </Button>
                                </div>

                            </div>

                            : ''}

                    </form>

                </div >
            </div >
        )
    }

    // Regular centered modal layout
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">

            <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className} max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 border-b border-[#00000080 mx-5">
                    <h3 className="text-lg font-semibold text-[#1D1D1D]-600">
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
                <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 min-h-0 overflow-y-auto thin-scroll p-6 space-y-6">
                        {children}
                    </div>
                    {/* Footer inside form */}
                    {saveText !== '' ?

                        <div className="flex justify-between items-center h-16 px-6 border-t border-gray-200 bg-white flex-shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-50">

                            {/* LEFT SIDE — Reset + Cancel */}
                            <div className="flex items-center space-x-3">
                                {resetText && (
                                    <Button
                                        type="button"
                                        color="gray"
                                        variant="solid"
                                        colorMode="light"
                                        size="sm"
                                        onClick={onreset}
                                        disabled={loading}
                                    >
                                        {resetText}
                                    </Button>
                                )}

                                {cancelText && onCancel && (
                                    <Button
                                        type="button"
                                        color="transparent"
                                        variant="transparent_border"
                                        size="md"
                                        onClick={onCancel}
                                        disabled={loading}
                                    >
                                        {cancelText}
                                    </Button>
                                )}
                            </div>

                            {/* RIGHT SIDE — Save */}
                            <div>
                                <Button
                                    type="submit"
                                    color="blue"
                                    size="md"
                                    disabled={loading}
                                >
                                    <span>{saveText}</span>
                                </Button>
                            </div>

                        </div>

                        : ''}
                </form>
            </div >
        </div >
    )
}
