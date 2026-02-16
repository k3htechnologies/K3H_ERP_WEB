import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const VendorGraphCard: React.FC = () => {

  const data = [
    {
      name: "LLP",
      value: 62,
      color: "#135bec"
    },
    {
      name: "Proprietorship",
      value: 54,
      color: "#13367A"
    },
    {
      name: "Private Limited",
      value: 40,
      color: "#7a98a5"
    }
  ]
  return (
    <div className="space-y-3 pt-9">
        <div className=" bg-white rounded-xl p-6" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
      <h3 className="text-sm text-gray-500 font-medium ">
        Vendor Distribution
      </h3>

        <div className='grid grid-cols-2 items-center gap-4'>
          {/* Left DONUT */}
          <div className="relative h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                 data= {data}
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={10}    
                  >
                    {data.map((t,i)=>(
                      <Cell key={i} fill={t.color}/>
                    ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* CENTER TOTAL */}
            <p className='text-sm font-bold text-center p-1'>156 Total Vendors </p>
          </div>
          {/* Right LEGEND */}
           <div className="space-y-3">
            {data.map((t,i)=>(
              <div key={i} className="rounded-lg p-2 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: t.color}}></div>
                <p className='font-semibold text-[22px]'>{t.value}</p>
                <p className='text-sm text-gray-500 font-medium'>{t.name}</p>
              </div>
            ))}
           </div>
        </div>
        </div>
    </div>
  )
}

export default VendorGraphCard
