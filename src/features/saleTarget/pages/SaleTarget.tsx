import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { saleTargetService } from "../services/SaleTargetService";
import * as E from 'fp-ts/Either';
import type { FilterWithPaginationSaleTargetRequest, SaleTargetData } from "../models/SaleTargetModel";
import usePagination from "@/core/hooks/usePagination";
import { useToast } from "@/core/hooks/useToast";
import { TableActionToolbar } from "@/ui/components/TableAction/TableActionToolbar";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate } from "react-router-dom";
import { handleExportFile } from "@/core/utils/exportFile";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { Modal } from "@/ui/components/Modal/Modal";
import { updateFilter } from "@/core/utils/filterHelper";
import { Input } from "@/ui/components/forms";


export const SaleTarget: React.FC = () => {

    //STATE
    const [saleTargetList, setSaleTargetList] = useState<SaleTargetData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);

    // TOAST
    const { addToast } = useToast();

    //CUSTOMIZE COLUMN MODAL
    const [isShowCustomizeSaleTargetColumnsModal, setIsShowCustomizeSaleTargetColumnsModal] = useState(false);

    //FILTER STATES
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    //#region MENU PERMISSIONS
    const { canExport, canAction } = useMenuPermissions();
    //#endregion

    //#region NAVIGATE
    const navigate = useNavigate();

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject()
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 
    const loadSaleTarget = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationSaleTargetRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    EmployeeName: searchText?.trim() || undefined,
                    MobileNumber: filterParams.MobileNumber ? Number(filterParams.MobileNumber) : undefined,
                    TargetMonth: filterParams.TargetMonth ? filterParams.TargetMonth : undefined,
                    SortBy: getSortByParam(sort ?? null, SaleTargetColumns),
                };

                const response = await saleTargetService.apiCallPullSaleTarget(params);

                if (E.isRight(response)) {

                    setSaleTargetList(response.right.Data);
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
            'Loading Sale Target'
        );
    }, [projectId, pagination.pageSize, addToast]);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return
        loadSaleTarget(1, filters, sortInfo, searchTerm);
    }, [projectId]);
    //#endregion

    //#region EXPORT / IMPORT EXCEL AND PDF
    const handleExportSaleTarget = useCallback(async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationSaleTargetRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId),
                    EmployeeName: filters.EmployeeName?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, SaleTargetColumns),
                    ExportType: exportType
                };

                const response = await saleTargetService.apiCallPullSaleTarget(params);

                handleExportFile(response, exportType, 'Sale Target', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    }, [projectId, pagination.pageSize, addToast]);

    const handleExportSaleTargetExcel = () => handleExportSaleTarget('Excel')
    const handleExportSaleTargetPdf = () => handleExportSaleTarget('PDF')
    //#endregion


    //#region TABLE COLUMNS
    const SaleTargetColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'EmployeeName',
            label: 'Employee Name',
            width: '16',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'MobileNumber',
            label: 'Mobile Number',
            width: '16',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'AchievedTarget',
            label: 'Achieved Target',
            width: '16',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'PlannedTarget',
            label: 'Planned Target',
            width: '16',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'TargetMonth',
            label: 'Target Month',
            width: '16',
            sortable: false,
            align: 'center',
            render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
    ], [])
    //#endregion

    //#region COLUMN CUSTOMIZATION
    const requiredSaleTargetColumnKeys: string[] = ['EmployeeName'];

    const allSaleTargetColumnKeys: string[] = SaleTargetColumns.map(c => c.key);

    const [selectedSaleTargetColumnKeys, setSelectedSaleTargetColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getSaleTargetTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([...parsed, ...requiredSaleTargetColumnKeys]));

                return withRequired.filter(k => allSaleTargetColumnKeys.includes(k));
            }
        } catch { }
        return allSaleTargetColumnKeys;
    });

    useEffect(() => {
        setSelectedSaleTargetColumnKeys(prev => Array.from(new Set([...prev, ...requiredSaleTargetColumnKeys])).filter(k => allSaleTargetColumnKeys.includes(k)));

    }, [SaleTargetColumns.length])

    const visibleSaleTargetColumns = useMemo(

        () => SaleTargetColumns.filter(col => selectedSaleTargetColumnKeys.includes(col.key)),

        [SaleTargetColumns, selectedSaleTargetColumnKeys]
    );
    //#endregion

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadSaleTarget(1, tempFilters, sortInfo, searchTerm);
        setShowFilterPopup(false);
    }
    //#endregion

    //#region Clear
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });

        loadSaleTarget(1, {}, sortInfo, searchTerm);
        setShowFilterPopup(false);
    };

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region NAVIGATE TO ADD SALE TARGET
    const handleAddSaleTarget = useCallback(() => {
        navigate('/saleTarget/add')
    }, [navigate]);
    //#endregion

    //#region SEARCH HANDLERS
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadSaleTarget(1, filters, sortInfo, value);
    };

    //#region CLEAR HANDLERS
    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadSaleTarget(1, filters, sortInfo, '');
    };
    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadSaleTarget(page, filters, sortInfo, searchTerm);
    };
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });

        loadSaleTarget(1, filters, sort, searchTerm);
    }, [searchTerm]);
    //#endregion

    //#region SALE TARGET TABLE PAGINATION INFO
    const SaleTargetPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const SaleTargetForTable = useMemo(() => saleTargetList, [saleTargetList]);
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
                    setIsShowCustomizeSaleTargetColumnsModal(true)
                }}

                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddSaleTarget}

                // IMPORT
                isShowImportButton={false}

                // EXPORT
                isShowExportButton={canExport && SaleTargetForTable.length > 0}
                onExportExcel={handleExportSaleTargetExcel}
                onExportPdf={handleExportSaleTargetPdf}
                exportLoading={isLoading}
            />

            {/* DATA TABLE SALE TARGET*/}
            <DataTable
                data={SaleTargetForTable}
                columns={visibleSaleTargetColumns}
                pagination={SaleTargetPaginationInfo}
                emptyMessage="No Sale Target Data found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeSaleTargetColumnsModal}
                onClose={() => setIsShowCustomizeSaleTargetColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredSaleTargetColumnKeys])
                    );
                    setSelectedSaleTargetColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeSaleTargetTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={SaleTargetColumns}
                selectedKeys={selectedSaleTargetColumnKeys}
                requiredKeys={requiredSaleTargetColumnKeys}
                title="Customize Table Columns"
            />

            {/* FILTER MODAL FOR SALE TARGET */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Sale Target"
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
                            label='Employee Name'
                            value={tempFilters?.EmployeeName ?? ''}
                            onChange={e => handleFilterChange('EmployeeName', e.target.value)}
                            placeholder="Enter Employee Name" />
                    </div>

                    <div>
                        <Input type="text"
                            label='Mobile Number'
                            value={tempFilters?.MobileNumber ?? ''}
                            onChange={e => handleFilterChange('MobileNumber', e.target.value)}
                            placeholder="Enter Mobile Number" />
                    </div>

                </div>
            </Modal>
        </div>
    )
}
export default SaleTarget;
