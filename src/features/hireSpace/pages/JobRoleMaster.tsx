import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Button } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useToast } from "@/core/hooks/useToast";
import { handleExportFile } from "@/core/utils/exportFile";
import DepartmentPanel from "../components/departmentPanel";
import FilterModal, {
  type JobRoleFilters,
} from "../components/filterModel";
import RoleDetailView from "../components/roleDetailView";
import RoleListView from "../components/roleListView";
import { jobRoleService } from "../services/JobRoleServices";
import type { DepartmentItem, JobRole } from "../models/JobRoleModel";
import {
  getJobRoleApiMessage,
  getJobRoleSkillsText,
  isJobRoleActive,
} from "../utils/jobRoleUtils";

const DEFAULT_UNIQUE_KEY = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

const JobRoleMaster = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentItem | null>(null);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<JobRoleFilters>({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadDepartments = async () => {
      setIsLoadingDepartments(true);
      const response = await jobRoleService.apiCallPullJobDepartments({
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setIsLoadingDepartments(false);
      if (E.isLeft(response)) {
        addToast({ type: "error", title: response.left.message });
        return;
      }
      if (!response.right.IsSuccess) {
        addToast({
          type: "error",
          title: getJobRoleApiMessage(response.right.ErrorMessage, "Unable to load departments"),
        });
        return;
      }
      const data = Array.isArray(response.right.Data) ? response.right.Data : [];
      setDepartments(data);
      setSelectedDepartment((current) =>
        current
          ? data.find((item) => item.DepartmentId === current.DepartmentId) ??
            data[0] ??
            null
          : data[0] ?? null,
      );
    };
    void loadDepartments();
    return () => controller.abort();
  }, [addToast]);

  const loadRoles = useCallback(
    async (department: DepartmentItem, signal?: AbortSignal) => {
      setIsLoadingRoles(true);
      const response = await jobRoleService.apiCallPullJobRoles(
        {
          PageSize: 1000,
          PageNumber: 1,
          DepartmentId: department.DepartmentId,
        },
        { signal },
      );
      if (signal?.aborted) return;
      setIsLoadingRoles(false);
      if (E.isLeft(response)) {
        addToast({ type: "error", title: response.left.message });
        return;
      }
      if (!response.right.IsSuccess) {
        addToast({
          type: "error",
          title: getJobRoleApiMessage(response.right.ErrorMessage, "Unable to load job roles"),
        });
        return;
      }
      setRoles(Array.isArray(response.right.Data) ? response.right.Data : []);
    },
    [addToast],
  );

  useEffect(() => {
    if (!selectedDepartment) {
      setRoles([]);
      return;
    }
    const controller = new AbortController();
    void loadRoles(selectedDepartment, controller.signal);
    return () => controller.abort();
  }, [loadRoles, selectedDepartment]);

  const filteredRoles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return roles.filter((role) => {
      const matchesSearch =
        !query ||
        role.RoleName.toLowerCase().includes(query) ||
        role.DepartmentName?.toLowerCase().includes(query) ||
        role.RoleDescription?.toLowerCase().includes(query) ||
        role.RoleQualification?.toLowerCase().includes(query) ||
        role.RoleResponsibility?.toLowerCase().includes(query) ||
        role.JobRequirement?.toLowerCase().includes(query) ||
        getJobRoleSkillsText(role.RoleSkills).toLowerCase().includes(query);
      const active = isJobRoleActive(role);
      const matchesRoleName =
        !filters.roleName ||
        role.RoleName.toLowerCase().includes(filters.roleName.toLowerCase());
      const matchesSkills =
        !filters.skills ||
        getJobRoleSkillsText(role.RoleSkills)
          .toLowerCase()
          .includes(filters.skills.toLowerCase());
      const matchesStatus =
        !filters.status ||
        (filters.status === "active" ? active : !active);
      return matchesSearch && matchesRoleName && matchesSkills && matchesStatus;
    });
  }, [filters, roles, searchQuery]);

  const handleExport = async (exportType: "Excel" | "PDF") => {
    setIsExporting(true);
    const response = await jobRoleService.apiCallPullJobRoles({
      PageSize: roles.length || 1000,
      PageNumber: 1,
      DepartmentId: selectedDepartment?.DepartmentId,
      RoleName: searchQuery.trim() || filters.roleName?.trim() || undefined,
      RoleSkills: filters.skills?.trim() || undefined,
      IsActive:
        filters.status === "active"
          ? true
          : filters.status === "inactive"
            ? false
            : undefined,
      ExportType: exportType,
    });
    handleExportFile(response, exportType, "Job Role Master", addToast);
    setIsExporting(false);
  };

  const confirmDelete = async () => {
    if (!selectedRole?.JobRoleId || !selectedRole.UniqueKey) {
      addToast({ type: "error", title: "Job role identifier is missing" });
      setIsDeleteModalOpen(false);
      return;
    }
    setIsMutating(true);
    const response = await jobRoleService.apiCallDeleteJobRole({
      JobRoleId: selectedRole.JobRoleId,
      UniqueKey: selectedRole.UniqueKey,
    });
    if (E.isRight(response) && response.right.IsSuccess) {
      addToast({
        type: "success",
        title: getJobRoleApiMessage(response.right.SuccessMessage, "Job role deleted"),
      });
      if (selectedDepartment) await loadRoles(selectedDepartment);
    } else {
      addToast({
        type: "error",
        title: E.isLeft(response)
          ? response.left.message
          : getJobRoleApiMessage(response.right.ErrorMessage, "Unable to delete job role"),
      });
    }
    setIsMutating(false);
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
    setViewMode("list");
  };

  const handleDuplicateRole = async (role: JobRole) => {
    if (!role.DepartmentId) {
      addToast({ type: "error", title: "Department identifier is missing" });
      return;
    }

    const roleSkills = getJobRoleSkillsText(role.RoleSkills);

    setIsDuplicating(true);
    const response = await jobRoleService.apiCallAddUpdateJobRole({
      JobRoleId: 0,
      UniqueKey: DEFAULT_UNIQUE_KEY,
      DepartmentId: role.DepartmentId,
      RoleName: role.RoleName,
      RoleDescription: role.RoleDescription || "",
      RoleQualification: role.RoleQualification || "",
      RoleResponsibility: role.RoleResponsibility || "",
      JobRequirement: role.JobRequirement || "",
      RoleSkills: roleSkills,
      IsCopy: "1",
    });
    setIsDuplicating(false);

    if (E.isLeft(response) || !response.right.IsSuccess) {
      addToast({
        type: "error",
        title: E.isLeft(response)
          ? response.left.message
          : getJobRoleApiMessage(response.right.ErrorMessage, "Unable to duplicate job role"),
      });
      return;
    }

    addToast({
      type: "success",
      title: getJobRoleApiMessage(response.right.SuccessMessage, "Job role duplicated successfully"),
    });
    if (selectedDepartment) await loadRoles(selectedDepartment);
    setSelectedRole(null);
    setViewMode("list");
  };

  const isRoleDetailView = viewMode === "detail" && Boolean(selectedRole);

  return (
    <div className="talent-module relative mx-auto flex h-[calc(100dvh-96px)] min-h-0 w-full max-w-[1600px] flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-3 text-gray-800 shadow-sm sm:p-6 lg:h-[calc(100dvh-88px)]">
        <div className="shrink-0">
          <TableActionToolbar
            isShowSearchBar
            searchTerm={searchQuery}
            searchPlaceholder="Search by role or department"
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery("")}
            isShowFilterButton
            filters={{
              roleName: filters.roleName ?? "",
              skills: filters.skills ?? "",
              status: filters.status ?? "",
            }}
            onOpenFilter={() => setShowFilterPopup(true)}
            isShowCustomizeButton={false}
            isShowExportButton={roles.length > 0}
            onExportExcel={() => void handleExport("Excel")}
            onExportPdf={() => void handleExport("PDF")}
            exportLoading={isExporting}
            isShowImportButton={false}
            isShowAddButton={false}
            isShowAddExtraButton={false}
          />
        </div>

        {isLoadingDepartments ? (
          <LoadingState message="Loading departments..." />
        ) : departments.length === 0 ? (
          <div className="mt-3 rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
            No departments available.
          </div>
        ) : (
          <div className="mt-2 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden sm:gap-6 lg:flex-row">
            <DepartmentPanel
              departments={departments}
              selectedDepartmentId={selectedDepartment?.DepartmentId ?? null}
              onSelectDepartment={(department) => {
                setSelectedDepartment(department);
                setSelectedRole(null);
                setViewMode("list");
              }}
            />

            <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-3 pt-4 shadow-xs sm:px-6 sm:pb-6 sm:pt-5">
              {isLoadingRoles && <LoadingOverlay />}
              <div className="mb-4 flex shrink-0 flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-start sm:gap-4">
                <div
                  className={`flex min-w-0 flex-nowrap items-center gap-1 not-italic ${
                    isRoleDetailView
                      ? "text-[12px] font-medium leading-4 tracking-[0px]"
                      : "text-right text-[16px] font-semibold leading-4 tracking-[0.6px]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`inline-flex h-4 items-center whitespace-nowrap align-middle hover:text-blue-600 ${
                      isRoleDetailView ? "text-[#94A3B8]" : "text-[#17181C]"
                    }`}
                  >
                    Job Roles
                  </button>
                  <ChevronRight className="h-3 w-3 shrink-0 text-[#94A3B8]" />
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className="inline-flex h-4 items-center whitespace-nowrap align-middle text-[#334155] hover:text-blue-600"
                  >
                    {selectedDepartment?.DepartmentName}
                  </button>
                  {isRoleDetailView && selectedRole && (
                    <>
                      <ChevronRight className="h-3 w-3 shrink-0 text-[#94A3B8]" />
                      <div className="flex h-4 max-w-[120px] min-w-0 items-center sm:max-w-[180px]">
                        <TooltipText
                          text={selectedRole.RoleName}
                          maxWidth="180px"
                          tooltipThreshold={22}
                          isApplyBgTextColor
                          tooltipClassName="text-left text-[12px] font-medium leading-4 tracking-[0px] text-[#334155]"
                        />
                      </div>
                    </>
                  )}
                </div>

                {viewMode === "list" && selectedDepartment && (
                  <Button onClick={() => navigate(`/jobRoleMaster/add/${selectedDepartment.DepartmentId}`)}>
                    <Plus className="h-4 w-4" /> Add Role
                  </Button>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {viewMode === "list" ? (
                  <RoleListView
                    filteredRoles={filteredRoles}
                    onRoleClick={(role) => {
                      setSelectedRole(role);
                      setViewMode("detail");
                    }}
                    onEditClick={(role) =>
                      navigate(
                        `/jobRoleMaster/edit/${role.DepartmentId}/${role.JobRoleId}`,
                        { state: { jobData: role } },
                      )
                    }
                    onDeleteClick={(role) => {
                      setSelectedRole(role);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                ) : (
                  <RoleDetailView
                    selectedRole={selectedRole}
                    isDuplicating={isDuplicating}
                    onDuplicate={(role) => void handleDuplicateRole(role)}
                  />
                )}
              </div>
            </main>
          </div>
        )}

      {showFilterPopup && (
        <FilterModal
          value={filters}
          onClose={() => setShowFilterPopup(false)}
          onReset={() => {
            setFilters({});
            setShowFilterPopup(false);
          }}
          onApply={(value) => {
            setFilters(value);
            setShowFilterPopup(false);
          }}
        />
      )}

      <DeleteDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRole(null);
        }}
        onConfirm={() => void confirmDelete()}
        loading={isMutating}
        pageName="Job Role"
      />
    </div>
  );
};

const LoadingState = ({ message }: { message: string }) => (
  <div className="mt-2 flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-6">
    <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#135BEC]" />
    <p className="text-sm font-medium text-gray-500">{message}</p>
  </div>
);

const LoadingOverlay = () => (
  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
    <Loader2 className="h-8 w-8 animate-spin text-[#135BEC]" />
  </div>
);

export default JobRoleMaster;
