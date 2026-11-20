import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddUpdateEmployeeLetter, AddUpdateEmployeeLetterShowEmployee, DeleteEmployeeLetter, EmployeeLetterData, FilterWithPaginationEmployeeLetterRequest } from "@/features/employeeMaster/models/EmployeeLetterModal";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useEmployeeListState } from "@/features/employeeMaster/context/EmployeeListStateContext";
import { employeeLetterService } from "@/features/employeeMaster/services/EmployeeLetterService";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useNavigate } from "react-router-dom";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { EMPLOYEE_LETTER_TYPE_OPTIONS } from "@/core/constants";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Edit, Trash2 } from "lucide-react";
import { handleExportFile } from "@/core/utils/exportFile";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchTncMasterDropdown } from "@/features/tnc/tncDropDown";
import RichTextEditor from "@/ui/components/forms/RichTextEditor";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { updateFilter } from "@/core/utils/filterHelper";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import ToggleSwitch from "@/ui/components/forms/ToggleSwitch";

const initialFormState = (): AddUpdateEmployeeLetter => ({
    EmployeeLetterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    EmployeeId: 0,
    Title: "",
    DocumentName: "",
    DocumentURL: "",
})

export const EmployeeLetter: React.FC = () => {

    const [employeeLetterList, setEmployeeLetterList] = useState<EmployeeLetterData[]>([]);
    const [formData, setFormData] = useState<AddUpdateEmployeeLetter>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast()
    const navigate = useNavigate();
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [editingEmployeeLetterData, setEditingEmployeeLetterData] = useState<EmployeeLetterData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const { canAction, canExport } = useMenuPermissions('/employeeMaster');
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteEmployeeLetterData, setDeleteEmployeeLetterData] = useState<EmployeeLetterData | null>(null)

    const { listState } = useEmployeeListState();
    const employeeId = listState.employeeId || 0;
    const employeeName = listState.employeeName || '';

    const [employeeLetterShowEmployee, setEmployeeLetterShowEmployee] = useState<AddUpdateEmployeeLetterShowEmployee | null>(null);
    const [isConfirmationDialogBoxOpenShowEmployee, setIsConfirmationDialogBoxOpenShowEmployee] = useState(false);

    const [filters, setFilters] = useState<FilterInfo>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchEmployeeLetter(value)
    }, 350)

    useEffect(() => {
        loadEmployeeLetter(1, {})
    }, [])

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingEmployeeLetterData) {
                setFormData({
                    EmployeeLetterId: editingEmployeeLetterData.EmployeeLetterId,
                    Uniquekey: editingEmployeeLetterData.Uniquekey || initialFormState().Uniquekey,
                    EmployeeId: editingEmployeeLetterData.EmployeeId,
                    DocumentName: editingEmployeeLetterData.DocumentName || '',
                    Title: editingEmployeeLetterData.Title || "",
                    DocumentURL: editingEmployeeLetterData.DocumentURL || "",
                });
            } else {
                setFormData({
                    ...initialFormState(),
                    EmployeeId: employeeId
                });
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingEmployeeLetterData, employeeId]);

    const loadEmployeeLetter = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationEmployeeLetterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    IsCheckPermission: true,
                    EmployeeId: employeeId,
                    EmployeeLetterId: filterParams.EmployeeLetterId ? Number(filterParams.EmployeeLetterId) : undefined,
                    DocumentName: searchtext ?? filterParams.DocumentName?.trim() ?? undefined,
                    Title: filterParams.Title?.trim() ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, EmployeeLetterColumn)
                }

                const response = await employeeLetterService.apiCallPullEmployeeLetter(params);

                if (E.isRight(response)) {

                    setEmployeeLetterList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    })

                } else {
                    addToast({ type: "error", title: response.left.message })
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Employee Letter'
        )
    }

    const fetchTncByModuleName = (moduleName: string) => (page: number, params?: { value?: string }) =>
        fetchTncMasterDropdown(page, {
            value: params?.value || "",
            moduleName: moduleName,
        });

    const validateAddUpdateEmployeeLetterForm = (): {
        isValid: boolean
        errors: { [key: string]: string }

    } => {

        const newErrors: { [key: string]: string } = {}

        if (!formData.Title || formData.Title.trim() === "") {
            newErrors.Title = "Title is required"
        }
        else if (formData.Title.trim().length < 3) {
            newErrors.Title = "Title must be at least 3 characters long"
        }

        if (!formData.DocumentName?.trim()) {
            newErrors.DocumentName = "Document Name is required"
        }

        if (!formData.DocumentURL?.trim()) {
            newErrors.DocumentURL = "Document is required"
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const PushEmployeeLetter = (): AddUpdateEmployeeLetter => {
        return {
            EmployeeLetterId: formData.EmployeeLetterId,
            Uniquekey: formData.Uniquekey,
            EmployeeId: employeeId,
            Title: formData.Title,
            DocumentName: formData.DocumentName,
            DocumentURL: formData.DocumentURL,
        }
    }

    const handleAddUpdateEmployeeLetter = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({})

        const validation = validateAddUpdateEmployeeLetterForm()

        if (!validation.isValid) {
            setErrors(validation.errors)

            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushEmployeeLetter();

                const response = await employeeLetterService.apiCallAddUpdateEmployeeLetter(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.EmployeeLetterId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as EmployeeLetterData

                        setEmployeeLetterList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as EmployeeLetterData;

                        setEmployeeLetterList(prevData =>
                            prevData.map(item =>
                                item.EmployeeLetterId === formData.EmployeeLetterId
                                    ? updatedRecord
                                    : item
                            )
                        )

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setEditingEmployeeLetterData(null);

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            Number(formData.EmployeeLetterId) === 0 ? 'Add Employee Letter' : 'Update Employee Letter'
        )
    };

    const handleDeleteEmployeeLetterData = async () => {
        setIsConfirmationDialogBoxOpen(false);
        if (!deleteEmployeeLetterData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {
                const params: DeleteEmployeeLetter = {
                    EmployeeLetterId: deleteEmployeeLetterData.EmployeeLetterId,
                    Uniquekey: deleteEmployeeLetterData.Uniquekey || '',
                    EmployeeId: deleteEmployeeLetterData.EmployeeId
                }

                const response = await employeeLetterService.apiCallDeleteEmployeeLetter(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (employeeLetterList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });

                    await loadEmployeeLetter(pageToShow, {});

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteEmployeeLetterData(null);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Delete Employee Letter'
        )
    }

    const handleEmployeeLetterShowEmployee = async () => {
        if (!employeeLetterShowEmployee) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: AddUpdateEmployeeLetterShowEmployee = {
                    EmployeeLetterId: employeeLetterShowEmployee.EmployeeLetterId,
                    EmployeeId: employeeId,
                    Uniquekey: employeeLetterShowEmployee.Uniquekey
                };

                const response = await employeeLetterService.apiCallAddUpdateEmployeeLetterShowEmployee(payload);

                if (E.isRight(response)) {

                    const updatedRecord = response.right.Data[0] as EmployeeLetterData;

                    setEmployeeLetterList(prevData =>
                        prevData.map(item =>
                            item.EmployeeLetterId === employeeLetterShowEmployee.EmployeeLetterId
                                ? updatedRecord
                                : item
                        )
                    )

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    setIsConfirmationDialogBoxOpenShowEmployee(false);

                    setEmployeeLetterShowEmployee(null);

                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                setIsConfirmationDialogBoxOpenShowEmployee(false);
                setEmployeeLetterShowEmployee(null);
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Show Letter To Employee",
        );
    };

    const handleEditEmployeeLetter = useCallback((row: EmployeeLetterData) => {
        setEditingEmployeeLetterData({
            ...row,
            DocumentName: row.DocumentName || ''
        })
        setIsAddUpdateModalOpen(true);
    }, [])

    const handleConfirmationDialogBoxOpen = useCallback((row: EmployeeLetterData) => {
        setDeleteEmployeeLetterData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const EmployeeLetterColumn = useMemo<TableColumn[]>(
        () => [
            {
                key: "DocumentName",
                label: "Document Name",
                width: "15",
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value, row) => {

                    const isDisabled = !canAction || row.IsShowEmployee === true || row.IsAcceptEmployee === true;

                    return (
                        <div className="flex items-center justify-between gap-2">
                            <TooltipText
                                text={value || "-"}
                                maxWidth="300px"
                                tooltipThreshold={40}
                            />


                            <div className="flex items-center gap-1">
                                <Button
                                    color="transparent"
                                    size="sm"
                                    disabled={isDisabled}
                                    style={{
                                        color: isDisabled ? "#9CA3AF" : "#2563eb",
                                        padding: "4px 8px",
                                        cursor: isDisabled ? "not-allowed" : "pointer",
                                        opacity: isDisabled ? 0.5 : 1,
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleEditEmployeeLetter(row);
                                    }}
                                    leftIcon={<Edit className="h-4 w-4" />}
                                />

                                <Button
                                    color="transparent"
                                    size="sm"
                                    disabled={isDisabled}
                                    style={{
                                        color: isDisabled ? "#9CA3AF" : "#dc2626",
                                        padding: "4px 8px",
                                        cursor: isDisabled ? "not-allowed" : "pointer",
                                        opacity: isDisabled ? 0.5 : 1,
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleConfirmationDialogBoxOpen(row);
                                    }}
                                    leftIcon={<Trash2 className="h-4 w-4" />}
                                />
                            </div>
                        </div>
                    );
                }
            },
            {
                key: "Title",
                label: "Title",
                width: "15",
                sortable: false,
                fixed: 'left',
                align: 'left',
                render: (value) => value || ''
            },
            {
                key: 'DocumentURL',
                label: 'PDF',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value: string, row: any) => {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <MultiImageViewer
                                images={parseDocumentUrls(row.DocumentURL)}
                                title={row.Title}
                                isIcon={false}
                                triggerLabel={value === '' || 'PDF'}
                            />

                        </div>
                    );
                }
            },
            {
                key: "IsShowEmployee",
                label: "Show Employee",
                width: "15",
                sortable: false,
                fixed: "left",
                align: "left",
                render: (value: boolean, row: EmployeeLetterData) => (
                    <ToggleSwitch
                        label=""
                        name={`IsShowEmployee_${row.EmployeeLetterId}`}
                        value={value === true}
                        disabled={value === true || isLoading || !canAction}
                        onChange={(checked) => {
                            if (!checked || value === true || isLoading || !canAction) {
                                return;
                            }

                            setEmployeeLetterShowEmployee(row);
                            setIsConfirmationDialogBoxOpenShowEmployee(true);
                        }}
                    />
                ),
            },


            {
                key: "IsAcceptEmployee",
                label: "Employee Accepted",
                width: "15",
                sortable: false,
                fixed: "left",
                align: "left",
                render: (value: boolean) => (
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${value
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        {value ? "Yes" : "No"}
                    </span>
                ),
            },
            {
                key: "EmployeeRemark",
                label: "Remark",
                width: "15",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => (
                    <FieldInfoTooltip value={value} />
                )
            },
        ], [canAction, handleEditEmployeeLetter, handleConfirmationDialogBoxOpen, handleEmployeeLetterShowEmployee]);

    const handleBackToListEmployee = () => {
        navigate('/employeeMaster');
    };

    const handleAddEmployeeLetterModal = () => {
        setEditingEmployeeLetterData(null);
        setFormData({
            ...initialFormState(),
            EmployeeId: employeeId
        });
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    const applyFilters = () => {
        setFilters(tempFilters)
        loadEmployeeLetter(1, tempFilters)
        setShowFilterPopup(false)
    }

    const clearFilters = () => {
        setTempFilters({})
        setFilters({})
        loadEmployeeLetter(1, {})
        setShowFilterPopup(true)
    }

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };

    const handleFieldChange = (field: keyof AddUpdateEmployeeLetter, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handlePageChange = (page: number) => {
        loadEmployeeLetter(page, filters, sortInfo, searchTerm || undefined);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        loadEmployeeLetter(1, filters, sort, searchTerm || undefined);
    }, [filters, searchTerm]);

    const EmployeeLetterPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange])

    const EmployeeLetterListForTable = useMemo(() => employeeLetterList, [employeeLetterList]);

    const searchEmployeeLetter = async (searchValue: string) => {
        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {

            loadEmployeeLetter(1, filters, sortInfo, searchValue)
            return
        }
        await loadEmployeeLetter(1, filters, sortInfo, searchValue)
    }

    const clearsearchEmployeeLetter = () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();
        loadEmployeeLetter(1, { DocumentName: '' }, sortInfo, undefined);
    }

    const handleExportEmployeeLetter = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationEmployeeLetterRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsCheckPermission: true,
                    EmployeeId: employeeId || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, EmployeeLetterColumn),
                    ExportType: exportType
                }

                const response = await employeeLetterService.apiCallPullEmployeeLetter(params);

                handleExportFile(response, exportType, 'Employee Letter', addToast)

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Export'
        )
    }

    const handleExportEmployeeLetterExcel = () => handleExportEmployeeLetter('Excel')
    const handleExportEmployeeLetterPdf = () => handleExportEmployeeLetter('PDF')

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchPlaceholder="Search by Document Name"
                searchTerm={searchTerm}

                onSearchChange={(v) => {
                    setSearchTerm(v)
                    debouncedSearch(v)
                }}
                onClearSearch={clearsearchEmployeeLetter}

                isShowFilterButton={true}
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters)
                    setShowFilterPopup(true)
                }}

                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddEmployeeLetterModal}

                isShowExportButton={canExport}
                onExportExcel={handleExportEmployeeLetterExcel}
                onExportPdf={handleExportEmployeeLetterPdf}
                exportLoading={isLoading}
            />

            <div className="flex items-center gap-3 mb-6 border-b border-gray-500 pb-3">
                <HeaderActionBar
                    titleText="Employee Name : "
                    subTitleText={employeeName}
                    cancelText="Cancel"
                    onCancel={() => handleBackToListEmployee()}
                    canAction={false}
                    isLoading={isLoading}
                />
            </div>

            <DataTable
                columns={EmployeeLetterColumn}
                data={EmployeeLetterListForTable}
                pagination={EmployeeLetterPaginationInfo}
                emptyMessage="No Employee Letter Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                loading={isLoading}
            />

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingEmployeeLetterData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingEmployeeLetterData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title={editingEmployeeLetterData ? 'Update Employee Letter' : 'Add Employee Letter'}
                onSubmit={handleAddUpdateEmployeeLetter}
                saveText={editingEmployeeLetterData ? 'Update' : 'Add'}
                loading={isLoading}
                size='half-screen'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <SinglePageSelection
                                label="Document Name"
                                required
                                placeholder="Select Document Name"
                                value={formData.DocumentName ?? ""}
                                onChange={(value) => handleFieldChange("DocumentName", value)}
                                options={EMPLOYEE_LETTER_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                                error={errors.DocumentName}
                            />
                        </div>

                        <div>
                            <Input
                                label='Title'
                                required
                                error={errors.Title}
                                type="text"
                                value={formData.Title || ''}
                                maxLength={100}
                                onChange={(e) => handleFieldChange('Title', e.target.value)}
                                placeholder="Enter Title"
                            />
                        </div>

                        <div>
                            <SingleSelectDropdownWithPagination
                                label="Document"
                                title="Document"
                                size="lg"
                                dataFetchCallBack={fetchTncByModuleName("EMPLOYEE LETTER")}
                                onSelected={(item) => handleFieldChange("DocumentURL", item?.value)}
                                error={errors.DocumentURL}
                                required
                            />


                        </div>

                        {formData?.DocumentURL && (
                            <div>
                                <RichTextEditor
                                    value={formData.DocumentURL}
                                    onChange={(e) => handleFieldChange("DocumentURL", e)}
                                    readOnly
                                    className="overflow-y-auto thin-scroll h-[250px]"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Employee Letter"
                onSubmit={(e) => {
                    e.preventDefault()
                    applyFilters()
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                size="small-half"
            >
                <div className="space-y-6">
                    <div className="space-y-4">

                        <div>
                            <SinglePageSelection
                                label='Document Name'
                                value={tempFilters.DocumentName || ''}
                                placeholder="Select Document Name"
                                onChange={e => handleFilterChange('DocumentName', String(e))}
                                options={EMPLOYEE_LETTER_TYPE_OPTIONS.map(opt => ({
                                    label: opt.name,
                                    value: opt.id
                                }))}
                            />
                        </div>

                        <div>
                            <Input
                                label='Title'
                                type="text"
                                value={tempFilters.Title || ''}
                                onChange={(e) => handleFilterChange("Title", e.target.value)}
                                placeholder="Enter Title"
                            />
                        </div>

                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteEmployeeLetterData(null)
                }}
                onConfirm={handleDeleteEmployeeLetterData}
                loading={isLoading}
                pageName='Employee Letter'
            />

            <ConfirmationDialogBox
                title="Show Employee"
                message="Are you sure you want to show this letter to the employee?"
                isOpen={isConfirmationDialogBoxOpenShowEmployee}
                onClose={() => {
                    setIsConfirmationDialogBoxOpenShowEmployee(false);
                    setEmployeeLetterShowEmployee(null)
                }}
                onConfirm={handleEmployeeLetterShowEmployee}
                confirmText="Yes"
                cancelText="Cancel"
                loading={isLoading}
                variant='generate'
            />

        </div>
    )
}
export default EmployeeLetter;