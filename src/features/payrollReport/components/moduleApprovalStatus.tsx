// import React from "react";
// import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
// import { Loader } from "@/core/utils/loader";
// import { useApprovalStatus } from "../hooks/useApprovalStatus";

// interface ApprovalExpandableProps {
//   id: number;
//   moduleName: string;
//   requestId: number;
// }

// const columns = [
//   { key: "Approver", title: "Approver" },
//   { key: "Status", title: "Status" },
//   { key: "Date", title: "Date" },
// ];

// const ModuleApprovalStatus: React.FC<ApprovalExpandableProps> = ({
//   id,
//   moduleName,
//   requestId,
// }) => {
//   const { approvalData, isLoading, error } = useApprovalStatus(
//     moduleName,
//     id,
//     requestId
//   );

//   return (
//     <div className="p-2">
//       <Loader loading={isLoading} title="Loading Approval Cycle...">
//         {error ? (
//           <div className="text-red-500 text-sm p-2">{error}</div>
//         ) : (
//           <DataTableWithOutBorder
//             data={approvalData}
//             columns={columns}
//             emptyMessage="No Approval Data Found"
//             fixedHeight
//             recordsPerPage={10}
//           />
//         )}
//       </Loader>
//     </div>
//   );
// };

// export default ModuleApprovalStatus;
import React from "react";
import { Loader } from "@/core/utils/loader";
import { useApprovalStatus } from "../hooks/useApprovalStatus";

interface ApprovalExpandableProps {
  id: number;
  moduleName: string;
  requestId: number;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "text-green-600";
    case "rejected":
      return "text-red-600";
    case "pending":
      return "text-yellow-600";
    default:
      return "text-gray-500";
  }
};

const ModuleApprovalStatus: React.FC<ApprovalExpandableProps> = ({
  id,
  moduleName,
  requestId,
}) => {

  const { approvalData, isLoading, error } = useApprovalStatus(
    moduleName,
    id,
    requestId
  );

  return (
    <div className="p-4">
      <Loader loading={isLoading} title="Loading Approval Cycle...">
        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : approvalData?.length ? (
          <div className="relative flex items-start gap-16 px-6 overflow-x-auto">
            <div className="absolute top-[6px] left-0 w-full h-px bg-gray-300"></div>
            {approvalData.map((item: any, index: number) => (
              <div key={index} className="flex flex-col items-center relative z-10 min-w-[120px]">
                {/* Timeline dot */}
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 z-10"></div>

                  {index !== approvalData.length - 1 && (
                    <div className="h-[2px] w-16 bg-gray-300"></div>
                  )}
                </div>
                {/* Content */}
                <div className="flex flex-col items-center text-center mt-2">
                  <span className="font-medium">{item.EmployeeName}</span>

                  <span className={`text-sm ${getStatusColor(item.ApprovalStatus)}`}>
                    {item.ApprovalStatus}
                  </span>

                  {item.CreatedDate && (
                    <span className="text-xs text-gray-500">
                      {new Date(item.CreatedDate).toLocaleString()}
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            No Approval Data Found
          </div>
        )}
      </Loader>
    </div>
  );
};

export default ModuleApprovalStatus;