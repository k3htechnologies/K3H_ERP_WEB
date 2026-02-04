import React from 'react'

const CompanySetup: React.FC = () => {

    const data = [
        {
            title: "Departments",
            value: "12"
        },
        {
            title: "Designations",
            value: "25"
        },
        {
            title: "Employees",
            value: "320"
        },
        {
            title: "Branches",
            value: "6"
        },
        {
            title: "Banks Listed",
            value: "20"
        },
        {
            title: "TnC",
            value: "100"
        },

    ]
    return (
        <div className="space-y-3 pt-5">
            <h1 className="font-semibold text-gray-800">Company Setup</h1>
            
                <div className='w-full bg-white p-7 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-sm '>
                    {data.map((c, i) => {
                        return (
                            <div key={i}>
                                <p className="text-sm text-gray-500 font-medium">{c.title}</p>
                                <p className="text-lg font-semibold text-gray-900">{c.value}</p>
                            </div>
                        )
                    })}
                </div>
        </div>
    )
}

export default CompanySetup