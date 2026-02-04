import React, { useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";

const PayrollMaster: React.FC = () => {
  const tabsList = [
    { id: "Asset Management", label: "Asset Management" },
    { id: "Branch Management", label: "Branch Management" },
    { id: "Salary Configuration", label: "Salary Configuration" },
    { id: "Leave & Holiday", label: "Leave & Holiday" },
    { id: "Shift & Attendance", label: "Shift & Attendance" },
    { id: "Leave Credit Rules", label: "Leave Credit Rules" },
  ];

  const [activeTab, setActiveTab] = useState<string>(tabsList[0].id);
  return (
    <div className="space-y-3 pt-5">
      <h1 className="font-semibold text-gray-800">Payroll Master</h1>

      <div className="w-full bg-white p-10 border border-gray-100 shadow-sm">
        <div className="w-full">
          <Tabs
            tabs={tabsList}
            defaultActive={activeTab}
            islarge
            isChips
            onTabChange={(t) => setActiveTab(t.id)}
          />
          <div className="mt-5">
            {activeTab === "Asset Management" && (
              // Design 3 cards
              <div className=" flex flex-wrap gap-5">
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Total Assests</p>
                  <p className="text-green-600 font-bold">124</p>
                  <p className="font-normal text-xs">Laptops, Mobiles, Equipment</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Assigned Assests</p>
                  <p className="text-green-600 font-bold">98</p>
                  <p className="font-normal text-xs">Currently in use</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Available Assets</p>
                  <p className="text-black font-bold">26</p>
                  <p className="font-normal text-xs">Currently available for assignment</p>
                </div>
              </div>
            )}
            {activeTab === "Branch Management" && (
              <div className=" flex flex-wrap gap-5">
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Total Branch</p>
                  <p className="text-green-600 font-bold">06</p>
                  <p className="font-normal text-xs">Mumbai, Pune, Nagpur, Thane</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Head Office</p>
                  <p className="text-green-600 font-bold">Mumbai</p>
                  <p className="font-normal text-xs">Primary Operating Branch</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Employees Mapped</p>
                  <p className="text-black font-bold">320</p>
                  <p className="font-normal text-xs">Assigned Across Branches</p>
                </div>
              </div>
            )}
            {activeTab === "Salary Configuration" && (
              <div className=" flex flex-wrap gap-5">
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Earnings Configured</p>
                  <p className="text-green-600 font-bold">12</p>
                  <p className="font-normal text-xs">Laptops, Mobiles, Equipment</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Deductions Configured</p>
                  <p className="text-green-600 font-bold">98</p>
                  <p className="font-normal text-xs">Currently in use</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Available Assets</p>
                  <p className="text-black font-bold">26</p>
                  <p className="font-normal text-xs">Ready to assign</p>
                </div>
              </div>
            )}
            {activeTab === "Leave & Holiday" && (
              <div className=" flex flex-wrap gap-5">
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Total Leave Types</p>
                  <p className="text-green-600 font-bold">12</p>
                  <p className="font-normal text-xs">CL,SL,EL, Comp-Off</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Encash able Leaves</p>
                  <p className="text-green-600 font-bold">03</p>
                  <p className="font-normal text-xs">Eligible for encashment</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Holiday Lists</p>
                  <p className="text-black font-bold">02</p>
                  <p className="font-normal text-xs">National & Regional</p>
                </div>
              </div>
            )}
            {activeTab === "Shift & Attendance" && (
              <div className=" flex flex-wrap gap-5">
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Total Shifts</p>
                  <p className="text-green-600 font-bold">05</p>
                  <p className="font-normal text-xs">General, Night, Rotational</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Shift Mappings</p>
                  <p className="text-green-600 font-bold">280</p>
                  <p className="font-normal text-xs">Employees assigned to shifts</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Week Off Policies</p>
                  <p className="text-black font-bold">03</p>
                  <p className="font-normal text-xs">Standard & alternate offs</p>
                </div>
              </div>
            )}
            {activeTab === "Leave Credit Rules" && (
              <div className=" flex flex-wrap gap-5">
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Total Assests</p>
                  <p className="text-green-600 font-bold">124</p>
                  <p className="font-normal text-xs">Laptops, Mobile,Equipment</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Assigned Assests</p>
                  <p className="text-green-600 font-bold">98</p>
                  <p className="font-normal text-xs">Currently in use</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 shadow-sm flex-1 min-w-[300px] leading-loose">
                  <p className="font-medium text-sm ">Available Assets</p>
                  <p className="text-black font-bold">26</p>
                  <p className="font-normal text-xs">Ready to assign</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollMaster;
