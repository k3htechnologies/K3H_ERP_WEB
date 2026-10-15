import type React from "react";

import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { ContractRequisitionData } from "@/features/contractRequisition/models/ContractRequisitionModel";

interface ContractOverviewProps {
  contractRequisitionData: ContractRequisitionData | null
}
export const ContractOverview: React.FC<ContractOverviewProps> = ({ contractRequisitionData }) => {


  // const firstTerm = contractRequisitionVendorData?.ContractRequisitionQuotationTermsData?.[0];
  // const Vendoramount = firstTerm?.ContractRequisitionQuotationData || [];
  // const amountPaid = contractRequisitionVendorData?.reduce(
  //   (sum: number, item: any) => sum + Number(item.InvoiceAmountPaidTillDate ?? 0),
  //   0,
  // );
  return (
    <>
      <div className="grid xl:grid-cols-2 xl:grid-rows-[auto_auto_auto_auto] gap-6 mt-4">
        <div className="row-start-1 col-start-1">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE] rounded-t-xl">
              <h4 className="text-sm font-semibold text-[#1D4ED8]">Basic Details</h4>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-5">
              <FieldItem label="Unique ID" value={contractRequisitionData?.SystemGeneratedCode} />
              <FieldItem label="Status" value={contractRequisitionData?.ContractStatus} />
              {/* <FieldItem label="Stage" value={contractRequisitionData?.contr} /> */}
              <div>
                <p className="text-gray-500">Attachment</p>
                <MultiImageViewer
                  images={parseDocumentUrls(contractRequisitionData?.AttachmentsURL ?? "")}
                  title="Attachment"
                  isIcon={false}
                  triggerLabel="-"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row-start-1 col-start-2">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="bg-[#FFFFE4] px-3 py-2 border-b border-[#D0D7DE] rounded-t-xl">
              <h4 className="text-sm font-semibold text-[#7B6B28]">Contract Details</h4>
            </div>

            <div className="space-y-4 p-5">
              <FieldItem label="Name" value={contractRequisitionData?.ContractName} />
              <FieldItem label="Remark" value={contractRequisitionData?.Remark} />
            </div>
          </div>
        </div>
        <div className="row-start-2 col-start-1">
          <div className="rounded-xl border border-gray-200 bg-white h-full">
            <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE] rounded-t-xl">
              <h4 className="text-sm font-semibold text-[#C2410C]">Vendor And Amount Details</h4>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-5">
              {/* <FieldItem label="Vendor Name" value={contractRequisitionVendorData?.VendorName} />
              <FieldItem label="Vendor Company" value={contractRequisitionVendorData?.CompanyName} />
              <FieldItem label="Est. Delivery" value={`${contractRequisitionQuotationTermsData[0]?.ExpectedDeliveryInDays ?? 0} days`} />
              <FieldItem label="Paid Amount" value={`₹ ${amountPaid?.toFixed(2)}`} /> */}
            </div>
          </div>
        </div>
        <div className="row-start-2 row-span-2 col-start-2">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="bg-[#EAFCFF] px-3 py-2 border-b border-[#D0D7DE] rounded-t-xl">
              <h4 className="text-sm font-semibold text-[#12A3DD]">Invoice Details</h4>
            </div>
            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2 thin-scroll">
              {/* {ContractRequisitionInvoiceData.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full p-5">
                  <NoDataView />
                </div>
              ) : (
                <div className="p-5">
                  {ContractRequisitionInvoiceData.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 bg-gray-200 px-4 rounded-lg p-2 mt-2 ">
                      <FieldItem label="Invoice Number" value={item.InvoiceNumber} />
                      <FieldItem label="Invoice Amount" value={`₹ ${item.InvoiceAmount ?? ""}`} />
                      <FieldItem label="Due Date" value={formatDate_dd_MonthName_yy(item.InvoiceDueDate ?? "")} />
                    </div>
                  ))}
                </div>
              )} */}
            </div>
          </div>
        </div>
        <div className="row-start-3 col-start-1">
          <div className="rounded-xl border border-gray-200 bg-white h-full">
            <div className="bg-[#E6FFE6] px-3 py-2 border-b border-[#D0D7DE] rounded-t-xl">
              <h4 className="text-sm font-semibold text-[#00A800]">Work Order</h4>
            </div>
            {/* {contractRequisitionData.PurchaseOrderURL ? (
              <div className="inline-flex items-end gap-1 px-2 py-2 border border-blue-500 text-blue-600 rounded mt-2 text-sm font-medium cursor-pointer hover:bg-blue-50 transition p-5">
                <p>Document</p>
                <MultiImageViewer
                  images={parseDocumentUrls(contractRequisitionData?.PurchaseOrderURL ?? "")}
                  title="Purchase Order"
                  isIcon={false}
                  triggerLabel="-"
                />
              </div>
            ) : (
              <div className="p-5">
                <p className="text-gray-900 text-md">No Document</p>
              </div>
            )} */}
          </div>
        </div>
        <div className="row-start-4 col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE] rounded-t-xl">
              <h4 className="text-sm font-semibold text-[#13367A]">Remark</h4>
            </div>
            <div className="p-5">
              <p className="text-gray-700">
                The entire process has been completed successfully, and all stages have been closed without any pending actions.
              </p>
            </div>
          </div>
        </div>
        <div className="row-start-5 col-start-1">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE] rounded-t-xl">
              <h4 className="text-sm font-semibold text-[#333333]">Action Details</h4>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-5">
              <FieldItem label="Created By" value={contractRequisitionData?.CreatedBy} />
              <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(contractRequisitionData?.CreatedDate ?? "")} />
              <FieldItem label="Modified By" value={contractRequisitionData?.ModifiedBy} />
              <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(contractRequisitionData?.ModifiedDate ?? "")} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
