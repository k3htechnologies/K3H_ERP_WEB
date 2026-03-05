import { useNavigate, useParams } from "react-router-dom";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useEffect, useState } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button } from "@/ui/components/forms";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { Edit, Trash2 } from "lucide-react";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import type { AddUpdateLitigationClosureRequest, FilterWithPaginationLitigationClosureRequest, LitigationClosureData } from "@/features/litigation/models/LitigationClosureModel";
import type { AddUpdateLitigationHearingRequest, DeleteLitigationHearingRequest, FilterWithPaginationLitigationHearingRequest, LitigationHearingData } from "@/features/litigation/models/LitigationHearingModel";
import type { FilterWithPaginationLitigationRequest, LitigationData, LitigationReopenData, UpdateLitigationReopenRequest } from "@/features/litigation/models/LitigationModel";
import { litigationClosureService } from "@/features/litigation/services/LitigationClosureService";
import { litigationHearingService } from "@/features/litigation/services/LitigationHearingService";
import { litigationService } from "@/features/litigation/services/LitigationService";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { TextArea } from "@/ui/components/forms/Textarea";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { useLitigationListState } from "@/features/litigation/context/LitigationListStateContext";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import Tabs from "@/ui/components/Tab/Tab";
import type { FilterWithPaginationLitigationDocumentRequest, LitigationDocumentData } from "../models/LitigationDocumentModel";
import { litigationDocumentService } from "../services/LitigationDocumentService";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

