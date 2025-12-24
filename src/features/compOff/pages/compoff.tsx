import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
    CompOffData,
    FilterWithPaginationCompOff,
    AddUpdateCompOff,
    DeleteCompOffRequest,
} from '@/features/compOff/models/compOff';

import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import {
    formatDate_dd_MonthName_yy_hh_mm,
    convert_dd_mm_yyyy_To_Yyyy_mm_dd,
    formatDate_dd_mm_yyyy,

} from '@/core/utils/dateFormat';
import { Button } from '@/ui/components/forms/Button';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import { updateFilter } from '@/core/utils/filterHelper';
import { DateInput } from '@/ui/components/forms/DateInput';
import { CompOffService } from '../services/CompOffServices';
import { DateRangePickerModal } from '@/ui/components/forms/DateRangePickerModel';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';

const initialFormState = (): AddUpdateCompOff => ({
    CompOffId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    CompOffDate: null,
    RequestDate: null,
    Reason: null
});

export const CompOff: React.FC = () => {

    //#region STATE
    const [compOffList, setCompOffList] = useState<CompOffData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const navigate = useNavigate();

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);

    //TABLE SORT INFO
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    // TOAST
    const { toasts, removeToast, addToast } = useToast()

    // Removed search functionality - using date filters instead


    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [filters, setFilters] = useState<FilterInfo>({});
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeCompOffColumnsModal, setIsShowCustomizeCompOffColumnsModal] = useState(false);

    //ADD UPDATE COMP OFF MODAL STATES
    const [editingCompOffData, setEditingCompOffData] = useState<CompOffData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdateCompOff>(() => initialFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [modalKey, setModalKey] = useState(0); // Key to force modal reset

    //VIEW COMP OFF MODAL STATES
    const [viewingCompOffData, setViewingCompOffData] = useState<CompOffData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    //EXPORT DROPDOWN STATE
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

    //#endregion

    //#region MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    //#endregion

    //#region STATE CREATED PAGE AFTER NAVIGATE VIEW OR ADD UPDATE PAGE THEN CHECK

    const location = useLocation() as Location & {
        state?: {
            listState?: {
                page?: number;
                filters?: FilterInfo;
                sortInfo?: SortInfo;
            };
        };
    };
    //#endregion

    //#region INIT

    useEffect(() => {

        const incoming = location.state?.listState as
            | { page?: number; filters?: FilterInfo; sortInfo?: SortInfo }
            | undefined;

        const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined };


        setPagination({ currentPage: listState.page ?? pagination.currentPage });

        setSortInfo(listState.sortInfo);

        setFilters(listState.filters ?? {});

        setTempFilters(listState.filters ?? {});


        loadCompOff(listState.page ?? 1, listState.filters ?? {});

    }, [location.state]);

    // Close export dropdown when clicked outside
    useEffect(() => {
        if (!exportDropdownOpen) return;

        function handleDocClick(e: MouseEvent) {
            const target = e.target as Node | null;
            if (target && !(target as Element).closest('.relative')) {
                setExportDropdownOpen(false);
            }
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setExportDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleDocClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleDocClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [exportDropdownOpen]);

    // Populate form when editing
    useEffect(() => {
        if (editingCompOffData) {
            setFormData({
                CompOffId: editingCompOffData.CompOffId,
                Uniquekey: editingCompOffData.Uniquekey && editingCompOffData.Uniquekey.trim() !== ''
                    ? editingCompOffData.Uniquekey.trim()
                    : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                CompOffDate: editingCompOffData.CompOffDate || null,
                RequestDate: editingCompOffData.RequestDate || null,
                Reason: editingCompOffData.Reason || null
            });
        } else {
            setFormData(initialFormState());
        }
    }, [editingCompOffData]);

    // Fix datepicker z-index when modal is open
    useEffect(() => {
        if (!isAddUpdateModalOpen) return;

        const updateDatepickerZIndex = () => {
            // Find all datepicker popups (divs with position absolute and zIndex 50)
            const datepickerPopups = document.querySelectorAll('div[style*="position: absolute"]');
            datepickerPopups.forEach((popup) => {
                const element = popup as HTMLElement;
                const style = element.getAttribute('style') || '';
                if (style.includes('zIndex: 50') || style.includes('z-index: 50')) {
                    element.style.zIndex = '10000';
                }
            });
        };

        // Update immediately and on any DOM changes
        updateDatepickerZIndex();
        const observer = new MutationObserver(updateDatepickerZIndex);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

        return () => {
            observer.disconnect();
        };
    }, [isAddUpdateModalOpen]);
    //#endregion

    //#region DATA LOAD
    const fetchCompOffList = async (page: number = pagination.currentPage) => {
        return await loadCompOff(page, filters);
    }

    const loadCompOff = async (page: number, filterParams: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                let sortByParam = undefined;
                if (sortInfo) {
                    const column = compOffColumns.find(col => col.key === sortInfo.column)
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
                    }
                }
                // Convert date format from DD-MM-YYYY to YYYY-MM-DD for API
                const startDate = filterParams.StartDate?.trim()
                    ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.StartDate.trim())
                    : undefined;
                const endDate = filterParams.EndDate?.trim()
                    ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.EndDate.trim())
                    : undefined;

                const params: FilterWithPaginationCompOff = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    CompOffId: filterParams.CompOffId ? Number(filterParams.CompOffId) : 0,
                    StartDate: startDate || undefined,
                    EndDate: endDate || undefined,
                    Reason: filterParams.Reason?.trim() || undefined,
                    SortBy: sortByParam
                }

                const response = await getCompOff(params);

                if (E.isRight(response)) {

                    setCompOffList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Comp Off Data'
        )
    }

    //#endregion


    //#region EXCEL EXPORT PDF | EXCEL
    const handleExportCompOff = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                let sortByParam = undefined
                if (sortInfo) {
                    const column = compOffColumns.find(col => col.key === sortInfo.column)
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
                    }
                }
                const params: FilterWithPaginationCompOff = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    CompOffId: filters.CompOffId ? Number(filters.CompOffId) : undefined,
                    StartDate: filters.StartDate?.trim() || undefined,
                    EndDate: filters.EndDate?.trim() || undefined,
                    Reason: filters.Reason?.trim() || undefined,
                    SortBy: sortByParam,
                    ExportType: exportType
                }
                const response = await getCompOff(params);
                handleExportFile(response, exportType, 'Comp Off', addToast)
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Export...'
        )
    }

    const handleExportCompOffExcel = () => handleExportCompOff('Excel')
    const handleExportCompOffPdf = () => handleExportCompOff('PDF')
    //#endregion

    //#region GET COMP OFF DATA FROM API
    const getCompOff = async (filterParams: FilterWithPaginationCompOff) => {
        return await CompOffService.apiCallPullCompOff(filterParams);
    }
    //#endregion

    //#region TABLE CONFIG

    const handlePageChange = useCallback((page: number) => {
        fetchCompOffList(page);
    }, [filters]);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        fetchCompOffList(1);
    }, [filters]);

    const compOffPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
    )

    const compOffListForTable = useMemo(() => compOffList, [compOffList]);

    //#endregion

    //#region VIEW COMP OFF DETAILS
    const handleViewCompOffDetails = useCallback((row: CompOffData) => {
        setViewingCompOffData(row);
        setIsViewModalOpen(true);
    }, []);

    //#endregion

    //#region TABLE COLUMN

    const compOffColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'CompOffDate',
                label: 'CompOff Date',
                width: '25',
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value, row) => (
                    <div className="flex items-center justify-start">
                        <TooltipText
                            text={formatDate_dd_mm_yyyy(value)}
                            maxWidth="300px"
                            tooltipThreshold={30}
                            onClick={() => handleViewCompOffDetails(row)}
                        />
                    </div>
                )
            },
            {
                key: 'RequestDate',
                label: 'Request Date',
                width: '25',
                sortable: false,
                align: 'left',
                render: (value) => (
                    <TooltipText
                        text={formatDate_dd_mm_yyyy(value)}
                        maxWidth="300px"
                        tooltipThreshold={30}
                    />
                )
            },
            {
                key: 'Reason',
                label: 'Reason',
                width: '50',
                sortable: false,
                align: 'left',
                render: (value) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="500px"
                        tooltipThreshold={50}
                    />
                )
            },
        ],
        [handleViewCompOffDetails]
    )

    //#endregion

    //#region CUSTOMIZE COLUMNS

    const requiredCompOffColumnKeys: string[] = ['CompOffDate'];

    const [selectedCompOffColumnKeys, setSelectedCompOffColumnKeys] = useState<string[]>([]);

    useEffect(() => {

        if (compOffColumns.length === 0) return;

        try {
            const saved = localStorage.getItem('compOffTableColumns');
            if (saved) {
                const parsed: string[] = JSON.parse(saved);
                const filtered = parsed.filter(k =>
                    compOffColumns.some(col => col.key === k)
                );
                const final = Array.from(
                    new Set([
                        ...filtered,
                        ...requiredCompOffColumnKeys,
                    ])
                );
                setSelectedCompOffColumnKeys(final);
                return;
            }
        } catch { }

        const allKeys = compOffColumns.map(c => c.key);
        const final = Array.from(
            new Set([...allKeys, ...requiredCompOffColumnKeys])
        );
        setSelectedCompOffColumnKeys(final);
    }, [compOffColumns]);

    const visibleCompOffColumns = useMemo(
        () => compOffColumns.filter(col =>
            selectedCompOffColumnKeys.includes(col.key)
        ),
        [compOffColumns, selectedCompOffColumnKeys]
    );

    //#endregion

    //#region FILTER HELPERS
    const applyFilters = () => {
        setFilters(tempFilters)
        loadCompOff(1, tempFilters)
        setShowFilterPopup(false)
    }

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});

        // reset page
        setPagination({ currentPage: 1 });

        // load empty filters
        loadCompOff(1, {});

        setShowFilterPopup(false);

        // clear router state (very important)
        navigate(location.pathname, { replace: true, state: {} });
    };


    //#endregion

    //#region  HANDLE CHANGE EVENT

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };

    //#endregion

    //#region ADD UPDATE COMP OFF MODAL
    const handleAddCompOffModal = () => {
        setEditingCompOffData(null);
        setFormData(initialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    };

    //#region EDIT COMP OFF
    const handleEditCompOff = useCallback((data: CompOffData) => {
        setEditingCompOffData(data);
        setFormData({
            CompOffId: data.CompOffId || null,
            Uniquekey: data.Uniquekey && data.Uniquekey.trim() !== '' ? data.Uniquekey.trim() : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            CompOffDate: data.CompOffDate || null,
            RequestDate: data.RequestDate || null,
            Reason: data.Reason || null,
        });
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }, []);
    //#endregion

    const validateAddCompOffForm = (data: AddUpdateCompOff): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        // At least one date must be selected
        const hasCompOffDate = data.CompOffDate && String(data.CompOffDate).trim();
        const hasRequestDate = data.RequestDate && String(data.RequestDate).trim();

        if (!hasCompOffDate && !hasRequestDate) {
            newErrors.CompOffDate = "At least one date (Comp Off Date or Request Date) is required";
            newErrors.RequestDate = "At least one date (Comp Off Date or Request Date) is required";
        }

        if (!data.Reason || !String(data.Reason).trim()) {
            newErrors.Reason = "Reason is required";
        } else if (String(data.Reason).trim().length > 500) {
            newErrors.Reason = "Reason must be at most 500 characters";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const handleResetCompOff = useCallback(() => {
        setFormData(initialFormState());
        setErrors({});
        setModalKey(prev => prev + 1); // Force modal reset to clear dates and time
    }, []);

    const handleAddUpdateCompOff = async (startDate: string | null, endDate: string | null) => {
        setErrors({});

        // Only update dates that were actually selected (preserve existing if null)
        const updatedFormData: AddUpdateCompOff = {
            ...formData,
            CompOffDate: startDate !== null ? startDate : formData.CompOffDate,
            RequestDate: endDate !== null ? endDate : formData.RequestDate,
            Reason: formData.Reason
        };

        // Validate
        const validation = validateAddCompOffForm(updatedFormData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        // Persist updated form data after validation succeeds
        setFormData(updatedFormData);

        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                const payload: AddUpdateCompOff = {
                    CompOffId: updatedFormData.CompOffId || null,
                    Uniquekey: updatedFormData.Uniquekey && updatedFormData.Uniquekey.trim() !== ''
                        ? updatedFormData.Uniquekey.trim()
                        : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    CompOffDate: updatedFormData.CompOffDate?.trim() || null,
                    RequestDate: updatedFormData.RequestDate?.trim() || null,
                    Reason: updatedFormData.Reason?.trim() || null
                };

                const response = await CompOffService.apiCallAddUpdateCompOff(payload);

                if (E.isRight(response)) {
                    setIsAddUpdateModalOpen(false);
                    const isAdd = updatedFormData.CompOffId === 0;

                    if (isAdd) {
                        const newRecord = response.right.Data[0] as CompOffData;
                        setCompOffList(prevData => [newRecord, ...prevData]);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    } else {
                        const updatedRecord = response.right.Data[0] as CompOffData;
                        setCompOffList(prevData =>
                            prevData.map(item =>
                                item.CompOffId === updatedFormData.CompOffId
                                    ? updatedRecord
                                    : item
                            )
                        );
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    }

                    setEditingCompOffData(null);
                    setFormData(initialFormState());
                    setErrors({});
                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            updatedFormData.CompOffId === 0 ? 'Adding Comp Off...' : 'Updating Comp Off...'
        );
    };
    //#endregion

    //#region DELETE COMP OFF
    const handleDeleteCompOff = useCallback(async (data: CompOffData) => {
        const deleteRequest: DeleteCompOffRequest = {
            CompOffId: data.CompOffId || null,
            Uniquekey: data.Uniquekey && data.Uniquekey.trim() !== ''
                ? data.Uniquekey.trim()
                : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        };

        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                const response = await CompOffService.apiCallDeleteCompOff(deleteRequest);
                if (E.isRight(response)) {
                    addToast({ type: "success", title: "Comp Off deleted successfully" });
                    fetchCompOffList(pagination.currentPage);
                    return response;
                } else {
                    addToast({ type: "error", title: response.left?.message || "Failed to delete Comp Off" });
                    return response;
                }
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Deleting Comp Off...'
        );
    }, [pagination.currentPage, fetchCompOffList, addToast]);

    //#endregion

    //#region VIEW COMP OFF DETAILS MODAL COMPONENT
    interface ViewCompOffDetailsModalProps {
        isOpen: boolean
        onClose: () => void
        data: CompOffData | null
    }

    const ViewCompOffDetailsModal: React.FC<ViewCompOffDetailsModalProps> = ({
        isOpen,
        onClose,
        data
    }) => {
        if (!data) return null

        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Comp Off Details"
                onSubmit={(e) => {
                    e.preventDefault()
                    onClose()
                }}
                cancelText="Close"
                loading={false}
                size='xl'
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <FieldItem
                            label="Comp Off ID"
                            value={data.CompOffId?.toString() || '-'}
                            isRow
                            withBorder={true}
                        />
                        <FieldItem
                            label="Comp Off Date"
                            value={formatDate_dd_mm_yyyy(data.CompOffDate)}
                            isRow
                            withBorder={true}
                            className='font-medium text-blue-900'
                        />
                        <FieldItem
                            label="Request Date"
                            value={formatDate_dd_mm_yyyy(data.RequestDate)}
                            isRow
                            withBorder={true}
                        />
                        <FieldItem
                            label="Reason"
                            value={data.Reason || '-'}
                            isRow
                            withBorder={true}
                        />

                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold pb-2">
                                Action Details
                            </h4>

                            <FieldItem
                                label="Created By / Date"
                                isRow={true}
                                value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
                                withBorder={data.ModifiedBy !== '' ? true : false}
                            />

                            {data.ModifiedBy !== '' ? (
                                <FieldItem
                                    label="Modified By / Date"
                                    isRow={true}
                                    value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
                                    withBorder={false}
                                />
                            ) : null}

                            {data.LastModifiedBy !== '' ? (
                                <FieldItem
                                    label="Last Modified By / Date"
                                    isRow={true}
                                    value={data.LastModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.LastModifiedDate || '-')}
                                    withBorder={false}
                                />
                            ) : null}
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            {canAction && (
                                <>
                                    <Button
                                        color='gray'
                                        variant='solid'
                                        colorMode="light"
                                        size='sm'
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setIsViewModalOpen(false)
                                            handleDeleteCompOff(data)
                                        }}
                                    >
                                        Delete
                                    </Button>

                                    <Button
                                        color='blue'
                                        size='sm'
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setIsViewModalOpen(false)
                                            handleEditCompOff(data)
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
    //#endregion

    return (
        <>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

                <TableActionToolbar
                    isShowSearchBar={false}
                    isShowCustomizeButton
                    onCustomize={() => setIsShowCustomizeCompOffColumnsModal(true)}
                    // ADD
                    isShowAddButton={canAction}
                    addTitle="Add"
                    onAdd={handleAddCompOffModal}

                    // IMPORT
                    isShowImportButton={canAction}
                    onUploadExcel={handleExportCompOffExcel}
                    onDownloadSampleExcel={handleExportCompOffExcel}

                    // EXPORT
                    isShowExportButton={canExport}
                    onExportExcel={handleExportCompOffExcel}
                    onExportPdf={handleExportCompOffPdf}
                    exportLoading={isLoading}
                />
                <DataTable
                    data={compOffListForTable}
                    columns={visibleCompOffColumns}
                    pagination={compOffPaginationInfo}
                    emptyMessage="No Comp Off found"
                    fixedHeight={true}

                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                />

                <CustomizeColumnsModal
                    isOpen={isShowCustomizeCompOffColumnsModal}
                    onClose={() => setIsShowCustomizeCompOffColumnsModal(false)}
                    onApply={(keys) => {
                        const withRequired = Array.from(
                            new Set([...keys, ...requiredCompOffColumnKeys])
                        );
                        setSelectedCompOffColumnKeys(withRequired);
                        try {

                            localStorage.setItem('compOffTableColumns', JSON.stringify(withRequired));
                        } catch { }
                    }}
                    columns={compOffColumns}
                    selectedKeys={selectedCompOffColumnKeys}
                    requiredKeys={requiredCompOffColumnKeys}
                    title="Customize Table Columns"
                />

                <Modal
                    isOpen={showFilterPopup}
                    onClose={() => setShowFilterPopup(false)}
                    title="Filter - Comp Off"
                    onSubmit={(e) => {
                        e.preventDefault()
                        applyFilters()
                    }}
                    saveText="Apply Filter"
                    cancelText="Clear Filter"
                    onCancel={() => clearFilters()}
                    resetText=''
                    size="small-half"
                >
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <DatePickerInput
                                    label='Start Date'
                                    value={tempFilters.StartDate || ''}
                                    onChange={(value) => handleFilterChange('StartDate', value || '')}
                                />
                            </div>
                            <div>
                                <DatePickerInput
                                    label='End Date'
                                    value={tempFilters.EndDate || ''}
                                    onChange={(value) => handleFilterChange('EndDate', value || '')}
                                />
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* ADD UPDATE COMP OFF MODAL */}
                <DateRangePickerModal
                    key={modalKey}
                    isOpen={isAddUpdateModalOpen}
                    onClose={() => {
                        setIsAddUpdateModalOpen(false);
                        setEditingCompOffData(null);
                        setFormData(initialFormState());
                        setErrors({});
                        setModalKey(prev => prev + 1); // Force modal reset on close
                    }}
                    onConfirm={handleAddUpdateCompOff}
                    onReset={handleResetCompOff}
                    title={editingCompOffData ? 'Update Comp Off' : 'Add Comp Off'}
                    startDate={formData.CompOffDate || null}
                    endDate={formData.RequestDate || null}
                    showTimePicker={false}
                    confirmText="Save"
                    cancelText=""
                    resetText="Reset"
                    loading={isLoading}
                    showSummary={false}
                    renderChildren={({ startDate, endDate, onSelectField, onClearField, editingField }) => {
                        return (
                            <div className="space-y-4">
                                <DateInput
                                    label="Comp Off Date"
                                    value={formatDate_dd_mm_yyyy(startDate) || null}
                                    onChange={(value) => {
                                        const converted = convert_dd_mm_yyyy_To_Yyyy_mm_dd(value);
                                        if (converted !== null) {
                                            onSelectField?.('start');
                                            // Update formData directly
                                            setFormData(prev => ({ ...prev, CompOffDate: converted }));
                                        } else {
                                            onClearField?.('start');
                                            setFormData(prev => ({ ...prev, CompOffDate: null }));
                                        }
                                    }}
                                    onClear={() => {
                                        onClearField?.('start');
                                        setFormData(prev => ({ ...prev, CompOffDate: null }));
                                    }}
                                    isActive={editingField === 'start'}
                                    error={errors.CompOffDate}
                                    showClearButton={true}
                                />
                                <DateInput
                                    label="Request Date"
                                    value={formatDate_dd_mm_yyyy(endDate) || null}
                                    onChange={(value) => {
                                        const converted = convert_dd_mm_yyyy_To_Yyyy_mm_dd(value);
                                        if (converted !== null) {
                                            onSelectField?.('end');
                                            // Update formData directly
                                            setFormData(prev => ({ ...prev, RequestDate: converted }));
                                        } else {
                                            onClearField?.('end');
                                            setFormData(prev => ({ ...prev, RequestDate: null }));
                                        }
                                    }}
                                    onClear={() => {
                                        onClearField?.('end');
                                        setFormData(prev => ({ ...prev, RequestDate: null }));
                                    }}
                                    isActive={editingField === 'end'}
                                    error={errors.RequestDate}
                                    showClearButton={true}
                                />
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-800">Reason</label>
                                    <textarea
                                        value={formData.Reason || ''}
                                        onChange={(e) => setFormData({ ...formData, Reason: e.target.value })}
                                        placeholder="Enter Reason"
                                        maxLength={500}
                                        style={{
                                            width: '100%',
                                            minHeight: 140,
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: errors.Reason ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            outline: 'none',
                                            fontSize: '14px',
                                            lineHeight: 1.5,
                                            resize: 'vertical',
                                        }}
                                    />
                                    {errors.Reason && (
                                        <p className="text-sm text-red-500">{errors.Reason}</p>
                                    )}
                                </div>
                            </div>
                        );
                    }}
                />

                {/* VIEW COMP OFF DETAILS MODAL */}
                <ViewCompOffDetailsModal
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false)
                        setViewingCompOffData(null)
                    }}
                    data={viewingCompOffData}
                />

            </div>
        </>
    )
}


export default CompOff
