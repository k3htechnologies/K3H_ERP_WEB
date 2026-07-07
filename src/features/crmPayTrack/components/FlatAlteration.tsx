import { runApiWithLoader } from "@/core/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
    FilterWithPaginationFlatAlterationRequest,
    FlatAlterationRequestData,
    AddUpdateFlatAlterationRequest,
    DeleteFlatAlterationRequest,
} from "@/features/crmPayTrack/models/FlatAlterationRequestModel";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import * as E from "fp-ts/Either";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { type TableColumn } from "@/ui/components/DataTable/DataTable";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button } from "@/ui/components/forms";
import { Edit, Plus, Trash2 } from "lucide-react";
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
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";

const initialFormStateForFlatAlterationRequest = (): AddUpdateFlatAlterationRequest => ({
    FlatAlterationRequestId: 0,
    UniqueKey: "7b14cc10-2533-f111-854a-c7681b271aa8",
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

    const [isFlatAlterationApprovalActionModalOpen, setIsFlatAlterationApprovalActionModalOpen] = useState(false);
    const [approvalFlatAlterationActionType, setApprovalFlatAlterationActionType] = useState<"approve" | "reject">("approve");
    const [approvalFlatAlterationRowData, setApprovalFlatAlterationRowData] = useState<FlatAlterationRequestData | null>(null);
    const { canAction } = useMenuPermissions("/modificationRequest");
    const { pagination, setPagination } = usePagination(10);
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState } = usePayTrackBookingListState();
    const { bookingId, bookingData, bookingApprovalStatus } = listState;
    const isBookingCancelled = bookingData?.ApprovalStatus == "Cancel" || bookingData?.ApprovalStatus == "Refund";

    const [proofOfDocumentFiles, setProofOfDocumentFiles] = useState<(File | string)[]>([]);
    const [RemoveProofOfDocumentUrls, setRemoveProofOfDocumentUrls] = useState<string[]>([]);
    const [proofOfDocumentURL, setProofOfDocumentURL] = useState<string>();

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [editingFlatAlterationData, setEditingFlatAlterationData] = useState<FlatAlterationRequestData | null>(null);
    const [deleteFlatAlterationData, setDeleteFlatAlterationData] = useState<FlatAlterationRequestData | null>(null);

    useEffect(() => {
        if (!projectId || !bookingId) return;
        fetchFlatAlterationRequest();
    }, [projectId, bookingId]);

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
                    TabName: "REQUESTS",
                };

                const response = await flatAlterationService.apiCallPullFlatAlterationRequest(params);

                if (E.isRight(response)) {

                    if (response.right.Data && response.right.Data.length > 0) {

                        const latestDataIndex = response.right.Data.length - 1;

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
                    FlatAlterationRemark: editingFlatAlterationData.FlatAlterationRemark || '',
                    ProofOfDocumentURL: null,
                    RemoveProofOfDocumentURL: ''
                });
                setProofOfDocumentFiles([]);
                setProofOfDocumentURL(editingFlatAlterationData.ProofOfDocumentURL || '');
                // setRemoveMarketingContentUrls([]);
            } else {
                setFormDataForFlatAlteration({
                    ...initialFormStateForFlatAlterationRequest(),
                    ProjectId: Number(projectId),
                });
                setProofOfDocumentFiles([]);
                setProofOfDocumentURL('');
                // setRemoveMarketingContentUrls([]);
            }
            setErrors({});
        }
    }, [isAddUpdateFlatAlterationModalOpen, editingFlatAlterationData, projectId]);

    const handleEditFlatAlterationRequest = useCallback((row: FlatAlterationRequestData) => {
        setEditingFlatAlterationData({
            ...row,
            FlatAlterationRemark: row.FlatAlterationRemark,
            ProofOfDocumentURL: row.ProofOfDocumentURL,
        })
        setIsAddUpdateFlatAlterationModalOpen(true);
    }, [])

    const handleFieldChange = (field: keyof AddUpdateFlatAlterationRequest, value: any) => {
        setFormDataForFlatAlteration((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
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
            errors.FlatAlterationRemark = "Unit / Modulation / Customization Remark is required";
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




    const handleConfirmationDialogBoxOpen = useCallback((row: FlatAlterationRequestData) => {
        setDeleteFlatAlterationData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, []);

    const handleDeleteFlatAlterationRequest = async () => {
        setIsConfirmationDialogBoxOpen(false);
        if (!deleteFlatAlterationData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteFlatAlterationRequest = {
                    BookingId: bookingId ?? 0,
                    ProjectId: projectId ?? 0,
                    Uniquekey: deleteFlatAlterationData.UniqueKey,
                    FlatAlterationRequestId: deleteFlatAlterationData.FlatAlterationRequestId,
                }
                const response = await flatAlterationService.apiCallDeleteFlatAlterationRequest(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });

                    await fetchFlatAlterationRequest();

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteFlatAlterationData(null);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Delete Flat Alteration Requests'
        )
    }

    const handleFlatAlterationApprovalLog = (row: FlatAlterationRequestData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "FLAT ALTERATION APPROVAL",
            Id: bookingId ?? 0,
            ProjectId: projectId ?? 0,
            SubId: row.FlatAlterationRequestId ?? 0,
        };
        setApprovalFlatAlterationLogRequest(request);
        setIsFlatAlterationApprovalLogModalOpen(true);
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

    const handleFlatAlterationApproveRejectDocument = (row: FlatAlterationRequestData, approvalType: "approve" | "reject") => {
        setApprovalFlatAlterationRowData(row);
        setApprovalFlatAlterationActionType(approvalType);
        setIsFlatAlterationApprovalActionModalOpen(true);
    };

    const flatAlterationColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "ProofOfDocumentURL",
                label: "Proof of Document",
                width: "15",
                align: "center",
                render: (_value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.ProofOfDocumentURL)}
                            title="Proof of Document"
                            triggerLabel="-"
                            isIcon={false}
                            isWrap={false}
                        />
                    );
                },
            },
            {
                key: "FlatAlterationRemark",
                label: "Unit / Modulation / Customization Remark",
                sortable: false,
                align: "left",
                render: (value) => value || "-",
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: '10',
                align: 'center',
                render: (_value, row) => {

                    const isDisabled = row.ApprovalStatus !== "Pending";

                    return (
                        <div className="flex items-center justify-center">
                            {canAction && (
                                <>
                                    <Button
                                        color="transparent"
                                        size="sm"
                                        style={{
                                            color: (!isDisabled) ? 'blue' : '#9CA3AF',
                                            cursor: (!isDisabled) ? 'pointer' : 'not-allowed',
                                            opacity: (!isDisabled) ? 1 : 0.5
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleEditFlatAlterationRequest(row)
                                        }}
                                        leftIcon={<Edit className="h-4 w-4" />}
                                        disabled={isDisabled}
                                    />

                                    <Button
                                        color="transparent"
                                        size="sm"
                                        style={{
                                            color: (!isDisabled) ? 'red' : '#9CA3AF',
                                            cursor: (!isDisabled) ? 'pointer' : 'not-allowed',
                                            opacity: (!isDisabled) ? 1 : 0.5
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleConfirmationDialogBoxOpen(row);
                                        }}
                                        leftIcon={<Trash2 className="h-4 w-4" />}
                                        disabled={isDisabled}
                                    />

                                </>
                            )}

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
        ],
        [canAction, handleFlatAlterationApprovalLog, handleFlatAlterationApproveRejectDocument, handleEditFlatAlterationRequest, handleConfirmationDialogBoxOpen],
    );

    const handleCreateRequestFlatSpecificationModal = () => {
        setEditingFlatAlterationData(null);
        setIsAddUpdateFlatAlterationModalOpen(true);
        setProofOfDocumentFiles([]);
        setProofOfDocumentURL("");
        setRemoveProofOfDocumentUrls([]);
        setFormDataForFlatAlteration(initialFormStateForFlatAlterationRequest());

    };

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteFlatAlterationData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteFlatAlterationData]);

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>
            <div className="pt-5">
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden  justify-between">
                    <div className="bg-[#FBF9F9] px-3 py-2 border-b border-[#D0D7DE] flex items-center justify-between overflow-hidden">
                        <h4 className="text-sm font-semibold text-[#1D1D1D]">
                            Unit / Modulation / Customization Details
                        </h4>

                        {canAction && bookingApprovalStatus?.toUpperCase() === "APPROVED" && !flatAlterationData && (
                            <Button
                                onClick={handleCreateRequestFlatSpecificationModal}
                                color="blue"
                                size="sm"
                                variant="solid"
                                leftIcon={<Plus className="h-4 w-4" />}
                                disabled={isBookingCancelled}
                            >
                                Add
                            </Button>
                        )}
                    </div>
                    <div className="p-6">
                        <DataTableWithHeaderRowDivider
                            columns={flatAlterationColumns}
                            data={
                                flatAlterationData
                                    ? [flatAlterationData]
                                    : bookingData?.FlatAlterationRemark
                                        ? [
                                            {
                                                FlatAlterationRemark: bookingData?.FlatAlterationRemark,
                                                ApprovalStatus: bookingData?.FlatAlterationRequestApprovalStatus,
                                                IsApproval: bookingData?.FlatAlterationRequestIsApproval,
                                            },
                                        ]
                                        : []
                            }
                            fixedHeight={true}
                        />
                    </div>

                </section>
            </div>

            <Modal
                isOpen={isAddUpdateFlatAlterationModalOpen}
                onClose={() => {
                    setIsAddUpdateFlatAlterationModalOpen(false);
                    setFormDataForFlatAlteration(initialFormStateForFlatAlterationRequest());
                    setProofOfDocumentFiles([]);
                    setProofOfDocumentURL("");
                    setRemoveProofOfDocumentUrls([]);
                    setEditingFlatAlterationData(null);
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateFlatAlterationModalOpen(false);
                    setFormDataForFlatAlteration(initialFormStateForFlatAlterationRequest());
                    setProofOfDocumentFiles([]);
                    setProofOfDocumentURL("");
                    setRemoveProofOfDocumentUrls([]);
                    setEditingFlatAlterationData(null);
                    setErrors({});
                }}
                title={editingFlatAlterationData ? "Update Unit / Modulation / Customization Remark" : "Add Unit / Modulation / Customization Remark"}
                saveText="Save"
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
                        label="Unit / Modulation / Customization Remark"
                        required
                        placeholder="Enter Unit / Modulation / Customization Remark"
                        value={formDataForFlatAlteration.FlatAlterationRemark}
                        onChange={(e) => handleFieldChange("FlatAlterationRemark", e.target.value)}
                        error={errors.FlatAlterationRemark}
                        disabled={isBookingCancelled}
                    />
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteFlatAlterationRequest}
                loading={isLoading}
                pageName='Unit / Modulation / Customization Remark'
            />

            <ApprovalLogModal
                isOpen={isFlatAlterationApprovalLogModalOpen}
                title="Unit / Modulation / Customization Remark"
                titleText={""}
                onClose={() => setIsFlatAlterationApprovalLogModalOpen(false)}
                request={approvalFlatAlterationLogRequest}
            />

            <ApprovalActionModal
                title="Unit / Modulation / Customization Remark"
                isOpen={isFlatAlterationApprovalActionModalOpen}
                onClose={() => setIsFlatAlterationApprovalActionModalOpen(false)}
                actionType={approvalFlatAlterationActionType}
                titleText={""}
                onSubmit={handleFlatAlterationApprovalSubmit}
                loading={isLoading}
            />
        </div>
    );
};

export default FlatAlteration;
