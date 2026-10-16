import type React from "react";
import { useEffect, useState } from "react";
import * as E from "fp-ts/Either";
import { Maximize2, Minimize2 } from "lucide-react";

import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Button, Input } from "@/ui/components/forms";
import { useContractRequisitionListState } from "@/features/contractRequisition/context/ContractRequisitionListStateContext";
import { runApiWithLoader } from "@/core/utils";
import type { AddUpdateContractRequisitionWorkOrderRequest, ContractRequisitionWorkOrderData, DeleteContractRequisitionWorkOrder, FilterWithPaginationContractRequisitionWorkOrder, GenerateContractRequisitionWorkOrderPdfData } from "@/features/contractRequisition/models/ContractRequisitionWorkOrderModel";
import { contractRequisitionWorkOrderService } from "@/features/contractRequisition/services/ContractRequisitionWorkOrderService";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { Modal } from "@/ui/components/Modal/Modal";
import RichTextEditor from "@/ui/components/forms/RichTextEditor";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchTncMasterDropdown } from "@/features/tnc/tncDropDown";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { useViewportHeight } from "@/core/utils/useViewportHeight";
import { TextArea } from "@/ui/components/forms/Textarea";

const initialGenerateFormState = (): GenerateContractRequisitionWorkOrderPdfData => ({
  ContractRequisitionId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ProjectId: 0,
  Remarks: '',
  TermsCondition: ''
})

const InitialUploadFormState = (): AddUpdateContractRequisitionWorkOrderRequest => ({
  ContractRequisitionWorkOrderId: 0,
  UniqueKey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  TotalAmount: 0,
  ProjectId: 0,
  ContractRequisitionId: 0,
  ContractRequisitionWorkOrderURL: '',
  RemoveContractRequisitionWorkOrderURL: ''
})

