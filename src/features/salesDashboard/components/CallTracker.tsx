import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReportsGrid from './ReportGridSection';

const data = [
    { name: 'Connected', value: 94, percentage: '60%', color: '#3B82F6' },
    { name: 'Not Connected', value: 32, percentage: '21%', color: '#94A3B8' },
    { name: 'Rescheduled', value: 22, percentage: '14%', color: '#FACC15' },
    { name: 'Closed', value: 8, percentage: '5%', color: '#EF4444' },
];

const CallTracker: React.FC = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Call Tracker</h2>

            <div className="flex flex-row gap-4 items-stretch">
                {/* LEFT BIG CONTAINER (Includes Stats + Distribution + Top Callers) */}
                <div className="flex-3 bg-white rounded-xl p-5 shadow-sm border border-gray-100">

                    <div className="grid grid-cols-12 gap-6">

                        {/* LEFT COLUMN (Stats + Bar Chart) */}
                        <div className="col-span-7 space-y-6">
                            {/* Top Small Cards Row */}
                            <div className="flex gap-3">
                                {/* Stat Card - Exact Figma Style */}
                                <div className="flex-1 h-20 bg-cyan-50/50 border border-cyan-100 rounded-lg flex flex-col items-center justify-center">
                                    <p className="text-xl font-bold text-cyan-500">156</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Total Calls</p>
                                </div>
                                <div className="flex-1 h-20 bg-yellow-50/50 border border-yellow-100 rounded-lg flex flex-col items-center justify-center">
                                    <p className="text-xl font-bold text-yellow-500">24</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Pending</p>
                                </div>
                                <div className="flex-1 h-20 bg-red-50/50 border border-red-100 rounded-lg flex flex-col items-center justify-center">
                                    <p className="text-xl font-bold text-red-500">18</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Overdue</p>
                                </div>
                                <div className="flex-1 h-20 bg-green-50/50 border border-green-100 rounded-lg flex flex-col items-center justify-center">
                                    <p className="text-xl font-bold text-green-500">5M</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Avg Duration</p>
                                </div>
                            </div>

                            {/* Call Status Distribution Section (Bar chart area) */}
                            {/* Responsive Bar */}
                            <div className="space-y-2">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Call Status Distribution
                                </p>

                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={data}
                                            layout="vertical"
                                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                                            barSize={8}
                                        >
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                                width={75}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* MIDDLE COLUMN (Top Callers Today List) */}
                        <div className="col-span-5 border-l border-gray-50 pl-6 bg-gray-100 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 mb-4 mt-2">Top Callers Today</p>
                            <div className="space-y-4 mb-5">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-700">Rajesh Kumar</p>
                                    <p className="text-xs font-bold text-gray-800">28 <span className="text-[9px] font-normal text-gray-400 mr-2">Calls</span></p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-700">Rajesh Kumar</p>
                                    <p className="text-xs font-bold text-gray-800">28 <span className="text-[9px] font-normal text-gray-400 mr-2">Calls</span></p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-700">Rajesh Kumar</p>
                                    <p className="text-xs font-bold text-gray-800">28 <span className="text-[9px] font-normal text-gray-400 mr-2">Calls</span></p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-700">Rajesh Kumar</p>
                                    <p className="text-xs font-bold text-gray-800">28 <span className="text-[9px] font-normal text-gray-400 mr-2">Calls</span></p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-700">Rajesh Kumar</p>
                                    <p className="text-xs font-bold text-gray-800">28 <span className="text-[9px] font-normal text-gray-400 mr-2">Calls</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE INDEPENDENT CARD */}
                <ReportsGrid />
            </div>
        </div>
    )
}

export default CallTracker