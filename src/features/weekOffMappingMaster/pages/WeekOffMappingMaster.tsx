import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useWeekOffMappingMaster } from '@/features/weekOffMappingMaster/hooks/useWeekOffMappingMaster';
import {
  WeekOffMappingMasterTable,
  WeekOffMappingMasterViewModal,
  WeekOffMappingMasterFormModal,
  WeekOffMappingMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/weekOffMappingMaster/utils/weekOffMappingMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const WeekOffMappingMaster: React.FC = () => {

  const {
    // State
    weekOffMappingMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewWeekOffMappingMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingWeekOffMappingMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    weekOffMappingMasterColumns,
    visibleWeekOffMappingMasterColumns,
    selectedWeekOffMappingMasterColumnKeys,
    requiredWeekOffMappingMasterColumnKeys,
    isShowCustomizeWeekOffMappingMasterColumnsModal,
    dropdownLabels,
    dropdownResetKey,
    mappingWeekoff,

    employeeDetails,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewWeekOffMappingMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingWeekOffMappingMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteWeekOffMappingMasterDetailsData,
    setIsShowCustomizeWeekOffMappingMasterColumnsModal,
    setSelectedWeekOffMappingMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,
    setMappingWeekoff,
    setEmployeeDetails,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewWeekOffMappingDetails,
    handleEditWeekOffMappingMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleApplicableTypeChange,
    handleAddWeekOffMappingMasterModal,
    handleAddUpdateWeekOffMappingMaster,
    handleDeleteWeekOffMappingMaster,
    handleExportWeekOffMappingExcel,
    handleExportWeekOffMappingPdf,
    debouncedSearch,
    clearsearchWeekOffMappings,
  } = useWeekOffMappingMaster();

  const weekOffMappingListForTable = useMemo(() => weekOffMappingMasterList, [weekOffMappingMasterList]);

  const weekOffMappingMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingWeekOffMappingMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey, setMappingWeekoff),
    [setIsAddUpdateModalOpen, setEditingWeekOffMappingMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey, setMappingWeekoff]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewWeekOffMappingMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewWeekOffMappingMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteWeekOffMappingMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteWeekOffMappingMasterDetailsData]);

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
        searchPlaceholder="Search By Week Off Policy Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchWeekOffMappings}
        isShowFilterButton
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeWeekOffMappingMasterColumnsModal(true)}
        isShowAddButton={canAction}
        addTitle='Add'
        onAdd={handleAddWeekOffMappingMasterModal}
        isShowImportButton={false}
        isShowExportButton={canExport && weekOffMappingListForTable.length > 0}
        onExportExcel={handleExportWeekOffMappingExcel}
        onExportPdf={handleExportWeekOffMappingPdf}
        exportLoading={isLoading}
      />

      <WeekOffMappingMasterTable
        data={weekOffMappingListForTable}
        columns={visibleWeekOffMappingMasterColumns}
        pagination={weekOffMappingMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewWeekOffMappingDetails}
        onEdit={handleEditWeekOffMappingMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <WeekOffMappingMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewWeekOffMappingMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditWeekOffMappingMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <WeekOffMappingMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateWeekOffMappingMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingWeekOffMappingMasterData}
        loading={isLoading}
        dropdownLabels={dropdownLabels}
        dropdownResetKey={dropdownResetKey}
        mappingWeekoff={mappingWeekoff}
        onApplicableTypeChange={handleApplicableTypeChange}
        employeeDetails={employeeDetails}
        setEmployeeDetails={setEmployeeDetails}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeWeekOffMappingMasterColumnsModal}
        onClose={() => setIsShowCustomizeWeekOffMappingMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredWeekOffMappingMasterColumnKeys]))
          setSelectedWeekOffMappingMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeWeekOffMappingMasterTableColumns(JSON.stringify(withRequired))
          } catch { }
        }}
        columns={weekOffMappingMasterColumns}
        selectedKeys={selectedWeekOffMappingMasterColumnKeys}
        requiredKeys={requiredWeekOffMappingMasterColumnKeys}
        title="Customize Master Table Columns"
      />

      <WeekOffMappingMasterFilterModal
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
        onConfirm={handleDeleteWeekOffMappingMaster}
        loading={isLoading}
        pageName='weekOff Mapping'
      />
    </div>

  )
}

export default WeekOffMappingMaster
