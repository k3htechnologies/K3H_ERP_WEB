import React, { useMemo } from "react"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import type { JobDepartmentData } from "@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel"

interface JobOpeningDepartmentPanelProps {
  departments: JobDepartmentData[]
  selectedDepartmentId: number | null
  onSelectDepartment: (department: JobDepartmentData) => void
}

export const ALL_DEPARTMENT: JobDepartmentData = {
  RoleId: 0,
  DepartmentId: 0,
  DepartmentName: "All",
  TotalRoles: 0,
}

export const JobOpeningDepartmentPanel: React.FC<JobOpeningDepartmentPanelProps> = ({
  departments,
  selectedDepartmentId,
  onSelectDepartment,
}) => {
  const departmentTabs = useMemo(
    () => [
      ALL_DEPARTMENT,
      ...departments,
    ],
    [departments],
  )

  if (departments.length === 0) {
    return <NoDataView message="No Departments Found" />
  }

  const activeId = selectedDepartmentId ?? 0

  return (
    <div className="w-full overflow-x-auto thin-scroll scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-nowrap gap-2 pb-1">
        {departmentTabs.map((department) => {
          const isActive = department.DepartmentId === activeId

          return (
            <button
              key={department.DepartmentId}
              type="button"
              onClick={() => onSelectDepartment(department)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "bg-[#EDF5FF] font-medium text-[#135BEC]"
                  : "border border-[#D8DCE5] bg-white font-normal text-[#606775] hover:border-[#9FB7D8] hover:text-[#135BEC]"
              }`}
            >
              {department.DepartmentName || "-"}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default JobOpeningDepartmentPanel
