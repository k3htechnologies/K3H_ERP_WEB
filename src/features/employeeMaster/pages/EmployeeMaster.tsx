import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import {
  DataTable,
  type FilterInfo,
  type PaginationInfo,
  type SortInfo,
  type TableColumn,
} from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import type {
  EmployeeMasterData,
  FilterWithPaginationEmployeeMasterRequest,
} from "@/features/employeeMaster/models/EmployeeMasterModel";

import { employeeMasterService } from "@/features/employeeMaster/services/EmployeeMasterService";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import {
  convert_dd_mm_yyyy_To_Yyyy_mm_dd,
  formatDate_dd_mm_yyyy,
  formatDate_dd_MonthName_yy,
} from "@/core/utils/dateFormat";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { useNavigate } from "react-router-dom";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { Button, Input } from "@/ui/components/forms";
import { updateFilter } from "@/core/utils/filterHelper";
import { FileText, AlertTriangle, Copy, IdCard } from "lucide-react";
import ExportImport from "@/ui/components/ExcelImport/ExcelImport";
import { useEmployeeListState } from "@/features/employeeMaster/context/EmployeeListStateContext";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import ToggleSwitch from "@/ui/components/forms/ToggleSwitch";
import { isEmployeeComplete } from "@/features/employeeMaster/utils/employeeUtils";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { ACTIVE_INACTIVE_OPTIONS } from "@/core/constants";
import { getNameInitials } from "@/core/utils/getNameInitials";
import { filterNumbers } from "@/core/utils/fileValidation";
import { copyToClipboard } from "@/core/utils/comman";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { domToPng } from "modern-screenshot";

