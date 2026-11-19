import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { useMemo, useState } from "react";
import type { AddUpdateMaterialRequisitionPurchaseOrder, DeleteMaterialRequisitionPurchaseOrder, GenerateMaterialRequisitionPurchaseOrderPdfData, MaterialRequisitionPurchaseOrderData } from "@/features/materialRequisition/models/MaterialRequisitionPurchaseOrderModel";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { useParams } from "react-router-dom";
import { materialRequisitionPurchaseOrderService } from "@/features/materialRequisition/services/MaterialRequisitionPurchaseOrderService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button } from "@/ui/components/forms";
import { Copy, Info, Trash2 } from "lucide-react";
import { fetchTncMasterDropdown } from "@/features/tnc/tncDropDown";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import RichTextEditor from "@/ui/components/forms/RichTextEditor";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { TextArea } from "@/ui/components/forms/Textarea";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import type { MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { copyToClipboard, formatCurrency } from "@/core/utils/comman";
import { CustomTableRowSpan, type CustomTableRowSpanColumn } from "@/ui/components/DataTable/CustomTableRowSpan";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import Checkbox from "@/ui/components/forms/Checkbox";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { getRowSpan } from "@/ui/components/DataTable/DataTableRowSpan";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";

const initialFormState = (): GenerateMaterialRequisitionPurchaseOrderPdfData => ({
    MaterialRequisitionId: 0,
    MaterialRequisitionDetailId: "",
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    Remarks: '',
    TermsCondition: ''
})

const InitialFormState = (): AddUpdateMaterialRequisitionPurchaseOrder => ({
    MaterialRequisitionPurchaseOrderId: 0,
    MaterialRequisitionDetailId: "",
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    MaterialRequisitionId: 0,
    PurchaseOrderURL: '',
    RemovePurchaseOrderURL: ''
})

interface PurchaseOrderProps {
    onload?: () => Promise<void>;
    materialRequisitionDetailData: MaterialRequisitionDetailData[];
}

export const PurchaseOrder: React.FC<PurchaseOrderProps> = ({ onload, materialRequisitionDetailData }) => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const [formData, setFormData] = useState<GenerateMaterialRequisitionPurchaseOrderPdfData>(() => initialFormState());
    const [uploadData,] = useState<AddUpdateMaterialRequisitionPurchaseOrder>(() => InitialFormState());

    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteGeneratePurchaseOrderData, setDeleteGeneratePurchaseOrderData] = useState<MaterialRequisitionPurchaseOrderData | null>(null);
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.materialRequisitionId;
    const currentUniquekey = listState.uniquekey
    const projectId = listState.projectId;

    const { canAction: canGeneratePurchaseOrder } = useMenuPermissions('Generate Purchase Order');

    const [purchaseOrderFiles, setPurchaseOrderFiles] = useState<(File | string)[]>([]);
    const [removedPurchaseOrderUrls, setRemovedPurchaseOrderUrls] = useState<string[]>([]);
    const [purchaseOrderURL, setPurchaseOrderURL] = useState<string>();

    const [isUploadPO, setIsUploadPO] = useState(false);


    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const fetchTncByModuleName = (moduleName: string) => (page: number, params?: { value?: string }) =>
        fetchTncMasterDropdown(page, {
            value: params?.value || "",
            moduleName: moduleName,
        });


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

        if (!isUploadPO) {

            if (!formData.Remarks?.trim()) {
                newErrors.Remarks = "Remarks is required.";
            } else if (formData.Remarks.trim().length < 25) {
                newErrors.Remarks = "Remark must be at least 25 characters";
            }

            if (!formData.TermsCondition?.trim()) {
                newErrors.TermsCondition = "Terms & Condition is required.";
            }
        } else {
            if (!hasAnyDocumentFile(purchaseOrderFiles, purchaseOrderURL, removedPurchaseOrderUrls)) {
                newErrors.PurchaseOrderURL = "Purchase Order is required.";
            }
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
            MaterialRequisitionDetailId: selectedIds.join(",")
        };
    };

    const handleGeneratePurchaseOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedIds.length === 0) {
            addToast({ type: "error", title: "Please select at least one approved material" });
            return;
        }


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

                    setSelectedIds([]);

                    setIsAddUpdateModalOpen(false);

                    await onload?.();

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

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
            'Generate Purchase Order'
        )
    };

    const handleUploadPurchaseOrder = async (e: React.FormEvent) => {

        e.preventDefault();

        if (selectedIds.length === 0) {
            addToast({ type: "error", title: "Please select at least one approved material" });
            return;
        }


        setErrors({})
        const validation = validateGeneratePurchaseOrderForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        const fd = new FormData();
        fd.append("MaterialRequisitionPurchaseOrderId", uploadData.MaterialRequisitionPurchaseOrderId.toString());
        fd.append("Uniquekey", uploadData.Uniquekey ?? "");
        fd.append("ProjectId", projectId!.toString());
        fd.append("MaterialRequisitionId", (currentMaterialRequisitionId ?? 0).toString());
        fd.append("MaterialRequisitionDetailId", selectedIds.join(","))

        purchaseOrderFiles.forEach(file => {
            if (file instanceof File) { fd.append('PurchaseOrderURL', file); }
        });

        fd.append('RemovePurchaseOrderURL', removedPurchaseOrderUrls.join(','));

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await materialRequisitionPurchaseOrderService.apiCallAddUpdateMaterialRequisitionPurchaseOrder(fd);

                if (E.isRight(response)) {

                    setSelectedIds([]);

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsAddUpdateModalOpen(false);

                    await onload?.();

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

    const handleConfirmationDialogBoxOpen = (record: MaterialRequisitionPurchaseOrderData) => {
        setDeleteGeneratePurchaseOrderData(record);
        setIsConfirmationDialogBoxOpen(true);
    }


    const handleDeleteGeneratePurchaseOrder = async () => {

        setIsConfirmationDialogBoxOpen(false);
        if (!deleteGeneratePurchaseOrderData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteMaterialRequisitionPurchaseOrder = {
                    MaterialRequisitionId: Number(currentMaterialRequisitionId),
                    MaterialRequisitionPurchaseOrderId: deleteGeneratePurchaseOrderData.MaterialRequisitionPurchaseOrderId || 0,
                    Uniquekey: deleteGeneratePurchaseOrderData.Uniquekey || "",
                    ProjectId: Number(projectId)
                };

                const response = await materialRequisitionPurchaseOrderService.apiCallDeleteMaterialRequisitionPurchaseOrder(params);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteGeneratePurchaseOrderData(null);

                    await onload?.();

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

    const matrialRequisitionDetailColumns = useMemo<CustomTableRowSpanColumn[]>(() => {

        const isDirect = materialRequisitionDetailData?.[0]?.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        const columns: CustomTableRowSpanColumn[] = [];

        columns.push({
            key: "select",
            label: "",
            align: "center",
            width: "5",
            render: (_value, row) => {

                const id = Number(row.MaterialRequisitionDetailId);

                return (
                    <Checkbox
                        size="sm"
                        checked={Boolean(row.PurchaseOrderURL?.trim()) || selectedIds.includes(id)}
                        disabled={Boolean(row.PurchaseOrderURL?.trim())}
                        onChange={() => {
                            if (row.PurchaseOrderURL?.trim()) return;
                            setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                );
            },
        },
        );

        if (isDirect) {
            columns.push(

                {
                    key: "Level4Name",
                    label: "Sub Material",
                    align: "left",
                    width: "40",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="300px"
                            tooltipThreshold={40}
                            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                        />
                    )
                },

            );
        } else {
            columns.push(
                {
                    key: "MaterialName",
                    label: "Material",
                    align: "left",
                    width: "40",
                    render: (value, row) => (
                        <div className="flex flex-col items-start gap-0.5 w-max">

                            <span className="text-xs font-semibold text-slate-800">
                                {value || "-"}
                            </span>

                            {row.SubMaterialName && (
                                <span className="inline-block max-w-full rounded-sm bg-blue-50 px-1.5 py-0.5 text-[12px] leading-tight text-slate-500 whitespace-normal break-words">
                                    {row.SubMaterialName}

                                </span>
                            )}

                        </div>
                    )
                }

            );
        }


        columns.push(
            {
                key: "MaterialQuantity",
                label: "Quantity & Units",
                align: "left",
                width: "30",
                render: (value, row) => {
                    const quantity = value ?? 0;
                    const unit = isDirect ? row.Level4SubMaterialUomCode : row.UomCode;
                    return (
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap">
                            {quantity} {unit || ""}
                        </span>
                    );
                }
            },

            {
                key: "VendorDetailsGroup",
                label: "Vendor Details",
                align: "center",
                children: [
                    {
                        key: "VendorName",
                        label: "Vendor",
                        align: "left",
                        width: "40",
                        render: (value, row) => (
                            <div className="flex flex-col items-start gap-0.5">

                                <span className="text-xs font-semibold text-slate-800">
                                    {value || "-"}
                                </span>

                                {row.VendorCompanyName && (
                                    <span className="inline-block max-w-full rounded-sm bg-blue-50 px-1.5 py-0.5 text-[11px] leading-tight text-slate-500 whitespace-normal break-words">
                                        {row.VendorCompanyName}
                                    </span>
                                )}

                            </div>
                        )
                    },
                    {
                        key: "Amount",
                        label: "Amount (₹)",
                        align: "left",
                        width: "30",
                        render: (value) => formatCurrency(value) || 0
                    },
                ]
            },
            {
                key: 'POSystemGeneratedCode',
                label: 'PO Code',
                sortable: false,
                width: '20',
                fixed: 'left',
                align: 'left',
                render: (value) => {

                    if (!value?.trim()) {
                        return <span className="text-xs text-gray-400">-</span>;
                    }

                    return (
                        <div className="flex items-center gap-2">

                            <TooltipText
                                text={value || '-'}
                                maxWidth="180px"
                                tooltipThreshold={30}
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap" />

                            {value && (
                                <Button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const success = await copyToClipboard(value);
                                        if (success) {
                                            addToast({ type: 'success', title: `${value} Copied!` });
                                        }
                                    }}
                                    color="transparent"
                                    size="sm"
                                    style={{
                                        padding: '2px 6px',
                                        color: '#6B7280',
                                        cursor: 'pointer'
                                    }}
                                    title="Copy"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    );
                },
                rowSpan: (_row, index, data) => getRowSpan(data, index, ['POSystemGeneratedCode'])
            },
             {
                key: "PurchaseOrderCreatedBy",
                label: "Created By / Date",
                sortable: false,
                width: "20",
                fixed: "left",
                align: "left",
                render: (value, row) => (
                    <div className="flex flex-col items-start gap-1">

                        <span className="text-xs font-semibold text-slate-800">
                            {value || "-"}
                        </span>

                        {row.PurchaseOrderCreatedDate && (
                            <span className="inline-block rounded-sm bg-blue-50 px-1.5 py-0.5 text-[11px] leading-tight text-slate-500">
                                {formatDate_dd_MonthName_yy_hh_mm(row.PurchaseOrderCreatedDate)}
                            </span>
                        )}

                    </div>
                ),
                rowSpan: (_row, index, data) =>
                    getRowSpan(data, index, ["POSystemGeneratedCode"])
            },
            {
                key: "PurchaseOrderURL",
                label: "PO",
                width: "15",
                sortable: false,
                align: "left",
                fixed:"right",

                render: (value: string, row: any) => {

                    const hasPO = Boolean(value?.trim());

                    const canDeletePO = canGeneratePurchaseOrder && hasPO && Number(row.NumberOfGRN || 0) === 0;

                    return (
                        <div className="flex items-center gap-2">

                            {hasPO ? (
                                <>
                                    <MultiImageViewer
                                        images={parseDocumentUrls(row.PurchaseOrderURL)}
                                       title={row.POSystemGeneratedCode  ? `Purchase Order - ${row.POSystemGeneratedCode}` : "View"}
                                        isIcon={false}
                                        triggerLabel="Purchase Order"
                                    />

                                    {Number(row.NumberOfGRN || 0) === 0 && (
                                        <Button
                                            type="button"
                                            color="transparent"
                                            size="sm"
                                            disabled={!canDeletePO}
                                            style={{
                                                color: canDeletePO ? "#dc2626" : "#9CA3AF",
                                                padding: "4px 8px",
                                                cursor: canDeletePO ? "pointer" : "not-allowed",
                                                opacity: canDeletePO ? 1 : 0.5
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                handleConfirmationDialogBoxOpen(row);
                                            }}
                                            leftIcon={<Trash2 className="h-4 w-4" />}
                                        />
                                    )}
                                </>
                            ) : (
                                <span className="text-xs text-gray-400">-</span>
                            )}

                        </div>
                    );
                },

                rowSpan: (_row, index, data) => getRowSpan(data, index, ["PurchaseOrderURL"])
            },
           

        )
        return columns;
    }, [materialRequisitionDetailData, selectedIds]);

    return (
        <div className="bg-white p-1 w-full pt-5">
            <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>
            <CustomTableRowSpan
                columns={matrialRequisitionDetailColumns}
                data={materialRequisitionDetailData.filter(item => item.ApprovalStatus?.trim().toUpperCase() === "APPROVED")}
                emptyMessage="No Material Requisition Details Found"
                fixedHeight={true}
                className="flex-1"
            />

            {canGeneratePurchaseOrder && !["COMPLETED", "CLOSED"].includes(listState.materialRequisitionStatus?.toUpperCase()) &&
                (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-100 bg-blue-50/50 px-4 py-3 mt-4">

                            <div className="flex min-w-0 flex-1 items-start gap-2">
                                <Info size={15} className="mt-0.5 shrink-0 text-blue-500" />

                                <p className="text-xs leading-5 text-slate-600">
                                    <span className="font-semibold text-slate-700">Note: </span>
                                    Selected materials from the same vendor can be combined into
                                    a single Purchase Order or generated as separate Purchase Orders.
                                </p>
                            </div>


                            <div className="flex shrink-0 items-center gap-2">

                                <Button
                                    color="red"
                                    size="mxs"
                                    title="Generate"
                                    disabled={selectedIds.length === 0}
                                    onClick={() => {

                                        setIsUploadPO(false);
                                        setPurchaseOrderFiles([]);
                                        setPurchaseOrderURL("")
                                        setRemovedPurchaseOrderUrls([]);
                                        handleGeneratepurchaseorder();
                                    }}
                                    style={{ width: '100px' }} >
                                    Generate PO
                                </Button>

                                <Button
                                    onClick={() => {
                                        setIsUploadPO(true);
                                        setPurchaseOrderFiles([]);
                                        setPurchaseOrderURL("")
                                        setRemovedPurchaseOrderUrls([]);
                                        setIsAddUpdateModalOpen(true);
                                    }}
                                    color="blue"
                                    size="mxs"
                                    variant="solid"
                                    colorMode="gradient_dark"
                                    defineWidth
                                    style={{ width: '100px' }}
                                    disabled={selectedIds.length === 0}
                                >
                                    Upload PO
                                </Button>

                            </div>

                        </div>
                    </>

                )}

            <Modal
                isOpen={isAddUpdateModalOpen}

                onClose={() => {
                    setSelectedIds([]);
                    setIsAddUpdateModalOpen(false);
                    setIsUploadPO(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setPurchaseOrderFiles([]);
                }}
                title={isUploadPO ? "Upload Purchase Order" : "Purchase Order"}
                onSubmit={(e) => {
                    e.preventDefault();

                    if (isUploadPO) {
                        handleUploadPurchaseOrder(e);
                    } else {
                        handleGeneratePurchaseOrder(e);
                    }

                }}
                saveText={isUploadPO ? "Upload" : "Generate"}

                loading={isLoading}
                size="large-half"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    {isUploadPO ? (


                        <div>
                            <MultiFilePicker
                                label="Upload PO"
                                placeholder="Select PO"
                                required
                                error={errors.PurchaseOrderURL}
                                value={purchaseOrderFiles}
                                onChange={setPurchaseOrderFiles}
                                availableFilesURL={purchaseOrderURL ?? ""}
                                allowedTypes={["application/pdf"]}
                                maxFiles={1}
                                onRemoveExisting={(url) => {
                                    setRemovedPurchaseOrderUrls((prev) => [...prev, url])
                                }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4" >

                            <div>
                                <TextArea
                                    label='Remarks'
                                    required
                                    value={formData.Remarks ?? ""}
                                    onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                                    placeholder="Enter Remarks"
                                    error={errors.Remarks} />

                            </div>

                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Term & Condition"
                                    title="Term & Condition"
                                    size="lg"
                                    dataFetchCallBack={fetchTncByModuleName("Material Requisition")}
                                    onSelected={(item) => handleFieldChange("TermsCondition", item?.value)}
                                    error={errors.TermsCondition}
                                    required
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
                    )}

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