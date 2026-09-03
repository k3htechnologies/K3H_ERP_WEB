import { runApiWithLoader } from "@/core/utils";
import { useEffect, useMemo, useState } from "react";
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
import type { FilterWithPaginationMaterialRequisitionInvoice, MaterialRequisitionInvoiceData } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import { materialRequisitionInvoiceService } from "@/features/materialRequisition/services/MaterialRequisitionInvoiceService";
import type { FilterWithPaginationVendorForSelectedEnquiryRequest, SelectedVendorData } from "@/features/materialRequisition/models/VendorFinalizeModel";
import { vendorFinalizationService } from "@/features/materialRequisition/services/VendorFinalizationService";
import type { MaterialRequisitionQuotationDetailsTermsData } from "@/features/materialRequisition/models/MaterialRequisitionQuotationModel";
import { computeBaseTotal, computeLinesTotal, computeTaxTotal } from "@/features/materialRequisition/utils/finalizeVendorUtils";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";

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
        (sum, item) => sum + Number(item.InvoiceAmountPaidTillDate ?? 0), 0);

    const MatrialRequisitionDetailColumns = useMemo<any[]>(
        () => [
            {
                key: "MaterialName",
                label: "Material Name",
                align: "left",
                render: (value?: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="180px"
                        tooltipThreshold={18}
                    />
                )
            },
            {
                key: "SubMaterialName",
                label: "Sub Material Name",
                align: "left",
                render: (value?: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="180px"
                        tooltipThreshold={18}
                    />
                )
            },
            {
                key: "MaterialQuantity",
                label: "Material Quantity",
                align: "left",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "MaterialReceivedQuantityTillDate",
                label: "Received Quantity",
                align: "left",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "Remark",
                label: "Remark",
                align: "left",
                render: (value?: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="180px"
                        tooltipThreshold={18}
                    />
                )
            },
        ], []
    );

    const MaterialRequisitionInvoiceColumns = useMemo<any[]>(
        () => [
            {
                key: "InvoiceNumber",
                label: "Invoice Number",
                align: "left",
                render: (value?: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="180px"
                        tooltipThreshold={18}
                    />
                )
            },
            {
                key: "InvoiceAmount",
                label: "Invoice Amount",
                align: "left",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "InvoiceDueDate",
                label: "Invoice Due Date",
                align: "left",
                render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
            },
        ], []
    );

    return (
        <div className="bg-white p-1">
            <Loader loading={isLoading} title={loadingMessage}> {" "} <div></div>{" "} </Loader>
            <div className="grid grid-cols-12 gap-3 pt-1">

                <div className="col-span-6">

                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#E7F2FF] px-4 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                Basic Details
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
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

                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#FFFFE4] px-4 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#7B6B28]">
                                Purchase Order
                            </h4>
                        </div>

                        <div className="p-4">
                            {matrialRequisitionData?.PurchaseOrderURL.length == 0 ? (
                                <p className="text-gray-900 text-md">No Document</p>
                            ) : (
                                <div className="inline-flex items-end gap-1 px-2 py-2 border border-blue-500 text-blue-600 rounded text-sm font-medium cursor-pointer hover:bg-blue-50 transition">
                                    <p>Document</p>
                                    <MultiImageViewer
                                        images={parseDocumentUrls(matrialRequisitionData?.PurchaseOrderURL ?? '')}
                                        title="Purchase Order"
                                        isIcon={false}
                                        triggerLabel="-"
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="col-span-6">
                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#FFF6EB] px-4 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#C2410C]">
                                Vendor And Amount Details
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
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

                <div className="col-span-12">
                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#F3E8FF] px-4 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#7E22CE]">
                                Matrial Requisition Detail
                            </h4>
                        </div>

                        <div className="overflow-y-auto thin-scroll h-[200px]">
                            <DataTableWithOutBorder
                                columns={MatrialRequisitionDetailColumns}
                                data={matrialRequisitionDetailData}
                                emptyMessage="No Material Requisition Details Found"
                                fixedHeight={true}
                                className="flex-1"
                            />
                        </div>
                    </section>
                </div>

                <div className="col-span-12">
                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#FCE7F3] px-4 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#BE185D]">
                                Invoice Details
                            </h4>
                        </div>

                        <div className="overflow-y-auto thin-scroll h-[200px]">
                            <DataTableWithOutBorder
                                columns={MaterialRequisitionInvoiceColumns}
                                data={MaterialRequisitionInvoiceData}
                                emptyMessage="No Material Invoice Details Found"
                                fixedHeight={true}
                                className="flex-1"
                            />
                        </div>
                    </section>
                </div>

                <div className="col-span-12">
                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#E6FFE6] px-4 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#00A800]">
                                Remarks
                            </h4>
                        </div>

                        <div className="p-4">
                            <span>{matrialRequisitionData?.Remarks}</span>
                        </div>
                    </section>
                </div>

                <div className="col-span-12">
                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#E1E2E4] px-4 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#333333]">
                                Action Details
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-[#135bec2e]">
                            <FieldItem label="Created By" value={matrialRequisitionData?.CreatedBy} />
                            <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.CreatedDate ?? '')} />
                            <FieldItem label="Modified By" value={matrialRequisitionData?.ModifiedBy} />
                            <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(matrialRequisitionData?.ModifiedDate ?? '')} />
                        </div>
                    </section>
                </div>

            </div >
        </div >
    )
}

export default Overview;