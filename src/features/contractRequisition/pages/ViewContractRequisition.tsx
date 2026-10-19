import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import * as E from "fp-ts/Either";

import { Loader } from "@/core/utils/loader";
import { Button } from "@/ui/components/forms";
import useToast from "@/core/hooks/useToast";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useContractRequisitionListState } from "@/features/contractRequisition/context/ContractRequisitionListStateContext";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import type {
  CloseContractRequisitionRequest,
  ContractRequisitionData, FilterWithPaginationContractRequisition,
} from "@/features/contractRequisition/models/ContractRequisitionModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import Tabs from "@/ui/components/Tab/Tab";
import { ContractWorkOrder } from "@/features/contractRequisition/components/ContractWorkOrder";
import { ContractInvoice } from "@/features/contractRequisition/components/ContractInvoice";
import { FinalizedContractVendor } from "@/features/contractRequisition/components/FinalizedContractVendor";
import { ContractOverview } from "@/features/contractRequisition/components/ContractOverview";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { runApiWithLoader } from "@/core/utils";
import { contractRequisitionService } from "@/features/contractRequisition/services/ContractRequisitionService";
import ContractBOQSelectionScreen from "@/features/contractRequisition/components/ContractBoqSelectionScreen";
import type { RevokeFinalizationContractVendorRequest } from "@/features/contractRequisition/models/ContractVendorFinalizeModel";
import { contractVendorFinalizationService } from "@/features/contractRequisition/services/ContractVendorFinalizationService";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";

