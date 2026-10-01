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
import { Button } from "@/ui/components/forms/Button"
import { Modal } from "@/ui/components/Modal/Modal"
import { Input } from "@/ui/components/forms/Input"
import { ArrowLeft, CheckLine, ClipboardList, MessageSquareQuote, Scale, Search } from "lucide-react"
import { handleExportFile } from "@/core/utils/exportFile"
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton"
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel"
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal"
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal"
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService"
import { Loader } from "@/core/utils/loader";
import { formatCurrency } from "@/core/utils/comman";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog"
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker"
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer"
import { parseDocumentUrls } from "@/core/utils/documentUtils"
import type { FilterWithMaterialRequisitionSummaryOfQuotationRequest, MaterialRequisitionSummaryOfQuotationData } from "@/features/materialRequisition/models/MaterialRequisitionQuotationModel"
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback"

const DEFAULT_LOGISTICS = [
    { Logistics: "Transportation" },
    { Logistics: "Loading" },
    { Logistics: "Unloading" },
    { Logistics: "Mathadi" },
    { Logistics: "Insurance" },
]

const resolveLines = (term: any, detailData: any[]): any[] => {
    const source: any[] = term?.MaterialRequisitionQuotationData?.length ? term.MaterialRequisitionQuotationData : detailData ?? []
    const hasLogistics = source.some((r: any) => r?.Logistics)
    return hasLogistics ? source : [...source, ...DEFAULT_LOGISTICS]
}

interface FinalizedVendorProps {
    onApprovalSuccess?: () => Promise<void>;
}

