import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useShiftMappingMaster } from '@/features/shiftMappingMaster/hooks/useShiftMappingMaster';
import {
  ShiftMappingMasterTable,
  ShiftMappingMasterViewModal,
  ShiftMappingMasterFormModal,
  ShiftMappingMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/shiftMappingMaster/utils/shiftMappingMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const ShiftMappingMaster: React.FC = () => {

  const {
    // State
    shiftMappingMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewShiftMappingMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingShiftMappingMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    shiftMappingMasterColumns,
    visibleShiftMappingMasterColumns,
    selectedShiftMappingMasterColumnKeys,
    requiredShiftMappingMasterColumnKeys,
    isShowCustomizeShiftMappingMasterColumnsModal,
    dropdownLabels,
    dropdownResetKey,
    mappingShift,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewShiftMappingMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingShiftMappingMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteShiftMappingMasterDetailsData,
    setIsShowCustomizeShiftMappingMasterColumnsModal,
    setSelectedShiftMappingMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,
    setMappingShift,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewShiftMappingDetails,
    handleEditShiftMappingMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleApplicableTypeChange,
    handleAddShiftMappingMasterModal,
    handleAddUpdateShiftMappingMaster,
    handleDeleteShiftMappingMaster,
    handleExportShiftMappingExcel,
    handleExportShiftMappingPdf,
    debouncedSearch,
    clearsearchShiftMappings,
  } = useShiftMappingMaster();

  const shiftMappingListForTable = useMemo(() => shiftMappingMasterList, [shiftMappingMasterList]);

  const shiftMappingMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingShiftMappingMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey, setMappingShift),
    [setIsAddUpdateModalOpen, setEditingShiftMappingMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey, setMappingShift]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewShiftMappingMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewShiftMappingMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteShiftMappingMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteShiftMappingMasterDetailsData]);

  const handleOpenFilter = useCallback(() => {
    setTempFilters(filters);
    setShowFilterPopup(true);
  }, [filters, setTempFilters, setShowFilterPopup]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Shift Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchShiftMappings}
        isShowFilterButton
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeShiftMappingMasterColumnsModal(true)}
        isShowAddButton={canAction}
        addTitle='Add'
        onAdd={handleAddShiftMappingMasterModal}
        isShowImportButton={false}
        isShowExportButton={canExport && shiftMappingListForTable.length > 0}
        onExportExcel={handleExportShiftMappingExcel}
        onExportPdf={handleExportShiftMappingPdf}
        exportLoading={isLoading}
      />

      <ShiftMappingMasterTable
        data={shiftMappingListForTable}
        columns={visibleShiftMappingMasterColumns}
        pagination={shiftMappingMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewShiftMappingDetails}
        onEdit={handleEditShiftMappingMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <ShiftMappingMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewShiftMappingMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditShiftMappingMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <ShiftMappingMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateShiftMappingMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingShiftMappingMasterData}
        loading={isLoading}
        dropdownLabels={dropdownLabels}
        dropdownResetKey={dropdownResetKey}
        mappingShift={mappingShift}
        onApplicableTypeChange={handleApplicableTypeChange}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeShiftMappingMasterColumnsModal}
        onClose={() => setIsShowCustomizeShiftMappingMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredShiftMappingMasterColumnKeys]))
          setSelectedShiftMappingMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeShiftMappingMasterTableColumns(JSON.stringify(withRequired))
          } catch { }
        }}
        columns={shiftMappingMasterColumns}
        selectedKeys={selectedShiftMappingMasterColumnKeys}
        requiredKeys={requiredShiftMappingMasterColumnKeys}
        title="Customize Master Table Columns"
      />

      <ShiftMappingMasterFilterModal
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
        onConfirm={handleDeleteShiftMappingMaster}
        loading={isLoading}
        pageName='shiftMapping'
      />
    </div>

  )
}

export default ShiftMappingMaster
