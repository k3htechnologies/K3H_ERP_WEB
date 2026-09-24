import { useEffect, useMemo, useState } from "react";
import type { AddUpdateMaterialRequisitionInvoice, FilterWithPaginationMaterialRequisitionInvoice, FilterWithPaginationMaterialRequisitionInvoiceSummary, MaterialRequisitionInvoiceSummaryData } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { runApiWithLoader } from "@/core/utils";
import { materialRequisitionInvoiceService } from "@/features/materialRequisition/services/MaterialRequisitionInvoiceService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Input } from "@/ui/components/forms";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { TextArea } from "@/ui/components/forms/Textarea";
import { filterNumbersWithDecimal, hasAnyDocumentFile } from "@/core/utils/fileValidation";
import type { FilterWithPaginationMaterialRequisitionGRN, MaterialRequisitionDetailGRNData, MaterialRequisitionGRNData } from "@/features/materialRequisition/models/MaterialRequisitionGRNModel";
import { materialRequisitionGRNService } from "@/features/materialRequisition/services/MaterialRequisitionGRNService";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { DataTableWithHeadColor } from "@/ui/components/DataTable/DataTableWithHeadColor";
import { formatCurrency, isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

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
    MeasurementReportURL: '',
    RemoveMeasurementReportURL: null,
    Remarks: '',
    MaterialRequisitionGRNId: 0,
})

