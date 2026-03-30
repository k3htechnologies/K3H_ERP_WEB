import usePagination from "@/core/hooks/usePagination";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { DataTable, type FilterInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type FilterWithPaginationInwardAndOutWardRequest, type InwardAndOutWardData } from "../models/InwardAndOutWardModel";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { InwardService } from "../services/InwardAndOutWardService";
import * as E from 'fp-ts/Either';
import type { PaginationInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { Loader } from "@/core/utils/loader";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

export const Inward: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [inwardDataList, setInwardDataList] = useState<InwardAndOutWardData[]>([]);

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    // TOAST
    const { addToast } = useToast();


    const loadInward = async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo,) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationInwardAndOutWardRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    Status: filterParams.Status ?? undefined,
                    SortBy: getSortByParam(sort ?? null, InwardDataColumns),
                }

                const response = await InwardService.apiCallPullInward(params);
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
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Inward Data'
        );
        [pagination.currentPage, pagination.pageSize, addToast, setPagination]
    };
    //#endregion

    //#region INIT
    useEffect(() => {

        setPagination({ currentPage: 1 });
        loadInward(1, {});
    }, []);
    //#endregion

    //#region INWARD TABLE COLUMNS
    const InwardDataColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'DocumentID',
            label: 'Document ID',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    tooltipThreshold={20}
                    maxWidth="180px"
                />
            )
        },
        {
            key: 'Type',
            label: 'Type',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'Title',
            label: 'Title',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'Priority',
            label: 'Priority',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'Status',
            label: 'Status',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'AssignedTo',
            label: 'Assigned To',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'

        },
        {
            key: 'Actions',
            label: 'Actions',
            width: '15',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },
    ], []);
    //#endregion

    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadInward(page, {});
    };
    //#endregion

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadInward(1, {}, sort);
    }, []);
    //#endregion

    const InwardDataPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const InwardDataForTable = useMemo(() => inwardDataList, [inwardDataList]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            {/* DATA TABLE */}
            <DataTable
                data={InwardDataForTable}
                columns={InwardDataColumns}
                pagination={InwardDataPaginationInfo}
                emptyMessage="No Inward Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

        </div>

    )
}
export default Inward;
