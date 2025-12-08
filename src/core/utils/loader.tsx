// ============================================================================
// LOADER
// ============================================================================

interface LoaderProps {
    loading: boolean
    children: React.ReactNode
    title?: string
}

export const Loader: React.FC<LoaderProps> = ({
    loading,
    children,
    title = 'Loading...'
}) => {
    if (!loading) return <>{children}</>

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-100">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 min-w-[300px] shadow-lg">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8">
                        <img
                            src="/src/assets/images/appLogo.png"
                            alt="K3H ERP"
                            className="h-8 w-8"
                            onError={(e) => {
                                e.currentTarget.src = '/src/assets/images/appLogo.png'
                            }}
                        />
                    </div>
                    <div className="text-lg font-semibold text-gray-800">K3H ERP</div>
                </div>
                <div className="w-full h-px bg-gray-200"></div>
                <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-600 text-sm">{title}</p>
                </div>
            </div>
        </div>
    )
}