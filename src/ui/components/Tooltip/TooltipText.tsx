interface TooltipTextProps {
    text: string | null | undefined
    maxWidth?: string
    tooltipThreshold?: number
    onClick?: () => void
    tooltipClassName?: string
}

const TooltipText: React.FC<TooltipTextProps> = ({
    text,
    maxWidth = "150px",
    tooltipThreshold = 20,
    onClick,
    tooltipClassName = ""
}) => {
    const displayText = text?.trim() || "-";
    const isLong = displayText.length > tooltipThreshold;
    return (
        <div className="group relative w-full">
            {onClick ? (
                <button
                    onClick={onClick}
                    className={`text-left text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors duration-200 block truncate`}
                    style={{ maxWidth }}
                >
                    {displayText}
                </button>
            ) : (
                <span
                    className={`block truncate text-gray-900 ${tooltipClassName}`}
                    style={{ maxWidth }}
                >
                    {displayText}
                </span>
            )}

            {isLong && (
                <div className="absolute left-0 top-full mt-3 w-max max-w-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 ease-in-out z-[9999] transform group-hover:scale-100 scale-95">
                    <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-4 py-3 rounded-lg shadow-2xl border border-blue-400 backdrop-blur-sm`}>
                        <div className="font-medium text-white whitespace-nowrap">
                            {displayText}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TooltipText;