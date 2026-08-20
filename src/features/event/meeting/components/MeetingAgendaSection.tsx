import React, { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import * as E from "fp-ts/Either";
import {
  CircleAlert,
  Edit,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
} from "lucide-react";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { useToast } from "@/core/hooks/useToast";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import DataTableExpandable, {
  type DataTableExpandableRef,
} from "@/ui/components/DataTable/DataTableExpandable";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { Button, Input } from "@/ui/components/forms";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import MultiFilePicker, { type FileValue } from "@/ui/components/ImagePicker/MultiFilePicker";
import { TextArea } from "@/ui/components/forms/Textarea";
import { Modal } from "@/ui/components/Modal/Modal";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import PaginationCard from "@/ui/components/Card/PaginationCard";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type {
    AgendaData,
    AgendaPriority,
    AgendaStatus,
    MeetingAgenda
} from "@/features/event/meeting/models/MeetingModel";
import { DEFAULT_UNIQUE_KEY } from "@/features/event/meeting/utils/MeetingUtils";
import { MeetingService } from "@/features/event/meeting/services/MeetingService";
import MeetingSection from "@/features/event/meeting/components/MeetingSection";

interface AgendaForm {
  AgendaId: string | number;
  UniqueKey: string;
  Title: string;
  Description: string;
  Discussion: string;
  Conclusion: string;
  ResponsiblePersonId?: string;
  ResponsiblePerson: string;
  ResponsiblePersonJson: string;
  Priority: AgendaPriority;
  Status: AgendaStatus;
  Remark: string;
  DocumentUrl: string;
}

interface MeetingAgendaSectionProps {
  agendas: MeetingAgenda[];
  onChange: (agendas: MeetingAgenda[]) => void;
  meetingId: number;
}

const getApiMessage = (
  messages: string[] | undefined,
  fallback: string,
): string => messages?.filter(Boolean).join(", ") || fallback;

const getSavedAgendaIdentity = (
  data: unknown,
  fallbackId: string | number,
  fallbackUniqueKey: string,
) => {
  const savedData = Array.isArray(data) ? data[0] : data;
  if (typeof savedData === "number" || typeof savedData === "string") {
    const id = Number(savedData);
    return {
      agendaId: Number.isFinite(id) && id > 0 ? String(id) : fallbackId,
      uniqueKey: fallbackUniqueKey,
      documentUrl: "",
    };
  }

  if (savedData && typeof savedData === "object") {
    const record = savedData as Record<string, unknown>;
    const id = Number(record.AgendaId ?? record.Id ?? 0);
    return {
      agendaId: Number.isFinite(id) && id > 0 ? String(id) : fallbackId,
      uniqueKey: String(record.UniqueKey ?? fallbackUniqueKey),
      documentUrl: String(
        record.DocumentURLs ?? record.DocumentURL ?? record.DocumentUrl ?? "",
      ),
    };
  }

  return {
    agendaId: fallbackId,
    uniqueKey: fallbackUniqueKey,
    documentUrl: "",
  };
};

const mapPreviousAgenda = (agenda: AgendaData): MeetingAgenda => ({
  AgendaId: agenda.AgendaId,
  UniqueKey: agenda.UniqueKey || DEFAULT_UNIQUE_KEY,
  Title: agenda.AgendaTitle || "",
  Description: agenda.AgendaDescription || "",
  CreatedBy: agenda.CreatedBy || "--",
  ResponsiblePersonId: String(agenda.ResponsiblePersonId || ""),
  ResponsiblePerson:
    agenda.ResponsiblePersonName || agenda.ResponsiblePerson || "--",
  Priority: "Medium",
  Status: (agenda.AgendaStatus || "Pending") as AgendaStatus,
  Remark: agenda.Remark || "",
  Discussion: agenda.Discussion || "",
  Conclusion: agenda.AgendaConclusion || "",
  DocumentUrl: agenda.DocumentURLs || "",
  MeetingTitle: agenda.MeetingTitle || "Previous Meeting",
  MeetingDate: agenda.MeetingDate || "",
});

const getInitialAgendaForm = (): AgendaForm => ({
  AgendaId: "",
  UniqueKey: "",
  Title: "",
  Description: "",
  Discussion: "",
  Conclusion: "",
  ResponsiblePerson: "",
  ResponsiblePersonJson: "",
  Priority: "Medium",
  Status: "Pending",
  Remark: "",
  DocumentUrl: "",
});

export const MeetingAgendaSection: React.FC<MeetingAgendaSectionProps> = ({
  agendas,
  onChange,
  meetingId,
}) => {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agendaModalMode, setAgendaModalMode] = useState<"form" | "document">(
    "form",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [agendaDocuments, setAgendaDocuments] = useState<FileValue[]>([]);
  const [removedAgendaDocumentUrls, setRemovedAgendaDocumentUrls] = useState<string[]>([]);
  const [isPreviousAgendaOpen, setIsPreviousAgendaOpen] = useState(false);
  const [previousAgendas, setPreviousAgendas] = useState<MeetingAgenda[]>([]);
  const [previousAgendaTotal, setPreviousAgendaTotal] = useState(0);
  const [isLoadingPreviousAgendas, setIsLoadingPreviousAgendas] =
    useState(false);
  const [previousAgendaSearch, setPreviousAgendaSearch] = useState("");
  const [previousAgendaEmployee, setPreviousAgendaEmployee] = useState("all");
  const [agendaForConclusion, setAgendaForConclusion] =
    useState<MeetingAgenda | null>(null);
  const [conclusionText, setConclusionText] = useState("");
  const [agendaToDelete, setAgendaToDelete] = useState<MeetingAgenda | null>(null);
  const [isDeletingAgenda, setIsDeletingAgenda] = useState(false);
  const agendaTableRef = useRef<DataTableExpandableRef | null>(null);
  const [agendaForm, setAgendaForm] = useState<AgendaForm>(
    getInitialAgendaForm,
  );
  const [errors, setErrors] = useState<{
    Title?: string;
    ResponsiblePerson?: string;
    Status?: string;
  }>({});
  const isMeetingIdValid = meetingId > 0;

  const visibleAgendas = useMemo(
    () => agendas.filter((agenda) => agenda.Status !== "Completed"),
    [agendas],
  );

  useEffect(() => {
    if (!isPreviousAgendaOpen || meetingId <= 0) return;

    const controller = new AbortController();
    const loadPreviousAgendas = async () => {
      setIsLoadingPreviousAgendas(true);
      const response = await MeetingService.apiCallPullPreviousAgendaDetails(
        { PageSize: 10, PageNumber: 1, meetingId },
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      setIsLoadingPreviousAgendas(false);

      if (E.isLeft(response)) {
        addToast({ type: "error", title: response.left.message });
        return;
      }
      if (!response.right.IsSuccess) {
        addToast({
          type: "error",
          title: getApiMessage(
            response.right.ErrorMessage,
            "Unable to load previous agendas",
          ),
        });
        return;
      }

      const data = Array.isArray(response.right.Data)
        ? response.right.Data
        : [];
      setPreviousAgendas(data.map(mapPreviousAgenda));
      setPreviousAgendaTotal(response.right.TotalNumberOfRecord || data.length);
    };

    void loadPreviousAgendas();
    return () => controller.abort();
  }, [addToast, isPreviousAgendaOpen, meetingId]);

  const previousAgendaEmployees = useMemo(
    () =>
      Array.from(
        new Set(
          previousAgendas
            .map((agenda) => agenda.ResponsiblePerson)
            .filter((name) => name.trim().length > 0),
        ),
      ),
    [previousAgendas],
  );

  const filteredPreviousAgendas = useMemo(() => {
    const search = previousAgendaSearch.trim().toLowerCase();
    return previousAgendas.filter((agenda) => {
      const matchesSearch =
        !search ||
        agenda.Title.toLowerCase().includes(search) ||
        agenda.ResponsiblePerson.toLowerCase().includes(search) ||
        agenda.CreatedBy.toLowerCase().includes(search);
      const matchesEmployee =
        previousAgendaEmployee === "all" ||
        agenda.ResponsiblePerson === previousAgendaEmployee;
      return matchesSearch && matchesEmployee;
    });
  }, [previousAgendas, previousAgendaEmployee, previousAgendaSearch]);

  const closeModal = () => {
    setIsModalOpen(false);
    setAgendaModalMode("form");
    setAgendaForm(getInitialAgendaForm());
    setAgendaDocuments([]);
    setRemovedAgendaDocumentUrls([]);
    setErrors({});
  };

  const openAddAgenda = () => {
    setAgendaModalMode("form");
    setAgendaForm(getInitialAgendaForm());
    setAgendaDocuments([]);
    setRemovedAgendaDocumentUrls([]);
    setErrors({});
    setIsModalOpen(true);
  };

  const populateAgendaForm = (agenda: MeetingAgenda) => {
    setAgendaForm({
      AgendaId: agenda.AgendaId,
      UniqueKey: agenda.UniqueKey || "",
      Title: agenda.Title,
      Description: agenda.Description || "",
      Discussion: agenda.Discussion || "",
      Conclusion: agenda.Conclusion || "",
      ResponsiblePersonId: agenda.ResponsiblePersonId || "",
      ResponsiblePerson: agenda.ResponsiblePerson,
      ResponsiblePersonJson:
        agenda.ResponsiblePersonJson ||
        (agenda.ResponsiblePerson || agenda.ResponsiblePersonId
          ? JSON.stringify({
              ResponsiblePersonId: Number(agenda.ResponsiblePersonId || 0),
              ResponsiblePerson: agenda.ResponsiblePerson || "",
            })
          : ""),
      Priority: agenda.Priority,
      Status: agenda.Status,
      Remark: agenda.Remark || "",
      DocumentUrl: agenda.DocumentUrl || "",
    });
    setAgendaDocuments([]);
    setRemovedAgendaDocumentUrls([]);
    setErrors({});
  };

  const openEditAgenda = (agenda: MeetingAgenda) => {
    setAgendaModalMode("form");
    populateAgendaForm(agenda);
    setIsModalOpen(true);
  };

  const openAgendaDocument = (agenda: MeetingAgenda) => {
    setAgendaModalMode("document");
    populateAgendaForm(agenda);
    setIsModalOpen(true);
  };

  const confirmDeleteAgenda = async () => {
    if (!agendaToDelete) return;

    const agendaId = Number(agendaToDelete.AgendaId);
    const removeDeletedAgenda = () => {
      const isSameAgenda = (agenda: MeetingAgenda) =>
        String(agenda.AgendaId) === String(agendaToDelete.AgendaId);

      onChange(agendas.filter((agenda) => !isSameAgenda(agenda)));

      const existsInPreviousAgendas = previousAgendas.some(isSameAgenda);
      setPreviousAgendas((current) => current.filter((agenda) => !isSameAgenda(agenda)));
      if (existsInPreviousAgendas) {
        setPreviousAgendaTotal((current) => Math.max(0, current - 1));
      }
      setAgendaToDelete(null);
    };

    if (!Number.isInteger(agendaId) || agendaId <= 0) {
      removeDeletedAgenda();
      return;
    }

    setIsDeletingAgenda(true);

    const response = await MeetingService.apiCallDeleteAgenda({
      AgendaId: agendaId,
      UniqueKey: agendaToDelete.UniqueKey || DEFAULT_UNIQUE_KEY,
    });

    setIsDeletingAgenda(false);

    if (E.isLeft(response)) {
      addToast({ type: "error", title: response.left.message });
      return;
    }

    if (!response.right.IsSuccess) {
      addToast({
        type: "error",
        title: getApiMessage(response.right.ErrorMessage, "Unable to delete agenda"),
      });
      return;
    }

    removeDeletedAgenda();
    addToast({
      type: "success",
      title: getApiMessage(response.right.SuccessMessage, "Agenda deleted successfully"),
    });
  };

  const addPreviousAgendaToCurrent = async (agenda: MeetingAgenda) => {
    const copiedAgenda: MeetingAgenda = {
      ...agenda,
      AgendaId: `agenda-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      UniqueKey: "",
      Status: "Pending",
      Conclusion: "",
    };
    const savedAgenda = await persistAgenda(
      {
        AgendaId: "",
        UniqueKey: "",
        Title: copiedAgenda.Title,
        Description: copiedAgenda.Description || "",
        Discussion: copiedAgenda.Discussion || "",
        Conclusion: "",
        ResponsiblePersonId: copiedAgenda.ResponsiblePersonId || "",
        ResponsiblePerson: copiedAgenda.ResponsiblePerson,
        ResponsiblePersonJson:
          copiedAgenda.ResponsiblePersonJson ||
          (copiedAgenda.ResponsiblePerson || copiedAgenda.ResponsiblePersonId
            ? JSON.stringify({
                ResponsiblePersonId: Number(
                  copiedAgenda.ResponsiblePersonId || 0,
                ),
                ResponsiblePerson: copiedAgenda.ResponsiblePerson || "",
              })
            : ""),
        Priority: copiedAgenda.Priority,
        Status: copiedAgenda.Status,
        Remark: copiedAgenda.Remark || "",
        DocumentUrl: copiedAgenda.DocumentUrl || "",
      },
      copiedAgenda.DocumentUrl ? [copiedAgenda.DocumentUrl] : [],
    );
    if (savedAgenda) onChange([...agendas, { ...copiedAgenda, ...savedAgenda }]);
  };

  const openConclusionModal = (agenda: MeetingAgenda) => {
    setAgendaForConclusion(agenda);
    setConclusionText(agenda.Conclusion || "");
  };

  const saveConclusion = async (event: FormEvent) => {
    event.preventDefault();
    if (!agendaForConclusion) return;

    const updatedAgenda: MeetingAgenda = {
      ...agendaForConclusion,
      Conclusion: conclusionText.trim(),
      Status: conclusionText.trim() ? "Completed" : agendaForConclusion.Status,
    };
    const savedAgenda = await persistAgenda(
      {
        AgendaId: updatedAgenda.AgendaId,
        UniqueKey: updatedAgenda.UniqueKey || "",
        Title: updatedAgenda.Title,
        Description: updatedAgenda.Description || "",
        Discussion: updatedAgenda.Discussion || "",
        Conclusion: updatedAgenda.Conclusion || "",
        ResponsiblePersonId: updatedAgenda.ResponsiblePersonId || "",
        ResponsiblePerson: updatedAgenda.ResponsiblePerson,
        ResponsiblePersonJson:
          updatedAgenda.ResponsiblePersonJson ||
          (updatedAgenda.ResponsiblePerson || updatedAgenda.ResponsiblePersonId
            ? JSON.stringify({
                ResponsiblePersonId: Number(
                  updatedAgenda.ResponsiblePersonId || 0,
                ),
                ResponsiblePerson: updatedAgenda.ResponsiblePerson || "",
              })
            : ""),
        Priority: updatedAgenda.Priority,
        Status: updatedAgenda.Status,
        Remark: updatedAgenda.Remark || "",
        DocumentUrl: updatedAgenda.DocumentUrl || "",
      },
      updatedAgenda.DocumentUrl ? [updatedAgenda.DocumentUrl] : [],
    );
    if (!savedAgenda) return;

    onChange(
      agendas.map((agenda) =>
        agenda.AgendaId === agendaForConclusion.AgendaId
          ? { ...updatedAgenda, ...savedAgenda }
          : agenda,
      ),
    );
    setAgendaForConclusion(null);
    setConclusionText("");
  };

  const persistAgenda = async (
    values: AgendaForm,
    documents: FileValue[],
    removedDocumentUrls: string[] = [],
  ): Promise<Partial<MeetingAgenda> | null> => {
    if (!isMeetingIdValid) {
      addToast({
        type: "error",
        title: "Save meeting details before adding an agenda.",
      });
      return null;
    }

    setIsSaving(true);
    try {
      const request = {
        AgendaId: Number(values.AgendaId) || 0,
        UniqueKey: values.UniqueKey || DEFAULT_UNIQUE_KEY,
        MeetingId: meetingId,
        AgendaTitle: values.Title,
        AgendaDescription: values.Description || "",
        ResponsiblePersonJson:
          values.ResponsiblePersonJson ||
          (values.ResponsiblePerson && values.ResponsiblePersonId
            ? JSON.stringify({
                ResponsiblePersonId: Number(values.ResponsiblePersonId),
                ResponsiblePerson: values.ResponsiblePerson,
              })
            : ""),
        Priority: values.Priority,
        AgendaStatus: values.Status,
        Remark: values.Remark || "",
        AgendaConclusion: values.Conclusion || "",
        Discussion: values.Discussion || "",
        Description: values.Description || "",
        DocumentURLs: documents.filter(
          (document): document is File => document instanceof File,
        ),
        RemoveDocumentURL: removedDocumentUrls.join(','),
      };

      const response = await MeetingService.apiCallAddUpdateAgenda(request);
      if (E.isLeft(response)) {
        addToast({ type: "error", title: response.left.message });
        return null;
      }

      if (!response.right.IsSuccess) {
        addToast({
          type: "error",
          title: getApiMessage(
            response.right.ErrorMessage,
            values.AgendaId
              ? "Unable to update agenda"
              : "Unable to add agenda",
          ),
        });
        return null;
      }

      const fallbackId =
        values.AgendaId ||
        `agenda-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const identity = getSavedAgendaIdentity(
        response.right.Data,
        fallbackId,
        values.UniqueKey || DEFAULT_UNIQUE_KEY,
      );
      addToast({
        type: "success",
        title: getApiMessage(
          response.right.SuccessMessage,
          values.AgendaId
            ? "Agenda updated successfully"
            : "Agenda added successfully",
        ),
      });

      return {
        AgendaId: identity.agendaId,
        UniqueKey: identity.uniqueKey,
        DocumentUrl: identity.documentUrl || values.DocumentUrl,
      };
    } finally {
      setIsSaving(false);
    }
  };

  const saveAgenda = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!agendaForm.Title.trim()) nextErrors.Title = "Agenda title is required";
    if (!agendaForm.ResponsiblePerson.trim()) {
      nextErrors.ResponsiblePerson = "Responsible person is required";
    }
    if (!agendaForm.Status.trim()) {
      nextErrors.Status = "Agenda status is required";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const existingAgenda = agendas.find(
      (agenda) => agenda.AgendaId === agendaForm.AgendaId,
    );
    const existingDocumentUrl = agendaDocuments.find(
      (document): document is string => typeof document === "string",
    );

    const savedAgenda = await persistAgenda(
      agendaForm,
      agendaDocuments,
      removedAgendaDocumentUrls,
    );
    if (!savedAgenda) return;

    const nextAgenda: MeetingAgenda = {
      ...agendaForm,
      ...savedAgenda,
      CreatedBy:
        existingAgenda?.CreatedBy ||
        LocalStorageHelper.getStoredEmployeeData()?.FullName ||
        "Current User",
      DocumentUrl:
        savedAgenda.DocumentUrl || existingDocumentUrl || agendaForm.DocumentUrl,
    };

    onChange(
      agendaForm.AgendaId
        ? agendas.map((agenda) =>
            agenda.AgendaId === agendaForm.AgendaId ? nextAgenda : agenda,
          )
        : [...agendas, nextAgenda],
    );
    agendaTableRef.current?.collapseAll();
    closeModal();
  };

  const renderAgendaActions = (agenda: MeetingAgenda) => (
    <div className="ml-2 flex items-center justify-end gap-1">
      <div className="flex w-[34px] justify-center">
        <Button
          color="transparent"
          isborderRadius
          size="sm"
          title="Manage Agenda Document"
          aria-label="Manage Agenda Document"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            openAgendaDocument(agenda);
          }}
        >
          <Upload className="h-4 w-4 text-[#1769FF]" />
        </Button>
      </div>

      <div className="flex w-[34px] justify-center">
        <Button
          color="transparent"
          isborderRadius
          size="sm"
          title="Edit Agenda"
          aria-label="Edit Agenda"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            openEditAgenda(agenda);
          }}
        >
          <Edit className="h-4 w-4 text-[#8A8A8A]" />
        </Button>
      </div>

      <div className="flex w-[34px] justify-center">
        <Button
          color="transparent"
          isborderRadius
          size="sm"
          title="Delete Agenda"
          aria-label="Delete Agenda"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setAgendaToDelete(agenda);
          }}
        >
          <Trash2 className="h-4 w-4 text-[#FF4D67]" />
        </Button>
      </div>
    </div>
  );

  const agendaColumns: TableColumn[] = [
    {
      key: "Title",
      label: "Title",
      width: "30",
      fixed: "left",
      align: "left",
    },
    {
      key: "CreatedBy",
      label: "Created By",
      width: "20",
      align: "left",
      render: (value) => value || "-",
    },
    {
      key: "ResponsiblePerson",
      label: "Responsible Person",
      width: "25",
      align: "left",
      render: (value) => value || "-",
    },
    {
      key: "Priority",
      label: "Priority",
      width: "12",
      align: "left",
    },
    {
      key: "Status",
      label: "Status",
      width: "13",
      align: "left",
    },
  ];

  const agendaDetailsColumns: TableColumn[] = [
    {
      key: "Description",
      label: "Agenda Description",
      width: "30",
      align: "left",
      truncate: false,
      render: (value) => value || "-",
    },
    {
      key: "Discussion",
      label: "Discussion",
      width: "38",
      align: "left",
      truncate: false,
      render: (value, row: MeetingAgenda) => value || row.Remark || "-",
    },
    {
      key: "Conclusion",
      label: "Conclusion",
      width: "20",
      align: "left",
      truncate: false,
      render: (value) => value || "-",
    },
    {
      key: "Actions",
      label: "Action",
      width: "140px",
      maxWidth: "140px",
      fixed: "right",
      align: "right",
      render: (_value, row: MeetingAgenda) => renderAgendaActions(row),
    },
  ];

  return (
    <>
      {!isMeetingIdValid && (
        <div className="mb-4 rounded-lg border border-[#FCD34D] bg-[#FFFBEB] p-4 text-sm text-[#92400E]">
          Save meeting details first to enable adding agendas.
        </div>
      )}
      <MeetingSection
        className="mt-6"
        title="Agenda List"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button
              color="blue"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={openAddAgenda}
              disabled={!isMeetingIdValid}
            >
              Add Agenda
            </Button>
            <Button
              color="primary"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviousAgendaOpen(true)}
              disabled={!isMeetingIdValid}
            >
              Show Previous Agenda
            </Button>
          </div>
        }
        contentClassName="rounded-lg bg-white p-3"
      >
        <DataTableExpandable
          ref={agendaTableRef}
          data={visibleAgendas}
          columns={agendaColumns}
          emptyMessage="No agenda added"
          recordsPerPage={20}
          expandable={{
            keyField: "AgendaId",
            alwaysFetchOnOpen: true,
            fetchRow: async (row: MeetingAgenda) => [row],
            renderRow: (fetchedData) => {
              const details: MeetingAgenda[] = Array.isArray(fetchedData)
                ? fetchedData
                : fetchedData
                  ? [fetchedData]
                  : [];

              if (details.length === 0) {
                return (
                  <div className="p-1 text-center text-xs text-gray-600">
                    <NoDataView message="No agenda details found" />
                  </div>
                );
              }

              return (
                <DataTableWithOutBorder
                  data={details}
                  columns={agendaDetailsColumns}
                  emptyMessage="No agenda details found"
                  recordsPerPage={20}
                  className="flex-1"
                />
              );
            },
          }}
        />
      </MeetingSection>

      <Modal
        isOpen={isPreviousAgendaOpen}
        onClose={() => setIsPreviousAgendaOpen(false)}
        title={
          <span className="flex items-center gap-2">
            Previous Agenda
            <span className="text-sm font-normal text-[#98A0AD]">
              ({previousAgendaTotal})
            </span>
          </span>
        }
        size="small35"
      >
        <div className="flex min-h-0 flex-col gap-4">
          <div className="grid shrink-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_150px]">
            <Input
              size="sm"
              value={previousAgendaSearch}
              onChange={(event) => setPreviousAgendaSearch(event.target.value)}
              placeholder="Search by name"
              leftIcon={<Search className="h-4 w-4 text-[#667085]" />}
              rightIcon={
                <span className="flex h-6 w-6 items-center justify-center rounded bg-[#E7F0FF] text-[#1769FF]">
                  <SlidersHorizontal className="h-4 w-4" />
                </span>
              }
            />
            <SinglePageSelection
              size="sm"
              value={previousAgendaEmployee}
              onChange={(value) => setPreviousAgendaEmployee(String(value))}
              options={[
                { label: "View Employee List", value: "all" },
                ...previousAgendaEmployees.map((employee) => ({
                  label: employee,
                  value: employee,
                })),
              ]}
              searchable={false}
              isShowClearSelection={false}
            />
          </div>

          {isLoadingPreviousAgendas ? (
            <div className="py-10 text-center text-sm text-[#667085]">
              Loading previous agendas...
            </div>
          ) : (
            <PaginationCard
              data={filteredPreviousAgendas}
              rowKey="AgendaId"
              emptyMessage="No previous agenda found"
              className="min-h-0 flex-1"
              maxHeight="calc(100dvh - 230px)"
              isUsedForOther={false}
              header={(agenda: MeetingAgenda) => (
                <article className="overflow-hidden rounded-lg border border-[#DCE2EA] border-l-[3px] border-l-[#FF8A1F] bg-white shadow-sm">
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="min-w-0 flex-1 break-words text-sm font-semibold text-[#263244]">
                        {agenda.Title || "Untitled Agenda"}
                      </h4>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          color="transparent"
                          size="xss"
                          isborderRadius
                          title="Edit Agenda"
                          onClick={() => {
                            setIsPreviousAgendaOpen(false);
                            openEditAgenda(agenda);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5 text-[#202229]" />
                        </Button>
                        <Button
                          type="button"
                          color="transparent"
                          size="xss"
                          isborderRadius
                          title="Delete Agenda"
                          onClick={() => setAgendaToDelete(agenda)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[#FF4D67]" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4">
                      <FieldItem
                        label="Meeting"
                        value={agenda.MeetingTitle || "Previous Meeting"}
                      />
                      <FieldItem
                        label="Responsible Person"
                        value={agenda.ResponsiblePerson}
                      />
                      <FieldItem
                        label="Date"
                        value={
                          agenda.MeetingDate
                            ? formatDate_dd_MonthName_yy(agenda.MeetingDate)
                            : "-"
                        }
                      />
                      <FieldItem label="Status" value={agenda.Status} />
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#667085]">
                      <CircleAlert className="h-3.5 w-3.5 text-[#F4B000]" />
                      <span>Conclusion: {agenda.Conclusion || "Pending"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E9F0] px-3 py-2">
                    <Button
                      type="button"
                      color="blue"
                      size="xs"
                      onClick={() => addPreviousAgendaToCurrent(agenda)}
                    >
                      Add to Current MOM
                    </Button>
                    <Button
                      type="button"
                      color="transparent"
                      size="xs"
                      className="underline"
                      onClick={() => openConclusionModal(agenda)}
                    >
                      Write Conclusion
                    </Button>
                  </div>
                </article>
              )}
            />
          )}
        </div>
      </Modal>

      <Modal
        isOpen={agendaForConclusion !== null}
        onClose={() => setAgendaForConclusion(null)}
        onCancel={() => setAgendaForConclusion(null)}
        onSubmit={saveConclusion}
        title="Write Conclusion"
        saveText="Save Conclusion"
        cancelText="Cancel"
        loading={isSaving}
        size="md"
      >
        <TextArea
          label="Conclusion"
          required
          rows={5}
          value={conclusionText}
          onChange={(event) => setConclusionText(event.target.value)}
          placeholder="Enter conclusion"
        />
      </Modal>

      <DeleteDialog
        isOpen={agendaToDelete !== null}
        onClose={() => setAgendaToDelete(null)}
        onConfirm={() => void confirmDeleteAgenda()}
        loading={isDeletingAgenda}
        pageName="agenda"
        title="Delete agenda"
        message={`Are you sure you want to delete ${agendaToDelete?.Title || "this agenda"}?`}
        confirmText="Delete"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          agendaModalMode === "document"
            ? "Manage Agenda Document"
            : agendaForm.AgendaId
              ? "Edit Agenda"
              : "Add New Agenda"
        }
        onSubmit={saveAgenda}
        saveText={
          agendaModalMode === "document"
            ? "Update Document"
            : agendaForm.AgendaId
              ? "Update"
              : "Add"
        }
        cancelText="Cancel"
        onCancel={closeModal}
        loading={isSaving}
        size="small40"
      >
        <div className="space-y-6">
          <div
            className={
              agendaModalMode === "document"
                ? "hidden"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2"
            }
          >
            <Input
              label="Agenda Title"
              required
              value={agendaForm.Title}
              onChange={(event) => {
                setAgendaForm((current) => ({
                  ...current,
                  Title: event.target.value,
                }));
                setErrors((current) => ({ ...current, Title: undefined }));
              }}
              placeholder="Enter Agenda Title"
              error={errors.Title}
            />

            <SinglePageSelection
              label="Priority"
              required
              value={agendaForm.Priority}
              onChange={(value) => {
                setAgendaForm((current) => ({
                  ...current,
                  Priority: value as AgendaPriority,
                }));
              }}
              options={["High", "Medium", "Low"].map((value) => ({
                label: value,
                value,
              }))}
              searchable={false}
              isShowClearSelection={false}
            />

            <SinglePageSelection
              label="Status"
              required
              value={agendaForm.Status}
              onChange={(value) => {
                setAgendaForm((current) => ({
                  ...current,
                  Status: value as AgendaStatus,
                }));
                setErrors((current) => ({ ...current, Status: undefined }));
              }}
              options={["Pending", "In Progress", "Completed"].map(
                (value) => ({ label: value, value }),
              )}
              searchable={false}
              isShowClearSelection={false}
              error={errors.Status}
            />

            <div className="sm:col-span-2">
              <SingleSelectDropdownWithPagination
                label="Responsible Person"
                title="Select Responsible Person"
                required
                dataFetchCallBack={fetchEmployeeMasterDropdown}
                initialValue={
                  agendaForm.ResponsiblePerson
                    ? {
                        label: agendaForm.ResponsiblePerson,
                        value: agendaForm.ResponsiblePersonId ?? "",
                      }
                    : null
                }
                onSelected={(item) => {
                  setAgendaForm((current) => ({
                    ...current,
                    ResponsiblePersonId: item ? String(item.value) : "",
                    ResponsiblePerson: item?.label || "",
                    ResponsiblePersonJson: item
                      ? JSON.stringify({
                          ResponsiblePersonId: Number(item.value),
                          ResponsiblePerson: item.label,
                        })
                      : "",
                  }));
                  setErrors((current) => ({
                    ...current,
                    ResponsiblePerson: undefined,
                  }));
                }}
                error={errors.ResponsiblePerson}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {agendaModalMode === "form" && (
              <>
                <TextArea
                  label="Agenda Description"
                  rows={2}
                  value={agendaForm.Description}
                  onChange={(event) =>
                    setAgendaForm((current) => ({
                      ...current,
                      Description: event.target.value,
                    }))
                  }
                  placeholder="Enter agenda description"
                />

                <TextArea
                  label="Discussion"
                  rows={2}
                  value={agendaForm.Discussion}
                  onChange={(event) =>
                    setAgendaForm((current) => ({
                      ...current,
                      Discussion: event.target.value,
                    }))
                  }
                  placeholder="Enter discussion points"
                />

                <TextArea
                  label="Remark"
                  rows={2}
                  value={agendaForm.Remark}
                  onChange={(event) =>
                    setAgendaForm((current) => ({
                      ...current,
                      Remark: event.target.value,
                    }))
                  }
                  placeholder="Enter remark"
                />
              </>
            )}

            <MultiFilePicker
              label="Agenda Document"
              maxFiles={1}
              value={agendaDocuments}
              availableFilesURL={agendaForm.DocumentUrl}
              onChange={setAgendaDocuments}
              onRemoveExisting={(url) => {
                setRemovedAgendaDocumentUrls((current) =>
                  current.includes(url) ? current : [...current, url],
                );
                setAgendaForm((current) => ({
                  ...current,
                  DocumentUrl: current.DocumentUrl
                    .split(',')
                    .map((item) => item.trim())
                    .filter((item) => item && item !== url)
                    .join(','),
                }));
              }}
              placeholder="Select agenda document"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MeetingAgendaSection;
