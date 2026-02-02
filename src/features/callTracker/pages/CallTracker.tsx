import React, { useCallback, useMemo, useState } from 'react';
import usePagination from '@/core/hooks/usePagination';
import useToast from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import type { SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { callTrackerService } from '@/features/callTracker/services/CallTrackerService';
import * as E from 'fp-ts/Either';
import type {
    CallTrackerData,
    FilterWithPaginationCallTrackerRequest,
} from '@/features/callTracker/models/CallTrackerModel';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { handleExportFile } from '@/core/utils/exportFile';
import TooltipText from '@/ui/components/Tooltip/TooltipText';

export const CallTracker: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // PAGINATION
    const { pagination, setPagination } = usePagination(20);

    const { projectId } = useProject();
    const { canExport } = useMenuPermissions();

    // TOAST
    const { addToast } = useToast();

    // STATE
    const [callTrackerList, setCallTrackerList] = useState<CallTrackerData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [filters] = useState<{ Name?: string }>({});

    const loadCallTracker = useCallback(async (page: number, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCallTrackerRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    Name: searchText?.trim() || undefined,
                    SortBy: getSortByParam(sort ?? null, CallTrackerColumns),
                };

                const response = await callTrackerService.apiCallPullCallTracker(params);

                if (E.isRight(response)) {
                    setCallTrackerList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message, });
                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Call Tracker'
        );
    },
        [projectId, pagination.pageSize, addToast, setPagination]
    );

    //#region SEARCH
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadCallTracker(1, sortInfo, value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadCallTracker(1, sortInfo, '');
    };
    //#endregion

    //#region EXPORT
    const handleExportCallTracker = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCallTrackerRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    Name: filters.Name?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, CallTrackerColumns),
                    ExportType: exportType,
                };

                const response =
                    await callTrackerService.apiCallPullCallTracker(params);

                handleExportFile(response, exportType, 'Call tracker', addToast);
                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed', }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportCallTrackerExcel = () => handleExportCallTracker('Excel');
    const handleExportCallTrackerPdf = () => handleExportCallTracker('PDF');
    //#endregion

    const CallTrackerColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'Name',
            label: 'Name',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            )
        },
    ], []);
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}><div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                //EXPORT
                isShowExportButton={canExport}
                onExportExcel={handleExportCallTrackerExcel}
                onExportPdf={handleExportCallTrackerPdf}
                exportLoading={isLoading}
            />

        </div>
    );
};

export default CallTracker;
