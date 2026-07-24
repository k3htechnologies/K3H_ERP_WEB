import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { jobRoleService } from "@/features/jobOpening/services/JobRoleServices";
import { useToast } from "@/core/hooks/useToast";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import type {
  JobOpening,
  JobOpeningListRequest,
} from "@/features/jobOpening/models/JobRoleModel";

import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { handleExportFile } from "@/core/utils/exportFile";
import { Modal } from "@/ui/components/Modal/Modal";
import { Input } from "@/ui/components/forms";
import {
  firstDefined,
  getResponseData,
  toApiRecordList,
} from "../utils/candidateApplication";
import ScrollableTabs from "@/ui/components/Tab/ScrollableTabs";
import RoleListView from "../components/roleListView";

interface JobOpeningFilters {
  RoleName?: string;
  Department?: string;
  Status?: "active" | "inactive";
}

// Custom type structure to bypass 'any' errors cleanly
interface UnwrappedResponse {
  Data?: Array<Record<string, unknown>>;
  TotalNumberOfRecord?: number;
}

const numberFromRecord = (
  record: Record<string, unknown>,
  keys: string[],
): number => {
  const value = Number(firstDefined(record, keys));
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const nonNegativeNumberFromRecord = (
  record: Record<string, unknown>,
  keys: string[],
): number | undefined => {
  const rawValue = firstDefined(record, keys);
  if (rawValue === undefined) return undefined;
  const value = Number(rawValue);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
};

const getTotalNumberOfRecords = (response: unknown): number | undefined => {
  if (!response || typeof response !== "object") return undefined;

  const result = response as {
    TotalNumberOfRecord?: unknown;
    totalNumberOfRecord?: unknown;
  };
  const value = Number(
    result.TotalNumberOfRecord ?? result.totalNumberOfRecord,
  );

  return Number.isFinite(value) && value >= 0 ? value : undefined;
};

const normalizeJobOpening = (
  record: Record<string, unknown>,
): JobOpening => ({
  ...(record as unknown as JobOpening),
  JobOpeningMasterId: numberFromRecord(record, [
    "JobOpeningMasterId",
    "JobOpeningMasterID",
    "JobOpeningId",
    "Id",
  ]),
  JobRoleMasterId: numberFromRecord(record, [
    "JobRoleMasterId",
    "JobRoleMasterID",
    "JobRoleId",
  ]),
  DepartmentMasterId: numberFromRecord(record, [
    "DepartmentMasterId",
    "DepartmentMasterID",
    "DepartmentId",
  ]),
  ApplicationsCount: nonNegativeNumberFromRecord(record, [
    "ApplicationsCount",
    "ApplicationCount",
    "ApplicantCount",
    "ApplicationCounts",
    "TotalApplications",
    "TotalApplicants",
    "CandidateCount",
    "NumberOfApplications",
    "NoOfApplications",
    "TotalApplicationCount",
    "TotalCandidateCount",
  ]),
});

export default function JobOpenings() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { canAction, canExport } = useMenuPermissions();

  // #region SEARCH & DEBOUNCE (State-driven)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  // #endregion

  const [activeTab, setActiveTab] = useState("all");

  // #region FILTERS
  const [filters, setFilters] = useState<JobOpeningFilters>({});
  const [tempFilters, setTempFilters] = useState<JobOpeningFilters>({});
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  // #endregion

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

  // #region EXPORT
  const [isExporting, setIsExporting] = useState(false);
  // #endregion

  // #region LOAD DEPARTMENTS
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadDepartments = async () => {
      await runApiWithLoader(
        setIsLoadingDepartments,
        setLoadingDepartmentsMessage,
        async () => {
          const response = await jobRoleService.apiCallPullJobDepartments({
            signal: abortController.signal,
          });

          if (isMounted && E.isRight(response)) {
            // Using unknown cast instead of 'any' to avoid strict linter errors
            const rawResponse = response.right as unknown as UnwrappedResponse;
            const rawData = Array.isArray(rawResponse.Data) ? rawResponse.Data : [];
            const mappedTabs = rawData
              .filter((d) => d.DepartmentId && d.DepartmentName)
              .map((d) => ({
                id: String(d.DepartmentId),
                label: String(d.DepartmentName),
              }));
            setDepartmentTabs([{ id: "all", label: "All" }, ...mappedTabs]);
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
  }, []);
  // #endregion

  // #region LOAD JOB OPENINGS (Single Unified Reactive Source of Truth)
  useEffect(() => {
    const abortController = new AbortController();

    const loadJobOpenings = async () => {
      await runApiWithLoader(
        setIsLoadingRoles,
        setLoadingRolesMessage,
        async () => {
          const params: JobOpeningListRequest = {
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

          const response = await jobRoleService.apiCallPullJobOpenings(params, {
            signal: abortController.signal,
          });

          if (E.isRight(response)) {
            // Replaced 'any' with typed unknown conversion
            const rawResponse = response.right as unknown as UnwrappedResponse;
            const rawData = Array.isArray(rawResponse.Data)
              ? rawResponse.Data
              : [];
            const normalizedData = rawData.map(normalizeJobOpening);
            const roleQuery = (
              debouncedSearchQuery.trim() ||
              filters.RoleName?.trim() ||
              ""
            ).toLowerCase();
            const departmentQuery = (filters.Department?.trim() || "").toLowerCase();
            const locallyFilteredData = normalizedData.filter((role) => {
              const roleName = (role.JobRoleName || role.RoleName || "").toLowerCase();
              const departmentName = (role.DepartmentName || "").toLowerCase();
              const matchesRole = !roleQuery || roleName.includes(roleQuery);
              const matchesDepartment =
                !departmentQuery || departmentName.includes(departmentQuery);
              const matchesStatus =
                !filters.Status ||
                (filters.Status === "active"
                  ? role.JobRoleStatus === true
                  : role.JobRoleStatus === false);

              return matchesRole && matchesDepartment && matchesStatus;
            });
            let rolesWithApplicationCounts = locallyFilteredData;

            const shouldRecalculateApplicationCounts =
              locallyFilteredData.some(
                (role) => role.ApplicationsCount === undefined,
              ) ||
              (locallyFilteredData.length > 0 &&
                locallyFilteredData.every(
                  (role) => (role.ApplicationsCount ?? 0) === 0,
                ));

            if (shouldRecalculateApplicationCounts) {
              rolesWithApplicationCounts = await Promise.all(
                  locallyFilteredData.map(async (role) => {
                  if (role.JobRoleMasterId <= 0) {
                    return {
                      ...role,
                      ApplicationsCount: role.ApplicationsCount ?? 0,
                    };
                  }

                  const candidateResponse =
                    await jobRoleService.apiCallPullCandidates(
                      {
                        DepartmentId:
                          role.DepartmentMasterId > 0
                            ? role.DepartmentMasterId
                            : activeTab !== "all"
                              ? Number(activeTab)
                              : undefined,
                        JobRoleMasterId: role.JobRoleMasterId,
                      },
                      { signal: abortController.signal },
                    );

                  if (E.isLeft(candidateResponse)) {
                    return {
                      ...role,
                      ApplicationsCount: role.ApplicationsCount ?? 0,
                    };
                  }

                  const candidateRecords = toApiRecordList(
                    getResponseData<unknown>(candidateResponse.right),
                  );
                  const pulledCandidateCount = Math.max(
                    getTotalNumberOfRecords(candidateResponse.right) ?? 0,
                    candidateRecords.length,
                  );

                  return {
                    ...role,
                    ApplicationsCount: Math.max(
                      role.ApplicationsCount ?? 0,
                      pulledCandidateCount,
                    ),
                  };
                }),
              );
            }

            if (!abortController.signal.aborted) setRoles(rolesWithApplicationCounts);
            setTotalRecords(
              rawResponse.TotalNumberOfRecord ?? locallyFilteredData.length,
            );
          } else {
            setRoles([]);
            setTotalRecords(0);
            if (!abortController.signal.aborted) {
              addToast({ type: "error", title: response.left.message || "Failed to load job openings" });
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
  // #endregion

  // #region SEARCH & FILTER ACTIONS
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
  // #endregion

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
      const response = await jobRoleService.apiCallDeleteJobOpening({
        JobOpeningMasterId: selectedRole.JobOpeningMasterId,
        UniqueKey: selectedRole.UniqueKey,
      });
      if (E.isRight(response)) {
        addToast({
          type: "success",
          title: response.right.SuccessMessage?.[0] || "Job opening deleted successfully",
        });
        setFilters((prev) => ({ ...prev }));
      } else {
        addToast({ type: "error", title: response.left.message || "Failed to delete job opening" });
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

  // #region EXPORT METHOD
  const handleExport = async (type: "Excel" | "PDF") => {
    setIsExporting(true);
    try {
      const params: JobOpeningListRequest = {
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

      const response = await jobRoleService.apiCallPullJobOpenings(params);

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
  // #endregion

  return (
    <div className="talent-module flex h-[calc(100dvh-96px)] min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-3 shadow-sm sm:p-6 lg:h-[calc(100dvh-88px)]">
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
              <label
                htmlFor="job-opening-status-filter"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="job-opening-status-filter"
                value={tempFilters.Status ?? ""}
                onChange={(event) =>
                  setTempFilters((current) => ({
                    ...current,
                    Status: (event.target.value || undefined) as
                      | JobOpeningFilters["Status"]
                      | undefined,
                  }))
                }
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Modal>
        <div className="relative min-h-[36px] w-full shrink-0 overflow-x-auto pb-1">
          
          {isLoadingDepartments && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <p className="text-[10px] text-gray-400 font-medium">{loadingDepartmentsMessage || "Loading tabs..."}</p>
            </div>
          )}
          <div className="flex flex-nowrap">
            <ScrollableTabs
              tabs={departmentTabs}
              activeTab={activeTab}
              onChange={handleTabChange}
              ariaLabel="Job opening departments"
            />
          </div>
        </div>

        <div className="relative mt-2 min-h-0 flex-1 overflow-hidden">
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
}
