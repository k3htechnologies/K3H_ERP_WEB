import React, { useMemo } from "react"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import Tabs, { type TabItem } from "@/ui/components/Tab/Tab"
import type { JobDepartmentData } from "@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel"

interface JobRoleDepartmentPanelProps {
  departments: JobDepartmentData[]
  selectedDepartmentId: number | null
  onSelectDepartment: (department: JobDepartmentData) => void
}

export const JobRoleDepartmentPanel: React.FC<JobRoleDepartmentPanelProps> = ({
  departments,
  selectedDepartmentId,
  onSelectDepartment,
}) => {
  const departmentTabs = useMemo<TabItem[]>(
    () =>
      departments.map((department) => ({
        id: String(department.DepartmentId),
        label: department.DepartmentName || "-",
        count: department.TotalRoles ?? 0,
      })),
    [departments],
  )

  return (
    <aside className="flex flex-col rounded-lg bg-white p-4">
      <h2 className="shrink-0 pb-3 text-base font-semibold text-[#292D32]">Department</h2>

      {departments.length === 0 ? (
        <NoDataView message="No Departments Found" />
      ) : (
        <Tabs
          tabs={departmentTabs}
          defaultActive={selectedDepartmentId != null ? String(selectedDepartmentId) : undefined}
          isvertical
          onTabChange={(tab) => {
            const department = departments.find(
              (item) => String(item.DepartmentId) === tab.id,
            )
            if (department) onSelectDepartment(department)
          }}
        />
      )}
    </aside>
  )
}

export default JobRoleDepartmentPanel
