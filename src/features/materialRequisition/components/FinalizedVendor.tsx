import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader } from "@/core/utils/loader";
import { useToast } from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import * as E from "fp-ts/Either";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Button } from "@/ui/components/forms/Button";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { formatCurrency } from "@/core/utils/comman";
import { Ban, Building2, Check, Circle } from "lucide-react";
import type { AddFinalizedVendorRequest, FilterMaterialWiseQuotationRequest, MaterialWiseQuotation, MaterialWiseVendorQuotation } from "@/features/materialRequisition/models/MaterialRequisitionFinalizedVendorModel";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { materialRequisitionFinalizedVendorService } from "../services/MaterialRequisitionFinalizedVendorService";
interface VendorColumn {
    VendorId: number;
    VendorName: string;
    CompanyName?: string;
    MobileNumberCountryCode?: string;
    MobileNumber?: string;
    EmailId?: string;
    GSTNumber?: string;
}
interface FinalizedVendorApprovalSelection {
    MaterialRequisitionDetailId: number;
    VendorId: number;
    VendorName: string;
    Amount: number;
}
interface FinalizedMaterialWiseVendorRequest {
    MaterialRequisitionDetailId: number;
    VendorId: number;
}
interface FinalizedVendorProps {
    onload?: () => Promise<void>;
}

