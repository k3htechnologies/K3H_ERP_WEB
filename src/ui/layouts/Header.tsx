import React from 'react'
import { Menu, Bell } from 'lucide-react'

interface HeaderProps {
    isSidebarOpen: boolean
    onToggleSidebar: () => void
    pageTitle?: string
    pageDescription?: string
}

export const Header: React.FC<HeaderProps> = ({
    isSidebarOpen,
    onToggleSidebar,
    pageTitle = 'Dashboard',
    pageDescription
}) => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            {/* Left side - Menu toggle and title */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 touch-manipulation flex-shrink-0"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-5 w-5 text-gray-600" />
                </button>

                <div className="flex flex-col min-w-0 flex-1">
                    <h1 className="text-base lg:text-lg xl:text-xl font-semibold text-gray-800 truncate">{pageTitle}</h1>
                    {pageDescription && (
                        <p className="text-xs text-gray-600 truncate hidden sm:block">{pageDescription}</p>
                    )}
                </div>
            </div>

            {/* Right side - Project info and actions */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
                {/* Notifications - Hidden on small mobile */}
                <button className="hidden sm:block p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 relative touch-manipulation">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        3
                    </span>
                </button>
            </div>
        </header>
    )
}
