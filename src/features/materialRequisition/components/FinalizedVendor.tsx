import { ExpandableCard } from "@/ui/components/Card/ExpandableCard"
import { useEffect, useState } from "react"
import useToast from "@/core/hooks/useToast"
import type {
    FilterWithPaginationVendorForEnquiryRequest,
    FilterWithPaginationVendorForSelectedEnquiryRequest
} from "../models/VendorFinalizeModel"
import { useParams } from "react-router-dom"
import { useMaterialRequisitionListState } from "../context/MaterialRequisitionListStateContext"
import { useProject } from "@/features/projectMaster/context/ProjectContext"
import { runApiWithLoader } from "@/core/utils"
import * as E from "fp-ts/Either"
import { vendorFinalizationService } from "../services/VendorFinalizationService"
import { FieldItem } from "@/ui/components/forms/FieldItem"
import Checkbox from "@/ui/components/forms/Checkbox"
import { Copy } from "lucide-react"
import { FinalizedVendorQuotationTable } from "./FinalizedVendorQuotationTable"
import type { TableColumn } from "@/ui/components/DataTable/DataTable"
import type { EditableTableColumn } from "@/ui/components/DataTable/DataTableEditable"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import { computeGrandTotal } from "../utils/finalizeVendorUtils"
import { materialRequisitionQuotationService } from "../services/MaterialRequisitionQuotationService"
import type { AddUpdateMaterialRequestQuotation } from "../models/MaterialRequisitionQuotationApi"