export const FinalizedVendor: React.FC<FinalizedVendorProps> = ({ onload }) => {

    const { addToast } = useToast();
    const { listState } = useMaterialRequisitionListState();
    const { materialRequisitionId, uniquekey, projectId } = listState;
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [quotationData, setQuotationData] = useState<MaterialWiseQuotation[]>([]);
    const [selectedVendors, setSelectedVendors] = useState<Record<number, number>>({});

    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [vendorName, setVendorName] = useState<string | null>("");
    const [quotation, setQuotation] = useState<string | null>("");

    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<FinalizedVendorApprovalSelection | null>(null);
    const { canAction } = useMenuPermissions('Finalized Vendor');
    const isEditDisabled =
        !canAction ||
        ["CLOSED", "COMPLETED"].includes(listState.materialRequisitionStatus?.trim().toUpperCase() ?? "") ||
        listState.approvalStatus?.trim().toUpperCase() !== "APPROVED";


    const vendorColumns = useMemo<VendorColumn[]>(() => {

        const vendorMap = new Map<number, VendorColumn>();

        quotationData.forEach(material => {

            material.MaterialWiseVendorQuotationData?.forEach(vendor => {

                if (!vendorMap.has(vendor.VendorId)) {

                    vendorMap.set(vendor.VendorId, {
                        VendorId: vendor.VendorId,
                        VendorName: vendor.VendorName || vendor.CompanyName || `Vendor ${vendor.VendorId}`,
                        CompanyName: vendor.CompanyName,
                        GSTNumber: vendor.GSTNumber,
                        MobileNumberCountryCode: vendor.MobileNumberCountryCode,
                        MobileNumber: vendor.MobileNumber,
                        EmailId: vendor.EmailId
                    });

                }

            });

        });

        return Array.from(vendorMap.values());

    }, [quotationData]);


    const pullMaterialWiseQuotation = useCallback(async () => {

        if (!materialRequisitionId || !projectId) {
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const request: FilterMaterialWiseQuotationRequest = {
                    MaterialRequisitionId: Number(materialRequisitionId),
                    Uniquekey: uniquekey ?? "",
                    ProjectId: Number(projectId)
                };

                const response = await materialRequisitionFinalizedVendorService.apiCallPullMaterialWiseQuotation(request);

                if (E.isRight(response)) {

                    const data: MaterialWiseQuotation[] = response.right.Data ?? [];

                    setQuotationData(data);

                    const finalizedSelections: Record<number, number> = {};

                    data.forEach(material => {

                        const finalizedVendor = material.MaterialWiseVendorQuotationData?.find(vendor => vendor.IsFinalized === true);

                        if (finalizedVendor) {

                            finalizedSelections[material.MaterialRequisitionDetailId] = finalizedVendor.VendorId;

                        }

                    });

                    setSelectedVendors(finalizedSelections);

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
            "Loading Material Wise Vendor Quotation"
        );

    }, [materialRequisitionId, uniquekey, projectId, addToast]);

    useEffect(() => {

        pullMaterialWiseQuotation();

    }, [pullMaterialWiseQuotation]);

    const canChangeFinalizedVendor = (material: MaterialWiseQuotation): boolean => {

        const finalizedVendor = material.MaterialWiseVendorQuotationData?.find(vendor => vendor.IsFinalized === true);

        if (!finalizedVendor) return true;

        return finalizedVendor.ApprovalStatus?.trim().toLowerCase() === "pending";
    };

    const handleSelectVendor = (materialRequisitionDetailId: number, vendorId: number) => {

        const material = quotationData.find(item => item.MaterialRequisitionDetailId === materialRequisitionDetailId);

        if (!material) return;

        if (!canChangeFinalizedVendor(material)) {

            return;
        }

        setSelectedVendors(prev => {
            const updated = { ...prev };


            if (updated[materialRequisitionDetailId] === vendorId) {
                delete updated[materialRequisitionDetailId];
            } else {

                updated[materialRequisitionDetailId] = vendorId;
            }

            return updated;
        });
    };

    const handleApprovalLog = (material: MaterialWiseQuotation, vendor: MaterialWiseVendorQuotation) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "FINALIZED VENDOR APPROVAL",
            Id: Number(materialRequisitionId),
            SubId: material.MaterialRequisitionDetailId,
            SubSubId: vendor.VendorId,
            ProjectId: Number(projectId),
        };

        setVendorName(vendor.VendorName ?? "");
        setQuotation(formatCurrency(vendor.Amount ?? 0));

        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectFinalizedVendor = (material: MaterialWiseQuotation, vendor: MaterialWiseVendorQuotation, approvalType: "approve" | "reject") => {
        setApprovalRowData({
            MaterialRequisitionDetailId: material.MaterialRequisitionDetailId,
            VendorId: vendor.VendorId,
            VendorName: vendor.VendorName ?? "",
            Amount: Number(vendor.Amount ?? 0),
        });

        setVendorName(vendor.VendorName ?? "");
        setQuotation(formatCurrency(vendor.Amount ?? 0));

        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);
    };

    const columns = useMemo<TableColumn[]>(() => {

        const materialColumn: TableColumn = {
            key: "MaterialName",
            label: (
                <div className="flex flex-col gap-1 py-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                        MATERIAL NAME
                    </span>

                    <span className="text-xs font-normal text-slate-400">
                        {quotationData.length} Items submitted
                    </span>
                </div>
            ),
            sortable: false,
            width: "25",
            fixed: "left",
            align: "left",

            render: (_value, row: MaterialWiseQuotation) => {
                return (
                    <div className="flex flex-col gap-2 py-2">

                        <div>
                            <span className="inline-block max-w-full rounded bg-[#B45309] px-2 py-0.5 text-[11px] font-medium text-white whitespace-normal break-words">
                                {row.MaterialRequisitionType?.toUpperCase() === "DIRECT" ? row.Level4Name ?? "-" : row.MaterialName ?? "-"}
                            </span>
                        </div>

                        {row.MaterialRequisitionType?.toUpperCase() === "IN - DIRECT" && (
                            <p className="text-[13px] font-medium text-slate-800 leading-5 break-words">
                                {row.SubMaterialName}
                            </p>
                        )}

                        <div className="border-t border-slate-100 mt-1" />

                        <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-slate-400">
                                Required Qty :
                            </span>

                            <span className="font-semibold text-slate-800">
                                {row.MaterialQuantity || 0}{" "}
                                {row.MaterialRequisitionType?.toUpperCase() === "DIRECT" ? row.Level4SubMaterialUomCode || "" : row.UomCode || ""}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-slate-400">
                                Required Date :
                            </span>

                            <span className="font-medium text-slate-700">
                                {formatDate_dd_MonthName_yy(row.RequiredDate || "-")}
                            </span>
                        </div>

                    </div>
                );
            }
        };

        const dynamicVendorColumns: TableColumn[] = vendorColumns.map(
            vendor => ({

                key: `Vendor_${vendor.VendorId}`,
                label: (
                    <div className="flex flex-col gap-1 min-w-[200px] py-2">

                        <span className="text-[13px] font-semibold text-slate-800">
                            {vendor.VendorName}
                        </span>

                        <span className="flex items-start gap-1.5 min-w-0 max-w-full text-xs text-slate-500">
                            <Building2 size={13} className="text-slate-400 shrink-0 mt-0.5" />

                            <span className="min-w-0 whitespace-normal break-words">
                                {vendor.CompanyName || "-"}
                            </span>
                        </span>

                        <div className="mt-2 space-y-1">

                            <div className="flex items-start gap-2 text-[11px]">
                                <span className="w-10 shrink-0 text-slate-400">
                                    GST
                                </span>

                                <span className="text-slate-700 break-all">
                                    : {vendor.GSTNumber || "-"}
                                </span>
                            </div>

                            <div className="flex items-start gap-2 text-[11px]">
                                <span className="w-10 shrink-0 text-slate-400">
                                    Mobile
                                </span>

                                <span className="text-slate-700">
                                    : {vendor.MobileNumber ? `${vendor.MobileNumberCountryCode || ""} ${vendor.MobileNumber}` : "-"}
                                </span>
                            </div>

                            <div className="flex items-start gap-2 text-[11px]">
                                <span className="w-10 shrink-0 text-slate-400">
                                    Email
                                </span>

                                <span className="text-slate-700 break-all">
                                    : {vendor.EmailId || "-"}
                                </span>
                            </div>

                        </div>

                    </div>
                ),

                sortable: false,

                width: "25",

                align: "left",
                render: (_value, row: MaterialWiseQuotation) => {

                    const vendorQuotation = row.MaterialWiseVendorQuotationData?.find(item => item.VendorId === vendor.VendorId);

                    if (!vendorQuotation || Number(vendorQuotation.Amount ?? 0) === 0) {
                        return (
                            <div className="flex min-h-[126px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">

                                <div className="flex flex-col items-center gap-2">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                                        <Ban size={17} className="text-slate-400" />
                                    </div>

                                    <span className="text-xs font-semibold text-slate-500">
                                        Not Quoted
                                    </span>

                                </div>

                            </div>
                        );
                    }

                    const isSelected = selectedVendors[row.MaterialRequisitionDetailId] === vendor.VendorId;

                    const canChangeVendor = canChangeFinalizedVendor(row);

                    return (
                        <div
                            onClick={() => {
                                if (canChangeVendor && !isEditDisabled) {
                                    handleSelectVendor(row.MaterialRequisitionDetailId, vendor.VendorId);
                                }
                            }}
                            className={`min-h-[126px] rounded-xl border p-3  transition-all ${isSelected ? "border-[#6EE7B7] bg-emerald-50/30" : "border-slate-200 bg-white hover:border-blue-300"}
                            ${canChangeVendor && !isEditDisabled ? "cursor-pointer" : "cursor-default"}`}
                        >

                            <div className="flex items-center justify-between gap-2">

                                <div className="flex items-center gap-2">

                                    {isSelected ? (
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                                            <Check size={11} strokeWidth={3} className="text-white" />
                                        </span>
                                    ) : (
                                        <Circle size={16} className="text-slate-300 shrink-0" />
                                    )}

                                    <span className="text-[13px] font-semibold text-slate-700">
                                        Total Quote
                                    </span>

                                </div>

                                <span className={`text-[14px] font-bold whitespace-nowrap ${isSelected ? "text-emerald-700" : "text-slate-800"} `}  >
                                    {formatCurrency(vendorQuotation.Amount ?? 0)}
                                </span>

                            </div>

                            <div className="border-t border-slate-100 my-2" />

                            <div className="space-y-1.5 text-[11px]">

                                <div className="flex items-center justify-between gap-2">

                                    <span className="text-slate-500">
                                        Installation
                                    </span>

                                    <span className="font-medium text-slate-700">
                                        {formatCurrency(vendorQuotation.Installation ?? 0)}
                                    </span>

                                </div>

                                {Number(vendorQuotation.CGST ?? 0) > 0 && (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-slate-400">CGST</span>
                                        <span className="text-slate-600">  {vendorQuotation.CGST}% </span>
                                    </div>
                                )}

                                {Number(vendorQuotation.SGST ?? 0) > 0 && (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-slate-400">SGST</span>
                                        <span className="text-slate-600"> {vendorQuotation.SGST}% </span>
                                    </div>
                                )}

                                {Number(vendorQuotation.UGST ?? 0) > 0 && (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-slate-400">UGST</span>
                                        <span className="text-slate-600">   {vendorQuotation.UGST}%  </span>
                                    </div>
                                )}

                                {Number(vendorQuotation.TGST ?? 0) > 0 && (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-slate-400">TGST</span>
                                        <span className="text-slate-600"> {vendorQuotation.TGST}% </span>
                                    </div>
                                )}

                            </div>

                            {vendorQuotation.IsFinalized === true && (
                                <div className="mt-3 border-t border-slate-100 pt-3" onClick={e => e.stopPropagation()}  >
                                    <ApprovalActions
                                        approvalStatus={vendorQuotation.ApprovalStatus ?? "-"}
                                        showApproval={vendorQuotation.IsApproval ?? false}
                                        isIcons={true}
                                        onHistory={() => handleApprovalLog(row, vendorQuotation)}
                                        onApprove={() => handleApproveRejectFinalizedVendor(row, vendorQuotation, "approve")}
                                        onReject={() => handleApproveRejectFinalizedVendor(row, vendorQuotation, "reject")}
                                    />
                                </div>
                            )}

                        </div>
                    );
                }


            })

        );

        return [

            materialColumn,

            ...dynamicVendorColumns

        ];

    }, [vendorColumns, selectedVendors, handleApprovalLog, handleApproveRejectFinalizedVendor]);


    const handleFinalizeVendor = async () => {

        if (!quotationData.length) {
            addToast({ type: "error", title: "No quotation data available." });
            return;
        }

        const details: FinalizedMaterialWiseVendorRequest[] = [];

        quotationData.forEach(material => {

            const selectedVendorId = selectedVendors[material.MaterialRequisitionDetailId];

            const selectedVendor =
                material.MaterialWiseVendorQuotationData?.find(
                    vendor =>
                        vendor.VendorId === selectedVendorId &&
                        Number(vendor.Amount ?? 0) > 0
                );

            if (!selectedVendor) {
                return;
            }

            details.push({
                MaterialRequisitionDetailId: material.MaterialRequisitionDetailId,
                VendorId: selectedVendor.VendorId
            });

        });



        const payload: AddFinalizedVendorRequest = {
            MaterialRequisitionId: Number(materialRequisitionId),
            Uniquekey: uniquekey ?? "",
            ProjectId: Number(projectId),
            MaterialRequisitionDetailIdWiseVendorIdJSON: JSON.stringify(details)

        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await materialRequisitionFinalizedVendorService.apiCallAddFinalizedVendor(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: "Vendor finalized successfully" });

                    setQuotationData(response.right.Data);

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
            "Finalizing Material Wise Vendor"
        );

    };

    const selectedCount = useMemo(() => {
        return quotationData.filter(material => {

            const selectedVendorId = selectedVendors[material.MaterialRequisitionDetailId];

            if (!selectedVendorId) return false;

            return material.MaterialWiseVendorQuotationData?.some(vendor => vendor.VendorId === selectedVendorId && Number(vendor.Amount ?? 0) > 0) ?? false;
        }).length;

    }, [quotationData, selectedVendors]);

    const handleApprovalSubmit = async (remark: string) => {

        if (!approvalRowData) {
            addToast({ type: "error", title: "Approval details not found.", });
            return;
        }

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "FINALIZED VENDOR APPROVAL",
            Id: Number(materialRequisitionId),
            SubId: approvalRowData.MaterialRequisitionDetailId,
            SubSubId: approvalRowData.VendorId,
            ProjectId: Number(projectId),
            IsApproved: approvalActionType === "approve",
            Remarks: remark ?? null,
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0], });

                    setIsApprovalActionModalOpen(false);

                    setApprovalRowData(null);

                    await pullMaterialWiseQuotation();

                    await onload?.();

                } else {

                    addToast({ type: "error", title: response.left.message, });

                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message, });
            },
            undefined,
            approvalActionType === "approve" ? "Approving Finalized Vendor" : "Rejecting Finalized Vendor"
        );
    };


    const areAllVendorsApproved = useMemo(() => {

        return quotationData.length > 0 &&

            quotationData.every(material => {

                const finalizedVendor = material.MaterialWiseVendorQuotationData?.find(vendor => vendor.IsFinalized);

                return ["APPROVED", "PARTIAL APPROVED"].includes(finalizedVendor?.ApprovalStatus?.toUpperCase() ?? "");

            });

    }, [quotationData]);

    return (

        <div className="bg-white p-1 pt-5">

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

                <div>

                    <h2 className="text-lg font-semibold text-gray-800">

                        Material Wise Vendor Finalization

                    </h2>

                    <p className="text-sm text-gray-500 mt-1">

                        Select one vendor for each material.

                    </p>

                </div>
                {!isEditDisabled && (
                    <div className="flex items-center gap-3">

                        <Button
                            type="button"
                            color="blue"
                            size="sm"
                            disabled={

                                isLoading ||
                                quotationData.length === 0 ||
                                selectedCount === 0 ||
                                areAllVendorsApproved

                            }
                            onClick={handleFinalizeVendor}
                        >
                            Finalize Vendor
                        </Button>

                    </div>
                )}

            </div>

            <DataTable
                data={quotationData}
                columns={columns}
                emptyMessage="No Material Wise Quotation Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"

            />

            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Finalized Vendor'
                titleText={vendorName ?? ""}
                subTitleText={quotation ?? ""}
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest} />

            <ApprovalActionModal
                title="Finalized Vendor"
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                titleText={vendorName ?? ""}
                subTitleText={quotation ?? ""}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />

        </div>

    );

};

export default FinalizedVendor;