export const EmployeeMaster: React.FC = () => {
  const [employeeList, setEmployeeList] = useState<EmployeeMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  const { listState, updateListState } = useEmployeeListState();
  const { pagination, setPagination } = usePagination(20);
  const sortInfo = listState.sortInfo;
  const searchTerm = listState.searchTerm;
  const filters = listState.filters;

  const { addToast } = useToast();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchEmployees(value);
  }, 350);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeEmployeeColumnsModal, setIsShowCustomizeEmployeeColumnsModal] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeMasterData | null>(null);
  const idCardRef = useRef<HTMLDivElement>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState("");

  useEffect(() => {
    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadEmployees(listState.page, { EmployeeName: String(listState.searchTerm).trim() }, listState.sortInfo);
    } else {
      loadEmployees(listState.page, listState.filters, listState.sortInfo);
    }
  }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  const fetchEmployeeList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadEmployees(page, filters, sort ?? sortInfo);
  };

  const loadEmployees = async (
    page: number,
    filterParams: FilterInfo,
    sortInfo?: SortInfo,
    searchtext?: string,
  ) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationEmployeeMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          EmployeeId: filterParams.EmployeeId
            ? Number(filterParams.EmployeeId)
            : undefined,

          EmployeeCode: filterParams.EmployeeCode?.trim() || undefined,
          EmployeeName:
            searchtext ?? filterParams.EmployeeName?.trim() ?? undefined,
          MobileNumber: filterParams.MobileNumber?.trim() || undefined,

          Gender: filterParams.Gender?.trim() || undefined,

          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          DesignationName: filterParams.DesignationName?.trim() || undefined,
          BranchName: filterParams.BranchName?.trim() || undefined,
          CompanyName: filterParams.CompanyName?.trim() || undefined,
          EmailId: filterParams.EmailId?.trim() || undefined,
          ReportPersonName: filterParams.ReportPersonName?.trim() || undefined,
          BankName: filterParams.BankName?.trim() || undefined,
          BankBranchName: filterParams.BankBranchName?.trim() || undefined,

          IsEmployeeOnProbation:
            filterParams.IsEmployeeOnProbation ?? undefined,
          IsIdCardIssued: filterParams.IsIdCardIssued ?? undefined,
          FromDateOfBirth: filterParams.FromDateOfBirth || undefined,
          ToDateOfBirth: filterParams.ToDateOfBirth || undefined,
          FromJoiningDate: filterParams.FromJoiningDate || undefined,
          ToJoiningDate: filterParams.ToJoiningDate || undefined,
          ActiveInactive: filterParams.ActiveInactive?.trim() || undefined,

          SortBy: getSortByParam(sortInfo ?? null, employeeColumns),
        };

        const response =
          await employeeMasterService.apiCallPullEmployeeMaster(params);

        if (E.isRight(response)) {
          setEmployeeList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(
              response.right.TotalNumberOfRecord / pagination.pageSize,
            ),
          });
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Employee",
    );
  };

  useEffect(() => {
    if (!isAddModalOpen) return;
    const url = parseDocumentUrls(selectedEmployee?.ProfilePhotoURL)?.[0];
    if (!url) {
      setPhotoDataUrl("");
      return;
    }

    technicalService.apiCallGetDownloadURL(url).then((res) => {

      if (!E.isRight(res)) return;
      const data: any = res.right;

      if (data instanceof Blob) {

        const reader = new FileReader();
        reader.onloadend = () => setPhotoDataUrl(reader.result as string);
        reader.readAsDataURL(data);

      } else if (typeof data === "string") {
        setPhotoDataUrl(data.startsWith("data:") ? data : `data:image/jpeg;base64,${data}`);

      } else if (data?.Data || data?.FileContent) {
        const b64 = data.Data ?? data.FileContent;
        setPhotoDataUrl(b64.startsWith("data:") ? b64 : `data:image/jpeg;base64,${b64}`);
      }
    });
  }, [isAddModalOpen, selectedEmployee]);

  const searchEmployees = async (searchValue: string) => {
    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === "") {
      updateListState({ searchTerm: "", page: 1 });
      return;
    }

    updateListState({ searchTerm: searchValue, page: 1 });
  };

  const clearSearchEmployees = () => {
    debouncedSearch.cancel?.();
    updateListState({ searchTerm: "", filters: {}, page: 1 });
    setTempFilters({});
  };

  const handleExportEmployees = async (exportType: "Excel" | "PDF") => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationEmployeeMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,

          EmployeeCode: filters.EmployeeCode?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          MobileNumber: filters.MobileNumber?.trim() || undefined,

          Gender: filters.Gender?.trim() || undefined,

          DepartmentName: filters.DepartmentName?.trim() || undefined,
          DesignationName: filters.DesignationName?.trim() || undefined,
          BranchName: filters.BranchName?.trim() || undefined,
          CompanyName: filters.CompanyName?.trim() || undefined,
          EmailId: filters.EmailId?.trim() || undefined,
          ReportPersonName: filters.ReportPersonName?.trim() || undefined,
          BankName: filters.BankName?.trim() || undefined,
          BankBranchName: filters.BankBranchName?.trim() || undefined,

          IsEmployeeOnProbation: filters.IsEmployeeOnProbation ?? undefined,
          IsIdCardIssued: filters.IsIdCardIssued ?? undefined,
          FromDateOfBirth: filters.FromDateOfBirth || undefined,
          ToDateOfBirth: filters.ToDateOfBirth || undefined,
          FromJoiningDate: filters.FromJoiningDate || undefined,
          ToJoiningDate: filters.ToJoiningDate || undefined,

          ActiveInactive: filters.ActiveInactive?.trim() || undefined,

          SortBy: getSortByParam(sortInfo ?? null, employeeColumns),
          ExportType: exportType,
        };

        const response =
          await employeeMasterService.apiCallPullEmployeeMaster(params);

        handleExportFile(response, exportType, "Employee Master", addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message || "Export failed" });
      },
      undefined,
      "Preparing Export",
    );
  };

  const handleExportEmployeeExcel = () => handleExportEmployees("Excel");
  const handleExportEmployeePdf = () => handleExportEmployees("PDF");

  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
  }, [sortInfo, updateListState],
  );

  const handleSortColumn = useCallback(
    (sort: SortInfo) => {
      updateListState({ sortInfo: sort, page: 1 });
      loadEmployees(1, filters, sort, searchTerm || undefined);
    },
    [filters, updateListState, searchTerm],
  );

  const employeePaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [
      pagination.currentPage,
      pagination.totalPages,
      pagination.totalRecords,
      pagination.pageSize,
    ],
  );

  const employeesForTable = useMemo(() => employeeList, [employeeList]);

  const handleViewEmployeeDetails = useCallback(
    (row: EmployeeMasterData) => {
      updateListState({
        employeeId: row.EmployeeId,
        employeeName: row.FullName,
      });
      navigate("/employeeMaster/view");
    },
    [navigate, updateListState],
  );

  const handleViewEmployeeDocument = useCallback(
    (row: EmployeeMasterData) => {
      updateListState({
        employeeId: row.EmployeeId,
        employeeName: row.FullName,
        pageName: "",
      });
      navigate("/employeeMaster/document");
    },
    [navigate, updateListState],
  );

  const handleGenerateIDCard = useCallback((row: EmployeeMasterData) => {
    setSelectedEmployee(row);

    updateListState({
      employeeId: row.EmployeeId,
      employeeName: row.FullName,
    });
    setIsAddModalOpen(true)
  }, [updateListState])

  const employeeColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "EmployeeCode",
        label: "Employee Code",
        sortable: true,
        width: '150px',
        align: "left",
        fixed: "left",
        render: (value, row) => {
          const complete = isEmployeeComplete(row);

          return (
            <div className="flex items-center justify-center gap-2">
              <TooltipText
                text={value || "-"}
                maxWidth="140px"
                tooltipThreshold={14}
                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
              />

              {!complete && (
                <span title="Employee profile incomplete">
                  <AlertTriangle className="w-4 h-4 text-amber-500 cursor-pointer" />
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "FullName",
        label: "Full Name",
        sortable: true,
        width: '220px',
        align: "left",
        render: (value, row) => {

          const fullName = (row?.FullName ?? "").trim();

          const initials = getNameInitials(fullName);

          const profilePhotoURL = row?.ProfilePhotoURL;

          const hasProfile =
            profilePhotoURL &&
            profilePhotoURL !== "" &&
            profilePhotoURL !== "—";

          return (
            <div className={`flex items-center justify-between gap-3`}>

              <div className="flex items-center gap-3">
                {hasProfile ? (
                  <img
                    src={profilePhotoURL}
                    alt={fullName}
                    className="w-7 h-7 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full
                       bg-blue-200 
                       flex items-center justify-center
                       text-gray-800 font-medium text-xs
                       border border-gray-300"
                    title={fullName || "-"}
                  >
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <TooltipText
                    text={value || row.FirstName || "-"}
                    maxWidth="230px"
                    tooltipThreshold={22}
                    onClick={() => handleViewEmployeeDetails(row)}
                  />
                </div>
              </div>
            </div>
          );
        },
      },

      {
        key: "Gender",
        label: "Gender",
        width: "14",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "PersonalMobileNumber",
        label: "Personal Mobile Number",
        width: "14",
        sortable: false,
        align: "left",
        render: (value) => (value ? `+91 ${value}` : "-"),
      },
      {
        key: "EmailId",
        label: "E-Mail ID",
        width: "14",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "Department",
        label: "Department",
        width: "14",
        sortable: true,
        align: "left",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="160px"
            tooltipThreshold={16}
          />
        ),
      },
      {
        key: "Designation",
        label: "Designation",
        width: "14",
        sortable: true,
        align: "left",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="160px"
            tooltipThreshold={16}
          />
        ),
      },
      {
        key: "Branch",
        label: "Branch",
        width: "14",
        sortable: false,
        align: "left",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="160px"
            tooltipThreshold={16}
          />
        ),
      },
      {
        key: "CompanyName",
        label: "Company",
        width: "14",
        sortable: false,
        align: "left",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="160px"
            tooltipThreshold={16}
          />
        ),
      },
      {
        key: "ReportPersonName",
        label: "Reporting Person Name",
        width: "14",
        sortable: true,
        align: "left",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="160px"
            tooltipThreshold={16}
          />
        ),
      },

      {
        key: "DateOfBirth",
        label: "DOB",
        width: "14",
        sortable: false,
        align: "center",
        render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
      },
      {
        key: "JoiningDate",
        label: "Joining Date",
        width: "14",
        sortable: false,
        align: "center",
        render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
      },
      {
        key: "ProbationDate",
        label: "Probation Date",
        width: "14",
        sortable: false,
        align: "center",
        render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
      },
      {
        key: "IdCardIssuedDate",
        label: "Id Card Issued Date",
        width: "14",
        sortable: false,
        align: "center",
        render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
      },
      {
        key: "MaritalStatus",
        label: "Marital Status",
        width: "14",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "BloodGroup",
        label: "Blood Group",
        width: "14",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "BankName",
        label: "Bank Name",
        width: "18",
        sortable: false,
        align: "left",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="220px"
            tooltipThreshold={22}
          />
        ),
      },
      {
        key: "BankBranchName",
        label: "Bank Branch Name",
        width: "18",
        sortable: false,
        align: "left",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="220px"
            tooltipThreshold={22}
          />
        ),
      },
      {
        key: "IFSCCode",
        label: "IFSC Code",
        width: "18",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "AccountNo",
        label: "Account No",
        width: "14",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "OfficeEmailId",
        label: "Office Email",
        width: "18",
        sortable: false,
        align: "left",
        render: (value) => (
          <TooltipText
            text={value || "-"}
            maxWidth="220px"
            tooltipThreshold={22}
          />
        ),
      },
      {
        key: "OfficeMobileNumber",
        label: "Office Mobile",
        width: "14",
        sortable: false,
        align: "left",
        render: (value) => (value ? `+91 ${value}` : "-"),
      },
      {
        key: 'CountryName',
        label: 'Country',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'DistrictName',
        label: 'District',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'CityName',
        label: 'City',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'VillageName',
        label: 'Village',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'MPIN',
        label: 'MPIN',
        sortable: false,
        align: 'left',
        render: (value) => {
          return (
            <div className="flex items-center gap-2">

              {value && (
                <TooltipText
                  text={value || '-'}
                  tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                />
              )}

              {value && (
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const success = await copyToClipboard(value);
                    if (success) {
                      addToast({ type: 'success', title: `${value} Copied!` });
                    }
                  }}
                  color="transparent"
                  size="sm"
                  style={{
                    padding: '2px 6px',
                    color: '#6B7280',
                    cursor: 'pointer'
                  }}
                  title="Copy"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        }
      },
      {
        key: "LastLogin",
        label: "Last Login",
        width: "16",
        sortable: false,
        align: "center",
        render: (value) => (value ? formatDate_dd_MonthName_yy(value) : "-"),
      },
      {
        key: "Actions",
        label: "Actions",
        width: "12",
        fixed: "right",
        align: "center",
        render: (_value, row) =>
          canAction ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleViewEmployeeDocument(row);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                style={{
                  color: "green",
                  padding: "4px 8px",
                }}
                title="Employee Document"
              >
                <FileText className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGenerateIDCard(row);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                style={{
                  color: "blue",
                  padding: "4px 8px",
                }}
                title="Employee Document"
              >
                <IdCard className="h-4 w-4" />
              </Button>
            </div>
          ) : null,
      },
    ],
    [canAction, handleViewEmployeeDetails, handleViewEmployeeDocument],
  );

  const requiredEmployeeColumnKeys: string[] = ["FullName", 'Actions'];

  const allEmployeeColumnKeys: string[] = employeeColumns.map((c) => c.key);

  const [selectedEmployeeColumnKeys, setSelectedEmployeeColumnKeys] = useState<
    string[]
  >(() => {
    try {
      const saved = LocalStorageHelper.getEmployeeMasterTableColumns?.();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(
          new Set([...parsed, ...requiredEmployeeColumnKeys]),
        );
        return withRequired.filter((k) => allEmployeeColumnKeys.includes(k));
      }
    } catch {
      // ignore
    }
    return allEmployeeColumnKeys;
  });

  useEffect(() => {
    setSelectedEmployeeColumnKeys((prev) =>
      Array.from(new Set([...prev, ...requiredEmployeeColumnKeys])).filter(
        (k) => allEmployeeColumnKeys.includes(k),
      ),
    );
  }, [employeeColumns.length]);

  const visibleEmployeeColumns = useMemo(
    () =>
      employeeColumns.filter((col) =>
        selectedEmployeeColumnKeys.includes(col.key),
      ),
    [employeeColumns, selectedEmployeeColumnKeys],
  );

  const applyFilters = () => {
    updateListState({ filters: tempFilters, page: 1 });
    loadEmployees(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    updateListState({ filters: {}, page: 1 });
    loadEmployees(1, {});
  };

  const handleAddEmployeeModal = () => {
    navigate("/employeeMaster/add");
  };

  const handleFilterChange = (key: string, value: string | null) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };


  const downloadExcelSampleEmployeeMaster = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterPullExcelSample = {
          TableName: "EMPLOYEE MASTER",
        };

        const response = await technicalService.apiCallPullExcelSample(params);

        handleExportFile(
          response,
          "Excel",
          "Employee Master",
          addToast,
          "Sample file download successfully",
        );

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message || "Export failed" });
      },
      undefined,
      "Preparing Downloading",
    );
  };

  const handleDownloadExcelSampleEmployeeMaster = () =>
    downloadExcelSampleEmployeeMaster();

  const uploadExcel = async (file: File, mergeExisting: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append("ExcelFile", file);
        fd.append("IsAllDelete", mergeExisting);
        fd.append("TableName", "EMPLOYEE MASTER");

        const response = await technicalService.apiCallExcelImport(fd);

        if (E.isRight(response)) {
          addToast({ type: "success", title: "Excel imported sucessfully" });

          fetchEmployeeList();
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (err: any) => addToast({ type: "error", title: err.message }),
      undefined,
      "Importing Excel",
    );
  };

  //#endregion

  const handleDownloadIDCard = async () => {
    if (!idCardRef.current) return;

    try {
      const dataUrl = await domToPng(idCardRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        features: {
          removeControlCharacter: true,
        },
      });

      const link = document.createElement("a");

      link.download = `${selectedEmployee?.EmployeeCode || "Employee"
        }-ID-Card.png`;

      link.href = dataUrl;
      link.click();

      addToast({ type: "success", title: "ID Card downloaded successfully", });
    } catch (error) {

      console.error("Error capturing ID Card:", error);
      addToast({ type: "error", title: "Unable to download ID Card", });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Employee Name"
        onSearchChange={(v) => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchEmployees}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeEmployeeColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddEmployeeModal}
        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleEmployeeMaster}
        // EXPORT
        isShowExportButton={canExport && employeesForTable.length > 0}
        onExportExcel={handleExportEmployeeExcel}
        onExportPdf={handleExportEmployeePdf}
        exportLoading={isLoading}
      />

      <DataTable
        data={employeesForTable}
        columns={visibleEmployeeColumns}
        pagination={employeePaginationInfo}
        emptyMessage="No employees found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeEmployeeColumnsModal}
        onClose={() => setIsShowCustomizeEmployeeColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredEmployeeColumnKeys]),
          );
          setSelectedEmployeeColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeEmployeeMasterTableColumns?.(
              JSON.stringify(withRequired),
            );
          } catch {
            // ignore
          }
        }}
        columns={employeeColumns}
        selectedKeys={selectedEmployeeColumnKeys}
        requiredKeys={requiredEmployeeColumnKeys}
        title="Customize Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Employee Master"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply"
        cancelText="Clear"
        onCancel={() => clearFilters()}
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                label="Employee Code"
                value={tempFilters.EmployeeCode || ""}
                onChange={(e) =>
                  handleFilterChange("EmployeeCode", e.target.value)
                }
                placeholder="Enter Employee Code"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Employee Name"
                value={tempFilters.EmployeeName || ""}
                onChange={(e) =>
                  handleFilterChange("EmployeeName", e.target.value)
                }
                placeholder="Enter Employee Name"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Personal Mobile Number"
                value={tempFilters.MobileNumber || ""}
                onChange={(e) =>
                  handleFilterChange("MobileNumber", filterNumbers(e.target.value))
                }
                placeholder="Enter Personal Mobile Number"
                maxLength={13}
              />
            </div>
            <div>
              <Input
                type="text"
                label="Gender"
                value={tempFilters.Gender || ""}
                onChange={(e) => handleFilterChange("Gender", e.target.value)}
                placeholder="Enter Gender"
              />
            </div>
            <div>
              <SinglePageSelection
                label="Active / Inactive"
                placeholder="Select Active / Inactive"
                value={tempFilters.ActiveInactive || ''}
                onChange={e => handleFilterChange('ActiveInactive', String(e))}
                options={ACTIVE_INACTIVE_OPTIONS.map(opt => ({
                  label: opt.name,
                  value: opt.id
                }))}
              />
            </div>
            <div>
              <Input
                type="text"
                label="Department"
                value={tempFilters.DepartmentName || ""}
                onChange={(e) =>
                  handleFilterChange("DepartmentName", e.target.value)
                }
                placeholder="Enter Department"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Designation"
                value={tempFilters.DesignationName || ""}
                onChange={(e) =>
                  handleFilterChange("DesignationName", e.target.value)
                }
                placeholder="Enter Designation"
              />
            </div>
            <div>
              <Input
                label="Branch"
                type="text"
                value={tempFilters.BranchName || ""}
                onChange={(e) =>
                  handleFilterChange("BranchName", e.target.value)
                }
                placeholder="Enter Branch"
              />
            </div>
            <div>
              <Input
                label="Company Name"
                type="text"
                value={tempFilters.CompanyName || ""}
                onChange={(e) =>
                  handleFilterChange("CompanyName", e.target.value)
                }
                placeholder="Enter Company Name"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Report Person Name"
                value={tempFilters.ReportPersonName || ""}
                onChange={(e) =>
                  handleFilterChange("ReportPersonName", e.target.value)
                }
                placeholder="Enter Report Person Name"
              />
            </div>
            <div>
              <Input
                type="text"
                label="E-Mail ID"
                value={tempFilters.EmailId || ""}
                onChange={(e) => handleFilterChange("EmailId", e.target.value)}
                placeholder="Enter E-Mail ID"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Bank Name"
                value={tempFilters.BankName || ""}
                onChange={(e) => handleFilterChange("BankName", e.target.value)}
                placeholder="Enter Bank Name"
              />
            </div>
            <div>
              <Input
                type="text"
                label="Bank Branch Name"
                value={tempFilters.BankBranchName || ""}
                onChange={(e) =>
                  handleFilterChange("BankBranchName", e.target.value)
                }
                placeholder="Enter Bank Branch Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <div>
              <ToggleSwitch
                label="On Probation"
                name="IsEmployeeOnProbation"
                value={tempFilters.IsEmployeeOnProbation === "1"}
                onChange={(name, value) =>
                  handleFilterChange(name, value ? "1" : "0")
                }
              />
            </div>

            <div>
              <ToggleSwitch
                label="Card Issued"
                name="IdCardIssued"
                value={tempFilters.IdCardIssued === "1"}
                onChange={(name, value) =>
                  handleFilterChange(name, value ? "1" : "0")
                }
              />
            </div>

            <div>
              <DatePickerInput
                label="From DOB"
                value={formatDate_dd_mm_yyyy(tempFilters.FromDateOfBirth)}
                onChange={(val) =>
                  handleFilterChange(
                    "FromDateOfBirth",
                    convert_dd_mm_yyyy_To_Yyyy_mm_dd(val),
                  )
                }
              />
            </div>

            <div>
              <DatePickerInput
                label="To DOB"
                value={formatDate_dd_mm_yyyy(tempFilters.ToDateOfBirth)}
                onChange={(val) =>
                  handleFilterChange(
                    "ToDateOfBirth",
                    convert_dd_mm_yyyy_To_Yyyy_mm_dd(val),
                  )
                }
              />
            </div>

            <div>
              <DatePickerInput
                label="From Joining Date"
                value={formatDate_dd_mm_yyyy(tempFilters.FromJoiningDate)}
                onChange={(val) =>
                  handleFilterChange(
                    "FromJoiningDate",
                    convert_dd_mm_yyyy_To_Yyyy_mm_dd(val),
                  )
                }
              />
            </div>
            <div>
              <DatePickerInput
                label="To Joining Date"
                value={formatDate_dd_mm_yyyy(tempFilters.ToJoiningDate)}
                onChange={(val) =>
                  handleFilterChange(
                    "ToJoiningDate",
                    convert_dd_mm_yyyy_To_Yyyy_mm_dd(val),
                  )
                }
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPhotoDataUrl("");
        }}
        title="Employee ID Card"
        size="xxl"
        cancelText="Cancel"
        saveText="Send To Print"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleDownloadIDCard();
        }}
      >
        <div ref={idCardRef}>

          <div className="bg-white px-7 pt-1 pb-5">

            <div className="flex justify-center items-start gap-11">

              {/* FRONT SIDE */}
              <div className="flex flex-col items-center">

                {/* Hanging Strap */}
                <div className="flex flex-col items-center h-[100px] relative z-20">
                  <div
                    className="w-11 h-[76px] border border-sky-200"
                    style={{
                      backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, #bae6fd 3px, #bae6fd 4px)"
                    }}
                  />

                  <div className="w-9 h-2 bg-gray-300 border border-gray-400 rounded-b-md" />

                  <div className="w-5 h-12 bg-white border-[3px] border-gray-300 rounded-b-xl relative">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-500" />
                  </div>

                  {/* Handle / Strip */}
                  <div className="w-10 h-2 bg-gray-300 border border-gray-400 rounded-full -mb-4 z-20" />
                </div>

                {/* Front Card */}
                <section className="relative w-[260px] h-[400px] rounded-[16px] bg-white shadow-[0_12px_22px_rgba(0,0,0,0.20)] overflow-hidden">

                  {/* Right Grey Background */}
                  <div
                    className="absolute top-0 right-0 w-[48%] h-[190px]"
                    style={{
                      background: "radial-gradient(circle at top left, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%), #858b94",
                    }}
                  />

                  {/* Employee Name - Left Vertical Strip */}
                  <div className="absolute left-0 top-0 bottom-0 w-[55px] flex items-center justify-center z-20">
                    <p
                      className="text-[#2999c5] font-extrabold text-[25px] tracking-wide whitespace-nowrap uppercase"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)"
                      }}
                    >
                      {selectedEmployee?.FirstName || "-"} {selectedEmployee?.LastName || ""}
                    </p>
                  </div>

                  {/* Company Logo */}
                  <div className="absolute top-[30px] left-[45.5px] w-[180px] flex flex-col items-center z-10">
                    <img
                      src="/favicon.png"
                      alt="Company Logo"
                      className="w-[24px] h-[21px] object-contain"
                    />

                    <h3 className="mt-[6px] font-bold text-[14px] leading-none tracking-normal text-gray-700 whitespace-nowrap">
                      H. RISHABRAJ
                    </h3>
                  </div>

                  {/* Designation - Aligned with Blue Line */}
                  <div className="absolute top-[10px] right-[13px] w-[14px] h-[170px] flex justify-center z-10">
                    <p
                      className="text-white text-[10px] font-medium tracking-wider whitespace-nowrap uppercase"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)"
                      }}
                    >
                      {selectedEmployee?.Designation || "-"}
                    </p>
                  </div>

                  {/* Employee Photo */}
                  <div className="absolute top-[100px] left-[40px] w-[180px] h-[180px] rounded-full overflow-hidden bg-gray-200 z-10">
                    {photoDataUrl && (
                      <img src={photoDataUrl} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Blue Design Line */}
                  <div className="absolute right-[20px] top-[200px] h-[90px] w-[2px] bg-sky-500" />

                  {/* Employee Details */}
                  <div className="absolute bottom-[50px] left-[60px] right-2 text-[10px] text-gray-700 font-medium space-y-1">
                    <p>
                      BLOOD GROUP : {selectedEmployee?.BloodGroup || "-"}
                    </p>

                    <p>
                      EMPLOYEE CODE : {selectedEmployee?.EmployeeCode || "-"}
                    </p>
                  </div>

                </section>

                <p className="mt-5 text-xs font-semibold tracking-wider text-gray-600">
                  <span className="text-emerald-500">●</span> FRONT SIDE
                </p>

              </div>

              {/* BACK SIDE */}
              <div className="flex flex-col items-center">

                {/* Hanging Strap - Same */}
                <div className="flex flex-col items-center h-[100px] relative z-20">
                  <div
                    className="w-11 h-[76px] border border-sky-200"
                    style={{
                      backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, #bae6fd 3px, #bae6fd 4px)"
                    }}
                  />

                  <div className="w-9 h-2 bg-gray-300 border border-gray-400 rounded-b-md" />

                  <div className="w-5 h-12 bg-white border-[3px] border-gray-300 rounded-b-xl relative">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-500" />
                  </div>

                  {/* Handle / Strip */}
                  <div className="w-10 h-2 bg-gray-300 border border-gray-400 rounded-full -mb-4 z-20" />
                </div>

                {/* Back Card */}
                <section className="relative w-[260px] h-[400px] rounded-[16px]  bg-[#f8fafc] shadow-[0_12px_22px_rgba(0,0,0,0.20)] overflow-hidden">

                  {/* Background Pattern */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage: `
                repeating-linear-gradient( 25deg, transparent, transparent 24px, #dce5eb 25px, transparent 26px),
                repeating-linear-gradient(  -25deg, transparent, transparent 35px, #dce5eb 36px, transparent 37px
                )
              `
                    }}
                  />

                  {/* QR Code */}
                  <div className="relative z-10 flex flex-col items-center pt-[60px]">

                    <h2 className="text-[14px] font-extrabold text-gray-700">
                      SCAN ME
                    </h2>

                    <p className="text-[10px] font-semibold text-gray-600">
                      TO VISIT OUR WEBSITE
                    </p>

                    {/* QR Code Image */}
                    <div className="w-[105px] h-[105px] mt-2 bg-white">
                      <img
                        src="/QRCode.png"
                        alt="Company QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Corporate Office */}
                  <div className="absolute top-[230px] left-3 right-3 z-10 text-center text-[10px] text-gray-600">

                    <p className="font-bold text-[12px]">
                      Corporate Office
                    </p>

                    <p className="leading-[15px]">
                      13th Floor, Rishabraj Chembers, Road No .10, Daulat Nagar,Borivali (East),
                      Mumbai,Maharashtra 400066
                    </p>
                  </div>

                  {/* Emergency Contact */}
                  <div className="absolute bottom-[60px] left-3 right-3 z-10 text-center text-gray-600">

                    <p className="font-bold text-[12px]">
                      Emergency contact
                    </p>

                    <p className="text-[12px]">
                      {selectedEmployee?.PersonalMobileNumber || "-"} / {selectedEmployee?.EmergencyMobileNumber}
                    </p>
                  </div>

                  {/* Disclaimer */}
                  <div className="absolute bottom-[8px] left-3 right-3 z-10 text-[7px] font-semibold text-gray-700 leading-[10px]">
                    *Disclaimer: This card is the sole property of
                    H. Rishabraj Group and in case if found please
                    send to the above address. In case the employee
                    leaves the organisation, kindly handover the
                    same to the Company.
                  </div>

                </section>

                <p className="mt-5 text-xs font-semibold tracking-wider text-gray-600">
                  <span className="text-purple-500">●</span>
                  BACK SIDE
                </p>

              </div>

            </div>
          </div>
        </div>
      </Modal>

      <ExportImport
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={(file, mergeExisting) => {
          setShowImportModal(false);
          uploadExcel(file, mergeExisting);
        }}
      />
    </div >
  );
};

export default EmployeeMaster;
