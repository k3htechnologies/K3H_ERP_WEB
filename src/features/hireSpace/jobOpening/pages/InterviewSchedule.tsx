import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { Edit } from 'lucide-react';

import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import { useToast } from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import {
  convert_dd_mm_yyyy_To_Yyyy_mm_dd,
  convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd,
  formatDate_dd_mm_yyyy,
  formatDate_dd_MonthName_yy,
  formatDate_yyyy_mm_dd,
  isToday,
  parseTimeFromISO,
} from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import {
  InterviewCalendar,
  InterviewDetailsPanel,
} from '@/features/hireSpace/jobOpening/components';
import { useJobOpeningListState } from '@/features/hireSpace/jobOpening/context/JobOpeningListStateContext';
import {
  fetchCandidateDropdown,
  fetchJobOpeningDepartmentDropdown,
  fetchJobOpeningMasterDropdown,
} from '@/features/hireSpace/jobOpening/jobOpeningDropDown';
import type {
  AddUpdateCandidateInterviewRequest,
  CandidateInterviewData,
} from '@/features/hireSpace/jobOpening/models/CandidateInterviewModel';
import { CandidateInterviewService } from '@/features/hireSpace/jobOpening/services/CandidateInterviewService';
import type { CalendarEvent } from '@/ui/components/Calender/CalendarEvent';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { Button, Input } from '@/ui/components/forms';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { TextArea } from '@/ui/components/forms/Textarea';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import { Modal } from '@/ui/components/Modal/Modal';
import { TimePicker } from '@/ui/components/TimePicker/TimePicker';

const initialFormState = (): AddUpdateCandidateInterviewRequest => ({
  InterviewId: 0,
  UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  CandidateId: '',
  JobOpeningMasterId: 0,
  Stage: 'Interview',
  InterviewPanel: '',
  InterviewDate: '',
  InterviewTime: '',
  AttachmentUrl: null,
  RemoveattachmentUrl: '',
  Remarks: '',
});

