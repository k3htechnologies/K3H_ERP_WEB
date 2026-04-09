import { runApiWithLoader } from "@/core/utils";
import { useEffect, useState } from "react";
import type { FilterWithPaginationMaterialRequisition, MaterialRequisitionData, MaterialRequisitionDetailData } from "../models/MaterialRequisitionModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "../services/MaterialRequisitionService";
import { useParams } from "react-router-dom";
import type { FilterInfo } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Loader } from "@/core/utils/loader";

export const Overview: React.FC = () => {
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
        <div className="bg-white p-1">
            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage}>
                {" "}
                <div></div>{" "}
            </Loader>

            <div className="grid grid-cols-12 gap-5 pt-1">

                <div className="col-span-7">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mb-4">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
                        </section>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mb-4">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Vendor And Amount Details</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Vendor Name" value={matrialRequisitionData?.MaterialRequisitionStage} />
                                <FieldItem label="Vendor Company" value={matrialRequisitionData?.MaterialRequisitionStage} />
                                <FieldItem label="Base Amount" value={matrialRequisitionData?.MaterialRequisitionStatus} />
                                <FieldItem label="Total Tax" value={matrialRequisitionData?.MaterialRequisitionStage} />
                                <FieldItem label="Grand Total" value={matrialRequisitionData?.MaterialRequisitionStage} />
                                <FieldItem label="Est. Delivery" value={matrialRequisitionData?.MaterialRequisitionStage} />
                            </div>
                        </section>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mb-4">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Purchase Order</h4>
                            <div className="inline-flex items-end gap-1 px-2 py-2 border border-blue-500 text-blue-600 rounded mt-2 text-sm font-medium cursor-pointer hover:bg-blue-50 transition">
                                <p>Document</p>
                                <MultiImageViewer
                                    images={parseDocumentUrls(matrialRequisitionData?.PurchaseOrderURL)}
                                    title="Purchase Order"
                                    isIcon={false}
                                    triggerLabel="Document"
                                />
                            </div>
                        </section>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mb-4">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Remarks</h4>
                            <span>{matrialRequisitionData?.Remarks}</span>
                        </section>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Action Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Created By" value={matrialRequisitionData?.CreatedBy} />
                                <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.CreatedDate ?? '')} />
                                <FieldItem label="Modified By" value={matrialRequisitionData?.ModifiedBy} />
                                <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.ModifiedDate ?? '')} />
                            </div>
                        </section>
                    </div>

                </div>

                <div className="col-span-5">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 mb-4 overflow-y-auto thin-scroll h-[483px]">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Material Details</h4>
                            {matrialRequisitionDetailData.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-4 border-b border-gray-300 last:border-b-0 last:pb-2 pb-4">
                                    <FieldItem label="Name" value={item.MaterialName} />
                                    <FieldItem label="Sub Material" value={item.SubMaterialName} />
                                    <FieldItem label="Quantity" value={item.MaterialQuantity} />
                                </div>
                            ))}
                        </section>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 overflow-y-auto thin-scroll h-[500px]">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h4>
                            {matrialRequisitionDetailData.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 bg-gray-200 rounded-lg p-4 mt-2 ">
                                    <FieldItem label="Invoice No." value={item.MaterialName} />
                                    <FieldItem label="Invoice Amount" value={item.SubMaterialName} />
                                    <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(item.RequiredDate)} />
                                </div>
                            ))}
                        </section>
                    </div>

                </div>

            </div>
        </div>
    )
}
export default Overview;