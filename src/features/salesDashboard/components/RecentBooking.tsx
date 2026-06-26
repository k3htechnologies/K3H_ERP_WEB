import { formatCurrency } from "@/core/utils/comman";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { Table6 } from "@/features/salesDashboard/models/SalesDashboardModel";
import { getNameInitials } from "@/core/utils/getNameInitials";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

interface Props {
    data: Table6[];
}

const RecentBooking: React.FC<Props> = ({ data }) => {
    return (
        <div className="pt-5">
            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

                <h3 className="font-semibold text-gray-500">Recent Booking <span className="text-sm font-normal text-gray-500">
                    ({data.length} Records)
                </span></h3>

                <div className="h-[360px] overflow-y-auto thin-scroll pr-2">
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <NoDataView/>
                        </div>
                    ) : (

                        data.map((d, i) => (
                            <div key={i} className="bg-[#F9F9FF] rounded-lg p-4 mb-3">

                                <div className="grid grid-cols-12 gap-4">

                                    <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#ADC6FF] flex items-center justify-center text-[#0058BE] font-semibold">
                                            {getNameInitials(d.ApplicantName)}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-[#2D2D2D]">
                                                {d.ApplicantName}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {d.ProjectName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-span-4">
                                        <p className="text-sm text-gray-500">Unit</p>

                                        <span className="inline-flex px-3 py-1 rounded-full bg-[#D6E4FF] text-[#0058BE] font-medium">
                                            {d.Flat}
                                        </span>
                                    </div>

                                    <div className="col-span-4">
                                        <p className="text-sm text-gray-500">Amount</p>

                                        <p className="font-semibold text-[#2D2D2D]">
                                            {formatCurrency(d.AgreementValue)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 gap-4 mt-4">
                                    

                                    <div className="col-span-4">
                                        <p className="text-sm text-gray-500">Date</p>

                                        <p className="font-semibold text-[#2D2D2D]">
                                            {formatDate_dd_MonthName_yy(d.CreatedDate)}
                                        </p>
                                    </div>

                                    <div className="col-span-4">
                                        <p className="text-sm text-gray-500">Sales Advisor</p>

                                        <p className="font-semibold text-[#2D2D2D]">
                                            {d.SalesAdvisor || "-"}
                                        </p>
                                    </div>

                                    <div className="col-span-4">
                                        <p className="text-sm text-gray-500">Sourcing Manager</p>

                                        <p className="font-semibold text-[#2D2D2D]">
                                            {d.SourcingManager || "-"}
                                        </p>
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

export default RecentBooking;