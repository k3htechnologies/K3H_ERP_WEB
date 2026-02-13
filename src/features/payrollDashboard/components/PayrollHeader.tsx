import React, { useState } from "react";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Button } from "@/ui/components/forms";
import { Modal } from "@/ui/components/Modal/Modal";
import { FileText, Plus } from "lucide-react";
import { type FilterInfo } from "@/ui/components/DataTable/DataTable";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { DateRangeSelector } from "@/ui/components/forms/DateRangeSelector";
import { useNavigate } from "react-router-dom";

interface PayrollHeaderProps {
  onFilterChange: (filters: FilterInfo) => void;
}

const PayrollHeader: React.FC<PayrollHeaderProps> = ({ onFilterChange }) => {
  const navigate = useNavigate();

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [searchEmployeeNameTerm, setEmployeeNameTerm] = useState("");
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onFilterChange({ ...tempFilters, searchEmployeeNameTerm: value });
  }, 350);

  const handleStartDateChange = (value: string | null) => {
    console.log("Value is start date ", value);
    setTempFilters({ ...tempFilters, startDate: value });
  };

  const handleEndDateChange = (value: string | null) => {
    console.log("Value is end date", value);
    setTempFilters({ ...tempFilters, endDate: value });
  };

  const clearSearchEmpName = () => {
    setEmployeeNameTerm("");
    debouncedSearch.cancel?.();
    onFilterChange({ ...tempFilters, searchEmployeeNameTerm: "" });
  };

  return (
    <>
      <div
        className="bg-white rounded-xl p-4 flex flex-col  lg:flex-row lg:items-center justify-between"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        {/* Toolbar: Search and Filter Button */}
        <div className="w-full lg:w-auto lg:mt-0 p-2 -mb-2">
          <TableActionToolbar
            isShowSearchBar
            searchPlaceholder="Search By Employee Name"
            isShowFilterButton
            onOpenFilter={() => setShowFilterPopup(true)}
            searchTerm={searchEmployeeNameTerm}
            onSearchChange={(v) => {
              setEmployeeNameTerm(v);
              debouncedSearch(v);
            }}
            onClearSearch={clearSearchEmpName}
          />
        </div>

        {/*Button Group  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-4 -mt-1">
          <Button
            variant="solid"
            color="blue"
            leftIcon={<Plus size={14} />}
            className="w-full lg:w-auto text-sm"
            onClick={() => {
              navigate("/leave/add");
            }}
          >
            Apply Leave
          </Button>

          <Button
            color="blue"
            variant="solid"
            colorMode="extraLight"
            leftIcon={<FileText size={14} />}
            className="w-full lg:w-auto text-sm"
            onClick={() => {
              navigate("/compOff");
            }}
          >
            Request Comp-Off
          </Button>

          <Button
            color="blue"
            variant="solid"
            colorMode="extraLight"
            leftIcon={<Plus size={14} />}
            className="w-full lg:w-auto text-sm"
            onClick={() => {
              navigate("/outdoor/add");
            }}
          >
            Add Outdoor
          </Button>
        </div>
      </div>

      {/* Modal for filteration */}
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter By Duration"
        saveText="Apply"
        cancelText="Clear"
        onCancel={() => {
          setTempFilters({});
        }}
        size="small-half"
        // On Apply Filter
        onSubmit={(e) => {
          e.preventDefault();
          setShowFilterPopup(false);
          onFilterChange(tempFilters);
        }}
      >
        <div>
          <DateRangeSelector
            fromDate={tempFilters.startDate || null}
            toDate={tempFilters.endDate || null}
            onFromDateChange={handleStartDateChange}
            onToDateChange={handleEndDateChange}
          />
        </div>
      </Modal>
    </>
  );
};

export default PayrollHeader;
