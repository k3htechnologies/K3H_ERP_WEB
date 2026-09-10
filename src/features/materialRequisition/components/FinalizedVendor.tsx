import { ExpandableCard } from "@/ui/components/Card/ExpandableCard"
import { useEffect, useState } from "react"
import useToast from "@/core/hooks/useToast"
import type { FilterWithPaginationVendorForEnquiryRequest, FilterWithPaginationVendorForSelectedEnquiryRequest } from "@/features/materialRequisition/models/VendorFinalizeModel"
import { useParams } from "react-router-dom"
import { useMaterialRequisitionListState } from "@/features/materialRequisition/context/MaterialRequisitionListStateContext"
import { useProject } from "@/features/projectMaster/context/ProjectContext"
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions"
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
import { CheckLine, MessageSquareQuote, Scale } from "lucide-react"
import { handleExportFile } from "@/core/utils/exportFile"
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton"
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel"
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal"
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal"
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService"
import { Loader } from "@/core/utils/loader";
import { formatCurrency } from "@/core/utils/comman";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog"

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
    const [liveQuotationLines, setLiveQuotationLines] = useState<Record<string, any[]>>({});

    const [expectedDeliveryDays, setExpectedDeliveryDays] = useState<Record<number, string>>({});
    const [expectedPaymentDays, setExpectedPaymentDays] = useState<Record<number, string>>({});
    const [editingQuotationKey, setEditingQuotationKey] = useState<string | null>(null);
    const { canAction: cangetCompare } = useMenuPermissions('Get Compare');
    const { canAction: cangetQuotation } = useMenuPermissions('Get Quotation');
    const { canAction: canfinalizeVendor } = useMenuPermissions('Finalized Vendor');

    const [isFinalizeConfirmationOpen, setIsFinalizeConfirmationOpen] = useState(false);

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

                    const selected = materialRequisitionVendorFinalizedList.filter(v => selectedVendorIds.includes(v.VendorId))

                    setMaterialRequisitionVendorSelectedList(selected)

                    setMaterialRequisitionVendorFinalizedList(prev => prev.filter(v => !selectedVendorIds.includes(v.VendorId)));

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
        Uniquekey: term.Uniquekey || currentUniquekey || "",
        MaterialRequisitionQuotationTermsId: term.MaterialRequisitionQuotationTermsId,
        ProjectId: Number(projectId),
        VendorId: vendor.VendorId,
        ExpectedDeliveryInDays: Number(expectedDeliveryDays[term.MaterialRequisitionQuotationTermsId] ?? term.ExpectedDeliveryInDays ?? 0),
        ExpectedPaymentInDays: Number(expectedPaymentDays[term.MaterialRequisitionQuotationTermsId] ?? term.ExpectedPaymentInDays ?? 0),
        Total: computeLinesTotal(lines),
        MaterialRequisitionQuotationJSON: JSON.stringify(lines),
    })

    const saveData = async (vendor: any, term: any, lines: any[]) => {

        if (computeLinesTotal(lines) === 0) {
            addToast({ type: "error", title: "Please add price at least one quotation item." });
            return;
        }

        await runApiWithLoader(setIsLoading, setLoadingMessage, async () => {

            const payload = buildPayload(vendor, term, lines)

            const response = await materialRequisitionQuotationService.apiCallToAddMaterialRequisitionQuotation(payload)

            if (E.isRight(response)) {

                await loadSelectedVendor();

                addToast({ type: "success", title: response.right.SuccessMessage[0] })
            }
            else {
                addToast({ type: "error", title: response.left.message })
            }
            return response
        })
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


    const handleCompareVendor = async (exportType: 'Excel' | 'PDF' | 'VENDOR COMPARISON CHART') => {

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

                    handleExportFile(response, 'Excel', 'Vendor Comparison', addToast);
                }
                return response
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };
    const handleExportCompareVendorExcel = () => handleCompareVendor('VENDOR COMPARISON CHART')

    const finalizeVendor = () => {

        if (!checkedFinalVendor) {

            addToast({ type: "warning", title: "Select vendor to finalize" })
            return
        }

        setIsFinalizeConfirmationOpen(true)
    }

    const handleConfirmFinalizeVendor = async () => {

        if (!checkedFinalVendor) return

        const vendorId = String(checkedFinalVendor)

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushVendorForEnquiry(vendorId)

                const response = await vendorFinalizationService.apiCallAddFinalizedVendor(payload)

                if (E.isRight(response)) {

                    setMaterialRequisitionVendorSelectedList(prev => prev.map(v => v.VendorId === Number(vendorId) ? { ...v, IsFinalized: true } : v))

                    setCheckedFinalVendor(Number(vendorId))

                    addToast({ type: "success", title: response.right.SuccessMessage[0] })

                    setIsFinalizeConfirmationOpen(false);

                    loadSelectedVendor();

                } else {
                    addToast({ type: "error", title: response.left.message })
                }

                return response
            }
        )
    }


    const finalizedVendor = materialRequisitionVendorSelectedList.find(v => v.IsFinalized)
    const isAnyFinalized = !!finalizedVendor
    const isApprovalAvailable = finalizedVendor?.IsApproval === true


    return (
        <div className="space-y-4">
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>

            <div className="flex justify-end gap-2">

                {isAnyFinalized &&
                    <ApprovalLogModal
                        isOpen={isApprovalLogModalOpen}
                        titleText={finalizedVendor?.VendorName}
                        title='Finalized Vendor'
                        onClose={() => setIsApprovalLogModalOpen(false)}
                        request={approvalLogRequest}
                    />
                }

                {!isAnyFinalized && cangetCompare && materialRequisitionVendorSelectedList.length > 1 && (
                    <Button
                        size="md"
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

                {!isAnyFinalized && canfinalizeVendor && checkedFinalVendor && (
                    <Button
                        size="md"
                        style={{
                            color: '#00A800',
                            backgroundColor: '#E8FBE8',
                            padding: '4px 8px',
                        }}

                        leftIcon={<CheckLine size={20} />}
                        onClick={finalizeVendor}
                    >
                        Finalize Vendor
                    </Button>
                )}

                <ApprovalActionModal
                    title='Finalize Vendor'
                    isOpen={isApprovalActionModalOpen}
                    onClose={() => setIsApprovalActionModalOpen(false)}
                    actionType={approvalActionType}
                    titleText={finalizedVendor?.VendorName}
                    onSubmit={handleApprovalSubmit}
                    loading={isLoading}
                />

                {!isAnyFinalized && cangetQuotation && (
                    <Button
                        size="md"
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
                ? <section className="md:col-span-4 bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                    <NoDataView />
                </section>

                : materialRequisitionVendorSelectedList.map((vendor: any) => {

                    const firstTerm = vendor.MaterialRequisitionQuotationTermsData?.[0];

                    const originalHeaderLines = resolveLines(firstTerm, detailData);

                    const quotationKey = `${vendor.VendorId}-${firstTerm?.MaterialRequisitionQuotationTermsId}`;

                    const headerLines = liveQuotationLines[quotationKey] ?? originalHeaderLines;

                    return (
                        <ExpandableCard
                            key={vendor.VendorId}
                            showline
                            height={120}
                            expandedheight={900}
                            bgColor="bg-white"
                            isShadow={false}
                            title={
                                <div className="flex flex-col">

                                    <div className="relative w-full pr-12">

                                        <div className="flex gap-3">

                                            <Checkbox
                                                checked={vendor.IsFinalized || checkedFinalVendor === vendor.VendorId}
                                                disabled={!canAction || (isAnyFinalized && !vendor.IsFinalized)}
                                                onChange={() =>
                                                    canAction &&
                                                    setCheckedFinalVendor(
                                                        checkedFinalVendor === vendor.VendorId
                                                            ? null
                                                            : vendor.VendorId
                                                    )
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                size="md"
                                            />

                                            <div className="flex flex-col">

                                                <div className="font-medium text-gray-900 leading-none">
                                                    {vendor.VendorName}
                                                </div>

                                                <div className="text-sm text-gray-500 mt-2">
                                                    {vendor.CompanyName || "-"}
                                                </div>

                                            </div>

                                        </div>


                                        {isAnyFinalized && canfinalizeVendor && checkedFinalVendor === vendor.VendorId && (
                                                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center">
                                                    <ApprovalActions
                                                        approvalStatus={finalizedVendor?.VendorFinalizationApproval}
                                                        onApprove={() => handleApproveRejectVendor("approve")}
                                                        onReject={() => handleApproveRejectVendor("reject")}
                                                        showApproval={isApprovalAvailable}
                                                        isIcons={false}
                                                        onHistory={handleApprovalLog}
                                                    />
                                                </div>
                                            )}

                                    </div>


                                    <div className="ml-[33px] mt-4 grid grid-cols-[180px_180px_180px_200px] gap-x-20">

                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">
                                                Base Amount (₹)
                                            </span>

                                            <span className="text-sm font-semibold text-gray-900 mt-1">
                                                {formatCurrency(computeBaseTotal(headerLines))}
                                            </span>
                                        </div>


                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">
                                                Total Tax (₹)
                                            </span>

                                            <span className="text-sm font-semibold text-gray-900 mt-1">
                                                {formatCurrency(computeTaxTotal(headerLines))}
                                            </span>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">
                                                Grand Total (₹)
                                            </span>

                                            <span className="text-sm font-semibold text-gray-900 mt-1">
                                                {formatCurrency(computeLinesTotal(headerLines))}
                                            </span>
                                        </div>


                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">
                                                Expected Delivery (Days)
                                            </span>

                                            <span className="text-sm font-semibold text-gray-900 mt-1">
                                                {firstTerm?.ExpectedDeliveryInDays || 0} Days
                                            </span>
                                        </div>

                                    </div>

                                </div>
                            }
                            child={
                                <div className="p-2 space-y-4">
                                    {(vendor.MaterialRequisitionQuotationTermsData?.length ? vendor.MaterialRequisitionQuotationTermsData : [{}]
                                    ).map((term: any, idx: number) => {

                                        const lines = resolveLines(term, detailData)

                                        if (!lines?.length) {
                                            return <NoDataView key={idx} />
                                        }

                                        return (
                                            <div key={idx}>

                                                <FinalizedVendorQuotationTable
                                                    data={lines}
                                                    isEditable={editingQuotationKey === quotationKey}
                                                    onEditModeChange={(editing) => {
                                                        setEditingQuotationKey(
                                                            editing ? quotationKey : null
                                                        )
                                                    }}

                                                    onChange={(updatedLines) => {
                                                        setLiveQuotationLines(prev => ({
                                                            ...prev,
                                                            [quotationKey]: updatedLines
                                                        }));
                                                    }}
                                                    onSave={(updatedLines) =>
                                                        saveData(vendor, term, updatedLines)
                                                    }
                                                    VendorFinalizationApprovalStatus={listState.VendorFinalizationApprovalStatus}
                                                />
                                                <div className="flex justify-between text-sm bg-green-100 p-3">

                                                    <span>Expected Delivery (Days)</span>
                                                    <span>
                                                        {editingQuotationKey === quotationKey ? (
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
                                                        {editingQuotationKey === quotationKey ? (
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
                saveText={selectedVendorIds.length > 0 ? "Add" : ""}
                onSubmit={addSelectedVendors}
                onClose={() => { setQuotationAvailable(false) }}
                onCancel={() => { setQuotationAvailable(false) }}
                title='Vendors Available for Enquiry'
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
                                placeholder="Search Vendor Name"
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
                                .filter(v => v.VendorName?.toLowerCase().includes(searchVendor.toLowerCase())).map((vendor: any) => {

                                    const checked = selectedVendorIds.includes(vendor.VendorId)

                                    return (
                                        <div key={vendor.VendorId}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                                            onClick={() => canAction && toggleVendor(vendor.VendorId)}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                disabled={!canAction}
                                                onChange={() => canAction && toggleVendor(vendor.VendorId)}
                                                onClick={(e) => e.stopPropagation()}
                                            />

                                            <div className="flex justify-between items-start w-full gap-8">

                                                <div className="space-y-1">
                                                    <div className="font-medium">
                                                        <FieldItem label="Vendor Name" value={vendor?.VendorName ?? '-'} isRow isUsedForInventoryFlat />
                                                    </div>

                                                    <div className="text-sm text-gray-500">

                                                        <FieldItem label="Company Name" value={vendor?.CompanyName ?? '-'} isRow isUsedForInventoryFlat />
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <FieldItem label="Mobile Number" value={vendor?.MobileNumber ? `${vendor?.MobileNumberCountryCode || "+91"} ${vendor.MobileNumber}` : "-"} isRow isUsedForInventoryFlat />

                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <FieldItem label="E-Mail ID" value={vendor?.EmailId ?? '-'} isRow isUsedForInventoryFlat />
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <FieldItem label="GST Number" value={vendor?.GSTNumber ?? '-'} isRow isUsedForInventoryFlat />
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <FieldItem label="Address" value={vendor?.Address ?? '-'} isRow isUsedForInventoryFlat />
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

            <DeleteDialog
                isOpen={isFinalizeConfirmationOpen}
                onClose={() => {
                    setIsFinalizeConfirmationOpen(false)
                }}
                onConfirm={handleConfirmFinalizeVendor}
                loading={isLoading}
                variant="generate"
                confirmText="Final"
                title="Finalize Vendor"
                message={`Are you sure you want to finalize ${materialRequisitionVendorSelectedList.find(v => v.VendorId === checkedFinalVendor)?.VendorName ?? "this vendor"
                    }?`}
            />

        </div>
    )
}
export default FinalizedVendor;


