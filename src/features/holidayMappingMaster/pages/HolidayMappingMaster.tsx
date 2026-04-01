import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useHolidayMappingMaster } from '@/features/holidayMappingMaster/hooks/useHolidayMappingMaster';
import {
  HolidayMappingMasterTable,
  HolidayMappingMasterViewModal,
  HolidayMappingMasterFormModal,
  HolidayMappingMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/holidayMappingMaster/utils/holidayMappingMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const HolidayMappingMaster: React.FC = () => {

  const {
    // State
    holidayMappingMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewHolidayMappingMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingHolidayMappingMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    holidayMappingMasterColumns,
    visibleHolidayMappingMasterColumns,
    selectedHolidayMappingMasterColumnKeys,
    requiredHolidayMappingMasterColumnKeys,
    isShowCustomizeHolidayMappingMasterColumnsModal,
    dropdownLabels,
    dropdownResetKey,
    branchValueDropdown,
    departmentValueDropdown,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewHolidayMappingMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingHolidayMappingMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteHolidayMappingMasterDetailsData,
    setIsShowCustomizeHolidayMappingMasterColumnsModal,
    setSelectedHolidayMappingMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewHolidayMappingDetails,
    handleEditHolidayMappingMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddHolidayMappingModal,
    handleAddUpdateHolidayMappingMaster,
    handleDeleteHolidayMappingMaster,
    handleExportHolidayMappingExcel,
    handleExportHolidayMappingPdf,
    debouncedSearch,
    clearsearchHolidayMappings,
  } = useHolidayMappingMaster();

  const holidayMappingListForTable = useMemo(() => holidayMappingMasterList, [holidayMappingMasterList]);

  const holidayMappingMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingHolidayMappingMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey),
    [setIsAddUpdateModalOpen, setEditingHolidayMappingMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewHolidayMappingMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewHolidayMappingMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteHolidayMappingMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteHolidayMappingMasterDetailsData]);

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
        searchPlaceholder="Search By Holiday Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchHolidayMappings}
        isShowFilterButton
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeHolidayMappingMasterColumnsModal(true)}
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddHolidayMappingModal}
        isShowImportButton={false}
        isShowExportButton={canExport && holidayMappingListForTable.length > 0}
        onExportExcel={handleExportHolidayMappingExcel}
        onExportPdf={handleExportHolidayMappingPdf}
        exportLoading={isLoading}
      />

      <HolidayMappingMasterTable
        data={holidayMappingListForTable}
        columns={visibleHolidayMappingMasterColumns}
        pagination={holidayMappingMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewHolidayMappingDetails}
        onEdit={handleEditHolidayMappingMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <HolidayMappingMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewHolidayMappingMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditHolidayMappingMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <HolidayMappingMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateHolidayMappingMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingHolidayMappingMasterData}
        loading={isLoading}
        dropdownLabels={dropdownLabels}
        dropdownResetKey={dropdownResetKey}
        branchValueDropdown={branchValueDropdown}
        departmentValueDropdown={departmentValueDropdown}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeHolidayMappingMasterColumnsModal}
        onClose={() => setIsShowCustomizeHolidayMappingMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredHolidayMappingMasterColumnKeys]))
          setSelectedHolidayMappingMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeHolidayMappingMasterTableColumns(JSON.stringify(withRequired))
          } catch { }
        }}
        columns={holidayMappingMasterColumns}
        selectedKeys={selectedHolidayMappingMasterColumnKeys}
        requiredKeys={requiredHolidayMappingMasterColumnKeys}
        title="Customize Table Columns"
      />

      <HolidayMappingMasterFilterModal
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
        onConfirm={handleDeleteHolidayMappingMaster}
        loading={isLoading}
        pageName='Holiday Mapping'
      />
    </div>

  )
}

export default HolidayMappingMaster
