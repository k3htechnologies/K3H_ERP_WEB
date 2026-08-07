import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { jobOpeningService } from "@/features/jobOpening/services/JobOpeningService";
import { jobRoleMasterService } from "@/features/hireSpace/services/JobRoleMasterService";
import { useToast } from "@/core/hooks/useToast";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import type {
  JobOpening,
  FilterWithPaginationJobOpeningRequest,
} from "@/features/jobOpening/models/JobOpeningModel";

import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { handleExportFile } from "@/core/utils/exportFile";
import { Modal } from "@/ui/components/Modal/Modal";
import { Input } from "@/ui/components/forms";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import Tabs from "@/ui/components/Tab/Tab";
import RoleListView from "../components/roleListView";

interface JobOpeningFilters {
  RoleName?: string;
  Department?: string;
  Status?: "active" | "inactive";
}

export const JobOpenings: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction, canExport } = useMenuPermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  const [activeTab, setActiveTab] = useState("all");

  const [filters, setFilters] = useState<JobOpeningFilters>({});
  const [tempFilters, setTempFilters] = useState<JobOpeningFilters>({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [departmentTabs, setDepartmentTabs] = useState([{ id: "all", label: "All" }]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [loadingDepartmentsMessage, setLoadingDepartmentsMessage] = useState("");

  const [roles, setRoles] = useState<JobOpening[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [loadingRolesMessage, setLoadingRolesMessage] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<JobOpening | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadDepartments = async () => {
      await runApiWithLoader(
        setIsLoadingDepartments,
        setLoadingDepartmentsMessage,
        async () => {
          const response = await jobRoleMasterService.apiCallPullJobDepartments({
            signal: abortController.signal,
          });

          if (isMounted) {
            if (E.isLeft(response)) {
              addToast({ type: "error", title: response.left.message });
            } else if (response.right.IsSuccess) {
              const mappedTabs = (response.right.Data ?? [])
                .filter((department) => department.DepartmentId && department.DepartmentName)
                .map((department) => ({
                  id: String(department.DepartmentId),
                  label: department.DepartmentName,
                }));
              setDepartmentTabs([{ id: "all", label: "All" }, ...mappedTabs]);
            } else {
              addToast({
                type: "error",
                title: response.right.ErrorMessage?.[0] || "Failed to load departments",
              });
            }
          }
          return response;
        },
        undefined,
        undefined,
        undefined,
        "Loading departments...",
      );
    };

    loadDepartments();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [addToast]);
  useEffect(() => {
    const abortController = new AbortController();

    const loadJobOpenings = async () => {
      await runApiWithLoader(
        setIsLoadingRoles,
        setLoadingRolesMessage,
        async () => {
          const params: FilterWithPaginationJobOpeningRequest = {
            PageNumber: 1,
            PageSize: 1000,
            RoleName: debouncedSearchQuery.trim() || filters.RoleName?.trim() || undefined,
            DepartmentName: filters.Department?.trim() || undefined,
            JobRoleStatus:
              filters.Status === "active"
                ? true
                : filters.Status === "inactive"
                  ? false
                  : undefined,
          };

          if (activeTab !== "all") {
            params.DepartmentMasterId = Number(activeTab);
          }

          const response = await jobOpeningService.apiCallPullJobOpening(params, {
            signal: abortController.signal,
          });

          if (E.isRight(response) && response.right.IsSuccess) {
            const data = await Promise.all(
              (response.right.Data ?? []).map(async (jobOpening) => {
                const applicationCount = jobOpening.ApplicationCount ?? jobOpening.ApplicationsCount ?? 0;

                if (applicationCount > 0) return jobOpening;

                const candidateResponse = await jobOpeningService.apiCallPullCandidates(
                  {
                    DepartmentId: jobOpening.DepartmentMasterId,
                    JobRoleMasterId: jobOpening.JobRoleMasterId,
                  },
                  { signal: abortController.signal },
                );

                if (
                  abortController.signal.aborted ||
                  E.isLeft(candidateResponse) ||
                  !candidateResponse.right.IsSuccess
                ) {
                  return jobOpening;
                }

                return {
                  ...jobOpening,
                  ApplicationCount: Math.max(
                    candidateResponse.right.TotalNumberOfRecord ?? 0,
                    candidateResponse.right.Data?.length ?? 0,
                  ),
                };
              }),
            );
            if (!abortController.signal.aborted) {
              setRoles(data);
              setTotalRecords(response.right.TotalNumberOfRecord ?? data.length);
            }
          } else {
            setRoles([]);
            setTotalRecords(0);
            if (!abortController.signal.aborted) {
              addToast({
                type: "error",
                title: E.isLeft(response)
                  ? response.left.message
                  : response.right.ErrorMessage?.[0] || "Failed to load job openings",
              });
            }
          }
          return response;
        },
        undefined,
        (error: unknown) => {
          if (!abortController.signal.aborted) {
            const err = error as Error;
            addToast({ type: "error", title: err.message || "Failed to load job openings" });
          }
        },
        undefined,
        "Loading job openings...",
      );
    };

    loadJobOpenings();

    return () => {
      abortController.abort();
    };
  }, [activeTab, filters, debouncedSearchQuery, addToast]);
  const clearSearchJobOpenings = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setFilters({});
    setTempFilters({});
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: keyof JobOpeningFilters, value: string) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleTabChange = (departmentId: string) => {
    setActiveTab(departmentId);
  };

  const handleRoleClick = (role: JobOpening) => {
    if (!role.JobOpeningMasterId) {
      addToast({
        type: "error",
        title: "Job opening identifier is missing.",
      });
      return;
    }
    navigate(
      `/jobOpenings/${role.DepartmentMasterId}/JobApplicationDetails/${role.JobOpeningMasterId}?jobRoleMasterId=${role.JobRoleMasterId}`,
      {
        state: {
          departmentName: role.DepartmentName,
          JobRoleName: role.JobRoleName || role.RoleName,
          JobRoleMasterId: role.JobRoleMasterId,
          JobOpeningMasterId: role.JobOpeningMasterId,
        },
      },
    );
  };

  const handleEditJob = (role: JobOpening) => {
    navigate(`/jobOpenings/add/${role.JobOpeningMasterId}`, { state: { jobData: role } });
  };

  const handleDeleteJob = (role: JobOpening) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRole) return;
    setIsDeleting(true);
    try {
      const response = await jobOpeningService.apiCallDeleteJobOpening({
        JobOpeningMasterId: selectedRole.JobOpeningMasterId,
        UniqueKey: selectedRole.UniqueKey,
      });
      if (E.isRight(response) && response.right.IsSuccess) {
        addToast({
          type: "success",
          title: response.right.SuccessMessage?.[0] || "Job opening deleted successfully",
        });
        setFilters((prev) => ({ ...prev }));
      } else {
        addToast({
          type: "error",
          title: E.isLeft(response)
            ? response.left.message
            : response.right.ErrorMessage?.[0] || "Failed to delete job opening",
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      addToast({ type: "error", title: err.message || "Deletion failed" });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
    }
  };

  const handleExport = async (type: "Excel" | "PDF") => {
    setIsExporting(true);
    try {
      const params: FilterWithPaginationJobOpeningRequest = {
        PageNumber: 1,
        PageSize: totalRecords || roles.length || 1000,
        RoleName: debouncedSearchQuery.trim() || filters.RoleName?.trim() || undefined,
        DepartmentName: filters.Department?.trim() || undefined,
        JobRoleStatus:
          filters.Status === "active"
            ? true
            : filters.Status === "inactive"
              ? false
              : undefined,
        ExportType: type,
      };

      if (activeTab !== "all") {
        params.DepartmentMasterId = Number(activeTab);
      }

      const response = await jobOpeningService.apiCallPullJobOpening(params);

      if (E.isRight(response)) {
        handleExportFile(response, type, "Job Openings", addToast);
      } else {
        addToast({
          type: "error",
          title: response.left.message || `Failed to export to ${type}`,
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      addToast({ type: "error", title: err.message || "Export failed" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => handleExport("Excel");
  const handleExportPdf = () => handleExport("PDF");
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="mb-1 shrink-0">
          <TableActionToolbar
            isShowSearchBar
            searchTerm={searchQuery}
            searchPlaceholder="Search By Role Name"
            onSearchChange={(value) => setSearchQuery(value)}
            onClearSearch={clearSearchJobOpenings}
            isShowFilterButton
            filters={{
              RoleName: filters.RoleName ?? "",
              Department: filters.Department ?? "",
              Status: filters.Status ?? "",
            }}
            onOpenFilter={() => {
              setTempFilters(filters);
              setShowFilterPopup(true);
            }}
            isShowCustomizeButton={false}
            isShowImportButton={false}
            isShowAddButton={canAction}
            onAdd={() => navigate("/jobOpenings/add")}
            isShowExportButton={canExport && roles.length > 0}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            exportLoading={isExporting}
          />
        </div>

        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter Job Openings"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            applyFilters();
          }}
          saveText="Apply"
          cancelText="Clear"
          onCancel={clearFilters}
          size="small-half"
        >
          <div className="space-y-6">
            <div>
              <Input
                type="text"
                label="Role Name"
                value={tempFilters.RoleName ?? ""}
                onChange={(e) => handleFilterChange("RoleName", e.target.value)}
                placeholder="Enter Role Name"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Department"
                value={tempFilters.Department ?? ""}
                onChange={(e) => handleFilterChange("Department", e.target.value)}
                placeholder="Enter Department"
              />
            </div>
            <div>
              <SinglePageSelection
                label="Status"
                value={tempFilters.Status ?? ""}
                onChange={(value) =>
                  setTempFilters((current) => ({
                    ...current,
                    Status: (value || undefined) as
                      | JobOpeningFilters["Status"]
                      | undefined,
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
          </div>
        </Modal>
        <div className="relative min-h-[36px] w-full shrink-0 overflow-x-auto pb-1">
          
          {isLoadingDepartments && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <p className="text-xs text-gray-400 font-medium">{loadingDepartmentsMessage || "Loading tabs..."}</p>
            </div>
          )}
          <div className="flex flex-nowrap">
            <Tabs
              tabs={departmentTabs}
              activeTab={activeTab}
              onTabChange={(tab) => handleTabChange(tab.id)}
              ariaLabel="Job opening departments"
              isScrollable
            />
          </div>
        </div>

        <div className="relative mt-2">
          {isLoadingRoles && (
            <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">{loadingRolesMessage || "Loading..."}</p>
            </div>
          )}
          <RoleListView
            filteredRoles={roles}
            onRoleClick={handleRoleClick}
            onEditClick={handleEditJob}
            onDeleteClick={handleDeleteJob}
          />
        </div>

      <DeleteDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRole(null);
        }}
        onConfirm={confirmDelete}
        loading={isDeleting}
        pageName="Job Opening"
      />
    </div>
  );
};

export default JobOpenings;
