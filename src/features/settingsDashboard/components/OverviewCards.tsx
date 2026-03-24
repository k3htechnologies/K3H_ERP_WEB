
import type { Table0 } from "@/features/settingsDashboard/models/SettingsDashboardModel";

interface Props {
  overViewData: Table0[];
}

const OverviewCards: React.FC<Props> = ({ overViewData }: Props) => {

  return (

    <div className="space-y-3 pt-5">
      <h1 className="text-lg font-semibold text-gray-800">Overview</h1>

      <div className="grid grid-cols-5 gap-4">

        {overViewData.length > 0 && (
          <>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-sm text-gray-400 font-semibold">Total Companies</p>
              <div className="flex items-center mt-2">
                <p className="text-2xl font-semibold text-gray-900 pl-2">
                  {overViewData[0].TotalCompanies || 0}
                </p>
                {overViewData[0].CompaniesAddedThisMonth !== undefined && overViewData[0].CompaniesAddedThisMonth !== null ? (
                  <div className="text-xs font-medium px-2 py-1 rounded-md  text-green-600 ">
                    +{overViewData[0].CompaniesAddedThisMonth || 0} this month
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-sm text-gray-400 font-semibold">Total Employees</p>
              <div className="flex items-center mt-2">
                <p className="text-2xl font-semibold text-gray-900 pl-2">
                  {overViewData[0].TotalEmployees || 0}
                </p>
                {overViewData[0].EmployeesAddedThisMonth !== undefined && overViewData[0].EmployeesAddedThisMonth !== null ? (
                  <div className="text-xs font-medium px-2 py-1 rounded-md  text-green-600 ">
                    +{overViewData[0].EmployeesAddedThisMonth || 0} this month
                  </div>
                ) : null}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-sm text-gray-400 font-semibold">Active Projects</p>
              <div className="flex items-center mt-2">
                <p className="text-2xl font-semibold text-gray-900 pl-2">
                  {overViewData[0].ActiveProjects || 0}
                </p>
                {overViewData[0].OnHoldProjects !== undefined && overViewData[0].OnHoldProjects !== null ? (
                  <div className="text-xs font-medium px-2 py-1 rounded-md  text-yellow-400 ">
                    {overViewData[0].OnHoldProjects || 0} On Hold
                  </div>
                ) : null}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100" >

              <p className="text-sm text-gray-400 font-semibold">Registered Vendors</p>
              <div className="flex mt-2">
                <p className="text-2xl font-semibold text-gray-900 pl-2">
                  {overViewData[0].RegisteredVendors || 0}
                </p>
                {overViewData[0].VendorsAddedThisMonth !== undefined && overViewData[0].VendorsAddedThisMonth !== null ? (
                  <div className="flex items-center text-xs font-medium px-2 py-1 rounded-md  text-green-600 ">
                    +{overViewData[0]?.VendorsAddedThisMonth || 0} this month
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className="bg-white rounded-2xl p-4 border border-gray-100" >

              <p className="text-sm text-gray-400 font-semibold">Payroll Configured</p>

              <div className="flex items-center gap-2 p-2">
                <p className="text-2xl font-semibold text-gray-900">
                  {overViewData[0].PayrollConfiguredPercent || 0} %
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OverviewCards
