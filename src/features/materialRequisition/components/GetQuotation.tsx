import { useEffect, useMemo, useState } from "react";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import { useParams } from "react-router-dom";
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either"
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { FilterWithPaginationVendorForEnquiryRequest } from "../models/VendorFinalizeModel";
import { vendorFinalizationService } from "../services/VendorFinalizationService";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Checkbox } from "@/ui/components/forms/Checkbox";
import type { MaterialRequisitionDetailData } from "../models/MaterialRequisitionModel";
import type { TableColumn } from "@/ui/components/DataTable/DataTable";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";

interface OverviewProps {
    matrialRequisitionDetailData: MaterialRequisitionDetailData[];
}

export const GetQuotation: React.FC<OverviewProps> = ({ matrialRequisitionDetailData }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([])
    const [materialRequisitionVendorFinalizedList, setMaterialRequisitionVendorFinalizedList] = useState<any[]>([])
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>()
    const { listState } = useMaterialRequisitionListState()
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId
    const currentUniquekey = listState.Uniquekey
    const { projectId } = useProject();
    const { addToast } = useToast()

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

                    setMaterialRequisitionVendorFinalizedList(response.right.Data)
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
            // {
            //     key: "RequiredDate",
            //     label: "Required Date",
            //     align: "left",
            //     width: "30",
            //     render: (value) =>
            //         value ? formatDate_dd_MonthName_yy(value) : "-"
            // },
            {
                key: "MaterialQuantity",
                label: "Quantity",
                align: "left",
                width: "30",
                render: (value, row) => {
                    return isDirect ? `${value ?? 0} ${row.Level4SubMaterialUomCode ?? ""}`.trim() : `${value ?? 0} ${row.UomCode ?? ""}`.trim() ?? 0;
                }
            },
        );
        return columns;
    }, [matrialRequisitionDetailData]);

    const PushVendorForQuotation = (vendorIds: string) => {
        return {
            MaterialRequisitionId: currentMaterialRequisitionId,
            Uniquekey: currentUniquekey,
            ProjectId: Number(projectId),
            VendorId: vendorIds
        }
    }

    const handleAddVendorForQuotation = async (e: React.FormEvent) => {
        e.preventDefault();

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const vendorIds = selectedVendorIds.join(",")

                const payload = PushVendorForQuotation(vendorIds)

                const response = await vendorFinalizationService.apiCallToAddVendorForEnquiry(payload);

                if (E.isRight(response)) {

                    const selected = materialRequisitionVendorFinalizedList.filter((item) => selectedVendorIds.includes(item.VendorId));

                    setSelectedVendorIds(selected);

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                } else {
                    addToast({ type: "error", title: response.left?.message })
                }
                return response

            }
        )
    }

    return (
        <div className="space-y-4">
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>

            <div className="overflow-y-auto thin-scroll">
                <DataTableWithHeaderRowDivider
                    columns={MatrialRequisitionDetailColumns}
                    data={matrialRequisitionDetailData}
                    emptyMessage="No Material Requisition Details Found"
                    fixedHeight={true}
                    className="flex-1"
                />
            </div>

            <div className="flex justify-between">
                {materialRequisitionVendorFinalizedList.length === 0 ? (

                    <section className="md:col-span-4 bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                        <NoDataView message="No Vendor available" />
                    </section>

                ) : (

                    <div className="space-y-3">
                        {materialRequisitionVendorFinalizedList.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200"  >

                                <Checkbox
                                    onClick={(e) => e.stopPropagation()}
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
                        ))}
                    </div>
                )}

                <div className="overflow-y-auto thin-scroll">
                    <DataTableWithHeaderRowDivider
                        columns={MatrialRequisitionDetailColumns}
                        data={matrialRequisitionDetailData}
                        emptyMessage="No Material Requisition Details Found"
                        fixedHeight={true}
                        className="flex-1"
                    />
                </div>

            </div>

        </div>
    )
}
export default GetQuotation;