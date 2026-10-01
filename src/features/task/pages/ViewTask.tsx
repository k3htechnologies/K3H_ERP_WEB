import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { getDocumentNameFromUrl, parseDocumentUrls } from '@/core/utils/documentUtils';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { getNameInitials } from '@/core/utils/getNameInitials';
import { Loader } from '@/core/utils/loader';
import { useToast } from '@/core/hooks/useToast';
import usePagination from '@/core/hooks/usePagination';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useTaskListState } from '@/features/task/context/TaskListStateContext';
import type { FilterWithPaginationTaskDetailsRequest, TaskDetails, TaskTagData } from '@/features/task/models/TaskModel';
import { TASK_TYPE } from '@/features/task/constants/taskConstants';
import type { AgendaData, FilterWithPaginationAgendaRequest } from '@/features/meeting/models/AgendaModel';
import { agendaService } from '@/features/meeting/services/AgendaService';
import { taskService } from '@/features/task/services/TaskService';
import { getTaskPriorityColor, getTaskStatusColor } from '@/features/task/utils/taskUtils';
import { AddEditSubTaskModal, SubTaskRow, TaskDiscussionsSection, TaskProgressBar, TaskTimelineTab } from '@/features/task/components';
import { Button } from '@/ui/components/forms';
import type { PaginationInfo } from '@/ui/components/DataTable/DataTable';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { Modal } from '@/ui/components/Modal/Modal';
import Pagination from '@/ui/components/Pagination/Pagination';
import { Tabs } from '@/ui/components/Tab/Tab';

