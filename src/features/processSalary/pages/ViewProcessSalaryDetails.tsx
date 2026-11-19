import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import type { TableColumn } from "@/ui/components/DataTable/DataTableWithHeadColor";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo } from "@/ui/components/DataTable/DataTable";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { Button, Input } from "@/ui/components/forms";
import { Edit } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import { useProcessSalaryListState } from "@/features/processSalary/context/ProcessSalaryListStateContext";
import type { FilterWithPaginationProcessSalaryDetails, ProcessSalaryDetailsData, AddUpdateProcessSalaryDetails } from "@/features/processSalary/models/ProcessSalaryModel";
import { processSalaryService } from "@/features/processSalary/services/ProcessSalaryService";
import usePagination from "@/core/hooks/usePagination";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { handleExportFile } from "@/core/utils/exportFile";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { HOLD_RELEASE_TYPE_OPTIONS } from "@/core/constants";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { updateFilter } from "@/core/utils/filterHelper";
import { filterNumbers } from "@/core/utils/fileValidation";
import { formatMonthYear } from "@/core/utils/comman";

const initialFormData = (): AddUpdateProcessSalaryDetails => ({
    ProcessSalaryDetailsId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    AdjustDays: 0,
    HoldRelease: ""
})

export const ViewProcessSalaryDetails: React.FC = () => {

    const [processSalaryDetailsList, setProcessSalaryDetailsList] = useState<ProcessSalaryDetailsData[]>([]);
    const [formData, setFormData] = useState<AddUpdateProcessSalaryDetails>(() => initialFormData());
    const [editProcessSalaryDetailsData, setEditProcessSalaryDetailsData] = useState<AddUpdateProcessSalaryDetails | null>(null);
    const { ProcessSalaryId } = useParams<{ ProcessSalaryId?: string }>();
    const { listState } = useProcessSalaryListState();
    const currentProcessSalaryId = ProcessSalaryId ? Number(ProcessSalaryId) : listState.ProcessSalaryId;
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const SalaryProcessMonthYear = listState.SalaryProcessMonthYear
    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [errors, setErrors] = useState<{ [K: string]: string }>({});
    const { canExport } = useMenuPermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});
    const [selectedTotalDays, setSelectedTotalDays] = useState<number>(0);

    useEffect(() => {

        setPagination({ currentPage: 1 });
        loadProcessSalaryDetailsData(1, filters, sortInfo, searchTerm);
    }, []);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editProcessSalaryDetailsData) {
                setFormData({
                    ProcessSalaryDetailsId: editProcessSalaryDetailsData.ProcessSalaryDetailsId,
                    HoldRelease: editProcessSalaryDetailsData.HoldRelease,
                    AdjustDays: editProcessSalaryDetailsData.AdjustDays,
                    Uniquekey: editProcessSalaryDetailsData.Uniquekey
                })
            } else {
                setFormData(initialFormData());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editProcessSalaryDetailsData])

    const loadProcessSalaryDetailsData = async (page: number = pagination.currentPage, filterParams: FilterInfo, sortInfo?: SortInfo, searchText?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationProcessSalaryDetails = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProcessSalaryId: currentProcessSalaryId,
                    EmployeeName: searchText ?? filterParams.EmployeeName ?? undefined,
                    CompanyName: filterParams.CompanyName ?? undefined,
                    DepartmentName: filterParams.DepartmentName ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ProcessSalaryDetailsColumns)
                }

                const response = await processSalaryService.apiCallPullProcessSalaryDetails(params);

                if (E.isRight(response)) {

                    setProcessSalaryDetailsList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize,),
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
            "Loading Process Salary Details"
        )
    }

    const PushProcessSalaryDetailsFormData = (): AddUpdateProcessSalaryDetails => {
        return {
            ProcessSalaryDetailsId: formData.ProcessSalaryDetailsId,
            Uniquekey: formData.Uniquekey,
            HoldRelease: formData.HoldRelease,
            AdjustDays: formData.AdjustDays
        }
    }

    const ValidateProcessSalaryDetails = (): {
        isValid: boolean;
        errors: { [K: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.HoldRelease) {
            newErrors.HoldRelease = "Hold & Release is Required";
        }

        if (!formData.AdjustDays) {
            newErrors.AdjustDays = "Adjust Days is Required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const handleAddUpdateProcessSalaryDetails = async (e: React.FormEvent) => {
        e.preventDefault()

        setErrors({});
        const validation = ValidateProcessSalaryDetails();

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const PayLoad = PushProcessSalaryDetailsFormData();

                const response = await processSalaryService.apiCallAddUpdateProcessSalaryDetails(PayLoad);

                if (E.isRight(response)) {

                    setProcessSalaryDetailsList(response.right.Data);

                    setIsAddUpdateModalOpen(false);
                    setEditProcessSalaryDetailsData(null);

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    await loadProcessSalaryDetailsData(1, filters, sortInfo, searchTerm);

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Update Process Salary Details"
        )
    }

    const handleEditProcessSalaryDetailsData = useCallback((row: ProcessSalaryDetailsData) => {
        setSelectedTotalDays(row.TotalDays);

        setEditProcessSalaryDetailsData({
            ProcessSalaryDetailsId: row.ProcessSalaryDetailsId,
            Uniquekey: row.Uniquekey,
            AdjustDays: row.AdjustDays,
            HoldRelease: row.HoldRelease
        });

        setIsAddUpdateModalOpen(true);
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadProcessSalaryDetailsData(1, filters, sortInfo, value);
    }

    const handleClearSearch = () => {
        setSearchTerm("");
        setPagination({ currentPage: 1 });
        loadProcessSalaryDetailsData(1, filters, sortInfo, "");
    }

    const handlePageChange = useCallback((page: number) => {
        setPagination({ currentPage: page });
        loadProcessSalaryDetailsData(page, filters, sortInfo, searchTerm);
    }, []);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort)
        setPagination({ currentPage: 1 })
        loadProcessSalaryDetailsData(1, filters, sort, searchTerm)
    }, [searchTerm])

    const ProcessSalaryDetailsColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "FullName",
                label: "Employee Name",
                fixed: "left",
                sortable: true,
                width: "15",
                render: (value) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                ),
            },
            {
                key: "Department",
                label: "Department Name",
                width: "20",
                sortable: false,
                render: (value) => (
                    <TooltipText
                        text={value || ""}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                )
            },
            {
                key: "CompanyName",
                label: "Company Name",
                width: "20",
                sortable: false,
                render: (value) => (
                    <TooltipText
                        text={value || ""}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                )
            },
            {
                key: "TotalDays",
                label: "Total Days",
                width: "15",
                sortable: false,
                render: value => value || ""
            },
            {
                key: "WorkingDays",
                label: "Working Days",
                width: "15",
                sortable: false,
                render: value => value || "",
            },
            {
                key: "PresentDays",
                label: "Present Days",
                width: "15",
                sortable: false,
                render: value => value || "",
            },
            {
                key: "AbsentDays",
                label: "Absent Days",
                width: "15",
                sortable: false,
                render: value => value || ""
            },
            {
                key: "OfficeHoliday",
                label: "Office Holidays",
                width: "15",
                sortable: false,
                render: value => value || ""
            },
            {
                key: "PaidDays",
                label: "Paid Days",
                width: "15",
                sortable: false,
                render: value => value || ""
            },
            {
                key: "UnpaidDays",
                label: "Unpaid Days",
                width: "15",
                sortable: false,
                render: value => value || ""
            },
            {
                key: "AdjustDays",
                label: "Adjust Days",
                width: "15",
                sortable: false,
                render: value => value || ""
            },
            {
                key: "HoldRelease",
                label: "Hold & Release",
                width: "15",
                sortable: false,
                render: (value) => (
                    <span
                        className={`inline-flex rounded-full border px-2 py-0.5 font-semibold ${value === "Release"
                            ? "border-red-400 bg-red-50 text-red-500"
                            : "border-emerald-400 bg-emerald-50 text-emerald-700"
                            }`}
                    >
                        {value}
                    </span>
                )
            },
            {
                key: "AdjustLeave",
                label: "Adjust Leave",
                width: "15",
                sortable: false,
                fixed: "right",
                render: (_value, row) => (
                    <div>
                        <Button
                            color="transparent"
                            size="sm"
                            style={{
                                color: 'blue',
                                padding: '0px 8px'
                            }}
                            onClick={() => {
                                handleEditProcessSalaryDetailsData(row)
                            }}
                            leftIcon={<Edit className="w-4 h-4" />}
                        />
                    </div>
                )
            }
        ], [handleEditProcessSalaryDetailsData])

    const handleBackProcessSalaryDetails = () => {
        navigate("/processSalary");
    }

    const handleFieldChange = (field: keyof ProcessSalaryDetailsData, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
    };

    const ProcessSalaryDetailsPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]);

    const ProcessSalaryDetailsForTable = useMemo(() => processSalaryDetailsList, [processSalaryDetailsList]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });
        loadProcessSalaryDetailsData(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });
        loadProcessSalaryDetailsData(1, {}, sortInfo, searchTerm);
    };

    const handleExportProcessSalaryDetails = async (exportType: "Excel" | "PDF") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProcessSalaryDetails = {
                    PageNumber: 1,
                    PageSize: pagination.pageSize,
                    ProcessSalaryId: currentProcessSalaryId,
                    SortBy: getSortByParam(sortInfo ?? null, ProcessSalaryDetailsColumns),
                    ExportType: exportType
                }

                const response = await processSalaryService.apiCallPullProcessSalaryDetails(params);

                handleExportFile(response, exportType, "Process Salary Details", addToast);

                return response
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        )
    }

    const handleExportProcessSalaryDetailsExcel = () => handleExportProcessSalaryDetails("Excel");
    const handleExportProcessSalaryDetailsPdf = () => handleExportProcessSalaryDetails("PDF");

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <div className="mb-4">
                <HeaderActionBar
                    titleText="Process Salary :"
                    subTitleText={formatMonthYear(SalaryProcessMonthYear ?? "")}
                    cancelText="Cancel"
                    onCancel={handleBackProcessSalaryDetails}
                    isLoading={isLoading}
                />
            </div>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Employee Name"

                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters)
                    setShowFilterPopup(true)
                }}

                isShowExportButton={canExport && ProcessSalaryDetailsForTable.length > 0}
                onExportExcel={handleExportProcessSalaryDetailsExcel}
                onExportPdf={handleExportProcessSalaryDetailsPdf}
                exportLoading={isLoading}
            />

            <DataTable
                columns={ProcessSalaryDetailsColumns}
                data={ProcessSalaryDetailsForTable}
                pagination={ProcessSalaryDetailsPaginationInfo}
                emptyMessage="No Process Salary Details data Found"
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Process Salary Details"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >
                <div className="space-y-4">

                    <div>
                        <Input
                            type="text"
                            label='Employee Name'
                            value={tempFilters.EmployeeName || ''}
                            onChange={e => handleFilterChange('EmployeeName', e.target.value)}
                            placeholder="Enter Employee Name"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Department Name"
                            value={tempFilters.DepartmentName || ""}
                            onChange={e => handleFilterChange("DepartmentName", e.target.value)}
                            placeholder="Enter Department Name"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Company Name"
                            value={tempFilters.CompanyName || ""}
                            onChange={e => handleFilterChange("CompanyName", e.target.value)}
                            placeholder="Enter Company Name"
                            maxLength={100}
                        />
                    </div>

                </div>
            </Modal>

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditProcessSalaryDetailsData(null);
                    setFormData(initialFormData());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditProcessSalaryDetailsData(null);
                    setFormData(initialFormData());
                    setErrors({});
                }}
                onSubmit={handleAddUpdateProcessSalaryDetails}
                size="md"
                saveText="Update"
                title="Update Process Salary Details"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="grid grid-cols-1 gap-4">

                        <div>
                            <Input
                                label="Adjust Days"
                                value={formData.AdjustDays ?? ""}
                                placeholder="Enter Adjust Days"
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (Number(value) > selectedTotalDays) {
                                        return;
                                    }

                                    handleFieldChange("AdjustDays", filterNumbers(value));
                                }}
                                required
                                error={errors.AdjustDays}
                            />
                        </div>

                        <div>
                            <SinglePageSelection
                                label="Hold & Release"
                                required
                                placeholder='Select Hold & Release'
                                value={formData.HoldRelease || ''}
                                onChange={(e) => handleFieldChange('HoldRelease', String(e))}
                                options={HOLD_RELEASE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errors.HoldRelease}
                            />
                        </div>

                    </div>
                </div>
            </Modal>

        </div>
    )
}
export default ViewProcessSalaryDetails;