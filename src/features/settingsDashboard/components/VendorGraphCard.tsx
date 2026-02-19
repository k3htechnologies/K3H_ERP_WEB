import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface VendorGraphData {
  CompanyType: string;
  VendorCount: number;

}

interface Props {
  vendorGraphData: VendorGraphData[];
}

const VendorGraphCard: React.FC<Props> = ({ vendorGraphData }) => {


  return (
    <div className="space-y-3 pt-9">
      <div className=" bg-white rounded-xl p-2" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
        <h3 className="text-sm text-gray-500 font-medium  ml-5 mt-1">
          Vendor Distribution
        </h3>

        <div className='grid grid-cols-2 items-center gap-4'>
          {/* Left DONUT */}
          <div className="relative h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vendorGraphData}
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="VendorCount"
                  cornerRadius={20}
                >
                  {vendorGraphData.map((t, i) => (
                    <Cell key={i} fill={"#135bec"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* CENTER TOTAL */}
            <p className='text-sm font-bold text-center p-1 -mt-6'>{vendorGraphData?.length} Total Vendors </p>
          </div>
          {/* Right LEGEND */}
          <div className="space-y-3">
            {vendorGraphData.map((t, i) => (
              <div key={i} className="rounded-lg p-2 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#135bec" }}></div>
                <p className='font-semibold text-[22px]'>{t.VendorCount}</p>
                <p className='text-sm text-gray-500 font-medium'>{t.CompanyType}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorGraphCard
