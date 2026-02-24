interface OverviewItem {
  ActiveProjects?: number;
  PayrollConfiguredPercent?: number;
  RegisteredVendors?: number;
  TotalCompanies?: number;
  TotalEmployees?: number;
}

interface Props {
  overViewData?: OverviewItem[];
}

const OverviewCards: React.FC<Props> = ({ overViewData = [] }: Props) => {

  return (

    <div className="space-y-3 pt-5">
      <h1 className="text-lg font-semibold text-gray-800">Overview</h1>

      <div className="grid grid-cols-5 gap-4">
        
        {overViewData.length > 0 && (
          <>
            <div className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }} >
              <p className="text-sm text-gray-400 font-semibold">Total Companies</p>
              <div className="flex items-center gap-2 p-2">
                <p className="text-2xl font-semibold text-gray-900">
                  {overViewData[0].TotalCompanies}
                </p>

              </div>
            </div>

            <div
              className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
              <p className="text-sm text-gray-400 font-semibold">Total Employees</p>
              <div className="flex items-center gap-2 p-2">
                <p className="text-2xl font-semibold text-gray-900">
                  {overViewData[0].TotalEmployees}
                </p>

              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }} >
              <p className="text-sm text-gray-400 font-semibold">Active Projects</p>
              <div className="flex items-center gap-2 p-2">
                <p className="text-2xl font-semibold text-gray-900">
                  {overViewData[0].ActiveProjects}
                </p>

              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }} >

              <p className="text-sm text-gray-400 font-semibold">Registered Vendors</p>
              <div className="flex items-center gap-2 p-2">
                <p className="text-2xl font-semibold text-gray-900">
                  {overViewData[0].RegisteredVendors}
                </p>

              </div>
            </div>

            <div
              className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

              <p className="text-sm text-gray-400 font-semibold">Payroll Configured</p>

              <div className="flex items-center gap-2 p-2">
                <p className="text-2xl font-semibold text-gray-900">
                  {overViewData[0].PayrollConfiguredPercent} %
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
