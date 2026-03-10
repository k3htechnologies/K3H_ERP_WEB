import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import type { InwardOutwardData, FilterWithPaginationInwardOutwardRequest } from "@/features/inwardOutward/models/InwardOutwardModel";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type PaginationInfo, type TableColumn, type SortInfo, } from "@/ui/components/DataTable/DataTable";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { inwardOutwardService } from "@/features/inwardOutward/services/InwardOutwardService";
import * as E from 'fp-ts/Either';
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";


export const InwardOutwardTable: React.FC = () => {

    //STATE
    const [inwardOutwardDataList, setInwardOutwardDataList] = useState<InwardOutwardData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();

    //Pagination
    const { pagination, setPagination } = usePagination(20);

    // TOAST
    const { addToast } = useToast();

    //#region INIT
    useEffect(() => {
        fetchInwardOutwardData(1);
    }, []);

    //#region DATA LOADING | FETCH |

    const fetchInwardOutwardData = async (page: number = pagination.currentPage) => {
        return await loadInwardOutwardData(page);
    };

    const loadInwardOutwardData = useCallback(async (page: number = pagination.currentPage, sort?: SortInfo) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationInwardOutwardRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    SortBy: getSortByParam(sort ?? null, InwardOutwardDataColumns),
                };

                const response = await inwardOutwardService.apiCallPullInwardOutwardData(params);

                if (E.isRight(response)) {
                    setInwardOutwardDataList(response.right.Data);
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
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Inward Outward Data'
        );
    },
        [pagination.currentPage, pagination.pageSize, addToast, setPagination,]);
    //#endregion

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadInwardOutwardData(page);
    };
    //#endregion

    const InwardOutwardDataColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'DeliveryType',
            label: 'Delivery Type',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: value => value || '-'
        },

        {
            key: 'InwardOutwardDate',
            label: 'Inward Outward Date',
            width: '15',
            sortable: false,
            align: 'center',
        },
        {
            key: 'SenderName',
            label: 'Sender Name',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'SenderAddress',
            label: 'Sender Address',
            width: '33',
            sortable: false,
            align: 'left',
        },
        {
            key: 'SenderMobileNo',
            label: 'Sender Mobile No',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'ReceiverName',
            label: 'Receiver Name',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'ReceiverAddress',
            label: 'Receiver Address',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'ReceiverMobileNo',
            label: 'Receiver Mobile Number',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'DocumentURL',
            label: 'Document URL',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'EmployeeNames',
            label: 'Employee Names',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'ReceiversRemark',
            label: 'Receivers Remark',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'CourierMode',
            label: 'Courier Mode',
            width: '15',
            sortable: false,
            align: 'center',
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
            key: 'AcknowledgementURL',
            label: 'Acknowledgement URL',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'ReceptionalRemark',
            label: 'Receptional Remark',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
        {
            key: 'CreatedDate',
            label: 'Last Modified Date',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value, row) => value ? formatDate_dd_MonthName_yy(row.CreatedDate) : '-'
        },
        {
            key: 'CreatedBy',
            label: 'Created By',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value, row) => value ? formatDate_dd_MonthName_yy(row.CreatedBy) : '-'
        },
        {
            key: 'ModifiedBy',
            label: 'Last Modified By',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value, row) => value ? formatDate_dd_MonthName_yy(row.ModifiedBy) : '-'
        },
        {
            key: 'ModifiedDate',
            label: 'Last Modified Date',
            width: '33',
            sortable: false,
            align: 'left',
            render: (value, row) => value ? formatDate_dd_MonthName_yy(row.ModifiedDate) : '-'
        },
    ], []);
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadInwardOutwardData(1, sort);

    }, []);

    //#endregion

    //#region CALLING DATA TABLE PAGINATION INFO
    const InwardOutwardPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const InwardOutwardDataForTable = useMemo(() => inwardOutwardDataList, [inwardOutwardDataList]);

    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            {/* DATA - TABLE */}
            <DataTable
                data={InwardOutwardDataForTable}
                columns={InwardOutwardDataColumns}
                pagination={InwardOutwardPaginationInfo}
                emptyMessage="No Inward Outward Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />
        </div>
    );


}

export default InwardOutwardTable;