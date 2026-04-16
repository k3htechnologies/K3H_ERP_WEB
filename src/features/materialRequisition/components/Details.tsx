import { runApiWithLoader } from "@/core/utils";
import { useEffect, useState } from "react";
import type { DeleteMaterialRequisitionRequest, FilterWithPaginationMaterialRequisition, MaterialRequisitionData, MaterialRequisitionDetailData } from "../models/MaterialRequisitionModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import { Loader } from "@/core/utils/loader";
import { useNavigate, useParams } from "react-router-dom";
import type { FilterInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Modal } from "@/ui/components/Modal/Modal";
import Checkbox from "@/ui/components/forms/Checkbox";
import { X } from "lucide-react";
import { ConfirmationDialogBox } from "@/core/utils/confirmationDialogBox";
import { Button } from "@/ui/components/forms";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

export const Details: React.FC = () => {
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [materialRequisitionList, setMaterialRequisitionList] = useState<MaterialRequisitionData[]>([]);
    const [active, setActive] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectedMaterialRequisitionItem, setSelectedMaterialRequisitionItem] = useState<DeleteMaterialRequisitionRequest | null>(null);
    const [isCloseRequisitionDialogOpen, setIsCloseRequisitionDialogOpen] = useState(false);

    const { projectId } = useProject();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;

    useEffect(() => {
        if (!projectId) return;
        fetchDetailsdata();
    }, [projectId, currentMaterialRequisitionId])

    const navigate = useNavigate();

    const fetchDetailsdata = async (filterParams?: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisition = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    MaterialRequisitionStatus: filterParams?.MaterialRequisitionStatus ?? undefined,
                    MaterialRequisitionStage: filterParams?.MaterialRequisitionStage ?? undefined,
                    FromDate: filterParams?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
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

    //PUSH FORM DATA
    const PushMaterialRequisitionFormData = (): FormData => {
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

    // SPLIT MATERIAL REQUISITION 
    const handleSplitMaterialRequisition = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedIds.length === 0) {
            addToast({ type: "error", title: "Please select at least one material" });
            return;
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushMaterialRequisitionFormData();

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


    const selectedMaterials = matrialRequisitionDetailData.filter(item =>
        selectedIds.includes(item.MaterialRequisitionDetailId)
    );

    const handleCopyMaterialRequisition = async (e: React.FormEvent) => {
        e.preventDefault();

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = CopyMaterialRequisitionFormData();

                const response = await materialRequisitionService.apiCallToAddMaterialRequisition(payload);

                if (E.isRight(response)) {

                    const newRecord = response.right.Data as MaterialRequisitionData;

                    setMaterialRequisitionList(prev => [newRecord, ...prev]);

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

    //#region CLOSE MATERIAL REQUISITION
    const handleCloseRequisition = async () => {
        if (!selectedMaterialRequisitionItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: DeleteMaterialRequisitionRequest = {

                    MaterialRequisitionId: selectedMaterialRequisitionItem.MaterialRequisitionId,
                    Uniquekey: selectedMaterialRequisitionItem.Uniquekey,
                    ProjectId: Number(projectId),
                }

                const response = await materialRequisitionService.apiCallCloseMaterialRequisition(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0], });
                    setIsCloseRequisitionDialogOpen(false);

                    fetchDetailsdata();

                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Closing Requisition",
        );
    };

    //#region
    return (
        <div className="justify-center">

            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="flex justify-end pb-2">
                <Button
                    size="sm"
                    color="transparent"
                    style={{
                        color: 'red',
                        padding: '4px 8px',
                        backgroundColor: '#FFF2F2'
                    }}
                    onClick={() => {
                        setSelectedMaterialRequisitionItem(matrialRequisitionData);
                        setIsCloseRequisitionDialogOpen(true);
                    }}
                >
                    <X className="h-4 w-4" color="red" />
                    Close Requisition
                </Button>
            </div>

            <div className="gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <h1 className="text-lg font-semibold text-gray-900 pb-2">Basic Details</h1>

                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FieldItem label="Unique ID" value={matrialRequisitionData?.SystemGeneratedCode} />
                        <FieldItem label="Status" value={matrialRequisitionData?.MaterialRequisitionStatus} />
                        <FieldItem label="Stage" value={matrialRequisitionData?.MaterialRequisitionStage} />
                        <div>
                            <p className="text-gray-500">Attachment</p>
                            <MultiImageViewer
                                images={parseDocumentUrls(matrialRequisitionData?.PurchaseOrderURL)}
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

                    <button
                        className="bg-blue-600 text-white font-bold py-1 p-4 rounded-md"
                        onClick={() => setActive(true)}
                    >
                        Split
                    </button>

                </div>

                <div className="lg:col-span-5 pb-3 overflow-y-auto thin-scroll h-[250px]">
                    {matrialRequisitionDetailData.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-gray-200 rounded-lg p-4 mt-2 ">
                            {active && (
                                <Checkbox
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
                            <FieldItem label="Name" value={item.MaterialName} />
                            <FieldItem label="Sub Material Name" value={<TooltipText text={item.SubMaterialName ?? ''} />} />
                            <FieldItem label="Uom" value={item.Uom} />
                            <FieldItem label="Quantity" value={item.MaterialQuantity} />
                            <FieldItem label="Required Date" value={formatDate_dd_MonthName_yy(item.RequiredDate)} />
                        </div>
                    ))}
                </div>

                {active && (
                    <button
                        className="bg-blue-600 text-white font-bold py-1 px-4 rounded-md"
                        onClick={() => {
                            setIsAddUpdateModalOpen(true);
                        }}
                    >
                        Split All
                    </button>
                )}
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
                <button
                    className="bg-gray-400 text-white font-bold py-1 px-4 rounded-md"
                >
                    Close
                </button>

                <button
                    className="bg-green-600 text-white font-bold py-1 px-4 rounded-md"
                    onClick={(e) => {
                        handleCopyMaterialRequisition(e);
                    }}
                >
                    Copy
                </button>
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
                                onChange={() => {
                                    setSelectedIds(prev =>
                                        prev.includes(item.MaterialRequisitionDetailId)
                                            ? prev.filter(id => id !== item.MaterialRequisitionDetailId)
                                            : [...prev, item.MaterialRequisitionDetailId]
                                    );
                                }}
                            />
                            <p className="font-semibold">{item.SubMaterialName}</p>
                        </div>
                    ))}
                </div>
            </Modal>

            {/*Close Requisition Confirmation Dialog Box*/}

            <ConfirmationDialogBox
                isOpen={isCloseRequisitionDialogOpen}
                onClose={() => {
                    setIsCloseRequisitionDialogOpen(false);
                    setSelectedMaterialRequisitionItem(null);
                }}
                onConfirm={handleCloseRequisition}
                title="Close Requisition"
                message={`Are you sure you want to close this requisition?`}
                confirmText="Close"
                cancelText="Cancel"
                loading={isLoading}
            />
        </div>
    )
}
export default Details;