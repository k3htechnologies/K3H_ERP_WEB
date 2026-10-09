import { useEffect, useMemo, useState } from "react";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { useParams } from "react-router-dom";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either"
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { FilterWithPaginationVendorForEnquiryRequest, VendorDetails, VendorForEnquiryData } from "../models/VendorFinalizeModel";
import { vendorFinalizationService } from "../services/VendorFinalizationService";
import { Checkbox } from "@/ui/components/forms/Checkbox";
import type { MaterialRequisitionDetailData } from "../models/MaterialRequisitionModel";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import DataTableWithCheckbox from "@/ui/components/DataTable/DataTableWithCheckbox";
import { Button } from "@/ui/components/forms";
import { MessageSquareQuoteIcon, } from "lucide-react";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

interface OverviewProps {
    matrialRequisitionDetailData: MaterialRequisitionDetailData[];
}

export const GetQuotation: React.FC<OverviewProps> = ({ matrialRequisitionDetailData }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [materialRequisitionVendorFinalizedList, setMaterialRequisitionVendorFinalizedList] = useState<VendorForEnquiryData[]>([]);
    const [vendorDetails, setVendorDetails] = useState<VendorDetails[]>([]);
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>()
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId
    const currentUniquekey = listState.Uniquekey;
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { canAction } = useMenuPermissions();
    const [expandedParentRow, setExpandedParentRow] = useState<any>(null);
    const [expandedParentId, setExpandedParentId] = useState<number | null>(null);
    const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);

    useEffect(() => {
        if (!projectId) return;

        pullVendorsForEnquiry();
    }, [projectId]);

    const pullVendorsForEnquiry = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationVendorForEnquiryRequest = {
                    MaterialRequisitionId: Number(currentMaterialRequisitionId),
                    Uniquekey: currentUniquekey ?? '',
                    ProjectId: Number(projectId),
                }

                const response = await vendorFinalizationService.apiCallpullVendorsForEnquiry(params);

                if (E.isRight(response)) {

                    const data = response.right.Data ?? [];

                    setMaterialRequisitionVendorFinalizedList(data);

                    setVendorDetails(data.flatMap(item => item.VendorDetailsJSON ?? []));
                }
                return response
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Vendor"
        );
    };

    const MatrialRequisitionDetailColumns = useMemo<TableColumn[]>(() => {

        const isDirect = matrialRequisitionDetailData?.[0]?.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        const columns: TableColumn[] = [];

        if (isDirect) {
            columns.push(
                // {
                //     key: "Level1Name",
                //     label: "Category",
                //     align: "left",
                //     width: "30",
                //     render: (value) => value || "-"
                // },
                // {
                //     key: "Level2Name",
                //     label: "Sub Category",
                //     align: "left",
                //     width: "30",
                //     render: (value) => value || "-"
                // },
                // {
                //     key: "Level3Name",
                //     label: "Description",
                //     align: "left",
                //     width: "30",
                //     render: (value) => (
                //         <TooltipText
                //             text={value || "-"}
                //             maxWidth="250px"
                //             tooltipThreshold={25}
                //         />
                //     )
                // },
                {
                    key: "Level4Name",
                    label: "Sub Material",
                    align: "left",
                    width: "30",
                    fixed: "left",
                    render: (value) => (
                        <TooltipText
                            text={value || "-"}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                    )
                },
            );
        } else {
            columns.push(
                // {
                //     key: "MaterialName",
                //     label: "Material",
                //     align: "left",
                //     width: "30",
                //     render: (value) => (
                //         <TooltipText
                //             text={value || "-"}
                //             maxWidth="250px"
                //             tooltipThreshold={25}
                //         />
                //     )
                // },
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
                        />
                    )
                },

            );
        }
        columns.push(
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
                key: "RequiredDate",
                label: "Required Date",
                align: "left",
                width: "30",
                render: (value) =>
                    value ? formatDate_dd_MonthName_yy(value) : "-"
            },
        );

        return columns;
    }, [matrialRequisitionDetailData]);

    // const VendorColumns = useMemo<TableColumn[]>(() => [
    //     {
    //         key: "VendorName",
    //         label: "Vendor Name",
    //         align: "left",
    //         width: "30",
    //         fixed: "left",
    //         render: (value) => (
    //             <TooltipText
    //                 text={value || "-"}
    //                 maxWidth="250px"
    //                 tooltipThreshold={25}
    //             />
    //         )
    //     },
    //     {
    //         key: 'CompanyName',
    //         label: 'Company Name',
    //         width: '15',
    //         sortable: false,
    //         align: 'left',
    //         render: (value) => (value) || '-'
    //     },
    //     {
    //         key: 'MobileNumber',
    //         label: 'Mobile Number',
    //         width: '15',
    //         sortable: false,
    //         align: 'left',
    //         render: (value, row) => value ? `${row.MobileNumberCountryCode} ${value}` : "-"
    //     },
    //     {
    //         key: 'EmailId',
    //         label: 'Email Id',
    //         width: '15',
    //         sortable: false,
    //         align: 'left',
    //         render: (value) => (value) || '-'
    //     },
    //     {
    //         key: 'GSTNumber',
    //         label: 'GST Number',
    //         width: '15',
    //         sortable: false,
    //         align: 'left',
    //         render: (value) => (value) || '-'
    //     },
    //     {
    //         key: "Address",
    //         label: "Address",
    //         align: "left",
    //         width: "30",
    //         render: (value) => (
    //             <TooltipText
    //                 text={value || "-"}
    //                 maxWidth="250px"
    //                 tooltipThreshold={25}
    //             />
    //         )
    //     },
    // ], []);

    const PushVendorForQuotation = () => {

        const selectedVendors = vendorDetails.filter((vendor) =>
            selectedVendorIds.includes(Number(vendor.VendorId))
        );

        return {
            MaterialRequisitionId: currentMaterialRequisitionId,
            Uniquekey: currentUniquekey,
            ProjectId: Number(projectId),
            VendorDetailsJSON: JSON.stringify(selectedVendors),
        };
    };

    const handleAddVendorForQuotation = async () => {

        if (selectedVendorIds.length === 0) {

            addToast({ type: "error", title: "Please select at least one vendor before getting quotation.", });
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushVendorForQuotation()

                const response = await vendorFinalizationService.apiCallToAddVendorForEnquiry(payload);

                if (E.isRight(response)) {

                    setMaterialRequisitionVendorFinalizedList(response.right.Data)

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response
            }
        )
    }

    const toggleVendor = (vendorId: number) => {

        setSelectedVendorIds((prev) => prev.includes(vendorId)
            ? prev.filter((id) => id !== vendorId)
            : [...prev, vendorId]
        );
    };

    const toggleAllVendors = (vendors: VendorDetails[]) => {

        const vendorIds = vendors.map((vendor) =>
            Number(vendor.VendorId))
            .filter((id) => id > 0);

        const allSelected = vendorIds.length > 0 &&
            vendorIds.every((id) => selectedVendorIds.includes(id));

        setSelectedVendorIds((prev) => {

            if (allSelected) {
                return prev.filter((id) => !vendorIds.includes(id));
            }

            return Array.from(new Set([...prev, ...vendorIds]));
        });
    };

    return (
        <div className="space-y-4">
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>

            {/* <div className="overflow-y-auto thin-scroll">
                <DataTableWithHeaderRowDivider
                    columns={MatrialRequisitionDetailColumns}
                    data={matrialRequisitionDetailData}
                    emptyMessage="No Material Requisition Details Found"
                    fixedHeight={true}
                    className="flex-1"
                />
            </div> */}

            {/* <div className="overflow-y-auto thin-scroll">
                <DataTableWithHeaderRowDivider
                    columns={VendorColumns}
                    data={materialRequisitionVendorFinalizedList}
                    emptyMessage="No Vendors Found"
                    fixedHeight={true}
                    className="flex-1"
                />
            </div> */}

            {/* {materialRequisitionVendorFinalizedList.length === 0 ? (

                    <section className="md:col-span-4 bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                        <NoDataView message="No Vendor available" />
                    </section>

                ) : (

                    <div className="space-y-3">
                        {materialRequisitionVendorFinalizedList.map((item, i) => {
                            const checked = selectedVendorIds.includes(Number(item.VendorId));

                            return (
                                <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200"  >
                                    <Checkbox
                                        checked={checked}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();

                                            const vendorId = Number(item.VendorId);

                                            setSelectedVendorIds((prev) =>
                                                prev.includes(vendorId)
                                                    ? prev.filter((id) => id !== vendorId)
                                                    : [...prev, vendorId]
                                            );
                                        }}
                                    />

                                    <div className="flex justify-between items-start w-full gap-8">

                                        <div className="space-y-1">

                                            <div className="font-medium">
                                                <FieldItem label="Vendor Name" value={item?.VendorName ?? '-'} isRow isUsedForInventoryFlat />
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                <FieldItem label="Company Name" value={item?.CompanyName ?? '-'} isRow isUsedForInventoryFlat />
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                <FieldItem label="Mobile Number" value={item?.MobileNumber ? `${item?.MobileNumberCountryCode || "+91"} ${item.MobileNumber}` : "-"} isRow isUsedForInventoryFlat />
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                <FieldItem label="E-Mail ID" value={item?.EmailId ?? '-'} isRow isUsedForInventoryFlat />
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                <FieldItem label="GST Number" value={item?.GSTNumber ?? '-'} isRow isUsedForInventoryFlat />
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                <FieldItem label="Address" value={item?.Address ?? '-'} isRow isUsedForInventoryFlat />
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )} */}

            {/* <div className="overflow-y-auto thin-scroll">
                    <DataTableWithHeaderRowDivider
                        columns={MatrialRequisitionDetailColumns}
                        data={matrialRequisitionDetailData}
                        emptyMessage="No Material Requisition Details Found"
                        fixedHeight={true}
                        className="flex-1"
                    />
                </div> */}

            <div className="flex justify-end">
                <Button
                    size="sm"
                    style={{
                        color: '#d35400',
                        backgroundColor: '#FDE6D3',
                        padding: '4px 8px',
                    }}
                    leftIcon={<MessageSquareQuoteIcon size={15} />}
                    onClick={() => {
                        handleAddVendorForQuotation();
                    }}
                >
                    Get Quotation
                </Button>
            </div>

            <DataTableWithCheckbox
                columns={MatrialRequisitionDetailColumns}
                data={matrialRequisitionDetailData}
                emptyMessage="No Specification Data Found"
                recordsPerPage={20}
                fixedHeight={true}
                loading={isLoading}
                // expandable={{
                //     keyField: "MaterialRequisitionDetailId",
                //     alwaysFetchOnOpen: true,
                //     fetchRow: async (row) => {
                //         setExpandedParentRow(row);
                //         setExpandedParentId(row.SubMaterialMasterId);

                //         const params: FilterWithPaginationVendorForEnquiryRequest = {
                //             MaterialRequisitionId: Number(currentMaterialRequisitionId),
                //             Uniquekey: currentUniquekey ?? '',
                //             ProjectId: Number(projectId),
                //             SubMaterialMasterId: row.SubMaterialMasterId,
                //         };

                //         const response = await vendorFinalizationService.apiCallpullVendorsForEnquiry(params);

                //         if (E.isRight(response)) {
                //             return response.right.Data ?? [];
                //         }
                //         return [];
                //     },

                //     renderRow: (fetchedData) => {
                //         const details: VendorForEnquiryData[] = Array.isArray(fetchedData) ? fetchedData : fetchedData ? [fetchedData] : [];
                //         if (!details || details.length === 0) {
                //             return <div className="p-1 text-xs text-gray-600 text-center"><NoDataView /></div>;
                //         }
                //         return (
                //             <div className="m-4 border border-[#E5E7EB] rounded-md overflow-hidden">

                //                 <div className="flex items-center h-10 bg-[#F9F9FF] border-b border-[#E5E7EB]">

                //                     <div className="w-[55px] flex justify-center shrink-0">
                //                         <Checkbox
                //                             onChange={() => {
                //                             }}
                //                         />
                //                     </div>

                //                     <div className="flex-1 min-w-[140px] px-4 text-sm font-medium text-[#1D1D1D80]">
                //                         Vendor Name
                //                     </div>

                //                     <div className="flex-1 min-w-[140px] px-4 text-sm font-medium text-[#1D1D1D80]">
                //                         Company Name
                //                     </div>

                //                     <div className="w-[140px] shrink-0 px-4 text-sm font-medium text-[#1D1D1D80]">
                //                         Mobile Number
                //                     </div>

                //                     <div className="flex-1 min-w-[180px] px-4 text-sm font-medium text-[#1D1D1D80]">
                //                         Email Id
                //                     </div>

                //                     <div className="w-[150px] shrink-0 px-4 text-sm font-medium text-[#1D1D1D80]">
                //                         GST Number
                //                     </div>

                //                     <div className="flex-[1.5] min-w-[250px] flex items-center justify-between px-4">

                //                         <span className="text-sm font-medium text-[#1D1D1D80]">
                //                             Address
                //                         </span>

                //                         <div className="flex items-center gap-4 shrink-0">

                //                             <button
                //                                 type="button"
                //                                 className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                //                                 onClick={() => {
                //                                 }}
                //                             >
                //                                 Select All
                //                             </button>

                //                             <span className="text-sm text-[#D1D5DB]">
                //                                 |
                //                             </span>

                //                             <button
                //                                 type="button"
                //                                 className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                //                                 onClick={() => {
                //                                 }}
                //                             >
                //                                 Clear All
                //                             </button>

                //                         </div>

                //                     </div>
                //                 </div>

                //                 {details.map((vendor, index) => (<div
                //                     key={index}
                //                     className="flex items-center min-h-10 border-b border-[#E5E7EB] hover:bg-gray-50"
                //                 >

                //                     <div className="w-[55px] flex justify-center shrink-0">
                //                         <Checkbox />
                //                     </div>

                //                     <div className="flex-1 min-w-[140px] px-4 text-sm text-gray-700 truncate">
                //                         {vendor.VendorName || "-"}
                //                     </div>

                //                     <div className="flex-1 min-w-[140px] px-4 text-sm text-gray-700 truncate">
                //                         {vendor.CompanyName || "-"}
                //                     </div>

                //                     <div className="w-[140px] shrink-0 px-4 text-sm text-gray-700 truncate">
                //                         {vendor.MobileNumber || "-"}
                //                     </div>

                //                     <div className="flex-1 min-w-[180px] px-4 text-sm text-gray-700 truncate">
                //                         {vendor.EmailId || "-"}
                //                     </div>

                //                     <div className="w-[150px] shrink-0 px-4 text-sm text-gray-700 truncate">
                //                         {vendor.GSTNumber || "-"}
                //                     </div>

                //                     <div className="flex-[1.5] min-w-[250px] px-4 text-sm text-gray-700">
                //                         <FieldInfoTooltip value={vendor.Address || "-"} />
                //                     </div>

                //                 </div>
                //                 ))}

                //             </div>
                //         );
                //     },
                //     expandButton: { openText: "Hide", closeText: "Show" },
                // }}
                expandable={{
                    keyField: "MaterialRequisitionDetailId",
                    alwaysFetchOnOpen: true,
                    fetchRow: async (row) => {

                        setExpandedParentRow(row);
                        setExpandedParentId(row.SubMaterialMasterId);

                        const params: FilterWithPaginationVendorForEnquiryRequest = {
                            MaterialRequisitionId: Number(currentMaterialRequisitionId),
                            Uniquekey: currentUniquekey ?? "",
                            ProjectId: Number(projectId),
                            SubMaterialMasterId: row.SubMaterialMasterId,
                        };

                        const response = await vendorFinalizationService.apiCallpullVendorsForEnquiry(params);

                        if (E.isRight(response)) {

                            return response.right.Data ?? [];
                        }

                        return [];
                    },

                    renderRow: (fetchedData) => {

                        const details: VendorForEnquiryData[] = Array.isArray(fetchedData)
                            ? fetchedData
                            : fetchedData ? [fetchedData] : [];

                        if (details.length === 0) {
                            return (
                                <div className="p-1 text-xs text-gray-600 text-center">
                                    <NoDataView />
                                </div>
                            );
                        }

                        const vendors: VendorDetails[] = details.flatMap(
                            (item) => item.VendorDetailsJSON ?? []
                        );

                        if (vendors.length === 0) {
                            return (
                                <div className="p-1 text-xs text-gray-600 text-center">
                                    <NoDataView />
                                </div>
                            );
                        }

                        return (
                            <div className="m-4 border border-[#E5E7EB] rounded-md overflow-hidden">

                                <div className="flex items-center h-10 bg-[#F9F9FF] border-b border-[#E5E7EB]">

                                    <div className="w-[55px] flex justify-center shrink-0">
                                        <Checkbox
                                            checked={
                                                vendors.length > 0 && vendors.every((vendor) =>
                                                    selectedVendorIds.includes(Number(vendor.VendorId))
                                                )}
                                            onChange={() => toggleAllVendors(vendors)}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-[140px] px-4 text-sm font-medium text-[#1D1D1D80]">
                                        Vendor Name
                                    </div>

                                    <div className="flex-1 min-w-[140px] px-4 text-sm font-medium text-[#1D1D1D80]">
                                        Company Name
                                    </div>

                                    <div className="w-[140px] shrink-0 px-4 text-sm font-medium text-[#1D1D1D80]">
                                        Mobile Number
                                    </div>

                                    <div className="flex-1 min-w-[180px] px-4 text-sm font-medium text-[#1D1D1D80]">
                                        Email Id
                                    </div>

                                    <div className="w-[150px] shrink-0 px-4 text-sm font-medium text-[#1D1D1D80]">
                                        GST Number
                                    </div>

                                    <div className="flex-[1.5] min-w-[250px] flex items-center justify-between px-4">

                                        <span className="text-sm font-medium text-[#1D1D1D80]">
                                            Address
                                        </span>

                                        <div className="flex items-center gap-4 shrink-0">

                                            <button
                                                type="button"
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                onClick={() => toggleAllVendors(vendors)}
                                            >
                                                Select All
                                            </button>

                                            <span className="text-sm text-[#D1D5DB]">
                                                |
                                            </span>

                                            <button
                                                type="button"
                                                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                                                onClick={() => {

                                                    const vendorIds = vendors.map((vendor) =>
                                                        Number(vendor.VendorId)
                                                    );

                                                    setSelectedVendorIds((prev) =>
                                                        prev.filter((id) => !vendorIds.includes(id))
                                                    );
                                                }}
                                            >
                                                Clear All
                                            </button>

                                        </div>
                                    </div>
                                </div>

                                {vendors.map((vendor, index) => (
                                    <div
                                        key={`${vendor.VendorId}-${index}`}
                                        className="flex items-center min-h-10 border-b border-[#E5E7EB] hover:bg-gray-50"
                                    >

                                        <div className="w-[55px] flex justify-center shrink-0">
                                            <Checkbox
                                                checked={selectedVendorIds.includes(
                                                    Number(vendor.VendorId)
                                                )}

                                                onChange={() =>
                                                    toggleVendor(Number(vendor.VendorId))
                                                }
                                            />
                                        </div>

                                        <div className="flex-1 min-w-[140px] px-4 text-sm text-gray-700 truncate">
                                            {vendor.VendorName || "-"}
                                        </div>

                                        <div className="flex-1 min-w-[140px] px-4 text-sm text-gray-700 truncate">
                                            {vendor.CompanyName || "-"}
                                        </div>

                                        <div className="w-[140px] shrink-0 px-4 text-sm text-gray-700 truncate">
                                            {vendor.MobileNumber
                                                ? `${vendor.MobileNumberCountryCode || ""} ${vendor.MobileNumber}`.trim()
                                                : "-"
                                            }
                                        </div>

                                        <div className="flex-1 min-w-[180px] px-4 text-sm text-gray-700 truncate">
                                            {vendor.EmailId || "-"}
                                        </div>

                                        <div className="w-[150px] shrink-0 px-4 text-sm text-gray-700 truncate">
                                            {vendor.GSTNumber || "-"}
                                        </div>

                                        <div className="flex-[1.5] min-w-[250px] px-4 text-sm text-gray-700">
                                            <FieldInfoTooltip value={vendor.Address || "-"} />
                                        </div>

                                    </div>
                                ))}
                            </div>
                        );
                    },
                    expandButton: { openText: "Hide", closeText: "Show", },
                }}
            />
        </div>
    )
}
export default GetQuotation;