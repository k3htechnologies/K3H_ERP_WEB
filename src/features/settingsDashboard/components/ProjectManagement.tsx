import React from 'react'

const ProjectManagement: React.FC = () => {
    const data = [
        {
            title: "Total Projects",
            value: 20
        },
        {
            title: "Redevelopment",
            value: "08"
        },
        {
            title: "RERA Registered",
            value: 12
        }
    ]
  return (
    <div className="space-y-3 pt-5">
         <h1 className="font-semibold text-gray-800">Project Management</h1>
         <div className="w-full bg-white p-7 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-sm">
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
