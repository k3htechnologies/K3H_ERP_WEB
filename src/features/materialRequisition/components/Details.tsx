import { runApiWithLoader } from "@/core/utils";
import { useEffect, useState } from "react";
import type { DeleteMaterialRequisitionRequest, FilterWithPaginationMaterialRequisition, MaterialRequisitionData, MaterialRequisitionDetailData } from "../models/MaterialRequisitionModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import { Loader } from "@/core/utils/loader";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Modal } from "@/ui/components/Modal/Modal";
import Checkbox from "@/ui/components/forms/Checkbox";
import { Button } from "@/ui/components/forms";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";

export const Details: React.FC = () => {
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [, setMaterialRequisitionList] = useState<MaterialRequisitionData[]>([]);
    const [isDeleteRequisitionDialogOpen, setIsDeleteRequisitionDialogOpen] = useState(false);
    const [active, setActive] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteData, setDeleteData] = useState<MaterialRequisitionData | null>(null)
    const { projectId } = useProject();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const navigate = useNavigate();

    useEffect(() => {
        if (!projectId) return;
        fetchDetailsdata();
    }, [projectId, currentMaterialRequisitionId])

    const fetchDetailsdata = async () => {
        await runApiWithLoader(
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

                    setMaterialRequisitionData(Array.isArray(data) ? (data[0] ?? null) : data);

                    const Item = Array.isArray(data) ? data[0] : data;

                    setMaterialRequisitionDetailData(Item?.MaterialRequisitionDetailData ?? []);
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
            "Loading Material Requisition",
        );
    };

    const PushSplitMaterialRequisitionFormData = (): FormData => {
        const fd = new FormData();

        fd.append("ProjectId", Number(projectId).toString());
        fd.append("MaterialRequisitionId", "0");
        fd.append("Uniquekey", matrialRequisitionData?.Uniquekey ?? '');
        fd.append("Remarks", matrialRequisitionData?.Remarks ?? '');
        fd.append("IsSplit", "true");
        fd.append("IsCopy", "false");
        fd.append("MaterialRequisitionDetailJSON", JSON.stringify(matrialRequisitionDetailData
            .filter(item => selectedIds.includes(item.MaterialRequisitionDetailId))
            .map(item => ({
                MaterialRequisitionDetailId: item.MaterialRequisitionDetailId,
                MaterialMasterId: item.MaterialMasterId,
                MaterialQuantity: item.MaterialQuantity,
                UomMasterId: item.UomMasterId,
                RequiredDate: item.RequiredDate,
                SubMaterialMasterId: item.SubMaterialMasterId,
            }))
        ));

        return fd;
    };

    const handleSplitMaterialRequisition = async (e: React.FormEvent) => {
        e.preventDefault();

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushSplitMaterialRequisitionFormData();

                const response = await materialRequisitionService.apiCallToAddMaterialRequisition(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const newRecord = response.right.Data as MaterialRequisitionData;

                    setSelectedIds([]);

                    setActive(false);

                    fetchDetailsdata();

                    setMaterialRequisitionList(prev => [newRecord, ...prev]);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    navigate("/materialRequisition");

                } else {

                    addToast({ type: "error", title: response.left?.message });

                    setIsAddUpdateModalOpen(false)
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Split Material Requisition'
        );
    };

    const handleDeleteRequest = async () => {
        if (!deleteData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: DeleteMaterialRequisitionRequest = {
                    MaterialRequisitionId: deleteData.MaterialRequisitionId,
                    Uniquekey: deleteData.Uniquekey,
                    ProjectId: Number(projectId)
                };

                const response = await materialRequisitionService.apiCallDeleteMaterialRequisition(payload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });

                    navigate("/materialRequisition");

                    setIsDeleteRequisitionDialogOpen(false);

                    fetchDetailsdata();
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsDeleteRequisitionDialogOpen(false)
                }
                setDeleteData(null)
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Deleting Requisition'
        );
    };

    const selectedMaterials = matrialRequisitionDetailData.filter(item =>
        selectedIds.includes(item.MaterialRequisitionDetailId)
    );

    return (
        <div className="justify-center">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-4 mt-2">
                <h1 className="text-lg font-semibold text-gray-900 pb-2">Basic Details</h1>
                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FieldItem label="Unique ID" value={matrialRequisitionData?.SystemGeneratedCode} />
                        <FieldItem label="Status" value={matrialRequisitionData?.MaterialRequisitionStatus} />
                        <FieldItem label="Stage" value={matrialRequisitionData?.MaterialRequisitionStage} />

                        <div>
                            <p className="text-gray-500">Attachment</p>
                            <MultiImageViewer
                                images={parseDocumentUrls(matrialRequisitionData?.AttachmentsURL ?? '')}
                                title="Attachment"
                                isIcon={false}
                                triggerLabel="-"
                            />
                        </div>

                    </div>
                </div>
            </div>

            <div className=" gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="flex justify-between">
                    <h1 className="text-lg font-semibold text-gray-900 pb-2">Material Details</h1>

                    {matrialRequisitionData?.IsSplit && (
                        <Button
                            size="md"
                            color="transparent"
                            style={{
                                color: '#FFFFFF',
                                padding: '4px 8px',
                                backgroundColor: '#135BEC'
                            }}
                            onClick={() => setActive(true)}
                        >
                            Split
                        </Button>
                    )}
                </div>

                <div className="lg:col-span-5 pb-3 overflow-y-auto thin-scroll h-[250px]">
                    {matrialRequisitionDetailData.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 bg-gray-200 rounded-lg p-2 mt-2"
                        >
                            {active && (
                                <Checkbox size="sm"
                                    checked={selectedIds.includes(item.MaterialRequisitionDetailId)}
                                    onChange={() => {
                                        setSelectedIds(prev =>
                                            prev.includes(item.MaterialRequisitionDetailId)
                                                ? prev.filter(id => id !== item.MaterialRequisitionDetailId)
                                                : [...prev, item.MaterialRequisitionDetailId]
                                        );
                                    }}
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
                                <FieldItem label="Name" value={item.MaterialName} />
                                <FieldItem label="Sub-Material Name" value={<TooltipText text={item.SubMaterialName ?? ''} />} />
                                <FieldItem label="Uom" value={item.Uom} />
                                <FieldItem label="Quantity" value={item.MaterialQuantity} />
                                <FieldItem label="Required Date" value={formatDate_dd_MonthName_yy(item.RequiredDate)} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    {active && (
                        <Button
                            size="md"
                            color="transparent"
                            style={{
                                color: '#FFFFFF',
                                padding: '4px 8px',
                                backgroundColor: '#135BEC'
                            }}
                            onClick={() => {
                                if (selectedIds.length === 0) {
                                    addToast({ type: "error", title: "Please select at least one material" });
                                    return;
                                }
                                setIsAddUpdateModalOpen(true);
                            }}
                        >
                            Save Split
                        </Button>
                    )}
                </div>
            </div>

            <div className=" gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <h1 className="text-lg font-semibold text-gray-900 pb-2">Remarks</h1>
                <span>{matrialRequisitionData?.Remarks}</span>
            </div>

            <div className="gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-1">
                <h1 className="text-lg font-semibold text-gray-900 pb-2">Action Details</h1>
                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <FieldItem label="Created By" value={matrialRequisitionData?.CreatedBy} />
                        <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.CreatedDate ?? '')} />
                        <FieldItem label="Modified By" value={matrialRequisitionData?.ModifiedBy} />
                        <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.ModifiedDate ?? '')} />
                    </div>
                </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
                <Button
                    size="md"
                    color="transparent"
                    style={{
                        color: '#1D1D1D',
                        padding: '4px 8px',
                        backgroundColor: '#D0D7DE'
                    }}
                    onClick={() => {
                        setDeleteData(matrialRequisitionData);
                        setIsDeleteRequisitionDialogOpen(true)
                    }}
                >
                    Delete
                </Button>
            </div>

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                }}
                title={'Split Material Entry'}
                onSubmit={handleSplitMaterialRequisition}
                saveText={'Move To New Entry '}
                loading={isLoading}
                cancelText="cancel"
                size="xl"
            >
                <div className="max-h-[400px] overflow-y-auto">

                    {selectedMaterials.map((item) => (
                        <div key={item.MaterialRequisitionDetailId} className="flex items-center gap-x-4">
                            <Checkbox
                                checked={selectedIds.includes(item.MaterialRequisitionDetailId)}
                            />
                            <p className="font-semibold">{item.SubMaterialName}</p>
                        </div>
                    ))}

                </div>
            </Modal>

            <ConfirmationDialogBox
                isOpen={isDeleteRequisitionDialogOpen}
                onClose={() => {
                    setIsDeleteRequisitionDialogOpen(false);
                    setDeleteData(null);
                }}
                onConfirm={handleDeleteRequest}
                title="Delete Requisition"
                message={`Are you sure you want to Delete this Material Requisition?`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
            />
        </div>
    )
}
export default Details;