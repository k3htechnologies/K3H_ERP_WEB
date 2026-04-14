import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { useEffect, useState } from "react";
import type { DeleteMaterialRequisitionPurchaseOrder, FilterWithPaginationMaterialRequisitionPurchaseOrder, GenerateMaterialRequisitionPurchaseOrderPdfData, MaterialRequisitionPurchaseOrderData } from "../models/MaterialRequisitionPurchaseOrderModel";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import { useParams } from "react-router-dom";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { materialRequisitionPurchaseOrderService } from "../services/MaterialRequisitionPurchaseOrderService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import usePagination from "@/core/hooks/usePagination";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import { FileText } from "lucide-react";

const initialFormState = (): GenerateMaterialRequisitionPurchaseOrderPdfData => ({
    MaterialRequisitionId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    Remarks: '',
    TermsCondition: ''
})
export const PurchaseOrder: React.FC = () => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [materialRequisitionPurchaseOrder, setMaterialRequisitionPurchaseOrder] = useState<MaterialRequisitionPurchaseOrderData[]>([])
    const [formData, setFormData] = useState<GenerateMaterialRequisitionPurchaseOrderPdfData>(() => initialFormState());
    const { projectId } = useProject();

    const { canAction } = useMenuPermissions();

    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const { pagination, setPagination } = usePagination(20);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteGeneratePurchaseOrderData, setDeleteGeneratePurchaseOrderData] = useState<MaterialRequisitionPurchaseOrderData | null>(null)
    const [generatePurchaseOrderPdfList, setGeneratePurchaseOrderPdfList] = useState<GenerateMaterialRequisitionPurchaseOrderPdfData[]>([])
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;

    useEffect(() => {
        if (!projectId) return
        loadPurchaseOrder();
    }, [projectId])

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
    //#endregion

    const handleGeneratepurchaseorder = () => {
        setDeleteGeneratePurchaseOrderData(null);
        setFormData(initialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
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

    //PUSH FORM DATA
    const PushGeneratePurchaseOrderFormData = (): GenerateMaterialRequisitionPurchaseOrderPdfData => {
        return {
            MaterialRequisitionId: Number(currentMaterialRequisitionId),
            Uniquekey: formData.Uniquekey,
            Remarks: formData.Remarks,
            TermsCondition: formData.TermsCondition,
            ProjectId: Number(projectId),
        };
    };

    // GENERATE PURCHASE ORDER
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

    //#region DELETE PURCHASE ORDER
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
                    ProjectId: deleteGeneratePurchaseOrderData.ProjectId || 0
                };

                const response = await materialRequisitionPurchaseOrderService.apiCallDeleteMaterialRequisitionPurchaseOrder(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (materialRequisitionPurchaseOrder.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await loadPurchaseOrder();

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
    //#endregion

    return (
        <div className="bg-white p-6 h-[500px]">
            <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>

            <div className="flex justify-end gap-2">
                <Button
                    color="blue"
                    variant="solid"
                    colorMode="extraLight"
                    onClick={() => {
                        handleGeneratepurchaseorder()
                    }}
                    leftIcon={<FileText size={14} />}>
                    Generate PO

                </Button>

                <Button
                    onClick={() => {

                    }}
                    color="blue"
                    size="mxs"
                    variant="solid"
                    colorMode="gradient_dark"
                    defineWidth
                    style={{ width: '100px' }}
                >
                    Upload PO
                </Button>

            </div>
            {/* GENERATE PURCHASE ORDER MODAL */}

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

            {/* DELETE CONFIRMATION MODAL */}
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