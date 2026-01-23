import { ColorDotWithData } from "../ColorDotWithData";

interface StatusCountersProps {
    availableCount: number;
    holdCount: number;
    memberCount: number;
    saleCount: number;
    blockedCount: number;
}

export const StatusCounters = ({
    availableCount,
    holdCount,
    memberCount,
    saleCount,
    blockedCount,
}: StatusCountersProps) => {
    return (
        <div className="flex gap-5">
            <ColorDotWithData data={availableCount} color="#22C55E" />
            <ColorDotWithData data={holdCount} color="#C4C41D" />
            <ColorDotWithData data={memberCount} color="#8A38F5" />
            <ColorDotWithData data={saleCount} color="#FF0000" />
            <ColorDotWithData data={blockedCount} color="#1D1D1D" />
        </div>
    );
};

