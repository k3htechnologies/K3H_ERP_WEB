import { formatDate_dd_MonthName_yy, parseTimeFromISO } from "@/core/utils/dateFormat";


interface OutdoorManagementTableRecord {
  CompanyName: string;
  CreatedBy: string;
  OutDoorDate: string;
  OutDoorTime: string;
}

interface Props {
  outdoorManagementData: OutdoorManagementTableRecord[];
}

export default function OutdoorManagement({ outdoorManagementData = [] }: Props) {
  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">
        Outdoor Management
      </h2>
      <div
        className=" bg-white rounded-xl p-4 h-[328px]"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <div className="mt-2">
          <div>
            {outdoorManagementData.map((item, index) => (
              <div key={index} className="w-full bg-blue-100 shadow-sm rounded-md flex items-center justify-between -mt-2">
                <div>
                  <p className="text-lg font-semibold text-blue-600 ml-5 mt-2">{item.CompanyName}</p>
                  <p className="text-base text-gray-500 font-medium ml-5 mt-2 mb-2">
                    {item.CreatedBy}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-right text-black font-medium text-base mr-5 mt-2">
                    {formatDate_dd_MonthName_yy(item.OutDoorDate)}
                  </p>
                  <p className="text-base  text-gray-600 mt-1 text-right mr-5">{parseTimeFromISO(item.OutDoorTime)} AM</p>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

