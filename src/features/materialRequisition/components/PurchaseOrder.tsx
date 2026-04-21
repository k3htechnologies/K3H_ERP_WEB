import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { useEffect, useRef, useState } from "react";
import type { AddUpdateMaterialRequisitionPurchaseOrder, DeleteMaterialRequisitionPurchaseOrder, FilterWithPaginationMaterialRequisitionPurchaseOrder, GenerateMaterialRequisitionPurchaseOrderPdfData, MaterialRequisitionPurchaseOrderData } from "../models/MaterialRequisitionPurchaseOrderModel";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import { useParams } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { materialRequisitionPurchaseOrderService } from "../services/MaterialRequisitionPurchaseOrderService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import usePagination from "@/core/hooks/usePagination";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { FileText } from "lucide-react";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

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
    const [uploadData, setUploadData] = useState<AddUpdateMaterialRequisitionPurchaseOrder>(() => InitialFormState());
    const { projectId } = useProject();
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const { pagination, setPagination } = usePagination(20);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteGeneratePurchaseOrderData, setDeleteGeneratePurchaseOrderData] = useState<MaterialRequisitionPurchaseOrderData | null>(null)
    const [generatePurchaseOrderPdfList, setGeneratePurchaseOrderPdfList] = useState<GenerateMaterialRequisitionPurchaseOrderPdfData[]>([])
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            newErrors.TermsCondition = "Terms Condition is required.";
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

                    const isAdd = formData.MaterialRequisitionId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as GenerateMaterialRequisitionPurchaseOrderPdfData

                        loadPurchaseOrder()
                        setGeneratePurchaseOrderPdfList(prevData => [newRecord, ...prevData]);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    } else {

                        const updatedRecord = response.right.Data[0] as GenerateMaterialRequisitionPurchaseOrderPdfData;

                        setGeneratePurchaseOrderPdfList(prevData =>
                            prevData.map(item =>
                                item.MaterialRequisitionId === formData.MaterialRequisitionId
                                    ? updatedRecord
                                    : item
                            )
                        )
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
            'Generate Purchase Order'
        )
    };

    // //PUSH FORM DATA
    // const PushUploadPurchaseOrderFormData = (e: any): FormData => {
    //     const file = e.target.files?.[0];
    //     const fd = new FormData();
    //     fd.append("MaterialRequisitionPurchaseOrderId", uploadData.MaterialRequisitionPurchaseOrderId.toString());
    //     fd.append("Uniquekey", uploadData.Uniquekey ?? "");
    //     fd.append("ProjectId", projectId!.toString());
    //     fd.append("MaterialRequisitionId", (currentMaterialRequisitionId ?? 0).toString());
    //     fd.append("PurchaseOrderURL", file);

    //     return fd;
    // };

    // // UPLOAD PURCHASE ORDER
    // const handleUploadPurchaseOrder = async () => {
    //     await runApiWithLoader(
    //         setIsLoading,
    //         setLoadingMessage,
    //         async () => {

    //             const payload = PushUploadPurchaseOrderFormData();

    //             const response = await materialRequisitionPurchaseOrderService.apiCallAddUpdateMaterialRequisitionPurchaseOrder(payload);

    //             if (E.isRight(response)) {

    //                 addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

    //                 loadPurchaseOrder();

    //             } else {
    //                 addToast({ type: "error", title: response.left.message });
    //             }
    //             return response;
    //         },
    //         undefined,
    //         (error: any) => {
    //             addToast({ type: "error", title: error.message });
    //         },
    //         undefined,
    //         "Loading Purchase Order ",
    //     );
    // };

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
                <div className="bg-white-100 p-1 rounded-lg shadow-md relative">

                    {/* HEADER */}
                    <h2 className="text-lg font-semibold mb-4">Purchase Order File</h2>
                    <div className="inline-flex items-end gap-1 px-2 py-2 border border-blue-500 text-blue-600 rounded mt-2 text-sm font-medium cursor-pointer hover:bg-blue-50 transition">
                        <p>Document</p>
                        <MultiImageViewer
                            images={parseDocumentUrls(
                                materialRequisitionPurchaseOrder[0].PurchaseOrderURL ?? ''
                            )}
                            title="Purchase Order"
                            isIcon={false}
                            triggerLabel="Document"
                        />
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">
                            Created By {materialRequisitionPurchaseOrder[0].CreatedBy || "-"} on{" "}
                            {materialRequisitionPurchaseOrder[0].CreatedDate
                                ? formatDate_dd_MonthName_yy(materialRequisitionPurchaseOrder[0].CreatedDate)
                                : "-"}
                        </span>
                    </div>

                    <div className="absolute bottom-4 right-4">
                        <Button
                            color="red"
                            variant="solid"
                            onClick={() =>
                                handleConfirmationDialogBoxOpen(
                                    materialRequisitionPurchaseOrder[0]
                                )
                            }
                            className="px-4 py-2 rounded-md"
                        >
                            Delete
                        </Button>
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
                            <Input
                                label='Terms Condition'
                                required
                                type="text"
                                value={formData.TermsCondition ?? ''}
                                onChange={(e) => handleFieldChange("TermsCondition", e.target.value)}
                                error={errors.TermsCondition}
                                maxLength={250}
                                placeholder="Enter Terms Condition"
                            />
                        </div>
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