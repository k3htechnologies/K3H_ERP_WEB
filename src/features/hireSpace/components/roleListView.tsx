import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/ui/components/forms";
import type { JobRole } from "../models/JobRoleModel";

interface RoleListViewProps {
  filteredRoles: JobRole[];
  visibleColumns?: Array<{ key: string; label: string }>;
  onRoleClick: (role: JobRole) => void;
  onEditClick?: (role: JobRole) => void;
  onDeleteClick: (role: JobRole) => void;
}

const RoleListView: React.FC<RoleListViewProps> = ({ filteredRoles, visibleColumns, onRoleClick, onEditClick, onDeleteClick }) => {
  if (!filteredRoles || filteredRoles.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-400 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        No job roles mapped to this department yet.
      </div>
    );
  }

  const isVisible = (key: string) =>
    !visibleColumns || visibleColumns.some((column) => column.key === key);

  return (
    <div className="thin-scroll h-full min-h-0 space-y-3 overflow-y-auto pr-1">
      {filteredRoles.map((role, idx) => {
        const key = role.UniqueKey || role.JobRoleId || `role-item-${idx}`;

        return (
          <div
            key={key}
            onClick={() => onRoleClick(role)}
            className="group flex cursor-pointer flex-col items-stretch gap-3 rounded-xl border border-[#EAECF0] bg-white px-3 py-4 transition-all hover:border-gray-300 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0 flex-1">
              {isVisible("RoleName") && (
                <span className="break-words text-left text-[18px] font-semibold leading-[100%] tracking-[0%] text-[#135BEC] underline-offset-2 group-hover:underline sm:text-center">
                  {role.RoleName || "Unnamed Position"}
                </span>
              )}
            </div>
            <div className="flex w-full items-center justify-between gap-3 sm:ml-auto sm:w-auto sm:justify-start">
              {isVisible("Status") &&
                (role.IsActive !== false ? (
                  <span className="rounded-full bg-[#E5F5EB] px-3 py-1 text-[10px] font-medium uppercase leading-[15px] tracking-[0.5px] text-[#17B26A]">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[10px] font-medium uppercase leading-[15px] tracking-[0.5px] text-[#64748B]">
                    Inactive
                  </span>
                ))}
              {isVisible("Actions") && <div className="flex gap-2 transition-all duration-150" onClick={(e) => e.stopPropagation()}>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditClick?.(role);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(role);
                  }}
                  className="p-1.5 bg-[#FEE4E2] hover:bg-[#FCD8D6] rounded-md text-[#F04438] hover:text-[#D92D20] transition-colors cursor-pointer"
                  title="Delete Role"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoleListView;
