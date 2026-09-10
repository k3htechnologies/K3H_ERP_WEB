import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchCompanyMasterDropdown } from "@/features/companyMaster/companyMasterDropDown";
import { Button } from "@/ui/components/forms";
import { FileText, Plus } from "lucide-react";

interface Props {
  onCompanyChange: (companyId: number) => void;
}

export default function AccountDashboardHeader({ onCompanyChange }: Props) {
  return (
    <div className="bg-white rounded-xl p-3 flex items-center justify-between" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg w-[526px] text-sm text-gray-600">
          <SingleSelectDropdownWithPagination
            label=""
            title="All Companies"
            size="sm"
            dataFetchCallBack={fetchCompanyMasterDropdown}
            onSelected={(item) => {
              const selectedCompanyId = Number(item?.value ?? 0);
              onCompanyChange(selectedCompanyId);
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          color="blue"
          size="sm"
          variant="solid"
          colorMode="gradient_dark"
          defineWidth
          style={{ width: "150px" }}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Notice
        </Button>

        <Button 
        color="blue"
         variant="solid" 
         colorMode="extraLight" 
         style={{ height: "35px" }}
         leftIcon={<FileText size={14} />}>
          Generate Report
        </Button>
      </div>
    </div>
  );
}
