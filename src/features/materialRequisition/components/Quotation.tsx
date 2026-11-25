import { ExpandableCard } from "@/ui/components/Card/ExpandableCard"
import { useEffect, useState } from "react"
import useToast from "@/core/hooks/useToast"
import type { FilterSelectedVendorForQuotationRequest } from "@/features/materialRequisition/models/MaterialRequisitionQuotationModel"
import { useParams } from "react-router-dom"
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext"
import { runApiWithLoader } from "@/core/utils"
import * as E from "fp-ts/Either"
import { QuotationTable } from "./QuotationTable"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import { computeLinesTotal } from "@/features/materialRequisition/utils/finalizeVendorUtils"
import { materialRequisitionQuotationService } from "@/features/materialRequisition/services/MaterialRequisitionQuotationService"
import { Input } from "@/ui/components/forms/Input"
import { Loader } from "@/core/utils/loader";
import { formatCurrency } from "@/core/utils/comman";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker"
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer"
import { parseDocumentUrls } from "@/core/utils/documentUtils"
import type { MaterialRequisitionDetailData } from "@/features/materialRequisition/models/MaterialRequisitionModel"
import { Building2 } from "lucide-react"

interface QuotationProps {
    materialRequisitionDetailData: MaterialRequisitionDetailData[];
}

