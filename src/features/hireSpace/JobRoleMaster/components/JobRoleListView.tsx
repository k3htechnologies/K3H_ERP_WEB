import React from "react"
import { ChevronRight, Edit, Plus, Trash2 } from "lucide-react"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import Pagination, { type PaginationInfo } from "@/ui/components/Pagination/Pagination"
import TooltipText from "@/ui/components/Tooltip/TooltipText"
import { Button } from "@/ui/components/forms"
import type { JobDepartmentData, JobRoleMasterData } from "@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel"
import { isJobRoleActive } from "@/features/hireSpace/JobRoleMaster/utils/jobRoleUtils"

interface JobRoleListViewProps {
  department: JobDepartmentData
  jobRoles: JobRoleMasterData[]
  pagination: PaginationInfo
  canAction: boolean
  onAddRole: () => void
  onViewRole: (jobRole: JobRoleMasterData) => void
  onEditRole: (jobRole: JobRoleMasterData) => void
  onDeleteRole: (jobRole: JobRoleMasterData) => void
}

export const JobRoleListView: React.FC<JobRoleListViewProps> = ({
  department,
  jobRoles,
  pagination,
  canAction,
  onAddRole,
  onViewRole,
  onEditRole,
  onDeleteRole,
}) => (
  <section className="flex min-h-0 min-w-0 flex-col rounded-lg bg-white p-4">
    <div className="flex shrink-0 items-center justify-between gap-4 pb-4">
      <div className="flex min-w-0 items-center gap-2 text-base font-semibold text-[#292D32]">
        <span className="shrink-0">Job Roles</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#7B838D]" />
        <TooltipText
          text={department.DepartmentName || "-"}
          maxWidth="260px"
          tooltipThreshold={28}
          isApplyBgTextColor
          tooltipClassName="text-base font-semibold text-[#292D32]"
        />
      </div>

      {canAction && (
        <Button color="blue" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={onAddRole}>
          Add Role
        </Button>
      )}
    </div>

    <div className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
      {jobRoles.length === 0 ? (
        <NoDataView message="No Job Roles Found" />
      ) : (
        jobRoles.map((jobRole) => {
          const active = isJobRoleActive(jobRole)

          return (
            <div
              key={jobRole.UniqueKey || jobRole.JobRoleId}
              className="flex min-h-[53px] items-center justify-between gap-4 rounded-lg border border-[#C9D3E1] bg-white px-4 py-3 transition-colors hover:border-[#9FB7D8] hover:bg-[#FBFDFF]"
            >
              <div className="min-w-0 flex-1">
                <TooltipText
                  text={jobRole.RoleName}
                  maxWidth="560px"
                  tooltipThreshold={48}
                  onClick={() => onViewRole(jobRole)}
                />
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase leading-none tracking-[0.3px] ${
                    active ? "bg-[#DDF8E7] text-[#16A55B]" : "bg-[#F1F3F5] text-[#667085]"
                  }`}
                >
                  {active ? "Active" : "Inactive"}
                </span>

                {canAction && (
                  <div className="flex items-center gap-2">
                    <Button
                      color="transparent"
                      size="sm"
                      isborderRadius
                      title="Edit"
                      onClick={() => onEditRole(jobRole)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      color="transparent"
                      size="sm"
                      isborderRadius
                      title="Delete"
                      onClick={() => onDeleteRole(jobRole)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>

    {pagination.totalPages > 1 && (
      <div className="mt-3 shrink-0">
        <Pagination pagination={pagination} />
      </div>
    )}
  </section>
)

export default JobRoleListView
