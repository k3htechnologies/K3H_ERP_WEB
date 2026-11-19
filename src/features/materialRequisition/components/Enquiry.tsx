import { useCallback, useEffect, useState } from "react";
import type { MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import type { FilterPullVendorForEnquiryRequest } from "@/features/materialRequisition/models/MaterialRequisitionEnquiryModel";
import { useParams } from "react-router-dom";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import { materialRequisitionEnquiryService } from "@/features/materialRequisition/services/MaterialRequisitionEnquiryService";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import Checkbox from "@/ui/components/forms/Checkbox";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { VendorData } from "@/features/vendor/models/VendorModel";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { Building2 } from "lucide-react";

interface InquiryProps {
    materialRequisitionDetailData: MaterialRequisitionDetailData[];
}

const Enquiry: React.FC<InquiryProps> = ({ materialRequisitionDetailData }) => {

    const pendingMaterialRequisitionDetailData = materialRequisitionDetailData.filter(item => item.ApprovalStatus?.trim().toUpperCase() === "PENDING");

    const [selectedMaterialIds, setSelectedMaterialIds] = useState<string | null>(null);
    const [selectedVendorIds, setSelectedVendorIds] = useState<string | null>(null);
    const [materialRequisitionVendorFinalizedList, setMaterialRequisitionVendorFinalizedList] = useState<VendorData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { addToast } = useToast();
    const { canAction } = useMenuPermissions('Get Quotation');


    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();

    const { listState } = useMaterialRequisitionListState();

    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.materialRequisitionId;

    const currentUniquekey = listState.uniquekey;

    const projectId = listState.projectId;

    const isActionDisabled = !canAction || ["CLOSED", "COMPLETED"].includes(listState?.materialRequisitionStatus?.trim().toUpperCase() ?? "");

    const [vendorSearch, setVendorSearch] = useState("");

    const debouncedVendorSearch = useDebouncedCallback((value: string) => {
        if (selectedMaterialIds) {
            pullVendorForEnquiry(selectedMaterialIds, value);
        }
    }, 350);

    const pullVendorForEnquiry = useCallback(async (materialIds: string, searchText: string = "") => {

        if (!materialIds) {
            setMaterialRequisitionVendorFinalizedList([]);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterPullVendorForEnquiryRequest = {
                    MaterialRequisitionId: Number(currentMaterialRequisitionId),
                    MaterialRequisitionDetailId: materialIds,
                    Uniquekey: currentUniquekey ?? "",
                    ProjectId: Number(projectId),
                    SearchVendor: searchText.trim()
                };

                const response = await materialRequisitionEnquiryService.apiCallpullVendorsForEnquiry(params);

                if (E.isRight(response)) {
                    setMaterialRequisitionVendorFinalizedList(response.right.Data ?? []);
                } else {
                    setMaterialRequisitionVendorFinalizedList([]);
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) =>
                addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Vendor"
        );

    }, [currentMaterialRequisitionId, currentUniquekey, projectId, addToast]);

    useEffect(() => {

        if (!projectId || !currentMaterialRequisitionId || !selectedMaterialIds) {

            setMaterialRequisitionVendorFinalizedList([]);

            setSelectedVendorIds(null);

            return;
        }

        pullVendorForEnquiry(selectedMaterialIds, vendorSearch);

    }, [projectId, currentMaterialRequisitionId, selectedMaterialIds, pullVendorForEnquiry]);

    const handleMaterialChange = (materialId: number, checked: boolean) => {

        const selectedIds = selectedMaterialIds ? selectedMaterialIds.split(",").map(Number) : [];

        const updatedIds = checked ? [...new Set([...selectedIds, materialId])] : selectedIds.filter(id => id !== materialId);

        const idsString = updatedIds.join(",");

        setSelectedMaterialIds(idsString || null);

        setSelectedVendorIds(null);

    };

    const handleSelectAllMaterials = (checked: boolean) => {
        if (checked) {
            const allMaterialIds = pendingMaterialRequisitionDetailData.map(item => item.MaterialRequisitionDetailId);

            setSelectedMaterialIds(allMaterialIds.join(","));
        } else {
            setSelectedMaterialIds(null);
        }

        setSelectedVendorIds(null);
    };

    const handleVendorChange = (vendorId: number, checked: boolean) => {

        const selectedIds = selectedVendorIds ? selectedVendorIds.split(",").map(Number) : [];

        const updatedIds = checked ? [...new Set([...selectedIds, vendorId])] : selectedIds.filter(id => id !== vendorId);

        setSelectedVendorIds(updatedIds.join(",") || null);

    };

    const handleSelectAllVendors = (checked: boolean) => {
        const visibleVendorIds = materialRequisitionVendorFinalizedList.map(
            item => item.VendorId
        );

        const currentSelectedIds = selectedVendorIds
            ? selectedVendorIds.split(",").map(Number)
            : [];

        const updatedIds = checked
            ? [...new Set([...currentSelectedIds, ...visibleVendorIds])]
            : currentSelectedIds.filter(id => !visibleVendorIds.includes(id));

        setSelectedVendorIds(updatedIds.join(",") || null);
    };


    const PushVendorForEnquiry = (vendorIds: string) => {

        return {
            MaterialRequisitionId: Number(currentMaterialRequisitionId),
            MaterialRequisitionDetailId: selectedMaterialIds ?? "",
            Uniquekey: currentUniquekey ?? "",
            ProjectId: Number(projectId),
            VendorId: vendorIds
        };

    };

    const handleAddVendorForEnquiry = async (e?: React.FormEvent) => {

        e?.preventDefault();

        if (!selectedMaterialIds) {

            addToast({ type: "error", title: "Please select at least one Material." });

            return;
        }

        if (!selectedVendorIds) {

            addToast({ type: "error", title: "Please select at least one Vendor." });

            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const vendorIds = selectedVendorIds;

                const payload = PushVendorForEnquiry(vendorIds);

                const response = await materialRequisitionEnquiryService.apiCallAddVendorForEnquiry(payload);

                if (E.isRight(response)) {

                    setSelectedMaterialIds(null);

                    setSelectedVendorIds(null);

                    setMaterialRequisitionVendorFinalizedList([]);

                    setVendorSearch("");

                    debouncedVendorSearch.cancel?.();

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                } else {

                    addToast({ type: "error", title: response.left?.message || "Unable to send enquiry." });

                }

                return response;

            },
            undefined,
            (error: any) => {

                addToast({ type: "error", title: error.message });

            },
            undefined,
            "Sending Enquiry to Vendors"
        );

    };



    return (

        <div>
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>

            {pendingMaterialRequisitionDetailData.length === 0 ? (

                <section className="md:col-span-4 bg-white rounded-xl  p-6 border-[0.1px] border-[#3333334f] mt-5">
                    <NoDataView message="No Pending Materials are available for Vendor Enquiry" />
                </section>

            )
                : (
                    <>
                        <div className="pt-5">

                            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">

                                {/* ================= SELECT MATERIAL ================= */}

                                <div className="lg:col-span-4 min-w-0 border border-gray-200 rounded-lg bg-white overflow-hidden">

                                    <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">

                                        <div className="flex items-center gap-2">

                                            <Checkbox
                                                disabled={isActionDisabled}
                                                checked={
                                                    pendingMaterialRequisitionDetailData.length > 0 &&
                                                    pendingMaterialRequisitionDetailData.every(item => selectedMaterialIds?.split(",").includes(String(item.MaterialRequisitionDetailId)))
                                                }
                                                onChange={() => {
                                                    const allSelected =
                                                        pendingMaterialRequisitionDetailData.length > 0 &&
                                                        pendingMaterialRequisitionDetailData.every(item => selectedMaterialIds?.split(",").includes(String(item.MaterialRequisitionDetailId)));

                                                    handleSelectAllMaterials(!allSelected);
                                                }}
                                                aria-label="Select All Materials"
                                            />

                                            <h3 className="text-md font-semibold text-gray-800">
                                                Select Material
                                            </h3>

                                        </div>

                                        <span className="rounded bg-indigo-50 px-2 py-1 text-sm font-semibold text-indigo-600">
                                            {selectedMaterialIds?.split(",").filter(Boolean).length || 0} Selected
                                        </span>

                                    </div>

                                    <div className="max-h-[450px] overflow-y-auto thin-scroll">

                                        {pendingMaterialRequisitionDetailData.map((item) => {

                                            const isChecked = selectedMaterialIds?.split(",").includes(String(item.MaterialRequisitionDetailId)) ?? false;

                                            return (
                                                <div
                                                    key={item.MaterialRequisitionDetailId}
                                                    onClick={() => !isActionDisabled && handleMaterialChange(item.MaterialRequisitionDetailId, !isChecked)
                                                    }
                                                    className={`border-b border-gray-100 px-3 py-3 cursor-pointer transition-all duration-200 ${isChecked
                                                        ? "bg-[#F5F8FF] border-l-[3px] border-l-blue-600"
                                                        : "bg-white  border-l-[3px] border-l-transparent"
                                                        }`}
                                                >


                                                    <div className="flex items-start justify-between gap-3">

                                                        <div className="flex items-start gap-2 min-w-0">

                                                            <Checkbox
                                                                disabled={isActionDisabled}
                                                                checked={isChecked}
                                                                onChange={() =>
                                                                    handleMaterialChange(item.MaterialRequisitionDetailId, !isChecked)
                                                                }
                                                                onClick={(e) => e.stopPropagation()}
                                                                aria-label={`Select ${item.MaterialName}`}
                                                            />

                                                            <div className="min-w-0">

                                                                <p className="text-[12px] text-gray-400 font-semibold">
                                                                    Material
                                                                </p>

                                                                <span className="inline-block max-w-full rounded bg-[#B45309] px-2 py-0.5 text-[12px] font-medium text-white">
                                                                    {item.MaterialRequisitionType?.toUpperCase() === "DIRECT" ? item.Level4Name ?? "-" : item.MaterialName ?? "-"}
                                                                </span>

                                                            </div>

                                                        </div>


                                                        <span className="shrink-0 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[14px] font-semibold text-gray-700">
                                                            {item.MaterialQuantity || 0}{" "}
                                                            {item.MaterialRequisitionType?.toUpperCase() === "DIRECT"  ? item.Level4SubMaterialUomCode || "" : item.UomCode || ""}
                                                        </span>

                                                    </div>


                                                    <div className="grid grid-cols-2 gap-3 mt-2 pl-6">

                                                        {item.MaterialRequisitionType?.toUpperCase() === "IN - DIRECT" && (
                                                            <div className="min-w-0">

                                                                <p className="text-[12px] text-gray-400 mb-1">
                                                                    Sub - Material
                                                                </p>

                                                                <p className="text-[14px] text-[#334155] font-medium break-words">
                                                                    {item.SubMaterialName ?? "-"}
                                                                </p>

                                                            </div>
                                                        )}

                                                        <div>
                                                            <p className="text-[12px] text-gray-400 mb-1">
                                                                Required Date
                                                            </p>

                                                            <p className="text-[14px] text-[#334155] font-medium">
                                                                {formatDate_dd_MonthName_yy(item.RequiredDate)}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>
                                            );

                                        })}

                                    </div>

                                </div>

                                {/* ================= SELECT VENDOR ================= */}

                                <div className="lg:col-span-6 min-w-0 border border-[#E2E8F0] rounded-lg bg-white overflow-hidden">


                                    <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">

                                        <div className="flex items-center gap-2">

                                            {selectedMaterialIds && materialRequisitionVendorFinalizedList.length > 0 && (

                                                <Checkbox
                                                    disabled={isActionDisabled}
                                                    checked={
                                                        materialRequisitionVendorFinalizedList.length > 0 &&
                                                        materialRequisitionVendorFinalizedList.every(item => selectedVendorIds?.split(",").includes(String(item.VendorId)))
                                                    }
                                                    onChange={() => {

                                                        const allSelected =
                                                            materialRequisitionVendorFinalizedList.length > 0 &&
                                                            materialRequisitionVendorFinalizedList.every(item => selectedVendorIds?.split(",").includes(String(item.VendorId)));

                                                        handleSelectAllVendors(!allSelected);

                                                    }}
                                                    aria-label="Select All Vendors"
                                                />

                                            )}

                                            <h3 className="text-md font-semibold text-gray-800">
                                                Select Vendor
                                            </h3>

                                        </div>

                                        <span className="rounded bg-indigo-50 px-2 py-1 text-sm font-semibold text-indigo-600">
                                            {selectedVendorIds?.split(",").filter(Boolean).length || 0} Selected
                                        </span>

                                    </div>

                                    {selectedMaterialIds && (

                                        <div className="px-3 py-2 border-b border-gray-100">

                                            <TableActionToolbar
                                                isShowSearchBar
                                                searchTerm={vendorSearch}
                                                searchPlaceholder="Search By Vendor Name, Company, Mobile"
                                                onSearchChange={(value) => {
                                                    setVendorSearch(value);
                                                    debouncedVendorSearch(value);

                                                }}
                                                onClearSearch={() => {
                                                    setVendorSearch("");
                                                    debouncedVendorSearch.cancel?.();

                                                    if (selectedMaterialIds) {
                                                        pullVendorForEnquiry(selectedMaterialIds, "");
                                                    }

                                                }}
                                                isShowFilterButton={false}
                                                exportLoading={isLoading}
                                            />

                                        </div>

                                    )}

                                    <div className="max-h-[450px] overflow-y-auto thin-scroll p-3 space-y-3">

                                        {!selectedMaterialIds ? (

                                            <div className="flex flex-col items-center justify-center text-center py-10">

                                                <p className="text-sm text-gray-500">
                                                    Please select materials to view vendors.
                                                </p>

                                            </div>

                                        ) : !isLoading && (

                                            <>

                                                {materialRequisitionVendorFinalizedList.map((item) => {

                                                    const isChecked = selectedVendorIds?.split(",").includes(String(item.VendorId)) ?? false;

                                                    return (

                                                        <div
                                                            key={item.VendorId}
                                                            onClick={() => !isActionDisabled && handleVendorChange(item.VendorId, !isChecked)
                                                            }
                                                            className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${isChecked
                                                                ? "border-blue-300 bg-[#F5F8FF]"
                                                                : "border-gray-200 bg-white hover:bg-gray-50"}`}>

                                                            {/* Vendor Header */}
                                                            <div className="flex items-start justify-between gap-3">

                                                                <div className="flex items-start gap-2 min-w-0">

                                                                    <Checkbox
                                                                        disabled={isActionDisabled}
                                                                        checked={isChecked}
                                                                        onChange={() =>
                                                                            handleVendorChange(item.VendorId, !isChecked)
                                                                        }
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        aria-label={`Select ${item.VendorName}`}
                                                                    />

                                                                    <div className="min-w-0">

                                                                        <div className="flex items-center flex-wrap gap-2">

                                                                            <p className="text-sm font-semibold text-gray-800">
                                                                                {item.VendorName ?? "-"}
                                                                            </p>
                                                                            <span
                                                                                className={`rounded-full border px-3 py-0.5 text-xs font-medium
                                                                                         ${item.OwnershipType?.toUpperCase() === "OWNER" ? "border-emerald-200 bg-emerald-50 text-[#047857]"
                                                                                        : item.OwnershipType?.toUpperCase() === "PARTNER" ? "border-sky-200 bg-sky-50 text-sky-600"
                                                                                            : "border-gray-200 bg-gray-50 text-gray-600"
                                                                                    }`}
                                                                            >
                                                                                {item.OwnershipType}
                                                                            </span>



                                                                        </div>

                                                                        <div className="flex items-center gap-2 mt-1">

                                                                            <Building2 size={14} className="text-gray-400 shrink-0" />

                                                                            <p className="text-xs text-gray-500">
                                                                                {item.CompanyName ?? "-"}
                                                                            </p>

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                                <span
                                                                    className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium ${item.VendorBusinessType?.toUpperCase() === "DEALER"
                                                                        ? "bg-indigo-50 text-indigo-600"
                                                                        : item.VendorBusinessType?.toUpperCase() === "MANUFACTURER" ? "bg-emerald-50 text-emerald-700"
                                                                            : item.VendorBusinessType?.toUpperCase() === "BOTH" ? "bg-slate-100 text-slate-600"
                                                                                : "bg-gray-100 text-gray-600"
                                                                        }`}
                                                                >
                                                                    {item.VendorBusinessType}
                                                                </span>



                                                            </div>

                                                            {/* Vendor Details */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mt-3 pt-3 border-t border-gray-100 pl-6">

                                                                <div className="text-sm text-gray-500">
                                                                    <FieldItem label="Mobile Number" value={item?.MobileNumber ? `${item?.MobileNumberCountryCode || "+91"} ${item.MobileNumber}` : "-"} isRow isUsedForInventoryFlat />
                                                                </div>

                                                                <div className="text-sm text-gray-500">
                                                                    <FieldItem label="E-Mail ID" value={item?.EmailId ?? '-'} isRow isUsedForInventoryFlat />
                                                                </div>

                                                                <div className="text-sm text-gray-500">
                                                                    <FieldItem label="GST Number" value={item?.GSTNumber ?? '-'} isRow isUsedForInventoryFlat />
                                                                </div>

                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-x-4 gap-y-3 mt-3 pl-6">
                                                                <div className="text-sm text-gray-500">
                                                                    <FieldItem label="Address" value={item?.Address ?? '-'} isRow isUsedForInventoryFlat />
                                                                </div>
                                                            </div>


                                                        </div>

                                                    );

                                                })}

                                                {materialRequisitionVendorFinalizedList.length === 0 && (

                                                    <div className="flex flex-col items-center justify-center text-center p-6">

                                                        <p className="text-sm text-gray-500">
                                                            No vendors available for selected materials.
                                                        </p>

                                                    </div>

                                                )}

                                            </>

                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="pt-5">
                            <BottomActionBar
                                saveText={"Send Enquiry"}
                                canAction={canAction && !["CLOSED", "COMPLETED"].includes(listState?.materialRequisitionStatus?.trim().toUpperCase() ?? "")}
                                onSave={() => {
                                    handleAddVendorForEnquiry()
                                }}
                                isLoading={isLoading}
                            />
                        </div>
                    </>
                )
            }

        </div>

    );

};

export default Enquiry;