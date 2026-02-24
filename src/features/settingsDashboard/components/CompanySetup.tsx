import React from 'react'

interface CompanySetupData {
    BanksListed: number;
    Branches: number;
    Departments: number;
    Designations: number;
    Employees: number;
    TNC: number;
}

interface Props {
    companySetupData: CompanySetupData[];
}

const CompanySetup: React.FC<Props> = ({ companySetupData = [] }: Props) => {

    const data = [
        {
            title: "Departments",
            value: companySetupData[0]?.Departments
        },
        {
            title: "Designations",
            value: companySetupData[0]?.Designations
        },
        {
            title: "Employees",
            value: companySetupData[0]?.Employees
        },
        {
            title: "Branches",
            value: companySetupData[0]?.Branches
        },
        {
            title: "Banks Listed",
            value: companySetupData[0]?.BanksListed
        },
        {
            title: "TnC",
            value: companySetupData[0]?.TNC
        },
    ]


    return (
        <div className="space-y-3 pt-5">
            <h1 className="font-semibold text-gray-800">Company Setup</h1>

            <div className='w-full bg-white p-5 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-sm '>
                {data.map((c, i) => {
                    return (
                        <div key={i}>
                            <p className="text-sm text-gray-500 font-semibold">{c.title}</p>
                            <p className="text-lg font-semibold text-gray-900">{c.value}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CompanySetup