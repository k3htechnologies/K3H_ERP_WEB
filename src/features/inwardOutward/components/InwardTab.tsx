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

export const Inward: React.FC = () => {
    //STATE
    const [inwardDataList, setInwardDataList] = useState<InwardOutwardData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();

    //Pagination
    const { pagination, setPagination } = usePagination(20);

    // TOAST
    const { addToast } = useToast();

    //#region INIT
    useEffect(() => {
        fetchInwardData(1);
    }, []);

    //#region DATA LOADING | FETCH |
    const fetchInwardData = async (page: number = pagination.currentPage) => {
        return await loadInwardData(page);
    };

    const loadInwardData = useCallback(async (page: number = pagination.currentPage, sort?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationInwardOutwardRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    SortBy: sort ? getSortByParam(sort, InwardOutwardDataColumns) : undefined,
                    DeliveryType: 'Inward',
                };

                const response = await inwardOutwardService.apiCallPullInwardOutwardData(params);

                if (E.isRight(response)) {
                    setInwardDataList(response.right.Data);
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
            'Loading Inward Data'
        );
    }, [pagination.currentPage, pagination.pageSize, addToast, setPagination]);
    //#endregion

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadInwardData(page);
    };

    const InwardOutwardDataColumns = useMemo<TableColumn[]>(() => [
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
    const handleInwardSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadInwardData(1, sort);
    }, [loadInwardData, setPagination]);
    //#endregion

    //#region INWARD DATA TABLE PAGINATION INFO
    const InwardPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );

    const InwardDataForTable = useMemo(() => inwardDataList, [inwardDataList]);
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <DataTable
                data={InwardDataForTable}
                columns={InwardOutwardDataColumns}
                pagination={InwardPaginationInfo}
                emptyMessage="No Inward Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleInwardSortColumn}
            />
        </div>
    );
}

export default Inward;