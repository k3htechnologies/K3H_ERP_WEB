import { runApiWithLoader } from "@/core/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ParkingModificationDetailsData, FilterWithPaginationParkingModificationDetails } from '@/features/crmPayTrack/models/ParkingModificationModel';
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
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button, Input } from "@/ui/components/forms";
import { Edit, Plus } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";

const initialFormState = (): AddUpdateParkingModificationRequest => ({
    ParkingModificationRequestId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    BookingId: 0,
    ProjectId: 0,
    ParkingId: '',
    ParkingData: [],
    IsApproval: false,
    ApprovalStatus: '',
    VersionNumber: '',
    ParkingModificationDocumentURL: [],
    RemoveParkingModificationDocumentURL: '',
    CreatedById: 0,
    CreatedBy: '',
    CreatedDate: '',
    ModifiedById: 0,
    ModifiedBy: '',
    ModifiedDate: ''
});


export const ParkingSwapSection: React.FC = () => {

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
    const { canAction } = useMenuPermissions("/payTrack");
    const { pagination, setPagination } = usePagination(10);
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState } = usePayTrackBookingListState();
    const { bookingId, bookingData, bookingApprovalStatus } = listState;
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const isBookingCancelled = bookingData?.ApprovalStatus == 'Cancel' || bookingData?.ApprovalStatus == 'Refund';
    const isParkingDetailsEmpty = !bookingData?.ParkingNumber || bookingData.ParkingNumber === "-";
    const isParkingEmpty = !bookingData?.ParkingNumber || bookingData?.ParkingNumber === "-";

    useEffect(() => {
        if (!projectId || !bookingId) return;

        fetchParkingModificationRequest();

    }, [projectId, bookingId]);

    const fetchParkingModificationRequest = async (page: number = pagination.currentPage) => {
        return await loadParkingModificationRequest(page);
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

                };

                const response = await parkingModificationService.apiCallPullParkingModificationDetails(params);

                if (E.isRight(response)) {
                    if (response.right.Data && response.right.Data.length > 0) {
                        const latest = response.right.Data[response.right.Data.length - 1];
                        setParkingModificationData(latest);
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
                ApprovalStatus: parkingModificationData.ApprovalStatus,
                IsApproval: parkingModificationData.IsApproval,
                ParkingModificationRequestId: parkingModificationData.ParkingModificationRequestId,
                parkingData: parkingModificationData.parkingData
            }));
        }
        return bookingData?.ParkingData || [];
    }, [parkingModificationData, bookingData]);

    const validateAddParkingSwapForm = (): {
        isValid: boolean;
        errors: { [k: string]: string };
    } => {
        const errors: { [k: string]: string } = {};

        if (!swapParkingFormData.ParkingId) {
            errors.ParkingId = "Parking is required";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };


    const PushParkingModificationFormData = (): AddUpdateParkingModificationRequest => {
        return {
            ParkingModificationRequestId: formData.ParkingModificationRequestId,
            Uniquekey: formData.Uniquekey,
            BookingId: bookingId,
            ProjectId: Number(projectId),
            ParkingId: swapParkingFormData?.ParkingId,
            ParkingData: formData.ParkingData,
            IsApproval: formData.IsApproval,
            ApprovalStatus: formData.ApprovalStatus,
            VersionNumber: formData.VersionNumber,
            CreatedById: formData.CreatedById,
            CreatedBy: formData.CreatedBy,
            CreatedDate: formData.CreatedDate,
            ModifiedById: formData.ModifiedById,
            ModifiedBy: formData.ModifiedBy,
            ModifiedDate: formData.ModifiedDate
        };
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
            displayParkingId: swapParkingFormData?.ParkingId || "",
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

    const handleEditParkingSwap = (row: any) => {
        setFormData((prev) => ({
            ...prev,
            ParkingModificationRequestId: row.ParkingModificationRequestId ?? 0,
        }));

        setSwapParkingFormData({
            ParkingId: String(row.ParkingId),
        });

        setSwapParkingErrors({});
        setErrors({});
        setIsAddUpdateParkingSwapModalOpen(true);
    };

    const parkingColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "ParkingNumber",
                label: "Parking Number",
                sortable: false,
                align: "left",
                fixed: "left",
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
                render: (value, row) => (

                    <ApprovalActions
                        approvalStatus={value || "-"}
                        showApproval={row.IsApproval}
                        isIcons={true}
                        onHistory={() => handleParkingApprovalLog(row)}
                        onApprove={() => handleParkingApproveRejectDocument(row, "approve")}
                        onReject={() => handleParkingApproveRejectDocument(row, "reject")}
                    />
                )
            },
            ...(canAction && bookingApprovalStatus?.toUpperCase() === 'APPROVED' && !isBookingCancelled && !isParkingDetailsEmpty
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
                                        handleEditParkingSwap(row);
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
        [canAction, bookingApprovalStatus, isBookingCancelled, isParkingDetailsEmpty, handleEditParkingSwap]
    )


    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

            {!isParkingDetailsEmpty && (
                <section className="bg-white rounded-xl pt-5">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 ">
                            Parking Details
                        </h4>
                        <div className="">
                            {canAction && bookingApprovalStatus?.toUpperCase() === 'APPROVED' && (
                                <div className="flex justify-end pb-2">
                                    <Button
                                        onClick={() => {
                                            setIsAddUpdateParkingSwapModalOpen(true);
                                        }}
                                        color="blue"
                                        size="sm"
                                        variant="solid"
                                        defineWidth
                                        style={{ width: '190px' }}
                                        leftIcon={<Plus className="h-4 w-4" />}
                                        disabled={isBookingCancelled || isParkingDetailsEmpty}
                                    >
                                        Create Requests
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <DataTable
                        columns={parkingColumns}
                        data={tableData}
                        fixedHeight={true}
                        className="flex-1"
                    />
                </section>
            )}
            <Modal
                isOpen={isAddUpdateParkingSwapModalOpen}
                onClose={() => {
                    setIsAddUpdateParkingSwapModalOpen(false);
                    setSwapParkingFormData(initialFormState());
                    setSwapParkingErrors({});
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateParkingSwapModalOpen(false);
                    setSwapParkingFormData(initialFormState());
                    setSwapParkingErrors({});
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title="Swap Parking"
                saveText="Save"
                onSubmit={handleAddUpdateParkingSwap}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >
                        <div>
                            <Input label="Current Parking Number" value={bookingData?.ParkingNumber || "-"} disabled />
                        </div>
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