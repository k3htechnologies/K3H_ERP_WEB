import React, { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { type PaginationInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import type { FilterWithPaginationInventoryParkingOverallReportRequest, InventoryParkingOverallReportData } from '@/features/inventoryParkingOverallReport/models/InventoryParkingOverallReportModel'
import { inventoryParkingOverallReportService } from '@/features/inventoryParkingOverallReport/services/InventoryParkingOverallReportService';
import { Loader } from '@/core/utils/loader';
import { useToast } from '@/core/hooks/useToast';
import { CustomTable } from '@/ui/components/DataTable/CustomTable';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { handleExportFile } from '@/core/utils/exportFile';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import type { FilterPaginatedFlatsRequest, InventoryFlatData } from '@/features/inventory/models/InventoryMasterModel';
import { inventoryService } from '@/features/inventory/services/InventoryServices';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';

export const InventoryParkingOverallReport: React.FC = () => {

    // #region STATE
    const [inventoryParkingOverallReportList, setInventoryParkingOverallReportList] = useState<InventoryParkingOverallReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCell, setSelectedcell] = useState<any>(null);
    const [modalData, setModalData] = useState<InventoryFlatData[]>([]);

    const { pagination, setPagination } = usePagination(20);

    const { addToast } = useToast();

    const { canExport } = useMenuPermissions();

    const debouncedSearch = useDebouncedCallback((value: string) => {
        loadInventoryParkingOverallReport(1, value)
    }, 350);

    useEffect(() => {
        loadInventoryParkingOverallReport(1);
    }, []);

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadInventoryParkingOverallReport(page);
    };

    const inventoryParkingOverallReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const loadInventoryParkingOverallReport = async (pageNum: number, searchText?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const pageSize = pagination.pageSize;
                const params: FilterWithPaginationInventoryParkingOverallReportRequest = {
                    PageNumber: pageNum,
                    PageSize: pageSize,
                    ProjectId: 0,
                    ProjectName: searchText?.trim() || undefined,
                };

                const response = await inventoryParkingOverallReportService.apiCallPullInventoryParkingOverallReport(params);

                if (E.isRight(response)) {

                    setInventoryParkingOverallReportList(response.right.Data);

                    setPagination({
                        currentPage: pageNum,
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
            'Loading Inventory Parking Overall Report'
        );
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        debouncedSearch.cancel();
        loadInventoryParkingOverallReport(1, '')
    }

    const handleExportInventoryParkingOverallReportExcel = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationInventoryParkingOverallReportRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: 0,
                    ProjectName: searchTerm?.trim() || undefined,
                    ExportType: exportType
                };

                const response = await inventoryParkingOverallReportService.apiCallPullInventoryParkingOverallReport(params);

                handleExportFile(response, exportType, 'Inventory Parking Overall Report', addToast)
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

    const handleExportInventoryParkingOverallReportExcelFile = () => handleExportInventoryParkingOverallReportExcel('Excel');
    const handleExportInventoryParkingOverallReportPdfFile = () => handleExportInventoryParkingOverallReportExcel('PDF');


    const inventoryParkingOverallReportColumns = useMemo<TableColumn[]>(() => {

        const boldIfTotal = (row: any) => (row.ProjectName || "").toUpperCase() === "TOTAL" ? 'font-bold text-gray-500' : '';

        return [
            {
                key: 'ProjectName',
                label: 'Project Name',
                width: '14',
                sortable: true,
                align: 'left',
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {value || ""}
                    </span>
                )
            },
            {
                key: 'BuildingNumber',
                label: 'Building',
                width: '14',
                align: 'left',
                render: value => value || ''
            },
            {
                key: 'Wing',
                label: 'Wing',
                width: '14',
                sortable: true,
                align: 'left',
                render: value => value || ''
            },
            {
                key: "RERACarpetAreaSqFtGroup",
                label: "RERA Carpet Area (SqFt)",
                align: "center",
                children: [
                    {
                        key: "TotalReraArea",
                        label: "Total",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("", row.TotalUnit, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "AllotedReraArea",
                        label: "Alloted",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Alloted", row.AllotedUnit, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BookedReraArea",
                        label: "Booked",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Booked", row.BookedUnit, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "HoldReraArea",
                        label: "Hold",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Hold", row.HoldUnit, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "AvailableReraArea",
                        label: "Available",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Available", row.AvailableUnit, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BlockReraArea",
                        label: "Block",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Block", row.BlockUnit, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },

                ]
            },
            {
                key: "UnitGroup",
                label: "Number Of Units",
                align: "center",
                children: [
                    {
                        key: "TotalUnit",
                        label: "Total",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },

                    {
                        key: "AllotedUnit",
                        label: "Alloted",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Alloted", value, row);
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BookedUnit",
                        label: "Booked",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Booked", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "HoldUnit",
                        label: "Hold",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Hold", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "AvailableUnit",
                        label: "Available",
                        align: "right",
                        render: (value, row) => {
                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Available", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BlockUnit",
                        label: "Block",
                        align: "right",
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600 hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Block", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },

                ]
            },
            {
                key: "ParkingGroup",
                label: "Number Of Parking",
                align: "center",
                children: [
                    {
                        key: "TotalParking",
                        label: "Total",
                        align: "right",
                        render: (value, row) => (
                            <span className={boldIfTotal(row)}>
                                {value ?? "0"}
                            </span>
                        )
                    },
                    {
                        key: "AllotedParking",
                        label: "Alloted",
                        align: "right",
                        render: (value, row) => (
                            <span className={boldIfTotal(row)}>
                                {value ?? "0"}
                            </span>
                        )
                    },
                    {
                        key: "SalesParking",
                        label: "Sales",
                        align: "right",
                        render: (value, row) => (
                            <span className={boldIfTotal(row)}>
                                {value ?? "0"}
                            </span>
                        )
                    },
                ]
            },
        ];

    }, []);

    // -=====================================OPEN MODAL HANDLER========================================
    const handleOpenModal = async (
        status: string,
        count: number,
        row: InventoryParkingOverallReportData
    ) => {

        setModalData([]);

        setSelectedcell({
            status,
            count,
            buildingNumber: row.BuildingNumber,
            project: row.ProjectName,
            wing: row.Wing
        });

        const params: FilterPaginatedFlatsRequest = {
            PageSize: count > 0 ? count : 10,
            PageNumber: 1,
            ProjectId: row.ProjectId ?? 0,
            Wing: status === "" ? '' : row.Wing ?? "",
            FlatStatus: status
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await inventoryService.apiCallPullPaginatedFlats(params);

                if (E.isRight(response)) {
                    setModalData(response.right.Data || []);
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
            `Loading ${status} Units`
        );
    };

    const tableColumns: TableColumn[] = useMemo(() => [
        {
            key: 'Floor',
            label: 'Floor',
            width: '120px',
            sortable: false,
        },
        {
            key: 'Flat',
            label: 'Unit Number',
            width: '150px',
            sortable: false,
        },
        {
            key: 'FlatType',
            label: 'Unit Type',
            width: '120px',
            sortable: false,
        },
        {
            key: 'RERACarpetAreaSqFt',
            label: 'RERA Carpet Area (SqFt)',
            width: '130px',
            sortable: false,
            align: 'right',
            render: (value: number) => value || 0,
        },
        {
            key: 'FlatConfiguration',
            label: 'Unit Configuration',
            width: '150px',
            sortable: false,
        },
        {
            key: 'FlatFacing',
            label: 'Unit Facing',
            width: '120px',
            sortable: false,
        },
        {
            key: 'OwnerName',
            label: 'Owner / Alloted / Blocked / Hold By',
            width: '600px',
            sortable: false,
            render: (value: string, row: InventoryFlatData) => {

                if (row?.FlatStatus?.toUpperCase() === 'BLOCKED' || row?.FlatStatus?.toUpperCase() === 'HOLD') {
                    return `${row?.FlatStatus} BY ${row?.ModifiedBy || '-'} on ${formatDate_dd_MonthName_yy_hh_mm(row?.ModifiedDate ?? "-")}`;
                }

                return value?.trim() || '-';
            }
        },

    ], []);

    const paginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: 1,
            totalPages: 1,
            totalRecords: modalData.length,
            pageSize: modalData.length,
            onPageChange: () => { }
        }),
        [modalData]
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div></div>  </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Project Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton={false}
                isShowCustomizeButton={false}
                // ADD
                isShowAddButton={false}
                // IMPORT
                isShowImportButton={false}
                // EXPORT
                isShowExportButton={canExport && inventoryParkingOverallReportColumns.length > 0}
                onExportExcel={handleExportInventoryParkingOverallReportExcelFile}
                onExportPdf={handleExportInventoryParkingOverallReportPdfFile}
                exportLoading={isLoading}
            />

            <CustomTable
                data={inventoryParkingOverallReportList}
                columns={inventoryParkingOverallReportColumns}
                pagination={inventoryParkingOverallReportPaginationInfo}
                emptyMessage="No Data Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
            />

            {selectedCell && (
                <Modal
                    isOpen={!!selectedCell}
                    onClose={() => setSelectedcell(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedCell.status || "All"} Units ({selectedCell.count ?? 0})
                            </span>
                            <span className="text-sm text-gray-500">
                                {selectedCell.project}
                                {selectedCell.buildingNumber ? ` | Bldg: ${selectedCell.buildingNumber}` : ""}
                                {selectedCell.wing ? ` | Wing: ${selectedCell.wing}` : ""}
                            </span>

                        </div>
                    }
                    size="large-half"
                >
                    <CustomTable


                        data={modalData}
                        columns={tableColumns}
                        recordsPerPage={modalData.length}
                        loading={isLoading}
                        fixedHeight
                        className="flex-1"
                        pagination={paginationInfo}
                    />
                </Modal>
            )}
        </div>
    );
};

export default InventoryParkingOverallReport;
