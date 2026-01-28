interface ColorDotWithDataProps {
    data: number;
    color: string;
    title?: string;
}

export const ColorDotWithData = ({ data, color, title }: ColorDotWithDataProps) => {
    return (
        <div className="flex items-center gap-3" title={title}>
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
