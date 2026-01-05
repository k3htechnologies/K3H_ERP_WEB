import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
    DeleteLitigationRequest,
    FilterWithPaginationLitigationRequest,
    LitigationData
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
import { LitigationService } from '../services/LitigationService';


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

    //DELETE Litigation MASTER
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
            loadLitigation(listState.page ?? 1, { Name: String(listState.searchTerm).trim() });
            return;
        }

        loadLitigation(listState.page ?? 1, listState.filters ?? {});
    }, [location.state]);

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

                const response = await LitigationService.apiCallPullLitigation(params);
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

    //#region CLEAR LITIGATION MASTER 
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
    const handleExportLitigation = async (exportType: 'Excel' | 'PDF') => {
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

                const response = await getLitigation(params);

                handleExportFile(response, exportType, 'Litigation', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportLitigationExcel = () => handleExportLitigation('Excel')
    const handleExportLitigationPdf = () => handleExportLitigation('PDF')
    //#endregion

    //#region IMPORT EXCEL | DOWNLOAD

    const excelImportChannelPartner = async () => {

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


    const downloadExcelSampleChannelPartner = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                // Find the column label for sorting
                const params: FilterPullExcelSample = {
                    TableName: 'LITIGATION'
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

    const handleExcelImportChannelPartner = () => excelImportChannelPartner()
    const handleDownloadExcelSampleChannelPartner = () => downloadExcelSampleChannelPartner()
    //#endregion

    //#region API | SERVICES CALL TO GET LITIGATION
    const getLitigation = async (filterParams: FilterWithPaginationLitigationRequest) => {

        return await LitigationService.apiCallPullLitigation(filterParams);
    }
    //#endregion

    //#region HANDLE PAGE CHNAGE EVENT
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
    const ChannelPartnerPaginationInfo: PaginationInfo = useMemo(
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
                editChannelPartnerData: row,
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
    const handleAddChannelPartnerModal = useCallback(() => {
        navigate('/litigation/add', {
            state: {
                fromList: true,
                listState: { page: pagination.currentPage, filters, sortInfo, searchTerm }
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
            key: 'DateOfFilling',
            label: 'Date Of Filling',
            width: '12',
            sortable: false,
            align: 'center',
            render: (value) => value || '-'
        },


        {
            key: 'actions',
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
                            title="Delete Litigation"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ) : null
            )
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
                // Ensure required columns are always present

                const withRequired = Array.from(new Set([...parsed, ...requiredLitigationColumnKeys]));

                // Filter out any keys that no longer exist
                return withRequired.filter(k => allLitigationColumnKeys.includes(k));
            }
        } catch { }
        return allLitigationColumnKeys;
    });

    useEffect(() => {
        setSelectedLitigationColumnKeys(prev => Array.from(new Set([...prev, ...requiredLitigationColumnKeys])).filter(k => allLitigationColumnKeys.includes(k)));

        // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // reset page
        setPagination({ currentPage: 1 });

        // load empty filters
        loadLitigation(1, {});

        setShowFilterPopup(false);
        // clear router state (very important)

        navigate(location.pathname, { replace: true, state: {} });

    };
    //#endregion

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region DELETE LITIGATION MASTER
    const handleDeleteChannelPartner = async () => {

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

                const response = await LitigationService.apiCallDeleteLitigation(params);

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
                onAdd={handleAddChannelPartnerModal}

                // IMPORT
                isShowImportButton={canAction}
                onUploadExcel={handleExcelImportChannelPartner}
                onDownloadSampleExcel={handleDownloadExcelSampleChannelPartner}

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
                pagination={ChannelPartnerPaginationInfo}
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

            {/* DELETE CONFIRMATION  Litigation MODAL */}
            <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => setIsConfirmationDialogBoxOpen(false)}
                onConfirm={handleDeleteChannelPartner}
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
