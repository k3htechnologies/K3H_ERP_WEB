import { runApiWithLoader } from "@/core/utils";
import React, { useEffect, useMemo, useState } from "react";
import type {
    FilterWithPaginationFlatAlterationRequest,
    FlatAlterationRequestData,
    AddUpdateFlatAlterationRequest,
} from "@/features/crmPayTrack/models/FlatAlterationRequestModel";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import * as E from "fp-ts/Either";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button } from "@/ui/components/forms";
import { Edit, Plus } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import { flatAlterationService } from "@/features/crmPayTrack/services/FlatAlterationService";
import usePagination from "@/core/hooks/usePagination";
import { TextArea } from "@/ui/components/forms/Textarea";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type {
    ModulesApprovalStatusRequest,
    UpdateModulesWorkflowApprovalRequest,
} from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";

const initialFormStateForFlatAlterationRequest = (): AddUpdateFlatAlterationRequest => ({
    FlatAlterationRequestId: 0,
    UniqueKey: "ef0c7084-186a-f111-8573-e2b4d451609c",
    BookingId: 0,
    ProjectId: 0,
    FlatAlterationRemark: "",
    ProofOfDocumentURL: [],
    RemoveProofOfDocumentURL: "",
});

export const FlatAlteration: React.FC = () => {
    const [flatAlterationData, setFlatAlterationData] = useState<FlatAlterationRequestData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isAddUpdateFlatAlterationModalOpen, setIsAddUpdateFlatAlterationModalOpen] = useState(false);
    const [formDataForFlatAlteration, setFormDataForFlatAlteration] = useState<AddUpdateFlatAlterationRequest>(() =>
        initialFormStateForFlatAlterationRequest(),
    );
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [isFlatAlterationApprovalLogModalOpen, setIsFlatAlterationApprovalLogModalOpen] = useState(false);
    const [approvalFlatAlterationLogRequest, setApprovalFlatAlterationLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [flatAlterationOwnerRemark, setFlatAlterationOwnerRemark] = useState<string | null>("");
    const [isFlatAlterationApprovalActionModalOpen, setIsFlatAlterationApprovalActionModalOpen] = useState(false);
    const [approvalFlatAlterationActionType, setApprovalFlatAlterationActionType] = useState<"approve" | "reject">("approve");
    const [approvalFlatAlterationRowData, setApprovalFlatAlterationRowData] = useState<FlatAlterationRequestData | null>(null);
    const { canAction } = useMenuPermissions("/payTrack");
    const { pagination, setPagination } = usePagination(10);
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState } = usePayTrackBookingListState();
    const { bookingId, bookingData, bookingApprovalStatus } = listState;
    const isBookingCancelled = bookingData?.ApprovalStatus == "Cancel" || bookingData?.ApprovalStatus == "Refund";

    const [proofOfDocumentFiles, setProofOfDocumentFiles] = useState<(File | string)[]>([]);
    const [RemoveProofOfDocumentUrls, setRemoveProofOfDocumentUrls] = useState<string[]>([]);
    const [proofOfDocumentURL, setProofOfDocumentURL] = useState<string>();
    const [editingFlatAlterationData, setEditingFlatAlterationData] = useState<FlatAlterationRequestData | null>(null);

    useEffect(() => {
        if (!projectId || !bookingId) return;
        fetchFlatAlterationRequest();
    }, [projectId, bookingId]);

    const handleFieldChange = (field: keyof AddUpdateFlatAlterationRequest, value: any) => {
        setFormDataForFlatAlteration((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleFlatAlterationApprovalSubmit = async (remark: string) => {
        if (!approvalFlatAlterationRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "FLAT ALTERATION APPROVAL",
            Id: bookingId ?? 0,
            ProjectId: projectId ?? 0,
            IsApproved: approvalFlatAlterationActionType === "approve",
            Remarks: remark ?? null,
            SubId: approvalFlatAlterationRowData.FlatAlterationRequestId ?? 0,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {
                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });
                    setIsFlatAlterationApprovalActionModalOpen(false);
                    await fetchFlatAlterationRequest();
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
            approvalFlatAlterationActionType === "approve" ? "Approving Flat Alteration" : "Rejecting Flat Alteration",
        );
    };

    const validateAddFlatAlterationForm = (): {
        isValid: boolean;
        errors: { [k: string]: string };
    } => {
        const errors: { [k: string]: string } = {};

        if (!hasAnyDocumentFile(proofOfDocumentFiles, proofOfDocumentURL, RemoveProofOfDocumentUrls)) {
            errors.ProofOfDocument = "Proof of Document is required.";
        }

        if (!formDataForFlatAlteration.FlatAlterationRemark) {
            errors.FlatAlterationRemark = "Flat Alteration Remark is required";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };

    const PushFlatAlterationFormData = (): FormData => {
        const fd = new FormData();

        fd.append("FlatAlterationRequestId", String(formDataForFlatAlteration.FlatAlterationRequestId)),
            fd.append("UniqueKey", formDataForFlatAlteration.UniqueKey),
            fd.append("BookingId", String(bookingId)),
            fd.append("ProjectId", String(projectId)),
            fd.append("FlatAlterationRemark", formDataForFlatAlteration.FlatAlterationRemark)

        proofOfDocumentFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("ProofOfDocumentURL", file);
            }
        });

        fd.append("RemoveProofOfDocumentURL", RemoveProofOfDocumentUrls.join(","));

        return fd;

    };

    const handleAddUpdateFlatAlteration = async () => {
        setErrors({});

        const validation = validateAddFlatAlterationForm();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushFlatAlterationFormData();

                const response = await flatAlterationService.apiCallAddUpdateFlatAlterationRequest(payload);

                if (E.isRight(response)) {
                    setIsAddUpdateFlatAlterationModalOpen(false);

                    await fetchFlatAlterationRequest();

                    const isAdd = formDataForFlatAlteration.FlatAlterationRequestId === 0;

                    if (isAdd) {
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize),
                        });
                        fetchFlatAlterationRequest();

                        addToast({ type: "success", title: response.right.SuccessMessage[0] });

                        setFormDataForFlatAlteration({
                            FlatAlterationRequestId: 0,
                            UniqueKey: "",
                            BookingId: bookingId,
                            ProjectId: Number(projectId),
                            FlatAlterationRemark: ""
                        });

                        setProofOfDocumentFiles([]);
                        setProofOfDocumentURL("");
                        setRemoveProofOfDocumentUrls([]);

                    } else {
                        addToast({ type: "success", title: response.right.SuccessMessage[0] });
                    }
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
        );
    };

    const fetchFlatAlterationRequest = async (page: number = pagination.currentPage) => {
        return await loadFlatAlterationRequest(page);
    };

    const loadFlatAlterationRequest = async (page: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationFlatAlterationRequest = {
                    PageNumber: page,
                    PageSize: 100,
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };

                const response = await flatAlterationService.apiCallPullFlatAlterationRequest(params);

                if (E.isRight(response)) {
                    if (response.right.Data && response.right.Data.length > 0) {
                        const latestDataIndex = response.right.Data.length - 1;
                        console.log(response.right.Data);

                        setFlatAlterationData(response.right.Data[latestDataIndex]);
                    } else {
                        setFlatAlterationData(null);
                    }

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: "error", title: response.left.message });
                }
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Flat Alteration Data",
        );
    };

    useEffect(() => {
        if (isAddUpdateFlatAlterationModalOpen) {
            if (editingFlatAlterationData) {
                setFormDataForFlatAlteration({
                    FlatAlterationRequestId: editingFlatAlterationData.FlatAlterationRequestId || 0,
                    UniqueKey: editingFlatAlterationData.UniqueKey || initialFormStateForFlatAlterationRequest().UniqueKey,
                    BookingId: editingFlatAlterationData.BookingId || 0,
                    ProjectId: editingFlatAlterationData.ProjectId || 0,
                    ProofOfDocumentURL: null,
                    FlatAlterationRemark: editingFlatAlterationData.FlatAlterationRemark || '',
                });
                setProofOfDocumentFiles([]);
                setProofOfDocumentURL(editingFlatAlterationData.ProofOfDocumentURL || '');
                setRemoveProofOfDocumentUrls([]);
            } else {
                setFormDataForFlatAlteration({
                    ...initialFormStateForFlatAlterationRequest(),
                    ProjectId: Number(projectId),
                });
                setProofOfDocumentFiles([]);
                setProofOfDocumentURL('');
                setRemoveProofOfDocumentUrls([]);
            }
            setErrors({});
        }
    }, [isAddUpdateFlatAlterationModalOpen, editingFlatAlterationData, projectId]);

    const handleEditFlatAlteration = (row: FlatAlterationRequestData) => {
        setEditingFlatAlterationData({
            ...row,
        });
        setProofOfDocumentFiles([]);
        setProofOfDocumentURL(row.ProofOfDocumentURL ?? "");
        setRemoveProofOfDocumentUrls([]);
        setIsAddUpdateFlatAlterationModalOpen(true);
    };

    const flatAlterationColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "FlatAlterationRemark",
                label: "Flat Alteration Remark",
                sortable: false,
                align: "left",
                render: (value: string, row: any) => {



                    console.log("value", value)
                    console.log("row", row)
                    console.log("Proof URL", row.ProofOfDocumentURL);
                    console.log('Parse Document URL', parseDocumentUrls(row.ProofOfDocumentURL));



                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className="truncate max-w-[400px]">
                                <MultiImageViewer images={parseDocumentUrls(row.ProofOfDocumentURL)} title="Proof Of Document" triggerLabel={value || "-"} />
                            </div>
                        </div>
                    );
                },
            },

            {
                key: "ApprovalStatus",
                label: "Approval Status",
                width: "18",
                sortable: false,
                align: "left",
                render: (value, row) => (
                    <ApprovalActions
                        approvalStatus={value || "-"}
                        showApproval={row.IsApproval}
                        isIcons={true}
                        onHistory={() => handleFlatAlterationApprovalLog(row)}
                        onApprove={() => handleFlatAlterationApproveRejectDocument(row, "approve")}
                        onReject={() => handleFlatAlterationApproveRejectDocument(row, "reject")}
                    />
                ),
            },
            ...(canAction && bookingApprovalStatus?.toUpperCase() === "APPROVED" && !isBookingCancelled
                ? [
                    {
                        key: "actions",
                        label: "Actions",
                        width: "10",
                        sortable: false,
                        align: "center" as const,
                        fixed: "right" as const,
                        render: (_v: any, row: any) => (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleEditFlatAlteration(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    size="sm"
                                    title="Edit"
                                    leftIcon={<Edit className="h-4 w-4" />}
                                />
                            </div>
                        ),
                    },
                ]
                : []),
        ],
        [canAction, bookingApprovalStatus, isBookingCancelled, handleEditFlatAlteration],
    );

    const handleCreateRequestFlatSpecificationModal = () => {
        setIsAddUpdateFlatAlterationModalOpen(true);
        setProofOfDocumentFiles([]);
        setProofOfDocumentURL("");
        setRemoveProofOfDocumentUrls([]);
        setFormDataForFlatAlteration(initialFormStateForFlatAlterationRequest());
    };


    const handleFlatAlterationApprovalLog = (row: FlatAlterationRequestData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "FLAT ALTERATION APPROVAL",
            Id: bookingId ?? 0,
            ProjectId: projectId ?? 0,
            SubId: row.FlatAlterationRequestId ?? 0,
        };
        setFlatAlterationOwnerRemark(row.FlatAlterationRemark);
        setApprovalFlatAlterationLogRequest(request);
        setIsFlatAlterationApprovalLogModalOpen(true);
    };

    const handleFlatAlterationApproveRejectDocument = (row: FlatAlterationRequestData, approvalType: "approve" | "reject") => {
        setApprovalFlatAlterationRowData(row);
        setFlatAlterationOwnerRemark(row.FlatAlterationRemark);
        setApprovalFlatAlterationActionType(approvalType);
        setIsFlatAlterationApprovalActionModalOpen(true);
    };

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <section className="bg-white rounded-xl pt-5">
                <div className="flex justify-between items-center pb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Flat Alteration Remark</h4>

                    {canAction && bookingApprovalStatus?.toUpperCase() === "APPROVED" && (
                        <Button
                            onClick={handleCreateRequestFlatSpecificationModal}
                            color="blue"
                            size="sm"
                            variant="solid"
                            style={{ width: "190px" }}
                            leftIcon={<Plus className="h-4 w-4" />}
                            disabled={isBookingCancelled}
                        >
                            Create Requests
                        </Button>
                    )}
                </div>

                {flatAlterationData || bookingData?.FlatAlterationRemark ? (
                    <DataTable
                        columns={flatAlterationColumns}
                        data={
                            flatAlterationData
                                ? [flatAlterationData]
                                : [
                                    {
                                        FlatAlterationRemark: bookingData?.FlatAlterationRemark,
                                        ApprovalStatus: bookingData?.FlatAlterationRequestApprovalStatus,
                                        IsApproval: bookingData?.FlatAlterationRequestIsApproval,
                                        // ProofOfDocumentURL: bookingData?.ProofOfDocumentURL || ""
                                    },
                                ]
                        }
                        fixedHeight={false}
                        className="shadow-sm border border-gray-100 rounded-lg"
                    />
                ) : (
                    <div className="text-center py-10 rounded-xl text-gray-400 border border-dashed border-gray-200">
                        No alteration remarks found.
                    </div>
                )}
            </section>

            <Modal
                isOpen={isAddUpdateFlatAlterationModalOpen}
                onClose={() => {
                    setIsAddUpdateFlatAlterationModalOpen(false);
                    setFormDataForFlatAlteration(initialFormStateForFlatAlterationRequest());
                    setProofOfDocumentFiles([]);
                    setProofOfDocumentURL("");
                    setRemoveProofOfDocumentUrls([]);
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateFlatAlterationModalOpen(false);
                    setFormDataForFlatAlteration(initialFormStateForFlatAlterationRequest());
                    setProofOfDocumentFiles([]);
                    setProofOfDocumentURL("");
                    setRemoveProofOfDocumentUrls([]);
                    setErrors({});
                }}
                title={formDataForFlatAlteration.FlatAlterationRequestId > 0 ? "Edit Flat Alteration Request" : "Flat Alteration Request"}
                saveText={formDataForFlatAlteration.FlatAlterationRequestId > 0 ? "Update" : "Add"}
                onSubmit={(e) => {
                    if (e) e.preventDefault();
                    handleAddUpdateFlatAlteration();
                }}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-5 p-3 bg-blue-100">
                    <div>
                        <MultiFilePicker
                            label="Proof of Document"
                            placeholder="Select Proof of Document"
                            required
                            value={proofOfDocumentFiles}
                            onChange={setProofOfDocumentFiles}
                            availableFilesURL={proofOfDocumentURL ?? ""}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                            maxFiles={5}
                            error={errors.ProofOfDocument}
                            onRemoveExisting={(url) => {
                                setRemoveProofOfDocumentUrls((prev) => [...prev, url]);
                            }}
                        />
                    </div>
                    <TextArea
                        label="Flat Alteration Remarks"
                        required
                        placeholder="Enter Flat Alteration Remarks"
                        value={formDataForFlatAlteration.FlatAlterationRemark}
                        onChange={(e) => handleFieldChange("FlatAlterationRemark", e.target.value)}
                        error={errors.FlatAlterationRemark}
                        disabled={isBookingCancelled}
                    />
                </div>
            </Modal>

            <ApprovalLogModal
                isOpen={isFlatAlterationApprovalLogModalOpen}
                title="Flat Alteration Remarks"
                titleText={flatAlterationOwnerRemark ?? ""}
                onClose={() => setIsFlatAlterationApprovalLogModalOpen(false)}
                request={approvalFlatAlterationLogRequest}
            />

            <ApprovalActionModal
                title="Flat Alteration Remarks"
                isOpen={isFlatAlterationApprovalActionModalOpen}
                onClose={() => setIsFlatAlterationApprovalActionModalOpen(false)}
                actionType={approvalFlatAlterationActionType}
                titleText={flatAlterationOwnerRemark ?? ""}
                onSubmit={handleFlatAlterationApprovalSubmit}
                loading={isLoading}
            />
        </div>
    );
};

export default FlatAlteration;
