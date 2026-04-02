import { formatDate_dd_MonthName_yy, parseTimeFromISO } from "@/core/utils/dateFormat";
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import type { Table3 } from "@/features/payrollDashboard/models/PayrollDashboardModel";

interface Props {
  outdoorManagementData: Table3[];
}

export default function OutdoorManagement({ outdoorManagementData }: Props) {
  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">
        Outdoor Management
      </h2>
      <div className=" bg-white rounded-xl p-4 h-[349px] border border-gray-100 overflow-y-auto thin-scroll" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

        <div className="mt-2">
          {outdoorManagementData?.length > 0 ? (
            outdoorManagementData.map((item, index) => (
              <div
                key={index}
                className="w-full bg-blue-100  rounded-md 
                   flex items-center justify-between 
                   p-3 sm:p-4 mb-2"
              >
                {/* Left */}
                <div>
                  <p className="text-sm sm:text-lg font-semibold text-blue-600">
                    {item.CompanyName || "--"}
                  </p>
                  <p className="text-xs sm:text-base text-gray-500 font-medium mt-1">
                    {item.CreatedBy || "--"}
                  </p>
                </div>

                {/* Right */}
                <div className="flex flex-col text-right">
                  <p className="text-sm sm:text-base font-medium">
                    {item.OutDoorDate
                      ? formatDate_dd_MonthName_yy(item.OutDoorDate)
                      : "--"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {item.OutDoorTime
                      ? `${parseTimeFromISO(item.OutDoorTime)} AM`
                      : "--"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-15">
              <NoDataView message="No data available" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

