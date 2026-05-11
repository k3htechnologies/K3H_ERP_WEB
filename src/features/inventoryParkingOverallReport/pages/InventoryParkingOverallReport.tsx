import React, { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { type PaginationInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import type { FilterWithPaginationInventoryParkingOverallReportRequest, InventoryParkingOverallReportData, ProjectInventoryParkingDetailsData } from '@/features/inventoryParkingOverallReport/models/InventoryParkingOverallReportModel'
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
import type { ParkingData } from '@/features/parking/models/ParkingModel';
import { parkingService } from '@/features/parking/services/ParkingService';
import { PaginationCardView } from '@/ui/components/Card/PaginationCardView';

export const InventoryParkingOverallReport: React.FC = () => {

    // #region STATE
    const [projectInventoryParkingDetailsList, setProjectInventoryParkingDetailsList] = useState<ProjectInventoryParkingDetailsData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCell, setSelectedcell] = useState<any>(null);
    const [inventoryModalData, setInventoryModalData] = useState<InventoryFlatData[]>([]);
    const [parkingModalData, setParkingModalData] = useState<ParkingData[]>([]);

    const { pagination, setPagination } = usePagination(20);

    const { addToast } = useToast();

    const { canExport } = useMenuPermissions();

    const debouncedSearch = useDebouncedCallback((value: string) => {
        loadPullProjectInventoryParkingDetails(1, value)
    }, 350);

    useEffect(() => {
        loadPullProjectInventoryParkingDetails(1);
    }, []);

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadPullProjectInventoryParkingDetails(page);
    };

    const ProjectInventoryParkingPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const loadPullProjectInventoryParkingDetails = async (pageNum: number, searchText?: string) => {
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

                const response = await inventoryParkingOverallReportService.apiCallPullProjectInventoryParkingDetails(params);

                if (E.isRight(response)) {

                    setProjectInventoryParkingDetailsList(response.right.Data);

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
            'Loading Project'
        );
    };


    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        debouncedSearch.cancel();
        loadPullProjectInventoryParkingDetails(1, '')
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
                key: 'Wing',
                label: 'Wing',
                width: '14',
                align: 'left',
                theadStyle: {
                    backgroundColor: '#F8FAFC',
                    color: '#000'
                },
                render: (value, row) => (
                    <span className={boldIfTotal(row)}>
                        {value || ""}
                    </span>
                )
            },
            {
                key: "RERACarpetAreaSqFtGroup",
                label: "RERA Carpet Area (SqFt)",
                align: "center",
                theadStyle: {
                    backgroundColor: '#EEF5FF',
                    color: '#135BEC'
                },

                children: [
                    {
                        key: "TotalReraArea",
                        label: "Total",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#EEF5FF'
                        },
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
                                        handleOpenModal("Inventory", "", row.TotalUnit, row)
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
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#EEF5FF'
                        },
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
                                        handleOpenModal("Inventory", "Alloted", row.AllotedUnit, row)
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
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#EEF5FF'
                        },
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
                                        handleOpenModal("Inventory", "Booked", row.BookedUnit, row)
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
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#EEF5FF'
                        },
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
                                        handleOpenModal("Inventory", "Hold", row.HoldUnit, row)
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
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#EEF5FF'
                        },
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
                                        handleOpenModal("Inventory", "Available", row.AvailableUnit, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BlockReraArea",
                        label: "Blocked",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#EEF5FF'
                        },
                        render: (value, row) => {

                            const isClickable = (value ?? 0) > 0;

                            return (
                                <span
                                    className={
                                        isClickable
                                            ? "cursor-pointer text-blue-600  hover:underline"
                                            : "text-gray-400 cursor-not-allowed"
                                    }
                                    onClick={() => {
                                        if (!isClickable) return;
                                        handleOpenModal("Inventory", "Blocked", row.BlockUnit, row)
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
                theadStyle: {
                    backgroundColor: '#FBF5FF',
                    color: '#8A38F5'
                },
                children: [
                    {
                        key: "TotalUnit",
                        label: "Total",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
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
                                        handleOpenModal("Inventory", "", value, row)
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
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
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
                                        handleOpenModal("Inventory", "Alloted", value, row);
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
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
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
                                        handleOpenModal("Inventory", "Booked", value, row)
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
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
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
                                        handleOpenModal("Inventory", "Hold", value, row)
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
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
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
                                        handleOpenModal("Inventory", "Available", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BlockUnit",
                        label: "Blocked",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },
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
                                        handleOpenModal("Inventory", "Blocked", value, row)
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
                theadStyle: {
                    backgroundColor: '#F0FDF4',
                    color: '#60D669'
                },
                children: [
                    {
                        key: "TotalParking",
                        label: "Total",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
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
                                        handleOpenModal("Parking", "", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "AvailableParking",
                        label: "Available",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
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
                                        handleOpenModal("Parking", "Available", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BlockedParking",
                        label: "Blocked",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
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
                                        handleOpenModal("Parking", "Blocked", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "BookedParking",
                        label: "Booked",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
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
                                        handleOpenModal("Parking", "Booked", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "HoldParking",
                        label: "Hold",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
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
                                        handleOpenModal("Parking", "Hold", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                    {
                        key: "MemberParking",
                        label: "Member",
                        align: "right",
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
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
                                        handleOpenModal("Parking", "Member", value, row)
                                    }}
                                >
                                    {value ?? "0"}
                                </span>
                            );
                        }
                    },
                ]
            },
        ];

    }, []);

    // -=====================================OPEN MODAL HANDLER========================================
    const handleOpenModal = async (
        type: string,
        status: string,
        count: number,
        row: InventoryParkingOverallReportData
    ) => {

        setSelectedcell({
            type,
            status,
            count,
            buildingNumber: row.BuildingNumber,
            project: row.ProjectName,
            wing: row.Wing
        });

        if (type === "Inventory") {

            setInventoryModalData([]);

            const params: FilterPaginatedFlatsRequest = {
                PageSize: count > 0 ? count : 10,
                PageNumber: 1,
                ProjectId: row.ProjectId ?? 0,
                Wing: ["", "Total"].includes(row.Wing!) ? "" : row.Wing ?? "",
                BuildingNumber: row.BuildingNumber ?? "",
                FlatStatus: status
            };

            await runApiWithLoader(
                setIsLoading,
                setLoadingMessage,
                async () => {

                    const response = await inventoryService.apiCallPullPaginatedFlats(params);

                    if (E.isRight(response)) {

                        setInventoryModalData(response.right.Data || []);

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
        }
        else if (type === "Parking") {

            setParkingModalData([]);

            const params = {
                PageSize: count > 0 ? count : 10,
                PageNumber: 1,
                ProjectId: row.ProjectId ?? 0,
                BuildingNumber: row.BuildingNumber ?? "",
                Wing: ["", "Total"].includes(row.Wing!) ? "" : row.Wing ?? "",
                ParkingStatus: status,
                IsAcessOnlyApprovedParking: false
            };

            await runApiWithLoader(
                setIsLoading,
                setLoadingMessage,
                async () => {

                    const response = await parkingService.apiCallPullParkingWithPagination(params);

                    if (E.isRight(response)) {

                        setParkingModalData(response.right.Data || []);

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
                "Loading Parking"
            );
        }
    };

    const inventoryTableColumns: TableColumn[] = useMemo(() => [
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

    const ParkingTableColumns: TableColumn[] = useMemo(
        () => [
            {
                key: "ParkingNumber",
                label: "Parking Number",
                width: "150px",
                sortable: false,
            },
            {
                key: "ParkingCategory",
                label: "Category",
                width: "150px",
                sortable: false,
            },
            {
                key: "ParkingType",
                label: "Type",
                width: "150px",
                sortable: false,
            },
            {
                key: "ParkingSubType",
                label: "Size",
                width: "120px",
                sortable: false,
            },
            {
                key: "ParkingDimensions",
                label: "Dimensions",
                width: "130px",
                sortable: false,
            },
            {
                key: "ParkingStatus",
                label: "Status",
                width: "120px",
                sortable: false,
            },
            {
                key: "IsEVChargingAvailable",
                label: "EV Charging",
                width: "120px",
                sortable: false,
                render: (value: boolean) => (value ? "Yes" : "No"),
            },
            {
                key: "OwnerName",
                label: 'Owner / Alloted / Blocked / Hold By',
                width: '600px',
                sortable: false,
                render: (value: string, row: ParkingData) => {

                    if (row?.ParkingStatus?.toUpperCase() === 'BLOCKED' || row?.ParkingStatus?.toUpperCase() === 'HOLD') {
                        return `${row?.ParkingStatus} BY ${row?.ModifiedBy || '-'} on ${formatDate_dd_MonthName_yy_hh_mm(row?.ModifiedDate ?? "-")}`;
                    }

                    return value?.trim() || '-';
                }
            },

        ],
        [],
    );

    const inventorypaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: 1,
            totalPages: 1,
            totalRecords: inventoryModalData.length,
            pageSize: inventoryModalData.length,
            onPageChange: () => { }
        }),
        [inventoryModalData]
    );

    const parkingpaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: 1,
            totalPages: 1,
            totalRecords: parkingModalData.length,
            pageSize: parkingModalData.length,
            onPageChange: () => { }
        }),
        [parkingModalData]
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
                isShowExportButton={canExport && projectInventoryParkingDetailsList.length > 0}
                onExportExcel={handleExportInventoryParkingOverallReportExcelFile}
                onExportPdf={handleExportInventoryParkingOverallReportPdfFile}
                exportLoading={isLoading}
            />

            <PaginationCardView
                data={projectInventoryParkingDetailsList}
                pagination={ProjectInventoryParkingPaginationInfo}
                emptyMessage="No Data Found"
                className="flex-1"

                header={(row) => (

                    <div className="flex items-start justify-between w-full">

                        {/* LEFT SECTION */}
                        <div className="flex flex-col">

                            <span className="font-semibold text-lg leading-none text-gray-900">
                                {row.ProjectName}
                            </span>

                            <span className="text-sm text-gray-500 mt-3">
                                Total Buildings :{" "}
                                <span className="font-semibold text-gray-800">
                                    {row.TotalBuilding}
                                </span>
                            </span>

                        </div>

                        {/* RIGHT SECTION */}
                        <div className="ml-auto flex items-start gap-20 pr-4">

                            <div>
                                <p className="text-sm text-gray-500 mb-1 text-left">
                                    Total Area
                                </p>

                                <h3 className="font-medium text-[14px] text-gray-900">
                                    {row.TotalReraArea ?? 0} SqFt
                                </h3>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1 text-left">
                                    Total Units
                                </p>

                                <h3 className="font-medium text-[14px] text-gray-900">
                                    {row.TotalUnit}
                                </h3>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1 text-left">
                                    Available Units
                                </p>

                                <h3 className="font-medium text-[14px] text-green-600">
                                    {row.AvailableUnit} Units
                                </h3>
                            </div>

                        </div>

                    </div>

                )}

                fetchExpandedData={async (row) => {
                    setIsLoading(true);
                    setLoadingMessage('Loading Details');

                    const params: FilterWithPaginationInventoryParkingOverallReportRequest = {
                        PageNumber: 1,
                        PageSize: 500,
                        ProjectId: row.ProjectId ?? 0,
                        ProjectName: row.ProjectName
                    };

                    const response = await inventoryParkingOverallReportService.apiCallPullInventoryParkingOverallReport(params);

                    setIsLoading(false);
                    if (E.isRight(response)) {
                        return response.right.Data || [];
                    }

                    return [];
                }}

                renderExpanded={(expandedData) => {

                    const groupedData = Object.values(
                        (expandedData || []).reduce((acc: any, item: any) => {

                            const key = item.BuildingNumber || "Unknown";

                            if (!acc[key]) {
                                acc[key] = {
                                    building: key,
                                    rows: [],
                                };
                            }

                            acc[key].rows.push(item);

                            return acc;

                        }, {})
                    );

                    return (

                        <div className="space-y-6">

                            {groupedData.map((group: any, index: number) => (

                                <div key={index} className="rounded-xl overflow-hidden bg-white">


                                    <h2 className="font-semibold text-lg text-gray-900">
                                        {group.building}
                                    </h2>

                                    <div className="pt-2">

                                        <CustomTable
                                            data={group.rows}
                                            columns={inventoryParkingOverallReportColumns}
                                            emptyMessage="No Data Found"
                                            fixedHeight
                                            recordsPerPage={20}
                                            className="flex-1"
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>

                    );
                }}
            />

            {selectedCell && (
                <Modal
                    isOpen={!!selectedCell}
                    onClose={() => setSelectedcell(null)}
                    title={
                        <div className="flex flex-col">

                            <span className="font-semibold text-base">
                                {selectedCell.status || ""} Units ({selectedCell.count ?? 0})
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
                        data={selectedCell?.type === "Inventory" ? inventoryModalData : parkingModalData}
                        columns={selectedCell?.type === "Inventory" ? inventoryTableColumns : ParkingTableColumns}
                        recordsPerPage={selectedCell?.type === "Inventory" ? inventoryModalData.length : parkingModalData.length}
                        loading={isLoading}
                        fixedHeight
                        className="flex-1"
                        pagination={selectedCell?.type === "Inventory" ? inventorypaginationInfo : parkingpaginationInfo}
                    />
                </Modal>
            )}
        </div>
    );
};

export default InventoryParkingOverallReport;
