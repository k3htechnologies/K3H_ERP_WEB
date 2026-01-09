import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
    DeleteLitigationRequest,
    FilterWithPaginationLitigationRequest,
    LitigationData,
} from '@/features/litigation/models/LitigationModel';

import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateFilter } from '@/core/utils/filterHelper';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Trash2 } from 'lucide-react';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { litigationService } from '../services/LitigationServices';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { getStatuscolor } from './Status';

export const Litigation: React.FC = () => {

    //#region STATE MANAGEMENT
    const [litigationList, setLitigationList] = useState<LitigationData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');

    // USE NAVIGATE
    const navigate = useNavigate();

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);

    //TABLE SORT INFO
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    // TOAST
    const { addToast } = useToast();

    const { projectId } = useProject();

    // SINGLE SEARCH TEXT BOX
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useDebouncedCallback((value: string) => {

        searchLitigation(value)
    }, 350);

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [filters, setFilters] = useState<FilterInfo>({});
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    //DELETE LITIGATION 
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteLitigationDetailsData, setDeleteLitigationDetailsData] = useState<LitigationData | null>(null)

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeLitigationColumnsModal, setIsShowCustomizeLitigationColumnsModal] = useState(false);

    //#region MENU PERMISSIONS
    const { canAction, canExport } = useMenuPermissions();
    //#endregion

    const location = useLocation() as any;
    //#endregion

    //#region INIT
    useEffect(() => {
        const incoming = location.state?.listState;

        const listState = incoming ?? {
            page: 1, filters:
                {} as FilterInfo,
            sortInfo: undefined,
            searchTerm: ''
        };

        setPagination({ currentPage: listState.page ?? pagination.currentPage });

        setSortInfo(listState.sortInfo);

        setFilters(listState.filters ?? {});

        setTempFilters(listState.filters ?? {});

        setSearchTerm(listState.searchTerm ?? '');

        if (listState.searchTerm && String(listState.searchTerm).trim()) {
            loadLitigation(listState.page ?? 1, { Title: String(listState.searchTerm).trim() });
            return;
        }

        loadLitigation(listState.page ?? 1, listState.filters ?? {});
    }, [location.state, projectId]);

    //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 
    const fetchLitigationList = async (page: number = pagination.currentPage) => {
        return await loadLitigation(page, filters);
    }

    const loadLitigation = async (page: number, filterParams: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                let sortByParam = undefined;

                if (sortInfo) {

                    const column = LitigationColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }
                const params: FilterWithPaginationLitigationRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    LitigationId: filterParams.LitigationId ? Number(filterParams.LitigationId) : undefined,
                    Title: filterParams.Title?.trim() || undefined,
                    SortBy: sortByParam,
                    ProjectId: Number(projectId),
                };

                const response = await litigationService.apiCallPullLitigation(params);
                if (E.isRight(response)) {

                    setLitigationList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Litigation'
        );
    };
    //#endregion

    //#region SEARCH & CLEAR
    const searchLitigation = async (searchValue: string) => {

        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {

            fetchLitigationList();
            return
        }

        const filterParams: FilterInfo = {
            Title: searchValue.trim(),
        };

        await loadLitigation(1, filterParams);
    };

    //#endregion

    //#region CLEAR LITIGATION  
    const clearSearchLitigation = () => {
        setSearchTerm('');

        debouncedSearch.cancel?.();
        setFilters({});
        setTempFilters({});
        setPagination({ currentPage: 1 });
        loadLitigation(1, {});
        try {
            navigate(location.pathname, {
                replace: true,
                state: {}
            });
        } catch {
        }
    };
    //#endregion

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportLitigation = useCallback(async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                let sortByParam = undefined
                if (sortInfo) {
                    const column = LitigationColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }
                const params: FilterWithPaginationLitigationRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    Title: filters.Title?.trim() || undefined,
                    ProjectId: Number(projectId),
                    SortBy: sortByParam,
                    ExportType: exportType
                };

                const response = await litigationService.apiCallPullLitigation(params);

                handleExportFile(response, exportType, 'Litigation', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    }, [projectId, pagination.pageSize, addToast]);

    const handleExportLitigationExcel = () => handleExportLitigation('Excel')
    const handleExportLitigationPdf = () => handleExportLitigation('PDF')
    //#endregion

    //#region IMPORT EXCEL | DOWNLOAD

    const excelImportLitigation = async () => {

        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,

            async () => {
                return null;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Import failed' })
            },
            undefined,
            'Preparing Import'
        )
    }

    const downloadExcelSampleLitigation = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                // Find the column label for sorting
                const params: FilterPullExcelSample = {
                    TableName: 'Litigation'
                }

                const response = await technicalService.apiCallPullExcelSample(params);

                handleExportFile(response, 'Excel', 'Litigation ', addToast, 'Sample file download successfully')

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Downloading'
        )
    }
    const handleExcelImportLitigation = () => excelImportLitigation()
    const handleDownloadExcelSampleLitigation = () => downloadExcelSampleLitigation()
    //#endregion


    //#region HANDLE PAGE CHNAGE 
    const handlePageChange = useCallback((page: number) => {
        fetchLitigationList(page);
    }, []);


    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sortInfo: SortInfo) => {

        setSortInfo(sortInfo);

        fetchLitigationList(1);

    }, []);
    //#endregion

    //#region TABLE PAGINATION INFO
    const LitigationPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const LitigationForTable = useMemo(() => litigationList, [litigationList]);
    //#endregion

    //#region NAVIGATE TO  VIEW LITIGATION
    const handleNavigateToView = (row: LitigationData) => {
        navigate('/litigation/view', {
            state: {
                editLitigationData: row,
                listState: {
                    page: pagination.currentPage,
                    filters,
                    sortInfo,
                    searchTerm
                }
            }
        });
    };

    //#region NAVIGATE TO ADD LITIGATION
    const handleAddLitigationModal = useCallback(() => {
        navigate('/litigation/add', {
            state: {
                fromList: true,
                listState: {
                    page: pagination.currentPage,
                    filters, sortInfo,
                    searchTerm
                }
            }
        });
    }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
    //#endregion

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: LitigationData) => {
        setDeleteLitigationDetailsData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    //#region TABLE COLUMNS
    const LitigationColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'Title',
            label: 'Title',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleNavigateToView(row)}
                />
            )
        },
        {
            key: 'CaseNumber',
            label: 'Case Number',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={25}
                />
            )
        },
        {
            key: 'CaseType',
            label: 'Case Type',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'HearingDate',
            label: 'Hearing Date',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'ClosureDate',
            label: 'Closure Date',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'DateOfFilling',
            label: 'Date Of Filling',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value?: string) =>
                value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'Status',
            label: 'Status',
            width: '14',
            sortable: false,
            align: 'left',
            render: (value) => {
                const { bg, text } = getStatuscolor(value);

                return (
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: bg,
                            color: text
                        }}
                    >
                        {value || "-"}
                    </span>
                );
            }
        },
        {
            key: 'CourtName',
            label: 'Court Name',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'CourtLocation',
            label: 'Court Location',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'CourtType',
            label: 'Court Type',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'Plantiff',
            label: 'Plantiff',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'Defendant',
            label: 'Defendant',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'AssignedRepresentative',
            label: 'Assigned Representative',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'OpposingRepresentative',
            label: 'Opposing Representative',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'CaseBrief',
            label: 'Case Brief',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'Remark',
            label: 'Remark',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || 'N/A'}
                    maxWidth="170px"
                    tooltipThreshold={15}
                />
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => {

                return canAction && row?.Status?.toLowerCase() === 'open' ? (
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleConfirmationDialogBoxOpen(row);
                        }}
                        color="transparent"
                        isborderRadius
                        size="sm"
                        style={{ color: 'red', padding: '4px 8px' }}
                        title="Delete Litigation"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                ) : null;

            }
        }
    ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);
    //#endregion

    //#region COLUMN CUSTOMIZATION
    const requiredLitigationColumnKeys: string[] = ['Title', 'actions'];

    const allLitigationColumnKeys: string[] = LitigationColumns.map(c => c.key);

    const [selectedLitigationColumnKeys, setSelectedLitigationColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getLitigationTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredLitigationColumnKeys]));

                return withRequired.filter(k => allLitigationColumnKeys.includes(k));
            }
        } catch { }
        return allLitigationColumnKeys;
    });

    useEffect(() => {
        setSelectedLitigationColumnKeys(prev => Array.from(new Set([...prev, ...requiredLitigationColumnKeys])).filter(k => allLitigationColumnKeys.includes(k)));

    }, [LitigationColumns.length])

    const visibleLitigationColumns = useMemo(

        () => LitigationColumns.filter(col => selectedLitigationColumnKeys.includes(col.key)),

        [LitigationColumns, selectedLitigationColumnKeys]
    );
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);

        loadLitigation(1, tempFilters);

        setShowFilterPopup(false);
    };
    //#endregion

    //#region CLEAR FILTER
    const clearFilters = () => {
        setTempFilters({});

        setFilters({});

        setPagination({ currentPage: 1 });

        loadLitigation(1, {});
        setShowFilterPopup(false);

        navigate(location.pathname, { replace: true, state: {} });

    };
    //#endregion

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region DELETE LITIGATION 
    const handleDeleteLitigation = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteLitigationDetailsData) return;

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,
            async () => {
                const params: DeleteLitigationRequest = {

                    LitigationId: deleteLitigationDetailsData.LitigationId || 0,

                    Uniquekey: deleteLitigationDetailsData.Uniquekey || "",

                    ProjectId: deleteLitigationDetailsData.ProjectId || 0
                };

                const response = await litigationService.apiCallDeleteLitigation(params);

                if (E.isRight(response)) {

                    setLitigationList(prevData => prevData.filter(item => item.LitigationId !== deleteLitigationDetailsData.LitigationId));

                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });
                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteLitigationDetailsData(null);

                } else {

                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);

                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Litigation"
        );
    };
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Title"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchLitigation}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeLitigationColumnsModal(true)}

                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddLitigationModal}

                // IMPORT
                isShowImportButton={canAction}
                onUploadExcel={handleExcelImportLitigation}
                onDownloadSampleExcel={handleDownloadExcelSampleLitigation}

                // EXPORT
                isShowExportButton={canExport}
                onExportExcel={handleExportLitigationExcel}
                onExportPdf={handleExportLitigationPdf}
                exportLoading={isLoading}
            />

            {/* DATA TABLE LITIGATION*/}
            <DataTable
                data={LitigationForTable}
                columns={visibleLitigationColumns}
                pagination={LitigationPaginationInfo}
                emptyMessage="No Litigation found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* CUSTOMIZE COLUMNS MODAL */}

            <CustomizeColumnsModal
                isOpen={isShowCustomizeLitigationColumnsModal}
                onClose={() => setIsShowCustomizeLitigationColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(

                        new Set([...keys, ...requiredLitigationColumnKeys])
                    );
                    setSelectedLitigationColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeLitigationTableColumns?.(

                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={LitigationColumns}
                selectedKeys={selectedLitigationColumnKeys}
                requiredKeys={requiredLitigationColumnKeys}
                title="Customize Table Columns"
            />

            {/* FILTER LITIGATION MODAL */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Litigation "
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply Filter"
                cancelText="Clear Filter"
                onCancel={() => clearFilters()}
                resetText=''
                size="small-half"
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Input type="text"
                            label='Title'
                            value={tempFilters?.Title ?? ''}
                            onChange={e => handleFilterChange('Title', e.target.value)}
                            placeholder="Enter Title" />
                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION  LITIGATION MODAL */}
            <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => setIsConfirmationDialogBoxOpen(false)}
                onConfirm={handleDeleteLitigation}
                title="You are about to delete this Litigation?"
                message="Deleting this Litigation will permanently remove its data."
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
                variant="danger"
            />

        </div>

    );
};

export default Litigation;
