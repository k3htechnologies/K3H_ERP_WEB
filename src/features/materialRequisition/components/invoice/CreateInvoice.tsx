import { useEffect, useMemo, useState } from "react";
import type { AddUpdateMaterialRequisitionInvoice } from "../../models/MaterialRequisitionInvoiceModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";
import { useMaterialRequisitionListState } from "../../context/MaterialRequisitionListStateContext";
import { runApiWithLoader } from "@/core/utils";
import { materialRequisitionInvoiceService } from "../../services/MaterialRequisitionInvoiceService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Input } from "@/ui/components/forms";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { TextArea } from "@/ui/components/forms/Textarea";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import type { FilterWithPaginationMaterialRequisitionGRN, MaterialRequisitionGRNData } from "../../models/MaterialRequisitionGRNModel";
import { materialRequisitionGRNService } from "../../services/MaterialRequisitionGRNService";
import type { FilterWithPaginationMaterialRequisition, MaterialRequisitionDetailData } from "../../models/MaterialRequisitionModel";
import { materialRequisitionService } from "../../services/MaterialRequisitionService";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

const initialFormState = (): AddUpdateMaterialRequisitionInvoice => ({
    MaterialRequisitionId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    MaterialRequisitionInvoiceId: 0,
    InvoiceNumber: '',
    InvoiceAmount: 0,
    InvoiceDueDate: '',
    InvoiceDate: '',
    UploadInvoiceURL: '',
    RemoveUploadInvoiceURL: null,
    PerformaInvoiceURL: '',
    RemovePerformaInvoiceURL: null,
    Remarks: ''
})

