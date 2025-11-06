import React, { useState } from 'react';

interface TooltipTextProps {
    text: string | null | undefined | number
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
    const displayText = text === null || text === undefined || text === "" ? "-" : String(text).trim();
    const isLong = displayText.length > tooltipThreshold;
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const getBgColor = () => {
        if (tooltipClassName.includes('blue')) return 'from-blue-500 to-blue-600 border-blue-400';
        if (tooltipClassName.includes('green')) return 'from-green-500 to-green-600 border-green-400';
        if (tooltipClassName.includes('red')) return 'from-red-500 to-red-600 border-red-400';
        return 'from-blue-500 to-blue-600 border-blue-400';
    };

    const onEnter = (e: React.MouseEvent) => {
        if (!isLong) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: rect.left, y: rect.bottom + 8 });
        setShow(true);
    };

    return (
        <>
            <div className="relative w-full inline-block" onMouseEnter={onEnter} onMouseLeave={() => setShow(false)} title="">
                {onClick ? (
                    <button onClick={onClick} className="text-left text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block truncate" style={{ maxWidth }} title="">
                        {displayText}
                    </button>
                ) : (
                    <span className={`block truncate text-gray-900 ${tooltipClassName}`} style={{ maxWidth }} title="">
                        {displayText}
                    </span>
                )}
            </div>

            {isLong && show && (
                <div className="fixed pointer-events-none z-[99999]" style={{ left: `${pos.x}px`, top: `${pos.y}px`, maxWidth: '300px' }}>
                    <div className={`bg-gradient-to-r ${getBgColor()} text-white text-sm px-4 py-3 rounded-lg shadow-2xl border`}>
                        <div className="font-medium break-words whitespace-normal" style={{ wordWrap: 'break-word' }}>
                            {displayText}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TooltipText;