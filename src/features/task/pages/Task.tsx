import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import * as E from 'fp-ts/Either';
import { useNavigate } from 'react-router-dom';

import { Loader } from '@/core/utils/loader';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import useToast from '@/core/hooks/useToast';
import usePagination from '@/core/hooks/usePagination';
import { runApiWithLoader } from '@/core/utils';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { handleExportFile } from '@/core/utils/exportFile';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { useTaskListState } from '@/features/task/context/TaskListStateContext';
import type { DeleteTaskDetailsRequest, FilterWithPaginationTaskDetailsRequest, TaskDetails } from '@/features/task/models/TaskModel';
import { TASK_TYPE } from '@/features/task/constants/taskConstants';
import { taskService } from '@/features/task/services/TaskService';
import type { AgendaData, DeleteAgendaRequest, FilterWithPaginationAgendaRequest } from '@/features/meeting/models/AgendaModel';
import { agendaService } from '@/features/meeting/services/AgendaService';
import { getTaskPriorityColor, getTaskStatusColor } from '@/features/task/utils/taskUtils';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Button } from '@/ui/components/forms';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { Tabs } from '@/ui/components/Tab/Tab';

export const Task: React.FC = () => {

    const taskTabList = [
        { id: 'Task', label: 'Task' },
        { id: 'AgendaTask', label: 'Agenda Task' },
    ];

    const [activeTab, setActiveTab] = useState<string>(taskTabList[0].id);
    const isTaskTab = activeTab === 'Task';
    const isAgendaTaskTab = activeTab === 'AgendaTask';
    const [taskList, setTaskList] = useState<TaskDetails[]>([]);
    const [agendaTaskList, setAgendaTaskList] = useState<AgendaData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isShowCustomizeTaskColumnsModal, setIsShowCustomizeTaskColumnsModal] = useState(false);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteTaskData, setDeleteTaskData] = useState<TaskDetails | null>(null);
    const [deleteAgendaTaskData, setDeleteAgendaTaskData] = useState<AgendaData | null>(null);
    
    const navigate = useNavigate();
    const { projectId } = useProject();

    const { addToast } = useToast();

    const { pagination, setPagination } = usePagination(20);

    const { pagination: agendaPagination, setPagination: setAgendaPagination } = usePagination(20);

    const { canAction, canExport } = useMenuPermissions('/event');

    const {
        listState,
        updateListState,
        resetFilters,
        setTaskContext,
        agendaTaskListState,
        updateAgendaTaskListState,
        resetAgendaTaskFilters,
        setAgendaTaskContext,
    } = useTaskListState();

    const { page, filters, sortInfo, searchTerm } = listState;

    const {
        page: agendaTaskPage,
        filters: agendaTaskFilters,
        sortInfo: agendaTaskSortInfo,
        searchTerm: agendaTaskSearchTerm,
    } = agendaTaskListState;

    const handleViewTaskDetails = useCallback(
        (row: TaskDetails) => {
            setTaskContext(row.TaskId ?? 0, row.TaskTitle ?? '');
            navigate(`/task/view/${row.TaskId}`);
        },
        [navigate, setTaskContext],
    );

    const handleConfirmationDialogBoxOpen = useCallback((row: TaskDetails) => {
        setDeleteTaskData(row);
        setDeleteAgendaTaskData(null);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const taskColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'TaskId',
                label: 'Task Id',
                width: '20',
                sortable: false,
                align: 'left',
                render: (_value, row) => (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="min-w-0">
                                <TooltipText
                                    text={row.SystemGeneratedCode || (row.TaskId > 0 ? String(row.TaskId) : '-')}
                                    maxWidth="260px"
                                    tooltipThreshold={26}
                                    onClick={() => handleViewTaskDetails(row)}
                                />
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                key: 'TaskTitle',
                label: 'Task Title',
                width: '14',
                sortable: false,
                align: 'left',
                render: value => value || '-',
            },
            {
                key: 'TaskPriority',
                label: 'Priority',
                width: '12',
                sortable: true,
                align: 'left',
                render: value => {
                    const displayPriority = value ? String(value) : '-';
                    if (displayPriority === '-') return displayPriority;

                    const { bg, text } = getTaskPriorityColor(displayPriority);
                    return (
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{ backgroundColor: bg, color: text }}
                        >
                            {displayPriority}
                        </span>
                    );
                },
            },
            {
                key: 'TaskInitialStatus',
                label: 'Status',
                width: '14',
                sortable: true,
                align: 'left',
                render: value => {
                    const displayStatus = value ? String(value) : '-';
                    if (displayStatus === '-') return displayStatus;

                    const { bg, text } = getTaskStatusColor(displayStatus);
                    return (
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{ backgroundColor: bg, color: text }}
                        >
                            {displayStatus}
                        </span>
                    );
                },
            },
            {
                key: 'DueDate',
                label: 'Deadline',
                width: '16',
                sortable: true,
                align: 'center',
                render: value => (value ? formatDate_dd_MonthName_yy(value) : '-'),
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: '12',
                fixed: 'right',
                align: 'center',
                render: (_value, row) => {
                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!canAction) return;
                                    handleConfirmationDialogBoxOpen(row);
                                }}
                                color="transparent"
                                isborderRadius
                                disabled={!canAction}
                                size="sm"
                                style={{
                                    color: canAction ? 'red' : '#9CA3AF',
                                    padding: '4px 8px',
                                    cursor: canAction ? 'pointer' : 'not-allowed',
                                    opacity: canAction ? 1 : 0.5,
                                }}
                                title="Delete Task"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [canAction, handleViewTaskDetails, handleConfirmationDialogBoxOpen],
    );

    const loadTasks = async (pageNum: number, filterParams: FilterInfo, sort?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaskDetailsRequest = {
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,
                    TaskType: TASK_TYPE.Task,
                    TaskTitle: filterParams.Name ?? filterParams.TaskName,
                    TaskId: filterParams.TaskId ? Number(filterParams.TaskId) : undefined,
                    DueDate: filterParams.DueDate,
                    TaskPriorityId: filterParams.TaskPriorityId,
                    SortBy: getSortByParam(sort ?? null, taskColumns),
                };

                const response = await taskService.apiCallPullTask(params);

                if (E.isRight(response)) {
                    setTaskList(response.right.Data);

                    setPagination({
                        currentPage: pageNum,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
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
            'Loading Tasks',
        );
    };

    useEffect(() => {
        if (!isTaskTab) return;
        if (!projectId) return;

        if (searchTerm && searchTerm.trim()) {
            loadTasks(page, { Name: searchTerm.trim() }, sortInfo);
        } else {
            loadTasks(page, filters, sortInfo);
        }
    }, [projectId, page, filters, sortInfo, searchTerm, isTaskTab]);

    useEffect(() => {
        setPagination({ currentPage: page });
    }, [page]);

    const debouncedTaskSearch = useDebouncedCallback((value: string, isSerach: boolean = true) => {
        let filterParams: FilterInfo = {};

        if (value.trim() === '') {
            updateListState({ searchTerm: '', filters: {}, page: 1 });
            return;
        }

        if (isSerach) {
            filterParams = { Name: value.trim() };
        }

        updateListState({ searchTerm: value, filters: filterParams, page: 1 });
    }, 350);

    const searchTasks = (searchValue: string) => {
        updateListState({ searchTerm: searchValue });

        debouncedTaskSearch(searchValue, false);
    };

    const clearSearchTasks = () => {
        debouncedTaskSearch.cancel?.();
        resetFilters();
    };

    const handleExportTasks = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaskDetailsRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    TaskType: TASK_TYPE.Task,
                    TaskTitle: searchTerm?.trim() || undefined,
                    TaskId: filters.TaskId ? Number(filters.TaskId) : undefined,
                    SortBy: getSortByParam(sortInfo ?? null, taskColumns),
                    ExportType: exportType,
                };

                const response = await taskService.apiCallPullTask(params);

                handleExportFile(response, exportType, 'Task Master', addToast);

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' });
            },
            undefined,
            'Preparing Export',
        );
    };

    const handleExportTaskExcel = () => handleExportTasks('Excel');
    const handleExportTaskPdf = () => handleExportTasks('PDF');

    const handlePageChange = useCallback(
        (newPage: number) => {
            updateListState({ page: newPage });
        },
        [updateListState],
    );

    const handleSortColumn = useCallback(
        (sort: SortInfo) => {
            updateListState({ sortInfo: sort, page: 1 });
        },
        [updateListState],
    );

    const taskPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [
            pagination.currentPage,
            pagination.totalPages,
            pagination.totalRecords,
            pagination.pageSize,
            handlePageChange,
        ],
    );

    const requiredTaskColumnKeys: string[] = ['TaskId', 'Actions'];

    const allTaskColumnKeys: string[] = taskColumns.map(c => c.key);

    const [selectedTaskColumnKeys, setSelectedTaskColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getTaskTableColumns();

            if (saved) {
                const parsed = JSON.parse(saved) as string[];

                const withRequired = Array.from(new Set([...parsed, ...requiredTaskColumnKeys]));

                return withRequired.filter(k => allTaskColumnKeys.includes(k));
            }
        } catch { }

        return allTaskColumnKeys;
    });

    useEffect(() => {
        setSelectedTaskColumnKeys(prev =>
            Array.from(new Set([...prev, ...requiredTaskColumnKeys])).filter(k =>
                allTaskColumnKeys.includes(k),
            ),
        );
    }, [taskColumns.length]);

    const visibleTaskColumns = useMemo(
        () => taskColumns.filter(col => selectedTaskColumnKeys.includes(col.key)),
        [taskColumns, selectedTaskColumnKeys],
    );

    const handleDeleteTask = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteTaskData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteTaskDetailsRequest = {
                    TaskId: deleteTaskData.TaskId || 0,
                    UniqueKey: deleteTaskData.UniqueKey || '',
                };

                const response = await taskService.apiCallDeleteTask(params);

                if (E.isRight(response)) {
                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    } else if (taskList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }

                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });

                    await loadTasks(pageToShow, searchTerm?.trim() ? { Name: searchTerm.trim() } : filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    setDeleteTaskData(null);
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
            'Deleting Task',
        );
    };

    const handleViewAgendaTaskDetails = useCallback(
        (row: AgendaData) => {
            setAgendaTaskContext(row.AgendaId ?? 0, row.AgendaTitle ?? '');
            navigate(`/task/view/${row.AgendaId}?isAgendaTask=true`);
        },
        [navigate, setAgendaTaskContext],
    );

    const handleAgendaConfirmationDialogBoxOpen = useCallback((row: AgendaData) => {
        setDeleteAgendaTaskData(row);
        setDeleteTaskData(null);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const agendaTaskColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'AgendaId',
                label: 'Agenda Task Id',
                width: '20',
                sortable: false,
                align: 'left',
                render: (value, row) => (
                    <div className="min-w-0">
                        <TooltipText
                            text={value || '-'}
                            maxWidth="260px"
                            tooltipThreshold={26}
                            onClick={() => handleViewAgendaTaskDetails(row)}
                        />
                    </div>
                ),
            },
            {
                key: 'AgendaTitle',
                label: 'Title',
                width: '18',
                sortable: false,
                align: 'left',
                render: value => value || '-',
            },
            {
                key: 'Priority',
                label: 'Priority',
                width: '12',
                sortable: true,
                align: 'left',
                render: value => {
                    const displayPriority = value ? String(value) : '-';
                    if (displayPriority === '-') return displayPriority;

                    const { bg, text } = getTaskPriorityColor(displayPriority);
                    return (
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{ backgroundColor: bg, color: text }}
                        >
                            {displayPriority}
                        </span>
                    );
                },
            },
            {
                key: 'AgendaStatus',
                label: 'Status',
                width: '14',
                sortable: true,
                align: 'left',
                render: value => {
                    const displayStatus = value ? String(value) : '-';
                    if (displayStatus === '-') return displayStatus;

                    const { bg, text } = getTaskStatusColor(displayStatus);
                    return (
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{ backgroundColor: bg, color: text }}
                        >
                            {displayStatus}
                        </span>
                    );
                },
            },
            {
                key: 'DueDate',
                label: 'Due Date',
                width: '16',
                sortable: true,
                align: 'center',
                render: value => (value ? formatDate_dd_MonthName_yy(value) : '-'),
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: '12',
                fixed: 'right',
                align: 'center',
                render: (_value, row) => {
                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!canAction) return;
                                    handleAgendaConfirmationDialogBoxOpen(row);
                                }}
                                color="transparent"
                                isborderRadius
                                disabled={!canAction}
                                size="sm"
                                style={{
                                    color: canAction ? 'red' : '#9CA3AF',
                                    padding: '4px 8px',
                                    cursor: canAction ? 'pointer' : 'not-allowed',
                                    opacity: canAction ? 1 : 0.5,
                                }}
                                title="Delete Agenda Task"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [canAction, handleViewAgendaTaskDetails, handleAgendaConfirmationDialogBoxOpen],
    );

    const loadAgendaTasks = async (pageNum: number, filterParams: FilterInfo, sort?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAgendaRequest = {
                    PageNumber: pageNum,
                    PageSize: agendaPagination.pageSize,
                    IsAgendaTask: true,
                    AgendaTitle: filterParams.Name ?? filterParams.AgendaTitle,
                    AgendaId: filterParams.AgendaId ? Number(filterParams.AgendaId) : undefined,
                    DueDate: filterParams.DueDate,
                    PriorityId: filterParams.PriorityId ? Number(filterParams.PriorityId) : undefined,
                    SortBy: getSortByParam(sort ?? null, agendaTaskColumns),
                };

                const response = await agendaService.apiCallPullAgenda(params);

                if (E.isRight(response)) {
                    setAgendaTaskList(response.right.Data ?? []);

                    setAgendaPagination({
                        currentPage: pageNum,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / agendaPagination.pageSize),
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
            'Loading Agenda Task',
        );
    };

    useEffect(() => {
        if (!isAgendaTaskTab) return;
        if (!projectId) return;

        if (agendaTaskSearchTerm && agendaTaskSearchTerm.trim()) {
            loadAgendaTasks(agendaTaskPage, { Name: agendaTaskSearchTerm.trim() }, agendaTaskSortInfo);
        } else {
            loadAgendaTasks(agendaTaskPage, agendaTaskFilters, agendaTaskSortInfo);
        }
    }, [projectId, agendaTaskPage, agendaTaskFilters, agendaTaskSortInfo, agendaTaskSearchTerm, isAgendaTaskTab]);

    useEffect(() => {
        setAgendaPagination({ currentPage: agendaTaskPage });
    }, [agendaTaskPage]);

    const debouncedAgendaTaskSearch = useDebouncedCallback((value: string, isSerach: boolean = true) => {
        let filterParams: FilterInfo = {};

        if (value.trim() === '') {
            updateAgendaTaskListState({ searchTerm: '', filters: {}, page: 1 });
            return;
        }

        if (isSerach) {
            filterParams = { Name: value.trim() };
        }

        updateAgendaTaskListState({ searchTerm: value, filters: filterParams, page: 1 });
    }, 350);

    const searchAgendaTasks = (searchValue: string) => {
        updateAgendaTaskListState({ searchTerm: searchValue });

        debouncedAgendaTaskSearch(searchValue, false);
    };

    const clearSearchAgendaTasks = () => {
        debouncedAgendaTaskSearch.cancel?.();
        resetAgendaTaskFilters();
    };

    const handleExportAgendaTasks = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAgendaRequest = {
                    PageNumber: 1,
                    PageSize: agendaPagination.totalRecords,
                    IsAgendaTask: true,
                    AgendaTitle: agendaTaskSearchTerm?.trim() || undefined,
                    AgendaId: agendaTaskFilters.AgendaId
                        ? Number(agendaTaskFilters.AgendaId)
                        : undefined,
                    SortBy: getSortByParam(agendaTaskSortInfo ?? null, agendaTaskColumns),
                    ExportType: exportType,
                };

                const response = await agendaService.apiCallPullAgenda(params);

                handleExportFile(response, exportType, 'Agenda Task', addToast);

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' });
            },
            undefined,
            'Preparing Export',
        );
    };

    const handleExportAgendaTaskExcel = () => handleExportAgendaTasks('Excel');
    const handleExportAgendaTaskPdf = () => handleExportAgendaTasks('PDF');

    const handleAgendaPageChange = useCallback(
        (newPage: number) => {
            updateAgendaTaskListState({ page: newPage });
        },
        [updateAgendaTaskListState],
    );

    const handleAgendaSortColumn = useCallback(
        (sort: SortInfo) => {
            updateAgendaTaskListState({ sortInfo: sort, page: 1 });
        },
        [updateAgendaTaskListState],
    );

    const agendaTaskPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: agendaPagination.currentPage,
            totalPages: agendaPagination.totalPages,
            totalRecords: agendaPagination.totalRecords,
            pageSize: agendaPagination.pageSize,
            onPageChange: handleAgendaPageChange,
        }),
        [
            agendaPagination.currentPage,
            agendaPagination.totalPages,
            agendaPagination.totalRecords,
            agendaPagination.pageSize,
            handleAgendaPageChange,
        ],
    );

    const requiredAgendaTaskColumnKeys: string[] = ['AgendaId', 'Actions'];

    const allAgendaTaskColumnKeys: string[] = agendaTaskColumns.map(c => c.key);

    const [selectedAgendaTaskColumnKeys, setSelectedAgendaTaskColumnKeys] = useState<string[]>(
        () => {
            try {
                const saved = LocalStorageHelper.getAgendaTaskTableColumns();

                if (saved) {
                    const parsed = JSON.parse(saved) as string[];

                    const withRequired = Array.from(new Set([...parsed, ...requiredAgendaTaskColumnKeys]));

                    return withRequired.filter(k => allAgendaTaskColumnKeys.includes(k));
                }
            } catch { }

            return allAgendaTaskColumnKeys;
        },
    );

    useEffect(() => {
        setSelectedAgendaTaskColumnKeys(prev =>
            Array.from(new Set([...prev, ...requiredAgendaTaskColumnKeys])).filter(k =>
                allAgendaTaskColumnKeys.includes(k),
            ),
        );
    }, [agendaTaskColumns.length]);

    const visibleAgendaTaskColumns = useMemo(
        () => agendaTaskColumns.filter(col => selectedAgendaTaskColumnKeys.includes(col.key)),
        [agendaTaskColumns, selectedAgendaTaskColumnKeys],
    );

    const handleDeleteAgendaTask = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteAgendaTaskData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteAgendaRequest = {
                    AgendaId: deleteAgendaTaskData.AgendaId || 0,
                    UniqueKey: deleteAgendaTaskData.UniqueKey || '',
                };

                const response = await agendaService.apiCallDeleteAgenda(params);

                if (E.isRight(response)) {
                    const newTotalRecords = agendaPagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / agendaPagination.pageSize));

                    let pageToShow = agendaPagination.currentPage;

                    if (agendaPagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    } else if (agendaTaskList.length === 1 && agendaPagination.currentPage > 1) {
                        pageToShow = agendaPagination.currentPage - 1;
                    }

                    setAgendaPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages,
                    });

                    await loadAgendaTasks(
                        pageToShow,
                        agendaTaskSearchTerm?.trim() ? { Name: agendaTaskSearchTerm.trim() } : agendaTaskFilters,
                        agendaTaskSortInfo,
                    );

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    setDeleteAgendaTaskData(null);
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
            'Deleting Agenda Task',
        );
    };

    const handleAddTask = useCallback(() => {
        navigate('/task/add');
    }, [navigate]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
           
            <TableActionToolbar
                isShowSearchBar
                searchTerm={isAgendaTaskTab ? agendaTaskSearchTerm : searchTerm}
                searchPlaceholder={
                    isAgendaTaskTab ? 'Search By Agenda Title' : 'Search By Task Title'
                }
                onSearchChange={isAgendaTaskTab ? searchAgendaTasks : searchTasks}
                onClearSearch={isAgendaTaskTab ? clearSearchAgendaTasks : clearSearchTasks}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeTaskColumnsModal(true)}
                isShowImportButton={false}
                isShowExportButton={
                    canExport &&
                    (isAgendaTaskTab
                        ? agendaTaskList.length > 0
                        : taskList.length > 0)
                }
                onExportExcel={
                    isAgendaTaskTab ? handleExportAgendaTaskExcel : handleExportTaskExcel
                }
                onExportPdf={isAgendaTaskTab ? handleExportAgendaTaskPdf : handleExportTaskPdf}
                exportLoading={isLoading}
                isShowAddButton={canAction && isTaskTab}
                addTitle="Add"
                onAdd={handleAddTask}
            />

            <div className="pb-5">
                <Tabs
                    tabs={taskTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={t => {
                        setActiveTab(t.id);
                    }}
                />
            </div>

            {isAgendaTaskTab ? (
                <DataTable
                    data={agendaTaskList}
                    columns={visibleAgendaTaskColumns}
                    pagination={agendaTaskPaginationInfo}
                    emptyMessage="No Agenda Task Data Found"
                    fixedHeight
                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={agendaTaskSortInfo}
                    onSort={handleAgendaSortColumn}
                />
            ) : (
                <DataTable
                    data={taskList}
                    columns={visibleTaskColumns}
                    pagination={taskPaginationInfo}
                    emptyMessage="No Task Data Found"
                    fixedHeight
                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                />
            )}

            <CustomizeColumnsModal
                isOpen={isShowCustomizeTaskColumnsModal}
                onClose={() => setIsShowCustomizeTaskColumnsModal(false)}
                onApply={(keys) => {
                    if (isAgendaTaskTab) {
                        const withRequired = Array.from(
                            new Set([...keys, ...requiredAgendaTaskColumnKeys]),
                        );
                        setSelectedAgendaTaskColumnKeys(withRequired);
                        try {
                            LocalStorageHelper.storeAgendaTaskTableColumns(
                                JSON.stringify(withRequired),
                            );
                        } catch { }
                    } else {
                        const withRequired = Array.from(
                            new Set([...keys, ...requiredTaskColumnKeys]),
                        );
                        setSelectedTaskColumnKeys(withRequired);
                        try {
                            LocalStorageHelper.storeTaskTableColumns(
                                JSON.stringify(withRequired),
                            );
                        } catch { }
                    }
                }}
                columns={isAgendaTaskTab ? agendaTaskColumns : taskColumns}
                selectedKeys={
                    isAgendaTaskTab ? selectedAgendaTaskColumnKeys : selectedTaskColumnKeys
                }
                requiredKeys={
                    isAgendaTaskTab ? requiredAgendaTaskColumnKeys : requiredTaskColumnKeys
                }
                title="Customize Table Columns"
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteTaskData(null);
                    setDeleteAgendaTaskData(null);
                }}
                onConfirm={isAgendaTaskTab ? handleDeleteAgendaTask : handleDeleteTask}
                loading={isLoading}
                pageName={isAgendaTaskTab ? 'Agenda Task' : 'Task'}
            />
        </div>
    );
};

export default Task;
