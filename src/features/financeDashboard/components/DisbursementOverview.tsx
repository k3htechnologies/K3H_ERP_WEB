import { formatToKLCr } from "@/core/utils/comman";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";

interface Props {
  disbursementOverViewData: any[];
}

export default function DisbursementOverview({ disbursementOverViewData }: Props) {
  const data = disbursementOverViewData || [];

  const recentDisbursementTrackRecordsCols = [
    {
      key: "Date",
      label: "Date",
      align: "left" as any,
      render: (value: string) => <span className="text-[14px] text-gray-600">{value || ""}</span>,
    },
    {
      key: "LoanAccount",
      label: "Loan Account",
      align: "left" as any,
      render: (value: string) => <span className="text-[14px] text-gray-600">{value || ""}</span>,
    },
    {
      key: "ProjectName",
      label: "Project Name",
      align: "left" as any,
      render: (value: string) => <span className="text-[14px] text-gray-600">{value || ""}</span>,
    },
    {
      key: "DisbursedAmount",
      label: "Disbursed Amount",
      align: "left" as any,
      render: (value: string) => <span className="text-[14px] text-gray-600">{value || ""}</span>,
    },
  ];

  return (
    <div className="space-y-3 pt-4 sm:pt-5">
      <div
        className="bg-white rounded-xl p-4 h-[420px] overflow-y-auto thin-scroll border border-gray-100 flex flex-col"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <p className="text-sm font-semibold text-slate-500 uppercase p-1">DISBURSMENT OVERVIEW</p>
        <div className="flex gap-5">
          {/* Card 1 */}
          {data && data.map((item, index) => {
              // Safe percentage bounded between 0 and 100
              const percentage = Math.min(Math.max(Number(item?.DisbursementPercentage) || 0, 0), 100);

              return (
                <div key={index} className="w-full flex flex-col">
                  {/* Cards Row */}
                  <div className="flex flex-wrap gap-5">
                    {/* Card 1 */}
                    <div className="bg-gray-100 w-48 rounded-xl p-3 mt-2">
                      <p className="text-gray-500 text-sm font-semibold">Sanctioned</p>
                      <p className="text-black font-semibold">{`₹ ${formatToKLCr(item.TotalSanctioned)}`}</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#ECFEFF] w-48 rounded-xl p-3 mt-2">
                      <p className="text-[#06b6d4] text-sm font-semibold">Disbursed</p>
                      <p className="text-[#06b6d4] font-semibold">{`₹ ${formatToKLCr(item.TotalDisbursed)}`}</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#fff7ed] w-48 rounded-xl p-3 mt-2">
                      <p className="text-[#f97316] text-sm font-semibold">Balance Limit</p>
                      <p className="text-[#f97316] font-semibold">{`₹ ${formatToKLCr(item.BalanceDisbursement)}`}</p>
                    </div>
                  </div>

                  {/* Progress Bar Section (Neeche Full-Width) */}
                  <div className="mt-5 space-y-2 w-full">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-600">Disbursement Progress</span>
                      <span className="text-[#06b6d4]">{`${percentage}%`}</span>
                    </div>

                    {/* Track & Fill */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#06b6d4] h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="bg-[#ecfeff] rounded-xl w-full mt-4">
          <p className="p-2 text-[#06b6d4] font-semibold text-xs">Latest: 31 Aug 2026 . HDFC Bank . ₹1.23 Cr (Gopal Darshan)</p>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-gray-500 uppercase -mt-2">RECENT DISBURSEMENT TRACKING</p>
        </div>

        {/* RECENT DISBURSEMET HACK */}
        <div className="min-w-[500px] sm:min-w-full flex-1 flex flex-col mt-3 overflow-y-auto thin-scroll h-[250px]">
          <DataTableWithHeaderRowDivider
            className="flex-1"
            emptyMessage="No Data Found"
            data={data}
            columns={recentDisbursementTrackRecordsCols}
            recordsPerPage={6}
            fixedHeight={true}
          />
        </div>
      </div>
    </div>
  );
}
