import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useUomMaster } from '@/features/uomMaster/hooks/useUomMaster';
import {
  UomMasterTable,
  UomMasterViewModal,
  UomMasterFormModal,
  UomMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/uomMaster/utils/uomMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const UomMaster: React.FC = () => {

  const {
    // State
    uomMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewUomMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingUomMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    uomMasterColumns,
    visibleUomMasterColumns,
    selectedUomMasterColumnKeys,
    requiredUomMasterColumnKeys,
    isShowCustomizeUomMasterColumnsModal,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewUomMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingUomMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteUomMasterDetailsData,
    setIsShowCustomizeUomMasterColumnsModal,
    setSelectedUomMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewUomDetails,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddUomModal,
    handleAddUpdateUomMaster,
    handleDeleteUomMaster,
    handleExportUomExcel,
    handleExportUomPdf,
    debouncedSearch,
    clearsearchUoms,
  } = useUomMaster();

  const uomListForTable = useMemo(() => uomMasterList, [uomMasterList]);

  const uomMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingUomMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingUomMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewUomMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewUomMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteUomMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteUomMasterDetailsData]);

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
        searchPlaceholder="Search By UOM Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchUoms}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton={false}
        onCustomize={() => setIsShowCustomizeUomMasterColumnsModal(true)}
        // ADD
        isShowAddButton={false}
        addTitle="Add UOM"
        onAdd={handleAddUomModal}
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && uomListForTable.length > 0}
        onExportExcel={handleExportUomExcel}
        onExportPdf={handleExportUomPdf}
        exportLoading={isLoading}
      />

      <UomMasterTable
        data={uomListForTable}
        columns={visibleUomMasterColumns}
        pagination={uomMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewUomDetails}
        canAction={canAction}
        loading={isLoading}
      />

      <UomMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewUomMasterDetailsData}
      />

      <UomMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateUomMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingUomMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeUomMasterColumnsModal}
        onClose={() => setIsShowCustomizeUomMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredUomMasterColumnKeys]),
          )
          setSelectedUomMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeUomMasterTableColumns(
              JSON.stringify(withRequired),
            )
          } catch { }
        }}
        columns={uomMasterColumns}
        selectedKeys={selectedUomMasterColumnKeys}
        requiredKeys={requiredUomMasterColumnKeys}
        title="Customize Table Columns"
      />

      <UomMasterFilterModal
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
        onConfirm={handleDeleteUomMaster}
        loading={isLoading}
        pageName='uom'
      />
    </div>

  )
}

export default UomMaster
