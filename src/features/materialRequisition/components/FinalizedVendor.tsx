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
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import {
    computeGrandTotal,
    computeTaxTotal,
    computeBaseTotal,
    computeLinesTotal
} from "../utils/finalizeVendorUtils"
import { materialRequisitionQuotationService } from "../services/MaterialRequisitionQuotationService"
import type { AddUpdateMaterialRequestQuotation } from "../models/MaterialRequisitionQuotationApi"
import { Button } from "@/ui/components/forms/Button"
import { Modal } from "@/ui/components/Modal/Modal"
import { Input } from "@/ui/components/forms/Input"

export const FinalizedVendor: React.FC = () => {

    const { MaterialRequisitionId: listMaterialRequisitionId } =
        useParams<{ MaterialRequisitionId?: string }>()

    const { listState } = useMaterialRequisitionListState()

    const currentMaterialRequisitionId = listMaterialRequisitionId
        ? Number(listMaterialRequisitionId)
        : listState.MaterialRequisitionId

    const currentUniquekey = listState.Uniquekey

    const { projectId } = useProject()
    const { addToast } = useToast()
    const { detailData } = useMaterialRequisitionListState()

    const [isQuotationAvailable, setQuotationAvailable] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")
    const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([])
    const [searchVendor, setSearchVendor] = useState("")

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
                }

                return response
            }
        )
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
                }

                return response
            }
        )
    }

    const toggleVendor = (id: number) => {
        setSelectedVendorIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        )
    }

    const toggleVendorSelectAllVisible = () => {

        const visibleIds =
            materialRequisitionVendorFinalizedList.map(v => v.VendorId)

        const allSelected =
            visibleIds.every(id => selectedVendorIds.includes(id))

        if (allSelected) {
            setSelectedVendorIds(prev =>
                prev.filter(id => !visibleIds.includes(id))
            )
        } else {
            setSelectedVendorIds(prev =>
                [...new Set([...prev, ...visibleIds])]
            )
        }
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
            Total: computeLinesTotal(term.MaterialRequisitionQuotationData),
            MaterialRequisitionQuotationJSON:
                JSON.stringify(term.MaterialRequisitionQuotationData),
        }
    }

    const saveData = async (vendor: any, term: any) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload =
                    PushFinalizedVendorFormData(vendor, term)

                const response =
                    await materialRequisitionQuotationService
                        .apiCallToAddMaterialRequisitionQuotation(payload)

                if (E.isRight(response)) {
                    addToast({
                        type: "success",
                        title: response.right.SuccessMessage[0]
                    })
                }

                return response
            }
        )
    }

    const addSelectedVendors = async () => {

        const vendorIds = selectedVendorIds.join(",")

        const payload = {
            MaterialRequisitionId: Number(currentMaterialRequisitionId),
            Uniquekey: currentUniquekey ?? null,
            ProjectId: Number(projectId),
            VendorId: vendorIds
        }

        const response =
            await vendorFinalizationService
                .apiCallToAddVendorForEnquiry(payload)

        if (E.isRight(response)) {

            const selected =
                materialRequisitionVendorFinalizedList.filter(v =>
                    selectedVendorIds.includes(v.VendorId)
                )

            setMaterialRequisitionVendorSelectedList(selected)
            setQuotationAvailable(false)
            setSelectedVendorIds([])
        }
    }

    return (
        <div className="space-y-4">

            {materialRequisitionVendorSelectedList.length === 0 && (
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        color="green"
                        onClick={() => setQuotationAvailable(true)}
                    >
                        Get Quotation
                    </Button>
                </div>
            )}

            {materialRequisitionVendorSelectedList.length === 0
                ? <NoDataView />
                : materialRequisitionVendorSelectedList.map((vendor: any) => {

                    const firstTerm =
                        vendor.MaterialRequisitionQuotationTermsData?.[0]

                    const headerLines =
                        firstTerm?.MaterialRequisitionQuotationData || []

                    return (
                        <ExpandableCard
                            key={vendor.VendorId}
                            showline
                            height={70}
                            expandedheight={400}

                            title={
                                <div className="grid grid-cols-12 gap-4">

                                    <div className="col-span-3">
                                        <div className="font-medium">
                                            {vendor.VendorName}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {vendor.CompanyName}
                                        </div>
                                    </div>

                                    <div className="col-span-9 grid grid-cols-4 gap-3">

                                        <FieldItem
                                            label="BASE AMOUNT"
                                            value={`₹${computeBaseTotal(headerLines).toFixed(2)}`}
                                        />

                                        <FieldItem
                                            label="TOTAL TAX"
                                            value={`₹${computeTaxTotal(headerLines).toFixed(2)}`}
                                        />

                                        <FieldItem
                                            label="GRAND TOTAL"
                                            value={`₹${computeLinesTotal(headerLines).toFixed(2)}`}
                                        />

                                        <FieldItem
                                            label="EST. DELIVERY"
                                            value={`${firstTerm?.ExpectedDeliveryInDays || 0} Days`}
                                        />

                                    </div>
                                </div>
                            }

                            child={
                                <div className="p-2 space-y-4">

                                    {(vendor.MaterialRequisitionQuotationTermsData?.length
                                        ? vendor.MaterialRequisitionQuotationTermsData
                                        : [{}]
                                    ).map((term: any, idx: number) => {

                                        const lines =
                                            term?.MaterialRequisitionQuotationData?.length
                                                ? term.MaterialRequisitionQuotationData
                                                : detailData

                                        if (!lines?.length) {
                                            return <NoDataView key={idx} />
                                        }

                                        const baseAmount = computeBaseTotal(lines)
                                        const taxAmount = computeTaxTotal(lines)
                                        const grandTotal = computeLinesTotal(lines)

                                        return (
                                            <div key={idx}>

                                                <FinalizedVendorQuotationTable
                                                    data={lines}
                                                    isEditable={false}
                                                    onSave={() =>
                                                        saveData(vendor, term)
                                                    }
                                                />

                                                <div className="flex justify-between text-sm bg-green-100 p-3 rounded">
                                                    <span>Total Amount</span>
                                                    <span>{baseAmount.toFixed(2)}</span>
                                                </div>

                                                <div className="flex justify-between text-sm bg-gray-100 p-3 rounded">
                                                    <span>Tax</span>
                                                    <span>{taxAmount.toFixed(2)}</span>
                                                </div>

                                                <div className="flex justify-between text-sm bg-blue-100 p-3 rounded">
                                                    <span>Grand Total</span>
                                                    <span>{grandTotal.toFixed(2)}</span>
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

            <Modal
                isOpen={isQuotationAvailable}
                title="Vendors Available"
                onSubmit={addSelectedVendors}
                onClose={() => setQuotationAvailable(false)}
                size="half-screen"
            >
                <div className="space-y-2">

                    {materialRequisitionVendorFinalizedList.map((v: any) => {

                        const checked =
                            selectedVendorIds.includes(v.VendorId)

                        return (
                            <div
                                key={v.VendorId}
                                className="flex gap-3 p-2"
                            >
                                <Checkbox
                                    checked={checked}
                                    onChange={() =>
                                        toggleVendor(v.VendorId)
                                    }
                                />

                                <div>
                                    <div>{v.VendorName}</div>
                                    <div className="text-sm text-gray-500">
                                        {v.CompanyName}
                                    </div>
                                </div>

                            </div>
                        )
                    })}

                </div>
            </Modal>

        </div>
    )
}