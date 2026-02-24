import React from 'react'

interface ProjectManagementData {
  TotalProjects: number;
  Redevelopment: number;
  RERARegistered: number;
}

interface Props {
  projectManagementData: ProjectManagementData[];
}

const ProjectManagement: React.FC<Props> = ({ projectManagementData = [] }: Props) => {
  const data = [
    {
      title: "Total Projects",
      value: projectManagementData[0]?.TotalProjects
    },
    {
      title: "Redevelopment",
      value: projectManagementData[0]?.Redevelopment
    },
    {
      title: "RERA Registered",
      value: projectManagementData[0]?.RERARegistered
    }
  ]
  return (
    <div className="space-y-3 ">
      <h1 className="font-semibold text-gray-800">Project Management</h1>
      <div className="w-full bg-white p-6 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-sm mb-5">
        {data.map((c, i) => {
          return (
            <div key={i}>
              <p className="text-sm text-gray-500 font-medium">{c.title}</p>
              <p className="text-lg font-bold ">{c.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default ProjectManagement
