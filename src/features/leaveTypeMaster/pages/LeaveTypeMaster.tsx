import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useLeaveTypeMaster } from '@/features/leaveTypeMaster/hooks/useLeaveTypeMaster';
import {
  LeaveTypeMasterTable,
  LeaveTypeMasterViewModal,
  LeaveTypeMasterFormModal,
  LeaveTypeMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/leaveTypeMaster/utils/leaveTypeMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const LeaveTypeMaster: React.FC = () => {

  const {
    // State
    leaveTypeMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewLeaveTypeMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingLeaveTypeMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    leaveTypeMasterColumns,
    visibleLeaveTypeMasterColumns,
    selectedLeaveTypeMasterColumnKeys,
    requiredLeaveTypeMasterColumnKeys,
    isShowCustomizeLeaveTypeMasterColumnsModal,
    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewLeaveTypeMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingLeaveTypeMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteLeaveTypeMasterDetailsData,
    setIsShowCustomizeLeaveTypeMasterColumnsModal,
    setSelectedLeaveTypeMasterColumnKeys,
    setPrevMaxCarryForward,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewLeaveTypeDetails,
    handleEditLeaveTypeMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddLeaveTypeModal,
    handleAddUpdateLeaveTypeMaster,
    handleDeleteLeaveTypeMaster,
    handleExportLeaveTypeExcel,
    handleExportLeaveTypePdf,
    handleResetForm,
    debouncedSearch,
    clearsearchLeaveTypes,
  } = useLeaveTypeMaster();

  const leaveTypeListForTable = useMemo(() => leaveTypeMasterList, [leaveTypeMasterList]);

  const leaveTypeMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingLeaveTypeMasterData, setFormData, setErrors, setPrevMaxCarryForward),
    [setIsAddUpdateModalOpen, setEditingLeaveTypeMasterData, setFormData, setErrors, setPrevMaxCarryForward]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewLeaveTypeMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewLeaveTypeMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteLeaveTypeMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteLeaveTypeMasterDetailsData]);

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
        searchPlaceholder="Search By Leave Type"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchLeaveTypes}
        isShowFilterButton
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeLeaveTypeMasterColumnsModal(true)}
        isShowAddButton={canAction}
        addTitle='Add'
        onAdd={handleAddLeaveTypeModal}
        isShowImportButton={false}
        isShowExportButton={canExport && leaveTypeListForTable.length > 0}
        onExportExcel={handleExportLeaveTypeExcel}
        onExportPdf={handleExportLeaveTypePdf}
        exportLoading={isLoading}
      />

      <LeaveTypeMasterTable
        data={leaveTypeListForTable}
        columns={visibleLeaveTypeMasterColumns}
        pagination={leaveTypeMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewLeaveTypeDetails}
        onEdit={handleEditLeaveTypeMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <LeaveTypeMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewLeaveTypeMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditLeaveTypeMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <LeaveTypeMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateLeaveTypeMaster}
        onReset={handleResetForm}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingLeaveTypeMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeLeaveTypeMasterColumnsModal}
        onClose={() => setIsShowCustomizeLeaveTypeMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredLeaveTypeMasterColumnKeys]))
          setSelectedLeaveTypeMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeLeaveTypeMasterTableColumns(JSON.stringify(withRequired))
          } catch { }
        }}
        columns={leaveTypeMasterColumns}
        selectedKeys={selectedLeaveTypeMasterColumnKeys}
        requiredKeys={requiredLeaveTypeMasterColumnKeys}
        title="Customize Table Columns"
      />

      <LeaveTypeMasterFilterModal
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
        onConfirm={handleDeleteLeaveTypeMaster}
        loading={isLoading}
        pageName='leaveType'
      />
    </div>

  )
}

export default LeaveTypeMaster
