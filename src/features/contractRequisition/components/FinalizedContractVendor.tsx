import { useEffect, useState } from "react";
import type React from "react";
import * as E from "fp-ts/Either";
import { CheckLine, MessageSquareQuote, Scale } from "lucide-react";

import { useContractRequisitionListState } from "@/features/contractRequisition/context/ContractRequisitionListStateContext";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import type {
  AddVendorForContractRequisitionEnquiryRequest, FilterWithPaginationVendorForEnquiryRequest, FilterWithPaginationVendorForSelectedEnquiryRequest, SelectedVendorData,
} from "@/features/contractRequisition/models/ContractVendorFinalizeModel";
import { contractVendorFinalizationService } from "@/features/contractRequisition/services/ContractVendorFinalizationService";
import type {
  ModulesApprovalStatusRequest,
  UpdateModulesWorkflowApprovalRequest,
} from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { handleExportFile } from "@/core/utils/exportFile";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import { Button, Input } from "@/ui/components/forms";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { Modal } from "@/ui/components/Modal/Modal";
import Checkbox from "@/ui/components/forms/Checkbox";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import QuotationCard, { type QuotationSavePatch } from "@/features/contractRequisition/components/Quotationcard";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { contractRequisitionQuotationService } from "@/features/contractRequisition/services/ContractRequisitionQuotationService";

interface FinalizedContractVendorProps {
  onApprovalSuccess?: () => Promise<void>;
}

