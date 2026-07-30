import React from "react";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button } from "@/ui/components/forms";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { JobDepartmentData } from "../models/JobRoleMasterModel";

interface DepartmentPanelProps {
  departments: JobDepartmentData[];
  selectedDepartmentId: number | null;
  onSelectDepartment: (dept: JobDepartmentData) => void;
}

export const DepartmentPanel: React.FC<DepartmentPanelProps> = ({ departments, selectedDepartmentId, onSelectDepartment }) => {
  return (
    <div className="flex min-h-0 w-full shrink-0 flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-3 shadow-xs sm:p-5 lg:h-full lg:w-[280px]">
      <h2 className="mb-2 inline-block text-base font-semibold leading-4 tracking-[0.6px] sm:mb-3">Department</h2>

      {departments.length === 0 ? (
        <NoDataView
          message="No departments found"
          className="py-4"
          iconClassName="!h-20 !w-20"
        />
      ) : (
        <div className="flex min-h-0 flex-row gap-1 overflow-x-auto overflow-y-hidden snap-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:flex-1 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:snap-none">
          {departments.map((dept) => {
            const isSelected = selectedDepartmentId === dept.DepartmentId;
            const rolesCount = dept.TotalRoles;
            return (
              <Button
                type="button"
                key={dept.DepartmentId}
                onClick={() => onSelectDepartment(dept)}
                color="transparent"
                fullWidth
                className={`flex min-w-[160px] cursor-pointer select-none items-center justify-between px-3 py-3 transition-all sm:min-w-[180px] sm:px-4 sm:py-3.5 lg:min-w-0 ${
                  isSelected ? "bg-[#EAF2FF] hover:!bg-[#EAF2FF] rounded-xl" : "hover:!bg-gray-50 rounded-xl"
                }`}
                style={{
                  height: "auto",
                  padding: 0,
                  justifyContent: "stretch",
                  backgroundColor: isSelected ? "#EAF2FF" : "transparent",
                  color: "inherit",
                  fontFamily: "inherit",
                }}
              >
                <div className="flex w-full items-center justify-between px-3 py-3 sm:px-4 sm:py-3.5">
                  <div className="min-w-0 flex-1 text-left">
                    <TooltipText
                      text={dept.DepartmentName}
                      maxWidth="100%"
                      tooltipThreshold={18}
                      isApplyBgTextColor
                      tooltipClassName={`text-left text-sm leading-[16px] tracking-[0.6px] hover:text-[#235EEE] hover:underline ${
                        isSelected ? "text-gray-900 font-bold" : "text-[#7B838D] font-medium"
                      }`}
                    />
                  </div>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1 text-center text-xs font-normal leading-[15px] transition-all ${
                      isSelected ? "bg-white text-[#215EED] font-semibold shadow-sm" : "bg-[#E9F0FA] text-[#697B93] font-medium"
                    }`}
                  >
                    {rolesCount} {rolesCount === 1 ? "Role" : "Roles"}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepartmentPanel;
