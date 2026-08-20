import React from "react"
import { ChevronRight, Edit, Plus, Trash2 } from "lucide-react"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import Pagination, { type PaginationInfo } from "@/ui/components/Pagination/Pagination"
import TooltipText from "@/ui/components/Tooltip/TooltipText"
import { Button } from "@/ui/components/forms"
import type { JobDepartmentData } from "@/features/hireSpace/models/JobRoleMasterModel"
import type { JobOpeningData } from "@/features/jobOpening/models/JobOpeningModel"

interface JobOpeningRoleListProps {
  department: JobDepartmentData
  jobOpenings: JobOpeningData[]
  pagination: PaginationInfo
  canAction: boolean
  onAddJobOpening: () => void
  onViewJobOpening: (jobOpening: JobOpeningData) => void
  onEditJobOpening: (jobOpening: JobOpeningData) => void
  onDeleteJobOpening: (jobOpening: JobOpeningData) => void
}

export const JobOpeningRoleList: React.FC<JobOpeningRoleListProps> = ({
  department,
  jobOpenings,
  pagination,
  canAction,
  onAddJobOpening,
  onViewJobOpening,
  onEditJobOpening,
  onDeleteJobOpening,
}) => (
  <section className="flex min-h-0 min-w-0 flex-col rounded-lg bg-white p-4">
    <div className="flex shrink-0 items-center justify-between gap-4 pb-4">
      <div className="flex min-w-0 items-center gap-2 text-base font-semibold text-[#292D32]">
        <span className="shrink-0">Job Openings</span>
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
        <Button color="blue" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={onAddJobOpening}>
          Add Opening
        </Button>
      )}
    </div>

    <div className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
      {jobOpenings.length === 0 ? (
        <NoDataView message="No Job Openings Found" />
      ) : (
        jobOpenings.map((jobOpening) => {
          const isActive = jobOpening.JobRoleStatus !== false
          const roleName = jobOpening.JobRoleName || jobOpening.RoleName || "Untitled Role"

          return (
            <div
              key={jobOpening.UniqueKey || jobOpening.JobOpeningMasterId}
              className="flex min-h-[53px] items-center justify-between gap-4 rounded-lg border border-[#C9D3E1] bg-white px-4 py-3 transition-colors hover:border-[#9FB7D8] hover:bg-[#FBFDFF]"
            >
              <div className="min-w-0 flex-1">
                <TooltipText
                  text={roleName}
                  maxWidth="560px"
                  tooltipThreshold={48}
                  onClick={() => onViewJobOpening(jobOpening)}
                />
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase leading-none tracking-[0.3px] ${
                    isActive ? "bg-[#DDF8E7] text-[#16A55B]" : "bg-[#F1F3F5] text-[#667085]"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>

                {canAction && (
                  <div className="flex items-center gap-2">
                    <Button
                      color="transparent"
                      size="sm"
                      isborderRadius
                      title="Edit"
                      onClick={() => onEditJobOpening(jobOpening)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      color="transparent"
                      size="sm"
                      isborderRadius
                      title="Delete"
                      onClick={() => onDeleteJobOpening(jobOpening)}
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

export default JobOpeningRoleList
