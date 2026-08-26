import React, { useCallback, useEffect, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  PayTrackRentLedgerData,
  FilterWithPaginationPayTrackRentRequest,
  DeletePayTrackRentRequest
} from '@/features/payTrackRent/models/PayTrackRentModel';

import { payTrackRentService } from '@/features/payTrackRent/services/PayTrackRentService';
import { Loader } from '@/core/utils/loader';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { handleExportFile } from '@/core/utils/exportFile';
import { useRentListState } from '@/features/rent/context/RentListStateContext';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { Button } from '@/ui/components/forms';
import { ChevronUp, ChevronDown } from 'lucide-react';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';

// Ledger Card Component
interface LedgerCardProps {
  ledger: PayTrackRentLedgerData;
  index: number;
  onDelete?: (ledger: PayTrackRentLedgerData) => void;
  onEdit?: (ledger: PayTrackRentLedgerData) => void;
  canAction: boolean;
}

const LedgerCard: React.FC<LedgerCardProps> = ({ ledger, index, onDelete, onEdit, canAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);

  return (

    <div className="w-full rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden" key={index}>
      <div className="flex items-start px-4 py-4 relative">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
          <span className="text-blue-600 font-semibold text-lg">₹</span>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            <FieldItem label="Payment Mode" value={ledger.PaymentMode || '-'} />
            <FieldItem label="Amount Type" value={ledger.AmountType || '-'} />
            <FieldItem
              label="Amount (₹)"
              value={ledger.PayAmount ? `₹${Number(ledger.PayAmount).toLocaleString('en-IN')}` : '-'}
            />
          </div>
        </div>

        <Button
          onClick={toggle}
          type='button'
          color='transparent'
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* COLLAPSIBLE AREA */}
      {isOpen && (
        <div className="px-4 py-4 border-t bg-gray-50">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FieldItem label="Account Holder Name" value={ledger.AccountHolderName || '-'} />

            <FieldItem label="Bank Name" value={ledger.BankName || '-'} />
            <FieldItem label="Account Number" value={ledger.AccountNumber || '-'} />
            <FieldItem label="IFSC Code" value={ledger.IFSCCode || '-'} />

            <FieldItem label="Transaction / Cheque /DD Number" value={ledger.TransactionChequeDemandDraftNumber || '-'} />
            <FieldItem
              label="Transaction / Cheque / DD Date"
              value={ledger.TransactionChequeDemandDraftDate ? formatDate_dd_MonthName_yy(ledger.TransactionChequeDemandDraftDate) : '-'}
            />
            <FieldItem
              label="Transaction /Cheque/DD Document"
              value={ledger.TransactionChequeDemandDraftURL ? 'View Document' : '-'}
              urls={ledger.TransactionChequeDemandDraftURL}
              isIcon
            />
            <FieldItem
              label="Payment Receipt"
              value={ledger.PaymentReceiptURL ? 'View Receipt' : '-'}
              urls={ledger.PaymentReceiptURL}
              isIcon
            />
          </div>

          <div className="my-4 h-[0.5px] w-full bg-[#3333334f]" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <FieldItem label="Project Account Holder" value={ledger.ProjectBankAccountHolderName || '-'} />
            <FieldItem label="Project Bank Name" value={ledger.ProjectBankName || '-'} />
            <FieldItem label="Project Account Number" value={ledger.ProjectBankAccountNumber || '-'} />
            <FieldItem label="Project IFSC Code" value={ledger.ProjectBankIFSCCode || '-'} />

          </div>

          <div className="my-4 h-[0.5px] w-full bg-[#3333334f]" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FieldItem label="Approval Status" value={ledger.ApprovalStatus || '-'} />
            <FieldItem label="Created By" value={ledger.CreatedBy || '-'} />
            <FieldItem label="Created Date" value={ledger.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(ledger.CreatedDate) : '-'} />
            <FieldItem label="Modified By" value={ledger.ModifiedBy || '-'} />
            <FieldItem label="Modified Date" value={ledger.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(ledger.ModifiedDate) : '-'} />
          </div>

          {canAction && ledger.ApprovalStatus !== "Approved" && (
            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
              {onEdit && (
                <Button
                  color="blue"
                  size="sm"
                  onClick={() => onEdit(ledger)}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  color="red"
                  size="sm"
                  onClick={() => onDelete(ledger)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ViewPayTrackRent: React.FC = () => {
  const [payTrackRentList, setPayTrackRentList] = useState<PayTrackRentLedgerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { addToast } = useToast();

  const { canAction, canExport } = useMenuPermissions();

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deletePayTrackRentData, setDeletePayTrackRentData] = useState<PayTrackRentLedgerData | null>(null)
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchPayTrackRent(value)
  }, 350);

  const { projectId } = useProject();
  const { listState, clearPayTrackRentContext } = useRentListState();
  const { buildingId, payTrackRentTenantApplicantId, tenantId, tenantApplicantId, totalAmount, paidTotalAmount, flatNumber, applicantName, unitType, carpetArea } = listState;
  const tenure = listState.tenure || '';
  const chargeType = listState.activeTab || '';
  const flatCarpetAreaSqFt = carpetArea;
  const flatType = unitType;

  const loadPayTrackRent = useCallback(async (searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationPayTrackRentRequest = {
          PageNumber: 1,
          PageSize: 10000,
          IsCheckPermission: true,
          ProjectId: Number(projectId),
          BuildingId: buildingId > 0 ? buildingId : undefined,
          TenantId: tenantId > 0 ? tenantId : undefined,
          TenantApplicantId: tenantApplicantId > 0 ? tenantApplicantId : undefined,
          ApplicantName: searchtext?.trim() || undefined,
          ChargeType: chargeType?.trim() || undefined,
          Tenure: tenure || null
        };

        const response = await payTrackRentService.apiCallPullPayTrackRentLedger(params);

        if (E.isRight(response)) {
          setPayTrackRentList(response.right.Data);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Pay Track Rent'
    );
  }, [projectId, addToast, buildingId, payTrackRentTenantApplicantId, tenantId]);

  useEffect(() => {
    if (!projectId) return;
    loadPayTrackRent(searchTerm);
  }, [projectId, buildingId, payTrackRentTenantApplicantId]);

  useEffect(() => {
    return () => {
      clearPayTrackRentContext();
    };
  }, [clearPayTrackRentContext]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  const searchPayTrackRent = async (searchValue: string) => {
    setSearchTerm(searchValue);
    await loadPayTrackRent(searchValue);
  };

  const clearSearchPayTrackRent = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadPayTrackRent('');
  };

  const handleEdit = (ledger: PayTrackRentLedgerData) => {
    if (!ledger.PayTrackRentId) return;
    navigate(`/rent/pay/${ledger.PayTrackRentId}`);
  };

  const handleDelete = (ledger: PayTrackRentLedgerData) => {
    setDeletePayTrackRentData(ledger);
    setIsConfirmationDialogBoxOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletePayTrackRentData?.PayTrackRentId || !deletePayTrackRentData?.Uniquekey) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeletePayTrackRentRequest = {
          PayTrackRentId: deletePayTrackRentData.PayTrackRentId ?? 0,
          Uniquekey: deletePayTrackRentData.Uniquekey || '',
          ProjectId: Number(projectId),
          TenantId: deletePayTrackRentData.TenantId || 0,
          TenantApplicantId: deletePayTrackRentData.TenantApplicantId || 0,
          BuildingId: deletePayTrackRentData.BuildingId || 0,

        };

        const response = await payTrackRentService.apiCallDeletePayTrackRent(params);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: 'Pay Track Rent deleted successfully' });
          setIsConfirmationDialogBoxOpen(false);
          setDeletePayTrackRentData(null);
          loadPayTrackRent(searchTerm);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Deleting Pay Track Rent'
    );
  };

  const handleExport = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationPayTrackRentRequest = {

          PageNumber: 1,
          PageSize: 10000,
          IsCheckPermission: true,
          ProjectId: Number(projectId),
          BuildingId: buildingId > 0 ? buildingId : undefined,
          TenantId: tenantId > 0 ? tenantId : undefined,
          TenantApplicantId: tenantApplicantId > 0 ? tenantApplicantId : undefined,
          FlatNumber: searchTerm?.trim() || undefined,
          ApplicantName: searchTerm?.trim() || undefined,
          ChargeType: chargeType?.trim() || undefined,
          Tenure: tenure || null,
          ExportType: exportType
        };

        const response = await payTrackRentService.apiCallPullPayTrackRentLedger(params);

        if (E.isRight(response)) {

          handleExportFile(response, exportType, 'Pay Track Rent Ledger', addToast);

        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      `Exporting ${exportType}`
    );
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search by Account Holder Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearSearchPayTrackRent}
        isShowFilterButton={false}
        isShowAddButton={canAction && (totalAmount - paidTotalAmount) > 0}
        addTitle="Add"
        onAdd={() => navigate('/rent/pay')}
        isShowExportButton={canExport && payTrackRentList.length > 0}
        onExportExcel={() => handleExport('Excel')}
        onExportPdf={() => handleExport('PDF')}
        exportLoading={isLoading}
      />

      <div className=" mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FieldItem label="Flat Number" value={flatNumber || '-'} />
          <FieldItem label="Applicant Name" value={applicantName || '-'} />
          {!["", "-"].includes(tenure?.trim() ?? "") && (
            <FieldItem label="Tenure" value={tenure} />
          )}
          <FieldItem label="Charge Type" value={chargeType || '-'} />
          <FieldItem label="Carpet Area (SqFt)" value={flatCarpetAreaSqFt ? `${flatCarpetAreaSqFt} SqFt` : '-'} />
          <FieldItem label="Unit Type" value={flatType || '-'} />
          <FieldItem label="Total Amount" value={totalAmount > 0 ? `₹${totalAmount}` : '-'} />
          <FieldItem label="Paid Total Amount" value={paidTotalAmount > 0 ? `₹${paidTotalAmount}` : '-'} />

        </div>
      </div>
      {payTrackRentList.length > 0 ? (
        <div className="space-y-3">
          {payTrackRentList.map((ledger, idx) => (
            <LedgerCard
              key={ledger.PayTrackRentId ?? idx}
              ledger={ledger}
              index={idx}
              onDelete={handleDelete}
              onEdit={handleEdit}
              canAction={canAction}
            />
          ))}


        </div>
      ) : (
        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-3" >
          <NoDataView message='No Data Found' />
        </section>
      )}

      <div className='pt-3'>
        <BottomActionBar
          cancelText="Cancel"
          saveText={"Add"}
          onCancel={() => navigate(-1)}
          isLoading={isLoading}
        />
      </div>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeletePayTrackRentData(null);
        }}
        onConfirm={confirmDelete}
        loading={isLoading}
        pageName='pay track ledger'
        title="Delete Pay Track Ledger"
        message={`Are you sure you want to delete this Pay Track Ledger record?`}
      />
    </div>
  );
};

export default ViewPayTrackRent;
