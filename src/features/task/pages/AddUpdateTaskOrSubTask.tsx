import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { Edit, Plus, Trash2 } from 'lucide-react';

import { runApiWithLoader } from '@/core/utils';
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { isToDateGreaterOrEqualFromDate } from '@/core/utils/comman';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { Button } from '@/ui/components/forms';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import type { AddUpdateTaskDetailsRequest, DeleteTaskDetailsRequest, FilterWithPaginationTaskDetailsRequest, TaskDetails, TaskInitialStatusData, TaskPriorityData } from '@/features/task/models/TaskModel';
import { TASK_TYPE } from '@/features/task/constants/taskConstants';
import type { AgendaData, DeleteAgendaRequest, FilterWithPaginationAgendaRequest } from '@/features/meeting/models/AgendaModel';
import { TaskFields } from '@/features/task/components/TaskFields';
import { AddEditSubTaskModal } from '@/features/task/components/AddEditSubTaskModal';
import { useTaskListState } from '@/features/task/context/TaskListStateContext';
import { taskService } from '@/features/task/services/TaskService';
import { agendaService } from '@/features/meeting/services/AgendaService';

const initialFormState = (): AddUpdateTaskDetailsRequest => ({
    TaskId: 0,
    UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ParentTaskId: 0,
    TaskType: TASK_TYPE.Task,
    TaskTitle: '',
    TaskDescription: '',
    TaskPriorityId: 0,
    TaskInitialStatusId: 0,
    AssigneeId: 0,
    ReviewerJson: '[]',
    TagsEmployeeJson: '[]',
    StartDate: null,
    DueDate: null,
    DocumentUrl: null,
    RemoveDocumentUrl: null,
    ResponsiblePersonJson: '',
    MeetingId: 0,
});

