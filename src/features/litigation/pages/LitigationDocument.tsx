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
import TooltipText from "@/ui/components/Tooltip/TooltipText";
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
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import type {
  AddUpdateLitigationDocumentRequest,
  DeleteLitigationDocumentRequest,
  FilterWithPaginationLitigationDocumentRequest,
  LitigationDocumentData,
} from "@/features/litigation/models/LitigationDocumentModel";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useLitigationListState } from "@/features/litigation/context/LitigationListStateContext";
import type {
  FilterWithPaginationLitigationRequest,
  LitigationData,
} from "@/features/litigation/models/LitigationModel";
import { litigationDocumentService } from "../services/LitigationDocumentService";
import { litigationService } from "../services/LitigationService";

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
  //#region STATE MANAGEMENT
  const [litigationData, setLitigationData] = useState<LitigationData | null>(
    null,
  );
  const [LitigationDocumentList, setLitigationDocumentList] = useState<
    LitigationDocumentData[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchLitigationDocuments(value);
  }, 350);

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT LITIGATION DOCUMENT
  const [editingLitigationDocumentData, setEditingLitigationDocumentData] =
    useState<LitigationDocumentData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE LITIGATION DOCUMENT
  const [formData, setFormData] = useState<AddUpdateLitigationDocumentRequest>(
    () => initialFormState(),
  );

  //DELETE LITIGATION DOCUMENT STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] =
    useState(false);
  const [
    deleteLitigationDocumentDetailsData,
    setDeleteLitigationDocumentDetailsData,
  ] = useState<LitigationDocumentData | null>(null);

  //FILE STATES
  const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
  const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
  const [documentURL, setDocumentURL] = useState<string>();

  // NAVIGATION
  const navigate = useNavigate();
  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  const { LitigationId } = useParams<{ LitigationId?: string }>();
  const { listState } = useLitigationListState();
  const currentLitigationId = LitigationId
    ? Number(LitigationId)
    : listState.LitigationId;

  const litigationStatus = litigationData?.Status;
  const canModifyDocument =
    litigationStatus === "Open" || litigationStatus === "Reopen";

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions();
  //#endregion

  //#region INIT
  useEffect(() => {
    if (!projectId) return;
    fetchLitigationDocumentList();
    fetchLitigationDetails();
  }, [projectId, currentLitigationId]);

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
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
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH LITIGATION DOCUMENT
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
  //#endregion

  //#region FETCH LITIGATION DETAILS
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

  //#region SERACH LITIGATION DOCUMENT
  const searchLitigationDocuments = async (searchValue: string) => {
    setSearchTerm(searchValue);
    await loadLitigationDocument(1, sortInfo, searchValue);
  };
  //#endregion

  //#region CLEAR SERACH LITIGATION DOCUMENT
  const clearsearchLitigationDocuments = () => {
    setSearchTerm("");
    debouncedSearch.cancel?.();
    loadLitigationDocument(1, sortInfo, "");
  };
  //#endregion

  //#region EXPORT EXCEL | PDF
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
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = useCallback(
    (page: number) => {
      loadLitigationDocument(page, sortInfo, searchTerm);
    },
    [searchTerm, sortInfo],
  );
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    loadLitigationDocument(1, sortInfo, searchTerm);
  };
  //#endregion

  //#region TABLE PAGINATION INFO
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
  //#endregion

  //#region EDIT LITIGATION DOCUMENT
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
  //#endregion

  //#region TABLE COLUMN
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
          <div
            className={`flex items-center ${canAction ? "justify-between" : "justify-start"}`}
          >
            <TooltipText
              text={value || "-"}
              maxWidth="250px"
              tooltipThreshold={30}
            />

            <div className="flex justify-between items-center">
              {canModifyDocument && (
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
          </div>
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
            <MultiImageViewer
              images={urls}
              title="Litigation Document"
              triggerLabel={`View (${urls.length})`}
            />
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
        align: "left",
        render: (value, row) =>
          value
            ? formatDate_dd_MonthName_yy(value)
            : row.CreatedDate
              ? formatDate_dd_MonthName_yy(row.CreatedDate)
              : "-",
      },
    ],
    [
      canAction,
      canModifyDocument,
      handleEditLitigationDocument,
      handleConfirmationDialogBoxOpen,
    ],
  );
  //#endregion

  //#region ADD UPDATE LITIGATION DOCUMENT
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

  //#region PUSH FORM DATA
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

  //#region ADD UPDATE LITIGATION DOCUMENT
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
      formData.LitigationDocumentId === null ||
        formData.LitigationDocumentId === 0
        ? "Add Litigation Document"
        : "Update Litigation Document",
    );
  };
  //#endregion

  //#region DELETE LITIGATION DOCUMENT
  const handleDeleteLitigationDocument = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLitigationDocumentDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteLitigationDocumentRequest = {
          LitigationDocumentId:
            deleteLitigationDocumentDetailsData.LitigationDocumentId,
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
  //#endregion

  //#region BACK LITIGATION PAGE
  const handleBackToListLITIGATION = () => {
    navigate("/litigation");
  };
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}

      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>

      {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}

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

      <div className="flex items-center gap-3 mb-6 border-b border-gray-300 pb-3">
        <HeaderActionBar
          titleText="Litigation Document"
          cancelText="Cancel"
          EditText=""
          onCancel={() => handleBackToListLITIGATION()}
          canAction={false}
          isLoading={isLoading}
        />
      </div>

      {/* DATA TABLE LITIGATION DOCUMENT */}
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

      {/*  ADD EDIT UPDATE LITIGATION DOCUMENT MODAL */}

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
                allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => {
                  setRemovedDocumentURLs((prev) => [...prev, url]);
                }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION LITIGATION DOCUMENT MODAL */}

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
