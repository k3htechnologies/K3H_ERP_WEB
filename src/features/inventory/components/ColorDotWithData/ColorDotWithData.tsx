interface ColorDotWithDataProps {
    data: number;
    color: string;
    title?: string;
    onClick?: () => void;
    isSelected?: boolean;
}

export const ColorDotWithData = ({ data, color, title, onClick, isSelected }: ColorDotWithDataProps) => {
    return (
        <div className={`flex items-center gap-3 
                      ${onClick ? "cursor-pointer hover:opacity-80" : ""}`} title={title} onClick={onClick}>
            <div
                style={{
                    backgroundColor: color,
                    height: 12,
                    width: 12,
                }}
                className="rounded-full"
            />
            <span className={` ${isSelected ? "font-semibold" : "text-gray-500"} `}
                style={{ color: isSelected ? color : "" }} >
                {title}{" "}

                <span className={` ${isSelected ? "font-semibold" : "text-black font-medium"} `}
                    style={{ color: isSelected ? color : "" }} >
                    {data}
                </span>
            </span>
        </div>
    );
};
