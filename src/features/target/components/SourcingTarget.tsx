import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SourcingTargetData, FilterWithPaginationSourcingTargetRequest } from "@/features/target/models/SourcingTargetModel";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { sourcingTargetService } from "@/features/target/services/SourcingTargetService";
import * as E from 'fp-ts/Either';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd } from "@/core/utils/dateFormat";
import { Loader } from "@/core/utils/loader";

const SourcingTargetColumns: TableColumn[] = [
    { key: 'EmployeeName', label: 'Employee Name', sortable: true, width: '180px', fixed: 'left' },
    { key: 'WalkinsByCP', label: 'Walkins (CP)', sortable: true },
    { key: 'WalkinsDirect', label: 'Walkins (Direct)', sortable: true },
    { key: 'FreshVisits', label: 'Fresh Visits', sortable: true },
    { key: 'Revisits', label: 'Revisits', sortable: true },
    { key: 'BookingByCP', label: 'Bookings (CP)', sortable: true },
    { key: 'BookingDirect', label: 'Bookings (Direct)', sortable: true },
    { key: 'Bookings', label: 'Total Bookings', sortable: true },
    { key: 'TotalMeetings', label: 'Total Meetings', sortable: true },
    { key: 'TotalOBM', label: 'Total OBM', sortable: true },
    { key: 'TotalIBM', label: 'Total IBM', sortable: true },
    { key: 'UniqueCPs', label: 'Unique CPs', sortable: true },
    { key: 'ActiveCP', label: 'Active CPs', sortable: true },
    { key: 'NewCP', label: 'New CPs', sortable: true },
    {
        key: 'FromDate',
        label: 'From Date',
        sortable: true,
        render: (value: any) => value ? new Date(value).toLocaleDateString('en-GB') : '-'
    },
    {
        key: 'ToDate',
        label: 'To Date',
        sortable: true,
        render: (value: any) => value ? new Date(value).toLocaleDateString('en-GB') : '-'
    },
];

export default function SourcingTarget() {

    // STATE
    const [sourcingTargetList, setSourcingTargetList] = useState<SourcingTargetData[]>([]);
    // const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // FILTER STATES
    // const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});






    //  PAGINATION
    const { pagination, setPagination } = usePagination(20);

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    // TOAST
    const { addToast } = useToast();

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadSourcingTarget(page, filters);
    };
    //#endregion

    //#region CALLING DATA TABLE PAGINATION INFO
    const SourcingTargetPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination, handlePageChange]
    )

    const sourcingTargetForTable = useMemo(() => sourcingTargetList, [sourcingTargetList]);

    const loadSourcingTarget = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationSourcingTargetRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    EmployeeId: filterParams.EmployeeId ?? undefined,
                    EmployeeName: filterParams.EmployeeName?.trim() ?? undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    // SortBy: getSortByParam(sort ?? null, SourcingTargetColumns),
                };

                const response = await sourcingTargetService.apiCallPullSourcingTarget(params);

                if (E.isRight(response)) {
                    console.log('Response Right', response)
                    console.log('Response Right Data', response.right);
                    setSourcingTargetList(response.right.Data);
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
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Sourcing Target'
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);
    //#endregion


    useEffect(() => {
        if (!projectId) return;
        setPagination({ currentPage: 1 });
        loadSourcingTarget(1, filters);
    }, [projectId]);

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

            {/* Data Table */}
            <div className="mt-4">
                <DataTable
                    data={sourcingTargetForTable}
                    columns={SourcingTargetColumns}
                    pagination={SourcingTargetPaginationInfo}
                    loading={isLoading}
                    emptyMessage="No sourcing targets found"
                />
            </div>
        </div>
    )
}
