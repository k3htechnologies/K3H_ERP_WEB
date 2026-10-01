import { useEffect, useState } from 'react';
import * as E from 'fp-ts/Either';
import type { AddUpdateTaskDetailsRequest, FilterWithPaginationTaskDetailsRequest, TaskInitialStatusData, TaskPriorityData } from '@/features/task/models/TaskModel';
import { TASK_TYPE } from '@/features/task/constants/taskConstants';
import type { FilterWithPaginationAgendaRequest } from '@/features/meeting/models/AgendaModel';
import { runApiWithLoader } from '@/core/utils';
import { convert_date_yy_mm_dd_To_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { isToDateGreaterOrEqualFromDate } from '@/core/utils/comman';
import { taskService } from '@/features/task/services/TaskService';
import { agendaService } from '@/features/meeting/services/AgendaService';
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import { Modal } from '@/ui/components/Modal/Modal';
import { TaskFields } from '@/features/task/components/TaskFields';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    parentTaskId: number;
    subTaskId?: number;
    isAgendaTask?: boolean;
    meetingId?: number;
    onSaved?: (parentTaskId: number) => void;
}

const initialFormState = (): AddUpdateTaskDetailsRequest => ({
    TaskId: 0,
    UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ParentTaskId: 0,
    TaskType: TASK_TYPE.SubTask,
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

export const AddEditSubTaskModal: React.FC<Props> = ({
    isOpen,
    onClose,
    parentTaskId,
    subTaskId = 0,
    isAgendaTask = false,
    meetingId = 0,
    onSaved,
}) => {
    const [formData, setFormData] = useState<AddUpdateTaskDetailsRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

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

    const isEditMode = subTaskId > 0;

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

    useEffect(() => {
        if (!isOpen) return;

        fetchTaskPriorityDropdown();
        fetchTaskInitialStateDropdown();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        setFormData({
            ...initialFormState(),
            ParentTaskId: parentTaskId,
        });
        setSelectedTagsEmployeeValues(null);
        setSelectedReviewerValues(null);
        setSelectedResponsiblePersonValues(null);
        setDocumentFiles([]);
        setDocumentURL(undefined);
        setRemovedDocumentURLs([]);
        setAssigneeName('');
        setErrors({});

        if (!isEditMode) return;

        if (isAgendaTask) {
            fetchAgendaSubTaskDetails();
            return;
        }

        fetchSubTaskDetails();
    }, [isOpen, isAgendaTask, isEditMode, parentTaskId, subTaskId]);

    const fetchAgendaSubTaskDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAgendaRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsAgendaTask: true,
                    ParentTaskId: parentTaskId,
                    AgendaId: subTaskId,
                    TaskType: TASK_TYPE.SubTask,
                };

                const response = await agendaService.apiCallPullAgenda(params);

                if (E.isRight(response)) {
                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData((prev) => ({
                            ...prev,
                            TaskId: e.AgendaId ?? prev.TaskId,
                            UniqueKey: e.UniqueKey ?? prev.UniqueKey,
                            ParentTaskId: parentTaskId,
                            TaskType: TASK_TYPE.SubTask,
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
            'Loading Sub Task'
        );
    };

    const fetchSubTaskDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationTaskDetailsRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    TaskId: subTaskId,
                    ParentTaskId: parentTaskId,
                    TaskType: TASK_TYPE.SubTask,
                };

                const response = await taskService.apiCallPullTask(params);

                if (E.isRight(response)) {
                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData((prev) => ({
                            ...prev,
                            TaskId: e.TaskId ?? prev.TaskId,
                            UniqueKey: e.UniqueKey ?? prev.UniqueKey,
                            ParentTaskId: parentTaskId,
                            TaskType: TASK_TYPE.SubTask,
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
            'Loading Sub Task'
        );
    };

    const handleFieldChange = (field: keyof AddUpdateTaskDetailsRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateAddSubTaskForm = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.TaskTitle?.trim()) {
            newErrors.TaskTitle = 'Sub Task Title is required.';
        }
        if (!formData.TaskPriorityId) {
            newErrors.TaskPriorityId = 'Sub Task Priority is required.';
        }
        if (!formData.TaskInitialStatusId) {
            newErrors.TaskInitialStatusId = 'Sub Task Initial Status is required.';
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

    const PushSubTaskFormData = (): FormData => {
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

    const PushAgendaSubTaskFormData = (): FormData => {
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

    const handleAddUpdateAgendaSubTask = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({});

        const validation = validateAddSubTaskForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushAgendaSubTaskFormData();

                const response = await agendaService.apiCallAddUpdateAgenda(payload);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    if (onSaved) {
                        onSaved(parentTaskId);
                    }
                    onClose();
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
            isEditMode ? 'Update Sub Task' : 'Add Sub Task',
        );
    };

    const handleAddUpdateSubTask = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({});

        const validation = validateAddSubTaskForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushSubTaskFormData();

                const response = await taskService.apiCallAddUpdateTask(payload);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    if (onSaved) {
                        onSaved(parentTaskId);
                    }
                    onClose();
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
            isEditMode ? 'Update Sub Task' : 'Add Sub Task',
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Edit Sub Task' : 'Add Sub Task'}
            size="lg"
            cancelText="Cancel"
            onCancel={onClose}
            saveText={isEditMode ? 'Update Sub Task' : 'Add Sub Task'}
            onSubmit={isAgendaTask ? handleAddUpdateAgendaSubTask : handleAddUpdateSubTask}
            loading={isLoading}
        >
            <Loader loading={isLoading} title={loadingMessage}>
                <div />
            </Loader>
            <div>
                <TaskFields
                    isModal
                    isSubTask
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
            </div>
        </Modal>
    );
};

export default AddEditSubTaskModal;
