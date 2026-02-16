import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";


const ProjectStatus: React.FC = () => {
  const data=[
    {name: "Active Projects", status: 12/20},
    {name: "On Hold Projects", status: 7/20},
  ]

  return (

     <div className="pt-7">
            <div className="bg-white p-2 rounded-lg border border-gray-100">
                <div className="h-[150px] ">
                    <ResponsiveContainer>
                         <BarChart
                            data={data}
                            layout="vertical"
                            barGap={1}
                        >
                            <XAxis type="number" hide />
                            {/* <YAxis type="category" dataKey="name" width={100} />
                            <Bar dataKey="status" fill="#4F46E5" radius={5}>
                                <LabelList dataKey="status" position="right" style={{ fill: "#111827", fontWeight: "bold" }} />
                            </Bar> */}
                               <YAxis
                                type="category"
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#6b7280" }}
                            />
                             {/* Current Status */}
                            <Bar
                                dataKey="status"
                                barSize={12}
                                fill="#2563eb"
                                radius={[6, 6, 6, 6]}
                                background={{ fill: "#e5e7eb", radius: 6 }}
                            >
                                <LabelList dataKey="status" position="right" fill="#6b7280" fontSize={10}
                                />
                            </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                </div>
            </div>
        </div>
                      
  );
};

export default ProjectStatus;
