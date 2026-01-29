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
import { DateRangeSelector } from '@/ui/components/forms/DateRangeSelector';
import { Button } from '@/ui/components/forms';
import { Download, Plus } from 'lucide-react';

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

  // Optimized date range change handler
  const handleDateRangeChange = useCallback((fromDate: string | null, toDate: string | null) => {
    const newFilters = { ...filters };
    
    if (fromDate) {
      newFilters.StartDate = fromDate;
    } else {
      delete newFilters.StartDate;
    }
    
    if (toDate) {
      newFilters.EndDate = toDate;
    } else {
      delete newFilters.EndDate;
    }
    
    setTempFilters(newFilters);
    setFilters(newFilters);
    
    // Only load data when both dates are selected to avoid unnecessary API calls
    if (fromDate && toDate) {
      loadCompOff(1, newFilters, sortInfo);
    }
  }, [filters, setTempFilters, setFilters, loadCompOff, sortInfo]);

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

        <div className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative min-w-0 w-[526px]">
              <DateRangeSelector
                fromDate={filters.StartDate ?? null}
                toDate={filters.EndDate ?? null}
                onBothDatesChange={handleDateRangeChange}
                onFromDateChange={(date) => handleDateRangeChange(date, filters.EndDate ?? null)}
                onToDateChange={(date) => handleDateRangeChange(filters.StartDate ?? null, date)}
              />
            </div>

            {/* RIGHT SIDE: Export and Add Buttons */}
            <div className="flex items-center space-x-3">
              {/* EXPORT BUTTON */}
              {canExport && compOffListForTable.length > 0 && (
                <div className="relative">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleExportCompOffExcel();
                    }}
                    color="blue"
                    colorMode="gradient_light"
                    size="mxs"
                    defineWidth
                    title="Export"
                    style={{ width: '95px' }}
                    leftIcon={<Download className="h-4 w-4" />}
                    disabled={isLoading}
                  >
                    <span>Export</span>
                  </Button>
                </div>
              )}

              {/* ADD BUTTON */}
              {canAction && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddCompOffModal();
                  }}
                  color="blue"
                  size="mxs"
                  variant="solid"
                  colorMode="gradient_dark"
                  defineWidth
                  title="Add"
                  aria-label="Add"
                  style={{ width: '95px' }}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  <span>Add</span>
                </Button>
              )}
            </div>
          </div>
        </div>

      <CompOffTable
        data={compOffListForTable}
        columns={visibleCompOffColumns}
        pagination={compOffPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onDelete={handleConfirmationDialogBoxOpen || (() => {})}
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
        pageName='compOff'
      />
    </div>

  )
}

export default CompOff
