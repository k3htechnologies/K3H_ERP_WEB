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
        <div className="flex gap-5">
            <ColorDotWithData data={availableCount} color="#22C55E" title="Available" />
            <ColorDotWithData data={holdCount} color="#C4C41D" title="Hold"  />
            <ColorDotWithData data={memberCount} color="#8A38F5" title="Alloted"  />
            <ColorDotWithData data={bookedCount} color="#FF0000" title="BOOKED"  />
            <ColorDotWithData data={blockedCount} color="#1D1D1D" title="Blocked" />
        </div>
    );
};