export const FinalizedContractVendor: React.FC<FinalizedContractVendorProps> = ({ onApprovalSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [contractRequisitionVendorSelectedList, setContractRequisitionVendorSelectedList] = useState<SelectedVendorData[]>([]);
  const [contractRequisitionVendorFinalizedList, setContractRequisitionVendorFinalizedList] = useState<any[]>([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [searchVendor, setSearchVendor] = useState("");
  const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
  const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
  const [checkedFinalVendor, setCheckedFinalVendor] = useState<number | null>(null);
  const [isQuotationAvailable, setQuotationAvailable] = useState(false);
  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
  const [isFinalizeConfirmationOpen, setIsFinalizeConfirmationOpen] = useState(false);

  const { listState, updateListState } = useContractRequisitionListState();
  const { ContractRequisitionId, Uniquekey } = listState;
  const { projectId } = useProject();
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions("/contractRequisition");
  const { canAction: cangetCompare } = useMenuPermissions('Contract - Get Compare');
  const { canAction: cangetQuotation } = useMenuPermissions('Contract - Get Quotation');
  const { canAction: canfinalizeVendor } = useMenuPermissions('Contract - Finalized Vendor');

  useEffect(() => {
    if (!projectId) return;
    loadVendorForEnquiry();
    loadSelectedVendorForEnquiry();
  }, [projectId]);

  useEffect(() => {
    const finalized = contractRequisitionVendorSelectedList.find(v => v.IsFinalized)

    if (finalized) {
      setCheckedFinalVendor(finalized.VendorId)
    }
  }, [contractRequisitionVendorSelectedList])

  const loadVendorForEnquiry = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationVendorForEnquiryRequest = {
          ContractRequisitionId: Number(ContractRequisitionId),
          UniqueKey: Uniquekey ?? "",
          ProjectId: Number(projectId),
        };
        const response = await contractVendorFinalizationService.apiCallpullVendorsForEnquiry(params);
        if (E.isRight(response)) {
          setContractRequisitionVendorFinalizedList(response.right.Data);
        }
        return response;
      });
  };

  const loadSelectedVendorForEnquiry = async () => {
    await runApiWithLoader(setIsLoading, setLoadingMessage, async () => {
      const params: FilterWithPaginationVendorForSelectedEnquiryRequest = {
        ContractRequisitionId: Number(ContractRequisitionId),
        UniqueKey: Uniquekey ?? "",
        ProjectId: Number(projectId),
      };
      const response = await contractVendorFinalizationService.apiCallPullSelectedVendorForEnquiry(params);
      if (E.isRight(response)) {
        const selectedVendors = response.right.Data;
        selectedVendors.forEach(vendor => {
          delete vendor["ContractRequisitionQuotationTermsData"];
        });
        setContractRequisitionVendorSelectedList(selectedVendors);
      }
      return response;
    });
  };

  const toggleVendor = (id: number) => {
    setSelectedVendorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleVendorSelectAllVisible = () => {
    const visibleIds = contractRequisitionVendorFinalizedList.map((v) => v.VendorId);
    const allSelected = visibleIds.every((id) => selectedVendorIds.includes(id));
    if (allSelected) {
      setSelectedVendorIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedVendorIds((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const PushVendorForEnquiry = (vendorIds: string): AddVendorForContractRequisitionEnquiryRequest => {
    return {
      ContractRequisitionId: Number(ContractRequisitionId),
      UniqueKey: Uniquekey ?? "",
      ProjectId: Number(projectId),
      VendorId: vendorIds,
    };
  };

  const handleApprovalSubmit = async (remark: string) => {

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: UpdateModulesWorkflowApprovalRequest = {
          ModuleName: "CONTRACT REQUISITION",
          Id: Number(ContractRequisitionId) ?? 0,
          ProjectId: Number(projectId) ?? 0,
          IsApproved: approvalActionType === "approve",
          Remarks: remark ?? null,
        };
        const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);
        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          setIsApprovalActionModalOpen(false);

          await loadSelectedVendorForEnquiry();

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
      approvalActionType === "approve" ? "Approving Document" : "Rejecting Document",
    );
  };

  const addSelectedVendors = async (e: React.FormEvent) => {
    e.preventDefault();

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const vendorIds = selectedVendorIds.join(",");

        const payload = PushVendorForEnquiry(vendorIds);

        const response = await contractVendorFinalizationService.apiCallToAddVendorForEnquiry(payload);

        if (E.isRight(response)) {
          const selected = contractRequisitionVendorFinalizedList.filter((v) => selectedVendorIds.includes(v.VendorId));

          setContractRequisitionVendorSelectedList(selected);

          setContractRequisitionVendorFinalizedList((prev) => prev.filter((v) => !selectedVendorIds.includes(v.VendorId)));

          setQuotationAvailable(false);

          setSelectedVendorIds([]);

          await loadSelectedVendorForEnquiry();

          addToast({ type: "success", title: response.right.SuccessMessage[0] });
        } else {
          addToast({ type: "error", title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Getting Quotation from Vendors",
    );
  };

  const handleCompareVendor = async (exportType: 'Excel') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationVendorForSelectedEnquiryRequest = {
          ContractRequisitionId: Number(ContractRequisitionId),
          UniqueKey: Uniquekey ?? "",
          ProjectId: Number(projectId),
          ExportType: exportType,
        };

        const response = await contractVendorFinalizationService.apiCallPullSelectedVendorForEnquiry(params);

        if (E.isRight(response)) {
          handleExportFile(response, exportType, "Vendor Comparison", addToast);
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message || "Export failed" }),
      undefined,
      "Preparing Export",
    );
  };

  const finalizedVendor = contractRequisitionVendorSelectedList.find((v) => v.IsFinalized);
  const isAnyFinalized = !!finalizedVendor;

  const handleApprovalLog = () => {
    const request: ModulesApprovalStatusRequest = {
      ModuleName: "CONTRACT - FINALIZED VENDOR",
      Id: ContractRequisitionId ?? 0,
      ProjectId: projectId ?? 0,
    };
    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };

  const handleApproveRejectVendor = (approvalType: "approve" | "reject") => {
    setApprovalActionType(approvalType);
    setIsApprovalActionModalOpen(true);
  };

  const handleExportCompareVendorExcel = () => handleCompareVendor('Excel');

  const handleConfirmFinalizeVendor = async () => {

    if (!checkedFinalVendor) return

    const vendorId = String(checkedFinalVendor)

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushVendorForEnquiry(vendorId)

        const response = await contractVendorFinalizationService.apiCallAddFinalizedVendor(payload)

        if (E.isRight(response)) {

          setContractRequisitionVendorSelectedList(prev => prev.map(v => v.VendorId === Number(vendorId) ? { ...v, IsFinalized: true } : v))

          setCheckedFinalVendor(Number(vendorId))

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsFinalizeConfirmationOpen(false);

          loadSelectedVendorForEnquiry();

        } else {
          addToast({ type: "error", title: response.left.message })
        }

        return response
      }
    )
  }

  const buildPayload = (vendorId: number, patch: QuotationSavePatch): FormData => {
    const fd = new FormData();

    fd.append('ProjectId', String(projectId ?? 0));
    fd.append('ContractRequisitionId', String(ContractRequisitionId ?? 0));
    fd.append('Uniquekey', String(Uniquekey));
    fd.append('ContractRequisitionQuotationTermsId', String(patch.ContractRequisitionQuotationTermsId));
    fd.append('VendorId', String(vendorId));
    fd.append('ExpectedCompletionInDays', String(patch.ExpectedCompletionInDays));
    fd.append('ExpectedPaymentInDays', String(patch.ExpectedPaymentInDays));
    fd.append('Total', String(patch.Total));
    fd.append('ContractRequisitionQuotationJSON', JSON.stringify(patch.ContractRequisitionQuotationData));

    return fd;
  };

  const handleSavequotation = async (vendorId: number, patch: QuotationSavePatch) => {

    await runApiWithLoader(setIsLoading, setLoadingMessage, async () => {

      const payload = buildPayload(vendorId, patch);

      const response = await contractRequisitionQuotationService.apiCallToAddContractRequisitionQuotation(payload)

      if (E.isRight(response)) {

        await loadSelectedVendorForEnquiry();

        updateListState({ ContractRequisitionStage: 'Finalized Vendor' });

        addToast({ type: "success", title: response.right.SuccessMessage[0] })
      }
      else {
        addToast({ type: "error", title: response.left.message })
      }
      return response
    })
  }

  const finalizeVendor = () => {

    if (!checkedFinalVendor) {

      addToast({ type: "warning", title: "Select vendor to finalize" })
      return
    }

    setIsFinalizeConfirmationOpen(true)
  }

  return (
    <div className="space-y-4">
      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>

      <div className="flex justify-end gap-2">

        {isAnyFinalized && (
          <ApprovalLogModal
            isOpen={isApprovalLogModalOpen}
            title="Finalized Vendor"
            onClose={() => setIsApprovalLogModalOpen(false)}
            request={approvalLogRequest}
          />
        )}

        {!isAnyFinalized && cangetCompare && (
          <Button
            size="sm"
            style={{
              color: "#135BEC",
              backgroundColor: "#E8F0FF",
              padding: "4px 8px",
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
              color: "#00A800",
              backgroundColor: "#E8FBE8",
              padding: "4px 8px",
            }}
            leftIcon={<CheckLine size={20} />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              finalizeVendor();
            }}
          >
            Finalize Vendor
          </Button>
        )}

        <ApprovalActionModal
          title="Document"
          isOpen={isApprovalActionModalOpen}
          onClose={() => setIsApprovalActionModalOpen(false)}
          actionType={approvalActionType}
          titleText={"Finalized Vendor"}
          subTitleText={""}
          onSubmit={handleApprovalSubmit}
          loading={isLoading}
        />

        {!isAnyFinalized && cangetQuotation && (
          <Button
            size="sm"
            style={{
              color: "#d35400",
              backgroundColor: "#FDE6D3",
              padding: "4px 8px",
            }}
            leftIcon={<MessageSquareQuote size={20} />}
            onClick={() => setQuotationAvailable(true)}
          >
            Get Quotation
          </Button>
        )}
      </div>

      {
        contractRequisitionVendorSelectedList.length === 0 ?
          <section className="md:col-span-4 bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
            <NoDataView />
          </section> :
          contractRequisitionVendorSelectedList.map((vendor) => (
            <QuotationCard
              key={vendor.VendorId}
              vendor={vendor}
              loadTerms={async (v) => {
                const params: FilterWithPaginationVendorForSelectedEnquiryRequest = {
                  ContractRequisitionId: Number(ContractRequisitionId),
                  UniqueKey: Uniquekey ?? "",
                  ProjectId: Number(projectId),
                  VendorId: Number(v.VendorId)
                };
                const response = await contractVendorFinalizationService.apiCallPullSelectedVendorForEnquiry(params);
                if (E.isRight(response) && response.right.Data.length && response.right.Data[0].ContractRequisitionQuotationTermsData?.length) {
                  return response.right.Data[0].ContractRequisitionQuotationTermsData;
                } else {
                  return [];
                }
              }}
              checked={checkedFinalVendor === vendor.VendorId}
              checkDisabled={isAnyFinalized || !canAction}
              onCheckedChange={(checked, vendor) => {
                if (checked) {
                  setCheckedFinalVendor(Number(vendor.VendorId));
                }
              }}
              readOnly={!canAction || isAnyFinalized}
              onSave={async (patch) => {
                handleSavequotation(vendor.VendorId ?? 0, patch);
              }}
              canApprove={canfinalizeVendor}
              onApprove={() => handleApproveRejectVendor("approve")}
              onReject={() => handleApproveRejectVendor("reject")}
              onApprovalHistory={handleApprovalLog}
            />
          ))
      }

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
        message={`Are you sure you want to finalize '${contractRequisitionVendorSelectedList.find(v => v.VendorId === checkedFinalVendor)?.VendorName ?? "this vendor"}'?`}
      />

      <Modal
        isOpen={isQuotationAvailable}
        saveText="Add"
        resetText=""
        onSubmit={addSelectedVendors}
        onClose={() => {
          setQuotationAvailable(false);
        }}
        onCancel={() => {
          setQuotationAvailable(false);
        }}
        title={"Vendors Available"}
        loading={isLoading}
        size="half-screen"
      >
        <div className="space-y-4">
          <div className="px-2 py-2">
            <div className="flex items-center gap-3 w-full">
              <Checkbox
                checked={contractRequisitionVendorFinalizedList.length > 0 && selectedVendorIds.length === contractRequisitionVendorFinalizedList.length}
                disabled={!cangetQuotation || contractRequisitionVendorFinalizedList.length === 0}
                onChange={() => {
                  if (cangetQuotation && contractRequisitionVendorFinalizedList.length > 0) {
                    toggleVendorSelectAllVisible();
                  }
                }}
              />

              <Input type="text" placeholder="Search Vendor" value={searchVendor} onChange={(e) => setSearchVendor(e.target.value)} />

              <span className="text-sm text-gray-600 ml-auto">{selectedVendorIds.length} selected</span>
            </div>
          </div>

          <div className="max-h-[55vh] overflow-auto divide-y">
            {contractRequisitionVendorFinalizedList.filter((v) => v.VendorName?.toLowerCase().includes(searchVendor.toLowerCase()))
              .length === 0 ? (
              <div className="flex items-center justify-center py-10 text-gray-500">
                <NoDataView />
              </div>
            ) : (
              contractRequisitionVendorFinalizedList
                .filter((v) => v.VendorName?.toLowerCase().includes(searchVendor.toLowerCase()))
                .map((vendor: any) => {
                  const checked = selectedVendorIds.includes(vendor.VendorId);

                  return (
                    <div
                      key={vendor.VendorId}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => cangetQuotation && toggleVendor(vendor.VendorId)}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={!cangetQuotation}
                        onChange={() => cangetQuotation && toggleVendor(vendor.VendorId)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex justify-between items-start w-full">
                        <div>
                          <div className="font-medium">{vendor.VendorName}</div>

                          <div className="text-sm text-gray-500">{vendor.CompanyName}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500">{vendor.MobileNumber}</div>

                          <div className="text-sm text-gray-500">{vendor.EmailId}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </Modal>
    </div >
  );
};
