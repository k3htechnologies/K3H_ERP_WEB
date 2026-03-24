import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Table4, Table7 } from "@/features/settingsDashboard/models/SettingsDashboardModel";
import { getSafeString } from '@/core/utils/comman';

interface Props {
  projectManagementData: Table4[];
  projectStatusData: Table7[];
}

const ProjectManagement: React.FC<Props> = ({ projectManagementData, projectStatusData }: Props) => {
  const totalProjects = projectManagementData[0]?.TotalProjects || 0;
  const redevelopment = projectManagementData[0]?.Redevelopment || 0;
  const reraRegistered = projectManagementData[0]?.RERARegistered || 0;

  const activeProjects = projectStatusData[0]?.OngoingProjects || 0;
  const onHoldProjects = projectStatusData[0]?.OnHoldProjects || 0;
  const completedProjects = projectStatusData[0]?.CompletedProjects || 0;
  const cancelledProjects = projectStatusData[0]?.CancelledProjects || 0;
  const planningProjects = projectStatusData[0]?.PlanningProjects || 0;

  const chartData = [
    { name: "Ongoing Projects", value: activeProjects, color: "#2563eb" },
    { name: "On hold Projects", value: onHoldProjects, color: "#f59e0b" },
    { name: "Completed Projects", value: completedProjects, color: "#10b981" },
    { name: "Cancelled Projects", value: cancelledProjects, color: "#e2e8f0" },
    { name: "Planning Projects", value: planningProjects, color: "#10376aff" },
  ];

  return (
    <div className=" flex flex-col h-full">
      <h1 className="font-semibold text-gray-800 mb-4">Project Management</h1>

      <div className="w-full bg-white p-4 border border-gray-100 rounded-md flex-1 flex flex-col gap-8">

        {/* Top Stats Cards */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-md border border-gray-100 bg-slate-50/50 px-4 py-2.5 ">
            <span className="text-[13px] font-medium text-slate-500">Total Project</span>
            <span className="text-base font-bold text-gray-800">{totalProjects}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-md bg-green-50 px-4 py-2.5">
              <span className="text-[13px] font-medium text-slate-500">RERA Registered</span>
              <span className="text-base font-bold text-green-600">{getSafeString(reraRegistered)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-indigo-50 px-4 py-2.5">
              <span className="text-[13px] font-medium text-slate-500">Redevelopment</span>
              <span className="text-base font-bold text-indigo-900">{getSafeString(redevelopment)}</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="flex flex-col gap-6">
          {/* Donut Chart */}
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-800">{totalProjects}</span>
            </div>
          </div>

          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-semibold text-gray-500">{item.name}</span>
                </div>
                <span className="text-[13px] text-black font-medium">
                  {String(item.value).padStart(2, '0')} <span className="text-black mx-0.5">/</span> <span className="text-black">{String(totalProjects).padStart(2, '0')}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectManagement