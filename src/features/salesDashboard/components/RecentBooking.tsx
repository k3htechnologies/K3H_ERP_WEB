import { formatCurrency } from "@/core/utils/comman";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { Table6 } from "@/features/salesDashboard/models/SalesDashboardModel";

interface Props {
    data: Table6[];
}

const RecentBooking: React.FC<Props> = ({ data }) => {
    return (
        <div className="pt-5">
            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

                <h3 className="font-semibold">Recent Booking <span className="text-sm font-normal text-gray-500">
                    ({data.length} Records)
                </span></h3>

                <div className="h-[300px] overflow-y-auto thin-scroll pr-2">
                    {data.length === 0 ? (
                         <div className="h-full flex items-center justify-center text-gray-500">
                            No Recent Booking Found
                        </div>
                    ) : (
                        
                            data.map((d, i) => (
                                <div key={i} className="bg-gray-100 p-3 rounded-lg text-sm space-y-1 mb-2">

                                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                                        <FieldItem label="Project Name" value={d.ProjectName} isRow={false} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-5">
                                        <FieldItem label="Unit No" value={d.Flat} isRow={false} />
                                        <FieldItem label="Applicant" value={d.ApplicantName} isRow={false} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-5">
                                        <FieldItem label="Amount" value={formatCurrency(d.AgreementValue)} isRow={false} />
                                        <FieldItem label="Date" value={formatDate_dd_MonthName_yy_hh_mm(d.CreatedDate)} isRow={false} />
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