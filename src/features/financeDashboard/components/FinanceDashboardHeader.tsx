import { fetchCompanyMasterDropdown } from "@/features/companyMaster/companyMasterDropDown";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchProjectDropdown } from "@/features/projectMaster/projectDropdown";
import { Button } from "@/ui/components/forms";
import { FileText } from "lucide-react";

interface Props {
  onProjectChange: (projectId: number) => void;
  onCompanyChange: (companyId: number) => void;
}

export default function FinanceDashboardHeader({
  onProjectChange,
  onCompanyChange,
}: Props) {
  return (
    <div
      className="bg-white rounded-xl p-3 flex items-center justify-between" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
    >
      {/* Left Side */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Project Dropdown */}
        <div className="w-[300px] xl:w-[400px]">
          <SingleSelectDropdownWithPagination
            label=""
            title="All Projects"
            size="lg"
            dataFetchCallBack={fetchProjectDropdown}
            onSelected={(item) => {
              const selectedProjectId = Number(item?.value ?? 0);
              onProjectChange(selectedProjectId);
            }}
          />
        </div>

        {/* Company Dropdown */}
        <div className="w-[300px] xl:w-[400px]">
          <SingleSelectDropdownWithPagination
            label=""
            title="All Companies"
            size="lg"
            dataFetchCallBack={fetchCompanyMasterDropdown}
            onSelected={(item) => {
              const selectedCompanyId = Number(item?.value ?? 0);
              onCompanyChange(selectedCompanyId);
            }}
          />
        </div>
      </div>

      {/* Right Side */}
      <Button
        color="blue"
        variant="solid"
        colorMode="extraLight"
        leftIcon={<FileText size={14} />}
      >
        Generate Report
      </Button>
    </div>
  );
}