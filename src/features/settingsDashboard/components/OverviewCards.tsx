import React from 'react'

interface OverviewItem {
  totalCompanies?: number;
  totalEmployees?: number;
  activeProjects?: number;
  registeredVendors?: number;
  payrollConfigured?: number;
}

interface Props {
  overViewData?: OverviewItem[];
}

const OverviewCards: React.FC<Props> = ({ overViewData = [] }: Props) => {

  const data = overViewData[0] || {};

  const cards = [
    {
      title: "Total Companies",
      value: data.totalCompanies ?? 24,
      additonalData: "+2 this month",

    },
    {
      title: "Total Employees",
      value: data.totalEmployees ?? 320,
      additonalData: "+15 last 30 days",

    },
    {
      title: "Active Projects",
      value: data.activeProjects ?? 47,
      additonalData: "8 on hold",

    },
    {
      title: "Registered Vendors",
      value: data.registeredVendors ?? 156,
      additonalData: "12 added recently",

    },
    {
      title: "Payroll Configured",
      value: data.payrollConfigured ?? "85%",
    }
  ]

  return (
    <div className="space-y-3 pt-5">
      <h1 className="text-lg font-semibold text-gray-800">Overview</h1>

      <div className="grid grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100"
             style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
          >
            <p className="text-sm text-gray-500">{c.title}</p>
            <div className="flex items-center gap-2 p-2">
              <p className="text-2xl font-semibold text-gray-900">
                {c.value}
              </p>
              <p className="text-[12px] text-green-600">
                {c.additonalData}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OverviewCards
