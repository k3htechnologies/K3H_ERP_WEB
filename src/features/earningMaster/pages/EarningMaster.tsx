import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useEarningMaster } from '@/features/earningMaster/hooks/useEarningMaster';
import {
  EarningMasterTable,
  EarningMasterViewModal,
  EarningMasterFormModal,
  EarningMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/earningMaster/utils/earningMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const EarningMaster: React.FC = () => {

  const {
    // State
    earningMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewEarningMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingEarningMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    earningMasterColumns,
    visibleEarningMasterColumns,
    selectedEarningMasterColumnKeys,
    requiredEarningMasterColumnKeys,
    isShowCustomizeEarningMasterColumnsModal,
    dropdownLabels,
    dropdownResetKey,
    applicable,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewEarningMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingEarningMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteEarningMasterDetailsData,
    setIsShowCustomizeEarningMasterColumnsModal,
    setSelectedEarningMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,
    setApplicable,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewEarningDetails,
    handleEditEarningMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddEarningModal,
    handleAddUpdateEarningMaster,
    handleDeleteEarningMaster,
    handleExportEarningExcel,
    handleExportEarningPdf,
    handleResetForm,
    debouncedSearch,
    clearsearchEarnings,
  } = useEarningMaster();

  const earningListForTable = useMemo(() => earningMasterList, [earningMasterList]);

  const earningMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingEarningMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey, setApplicable),
    [setIsAddUpdateModalOpen, setEditingEarningMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey, setApplicable]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewEarningMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewEarningMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteEarningMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteEarningMasterDetailsData]);

  const handleOpenFilter = useCallback(() => {
    setTempFilters(filters);
    setShowFilterPopup(true);
  }, [filters, setTempFilters, setShowFilterPopup]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Earning Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchEarnings}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeEarningMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle='Add'
        onAdd={handleAddEarningModal}
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && earningListForTable.length > 0}
        onExportExcel={handleExportEarningExcel}
        onExportPdf={handleExportEarningPdf}
        exportLoading={isLoading}
      />

      <EarningMasterTable
        data={earningListForTable}
        columns={visibleEarningMasterColumns}
        pagination={earningMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewEarningDetails}
        onEdit={handleEditEarningMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <EarningMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewEarningMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditEarningMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <EarningMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateEarningMaster}
        onReset={handleResetForm}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingEarningMasterData}
        loading={isLoading}
        dropdownLabels={dropdownLabels}
        dropdownResetKey={dropdownResetKey}
        applicable={applicable}
        setApplicable={setApplicable}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeEarningMasterColumnsModal}
        onClose={() => setIsShowCustomizeEarningMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredEarningMasterColumnKeys]),
          )
          setSelectedEarningMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeEarningMasterTableColumns(JSON.stringify(withRequired))
          } catch { }
        }}
        columns={earningMasterColumns}
        selectedKeys={selectedEarningMasterColumnKeys}
        requiredKeys={requiredEarningMasterColumnKeys}
        title="Customize Table Columns"
      />

      <EarningMasterFilterModal
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
        onConfirm={handleDeleteEarningMaster}
        loading={isLoading}
        pageName='earning'
      />
    </div>

  )
}

export default EarningMaster