export const ViewTask: React.FC = () => {

    const [task, setTask] = useState<TaskDetails | null>(null);
    const [agendaTask, setAgendaTask] = useState<AgendaData | null>(null);
    const [subTasks, setSubTasks] = useState<TaskDetails[]>([]);
    const [agendaSubTasks, setAgendaSubTasks] = useState<AgendaData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [discussionCount, setDiscussionCount] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [editingSubTaskId, setEditingSubTaskId] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
    const [taskTags, setTaskTags] = useState<TaskTagData[]>([]);
    const [isTagsLoading, setIsTagsLoading] = useState(false);
    const [tagsLoadingMessage, setTagsLoadingMessage] = useState('');

    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isAgendaTask = searchParams.get('isAgendaTask') === 'true';
    const { taskId: taskIdParam } = useParams<{ taskId?: string }>();
    const { listState, setTaskContext, setAgendaTaskContext } = useTaskListState();
    const { pagination, setPagination, resetPagination } = usePagination(10);

    const paramTaskId = taskIdParam ? Number(taskIdParam) : 0;
    const taskIdNumber = Number.isInteger(paramTaskId) && paramTaskId > 0 ? paramTaskId : Number(listState.taskId);

    const { canAction } = useMenuPermissions('/event');

    const fetchAgendaTaskDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAgendaRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    AgendaId: taskIdNumber,
                    IsAgendaTask: true,
                    ParentTaskId: 0,
                    TaskType: TASK_TYPE.Task,
                };

                const response = await agendaService.apiCallPullAgenda(params);

                if (E.isRight(response)) {
                    const agenda = response.right.Data?.[0];

                    if (agenda) {
                        setAgendaTask(agenda);

                        setAgendaTaskContext(agenda.AgendaId, agenda.AgendaTitle);

                        const subTaskParams: FilterWithPaginationAgendaRequest = {
                            PageNumber: 1,
                            PageSize: 100,
                            ParentTaskId: taskIdNumber,
                            TaskType: TASK_TYPE.SubTask,
                            IsAgendaTask: true,
                            MeetingId: agenda.MeetingId,
                        };

                        const subTaskResponse = await agendaService.apiCallPullAgenda(subTaskParams);

                        if (E.isRight(subTaskResponse)) {
                            setAgendaSubTasks(subTaskResponse.right.Data);
                        }
                    }
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
            'Loading Task',
        );
    };

    const fetchTaskDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaskDetailsRequest = {
                    PageSize: 1,
                    PageNumber: 1,
                    TaskId: taskIdNumber,
                    TaskType: TASK_TYPE.Task,
                };

                const response = await taskService.apiCallPullTask(params);

                if (E.isRight(response)) {
                    const taskRecord = response.right.Data?.[0];

                    if (taskRecord) {
                        setTask(taskRecord);

                        setTaskContext(taskRecord.TaskId, taskRecord.TaskTitle ?? '');

                        const subTaskResponse = await taskService.apiCallPullTask({
                            PageSize: 100,
                            PageNumber: 1,
                            ParentTaskId: taskIdNumber,
                            TaskType: TASK_TYPE.SubTask,
                        });

                        if (E.isRight(subTaskResponse)) {
                            setSubTasks(subTaskResponse.right.Data);
                        }
                    }
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
            'Loading Task',
        );
    };

    const loadTaskTags = async (pageNum: number) => {
        if (!taskIdNumber) return;

        await runApiWithLoader(
            setIsTagsLoading,
            setTagsLoadingMessage,
            async () => {
                const response = await taskService.apiCallPullTaskTag({
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,
                    TaskId: taskIdNumber,
                });

                if (E.isRight(response)) {
                    setTaskTags(response.right.Data);
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
            'Loading Tags',
        );
    };

    useEffect(() => {
        if (!taskIdNumber) {
            navigate('/task');
            return;
        }

        if (isAgendaTask) {
            fetchAgendaTaskDetails();
        } else {
            fetchTaskDetails();
        }
    }, [taskIdNumber, isAgendaTask]);

    useEffect(() => {
        if (!taskIdNumber) {
            setTaskTags([]);
            return;
        }

        if (activeTab === 'overview' || isTagsModalOpen) {
            loadTaskTags(isTagsModalOpen ? pagination.currentPage : 1);
        }
    }, [activeTab, isTagsModalOpen, pagination.currentPage, taskIdNumber]);

    const fetchSubTaskList = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaskDetailsRequest = {
                    PageSize: 100,
                    PageNumber: 1,
                    ParentTaskId: taskIdNumber,
                    TaskType: TASK_TYPE.SubTask,
                };

                const response = await taskService.apiCallPullTask(params);

                if (E.isRight(response)) {
                    setSubTasks(response.right.Data);
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
            'Loading Sub Tasks',
        );
    };

    const fetchAgendaSubTaskList = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAgendaRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    ParentTaskId: taskIdNumber,
                    TaskType: TASK_TYPE.SubTask,
                    IsAgendaTask: true,
                    MeetingId: agendaTask?.MeetingId || 0,
                };

                const response = await agendaService.apiCallPullAgenda(params);

                if (E.isRight(response)) {
                    setAgendaSubTasks(response.right.Data);
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
            'Loading Sub Tasks',
        );
    };

    const handleAddSubTask = () => {
        setEditingSubTaskId(0);
        setIsAddUpdateModalOpen(true);
    };

    const handleEditSubTask = useCallback((subTask: TaskDetails) => {
        setEditingSubTaskId(subTask.TaskId);
        setIsAddUpdateModalOpen(true);
    }, []);

    const handleEditAgendaSubTask = useCallback((subTask: AgendaData) => {
        setEditingSubTaskId(subTask.AgendaId);
        setIsAddUpdateModalOpen(true);
    }, []);

    const handleEditTask = () => {
        if (isAgendaTask) {
            navigate(`/task/add/${taskIdNumber}?isAgendaTask=true`);
            return;
        }
        navigate(`/task/add/${taskIdNumber}`);
    };

    const handleBack = () => {
        navigate('/task');
    };

    const handleSubTaskSaved = () => {
        if (isAgendaTask) {
            fetchAgendaSubTaskList();
        } else {
            fetchSubTaskList();
        }
    };

    const handleOpenTagsModal = () => setIsTagsModalOpen(true);

    const handleCloseTagsModal = () => {
        setIsTagsModalOpen(false);
        resetPagination();
    };

    const handlePageChange = useCallback(
        (page: number) => {
            setPagination({ currentPage: page });
        },
        [setPagination],
    );

    const tagPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange],
    );

    const getCompletedCount = (items: { status: string }[]) =>
        items.filter((item) => {
            const status = item.status.toLowerCase();
            return status.includes('complete') || status.includes('done');
        }).length;

    const taskSubTaskProgress = useMemo(() => {
        return {
            completed: getCompletedCount(subTasks.map((item) => ({ status: String(item.TaskInitialStatus ?? '') }))),
            total: subTasks.length,
            percent: Number(task?.SubTaskProgressPercentage ?? 0),
        };
    }, [subTasks]);

    const agendaSubTaskProgress = useMemo(() => {
        const agendaCompleted = getCompletedCount(agendaSubTasks.map((item) => ({ status: item.AgendaStatus ?? '' })));

        return {
            completed: agendaCompleted,
            total: agendaSubTasks.length,
            percent: agendaSubTasks.length > 0 ? Math.round((agendaCompleted / agendaSubTasks.length) * 100) : 0,
        };
    }, [agendaSubTasks]);

    const currentSubTaskProgress = isAgendaTask ? agendaSubTaskProgress : taskSubTaskProgress;
    const currentSubTasksLength = isAgendaTask ? agendaSubTasks.length : subTasks.length;

    const taskTabList = [
        { id: 'overview', label: 'Overview' },
        ...((isAgendaTask ? agendaTask?.TaskType : task?.TaskType) === TASK_TYPE.SubTask
            ? []
            : [{ id: 'subtasks', label: `Sub-tasks (${isAgendaTask ? agendaSubTasks.length : subTasks.length})` }]),
        { id: 'timeline', label: 'Timeline' },
        {
            id: 'documents',
            label: `Documents (${parseDocumentUrls(isAgendaTask ? agendaTask?.DocumentURLs : task?.DocumentUrl).length})`,
        },
        { id: 'discussions', label: `Discussions (${discussionCount})` },
    ];

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <div className="space-y-4">
                <HeaderActionBar
                    titleText="Task Details : "
                    subTitleText={(isAgendaTask ? agendaTask?.AgendaTitle : task?.TaskTitle) || ''}
                    cancelText="Cancel"
                    onCancel={handleBack}
                    canAction={canAction}
                    onEdit={handleEditTask}
                    EditText="Edit"
                    ExtraButtontitleTextIcon={Plus}
                    ExtraButtonText="Add Sub-task"
                    ExtraButtontitleText="Add"
                    onExtraButton={handleAddSubTask}
                    canActionExtraButtonText={canAction && (isAgendaTask ? agendaTask?.TaskType : task?.TaskType) !== TASK_TYPE.SubTask}
                    canActionExtraExtraButton={true}
                    isLoading={isLoading}
                />

                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: isAgendaTask ? getTaskStatusColor(String(agendaTask?.AgendaStatus)).bg : getTaskStatusColor(String(task?.TaskInitialStatus)).bg,
                            color: isAgendaTask ? getTaskStatusColor(agendaTask?.AgendaStatus).text : getTaskStatusColor(String(task?.TaskInitialStatus)).text,
                        }}
                    >
                        {isAgendaTask ? agendaTask?.AgendaStatus : task?.TaskInitialStatus}
                    </span>
                    <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: isAgendaTask ? getTaskPriorityColor(agendaTask?.Priority).bg : getTaskPriorityColor(String(task?.TaskPriority)).bg,
                            color: isAgendaTask ? getTaskPriorityColor(agendaTask?.Priority).text : getTaskPriorityColor(String(task?.TaskPriority)).text,
                        }}
                    >
                        {isAgendaTask ? agendaTask?.Priority : task?.TaskPriority}
                    </span>
                </div>

                <div className="mt-5 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                    <div className="flex min-w-max divide-x divide-[#E5E7EB] lg:min-w-0">
                        <div className="min-w-[140px] flex-1 px-4 py-4">
                            <p className="text-xs uppercase text-gray-400">Created by</p>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-blue-100 text-xs font-medium text-gray-800">
                                    {getNameInitials((isAgendaTask ? agendaTask?.CreatedBy : task?.CreatedBy) || '-')}
                                </div>
                                <span className="font-medium text-gray-800">
                                    {(isAgendaTask ? agendaTask?.CreatedBy : task?.CreatedBy) || '-'}
                                </span>
                            </div>
                        </div>

                        <div className="min-w-[140px] flex-1 px-4 py-4">
                            <p className="text-xs uppercase text-gray-400">Updated by</p>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-blue-100 text-xs font-medium text-gray-800">
                                    {getNameInitials((isAgendaTask ? agendaTask?.ModifiedBy : task?.ModifiedBy) || '-')}
                                </div>
                                <span className="font-medium text-gray-800">
                                    {(isAgendaTask ? agendaTask?.ModifiedBy : task?.ModifiedBy) || '-'}
                                </span>
                            </div>
                        </div>

                        <div className="min-w-[140px] flex-1 px-4 py-4">
                            <p className="text-xs uppercase text-gray-400">Created on</p>
                            <p className="mt-2 font-medium text-gray-800">
                                {isAgendaTask
                                    ? agendaTask?.CreatedDate
                                        ? formatDate_dd_MonthName_yy(agendaTask.CreatedDate)
                                        : '-'
                                    : task?.CreatedDate
                                      ? formatDate_dd_MonthName_yy(task.CreatedDate)
                                      : '-'}
                            </p>
                        </div>

                        <div className="min-w-[140px] flex-1 px-4 py-4">
                            <p className="text-xs uppercase text-gray-400">Updated on</p>
                            <p className="mt-2 font-medium text-gray-800">
                                {isAgendaTask
                                    ? agendaTask?.ModifiedDate
                                        ? formatDate_dd_MonthName_yy(agendaTask.ModifiedDate)
                                        : '-'
                                    : task?.ModifiedDate
                                      ? formatDate_dd_MonthName_yy(task.ModifiedDate)
                                      : '-'}
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs
                    tabs={taskTabList}
                    defaultActive={activeTab}
                    isChips
                    onTabChange={(tab) => {
                        setActiveTab(tab.id);
                    }}
                />

                {activeTab === 'overview' && (
                    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
                        <div className="space-y-4 lg:col-span-8">
                            <section className="rounded-2xl border border-gray-200 bg-white p-6">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <h4 className="font-medium text-gray-800">Task Description</h4>
                                    </div>
                                </div>
                                <p className="min-w-0 break-words text-sm leading-6 text-gray-800 [overflow-wrap:anywhere]">
                                    {showFullDescription ||
                                    ((isAgendaTask ? agendaTask?.AgendaDescription : task?.TaskDescription) || '-').length <= 140
                                        ? (isAgendaTask ? agendaTask?.AgendaDescription : task?.TaskDescription) || '-'
                                        : `${((isAgendaTask ? agendaTask?.AgendaDescription : task?.TaskDescription) || '-').slice(0, 140)}...`}
                                </p>
                                {((isAgendaTask ? agendaTask?.AgendaDescription : task?.TaskDescription) || '-').length > 140 && (
                                    <Button color="blue" size="sm" className="mt-2" onClick={() => setShowFullDescription((current) => !current)}>
                                        {showFullDescription ? 'Show less' : 'Show more'}
                                    </Button>
                                )}
                            </section>

                            {(isAgendaTask ? agendaTask?.TaskType : task?.TaskType) !== TASK_TYPE.SubTask && (
                                <section className="rounded-2xl border border-gray-200 bg-white p-6">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-gray-800">Sub-task Progress</h4>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {currentSubTaskProgress.completed} of {currentSubTaskProgress.total} completed
                                        </span>
                                    </div>

                                    <TaskProgressBar percent={currentSubTaskProgress.percent} />

                                    {currentSubTasksLength > 0 ? (
                                        <div className="mt-5 space-y-3">
                                            {isAgendaTask
                                                ? agendaSubTasks.map((subTask) => (
                                                      <SubTaskRow
                                                          key={subTask.AgendaId}
                                                          title={subTask.AgendaTitle}
                                                          statusLabel={subTask.AgendaStatus}
                                                          dueDate={subTask.DueDate}
                                                          assigneeName={subTask.ResponsiblePersonDetails?.[0]?.ResponsiblePersonName}
                                                          onMenuClick={() => handleEditAgendaSubTask(subTask)}
                                                      />
                                                  ))
                                                : subTasks.map((subTask) => (
                                                      <SubTaskRow
                                                          key={subTask.TaskId}
                                                          title={subTask.TaskTitle ?? '-'}
                                                          statusLabel={String(subTask.TaskInitialStatus ?? '-')}
                                                          dueDate={subTask.DueDate}
                                                          assigneeName={subTask.AssigneeName}
                                                          commentCount={subTask.CommentCount}
                                                          onMenuClick={() => handleEditSubTask(subTask)}
                                                      />
                                                  ))}
                                        </div>
                                    ) : (
                                        <div className="mt-5">
                                            <NoDataView message="No sub-tasks available" />
                                        </div>
                                    )}

                                    {canAction && (
                                        <Button color="blue" size="sm" fullWidth leftIcon={<Plus className="h-4 w-4" />} className="mt-4" onClick={handleAddSubTask}>
                                            Add Sub-task
                                        </Button>
                                    )}
                                </section>
                            )}

                            <TaskDiscussionsSection
                                agenda={isAgendaTask ? agendaTask : null}
                                agendaSubTasks={isAgendaTask && agendaTask?.TaskType !== TASK_TYPE.SubTask ? agendaSubTasks : []}
                                task={!isAgendaTask ? task : null}
                                subTasks={!isAgendaTask && task?.TaskType !== TASK_TYPE.SubTask ? subTasks : []}
                                maxVisibleComments={2}
                                onViewAllDiscussions={() => setActiveTab('discussions')}
                                onCommentsCountChange={setDiscussionCount}
                            />
                        </div>

                        <aside className="w-full lg:col-span-4">
                            <section className="rounded-2xl border border-gray-200 bg-white p-6">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <h4 className="font-medium text-gray-800">Details</h4>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-[11px] uppercase text-gray-400">Deadline</p>
                                        <div className="mt-1 font-medium text-gray-800">
                                            <span className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.75} />
                                                {isAgendaTask
                                                    ? (agendaTask?.DueDate ? formatDate_dd_MonthName_yy(agendaTask.DueDate) : '-')
                                                    : (task?.DueDate ? formatDate_dd_MonthName_yy(task.DueDate) : '-')}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-[11px] uppercase text-gray-400">Tags</p>
                                        {taskTags.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {taskTags.slice(0, 4).map((tag) => (
                                                        <div key={tag.TagId} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
                                                            <p className="font-medium text-gray-800">{tag.TagsName}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {pagination.totalRecords > 4 && taskIdNumber && (
                                                    <Button color="blue" size="sm" className="mt-3" onClick={handleOpenTagsModal}>
                                                        View All
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500">-</p>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <p className="mb-3 font-medium text-gray-800">Assignment</p>
                                        <div className="space-y-4">
                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                                <p className="text-[11px] uppercase text-gray-400">Assignee</p>
                                                <div className="mt-1 font-medium text-gray-800">
                                                    {isAgendaTask ? (
                                                        agendaTask?.ResponsiblePersonDetails?.length ? (
                                                            <div className="space-y-2">
                                                                {agendaTask.ResponsiblePersonDetails.map((person) => (
                                                                    <div key={person.ResponsiblePersonId} className="flex items-center gap-2">
                                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-blue-100 text-xs font-medium text-gray-800">
                                                                            {getNameInitials(person.ResponsiblePersonName)}
                                                                        </div>
                                                                        <span>{person.ResponsiblePersonName}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-blue-100 text-xs font-medium text-gray-800">
                                                                {getNameInitials(task?.AssigneeName || '-')}
                                                            </div>
                                                            <span>{task?.AssigneeName || '-'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                                <p className="text-[11px] uppercase text-gray-400">Reviewer</p>
                                                <div className="mt-1 font-medium text-gray-800">
                                                    {(isAgendaTask ? agendaTask?.ReviewerDetails : task?.ReviewerDetails)?.length ? (
                                                        <div className="space-y-2">
                                                            {(isAgendaTask ? agendaTask?.ReviewerDetails : task?.ReviewerDetails)?.map((reviewer) => (
                                                                <div key={reviewer.ReviewerId} className="flex items-center gap-2">
                                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-blue-100 text-xs font-medium text-gray-800">
                                                                        {getNameInitials(reviewer.ReviewerName)}
                                                                    </div>
                                                                    <span>{reviewer.ReviewerName}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                )}

                {activeTab === 'subtasks' && (
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <h4 className="font-medium text-gray-800">Sub-task Progress</h4>
                                <p className="mt-1 text-sm text-[#64748B]">Status of individual deliverables</p>
                            </div>
                            <span className="text-sm text-gray-500">
                                {currentSubTaskProgress.completed} of {currentSubTaskProgress.total} completed
                            </span>
                        </div>

                        <TaskProgressBar percent={currentSubTaskProgress.percent} />

                        {currentSubTasksLength > 0 ? (
                            <div className="mt-5 space-y-3">
                                {isAgendaTask
                                    ? agendaSubTasks.map((subTask) => (
                                          <SubTaskRow
                                              key={subTask.AgendaId}
                                              title={subTask.AgendaTitle}
                                              statusLabel={subTask.AgendaStatus}
                                              dueDate={subTask.DueDate}
                                              assigneeName={subTask.ResponsiblePersonDetails?.[0]?.ResponsiblePersonName}
                                              onMenuClick={() => handleEditAgendaSubTask(subTask)}
                                          />
                                      ))
                                    : subTasks.map((subTask) => (
                                          <SubTaskRow
                                              key={subTask.TaskId}
                                              title={subTask.TaskTitle ?? '-'}
                                              statusLabel={String(subTask.TaskInitialStatus ?? '-')}
                                              dueDate={subTask.DueDate}
                                              assigneeName={subTask.AssigneeName}
                                              commentCount={subTask.CommentCount}
                                              onMenuClick={() => handleEditSubTask(subTask)}
                                          />
                                      ))}
                            </div>
                        ) : (
                            <div className="mt-5">
                                <NoDataView message="No sub-tasks available" />
                            </div>
                        )}

                        {canAction && (
                            <Button color="blue" size="sm" fullWidth leftIcon={<Plus className="h-4 w-4" />} className="mt-4" onClick={handleAddSubTask}>
                                Add Sub Task
                            </Button>
                        )}
                    </section>
                )}

                {activeTab === 'documents' && (
                    <section className="rounded-2xl border border-gray-200 bg-white p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <h4 className="font-medium text-gray-800">
                                    {`Documents (${
                                        parseDocumentUrls(isAgendaTask ? agendaTask?.DocumentURLs : task?.DocumentUrl).length
                                    })`}
                                </h4>
                            </div>
                        </div>
                        {(() => {
                            const documentUrls = parseDocumentUrls(isAgendaTask ? agendaTask?.DocumentURLs : task?.DocumentUrl);

                            if (documentUrls.length === 0) {
                                return <NoDataView message="No documents available" />;
                            }

                            return (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    {documentUrls.map((documentUrl) => (
                                        <div key={documentUrl} className="flex min-h-[150px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                            <div className="flex items-start justify-between gap-2 p-4">
                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-2 break-words font-semibold text-gray-800">
                                                        {getDocumentNameFromUrl(documentUrl)}
                                                    </p>
                                                </div>
                                                <MultiImageViewer
                                                    images={[documentUrl]}
                                                    title={getDocumentNameFromUrl(documentUrl)}
                                                    triggerLabel="View"
                                                    isIcon={false}
                                                />
                                            </div>

                                            <div className="mt-auto border-t border-gray-200 bg-gray-50 p-3">
                                                <FieldItem
                                                    label="Uploaded By / Date"
                                                    value={`${
                                                        (isAgendaTask ? agendaTask?.ModifiedBy : task?.ModifiedBy) ||
                                                        (isAgendaTask ? agendaTask?.CreatedBy : task?.CreatedBy) ||
                                                        '-'
                                                    } / ${
                                                        isAgendaTask
                                                            ? agendaTask?.ModifiedDate
                                                                ? formatDate_dd_MonthName_yy_hh_mm(agendaTask.ModifiedDate)
                                                                : agendaTask?.CreatedDate
                                                                  ? formatDate_dd_MonthName_yy_hh_mm(agendaTask.CreatedDate)
                                                                  : '-'
                                                            : task?.ModifiedDate
                                                              ? formatDate_dd_MonthName_yy_hh_mm(task.ModifiedDate)
                                                              : task?.CreatedDate
                                                                ? formatDate_dd_MonthName_yy_hh_mm(task.CreatedDate)
                                                                : '-'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </section>
                )}

                {activeTab === 'discussions' && (
                    <TaskDiscussionsSection
                        agenda={isAgendaTask ? agendaTask : null}
                        agendaSubTasks={isAgendaTask && agendaTask?.TaskType !== TASK_TYPE.SubTask ? agendaSubTasks : []}
                        task={!isAgendaTask ? task : null}
                        subTasks={!isAgendaTask && task?.TaskType !== TASK_TYPE.SubTask ? subTasks : []}
                    />
                )}

                {activeTab === 'timeline' && <TaskTimelineTab taskId={taskIdNumber} />}
            </div>

            <AddEditSubTaskModal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingSubTaskId(0);
                }}
                parentTaskId={taskIdNumber}
                subTaskId={editingSubTaskId}
                isAgendaTask={isAgendaTask}
                meetingId={agendaTask?.MeetingId || 0}
                onSaved={handleSubTaskSaved}
            />

            <Modal isOpen={isTagsModalOpen} onClose={handleCloseTagsModal} title="Tags" saveText="" size="small-half">
                <Loader loading={isTagsLoading} title={tagsLoadingMessage}>
                    <div />
                </Loader>
                <div className="flex min-h-[calc(100vh-10rem)] flex-col">
                    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
                        {taskTags.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {taskTags.map((tag) => (
                                    <div key={tag.TagId} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
                                        <p className="font-medium text-gray-800">{tag.TagsName}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoDataView message="No tags found" />
                        )}
                    </div>
                    <div className="mt-4 flex-shrink-0 border-t border-gray-200 bg-white">
                        <Pagination pagination={tagPaginationInfo} className="rounded-none border-t-0" />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ViewTask;
