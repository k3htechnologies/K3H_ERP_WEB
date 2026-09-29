interface Props {
    percent: number;
}

export const TaskProgressBar: React.FC<Props> = ({ percent }) => {
    return (
        <div className="relative mb-1 pt-1">
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
            </div>
            {percent > 0 && (
                <span className="absolute top-[14px] text-xs font-medium text-blue-600" style={{ left: `calc(${percent}% - 14px)` }}>
                    {percent}%
                </span>
            )}
        </div>
    );
};
