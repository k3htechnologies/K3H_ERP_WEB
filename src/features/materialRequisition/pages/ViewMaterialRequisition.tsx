import { useEffect, useState } from "react";
import Tabs from "@/ui/components/Tab/Tab";
import Details from "../components/Details";
import { Overview } from "../components/Overview";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import { useNavigate, useParams } from "react-router-dom";
import { Invoice } from "../components/invoice/Invoice";
import PurchaseOrder from "../components/PurchaseOrder";
import GRN from "../components/GRN/GRN";
import type { FilterWithPaginationMaterialRequisition, MaterialRequisitionData, MaterialRequisitionDetailData } from "../models/MaterialRequisitionModel";
import { Button } from "@/ui/components/forms";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import * as E from "fp-ts/Either";
import { Copy } from "lucide-react";
import { Loader } from "@/core/utils/loader";
import { Modal } from "@/ui/components/Modal/Modal";

export const ViewMaterialRequisition: React.FC = () => {

    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { projectId } = useProject();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const systemGeneratedCode = listState.SystemGeneratedCode;
    const [isEditModalOpen, setEditIsModalOpen] = useState(false);

    const MaterialRequisitionTabList = [
        { id: 'Overview', label: 'Overview' },
        { id: 'Details', label: 'Details' },
        { id: 'Finalize Vendor', label: 'Finalize Vendor' },
        { id: 'Purchase Order', label: 'Purchase Order' },
        { id: 'GRN', label: 'GRN' },
        { id: 'Invoice', label: 'Invoice' },
    ];

    const [activeTab, setActiveTab] = useState(MaterialRequisitionTabList[0].id);
    const handleBackToListMaterialRequisition = () => {
        navigate('/materialRequisition');
    };

    useEffect(() => {
        if (!projectId || !currentMaterialRequisitionId || currentMaterialRequisitionId === 0) return;
        loadMaterialRequisition()
    }, [projectId, currentMaterialRequisitionId, addToast]);

    const CopyMaterialRequisitionFormData = (): FormData => {
        const fd = new FormData();
        fd.append("ProjectId", Number(projectId).toString());
        fd.append("MaterialRequisitionId", "0");
        fd.append("Uniquekey", matrialRequisitionData?.Uniquekey ?? '');
        fd.append("Remarks", matrialRequisitionData?.Remarks ?? '');
        fd.append("IsSplit", "false");
        fd.append("IsCopy", "true");
        fd.append("MaterialRequisitionDetailJSON", JSON.stringify(
            matrialRequisitionDetailData.map(item => ({
                MaterialRequisitionDetailId: 0,
                MaterialMasterId: item.MaterialMasterId,
                MaterialQuantity: item.MaterialQuantity,
                UomMasterId: item.UomMasterId,
                RequiredDate: item.RequiredDate,
                SubMaterialMasterId: item.SubMaterialMasterId,
            }))
        ));
        return fd;
    };

    const loadMaterialRequisition = async () => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisition = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                };
                const response = await materialRequisitionService.apiCallPullMaterialRequisition(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    const item = Array.isArray(data) ? data[0] : data;

                    setMaterialRequisitionData(item ?? null);

                    setMaterialRequisitionDetailData(item?.MaterialRequisitionDetailData ?? []);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            });
    }

    const handleCopyMaterialRequisition = async (e: React.FormEvent) => {
        e.preventDefault();
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = CopyMaterialRequisitionFormData();

                const response = await materialRequisitionService.apiCallToAddMaterialRequisition(payload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    navigate("/materialRequisition");

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Copy Material Requisition'
        );
    };

    const handleEditRequisitionModal = () => {
        setEditIsModalOpen(false)
    }

    const handleOpenRequisitionModal = () => {
        setEditIsModalOpen(true)
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>
            <div className="flex justify-between">
                <HeaderActionBar
                    titleText={systemGeneratedCode ?? "-"}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() => handleBackToListMaterialRequisition()}
                />

                {matrialRequisitionData?.IsCopy && (
                    <Button
                        size="sm"
                        color="transparent"
                        style={{
                            color: '#135BEC',
                            padding: '4px 8px',
                            backgroundColor: '#DBEAFE'
                        }}
                        onClick={() => {
                            handleOpenRequisitionModal();
                        }}
                    >
                        <Copy className="h-4 w-4" color="blue" />
                        Copy Entry
                    </Button>
                )}
            </div>

            <div className="pt-3 pb-3">
                <Tabs
                    tabs={MaterialRequisitionTabList}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => setActiveTab(t.id)}
                />
            </div>

            {activeTab === 'Details' && <Details />}
            {activeTab === 'Overview' && <Overview />}
            {activeTab === 'Invoice' && <Invoice />}
            {activeTab === 'Purchase Order' && <PurchaseOrder />}
            {activeTab === 'GRN' && <GRN />}

            <Modal
                isOpen={isEditModalOpen}
                title={" Material Requisition Details"}
                onClose={handleEditRequisitionModal}
                onSubmit={handleCopyMaterialRequisition}
                saveText={"save"}
                loading={isLoading}
                size="half-screen"
            >
                <div>

                </div>
            </Modal>
        </div>
    );
};

export default ViewMaterialRequisition;
