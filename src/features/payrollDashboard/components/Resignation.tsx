import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

interface ResignationTableRecord {
  FullName: string;
  ExpectedRelievingDate: string;
  ResignationDate: string;
  IsAnyOfferInHand: boolean;
  status: "Approved" | "Pending";
}

interface Props {
  resignationData: ResignationTableRecord[];
}

export default function Resignation({ resignationData = [] }: Props) {
  const columns = [
    {
      key: "employeeName",
      label: "Employee Name",
      render: ( record: ResignationTableRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 " />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-black">{record.FullName}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">Full-Stack Developer </span>
          </div>
        </div>
      ),
    },
    {
      key: "resignationDate",
      label: "Resignation Date",
      render: (value: string, record: ResignationTableRecord) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="font-medium text-black">
            {formatDate_dd_MonthName_yy(record.ResignationDate)}
          </span>
        </div>
      ),
    },
    {
      key: "relievingDate",
      label: "Relieving Date",
      render: (value: string, record: ResignationTableRecord) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="font-medium text-black">
            {formatDate_dd_MonthName_yy(record.ExpectedRelievingDate)}
          </span>
        </div>
      ),
    },
    {
      key: "offerInHand",
      label: "Offer In Hand",
      align: "left" as const,
      render: (value: string, record: ResignationTableRecord) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 ">{value}</span>
          <span className="font-medium text-black ml-10 ">
            {record.IsAnyOfferInHand ? "Yes" : "No"}
          </span>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      width: "150px",
      render: (_: any, record: ResignationTableRecord) => (
        <button
          className={`px-4 py-1 rounded-md text-sm font-medium text-white shadow-sm ${record.status === "Approved"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {record.status === "Approved" ? "Approved" : "Approve"}
        </button>
      ),
    },
  ];
  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">Resignation</h2>
      <div
        className="bg-white rounded-xl p-4"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >

        <DataTableWithOutBorder
          columns={columns}
          data={resignationData.slice(0, 4)}
          emptyMessage="No records Found"
          fixedHeight={true}
        />

      </div>
    </div>
  );
}
