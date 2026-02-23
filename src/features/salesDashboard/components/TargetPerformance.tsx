import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import type { TargetPerformanceItem } from '../models/TargetPerformanceModel';

const TargetPerformance = () => {
    const dummyData: TargetPerformanceItem[] = [
        { id: '1', name: 'Rajesh Kumar', role: 'Sr. Sales Executive', target: '₹2.5Cr', achieved: '₹2.1Cr', bookings: '18/15', achievementPercentage: 92, status: 'High' },
        { id: '2', name: 'Priya Sharma', role: 'Sales Executive', target: '₹1.8Cr', achieved: '₹1.6Cr', bookings: '18/15', achievementPercentage: 78, status: 'Medium' },
        { id: '3', name: 'Rajesh Kumar', role: 'Sr. Sales Executive', target: '₹2.5Cr', achieved: '₹2.1Cr', bookings: '18/15', achievementPercentage: 70, status: 'Low' },
        { id: '4', name: 'Rajesh Kumar', role: 'Sr. Sales Executive', target: '₹2.5Cr', achieved: '₹2.1Cr', bookings: '18/15', achievementPercentage: 37, status: 'At Risk' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'High': return '#22C55E';   
            case 'Medium': return '#22D3EE'; 
            case 'Low': return '#FACC15';
            case 'At Risk': return '#EF4444';
            default: return '#9CA3AF';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'High': return 'text-green-500';
            case 'Medium': return 'text-cyan-500';
            case 'Low': return 'text-yellow-500';
            case 'At Risk': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-4 pt-5 pb-10">
            <h2 className="text-lg font-semibold text-gray-800">Target Performance</h2>
            <div className=" h-[700px] bg-white rounded-xl p-6 mt-5 space-y-8  shadow-sm border border-gray-100">
                {dummyData.map((item) => (
                    <div key={item.id} className="space-y-4">
                        {/* Header: Name and Percentage */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {item.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">{item.name}</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">{item.role}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xl font-black ${getStatusTextColor(item.status)}`}>
                                    {item.achievementPercentage}%
                                </span>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Achievement</p>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 text-sm">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Target</p>
                                <p className="font-bold text-gray-800">{item.target}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Achieved</p>
                                <p className={`font-bold ${getStatusTextColor(item.status)}`}>{item.achieved}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Bookings</p>
                                <p className="font-bold text-gray-800">{item.bookings}</p>
                            </div>
                        </div>

                        {/* RECHARTS PROGRESS BAR */}
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={[{ value: item.achievementPercentage }]} margin={{ left: -60, right: 0 }}>
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis type="category" hide />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                        <Cell fill={getStatusColor(item.status)} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TargetPerformance;