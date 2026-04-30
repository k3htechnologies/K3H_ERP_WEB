import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { useEffect, useRef, useState } from "react";
import type { AddUpdateMaterialRequisitionPurchaseOrder, DeleteMaterialRequisitionPurchaseOrder, FilterWithPaginationMaterialRequisitionPurchaseOrder, GenerateMaterialRequisitionPurchaseOrderPdfData, MaterialRequisitionPurchaseOrderData } from "@/features/materialRequisition/models/MaterialRequisitionPurchaseOrderModel";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { useParams } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { materialRequisitionPurchaseOrderService } from "@/features/materialRequisition/services/MaterialRequisitionPurchaseOrderService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { FileText, Maximize2, Minimize2 } from "lucide-react";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { fetchTncMasterDropdown } from "@/features/tnc/tncDropDown";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import RichTextEditor from "@/ui/components/forms/RichTextEditor";

const initialFormState = (): GenerateMaterialRequisitionPurchaseOrderPdfData => ({
    MaterialRequisitionId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    Remarks: '',
    TermsCondition: ''
})

const InitialFormState = (): AddUpdateMaterialRequisitionPurchaseOrder => ({
    MaterialRequisitionPurchaseOrderId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    MaterialRequisitionId: 0,
    PurchaseOrderURL: '',
    RemovePurchaseOrderURL: ''
})

