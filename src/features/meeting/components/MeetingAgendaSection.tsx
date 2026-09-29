import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as E from 'fp-ts/Either';
import { Edit, ListTodo, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/core/hooks/useToast';
import usePagination from '@/core/hooks/usePagination';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { runApiWithLoader } from '@/core/utils';
import { Loader } from '@/core/utils/loader';
import { useMultiSelectDropdown } from '@/core/hooks/useMultiSelectDropdown';
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import type { TableColumn, PaginationInfo } from '@/ui/components/DataTable/DataTable';
import DataTableExpandable, { type DataTableExpandableRef } from '@/ui/components/DataTable/DataTableExpandable';
import { DataTableWithOutBorder } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { Button, Input } from '@/ui/components/forms';
import DatePickerInput from '@/ui/components/forms/Datepicker';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import MultiSelectPagination from '@/ui/components/DropDown/Multiselectpagination';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import { TextArea } from '@/ui/components/forms/Textarea';
import { Modal } from '@/ui/components/Modal/Modal';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import PaginationCard, { type CardPaginationInfo } from '@/ui/components/Card/PaginationCard';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { isToDateGreaterOrEqualFromDate } from '@/core/utils/comman';
import type { AgendaData, AddUpdateAgendaRequest, AddAgendaTaskRequest, DeleteAgendaRequest, FilterWithPaginationAgendaRequest, FilterWithPaginationPreviousAgendaDetailsRequest } from '@/features/meeting/models/AgendaModel';
import { agendaService } from '@/features/meeting/services/AgendaService';
import AgendaResponsiblePersonCell from '@/features/meeting/components/AgendaResponsiblePersonCell';
import { taskService } from '@/features/task/services/TaskService';

const initialFormState = (): AddUpdateAgendaRequest => ({
  AgendaId: 0,
  UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  MeetingId: 0,
  AgendaTitle: '',
  AgendaDescription: '',
  ResponsiblePersonJson: '',
  ReviewerJson: '[]',
  TagsEmployeeJson: '[]',
  PriorityId: 0,
  AgendaStatusId: 0,
  Remark: '',
  AgendaConclusion: '',
  Discussion: '',
  AgendaSource: '',
  ParentTaskId: 0,
  TaskType: '',
  StartDate: '',
  DueDate: '',
  IsAgendaTask: false,
  DocumentURLs: [],
  RemoveDocumentUrl: '',
});

interface MeetingAgendaSectionProps {
  meetingId: number;
  agendaSource?: 'Meeting' | 'MOM';
  canManageAgenda?: boolean;
}

export const MeetingAgendaSection: React.FC<MeetingAgendaSectionProps> = ({
  meetingId,
  agendaSource = 'Meeting',
  canManageAgenda = true,
}) => {
  //#region STATE
  const [agendaList, setAgendaList] = useState<AgendaData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>('');

  const [priorityOptions, setPriorityOptions] = useState<{ label: string; value: number }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ label: string; value: number }[]>([]);
  const [selectedResponsiblePersonValues, setSelectedResponsiblePersonValues] = useState<string | number | null>(null);

  const { pagination, setPagination } = usePagination(20);
  const {
    pagination: previousPagination,
    setPagination: setPreviousPagination,
    resetPagination: resetPreviousPagination,
  } = usePagination(10);

  const { addToast } = useToast();

  const [isPreviousAgendaOpen, setIsPreviousAgendaOpen] = useState(false);
  const [previousAgendas, setPreviousAgendas] = useState<AgendaData[]>([]);
  const [isLoadingPreviousAgendas, setIsLoadingPreviousAgendas] = useState(false);

  const [searchTermForPreviousAgenda, setSearchTermForPreviousAgenda] = useState('');
  const debouncedPreviousAgendaSearch = useDebouncedCallback((value: string) => {
    searchPreviousAgenda(value);
  }, 350);

  const dtRef = useRef<DataTableExpandableRef | null>(null);

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [editingAgendaData, setEditingAgendaData] = useState<AgendaData | null>(null);

  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [agendaModalMode, setAgendaModalMode] = useState<'form' | 'document'>('form');

  const [isConclusionModalOpen, setIsConclusionModalOpen] = useState(false);

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteAgendaDetailsData, setDeleteAgendaDetailsData] = useState<AgendaData | null>(null);

  const [formData, setFormData] = useState<AddUpdateAgendaRequest>(() => initialFormState());

  const responsiblePersonDropdown = useMultiSelectDropdown({
    value: selectedResponsiblePersonValues,
    fetchCallback: fetchEmployeeMasterDropdown,
    autoFetchOptions: true,
  });

  useEffect(() => {
    fetchAgendaPriorityDropdown();
    fetchAgendaStatusDropdown();
  }, []);

  useEffect(() => {
    if (!meetingId) return;
    fetchAgendaList(1);
  }, [meetingId, agendaSource]);

  useEffect(() => {
    return () => {
      debouncedPreviousAgendaSearch.cancel?.();
    };
  }, [debouncedPreviousAgendaSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen || isConclusionModalOpen) {
      if (editingAgendaData) {
        setFormData({
          AgendaId: editingAgendaData.AgendaId,
          UniqueKey: editingAgendaData.UniqueKey || initialFormState().UniqueKey,
          MeetingId: editingAgendaData.MeetingId,
          AgendaTitle: editingAgendaData.AgendaTitle || '',
          AgendaDescription: editingAgendaData.AgendaDescription || '',
          ResponsiblePersonJson: editingAgendaData.ResponsiblePersonDetails.length
            ? JSON.stringify(
                editingAgendaData.ResponsiblePersonDetails.map((item) => ({
                  ResponsiblePersonId: item.ResponsiblePersonId,
                })),
              )
            : '',
          ReviewerJson: JSON.stringify(editingAgendaData.ReviewerDetails),
          TagsEmployeeJson: JSON.stringify(editingAgendaData.TagsEmployeeDetails),
          PriorityId: editingAgendaData.PriorityId || 0,
          AgendaStatusId: editingAgendaData.AgendaStatusId || 0,
          Remark: editingAgendaData.Remark || '',
          AgendaConclusion: editingAgendaData.AgendaConclusion || '',
          Discussion: editingAgendaData.Discussion || '',
          AgendaSource: editingAgendaData.AgendaSource || '',
          ParentTaskId: editingAgendaData.ParentTaskId || 0,
          TaskType: editingAgendaData.TaskType || '',
          StartDate: convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(editingAgendaData.StartDate),
          DueDate: convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(editingAgendaData.DueDate),
          IsAgendaTask: false,
          DocumentURLs: [],
          RemoveDocumentUrl: '',
        });
        setSelectedResponsiblePersonValues(
          editingAgendaData.ResponsiblePersonDetails.map((item) => item.ResponsiblePersonId).join(','),
        );
        setDocumentFiles([]);
        setDocumentURL(editingAgendaData.DocumentURLs || '');
        setRemovedDocumentURLs([]);
      } else {
        setFormData({
          ...initialFormState(),
          MeetingId: meetingId,
          AgendaSource: agendaSource,
        });
        setSelectedResponsiblePersonValues(null);
        setDocumentFiles([]);
        setDocumentURL('');
        setRemovedDocumentURLs([]);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, isConclusionModalOpen, editingAgendaData, meetingId, agendaSource]);

  const fetchAgendaPriorityDropdown = async () => {
    const response = await taskService.apiCallPullTaskPriority();

    if (E.isRight(response)) {
      setPriorityOptions(
        response.right.Data.map((item) => ({
          label: item.Priority,
          value: item.TaskPriorityId,
        })),
      );
    } else {
      addToast({ type: 'error', title: response.left.message });
    }
  };

  const fetchAgendaStatusDropdown = async () => {
    const response = await taskService.apiCallPullTaskInitialState();

    if (E.isRight(response)) {
      setStatusOptions(
        response.right.Data.map((item) => ({
          label: item.Status,
          value: item.TaskStatusId,
        })),
      );
    } else {
      addToast({ type: 'error', title: response.left.message });
    }
  };

  const fetchAgendaList = async (page: number = pagination.currentPage) => {
    return await loadAgendas(page);
  };

  const loadAgendas = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationAgendaRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          MeetingId: meetingId,
          AgendaSource: agendaSource,
        };

        const response = await agendaService.apiCallPullAgenda(params);

        if (E.isRight(response)) {
          setAgendaList(response.right.Data);

          setPagination({
            currentPage: page,
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
      'Loading Agenda',
    );
  };

  const loadPreviousAgendas = async (page: number, searchValue: string) => {
    await runApiWithLoader(
      setIsLoadingPreviousAgendas,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationPreviousAgendaDetailsRequest = {
          PageNumber: page,
          PageSize: previousPagination.pageSize,
          meetingId,
          AgendaTitle: searchValue.trim() || undefined,
        };

        const response = await agendaService.apiCallPullPreviousAgendaDetails(params);

        if (E.isRight(response)) {
          setPreviousAgendas(response.right.Data);

          setPreviousPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / previousPagination.pageSize),
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
      'Loading Previous Agenda',
    );
  };

  const searchPreviousAgenda = async (searchValue: string) => {
    await loadPreviousAgendas(1, searchValue);
  };

  const handleOpenPreviousAgenda = () => {
    setSearchTermForPreviousAgenda('');
    resetPreviousPagination();
    loadPreviousAgendas(1, '');
    setIsPreviousAgendaOpen(true);
  };

  const handleClosePreviousAgenda = () => {
    setIsPreviousAgendaOpen(false);
  };

  const handlePageChange = useCallback(
    (page: number) => {
      fetchAgendaList(page);
    },
    [fetchAgendaList],
  );

  const handlePreviousAgendaPageChange = useCallback(
    (page: number) => {
      loadPreviousAgendas(page, searchTermForPreviousAgenda);
    },
    [loadPreviousAgendas, searchTermForPreviousAgenda],
  );

  const agendaPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange],
  );

  const previousAgendaPaginationInfo: CardPaginationInfo = useMemo(
    () => ({
    currentPage: previousPagination.currentPage,
    totalPages: previousPagination.totalPages,
    totalRecords: previousPagination.totalRecords,
    pageSize: previousPagination.pageSize,
    onPageChange: handlePreviousAgendaPageChange,
    }),
    [
      previousPagination.currentPage,
      previousPagination.totalPages,
      previousPagination.totalRecords,
      previousPagination.pageSize,
      handlePreviousAgendaPageChange,
    ],
  );

  const handleEditAgenda = useCallback((row: AgendaData) => {
    setEditingAgendaData(row);
    setAgendaModalMode('form');
    setIsAddUpdateModalOpen(true);
  }, []);

  const handleEditAgendaDocument = useCallback((row: AgendaData) => {
    setEditingAgendaData(row);
    setAgendaModalMode('document');
    setIsAddUpdateModalOpen(true);
  }, []);

  const handleEditPreviousAgenda = (row: AgendaData) => {
    setEditingAgendaData({
      ...row,
        AgendaId: 0,
      UniqueKey: initialFormState().UniqueKey,
        MeetingId: meetingId,
        AgendaSource: agendaSource,
        AgendaConclusion: '',
    });
    setAgendaModalMode('form');
    handleClosePreviousAgenda();
    setIsAddUpdateModalOpen(true);
  };

  const handleConfirmationDialogBoxOpen = useCallback((row: AgendaData) => {
    setDeleteAgendaDetailsData(row);
    setIsConfirmationDialogBoxOpen(true);
  }, []);

  const handleConclusionModal = (row: AgendaData) => {
    setEditingAgendaData(row);
    setIsConclusionModalOpen(true);
  };

  const PushConclusionFormData = (): FormData => {
    const fd = new FormData();

    fd.append('AgendaId', String(formData.AgendaId ?? 0));
    fd.append('UniqueKey', formData.UniqueKey ?? '');
    fd.append('MeetingId', String(formData.MeetingId ?? 0));
    fd.append('AgendaTitle', formData.AgendaTitle ?? '');
    fd.append('AgendaDescription', formData.AgendaDescription ?? '');
    fd.append('ResponsiblePersonJson', formData.ResponsiblePersonJson ?? '');
    fd.append('AgendaStatusId', String(formData.AgendaStatusId ?? 0));
    fd.append('Remark', formData.Remark ?? '');
    fd.append('AgendaConclusion', formData.AgendaConclusion.trim());
    fd.append('Discussion', formData.Discussion ?? '');
    fd.append('PriorityId', String(formData.PriorityId ?? 0));
    fd.append('AgendaSource', formData.AgendaSource ?? '');
    fd.append('ParentTaskId', String(formData.ParentTaskId ?? 0));
    fd.append('TaskType', formData.TaskType ?? '');
    fd.append('StartDate', formData.StartDate ?? '');
    fd.append('DueDate', formData.DueDate ?? '');
    fd.append('IsAgendaTask', String(formData.IsAgendaTask ?? false));
    fd.append('ReviewerJson', formData.ReviewerJson ?? '');
    fd.append('TagsEmployeeJson', formData.TagsEmployeeJson ?? '');
    fd.append('RemoveDocumentUrl', '');

    return fd;
  };

  const handleAddUpdateConclusion = async (e: React.FormEvent) => {
    e.preventDefault();

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushConclusionFormData();

        const response = await agendaService.apiCallAddUpdateAgenda(payload);

        if (E.isRight(response)) {
          setIsConclusionModalOpen(false);

          await fetchAgendaList();
          await loadPreviousAgendas(previousPagination.currentPage, searchTermForPreviousAgenda);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setEditingAgendaData(null);
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
      'Update Conclusion',
    );
  };

  const handleAddPreviousAgenda = async (row: AgendaData) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const fd = new FormData();

        fd.append('AgendaId', String(0));
        fd.append('UniqueKey', initialFormState().UniqueKey);
        fd.append('MeetingId', String(meetingId));
        fd.append('AgendaTitle', row.AgendaTitle ?? '');
        fd.append('AgendaDescription', row.AgendaDescription ?? '');
        fd.append(
          'ResponsiblePersonJson',
          row.ResponsiblePersonDetails.length
            ? JSON.stringify(
                row.ResponsiblePersonDetails.map((item) => ({
                  ResponsiblePersonId: item.ResponsiblePersonId,
                })),
              )
            : '',
        );
        fd.append('AgendaStatusId', String(row.AgendaStatusId ?? 0));
        fd.append('Remark', row.Remark ?? '');
        fd.append('AgendaConclusion', '');
        fd.append('Discussion', row.Discussion ?? '');
        fd.append('PriorityId', String(row.PriorityId ?? 0));
        fd.append('AgendaSource', agendaSource);
        fd.append('ParentTaskId', String(row.ParentTaskId ?? 0));
        fd.append('TaskType', row.TaskType ?? '');
        fd.append('StartDate', convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(row.StartDate));
        fd.append('DueDate', convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(row.DueDate));
        fd.append('IsAgendaTask', String(false));
        fd.append('ReviewerJson', JSON.stringify(row.ReviewerDetails));
        fd.append('TagsEmployeeJson', JSON.stringify(row.TagsEmployeeDetails));
        fd.append('RemoveDocumentUrl', '');

        const response = await agendaService.apiCallAddUpdateAgenda(fd);

        if (E.isRight(response)) {
          await fetchAgendaList(1);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
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
      'Add Agenda',
    );
  };

  const handleCreateAgendaTask = async (row: AgendaData) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: AddAgendaTaskRequest = {
          AgendaId: row.AgendaId,
          UniqueKey: row.UniqueKey,
          ParentTaskId: row.ParentTaskId,
          TaskType: row.TaskType || 'Task',
          IsAgendaTask: true,
        };

        const response = await agendaService.apiCallAddAgendaTask(params);

        if (E.isRight(response)) {
          await fetchAgendaList();

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
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
      'Create Agenda Task',
    );
  };

  const agendaColumns = useMemo<TableColumn[]>(
    () => [
    {
      key: 'AgendaTitle',
      label: 'Title',
      width: '30',
      fixed: 'left',
      align: 'left',
    },
    {
      key: 'CreatedBy',
      label: 'Created By',
      width: '20',
      align: 'left',
      render: (value) => value || '-',
    },
    {
      key: 'ResponsiblePersonName',
      label: 'Responsible Person',
      width: '160px',
      maxWidth: '160px',
      align: 'left',
      truncate: false,
      render: (_value, row: AgendaData) => (
        <AgendaResponsiblePersonCell agenda={row} />
      ),
    },
    {
      key: 'Priority',
      label: 'Priority',
      width: '12',
      align: 'left',
    },
    {
      key: 'AgendaStatus',
      label: 'Status',
      width: '13',
      align: 'left',
    },
    ],
    [],
  );

  const agendaDetailsColumns = useMemo<TableColumn[]>(
    () => [
    {
      key: 'AgendaDescription',
      label: 'Agenda Description',
      width: '35',
      align: 'left',
      truncate: false,
      render: (value) => value || '-',
    },
    {
      key: 'Discussion',
      label: 'Discussion',
      width: '30',
      align: 'left',
      truncate: false,
      render: (value) => value || '-',
    },
    {
      key: 'AgendaConclusion',
      label: 'Conclusion',
      width: '35',
      align: 'left',
      truncate: false,
      render: (value) => value || '-',
    },
    ...(canManageAgenda
      ? [
          {
            key: 'Actions',
            label: 'Action',
            width: '180px',
            maxWidth: '180px',
            fixed: 'right' as const,
            align: 'right' as const,
              render: (_value: unknown, row: AgendaData) => (
                <div className="flex items-center justify-end ml-2 gap-1">
                  <div className="w-[34px] flex justify-center">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditAgendaDocument(row);
                      }}
                      color="transparent"
                      isborderRadius
                      size="sm"
                      title="Document"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="w-[34px] flex justify-center">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditAgenda(row);
                      }}
                      color="transparent"
                      isborderRadius
                      size="sm"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="w-[34px] flex justify-center">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateAgendaTask(row);
                      }}
                      color="transparent"
                      isborderRadius
                      size="sm"
                      title="Create Task"
                    >
                      <ListTodo className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="w-[34px] flex justify-center">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleConfirmationDialogBoxOpen(row);
                      }}
                      color="transparent"
                      isborderRadius
                      size="sm"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                </div>
              ),
          },
        ]
      : []),
    ],
    [canManageAgenda, handleEditAgendaDocument, handleEditAgenda, handleCreateAgendaTask, handleConfirmationDialogBoxOpen],
  );

  const handleFieldChange = (field: keyof AddUpdateAgendaRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddAgendaModal = () => {
    setEditingAgendaData(null);
    setFormData({
      ...initialFormState(),
      MeetingId: meetingId,
      AgendaSource: agendaSource,
    });
    setErrors({});
    setDocumentFiles([]);
    setDocumentURL('');
    setRemovedDocumentURLs([]);
    setAgendaModalMode('form');
    setIsAddUpdateModalOpen(true);
  };

  const validateAddAgendaForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.AgendaTitle?.trim()) {
      newErrors.AgendaTitle = 'Agenda title is required';
    }

    if (!formData.ResponsiblePersonJson) {
      newErrors.ResponsiblePersonJson = 'Responsible person is required';
    }

    if (!formData.PriorityId) {
      newErrors.PriorityId = 'Priority is required';
    }

    if (!formData.AgendaStatusId) {
      newErrors.AgendaStatusId = 'Status is required';
    }

    if (!formData.StartDate) {
      newErrors.StartDate = 'Start date is required';
    }

    if (!formData.DueDate) {
      newErrors.DueDate = 'Due date is required';
    }

    if (
      formData.StartDate &&
      formData.DueDate &&
      !isToDateGreaterOrEqualFromDate(formData.StartDate, formData.DueDate)
    ) {
      newErrors.DueDate = 'Due date must be on or after start date';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const PushAgendaFormData = (): FormData => {
    const fd = new FormData();

    fd.append('AgendaId', String(formData.AgendaId ?? 0));
    fd.append('UniqueKey', formData.UniqueKey ?? '');
    fd.append('MeetingId', String(formData.MeetingId ?? 0));
    fd.append('AgendaTitle', formData.AgendaTitle ?? '');
    fd.append('AgendaDescription', formData.AgendaDescription ?? '');
    fd.append('ResponsiblePersonJson', formData.ResponsiblePersonJson ?? '');
    fd.append('AgendaStatusId', String(formData.AgendaStatusId ?? 0));
    fd.append('Remark', formData.Remark ?? '');
    fd.append('AgendaConclusion', formData.AgendaConclusion ?? '');
    fd.append('Discussion', formData.Discussion ?? '');
    fd.append('PriorityId', String(formData.PriorityId ?? 0));
    fd.append('AgendaSource', formData.AgendaSource ?? '');
    fd.append('ParentTaskId', String(formData.ParentTaskId ?? 0));
    fd.append('TaskType', formData.TaskType ?? '');
    fd.append('StartDate', formData.StartDate ?? '');
    fd.append('DueDate', formData.DueDate ?? '');
    fd.append('IsAgendaTask', String(formData.IsAgendaTask ?? false));
    fd.append('ReviewerJson', formData.ReviewerJson ?? '');
    fd.append('TagsEmployeeJson', formData.TagsEmployeeJson ?? '');

    documentFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append('DocumentURLs', file);
      }
    });

    fd.append('RemoveDocumentUrl', removedDocumentURLs.join(','));

    return fd;
  };

  const handleAddUpdateAgenda = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    if (agendaModalMode === 'form') {
      const validation = validateAddAgendaForm();

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushAgendaFormData();

        const response = await agendaService.apiCallAddUpdateAgenda(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          await fetchAgendaList(formData.AgendaId === 0 ? 1 : pagination.currentPage);

          dtRef.current?.collapseAll();

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setEditingAgendaData(null);
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
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
      formData.AgendaId === 0 ? 'Add Agenda' : 'Update Agenda',
    );
  };

  const handleDeleteAgenda = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteAgendaDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteAgendaRequest = {
          AgendaId: deleteAgendaDetailsData.AgendaId,
          UniqueKey: deleteAgendaDetailsData.UniqueKey,
        };

        const response = await agendaService.apiCallDeleteAgenda(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (agendaList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages,
          });

          await loadAgendas(pageToShow);

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setDeleteAgendaDetailsData(null);
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
      'Delete Agenda',
    );
  };

  const agendaTable = (
    <DataTableExpandable
      ref={dtRef}
      data={agendaList}
      columns={agendaColumns}
      emptyMessage="No agenda added"
      loading={isLoading}
      pagination={agendaPaginationInfo}
      recordsPerPage={20}
      expandable={{
        keyField: 'AgendaId',
        alwaysFetchOnOpen: true,
        fetchRow: async (row) => {
          const params: FilterWithPaginationAgendaRequest = {
            PageNumber: 1,
            PageSize: pagination.pageSize,
            MeetingId: meetingId,
            AgendaId: Number(row.AgendaId),
            AgendaSource: agendaSource,
          };

          const response = await agendaService.apiCallPullAgenda(params);

          if (E.isRight(response)) {
            return response.right.Data ?? [];
          }

          addToast({ type: 'error', title: response.left.message });
          return [];
        },
        renderRow: (fetchedData) => {
          const details: AgendaData[] = Array.isArray(fetchedData)
            ? fetchedData
            : fetchedData
              ? [fetchedData]
              : [];

          if (!details || details.length === 0) {
            return (
              <div className="p-1 text-xs text-gray-600 text-center">
                <NoDataView />
              </div>
            );
          }

          return (
            <DataTableWithOutBorder
              data={details}
              columns={agendaDetailsColumns}
              emptyMessage="No agenda details found"
              fixedHeight={true}
              recordsPerPage={20}
              className="flex-1"
            />
          );
        },
        expandButton: { openText: 'Hide', closeText: 'Show' },
      }}
    />
  );

  return (
    <>
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className={canManageAgenda ? 'space-y-4 pb-3' : ''}>
        {canManageAgenda ? (
          <div className="flex items-center mt-5 justify-between border-b border-gray-300 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Agenda List
            </h3>

            <div className="flex items-center gap-3">
              <Button
                color="blue"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={handleAddAgendaModal}
                disabled={!meetingId}
              >
                Add Agenda
              </Button>
              <Button
                color="primary"
                variant="outline"
                size="sm"
                onClick={handleOpenPreviousAgenda}
                disabled={!meetingId}
              >
                Show Previous Agenda
              </Button>
            </div>
          </div>
        ) : null}

        {!canManageAgenda ? (
          <section className="mt-4 overflow-hidden rounded-xl rounded-sm border-[0.1px] border-[#33333321]">
            <div className="flex items-center justify-between gap-3 border-b border-[#D0D7DE] bg-[#FFF6EB] px-3 py-2">
              <h4 className="text-sm font-semibold text-[#C2410C]">
                {`Agenda (${agendaList.length})`}
              </h4>
            </div>
            <div className="bg-white p-4">{agendaTable}</div>
          </section>
        ) : (
          <div className="pt-1">{agendaTable}</div>
        )}
      </div>

      <Modal
        isOpen={isPreviousAgendaOpen}
        onClose={handleClosePreviousAgenda}
        title={`Previous Agenda (${previousPagination.totalRecords})`}
        size="small35"
      >
        <div className="space-y-4">
          <Input
            value={searchTermForPreviousAgenda}
            onChange={(event) => {
              const value = event.target.value;
              setSearchTermForPreviousAgenda(value);
              debouncedPreviousAgendaSearch(value);
            }}
            placeholder="Search by title"
            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
          />

          <Loader loading={isLoadingPreviousAgendas} title={loadingMessage}>
            <div></div>
          </Loader>

          <PaginationCard
            data={previousAgendas}
            loading={isLoadingPreviousAgendas}
            pagination={previousAgendaPaginationInfo}
            rowKey="AgendaId"
            emptyMessage="No previous agenda found"
            className="flex-1"
            isUsedForOther={false}
            header={(agenda: AgendaData) => (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {agenda.AgendaTitle || '-'}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      color="transparent"
                      size="sm"
                      isborderRadius
                      onClick={() => handleEditPreviousAgenda(agenda)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FieldItem
                    label="Meeting"
                    value={String(agenda.MeetingId)}
                  />
                  <FieldItem
                    label="Responsible Person"
                    value={<AgendaResponsiblePersonCell agenda={agenda} />}
                  />
                  <FieldItem
                    label="Date"
                    value={
                      agenda.StartDate
                        ? formatDate_dd_MonthName_yy(agenda.StartDate)
                        : '-'
                    }
                  />
                  <FieldItem label="Status" value={agenda.AgendaStatus} />
                  <FieldItem
                    label="Conclusion"
                    value={agenda.AgendaConclusion || '-'}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-200 pt-2">
                  <Button
                    color="blue"
                    size="sm"
                    onClick={() => handleAddPreviousAgenda(agenda)}
                  >
                    {agendaSource === 'MOM'
                      ? 'Add to Current MOM'
                      : 'Add to Current Meeting'}
                  </Button>
                  <Button
                    color="primary"
                    variant="outline"
                    size="sm"
                    onClick={() => handleConclusionModal(agenda)}
                  >
                    Write Conclusion
                  </Button>
                </div>
              </div>
            )}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isConclusionModalOpen}
        onClose={() => {
          setIsConclusionModalOpen(false);
          setEditingAgendaData(null);
        }}
        onCancel={() => {
          setIsConclusionModalOpen(false);
          setEditingAgendaData(null);
        }}
        onSubmit={handleAddUpdateConclusion}
        title="Write Conclusion"
        saveText="Save Conclusion"
        cancelText="Cancel"
        loading={isLoading}
        size="md"
      >
        <TextArea
          label="Conclusion"
          required
          rows={5}
          value={formData.AgendaConclusion}
          onChange={(event) => handleFieldChange('AgendaConclusion', event.target.value)}
          placeholder="Enter conclusion"
        />
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteAgendaDetailsData(null);
        }}
        onConfirm={handleDeleteAgenda}
        loading={isLoading}
        pageName="agenda"
      />

      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingAgendaData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        title={
          agendaModalMode === 'document'
            ? 'Manage Agenda Document'
            : formData.AgendaId
              ? 'Edit Agenda'
              : 'Add New Agenda'
        }
        onSubmit={handleAddUpdateAgenda}
        saveText={
          agendaModalMode === 'document'
            ? 'Update Document'
            : formData.AgendaId
              ? 'Update'
              : 'Add'
        }
        cancelText="Cancel"
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingAgendaData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL('');
          setRemovedDocumentURLs([]);
        }}
        loading={isLoading}
        size="small40"
      >
        <div className="space-y-4">
          {agendaModalMode === 'form' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Agenda Title"
                  required
                  value={formData.AgendaTitle}
                  onChange={(event) =>
                    handleFieldChange('AgendaTitle', event.target.value)
                  }
                  placeholder="Enter Agenda Title"
                  error={errors.AgendaTitle}
                />

                <SinglePageSelection
                  label="Priority"
                  required
                  value={formData.PriorityId || ''}
                  onChange={(value) =>
                    handleFieldChange('PriorityId', Number(value))
                  }
                  options={priorityOptions}
                  searchable={false}
                  isShowClearSelection={false}
                  error={errors.PriorityId}
                />

                <SinglePageSelection
                  label="Status"
                  required
                  value={formData.AgendaStatusId || ''}
                  onChange={(value) =>
                    handleFieldChange('AgendaStatusId', Number(value))
                  }
                  options={statusOptions}
                  searchable={false}
                  isShowClearSelection={false}
                  error={errors.AgendaStatusId}
                />

                <DatePickerInput
                  label="Start Date"
                  required
                  value={formatDate_dd_mm_yyyy(formData.StartDate)}
                  onChange={(value) =>
                    handleFieldChange(
                      'StartDate',
                      convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) || '',
                    )
                  }
                  error={errors.StartDate}
                />

                <DatePickerInput
                  label="Due Date"
                  required
                  value={formatDate_dd_mm_yyyy(formData.DueDate)}
                  onChange={(value) =>
                    handleFieldChange(
                      'DueDate',
                      convert_dd_mm_yyyy_To_Yyyy_mm_dd(value) || '',
                    )
                  }
                  error={errors.DueDate}
                />

                <div className="md:col-span-2">
                  <MultiSelectPagination
                    label="Responsible Person"
                    title="Select Responsible Person"
                    required
                    dataFetchCallBack={fetchEmployeeMasterDropdown}
                    selectedValues={responsiblePersonDropdown.selectedValues}
                    options={responsiblePersonDropdown.initialOptions}
                    onChange={(values) => {
                      const { ids, idsString } = responsiblePersonDropdown.handleChange(values);
                      setSelectedResponsiblePersonValues(idsString || null);
                      handleFieldChange(
                        'ResponsiblePersonJson',
                        ids.length
                        ? JSON.stringify(
                            ids.map((id) => ({
                              ResponsiblePersonId: Number(id),
                            })),
                          )
                          : '',
                      );
                    }}
                    error={errors.ResponsiblePersonJson}
                  />
                </div>
              </div>

              <TextArea
                label="Agenda Description"
                rows={2}
                value={formData.AgendaDescription}
                onChange={(event) =>
                  handleFieldChange('AgendaDescription', event.target.value)
                }
                placeholder="Enter agenda description"
              />

              {formData.AgendaId > 0 && (
                <TextArea
                  label="Discussion"
                  rows={2}
                  value={formData.Discussion}
                  onChange={(event) =>
                    handleFieldChange('Discussion', event.target.value)
                  }
                  placeholder="Enter discussion points"
                />
              )}

              <TextArea
                label="Remark"
                rows={2}
                value={formData.Remark}
                onChange={(event) =>
                  handleFieldChange('Remark', event.target.value)
                }
                placeholder="Enter remark"
              />

              {formData.AgendaId > 0 && (
                <TextArea
                  label="Conclusion"
                  rows={2}
                  value={formData.AgendaConclusion}
                  onChange={(event) =>
                    handleFieldChange('AgendaConclusion', event.target.value)
                  }
                  placeholder="Enter conclusion"
                />
              )}
            </>
          )}

          <MultiFilePicker
            label="Agenda Document"
            maxFiles={1}
            value={documentFiles}
            availableFilesURL={documentURL}
            onChange={setDocumentFiles}
            onRemoveExisting={(url) => {
              setRemovedDocumentURLs((prev) => [...prev, url]);
            }}
            placeholder="Select agenda document"
          />
        </div>
      </Modal>
    </>
  );
};

export default MeetingAgendaSection;
