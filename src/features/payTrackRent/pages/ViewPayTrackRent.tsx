import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
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
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { handleExportFile } from '@/core/utils/exportFile';
import { useRentListState } from '@/features/rent/context/RentListStateContext';

export const ViewPayTrackRent: React.FC = () => {
  //#region STATE
  const [payTrackRentList, setPayTrackRentList] = useState<PayTrackRentLedgerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);

  const { addToast } = useToast();

  const { canAction, canExport } = useMenuPermissions();

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deletePayTrackRentData, setDeletePayTrackRentData] = useState<PayTrackRentLedgerData | null>(null)

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchPayTrackRent(value)
  }, 350);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { projectId } = useProject();
  const { listState, clearPayTrackRentContext } = useRentListState();
  const { buildingId, payTrackRentTenantApplicantId, tenantId } = listState;
  //#endregion

  //#region DATA LOAD
  const loadPayTrackRent = useCallback(async (pageNum: number, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationPayTrackRentRequest = {
          PageNumber: pageNum,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          ProjectId: Number(projectId),
          BuildingId: buildingId > 0 ? buildingId : undefined,
          TenantId: tenantId > 0 ? tenantId : undefined,
          TenantApplicantId: payTrackRentTenantApplicantId > 0 ? payTrackRentTenantApplicantId : undefined,
          FlatNumber: searchtext?.trim() || undefined,
          ApplicantName: searchtext?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, payTrackRentColumns)
        };

        const response = await payTrackRentService.apiCallPullPayTrackRentLedger(params);

        if (E.isRight(response)) {

          setPayTrackRentList(response.right.Data);

          setPagination({
            currentPage: pageNum,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
          });

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
  }, [projectId, pagination.pageSize, addToast, sortInfo, buildingId, payTrackRentTenantApplicantId]);

  //#endregion

  //#region INIT
  useEffect(() => {
    if (!projectId) return;
    loadPayTrackRent(1, searchTerm);
  }, [projectId, sortInfo, buildingId, payTrackRentTenantApplicantId]);

  // Clear context when component unmounts
  useEffect(() => {
    return () => {
      clearPayTrackRentContext();
    };
  }, [clearPayTrackRentContext]);

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region SEARCH & CLEAR
  const searchPayTrackRent = async (searchValue: string) => {
    setSearchTerm(searchValue);
    await loadPayTrackRent(1, searchValue);
  };

  const clearSearchPayTrackRent = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    setPagination({ currentPage: 1 });
    loadPayTrackRent(1, '');
  };
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = useCallback((page: number) => {
    loadPayTrackRent(page, searchTerm);
  }, [searchTerm]);

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadPayTrackRent(1, searchTerm);
  }, [searchTerm]);
  //#endregion

  //#region HANDLE EDIT
  const handleEdit = (row: PayTrackRentLedgerData) => {
    if (!row?.PayTrackRentId) return;
    navigate(`/payTrackRent/add/${row.PayTrackRentId}`);
  };
  //#endregion

  //#region HANDLE DELETE
  const handleDelete = (row: PayTrackRentLedgerData) => {
    if (!row?.PayTrackRentId) return;
    setDeletePayTrackRentData(row);
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
          loadPayTrackRent(pagination.currentPage, searchTerm);
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
  //#endregion

  //#region EXPORT
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
          TenantApplicantId: payTrackRentTenantApplicantId > 0 ? payTrackRentTenantApplicantId : undefined,
          FlatNumber: searchTerm?.trim() || undefined,
          ApplicantName: searchTerm?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, payTrackRentColumns),
          ExportType: exportType
        };

        const response = await payTrackRentService.apiCallPullPayTrackRentLedger(params);

        if (E.isRight(response)) {

          handleExportFile(response.right, exportType, 'Pay Track Rent Ledger',addToast);

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
  //#endregion

  //#region TABLE COLUMNS
  const payTrackRentColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'FlatNumber',
        label: 'Flat Number',
        width: '10',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'ApplicantName',
        label: 'Applicant Name',
        width: '12',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'PaymentMode',
        label: 'Payment Mode',
        width: '10',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'AmountType',
        label: 'Amount Type',
        width: '10',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'PaymentType',
        label: 'Payment Type',
        width: '10',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'PayAmount',
        label: 'Amount (₹)',
        width: '10',
        sortable: true,
        align: 'right',
        render: (value) => value ? `₹${Number(value).toLocaleString('en-IN')}` : '-'
      },
      {
        key: 'TransactionChequeDemandDraftNumber',
        label: 'Transaction/Cheque/DD Number',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'TransactionChequeDemandDraftDate',
        label: 'Transaction/Cheque/DD Date',
        width: '12',
        sortable: true,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'Tenure',
        label: 'Tenure',
        width: '8',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'ChargeType',
        label: 'Charge Type',
        width: '10',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },

    ],
    [canAction]
  );
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search by Flat Number or Applicant Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearSearchPayTrackRent}
        isShowFilterButton={false}
        isShowAddButton={canAction}
        addButtonText="Add Pay Track Rent"
        onAddClick={() => navigate('/payTrackRent/add')}
        isShowExportButton={canExport}
        onExportExcel={() => handleExport('Excel')}
        exportLoading={isLoading}
      />

      <div className="mt-4">
        <DataTable
          data={payTrackRentList}
          columns={payTrackRentColumns}
          emptyMessage="No Pay Track Rent records found"
          fixedHeight={false}
          recordsPerPage={pagination.pageSize}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          onPageChange={handlePageChange}
          onSort={handleSortColumn}
          sortInfo={sortInfo}
          className="min-w-full"
          aria-label="Pay Track Rent list"
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
        pageName='pay track rent'
        title="Delete Pay Track Rent"
        message={`Are you sure you want to delete this Pay Track Rent record?`}
      />
    </div>
  );
};

export default ViewPayTrackRent;

