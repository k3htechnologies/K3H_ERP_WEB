import { Input } from '@/ui/components/forms';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
import { TextArea } from '@/ui/components/forms/Textarea';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import type { AddUpdateTaskDetailsRequest, TaskInitialStatusData, TaskPriorityData } from '@/features/task/models/TaskModel';

interface Props {
    formData: AddUpdateTaskDetailsRequest;
    onFieldChange: (field: keyof AddUpdateTaskDetailsRequest, value: any) => void;
    errors: { [k: string]: string };
    isModal?: boolean;
    isSubTask?: boolean;
    taskPriorityDropdown: TaskPriorityData[];
    taskInitialStateDropdown: TaskInitialStatusData[];
    assigneeName?: string;
    documentFiles: (File | string)[];
    setDocumentFiles: (files: (File | string)[]) => void;
    documentURL?: string;
    onRemoveExistingDocument: (url: string) => void;
    tagsDropdown: ReturnType<typeof useMultiSelectDropdown>;
    reviewerDropdown: ReturnType<typeof useMultiSelectDropdown>;
    responsiblePersonDropdown: ReturnType<typeof useMultiSelectDropdown>;
    setSelectedTagsEmployeeValues: (value: string | number | null) => void;
    setSelectedReviewerValues: (value: string | number | null) => void;
    setSelectedResponsiblePersonValues: (value: string | number | null) => void;
    isAgendaTask?: boolean;
}

export const TaskFields: React.FC<Props> = ({
    formData,
    onFieldChange,
    errors,
    isModal = false,
    isSubTask = false,
    taskPriorityDropdown,
    taskInitialStateDropdown,
    assigneeName,
    documentFiles,
    setDocumentFiles,
    documentURL,
    onRemoveExistingDocument,
    tagsDropdown,
    reviewerDropdown,
    responsiblePersonDropdown,
    setSelectedTagsEmployeeValues,
    setSelectedReviewerValues,
    setSelectedResponsiblePersonValues,
    isAgendaTask = false,
}) => {
    const titleLabel = isSubTask ? 'Sub Task Title' : 'Task Title';
    const priorityLabel = isSubTask ? 'Sub Task Priority' : 'Task Priority';
    const statusLabel = isSubTask ? 'Sub Task Initial Status' : 'Task Initial Status';
    const descriptionLabel = isSubTask ? 'Sub Task Description' : 'Task Description';

    const detailsFields = (
        <>
            <div className="space-y-4">
                <div>
                    <Input
                        type="text"
                        required
                        label={titleLabel}
                        value={formData.TaskTitle || ''}
                        onChange={(e) => onFieldChange('TaskTitle', e.target.value)}
                        placeholder={`Enter ${titleLabel}`}
                        maxLength={100}
                        error={errors.TaskTitle}                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <SinglePageSelection
                            label={priorityLabel}
                            required
                            value={formData.TaskPriorityId}
                            onChange={(val) => onFieldChange('TaskPriorityId', Number(val))}
                            options={taskPriorityDropdown.map((opt) => ({ label: opt.Priority, value: opt.TaskPriorityId }))}
                            error={errors.TaskPriorityId}                        />
                    </div>
                    <div>
                        <SinglePageSelection
                            label={statusLabel}
                            required
                            value={formData.TaskInitialStatusId}
                            onChange={(val) => onFieldChange('TaskInitialStatusId', Number(val))}
                            options={taskInitialStateDropdown.map((opt) => ({ label: opt.Status, value: opt.TaskStatusId }))}
                            error={errors.TaskInitialStatusId}                        />
                    </div>
                </div>
            </div>

            <div>
                <TextArea
                    label={descriptionLabel}
                    className="thin-scroll"
                    value={formData.TaskDescription || ''}
                    placeholder={`Enter ${descriptionLabel}`}
                    onChange={(e) => onFieldChange('TaskDescription', e.target.value)}
                    error={errors.TaskDescription}                />
            </div>

            <div>
                <MultiFilePicker
                    label="Document"
                    placeholder="Select Files"
                    value={documentFiles}
                    onChange={setDocumentFiles}
                    availableFilesURL={documentURL}
                    allowedTypes={['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']}
                    maxFiles={5}
                    maxSizeMB={10}
                    onRemoveExisting={onRemoveExistingDocument}                />
            </div>
        </>
    );

    const assignmentFields = (
        <>
            <div>
                {isAgendaTask ? (
                    <MultiSelectPagination
                        label="Responsible Person"
                        required
                        dataFetchCallBack={fetchEmployeeMasterDropdown}
                        selectedValues={responsiblePersonDropdown.selectedValues}
                        options={responsiblePersonDropdown.initialOptions}
                        onChange={(values) => {
                            const { ids, idsString } = responsiblePersonDropdown.handleChange(values);
                            setSelectedResponsiblePersonValues(idsString || null);
                            onFieldChange(
                                'ResponsiblePersonJson',
                                ids.length ? JSON.stringify(ids.map((id) => ({ ResponsiblePersonId: id }))) : '',
                            );
                        }}
                        error={errors.ResponsiblePersonJson}                    />
                ) : (
                    <SingleSelectDropdownWithPagination
                        label="Assignee"
                        required
                        title="Select Assignee"
                        size="lg"
                        dataFetchCallBack={fetchEmployeeMasterDropdown}
                        onSelected={(item) => onFieldChange('AssigneeId', item ? Number(item.value) : 0)}
                        initialValue={createDropdownInitialValue(formData.AssigneeId, assigneeName)}
                        error={errors.AssigneeId}                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <DatePickerInput
                        label="Start Date"
                        value={formatDate_dd_mm_yyyy(formData.StartDate)}
                        onChange={(val) => onFieldChange('StartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        error={errors.StartDate}                    />
                </div>
                <div>
                    <DatePickerInput
                        label="Deadline"
                        value={formatDate_dd_mm_yyyy(formData.DueDate)}
                        onChange={(val) => onFieldChange('DueDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                        required
                        error={errors.DueDate}                    />
                </div>
            </div>

            <div>
                <MultiSelectPagination
                    label="Tags"
                    dataFetchCallBack={fetchEmployeeMasterDropdown}
                    selectedValues={tagsDropdown.selectedValues}
                    options={tagsDropdown.initialOptions}
                    onChange={(values) => {
                        const { ids, idsString } = tagsDropdown.handleChange(values);
                        setSelectedTagsEmployeeValues(idsString || null);
                        onFieldChange('TagsEmployeeJson', JSON.stringify(ids.map((id) => ({ TagId: id }))));
                    }}
                    error={errors.TagsEmployeeJson}                />
            </div>

            <div>
                <MultiSelectPagination
                    label="Reviewer"
                    title="Select Reviewer"
                    size="lg"
                    dataFetchCallBack={fetchEmployeeMasterDropdown}
                    selectedValues={reviewerDropdown.selectedValues}
                    options={reviewerDropdown.initialOptions}
                    onChange={(values) => {
                        const { ids, idsString } = reviewerDropdown.handleChange(values);
                        setSelectedReviewerValues(idsString || null);
                        onFieldChange('ReviewerJson', JSON.stringify(ids.map((id) => ({ ReviewerId: id }))));
                    }}
                    error={errors.ReviewerJson}                />
            </div>
        </>
    );

    if (isModal) {
        return (
            <div className="space-y-4">
                {detailsFields}
                {assignmentFields}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 md:divide-x md:divide-gray-200">
            <div className="md:pr-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
                    Task Details
                </h3>
                {detailsFields}
            </div>
            <div className="md:pl-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
                    Assignment
                </h3>
                {assignmentFields}
            </div>
        </div>
    );
};
