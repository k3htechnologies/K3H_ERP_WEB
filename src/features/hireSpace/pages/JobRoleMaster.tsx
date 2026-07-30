import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Button, Input } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Modal } from "@/ui/components/Modal/Modal";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { Loader } from "@/core/utils/loader";
import { useToast } from "@/core/hooks/useToast";
import { handleExportFile } from "@/core/utils/exportFile";
import DepartmentPanel from "../components/JobRoleDepartmentPanel";
import RoleDetailView from "../components/JobRoleDetailView";
import RoleListView from "../components/JobRoleListView";
import { jobRoleMasterService } from "../services/JobRoleMasterService";
import type {
  JobDepartmentData,
  JobRoleMasterData,
} from "../models/JobRoleMasterModel";
import {
  getJobRoleApiMessage,
  getJobRoleSkillsText,
  isJobRoleActive,
  DEFAULT_UNIQUE_KEY,
} from "../utils/jobRoleUtils";

interface JobRoleFilters {
  roleName?: string;
  skills?: string;
  status?: "active" | "inactive";
}

export const JobRoleMaster: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [departments, setDepartments] = useState<JobDepartmentData[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<JobDepartmentData | null>(null);
  const [roles, setRoles] = useState<JobRoleMasterData[]>([]);
  const [selectedRole, setSelectedRole] = useState<JobRoleMasterData | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<JobRoleFilters>({});
  const [tempFilters, setTempFilters] = useState<JobRoleFilters>({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadDepartments = async () => {
      setIsLoadingDepartments(true);
      const response = await jobRoleMasterService.apiCallPullJobDepartments({
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
    async (department: JobDepartmentData, signal?: AbortSignal) => {
      setIsLoadingRoles(true);
      const response = await jobRoleMasterService.apiCallPullJobRoleMaster(
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
    const response = await jobRoleMasterService.apiCallPullJobRoleMaster({
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
    const response = await jobRoleMasterService.apiCallDeleteJobRoleMaster({
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

  const handleDuplicateRole = async (role: JobRoleMasterData) => {
    if (!role.DepartmentId) {
      addToast({ type: "error", title: "Department identifier is missing" });
      setIsDuplicateDialogOpen(false);
      return;
    }

    const roleSkills = getJobRoleSkillsText(role.RoleSkills);

    setIsDuplicating(true);
    const response = await jobRoleMasterService.apiCallAddUpdateJobRoleMaster({
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
    setIsDuplicateDialogOpen(false);

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <Loader
          loading={isLoadingDepartments || isLoadingRoles}
          title={isLoadingDepartments ? "Loading departments..." : "Loading job roles..."}
        >
          <div />
        </Loader>
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
            onOpenFilter={() => {
              setTempFilters(filters);
              setShowFilterPopup(true);
            }}
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

        {departments.length === 0 ? (
          <NoDataView
            message="No departments available"
            className="py-10"
          />
        ) : (
          <div className="mt-2 flex flex-col gap-3 sm:gap-6 lg:flex-row">
            <DepartmentPanel
              departments={departments}
              selectedDepartmentId={selectedDepartment?.DepartmentId ?? null}
              onSelectDepartment={(department) => {
                setSelectedDepartment(department);
                setSelectedRole(null);
                setViewMode("list");
              }}
            />

            <div className="relative flex flex-1 flex-col rounded-xl border border-gray-100 bg-white p-3 pt-4 shadow-xs sm:px-6 sm:pb-6 sm:pt-5">
              <div className="mb-4 flex shrink-0 flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-start sm:gap-4">
                <div
                  className={`flex min-w-0 flex-nowrap items-center gap-1 not-italic ${
                    isRoleDetailView
                      ? "text-xs font-medium leading-4 tracking-[0px]"
                      : "text-right text-base font-semibold leading-4 tracking-[0.6px]"
                  }`}
                >
                  <Button
                    type="button"
                    onClick={() => setViewMode("list")}
                    color="transparent"
                    size="xss"
                    className={`inline-flex h-4 items-center whitespace-nowrap align-middle hover:!text-blue-600 ${
                      isRoleDetailView ? "text-[#94A3B8]" : "text-[#17181C]"
                    }`}
                    style={{ height: 16, padding: 0, color: "inherit", fontSize: "inherit", fontWeight: "inherit" }}
                  >
                    Job Roles
                  </Button>
                  <ChevronRight className="h-3 w-3 shrink-0 text-[#94A3B8]" />
                  <Button
                    type="button"
                    onClick={() => setViewMode("list")}
                    color="transparent"
                    size="xss"
                    className="inline-flex h-4 items-center whitespace-nowrap align-middle text-[#334155] hover:!text-blue-600"
                    style={{ height: 16, padding: 0, color: "#334155", fontSize: "inherit", fontWeight: "inherit" }}
                  >
                    {selectedDepartment?.DepartmentName}
                  </Button>
                  {isRoleDetailView && selectedRole && (
                    <>
                      <ChevronRight className="h-3 w-3 shrink-0 text-[#94A3B8]" />
                      <div className="flex h-4 max-w-[120px] min-w-0 items-center sm:max-w-[180px]">
                        <TooltipText
                          text={selectedRole.RoleName}
                          maxWidth="180px"
                          tooltipThreshold={22}
                          isApplyBgTextColor
                          tooltipClassName="text-left text-xs font-medium leading-4 tracking-[0px] text-[#334155]"
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

              <div className="flex-1">
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
                    onDuplicate={() => setIsDuplicateDialogOpen(true)}
                  />
                )}
              </div>
            </div>
          </div>
        )}

      {showFilterPopup && (
        <Modal
          isOpen
          onClose={() => setShowFilterPopup(false)}
          title="Filter Job Roles"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({
              roleName: tempFilters.roleName?.trim() || undefined,
              skills: tempFilters.skills?.trim() || undefined,
              status: tempFilters.status,
            });
            setShowFilterPopup(false);
          }}
          saveText="Apply"
          cancelText="Clear"
          onCancel={() => {
            setFilters({});
            setTempFilters({});
            setShowFilterPopup(false);
          }}
          size="small-half"
        >
          <div className="space-y-6">
            <Input
              label="Role Name"
              value={tempFilters.roleName ?? ""}
              onChange={(event) =>
                setTempFilters((current) => ({
                  ...current,
                  roleName: event.target.value,
                }))
              }
              placeholder="Enter role name"
            />
            <Input
              label="Required Skills"
              value={tempFilters.skills ?? ""}
              onChange={(event) =>
                setTempFilters((current) => ({
                  ...current,
                  skills: event.target.value,
                }))
              }
              placeholder="Enter a skill"
            />
            <SinglePageSelection
              label="Status"
              value={tempFilters.status ?? ""}
              onChange={(value) =>
                setTempFilters((current) => ({
                  ...current,
                  status: (value || undefined) as JobRoleFilters["status"],
                }))
              }
              options={[
                { label: "All statuses", value: "" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              placeholder="All statuses"
              searchable={false}
              isShowClearSelection={false}
              size="sm"
              className="[&>div]:!h-10 [&>div]:!bg-white"
            />
          </div>
        </Modal>
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

      <DeleteDialog
        isOpen={isDuplicateDialogOpen}
        onClose={() => setIsDuplicateDialogOpen(false)}
        onConfirm={() => {
          if (selectedRole) void handleDuplicateRole(selectedRole);
        }}
        title="Duplicate Job Role?"
        message="Are you sure you want to duplicate this job role?"
        confirmText="Duplicate"
        loading={isDuplicating}
        variant="generate"
      />
    </div>
  );
};

export default JobRoleMaster;