export const Quotation: React.FC<QuotationProps> = ({ materialRequisitionDetailData }) => {

    const ispendingMaterialRequisitionDetail = materialRequisitionDetailData.some(item => item.ApprovalStatus?.trim().toUpperCase() === "PENDING");

    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>()
    const { listState } = useMaterialRequisitionListState()
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.materialRequisitionId
    const currentUniquekey = listState.uniquekey
    const projectId = listState.projectId;
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")
    const [materialRequisitionVendorSelectedList, setMaterialRequisitionVendorSelectedList] = useState<any[]>([])
    const [liveQuotationLines, setLiveQuotationLines] = useState<Record<string, any[]>>({});
    const [expectedDeliveryDays, setExpectedDeliveryDays] = useState<Record<number, string>>({});
    const [expectedPaymentDays, setExpectedPaymentDays] = useState<Record<number, string>>({});
    const [editingQuotationKey, setEditingQuotationKey] = useState<string | null>(null);
    const [quotationFiles, setQuotationFiles] = useState<(File | string)[]>([]);
    const [removedQuotationUrls, setRemovedQuotationUrls] = useState<string[]>([]);
    const [editingVendorIds, setEditingVendorIds] = useState<number[]>([]);

    useEffect(() => {
        if (!projectId) return

        pullSelectedVendorForQuotation();

    }, [projectId])

    const pullSelectedVendorForQuotation = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterSelectedVendorForQuotationRequest = {
                    MaterialRequisitionId: Number(currentMaterialRequisitionId),
                    Uniquekey: currentUniquekey ?? '',
                    ProjectId: Number(projectId),
                }
                const response = await materialRequisitionQuotationService.apiCallPullSelectedVendorForQuotation(params);

                if (E.isRight(response)) {
                    const data = response.right.Data ?? [];

                    setMaterialRequisitionVendorSelectedList(data);
                    setExpectedDeliveryDays({});
                    setExpectedPaymentDays({});
                    setQuotationFiles([]);
                    setRemovedQuotationUrls([]);
                }
                return response
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Selected Vendor For Quotation"
        );
    };



    const buildPayload = (vendor: any, term: any, lines: any[]): FormData => {

        const fd = new FormData();

        fd.append('MaterialRequisitionId', String(currentMaterialRequisitionId ?? 0));
        fd.append('Uniquekey', term.Uniquekey || currentUniquekey || '');
        fd.append('MaterialRequisitionQuotationTermsId', String(term.MaterialRequisitionQuotationTermsId ?? 0));
        fd.append('ProjectId', String(projectId ?? 0));
        fd.append('VendorId', String(vendor.VendorId ?? 0));
        fd.append('ExpectedDeliveryInDays', String(expectedDeliveryDays[term.MaterialRequisitionQuotationTermsId] ?? term.ExpectedDeliveryInDays ?? 0));
        fd.append('ExpectedPaymentInDays', String(expectedPaymentDays[term.MaterialRequisitionQuotationTermsId] ?? term.ExpectedPaymentInDays ?? 0));
        fd.append('Total', String(computeLinesTotal(lines)));

        const quotationRows = lines.map((row: any) => ({
            ...row,
            Logistics: Number(row.MaterialRequisitionDetailId) === 0
                ? String(row.MaterialName ?? row.Logistics ?? "")
                : String(row.Logistics ?? "0"),
            Amount: Number(row.Amount || 0),
            Installation: Number(row.Installation || 0),
            CGST: Number(row.CGST || 0),
            SGST: Number(row.SGST || 0),
            UGST: Number(row.UGST || 0),
            TGST: Number(row.TGST || row.IGST || 0),
        }));

        fd.append('MaterialRequisitionQuotationJSON', JSON.stringify(quotationRows));

        quotationFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('QuotationURL', file);
            }
        });

        fd.append('RemoveQuotationURL', removedQuotationUrls.join(','));

        return fd;
    };

    const handleAddMaterialRequisitionQuotation = async (vendor: any, term: any, lines: any[]) => {

        if (computeLinesTotal(lines) === 0) {

            addToast({ type: "error", title: "Please add a price for atleast one quotation item." });
            
            return;
        }

        await runApiWithLoader(setIsLoading, setLoadingMessage, async () => {

            const payload = buildPayload(vendor, term, lines)

            const response = await materialRequisitionQuotationService.apiCallAddMaterialRequisitionQuotation(payload)

            if (E.isRight(response)) {

                await pullSelectedVendorForQuotation();

                addToast({ type: "success", title: response.right.SuccessMessage[0] })
            }
            else {
                addToast({ type: "error", title: response.left.message })
            }
            return response
        })
    }

    return (
        <div className="space-y-4">
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>


            {materialRequisitionVendorSelectedList.length === 0
                ? <section className="md:col-span-4 bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                    <NoDataView />
                </section>

                : materialRequisitionVendorSelectedList.map((vendor: any) => {

                    const firstTerm = vendor.MaterialRequisitionQuotationTermsData?.[0];

                    const originalHeaderLines = firstTerm?.MaterialRequisitionQuotationData ?? [];

                    const quotationKey = `${vendor.VendorId}-${firstTerm?.MaterialRequisitionQuotationTermsId}`;

                    const headerLines = liveQuotationLines[quotationKey] ?? originalHeaderLines;

                    return (
                        <ExpandableCard
                            key={vendor.VendorId}
                            showline
                            height={100}
                            expandedheight={900}
                            bgColor="bg-white"
                            isShadow={false}
                            defaultOpen={true}
                            titleClassName="flex-1 min-w-0"
                            title={
                                <div className="flex flex-col w-full" onClick={(e) => e.stopPropagation()}>

                                    <div className="flex items-start justify-between w-full px-1">

                                        <div className="flex flex-col min-w-0">

                                            <div className="flex items-center gap-3">


                                                <div className="font-semibold text-gray-900 text-base">
                                                    {vendor.VendorName || "-"}
                                                </div>

                                                <div className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium whitespace-nowrap">
                                                    {vendor.GSTNumber || "-"}
                                                </div>
                                            </div>


                                            <div className="flex items-center gap-3 mt-3 flex-wrap">

                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-black-700 text-sm font-medium">

                                                    <Building2 size={14} className="text-black-400 shrink-0" />

                                                    <span className="break-words min-w-0">
                                                        {vendor.CompanyName || "-"}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>
                                        <div className="px-5">
                                            <div className="text-sm uppercase tracking-wide text-gray-400">
                                                Grand Total
                                            </div>

                                            <div className="text-lg font-semibold text-blue-700">
                                                {formatCurrency(computeLinesTotal(headerLines))}
                                            </div>
                                        </div>


                                    </div>

                                </div>
                            }
                            child={

                                <div className="space-y-4">
                                    {(vendor.MaterialRequisitionQuotationTermsData?.length ? vendor.MaterialRequisitionQuotationTermsData : [{}]).map((term: any, idx: number) => {

                                        const quotationKey = `${vendor.VendorId}-${term.MaterialRequisitionQuotationTermsId}`;
                                        const lines = term?.MaterialRequisitionQuotationData ?? []

                                        if (!lines?.length) {
                                            return <NoDataView key={idx} />
                                        }

                                        return (
                                            <div key={idx}>

                                                <QuotationTable
                                                    data={lines}
                                                    isEditable={editingQuotationKey === quotationKey}
                                                    onEditModeChange={(editing) => {

                                                        setEditingQuotationKey(editing ? quotationKey : null);

                                                        setEditingVendorIds(prev =>
                                                            editing
                                                                ? [...new Set([...prev, vendor.VendorId])]
                                                                : prev.filter(id => id !== vendor.VendorId)
                                                        );
                                                    }}


                                                    onChange={(updatedLines) => {
                                                        setLiveQuotationLines(prev => ({
                                                            ...prev,
                                                            [quotationKey]: updatedLines
                                                        }));
                                                    }}
                                                    onSave={(updatedLines) =>
                                                        handleAddMaterialRequisitionQuotation(vendor, term, updatedLines)
                                                    }
                                                    MaterialRequisitionStatus={listState.materialRequisitionStatus}
                                                    MaterialRequisitionApprovalStatus={listState.approvalStatus}
                                                    VendorGSTNumber={vendor.GSTNumber}
                                                    CompanyGSTNumber={listState.companyGSTNumber}
                                                    IsPendingMaterialRequisitionDetail={ispendingMaterialRequisitionDetail}
                                                    addToast={addToast}
                                                    onCancel={() => {
                                                        setQuotationFiles([]);
                                                        setRemovedQuotationUrls([]);

                                                        setExpectedDeliveryDays(prev => {
                                                            const updated = { ...prev };
                                                            delete updated[term.MaterialRequisitionQuotationTermsId];
                                                            return updated;
                                                        });

                                                        setExpectedPaymentDays(prev => {
                                                            const updated = { ...prev };
                                                            delete updated[term.MaterialRequisitionQuotationTermsId];
                                                            return updated;
                                                        });

                                                        setLiveQuotationLines(prev => {
                                                            const updated = { ...prev };
                                                            delete updated[quotationKey];
                                                            return updated;
                                                        });
                                                    }}
                                                />

                                                <div className="flex justify-between text-sm bg-green-100 p-3">

                                                    <span>Expected Delivery (Days)</span>
                                                    <span>
                                                        {editingVendorIds.includes(vendor.VendorId) ? (

                                                            <Input
                                                                type="text"
                                                                rightIcon="Days"
                                                                maxLength={5}
                                                                value={
                                                                    expectedDeliveryDays[term.MaterialRequisitionQuotationTermsId]
                                                                    ?? String(term?.ExpectedDeliveryInDays ?? "")
                                                                }
                                                                onChange={(e) => {
                                                                    const value = e.target.value.replace(/\D/g, "");

                                                                    setExpectedDeliveryDays(prev => ({
                                                                        ...prev,
                                                                        [term.MaterialRequisitionQuotationTermsId]: value
                                                                    }));
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>{`${term?.ExpectedDeliveryInDays ?? 0} Days`}</span>
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between text-sm bg-gray-100 p-3">
                                                    <span>Expected Payment (Days)</span>
                                                    <span>
                                                        {editingVendorIds.includes(vendor.VendorId) ? (

                                                            <Input
                                                                type="text"
                                                                rightIcon="Days"
                                                                maxLength={5}
                                                                value={
                                                                    expectedPaymentDays[term.MaterialRequisitionQuotationTermsId]
                                                                    ?? String(term?.ExpectedPaymentInDays ?? "")
                                                                }
                                                                onChange={(e) => {
                                                                    const value = e.target.value.replace(/\D/g, "");

                                                                    setExpectedPaymentDays(prev => ({
                                                                        ...prev,
                                                                        [term.MaterialRequisitionQuotationTermsId]: value
                                                                    }));
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>{`${term?.ExpectedPaymentInDays ?? 0} Days`}</span>
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between bg-amber-50 px-4 py-3">
                                                    <span className="text-sm text-[#34495E]">
                                                        {editingQuotationKey !== quotationKey ? "View Quotation" : "Upload Quotation"}
                                                    </span>

                                                    {!editingVendorIds.includes(vendor.VendorId) ? (

                                                        <div className="inline-flex items-end gap-1 px-2 py-2.5 border border-amber-500 text-amber-600 rounded text-sm font-medium cursor-pointer transition">
                                                            <p>Quotation</p>
                                                            <MultiImageViewer
                                                                images={parseDocumentUrls(term?.QuotationURL ?? "")}
                                                                title="Quotation"
                                                                isIcon={false}
                                                                triggerLabel="-"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-[250px]">
                                                            <MultiFilePicker
                                                                key={`${quotationKey}-${editingQuotationKey === quotationKey}`}
                                                                placeholder="Upload Quotation"
                                                                value={quotationFiles}
                                                                onChange={setQuotationFiles}
                                                                availableFilesURL={term?.QuotationURL ?? ""}
                                                                disabled={false}
                                                                allowedTypes={[
                                                                    "image/jpeg",
                                                                    "image/png",
                                                                    "image/jpg",
                                                                    "application/pdf"
                                                                ]}
                                                                maxFiles={10}
                                                                onRemoveExisting={(url) =>
                                                                    setRemovedQuotationUrls(prev => [...prev, url])
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        )
                                    })}
                                </div>
                            }


                        />

                    )
                })
            }




        </div >
    )
}
export default Quotation;


