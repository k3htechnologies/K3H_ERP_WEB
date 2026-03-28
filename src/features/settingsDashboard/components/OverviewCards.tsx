
import type { Table0 } from "@/features/settingsDashboard/models/SettingsDashboardModel";
import { Building2, IdCardIcon, ChartLineIcon, HandshakeIcon } from "lucide-react";

interface Props {
  overViewData: Table0[];
}

const OverviewCards: React.FC<Props> = ({ overViewData }: Props) => {

  return (

    <div className="space-y-3">
      <h1 className="text-lg font-semibold text-gray-800">Overview</h1>

      <div className="grid grid-cols-4 gap-4">

        {overViewData.length > 0 && (
          <>
            <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 shadow-sm ">
              <div className="bg-purple-100 rounded-xl p-2.5 flex-shrink-0 w-fit h-fit">
                <Building2 className="text-purple-600" size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-gray-500 font-medium mb-1">Total Companies</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900 leading-none p-2">
                    {overViewData[0].TotalCompanies || 0}
                  </p>
                  {overViewData[0].CompaniesAddedThisMonth !== undefined && overViewData[0].CompaniesAddedThisMonth !== null ? (
                    <p className="text-xs font-medium text-green-600">
                      +{overViewData[0].CompaniesAddedThisMonth || 0} this month
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 shadow-sm">
              <div className="bg-blue-100 rounded-xl p-2.5 flex-shrink-0 w-fit h-fit">
                <IdCardIcon className="text-blue-600" size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-gray-500 font-medium mb-1">Total Employees</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900 leading-none p-2">
                    {overViewData[0].TotalEmployees || 0}
                  </p>
                  {overViewData[0].EmployeesAddedThisMonth !== undefined && overViewData[0].EmployeesAddedThisMonth !== null ? (
                    <p className="text-xs font-medium text-green-600 ">
                      +{overViewData[0].EmployeesAddedThisMonth || 0} this month
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 shadow-sm">
              <div className="bg-green-100 rounded-xl p-2.5 flex-shrink-0 w-fit h-fit">
                <ChartLineIcon className="text-green-600" size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-gray-500 font-medium mb-1">Active Projects</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900 leading-none p-2">
                    {overViewData[0].ActiveProjects || 0}
                  </p>
                  {overViewData[0].OnHoldProjects !== undefined && overViewData[0].OnHoldProjects !== null ? (
                    <p className="text-xs font-medium text-yellow-500">
                      {overViewData[0].OnHoldProjects || 0} On Hold
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3 shadow-sm">
              <div className="bg-blue-100 rounded-xl p-2.5 flex-shrink-0 w-fit h-fit">
                <HandshakeIcon className="text-blue-800" size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-gray-500 font-medium mb-1">Registered Vendors</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-gray-900 leading-none p-2">
                    {overViewData[0].RegisteredVendors || 0}
                  </p>
                  {overViewData[0].VendorsAddedThisMonth !== undefined && overViewData[0].VendorsAddedThisMonth !== null ? (
                    <p className="text-xs font-medium text-[#2eb886]">
                      +{overViewData[0]?.VendorsAddedThisMonth || 0} this month
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OverviewCards
