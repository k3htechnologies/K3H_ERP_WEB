import React from 'react';
import type { Table3, Table5, Table6 } from "@/features/settingsDashboard/models/SettingsDashboardModel";
import { getSafeString } from '@/core/utils/comman';

interface Props {
    vendorManagementData: Table3[];
    vendorGraphData: Table5[];
    vendorCount: Table6[];
}

const VendorManagement: React.FC<Props> = ({ vendorManagementData, vendorGraphData, vendorCount }: Props) => {

    const totalVendors = vendorManagementData[0]?.TotalVendors;
    const missingDetails = vendorManagementData[0]?.MissingDetails;
    const totalContract = vendorManagementData[0]?.ContractCount;
    const recentlyAdded = vendorManagementData[0]?.RecentlyAddedVendors || 0;
    const companyType = "03";

    return (
        <div className="flex flex-col h-full">
            <h1 className="font-semibold text-gray-800 mb-4">Vendor Management</h1>

            <div className="w-full bg-white p-6 border border-gray-100 rounded-xl flex-1 flex flex-col gap-8" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

                <div className="grid grid-cols-3 divide-x divide-gray-200">
                    <div className="pr-4">
                        <p className="text-[13px] text-gray-500 font-medium">Total Vendors</p>
                        <p className="text-xl font-bold text-gray-900 mt-2">{getSafeString(totalVendors)}</p>
                    </div>

                    <div className="pl-4">
                        <p className="text-[13px] text-gray-500 font-medium">Total Contract</p>
                        <p className="text-xl font-bold text-gray-900 mt-2">{getSafeString(totalContract)}</p>
                    </div>
                    <div className="pl-4">
                        <p className="text-[13px] text-gray-500 font-medium ">Company Type</p>
                        <p className="text-xl font-bold text-gray-900 mt-2">{companyType}</p>
                    </div>
                </div>


                <div className="grid grid-cols-3 divide-x divide-gray-200">

                    <div className="px-1">
                        <p className="text-[13px] text-gray-500 font-medium">Missing Details</p>
                        <p className="text-xl font-bold text-orange-500 mt-2">{getSafeString(missingDetails)}</p>
                    </div>
                    <div className="pl-4 border-none"></div>
                </div>

                {/* Progress Bars Section */}
                <div className="mt-2 text-left">
                    <h3 className="text-[14px] text-blue-800 font-medium mb-4">Vendor Distribution</h3>

                    {vendorGraphData?.length > 0 ? (
                        <div className="space-y-4">
                            {vendorGraphData.map((item, index) => {
                                const count = item.VendorCount || 0;
                                const totalVendorCount = vendorCount[0]?.VendorCount || 0;

                                const percentage =
                                    totalVendorCount > 0
                                        ? (count / totalVendorCount) * 100
                                        : 0;

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 font-medium">
                                            <span>{item.CompanyType || "--"}</span>
                                            <span>
                                                {count}/{totalVendorCount || 0}
                                            </span>
                                        </div>

                                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                            <div
                                                className="bg-[#135bec] h-full rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-6">
                            <p className="text-sm text-gray-400">
                                No data available
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-8">
                    <div className="-mx-1 bg-purple-50 p-4 border border-purple-200 rounded-md flex items-center justify-between h-20 ">
                        <div className="text-left">
                            <p className="text-[14px] font-semibold text-gray-800">Recently Added Vendors</p>
                            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                        </div>
                        <p className="text-right text-purple-600 font-bold text-xl">{getSafeString(recentlyAdded)}</p>
                    </div>
                </div>

            </div>

        </div>
    )
}

export default VendorManagement
