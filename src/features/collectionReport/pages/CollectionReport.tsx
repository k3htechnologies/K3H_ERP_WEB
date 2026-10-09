import { useEffect, useMemo, useState } from "react";
import { Loader } from "@/core/utils/loader";
import type { CollectionReportData, FilterWithPaginationProjectWiseRequest, FilterWithPaginationCollectionReportRequest } from "@/features/collectionReport/models/CollectionReportModel";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { runApiWithLoader } from "@/core/utils";
import { usePagination } from "@/core/hooks/usePagination";
import { collectionReportService } from '@/features/collectionReport/services/CollectionReportService';
import * as E from 'fp-ts/Either';
import { useToast } from "@/core/hooks/useToast";
import { PaginationCardView } from "@/ui/components/Card/PaginationCardView";
import { CustomTable, type PaginationInfo, type TableColumn } from "@/ui/components/DataTable/CustomTable";
import { formatCurrency } from "@/core/utils/comman";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import { handleExportFile } from "@/core/utils/exportFile";
import { ChevronDown, ChevronUp } from "lucide-react";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

export const CollectionReport: React.FC = () => {

    const [projectWiseCollectionReportList, setProjectWiseCollectionReportList] = useState<CollectionReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const { canExport } = useMenuPermissions();
    const [expandWings, setExpandWings] = useState<Record<string, boolean>>({});

    const debouncedSearch = useDebouncedCallback((value: string) => {
        loadPullProjectWiseCollectionReport(1, value)
    }, 350);

    useEffect(() => {
        loadPullProjectWiseCollectionReport(1);
    }, []);

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadPullProjectWiseCollectionReport(page);
    };

    const ProjectWiseCollectionReportPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const loadPullProjectWiseCollectionReport = async (pageNum: number, searchText?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationProjectWiseRequest = {
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,
                    ProjectId: 0,
                    ProjectName: searchText?.trim() || undefined,
                };

                const response = await collectionReportService.apiCallPullProjectWiseCollectionReport(params);

                if (E.isRight(response)) {

                    setProjectWiseCollectionReportList(response.right.Data);

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
            'Loading Collection Report'
        );
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        debouncedSearch.cancel();
        loadPullProjectWiseCollectionReport(1, '')
    }

    const handleExportProjectWiseCollectionReport = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationProjectWiseRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: 0,
                    ProjectName: searchTerm?.trim() || undefined,
                    ExportType: exportType
                };

                const response = await collectionReportService.apiCallPullCollectionReport(params);

                handleExportFile(response, exportType, 'Collection Report', addToast)

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

    const handleExportProjectWiseCollectionReportExcelFile = () => handleExportProjectWiseCollectionReport('Excel');
    const handleExportProjectWiseCollectionReportPdfFile = () => handleExportProjectWiseCollectionReport('PDF');

    const projectWiseCollectionReportColumns = useMemo<TableColumn[]>(() => {

        const boldIfTotal = (row: any) => (row.ProjectName || "").toUpperCase() === "TOTAL" ? 'font-bold text-gray-500' : '';

        return [

            {
                key: 'Type',
                label: 'Type',
                width: '14',
                align: 'left',
                fixed: 'left',
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
                key: 'TotalUnitDetailsGroup',
                label: 'Total Unit Details',
                align: 'center',
                theadStyle: {
                    backgroundColor: '#EEF5FF',
                    color: '#135BEC'
                },

                children: [
                    {
                        key: 'TotalUnit',
                        label: 'Units',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#EEF5FF'
                        },
                        render: (value) => (
                            <span className="text-blue-600">
                                {value ?? '-'}
                            </span>
                        )
                    },
                    {
                        key: 'TotalUnitRERACarpetAreaSqFt',
                        label: 'RERA Carpet Area (SqFt)',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#EEF5FF'
                        },
                        render: (value) => (
                            <span className="text-blue-600">
                                {value ?? '-'}
                            </span>
                        )
                    },
                ]
            },

            {
                key: 'RegistrationGroup',
                label: 'Registration Details',
                align: 'center',
                theadStyle: {
                    backgroundColor: '#FFF1D6',
                    color: '#7E4604'
                },
                children: [
                    {
                        key: 'RegistrationCompleted',
                        label: 'Completed',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FFF1D6'
                        },

                        render: (value) => (
                            <span className="text-amber-800">
                                {value ?? '-'}
                            </span>
                        )
                    },
                    {
                        key: 'RegistrationPending',
                        label: 'Pending',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FFF1D6'
                        },
                        render: (value) => (
                            <span className="text-amber-800">
                                {value ?? '-'}
                            </span>
                        )
                    },
                    {
                        key: 'TotalCount',
                        label: 'Count',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FFF1D6'
                        },
                        render: (value) => (
                            <span className="text-amber-800">
                                {value ?? '-'}
                            </span>
                        )
                    }
                ]
            },

            {
                key: 'AreaGroup',
                label: 'Alloted / Booked Details',
                align: 'center',
                theadStyle: {
                    backgroundColor: '#FBF5FF',
                    color: '#8A38F5'
                },
                children: [
                    {
                        key: 'BookingCount',
                        label: 'Count',
                        width: '14',
                        align: 'center',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },

                        render: (value) => (
                            <span className="text-violet-600">
                                {value === '-' ? '-' : `${value}`}
                            </span>
                        )
                    },
                    {
                        key: 'TotalRERACarpetAreaSqFt',
                        label: 'RERA Carpet Area (SqFt)',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#FBF5FF'
                        },

                        render: (value) => (
                            <span className="text-violet-600">
                                {value === '-' ? '-' : `${value}`}
                            </span>
                        )
                    }
                ]
            },

            {
                key: 'AmountGroup',
                label: 'Agreement Amount Details',
                align: 'center',
                theadStyle: {
                    backgroundColor: '#F0FDF4',
                    color: '#60D669'
                },
                children: [
                    {
                        key: 'TotalAgreementValue',
                        label: 'Agreement',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },
                    {
                        key: 'DueAmount',
                        label: 'Due',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },
                    {
                        key: 'ReceivedAmount',
                        label: 'Received',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },
                    {
                        key: 'OutstandingAmount',
                        label: 'Outstanding',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },
                    {
                        key: 'BalanceAmount',
                        label: 'Balance',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    }
                ]
            },
            {
                key: 'GSTAmountGroup',
                label: 'GST Amount Details',
                align: 'center',
                theadStyle: {
                    backgroundColor: '#F0FDF4',
                    color: '#60D669'
                },
                children: [
                    {
                        key: 'TotalGSTValue',
                        label: 'GST',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },

                    {
                        key: 'GSTReceivedAmount',
                        label: 'Received',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },
                    {
                        key: 'GSTBalanceAmount',
                        label: 'Balance',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },

                ]
            },
            {
                key: 'TDSAmountGroup',
                label: 'TDS Amount Details',
                align: 'center',
                theadStyle: {
                    backgroundColor: '#F0FDF4',
                    color: '#60D669'
                },
                children: [
                    {
                        key: 'TotalTDSValue',
                        label: 'TDS',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },

                    {
                        key: 'TDSReceivedAmount',
                        label: 'Received',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },
                    {
                        key: 'TDSBalanceAmount',
                        label: 'Balance',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },

                ]
            },
            {
                key: 'StampDutyAmountGroup',
                label: 'Stamp Duty Amount Details',
                align: 'center',
                theadStyle: {
                    backgroundColor: '#F0FDF4',
                    color: '#60D669'
                },
                children: [
                    {
                        key: 'TotalStampDutyValue',
                        label: 'Stamp Duty',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },

                    {
                        key: 'StampDutyReceivedAmount',
                        label: 'Received',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },
                    {
                        key: 'StampDutyBalanceAmount',
                        label: 'Balance',
                        width: '14',
                        align: 'right',
                        theadStyle: {
                            backgroundColor: '#FFF',
                            color: '#64748B'
                        },
                        tdStyle: {
                            backgroundColor: '#F0FDF4'
                        },
                        render: (value) => (
                            <span className="text-green-600">
                                {formatCurrency(value)}
                            </span>
                        )
                    },

                ]
            }
        ];
    }, [])

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
                isShowAddButton={false}
                isShowImportButton={false}
                isShowExportButton={projectWiseCollectionReportList.length > 0 && canExport}
                onExportExcel={handleExportProjectWiseCollectionReportExcelFile}
                onExportPdf={handleExportProjectWiseCollectionReportPdfFile}
                exportLoading={isLoading}
            />

            <PaginationCardView
                key={searchTerm}
                data={projectWiseCollectionReportList}
                pagination={ProjectWiseCollectionReportPaginationInfo}
                emptyMessage="No collection reports found"
                className="flex-1"

                header={(row) => (

                    <div className="flex items-start justify-between w-full">

                        <div className="flex flex-col">

                            <span className="font-semibold text-lg leading-none text-gray-900">
                                {row.ProjectName}
                            </span>

                            <div className="flex items-center gap-4 shrink-0">
                                <span className="text-sm text-gray-500 mt-3">
                                    Total Unit :{" "}
                                    <span className="font-semibold text-gray-800">
                                        {row.TotalUnit}
                                    </span>
                                </span>

                                <span className="text-sm text-[#D1D5DB] mt-3">
                                    |
                                </span>

                                <span className="text-sm text-gray-500 mt-3">
                                    Total Wing :{" "}
                                    <span className="font-semibold text-gray-800">
                                        {row.Wing}
                                    </span>
                                </span>
                            </div>

                        </div>

                        {/* RIGHT SECTION */}
                        <div className="ml-auto flex items-start gap-20 pr-4">

                            <div>
                                <p className="text-sm text-gray-500 mb-1 text-left">
                                    Total Agreement Value
                                </p>

                                <h3 className="font-medium text-[14px] text-gray-900">
                                    {formatCurrency(row.TotalAgreementValue ?? 0)}
                                </h3>
                            </div>

                            <div>
                                <p className="text-sm- text-gray-500 mb-1 text-left">
                                    Total Received Amount
                                </p>

                                <h3 className="font-medium text-[14px] text-gray-900">
                                    {formatCurrency(row.ReceivedAmount ?? 0)}
                                </h3>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1 text-left">
                                    Total  Balance Amount
                                </p>

                                <h3 className="font-medium text-[14px] text-green-600">
                                    {formatCurrency(row.BalanceAmount ?? 0)}
                                </h3>
                            </div>

                        </div>
                    </div>
                )}

                fetchExpandedData={async (row) => {
                    setIsLoading(true);
                    setLoadingMessage("Loading Details");

                    try {
                        const params: FilterWithPaginationCollectionReportRequest = {
                            ProjectId: row.ProjectId ?? 0,
                            ProjectName: row.ProjectName,
                        };

                        const response = await collectionReportService.apiCallPullCollectionReport(params);

                        if (E.isRight(response)) {

                            const data = response.right.Data || [];

                            const buildingWings = new Map<string, Set<string>>();

                            data.forEach((item) => {

                                if (!item.BuildingNumber || !item.Wing) return;

                                if (!buildingWings.has(item.BuildingNumber)) {

                                    buildingWings.set(item.BuildingNumber, new Set());
                                }

                                buildingWings.get(item.BuildingNumber)!.add(item.Wing);
                            });

                            return data;
                        }
                        return [];

                    } finally {
                        setIsLoading(false);
                    }
                }}

                renderExpanded={(expandData: CollectionReportData[]) => {

                    if (!expandData?.length) {
                        return (
                            <div className="py-6 text-center text-sm text-gray-500">
                                <NoDataView message='No Data Found' />
                            </div>
                        );
                    }

                    const wingMap = new Map<string, CollectionReportData[]>();

                    expandData.forEach((item) => {

                        const wing = item.Wing;

                        if (!wing) return;

                        if (!wingMap.has(wing)) {

                            wingMap.set(wing, []);
                        }

                        wingMap.get(wing)!.push(item);
                    });

                    const wings = Array.from(wingMap.entries());

                    const sumField = (rows: CollectionReportData[], field: keyof CollectionReportData) =>

                        rows.reduce(
                            (sum, item) => sum + (Number(item[field]) || 0),
                            0
                        );

                    return (

                        <div className="space-y-3">

                            {wings.map(([wing, wingRows], wingIndex) => {

                                const wingKey = `${wingRows[0]?.ProjectId}-${wing}`;

                                const isExpanded = expandWings[wingKey] ?? wingIndex === 0;

                                const totalRows = wingRows.filter(
                                    (item) => item.Type === "Total"
                                );

                                const residentialRows = wingRows.filter(
                                    (item) => item.UnitType === "Residential"
                                );

                                const commercialRows = wingRows.filter(
                                    (item) => item.UnitType === "Commercial"
                                );

                                const residentialTotal = residentialRows.find(
                                    (item) => item.Type === "Total"
                                );

                                const commercialTotal = commercialRows.find(
                                    (item) => item.Type === "Total"
                                );

                                const totalUnits = sumField(totalRows, "TotalUnit");

                                const residentialUnits = residentialTotal?.TotalUnit ?? 0;

                                const commercialUnits = commercialTotal?.TotalUnit ?? 0;

                                const wingAgreementAmount = sumField(totalRows, "TotalAgreementValue");

                                const wingReceivedAmount = sumField(totalRows, "ReceivedAmount");

                                const wingBalanceAmount = sumField(totalRows, "BalanceAmount");

                                const renderUnitType = (unitType: string,
                                    rows: CollectionReportData[],
                                    total: CollectionReportData | undefined,
                                    dotcolor: string
                                ) => {

                                    if (!rows.length) return null;

                                    const allotted = rows.find((item) => item.Type === "Allotted / Member");

                                    const booked = rows.find((item) => item.Type === "Booked / Sale");

                                    return (
                                        <div className="rounded-md border border-gray-200 bg-white p-3">

                                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${dotcolor}`}
                                                    />

                                                    <span className="text-sm font-semibold uppercase text-gray-800">
                                                        {unitType} Units
                                                    </span>

                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                        {total?.TotalUnit ?? 0} Units
                                                        {""}

                                                        (Allotted : {allotted?.TotalUnit ?? 0} {""} |
                                                        Booked : {booked?.TotalUnit ?? 0}   )
                                                    </span>
                                                </div>
                                            </div>

                                            <CustomTable
                                                data={rows}
                                                columns={projectWiseCollectionReportColumns}
                                                emptyMessage="No Data Found"
                                                fixedHeight
                                                recordsPerPage={20}
                                                className="flex-1"
                                            />
                                        </div>
                                    );
                                };

                                return (
                                    <div key={wingKey}
                                        className="overflow-hidden rounded-lg border border-gray-200 bg-white">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandWings((prev) => ({
                                                    ...prev,
                                                    [wingKey]: !isExpanded,
                                                }))
                                            }
                                            className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 text-left hover:bg-gray-50"
                                        >
                                            <div className="flex flex-wrap items-center gap-3">

                                                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${isExpanded
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-600"

                                                    }`}
                                                >
                                                    {wing}
                                                </span>

                                                <span className="text-sm font-semibold text-gray-900">
                                                    Wing {wing} - {wingRows[0]?.BuildingNumber}
                                                </span>

                                                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-gray-600">

                                                    Total Units : {totalUnits}
                                                    {" "} (Residential : {residentialUnits}
                                                    {" "} | Commercial : {commercialUnits})
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">

                                                <span className="text-xs text-gray-500">
                                                    Agreement:{" "}
                                                    <strong className="text-gray-900">
                                                        {formatCurrency(wingAgreementAmount)}
                                                    </strong>
                                                </span>

                                                <span className="text-xs text-gray-500">
                                                    Received:{" "}
                                                    <strong className="text-gray-900">
                                                        {formatCurrency(wingReceivedAmount)}
                                                    </strong>
                                                </span>

                                                <span className="text-xs text-gray-500">
                                                    Balance:{" "}
                                                    <strong className="text-gray-900">
                                                        {formatCurrency(wingBalanceAmount)}
                                                    </strong>
                                                </span>

                                                {isExpanded ? (
                                                    <ChevronUp
                                                        size={18}
                                                        className="text-blue-600"
                                                    />
                                                ) : (
                                                    <ChevronDown
                                                        size={18}
                                                        className="text-blue-600"
                                                    />
                                                )}
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="max-h-[400px] overflow-y-auto overflow-x-auto thin-scroll space-y-4 p-3 sm:p-4">
                                                {renderUnitType(
                                                    "Residential",
                                                    residentialRows,
                                                    residentialTotal,
                                                    "bg-indigo-500"
                                                )}

                                                {renderUnitType(
                                                    "Commercial",
                                                    commercialRows,
                                                    commercialTotal,
                                                    "bg-amber-500"
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                }}
            />
        </div>
    )

}

export default CollectionReport;