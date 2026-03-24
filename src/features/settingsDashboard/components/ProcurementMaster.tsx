import type { Table2 } from "@/features/settingsDashboard/models/SettingsDashboardModel";
import { getSafeString } from "@/core/utils/comman";



interface Props {
  procurementMasterData: Table2[];
}

const ProcurementMaster: React.FC<Props> = ({ procurementMasterData = [] }: Props) => {

  const data = [
    {
      title: "Material",
      value: procurementMasterData[0]?.TotalMaterial || 0
    },
    {
      title: "Sub-Material",
      value: procurementMasterData[0]?.TotalSubMaterial || 0
    },
    {
      title: "UOM",
      value: procurementMasterData[0]?.UOM || 0
    },
  ]

  return (
    <div className="pt-5 flex flex-col h-full">
      <h1 className="font-semibold text-gray-800 mb-4">Procurement Master</h1>
      <div className="w-full bg-white py-5 border border-gray-100 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200 rounded-md flex-1">
        {data.map((c, i) => {
          return (
            <div key={i} className="flex-1 px-6 py-2 flex flex-col justify-center">
              <p className="text-sm text-gray-500 font-semibold">{c.title}</p>
              <p className="text-lg font-semibold text-gray-900 mt-4">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="w-full bg-yellow-50 p-3 border border-yellow-200  rounded-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Pending Material Setup</p>
            <p className="text-xs text-gray-600 mt-1">Requires Configuration</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-amber-500">{getSafeString(procurementMasterData[0]?.PendingMaterialSetupCount || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementMaster;
