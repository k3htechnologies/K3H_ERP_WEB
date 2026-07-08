import { ApplicantRequests } from "@/features/crmPayTrack/components/ApplicantRequests";
import { FlatAlteration } from "@/features/crmPayTrack/components/FlatAlteration";
import { ParkingSwapSection } from "@/features/crmPayTrack/components/ParkingSwapSection";
import { useState } from "react";

export const RequestsTab: React.FC = () => {
    const [step, setStep] = useState(1);

    return (
        <div>
            <ApplicantRequests onLoaded={() => setStep((prev) => Math.max(prev, 2))} />

            {step >= 2 && (
                <ParkingSwapSection onLoaded={() => setStep((prev) => Math.max(prev, 3))} />
            )}

            {step >= 3 && (<FlatAlteration />)}
        </div>
    );
};

export default RequestsTab