import { Copy } from "lucide-react";
import { Button } from "@/ui/components/forms";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { JobRoleMasterData } from "../models/JobRoleMasterModel";
import { getJobRoleSkills } from "../utils/jobRoleUtils";

interface JobRoleDetailSidebarProps {
  role: JobRoleMasterData;
  isDuplicating: boolean;
  onDuplicate: (role: JobRoleMasterData) => void;
}

export const JobRoleDetailSidebar: React.FC<JobRoleDetailSidebarProps> = ({
  role,
  isDuplicating,
  onDuplicate,
}) => {
  const skills = getJobRoleSkills(role.RoleSkills);

  return (
    <aside className="flex w-full flex-col gap-4 xl:w-[320px]">
      <div className="flex-1 overflow-hidden rounded-[20px] border border-[#EAECF0] bg-white p-4 sm:p-6">
        <h3 className="mb-5 text-[14px] font-bold leading-[20px] tracking-[0px] text-[#1A1D1F]">Tech Stack</h3>
        <FieldItem
          label="Required Skills"
          value={
            skills.length ? (
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-[#F0F5FF] px-3.5 py-1.5 text-[12px] font-medium text-[#215EED]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <NoDataView
                message="No technical skills assigned"
                className="py-3"
                iconClassName="!h-16 !w-16"
              />
            )
          }
        />
      </div>

      <div className="rounded-[20px] bg-[#101828] px-4 py-5 text-center text-white">
        <p className="mb-3 text-center align-middle text-[12px] font-normal leading-[16px] tracking-[0px] text-[#D0D5DD]">
          Need to duplicate this role?
        </p>
        <Button
          type="button"
          onClick={() => onDuplicate(role)}
          disabled={isDuplicating}
          loading={isDuplicating}
          loadingText="Duplicating..."
          color="transparent"
          fullWidth
          leftIcon={<Copy className="h-4 w-4" />}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#475467] bg-[#344054] px-3 text-center align-middle text-[14px] font-semibold leading-[16px] tracking-[0px] transition-colors hover:!bg-[#475467] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ height: 36, padding: "0 12px", border: "1px solid #475467", backgroundColor: "#344054", color: "#FFFFFF", fontSize: 14, fontWeight: 600 }}
        >
          Duplicate Job Role
        </Button>
      </div>
    </aside>
  );
};

export default JobRoleDetailSidebar;