export const PurchaseOrder: React.FC = () => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [materialRequisitionPurchaseOrder, setMaterialRequisitionPurchaseOrder] = useState<MaterialRequisitionPurchaseOrderData[]>([])
    const [formData, setFormData] = useState<GenerateMaterialRequisitionPurchaseOrderPdfData>(() => initialFormState());
    const [uploadData,] = useState<AddUpdateMaterialRequisitionPurchaseOrder>(() => InitialFormState());
    const { projectId } = useProject();
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteGeneratePurchaseOrderData, setDeleteGeneratePurchaseOrderData] = useState<MaterialRequisitionPurchaseOrderData | null>(null)
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (!projectId) return
        loadPurchaseOrder();
    }, [projectId, currentMaterialRequisitionId])

    const loadPurchaseOrder = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionPurchaseOrder = {
                    PageNumber: 1,
                    PageSize: 10,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey
                }
                const response = await materialRequisitionPurchaseOrderService.apiCallPullMaterialRequisitionPurchaseOrder(params);

                if (E.isRight(response)) {

                    setMaterialRequisitionPurchaseOrder(response.right.Data);
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
            "Loading Purchase Order ",
        );
    };

    //#region FETCH TNC DROPDOWN WITH MODULE NAME
    const fetchTncByModuleName = (moduleName: string) => (page: number, params?: { value?: string }) =>
        fetchTncMasterDropdown(page, {
            value: params?.value || "",
            moduleName: moduleName,
        });
    //#endregion

    const handleFieldChange = (field: keyof GenerateMaterialRequisitionPurchaseOrderPdfData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleGeneratepurchaseorder = () => {
        setDeleteGeneratePurchaseOrderData(null);
        setFormData(initialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    const validateGeneratePurchaseOrderForm = (): {

        isValid: boolean
        errors: { [key: string]: string }
    } => {

        const newErrors: { [key: string]: string } = {}

        if (!formData.Remarks?.trim()) {
            newErrors.Remarks = "Remarks is required.";
        }

        if (!formData.TermsCondition?.trim()) {
            newErrors.TermsCondition = "Terms & Condition is required.";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const PushGeneratePurchaseOrderFormData = (): GenerateMaterialRequisitionPurchaseOrderPdfData => {
        return {
            MaterialRequisitionId: Number(currentMaterialRequisitionId),
            Uniquekey: currentUniquekey ?? '',
            Remarks: formData.Remarks,
            TermsCondition: formData.TermsCondition,
            ProjectId: Number(projectId),
        };
    };

    const handleGeneratePurchaseOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateGeneratePurchaseOrderForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushGeneratePurchaseOrderFormData();

                const response = await materialRequisitionPurchaseOrderService.apiCallGenerateMaterialRequisitionPurchaseOrderPdf(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    loadPurchaseOrder()

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

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
            'Generate Purchase Order'
        )
    };

    const handleUploadPurchaseOrder = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fd = new FormData();
        fd.append("MaterialRequisitionPurchaseOrderId", uploadData.MaterialRequisitionPurchaseOrderId.toString());
        fd.append("Uniquekey", uploadData.Uniquekey ?? "");
        fd.append("ProjectId", projectId!.toString());
        fd.append("MaterialRequisitionId", (currentMaterialRequisitionId ?? 0).toString());
        fd.append("PurchaseOrderURL", file);

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await materialRequisitionPurchaseOrderService.apiCallAddUpdateMaterialRequisitionPurchaseOrder(fd);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    loadPurchaseOrder();

                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Uploading Purchase Order"
        );
    };

    const handleDeleteGeneratePurchaseOrder = async () => {

        setIsConfirmationDialogBoxOpen(false);
        if (!deleteGeneratePurchaseOrderData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteMaterialRequisitionPurchaseOrder = {
                    MaterialRequisitionId: deleteGeneratePurchaseOrderData.MaterialRequisitionId || 0,
                    MaterialRequisitionPurchaseOrderId: deleteGeneratePurchaseOrderData.MaterialRequisitionPurchaseOrderId || 0,
                    Uniquekey: deleteGeneratePurchaseOrderData.Uniquekey || "",
                    ProjectId: Number(projectId)
                };

                const response = await materialRequisitionPurchaseOrderService.apiCallDeleteMaterialRequisitionPurchaseOrder(params);

                if (E.isRight(response)) {

                    loadPurchaseOrder();

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteGeneratePurchaseOrderData(null);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Purchase Order"
        );
    };

    const handleConfirmationDialogBoxOpen = (record: MaterialRequisitionPurchaseOrderData) => {
        setDeleteGeneratePurchaseOrderData(record);
        setIsConfirmationDialogBoxOpen(true);
    }

    const hasPurchaseOrder = materialRequisitionPurchaseOrder.length > 0 &&
        !!materialRequisitionPurchaseOrder[0];

    const isPdf = (url: string) => url.toLowerCase().includes(".pdf") || url.startsWith("blob:");

    return (
        <div className="bg-white p-1 h-[500px]">
            <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>

            <div className="flex justify-end gap-2">
                {!hasPurchaseOrder && (
                    <>
                        <Button
                            color="blue"
                            variant="solid"
                            colorMode="extraLight"
                            onClick={handleGeneratepurchaseorder}
                            leftIcon={<FileText size={14} />}>
                            Generate PO
                        </Button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleUploadPurchaseOrder}
                        />

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            color="blue"
                            size="mxs"
                            variant="solid"
                            colorMode="gradient_dark"
                            defineWidth
                            style={{ width: '100px' }}
                        >
                            Upload PO
                        </Button>
                    </>
                )}
            </div>

            {hasPurchaseOrder && (
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1 mt-1 mb-4 ">
                    <div className="flex justify-between">
                        <h2 className="text-lg font-semibold mb-2">Purchase Order File</h2>
                        <button
                            onClick={() => setIsMaximized(true)}
                            className="px-2 py-2 mb-2 hover:bg-gray-100 rounded"
                        >
                            <Maximize2 className="h-5 w-5 text-gray-700" />
                        </button>
                    </div>

                    <div className="h-[400px]">
                        {isPdf(materialRequisitionPurchaseOrder[0].PurchaseOrderURL ?? '') && (
                            <iframe
                                src={materialRequisitionPurchaseOrder[0].PurchaseOrderURL ?? ''}
                                className="w-full h-full"
                                title="pdf-preview"
                            />
                        )}
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">
                            Created By {materialRequisitionPurchaseOrder[0].CreatedBy || "-"} on{" "}
                            {materialRequisitionPurchaseOrder[0].CreatedDate
                                ? formatDate_dd_MonthName_yy(materialRequisitionPurchaseOrder[0].CreatedDate)
                                : "-"}
                        </span>
                    </div>

                    <div className="absolute bottom-4 right-10">
                        <Button
                            color="red"
                            variant="solid"
                            onClick={() =>
                                handleConfirmationDialogBoxOpen(materialRequisitionPurchaseOrder[0])
                            }
                            className="px-4 py-2 rounded-md"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            )}

            {isMaximized && (
                <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
                    <div className="w-full h-full bg-white flex flex-col">
                        <div className="flex justify-between items-center p-3 border-b">
                            <h2 className="font-semibold">Purchase Order File</h2>
                            <button
                                onClick={() => setIsMaximized(false)}
                                className="px-2 py-2 hover:bg-gray-100 rounded"
                            >
                                <Minimize2 className="h-5 w-5 text-gray-700" />
                            </button>
                        </div>

                        <div className="flex-1">
                            <iframe
                                src={materialRequisitionPurchaseOrder[0].PurchaseOrderURL ?? ''}
                                className="w-full h-full"
                                title="pdf-preview"
                            />
                        </div>

                    </div>
                </div>
            )}

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title={'Purchase Order'}
                onSubmit={handleGeneratePurchaseOrder}
                saveText={'Save'}
                cancelText="Cancel"
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <Input
                                label='Remarks'
                                required
                                type="text"
                                value={formData.Remarks ?? ''}
                                onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                                error={errors.Remarks}
                                maxLength={250}
                                placeholder="Enter Remarks"
                            />
                        </div>

                        <div>
                            <SingleSelectDropdownWithPagination
                                label="Term & Condition"
                                title="Term & Condition"
                                size="lg"
                                dataFetchCallBack={fetchTncByModuleName("Material Requisition")}
                                onSelected={(item) => handleFieldChange("TermsCondition", item?.value)}
                                error={errors.TermsCondition}
                            />
                        </div>

                        {formData?.TermsCondition && (
                            <div>
                                <RichTextEditor
                                    value={formData.TermsCondition}
                                    onChange={(e) => handleFieldChange("TermsCondition", e)}
                                    readOnly
                                    className="overflow-y-auto thin-scroll h-[250px]"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteGeneratePurchaseOrderData(null);
                }}
                onConfirm={handleDeleteGeneratePurchaseOrder}
                loading={isLoading}
                pageName='Purchase Order'
            />
        </div>
    )
}
export default PurchaseOrder;