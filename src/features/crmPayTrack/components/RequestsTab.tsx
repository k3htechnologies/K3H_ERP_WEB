import { ApplicantRequests } from "@/features/crmPayTrack/components/ApplicantRequests";
import { FlatAlteration } from "@/features/crmPayTrack/components/FlatAlteration";
import { ParkingSwapSection } from "@/features/crmPayTrack/components/ParkingSwapSection";
import { useState } from "react";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";

export const RequestsTab: React.FC = () => {
    const [step, setStep] = useState(1);
    const { listState } = usePayTrackBookingListState();

    return (
         <div>
            <ApplicantRequests onLoaded={() => setStep((prev) => Math.max(prev, listState.tenantId === 0 ? 2 : 3))} />

            {step >= 2 &&  listState.tenantId === 0 && (
                <ParkingSwapSection onLoaded={() => setStep((prev) => Math.max(prev, 3))} />
            )}

            {step >= 3 && (<FlatAlteration />)}

            
        </div>
    );
};

export default RequestsTab