import React, { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import type { FilterWithPaginationInventoryParkingOverallReportRequest, InventoryParkingOverallReportData } from '@/features/inventoryParkingOverallReport/models/InventoryParkingOverallReportModel'
import { inventoryParkingOverallReportService } from '@/features/inventoryParkingOverallReport/services/InventoryParkingOverallReportService';
import { Loader } from '@/core/utils/loader';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { useToast } from '@/core/hooks/useToast';

export const InventoryParkingOverallReport: React.FC = () => {

    // #region STATE
    const [inventoryParkingOverallReportList, setInventoryParkingOverallReportList] = useState<InventoryParkingOverallReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const { pagination, setPagination } = usePagination(20);

    const { addToast } = useToast();

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject()
    //#endregion

    // #region INIT
    useEffect(() => {
        if (!projectId) return;
        loadInventoryParkingOverallReport(1)
    }, [projectId])
    //#endregion

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

    // #region DATA LOAD INVENTORY PARKING OVERALL REPORT
    const loadInventoryParkingOverallReport = async (pageNum: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationInventoryParkingOverallReportRequest = {
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,
                    ProjectId: projectId ?? undefined,
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

    //#region TABLE COLUMN
    const inventoryParkingOverallReportColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'ProjectName',
                label: 'Project Name',
                width: '14',
                sortable: true,
                align: 'left',
                render: value => value || '-'
            },
        ],
        []
    );
    //#endregion


    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <DataTable
                data={inventoryParkingOverallReportList}
                columns={inventoryParkingOverallReportColumns}
                pagination={inventoryParkingOverallReportPaginationInfo}
                emptyMessage="No Data Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
            />
        </div>
    );
};

export default InventoryParkingOverallReport;
