import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePagination } from "@/core/hooks/usePagination";
import {
  DataTable,
  type PaginationInfo,
  type SortInfo,
  type TableColumn,
} from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { Edit, Trash2 } from "lucide-react";
import { handleExportFile } from "@/core/utils/exportFile";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useNavigate, useParams } from "react-router-dom";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import type {
  AddUpdateLitigationDocumentRequest,
  DeleteLitigationDocumentRequest,
  FilterWithPaginationLitigationDocumentRequest,
  LitigationDocumentData,
} from "@/features/litigation/models/LitigationDocumentModel";
import { litigationDocumentService } from "@/features/litigation/services/LitigationDocumentServices";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useLitigationListState } from "@/features/litigation/context/LitigationListStateContext";
import type {
  FilterWithPaginationLitigationRequest,
  LitigationData,
} from "@/features/litigation/models/LitigationModel";
import { litigationService } from "../services/LitigationServices";

const initialFormState = (): AddUpdateLitigationDocumentRequest => ({
  LitigationDocumentId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  LitigationId: 0,
  ProjectId: 0,
  DocumentName: null,
  DocumentURL: null,
  RemoveDocumentURL: "",
});

export const LitigationDocument: React.FC = () => {

  const [litigationData, setLitigationData] = useState<LitigationData | null>(null);
  const [LitigationDocumentList, setLitigationDocumentList] = useState<LitigationDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const { pagination, setPagination } = usePagination(20);

  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchLitigationDocuments(value);
  }, 350);

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [editingLitigationDocumentData, setEditingLitigationDocumentData] = useState<LitigationDocumentData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [formData, setFormData] = useState<AddUpdateLitigationDocumentRequest>(() => initialFormState());

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteLitigationDocumentDetailsData, setDeleteLitigationDocumentDetailsData] = useState<LitigationDocumentData | null>(null);

  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>();

  const navigate = useNavigate();

  const { LitigationId } = useParams<{ LitigationId?: string }>();
  const { listState } = useLitigationListState();
  const currentLitigationId = LitigationId ? Number(LitigationId) : listState.LitigationId;
  const projectId = listState.projectId;
  const litigationStatus = litigationData?.Status;
  const canModifyDocument = litigationStatus === "Open" || litigationStatus === "Reopen";

  const { canAction } = useMenuPermissions();

  useEffect(() => {
    if (!projectId) return;
    fetchLitigationDocumentList();
    fetchLitigationDetails();
  }, [projectId, currentLitigationId]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingLitigationDocumentData) {
        setFormData({
          LitigationDocumentId:
            editingLitigationDocumentData.LitigationDocumentId,
          Uniquekey:
            editingLitigationDocumentData.Uniquekey ||
            initialFormState().Uniquekey,
          LitigationId: editingLitigationDocumentData.LitigationId || 0,
          ProjectId: editingLitigationDocumentData.ProjectId,
          DocumentName: editingLitigationDocumentData.DocumentName || null,
          DocumentURL: null,
          RemoveDocumentURL: "",
        });
        setDocumentFiles([]);
        setDocumentURL(editingLitigationDocumentData.DocumentURL || "");
        setRemovedDocumentURLs([]);
      } else {
        setFormData({
          ...initialFormState(),
          ProjectId: Number(projectId),
        });
        setDocumentFiles([]);
        setDocumentURL("");
        setRemovedDocumentURLs([]);
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingLitigationDocumentData, projectId]);

  const fetchLitigationDocumentList = async (
    page: number = pagination.currentPage,
    sort?: SortInfo,
  ) => {
    return await loadLitigationDocument(page, sort, searchTerm);
  };

  const loadLitigationDocument = async (
    page: number,
    sortInfo?: SortInfo,
    searchtext?: string,
  ) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLitigationDocumentRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          ProjectId: Number(projectId),
          LitigationId: currentLitigationId,
          DocumentName: searchtext?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, LitigationDocumentColumns),
        };
        const response =
          await litigationDocumentService.apiCallPullLitigationDocument(params);

        if (E.isRight(response)) {
          setLitigationDocumentList(response.right.Data);

          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(
              response.right.TotalNumberOfRecord / pagination.pageSize,
            ),
          });
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Litigation Document",
    );
  };

  const fetchLitigationDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLitigationRequest = {
          PageNumber: 1,
          PageSize: 1,
          LitigationId: currentLitigationId,
          ProjectId: Number(projectId),
        };
        const response = await litigationService.apiCallPullLitigation(params);

        if (E.isRight(response)) {
          const data = response.right.Data;

          setLitigationData(Array.isArray(data) ? (data[0] ?? null) : data);
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Litigation",
    );
  };

  const searchLitigationDocuments = async (searchValue: string) => {
    setSearchTerm(searchValue);
    await loadLitigationDocument(1, sortInfo, searchValue);
  };

  const clearsearchLitigationDocuments = () => {
    setSearchTerm("");
    debouncedSearch.cancel?.();
    loadLitigationDocument(1, sortInfo, "");
  };

  const handleExportLitigationDocument = async (
    exportType: "Excel" | "PDF",
  ) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLitigationDocumentRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          ProjectId: projectId || undefined,
          LitigationDocumentId: 1,
          LitigationId: currentLitigationId,
          DocumentName: searchTerm?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, LitigationDocumentColumns),
          ExportType: exportType,
        };

        const response =
          await litigationDocumentService.apiCallPullLitigationDocument(params);

        handleExportFile(response, exportType, "Litigation Document", addToast);
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message || "Export failed" });
      },
      undefined,
      "Preparing Export",
    );
  };

  const handleExportLitigationDocumentExcel = () =>
    handleExportLitigationDocument("Excel");
  const handleExportLitigationDocumentPdf = () =>
    handleExportLitigationDocument("PDF");

  const handlePageChange = useCallback(
    (page: number) => {
      loadLitigationDocument(page, sortInfo, searchTerm);
    },
    [searchTerm, sortInfo],
  );

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    loadLitigationDocument(1, sortInfo, searchTerm);
  };

  const LitigationDocumentPaginationInfo: PaginationInfo = useMemo(
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

  const LitigationDocumentListForTable = useMemo(
    () => LitigationDocumentList,
    [LitigationDocumentList],
  );

  const handleEditLitigationDocument = useCallback(
    (row: LitigationDocumentData) => {
      setEditingLitigationDocumentData({
        ...row,
        DocumentName: row.DocumentName || "",
      });
      setIsAddUpdateModalOpen(true);
    },
    [],
  );
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback(
    (row: LitigationDocumentData) => {
      setDeleteLitigationDocumentDetailsData(row);
      setIsConfirmationDialogBoxOpen(true);
    },
    [],
  );

  const LitigationDocumentColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "DocumentName",
        label: "Document Name",
        width: "33",
        sortable: true,
        fixed: "left",
        align: "left",
        render: (value, row) => (

          <MultiImageViewer images={parseDocumentUrls(row.DocumentURL)} title="Document" triggerLabel={value || "-"} />

        ),
      },
      {
        key: "DocumentURL",
        label: "Document",
        width: "20",
        sortable: false,
        align: "center",
        render: (value: string) => {
          const urls = parseDocumentUrls(value);
          if (urls.length === 0) return "-";

          return (
            urls.length > 0 ? urls.length : "-"
          );
        },
      },
      {
        key: "ModifiedBy",
        label: "Last Modified By",
        width: "33",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "ModifiedDate",
        label: "Last Modified Date",
        width: "33",
        sortable: false,
        align: "center",
        render: (value, row) =>
          value
            ? formatDate_dd_MonthName_yy(value)
            : row.CreatedDate
              ? formatDate_dd_MonthName_yy(row.CreatedDate)
              : "-",
      },
      {
        key: "Actions",
        label: "Actions",
        width: "12",
        fixed: "right",
        align: "center",
        render: (_value, row) => {
          return (
            <div className="flex justify-between items-center">
              {canModifyDocument && Number(row.LitigationHearingId) === 0 && (
                <>
                  <Button
                    color="transparent"
                    size="sm"
                    style={{ color: "#0B3251", padding: "0px 8px" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditLitigationDocument(row);
                    }}
                    leftIcon={<Edit className="h-4 w-4" />}
                  />

                  <Button
                    color="transparent"
                    size="sm"
                    style={{ color: "red", padding: "0px 8px" }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleConfirmationDialogBoxOpen(row);
                    }}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  />
                </>
              )}
            </div>
          );
        },
      },
    ],
    [
      canAction,
      canModifyDocument,
      handleEditLitigationDocument,
      handleConfirmationDialogBoxOpen,
    ],
  );

  const handleFieldChange = (
    field: keyof AddUpdateLitigationDocumentRequest,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddLitigationDocumentModal = () => {
    setEditingLitigationDocumentData(null);
    setFormData({
      ...initialFormState(),
      ProjectId: Number(projectId),
    });
    setErrors({});
    setDocumentFiles([]);
    setDocumentURL("");
    setRemovedDocumentURLs([]);
    setIsAddUpdateModalOpen(true);
  };

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddLitigationDocumentForm = (): {
    isValid: boolean;

    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.DocumentName || formData.DocumentName.trim() === "") {
      newErrors.DocumentName = "Document Name is required";
    } else if (formData.DocumentName.trim().length < 3) {
      newErrors.DocumentName =
        "Document Name must be at least 3 characters long";
    }

    if (!hasAnyDocumentFile(documentFiles, documentURL, removedDocumentURLs)) {
      newErrors.DocumentURL = "File is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const PushLitigationDocumentFormData = (): FormData => {
    const fd = new FormData();

    fd.append("LitigationId", String(currentLitigationId));
    fd.append(
      "LitigationDocumentId",
      String(formData.LitigationDocumentId ?? 0),
    );
    fd.append("Uniquekey", formData.Uniquekey ?? "");
    fd.append("ProjectId", String(projectId));
    fd.append("DocumentName", formData.DocumentName ?? "");

    documentFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("DocumentURL", file);
      }
    });

    const existingNames = documentFiles
      .filter((x) => typeof x === "string" && String(x).trim().length > 0)
      .map((x) => String(x).trim())
      .join(",");

    if (existingNames) {
      fd.append("DocumentURL", existingNames);
    }

    fd.append("RemoveDocumentURL", removedDocumentURLs.join(","));
    return fd;
  };

  const handleAddUpdateLitigationDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateAddLitigationDocumentForm();

    if (!validation.isValid) {
      setErrors(validation.errors);

      return;
    }
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushLitigationDocumentFormData();

        const response =
          await litigationDocumentService.apiCallAddUpdateLitigationDocument(
            payload,
          );

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          await loadLitigationDocument(
            pagination.currentPage || 1,
            sortInfo,
            searchTerm,
          );

          addToast({
            type: "success",
            title: response.right.SuccessMessage[0],
          });
          setEditingLitigationDocumentData(null);
          setDocumentFiles([]);
          setDocumentURL("");
          setRemovedDocumentURLs([]);
        } else {
          addToast({ type: "error", title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      formData.LitigationDocumentId === null || formData.LitigationDocumentId === 0  ? "Add Litigation Document" : "Update Litigation Document",
    );
  };

  const handleDeleteLitigationDocument = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLitigationDocumentDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteLitigationDocumentRequest = {
          LitigationDocumentId:  deleteLitigationDocumentDetailsData.LitigationDocumentId,
          Uniquekey: deleteLitigationDocumentDetailsData.Uniquekey || "",
          LitigationId: currentLitigationId,
          ProjectId: deleteLitigationDocumentDetailsData.ProjectId || 0,
        };
        const response =
          await litigationDocumentService.apiCallDeleteLitigationDocument(
            params,
          );

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(
            1,
            Math.ceil(newTotalRecords / pagination.pageSize),
          );

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (
            LitigationDocumentList.length === 1 &&
            pagination.currentPage > 1
          ) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages,
          });
          await loadLitigationDocument(pageToShow, sortInfo);

          addToast({
            type: "success",
            title: response.right.SuccessMessage[0],
          });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteLitigationDocumentDetailsData(null);
        } else {
          addToast({ type: "error", title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Delete Litigation Document",
    );
  };

  const handleBackToListLITIGATION = () => {
    navigate("/litigation");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Document Name"
        onSearchChange={(v) => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearsearchLitigationDocuments}
        isShowCustomizeButton={false}
        // ADD
        isShowAddButton={canAction && canModifyDocument}
        addTitle="Add"
        onAdd={handleAddLitigationDocumentModal}
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={false}
        onExportExcel={handleExportLitigationDocumentExcel}
        onExportPdf={handleExportLitigationDocumentPdf}
        exportLoading={isLoading}
      />

      <div className="flex items-center gap-3 mb-5">
        <HeaderActionBar
          titleText={`Litigation Document - ${litigationData?.ProjectName ?? ""} :`}
          subTitleText={litigationData?.Title ?? ""}
          subSubTitleText={litigationData?.Status ?? ""}
          cancelText="Cancel"
          EditText=""
          onCancel={() => handleBackToListLITIGATION()}
          canAction={false}
          isLoading={isLoading}
        />
      </div>

      <DataTable
        data={LitigationDocumentListForTable}
        columns={LitigationDocumentColumns}
        pagination={LitigationDocumentPaginationInfo}
        emptyMessage="No Litigation Documents Data Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        loading={isLoading}
      />

      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingLitigationDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL("");
          setRemovedDocumentURLs([]);
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingLitigationDocumentData(null);
          setFormData(initialFormState());
          setErrors({});
          setDocumentFiles([]);
          setDocumentURL("");
          setRemovedDocumentURLs([]);
        }}
        title={
          editingLitigationDocumentData
            ? "Update Litigation Document"
            : "Add Litigation Document"
        }
        onSubmit={handleAddUpdateLitigationDocument}
        saveText={"Save"}
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-10 p-6 bg-blue-100">
          <div className="space-y-4">
            <div>
              <Input
                label="Document Name"
                required
                error={errors.DocumentName}
                type="text"
                value={formData.DocumentName || ""}
                maxLength={100}
                onChange={(e) =>
                  handleFieldChange("DocumentName", e.target.value)
                }
                placeholder="Enter Document Name"
              />
            </div>

            <div>
              <MultiFilePicker
                label="Files"
                placeholder="Select Files"
                required
                error={errors.DocumentURL}
                value={documentFiles}
                onChange={setDocumentFiles}
                availableFilesURL={documentURL ?? ""}
                allowedTypes={["image/jpeg", 
                              "image/png", 
                              "application/pdf",
                              "application/vnd.ms-excel",
                              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]}
                maxFiles={5}
                onRemoveExisting={(url) => {
                  setRemovedDocumentURLs((prev) => [...prev, url]);
                }}
              />
            </div>
          </div>
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteLitigationDocumentDetailsData(null);
        }}
        onConfirm={handleDeleteLitigationDocument}
        loading={isLoading}
        pageName="Litigation Document"
      />
    </div>
  );
};

export default LitigationDocument;