const ViewLitigation: React.FC = () => {
  // EDIT LITIGATION DATA FROM STATE
  const { LitigationId } = useParams<{ LitigationId?: string }>();
  const { listState } = useLitigationListState();
  const currentLitigationId = LitigationId ? Number(LitigationId) : listState.LitigationId;

  // PROJECT CONTEXT
  const projectContext = useProject();
  const projectId = projectContext?.projectId ? Number(projectContext.projectId) : 0;

  const initialClosureFormData: AddUpdateLitigationClosureRequest = {
    LitigationClosureId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    LitigationId: currentLitigationId,
    ProjectId: Number(projectId),
    ClosureDate: "",
    Conclusion: "",
    Remark: "",
    ClosureAttachementURL: null,
    RemoveClosureAttachementURL: "",
  };

  const initialHearingFormData = (): AddUpdateLitigationHearingRequest => ({
    LitigationHearingId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    LitigationId: currentLitigationId,
    ProjectId: Number(projectId),
    HearingDate: "",
    Remark: "",
    HearingAttachementURL: null,
    RemoveHearingAttachementURL: "",
  });

  //#region STATE MANAGEMENT
  const [litigationData, setLitigationData] = useState<LitigationData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLitigationReopenDialogOpen, setIsLitigationReopenDialogOpen] = useState(false);
  const [selectedLitigationItem, setSelectedLitigationItem] = useState<LitigationReopenData | null>(null);
  const [litigationDocumentList, setLitigationDocumentList] = useState<LitigationDocumentData[]>([]);

  const [closureData, setClosureData] = useState<LitigationClosureData[]>([]);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);

  const [hearingData, setHearingData] = useState<LitigationHearingData[]>([]);
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);

  // DELETE HEARING STATE
  const [isDeleteHearingDialogOpen, setIsDeleteHearingDialogOpen] = useState(false);
  const [selectedHearingItem, setSelectedHearingItem] = useState<LitigationHearingData | null>(null);

  // HEARING ATTACHMENT URL FILES
  const [hearingURLFiles, setHearingURLFiles] = useState<(File | string)[]>([]);
  const [removeHearingAttachementUrls, SetRemoveHearingAttachementUrls] = useState<string[]>([]);
  const [hearingURL, setHearingURL] = useState<string>();

  // CLOSURE ATTACHMENT URL FILES
  const [closureURLFiles, setClosureURLFiles] = useState<(File | string)[]>([]);
  const [removeClosureAttachementUrls, SetRemoveClosureAttachementUrls] = useState<string[]>([]);
  const [closureURL, setClosureURL] = useState<string>();
  const [closureFormData, setClosureFormData] = useState<AddUpdateLitigationClosureRequest>(() => initialClosureFormData);
  const [hearingFormData, setHearingFormData] = useState<AddUpdateLitigationHearingRequest>(() => initialHearingFormData());

  // NAVIGATE
  const navigate = useNavigate();

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions("/litigation");
  //#endregion

  // TOAST
  const { addToast } = useToast();

  const litigationStatus = litigationData?.Status;
  const isEditable = canAction && (litigationStatus === "Open" || litigationStatus === "Reopen");

  //#region ERROR STATE MANAGEMENT
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  //#region TAB ACTIVITY
  const litigationTabList = [
    { id: "Overview", label: "Overview" },
    { id: "Document", label: "Document" },
  ];

  const [activeTab, setActiveTab] = useState<string>(litigationTabList[0].id);
  const isEditDisabled = !isEditable || activeTab === "Document";

  //#region USE EFFECT TO FETCH CLOSURE DETAILS
  useEffect(() => {
    if (!projectId || !currentLitigationId || currentLitigationId === 0) return;

    fetchLitigationDetails();

    fetchClouserDetails();

    fetchHearingDetails();
  }, [projectId, currentLitigationId, addToast]);
  //#endregion

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

  //#region CLOSURE MODAL MANAGEMENT
  const handleopenClosureModal = (item?: LitigationClosureData) => {
    if (litigationStatus !== "Open" && litigationStatus !== "Closed") return;

    setErrors({});
    setClosureURLFiles([]);
    SetRemoveClosureAttachementUrls([]);

    if (item) {
      setClosureFormData({
        LitigationClosureId: item.LitigationClosureId || 0,
        Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        LitigationId: currentLitigationId,
        ProjectId: Number(projectId),
        ClosureDate: item.ClosureDate || "",
        Conclusion: item.Conclusion || "",
        Remark: item.Remark || "",
        ClosureAttachementURL: item.ClosureAttachementURL || "",
        RemoveClosureAttachementURL: "",
      });
      setClosureURL(item.ClosureAttachementURL || "");
    }
    setIsClosureModalOpen(true);
  };
  //#endregion

  //#region CLOSE CLOSURE MODAL
  const handleClosureModal = () => {
    setIsClosureModalOpen(false);
    setClosureFormData(initialClosureFormData);
    setErrors({});
  };
  //endregion

  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateLitigationClosureRequest, value: any) => {
    setClosureFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //#region FETCH CLOSURE DETAILS
  const fetchClouserDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLitigationClosureRequest = {
          PageNumber: 1,
          PageSize: 50,
          ProjectId: Number(projectId),
          LitigationId: currentLitigationId,
        };

        const response = await litigationClosureService.apiCallPullLitigationClosure(params);

        if (E.isRight(response)) {
          setClosureData(response.right.Data);
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
      "Loading Closure Details",
    );
  };
  //#endregion

  //Validation Function
  const validateAddClosureForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!closureFormData.ClosureDate?.trim()) {
      newErrors.ClosureDate = "Closure Date is required.";
    }

    if (!closureFormData.Conclusion?.trim()) {
      newErrors.Conclusion = "Conclusion is required.";
    }

    if (!closureFormData.Remark?.trim()) {
      newErrors.Remark = "Remark is required.";
    }

    if (!hasAnyDocumentFile(closureURLFiles, closureURL, removeClosureAttachementUrls)) {
      newErrors.ClosureAttachementURL = "File is required.";
    }
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };
  //#endregion

  //#region PUSH FORM DATA
  const PushClosureFormData = (): FormData => {
    const fd = new FormData();
    fd.append("LitigationClosureId", closureFormData.LitigationClosureId.toString());
    fd.append("Uniquekey", closureFormData.Uniquekey ?? "");
    fd.append("LitigationId", currentLitigationId.toString());
    fd.append("ProjectId", projectId!.toString());
    fd.append("ClosureDate", closureFormData.ClosureDate ?? "");
    fd.append("Conclusion", closureFormData.Conclusion ?? "");
    fd.append("Remark", closureFormData.Remark ?? "");

    closureURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("ClosureAttachementURL", file);
      }
    });

    fd.append("RemoveClosureAttachementURL", removeClosureAttachementUrls.join(","));
    return fd;
  };
  //#endregion

  //#region ADD AND UPDATE CLOSURE
  const handleAddUpdateClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateAddClosureForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {
        const payload = PushClosureFormData();

        const response = await litigationClosureService.apiCallAddUpdateLitigationClosure(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: response.right.SuccessMessage[0] });
          setIsClosureModalOpen(false);
          setClosureURL("");
          SetRemoveClosureAttachementUrls([]);
          fetchLitigationDetails();
          fetchClouserDetails();
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
      closureFormData.LitigationClosureId ? "Updating Closure" : "Adding Closure",
    );
  };
  //#endregion

  //#region HEARING MODAL MANAGEMENT

  const handleopenHearingModal = (item?: Partial<LitigationHearingData>) => {
    setErrors({});
    setHearingURLFiles([]);
    SetRemoveHearingAttachementUrls([]);

    if (item) {
      setHearingFormData({
        LitigationHearingId: item.LitigationHearingId ?? 0,
        Uniquekey: item.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        LitigationId: currentLitigationId,
        ProjectId: Number(projectId),
        HearingDate: item.HearingDate || "",
        Remark: item.Remark || "",
        HearingAttachementURL: item.HearingAttachementURL || "",
        RemoveHearingAttachementURL: "",
      });
      setHearingURL(item.HearingAttachementURL || "");
    }
    setIsHearingModalOpen(true);
  };
  //#endregion

  //#region HEARING MODAL
  const handleHearingModal = () => {
    setIsHearingModalOpen(false);
    setHearingFormData(initialHearingFormData);
    setErrors({});
  };
  //#endregion

  //HEARING HANDLE CHANGE
  const handleHearingFieldChange = (field: keyof AddUpdateLitigationHearingRequest, value: any) => {
    setHearingFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //#region FETCH HEARING DETAILS
  const fetchHearingDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLitigationHearingRequest = {
          PageNumber: 1,
          PageSize: 50,
          ProjectId: Number(projectId),
          LitigationId: currentLitigationId,
        };
        const response = await litigationHearingService.apiCallPullLitigationHearing(params);

        if (E.isRight(response)) {
          setHearingData(response.right.Data);
        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Loading Hearing Details",
    );
  };
  //#endregion

  //Validation Function
  const validateAddHearingForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!hearingFormData.HearingDate?.trim()) {
      newErrors.HearingDate = "Hearing Date is required.";
    } else if (hearingFormData.LitigationHearingId === 0 && new Date(hearingFormData.HearingDate) < new Date()) {
      newErrors.HearingDate = "Hearing Date cannot be in the past.";
    }

    if (!hearingFormData.Remark?.trim()) {
      newErrors.Remark = "Remark is required.";
    }

    if (!hasAnyDocumentFile(hearingURLFiles, hearingURL, removeHearingAttachementUrls)) {
      newErrors.HearingAttachementURL = "File is required.";
    }
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };
  //#endregion

  //#region PUSH HEARING DATA
  const PushHearingFormData = (): FormData => {
    const fd = new FormData();
    fd.append("LitigationHearingId", String(hearingFormData.LitigationHearingId ?? 0));
    fd.append("Uniquekey", hearingFormData.Uniquekey ?? "");
    fd.append("LitigationId", String(hearingFormData.LitigationId ?? 0));
    fd.append("ProjectId", projectId!.toString());
    fd.append("HearingDate", hearingFormData.HearingDate ?? null);
    fd.append("Remark", hearingFormData.Remark ?? "");

    hearingURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("HearingAttachementURL", file);
      }
    });
    fd.append("RemoveHearingAttachementURL", removeHearingAttachementUrls.join(","));
    return fd;
  };
  //#endregion

  //#region AND UPDATE HEARING
  const handleAddUpdateHearing = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    const validation = validateAddHearingForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushHearingFormData();

        const response = await litigationHearingService.apiCallAddUpdateLitigationHearing(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          setIsHearingModalOpen(false);
          setHearingURL("");
          SetRemoveHearingAttachementUrls([]);
          fetchHearingDetails();
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
      hearingFormData.LitigationHearingId ? "Updating Hearing" : "Adding Hearing",
    );
  };

  //#region HEARING DELETE HANDLER
  const handleDeleteHearing = (item: LitigationHearingData) => {
    setSelectedHearingItem(item);
    setIsDeleteHearingDialogOpen(true);
  };

  const handleConfirmDeleteHearing = async () => {
    if (!selectedHearingItem) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteLitigationHearingRequest = {
          LitigationHearingId: selectedHearingItem.LitigationHearingId || 0,
          Uniquekey: selectedHearingItem.Uniquekey || "",
          LitigationId: currentLitigationId,
          ProjectId: Number(projectId),
        };
        const response = await litigationHearingService.apiCallDeleteLitigationHearing(params);

        if (E.isRight(response)) {
          addToast({ type: "success", title: response.right.SuccessMessage[0] });
          setIsDeleteHearingDialogOpen(false);
          fetchHearingDetails();
          setSelectedHearingItem(null);
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
      "Deleting Hearing Details",
    );
  };
  //#endregion

  //#region EDIT LITIGATION
  const handleEditLitigation = (row: LitigationData) => {
    if (!row?.LitigationId) return;
    navigate(`/litigation/add/${row.LitigationId}`);
  };
  //#endregion

  //#region BACK PROJECT PAGE
  const handleBackToListLitigation = () => {
    navigate("/litigation");
  };
  //#endregion

  //#region HANDLE LITIGATION REOEPN
  const handleLitigationReopen = async () => {
    if (!selectedLitigationItem) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: UpdateLitigationReopenRequest = {
          LitigationId: selectedLitigationItem.LitigationId,
          Uniquekey: selectedLitigationItem.Uniquekey ?? "",
          ProjectId: Number(projectId),
        };

        const response = await litigationService.apiCallUpdateLitigationReopen(payload);

        if (E.isRight(response)) {
          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          setLitigationData((prev) => (prev ? { ...prev, Status: "Reopen" } : prev));
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        setIsLitigationReopenDialogOpen(false);
        setSelectedLitigationItem(null);
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Reopening Case",
    );
  };
  //#endregion

  //#region FETCH LITIGATION DOCUMENT LIST
  const fetchLitigationDocumentList = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationLitigationDocumentRequest = {
          PageNumber: 1,
          PageSize: 100,
          ProjectId: Number(projectId),
          LitigationId: currentLitigationId,
        };
        const response = await litigationDocumentService.apiCallPullLitigationDocument(params);

        if (E.isRight(response)) {
          setLitigationDocumentList(response.right.Data);
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

  //#region CHECK DOCUMENT URL EXISTS
  const docsWithUrls = litigationDocumentList.filter((d) => {
    const urls = parseDocumentUrls(d.DocumentURL ?? "").filter((x) => x?.trim()?.length);

    return urls.length > 0;
  });
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>
      {/* Header Details*/}

      <HeaderActionBar
        titleText="Litigation : "
        subTitleText={litigationData?.Title ?? ""}
        subSubTitleText={litigationData?.Status ?? ""}
        cancelText="Cancel"
        EditText="Edit"
        onCancel={() => handleBackToListLitigation()}
        canAction={!isEditDisabled}
        onEdit={() => {
          if (activeTab === "Overview" && litigationData) {
            handleEditLitigation(litigationData);
          }
        }}
        isLoading={false}
      />

      <div className="pt-2 ">
        <Tabs
          tabs={litigationTabList}
          defaultActive={activeTab}
          islarge={true}
          onTabChange={(t) => {
            setActiveTab(t.id);

            if (t.id === "Overview") {
              fetchLitigationDetails();
            } else if (t.id === "Document") {
              fetchLitigationDocumentList();
            }
          }}
        />
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-12 gap-4 pt-5">
          {/* LEFT SIDE */}
          <div className="col-span-7">
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
              {/* ================= CASE DETAILS ================= */}
              <section className="bg-white border-b border-[#135bec2e] px-4 pt-1 pb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  <FieldItem label="Case Title" value={litigationData?.Title} />
                  <FieldItem label="Date Of Filling" value={litigationData?.DateOfFilling ? formatDate_dd_MonthName_yy(litigationData.DateOfFilling) : ""} />
                  <FieldItem label="Case Type" value={litigationData?.CaseType} />
                  <FieldItem label="Case / Petiton / Dispute Number" value={litigationData?.CaseNumber} />
                </div>
              </section>

              {/* ================= COURT DETAILS ================= */}
              <section className="bg-white border-b border-[#135bec2e] p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4"> Court Details</h4>
                <div className="lg:col-span-3 pb-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    <FieldItem label="Court Type" value={litigationData?.CourtType} />
                    <FieldItem label="Court Name" value={litigationData?.CourtName} />
                    <FieldItem label="Court Location" value={litigationData?.CourtLocation} />
                  </div>
                </div>
              </section>

              {/* ================= PARTIES DETAILS ================= */}
              <section className="bg-white p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Parties Details </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 mb-4">
                  <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                      <FieldItem label="Plainiff" value={litigationData?.Plantiff} />
                      <FieldItem label="Defendant / Opposite Party / Respondent" value={litigationData?.Defendant} />
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                      <FieldItem label="Assigned Representative" value={litigationData?.AssignedRepresentative} />
                      <FieldItem label="Opposing Representative" value={litigationData?.OpposingRepresentative} />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* ================= CLOSURE DETAILS ================= */}

            {(litigationStatus === "Closed" || litigationStatus === "Reopen") && (
              <div className="col-span-7">
                <div className="bg-white rounded-lg border border-[#135bec2e] shadow-sm p-4 mt-2">
                  <section>
                    <h4 className="text-lg font-semibold text-gray-900 pb-2">Closure Details</h4>

                    {closureData.length === 0 ? (
                      <p className="text-gray-500 text-sm">No closure history found.</p>
                    ) : (
                      closureData.map((item, index) => {
                        const isLatest = index === 0;
                        const isCaseReopen = litigationStatus === "Closed";

                        return (
                          <div key={item.LitigationClosureId} className="mb-4 pb-4 border-b border-gray-300 last:border-b-0 last:pb-0">
                            <div className="flex pb-2 justify-between">
                              <FieldItem label="Closure Date" value={formatDate_dd_MonthName_yy(item.ClosureDate)} />
                              {isLatest && isCaseReopen && <Button color="transparent" isborderRadius size="sm" style={{ color: "blue", padding: "4px 8px" }} title="Edit" onClick={() => handleopenClosureModal(item)} disabled={isLoading} leftIcon={<Edit className="h-4 w-4" />} />}
                            </div>

                            <div className="grid grid-cols-1 gap-4 ">
                              <FieldItem label="Remark" value={item.Remark || "-"} />
                              <FieldItem label="Conclusion" value={item.Conclusion || "-"} />
                              <MultiImageViewer images={parseDocumentUrls(item.ClosureAttachementURL)} title="Closure Document" isIcon={false} triggerLabel="Document" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </section>
                </div>
              </div>
            )}

            {/* =================CASE BRIEF DETAILS ================= */}

            <div className="col-span-7">
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mt-2">
                <h4 className="text-lg font-semibold text-gray-900 pb-2">Case Brief / Petition / Suit</h4>
                <div className="lg:col-span-3 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    <p>{litigationData?.CaseBrief}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================CASE REMARKS DETAILS ================= */}

            <div className="col-span-7">
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mt-2">
                <h4 className="text-lg font-semibold text-gray-900 pb-2">Case Remarks / Comments</h4>
                <div className="lg:col-span-3 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    <p>{litigationData?.Remark}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= ACTION DETAILS ================= */}

            <div className="col-span-7">
              <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1 mt-2">
                <section className="bg-white p-4 flex flex-col">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Action Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 mb-4">
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        <FieldItem label="Created By" value={litigationData?.CreatedBy} />
                        <FieldItem label="Created Date" value={litigationData?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(litigationData.CreatedDate) : ""} />
                      </div>
                    </div>

                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        <FieldItem label="Modified By" value={litigationData?.ModifiedBy} />

                        <FieldItem label="Modified Date" value={litigationData?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(litigationData.ModifiedDate) : ""} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {(litigationStatus === "Open" || litigationStatus === "Reopen") && canAction && (
                      <Button  size="sm" onClick={() => handleopenClosureModal()}>
                        Close Case
                      </Button>
                    )}

                    {litigationStatus === "Closed" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedLitigationItem(litigationData);
                          setIsLitigationReopenDialogOpen(true);
                        }}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/*  RIGHT SIDE  */}
          <div className="col-span-5">
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">
              <div className="border-b pb-2 mt-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-semibold text-black"> Hearing History</h1>

                  {(litigationStatus === "Open" || litigationStatus === "Reopen") && canAction && (
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() =>
                        handleopenHearingModal({
                          LitigationId: litigationData?.LitigationId,
                        })
                      }
                    >
                      Add Hearing
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {hearingData.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hearing history found.</p>
                ) : (
                  hearingData.map((item, index) => {
                    const isLatest = index === 0;
                    const isModified = !!(item.ModifiedBy && item.ModifiedDate);

                    const canEditHearing = (litigationStatus === "Open" || litigationStatus === "Reopen") && canAction ? isLatest : false;

                    return (
                      <div key={item.LitigationHearingId} className="pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">{formatDate_dd_MonthName_yy(item.HearingDate)}</span>
                          <span className="font-medium text-gray-400 text-sm">{isModified ? item.ModifiedBy : item.CreatedBy}</span>

                          {canEditHearing && (
                            <>
                              <div className="flex items-center gap-1 ml-auto">
                                <Button color="transparent" isborderRadius size="sm" style={{ color: "blue" }} title="Edit Hearing" onClick={() => handleopenHearingModal(item)} disabled={isLoading} leftIcon={<Edit className="h-4 w-4" />} />
                                <Button color="transparent" isborderRadius size="sm" style={{ color: "red" }} title="Delete Hearing" onClick={() => handleDeleteHearing(item)} disabled={isLoading} leftIcon={<Trash2 className="h-4 w-4" />} />
                              </div>
                            </>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-gray-700">{item.Remark || "-"}</p>

                        <div className="inline-flex items-end gap-1 px-2 py-2 border border-blue-500 text-blue-600 rounded mt-2 text-sm font-medium cursor-pointer hover:bg-blue-50 transition">
                          <p>Document</p>
                          <MultiImageViewer images={parseDocumentUrls(item.HearingAttachementURL)} title="Hearing Document" isIcon={false} triggerLabel="Document" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* CLOSURE MODAL */}

          <Modal isOpen={isClosureModalOpen} title={"Close Case"} onClose={handleClosureModal} onSubmit={handleAddUpdateClosure} cancelText="Cancel" saveText="Close" onCancel={handleClosureModal} loading={isLoading} size="lg">
            <div className="space-y-4">
              <div>
                <DatePickerInput label="Closure Date" value={formatDate_dd_mm_yyyy(closureFormData.ClosureDate ?? "")} onChange={(val) => handleFieldChange("ClosureDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))} required error={errors.ClosureDate} />
              </div>

              <div>
                <MultiFilePicker
                  label="Files"
                  placeholder="Select Files"
                  required
                  error={errors.ClosureAttachementURL}
                  value={closureURLFiles}
                  onChange={setClosureURLFiles}
                  availableFilesURL={closureURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                  maxFiles={5}
                  maxSizeMB={50}
                  onRemoveExisting={(url) => {
                    SetRemoveClosureAttachementUrls((prev) => [...prev, url]);
                  }}
                />
              </div>

              <div>
                <TextArea label="Remarks" required className="thin-scroll" value={closureFormData.Remark ?? ""} placeholder="Enter Remarks" onChange={(e) => handleFieldChange("Remark", e.target.value)} error={errors.Remark} />
              </div>

              <div>
                <TextArea label="Conclusion" required className="thin-scroll" value={closureFormData.Conclusion ?? ""} placeholder="Enter Conclusion" onChange={(e) => handleFieldChange("Conclusion", e.target.value)} error={errors.Conclusion} />
              </div>
            </div>
          </Modal>

          {/* HEARING MODAL */}

          <Modal isOpen={isHearingModalOpen} title={"Add Hearing"} onClose={handleHearingModal} onSubmit={handleAddUpdateHearing} cancelText="Cancel" saveText={hearingFormData.LitigationHearingId > 0 ? "Update" : "Add"} onCancel={handleHearingModal} loading={isLoading} size="lg">
            <div className="space-y-4">
              <div>
                <DatePickerInput label="Hearing Date" value={formatDate_dd_mm_yyyy(hearingFormData.HearingDate ?? "")} onChange={(val) => handleHearingFieldChange("HearingDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))} required error={errors.HearingDate} />
              </div>

              <div>
                <MultiFilePicker
                  label="Files"
                  required
                  placeholder="Select Files"
                  error={errors.HearingAttachementURL}
                  value={hearingURLFiles}
                  onChange={setHearingURLFiles}
                  availableFilesURL={hearingURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                  maxFiles={5}
                  maxSizeMB={50}
                  onRemoveExisting={(url) => {
                    SetRemoveHearingAttachementUrls((prev) => [...prev, url]);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <TextArea label="Remark" required className="thin-scroll" value={hearingFormData.Remark ?? ""} placeholder="Enter Remarks" onChange={(e) => handleHearingFieldChange("Remark", e.target.value)} error={errors.Remark} />
                </div>
              </div>
            </div>
          </Modal>

          {/*Litigation Reopen Confirmation Dialog Box*/}

          <ConfirmationDialogBox
            isOpen={isLitigationReopenDialogOpen}
            onClose={() => {
              setIsLitigationReopenDialogOpen(false);
              setSelectedLitigationItem(null);
            }}
            onConfirm={handleLitigationReopen}
            title="Reopen Litigation"
            message={`Are you sure you want to Reopen.`}
            confirmText="Reopen"
            cancelText="Cancel"
            loading={isLoading}
          />

          {/*Delete Hearing Confirmation Dialog Box*/}

          <DeleteDialog
            isOpen={isDeleteHearingDialogOpen}
            onClose={() => {
              setIsDeleteHearingDialogOpen(false);
              setSelectedHearingItem(null);
            }}
            onConfirm={handleConfirmDeleteHearing}
            loading={isLoading}
            pageName="Litigation Hearing"
          />
        </div>
      )}

      {activeTab === "Document" && (
        <div className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {docsWithUrls.length === 0 && (
              <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <NoDataView message="No Documents Found" />
              </section>
            )}

            {docsWithUrls.map((d) => {
              const urls = parseDocumentUrls(d.DocumentURL ?? "").filter((x) => x?.trim()?.length);

              return (
                <div className="border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">
                  <div className="flex items-start justify-between p-2 gap-2">
                    <div className="flex flex-col">
                      <span className="line-clamp-2 break-words font-medium text-gray-900">{d.DocumentName}</span>
                      <span className="text-sm text-gray-500 mt-1">Document Count : {urls.length}</span>
                    </div>

                    <MultiImageViewer images={urls} title={d.DocumentName ?? "Document"} triggerLabel="View" isIcon={false} />
                  </div>

                  <div className="bg-gray-50 p-2 mt-auto">
                    <FieldItem label="Uploaded By / Date" value={`${d?.ModifiedBy || d?.CreatedBy || "-"} / ${d?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(d?.ModifiedDate) : d?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(d?.CreatedDate) : "-"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewLitigation;
