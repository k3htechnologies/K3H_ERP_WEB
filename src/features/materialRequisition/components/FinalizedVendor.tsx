import { ExpandableCard } from "@/ui/components/Card/ExpandableCard"
import { useEffect, useState } from "react"
import useToast from "@/core/hooks/useToast"
import type { FilterWithPaginationVendorForEnquiryRequest, FilterWithPaginationVendorForSelectedEnquiryRequest } from "@/features/materialRequisition/models/VendorFinalizeModel"
import { useParams } from "react-router-dom"
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext"
import { useProject } from "@/features/projectMaster/context/ProjectContext"
import {  useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions"
import { runApiWithLoader } from "@/core/utils"
import * as E from "fp-ts/Either"
import { vendorFinalizationService } from "@/features/materialRequisition/services/VendorFinalizationService"
import { FieldItem } from "@/ui/components/forms/FieldItem"
import Checkbox from "@/ui/components/forms/Checkbox"
import { FinalizedVendorQuotationTable } from "./FinalizedVendorQuotationTable"
import NoDataView from "@/ui/components/NoDataView/NoDataView"
import { computeTaxTotal, computeBaseTotal, computeLinesTotal } from "@/features/materialRequisition/utils/finalizeVendorUtils"
import { materialRequisitionQuotationService } from "@/features/materialRequisition/services/MaterialRequisitionQuotationService"
import type { AddUpdateMaterialRequestQuotation } from "@/features/materialRequisition/models/MaterialRequisitionQuotationModel"
import { Button } from "@/ui/components/forms/Button"
import { Modal } from "@/ui/components/Modal/Modal"
import { Input } from "@/ui/components/forms/Input"
import { CheckLine, Copy, MessageSquareQuote, Scale } from "lucide-react"
import { handleExportFile } from "@/core/utils/exportFile"
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton"
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel"
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal"
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal"
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService"
import { Loader } from "@/core/utils/loader";

const DEFAULT_LOGISTICS = [
    { Logistics: "Transportation" },
    { Logistics: "Loading" },
    { Logistics: "Unloading" },
]

const resolveLines = (term: any, detailData: any[]): any[] => {
    const source: any[] = term?.MaterialRequisitionQuotationData?.length ? term.MaterialRequisitionQuotationData : detailData ?? []
    const hasLogistics = source.some((r: any) => r?.Logistics)
    return hasLogistics ? source : [...source, ...DEFAULT_LOGISTICS]
}

export const FinalizedVendor: React.FC = () => {

    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>()
    const { listState } = useMaterialRequisitionListState()
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId
    const currentUniquekey = listState.Uniquekey
    const { projectId } = useProject()
    const { addToast } = useToast()
    const { detailData } = useMaterialRequisitionListState()
    const { canAction } = useMenuPermissions('/materialRequisition')
    const [checkedFinalVendor, setCheckedFinalVendor] = useState<number | null>(null)
    const [isQuotationAvailable, setQuotationAvailable] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")
    const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([])
    const [searchVendor, setSearchVendor] = useState("")
    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [materialRequisitionVendorSelectedList, setMaterialRequisitionVendorSelectedList] = useState<any[]>([])
    const [materialRequisitionVendorFinalizedList, setMaterialRequisitionVendorFinalizedList] = useState<any[]>([])

    const { canAction: cangetCompare } = useMenuPermissions('Get Compare');
    const { canAction: cangetQuotation } = useMenuPermissions('Get Quotation');
    const { canAction: canfinalizeVendor } = useMenuPermissions('Finalize Vendor');

    useEffect(() => {
        if (!projectId) return

        loadSelectedVendor()
        loadFinalizedVendor()
    }, [projectId])

    useEffect(() => {
        const finalized = materialRequisitionVendorSelectedList.find(v => v.IsFinalized)

        if (finalized) {
            setCheckedFinalVendor(finalized.VendorId)
        }
    }, [materialRequisitionVendorSelectedList])

    const loadFinalizedVendor = async () => {
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
            "Loading Finalized Vendors"
        );
    };

    const loadSelectedVendor = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationVendorForSelectedEnquiryRequest = {
                    MaterialRequisitionId: Number(currentMaterialRequisitionId),
                    Uniquekey: currentUniquekey ?? '',
                    ProjectId: Number(projectId),
                }
                const response = await vendorFinalizationService.apiCallPullSelectedVendorForEnquiry(params);

                if (E.isRight(response)) {
                    setMaterialRequisitionVendorSelectedList(response.right.Data)
                }
                return response
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Loading Selected Vendors"
        );
    };

    const toggleVendor = (id: number) => {
        setSelectedVendorIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const toggleVendorSelectAllVisible = () => {

        const visibleIds = materialRequisitionVendorFinalizedList.map(v => v.VendorId)
        const allSelected = visibleIds.every(id => selectedVendorIds.includes(id))

        if (allSelected) {
            setSelectedVendorIds(prev => prev.filter(id => !visibleIds.includes(id)))
        } else {
            setSelectedVendorIds(prev => [...new Set([...prev, ...visibleIds])])
        }
    }

    const PushVendorForEnquiry = (vendorIds: string) => {
        return {
            MaterialRequisitionId: Number(currentMaterialRequisitionId),
            Uniquekey: currentUniquekey ?? '',
            ProjectId: Number(projectId),
            VendorId: vendorIds
        }
    }

    const handleApprovalSubmit = async (remark: string) => {

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "MATERIAL REQUISITION",
            Id: Number(currentMaterialRequisitionId) ?? 0,
            ProjectId: Number(projectId) ?? 0,
            IsApproved: approvalActionType === "approve",
            Remarks: remark ?? null
        };
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsApprovalActionModalOpen(false);
                    await loadSelectedVendor();
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
            approvalActionType === "approve" ? "Approving Document" : "Rejecting Document"
        );
    };

    const finalizeVendor = async (vendorId: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushVendorForEnquiry(vendorId)

                const response = await vendorFinalizationService.apiCallAddFinalizedVendor(payload)

                if (E.isRight(response)) {

                    setMaterialRequisitionVendorSelectedList(prev =>
                        prev.map(v => v.VendorId === Number(vendorId) ? { ...v, IsFinalized: true } : v)
                    )

                    setCheckedFinalVendor(Number(vendorId))
                    addToast({ type: "success", title: response.right.SuccessMessage[0] })
                }
                else {
                    addToast({ type: "error", title: response.left.message })
                }
                return response
            }
        )
    }

    const addSelectedVendors = async (e: React.FormEvent) => {
        e.preventDefault();

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const vendorIds = selectedVendorIds.join(",")

                const payload = PushVendorForEnquiry(vendorIds)

                const response = await vendorFinalizationService.apiCallToAddVendorForEnquiry(payload)

                if (E.isRight(response)) {

                    const selected = materialRequisitionVendorFinalizedList.filter(v =>
                        selectedVendorIds.includes(v.VendorId))

                    setMaterialRequisitionVendorSelectedList(selected)

                    setMaterialRequisitionVendorFinalizedList(prev =>
                        prev.filter(v => !selectedVendorIds.includes(v.VendorId))
                    )

                    setQuotationAvailable(false)
                    setSelectedVendorIds([])
                    await loadSelectedVendor()

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                } else {
                    addToast({ type: "error", title: response.left?.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Getting Quotation from Vendors'
        )
    };

    const buildPayload = (vendor: any, term: any, lines: any[]): AddUpdateMaterialRequestQuotation => ({
        MaterialRequisitionId: Number(currentMaterialRequisitionId),
        Uniquekey: currentUniquekey || "",
        MaterialRequisitionQuotationTermsId: term.MaterialRequisitionQuotationTermsId,
        ProjectId: Number(projectId),
        VendorId: vendor.VendorId,
        ExpectedDeliveryInDays: term.ExpectedDeliveryInDays,
        ExpectedPaymentInDays: term.ExpectedPaymentInDays,
        Total: computeLinesTotal(lines),
        MaterialRequisitionQuotationJSON: JSON.stringify(lines),
    })

    const saveData = async (vendor: any, term: any, lines: any[]) => {

        await runApiWithLoader(setIsLoading, setLoadingMessage, async () => {

            const payload = buildPayload(vendor, term, lines)

            const response = await materialRequisitionQuotationService.apiCallToAddMaterialRequisitionQuotation(payload)

            if (E.isRight(response)) {

                addToast({ type: "success", title: response.right.SuccessMessage[0] })
            }
            else {
                addToast({ type: "error", title: response.left.message })
            }
            return response
        })
    }

    const handleCompareVendor = async (exportType: 'Excel' | 'PDF') => {

        if (materialRequisitionVendorSelectedList.length !== 2) {
            addToast({ type: "error", title: "Please select atleast two vendors to compare." })
            return;
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationVendorForSelectedEnquiryRequest = {
                    MaterialRequisitionId: Number(currentMaterialRequisitionId),
                    Uniquekey: currentUniquekey ?? '',
                    ProjectId: Number(projectId),
                    ExportType: exportType
                }

                const response = await vendorFinalizationService.apiCallPullSelectedVendorForEnquiry(params)

                if (E.isRight(response)) {

                    handleExportFile(response, exportType, 'Vendor Comparison', addToast);
                }
                return response
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const finalizedVendor = materialRequisitionVendorSelectedList.find(v => v.IsFinalized)
    const isAnyFinalized = !!finalizedVendor
    const isApprovalAvailable = finalizedVendor?.IsApproval === true

    const handleApprovalLog = () => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "FINALIZED VENDOR",
            Id: currentMaterialRequisitionId ?? 0,
            ProjectId: projectId ?? 0,
        };
        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);
    };

    const handleApproveRejectVendor = (approvalType: "approve" | "reject") => {
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);
    };

    const finalizeSelectedVendors = async () => {

        if (!checkedFinalVendor) {
            addToast({ type: "warning", title: "Select vendor to finalize" })
            return
        }
        await finalizeVendor(String(checkedFinalVendor))
    }

    const handleExportCompareVendorExcel = () => handleCompareVendor('Excel')

    return (
        <div className="space-y-4">
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>

            <div className="flex justify-end gap-2">

                {isAnyFinalized && canfinalizeVendor && (
                    <ApprovalActions
                        approvalStatus={finalizedVendor?.VendorFinalizationApproval}
                        onApprove={() => handleApproveRejectVendor("approve")}
                        onReject={() => handleApproveRejectVendor("reject")}
                        showApproval={isApprovalAvailable}
                        isIcons={true}
                        onHistory={handleApprovalLog}
                    />
                )}

                {isAnyFinalized &&
                    <ApprovalLogModal
                        isOpen={isApprovalLogModalOpen}
                        titleText={finalizedVendor?.VendorName}
                        title='Finalized Vendor'
                        onClose={() => setIsApprovalLogModalOpen(false)}
                        request={approvalLogRequest}
                    />
                }

                {!isAnyFinalized && cangetCompare && (
                    <Button
                        size="sm"
                        style={{
                            color: '#135BEC',
                            backgroundColor: '#E8F0FF',
                            padding: '4px 8px',
                        }}
                        leftIcon={<Scale size={20} />}
                        onClick={() => handleExportCompareVendorExcel()}
                    >
                        Compare
                    </Button>
                )}

                {!isAnyFinalized && canfinalizeVendor && (
                    <Button
                        size="sm"
                        style={{
                            color: '#00A800',
                            backgroundColor: '#E8FBE8',
                            padding: '4px 8px',
                        }}
                       
                        leftIcon={<CheckLine size={20} />}
                        onClick={finalizeSelectedVendors}
                    >
                        Finalize Vendor
                    </Button>
                )}

                <ApprovalActionModal
                    title='Document'
                    isOpen={isApprovalActionModalOpen}
                    onClose={() => setIsApprovalActionModalOpen(false)}
                    actionType={approvalActionType}
                    titleText={finalizedVendor?.VendorName}
                    subTitleText={""}
                    onSubmit={handleApprovalSubmit}
                    loading={isLoading}
                />

                {!isAnyFinalized && cangetQuotation && (
                    <Button
                        size="sm"
                        style={{
                            color: '#d35400',
                            backgroundColor: '#FDE6D3',
                            padding: '4px 8px',
                        }}
                        leftIcon={<MessageSquareQuote size={20} />}
                        onClick={() => setQuotationAvailable(true)}
                    >
                        Get Quotation
                    </Button>
                )}
            </div>

            {materialRequisitionVendorSelectedList.length === 0
                ? <NoDataView />
                : materialRequisitionVendorSelectedList.map((vendor: any) => {

                    const firstTerm = vendor.MaterialRequisitionQuotationTermsData?.[0]
                    const headerLines = resolveLines(firstTerm, detailData)

                    return (
                        <ExpandableCard
                            key={vendor.VendorId}
                            showline
                            height={70}
                            expandedheight={400}
                            title={
                                <div className="grid grid-cols-12 gap-4">

                                    <div className="col-span-3 flex items-start gap-4">

                                        <Checkbox
                                            checked={vendor.IsFinalized || checkedFinalVendor === vendor.VendorId}
                                            disabled={!canAction || (isAnyFinalized && !vendor.IsFinalized)}
                                            onChange={() =>
                                                canAction && setCheckedFinalVendor(
                                                    checkedFinalVendor === vendor.VendorId
                                                        ? null : vendor.VendorId
                                                )
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            size="sm"
                                        />

                                        <div className="flex flex-col">
                                            <div className="font-medium">
                                                {vendor.VendorName}
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                {vendor.CompanyName}
                                            </div>
                                        </div>

                                        <Copy className="text-gray-500 cursor-pointer mt-1"
                                            size={16}
                                            onClick={() => {
                                                navigator.clipboard.writeText(vendor.EmailId)
                                                addToast({ type: "success", title: "Email ID copied to clipboard", })
                                            }}
                                        />
                                    </div>

                                    <div className="col-span-9 grid grid-cols-4 gap-4">
                                        <FieldItem label="BASE AMOUNT" value={`₹${computeBaseTotal(headerLines).toFixed(2)}`} />
                                        <FieldItem label="TOTAL TAX" value={`₹${computeTaxTotal(headerLines).toFixed(2)}`} />
                                        <FieldItem label="GRAND TOTAL" value={`₹${computeLinesTotal(headerLines).toFixed(2)}`} />
                                        <FieldItem label="EST. DELIVERY" value={`${firstTerm?.ExpectedDeliveryInDays || 0} Days`} />
                                    </div>

                                </div>
                            }
                            child={
                                <div className="p-2 space-y-4">
                                    {(vendor.MaterialRequisitionQuotationTermsData?.length
                                        ? vendor.MaterialRequisitionQuotationTermsData
                                        : [{}]
                                    ).map((term: any, idx: number) => {
                                        const lines = resolveLines(term, detailData)

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
                                                    onSave={(updatedLines) => saveData(vendor, term, updatedLines)}
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
                saveText="Add"
                resetText=""
                onSubmit={addSelectedVendors}
                onClose={() => { setQuotationAvailable(false) }}
                onCancel={() => { setQuotationAvailable(false) }}
                title={'Vendors Available'}
                loading={isLoading}
                size='half-screen'
            >
                <div className="space-y-4">

                    <div className="px-2 py-2">
                        <div className="flex items-center gap-3 w-full">
                            <Checkbox
                                checked={selectedVendorIds.length === materialRequisitionVendorFinalizedList.length}
                                disabled={!canAction}
                                onChange={() => canAction && toggleVendorSelectAllVisible()} />

                            <Input
                                type="text"
                                placeholder="Search Vendor"
                                value={searchVendor}
                                onChange={(e) => setSearchVendor(e.target.value)}
                            />

                            <span className="text-sm text-gray-600 ml-auto">
                                {selectedVendorIds.length} selected
                            </span>

                        </div>
                    </div>


                    <div className="max-h-[55vh] overflow-auto divide-y">

                        {materialRequisitionVendorFinalizedList.filter(v =>
                            v.VendorName?.toLowerCase().includes(searchVendor.toLowerCase())
                        ).length === 0 ? (
                            <div className="flex items-center justify-center py-10 text-gray-500">
                                <NoDataView />
                            </div>
                        ) : (
                            materialRequisitionVendorFinalizedList
                                .filter(v =>
                                    v.VendorName?.toLowerCase().includes(searchVendor.toLowerCase())
                                ).map((vendor: any) => {

                                    const checked = selectedVendorIds.includes(vendor.VendorId)

                                    return (
                                        <div
                                            key={vendor.VendorId}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => canAction && toggleVendor(vendor.VendorId)}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                disabled={!canAction}
                                                onChange={() => canAction && toggleVendor(vendor.VendorId)}
                                                onClick={(e) => e.stopPropagation()}
                                            />

                                            <div className="flex justify-between items-start w-full">

                                                <div>
                                                    <div className="font-medium">
                                                        {vendor.VendorName}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {vendor.CompanyName}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">
                                                        {vendor.MobileNumber}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {vendor.EmailId}
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    )
                                })
                        )}

                    </div>
                </div>
            </Modal>

        </div>
    )
}
export default FinalizedVendor;


