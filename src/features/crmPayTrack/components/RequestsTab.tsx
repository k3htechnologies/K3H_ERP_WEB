import { ApplicantRequests } from "@/features/crmPayTrack/components/ApplicantRequests";
import { FlatAlteration } from "@/features/crmPayTrack/components/FlatAlteration";
import { ParkingSwapSection } from "@/features/crmPayTrack/components/ParkingSwapSection";

export const RequestsTab: React.FC = () => {

    return (
        <div>
            <ApplicantRequests />
            <ParkingSwapSection />
            <FlatAlteration />
        </div>
    )
}

export default RequestsTab