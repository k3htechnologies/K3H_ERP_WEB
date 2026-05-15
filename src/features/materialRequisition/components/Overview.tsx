import { runApiWithLoader } from "@/core/utils";
import { useEffect, useState } from "react";
import type { FilterWithPaginationMaterialRequisition, MaterialRequisitionData, MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { materialRequisitionService } from "@/features/materialRequisition/services/MaterialRequisitionService";
import { useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Loader } from "@/core/utils/loader";
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { FilterWithPaginationMaterialRequisitionInvoice, MaterialRequisitionInvoiceData } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import { materialRequisitionInvoiceService } from "@/features/materialRequisition/services/MaterialRequisitionInvoiceService";
import type { FilterWithPaginationVendorForSelectedEnquiryRequest, SelectedVendorData } from "@/features/materialRequisition/models/VendorFinalizeModel";
import { vendorFinalizationService } from "@/features/materialRequisition/services/VendorFinalizationService";
import type { MaterialRequisitionQuotationDetailsTermsData } from "@/features/materialRequisition/models/MaterialRequisitionQuotationModel";
import { computeBaseTotal, computeLinesTotal, computeTaxTotal } from "@/features/materialRequisition/utils/finalizeVendorUtils";

export const Overview: React.FC = () => {
    const [loadingMessage, setLoadingMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [matrialRequisitionData, setMaterialRequisitionData] = useState<MaterialRequisitionData | null>(null);
    const [matrialRequisitionDetailData, setMaterialRequisitionDetailData] = useState<MaterialRequisitionDetailData[]>([]);
    const [MaterialRequisitionInvoiceData, setMaterialRequisitionInvoiceData] = useState<MaterialRequisitionInvoiceData[]>([])
    const [materialRequisitionVendorData, setMaterialRequisitionVendorData] = useState<SelectedVendorData | null>(null)
    const [materialRequisitionQuotationTermsData, setMaterialRequisitionQuotationTermsData] = useState<MaterialRequisitionQuotationDetailsTermsData[]>([])
    const { projectId } = useProject();
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>();
    const { listState } = useMaterialRequisitionListState();
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId;
    const currentUniquekey = listState.Uniquekey

    useEffect(() => {
        if (!projectId) return;
        fetchMaterialRequisitiondata();
        fetchVendorData();
        fetchInvoiceData();
    }, [projectId, currentMaterialRequisitionId]);

    const fetchMaterialRequisitiondata = async () => {
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

    const fetchVendorData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationVendorForSelectedEnquiryRequest = {
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                    Uniquekey: currentUniquekey,
                };

                const response = await vendorFinalizationService.apiCallPullSelectedVendorForEnquiry(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setMaterialRequisitionVendorData(Array.isArray(data) ? (data[0] ?? null) : data);

                    const Item = Array.isArray(data) ? data[0] : data;

                    setMaterialRequisitionQuotationTermsData(Item?.MaterialRequisitionQuotationTermsData ?? []);

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
            "Loading Vendor",
        );
    };

    const fetchInvoiceData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMaterialRequisitionInvoice = {
                    PageNumber: 1,
                    PageSize: 50,
                    ProjectId: Number(projectId),
                    MaterialRequisitionId: currentMaterialRequisitionId,
                };

                const response = await materialRequisitionInvoiceService.apiCallPullMaterialRequisitionInvoice(params);

                if (E.isRight(response)) {

                    setMaterialRequisitionInvoiceData(response.right.Data);

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

    const firstTerm = materialRequisitionVendorData?.MaterialRequisitionQuotationTermsData?.[0];
    const Vendoramount = firstTerm?.MaterialRequisitionQuotationData || []

    const amountPaid = MaterialRequisitionInvoiceData.reduce(
        (sum, item) => sum + Number(item.InvoiceAmountPaidTillDate ?? 0),
        0
    );

    return (
        <div className="bg-white p-1">
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "} </Loader>

            <div className="grid grid-cols-12 gap-5 pt-1">

                <div className="col-span-6">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1 mb-4">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Unique ID" value={matrialRequisitionData?.SystemGeneratedCode} />
                                <FieldItem label="Status" value={matrialRequisitionData?.MaterialRequisitionStatus} />
                                <FieldItem label="Stage" value={matrialRequisitionData?.MaterialRequisitionStage} />

                                <div>
                                    <p className="text-gray-500">Attachment</p>
                                    <MultiImageViewer
                                        images={parseDocumentUrls(matrialRequisitionData?.AttachmentsURL ?? '')}
                                        title="Attachment"
                                        isIcon={false}
                                        triggerLabel="-"
                                    />
                                </div>

                            </div>
                        </section>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1 mb-4">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Vendor And Amount Details</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Vendor Name" value={materialRequisitionVendorData?.VendorName} />
                                <FieldItem label="Vendor Company" value={materialRequisitionVendorData?.CompanyName} />
                                <FieldItem label="Base Amount" value={`₹ ${computeBaseTotal(Vendoramount).toFixed(2)}`} />
                                <FieldItem label="Total Tax" value={`₹ ${computeTaxTotal(Vendoramount).toFixed(2)}`} />
                                <FieldItem label="Grand Total" value={`₹ ${computeLinesTotal(Vendoramount).toFixed(2)}`} />
                                <FieldItem label="Est. Delivery" value={`${materialRequisitionQuotationTermsData[0]?.ExpectedDeliveryInDays ?? 0} days`} />
                                <FieldItem label="Paid Amount" value={`₹ ${amountPaid.toFixed(2)}`} />
                                <FieldItem label="Pending Amount" value={`₹ ${(computeLinesTotal(Vendoramount) - amountPaid).toFixed(2)}`} />
                            </div>
                        </section>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1 mb-4 h-[120px]">

                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Purchase Order</h4>
                            {matrialRequisitionData?.PurchaseOrderURL.length == 0 ? (
                                <p className="text-gray-900 text-md">No Document</p>
                            ) : (
                                <div className="inline-flex items-end gap-1 px-2 py-2 border border-blue-500 text-blue-600 rounded mt-2 text-sm font-medium cursor-pointer hover:bg-blue-50 transition">
                                    <p>Document</p>
                                    <MultiImageViewer
                                        images={parseDocumentUrls(matrialRequisitionData?.PurchaseOrderURL ?? '')}
                                        title="Purchase Order"
                                        isIcon={false}
                                        triggerLabel="-"
                                    />
                                </div>)}
                        </section>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1 mb-4">
                        <section className="bg-white px-4 pt-1 pb-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Remarks</h4>
                            <span>{matrialRequisitionData?.Remarks}</span>
                        </section>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1">
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

                <div className="col-span-6">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1 mb-4 overflow-y-auto thin-scroll h-[495px]">
                        <div className="overflow-y-auto thin-scroll h-[476px]">

                            <section className="bg-white px-4 pt-1 pb-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Material Details</h4>
                                {matrialRequisitionDetailData.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-2 mb-3 border-b border-gray-300 last:border-b-0 last:pb-0 pb-2">
                                        <FieldItem label="Name" value={item.MaterialName} />
                                        <FieldItem label="Sub-Material" value={<TooltipText text={item.SubMaterialName ?? ''} />} />
                                        <FieldItem label="Quantity" value={item.MaterialQuantity} />
                                        <FieldItem label="Received Quantity" value={item.MaterialReceivedQuantityTillDate ?? ''} />

                                        <div className="col-span-1 md:col-span-4 mt-1">
                                            <FieldItem label="Remark" value={<TooltipText text={item.Remark ?? ''} />} />
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1 overflow-y-auto thin-scroll h-[426px]">
                        <div className="overflow-y-auto thin-scroll h-[400px]">
                            
                            <section className="bg-white px-4 pt-1 pb-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h4>
                                {MaterialRequisitionInvoiceData.length === 0 ? (
                                    <div className="flex flex-col justify-center items-center h-full">
                                        <NoDataView />
                                    </div>
                                ) : (
                                    <div>
                                        {MaterialRequisitionInvoiceData.map((item, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 bg-gray-200 rounded-lg p-2 mt-2 ">
                                                <FieldItem label="Invoice Number" value={item.InvoiceNumber} />
                                                <FieldItem label="Invoice Amount" value={`₹ ${item.InvoiceAmount ?? ''}`} />
                                                <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(item.InvoiceDueDate ?? '')} />

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>

                </div>
            </div >
        </div >
    )
}

export default Overview;