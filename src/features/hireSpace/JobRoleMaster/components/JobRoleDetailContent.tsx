import React from "react"
import { ClipboardCheck, FileText, ListChecks } from "lucide-react"
import type { JobRoleMasterData } from "@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel"
import { FieldItem } from "@/ui/components/forms/FieldItem"

interface JobRoleDetailContentProps {
  jobRole: JobRoleMasterData
}

export const JobRoleDetailContent: React.FC<JobRoleDetailContentProps> = ({ jobRole }) => (
  <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#EAECF0] bg-white">
    <div className="border-b border-[#EAECF0] px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF8FF]">
          <ListChecks className="h-4 w-4 text-[#215EED]" />
        </div>
        <div className="min-w-0 flex-1">
          <FieldItem label="Description" value={jobRole.RoleDescription} />
        </div>
      </div>
    </div>

    <div className="border-b border-[#EAECF0] px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F9F5FF]">
          <ClipboardCheck className="h-4 w-4 text-[#8A33FF]" />
        </div>
        <div className="min-w-0 flex-1">
          <FieldItem label="Responsibilities" value={jobRole.RoleResponsibility} />
        </div>
      </div>
    </div>

    <div className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF6ED]">
          <FileText className="h-4 w-4 text-[#F79009]" />
        </div>
        <h3 className="text-sm font-medium text-[#6F767E]">Requirements &amp; Qualifications</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
        <FieldItem label="EDUCATION" value={jobRole.RoleQualification} />
        <FieldItem label="TECHNICAL" value={jobRole.JobRequirement} />
      </div>
    </div>
  </section>
)

export default JobRoleDetailContent
