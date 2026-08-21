import React from "react"
import { Button } from "@/ui/components/forms"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import TooltipText from "@/ui/components/Tooltip/TooltipText"
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
}) => (
  <aside className="flex flex-col rounded-lg bg-white p-4">
    <h2 className="shrink-0 pb-3 text-base font-semibold text-[#292D32]">Department</h2>

    {departments.length === 0 ? (
      <NoDataView message="No Departments Found" />
    ) : (
      <div>
        {departments.map((department) => {
          const selected = selectedDepartmentId === department.DepartmentId
          const roleCount = department.TotalRoles ?? 0

          return (
            <div key={department.DepartmentId} className="border-b border-[#EEF0F3] py-1 last:border-b-0">
              <Button
                color={selected ? "blue" : "transparent"}
                colorMode={selected ? "extraLight" : undefined}
                fullWidth
                onClick={() => onSelectDepartment(department)}
              >
                <span className="flex w-full min-w-0 flex-1 items-center justify-between gap-3 text-left">
                  <span className="min-w-0 flex-1 text-left text-sm font-medium">
                    <TooltipText text={department.DepartmentName || "-"} maxWidth="100%" tooltipThreshold={18} isApplyBgTextColor />
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium leading-none ${
                      selected ? "bg-white text-[#135BEC]" : "bg-[#E7EFFA] text-[#6B7C93]"
                    }`}
                  >
                    {roleCount} {roleCount === 1 ? "Role" : "Roles"}
                  </span>
                </span>
              </Button>
            </div>
          )
        })}
      </div>
    )}
  </aside>
)

export default JobRoleDepartmentPanel