const AddUpdateInovice: React.FC = () => {
    const [formData, setFormData] = useState<AddUpdateMaterialRequisitionInvoice>(() => initialFormState());
    const [invoiceData, setInvoiceData] = useState<MaterialRequisitionGRNData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const navigate = useNavigate();

    const [performaInvoiceURLFiles, setPerformaInvoiceURLFiles] = useState<(File | string)[]>([]);
    const [removePerformaInvoiceUrls, SetRemovePerformaInvoiceUrls] = useState<string[]>([]);
    const [performaInvoiceURL, setPerformaInvoiceURLL] = useState<string>();
    const [uploadInvoiceURLFiles, setUploadInvoiceURLFiles] = useState<(File | string)[]>([]);
    const [removeUploadInvoiceUrls, SetRemoveUploadInvoiceUrls] = useState<string[]>([]);
    const [uploadInvoiceURL, setUploadInvoiceURL] = useState<string>();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/materialRequisition/view');
    //#endregion

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    useEffect(() => {
        if (!projectId) return;
        loadInvoiceData();
        fetchMaterialRequisitionDetailData();
    }, [projectId, currentMaterialRequisitionId])

    const loadInvoiceData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionGRN = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey
                };

                const response = await materialRequisitionGRNService.apiCallPullMaterialRequisitionGRN(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setInvoiceData(Array.isArray(data) ? (data[0] ?? null) : data);
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
            "Loading Invoice",
        );
    };

    const fetchMaterialRequisitionDetailData = async () => {
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

    const MaterialRequisitionDetailColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'MaterialName',
            label: 'Material Name',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
        {
            key: 'SubMaterialName',
            label: 'Sub Material',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value?: string) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="180px"
                    tooltipThreshold={18}
                />
            )
        },
        {
            key: 'MaterialQuantity',
            label: 'Quantity',
            width: '15',
            sortable: false,
            align: 'left',
            render: (value) => value || '-'
        },
    ], []);

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateMaterialRequisitionInvoice, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddInvoiceForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.Remarks) {
            newErrors.Remarks = ' Remarks is required.';
        }

        if (!formData.InvoiceAmount) {
            newErrors.InvoiceAmount = ' Invoice Amount is required.';
        }
        if (!formData.InvoiceDate) {
            newErrors.InvoiceDate = ' Invoice Date is required.';
        }
        if (!formData.InvoiceDueDate) {
            newErrors.InvoiceDueDate = ' Invoice Due Date is required.';
        }
        if (!formData.InvoiceNumber) {
            newErrors.InvoiceNumber = ' Invoice Number is required.';
        }
        if (!hasAnyDocumentFile(uploadInvoiceURLFiles, uploadInvoiceURL, removeUploadInvoiceUrls)) {
            newErrors.UploadInvoiceURL = "File is required.";
        }
        if (!hasAnyDocumentFile(performaInvoiceURLFiles, performaInvoiceURL, removePerformaInvoiceUrls)) {
            newErrors.PerformaInvoiceURL = "File is required.";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    //#region PUSH DATA
    const PushAddUpdateInvoiceData = (): FormData => {
        const fd = new FormData();
        fd.append("MaterialRequisitionInvoiceId", formData.MaterialRequisitionInvoiceId.toString());
        fd.append("MaterialRequisitionId", Number(currentMaterialRequisitionId).toString());
        fd.append("Uniquekey", formData.Uniquekey ?? "");
        fd.append("ProjectId", projectId!.toString());
        fd.append("InvoiceNumber", formData.InvoiceNumber ?? "");
        fd.append("InvoiceDate", formData.InvoiceDate ?? "");
        fd.append("InvoiceDueDate", formData.InvoiceDueDate ?? "");
        fd.append("InvoiceAmount", formData.InvoiceAmount.toString());
        fd.append("Remarks", formData.Remarks ?? "");

        uploadInvoiceURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("UploadInvoiceURL", file);
            }
        });

        fd.append("RemoveUploadInvoiceURL", removeUploadInvoiceUrls.join(","));

        performaInvoiceURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("PerformaInvoiceURL", file);
            }
        });

        fd.append("RemovePerformaInvoiceURL", removePerformaInvoiceUrls.join(","));
        return fd;
    };
    //#endregion

    //#region HANDLE ADD UPDATE
    const handleAddUpdateInvoice = async () => {
        setErrors({});

        const validation = validateAddInvoiceForm();

        if (!validation.isValid) {

            setErrors(validation.errors);
            return;
        }
        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,

            async () => {
                const payload = PushAddUpdateInvoiceData();

                const response = await materialRequisitionInvoiceService.apiCallAddUpdateMaterialRequisitionInvoice(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/materialRequisition/view");
                    
                    setPerformaInvoiceURLL('');
                    setUploadInvoiceURL('');

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
            'Create Invoice'
        );
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="pb-2">
                <HeaderActionBar
                    titleText={'Create Invoice'}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() => navigate(-1)}

                />
            </div>

            <div className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FieldItem label="Date" value={formatDate_dd_MonthName_yy(invoiceData?.CreatedDate ?? '')} />
                        <FieldItem label="Challan No." value={invoiceData?.ChallanNumber} />
                        <FieldItem label="Vehicle No." value={invoiceData?.VehicleNumber} />
                        <FieldItem label="Total Requisition Amount" value={invoiceData?.Remarks} />
                        <FieldItem label="Paid  Requisition Amount" value={invoiceData?.VehicleNumber} />
                        <FieldItem label="Remaining Requisition Amount " value={invoiceData?.VehicleNumber} />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 space-y-4 h-[110px] shadow-sm border border-gray-300 ">
                    <DataTableWithOutBorder
                        columns={MaterialRequisitionDetailColumns}
                        data={matrialRequisitionDetailData}
                        emptyMessage="No Material Requisition Found"
                        fixedHeight={true}
                        className="flex-1"
                    />
                </div>
            </div>

            <div className="gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="space-y-4 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Invoice Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <Input
                                type="text"
                                required
                                label='Invoice Number'
                                value={formData.InvoiceNumber ?? ""}
                                onChange={(e) => handleFieldChange("InvoiceNumber", e.target.value)}
                                placeholder="Enter Invoice number"
                                maxLength={250}
                                error={errors.InvoiceNumber}
                            />
                        </div>

                        <div>
                            <DatePickerInput
                                label="Invoice Date"
                                value={formatDate_dd_mm_yyyy(formData.InvoiceDate)}
                                onChange={(val) => handleFieldChange('InvoiceDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                required
                                error={errors.InvoiceDate}
                            />
                        </div>

                        <div>
                            <Input
                                type="text"
                                required
                                label='Invoice Amount'
                                value={formData.InvoiceAmount ?? ""}
                                onChange={(e) => handleFieldChange("InvoiceAmount", e.target.value)}
                                placeholder="Enter Invoice Amount"
                                maxLength={250}
                                error={errors.InvoiceAmount}
                            />
                        </div>

                        <div>
                            <DatePickerInput
                                label="Due Date"
                                value={formatDate_dd_mm_yyyy(formData.InvoiceDueDate)}
                                onChange={(val) => handleFieldChange('InvoiceDueDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                required
                                error={errors.InvoiceDueDate}
                            />
                        </div>

                        <div>
                            <MultiFilePicker
                                label="Upload Invoice"
                                placeholder="Select Files"
                                required
                                error={errors.UploadInvoiceURL}
                                value={uploadInvoiceURLFiles}
                                onChange={setUploadInvoiceURLFiles}
                                availableFilesURL={uploadInvoiceURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                maxFiles={5}
                                maxSizeMB={50}
                                onRemoveExisting={(url) => {
                                    SetRemoveUploadInvoiceUrls((prev) => [...prev, url]);
                                }}
                            />
                        </div>

                        <div>
                            <MultiFilePicker
                                label="Performance Report"
                                placeholder="Select Files"
                                required
                                error={errors.PerformaInvoiceURL}
                                value={performaInvoiceURLFiles}
                                onChange={setPerformaInvoiceURLFiles}
                                availableFilesURL={performaInvoiceURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                maxFiles={5}
                                maxSizeMB={50}
                                onRemoveExisting={(url) => {
                                    SetRemovePerformaInvoiceUrls((prev) => [...prev, url]);
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <TextArea
                            required
                            label='Remarks'
                            value={formData.Remarks ?? ""}
                            onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                            placeholder="Enter Remarks"
                            maxLength={250}
                            error={errors.Remarks}
                        />
                    </div>

                </div>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.MaterialRequisitionInvoiceId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdateInvoice();
                }}
                isLoading={isLoading}
            />
        </div>

    )
}
export default AddUpdateInovice;