interface ColorDotWithDataProps {
    data: number;
    color: string;
}

export const ColorDotWithData = ({ data, color }: ColorDotWithDataProps) => {
    return (
        <div className="flex items-center gap-3">
            <div
                style={{
                    backgroundColor: color,
                    height: 12,
                    width: 12,
                }}
                className="rounded-full"
            />
            <span>{data}</span>
        </div>
    );
};

