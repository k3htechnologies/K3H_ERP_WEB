import React from "react"
import { Briefcase, Clock3, Edit, MapPin, Trash2 } from "lucide-react"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import Pagination, { type PaginationInfo } from "@/ui/components/Pagination/Pagination"
import { Button } from "@/ui/components/forms"
import type { JobOpeningData } from "@/features/hireSpace/jobOpening/models/JobOpeningModel"
import {
  getJobOpeningApplicationsCount,
  getJobOpeningEmploymentTypeLabel,
  getJobOpeningExperienceLabel,
  getJobOpeningWorkModeLabel,
} from "@/features/hireSpace/jobOpening/utils/jobOpeningUtils"

interface JobOpeningRoleListProps {
  jobOpenings: JobOpeningData[]
  pagination: PaginationInfo
  canAction: boolean
  onViewJobOpening: (jobOpening: JobOpeningData) => void
  onEditJobOpening: (jobOpening: JobOpeningData) => void
  onDeleteJobOpening: (jobOpening: JobOpeningData) => void
}

export const JobOpeningRoleList: React.FC<JobOpeningRoleListProps> = ({
  jobOpenings,
  pagination,
  canAction,
  onViewJobOpening,
  onEditJobOpening,
  onDeleteJobOpening,
}) => (
  <section className="rounded-lg bg-white">
    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
      {jobOpenings.length === 0 ? (
        <NoDataView message="No Job Openings Found" />
      ) : (
        jobOpenings.map((jobOpening, index) => {
          const isActive = jobOpening.JobRoleStatus !== false
          const roleName = jobOpening.JobRoleName || jobOpening.RoleName || "Untitled Role"
          const departmentName = jobOpening.DepartmentName?.trim() || "-"
          const applicationsCount = getJobOpeningApplicationsCount(jobOpening)
          const isLast = index === jobOpenings.length - 1

          return (
            <article
              key={jobOpening.UniqueKey || jobOpening.JobOpeningMasterId}
              className={`px-1 py-4 ${isLast ? "" : "border-b border-[#E8ECF1]"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onViewJobOpening(jobOpening)}
                    className="text-left text-base font-semibold text-[#1A1D1F] hover:text-[#135BEC]"
                  >
                    {roleName}
                  </button>

                  <span className="rounded bg-[#E8F0FF] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.3px] text-[#135BEC]">
                    {departmentName}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase leading-none tracking-[0.3px] ${
                      isActive ? "bg-[#DDF8E7] text-[#16A55B]" : "bg-[#F1F3F5] text-[#667085]"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {canAction && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      color="transparent"
                      size="sm"
                      isborderRadius
                      title="Edit"
                      onClick={() => onEditJobOpening(jobOpening)}
                    >
                      <Edit className="h-4 w-4 text-[#606775]" />
                    </Button>
                    <Button
                      color="transparent"
                      size="sm"
                      isborderRadius
                      title="Delete"
                      onClick={() => onDeleteJobOpening(jobOpening)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="mt-2 text-sm text-[#606775]">
                Total Openings: {jobOpening.NumberOfOpenings ?? 0}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#606775]">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    {getJobOpeningExperienceLabel(jobOpening)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {getJobOpeningWorkModeLabel(jobOpening)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 shrink-0" />
                    {getJobOpeningEmploymentTypeLabel(jobOpening)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onViewJobOpening(jobOpening)}
                  className="text-sm font-medium text-[#135BEC] hover:underline"
                >
                  • {applicationsCount} {applicationsCount === 1 ? "Application" : "Applications"}
                </button>
              </div>
            </article>
          )
        })
      )}
    </div>

    {pagination.totalPages > 1 && (
      <div className="mt-3 shrink-0 border-t border-[#E8ECF1] pt-3">
        <Pagination pagination={pagination} />
      </div>
    )}
  </section>
)

export default JobOpeningRoleList
