import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as E from "fp-ts/Either";

import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { ContractRequisitionInvoiceData, ContractRequisitionInvoiceSummaryData, DeleteContractRequisitionInvoice, FilterWithPaginationContractRequisitionInvoice, FilterWithPaginationContractRequisitionInvoiceSummary } from "@/features/contractRequisition/models/ContractRequisitionInvoiceModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { useNavigate } from "react-router-dom";
import { useContractRequisitionListState } from "@/features/contractRequisition/context/ContractRequisitionListStateContext";
import { runApiWithLoader } from "@/core/utils";
import { contractRequisitionInvoiceService } from "@/features/contractRequisition/services/ContractRequisitionInvoiceService";
import { DataTable, type PaginationInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button } from "@/ui/components/forms";
import { Edit, Trash2 } from "lucide-react";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import usePagination from "@/core/hooks/usePagination";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";

export const ContractInvoice: React.FC = () => {
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceSummaryData, setInvoiceSummaryData] = useState<ContractRequisitionInvoiceSummaryData | null>(null);
  const [ContractInvoiceList, setContractInvoiceList] = useState<ContractRequisitionInvoiceData[]>([]);
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteContractInvoiceData, setDeleteContractInvoiceData] = useState<ContractRequisitionInvoiceData | null>(null)
  const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
  const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<number | null>(0);
  const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
  const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
  const [approvalRowData, setApprovalRowData] = useState<ContractRequisitionInvoiceData | null>(null);

  const navigate = useNavigate();
  const { canAction } = useMenuPermissions('/invoice');
  const { canAction: canMakePaymentAction } = useMenuPermissions('/makePayment');
  const { projectId } = useProject();
  const { addToast } = useToast();
  const { pagination, setPagination } = usePagination(20);
  const { listState, updateListState } = useContractRequisitionListState();
  const { ContractRequisitionId, Uniquekey } = listState;

  useEffect(() => {
    if (!projectId) return;
    setPagination({ currentPage: 1 });
    loadContractRequisitionInvoiceSummary();
    loadContractInvoice(1);
  }, [projectId, ContractRequisitionId])

  const loadContractInvoice = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationContractRequisitionInvoice = {
          PageNumber: page,
          PageSize: 10,
          ProjectId: Number(projectId),
          ContractRequisitionId: Number(ContractRequisitionId),
          UniqueKey: Uniquekey
        };

        const response = await contractRequisitionInvoiceService.apiCallPullContractRequisitionInvoice(params);

        if (E.isRight(response)) {
          setContractInvoiceList(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) =>
        addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Contract Invoice'
    );
  };

  const handlePageChange = useCallback((newPage: number) => {
    loadContractInvoice(newPage);
  }, [loadContractInvoice]);

  const invoicePaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );

  const contractInvoiceListForTable = useMemo(() => ContractInvoiceList, [ContractInvoiceList]);

  const loadContractRequisitionInvoiceSummary = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationContractRequisitionInvoiceSummary = {
          ContractRequisitionId: ContractRequisitionId,
        };

        const response = await contractRequisitionInvoiceService.apiCallPullContractRequisitionInvoiceSummary(params);

        if (E.isRight(response)) {

          setInvoiceSummaryData(response.right.Data[0] ?? null);

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
      "Loading Invoice Summary",
    );
  };

  const handleConfirmationDialogBoxOpen = useCallback((row: ContractRequisitionInvoiceData) => {
    setDeleteContractInvoiceData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, []);

  const handleAddContractInvoice = (ContractInvoiceId: number) => {
    navigate(`/contractInvoice/add/${ContractInvoiceId}`);
  };

  const handleDeleteContractInvoice = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteContractInvoiceData) return;

    await runApiWithLoader(

      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteContractRequisitionInvoice = {
          ProjectId: Number(projectId),
          ContractRequisitionId: deleteContractInvoiceData.ContractRequisitionId || 0,
          ContractRequisitionInvoiceId: deleteContractInvoiceData.ContractRequisitionInvoiceId || 0,
          UniqueKey: deleteContractInvoiceData.UniqueKey || "",
        };

        const response = await contractRequisitionInvoiceService.apiCallDeleteContractRequisitionInvoice(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (ContractInvoiceList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });
          await loadContractInvoice(pageToShow);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteContractInvoiceData(null);
        } else {
          addToast({ type: 'error', title: response.left.message });
          setIsConfirmationDialogBoxOpen(false);
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Contract Invoice"
    );
  };

  const handleApprovalLog = (row: ContractRequisitionInvoiceData) => {
    const request: ModulesApprovalStatusRequest = {
      ModuleName: "CONTRACT - ADD INVOICE",
      Id: ContractRequisitionId,
      SubId: row.ContractRequisitionInvoiceId ?? 0,
      ProjectId: Number(projectId),
    };
    setInvoiceAmount(row?.InvoiceAmount ?? 0);
    setApprovalLogRequest(request);
    setIsApprovalLogModalOpen(true);
  };

  const handleApproveRejectDocument = (row: ContractRequisitionInvoiceData, approvalType: "approve" | "reject") => {
    setApprovalRowData(row);
    setInvoiceAmount(row?.InvoiceAmount ?? 0);
    setApprovalActionType(approvalType);
    setIsApprovalActionModalOpen(true);

  };

  const contractInvoiceColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'InvoiceNumber',
        label: 'Invoice Number',
        width: '30',
        sortable: false,
        fixed: 'left',
        align: 'left',
        render: (value: string, row: any) => {
          return (
            <TooltipText
              text={value || '-'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => {
                updateListState({
                  ContractRequisitionInvoiceId: row.ContractRequisitionInvoiceId
                });
                navigate(`/contractInvoicePayment/invoicePayment`);
              }}
            />
          );
        }
      },
      {
        key: 'UploadInvoiceURL',
        label: 'Invoice Document',
        width: '30',
        sortable: false,
        fixed: 'left',
        align: 'left',
        render: (value: string, row: any) => {
          return (
            <div className="flex items-center justify-between w-full">
              <MultiImageViewer
                images={parseDocumentUrls(row.UploadInvoiceURL)}
                title="Invoice Document"
                triggerLabel={value || '-'}
                isIcon={false}
              />
            </div>
          );
        }
      },
      {
        key: 'InvoiceDate',
        label: 'Invoice Date ',
        width: '14',
        align: 'left',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
      },

      {
        key: "InvoiceAmount",
        label: "Invoice Amount",
        width: "14",
        sortable: false,
        align: "right",
        render: value => value || '0'
      },
      {
        key: "InvoiceAmountPaidTillDate",
        label: "Paid Invoice Amount",
        width: "14",
        sortable: false,
        align: "right",
        render: value => value || '0'
      },
      {
        key: "PendingAmount",
        label: "Pending Amount",
        width: "14",
        sortable: false,
        align: "right",
        render: (_, row) => {
          const invoice = Number(row.InvoiceAmount || 0);
          const paid = Number(row.PaymentAmount || 0);
          const pending = invoice - paid;

          return pending >= 0 ? pending : 0;
        }
      },
      {
        key: "InvoiceStatus",
        label: "Approval Status",
        width: "18",
        sortable: false,
        align: "center",
        render: (value, row) => (

          <ApprovalActions
            approvalStatus={value || "-"}
            showApproval={row.IsApproval}
            isIcons={true}
            onHistory={() => handleApprovalLog(row)}
            onApprove={() => handleApproveRejectDocument(row, "approve")}
            onReject={() => handleApproveRejectDocument(row, "reject")}
          />

        )
      },
      {
        key: 'Actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center',
        render: (_value, row) => {

          const status = row.InvoiceStatus?.toUpperCase() || "";
          const isApproved = status.includes("APPROVED");
          const isLocked = !canAction || isApproved;

          return (
            <div className="flex items-center justify-center">
              {
                !isApproved ?
                  <>
                    <Button
                      color="transparent"
                      size="sm"
                      disabled={isLocked}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (isLocked) return;
                        handleAddContractInvoice(row.ContractRequisitionInvoiceId)
                      }}
                      style={{
                        color: isLocked ? '#9CA3AF' : '',
                        padding: '4px 8px',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.5 : 1
                      }}
                      leftIcon={<Edit className="h-4 w-4" />}
                    />
                    <Button
                      color="transparent"
                      size="sm"
                      disabled={isLocked}
                      style={{
                        color: isLocked ? '#9CA3AF' : 'red',
                        padding: '4px 8px',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.5 : 1
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (isLocked) return;
                        handleConfirmationDialogBoxOpen(row)
                      }}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    />
                  </> :
                  <Button
                    color="green"
                    size="md"
                    onClick={() => {
                      updateListState({
                        ContractRequisitionInvoiceId: row.ContractRequisitionInvoiceId ?? 0,
                      });
                      navigate('/contractInvoicePayment/add');
                    }}
                  >
                    Make Payment
                  </Button>
              }
            </div>
          )
        }
      },

    ], [handleAddContractInvoice, handleConfirmationDialogBoxOpen, handleApprovalLog, handleApproveRejectDocument]
  );

  const handleApprovalSubmit = async (remark: string) => {

    if (!approvalRowData) return;

    const payload: UpdateModulesWorkflowApprovalRequest = {
      ModuleName: "CONTRACT REQUISITION",
      Id: ContractRequisitionId,
      SubId: approvalRowData.ContractRequisitionInvoiceId ?? 0,
      ProjectId: Number(projectId),
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

          await loadContractInvoice(1)

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
      approvalActionType === "approve" ? "Approving Contract" : "Rejecting Contract"
    );
  };

  return (
    <div className="pt-2">
      <Loader loading={isLoading} title={loadingMessage}>{" "} <div></div>{" "}</Loader>
      <div className="flex justify-end gap-2">
        <Button
          color="blue"
          size="sm"
          onClick={() => {
            navigate(`/contractInvoice/add`);
          }}
        >
          Create Invoice
        </Button>
      </div>
      <div className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 my-4">
        <div className="lg:col-span-5 pb-3">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
              Contract Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldItem label="Vendor Name" value={invoiceSummaryData?.FinalVendor} />
              <FieldItem label="Vendor Company" value={invoiceSummaryData?.FinalVendorCompanyName} />
              <FieldItem label="Mobile Number" value={`${invoiceSummaryData?.FinalVendorMobileNumberCountryCode} ${invoiceSummaryData?.FinalVendorMobileNumber}`} />
              <FieldItem label="GST Number" value={invoiceSummaryData?.FinalVendorGSTNumber} />
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
              Work Order Details (₹)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldItem label="Total (₹)" value={`₹ ${invoiceSummaryData?.TotalRequisitionAmount?.toFixed(2) ?? ''}`} />
              <FieldItem label="Paid (₹)" value={`₹ ${invoiceSummaryData?.PaidRequisitionAmount?.toFixed(2) ?? ''}`} />
              <FieldItem label="Pending (₹)" value={`₹ ${invoiceSummaryData?.PendingRequisitionAmount?.toFixed(2) ?? ''}`} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">
              Invoice Details (₹)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldItem label="Total (₹)" value={`₹ ${invoiceSummaryData?.TotalInvoiceAmount?.toFixed(2) ?? ''}`} />
              <FieldItem label="Paid (₹)" value={`₹ ${invoiceSummaryData?.TotalAmountPaid?.toFixed(2) ?? ''}`} />
              <FieldItem label="TDS Paid (₹)" value={`₹ ${invoiceSummaryData?.TotalTDSAmountPaid?.toFixed(2) ?? ''}`} />
              <FieldItem label="Pending (₹)" value={`₹ ${invoiceSummaryData?.RemainingInvoiceAmount?.toFixed(2) ?? ''}`} />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-2 space-y-4">
        <DataTable
          data={contractInvoiceListForTable}
          columns={contractInvoiceColumns}
          pagination={invoicePaginationInfo}
          emptyMessage='No Invoice Data Found'
          loading={isLoading}
          fixedHeight
          recordsPerPage={20}
        />
      </div>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setDeleteContractInvoiceData(null);
          setIsConfirmationDialogBoxOpen(false);
        }}
        onConfirm={handleDeleteContractInvoice}
        loading={isLoading}
        pageName="Contract Invoice"
      />
      <ApprovalLogModal
        isOpen={isApprovalLogModalOpen}
        title='Invoice'
        subSubTitleText={invoiceAmount?.toString() ?? ""}
        onClose={() => setIsApprovalLogModalOpen(false)}
        request={approvalLogRequest} />

      <ApprovalActionModal
        title="Invoice"
        isOpen={isApprovalActionModalOpen}
        onClose={() => setIsApprovalActionModalOpen(false)}
        actionType={approvalActionType}
        subSubTitleText={invoiceAmount?.toString() ?? ""}
        onSubmit={handleApprovalSubmit}
        loading={isLoading}
      />
    </div>
  );
};