export const AddUpdateTaskOrSubTask: React.FC = () => {
    
    const [formData, setFormData] = useState<AddUpdateTaskDetailsRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const navigate = useNavigate();

    const { taskId: taskIdParam } = useParams<{ taskId?: string }>();
    const [searchParams] = useSearchParams();

    const { addToast } = useToast();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [taskPriorityDropdown, setTaskPriorityDropdown] = useState<TaskPriorityData[]>([]);
    const [taskInitialStateDropdown, setTaskInitialStateDropdown] = useState<TaskInitialStatusData[]>([]);
    const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
    const [documentURL, setDocumentURL] = useState<string>();
    const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
    const [selectedTagsEmployeeValues, setSelectedTagsEmployeeValues] = useState<string | number | null>(null);
    const [selectedReviewerValues, setSelectedReviewerValues] = useState<string | number | null>(null);
    const [selectedResponsiblePersonValues, setSelectedResponsiblePersonValues] = useState<string | number | null>(null);
    const [assigneeName, setAssigneeName] = useState('');
    const [subTasks, setSubTasks] = useState<TaskDetails[]>([]);
    const [agendaSubTasks, setAgendaSubTasks] = useState<AgendaData[]>([]);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [editingSubTaskId, setEditingSubTaskId] = useState(0);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteSubTaskDetailsData, setDeleteSubTaskDetailsData] = useState<TaskDetails | null>(null);
    const [deleteAgendaSubTaskDetailsData, setDeleteAgendaSubTaskDetailsData] = useState<AgendaData | null>(null);

    const isAgendaTask = searchParams.get('isAgendaTask') === 'true';
    const meetingId = Number(searchParams.get('meetingId') ?? 0);
    const routeTaskId = taskIdParam ? Number(taskIdParam) : 0;
    const [currentTaskId, setCurrentTaskId] = useState<number>(routeTaskId);
    const isAddMode = currentTaskId === 0;

    const tagsDropdown = useMultiSelectDropdown({
        value: selectedTagsEmployeeValues,
        fetchCallback: fetchEmployeeMasterDropdown,
        autoFetchOptions: true,
    });
    const reviewerDropdown = useMultiSelectDropdown({
        value: selectedReviewerValues,
        fetchCallback: fetchEmployeeMasterDropdown,
        autoFetchOptions: true,
    });
    const responsiblePersonDropdown = useMultiSelectDropdown({
        value: selectedResponsiblePersonValues,
        fetchCallback: fetchEmployeeMasterDropdown,
        autoFetchOptions: true,
    });

    const { setTaskContext, setAgendaTaskContext } = useTaskListState();
    
    const { canAction } = useMenuPermissions('/event');
    
    const handleFieldChange = (field: keyof AddUpdateTaskDetailsRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };
    
    useEffect(() => {
        fetchTaskInitialStateDropdown();
        fetchTaskPriorityDropdown();
    }, []);

    useEffect(() => {
        if (!routeTaskId) return;

        setCurrentTaskId(routeTaskId);

        if (isAgendaTask) {
            fetchAgendaTaskDetails(routeTaskId);
            fetchAgendaSubTaskList(routeTaskId);
        } else {
            fetchTaskDetails(routeTaskId);
            fetchSubTaskList(routeTaskId);
        }
    }, [routeTaskId, isAgendaTask]);

    const fetchTaskPriorityDropdown = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await taskService.apiCallPullTaskPriority();

                if (E.isRight(response)) {
                    setTaskPriorityDropdown(response.right.Data);
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
            'Loading Task Priority'
        );
    };

    const fetchTaskInitialStateDropdown = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await taskService.apiCallPullTaskInitialState();

                if (E.isRight(response)) {
                    setTaskInitialStateDropdown(response.right.Data);
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
            'Loading Task Status'
        );
    };

    const fetchTaskDetails = async (idToLoad: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaskDetailsRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    TaskId: idToLoad,
                    TaskType: TASK_TYPE.Task,
                };

                const response = await taskService.apiCallPullTask(params);

                if (E.isRight(response)) {
                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData((prev) => ({
                            ...prev,
                            TaskId: e.TaskId ?? prev.TaskId,
                            UniqueKey: e.UniqueKey ?? prev.UniqueKey,
                            ParentTaskId: 0,
                            TaskType: TASK_TYPE.Task,
                            TaskTitle: e.TaskTitle ?? prev.TaskTitle,
                            TaskDescription: e.TaskDescription ?? prev.TaskDescription,
                            TaskPriorityId: e.TaskPriorityId ?? prev.TaskPriorityId,
                            TaskInitialStatusId: e.TaskInitialStatusId ?? prev.TaskInitialStatusId,
                            AssigneeId: e.AssigneeId ?? prev.AssigneeId,
                            StartDate: e.StartDate ?? prev.StartDate,
                            DueDate: e.DueDate ?? prev.DueDate,
                            ReviewerJson: JSON.stringify((e.ReviewerDetails || []).map((reviewer) => ({ ReviewerId: reviewer.ReviewerId }))),
                            TagsEmployeeJson: JSON.stringify((e.TagsEmployeeDetails || []).map((tag) => ({ TagId: String(tag.TagId) }))),
                        }));

                        setSelectedReviewerValues((e.ReviewerDetails || []).map((reviewer) => reviewer.ReviewerId).join(','));
                        setSelectedTagsEmployeeValues((e.TagsEmployeeDetails || []).map((tag) => tag.TagId).join(','));
                        setAssigneeName(e.AssigneeName || '');
                        setDocumentFiles([]);
                        setDocumentURL(e.DocumentUrl ?? undefined);
                        setRemovedDocumentURLs([]);
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
            'Loading Task'
        );
    };

    const fetchAgendaTaskDetails = async (idToLoad: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAgendaRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    AgendaId: idToLoad,
                    IsAgendaTask: true,
                    TaskType: TASK_TYPE.Task,
                };

                const response = await agendaService.apiCallPullAgenda(params);

                if (E.isRight(response)) {
                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData((prev) => ({
                            ...prev,
                            TaskId: e.AgendaId ?? prev.TaskId,
                            UniqueKey: e.UniqueKey ?? prev.UniqueKey,
                            ParentTaskId: 0,
                            TaskType: TASK_TYPE.Task,
                            TaskTitle: e.AgendaTitle ?? prev.TaskTitle,
                            TaskDescription: e.AgendaDescription ?? prev.TaskDescription,
                            TaskPriorityId: e.PriorityId ?? prev.TaskPriorityId,
                            TaskInitialStatusId: e.AgendaStatusId ?? prev.TaskInitialStatusId,
                            StartDate: e.StartDate ?? prev.StartDate,
                            DueDate: e.DueDate ?? prev.DueDate,
                            ReviewerJson: JSON.stringify(e.ReviewerDetails.map((reviewer) => ({ ReviewerId: reviewer.ReviewerId }))),
                            TagsEmployeeJson: JSON.stringify(e.TagsEmployeeDetails.map((tag) => ({ TagId: String(tag.TagId) }))),
                            ResponsiblePersonJson: e.ResponsiblePersonDetails.length
                                ? JSON.stringify(e.ResponsiblePersonDetails.map((person) => ({ ResponsiblePersonId: String(person.ResponsiblePersonId) })))
                                : '',
                            MeetingId: e.MeetingId ?? prev.MeetingId,
                        }));

                        setSelectedReviewerValues(e.ReviewerDetails.map((reviewer) => reviewer.ReviewerId).join(','));
                        setSelectedTagsEmployeeValues(e.TagsEmployeeDetails.map((tag) => tag.TagId).join(','));
                        setSelectedResponsiblePersonValues(e.ResponsiblePersonDetails.map((person) => person.ResponsiblePersonId).join(','));
                        setDocumentFiles([]);
                        setDocumentURL(e.DocumentURLs ?? undefined);
                        setRemovedDocumentURLs([]);
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
            'Loading Task'
        );
    };

    const fetchSubTaskList = async (parentId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaskDetailsRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    ParentTaskId: parentId,
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
            'Loading Sub Tasks'
        );
    };

    const fetchAgendaSubTaskList = async (parentId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAgendaRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    ParentTaskId: parentId,
                    TaskType: TASK_TYPE.SubTask,
                    IsAgendaTask: true,
                    MeetingId: meetingId,
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
            'Loading Sub Tasks'
        );
    };

    const validateAddTaskForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.TaskTitle?.trim()) {
            newErrors.TaskTitle = 'Task Title is required.';
        }
        if (!formData.TaskPriorityId) {
            newErrors.TaskPriorityId = 'Task Priority is required.';
        }
        if (!formData.TaskInitialStatusId) {
            newErrors.TaskInitialStatusId = 'Task Initial Status is required.';
        }
        if (isAgendaTask) {
            if (!formData.ResponsiblePersonJson) {
                newErrors.ResponsiblePersonJson = 'Responsible Persons are required.';
            }
        } else if (!formData.AssigneeId) {
            newErrors.AssigneeId = 'Assignee is required.';
        }

        const startDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.StartDate ? new Date(formData.StartDate) : undefined);
        const dueDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.DueDate ? new Date(formData.DueDate) : undefined);

        if (!formData.DueDate) {
            newErrors.DueDate = 'Deadline is required.';
        } else if (formData.StartDate && !isToDateGreaterOrEqualFromDate(startDate, dueDate)) {
            newErrors.DueDate = 'Deadline must be on or after Start Date';
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushTaskFormData = (): FormData => {
        const fd = new FormData();

        fd.append('TaskId', String(formData.TaskId ?? 0));
        fd.append('UniqueKey', formData.UniqueKey ?? '');
        fd.append('ParentTaskId', String(formData.ParentTaskId ?? 0));
        fd.append('TaskType', formData.TaskType ?? '');
        fd.append('TaskTitle', formData.TaskTitle ?? '');
        fd.append('TaskDescription', formData.TaskDescription ?? '');
        fd.append('TaskPriorityId', String(formData.TaskPriorityId ?? 0));
        fd.append('TaskInitialStatusId', String(formData.TaskInitialStatusId ?? 0));
        fd.append('AssigneeId', String(formData.AssigneeId ?? 0));
        fd.append('ReviewerJson', formData.ReviewerJson ?? '');
        fd.append('TagsEmployeeJson', formData.TagsEmployeeJson ?? '');
        fd.append('StartDate', formData.StartDate ?? '');
        fd.append('DueDate', formData.DueDate ?? '');

        documentFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append('DocumentUrl', file);
            }
        });

        fd.append('RemoveDocumentUrl', removedDocumentURLs.join(','));

        return fd;
    };

    const PushAgendaFormData = (): FormData => {
        const fd = new FormData();

        fd.append('MeetingId', String(formData.MeetingId || meetingId));
        fd.append('AgendaId', String(formData.TaskId ?? 0));
        fd.append('IsAgendaTask', 'true');
        fd.append('AgendaTitle', formData.TaskTitle ?? '');
        fd.append('AgendaDescription', formData.TaskDescription ?? '');
        fd.append('AgendaStatusId', String(formData.TaskInitialStatusId ?? 0));
        fd.append('PriorityId', String(formData.TaskPriorityId ?? 0));
        fd.append('ResponsiblePersonJson', formData.ResponsiblePersonJson ?? '');
        fd.append('UniqueKey', formData.UniqueKey ?? '');
        fd.append('ParentTaskId', String(formData.ParentTaskId ?? 0));
        fd.append('TaskType', formData.TaskType ?? '');
        fd.append('ReviewerJson', formData.ReviewerJson ?? '');
        fd.append('TagsEmployeeJson', formData.TagsEmployeeJson ?? '');
        fd.append('StartDate', formData.StartDate ?? '');
        fd.append('DueDate', formData.DueDate ?? '');

        documentFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append('DocumentURLs', file);
            }
        });

        fd.append('RemoveDocumentUrl', removedDocumentURLs.join(','));

        return fd;
    };

    const handleAddUpdateAgendaTask = async () => {
        setErrors({});

        const validation = validateAddTaskForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushAgendaFormData();

                const response = await agendaService.apiCallAddUpdateAgenda(payload);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    setAgendaTaskContext(currentTaskId, formData.TaskTitle || '');
                    navigate(`/task/view/${currentTaskId}?isAgendaTask=true${meetingId ? `&meetingId=${meetingId}` : ''}`);
                } else {
                    addToast({ type: 'error', title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Update Task'
        );
    };

    const handleAddUpdateTask = async () => {
        setErrors({});

        const validation = validateAddTaskForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushTaskFormData();

                const response = await taskService.apiCallAddUpdateTask(payload);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    const savedTask = response.right.Data?.[0];
                    const savedTaskId = isAddMode ? savedTask?.TaskId || currentTaskId : currentTaskId;

                    setTaskContext(savedTaskId, formData.TaskTitle || '');

                    if (isAddMode) {
                        setCurrentTaskId(savedTaskId);
                        setFormData((prev) => ({
                            ...prev,
                            TaskId: savedTaskId,
                            UniqueKey: savedTask?.UniqueKey || prev.UniqueKey,
                        }));
                        navigate(`/task/add/${savedTaskId}`, { replace: true });
                    } else {
                        navigate(`/task/view/${savedTaskId}`);
                    }
                } else {
                    addToast({ type: 'error', title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            isAddMode ? 'Add Task' : 'Update Task'
        );
    };

    const handleAddSubTaskModal = () => {
        if (!currentTaskId) {
            addToast({ type: 'error', title: 'Please save the task first' });
            return;
        }

        setEditingSubTaskId(0);
        setIsAddUpdateModalOpen(true);
    };

    const handleEditSubTask = useCallback((row: TaskDetails) => {
        setEditingSubTaskId(row.TaskId);
        setIsAddUpdateModalOpen(true);
    }, []);

    const handleEditAgendaSubTask = useCallback((row: AgendaData) => {
        setEditingSubTaskId(row.AgendaId);
        setIsAddUpdateModalOpen(true);
    }, []);

    const handleConfirmationDialogBoxOpen = useCallback((row: TaskDetails) => {
        setDeleteSubTaskDetailsData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const handleAgendaConfirmationDialogBoxOpen = useCallback((row: AgendaData) => {
        setDeleteAgendaSubTaskDetailsData(row);
        setIsConfirmationDialogBoxOpen(true);
    }, []);

    const subTaskColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'TaskTitle',
                label: 'Title',
                sortable: false,
                align: 'left',
                render: (value) => value || '-',
            },
            {
                key: 'AssigneeName',
                label: 'Assigned To',
                sortable: false,
                align: 'left',
                render: (value) => value || '-',
            },
            {
                key: 'TaskInitialStatus',
                label: 'Status',
                sortable: false,
                align: 'left',
                render: (value) => value || '-',
            },
            {
                key: 'DueDate',
                label: 'Due Date',
                sortable: false,
                align: 'left',
                render: (value) => (value ? formatDate_dd_MonthName_yy(value) : '-'),
            },
            {
                key: 'actions',
                label: 'Actions',
                align: 'center',
                render: (_value, row: TaskDetails) =>
                    canAction ? (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditSubTask(row);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                title="Edit Sub Task"
                                leftIcon={<Edit className="h-4 w-4" />}
                            />
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmationDialogBoxOpen(row);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{ color: 'red' }}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null,
            },
        ],
        [canAction, handleEditSubTask, handleConfirmationDialogBoxOpen],
    );

    const agendaSubTaskColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'AgendaTitle',
                label: 'Title',
                sortable: false,
                align: 'left',
                render: (value) => value || '-',
            },
            {
                key: 'AgendaStatus',
                label: 'Status',
                sortable: false,
                align: 'left',
                render: (value) => value || '-',
            },
            {
                key: 'DueDate',
                label: 'Due Date',
                sortable: false,
                align: 'left',
                render: (value) => (value ? formatDate_dd_MonthName_yy(value) : '-'),
            },
            {
                key: 'actions',
                label: 'Actions',
                align: 'center',
                render: (_value, row: AgendaData) =>
                    canAction ? (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditAgendaSubTask(row);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                title="Edit Sub Task"
                                leftIcon={<Edit className="h-4 w-4" />}
                            />
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAgendaConfirmationDialogBoxOpen(row);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{ color: 'red' }}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null,
            },
        ],
        [canAction, handleEditAgendaSubTask, handleAgendaConfirmationDialogBoxOpen],
    );

    const handleDeleteSubTask = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteSubTaskDetailsData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteTaskDetailsRequest = {
                    TaskId: deleteSubTaskDetailsData.TaskId ?? 0,
                    UniqueKey: deleteSubTaskDetailsData.UniqueKey,
                };

                const response = await taskService.apiCallDeleteTask(params);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    await fetchSubTaskList(currentTaskId);

                    setDeleteSubTaskDetailsData(null);
                } else {
                    addToast({ type: 'error', title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Delete Sub Task'
        );
    };

    const handleDeleteAgendaSubTask = async () => {
        setIsConfirmationDialogBoxOpen(false);

        if (!deleteAgendaSubTaskDetailsData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteAgendaRequest = {
                    AgendaId: deleteAgendaSubTaskDetailsData.AgendaId ?? 0,
                    UniqueKey: deleteAgendaSubTaskDetailsData.UniqueKey,
                };

                const response = await agendaService.apiCallDeleteAgenda(params);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    await fetchAgendaSubTaskList(currentTaskId);

                    setDeleteAgendaSubTaskDetailsData(null);
                } else {
                    addToast({ type: 'error', title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Delete Sub Task'
        );
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-4 pb-3">
                        <TaskFields
                            formData={formData}
                            onFieldChange={handleFieldChange}
                            errors={errors}
                            taskPriorityDropdown={taskPriorityDropdown}
                            taskInitialStateDropdown={taskInitialStateDropdown}
                            assigneeName={assigneeName}
                            documentFiles={documentFiles}
                            setDocumentFiles={setDocumentFiles}
                            documentURL={documentURL}
                            onRemoveExistingDocument={(url) => setRemovedDocumentURLs((prev) => [...prev, url])}
                            tagsDropdown={tagsDropdown}
                            reviewerDropdown={reviewerDropdown}
                            responsiblePersonDropdown={responsiblePersonDropdown}
                            setSelectedTagsEmployeeValues={setSelectedTagsEmployeeValues}
                            setSelectedReviewerValues={setSelectedReviewerValues}
                            setSelectedResponsiblePersonValues={setSelectedResponsiblePersonValues}
                            isAgendaTask={isAgendaTask}
                        />

                        <div className="space-y-4 pt-5">
                            <div className="flex items-center justify-between border-b border-gray-500 pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Sub - Task
                                </h3>
                                {canAction && (
                                    <Button
                                        color="blue"
                                        size="sm"
                                        leftIcon={<Plus className="h-4 w-4" />}
                                        title="Add Sub-task"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAddSubTaskModal();
                                        }}
                                    >
                                        Add Sub-task
                                    </Button>
                                )}
                            </div>

                            {isAgendaTask ? (
                                <DataTable
                                    data={agendaSubTasks}
                                    columns={agendaSubTaskColumns}
                                    emptyMessage="No sub tasks found"
                                    fixedHeight={false}
                                    recordsPerPage={20}
                                    className="min-w-full"
                                    aria-label="Sub Task list"
                                />
                            ) : (
                                <DataTable
                                    data={subTasks}
                                    columns={subTaskColumns}
                                    emptyMessage="No sub tasks found"
                                    fixedHeight={false}
                                    recordsPerPage={20}
                                    className="min-w-full"
                                    aria-label="Sub Task list"
                                />
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={isAddMode ? 'Add Task' : 'Update Task'}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    if (isAgendaTask) {
                        handleAddUpdateAgendaTask();
                    } else {
                        handleAddUpdateTask();
                    }
                }}
                isLoading={isLoading}
            />

            <AddEditSubTaskModal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingSubTaskId(0);
                }}
                parentTaskId={currentTaskId}
                subTaskId={editingSubTaskId}
                isAgendaTask={isAgendaTask}
                meetingId={formData.MeetingId ?? meetingId}
                onSaved={(parentId) => {
                    if (isAgendaTask) {
                        fetchAgendaSubTaskList(parentId);
                    } else {
                        fetchSubTaskList(parentId);
                    }
                }}
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteSubTaskDetailsData(null);
                    setDeleteAgendaSubTaskDetailsData(null);
                }}
                onConfirm={isAgendaTask ? handleDeleteAgendaSubTask : handleDeleteSubTask}
                loading={isLoading}
                pageName="Sub Task"
            />
        </div>
    );
    
};

export default AddUpdateTaskOrSubTask;
