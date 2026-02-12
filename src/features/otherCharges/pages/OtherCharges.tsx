import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from 'fp-ts/Either';
import usePagination from "@/core/hooks/usePagination";
import { useToast } from "@/core/hooks/useToast";
import { TableActionToolbar } from "@/ui/components/TableAction/TableActionToolbar";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { handleExportFile } from "@/core/utils/exportFile";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { Modal } from "@/ui/components/Modal/Modal";
import { updateFilter } from "@/core/utils/filterHelper";
import { Button, Input } from "@/ui/components/forms";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { otherChargesService } from "@/features/otherCharges/services/OtherChargesService";
import type { AddUpdateOtherChargesRequest, DeleteOtherChargesRequest, FilterWithPaginationOtherChargesRequest, OtherChargesData } from "@/features/otherCharges/models/OtherChargesModel";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { Trash2 } from "lucide-react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { UNIT_SQFT_LUMPSUM } from "@/core/constants";

const initialFormState = (): AddUpdateOtherChargesRequest => ({
    OtherChargesId: 0,
    ProjectId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ChargeName: '',
    CalculatedOn: null,
    Value: 0,
    GSTPercentage: 0,
    GSTValue: 0
})

export const OtherCharges: React.FC = () => {

    //STATE
    const [OtherChargesList, setOtherChargesList] = useState<OtherChargesData[]>([]);
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(2);

    // TOAST
    const { addToast } = useToast();

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeOtherChargesColumnsModal, setIsShowCustomizeOtherChargesColumnsModal] = useState(false);

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    //#region MENU PERMISSIONS
    const { canExport, canAction } = useMenuPermissions();
    //#endregion

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject()
    //#endregion

    // ADD EDIT OTHER CHARGES 
    const [editingOtherChargesData, setEditingOtherChargesData] = useState<OtherChargesData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdateOtherChargesRequest>(() => initialFormState());

    //DELETE OTHER CHARGES 
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteOtherChargesData, setDeleteOtherChargesData] = useState<OtherChargesData | null>(null)

    // SINGLE SEARCH TEXT BOX
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedCallback((value: string) => {
        handleSearchChange(value)
    }, 350);

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 
    const loadOtherCharges = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationOtherChargesRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    ChargeName: filterParams.ChargeName?.trim() || searchText?.trim() || undefined,
                    SortBy: getSortByParam(sort ?? null, OtherChargesColumns),
                };

                const response = await otherChargesService.apiCallPullOtherCharges(params);

                if (E.isRight(response)) {

                    setOtherChargesList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    })
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Other Charges'
        );
    }, [projectId, pagination.pageSize, addToast]);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

        loadOtherCharges(1, filters, sortInfo, searchTerm);
    }, [projectId]);
    //#endregion

    //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])
    //#endregion

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingOtherChargesData) {
                setFormData({
                    OtherChargesId: editingOtherChargesData.OtherChargesId || 0,
                    Uniquekey: editingOtherChargesData.Uniquekey || initialFormState().Uniquekey,
                    ChargeName: editingOtherChargesData.ChargeName || "",
                    ProjectId: Number(projectId),
                    CalculatedOn: editingOtherChargesData.CalculatedOn || "",
                    Value: editingOtherChargesData.Value || 0,
                    GSTPercentage: editingOtherChargesData.GSTPercentage || 0,
                    GSTValue: editingOtherChargesData.GSTValue || 0
                });
            } else {
                setFormData(initialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingOtherChargesData]);
    //#endregion

    //#region SEARCH HANDLERS
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadOtherCharges(1, filters, sortInfo, value);
    };

    //#region CLEAR HANDLERS
    const handleClearSearch = () => {
        debouncedSearch.cancel?.();
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadOtherCharges(1, filters, sortInfo, '');
    };

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadOtherCharges(page, filters, sortInfo, searchTerm);
    };
    //#endregion

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportOtherCharges = useCallback(async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationOtherChargesRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    ChargeName: filters.ChargeName?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, OtherChargesColumns),
                    ExportType: exportType
                };

                const response = await otherChargesService.apiCallPullOtherCharges(params);

                handleExportFile(response, exportType, 'Other Charges', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    }, [projectId, pagination.pageSize, addToast]);

    const handleExportOtherChargesExcel = () => handleExportOtherCharges('Excel')
    const handleExportOtherChargesPdf = () => handleExportOtherCharges('PDF')
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: OtherChargesData) => {
        setDeleteOtherChargesData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    //#region TABLE COLUMNS
    const OtherChargesColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ChargeName',
            label: 'Charge Name',
            width: '16',
            sortable: false,
            align: 'center',
            render: (value, row) => (
                <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => {
                        setEditingOtherChargesData(row);
                        setIsViewModalOpen(true);
                    }}
                >
                    {value || '-'}
                </span>
            )
        },
        {
            key: 'Value',
            label: 'Value',
            width: '16',
            sortable: false,
            align: 'center',
            render: (value) => value ? `₹ ${value}` : '-'
        },
        {
            key: 'CalculatedOn',
            label: 'Calculated On',
            width: '16',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'GSTPercentage',
            label: 'GST Percentage',
            width: '16',
            sortable: false,
            align: 'center',
            render: (value) => value ? `${value}%` : '-'
        },
        {
            key: 'GSTValue',
            label: 'GST Value',
            width: '16',
            sortable: false,
            align: 'center',
            render: (value) => value ? `₹ ${value}` : '-'
        },
        {
            key: 'Actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => (
                canAction ? (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleConfirmationDialogBoxOpen(row)
                            }}
                            color='transparent'
                            isborderRadius
                            size='sm'
                            style={{
                                color: 'red',
                                padding: '4px 8px'
                            }}
                            title="Delete Deduction"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ) : null
            )
        }
    ], [handleConfirmationDialogBoxOpen]);
    //#endregion

    const handleFieldChange = (field: keyof AddUpdateOtherChargesRequest, value: any) => {
        setFormData((prev) => {
            const updatedData = {
                ...prev,
                [field]: value,
            };
            const baseValue = Number(updatedData.Value) || 0;
            const gstPercent = Number(updatedData.GSTPercentage) || 0;

            if (field === "Value" || field === "GSTPercentage") {
                updatedData.GSTValue = Number(
                    ((baseValue * gstPercent) / 100).toFixed(2)
                );
            }
            return updatedData;
        });
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    // #region HANDLE ADD OTHER CHARGES MODAL
    const handleAddOtherChargesModal = () => {
        setEditingOtherChargesData(null);
        setFormData({
            ...initialFormState(),
            ProjectId: Number(projectId),
        });
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================

    const validationAddUpdateOtherChargesForm = (): {
        isValid: boolean
        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.ChargeName || formData.ChargeName.trim() === '') {
            newErrors.ChargeName = "Charge Name is required."
        } else if (formData.ChargeName.trim().length < 3) {
            newErrors.ChargeName = "Charge Name must be at least 3 characters long."
        }

        if (!formData.Value || formData.Value === 0) {
            newErrors.Value = "Value is required."
        }

        if (!formData.GSTPercentage || formData.GSTPercentage < 0) {
            newErrors.GSTPercentage = "GST Percentage is required."
        }
        if (!formData.CalculatedOn || formData.CalculatedOn.trim() === '') {
            newErrors.CalculatedOn = "Calculated On is required."
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    //#region PUSH FORM DATA
    const PushOtherChargesFormData = (): AddUpdateOtherChargesRequest => {

        return {
            OtherChargesId: formData.OtherChargesId,
            Uniquekey: formData.Uniquekey,
            ProjectId: Number(projectId),
            ChargeName: formData.ChargeName,
            CalculatedOn: formData.CalculatedOn,
            Value: formData.Value,
            GSTValue: formData.GSTValue,
            GSTPercentage: formData.GSTPercentage
        }
    };

    //#region ADD UPDATE OTHER CHARGES 
    const handleAddUpdateOtherCharges = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({})

        const validation = validationAddUpdateOtherChargesForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushOtherChargesFormData();

                const response = await otherChargesService.apiCallAddUpdateOtherCharges(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.OtherChargesId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as OtherChargesData
                        setOtherChargesList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as OtherChargesData;
                        setOtherChargesList(prevData =>
                            prevData.map(item =>
                                item.OtherChargesId === formData.OtherChargesId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
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
            'Add Other Charges'
        )
    };
    //#endregion

    //#region DELETE OTHER CHARGES  
    const handleDeleteOtherCharges = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteOtherChargesData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteOtherChargesRequest = {
                    OtherChargesId: deleteOtherChargesData.OtherChargesId || 0,
                    Uniquekey: deleteOtherChargesData.Uniquekey || '',
                    ProjectId: Number(projectId)
                }

                const response = await otherChargesService.apiCallDeleteOtherCharges(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }
                    else if (OtherChargesList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await loadOtherCharges(pageToShow, filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteOtherChargesData(null);

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
            'Delete Other Charges'
        )
    }
    //#endregion

    //#region COLUMN CUSTOMIZATION
    const requiredOtherChargesColumnKeys: string[] = ['ChargeName', 'Actions'];

    const allOtherChargesColumnKeys: string[] = OtherChargesColumns.map(c => c.key);

    const [selectedOtherChargesColumnKeys, setSelectedOtherChargesColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getOtherChargesTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredOtherChargesColumnKeys]));

                return withRequired.filter(k => allOtherChargesColumnKeys.includes(k));
            }
        } catch { }
        return allOtherChargesColumnKeys;
    });

    useEffect(() => {
        setSelectedOtherChargesColumnKeys(prev => Array.from(new Set([...prev, ...requiredOtherChargesColumnKeys])).filter(k => allOtherChargesColumnKeys.includes(k)));

    }, [OtherChargesColumns.length])

    const visibleOtherChargesColumns = useMemo(

        () => OtherChargesColumns.filter(col => selectedOtherChargesColumnKeys.includes(col.key)),

        [OtherChargesColumns, selectedOtherChargesColumnKeys]
    );
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadOtherCharges(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    }
    //#endregion

    //#region Clear
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });

        loadOtherCharges(1, {}, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });

        loadOtherCharges(1, filters, sort, searchTerm);
    }, [searchTerm]);
    //#endregion

    //#region OTHER CHARGES TABLE PAGINATION INFO
    const OtherChargesPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const OtherChargesForTable = useMemo(() => OtherChargesList, [OtherChargesList]);
    //#endregion

    //#region
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true)
                }}

                isShowCustomizeButton
                onCustomize={() => {
                    setIsShowCustomizeOtherChargesColumnsModal(true)
                }}

                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddOtherChargesModal}

                // IMPORT
                isShowImportButton={false}

                // EXPORT
                isShowExportButton={canExport && OtherChargesForTable.length > 0}
                onExportExcel={handleExportOtherChargesExcel}
                onExportPdf={handleExportOtherChargesPdf}
                exportLoading={isLoading}
            />

            {/* DATA TABLE OTHER CHARGES*/}
            
            <DataTable
                data={OtherChargesForTable}
                columns={visibleOtherChargesColumns}
                pagination={OtherChargesPaginationInfo}
                emptyMessage="No Other Charges Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeOtherChargesColumnsModal}
                onClose={() => setIsShowCustomizeOtherChargesColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredOtherChargesColumnKeys])
                    );
                    setSelectedOtherChargesColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeOtherChargesTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={OtherChargesColumns}
                selectedKeys={selectedOtherChargesColumnKeys}
                requiredKeys={requiredOtherChargesColumnKeys}
                title="Customize Table Columns"
            />

            {/* FILTER MODAL FOR OTHER CHARGES */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Other Charges"
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
                        <Input type="text"
                            label='Charge Name'
                            value={tempFilters?.ChargeName ?? ''}
                            onChange={e => handleFilterChange('ChargeName', e.target.value)}
                            placeholder="Enter Charge Name" />
                    </div>
                </div>

            </Modal>

            {/* ADD OTHER CHARGES MODAL */}

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingOtherChargesData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingOtherChargesData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title={editingOtherChargesData ? 'Update' : 'Add'}
                onSubmit={handleAddUpdateOtherCharges}
                saveText={editingOtherChargesData ? 'Update ' : 'Add '}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <Input
                                label='Charge Name'
                                required
                                type="text"
                                value={formData.ChargeName ?? ''}
                                onChange={(e) => handleFieldChange("ChargeName", e.target.value)}
                                error={errors.ChargeName}
                                maxLength={50}
                                placeholder="Enter Other Charge Name "
                            />
                        </div>

                        <div>
                            <Input
                                label='Value (in ₹)'
                                required
                                type="text"
                                value={formData.Value ?? ''}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '');
                                    handleFieldChange('Value', digits === '' ? 0 : Number(digits));
                                }}
                                error={errors.Value}
                                maxLength={10}
                                placeholder="Enter Value "
                            />
                        </div>

                        <div>
                            <SinglePageSelection
                                label="Calculated On"
                                placeholder="Select Calculated On"
                                value={formData.CalculatedOn ?? ''}
                                onChange={(value) => handleFieldChange("CalculatedOn", value)}
                                options={UNIT_SQFT_LUMPSUM.map(opt => ({ label: opt.name, value: opt.id }))}
                                error={errors.CalculatedOn}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label='GST (in %)'
                                type="text"
                                value={formData.GSTPercentage ?? ''}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '');
                                    handleFieldChange('GSTPercentage', digits === '' ? 0 : Number(digits));
                                }}
                                error={errors.GSTPercentage}
                                maxLength={5}
                                placeholder="Enter GST Percentage "
                            />
                        </div>

                        <div>
                            <Input
                                label='GST Value'
                                required
                                value={formData.GSTValue ?? ''}
                                error={errors.GSTValue}
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* VIEW OTHER CHARGES MODAL */}

            <Modal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setEditingOtherChargesData(null);
                }}
                title="Other Charges Details"
                cancelText="Close"
                size="xl"
            >
                <div className="space-y-6">

                    <div className="space-y-4">
                        <FieldItem label="Charge Name" value={editingOtherChargesData?.ChargeName} isRow withBorder={true} className='font-medium text-blue-900 ' />
                        <FieldItem label="Value" value={editingOtherChargesData?.Value ? `₹ ${editingOtherChargesData.Value}` : "-"} isRow withBorder={true} />
                        <FieldItem label="Calculated On" value={editingOtherChargesData?.CalculatedOn} isRow withBorder={true} />
                        <FieldItem label="GST Percentage" value={editingOtherChargesData?.GSTPercentage ? `${editingOtherChargesData.GSTPercentage} %` : "-"} isRow withBorder={true} />
                        <FieldItem label="GST Value" value={editingOtherChargesData?.GSTValue ? `₹ ${editingOtherChargesData.GSTValue}` : "-"} isRow withBorder={true} />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold pb-2">
                            Action Details
                        </h4>
                        <FieldItem label="Created By / Date" isRow={true} value={editingOtherChargesData?.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(editingOtherChargesData?.CreatedDate || '-')} withBorder={editingOtherChargesData?.ModifiedBy !== '' ? true : false} />
                        {editingOtherChargesData?.ModifiedBy !== '' ?
                            <FieldItem label="Modified By / Date" isRow={true} value={editingOtherChargesData?.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(editingOtherChargesData?.ModifiedDate || '-')} withBorder={false} />
                            :
                            ''}
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        {canAction && (
                            <>
                                <Button
                                    color='red'
                                    variant='solid'
                                    colorMode="light"
                                    size='md'
                                    onClick={() => {
                                        if (editingOtherChargesData) {
                                            setDeleteOtherChargesData(editingOtherChargesData);
                                            setIsViewModalOpen(false);
                                            setIsConfirmationDialogBoxOpen(true);
                                        }
                                    }}
                                >
                                    Delete
                                </Button>

                                <Button
                                    color='blue'
                                    size='md'
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        setIsAddUpdateModalOpen(true);
                                    }}
                                >
                                    Edit
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteOtherChargesData(null);
                }}
                onConfirm={handleDeleteOtherCharges}
                loading={isLoading}
                pageName='Other Charges'
            />
        </div>
    )
}
export default OtherCharges;
