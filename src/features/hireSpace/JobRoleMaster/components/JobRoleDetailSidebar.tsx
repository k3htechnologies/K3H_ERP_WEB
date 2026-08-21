import React from "react"
import { Braces } from "lucide-react"
import type { JobRoleMasterData } from "@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel"
import { getJobRoleSkills } from "@/features/hireSpace/JobRoleMaster/utils/jobRoleUtils"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import { Button } from "@/ui/components/forms"

interface JobRoleDetailSidebarProps {
  jobRole: JobRoleMasterData
  isDuplicating: boolean
  canAction: boolean
  onDuplicate: () => void
}

export const JobRoleDetailSidebar: React.FC<JobRoleDetailSidebarProps> = ({ jobRole, isDuplicating, canAction, onDuplicate }) => {
  const skills = getJobRoleSkills(jobRole.RoleSkills)

  return (
    <aside className="flex w-full flex-col gap-4 xl:w-[248px]">
      <div className="flex-1 overflow-hidden rounded-[20px] border border-[#EAECF0] bg-white p-5">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold leading-5 text-[#1A1D1F]">
          <Braces className="h-4 w-4 text-[#215EED]" />
          Tech Stack
        </h3>
        {skills.length > 0 ? (
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[1px] text-[#9EA5AD]">Technical Skills</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="rounded-lg bg-[#F0F5FF] px-3 py-1.5 text-xs font-medium text-[#215EED]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <NoDataView message="No technical skills assigned" />
        )}
      </div>

      {canAction && (
        <div className="rounded-[20px] bg-[#101828] px-4 py-4 text-center text-white">
          <p className="mb-3 text-xs font-normal leading-4 text-[#98A2B3]">Need to duplicate this role for another department?</p>
          <Button
            onClick={onDuplicate}
            loading={isDuplicating}
            loadingText="Duplicating..."
            color="black"
            colorMode="light"
            size="sm"
            fullWidth
          >
            Duplicate Job Role
          </Button>
        </div>
      )}
    </aside>
  )
}

export default JobRoleDetailSidebar
