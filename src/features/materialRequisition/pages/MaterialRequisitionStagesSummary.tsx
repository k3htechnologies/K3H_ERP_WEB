import { useEffect, useMemo, useState } from "react";
import { Loader } from "@/core/utils/loader";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { materialRequisitionService } from "@/features/materialRequisition/services/MaterialRequisitionService";
import type { FilterMaterialRequisitionStagesSummary, MaterialRequisitionStagesSummary as MaterialRequisitionStagesSummaryData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { handleExportFile } from "@/core/utils/exportFile";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { CheckCircle2, CircleDashed, MinusCircle, Package, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as E from "fp-ts/Either";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";
import { FieldItem } from "@/ui/components/forms/FieldItem";

const normalizeStatus = (status?: string | null) => {
    return (status ?? "").toUpperCase().replace(/[^A-Z]/g, "");
};



interface StageStatusProps {
    status?: string | null;
}

const StageStatus = ({ status }: StageStatusProps) => {

    const normalizedStatus = normalizeStatus(status);

    if (["COMPLETED", "APPROVED"].includes(normalizedStatus)) {
        return (
            <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" />

                <span className="text-sm font-semibold">
                    {normalizedStatus === "APPROVED" ? "Approved" : "Completed"}
                </span>
            </div>
        );
    }

    if (normalizedStatus === "INPROGRESS") {
        return (
            <div className="flex items-center gap-1.5 text-blue-600">
                <CircleDashed className="h-4 w-4 shrink-0" />

                <span className="text-sm font-semibold">
                    In Progress
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 text-gray-400">
            <MinusCircle className="h-4 w-4 shrink-0" />

            <span className="text-sm font-medium">
                Pending
            </span>
        </div>
    );
};

// ================= STAGE DATE COMPONENT =================

interface StageDateProps { label: string; value?: string | null; }

const StageDate = ({ label, value }: StageDateProps) => {

    return (
        <div className="flex flex-col gap-0.5">

            <span className="text-[12px] text-gray-500">
                {label}
            </span>

            <span className="text-xs font-medium text-gray-700 whitespace-normal [overflow-wrap:anywhere]">
                {value ? formatDate_dd_MonthName_yy_hh_mm(value) : "-"}
            </span>

        </div>
    );
};



// ================= COMMON STAGE BOX =================

const StageBox = ({ children }: { children: React.ReactNode }) => (
    <div className="box-border w-[200px] min-w-[200px] max-w-[200px] h-[220px] min-h-[220px] max-h-[220px] shrink-0 flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 overflow-y-auto overflow-x-hidden [overflow-wrap:anywhere] [&>*]:shrink-0 thin-scroll">
        {children}
    </div>
);

// ================= MAIN COMPONENT =================

export const MaterialRequisitionStagesSummary: React.FC = () => {

    const navigate = useNavigate();

    const { addToast } = useToast();

    const { listState } = useMaterialRequisitionListState();

    const [isLoading, setIsLoading] = useState(false);

    const [loadingMessage, setLoadingMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [materialRequisitionStagesSummaryData, setMaterialRequisitionStagesSummaryData] = useState<MaterialRequisitionStagesSummaryData[]>([]);

    const loadDetailsData = async (search: string = "") => {

        if (!listState.materialRequisitionId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterMaterialRequisitionStagesSummary = {
                    MaterialRequisitionId: listState.materialRequisitionId,
                    ProjectId: Number(listState.projectId),
                    MaterialSubMaterial: search.trim()
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisitionStagesSummary(params);

                if (E.isRight(response)) {

                    setMaterialRequisitionStagesSummaryData(response.right.Data ?? []);

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
            "Loading Material Requisition Stages"
        );
    };

    useEffect(() => {

        loadDetailsData("");

        return () => {
            debouncedSearch.cancel?.();
        };

    }, [listState.materialRequisitionId, listState.projectId]);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        loadDetailsData(value.trim());
    }, 350);

    const searchMaterialRequisitionStagesSummary = (value: string) => {

        setSearchTerm(value);

        debouncedSearch(value);
    };

    const clearSearchMaterialRequisitionStagesSummary = () => {

        debouncedSearch.cancel?.();

        setSearchTerm("");

        loadDetailsData("");
    };


    const MaterialRequisitionStagesSummaryColumns =
        useMemo<TableColumn[]>(() => [

            // ================= MATERIAL DETAILS =================

            {
                key: "MaterialName",
                label: "Material Details",
                width: "30",
                sortable: false,
                fixed: "left",
                align: "left",

                render: (_, row: MaterialRequisitionStagesSummaryData) => {

                    const isDirect = row.MaterialRequisitionType?.toUpperCase() === "DIRECT";

                    const materialName = isDirect ? row.Level4Name : row.SubMaterialName;

                    const uom = isDirect ? row.Level4SubMaterialUomCode : row.UomCode;

                    return (
                        <div className="flex flex-col gap-2 py-2">


                            {!isDirect && (
                                <span className="text-sm font-semibold text-gray-500">
                                    {row.MaterialName || "-"}
                                </span>
                            )}

                            <span className="text-sm font-semibold text-gray-800 whitespace-normal [overflow-wrap:anywhere]">
                                {materialName || "-"}
                            </span>

                            {isDirect && (
                                <div className="flex flex-col gap-1 text-[11px] text-gray-500">

                                    {[row.Level1Name, row.Level2Name, row.Level3Name].filter(Boolean).map((level, index) => (

                                        <span key={index}> {level} </span>

                                    ))}

                                </div>
                            )}

                            <div className="flex items-center gap-1.5 text-xs">

                                <Package className="h-3.5 w-3.5 text-gray-400" />

                                <span className="text-gray-500">
                                    Quantity:
                                </span>

                                <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap">
                                    {row.MaterialQuantity ?? 0} {uom}
                                </span>

                            </div>

                            <StageDate label="Required Date" value={row.RequiredDate} />

                            {row?.Remark?.trim() ? (<FieldInfoTooltip label="Remarks" value={row.Remark} />) : (<FieldItem label="Remarks" value="-" />)}

                        </div>
                    );
                }
            },

            // ================= REQUISITION =================

            {
                key: "RequisitionStageStatus",
                label: "1. Requisition",
                width: "20",
                sortable: false,
                align: "left",

                render: (_, row) => (

                    <StageBox>

                        <StageStatus status={row.RequisitionStageStatus} />

                        <StageDate label="Applied Date" value={row.RequisitionAppliedDate} />

                        <StageDate label="Approved Date" value={row.RequisitionApprovedDate} />

                    </StageBox>
                )
            },

            // ================= ENQUIRY =================

            {
                key: "EnquiryStageStatus",
                label: "2. Enquiry",
                width: "20",
                sortable: false,
                align: "left",

                render: (_, row) => (

                    <StageBox>

                        <StageStatus status={row.EnquiryStageStatus} />

                        <StageDate label="Enquiry Float Date" value={row.EnquiryFloatDate} />

                        <div className="flex items-center gap-1.5 text-xs">


                            <span className="text-gray-500">
                                Total Vendors :
                            </span>

                            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 whitespace-normal [overflow-wrap:anywhere]">
                                {row.TotalEnquiryCount ?? 0}
                            </span>

                        </div>

                    </StageBox>
                )
            },

            // ================= QUOTATION =================

            {
                key: "QuotationStageStatus",
                label: "3. Quotation",
                width: "20",
                sortable: false,
                align: "left",

                render: (_, row) => (

                    <StageBox>

                        <StageStatus status={row.QuotationStageStatus} />

                        <StageDate label="First Received" value={row.QuotationReceivedDate} />

                        <StageDate label="Last Received" value={row.LastQuotationReceivedDate} />

                        <div className="flex items-center gap-1.5 text-xs">


                            <span className="text-gray-500">
                                Quotations :
                            </span>

                            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 whitespace-normal [overflow-wrap:anywhere]">
                                {row.TotalQuotationReceivedCount ?? 0}
                            </span>

                        </div>


                    </StageBox>
                )
            },

            // ================= FINALIZED VENDOR =================

            {
                key: "FinalizedVendorStageStatus",
                label: "4. Finalized Vendor",
                width: "20",
                sortable: false,
                align: "left",

                render: (_, row) => (

                    <StageBox>

                        <StageStatus status={row.FinalizedVendorStageStatus} />

                        {row.FinalizedVendorId ? (

                            <>
                                <div className="flex flex-col gap-1">

                                    <span className="text-sm font-medium text-gray-800 whitespace-normal [overflow-wrap:anywhere]">
                                        {row.VendorCompanyName || "-"}
                                    </span>




                                    <span className="text-xs text-gray-500">
                                        {row.VendorName || "-"}
                                    </span>

                                    <span className="text-xs font-semibold text-blue-700 whitespace-normal [overflow-wrap:anywhere]">
                                        {row.VendorSystemGeneratedCode}
                                    </span>

                                </div>

                                <StageDate label="Approved Date" value={row.FinalizedVendorApprovedDate} />

                            </>

                        ) : (

                            <span className="text-xs text-gray-400">
                                Vendor not finalized
                            </span>

                        )}

                    </StageBox>
                )
            },

            // ================= PURCHASE ORDER =================

            {
                key: "POStageStatus",
                label: "5. Purchase Order",
                width: "20",
                sortable: false,
                align: "left",

                render: (_, row) => (

                    <StageBox>

                        <StageStatus status={row.POStageStatus} />

                        {row.POSystemGeneratedCode && (

                            <div className="flex flex-nowrap items-center gap-1.5">

                                <span className="text-md font-semibold text-blue-700 whitespace-nowrap">
                                    {row.POSystemGeneratedCode}
                                </span>

                                {row.PurchaseOrderURL && (

                                    <div className="shrink-0">

                                        <MultiImageViewer
                                            images={parseDocumentUrls(row.PurchaseOrderURL)}
                                            title={`Purchase Order - ${row.POSystemGeneratedCode || ""}`}
                                            isIcon={false}
                                            triggerLabel="Purchase Order"
                                        />

                                    </div>

                                )}

                            </div>
                        )}

                        <StageDate label="Generated Date" value={row.PurchaseOrderGeneratedDate} />

                    </StageBox>
                )
            },

            // ================= GRN =================

            {
                key: "GRNStageStatus",
                label: "6. GRN",
                width: "20",
                sortable: false,
                align: "left",

                render: (_, row) => {

                    const requiredQuantity = Number(row.MaterialQuantity ?? 0);

                    const receivedQuantity = Number(row.TotalReceivedMaterialQuantity ?? 0);

                    const pendingQuantity = Number(row.PendingMaterialQuantity ?? 0);

                    const percentage = requiredQuantity > 0 ? Math.min(100, Math.round((receivedQuantity / requiredQuantity) * 100)) : 0;

                    return (

                        <StageBox>

                            <StageStatus status={row.GRNStageStatus} />

                            <div className="flex flex-col gap-1.5">

                                <div className="flex items-center justify-between gap-2 text-xs">

                                    <span className="text-gray-500">
                                        Received
                                    </span>

                                    <span className="font-semibold text-gray-800">
                                        {receivedQuantity} / {requiredQuantity}
                                    </span>

                                </div>

                                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden thin-scroll">

                                    <div
                                        className={`h-full rounded-full transition-all ${percentage === 100
                                            ? "bg-green-500"
                                            : "bg-blue-500"
                                            }`}
                                        style={{
                                            width: `${percentage}%`
                                        }}
                                    />

                                </div>

                                <div className="flex justify-between text-[10px]">

                                    <span className={
                                        pendingQuantity > 0
                                            ? "text-orange-600"
                                            : "text-green-600"
                                    }>
                                        Pending: {pendingQuantity}
                                    </span>

                                    <span className="font-semibold text-gray-600">
                                        {percentage}%
                                    </span>

                                </div>

                            </div>

                            <div className="flex items-center gap-1.5 text-xs">


                                <span className="text-gray-500">
                                    Total GRN :
                                </span>

                                <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 whitespace-normal [overflow-wrap:anywhere]">
                                    {row.TotalGRNCount ?? 0}
                                </span>

                            </div>

                            <StageDate label="First Received" value={row.FirstMaterialReceivedDate} />

                            <StageDate label="Last Received" value={row.LastMaterialReceivedDate} />

                            {row.MaterialReceivedCompletedDate && (

                                <StageDate label="Completed Date" value={row.MaterialReceivedCompletedDate} />

                            )}

                        </StageBox>
                    );
                }
            },

            // ================= INVOICE =================

            {
                key: "InvoiceStageStatus",
                label: "7. Invoice",
                width: "20",
                sortable: false,
                align: "left",

                render: (_, row) => (

                    <StageBox>

                        <StageStatus status={row.InvoiceStageStatus} />

                        <div className="flex items-center gap-1.5 text-xs">


                            <span className="text-gray-500">
                                Total Invoice :
                            </span>

                            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 whitespace-normal [overflow-wrap:anywhere]">
                                {row.TotalInvoiceCount ?? 0}
                            </span>

                        </div>

                        <div className="flex items-center gap-1.5 text-xs">


                            <span className="text-gray-500 text-xs">
                                Approved Invoice :
                            </span>

                            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 whitespace-normal [overflow-wrap:anywhere]">
                                {row.ApprovedInvoiceCount ?? 0}
                            </span>

                        </div>


                        <StageDate label="First Invoice" value={row.InvoiceReceivedDate} />

                        <StageDate label="Last Invoice" value={row.LastInvoiceReceivedDate} />

                    </StageBox>
                )
            },

            // ================= CURRENT STAGE =================

            {
                key: "CurrentStage",
                label: "Current Stage",
                width: "30",
                sortable: false,
                fixed: "right",
                align: "center",

                render: (value) => {

                    const completed = ["COMPLETED", "INVOICEAPPROVED"].includes(normalizeStatus(value));

                    const closed = normalizeStatus(value) === "CLOSED";

                    return (

                        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold whitespace-normal
                            ${completed
                                ? "bg-green-50 border-green-200 text-green-700"
                                : closed
                                    ? "bg-gray-100 border-gray-200 text-gray-600"
                                    : "bg-blue-50 border-blue-200 text-blue-700"
                            }`}>

                            {completed ? (

                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />

                            ) : closed ? (

                                <MinusCircle className="h-3.5 w-3.5 shrink-0" />

                            ) : (

                                <Clock className="h-3.5 w-3.5 shrink-0" />

                            )}

                            {value || "-"}

                        </span>
                    );
                }
            }

        ], []);

    const handleExportExcel = async () => {

        if (!listState.materialRequisitionId) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterMaterialRequisitionStagesSummary = {
                    MaterialRequisitionId: listState.materialRequisitionId,
                    ProjectId: Number(listState.projectId),
                    MaterialSubMaterial: searchTerm.trim(),
                    ExportType: "Excel" as const
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisitionStagesSummary(params);

                handleExportFile(response, "Excel", "Material Requisition Stages Summary", addToast);

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message || "Export failed" });
            },
            undefined,
            "Preparing Export"
        );
    };

    // ================= RENDER =================

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>


            <HeaderActionBar
                subTitleText={`MR Stages Details : ${listState.systemGeneratedCode ?? "-"}`}
                subSubTitleText={listState?.projectName ?? "-"}
                subSubSubTitleText={listState?.materialRequisitionStatus ?? "-"}
                cancelText="Cancel"
                onCancel={() => navigate(-1)}
                EditText="Edit"
                canAction={false}

            />

            <div className="pt-5">
                <TableActionToolbar
                    isShowSearchBar
                    searchTerm={searchTerm}
                    searchPlaceholder="Search Material / Sub Material"
                    onSearchChange={searchMaterialRequisitionStagesSummary}
                    onClearSearch={clearSearchMaterialRequisitionStagesSummary}
                    isShowExportButton={materialRequisitionStagesSummaryData.length > 0}
                    onExportExcel={handleExportExcel}
                    exportLoading={isLoading}
                />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-200 px-4 py-2 text-[14px] text-slate-500" >
                <div className="flex flex-wrap items-center gap-3" >< span className="font-semibold text-slate-700" > Stage Legend:</ span >< span className="flex items-center gap-1" >< CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Completed Milestone </ span >< span className="flex items-center gap-1" >< CircleDashed className="h-3.5 w-3.5 text-blue-600" /> Active Work -in-Progress </ span >< span className="flex items-center gap-1" >< MinusCircle className="h-3.5 w-3.5 text-slate-400" /> Upcoming Stage </ span ></ div >
                <div className="flex items-center gap-2" >Material Type:< span className="rounded bg-blue-50 px-2 py-1 font-semibold text-blue-600" >{[...new Set(materialRequisitionStagesSummaryData.map(row => row.MaterialRequisitionType).filter(Boolean))].join(" / ") || "-"}</ span ></ div >
            </div>

            <DataTable
                data={materialRequisitionStagesSummaryData}
                columns={MaterialRequisitionStagesSummaryColumns}
                emptyMessage="No Material Requisition Stages Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
            />

        </div>
    );
};

export default MaterialRequisitionStagesSummary;