export const FinalizedVendor: React.FC<FinalizedVendorProps> = ({ onApprovalSuccess }) => {

    const { MaterialRequisitionId: listMaterialRequisitionId } = useParams<{ MaterialRequisitionId?: string }>()
    const { listState, updateListState } = useMaterialRequisitionListState()
    const currentMaterialRequisitionId = listMaterialRequisitionId ? Number(listMaterialRequisitionId) : listState.MaterialRequisitionId
    const currentUniquekey = listState.Uniquekey
    const { projectId } = useProject()
    const { addToast } = useToast()
    const { detailData } = useMaterialRequisitionListState()
    const [checkedFinalVendor, setCheckedFinalVendor] = useState<number | null>(null)
    const [isQuotationAvailable, setQuotationAvailable] = useState(false)

    const [isSummaryOfQuotationOpen, setIsSummaryOfQuotationOpen] = useState(false)
    const [summaryOfQuotationData, setSummaryOfQuotationData] = useState<MaterialRequisitionSummaryOfQuotationData[]>([])

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

    const [quotationFiles, setQuotationFiles] = useState<(File | string)[]>([]);
    const [removedQuotationUrls, setRemovedQuotationUrls] = useState<string[]>([]);

    const [isExpandableOpen, setExpandableOpen] = useState(false);
    const [editingVendorIds, setEditingVendorIds] = useState<number[]>([]);

    useEffect(() => {
        if (!projectId) return

        loadSelectedVendor();
        pullVendorsForEnquiry();

    }, [projectId])

    useEffect(() => {
        const finalized = materialRequisitionVendorSelectedList.find(v => v.IsFinalized)

        if (finalized) {
            setCheckedFinalVendor(finalized.VendorId)
        }
    }, [materialRequisitionVendorSelectedList])

    const pullVendorsForEnquiry = async () => {
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
            "Loading Vendor"
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

                    updateListState({ MaterialRequisitionStage: 'Get Compare' });

                    await loadSelectedVendor()

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

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
            'Getting Quotation from Vendors'
        )
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
        fd.append('MaterialRequisitionQuotationJSON', JSON.stringify(lines));

        quotationFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('QuotationURL', file);
            }
        });

        fd.append('RemoveQuotationURL', removedQuotationUrls.join(','));

        return fd;
    };

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

                updateListState({ MaterialRequisitionStage: 'Finalized Vendor' });

                addToast({ type: "success", title: response.right.SuccessMessage[0] });
            }
            else {
                addToast({ type: "error", title: response.left.message });
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

                    await onApprovalSuccess?.();
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

    const finalizedVendor = materialRequisitionVendorSelectedList.find(v => v.IsFinalized);
    const isAnyFinalized = !!finalizedVendor
    const isApprovalAvailable = finalizedVendor?.IsApproval === true

    // VENDOR SEARCH SUMMARY================================================================================================
    const [searchVendorName, setSearchVendorName] = useState('');
    const debouncedVendorSearch = useDebouncedCallback((value: string) => {
        pullSummaryOfQuotation(value);
    }, 350);

    const handleVendorSearch = (value: string) => {
        setSearchVendorName(value);
        debouncedVendorSearch(value);
    };

    const pullSummaryOfQuotation = async (vendorName: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithMaterialRequisitionSummaryOfQuotationRequest = {
                    MaterialRequisitionId: Number(currentMaterialRequisitionId),
                    ProjectId: Number(projectId),
                    VendorName: vendorName
                }

                const response = await materialRequisitionQuotationService.apiCallPullMaterialRequisitionSummaryOfQuotation(params)

                if (E.isRight(response)) {

                    setSummaryOfQuotationData(response.right.Data ?? [])

                } else {

                    setSummaryOfQuotationData([])

                    addToast({ type: "error", title: response.left?.message })
                }

                return response
            },
            undefined,
            (error: any) => {

                addToast({ type: "error", title: error?.message })
            },
            undefined,
            "Loading Summary Of Quotation"
        )
    }

    const handleSummaryOfQuotation = async () => {

        setIsSummaryOfQuotationOpen(true);

        setSearchVendorName("");

        await pullSummaryOfQuotation("");
    }

    return (
        <div className="space-y-4">
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "} </Loader>

            {isAnyFinalized && (
                <ApprovalLogModal
                    isOpen={isApprovalLogModalOpen}
                    titleText={finalizedVendor?.VendorName}
                    title="Finalized Vendor"
                    onClose={() => setIsApprovalLogModalOpen(false)}
                    request={approvalLogRequest}
                />
            )}

            <div className="flex justify-end items-center gap-2 h-[30px]">
                <button
                    type="button"
                    onClick={() => setExpandableOpen(prev => !prev)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-[#135BEC30] text-blue-600 transition-all duration-[1000ms] ease-in-out hover:bg-[#135BEC50]"
                    aria-label={isExpandableOpen ? "Hide actions" : "Show actions"}>
                    <span className={`inline-flex transition-transform duration-[1000ms] ease-in-out ${isExpandableOpen ? "rotate-180" : "rotate-0"}`}>
                        <ArrowLeft className="h-5 w-5" />
                    </span>
                </button>

                <div
                    className={`flex gap-2 overflow-hidden transition-all duration-[1000ms] ease-in-out ${isExpandableOpen
                        ? "max-w-[1000px] opacity-100 translate-x-0"
                        : "max-w-0 opacity-0 translate-x-4 pointer-events-none"
                        }`}>

                    {!isAnyFinalized && cangetCompare && materialRequisitionVendorSelectedList.length > 1 && (
                        <Button
                            type="button"
                            size="sm"
                            style={{
                                color: '#135BEC',
                                backgroundColor: '#E8F0FF',
                                padding: '4px 8px',
                            }}
                            leftIcon={<Scale size={15} />}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleExportCompareVendorExcel();
                            }}
                        >
                            Compare
                        </Button>
                    )}

                    {!isAnyFinalized && canfinalizeVendor && checkedFinalVendor && (
                        <Button
                            type="button"
                            size="sm"
                            style={{
                                color: '#00A800',
                                backgroundColor: '#E8FBE8',
                                padding: '4px 8px',
                            }}
                            leftIcon={<CheckLine size={15} />}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                finalizeVendor();
                            }}
                        >
                            Finalize Vendor
                        </Button>
                    )}

                    {!isAnyFinalized && cangetQuotation && (
                        <Button
                            size="sm"
                            style={{
                                color: '#d35400',
                                backgroundColor: '#FDE6D3',
                                padding: '4px 8px',
                            }}
                            leftIcon={<MessageSquareQuote size={15} />}
                            onClick={() => setQuotationAvailable(true)}
                        >
                            Get Quotation
                        </Button>
                    )}

                    <Button
                        size="sm"
                        color="teal"
                        leftIcon={<ClipboardList size={15} />}
                        onClick={handleSummaryOfQuotation}
                    >
                        Summary Of Quotation
                    </Button>
                </div>

                <ApprovalActionModal
                    title="Finalize Vendor"
                    isOpen={isApprovalActionModalOpen}
                    onClose={() => setIsApprovalActionModalOpen(false)}
                    actionType={approvalActionType}
                    titleText={finalizedVendor?.VendorName}
                    onSubmit={handleApprovalSubmit}
                    loading={isLoading}
                />
            </div>


            {materialRequisitionVendorSelectedList.length === 0
                ? <section className="md:col-span-4 bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                    <NoDataView message='No Finalize Vendor data found' />
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
                            height={150}
                            expandedheight={900}
                            bgColor="bg-white"
                            isShadow={false}
                            titleClassName="flex-1 min-w-0"
                            title={
                                <div className="flex flex-col w-full" onClick={(e) => e.stopPropagation()}>

                                    <div className="flex items-center justify-between w-full pb-4 px-1 border-b border-gray-200">

                                        <div className="flex items-center gap-3">

                                            <Checkbox
                                                checked={vendor.IsFinalized || checkedFinalVendor === vendor.VendorId}
                                                disabled={!canfinalizeVendor || (isAnyFinalized && !vendor.IsFinalized)}
                                                onChange={() => {
                                                    if (isAnyFinalized) return;

                                                    if (canfinalizeVendor) {
                                                        const isCurrentlyChecked = checkedFinalVendor === vendor.VendorId;

                                                        setCheckedFinalVendor(
                                                            isCurrentlyChecked ? null : vendor.VendorId
                                                        );

                                                        if (!isCurrentlyChecked) {
                                                            setExpandableOpen(true);
                                                        }
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                size="md"
                                            />

                                            <div className="font-medium text-gray-900 text-base">
                                                {vendor.VendorName || "-"}
                                            </div>

                                            <div className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                                                {vendor.CompanyName || "-"}
                                            </div>

                                            <div className="px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                                                {vendor.GSTNumber || "-"}
                                            </div>

                                        </div>

                                        {isAnyFinalized && canfinalizeVendor && checkedFinalVendor === vendor.VendorId && (
                                            <div className="flex items-center">
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

                                    <div className="grid grid-cols-4 mt-4 px-1">

                                        <div className="px-5 first:pl-0 border-r border-gray-200">
                                            <div className="text-sm uppercase tracking-wide text-gray-400">
                                                Base Amount
                                            </div>

                                            <div className="text-lg font-semibold text-gray-900 mt-3">
                                                {formatCurrency(computeBaseTotal(headerLines))}
                                            </div>
                                        </div>

                                        <div className="px-5 border-r border-gray-200">
                                            <div className="text-sm uppercase tracking-wide text-gray-400">
                                                Total Tax
                                            </div>

                                            <div className="text-lg font-semibold text-orange-600 mt-3">
                                                {formatCurrency(
                                                    computeTaxTotal(headerLines)
                                                )}
                                            </div>
                                        </div>

                                        <div className="px-5 border-r border-gray-200">
                                            <div className="text-sm uppercase tracking-wide text-gray-400">
                                                Grand Total
                                            </div>

                                            <div className="text-lg font-semibold text-blue-700 mt-3">
                                                {formatCurrency(
                                                    computeLinesTotal(headerLines)
                                                )}
                                            </div>
                                        </div>

                                        <div className="px-5 pr-0">
                                            <div className="text-sm uppercase tracking-wide text-gray-400">
                                                Est. Delivery
                                            </div>

                                            <div className="text-lg font-semibold text-emerald-600 mt-3">
                                                {firstTerm?.ExpectedDeliveryInDays || 0} Days
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            }
                            child={
                                <div className="p-2 space-y-4">
                                    {(vendor.MaterialRequisitionQuotationTermsData?.length ? vendor.MaterialRequisitionQuotationTermsData : [{}]).map((term: any, idx: number) => {

                                        const quotationKey = `${vendor.VendorId}-${term.MaterialRequisitionQuotationTermsId}`;
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
                                                        saveData(vendor, term, updatedLines)
                                                    }
                                                    VendorFinalizationApprovalStatus={listState.VendorFinalizationApprovalStatus}
                                                    VendorGSTNumber={vendor.GSTNumber}
                                                    CompanyGSTNumber={listState.CompanyGSTNumber}
                                                    addToast={addToast}
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
                <div className="flex flex-col h-[calc(100vh-180px)]">

                    <div className="px-2 py-2 shrink-0">
                        <div className="flex items-center gap-3 w-full">

                            <Checkbox
                                checked={
                                    materialRequisitionVendorFinalizedList.length > 0 &&
                                    selectedVendorIds.length === materialRequisitionVendorFinalizedList.length
                                }
                                disabled={!cangetQuotation || materialRequisitionVendorFinalizedList.length === 0}
                                onChange={() => {
                                    if (cangetQuotation && materialRequisitionVendorFinalizedList.length > 0) {
                                        toggleVendorSelectAllVisible();
                                    }
                                }}
                            />


                            <Input
                                type="text"
                                placeholder="Search By Vendor Name"
                                value={searchVendor}
                                onChange={(e) => setSearchVendor(e.target.value)}
                            />

                            <span className="text-sm text-gray-600 ml-auto">
                                {selectedVendorIds.length} selected
                            </span>

                        </div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto divide-y thin-scroll">

                        {materialRequisitionVendorFinalizedList.filter(v => v.VendorName?.toLowerCase().includes(searchVendor.toLowerCase())).length === 0 ? (
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
                                            onClick={() => cangetQuotation && toggleVendor(vendor.VendorId)}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                disabled={!cangetQuotation}
                                                onChange={() => cangetQuotation && toggleVendor(vendor.VendorId)}
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
                message={`Are you sure you want to finalize '${materialRequisitionVendorSelectedList.find(v => v.VendorId === checkedFinalVendor)?.VendorName ?? "this vendor"}'?`}
            />

            <Modal
                isOpen={isSummaryOfQuotationOpen}
                saveText=""
                onSubmit={() => { }}
                onClose={() => setIsSummaryOfQuotationOpen(false)}
                onCancel={() => setIsSummaryOfQuotationOpen(false)}
                title="Summary Of Quotation"
                loading={isLoading}
                size="half-screen"
            >
                <div className="flex flex-col">

                    <div className="relative min-w-0 w-[526px]">
                        <Input
                            type="text"
                            value={searchVendorName}
                            onChange={(e) => handleVendorSearch(e.target.value)}
                            placeholder="Search By Vendor Name"
                            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                        />
                    </div>

                    <div className="flex-1 pt-5">

                        {summaryOfQuotationData.length === 0 ? (

                            <section className="md:col-span-4 bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Vendor available" />
                            </section>

                        ) : (

                            <div className="space-y-3">

                                {summaryOfQuotationData.map((quotation, index) => (

                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">

                                        <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-200">

                                            <div className="min-w-0">

                                                <div className="font-semibold text-gray-900">
                                                    {quotation.VendorName || "-"}
                                                </div>

                                                <div className="text-sm text-gray-500 mt-1">
                                                    {quotation.CompanyName || "-"}
                                                </div>

                                            </div>



                                            <div className="px-3 py-1 rounded-md text-sm font-semibold bg-green-100 text-green-700">
                                                {quotation.QuotationLevel || "-"}
                                            </div>

                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-4">

                                            <div>
                                                <div className="text-xs uppercase tracking-wide text-gray-400">
                                                    Quotation Amount
                                                </div>

                                                <div className="text-lg font-semibold text-blue-700 mt-1">
                                                    {formatCurrency(quotation.Total ?? 0)}
                                                </div>
                                            </div>


                                            <div>
                                                <div className="text-xs uppercase tracking-wide text-gray-400">
                                                    Expected Delivery
                                                </div>

                                                <div className="text-sm font-semibold text-gray-800 mt-2">
                                                    {quotation.ExpectedDeliveryInDays ?? 0} Days
                                                </div>
                                            </div>


                                            <div>
                                                <div className="text-xs uppercase tracking-wide text-gray-400">
                                                    Expected Payment
                                                </div>

                                                <div className="text-sm font-semibold text-gray-800 mt-2">
                                                    {quotation.ExpectedPaymentInDays ?? 0} Days
                                                </div>
                                            </div>

                                        </div>


                                        {/* Quotation Type */}
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">

                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">  Quotation Type: </span>{" "}  {quotation.QuotationType || "-"}
                                            </div>


                                            {quotation.QuotationURL !== "" && (

                                                <MultiImageViewer
                                                    images={parseDocumentUrls(quotation.QuotationURL)}
                                                    title="Quotation"
                                                    isIcon={false}
                                                    triggerLabel="View Quotation"
                                                />

                                            )}

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </div>
            </Modal>

        </div >
    )
}
export default FinalizedVendor;


