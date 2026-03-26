import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useCompOff } from '@/features/compOff/hooks/useCompOff';
import {
  CompOffTable,
  CompOffViewModal,
  CompOffFormModal,
  CompOffFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/compOff/utils/compOffUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { DateRangeWithActions } from '@/ui/components/DateRangeWithActions';
import { updateFiltersWithDates } from '@/core/helpers/dateFilterHelper';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';

export const CompOff: React.FC = () => {

  const {
    // State
    compOffList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    viewCompOffDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingCompOffData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    isShowCustomizeCompOffColumnsModal,
    modalKey,
    canAction,
    canExport,
    compOffColumns,
    visibleCompOffColumns,
    selectedCompOffColumnKeys,
    requiredCompOffColumnKeys,

    // Setters
    setIsViewModalOpen,
    setViewCompOffDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingCompOffData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteCompOffDetailsData,
    setIsShowCustomizeCompOffColumnsModal,
    setSelectedCompOffColumnKeys,
    setModalKey,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleEditCompOff,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddCompOffModal,
    handleAddUpdateCompOff,
    handleDeleteCompOff,
    handleExportCompOffExcel,
    handleExportCompOffPdf,
    handleResetCompOff,
    loadCompOff,
    setFilters,
  } = useCompOff();

  const compOffListForTable = useMemo(() => compOffList, [compOffList]);

  const compOffPaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  );

  const handleFormReset = useCallback(

    createFormResetHandler(setIsAddUpdateModalOpen, setEditingCompOffData, setFormData, setErrors, setModalKey),

    [setIsAddUpdateModalOpen, setEditingCompOffData, setFormData, setErrors, setModalKey]

  );

  //#region DATE RANGE HANDLERS
  const updateListState = useCallback((params: { filters: FilterInfo; page?: number }) => {
    setFilters(params.filters);
    setTempFilters(params.filters);
    if (params.page !== undefined) {
      loadCompOff(params.page, params.filters, sortInfo);
    }
  }, [setFilters, loadCompOff, sortInfo]);

  const handleBothDatesChange = useCallback((fromDate: string | null, toDate: string | null) => {
    updateFiltersWithDates(
      filters,
      { StartDate: fromDate, EndDate: toDate },
      updateListState,
      setTempFilters,
      !!(fromDate && toDate)
    );
  }, [filters, updateListState]);

  const handleFromDateChange = useCallback((date: string | null) => {
    updateFiltersWithDates(
      filters,
      { StartDate: date },
      updateListState,
      setTempFilters
    );
  }, [filters, updateListState]);

  const handleToDateChange = useCallback((date: string | null) => {
    updateFiltersWithDates(
      filters,
      { EndDate: date },
      updateListState,
      setTempFilters
    );
  }, [filters, updateListState]);
  //#endregion

  const handleViewModalClose = useCallback(() => {

    setIsViewModalOpen(false);

    setViewCompOffDetailsData(null);

  }, [setIsViewModalOpen, setViewCompOffDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {

    setIsConfirmationDialogBoxOpen(false);

    setDeleteCompOffDetailsData(null);

  }, [setIsConfirmationDialogBoxOpen, setDeleteCompOffDetailsData]);


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">

      <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

      <DateRangeWithActions
        fromDate={filters.StartDate ?? null}
        toDate={filters.EndDate ?? null}
        onBothDatesChange={handleBothDatesChange}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        canAction={canAction}
        canExport={canExport}
        addTitle="Add"
        onAdd={handleAddCompOffModal}
        hasData={compOffListForTable.length > 0}
        onExportExcel={handleExportCompOffExcel}
        onExportPdf={handleExportCompOffPdf}
        exportLoading={isLoading}
      />

      <CompOffTable
        data={compOffListForTable}
        columns={visibleCompOffColumns}
        pagination={compOffPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onDelete={handleConfirmationDialogBoxOpen || (() => { })}
        canAction={Boolean(canAction)}
        loading={isLoading}
      />

      <CompOffViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewCompOffDetailsData}
        canAction={canAction}
        onEdit={handleEditCompOff}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <CompOffFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onConfirm={handleAddUpdateCompOff}
        onReset={handleResetCompOff}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingCompOffData}
        loading={isLoading}
        modalKey={modalKey}
        filterStartDate={filters.StartDate ?? null}
        filterEndDate={filters.EndDate ?? null}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeCompOffColumnsModal}
        onClose={() => setIsShowCustomizeCompOffColumnsModal(false)}
        onApply={(keys) => {

          const withRequired = Array.from(new Set([...keys, ...requiredCompOffColumnKeys]),)

          setSelectedCompOffColumnKeys(withRequired)

          try {

            LocalStorageHelper.storeCompOffTableColumns(JSON.stringify(withRequired),)

          }
          catch {

          }
        }}
        columns={compOffColumns}
        selectedKeys={selectedCompOffColumnKeys}
        requiredKeys={requiredCompOffColumnKeys}
        title="Customize Table Columns"
      />

      <CompOffFilterModal
        isOpen={showFilterPopup}
        onClose={() => {
          setTempFilters(filters);
          setShowFilterPopup(false);
        }}
        onApply={applyFilters}
        onClear={clearFilters}
        tempFilters={tempFilters}
        onFilterChange={handleFilterChange}
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteCompOff}
        loading={isLoading}
        pageName='Comp Off'
      />
    </div>

  )
}

export default CompOff