const CreateInvoice: React.FC = () => {

    const [formData, setFormData] = useState<AddUpdateMaterialRequisitionInvoice>(() => initialFormState());
    const [invoiceSummaryData, setInvoiceSummaryData] = useState<MaterialRequisitionInvoiceSummaryData | null>(null);
    const [materialRequisitionGRNData, setMaterialRequisitionGRNData] = useState<MaterialRequisitionGRNData | null>(null);
    const [matrialRequisitionDetailGRNData, setMaterialRequisitionDetailGRNData] = useState<MaterialRequisitionDetailGRNData[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey
    const { MaterialRequisitionGRNId, MaterialRequisitionInvoiceId } = useParams<{ MaterialRequisitionGRNId?: string, MaterialRequisitionInvoiceId?: string }>();
    const systemGeneratedCode = listState.SystemGeneratedCode;
    const navigate = useNavigate();
    const [performaInvoiceURLFiles, setPerformaInvoiceURLFiles] = useState<(File | string)[]>([]);
    const [removePerformaInvoiceUrls, SetRemovePerformaInvoiceUrls] = useState<string[]>([]);
    const [performaInvoiceURL, setPerformaInvoiceURLL] = useState<string>();
    const [measurementReportURLFiles, setMeasurementReportURLFiles] = useState<(File | string)[]>([]);
    const [removeMeasurementReportUrls, SetRemoveMeasurementReportUrls] = useState<string[]>([]);
    const [measurementReportURL, setMeasurementReportURL] = useState<string>();
    const [uploadInvoiceURLFiles, setUploadInvoiceURLFiles] = useState<(File | string)[]>([]);
    const [removeUploadInvoiceUrls, SetRemoveUploadInvoiceUrls] = useState<string[]>([]);
    const [uploadInvoiceURL, setUploadInvoiceURL] = useState<string>();
    const { canAction: canAddInvoice } = useMenuPermissions('Add Invoice');
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const materialRequisitionInvoiceId = MaterialRequisitionInvoiceId ? Number(MaterialRequisitionInvoiceId) : 0;
    const isAddMode = materialRequisitionInvoiceId === 0;

    const [editInvoiceAmount, setEditInvoiceAmount] = useState<number>();

    useEffect(() => {
        if (!projectId) return;
        loadMaterialRequisitionGRNData();
        loadmaterialRequisitionInvoiceSummary();

        if (!isAddMode) {
            fetchInvoiceDetails();
        }

    }, [projectId, currentMaterialRequisitionId, MaterialRequisitionGRNId])

    const loadMaterialRequisitionGRNData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionGRN = {
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey,
                    MaterialRequisitionGRNId: MaterialRequisitionGRNId ? Number(MaterialRequisitionGRNId) : undefined
                };

                const response = await materialRequisitionGRNService.apiCallPullMaterialRequisitionGRN(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setMaterialRequisitionGRNData(Array.isArray(data) ? (data[0] ?? null) : data);

                    const Item = Array.isArray(data) ? data[0] : data;

                    setMaterialRequisitionDetailGRNData(Item?.MaterialRequisitionDetailGRNData ?? []);

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
            "Loading Material Requisition GRN",
        );
    };

    const loadmaterialRequisitionInvoiceSummary = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionInvoiceSummary = {
                    MaterialRequisitionId: currentMaterialRequisitionId,
                };

                const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoiceSummary(params);

                if (E.isRight(response)) {

                    setInvoiceSummaryData(response.right.Data[0] ?? null);
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
            "Loading Invoice Summary",
        );
    };

    const fetchInvoiceDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionInvoice = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    Uniquekey: currentUniquekey,
                    MaterialRequisitionGRNId: Number(MaterialRequisitionGRNId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    MaterialRequisitionInvoiceId: Number(MaterialRequisitionInvoiceId)
                };

                const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoice(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                            MaterialRequisitionInvoiceId: e.MaterialRequisitionInvoiceId ?? prev.MaterialRequisitionInvoiceId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            ProjectId: e.ProjectId ?? prev.ProjectId,
                            MaterialRequisitionGRNId: e.MaterialRequisitionGRNId ?? prev.MaterialRequisitionGRNId,
                            MaterialRequisitionId: e.MaterialRequisitionId ?? prev.MaterialRequisitionId,
                            InvoiceNumber: e.InvoiceNumber ?? prev.InvoiceNumber,
                            InvoiceDate: e.InvoiceDate ?? prev.InvoiceDate,
                            InvoiceDueDate: e.InvoiceDueDate ?? prev.InvoiceDueDate,
                            InvoiceAmount: e.InvoiceAmount ?? prev.InvoiceAmount,
                            Remarks: e.Remarks ?? prev.Remarks,
                        }));
                        setEditInvoiceAmount(e.InvoiceAmount)
                        setUploadInvoiceURL(e.UploadInvoiceURL ?? "");
                        setPerformaInvoiceURLL(e.PerformaInvoiceURL ?? "");
                        setMeasurementReportURL(e.MeasurementReportURL ?? "");

                        setUploadInvoiceURLFiles([]);
                        setPerformaInvoiceURLFiles([]);
                        setMeasurementReportURLFiles([]);

                        SetRemoveUploadInvoiceUrls([]);
                        SetRemovePerformaInvoiceUrls([]);
                        SetRemoveMeasurementReportUrls([]);
                    }
                } else {
                    setEditInvoiceAmount(0);
                    setUploadInvoiceURL('')
                    setUploadInvoiceURLFiles([])
                    SetRemoveUploadInvoiceUrls([]);
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Invoice'
        );
    };

    const MatrialRequisitionDetailColumns = useMemo<TableColumn[]>(() => {

        const isDirect = matrialRequisitionDetailGRNData?.[0]?.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        const columns: TableColumn[] = [];

        if (isDirect) {
            columns.push(
                {
                    key: "Level1Name",
                    label: "Category",
                    align: "left",
                    width: "30",
                    render: (value) => value || "-"
                },
                {
                    key: "Level2Name",
                    label: "Sub Category",
                    align: "left",
                    width: "30",
                    render: (value) => value || "-"
                },
                {
                    key: "Level3Name",
                    label: "Description",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },
                {
                    key: "Level4Name",
                    label: "Sub Material",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
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
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },
                {
                    key: "SubMaterialName",
                    label: "Sub Material",
                    align: "left",
                    width: "30",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                        />
                    )
                },

            );
        }
        columns.push(
            {
                key: "RequiredDate",
                label: "Required Date",
                align: "left",
                width: "30",
                render: (value) =>
                    value ? formatDate_dd_MonthName_yy(value) : "-"
            },
            {
                key: "MaterialQuantity",
                label: "Quantity",
                align: "left",
                width: "30",
                render: (value, row) => {
                    return isDirect ? `${value ?? 0} ${row.Level4SubMaterialUomCode ?? ""}`.trim() : `${value ?? 0} ${row.UomCode ?? ""}`.trim() ?? 0;
                }
            },
            {
                key: 'TotalReceivedMaterialQuantity',
                label: 'Received Quantity',
                width: '10',
                sortable: false,
                align: 'left',
                render: (value?: string) => value || '-'
            },
        );

        return columns;
    }, [matrialRequisitionDetailGRNData]);

    const handleFieldChange = (field: keyof AddUpdateMaterialRequisitionInvoice, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateAddInvoiceForm = (): {

        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.InvoiceAmount) {
            newErrors.InvoiceAmount = ' Invoice Amount is required.';
        } else if (Number(formData.InvoiceAmount) === 0) {
            newErrors.InvoiceAmount = ' Invoice Amount must be greater than zero.';
        } else if (Number(formData.InvoiceAmount) > Number(invoiceSummaryData?.PendingRequisitionAmount ?? 0)) {
            newErrors.InvoiceAmount = `Invoice Amount cannot be greater than Pending Invoice Amount (${invoiceSummaryData?.PendingRequisitionAmount ?? 0}).`;
        }

        const invoiceDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.InvoiceDate ? new Date(formData.InvoiceDate) : undefined);
        const invoiceDueDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.InvoiceDueDate ? new Date(formData.InvoiceDueDate) : undefined);


        if (!formData.InvoiceDate) {
            newErrors.InvoiceDate = ' Invoice Date is required.';
        }
        if (!formData.InvoiceDueDate) {
            newErrors.InvoiceDueDate = ' Invoice Due Date is required.';

        } else if (formData?.InvoiceDate && formData.InvoiceDueDate && !isToDateGreaterOrEqualFromDate(invoiceDate, invoiceDueDate)) {
            newErrors.InvoiceDueDate = "Invoice Due Date must be greater than or equal to Invoice Date";
        }

        if (!formData.InvoiceNumber?.trim()) {
            newErrors.InvoiceNumber = "Invoice Number is required.";
        } else if (Number(formData.InvoiceNumber) === 0) {
            newErrors.InvoiceNumber = "Invoice Number must be greater than zero.";
        }


        if (!hasAnyDocumentFile(uploadInvoiceURLFiles, uploadInvoiceURL, removeUploadInvoiceUrls) && !hasAnyDocumentFile(performaInvoiceURLFiles, performaInvoiceURL, removePerformaInvoiceUrls)) {
            newErrors.UploadInvoiceURL = "Either Invoice or Performa Invoice is required.";
            newErrors.PerformaInvoiceURL = "Either Invoice or Performa Invoice is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

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
        fd.append("MaterialRequisitionGRNId", Number(MaterialRequisitionGRNId)!.toString());

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

        measurementReportURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("MeasurementReportURL", file);
            }
        });

        fd.append("RemoveMeasurementReportURL", removeMeasurementReportUrls.join(","));
        return fd;
    };

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

                    navigate("/materialRequisition/view", {
                        state: { activeTab: "Invoice" }
                    });
                    setEditInvoiceAmount(0);
                    setPerformaInvoiceURLL('');
                    setUploadInvoiceURL('');
                    setMeasurementReportURL('');
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

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="pb-4">
                <HeaderActionBar
                    titleText={'Create Invoice :'}
                    subTitleText={systemGeneratedCode ?? "-"}
                    subSubTitleText={listState.MaterialRequisitionStatus ?? ''}
                    subSubSubTitleText={listState.VendorName ?? ''}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() =>
                        navigate("/materialRequisition/view", {
                            state: { activeTab: "Invoice" }
                        })}
                />
            </div>

            <div className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="lg:col-span-5 pb-3">

                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                            Vendor Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem
                                label="Vendor Name"
                                value={invoiceSummaryData?.FinalVendor}
                            />

                            <FieldItem
                                label="Vendor Company"
                                value={invoiceSummaryData?.FinalVendorCompanyName}
                            />

                            <FieldItem
                                label="Mobile Number"
                                value={`${invoiceSummaryData?.FinalVendorMobileNumberCountryCode ?? "+91"} ${invoiceSummaryData?.FinalVendorMobileNumber ?? ""}`}
                            />

                            <FieldItem
                                label="GST Number"
                                value={invoiceSummaryData?.FinalVendorGSTNumber}
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                            PO Amount Details (₹)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem
                                label="Total (₹)"
                                value={formatCurrency(invoiceSummaryData?.TotalRequisitionAmount)}
                            />

                            <FieldItem
                                label="Paid (₹)"
                                value={formatCurrency(invoiceSummaryData?.PaidRequisitionAmount)}
                            />

                            <FieldItem
                                label="Pending (₹)"
                                value={formatCurrency(invoiceSummaryData?.PendingRequisitionAmount)}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
                            Invoice Details  (₹)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem
                                label="Total (₹)"
                                value={formatCurrency(invoiceSummaryData?.TotalInvoiceAmount)}
                            />

                            <FieldItem
                                label="Paid (₹)"
                                value={formatCurrency(invoiceSummaryData?.TotalAmountPaid)}
                            />

                            <FieldItem
                                label="Pending(₹)"
                                value={formatCurrency(invoiceSummaryData?.RemainingInvoiceAmount)}
                            />
                        </div>
                    </div>

                </div>
            </div>

            <div className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <div className="lg:col-span-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <FieldItem label="Challan Number" value={materialRequisitionGRNData?.ChallanNumber || '-'} />
                        <FieldItem label="Challan" urls={materialRequisitionGRNData?.UploadChallanURL} isIcon isSetValue={false} />
                        <FieldItem label="Vehicle Number" value={materialRequisitionGRNData?.VehicleNumber || '-'} />
                        <FieldInfoTooltip label="Remarks" value={materialRequisitionGRNData?.Remarks || '-'} />
                        <FieldItem label="Created By / Date" value={materialRequisitionGRNData?.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(materialRequisitionGRNData?.CreatedDate || '-')} />

                        {materialRequisitionGRNData?.ModifiedBy !== '' ?
                            <FieldItem label="Modified By / Date" value={materialRequisitionGRNData?.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(materialRequisitionGRNData?.ModifiedDate || '-')} />
                            :
                            ''}

                    </div>
                </div>

                <div className="pt-5">

                    <DataTableWithHeadColor
                        columns={MatrialRequisitionDetailColumns}
                        data={matrialRequisitionDetailGRNData}
                        emptyMessage="No Material Requisition Details Found"
                        fixedHeight={true}
                        recordsPerPage={3}
                        className="flex-1"
                    />
                </div>
            </div>

            <div className="gap-x-4 bg-white p-4">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Invoice Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <Input
                                type="text"
                                required
                                label='Invoice Number'
                                value={formData.InvoiceNumber ?? ""}
                                onChange={(e) => handleFieldChange("InvoiceNumber", e.target.value)}
                                placeholder="Enter Invoice Number"
                                maxLength={15}
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
                                label='Invoice Amount (₹)'
                                value={formData.InvoiceAmount ?? ""}
                                onChange={(e) => {
                                    const value = filterNumbersWithDecimal(e.target.value);

                                    const totalRequisitionAmount = Number(invoiceSummaryData?.TotalRequisitionAmount ?? 0);

                                    const totalInvoiceAmount = Number(invoiceSummaryData?.TotalInvoiceAmount ?? 0);

                                    const currentInvoiceAmount = Number(editInvoiceAmount);

                                    const maxInvoiceAmount = Number(formData.MaterialRequisitionInvoiceId) > 0 ? totalRequisitionAmount - totalInvoiceAmount + currentInvoiceAmount : totalRequisitionAmount - totalInvoiceAmount;

                                    if (Number(value) <= maxInvoiceAmount) {
                                        handleFieldChange("InvoiceAmount", value);
                                    }
                                }}
                                placeholder="Enter Invoice Amount"
                                rightIcon="(₹)"
                                max={Number(formData.MaterialRequisitionInvoiceId) > 0 ? (Number(invoiceSummaryData?.TotalRequisitionAmount ?? 0) -Number(invoiceSummaryData?.TotalInvoiceAmount ?? 0) + Number(editInvoiceAmount)) 
                                                                                       : (Number(invoiceSummaryData?.TotalRequisitionAmount ?? 0) -Number(invoiceSummaryData?.TotalInvoiceAmount ?? 0))}
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
                                placeholder="Select Invoice"
                                required={!hasAnyDocumentFile(performaInvoiceURLFiles, performaInvoiceURL, removePerformaInvoiceUrls)}
                                error={errors.UploadInvoiceURL}
                                value={uploadInvoiceURLFiles}
                                onChange={setUploadInvoiceURLFiles}
                                availableFilesURL={uploadInvoiceURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                onRemoveExisting={(url) => {
                                    SetRemoveUploadInvoiceUrls((prev) => [...prev, url]);
                                }}
                            />
                        </div>

                        <div>
                            <MultiFilePicker
                                label="Performance Report"
                                placeholder="Select Performance Report"
                                required={!hasAnyDocumentFile(uploadInvoiceURLFiles, uploadInvoiceURL, removeUploadInvoiceUrls)}
                                error={errors.PerformaInvoiceURL}
                                value={performaInvoiceURLFiles}
                                onChange={setPerformaInvoiceURLFiles}
                                availableFilesURL={performaInvoiceURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                onRemoveExisting={(url) => {
                                    SetRemovePerformaInvoiceUrls((prev) => [...prev, url]);
                                }}
                            />
                        </div>

                        <div>
                            <MultiFilePicker
                                label="Measurement Report"
                                placeholder="Select Files"

                                error={errors.MeasurementReportURL}
                                value={measurementReportURLFiles}
                                onChange={setMeasurementReportURLFiles}
                                availableFilesURL={measurementReportURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                onRemoveExisting={(url) => {
                                    SetRemoveMeasurementReportUrls((prev) => [...prev, url]);
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <TextArea

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
                onCancel={() => navigate("/materialRequisition/view", {
                    state: { activeTab: "Invoice" }
                })}
                canAction={canAddInvoice}
                onSave={() => {
                    handleAddUpdateInvoice();
                }}
                isLoading={isLoading}
            />
        </div>
    )
}
export default CreateInvoice;