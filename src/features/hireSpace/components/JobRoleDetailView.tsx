import React from "react"
import { Briefcase, ChevronRight, Clock, MapPin } from "lucide-react"
import { JobRoleDetailContent, JobRoleDetailSidebar } from "@/features/hireSpace/components"
import type { JobRoleMasterData } from "@/features/hireSpace/models/JobRoleMasterModel"
import { Button } from "@/ui/components/forms"

interface JobRoleDetailViewProps {
  jobRole: JobRoleMasterData
  isDuplicating: boolean
  canAction: boolean
  onBackToList?: () => void
  onDuplicate: () => void
}

export const JobRoleDetailView: React.FC<JobRoleDetailViewProps> = ({
  jobRole,
  isDuplicating,
  canAction,
  onBackToList,
  onDuplicate,
}) => {
  const experience = [
    jobRole.ExperienceYears !== undefined ? `${jobRole.ExperienceYears} Years` : "",
    jobRole.ExperienceMonths !== undefined ? `${jobRole.ExperienceMonths} Months` : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto pt-5">
      <div className="mb-6">
        {onBackToList && (
          <div className="mb-3 flex min-w-0 items-center gap-2 text-[16px] font-semibold leading-5 text-[#292D32]">
            <Button
              color="transparent"
              size="xs"
              onClick={onBackToList}
              className="hover:text-blue-600"
              style={{ height: "auto", padding: 0, fontSize: "16px", fontWeight: 600 }}
            >
              Job Roles
            </Button>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#7B838D]" />
            <span className="truncate text-[16px] font-semibold leading-5 text-[#292D32]">
              {jobRole.DepartmentName || "-"}
            </span>
          </div>
        )}
        <h1 className="mb-3 text-lg font-semibold leading-7 text-[#1A1D1F]">{jobRole.RoleName || "-"}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#6F767E]">
            <Briefcase className="h-4 w-4 text-[#9EA5AD]" />
            {experience || "-"}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#6F767E]">
            <MapPin className="h-4 w-4 text-[#9EA5AD]" />
            {jobRole.WorkLocation || jobRole.WorkMode || "-"}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#6F767E]">
            <Clock className="h-4 w-4 text-[#9EA5AD]" />
            {jobRole.EmploymentType || "-"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_248px]">
        <JobRoleDetailContent jobRole={jobRole} />
        <JobRoleDetailSidebar
          jobRole={jobRole}
          isDuplicating={isDuplicating}
          canAction={canAction}
          onDuplicate={onDuplicate}
        />
      </div>
    </div>
  )
}

export default JobRoleDetailView