export const InterviewSchedule: React.FC = () => {

  const [interviews, setInterviews] = useState<CandidateInterviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [formData, setFormData] = useState<AddUpdateCandidateInterviewRequest>(() => initialFormState());
  const [editCandidateInterviewData, setEditCandidateInterviewData] = useState<CandidateInterviewData | null>(null);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<(File | string)[]>([]);
  const [removeAttachmentUrls, setRemoveAttachmentUrls] = useState<string[]>([]);
  const [attachmentURL, setAttachmentURL] = useState<string>();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isTodayListExpanded, setIsTodayListExpanded] = useState(false);
  const [selectedInterviewerValues, setSelectedInterviewerValues] = useState<string | number | null>(null);
  const [selectedCandidateValues, setSelectedCandidateValues] = useState<string | number | null>(null);
  const [dropdownLabels, setDropdownLabels] = useState<{
    candidateName?: string
    jobOpeningName?: string
  }>({});
  const [departments, setDepartments] = useState<{ id: string; label: string; count: number }[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { listState } = useJobOpeningListState();
  const candidateId = listState.candidateId;
  const candidateName = listState.candidateName;
  const jobRoleName = listState.jobRoleName;
  const jobOpeningMasterId = listState.jobOpeningMasterId;
  const isComingFromJobApplicationDetails: boolean | undefined = location.state?.isComingFromJobApplicationDetails;
  const showSelectionDropdowns = !isComingFromJobApplicationDetails && !editCandidateInterviewData;
  const { canAction } = useMenuPermissions('/jobOpenings');

  const interviewerDropdown = useMultiSelectDropdown({
    value: selectedInterviewerValues,
    fetchCallback: fetchEmployeeMasterDropdown,
    autoFetchOptions: true,
  });

  const candidateDropdown = useMultiSelectDropdown({
    value: selectedCandidateValues,
    fetchCallback: fetchCandidateDropdown,
    autoFetchOptions: true,
  });

  const loadDepartments = async () => {
    const response = await fetchJobOpeningDepartmentDropdown();
    setDepartments(response.itemList);
  };

  const todayKey = formatDate_yyyy_mm_dd(new Date());

  const monthKey = useMemo(
    () => `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`,
    [selectedDate],
  );

  const loadInterviews = async (month: number, year: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await CandidateInterviewService.apiCallPullCandidateInterview({
          PageSize: 1000,
          PageNumber: 1,
          Month: month,
          Year: year,
        });

        if (E.isRight(response)) {
          setInterviews(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Interviews',
    );
  };

  useEffect(() => {
    loadInterviews(selectedDate.getMonth() + 1, selectedDate.getFullYear());
  }, [monthKey]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editCandidateInterviewData) {
        setFormData({
          InterviewId: editCandidateInterviewData.InterviewId || 0,
          UniqueKey: editCandidateInterviewData.UniqueKey || initialFormState().UniqueKey,
          CandidateId: String(editCandidateInterviewData.CandidateId || ''),
          JobOpeningMasterId: editCandidateInterviewData.JobOpeningMasterId || 0,
          Stage: editCandidateInterviewData.Stage || '',
          InterviewPanel: editCandidateInterviewData.InterviewPanel || '',
          InterviewDate: convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(editCandidateInterviewData.InterviewDate),
          InterviewTime: parseTimeFromISO(`1970-01-01T${editCandidateInterviewData.InterviewTime || ''}`),
          AttachmentUrl: null,
          RemoveattachmentUrl: '',
          Remarks: editCandidateInterviewData.Remarks || '',
        });
        setSelectedInterviewerValues(editCandidateInterviewData.InterviewPanel || null);
        setSelectedCandidateValues(String(editCandidateInterviewData.CandidateId || ''));
        setAttachmentFiles([]);
        setAttachmentURL(editCandidateInterviewData.AttachmentUrl || '');
        setRemoveAttachmentUrls([]);
        setSelectedDepartmentId(0);
        setDropdownLabels({
          candidateName: editCandidateInterviewData.CandidateName || '',
          jobOpeningName: editCandidateInterviewData.RoleName || '',
        });
      } else if (isComingFromJobApplicationDetails) {
        setFormData({
          ...initialFormState(),
          CandidateId: String(candidateId),
          JobOpeningMasterId: jobOpeningMasterId,
          InterviewDate: formatDate_yyyy_mm_dd(selectedDate),
        });
        setSelectedInterviewerValues(null);
        setSelectedCandidateValues(String(candidateId));
        setAttachmentFiles([]);
        setAttachmentURL('');
        setRemoveAttachmentUrls([]);
        setSelectedDepartmentId(0);
        setDropdownLabels({
          candidateName: candidateName,
          jobOpeningName: jobRoleName,
        });
      } else {
        setFormData({
          ...initialFormState(),
          InterviewDate: formatDate_yyyy_mm_dd(selectedDate),
        });
        setSelectedInterviewerValues(null);
        setSelectedCandidateValues(null);
        setAttachmentFiles([]);
        setAttachmentURL('');
        setRemoveAttachmentUrls([]);
        setSelectedDepartmentId(0);
        setDropdownLabels({});
        loadDepartments();
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen]);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return interviews
      .map((item) => {
        if (!item.InterviewDate || !item.InterviewTime) return null;

        const dateKey = item.InterviewDate.split('T')[0];
        const start = `${dateKey}T${item.InterviewTime}`;

        return {
          id: item.InterviewId,
          type: 'MEETING',
          title: `${item.InterviewTime.slice(0, 5)} - ${item.CandidateName}`,
          start,
          end: start,
          fullname: item.InterviewPanelName,
          CreatedBy: item.InterviewPanelName,
          CreatedDate: dateKey,
        };
      })
      .filter(Boolean) as CalendarEvent[];
  }, [interviews]);

  const selectedDateInterviews = useMemo(
    () =>
      interviews.filter(
        (item) =>
          convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(item.InterviewDate) === formatDate_yyyy_mm_dd(selectedDate),
      ),
    [interviews, selectedDate],
  );

  const pipelineInterviews = useMemo(
    () =>
      interviews.filter((item) => {
        const dateKey = convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(item.InterviewDate);
        return Boolean(dateKey && dateKey >= todayKey);
      }),
    [interviews],
  );

  const isSelectedDateToday = isToday(selectedDate);
  const selectedDateHeading = isSelectedDateToday
    ? 'Upcoming Today'
    : `Interviews - ${formatDate_dd_MonthName_yy(selectedDate)}`;

  const visibleTodaysInterviews = useMemo(
    () =>
      !isSelectedDateToday || isTodayListExpanded
        ? selectedDateInterviews
        : selectedDateInterviews.slice(0, 2),
    [isTodayListExpanded, selectedDateInterviews],
  );

  const isViewOnlyInterview = Boolean(
    editCandidateInterviewData &&
    convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(editCandidateInterviewData.InterviewDate) < todayKey,
  );

  const handleDateChange = (date: Date) => {
    setIsTodayListExpanded(false);
    setSelectedDate(date);
  };

  const handleAddCandidateInterviewModal = () => {
    setEditCandidateInterviewData(null);
    setIsAddUpdateModalOpen(true);
  };

  const handleEditCandidateInterview = (row: CandidateInterviewData) => {
    setEditCandidateInterviewData(row);
    setIsAddUpdateModalOpen(true);
  };

  const handleFieldChange = (field: keyof AddUpdateCandidateInterviewRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateScheduleInterviewForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.InterviewPanel) {
      newErrors.InterviewPanel = 'Interviewers is required';
    }

    if (!formData.InterviewDate) {
      newErrors.InterviewDate = 'Interview date is required';
    }

    if (!formData.InterviewTime) {
      newErrors.InterviewTime = 'Interview time is required';
    }

    if (!formData.Stage.trim()) {
      newErrors.Stage = 'Stage is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const PushCandidateInterviewFormData = (): FormData => {
    const fd = new FormData();

    fd.append('InterviewId', String(formData.InterviewId));
    fd.append('UniqueKey', formData.UniqueKey);
    fd.append('CandidateId', formData.CandidateId);
    fd.append('JobOpeningMasterId', String(formData.JobOpeningMasterId));
    fd.append('Stage', formData.Stage.trim());
    fd.append('InterviewPanel', formData.InterviewPanel);
    fd.append('InterviewDate', `${formData.InterviewDate}T${formData.InterviewTime}:00`);
    fd.append('InterviewTime', formData.InterviewTime);
    fd.append('Remarks', formData.Remarks.trim());

    attachmentFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append('AttachmentUrl', file);
      }
    });

    fd.append('RemoveattachmentUrl', removeAttachmentUrls.join(','));

    return fd;
  };

  const handleModalClose = () => {
    setIsAddUpdateModalOpen(false);
    setEditCandidateInterviewData(null);
    setFormData(initialFormState());
    setErrors({});
    setAttachmentFiles([]);
    setAttachmentURL('');
    setRemoveAttachmentUrls([]);
    setSelectedInterviewerValues(null);
    setSelectedCandidateValues(null);
    setDropdownLabels({});
    setSelectedDepartmentId(0);
  };

  const handleAddUpdateInterview = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const validation = validateScheduleInterviewForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushCandidateInterviewFormData();
        const response = await CandidateInterviewService.apiCallAddUpdateCandidateInterview(payload);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          handleModalClose();

          const [year, month, day] = formData.InterviewDate.split('-').map(Number);
          const navigationDate = new Date(year, month - 1, day);

          handleDateChange(navigationDate);
          
          await loadInterviews(navigationDate.getMonth() + 1, navigationDate.getFullYear());
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      editCandidateInterviewData ? 'Update Interview' : 'Schedule Interview',
    );
  };

  const handleViewMoreToday = () => {
    setIsTodayListExpanded(true);
  };

  const handleBackInterviewPage = () => {
    navigate(-1);
  };

  const handleEventClick = (calendarEvent: CalendarEvent) => {
    const item = interviews.find((interview) => interview.InterviewId === Number(calendarEvent.id));
    if (!item) return;
    handleEditCandidateInterview(item);
  };

  const pipelineColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'CandidateName',
        label: 'Candidate',
        render: (value) => value || '-',
      },
      {
        key: 'RoleName',
        label: 'Position',
        render: (value) => value || '-',
      },
      {
        key: 'InterviewPanelName',
        label: 'Interviewer',
        render: (value) => value || '-',
      },
      {
        key: 'InterviewDate',
        label: 'Date & Time',
        render: (value) => value || '-',
      },
      {
        key: 'Stage',
        label: 'Stage',
        render: (value) => value || '-',
      },
      {
        key: 'Actions',
        label: 'Action',
        align: 'center',
        width: '80px',
        truncate: false,
        render: (_value, item: CandidateInterviewData) =>
          canAction ? (
            <Button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleEditCandidateInterview(item);
              }}
              title="Edit"
              color="transparent"
              isborderRadius
              size="sm"
            >
              <Edit className="h-4 w-4 text-blue-700" />
            </Button>
          ) : null,
      },
    ],
    [canAction],
  );

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="mb-5">
        <HeaderActionBar
          titleText="Schedule Interview"
          onCancel={handleBackInterviewPage}
          canAction={canAction}
          EditText="Schedule Interview"
          onEdit={handleAddCandidateInterviewModal}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <InterviewCalendar
            date={selectedDate}
            events={calendarEvents}
            onDateChange={handleDateChange}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="min-w-0 xl:col-span-1">
          <InterviewDetailsPanel
            heading={selectedDateHeading}
            interviewCount={selectedDateInterviews.length}
            interviews={visibleTodaysInterviews}
            emptyMessage={
              isSelectedDateToday
                ? 'No upcoming interviews for today'
                : 'No interviews scheduled for this date'
            }
            canAction={canAction}
            isViewOnly={formatDate_yyyy_mm_dd(selectedDate) < todayKey}
            onEdit={handleEditCandidateInterview}
            onView={handleEditCandidateInterview}
            onViewAll={handleViewMoreToday}
            showViewAllButton={
              isSelectedDateToday &&
              !isTodayListExpanded &&
              selectedDateInterviews.length > 2
            }
          />
        </div>
      </div>

      <section
        id="interview-pipeline"
        className="mt-4 scroll-mt-4 bg-white p-4 sm:p-5"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Interview Pipeline</h2>

        <div className="max-h-[360px] overflow-auto thin-scroll">
          <div className="min-w-[820px]">
            <DataTable
              data={pipelineInterviews}
              columns={pipelineColumns}
              rowKey="InterviewId"
              emptyMessage="No upcoming interviews scheduled"
            />
          </div>
        </div>
      </section>

      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={handleModalClose}
        onCancel={handleModalClose}
        title={
          !editCandidateInterviewData
            ? 'Schedule Interview'
            : isViewOnlyInterview
              ? 'View Interview'
              : 'Update Interview'
        }
        onSubmit={isViewOnlyInterview ? (event) => event.preventDefault() : handleAddUpdateInterview}
        saveText={
          isViewOnlyInterview
            ? ''
            : !editCandidateInterviewData
              ? 'Schedule'
              : 'Update'
        }
        cancelText={isViewOnlyInterview ? 'Close' : 'Cancel'}
        loading={isLoading}
        size="xl"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {showSelectionDropdowns ? (
            <>
              <SinglePageSelection
                label="Department"
                placeholder="Select Department"
                value={selectedDepartmentId ? String(selectedDepartmentId) : ''}
                valueKey="id"
                disabled={isViewOnlyInterview}
                options={departments}
                onChange={(value) => {
                  setSelectedDepartmentId(Number(value) || 0);
                  handleFieldChange('JobOpeningMasterId', 0);
                  handleFieldChange('CandidateId', '');
                  setSelectedCandidateValues(null);
                  setDropdownLabels((prev) => ({ ...prev, jobOpeningName: '' }));
                }}
              />

              <SingleSelectDropdownWithPagination
                key={`job-opening-${selectedDepartmentId}`}
                label="Job Opening"
                title="Select Job Opening"
                size="lg"
                disabled={isViewOnlyInterview || !selectedDepartmentId}
                dataFetchCallBack={(pageNumber, params) =>
                  fetchJobOpeningMasterDropdown(pageNumber, {
                    value: params?.value,
                    departmentId: selectedDepartmentId,
                  })
                }
                onSelected={(item) => {
                  if (!item) {
                    handleFieldChange('JobOpeningMasterId', 0);
                    handleFieldChange('CandidateId', '');
                    setSelectedCandidateValues(null);
                    setDropdownLabels((prev) => ({ ...prev, jobOpeningName: '' }));
                    return;
                  }

                  handleFieldChange('JobOpeningMasterId', Number(item.value));
                  handleFieldChange('CandidateId', '');
                  setSelectedCandidateValues(null);
                  setDropdownLabels((prev) => ({ ...prev, jobOpeningName: item.label }));
                }}
                initialValue={createDropdownInitialValue(
                  formData.JobOpeningMasterId,
                  dropdownLabels.jobOpeningName,
                )}
              />

              <div>
                <MultiSelectPagination
                  key={`candidate-${formData.JobOpeningMasterId}`}
                  label="Candidate"
                  title="Select Candidate"
                  disabled={isViewOnlyInterview || !formData.JobOpeningMasterId}
                  dataFetchCallBack={(pageNumber, params) =>
                    fetchCandidateDropdown(pageNumber, {
                      value: params?.value,
                      jobOpeningId: formData.JobOpeningMasterId,
                      departmentId: selectedDepartmentId,
                    })
                  }
                  selectedValues={candidateDropdown.selectedValues}
                  options={candidateDropdown.initialOptions}
                  onChange={(values) => {
                    const { idsString } = candidateDropdown.handleChange(values);
                    setSelectedCandidateValues(idsString || null);
                    handleFieldChange('CandidateId', idsString);
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <Input
                label="Candidate"
                required
                disabled
                value={dropdownLabels.candidateName || ''}
                placeholder="Candidate name"
              />

              <Input
                label="Job Title"
                required
                disabled
                value={dropdownLabels.jobOpeningName || ''}
                placeholder="Job title"
              />
            </>
          )}

          <div>
            <MultiSelectPagination
              label="Interviewers"
              title="Select Interviewers"
              required
              disabled={isViewOnlyInterview}
              dataFetchCallBack={fetchEmployeeMasterDropdown}
              selectedValues={interviewerDropdown.selectedValues}
              options={interviewerDropdown.initialOptions}
              onChange={(values) => {
                const { idsString } = interviewerDropdown.handleChange(values);
                setSelectedInterviewerValues(idsString || null);
                handleFieldChange('InterviewPanel', idsString);
              }}
              error={errors.InterviewPanel}
            />
          </div>

          <Input
            label="Stage"
            required
            disabled={isViewOnlyInterview}
            value={formData.Stage}
            onChange={(event) => handleFieldChange('Stage', event.target.value)}
            placeholder="Enter interview stage"
            error={errors.Stage}
          />

          <DatePickerInput
            label="Interview Date"
            required
            disabled={isViewOnlyInterview}
            value={formatDate_dd_mm_yyyy(formData.InterviewDate)}
            onChange={(value) => handleFieldChange('InterviewDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(value))}
            error={errors.InterviewDate}
          />

          <TimePicker
            label="Interview Time"
            required
            format={24}
            disabled={isViewOnlyInterview}
            value={formData.InterviewTime}
            onChange={(value) => handleFieldChange('InterviewTime', value)}
            error={errors.InterviewTime}
          />

          <div className="sm:col-span-2">
            <MultiFilePicker
              label="Attachment"
              value={attachmentFiles}
              onChange={setAttachmentFiles}
              availableFilesURL={attachmentURL ?? ''}
              onRemoveExisting={(url) => {
                setRemoveAttachmentUrls((prev) => [...prev, url]);
              }}
              maxFiles={5}
              disabled={isViewOnlyInterview}
            />
          </div>

          <div className="sm:col-span-2">
            <TextArea
              label="Remarks"
              autoResize={false}
              disabled={isViewOnlyInterview}
              value={formData.Remarks}
              onChange={(event) => handleFieldChange('Remarks', event.target.value)}
              placeholder="Enter interview remarks"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InterviewSchedule;
