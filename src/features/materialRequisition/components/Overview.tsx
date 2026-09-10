
import {  useMemo } from "react";
import type {  MaterialRequisitionData, MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel";
import type { MaterialRequisitionInvoiceData } from "@/features/materialRequisition/models/MaterialRequisitionInvoiceModel";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { formatCurrency } from "@/core/utils/comman";
import { DataTableWithHeaderRowDivider, type TableColumn } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import FieldInfoTooltip from "@/ui/components/forms/FieldInfoTooltip";

interface OverviewProps {
    matrialRequisitionData: MaterialRequisitionData | null;
    matrialRequisitionDetailData: MaterialRequisitionDetailData[];
    materialRequisitionInvoiceData: MaterialRequisitionInvoiceData[];
}

export const Overview: React.FC<OverviewProps> = ({matrialRequisitionData, matrialRequisitionDetailData,  materialRequisitionInvoiceData }) => {

    const MatrialRequisitionDetailColumns = useMemo<TableColumn[]>(() => {

        const isDirect = matrialRequisitionDetailData?.[0]?.MaterialRequisitionType?.toUpperCase() === "DIRECT";

        const columns: TableColumn[] = [];

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
                {
                    key: "MaterialName",
                    label: "Material",
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
            {
                key: "Remark",
                label: "Remark",
                align: "left",
                width: "30",
                render: (value) => (
                    <FieldInfoTooltip value={value} />
                )
            },

        );

        return columns;
    }, [matrialRequisitionDetailData]);

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
        <div className="bg-white p-1 pt-5">
           
            <div className="grid grid-cols-12 gap-3 pt-1">

                <div className="col-span-5">

                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#E7F2FF] px-4 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                Basic Details
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                            <FieldItem label="MR Code" value={matrialRequisitionData?.SystemGeneratedCode} />
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
                                <p className="text-gray-900 text-md px-2 py-1.5">-</p>
                            ) : (
                                <div className="inline-flex items-end gap-1 px-2 py-1.5 border border-blue-500 text-blue-600 rounded text-sm font-medium cursor-pointer hover:bg-blue-50 transition">
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

                <div className="col-span-7">
                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#FFF6EB] px-4 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#C2410C]">
                                Vendor & Amount Details
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-b border-[#135bec2e]">
                            <FieldItem label="Vendor Name" value={matrialRequisitionData?.FinalVendor} />
                            <FieldItem label="Vendor Company" value={matrialRequisitionData?.FinalVendorCompanyName} />
                            <FieldItem label="Mobile Number" value={matrialRequisitionData?.FinalVendorMobileNumber} />
                            <FieldItem label="GST Number" value={matrialRequisitionData?.FinalVendorGSTNumber} />
                            <FieldItem label="Base Amount" value={formatCurrency(matrialRequisitionData?.TotalPoAmount)} />
                            <FieldItem label="Total Tax" value={formatCurrency(matrialRequisitionData?.TotalTaxAmount)} />
                            <FieldItem label="Grand Total" value={formatCurrency(Number(matrialRequisitionData?.TotalPoAmount ?? 0) + Number(matrialRequisitionData?.TotalTaxAmount ?? 0))} />
                           
                            <FieldItem label="Paid Amount (₹)" value={formatCurrency(matrialRequisitionData?.PaidAmount)} />
                            <FieldItem
                                label="Pending Amount (₹)"
                                value={formatCurrency(
                                    Math.max(
                                        0,
                                        (
                                            Number(matrialRequisitionData?.TotalPoAmount ?? 0) +
                                            Number(matrialRequisitionData?.TotalTaxAmount ?? 0)
                                        ) -
                                        Number(matrialRequisitionData?.PaidAmount ?? 0)
                                    )
                                )} />
                            <FieldItem label="Expected Delivery" value={`${matrialRequisitionData?.ExpectedDeliveryInDays ?? 0} days`} />
                            <FieldItem label="Expected Payment" value={`${matrialRequisitionData?.ExpectedPaymentInDays ?? 0} days`} />
                        </div>
                    </section>

                </div>

                <div className="col-span-12">
                    <section className="border border-[#33333321] rounded-xl overflow-hidden mb-2">
                        <div className="bg-[#F3E8FF] px-4 py-2 border-b border-[#D0D7DE] flex items-center justify-between">

                            <h4 className="text-sm font-semibold text-[#7E22CE] flex items-center gap-2">
                                Material Details :
                                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-[#7E22CE] text-white text-xs font-bold">
                                    {matrialRequisitionDetailData.length}
                                </span>
                            </h4>
                            <div className="flex items-center gap-2">

                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#7E22CE] text-[#ffffff] text-xs font-medium">
                                    {matrialRequisitionDetailData?.[0]?.MaterialRequisitionType || "-"}
                                </span>

                            </div>

                        </div>

                        <div className="overflow-y-auto thin-scroll">
                            <DataTableWithHeaderRowDivider
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

                        <div className="overflow-y-auto thin-scroll">
                            <DataTableWithHeaderRowDivider
                                columns={MaterialRequisitionInvoiceColumns}
                                data={materialRequisitionInvoiceData}
                                emptyMessage="No Invoice Details Found"
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
                            <span>{matrialRequisitionData?.Remarks || "-"}</span>
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