import { formatToKLCr } from "@/core/utils/comman";
import type { Table8 } from "@/features/salesDashboard/models/SalesDashboardModel";
import { getNameInitials } from "@/core/utils/getNameInitials";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

interface Props {
    highestPerformerData: Table8[];
}

const HighestPerformer: React.FC<Props> = ({ highestPerformerData }) => {
    return (
        <div className="pt-5">
            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

                <h3 className="font-semibold text-gray-500">Highest Performer</h3>

                <div className="h-[400px] overflow-y-auto thin-scroll pr-2">
                    {highestPerformerData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <NoDataView/>
                        </div>
                    ) : (

                        highestPerformerData.map((d, i) => (

                            <div key={i} className={`p-4 ${i !== highestPerformerData.length - 1
                                ? "border-b border-gray-200"
                                : ""
                                }`} >

                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            {(() => {

                                                const fullName = d?.Name?.trim();

                                                const profilePhotoURL = d?.ProfilePhotoURL;

                                                const hasProfile =
                                                    profilePhotoURL &&
                                                    profilePhotoURL !== "" &&
                                                    profilePhotoURL !== "—";

                                                return hasProfile ? (
                                                    <img
                                                        src={profilePhotoURL}
                                                        alt={fullName}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-[#ADC6FF] flex items-center justify-center text-[#0058BE] font-semibold text-sm">
                                                        {getNameInitials(fullName)}
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-[#2D2D2D]">
                                                {d.Name}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {d.Department}
                                            </p>
                                        </div>
                                    </div>


                                </div>

                                <div className="mt-3 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            {d.Department === "Sourcing Manager" ? "Total OBM" : "Revenue Amount"}
                                        </span>

                                        <span className="font-semibold">
                                            {d.Department === "Sourcing Manager" ? d.TotalOBM : formatToKLCr(d.AgreementValue)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            {d.Department === "Sourcing Manager" ? "Walkin By CP " : "Booking Count"}
                                        </span>

                                        <span className="font-semibold">
                                            {d.Department === "Sourcing Manager" ? d.WalkinsByCP : d.TotalBooking}
                                        </span>
                                    </div>
                                </div>

                            </div>


                        ))

                    )}
                </div>
            </div>
        </div>
    );
};

export default HighestPerformer;