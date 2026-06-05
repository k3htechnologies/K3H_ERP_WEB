import { ColorDotWithData } from "../ColorDotWithData";

interface StatusCountersProps {
    totalCount:number;
    availableCount: number;
    holdCount: number;
    memberCount: number;
    bookedCount: number;
    blockedCount: number;
    selectedStatus?: string;
    onStatusClick?: (status: string) => void;
}

export const StatusCounters = ({
    totalCount,
    availableCount,
    holdCount,
    memberCount,
    bookedCount,
    blockedCount,
    selectedStatus,
    onStatusClick,
}: StatusCountersProps) => {
    return (
        
        <div className="flex items-center gap-5 bg-[#F1F1F1] px-4 py-2 rounded-md w-fit shadow-sm">
            <ColorDotWithData data={totalCount} color="#135BEC" title="Total" isSelected={selectedStatus==="Total"} onClick={onStatusClick ? () => onStatusClick("") : undefined} />
            <ColorDotWithData data={availableCount} color="#22C55E" title="Available" isSelected={selectedStatus === "Available"} onClick={onStatusClick ? () => onStatusClick("Available") : undefined} />
            <ColorDotWithData data={holdCount} color="#C4C41D" title="Hold" isSelected={selectedStatus === "Hold"} onClick={onStatusClick ? () => onStatusClick("Hold") : undefined} />
            <ColorDotWithData data={memberCount} color="#8A38F5" title="Alloted" isSelected={selectedStatus === "Alloted"} onClick={onStatusClick ? () => onStatusClick("Alloted") : undefined}/>
            <ColorDotWithData data={bookedCount} color="#FF0000" title="Booked" isSelected={selectedStatus === "Booked"} onClick={onStatusClick ? () => onStatusClick("Booked") : undefined}/>
            <ColorDotWithData data={blockedCount} color="#1D1D1D" title="Blocked" isSelected={selectedStatus === "Blocked"} onClick={onStatusClick ? () => onStatusClick("Blocked") : undefined}/>
        </div>
    );
};

