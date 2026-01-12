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

import { CompanyMasterService } from '@/features/companyMaster/services/CompanyMasterService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import type { FilterPullExcelSample } from '@/features/technical/models/TechnicalModel';
import { technicalService } from '@/features/technical/services/TechnicalService';
import { Button, Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';

export const CompanyMaster: React.FC = () => {
    //#region STATE
    const [companyList, setCompanyList] = useState<CompanyMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const navigate = useNavigate();

    const { pagination, setPagination } = usePagination(20);
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    const { addToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchCompanys(value);
    }, 350);

    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [filters, setFilters] = useState<FilterInfo>({});
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});

    const [isShowCustomizeCompanyColumnsModal, setIsShowCustomizeCompanyColumnsModal] = useState(false);

    //EXCEL IMPORT 
    const [showImportModal, setShowImportModal] = useState(false);

    const { canAction, canExport } = useMenuPermissions();

    const location = useLocation() as Location & {
        state?: {
            listState?: {
                page?: number;
                filters?: FilterInfo;
                sortInfo?: SortInfo;
                searchTerm?: string;
            };
        };
    };


    //DELETE COMPANY MASTER STATES

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

    const [deleteCompanyMasterDetailsData, setDeleteCompanyMasterDetailsData] = useState<CompanyMasterData | null>(null)

    //#endregion

    //#region INIT
    useEffect(() => {

        const incoming = location.state?.listState as
            | { page?: number; filters?: FilterInfo; sortInfo?: SortInfo; searchTerm?: string }
            | undefined;

        const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: '' };


        setPagination({ currentPage: listState.page ?? pagination.currentPage });

        setSortInfo(listState.sortInfo);

        setFilters(listState.filters ?? {});

        setTempFilters(listState.filters ?? {});

        setSearchTerm(listState.searchTerm ?? '');

        if (listState.searchTerm && String(listState.searchTerm).trim()) {

            setSearchTerm(String(listState.searchTerm));

            loadCompanys(listState.page ?? 1, { CompanyName: String(listState.searchTerm).trim() }, listState.sortInfo);

            return;
        }


        loadCompanys(listState.page ?? 1, listState.filters ?? {}, listState.sortInfo);

    }, [location.state]);



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

    const loadCompanys = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                let sortByParam: string | undefined;

                if (sortInfo) {
                    const column = companyColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }

                const params: FilterWithPaginationCompanyMasterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    IsCheckPermission: true,
                    CompanyId: filterParams.CompanyId ? Number(filterParams.CompanyId) : undefined,
                    CompanyName: filterParams.CompanyName?.trim() || undefined,
                    CompanyType: filterParams.CompanyType?.trim() || undefined,
                    SortBy: sortByParam
                };

                const response = await getCompanys(params);

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

    //#region SEARCH EMPLOYEE FILTER
    const searchCompanys = async (searchValue: string) => {
        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {
            fetchCompanyList();
            return;
        }

        const filterParams: FilterInfo = {
            CompanyName: searchValue.trim()
        };

        await loadCompanys(1, filterParams);
    };


    //#endregion

    //#region CLAER SERACH EMPLOYEE
    const clearSearchCompanys = () => {
        setSearchTerm('');

        debouncedSearch.cancel?.();

        setFilters({});
        setTempFilters({});
        setPagination({ currentPage: 1 });
        loadCompanys(1, {});
        try {
            navigate(location.pathname, { replace: true, state: {} });
        } catch {
        }
    };

    //#endregion

    //#region  EXCEL EXPORT TO EXCEL | PDF
    const handleExportCompanys = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                let sortByParam: string | undefined;
                if (sortInfo) {
                    const column = companyColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }

                const params: FilterWithPaginationCompanyMasterRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsCheckPermission: true,
                    CompanyName: filters.CompanyName?.trim() || undefined,
                    CompanyType: filters.CompanyType?.trim() || undefined,
                    SortBy: sortByParam,
                    ExportType: exportType
                };

                const response = await getCompanys(params);

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

    //#region PULL EMPLOYEE MASTER
    const getCompanys = async (filterParams: FilterWithPaginationCompanyMasterRequest) => {
        return await CompanyMasterService.apiCallPullCompanyMaster(filterParams);
    };
    //#endregion

    //#region TABLE CONFIG
    const handlePageChange = useCallback((page: number) => {
        fetchCompanyList(page);
    }, []);

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadCompanys(1, filters, sort);
    }, [filters]);

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

    //#region VIEW EMPLOYEE MASTER

    const handleViewCompanyDetails = useCallback((row: CompanyMasterData) => {
        navigate('/companyMaster/view', {
            state: {
                editCompanyMasterData: row,
                fromList: true,
                listState: {
                    page: pagination.currentPage,
                    filters,
                    sortInfo,
                    searchTerm,
                    companyName:row.CompanyName
                },
            },
        });
    }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
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
                            text={value || 'N/A'}
                            maxWidth="250px"
                            tooltipThreshold={30}
                            onClick={() => handleViewCompanyDetails(row)}
                        />

                    </div>
                )
            },
            {
                key: 'ContactPerson',
                label: 'Contact Person',
                width: '18',
                sortable: false,
                align: 'left',
                render: (value) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="180px"
                        tooltipThreshold={18}
                    />
                )
            },
            {
                key: 'MobileNumber',
                label: 'Mobile Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
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
                render: (value) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="200px"
                        tooltipThreshold={20}
                    />
                )
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
    const requiredCompanyColumnKeys: string[] = ['FullName'];

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
        setFilters(tempFilters);
        loadCompanys(1, tempFilters);
        setShowFilterPopup(false);
    };

    const clearFilters = () => {
        setTempFilters({});
        setFilters({});

        // reset page
        setPagination({ currentPage: 1 });

        // load empty filters
        loadCompanys(1, {});

        setShowFilterPopup(false);

        // clear router state (very important)
        navigate(location.pathname, { replace: true, state: {} });
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
            setIsLoadingMessage,
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
            setIsLoadingMessage,
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

            setIsLoadingMessage,

            async () => {

                const params: DeleteCompanyMasterRequest = {
                    CompanyId: deleteCompanyMasterDetailsData.CompanyId,
                    Uniquekey: deleteCompanyMasterDetailsData.Uniquekey
                }

                const response = await CompanyMasterService.apiCallDeleteCompanyMaster(params);

                if (E.isRight(response)) {

                    setCompanyList(prevData => prevData.filter(item => item.CompanyId !== deleteCompanyMasterDetailsData.CompanyId));

                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });

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
                    setSearchTerm(v);
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
                saveText="Apply Filter"
                cancelText="Clear Filter"
                onCancel={() => clearFilters()}
                resetText=''
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
                                placeholder="Enter company Name"

                            />
                        </div>
                        <div>

                            <Input
                                label='Company Type'
                                type="text"
                                value={tempFilters.CompanyType || ''}
                                onChange={(e) => handleFilterChange('CompanyType', e.target.value)}
                                placeholder="Enter company Type"
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION COMPANY MODAL */}
            <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteCompanyMasterDetailsData(null)
                }}
                onConfirm={handleDeleteCompanyMaster}
                title="You are about to delete a company?"
                message="Deleting this company will permanently remove its contents."
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
                variant="danger"
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
