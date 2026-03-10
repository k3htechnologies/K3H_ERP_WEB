import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import type { InwardOutwardData, FilterWithPaginationInwardOutwardRequest } from "@/features/inwardOutward/models/InwardOutwardModel";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type PaginationInfo, type TableColumn, type SortInfo } from "@/ui/components/DataTable/DataTable";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { inwardOutwardService } from "@/features/inwardOutward/services/InwardOutwardService";
import * as E from 'fp-ts/Either';
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

export const Outward: React.FC = () => {
    //STATE
    const [outwardDataList, setOutwardDataList] = useState<InwardOutwardData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();

    //Pagination
    const { pagination, setPagination } = usePagination(20);

    // TOAST
    const { addToast } = useToast();

    //#region INIT
    useEffect(() => {
        fetchOutwardData(1);
    }, []);

    //#region DATA LOADING | FETCH |
    const fetchOutwardData = async (page: number = pagination.currentPage) => {
        return await loadOutwardData(page);
    };

    const loadOutwardData = useCallback(async (page: number = pagination.currentPage, sort?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationInwardOutwardRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    SortBy: sort ? getSortByParam(sort, OutwardDataColumns) : undefined,
                    DeliveryType: 'Outward',
                };

                const response = await inwardOutwardService.apiCallPullInwardOutwardData(params);

                if (E.isRight(response)) {
                    setOutwardDataList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Outward Data'
        );
    }, [pagination.currentPage, pagination.pageSize, addToast, setPagination]);
    //#endregion

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadOutwardData(page);
    };

    const OutwardDataColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'SenderName',
            label: 'Sender Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'ReceiverName',
            label: 'Receiver Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'ReceiversRemark',
            label: 'Receiver Remark',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'InwardOutwardStatus',
            label: 'Inward Outward Status',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'CreatedBy',
            label: 'Created By',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value, row) => value ? formatDate_dd_MonthName_yy(row.CreatedBy) : '-'
        },
    ], []);

    //#region TABLE SORT COLUMN
    const handleOutwardSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadOutwardData(1, sort);
    }, [loadOutwardData, setPagination]);
    //#endregion

    //#region OUTWARD DATA TABLE PAGINATION INFO
    const OutwardPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const OutwardDataForTable = useMemo(() => outwardDataList, [outwardDataList]);
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <DataTable
                data={OutwardDataForTable}
                columns={OutwardDataColumns}
                pagination={OutwardPaginationInfo}
                emptyMessage="No Outward Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleOutwardSortColumn}
            />
        </div>
    );
}

export default Outward;