export const ContractWorkOrder: React.FC = () => {
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contractRequisitionWorkOrder, setContractRequisitionWorkOrder] = useState<ContractRequisitionWorkOrderData | null>(null);
  const [isWorkOrderLoaded, setIsWorkOrderLoaded] = useState(false);
  const [formData, setFormData] = useState<GenerateContractRequisitionWorkOrderPdfData>(() => initialGenerateFormState());
  const [uploadData, setUploadData] = useState<AddUpdateContractRequisitionWorkOrderRequest>(() => InitialUploadFormState());
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteGenerateWorkOrderData, setDeleteGenerateWorkOrderData] = useState<ContractRequisitionWorkOrderData | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [workOrderFiles, setWorkOrderFiles] = useState<(File | string)[]>([]);
  const [removedWorkOrderUrls, setRemovedWorkOrderUrls] = useState<string[]>([]);
  const [workOrderURL, setWorkOrderURL] = useState<string>();
  const [isUploadWO, setIsUploadWO] = useState(false);

  const { projectId } = useProject();
  const { addToast } = useToast();
  const { listState, updateListState } = useContractRequisitionListState();
  const { ContractRequisitionId, Uniquekey, VendorFinalizationApprovalStatus, ContractRequisitionStatus } = listState;
  const { canAction: canGenerateWorkOrder } = useMenuPermissions('Contract - Generate Work Order');
  const pdfHeight = useViewportHeight(180, 300, 1200);

  useEffect(() => {
    if (!projectId) return;

    setIsWorkOrderLoaded(false);
    loadWorkOrder();
  }, [projectId, ContractRequisitionId]);

  const loadWorkOrder = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationContractRequisitionWorkOrder = {
          PageNumber: 1,
          PageSize: 10,
          ProjectId: Number(projectId),
          ContractRequisitionId: ContractRequisitionId,
          Uniquekey: Uniquekey
        }
        const response = await contractRequisitionWorkOrderService.apiCallPullContractRequisitionWorkOrder(params);

        if (E.isRight(response)) {
          const data = response.right.Data;

          setContractRequisitionWorkOrder(Array.isArray(data) ? (data[0] ?? null) : data);

          setIsWorkOrderLoaded(true);
        } else {
          setIsWorkOrderLoaded(false);
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        setIsWorkOrderLoaded(false);

        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Work Order ",
    );
  };

  //#region FETCH TNC DROPDOWN WITH MODULE NAME
  const fetchTncByModuleName = (moduleName: string) => (page: number, params?: { value?: string }) =>
    fetchTncMasterDropdown(page, {
      value: params?.value || "",
      moduleName: moduleName,
    });
  //#endregion

  const handleFieldChange = (field: keyof GenerateContractRequisitionWorkOrderPdfData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldChangeUploadWorkOrder = (field: keyof AddUpdateContractRequisitionWorkOrderRequest, value: any) => {
    setUploadData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // const handleGenerateWorkorder = () => {
  //   setDeleteGenerateWorkOrderData(null);
  //   setFormData(initialGenerateFormState());
  //   setErrors({});
  //   setIsAddUpdateModalOpen(true);
  // }

  const validateGenerateWorkOrderForm = (): {

    isValid: boolean
    errors: { [key: string]: string }
  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.Remarks?.trim()) {
      newErrors.Remarks = "Remarks is required.";
    } else if (formData.Remarks.trim().length < 25) {
      newErrors.Remarks = "Remark must be at least 25 characters";
    }

    if (!formData.TermsCondition?.trim()) {
      newErrors.TermsCondition = "Terms & Condition is required.";
    }
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushGenerateWorkOrderFormData = (): GenerateContractRequisitionWorkOrderPdfData => {
    return {
      ContractRequisitionId: Number(ContractRequisitionId),
      Uniquekey: Uniquekey ?? '',
      Remarks: formData.Remarks,
      TermsCondition: formData.TermsCondition,
      ProjectId: Number(projectId),
    };
  };

  const handleGenerateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})
    const validation = validateGenerateWorkOrderForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const payload = PushGenerateWorkOrderFormData();

        const response = await contractRequisitionWorkOrderService.apiCallGenerateContractRequisitionWorkOrderPdf(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          loadWorkOrder();

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
      'Generate Work Order'
    )
  };

  const handleUploadWorkOrder = async () => {

    const fd = new FormData();
    fd.append("ContractRequisitionWorkOrderId", uploadData.ContractRequisitionWorkOrderId.toString());
    fd.append("UniqueKey", uploadData.UniqueKey ?? "");
    fd.append("ProjectId", projectId!.toString());
    fd.append("TotalAmount", uploadData.TotalAmount.toString());
    fd.append("ContractRequisitionId", (ContractRequisitionId ?? 0).toString());

    workOrderFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('ContractRequisitionWorkOrderURL', file);
      }
    });

    fd.append('RemoveContractRequisitionWorkOrderURL', removedWorkOrderUrls.join(','));

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await contractRequisitionWorkOrderService.apiCallAddUpdateContractRequisitionWorkOrder(fd);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          setIsAddUpdateModalOpen(false);

          loadWorkOrder();

        } else {
          addToast({ type: "error", title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Uploading Work Order"
    );
  };

  const handleConfirmationDialogBoxOpen = (record: ContractRequisitionWorkOrderData) => {
    setDeleteGenerateWorkOrderData(record);
    setIsConfirmationDialogBoxOpen(true);
  }

  const handleDeleteGenerateWorkOrder = async () => {

    setIsConfirmationDialogBoxOpen(false);
    if (!deleteGenerateWorkOrderData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteContractRequisitionWorkOrder = {
          ContractRequisitionId: deleteGenerateWorkOrderData.ContractRequisitionId || 0,
          ContractRequisitionWorkOrderId: deleteGenerateWorkOrderData.ContractRequisitionWorkOrderId || 0,
          Uniquekey: deleteGenerateWorkOrderData.UniqueKey || "",
          ProjectId: Number(projectId)
        };

        const response = await contractRequisitionWorkOrderService.apiCallDeleteContractRequisitionWorkOrder(params);

        if (E.isRight(response)) {

          updateListState({ ContractRequisitionStage: 'Generate Work Order' });

          loadWorkOrder();

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteGenerateWorkOrderData(null);

        } else {
          addToast({ type: 'error', title: response.left.message });
          setIsConfirmationDialogBoxOpen(false);
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Work Order"
    );
  };

  const hasWorkOrder = !!contractRequisitionWorkOrder?.ContractRequisitionWorkOrderURL;
  const isPdf = (url: string) => url.toLowerCase().includes(".pdf") || url.startsWith("blob:");

  return (
    <div className="bg-white p-1 h-[500px]">
      <Loader loading={isLoading} title={loadingMessage}>{" "}<div></div>{" "}</Loader>

      <div className="flex justify-end gap-2">

        {isWorkOrderLoaded && !hasWorkOrder && canGenerateWorkOrder && !["COMPLETED", "CLOSED"].includes(ContractRequisitionStatus?.toUpperCase()) &&
          VendorFinalizationApprovalStatus?.toUpperCase() === "APPROVED" && (
            <>
              {/* <Button
                color="red"
                size="mxs"
                title="Generate"
                onClick={() => {
                  setIsUploadWO(false);
                  setWorkOrderFiles([]);
                  setWorkOrderURL("")
                  setRemovedWorkOrderUrls([]);
                  handleGenerateWorkorder();
                }}
                style={{ width: '100px' }} >
                Generate PO
              </Button> */}

              <Button
                onClick={() => {
                  setIsUploadWO(true);
                  setWorkOrderFiles([]);
                  setWorkOrderURL("")
                  setRemovedWorkOrderUrls([]);
                  setIsAddUpdateModalOpen(true);
                }}
                color="blue"
                size="mxs"
                variant="solid"
                colorMode="gradient_dark"
                defineWidth
                style={{ width: '100px' }}
              >
                Upload PO
              </Button>
            </>
          )}
      </div>

      {hasWorkOrder ? (
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-1 mt-1 mb-4">


          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold mb-2">
              Work Order
            </h2>
            <div className="flex gap-2">
              <h2 className="text-lg font-semibold">Total Amount : {contractRequisitionWorkOrder?.TotalAmount}</h2>
              <button
                onClick={() => setIsMaximized(true)}
                className="px-2 py-2 mb-2 hover:bg-gray-100 rounded"
              >
                <Maximize2 className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>


          <div
            className="w-full" style={{ height: `${pdfHeight - 180}px` }}  >
            {isPdf(contractRequisitionWorkOrder?.ContractRequisitionWorkOrderURL ?? '') && (
              <iframe
                src={contractRequisitionWorkOrder?.ContractRequisitionWorkOrderURL ?? ''}
                className="w-full h-full border-0"
                title="pdf-preview"
              />
            )}
          </div>

          <div className="flex justify-between items-center mt-2 mb-2 mr-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                Created By {contractRequisitionWorkOrder?.CreatedBy || "-"} on{" "}
                {contractRequisitionWorkOrder?.CreatedDate
                  ? formatDate_dd_MonthName_yy(
                    contractRequisitionWorkOrder.CreatedDate
                  )
                  : "-"}
              </span>
            </div>

            {isWorkOrderLoaded && canGenerateWorkOrder && !["COMPLETED", "CLOSED"].includes(listState.ContractRequisitionStatus?.toUpperCase()) && (
              <Button
                color="red"
                variant="solid"
                onClick={() =>
                  handleConfirmationDialogBoxOpen(contractRequisitionWorkOrder as ContractRequisitionWorkOrderData)
                }
                className="px-4 py-2 rounded-md"
              >
                Delete
              </Button>
            )}
          </div>

        </div>
      ) :
        <section className="md:col-span-4 bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f] mt-5">
          <NoDataView message="No Work Order Found" />
        </section>}

      {isMaximized && (
        <div className="fixed inset-0 z-9999 bg-black/60 flex items-center justify-center">
          <div className="w-full h-full bg-white flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">

              <h2 className="font-semibold">Work Order File</h2>
              <div className="flex justify-end gap-1">
                <h2 className="text-lg font-semibold">Total Amount : {contractRequisitionWorkOrder?.TotalAmount}</h2>
                <button
                  onClick={() => setIsMaximized(false)}
                  className="px-2 py-2 hover:bg-gray-100 rounded" >
                  <Minimize2 className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <iframe
                src={contractRequisitionWorkOrder?.ContractRequisitionWorkOrderURL ?? ''}
                className="w-full h-full"
                title="pdf-preview"
              />
            </div>

          </div>
        </div>
      )}

      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setIsUploadWO(false);
          setFormData(initialGenerateFormState());
          setErrors({});
          setWorkOrderFiles([]);
        }}
        title={isUploadWO ? "Upload Work Order" : "Work Order"}
        onSubmit={(e) => {
          e.preventDefault();
          if (isUploadWO) {
            handleUploadWorkOrder();
          } else {
            handleGenerateWorkOrder(e);
          }
        }}
        saveText={isUploadWO ? "Upload" : "Generate"}
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-10 p-6 bg-blue-100">
          {isUploadWO ? (
            <>
              <div>
                <MultiFilePicker
                  label=" Upload Work Order"
                  placeholder="Select Work Order"
                  required
                  error={errors.WorkOrderURL}
                  value={workOrderFiles}
                  onChange={setWorkOrderFiles}
                  availableFilesURL={workOrderURL ?? ""}
                  allowedTypes={["application/pdf"]}
                  maxFiles={1}
                  onRemoveExisting={(url) => {
                    setRemovedWorkOrderUrls((prev) => [...prev, url])
                  }}
                />
              </div>
              <div>
                <Input
                  type="text"
                  required
                  label='Work Order Amount'
                  value={uploadData.TotalAmount ?? ""}
                  onChange={(e) => handleFieldChangeUploadWorkOrder("TotalAmount", e.target.value)}
                  placeholder="Enter Work Order Amount"
                  maxLength={15}
                  error={errors.TotalAmount}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4" >

              <div>
                <TextArea
                  label='Remarks'
                  required
                  value={formData.Remarks ?? ""}
                  onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                  placeholder="Enter Remarks"
                  error={errors.Remarks} />

              </div>

              <div>
                <SingleSelectDropdownWithPagination
                  label="Term & Condition"
                  title="Term & Condition"
                  size="lg"
                  dataFetchCallBack={fetchTncByModuleName("Material Requisition")}
                  onSelected={(item) => handleFieldChange("TermsCondition", item?.value)}
                  error={errors.TermsCondition}
                  required
                />
              </div>

              {formData?.TermsCondition && (
                <div>
                  <RichTextEditor
                    value={formData.TermsCondition}
                    onChange={(e) => handleFieldChange("TermsCondition", e)}
                    readOnly
                    className="overflow-y-auto thin-scroll h-[250px]"
                  />
                </div>
              )}

            </div>
          )}
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteGenerateWorkOrderData(null);
        }}
        onConfirm={handleDeleteGenerateWorkOrder}
        loading={isLoading}
        pageName='Work Order'
      />
    </div>
  )
};