export const ViewContractRequisition: React.FC = () => {
  const [contractRequisitionData, setContractRequisitionData] = useState<ContractRequisitionData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isCloseRequisitionDialogOpen, setIsCloseRequisitionDialogOpen] = useState(false);
  const [selectedContractRequisitionItem, setSelectedContractRequisitionItem] = useState<CloseContractRequisitionRequest | null>(null);
  const [closeCompletedRemarkError, setCloseCompletedRemarkError] = useState("");

  const [isRevokeFinalizationVendorDialogOpen, setIsRevokeFinalizationVendorDialogOpen] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useProject();
  const { listState, updateListState } = useContractRequisitionListState();
  const { ContractRequisitionId, SystemGeneratedCode, ContractRequisitionStatus, VendorName } = listState;
  const location = useLocation();
  const { canView: canFinalizedVendor } = useMenuPermissions('Contract - Finalized Vendor');
  const { canView: canGenerateWorkOrder } = useMenuPermissions('Contract - Generate Work Order');
  const { canView: canAddInvoice } = useMenuPermissions('Contract - Add Invoice');

  const ContractRequisitionTabList: { id: string; label: string }[] = [
    { id: "Overview", label: "Overview" },
    contractRequisitionData?.ContractType !== "indirect" ? { id: "boq", label: "BOQ" } : null,
    canFinalizedVendor ? { id: "Finalized Vendor", label: "Finalized Vendor" } : null,
    canGenerateWorkOrder ? { id: "Work Order", label: "Work Order" } : null,
    canAddInvoice ? { id: "Invoice", label: "Invoice" } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  const [activeTab, setActiveTab] = useState<string>(location.state?.activeTab || ContractRequisitionTabList?.[0]?.id || "");

  useEffect(() => {
    if (!projectId || !ContractRequisitionId || ContractRequisitionId === 0) return;
    loadContractRequisition()
  }, [projectId, ContractRequisitionId, addToast]);

  const loadContractRequisition = async () => {
    runApiWithLoader(setIsLoading, setLoadingMessage, async () => {
      const params: FilterWithPaginationContractRequisition = {
        PageNumber: 1,
        PageSize: 1,
        ProjectId: Number(projectId),
        ContractRequisitionId: ContractRequisitionId,
      };

      const response = await contractRequisitionService.apiCallPullContractRequisition(params);

      if (E.isRight(response)) {
        const data = response.right.Data;
        const item = Array.isArray(data) ? data[0] : data;
        setContractRequisitionData(item ?? null);
        updateListState({
          ContractRequisitionId: item.ContractRequisitionId,
          Uniquekey: item.UniqueKey,
          SystemGeneratedCode: item.SystemGeneratedCode,
          ContractRequisitionStatus: item.ContractStatus,
          VendorFinalizationApprovalStatus: item.VendorFinalizationApprovalStatus
        })
      } else {
        addToast({ type: "error", title: response.left.message });
      }
      return response;
    });
  };

  const handleCloseRequisition = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedContractRequisitionItem) return;

    const remark = selectedContractRequisitionItem.CloseCompletionRemark?.trim();

    if (!remark) {
      setCloseCompletedRemarkError("Remark is required.");
      return;
    }

    setCloseCompletedRemarkError("");

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload: CloseContractRequisitionRequest = {
          ContractRequisitionId: selectedContractRequisitionItem.ContractRequisitionId,
          UniqueKey: selectedContractRequisitionItem.UniqueKey,
          ProjectId: Number(projectId),
          Type: selectedContractRequisitionItem.Type,
          CloseCompletionRemark: selectedContractRequisitionItem.CloseCompletionRemark || "",
        };

        const response = await contractRequisitionService.apiCallCloseContractRequisition(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          setIsCloseRequisitionDialogOpen(false);

          navigate("/contractRequisition");

        } else {
          addToast({ type: "error", title: response.left.message });
          setIsCloseRequisitionDialogOpen(false);
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      `${selectedContractRequisitionItem.Type} Requisition`,
    );
  };

  const handleRevokeFinalizationVendor = async () => {

    if (!contractRequisitionData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload: RevokeFinalizationContractVendorRequest = {
          ProjectId: Number(projectId),
          ContractRequisitionId: contractRequisitionData?.ContractRequisitionId ?? 0,
          UniqueKey: contractRequisitionData?.UniqueKey ?? "",
        }

        const response = await contractVendorFinalizationService.apiCallRevokeFinalizationVendor(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage[0], });

          navigate("/contractRequisition");

          setIsRevokeFinalizationVendorDialogOpen(false);

        } else {
          addToast({ type: "error", title: response.left.message });
          setIsRevokeFinalizationVendorDialogOpen(false);
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Revoke Finalization Vendor",
    );
  };

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>

      <div className="flex justify-between">
        <HeaderActionBar
          subTitleText={SystemGeneratedCode ?? "-"}
          subSubTitleText={ContractRequisitionStatus ?? ""}
          subSubSubTitleText={VendorName ?? ""}
          cancelText="Cancel"
          onCancel={() => {
            navigate("/contractRequisition");
          }}
        />

        <div className="flex justify-end gap-4">
          {
            (contractRequisitionData?.IsVendorFinalizationApproved && !contractRequisitionData.IsWorkOrderAvailable) ?
              <Button
                size="mxs"
                style={{
                  color: '#135BEC',
                  padding: '4px 8px',
                  backgroundColor: '#DBEAFE'
                }}
                onClick={() => {
                  setIsRevokeFinalizationVendorDialogOpen(true);
                }}
              >
                Revoke Finalization
              </Button> : <></>
          }
          {contractRequisitionData?.ContractStatus !== "Completed" && (
            <div className="flex justify-end">
              <Button
                size="mxs"
                color="transparent"
                style={{
                  color: "#E92C2C",
                  padding: "4px 8px",
                  backgroundColor: "#FFF2F2",
                }}
                onClick={() => {
                  setSelectedContractRequisitionItem({
                    ContractRequisitionId: contractRequisitionData?.ContractRequisitionId ?? 0,
                    UniqueKey: contractRequisitionData?.UniqueKey ?? "",
                    ProjectId: Number(projectId),
                    Type: "Closed",
                    CloseCompletionRemark: ""
                  });
                  setIsCloseRequisitionDialogOpen(true);
                }}
              >
                <X className="h-4 w-4" color="red" />
                Close Requisition
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 pb-2">
        <Tabs tabs={ContractRequisitionTabList} defaultActive={activeTab} islarge onTabChange={(t) => setActiveTab(t.id)} />
      </div>

      {activeTab === "Overview" && <ContractOverview contractRequisitionData={contractRequisitionData} />}
      {activeTab === "boq" && <ContractBOQSelectionScreen />}
      {activeTab === "Finalized Vendor" && <FinalizedContractVendor onApprovalSuccess={loadContractRequisition} />}
      {activeTab === "Work Order" && <ContractWorkOrder />}
      {activeTab === "Invoice" && <ContractInvoice />}

      <Modal
        isOpen={isCloseRequisitionDialogOpen}
        onClose={() => {
          setIsCloseRequisitionDialogOpen(false);
          setSelectedContractRequisitionItem(null);
        }}
        title={selectedContractRequisitionItem?.Type === "Completed"
          ? "Complete Requisition"
          : "Close Requisition"}
        onSubmit={handleCloseRequisition}
        saveText={selectedContractRequisitionItem?.Type === "Completed"
          ? "Complete Requisition"
          : "Close Requisition"}
        loading={isLoading}
        size="xl">

        <div className="space-y-4 p-6 bg-blue-100">

          <TextArea
            label="Remark"
            placeholder="Enter Remark"
            required
            className="thin-scroll"
            error={closeCompletedRemarkError}
            value={
              selectedContractRequisitionItem?.CloseCompletionRemark ?? ""
            }
            onChange={(e) =>
              setSelectedContractRequisitionItem(prev =>
                prev
                  ? {
                    ...prev,
                    CloseCompletionRemark: e.target.value
                  }
                  : prev
              )
            }
          />

          {selectedContractRequisitionItem?.Type === "Completed" ? (
            <div className="text-sm text-[#00000080] pt-2">
              <p>
                By selecting this option, the <b>Contract Requisition</b> will be
                marked as <b>Completed</b> and cannot be changed later.
              </p>

              <p className="mt-2 font-medium">
                The following must be completed:
              </p>

              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Vendor Finalization</li>
                <li>Vendor Finalization Approval</li>
                <li>Work Order</li>
                <li>Invoice</li>
                <li>Invoice Payment – Fully Paid</li>
              </ul>
            </div>
          ) : (
            <p className="text-sm text-[#00000080] pt-2">
              By selecting this option, the <b>Contract Requisition</b> will be
              marked as <b>Closed</b> and cannot be changed later.
            </p>
          )}
        </div>
      </Modal>

      <ConfirmationDialogBox
        isOpen={isRevokeFinalizationVendorDialogOpen}
        onClose={() => {
          setIsRevokeFinalizationVendorDialogOpen(false);
        }}
        onConfirm={handleRevokeFinalizationVendor}
        title="Reopen Vendor Finalization"
        message="Are you sure you want to reopen the vendor finalization? This will allow you to select and finalize another vendor."
        confirmText="Reopen"
        cancelText="Cancel"
        loading={isLoading}
      />
    </div>
  );
};
