import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import { formatToKLCr } from "@/core/utils/comman";

interface Props {
  loanPortfolioNBFCData: any[];
}

const parseAmount = (val: string | number): number => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
};

export default function LoanPortfoioByBank({ loanPortfolioNBFCData }: Props) {
  const data = loanPortfolioNBFCData || [];
  console.log("Loan Portfolio NBFC Data:", data);

  const columns = [
    {
      key: "BankNBFCName",
      label: "Bank / NBFC",
      align: "left" as any,
      width: "20px",
      render: (value: string, row: any) => {
        const sanctioned = parseAmount(row.SanctionedAmount);
        const disbursed = parseAmount(row.DisbursedAmount);

        const progress =
          sanctioned > 0
            ? Math.min(100, Math.max(0, (disbursed / sanctioned) * 100))
            : 0;

        return (
          <div className="flex flex-col gap-1.5 w-fit min-w-[120px]">
            <span className="text-[14px] font-medium text-gray-800">
              {value || "-"}
            </span>

            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "LoanAccounts",
      label: "Loans",
      align: "left" as any,
      render: (value: string | number) => (
        <span className="text-[14px] text-gray-600">
          {value ?? 0}
        </span>
      ),
    },
    {
      key: "SanctionedAmount",
      label: "Sanctioned",
      align: "left" as any,
      render: (value: number) => (
        <span className="text-[14px] text-gray-600">
          ₹{formatToKLCr(value)}
        </span>
      ),
    },
    {
      key: "DisbursedAmount",
      label: "Disbursed",
      align: "left" as any,
      
      render: (value: number) => (
        <span className="text-[14px] text-gray-600">
          ₹{formatToKLCr(value)}
        </span>
      ),
    },
    {
      key: "OutstandingBalance",
      label: "Outstanding",
      align: "left" as any,
      render: (value: number) => (
        <span className="text-[14px] text-gray-500 whitespace-nowrap">
          ₹{formatToKLCr(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-3 pt-4 sm:pt-5">
      <div
        className="bg-white rounded-xl p-4 h-[300px] border border-gray-100 flex flex-col"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <p className="text-sm font-semibold text-slate-500 uppercase">
          LOAN PORTFOLIO BY BANK/NBFC
        </p>

        <div className="min-w-[500px] sm:min-w-full flex-1 flex flex-col mt-3 overflow-y-auto thin-scroll h-[250px]">
          <DataTableWithHeaderRowDivider
            className="flex-1"
            emptyMessage="No Data Found"
            data={data}
            columns={columns}
            recordsPerPage={6}
            fixedHeight={true}
          />
        </div>
      </div>
    </div>
  );
}