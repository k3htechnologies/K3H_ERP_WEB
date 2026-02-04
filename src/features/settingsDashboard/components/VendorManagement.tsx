import React from 'react'

const VendorManagement: React.FC = () => {
    const data = [
        {
            title: "Total Vendors",
            value: 156
        },
        {
            title: "Company Type",
            value: "03"
        },
        {
            title: "Missing Details",
            value: 12
        },
        {
            title: "Total Material",
            value: 312
        },
        {
            title: "Total Contract",
            value: 200
        }
    ]

    return (
        <div className="space-y-3 pt-5">
            <h1 className="font-semibold text-gray-800">Vendor Management</h1>
            <div className='w-full bg-white p-7 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-sm '>
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
                <div className="w-1/2 bg-purple-50 p-4 border border-blue-200 shadow-sm rounded-md flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Recently Added Vendors</p>
                        <p className="text-xs text-gray-500 mt-1">Last 30 Days</p>
                    </div>
                    <p className="text-right text-purple-600 font-bold text-lg">12</p>
                </div>
                {/* card2 */}
                <div className="w-1/2 bg-gray-100 p-4 border border-gray-200 shadow-sm rounded-md flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Inactive Vendors</p>
                        <p className="text-xs text-gray-500 mt-1">No activity in 90 days</p>
                    </div>
                    <p className="text-right font-bold text-lg text-gray-700">8</p>
                </div>
            </div>
        </div>
    )
}

export default VendorManagement
