import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddUpdateProcessSalary, DeleteProcessSalary, FilterWithPaginationProcessSalaryRequest, ProcessSalaryData } from "@/features/processSalary/models/ProcessSalaryModel";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { processSalaryService } from "@/features/processSalary/services/ProcessSalaryService";
import * as E from 'fp-ts/Either';
import { Loader } from "@/core/utils/loader";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import MonthPicker from "@/ui/components/forms/MonthPicker";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { fetchDepartmentMasterDropdown } from "@/features/departmentMaster/departmentMasterDropdown";
import { Modal } from "@/ui/components/Modal/Modal";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Button } from "@/ui/components/forms";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Edit, Trash2 } from "lucide-react";
import { fetchCompanyMasterDropdown } from "@/features/companyMaster/companyMasterDropDown";
import { handleExportFile } from "@/core/utils/exportFile";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useProcessSalaryListState } from "@/features/processSalary/context/ProcessSalaryListStateContext";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import { useNavigate } from "react-router-dom";
import { formatMonthYear } from "@/core/utils/comman";

const initialFormData = (): AddUpdateProcessSalary => ({
    ProcessSalaryId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    SalaryProcessMonthYear: "",
    DepartmentMasterId: "",
    CompanyId: ""
})

export const ProcessSalary: React.FC = () => {

    const [processSalaryList, setProcessSalaryList] = useState<ProcessSalaryData[]>([]);
    const [formData, setFormData] = useState<AddUpdateProcessSalary>(() => initialFormData());
    const [editProcessSalary, setEditProcessSalary] = useState<ProcessSalaryData | null>(null);
    const [deleteProcessSalaryData, setDeleteProcessSalaryData] = useState<ProcessSalaryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();
    const { pagination, setPagination } = usePagination(20);
    const [departmentValue, setDepartmentValue] = useState<string | number | null>(null);
    const [companyValues, setCompanyValues] = useState<string | number | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [errors, setErrors] = useState<{ [K: string]: string }>({});
    const { canAction, canExport } = useMenuPermissions();
    const navigate = useNavigate();

    const { listState, updateListState, resetFilters, clearProcessSalaryContext } = useProcessSalaryListState();
    const { page, filters, sortInfo, searchTerm } = listState;

    useEffect(() => {
        if (searchTerm && searchTerm.trim()) {

            loadProcessSalary(page, { SalaryProcessMonthYear: searchTerm.trim() }, sortInfo);
        } else {
            loadProcessSalary(page, filters, sortInfo);
        }
    }, [page, filters, sortInfo, searchTerm, clearProcessSalaryContext]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    const debouncedSearch = useDebouncedCallback((value: string, isSerach: boolean = true) => {

        let filterParams: FilterInfo = {};
        if (value.trim() === "") {

            updateListState({ searchTerm: "", filters: {}, page: 1 });
            return;
        }
        if (isSerach) {
            filterParams = { SalaryProcessMonthYear: value.trim() };
        }
        updateListState({ searchTerm: value, filters: filterParams, page: 1 });
    }, 350,);

    const CompanyDropdown = useMultiSelectDropdown({
        value: companyValues,
        fetchCallback: fetchCompanyMasterDropdown,
        autoFetchOptions: true,
    });

    const departmentValueDropdown = useMultiSelectDropdown({
        value: departmentValue,
        fetchCallback: fetchDepartmentMasterDropdown,
        autoFetchOptions: true,
    });

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editProcessSalary) {
                setFormData({
                    ProcessSalaryId: editProcessSalary.ProcessSalaryId,
                    Uniquekey: editProcessSalary.Uniquekey,
                    SalaryProcessMonthYear: editProcessSalary.SalaryProcessMonthYear,
                    DepartmentMasterId: editProcessSalary.DepartmentMasterId,
                    CompanyId: editProcessSalary.CompanyId
                })
                setDepartmentValue(editProcessSalary.DepartmentMasterId || null);
                setCompanyValues(editProcessSalary.CompanyId || null);
            } else {
                setFormData(initialFormData());
                setDepartmentValue(null);
                setCompanyValues(null);
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editProcessSalary])

    const loadProcessSalary = async (page: number = pagination.currentPage, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProcessSalaryRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProcessSalaryId: filterParams.ProcessSalaryId ? Number(filterParams.ProcessSalaryId) : undefined,
                    SalaryProcessMonthYear: searchtext ?? filterParams.SalaryProcessMonthYear,
                    SortBy: getSortByParam(sortInfo ?? null, ProcessSalaryColumns)
                }

                const response = await processSalaryService.apiCallPullProcessSalary(params);

                if (E.isRight(response)) {

                    setProcessSalaryList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize,),
                    });

                } else {
                    addToast({ type: "error", title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Process Salary",
        );
    };

    const PushProcessSalaryFormData = (): AddUpdateProcessSalary => {
        return {
            ProcessSalaryId: formData.ProcessSalaryId,
            Uniquekey: formData.Uniquekey,
            SalaryProcessMonthYear: formData.SalaryProcessMonthYear,
            DepartmentMasterId: formData.DepartmentMasterId,
            CompanyId: formData.CompanyId
        }
    }

    const ValidateProcessSalary = (): {
        isValid: boolean;
        errors: { [K: string]: string };
    } => {

        const newErrors: { [key: string]: string } = {}

        if (!formData.SalaryProcessMonthYear) {
            newErrors.SalaryProcessMonthYear = "Salary Process Month Year is Required"
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleAddUpdateProcessSalary = async (e: React.FormEvent) => {
        e.preventDefault()

        setErrors({});
        const validation = ValidateProcessSalary();

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const Payload = PushProcessSalaryFormData();

                const response = await processSalaryService.apiCallAddUpdateProcessSalary(Payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.ProcessSalaryId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as ProcessSalaryData

                        setProcessSalaryList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    } else {

                        const updatedRecord = response.right.Data[0] as ProcessSalaryData;

                        setProcessSalaryList(prevData =>
                            prevData.map(item =>
                                item.ProcessSalaryId === formData.ProcessSalaryId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: "success", title: response.right.SuccessMessage[0] })
                    }
                    setEditProcessSalary(null);
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
            "Add Update Process Salary"
        )
    }

    const handleDeleteProcessSalaryData = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteProcessSalaryData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteProcessSalary = {
                    ProcessSalaryId: deleteProcessSalaryData.ProcessSalaryId,
                    Uniquekey: deleteProcessSalaryData.Uniquekey
                }

                const response = await processSalaryService.apiCallDeleteProcessSalary(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }
                    else if (processSalaryList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await loadProcessSalary(pageToShow, {});

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteProcessSalaryData(null);
                } else {
                    addToast({ type: "error", title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response
            },
            undefined,
            (erro: any) => {
                addToast({ type: "error", title: erro.message })
            },
            undefined,
            "Delete Process Salary"
        )
    }

    const handleConfirmationDialogBoxOpen = useCallback((row: ProcessSalaryData) => {
        setDeleteProcessSalaryData(row)
        setIsConfirmationDialogBoxOpen(true);
    }, [])

    const handleEditProcessSalary = useCallback((row: ProcessSalaryData) => {
        setEditProcessSalary({
            ...row,
            ProcessSalaryId: row.ProcessSalaryId
        })
        setIsAddUpdateModalOpen(true)
    }, []);

    const handleSearch = (searchValue: string) => {
        updateListState({ searchTerm: searchValue })
        debouncedSearch(searchValue, false)
    }

    const handlClearSearch = () => {
        debouncedSearch.cancel?.();
        resetFilters();
    }

    const handleViewProcessSalary = useCallback((row: ProcessSalaryData) => {
        updateListState({
            ProcessSalaryId: row.ProcessSalaryId ?? 0,
            SalaryProcessMonthYear: row.SalaryProcessMonthYear ?? "",
        });
        navigate("/processSalary/view");
    }, [navigate, updateListState]);

    const ProcessSalaryColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "SalaryProcessMonthYear",
                label: "Month/Year",
                width: "15",
                sortable: false,
                render: (value, row) => (
                    <span
                        className="text-[#135BEC] font-medium cursor-pointer hover:text-blue-700 hover:underline"
                        onClick={() => handleViewProcessSalary(row)}
                    >
                        {formatMonthYear(value)}
                    </span>
                )
            },
            {
                key: "Department",
                label: "Department",
                width: "25",
                sortable: false,
                fixed: "left",
                render: (value) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                ),
            },
            {
                key: "CompanyName",
                label: "Company",
                width: "25",
                sortable: false,
                render: (value) => (
                    <TooltipText
                        text={value || "-"}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                ),
            },
            {
                key: "Actions",
                label: "Actions",
                width: "20",
                fixed: "right",
                render: (_value, row) => (
                    <div className="flex items-center justify-center">
                        {/* {canAction && ( */}
                        <Button
                            color="transparent"
                            size="sm"
                            style={{
                                color: 'blue',
                                padding: '0px 8px'
                            }}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleEditProcessSalary(row)
                            }}
                            leftIcon={<Edit className="h-4 w-4" />}
                        />

                        <Button
                            color="transparent"
                            size="sm"
                            style={{
                                color: 'red',
                                padding: '0px 8px'
                            }}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleConfirmationDialogBoxOpen(row)

                            }}
                            leftIcon={<Trash2 className="h-4 w-4" />}
                        />
                        {/* )} */}
                    </div>
                )
            }
        ], [canAction])

    const handleAddUpdateModalOpen = () => {
        setIsAddUpdateModalOpen(true);
        setEditProcessSalary(null);
        setFormData(initialFormData());
    }

    const handleFieldChange = (field: keyof AddUpdateProcessSalary, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handlePageChange = useCallback((page: number) => {
        loadProcessSalary(page, filters, sortInfo, searchTerm);
    }, [sortInfo, filters, searchTerm]);

    const ProcessSalaryPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]);

    const ProcessSalaryForTable = useMemo(() => processSalaryList, [processSalaryList]);

    const handleExportProcessSalary = async (exportType: "Excel" | "PDF") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProcessSalaryRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    SalaryProcessMonthYear: filters.SalaryProcessMonthYear?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ProcessSalaryColumns),
                    ExportType: exportType
                }

                const response = await processSalaryService.apiCallPullProcessSalary(params);

                handleExportFile(response, exportType, "Process Salary", addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportProcessSalaryExcel = () => handleExportProcessSalary("Excel");
    const handleExportProcessSalaryPdf = () => handleExportProcessSalary("PDF");

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>

            <TableActionToolbar
                isShowSearchBar
                searchPlaceholder="Search By Salary Process Month Year"
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                onClearSearch={handlClearSearch}

                // isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddUpdateModalOpen}

                isShowExportButton={canExport && ProcessSalaryForTable.length > 0}
                onExportExcel={handleExportProcessSalaryExcel}
                onExportPdf={handleExportProcessSalaryPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={processSalaryList}
                columns={ProcessSalaryColumns}
                pagination={ProcessSalaryPaginationInfo}
                className="flex-1"
                emptyMessage="No Process Salary Data Found"
                recordsPerPage={20}
                loading={isLoading}
            />

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditProcessSalary(null);
                    setErrors({})
                    setFormData(initialFormData());
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditProcessSalary(null);
                    setErrors({});
                    setFormData(initialFormData());
                }}
                title={editProcessSalary ? "Update Process Salary" : "Add Process Salary"}
                saveText={editProcessSalary ? "Update" : "Add"}
                size="half-screen"
                onSubmit={handleAddUpdateProcessSalary}
            >
                <div className="space-y-10 p-6 bg-blue-100">

                    <div className="space-y-4">

                        <div>
                            <MonthPicker
                                label="Select Month"
                                value={formData.SalaryProcessMonthYear || ""}
                                onChange={(val) => { handleFieldChange("SalaryProcessMonthYear", val) }}
                                required
                                error={errors.SalaryProcessMonthYear}
                            />
                        </div>

                        <div>
                            <MultiSelectPagination
                                label="Department"
                                size="lg"
                                dataFetchCallBack={fetchDepartmentMasterDropdown}
                                selectedValues={departmentValueDropdown.selectedValues}
                                options={departmentValueDropdown.initialOptions}
                                onChange={(values) => {
                                    const { idsString } = departmentValueDropdown.handleChange(values);
                                    setDepartmentValue(idsString || null);
                                    handleFieldChange("DepartmentMasterId", idsString);
                                }}
                            />
                        </div>

                        <div>
                            <MultiSelectPagination
                                label="Company"
                                size="lg"
                                dataFetchCallBack={fetchCompanyMasterDropdown}
                                selectedValues={CompanyDropdown.selectedValues}
                                options={CompanyDropdown.initialOptions}
                                onChange={(values) => {
                                    const { idsString } = CompanyDropdown.handleChange(values);
                                    setCompanyValues(idsString || null);
                                    handleFieldChange("CompanyId", idsString);
                                }}
                            />
                        </div>

                    </div>

                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteProcessSalaryData(null)
                }}
                onConfirm={handleDeleteProcessSalaryData}
                loading={isLoading}
                pageName="Process Salary"
            />
        </div>
    )
}
export default ProcessSalary;