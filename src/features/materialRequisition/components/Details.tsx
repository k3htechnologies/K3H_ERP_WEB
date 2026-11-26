import { runApiWithLoader } from "@/core/utils";
import { useMemo, useState } from "react";
import type { MaterialRequisitionData, MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "@/features/materialRequisition/services/MaterialRequisitionService";
import { Loader } from "@/core/utils/loader";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Modal } from "@/ui/components/Modal/Modal";
import Checkbox from "@/ui/components/forms/Checkbox";
import { Button } from "@/ui/components/forms";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import type { MaterialRequisitionInvoiceData } from "@/features/materialRequisition//models/MaterialRequisitionInvoiceModel";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import { copyToClipboard, formatCurrency } from "@/core/utils/comman";
import type { ModulesApprovalStatusRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import CustomTableRowSpan, { type CustomTableRowSpanColumn } from "@/ui/components/DataTable/CustomTableRowSpan";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { getRowSpan } from "@/ui/components/DataTable/DataTableRowSpan";
import { Copy } from "lucide-react";

interface OverviewProps {
    matrialRequisitionData: MaterialRequisitionData | null;
    matrialRequisitionDetailData: MaterialRequisitionDetailData[];
    materialRequisitionInvoiceData: MaterialRequisitionInvoiceData[];
    handleExportMaterialRequisition?: () => Promise<void>;
}

export const Details: React.FC<OverviewProps> = ({ matrialRequisitionData, matrialRequisitionDetailData, materialRequisitionInvoiceData, handleExportMaterialRequisition }) => {

    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [, setMaterialRequisitionList] = useState<MaterialRequisitionData[]>([]);
    const [isSplit, setIsSplit] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.materialRequisitionId;
    const currentUniquekey = listState.uniquekey;
    const projectId = listState.projectId;
    const navigate = useNavigate();

    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState<string | null>("");
    const [invoiceAmount, setInvoiceAmount] = useState<number | null>(0);

    const [isApprovalFinalizedVendorLogModalOpen, setIsApprovalFinalizedVendorLogModalOpen] = useState(false);
    const [approvalFinalizedVendorLogRequest, setApprovalFinalizedVendorLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [vendorName, setVendorName] = useState<string | null>("");
    const [quotation, setQuotation] = useState<string | null>("");

    const { canExport } = useMenuPermissions('Get Material Requisition');

    const PushSplitMaterialRequisitionFormData = (): FormData => {

        const fd = new FormData();

        fd.append("ProjectId", Number(projectId).toString());
        fd.append("MaterialRequisitionId", currentMaterialRequisitionId.toString());
        fd.append("Uniquekey", currentUniquekey);
        fd.append("Remarks", matrialRequisitionData?.Remarks ?? '');
        fd.append("IsSplit", "1");
        fd.append("IsCopy", "0");
        fd.append("MaterialRequisitionDetailJSON", JSON.stringify(matrialRequisitionDetailData
            .filter(item => selectedIds.includes(item.MaterialRequisitionDetailId))
            .map(item => ({


                MaterialRequisitionDetailId: item.MaterialRequisitionDetailId,
                MaterialMasterId: item.MaterialMasterId,
                MaterialName: item.MaterialName,
                SubMaterialMasterId: item.SubMaterialMasterId,
                SubMaterialName: item.SubMaterialName,
                UomCode: item.UomCode,
                UomMasterId: item.UomMasterId,
                LevelId1: item.LevelId1,
                Level1Name: item.Level1Name,
                LevelId2: item.LevelId2,
                Level2Name: item.Level2Name,
                LevelId3: item.LevelId3,
                Level3Name: item.Level3Name,
                LevelId4: item.LevelId4,
                Level4Name: item.Level4Name,
                Level4SubMaterialUomCode: item.Level4SubMaterialUomCode,
                Level4SubMaterialUom: item.Level4SubMaterialUom,
                MaterialQuantity: item.MaterialQuantity,
                RequiredDate: item.RequiredDate,
                MaterialRequisitionType: item.MaterialRequisitionType,
                Remark: item.Remark
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

                    setIsSplit(false);

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

    const selectedMaterials = matrialRequisitionDetailData.filter(item => selectedIds.includes(item.MaterialRequisitionDetailId));

    const ShowSplitButton = matrialRequisitionData?.IsSplit && isSplit !== true

    const handleApprovalFinalizedVendorLog = (row: MaterialRequisitionDetailData) => {

        const request: ModulesApprovalStatusRequest = {
            ModuleName: "FINALIZE VENDOR APPROVAL",
            Id: listState.materialRequisitionId ?? 0,
            SubId: row.MaterialRequisitionDetailId,
            SubSubId: row.VendorId,
            ProjectId: Number(projectId),
        };

        setVendorName(row.VendorName ?? "");
        setQuotation(formatCurrency(row.Amount ?? 0));

        setApprovalFinalizedVendorLogRequest(request);
        setIsApprovalFinalizedVendorLogModalOpen(true);
    };


    const matrialRequisitionDetailColumns = useMemo<CustomTableRowSpanColumn[]>(() => {

        const isDirect = matrialRequisitionDetailData?.[0]?.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        const columns: CustomTableRowSpanColumn[] = [];

        if (isSplit) {
            columns.push({
                key: "select",
                label: "",
                align: "center",
                width: "5",
                render: (_value, row) => (
                    <Checkbox
                        size="sm"
                        checked={selectedIds.includes(row.MaterialRequisitionDetailId)}
                        onChange={() => {
                            const id = row.MaterialRequisitionDetailId;

                            setSelectedIds(prev =>
                                prev.includes(id)
                                    ? prev.filter(x => x !== id)
                                    : [...prev, id]
                            );
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                ),
            },
                {
                    key: "MaterialRequisitionType",
                    label: "Type",
                    align: "left",
                    width: "30",
                    render: (value) => value || "-"
                },);
        }


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
                    label: "Material / Sub Material",
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
                key: "RequiredDate",
                label: "Required Date",
                align: "left",
                width: "30",
                render: (value) =>
                    value ? formatDate_dd_MonthName_yy(value) : "-"
            },
            {
                key: "Remark",
                label: "Remark",
                align: "left",
                width: "30",
                render: (value) => (
                    <FieldInfoTooltip value={value} />
                )
            },
            {
                key: "ApprovalStatus",
                label: "Vendor Finalized Status",
                width: "18",
                sortable: false,
                align: "left",
                render: (value?: string, row?: any) => (
                    <div className="flex items-center gap-2">
                        {Number(row?.Amount) > 0 ? (
                            <ApprovalActions
                                approvalStatus={value || "-"}
                                isIcons={true}
                                onHistory={() => handleApprovalFinalizedVendorLog(row)}
                            />
                        ) : '-'}
                    </div>
                )
            },
            {
                key: "VendorDetailsGroup",
                label: "Vendor Details",
                align: "center",

                children: [
                    {
                        key: "VendorName",
                        label: "Vendor / Company Name",
                        align: "left",
                        width: "20",
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
                        key: 'PurchaseOrderURL',
                        label: 'PO',
                        width: '15',
                        sortable: false,
                        align: 'left',
                        render: (value: string, row: any) => {
                            return (
                                <div className="flex items-center justify-between w-full">
                                    <MultiImageViewer
                                        images={parseDocumentUrls(row.PurchaseOrderURL)}
                                        title="Purchase Order "
                                        isIcon={false}
                                        triggerLabel={value === '' || 'Purchase Order'}
                                    />

                                </div>
                            );
                        },
                        rowSpan: (_row, index, data) => getRowSpan(data, index, ['PurchaseOrderURL'])
                    },
                    {
                        key: "Amount",
                        label: "Amount (₹)",
                        align: "left",
                        width: "30",
                        render: (value) => formatCurrency(value) || 0
                    },
                    {
                        key: "PurchaseOrderCreatedBy",
                        label: "PO Created By / Date",
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

                ]
            },
            {
                key: "MaterialReceivedQuantityTillDate",
                label: "Received Quantity (GRN)",
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

        )
        return columns;
    }, [matrialRequisitionDetailData, isSplit, selectedIds, handleApprovalFinalizedVendorLog]);

    const handleApprovalLog = (row: MaterialRequisitionInvoiceData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "INVOICE APPROVAL",
            Id: listState.materialRequisitionId ?? 0,
            SubId: row.MaterialRequisitionInvoiceId ?? 0,
            ProjectId: Number(projectId),
        };
        setInvoiceNumber(row.InvoiceNumber);
        setInvoiceAmount(row.InvoiceAmount);
        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };


    const materialRequisitionInvoiceDataWithTotal = useMemo(() => {
        const data = materialRequisitionInvoiceData || [];

        const totalInvoiceAmount = data.reduce(
            (total, row) => total + Number(row.InvoiceAmount ?? 0),
            0
        );

        const totalPaidAmount = data.reduce(
            (total, row) => total + Number(row.InvoiceAmountPaidTillDate ?? 0),
            0
        );

        const totalPaidTDSAmount = data.reduce(
            (total, row) => total + Number(row.InvoiceTDSPaidTillDate ?? 0),
            0
        );

        return [
            ...data,
            {
                InvoiceNumber: "TOTAL",
                InvoiceAmount: totalInvoiceAmount,
                InvoiceAmountPaidTillDate: totalPaidAmount,
                InvoiceTDSPaidTillDate: totalPaidTDSAmount,
                isTotal: true,
            },
        ];
    }, [materialRequisitionInvoiceData]);

    const MaterialRequisitionInvoiceColumns = useMemo<any[]>(
        () => [
            {

                key: "VendorName",
                label: "Vendor / Company Name",
                align: "left",
                width: "20",
                render: (value: string, row: any) => (
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
                key: "InvoiceNumber",
                label: "Invoice Number",
                width: '15',
                align: "left",
                render: (value: string, row: any) => {
                    if (row.isTotal) {
                        return (
                            <span className="font-bold text-gray-500">
                                TOTAL
                            </span>
                        );
                    }
                    return (
                        <span className="font-medium text-black text-[14px]">
                            {value || "-"}
                        </span>
                    );
                }
            },
            {
                key: 'UploadInvoiceURL',
                label: 'Invoice',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value: string, row: any) => {
                    if (row.isTotal) {
                        return "";
                    }
                    return (
                        <div className="flex items-center justify-between w-full">
                            <MultiImageViewer
                                images={parseDocumentUrls(row.UploadInvoiceURL)}
                                title="Invoice Document"
                                isIcon={false}
                                triggerLabel={value === '' || 'PDF'}
                            />

                        </div>
                    );
                }
            },
            {
                key: 'PerformaInvoiceURL',
                label: 'Proforma',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value: string, row: any) => {
                    if (row.isTotal) {
                        return "";
                    }
                    return (
                        <div className="flex items-center justify-between w-full">
                            <MultiImageViewer
                                images={parseDocumentUrls(row.PerformaInvoiceURL)}
                                title="DWG Document"
                                isIcon={false}
                                triggerLabel={value === '' || 'DWG'}
                            />

                        </div>
                    );
                }
            },
            {
                key: "InvoiceAmount",
                label: "Amount",
                width: '15',
                align: "right",
                render: (value: number, row: any) => (
                    <span className={row.isTotal ? "font-bold text-gray-500" : "font-medium text-black"}>
                        {formatCurrency(value) || "0"}
                    </span>
                )
            },
            {
                key: "InvoiceAmountPaidTillDate",
                label: "Paid",
                width: '15',
                align: "right",
                render: (value: number, row: any) => (
                    <span className={row.isTotal ? "font-bold text-gray-500" : "font-medium text-black"}>
                        {formatCurrency(value) || "0"}
                    </span>
                )
            },
            {
                key: "InvoiceTDSPaidTillDate",
                label: "TDS",
                width: '15',
                align: "right",
                render: (value: number, row: any) => (
                    <span className={row.isTotal ? "font-bold text-gray-500" : "font-medium text-black"}>
                        {formatCurrency(value) || "0"}
                    </span>
                )
            },
            {
                key: "InvoiceDate",
                label: "Invoice Date",
                align: "left",
                width: '15',
                render: (value?: string, row?: any) =>
                    row.isTotal
                        ? ""
                        : value
                            ? formatDate_dd_MonthName_yy(value)
                            : '-'
            },
            {
                key: "InvoiceDueDate",
                label: "Invoice Due Date",
                align: "left",
                width: '15',
                render: (value?: string, row?: any) =>
                    row.isTotal
                        ? ""
                        : value
                            ? formatDate_dd_MonthName_yy(value)
                            : '-'
            },
            {
                key: "Remarks",
                label: "Remark",
                align: "left",
                width: "10",
                render: (value?: string, row?: any) => (
                    row.isTotal
                        ? ""
                        : <FieldInfoTooltip value={value} />
                )
            },
            {
                key: "ApprovalStatus",
                label: "Invoice Status",
                width: "18",
                sortable: false,
                align: "left",
                render: (value?: string, row?: any) => (
                    row.isTotal
                        ? ""
                        :
                        <ApprovalActions
                            approvalStatus={value || "-"}
                            isIcons={true}

                            onHistory={() => handleApprovalLog(row)
                            }
                        />

                )
            },
        ], [handleApprovalLog]
    );

    return (
        <div className="justify-center pt-3">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="border border-[#33333321] rounded-xl overflow-hidden mb-4 mt-2">
                <div className="bg-[#E7F2FF] px-4 py-2 border-b border-[#D0D7DE]">
                    <h4 className="text-sm font-semibold text-[#1D4ED8]">
                        Basic Details
                    </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-[#135bec2e]">
                    <FieldItem label="MR Code" value={matrialRequisitionData?.SystemGeneratedCode} />
                    <FieldItem label="Project Name" value={matrialRequisitionData?.ProjectName} />
                    <FieldItem label="Company Name" value={matrialRequisitionData?.CompanyName} />
                    <FieldItem label="Department" value={matrialRequisitionData?.Department} />
                    <FieldItem label="MR Approval Status" value={matrialRequisitionData?.ApprovalStatus} />
                    <div>
                        <p className="text-sm font-medium text-[#1D1D1D80]">Attachment</p>
                        <MultiImageViewer
                            images={parseDocumentUrls(matrialRequisitionData?.AttachmentsURL ?? '')}
                            title={`Attachment - ${matrialRequisitionData?.ProjectName || ''} - ${matrialRequisitionData?.SystemGeneratedCode || ''}`}
                            isIcon={false}
                            triggerLabel="-"
                        />
                    </div>


                    <FieldItem label="GST Number" value={matrialRequisitionData?.CompanyGSTNumber} />
                    <FieldItem label="PAN Number" value={matrialRequisitionData?.CompanyPANNumber} />

                </div>
            </div>

            <section className="border border-[#33333321] rounded-xl overflow-hidden mt-5">
                <div className="bg-[#FCF1FF] px-4 py-2 border-b border-[#D0D7DE] flex items-center justify-between">

                    <h4 className="text-sm font-semibold text-[#7E22CE] flex items-center gap-2">
                        Material Details
                        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-[#F3DEF9] text-[#561F64] text-xs font-semibold">
                            {matrialRequisitionDetailData.length}
                        </span>
                        :

                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F3DEF9] text-[#561F64] text-xs font-semibold">
                            {matrialRequisitionDetailData?.[0]?.MaterialRequisitionType || "-"}
                        </span>
                    </h4>

                    <div className="flex items-center gap-2">
                        {handleExportMaterialRequisition && canExport && (
                            <Button
                                size="sm"
                                color="blue"
                                colorMode="gradient_light"
                                onClick={() => handleExportMaterialRequisition()}>
                                PDF
                            </Button>
                        )}

                        {ShowSplitButton && !isSplit && (

                            <Button
                                size="sm"
                                color="primary"
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setIsSplit(true)
                                }}
                            >

                                Split
                            </Button>

                        )}
                    </div>

                </div>


                <div className="overflow-y-auto thin-scroll">
                    <CustomTableRowSpan
                        columns={matrialRequisitionDetailColumns}
                        data={matrialRequisitionDetailData}
                        emptyMessage="No Material Requisition Details Found"
                        fixedHeight={true}
                        className="flex-1"
                    />
                </div>


                {isSplit && (
                    <div className="flex justify-end items-center gap-2 px-3 py-2 border-t border-[#D0D7DE] bg-white">
                        <Button
                            color="transparent"
                            variant="transparent_border"
                            size="sm"
                            onClick={() => {
                                setIsSplit(false);
                                setSelectedIds([]);
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            color="blue"
                            style={{
                                padding: "4px 12px",
                            }}
                            onClick={() => {
                                if (selectedIds.length === 0) {
                                    addToast({ type: "error", title: "Please select at least one material", });
                                    return;
                                }
                                if (selectedIds.length === matrialRequisitionDetailData.length) {
                                    addToast({ type: "error", title: "At least one material must remain in the current requisition." });
                                    return;
                                }

                                setIsAddUpdateModalOpen(true);
                            }} >
                            Split
                        </Button>
                    </div>
                )}
            </section>

            <section className="border border-[#33333321] rounded-xl overflow-hidden mt-5">
                <div className="bg-[#E6FFE6] px-4 py-2 border-b border-[#D0D7DE]">
                    <h4 className="text-sm font-semibold text-[#00A800]">
                        Remarks
                    </h4>
                </div>

                <div className="p-4">
                    <span>{matrialRequisitionData?.Remarks || "-"}</span>
                </div>
            </section>

            {listState.approvalStatus?.toUpperCase() === "APPROVED" && (
                <section className="border border-[#33333321] rounded-xl overflow-hidden mt-5">
                    <div className="bg-[#FCE7F3] px-4 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#BE185D] flex items-center gap-2">
                            Invoice Details

                            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-[#F9CFE2] text-[#BE185D] text-xs font-semibold">
                                {materialRequisitionInvoiceData.length}
                            </span>
                        </h4>
                    </div>

                    <div className="overflow-y-auto thin-scroll">
                        <DataTableWithHeaderRowDivider
                            columns={MaterialRequisitionInvoiceColumns}
                            data={materialRequisitionInvoiceDataWithTotal}
                            emptyMessage="No Invoice Details Found"
                            fixedHeight={true}
                            className="flex-1"
                        />
                    </div>
                </section>
            )}

            {matrialRequisitionData?.CloseCompletionRemark && (
                <section className="border border-[#33333321] rounded-xl overflow-hidden mt-5">
                    <div className="bg-[#FBF9F9] px-4 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#1D1D1D]">
                            {matrialRequisitionData?.MaterialRequisitionStatus} Remark
                        </h4>
                    </div>

                    <div className="p-4">
                        <span>{matrialRequisitionData?.CloseCompletionRemark || "-"}</span>
                    </div>
                </section>
            )}

            <section className="border border-[#33333321] rounded-xl overflow-hidden mt-5">
                <div className="bg-[#E1E2E4] px-4 py-2 border-b border-[#D0D7DE]">
                    <h4 className="text-sm font-semibold text-[#333333]">
                        Action Details
                    </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-[#135bec2e]">
                    <FieldItem label="Created By" value={matrialRequisitionData?.CreatedBy} />
                    <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(matrialRequisitionData?.CreatedDate ?? '')} />
                    <FieldItem label="Modified By" value={matrialRequisitionData?.ModifiedBy} />
                    <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy_hh_mm(matrialRequisitionData?.ModifiedDate ?? '')} />
                </div>
            </section>


            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                }}

                title={'Split Material Requisition'}
                onSubmit={handleSplitMaterialRequisition}
                saveText={'Move To New Requisition'}
                loading={isLoading}
                cancelText="cancel"
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >
                        {selectedMaterials.map((item) => (
                            <div key={item.MaterialRequisitionDetailId} className="flex items-center gap-x-4">
                                <Checkbox checked={selectedIds.includes(item.MaterialRequisitionDetailId)} />
                                <p className="font-semibold">{item.SubMaterialName || item.Level4Name}</p>
                            </div>
                        ))}

                    </div>
                </div>
            </Modal>

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Invoice Approval'
                titleText={invoiceNumber ?? ""}
                subTitleText={String(invoiceAmount ?? 0)}
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest}
            />

            <ApprovalLogModal
                isOpen={isApprovalFinalizedVendorLogModalOpen}
                title='Finalize Vendor'
                titleText={vendorName ?? ""}
                subTitleText={quotation ?? ""}
                onClose={() => setIsApprovalFinalizedVendorLogModalOpen(false)}
                request={approvalFinalizedVendorLogRequest} />

        </div>
    )
}
export default Details;