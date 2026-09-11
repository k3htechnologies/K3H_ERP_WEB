import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchCompanyMasterDropdown } from "@/features/companyMaster/companyMasterDropDown";
import { Button } from "@/ui/components/forms";
import { FileText, Plus } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

interface Props {
  onCompanyChange: (companyId: number) => void;
}

export default function AccountDashboardHeader({ onCompanyChange }: Props) {

  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl p-3 flex items-center justify-between" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg w-[550px] text-sm text-gray-600">
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

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
        <Button
          variant="solid"
          color="blue"
          onClick={() => navigate("/taxTracker/add")}
          leftIcon={<Plus size={14} />}
        >
          Add Notice
        </Button>

        <Button
          color="blue"
          variant="solid"
          colorMode="extraLight"
          leftIcon={<FileText size={14} />}>
          Generate Report
        </Button>
      </div>
    </div>
  );
}
