import React from 'react';
import type { Table1 } from "@/features/settingsDashboard/models/SettingsDashboardModel";


interface Props {
    companySetupData: Table1[];
}

const CompanySetup: React.FC<Props> = ({ companySetupData = [] }: Props) => {

    const data = [
        {
            title: "Departments",
            value: companySetupData[0]?.Departments || 0
        },
        {
            title: "Designations",
            value: companySetupData[0]?.Designations || 0
        },
        {
            title: "Employees",
            value: companySetupData[0]?.Employees || 0
        },
        {
            title: "Branches",
            value: companySetupData[0]?.Branches || 0
        },
        {
            title: "Banks Listed",
            value: companySetupData[0]?.BanksListed || 0
        },
        {
            title: "TnC",
            value: companySetupData[0]?.TNC || 0
        },
    ]


    return (
        <div className="pt-5 flex flex-col h-full">
            <h1 className="font-semibold text-gray-800 mb-4">Company Master</h1>

            <div className="p-4 bg-white w-full border border-gray-100 flex-1 grid grid-cols-2 gap-x-6 gap-y-4 rounded-md">
                {data.map((c, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between px-5 py-4 bg-[#F8FAFC] rounded-xl border border-gray-100 "
                    >
                        <p className="text-gray-500 font-medium text-sm">{c.title}</p>
                        <p className="text-lg font-semibold text-gray-900">{c.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CompanySetup