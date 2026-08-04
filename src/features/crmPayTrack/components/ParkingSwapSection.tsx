import { runApiWithLoader } from "@/core/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ParkingModificationDetailsData, FilterWithPaginationParkingModificationDetails, DeleteParkingModificationRequest } from '@/features/crmPayTrack/models/ParkingModificationModel';
import { fetchParkingDropdown } from "@/features/parking/parkingDropDown";
import type { AddUpdateParkingModificationRequest } from '@/features/crmPayTrack/models/ParkingModificationModel';
import { parkingModificationService } from '@/features/crmPayTrack/services/ParkingModificationService';
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import * as E from 'fp-ts/Either';
import usePagination from "@/core/hooks/usePagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import { type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button, Input } from "@/ui/components/forms";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import type { FilterWithPaginationPayTrackBooking } from "../models/PayTrackBookingModel";
import { payTrackBookingService } from "../services/PayTrackBookingService";

const initialFormState = (): AddUpdateParkingModificationRequest => ({
    ParkingModificationRequestId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    BookingId: 0,
    ProjectId: 0,
    ParkingId: '',
    ProofOfDocumentURL: [],
    RemoveProofOfDocumentURL: ""
});

interface Props {
    onLoaded?: () => void;
}

export const ParkingSwapSection: React.FC<Props> = ({ onLoaded }) => {

    const [parkingModificationData, setParkingModificationData] = useState<ParkingModificationDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isAddUpdateParkingSwapModalOpen, setIsAddUpdateParkingSwapModalOpen] = useState(false);
    const [swapParkingFormData, setSwapParkingFormData] = useState<any>({});
    const [swapParkingErrors, setSwapParkingErrors] = useState<any>({});
    const [formData, setFormData] = useState<AddUpdateParkingModificationRequest>(() => initialFormState());
    const [isParkingApprovalLogModalOpen, setIsParkingApprovalLogModalOpen] = useState(false);
    const [approvalParkingLogRequest, setApprovalParkingLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [parkingNumber, setParkingNumber] = useState<string | null>("");
    const [isParkingApprovalActionModalOpen, setIsParkingApprovalActionModalOpen] = useState(false);
    const [approvalParkingActionType, setApprovalParkingActionType] = useState<"approve" | "reject">("approve");
    const [approvalParkingRowData, setApprovalParkingRowData] = useState<ParkingModificationDetailsData | null>(null);
    const { canAction } = useMenuPermissions("/modificationRequest");
    const { pagination, setPagination } = usePagination(10);
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState, updateListState } = usePayTrackBookingListState();
    const { bookingId, bookingData, bookingApprovalStatus, parkingNumber: bookingParkingNumber } = listState;
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const isBookingCancelled = bookingData?.ApprovalStatus == 'Cancel' || bookingData?.ApprovalStatus == 'Refund';

    const isParkingDetailsEmpty = !bookingParkingNumber || bookingParkingNumber === "-";
    const isParkingEmpty = !bookingParkingNumber || bookingParkingNumber === "-";

    const [proofOfDocumentFiles, setProofOfDocumentFiles] = useState<(File | string)[]>([]);
    const [RemoveProofOfDocumentUrls, setRemoveProofOfDocumentUrls] = useState<string[]>([]);
    const [proofOfDocumentURL, setProofOfDocumentURL] = useState<string>();

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

    const [editingParkingModificationRequestData, setEditingParkingModificationRequestData] = useState<ParkingModificationDetailsData | null>(null);
    const [deleteParkingModificationRequestData, setDeleteParkingModificationRequestData] = useState<ParkingModificationDetailsData | null>(null)

    useEffect(() => {
        if (!projectId || !bookingId) return;

        fetchParkingModificationRequest();

    }, [projectId, bookingId]);

    useEffect(() => {
        if (isAddUpdateParkingSwapModalOpen) {
            if (editingParkingModificationRequestData) {
                setFormData({
                    ParkingModificationRequestId: editingParkingModificationRequestData.ParkingModificationRequestId || 0,
                    Uniquekey: editingParkingModificationRequestData.UniqueKey || initialFormState().Uniquekey,
                    BookingId: editingParkingModificationRequestData.BookingId || 0,
                    ProjectId: editingParkingModificationRequestData.ProjectId || 0,
                    ParkingId: editingParkingModificationRequestData.ParkingId || '',
                    ProofOfDocumentURL: null,
                    RemoveProofOfDocumentURL: ''
                });

                setSwapParkingFormData({
                    ParkingId: editingParkingModificationRequestData.ParkingIds || ''
                });

                setProofOfDocumentFiles([]);
                setProofOfDocumentURL(editingParkingModificationRequestData.ProofOfDocumentURL || '');
            } else {
                setFormData({
                    ...initialFormState(),
                    ProjectId: Number(projectId),
                });

                setSwapParkingFormData({});
                setProofOfDocumentFiles([]);
                setProofOfDocumentURL('');
            }
            setErrors({});
        }
    }, [isAddUpdateParkingSwapModalOpen, editingParkingModificationRequestData, projectId]);

    const fetchParkingModificationRequest = async (page: number = pagination.currentPage) => {
        await loadParkingModificationRequest(page);
        onLoaded?.();
    };

    const loadParkingModificationRequest = async (page: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationParkingModificationDetails = {
                    PageNumber: page,
                    PageSize: 100,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                    TabName: "REQUESTS",

                };

                const response = await parkingModificationService.apiCallPullParkingModificationDetails(params);

                if (E.isRight(response)) {

                    if (response.right.Data && response.right.Data.length > 0) {

                        const latestDataIndex = response.right.Data.length - 1;

                        setParkingModificationData(response.right.Data[latestDataIndex]);

                    } else {

                        setParkingModificationData(null);
                    }

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {

                    addToast({ type: 'error', title: response.left.message });

                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Parking Modification Request'
        );
    };

    const tableData = useMemo(() => {
        if (parkingModificationData && parkingModificationData.parkingData && parkingModificationData.parkingData.length > 0) {
            return parkingModificationData.parkingData.map(item => ({
                ...item,
                ProofOfDocumentURL: parkingModificationData.ProofOfDocumentURL,
                ApprovalStatus: parkingModificationData.ApprovalStatus,
                IsApproval: parkingModificationData.IsApproval,
                ParkingModificationRequestId: parkingModificationData.ParkingModificationRequestId,
                parkingData: parkingModificationData.parkingData,
                ParkingIds: parkingModificationData.ParkingId
            }));
        }
        return [];
    }, [parkingModificationData, bookingData]);

    const handleEditParkingModificationRequest = useCallback((row: ParkingModificationDetailsData) => {
        setEditingParkingModificationRequestData({
            ...row,
            ProofOfDocumentURL: row.ProofOfDocumentURL,
            parkingData: row.parkingData,
        })
        setIsAddUpdateParkingSwapModalOpen(true);
    }, [])

    const validateAddParkingSwapForm = (): {
        isValid: boolean;
        errors: { [k: string]: string };
    } => {
        const errors: { [k: string]: string } = {};

        if (!hasAnyDocumentFile(proofOfDocumentFiles, proofOfDocumentURL, RemoveProofOfDocumentUrls)) {
            errors.ProofOfDocument = "Proof of Document is required.";
        }

        if (!swapParkingFormData.ParkingId) {
            errors.ParkingId = "Parking is required";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };


    const PushParkingModificationFormData = (): FormData => {
        const fd = new FormData();

        fd.append("ParkingModificationRequestId", String(formData.ParkingModificationRequestId)),
            fd.append("Uniquekey", formData.Uniquekey ?? "7b14cc10-2533-f111-854a-c7681b271aa8"),
            fd.append("BookingId", String(bookingId)),
            fd.append("ProjectId", String(projectId)),
            fd.append("ParkingId", swapParkingFormData.ParkingId)

        proofOfDocumentFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("ProofOfDocumentURL", file);
            }
        });

        fd.append("RemoveProofOfDocumentURL", RemoveProofOfDocumentUrls.join(","));

        return fd;

    };

    const handleParkingApprovalSubmit = async (remark: string) => {


        if (!approvalParkingRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "PARKING MODIFICATION APPROVAL",
            Id: bookingId ?? 0,
            ProjectId: projectId ?? 0,
            IsApproved: approvalParkingActionType === "approve",
            Remarks: remark ?? null,
            SubId: approvalParkingRowData.ParkingModificationRequestId ?? 0
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {


                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsParkingApprovalActionModalOpen(false);

                    await fetchParkingModificationRequest();
                    await loadPayTrackList();


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
            approvalParkingActionType === "approve" ? "Approving Parking Modification" : "Rejecting Parking Modification"
        );
    };

    const loadPayTrackList = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPayTrackBooking = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId)
                };

                const response = await payTrackBookingService.apiCallPullPayTrackBooking(params);

                if (E.isRight(response)) {

                    updateListState({ parkingNumber: response.right.Data[0]?.ParkingNumber || "-" });


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
            "Loading Pay Track Booking",
        );
    };

    const handleAddUpdateParkingSwap = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateAddParkingSwapForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushParkingModificationFormData();

                const response = await parkingModificationService.apiCallAddUpdateParkingModificationDetails(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateParkingSwapModalOpen(false);

                    await fetchParkingModificationRequest();

                    const isAdd = formData.ParkingModificationRequestId === 0;

                    if (isAdd) {
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    } else {
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

                    setProofOfDocumentFiles([]);
                    setProofOfDocumentURL("");
                    setRemoveProofOfDocumentUrls([]);

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Add Parking Modification Data'
        )
    };

    const fetchParkingProjectWise = useCallback(async (pageNumber: number, params?: { value?: string }) => {
        return fetchParkingDropdown(pageNumber, {
            ...params,
            value: params?.value || "",
            projectId: Number(projectId) || 0,
        });
    }, [projectId, swapParkingFormData?.ParkingId]);

    const parkingDropdown = useMultiSelectDropdown({
        value: swapParkingFormData?.ParkingId || null,
        fetchCallback: fetchParkingProjectWise,
        autoFetchOptions: isAddUpdateParkingSwapModalOpen,
    });

    const handleParkingApprovalLog = (row: ParkingModificationDetailsData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "PARKING MODIFICATION APPROVAL",
            Id: bookingId ?? 0,
            ProjectId: projectId ?? 0,
            SubId: row.ParkingModificationRequestId ?? 0
        };
        setParkingNumber(row.parkingData?.[0]?.ParkingNumber ?? "-");
        setApprovalParkingLogRequest(request);
        setIsParkingApprovalLogModalOpen(true);
    };

    const handleParkingApproveRejectDocument = (row: ParkingModificationDetailsData, approvalType: "approve" | "reject") => {

        setApprovalParkingRowData(row);
        setParkingNumber(row.parkingData?.[0]?.ParkingNumber ?? "-");
        setApprovalParkingActionType(approvalType);
        setIsParkingApprovalActionModalOpen(true);
    };

    const handleConfirmationDialogBoxOpen = useCallback((row: ParkingModificationDetailsData) => {
        setDeleteParkingModificationRequestData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteParkingModificationRequestData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteParkingModificationRequestData]);


    const handleDeleteParkingModificationRequest = async () => {
        setIsConfirmationDialogBoxOpen(false);
        if (!deleteParkingModificationRequestData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteParkingModificationRequest = {
                    BookingId: bookingId ?? 0,
                    ProjectId: projectId ?? 0,
                    Uniquekey: parkingModificationData?.UniqueKey || '',
                    ParkingModificationRequestId: deleteParkingModificationRequestData.ParkingModificationRequestId,
                }
                const response = await parkingModificationService.apiCallDeleteParkingModificationRequest(params);

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
                    await fetchParkingModificationRequest();

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteParkingModificationRequestData(null);

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
            'Delete Parking Modification Request'
        )
    }

    const parkingColumns = useMemo<TableColumn[]>(
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
                key: "ParkingNumber",
                label: "Parking Number",
                sortable: false,
                align: "left",
                render: (value) => value || "-",
            },

            {
                key: "ParkingCategory",
                label: "Category",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },
            {
                key: "ParkingType",
                label: "Type",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },
            {
                key: "ParkingSubType",
                label: "Size",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },
            {
                key: "ParkingDimensions",
                label: "Dimensions",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },

            {
                key: "IsEVChargingAvailable",
                label: "EV Charging",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value: boolean) => (value ? "Yes" : "No"),
            },

            {
                key: "ApprovalStatus",
                label: "Approval Status",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value, row, index) => (
                    index === 0 ? (
                        <ApprovalActions
                            approvalStatus={value || "-"}
                            showApproval={row.IsApproval}
                            isIcons={true}
                            onHistory={() => handleParkingApprovalLog(row)}
                            onApprove={() => handleParkingApproveRejectDocument(row, "approve")}
                            onReject={() => handleParkingApproveRejectDocument(row, "reject")}
                        />
                    ) : (
                        ""
                    )
                )
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: '20',
                align: 'center',

                render: (_value, row, index) => {

                    if (index !== 0) return "";

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
                                            handleEditParkingModificationRequest(row)
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


            }
        ],
        [canAction, handleParkingApprovalLog, handleParkingApproveRejectDocument, handleEditParkingModificationRequest, handleConfirmationDialogBoxOpen]
    )


    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>
            {!isParkingDetailsEmpty && (
                <div className="pt-5">
                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden  justify-between">
                        <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE] flex items-center justify-between overflow-hidden">
                            <h4 className="text-sm font-semibold text-[#13367A]">
                                Parking Details
                            </h4>
                            <div className="">
                                {canAction && bookingApprovalStatus?.toUpperCase() === 'APPROVED' && !tableData.length && (
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => {
                                                setProofOfDocumentFiles([]);
                                                setProofOfDocumentURL("");
                                                setRemoveProofOfDocumentUrls([]);
                                                setIsAddUpdateParkingSwapModalOpen(true);
                                            }}
                                            color="blue"
                                            size="sm"
                                            variant="solid"
                                            leftIcon={<Plus className="h-4 w-4" />}
                                            disabled={isBookingCancelled || isParkingDetailsEmpty}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-5">
                            <DataTableWithHeaderRowDivider
                                columns={parkingColumns}
                                data={tableData}
                                fixedHeight={true}
                                className="flex-1"
                            />
                        </div>
                    </section>
                </div>
            )}

            <Modal
                isOpen={isAddUpdateParkingSwapModalOpen}
                onClose={() => {
                    setIsAddUpdateParkingSwapModalOpen(false);
                    setSwapParkingFormData(initialFormState());
                    setProofOfDocumentFiles([]);
                    setProofOfDocumentURL("");
                    setRemoveProofOfDocumentUrls([]);
                    setSwapParkingErrors({});
                    setFormData(initialFormState());
                    setEditingParkingModificationRequestData(null);
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateParkingSwapModalOpen(false);
                    setSwapParkingFormData(initialFormState());
                    setProofOfDocumentFiles([]);
                    setProofOfDocumentURL("");
                    setRemoveProofOfDocumentUrls([]);
                    setSwapParkingErrors({});
                    setFormData(initialFormState());
                    setEditingParkingModificationRequestData(null);
                    setErrors({});
                }}
                title={editingParkingModificationRequestData ? 'Update Parking Modification Request' : 'Add Parking Modification Request'}
                saveText="Save"
                onSubmit={handleAddUpdateParkingSwap}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >
                        <div>
                            <Input label="Current Parking Number" value={bookingParkingNumber || "-"} disabled />
                        </div>


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

                        <MultiSelectPagination
                            label="Parking"
                            required
                            dataFetchCallBack={fetchParkingProjectWise}
                            selectedValues={parkingDropdown.selectedValues}
                            options={parkingDropdown.initialOptions}
                            disabled={isParkingEmpty}
                            onChange={(values) => {
                                const { idsString } = parkingDropdown.handleChange(values);
                                setSwapParkingFormData((prev: any) => ({ ...prev, ParkingId: idsString }));
                                if (swapParkingErrors.ParkingId) {
                                    setSwapParkingErrors((prev: any) => ({ ...prev, ParkingId: "" }));
                                }
                            }}
                            error={errors.ParkingId}
                        />
                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteParkingModificationRequest}
                loading={isLoading}
                pageName='Parking Modification'
            />

            <ApprovalLogModal
                isOpen={isParkingApprovalLogModalOpen}
                title='Parking Details'
                titleText={parkingNumber ?? ""}
                onClose={() => setIsParkingApprovalLogModalOpen(false)}
                request={approvalParkingLogRequest} />

            <ApprovalActionModal
                title="Parking Details"
                isOpen={isParkingApprovalActionModalOpen}
                onClose={() => setIsParkingApprovalActionModalOpen(false)}
                actionType={approvalParkingActionType}
                titleText={parkingNumber ?? ""}
                onSubmit={handleParkingApprovalSubmit}
                loading={isLoading}
            />

        </div>
    );
};

export default ParkingSwapSection