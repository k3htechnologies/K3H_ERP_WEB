import React from "react";
import { BarChart, Bar, YAxis, ResponsiveContainer, LabelList } from "recharts";

interface ProjectStatus {
    ActiveProjects: number;
    OnHoldProjects: number;
}
interface Props {
    projectStatusData: ProjectStatus[]
}

const ProjectStatus: React.FC<Props> = ({ projectStatusData = [] }) => {


    const data = projectStatusData.length > 0 ? [
        { name: "Active Projects", value: projectStatusData[0].ActiveProjects, fill: "#2563eb" },
        { name: "On Hold Projects", value: projectStatusData[0].OnHoldProjects, fill: "#2563eb" }
    ] : [];

    return (
        <div className="pt-7">
            <div className="bg-white rounded-lg border border-gray-100">
                <div className="h-[110px]">
                    <ResponsiveContainer>
                        <BarChart
                            data={data}
                            layout="vertical"
                            barSize={14}
                            barGap={4}
                            barCategoryGap={8}
                        >
                            {/* <XAxis type="number" hide /> */}
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
                            <Bar
                                dataKey="value"
                                barSize={12}
                                fill="#2563eb"
                                radius={[6, 6, 6, 6]}
                                background={{ fill: "#e5e7eb", radius: 6 }}
                            >
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    fill="#6b7280"
                                    fontSize={10}
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
