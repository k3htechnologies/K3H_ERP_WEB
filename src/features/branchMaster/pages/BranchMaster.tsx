import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useBranchMaster } from '@/features/branchMaster/hooks/useBranchMaster';
import {
  BranchMasterTable,
  BranchMasterViewModal,
  BranchMasterFormModal,
  BranchMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/branchMaster/utils/branchMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const BranchMaster: React.FC = () => {

  const {
    // State
    branchMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewBranchMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingBranchMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    branchMasterColumns,
    visibleBranchMasterColumns,
    selectedBranchMasterColumnKeys,
    requiredBranchMasterColumnKeys,
    isShowCustomizeBranchMasterColumnsModal,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewBranchMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingBranchMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteBranchMasterDetailsData,
    setIsShowCustomizeBranchMasterColumnsModal,
    setSelectedBranchMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewBranchDetails,
    handleEditBranchMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddBranchMasterModal,
    handleAddUpdateBranchMaster,
    handleDeleteBranchMaster,
    handleExportBranchExcel,
    handleExportBranchPdf,
    handleResetForm,
    debouncedSearch,
    clearsearchBranches,
  } = useBranchMaster();

  const branchListForTable = useMemo(() => branchMasterList, [branchMasterList]);

  const branchMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingBranchMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingBranchMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewBranchMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewBranchMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteBranchMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteBranchMasterDetailsData]);

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
        searchPlaceholder="Search By Branch Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchBranches}
        isShowFilterButton={true}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeBranchMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddBranchMasterModal}
        // IMPORT
        isShowImportButton={canAction}
        // EXPORT
        isShowExportButton={canExport && branchListForTable.length > 0}
        onExportExcel={handleExportBranchExcel}
        onExportPdf={handleExportBranchPdf}
        exportLoading={isLoading}
      />

      <BranchMasterTable
        data={branchListForTable}
        columns={visibleBranchMasterColumns}
        pagination={branchMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewBranchDetails}
        onEdit={handleEditBranchMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <BranchMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewBranchMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditBranchMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <BranchMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateBranchMaster}
        onReset={handleResetForm}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingBranchMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeBranchMasterColumnsModal}
        onClose={() => setIsShowCustomizeBranchMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredBranchMasterColumnKeys]),
          )
          setSelectedBranchMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeBranchMasterTableColumns(
              JSON.stringify(withRequired),
            )
          } catch { }
        }}
        columns={branchMasterColumns}
        selectedKeys={selectedBranchMasterColumnKeys}
        requiredKeys={requiredBranchMasterColumnKeys}
        title="Customize Table Columns"
      />

      <BranchMasterFilterModal
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
        onConfirm={handleDeleteBranchMaster}
        loading={isLoading}
        pageName='branch'
      />
    </div>

  )
}

export default BranchMaster
