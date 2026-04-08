import { runApiWithLoader } from "@/core/utils";
import { useEffect, useState } from "react";
import type { FilterWithPaginationMaterialRequisition, MaterialRequisitionData, MaterialRequisitionDetailData } from "../models/MaterialRequisitionModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import { Loader } from "@/core/utils/loader";
import { useParams } from "react-router-dom";
import type { FilterInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";

export const Details: React.FC = () => {
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);

    const { projectId } = useProject();

    const { MaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const currentMaterialRequisitionId = MaterialRequisitionId ? Number(MaterialRequisitionId) : 0;

    useEffect(() => {
        if (!projectId) return;
        fetchDetailsdata();
    }, [projectId])

    const fetchDetailsdata = async (filterParams?: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisition = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: filterParams?.MaterialRequisitionId ? Number(filterParams.MaterialRequisitionId)
                        : currentMaterialRequisitionId || undefined,
                    MaterialRequisitionStatus: filterParams?.MaterialRequisitionStatus ?? undefined,
                    MaterialRequisitionStage: filterParams?.MaterialRequisitionStage ?? undefined,
                    FromDate: filterParams?.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams?.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                };

                const response = await materialRequisitionService.apiCallPullMaterialRequisition(params);

                if (E.isRight(response)) {
                    const data = response.right.Data;

                    setMaterialRequisitionData(Array.isArray(data) ? (data[0] ?? null) : data);

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

    //#region
    return (
        <div className="justify-center">

            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>

            <div className="gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <h1 className="text-lg font-semibold text-gray-900 pb-2">Basic Details</h1>

                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FieldItem label="Unique ID" value={matrialRequisitionData?.SystemGeneratedCode} />
                        <FieldItem label="Status" value={matrialRequisitionData?.MaterialRequisitionStatus} />
                        <FieldItem label="Stage" value={matrialRequisitionData?.MaterialRequisitionStage} />
                        <div>
                            <p className="text-gray-500">Attachment</p>
                            <MultiImageViewer
                                images={parseDocumentUrls(matrialRequisitionData?.PurchaseOrderURL)}
                                title="Attachment"
                                isIcon={false}
                                triggerLabel="Attachment"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className=" gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-4">

                <div className="flex justify-between">
                    <h1 className="text-lg font-semibold text-gray-900 pb-2">Material Details</h1>

                    <button
                        className="bg-blue-600 text-white font-bold py-1 p-4 rounded-md"
                    >
                        Split
                    </button>

                </div>

                <div className="lg:col-span-5 pb-3 overflow-y-auto thin-scroll h-[250px]">
                    {matrialRequisitionDetailData.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-gray-200 rounded-lg p-4 mt-2 ">
                            <FieldItem label="Name" value={item.MaterialName} />
                            <FieldItem label="Sub Material Name" value={item.SubMaterialName} />
                            <FieldItem label="Uom" value={item.Uom} />
                            <FieldItem label="Quantity" value={item.MaterialQuantity} />
                            <FieldItem label="Required Date" value={formatDate_dd_MonthName_yy(item.RequiredDate)} />
                        </div>
                    ))}
                </div>

            </div>

            <div className=" gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                <h1 className="text-lg font-semibold text-gray-900 pb-2">Remarks</h1>
                <span>{matrialRequisitionData?.Remarks}</span>
            </div>

            <div className="gap-x-4 bg-white rounded-lg shadow-sm border border-gray-300 p-4 mb-1">
                <h1 className="text-lg font-semibold text-gray-900 pb-2">Action Details</h1>

                <div className="lg:col-span-5 pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <FieldItem label="Created By" value={matrialRequisitionData?.CreatedBy} />
                        <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.CreatedDate ?? '')} />
                        <FieldItem label="Modified By" value={matrialRequisitionData?.ModifiedBy} />
                        <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.ModifiedDate ?? '')} />
                    </div>
                </div>
            </div>

            <div className="pt-2 flex justify-end">
                <button
                    className="bg-gray-400 text-white font-bold py-1 px-4 rounded-md"
                >
                    Close
                </button>
            </div>

        </div>
    )
}
export default Details;