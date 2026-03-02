import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClosingTargetData, FilterWithPaginationClosingTargetRequest } from "@/features/target/models/ClosingTargetModel";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { closingTargetService } from "@/features/target/services/ClosingTargetService";
import * as E from 'fp-ts/Either';
import { Loader } from "@/core/utils/loader";

const ClosingTargetColumns: TableColumn[] = [
    {
        key: 'EmployeeName',
        label: 'Employee Name',
        sortable: true,
        width: '180px',
        fixed: 'left'
    },
    { key: 'WalkinsByCP', label: 'Walkins (CP)', sortable: true },
    { key: 'WalkinsDirect', label: 'Walkins (Direct)', sortable: true },
    { key: 'FreshVisits', label: 'Fresh Visits', sortable: true },
    { key: 'Revisits', label: 'Revisits', sortable: true },
    { key: 'BookingByCP', label: 'Bookings (CP)', sortable: true },
    { key: 'BookingDirect', label: 'Bookings (Direct)', sortable: true },
    {
        key: 'FromDate',
        label: 'From Date',
        sortable: true,
        render: (value: string) =>
            value ? new Date(value).toLocaleDateString('en-GB') : '-'
    },
    {
        key: 'ToDate',
        label: 'To Date',
        sortable: true,
        render: (value: string) =>
            value ? new Date(value).toLocaleDateString('en-GB') : '-'
    }
];

export default function ClosingTarget() {
    // STATE
    const [closingTargetList, setClosingTargetList] = useState<ClosingTargetData[]>([]);
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // FILTER STATES
    const [filters, setFilters] = useState<FilterInfo>({});

    // PAGINATION
    const { pagination, setPagination } = usePagination(10);

    // PROJECT SELECTION
    const { projectId } = useProject();

    // TOAST
    const { addToast } = useToast();

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadClosingTarget(page, filters, sortInfo);
    };

    const ClosingTargetPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination, handlePageChange]
    );

    const closingTargetForTable = useMemo(() => closingTargetList, [closingTargetList]);


    const loadClosingTarget = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationClosingTargetRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    EmployeeId: filterParams.EmployeeId ?? undefined,
                    EmployeeName: filterParams.EmployeeName?.trim() ?? undefined,
                    // FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    FromDate: '2026-02-28',
                    // ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    ToDate: '2026-02-28',
                    // Sorting left
                    isCheckPermission: true
                };

                const response = await closingTargetService.apiCallPullClosingTarget(params);

                if (E.isRight(response)) {
                    console.log('Response Right Data', response.right);
                    setClosingTargetList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    console.error(response.left);
                    addToast({ type: 'error', title: response.left.message });
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Closing Target'
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination]);

    useEffect(() => {
        if (!projectId) return;
        setPagination({ currentPage: 1 });
        loadClosingTarget(1, filters, sortInfo);
    }, [projectId]);

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

            {/* Data Table */}
            <div className="mt-4">
                <DataTable
                    data={closingTargetForTable}
                    columns={ClosingTargetColumns}
                    pagination={ClosingTargetPaginationInfo}
                    loading={isLoading}
                    emptyMessage="No closing targets found"
                />
            </div>

        </div>
    );
}