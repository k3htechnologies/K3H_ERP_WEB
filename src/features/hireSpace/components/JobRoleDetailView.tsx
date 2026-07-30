import { Briefcase, Clock, MapPin } from "lucide-react";
import type { JobRoleMasterData } from "../models/JobRoleMasterModel";
import JobRoleDetailContent from "./JobRoleDetailContent";
import JobRoleDetailSidebar from "./JobRoleDetailSidebar";

interface RoleDetailViewProps {
  selectedRole: JobRoleMasterData | null;
  isDuplicating?: boolean;
  onDuplicate: (role: JobRoleMasterData) => void;
}

export const RoleDetailView: React.FC<RoleDetailViewProps> = ({ selectedRole, isDuplicating = false, onDuplicate }) => {
  if (!selectedRole) return null;

  const experience = [selectedRole.ExperienceYears, selectedRole.ExperienceMonths]
    .filter((value) => value !== undefined)
    .join("y");

  return (
    <div className="thin-scroll h-full min-h-0 overflow-y-auto pr-1">
      <div className="mb-6">
        <h1 className="mb-3 text-[16px] font-semibold leading-[33.6px] tracking-[-0.7px] text-[#1A1D1F]">
          {selectedRole.RoleName}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[#6F767E]">
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-[#9EA5AD]" />
            {experience || "Experience not specified"}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#9EA5AD]" />
            {selectedRole.WorkLocation || selectedRole.WorkMode || "Not specified"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#9EA5AD]" />
            {selectedRole.EmploymentType || "Not specified"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <JobRoleDetailContent role={selectedRole} />
        <JobRoleDetailSidebar
          role={selectedRole}
          isDuplicating={isDuplicating}
          onDuplicate={onDuplicate}
        />
      </div>
    </div>
  );
};

export default RoleDetailView;
