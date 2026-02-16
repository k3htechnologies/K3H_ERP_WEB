import React from 'react'

const VendorManagement: React.FC = () => {
    const data = [
        {
            title: "Total Vendors",
            value: "-"
        },
        {
            title: "Company Type",
            value: "-"
        },
        {
            title: "Missing Details",
            value: "-"
        },
        {
            title: "Total Material",
            value: "-"
        },
        {
            title: "Total Contract",
            value: "-"
        }
    ]

    return (
        <div className="space-y-3 ">
            <h1 className="font-semibold text-gray-800">Vendor Management</h1>
            <div className='w-full bg-white p-8 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-sm '>
                {data.map((c, i) => {
                    return (
                        <div key={i}>
                            <p className="text-sm text-gray-500 font-medium">{c.title}</p>
                            <p className="text-lg font-semibold text-gray-900">{c.value}</p>
                        </div>
                    );
                })}
            </div>
            <div className='mt-5 flex gap-2'>
                {/* card1 */}
                <div className="w-full bg-purple-50 p-4 border border-blue-200 shadow-sm rounded-md flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Recently Added Vendors</p>
                        <p className="text-xs text-gray-500 mt-1">Last 30 Days</p>
                    </div>
                    <p className="text-right text-purple-600 font-bold text-lg">12</p>
                </div>
                
            </div>
        </div>
    )
}

export default VendorManagement