export const FinalizedVendor: React.FC = () => {
    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>()
    const { listState } = useMaterialRequisitionListState()
    const currentMaterialRequisitionId = listMaterialRequisitionId
        ? Number(listMaterialRequisitionId)
        : listState.MaterialRequisitionId

    const currentUniquekey = listState.Uniquekey
    const { projectId } = useProject()
    const { addToast } = useToast()

    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")
    const [materialRequisitionVendorSelectedList, setMaterialRequisitionVendorSelectedList] = useState<any[]>([])
    const [materialRequisitionVendorFinalizedList, setMaterialRequisitionVendorFinalizedList] = useState<any[]>([])

    useEffect(() => {
        if (!projectId) return
        loadSelectedVendor()
        loadFinalizedVendor()
    }, [projectId, currentMaterialRequisitionId])

    const loadFinalizedVendor = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationVendorForEnquiryRequest = {
                    MaterialRequisitionId: Number(currentMaterialRequisitionId),
                    Uniquekey: currentUniquekey ?? null,
                    ProjectId: Number(projectId),
                }

                const response =
                    await vendorFinalizationService.apiCallpullVendorsForEnquiry(params)

                if (E.isRight(response)) {
                    setMaterialRequisitionVendorFinalizedList(response.right.Data)
                } else {
                    addToast({ type: "error", title: response.left.message })
                }

                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message })
            },
            undefined,
            "Loading Finalized Vendor..."
        )
    }
    const PushFinalizedVendorFormData = (
        vendor: any,
        term: any
    ): AddUpdateMaterialRequestQuotation => {

        return {
            MaterialRequisitionId: Number(currentMaterialRequisitionId),
            Uniquekey: currentUniquekey || '',
            MaterialRequisitionQuotationTermsId: term.MaterialRequisitionQuotationTermsId,
            ProjectId: Number(projectId),
            VendorId: vendor.VendorId,
            ExpectedDeliveryInDays: term.ExpectedDeliveryInDays,
            ExpectedPaymentInDays: term.ExpectedPaymentInDays,
            Total: getGrandTotal(term.MaterialRequisitionQuotationData),
            MaterialRequisitionQuotationJSON:
                JSON.stringify(term.MaterialRequisitionQuotationData),
        }
    }

    const loadSelectedVendor = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationVendorForSelectedEnquiryRequest = {
                    MaterialRequisitionId: Number(currentMaterialRequisitionId),
                    Uniquekey: currentUniquekey ?? null,
                    ProjectId: Number(projectId),
                }

                const response =
                    await vendorFinalizationService.apiCallPullSelectedVendorForEnquiry(params)

                if (E.isRight(response)) {
                    setMaterialRequisitionVendorSelectedList(response.right.Data)
                } else {
                    addToast({ type: "error", title: response.left.message })
                }

                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message })
            },
            undefined,
            "Loading Selected Vendor..."
        )
    }

    const computeTotalTax = (lines: any[]) =>
        lines.reduce(
            (sum, l) =>
                sum +
                (Number(l.CGST || 0) +
                    Number(l.SGST || 0) +
                    Number(l.UGST || 0) +
                    Number(l.TGST || 0)),
            0
        )

    const getGrandTotal = (lines: any[]) => {
        const base = lines.reduce(
            (sum, l) => sum + Number(l.Amount || 0),
            0
        )
        return base + computeTotalTax(lines)
    }

    const calculateAmount = (row: any) => {
        const qty = Number(row.MaterialQuantity || 0)
        const rate = Number(row.MaterialPerUnit || 0)
        return qty * rate
    }

    const saveData = async (vendor: any, term: any) => {
        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {

                const payload = PushFinalizedVendorFormData(vendor, term)

                const response = await materialRequisitionQuotationService.apiCallToAddMaterialRequisitionQuotation(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });


                } else {
                    addToast({ type: "error", title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
        );
    };
    const handleQuotationRowsChange = (
        vendorId: number,
        termId: number,
        newRows: any[]
    ) => {
        const updatedSelected =
            materialRequisitionVendorSelectedList.map((v) => {
                if (v.VendorId !== vendorId) return v

                return {
                    ...v,
                    MaterialRequisitionQuotationTermsData:
                        v.MaterialRequisitionQuotationTermsData.map((t: any) => {
                            if (
                                t.MaterialRequisitionQuotationTermsId !== termId
                            )
                                return t

                            return {
                                ...t,
                                MaterialRequisitionQuotationData: newRows,
                            }
                        }),
                }
            })

        setMaterialRequisitionVendorSelectedList(updatedSelected)
    }

    if (materialRequisitionVendorSelectedList.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                <NoDataView />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {materialRequisitionVendorSelectedList.map((vendor: any) => (
                <ExpandableCard
                    key={vendor.MaterialRequisitionId}
                    showline={true}
                    height={70}
                    expandedheight={400}
                    title={
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-4 items-start">
                                <div className="col-span-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <Checkbox size="sm" className="mt-1" />
                                            <div>
                                                <div className="font-medium">{vendor.VendorName}</div>
                                                <div className="text-gray-500 text-sm">
                                                    {vendor.CompanyName}
                                                </div>
                                            </div>
                                        </div>

                                        <Copy
                                            className="text-gray-500 cursor-pointer mt-1"
                                            size={16}
                                            onClick={() => {
                                                navigator.clipboard.writeText(vendor.EmailId)
                                                addToast({
                                                    type: "success",
                                                    title: "Email ID copied to clipboard",
                                                })
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-9 grid grid-cols-4 gap-3">
                                    {vendor.MaterialRequisitionQuotationTermsData?.[0] && (
                                        <>
                                            <FieldItem
                                                label="BASE AMOUNT"
                                                value={`₹${Number(
                                                    vendor.MaterialRequisitionQuotationTermsData[0].MaterialRequisitionQuotationData.reduce(
                                                        (sum: number, l: any) => sum + Number(l.Amount || 0),
                                                        0
                                                    )
                                                ).toFixed(2)}`}
                                            />
                                            <FieldItem
                                                label="TOTAL TAX"
                                                value={`₹${Number(
                                                    computeTotalTax(
                                                        vendor.MaterialRequisitionQuotationTermsData[0].MaterialRequisitionQuotationData
                                                    )
                                                ).toFixed(2)}`}
                                            />
                                            <FieldItem
                                                label="GRAND TOTAL"
                                                value={`₹${Number(
                                                    getGrandTotal(
                                                        vendor.MaterialRequisitionQuotationTermsData[0].MaterialRequisitionQuotationData
                                                    )
                                                ).toFixed(2)}`}
                                            />
                                            <FieldItem
                                                label="EST. DELIVERY"
                                                value={`${vendor.MaterialRequisitionQuotationTermsData[0].ExpectedDeliveryInDays} Days`}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    }
                    child={
                        <div className="p-2 space-y-4">
                            {vendor.MaterialRequisitionQuotationTermsData.map(
                                (term: any, tIdx: number) => {
                                    const lines = term.MaterialRequisitionQuotationData.map((row: any) => ({
                                        ...row,
                                        Amount: calculateAmount(row),
                                    }))

                                    const baseAmount = lines.reduce(
                                        (sum: number, r: any) => sum + Number(r.Amount || 0),
                                        0
                                    )

                                    const grandTotal = lines.reduce(
                                        (sum: number, r: any) => sum + computeGrandTotal(r),
                                        0
                                    )

                                    const taxAmount = grandTotal - baseAmount

                                    return (
                                        <div key={tIdx} >


                                            {/* //<FinalizedVendorQuotationTable
                                            // data={lines}
                                            // columns={quotationLineColumns}
                                            // showSearch={false}
                                            // showAddRow={false}
                                            // showDelete={false}
                                            // showTotals={true}
                                            // onChange={(newRows) =>
                                            //     handleQuotationRowsChange(
                                            //         vendor.VendorId,
                                            //         term.MaterialRequisitionQuotationTermsId,
                                            //         newRows
                                            //     )
                                            // }
                                            // className="border rounded"
                                            // colors={{
                                            //     header: "#1e3a8a",
                                            //     total: "#0f1f3d",
                                            //     accent: "#22c55e",
                                            // }}
                                            /> */}
                                            <FinalizedVendorQuotationTable
                                                data={lines}
                                                // columns={quotationLineColumns}

                                                isEditable={false}
                                                onChange={(newRows) =>
                                                    handleQuotationRowsChange(
                                                        vendor.VendorId,
                                                        term.MaterialRequisitionQuotationTermsId,
                                                        newRows
                                                    )
                                                }
                                                onSave={() =>
                                                    saveData(
                                                        vendor,
                                                        term
                                                    )
                                                }
                                            />

                                            <div className="flex justify-between text-sm bg-green-100  border border-green-200 p-3 rounded">
                                                <span className="text-gray-500">Total Amount (₹)</span>

                                                <div className="font-semibold text-right">
                                                    {Number(baseAmount).toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm bg-blue-50  border border-blue-200 p-3 rounded">
                                                <span className="text-gray-500">Expected Delivery</span>

                                                <div className="font-semibold text-right">
                                                    {vendor.MaterialRequisitionQuotationTermsData[0].ExpectedDeliveryInDays} Days
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm bg-gray-100 p-3 rounded">
                                                <span className="text-gray-500">Tax</span>

                                                <div className="font-semibold text-right">
                                                    {Number(taxAmount).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    }
                />
            ))}
        </div>
    )
}