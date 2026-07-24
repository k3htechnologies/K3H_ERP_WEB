import React from "react";
import { Edit, Trash2, MapPin, Clock, Briefcase } from "lucide-react";
import { Button } from "@/ui/components/forms";
import type { JobOpening } from "../models/JobRoleModel";

interface ColumnConfig {
  key: string;
  label: string;
}

interface RoleListViewProps {
  filteredRoles: JobOpening[];
  visibleColumns?: ColumnConfig[];
  onRoleClick: (role: JobOpening) => void;
  onEditClick: (role: JobOpening) => void;
  onDeleteClick: (role: JobOpening) => void;
}

const RoleListView: React.FC<RoleListViewProps> = ({
  filteredRoles,
  visibleColumns,
  onRoleClick,
  onEditClick,
  onDeleteClick,
}) => {
  if (!filteredRoles || filteredRoles.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-400 font-medium bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        No job openings found in this category.
      </div>
    );
  }

  const isVisible = (key: string) => {
    if (!visibleColumns) return true;
    return visibleColumns.some((col) => col.key === key);
  };

  return (
    <div className="thin-scroll h-full min-h-0 space-y-4 overflow-y-auto pr-1">
      {filteredRoles.map((role) => {
        const isActive = role.JobRoleStatus === true;
        const applicationsCount = role.ApplicationsCount ?? 0;
        const hasApplications = applicationsCount > 0;

        return (
          <div
            key={role.JobOpeningMasterId}
            onClick={() => {
              if (hasApplications) onRoleClick(role);
            }}
            aria-disabled={!hasApplications}
            className={`rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm transition-all hover:border-gray-300 sm:p-5 ${
              hasApplications ? "group cursor-pointer" : "cursor-default"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                {isVisible("RoleName") && (
                  <h3
                    className={`break-words text-center text-[18px] font-semibold leading-[100%] tracking-[0%] text-[#135BEC] ${
                      hasApplications ? "underline-offset-2 group-hover:underline" : ""
                    }`}
                  >
                    {role.JobRoleName || "Untitled Role"}
                  </h3>
                )}
                {isVisible("DepartmentName") && role.DepartmentName && (
                  <span className="inline-flex h-[15px] items-center rounded-full bg-[#EEF2FF] p-3 align-middle text-[10px] font-medium uppercase leading-[15px] tracking-[0.5px] text-[#4F46E5]">
                    {role.DepartmentName}
                  </span>
                )}
                {isVisible("Status") &&
                  (isActive ? (
                    <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 align-middle text-[10px] font-medium uppercase leading-[15px] tracking-[0.5px] text-[#16A34A]">ACTIVE</span>
                  ) : (
                    <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.5px] text-[#64748B]">INACTIVE</span>
                  ))}
              </div>
              {isVisible("Actions") && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button type="button" color="transparent" isborderRadius size="sm" title="Edit" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditClick(role); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button type="button" color="transparent" size="xs" defineWidth title="Delete job opening" onClick={(e) => { e.stopPropagation(); onDeleteClick(role); }} className="p-1.5 bg-[#FEE2E2] hover:bg-red-200 rounded-md text-[#EF4444] transition-colors" style={{ backgroundColor: "#FEE2E2", color: "#EF4444" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
            {isVisible("NumberOfOpenings") && (
              <div className="mt-2.5"><p className="text-xs font-normal text-gray-400">Total Openings : <span className="font-semibold text-gray-700">{role.NumberOfOpenings ?? "—"}</span></p></div>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-normal text-gray-500">
                {isVisible("Experience") && <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400" strokeWidth={2} />{role.ExperienceYears || 0} yrs {role.ExperienceMonths || 0} mos</div>}
                {isVisible("WorkLocation") && <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" strokeWidth={2} />{role.WorkLocation || "—"}</div>}
                {isVisible("EmploymentType") && <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" strokeWidth={2} />{role.EmploymentType || role.WorkMode || "—"}</div>}
              </div>
              {isVisible("ApplicationsCount") && (
                <div className="flex shrink-0 items-center gap-1 self-end text-xs font-medium text-[#3B82F6] sm:self-auto"><span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" aria-hidden="true" />{applicationsCount} Applications</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoleListView;
