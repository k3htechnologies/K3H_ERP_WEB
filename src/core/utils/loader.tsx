import loaderGif from "@/assets/loader.gif";
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
                <div className="flex flex-col items-center space-y-3">
                    <img
                        src={loaderGif}
                        alt="Loading..."
                        className="h-10 w-10"
                    />
                    <p className="text-gray-600 text-sm">{title}</p>
                </div>
            </div>
        </div>
    )
}