import { ColorDotWithData } from "../ColorDotWithData";

interface StatusCountersProps {
    availableCount: number;
    holdCount: number;
    memberCount: number;
    bookedCount: number;
    blockedCount: number;
}

export const StatusCounters = ({
    availableCount,
    holdCount,
    memberCount,
    bookedCount,
    blockedCount,
}: StatusCountersProps) => {
    return (
        
        <div className="flex items-center gap-5 bg-[#F1F1F1] px-4 py-2 rounded-md w-fit shadow-sm">

            <ColorDotWithData data={availableCount} color="#22C55E" title="Available" />
            <ColorDotWithData data={holdCount} color="#C4C41D" title="Hold"  />
            <ColorDotWithData data={memberCount} color="#8A38F5" title="Alloted"  />
            <ColorDotWithData data={bookedCount} color="#FF0000" title="Booked"  />
            <ColorDotWithData data={blockedCount} color="#1D1D1D" title="Blocked" />
        </div>
    );
};

