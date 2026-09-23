import { useCallback, useEffect, useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import Details from "@/features/materialRequisition/components/Details";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Invoice } from "@/features/materialRequisition/components/invoice/Invoice";
import Overview from "@/features/materialRequisition/components/Overview";
import PurchaseOrder from "@/features/materialRequisition/components/PurchaseOrder";
import GRN from "@/features/materialRequisition/components/GRN/GRN";
import type { CloseMaterialRequisitionRequest, FilterMaterialRequisitionOverview, MaterialRequisitionData, MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "@/features/materialRequisition/services/MaterialRequisitionService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";
import { FinalizedVendor } from "@/features/materialRequisition/components/FinalizedVendor";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { TextArea } from "@/ui/components/forms/Textarea";
import type { MaterialRequisitionInvoiceData } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import RadioPill from "@/ui/components/forms/RadioPill";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import type { RevokeFinalizationVendorRequest } from "@/features/materialRequisition/models/VendorFinalizeModel";
import { vendorFinalizationService } from "../services/VendorFinalizationService";

export const ViewMaterialRequisition: React.FC = () => {

    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);
    const [materialRequisitionInvoiceData, setMaterialRequisitionInvoiceData] = useState<MaterialRequisitionInvoiceData[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { projectId } = useProject();
    const { setDetailData } = useMaterialRequisitionListState()
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState, updateListState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const systemGeneratedCode = listState.SystemGeneratedCode;
    const materialRequisitionStatus = listState.MaterialRequisitionStatus;
    const location = useLocation();

    const [isRevokeFinalizationVendorDialogOpen, setIsRevokeFinalizationVendorDialogOpen] = useState(false);
    const [selectedRevokeFinalizationVendorMaterialRequisitionItem, setSelectedRevokeFinalizationVendorMaterialRequisitionItem] = useState<RevokeFinalizationVendorRequest | null>(null);

    const [isCloseRequisitionDialogOpen, setIsCloseRequisitionDialogOpen] = useState(false);
    const [selectedMaterialRequisitionItem, setSelectedMaterialRequisitionItem] = useState<CloseMaterialRequisitionRequest | null>(null);
    const [closeCompletedRemarkError, setCloseCompletedRemarkError] = useState("");

    const { canAction: canMaterialRequisitionView } = useMenuPermissions('/materialRequisition');
    const { canView: canFinalizedVendorView } = useMenuPermissions('Finalized Vendor');
    const { canView: canGeneratePurchaseOrder } = useMenuPermissions('Generate Purchase Order');
    const { canView: canAddInvoice } = useMenuPermissions('Add Invoice');

    const MaterialRequisitionTabList: { id: string; label: string }[] = [

        { id: "Overview", label: "Overview" },
        { id: "Details", label: "Details" },
        canFinalizedVendorView ? { id: "Finalize Vendor", label: "Finalize Vendor" } : null,
        canGeneratePurchaseOrder ? { id: "Purchase Order", label: "Purchase Order" } : null,
        { id: "GRN", label: "GRN" },
        canAddInvoice ? { id: "Invoice", label: "Invoice" } : null

    ].filter(Boolean) as { id: string; label: string }[];

    const [activeTab, setActiveTab] = useState<string>(location.state?.activeTab || MaterialRequisitionTabList?.[0]?.id || '');

    useEffect(() => {
        if (!projectId || !currentMaterialRequisitionId || currentMaterialRequisitionId === 0) return;

        loadMaterialRequisitionOverview();

    }, [projectId, currentMaterialRequisitionId, addToast]);

    const loadMaterialRequisitionOverview = async (): Promise<void> => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterMaterialRequisitionOverview = {

                    MaterialRequisitionId: Number(currentMaterialRequisitionId) || 0,
                    ProjectId: Number(projectId) || 0,
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisitionOverview(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    const item = Array.isArray(data) ? data[0] : data;

                    setMaterialRequisitionData(item ?? null);

                    setMaterialRequisitionDetailData(item?.MaterialRequisitionDetailData ?? []);

                    setMaterialRequisitionInvoiceData(item?.MaterialRequisitionInvoiceData ?? []);

                    setDetailData(item?.MaterialRequisitionDetailData);

                    updateListState({
                        MaterialRequisitionId: item.MaterialRequisitionId ?? 0,
                        MaterialRequisitionStage: item.MaterialRequisitionStage ?? "",
                        MaterialRequisitionStatus: item.MaterialRequisitionStatus ?? "",
                        SystemGeneratedCode: item.SystemGeneratedCode ?? "",
                        VendorFinalizationApprovalStatus: item.VendorFinalizationApprovalStatus,
                        VendorName: item.FinalVendor,
                        Uniquekey: item.Uniquekey ?? ""
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            });
    }



    const handleCloseRequisition = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedMaterialRequisitionItem) return;

        const remark = selectedMaterialRequisitionItem.CloseCompletionRemark?.trim();

        if (!remark) {
            setCloseCompletedRemarkError("Remark is required.");
            return;
        }

        setCloseCompletedRemarkError("");

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: CloseMaterialRequisitionRequest = {
                    MaterialRequisitionId: selectedMaterialRequisitionItem.MaterialRequisitionId,
                    Uniquekey: selectedMaterialRequisitionItem.Uniquekey,
                    ProjectId: Number(projectId),
                    Type: selectedMaterialRequisitionItem.Type,
                    CloseCompletionRemark: selectedMaterialRequisitionItem.CloseCompletionRemark,
                }

                const response = await materialRequisitionService.apiCallCloseMaterialRequisition(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0], });

                    navigate("/materialRequisition");

                    setIsCloseRequisitionDialogOpen(false);

                } else {
                    addToast({ type: "error", title: response.left.message });
                    setIsCloseRequisitionDialogOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            `${selectedMaterialRequisitionItem.Type} Requisition`,
        );
    };

    const handleRevokeFinalizationVendor = async () => {

        if (!selectedRevokeFinalizationVendorMaterialRequisitionItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: RevokeFinalizationVendorRequest = {
                    MaterialRequisitionId: selectedRevokeFinalizationVendorMaterialRequisitionItem.MaterialRequisitionId,
                    Uniquekey: selectedRevokeFinalizationVendorMaterialRequisitionItem.Uniquekey,
                    ProjectId: Number(projectId),
                }

                const response = await vendorFinalizationService.apiCallRevokeFinalizationVendor(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0], });

                    navigate("/materialRequisition");

                    setIsRevokeFinalizationVendorDialogOpen(false);

                } else {
                    addToast({ type: "error", title: response.left.message });
                    setIsRevokeFinalizationVendorDialogOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Revoke Finalization Vendor",
        );
    };

    const handleMaterialRequisitionEdit = useCallback((row: MaterialRequisitionData) => {
        updateListState({ MaterialRequisitionId: row.MaterialRequisitionId });
        navigate(`/materialRequisition/add/${row.MaterialRequisitionId}`);
    }, [navigate, updateListState]);



    const handleBackToListMaterialRequisition = () => {
        navigate('/materialRequisition');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="flex justify-between">
                <div className="flex-1">
                    <HeaderActionBar
                        subTitleText={systemGeneratedCode ?? "-"}
                        subSubTitleText={materialRequisitionStatus ?? ''}
                        subSubSubTitleText={listState.VendorName ?? ''}
                        cancelText="Cancel"
                        onCancel={() => handleBackToListMaterialRequisition()}
                        EditText="Edit"
                        canAction={activeTab === "Overview" &&
                            canMaterialRequisitionView &&
                            !listState.VendorFinalizationApprovalStatus.toUpperCase().includes("APPROVED") &&
                            !["COMPLETED", "CLOSED"].includes(listState?.MaterialRequisitionStage?.toUpperCase() ?? "") &&
                            ["GET QUOTATION"].includes(listState?.MaterialRequisitionStage?.toUpperCase())}
                        onEdit={() => {

                            if (activeTab === "Overview") {

                                if (matrialRequisitionData) handleMaterialRequisitionEdit(matrialRequisitionData);
                            }
                        }}

                        ExtraButtontitleText="Action"
                        ExtraButtonText="Revoke Finalization"
                        onExtraButton={() => {
                            setSelectedRevokeFinalizationVendorMaterialRequisitionItem({
                                MaterialRequisitionId: matrialRequisitionData?.MaterialRequisitionId ?? 0,
                                Uniquekey: matrialRequisitionData?.Uniquekey ?? "",
                                ProjectId: Number(projectId)
                            });

                            setIsRevokeFinalizationVendorDialogOpen(true);
                        }}
                        canActionExtraButtonText={canMaterialRequisitionView && matrialRequisitionData?.IsCopy && activeTab === 'Details' && !["COMPLETED", "CLOSED"].includes(listState.MaterialRequisitionStatus?.toUpperCase())}

                        ExtraExtraButtonText="Closed | Completed"
                        onExtraExtraButton={() => {
                            setSelectedMaterialRequisitionItem({
                                MaterialRequisitionId: matrialRequisitionData?.MaterialRequisitionId ?? 0,
                                Uniquekey: matrialRequisitionData?.Uniquekey ?? "",
                                ProjectId: Number(projectId),
                                Type: "Closed",
                                CloseCompletionRemark: ""
                            });

                            setIsCloseRequisitionDialogOpen(true);
                        }}
                        canActionExtraExtraButton={canMaterialRequisitionView && activeTab === 'Details' && !["COMPLETED", "CLOSED"].includes(listState.MaterialRequisitionStatus?.toUpperCase())}
                    />
                </div>
            </div>

            <div className="pt-5">
                <Tabs
                    tabs={MaterialRequisitionTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    tabWidth={16}
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Overview' && (<Overview matrialRequisitionData={matrialRequisitionData} matrialRequisitionDetailData={matrialRequisitionDetailData} materialRequisitionInvoiceData={materialRequisitionInvoiceData} />)}
            {activeTab === 'Details' && <Details matrialRequisitionData={matrialRequisitionData} matrialRequisitionDetailData={matrialRequisitionDetailData} />}
            {activeTab === 'Finalize Vendor' && <FinalizedVendor onApprovalSuccess={loadMaterialRequisitionOverview} />}
            {activeTab === 'Purchase Order' && <PurchaseOrder />}
            {activeTab === 'GRN' && (<GRN matrialRequisitionDetailData={matrialRequisitionDetailData} onAddGRN={loadMaterialRequisitionOverview} />)}
            {activeTab === 'Invoice' && <Invoice onApprovalSuccess={loadMaterialRequisitionOverview} />}

            <Modal
                isOpen={isCloseRequisitionDialogOpen}
                onClose={() => {
                    setIsCloseRequisitionDialogOpen(false);
                    setSelectedMaterialRequisitionItem(null);
                }}
                title="Closed / Completed Requisition"
                onSubmit={handleCloseRequisition}
                saveText={selectedMaterialRequisitionItem?.Type === "Completed"
                    ? "Complete Requisition"
                    : "Close Requisition"}
                loading={isLoading}
                size="xl">

                <div className="space-y-4 p-6 bg-blue-100">
                    <div className="flex gap-3">
                        <RadioPill
                            name="CLOSED_COMPLETED"
                            label="Closed"
                            value="Closed"
                            checked={selectedMaterialRequisitionItem?.Type === "Closed"}
                            onChange={() => {

                                setSelectedMaterialRequisitionItem(prev =>
                                    prev
                                        ? { ...prev, Type: "Closed" }
                                        : prev
                                );
                            }}
                        />

                        <RadioPill
                            name="CLOSED_COMPLETED"
                            label="Completed"
                            value="Completed"
                            checked={selectedMaterialRequisitionItem?.Type === "Completed"}
                            onChange={() => {
                                setSelectedMaterialRequisitionItem(prev =>
                                    prev
                                        ? { ...prev, Type: "Completed" }
                                        : prev
                                );
                            }}
                        />

                    </div>

                    <TextArea
                        label="Remark"
                        placeholder="Enter Remark"
                        required
                        className="thin-scroll"
                        error={closeCompletedRemarkError}
                        value={
                            selectedMaterialRequisitionItem?.CloseCompletionRemark ?? ""
                        }
                        onChange={(e) =>
                            setSelectedMaterialRequisitionItem(prev =>
                                prev
                                    ? {
                                        ...prev,
                                        CloseCompletionRemark: e.target.value
                                    }
                                    : prev
                            )
                        }
                    />

                    {selectedMaterialRequisitionItem?.Type === "Completed" ? (
                        <div className="text-sm text-[#00000080] pt-2">
                            <p>
                                By selecting this option, the <b>Material Requisition</b> will be
                                marked as <b>Completed</b> and cannot be changed later.
                            </p>

                            <p className="mt-2 font-medium">
                                The following must be completed:
                            </p>

                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                <li>Vendor Finalization</li>
                                <li>Vendor Finalization Approval</li>
                                <li>Purchase Order</li>
                                <li>GRN (Goods Received Note)</li>
                                <li>Invoice</li>
                                <li>Invoice Payment – Fully Paid</li>
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-[#00000080] pt-2">
                            By selecting this option, the <b>Material Requisition</b> will be
                            marked as <b>Closed</b> and cannot be changed later.
                        </p>
                    )}

                </div>

            </Modal>

            <ConfirmationDialogBox
                isOpen={isRevokeFinalizationVendorDialogOpen}
                onClose={() => {
                    setIsRevokeFinalizationVendorDialogOpen(false);
                    setSelectedRevokeFinalizationVendorMaterialRequisitionItem(null);
                }}
                onConfirm={handleRevokeFinalizationVendor}
                title="Reopen Vendor Finalization"
                message="Are you sure you want to reopen the vendor finalization? This will allow you to select and finalize another vendor."
                confirmText="Reopen"
                cancelText="Cancel"
                loading={isLoading}
            />
        </div>
    );
};

export default ViewMaterialRequisition;