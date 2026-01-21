import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
    CompanyMasterData,
    DeleteCompanyMasterRequest,
    FilterWithPaginationCompanyMasterRequest
} from '@/features/companyMaster/models/CompanyMasterModel';

import { companyMasterService } from '@/features/companyMaster/services/CompanyMasterService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useNavigate } from 'react-router-dom';
import { useCompanyListState } from '@/features/companyMaster/context/CompanyListStateContext';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { Button, Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { Trash2 } from 'lucide-react';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const CompanyMaster: React.FC = () => {
    //#region STATE
    const [companyList, setCompanyList] = useState<CompanyMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();

    const { listState, updateListState } = useCompanyListState();
    const { pagination, setPagination } = usePagination(listState.pageSize);
    const sortInfo = listState.sortInfo;
    const searchTerm = listState.searchTerm;
    const filters = listState.filters;

    const { addToast } = useToast();

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchCompanys(value);
    }, 350);

    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const [isShowCustomizeCompanyColumnsModal, setIsShowCustomizeCompanyColumnsModal] = useState(false);

    //EXCEL IMPORT 
    const [showImportModal, setShowImportModal] = useState(false);

    const { canAction, canExport } = useMenuPermissions();


    //DELETE COMPANY MASTER STATES

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

    const [deleteCompanyMasterDetailsData, setDeleteCompanyMasterDetailsData] = useState<CompanyMasterData | null>(null)

    //#endregion

    //#region INIT
    useEffect(() => {
        // Sync pagination with context state
        setPagination({ currentPage: listState.page });

        // Load companies with current context state
        if (listState.searchTerm && String(listState.searchTerm).trim()) {
            loadCompanys(listState.page, { CompanyName: String(listState.searchTerm).trim() }, listState.sortInfo);
        } else {
            loadCompanys(listState.page, listState.filters, listState.sortInfo);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);



    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.();
        };
    }, [debouncedSearch]);
    //#endregion

    //#region DATA LOAD
    const fetchCompanyList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadCompanys(page, filters, sort ?? sortInfo);
    };

    const loadCompanys = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {


                const params: FilterWithPaginationCompanyMasterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    IsCheckPermission: true,
                    CompanyId: filterParams.CompanyId ? Number(filterParams.CompanyId) : undefined,
                    CompanyName: searchtext ?? filterParams.CompanyName?.trim() ?? undefined,
                    CompanyType: filterParams.CompanyType?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, companyColumns)
                };

                const response = await companyMasterService.apiCallPullCompanyMaster(params);

                if (E.isRight(response)) {

                    setCompanyList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Company Data'
        );
    };

    //#endregion

    //#region SEARCH COMPANY FILTER
    const searchCompanys = async (searchValue: string) => {
        updateListState({ searchTerm: searchValue });

        if (searchValue.trim() === '') {
            updateListState({ filters: {}, page: 1 });
            fetchCompanyList();
            return;
        }

        updateListState({ filters, page: 1, searchTerm: searchValue });
        await loadCompanys(1, filters, sortInfo, searchValue)
    };


    //#endregion

    //#region CLEAR SEARCH COMPANY
    const clearSearchCompanys = () => {
        debouncedSearch.cancel?.();
        updateListState({ searchTerm: '', filters: {}, page: 1 });
        setTempFilters({});
        loadCompanys(1, { CompanyName: '' }, sortInfo, undefined);
    };

    //#endregion

    //#region  EXCEL EXPORT TO EXCEL | PDF
    const handleExportCompanys = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationCompanyMasterRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsCheckPermission: true,
                    CompanyName: filters.CompanyName?.trim() || undefined,
                    CompanyType: filters.CompanyType?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, companyColumns),
                    ExportType: exportType
                };

                const response = await companyMasterService.apiCallPullCompanyMaster(params);

                handleExportFile(response, exportType, 'Company Master', addToast);

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' });
            },
            undefined,
            'Preparing Export...'
        );
    };

    const handleExportCompanyExcel = () => handleExportCompanys('Excel');
    const handleExportCompanyPdf = () => handleExportCompanys('PDF');

    //#endregion

    //#region TABLE CONFIG
    const handlePageChange = useCallback((page: number) => {
        updateListState({ page });
        fetchCompanyList(page);
    }, [updateListState]);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
        loadCompanys(1, filters, sort, searchTerm || undefined);
    }, [filters, updateListState, searchTerm]);

    const companyPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const companysForTable = useMemo(() => companyList, [companyList]);
    //#endregion

    //#region VIEW COMPANY MASTER

    const handleViewCompanyDetails = useCallback((row: CompanyMasterData) => {
        updateListState({ companyId: row.CompanyId, companyName: row.CompanyName });
        navigate('/companyMaster/view');
    }, [navigate, updateListState]);
    //#endregion

    //#region CONFIRMATION DIALOG BOX

    const handleConfirmationDialogBoxOpen = (row: CompanyMasterData) => {
        setDeleteCompanyMasterDetailsData(row)
        setIsConfirmationDialogBoxOpen(true)
    }
    //#endregion


    //#region TABLE COLUMN
    const companyColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'CompanyName',
                label: 'Company Name',
                width: '22',
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value, row) => (
                    <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>

                        <TooltipText
                            text={value || '-'}
                            maxWidth="250px"
                            tooltipThreshold={30}
                            onClick={() => handleViewCompanyDetails(row)}
                            
                        />

                    </div>
                )
            },
            {
                key: 'CompanyType',
                label: 'Company Type',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            },
            {
                key: 'ContactPerson',
                label: 'Contact Person',
                width: '18',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'MobileNumber',
                label: 'Mobile Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: value => value ? `+91 ${value}` : '-'
            },
            {
                key: 'LandLineNumbereee',
                label: 'Land Line Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            },
            {
                key: 'EmailId',
                label: 'Email',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },

            {
                key: 'GSTNumber',
                label: 'GST Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.GSTCertificateURL)}
                            title="GST Document"
                            triggerLabel={value || '-'}
                            isWrap={false}
                        />
                    );
                }
            },
            {
                key: 'PANNumber',
                label: 'Pan Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {

                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.PanCardURL)}
                            title="Pan Card Document"
                            triggerLabel={value || '-'}
                            isWrap={false}
                        />
                    );
                }
            },
            {
                key: 'CINNumber',
                label: 'CIN Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.CINURL)}
                            title="CIN Document"
                            triggerLabel={value || '-'}
                            isWrap={false}
                        />
                    );
                }
            },

            {
                key: 'RERANumber',
                label: 'RERA Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            },

            {
                key: 'StateName',
                label: 'State',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            },
            {
                key: 'DistrictName',
                label: 'District',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            },
            {
                key: 'CityName',
                label: 'City',
                width: '15',
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
                    canAction && !row.NumberOfEmployee ? (
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
                                title="Delete Company"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null
                )
            }
        ],
        [canAction, handleViewCompanyDetails, handleConfirmationDialogBoxOpen]

    );
    //#endregion

    //#region CUSTOMIZE COLUMNS
    const requiredCompanyColumnKeys: string[] = ['CompanyName'];

    const allCompanyColumnKeys: string[] = companyColumns.map(c => c.key);

    const [selectedCompanyColumnKeys, setSelectedCompanyColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getCompanyMasterTableColumns?.();
            if (saved) {
                const parsed = JSON.parse(saved) as string[];
                const withRequired = Array.from(new Set([...parsed, ...requiredCompanyColumnKeys]));
                return withRequired.filter(k => allCompanyColumnKeys.includes(k));
            }
        } catch {
            // ignore
        }
        return allCompanyColumnKeys;
    });

    useEffect(() => {
        setSelectedCompanyColumnKeys(prev =>
            Array.from(new Set([...prev, ...requiredCompanyColumnKeys])).filter(k =>
                allCompanyColumnKeys.includes(k)
            )
        );

    }, [companyColumns.length]);

    const visibleCompanyColumns = useMemo(
        () => companyColumns.filter(col => selectedCompanyColumnKeys.includes(col.key)),
        [companyColumns, selectedCompanyColumnKeys]
    );
    //#endregion

    //#region FILTER HELPERS
    const applyFilters = () => {
        updateListState({ filters: tempFilters, page: 1 });
        loadCompanys(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        updateListState({ filters: {}, page: 1 });
        loadCompanys(1, {});
        setShowFilterPopup(false);
    };
    //#endregion

    //#region ADD NEW EMPLOYEE
    const handleAddCompanyModal = () => {
        navigate('/companyMaster/add');
    };
    //#endregion

    //#region  HANDLE CHANGE EVENT

    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    };

    //#endregion

    //#region IMPORT EXCEL | DOWNLOAD

    const downloadExcelSampleCompanyMaster = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                // Find the column label for sorting

                const params: FilterPullExcelSample = {
                    TableName: 'COMPANY MASTER'
                }

                const response = await technicalService.apiCallPullExcelSample(params);

                handleExportFile(response, 'Excel', 'Company Master', addToast, 'Sample file download successfully')

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

    const handleDownloadExcelSampleCompanyMaster = () => downloadExcelSampleCompanyMaster()

    const uploadExcel = async (file: File, mergeExisting: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const fd = new FormData();

                fd.append("ExcelFile", file);
                fd.append("IsAllDelete", mergeExisting);
                fd.append("TableName", 'COMPANY MASTER');

                const response = await technicalService.apiCallExcelImport(fd);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: "Excel imported sucessfully" })

                    fetchCompanyList();

                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (err: any) => addToast({ type: "error", title: err.message }),
            undefined,
            "Importing Excel"
        );
    };
    //#endregion

    //#region DELETE COMPANY MASTER

    const handleDeleteCompanyMaster = async () => {
        if (!deleteCompanyMasterDetailsData) return
        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {

                const params: DeleteCompanyMasterRequest = {
                    CompanyId: deleteCompanyMasterDetailsData.CompanyId,
                    Uniquekey: deleteCompanyMasterDetailsData.Uniquekey
                }

                const response = await companyMasterService.apiCallDeleteCompanyMaster(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (companyList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });

                    await loadCompanys(pageToShow, filters, sortInfo, searchTerm);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteCompanyMasterDetailsData(null);

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
            'Delete Company'
        )
    }

    //#endregion

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Company Name"
                onSearchChange={v => {
                    updateListState({ searchTerm: v });
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchCompanys}
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeCompanyColumnsModal(true)}
                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddCompanyModal}

                // IMPORT
                isShowImportButton={canAction}
                onUploadExcel={() => setShowImportModal(true)}
                onDownloadSampleExcel={handleDownloadExcelSampleCompanyMaster}

                // EXPORT
                isShowExportButton={canExport && companysForTable.length > 0}
                onExportExcel={handleExportCompanyExcel}
                onExportPdf={handleExportCompanyPdf}
                exportLoading={isLoading}
            />

            <DataTable
                data={companysForTable}
                columns={visibleCompanyColumns}
                pagination={companyPaginationInfo}
                emptyMessage="No companys Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeCompanyColumnsModal}
                onClose={() => setIsShowCustomizeCompanyColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(new Set([...keys, ...requiredCompanyColumnKeys]));
                    setSelectedCompanyColumnKeys(withRequired);
                    try {
                        LocalStorageHelper.storeCompanyMasterTableColumns?.(JSON.stringify(withRequired));
                    } catch {
                        // ignore
                    }
                }}
                columns={companyColumns}
                selectedKeys={selectedCompanyColumnKeys}
                requiredKeys={requiredCompanyColumnKeys}
                title="Customize Table Columns"
            />

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Company Master"
                onSubmit={e => {
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
                                label='Company Name'
                                type="text"
                                value={tempFilters.CompanyName || ''}
                                onChange={(e) => handleFilterChange('CompanyName', e.target.value)}
                                placeholder="Enter Company Name"

                            />
                        </div>
                        <div>

                            <Input
                                label='Company Type'
                                type="text"
                                value={tempFilters.CompanyType || ''}
                                onChange={(e) => handleFilterChange('CompanyType', e.target.value)}
                                placeholder="Enter Company Type"
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION COMPANY MODAL */}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteCompanyMasterDetailsData(null)
                }}
                onConfirm={handleDeleteCompanyMaster}
                loading={isLoading}
                pageName='company'
            />

            <ExportImport
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onUpload={(file, mergeExisting) => {
                    setShowImportModal(false);
                    uploadExcel(file, mergeExisting);
                }}
            />
        </div>

    );
};

export default CompanyMaster;
