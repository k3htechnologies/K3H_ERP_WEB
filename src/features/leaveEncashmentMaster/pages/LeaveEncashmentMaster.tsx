import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useLeaveEncashmentMaster } from '@/features/leaveEncashmentMaster/hooks/useLeaveEncashmentMaster';
import {
  LeaveEncashmentMasterTable,
  LeaveEncashmentMasterViewModal,
  LeaveEncashmentMasterFormModal
} from '../components';
import { createFormResetHandler } from '@/features/leaveEncashmentMaster/utils/leaveEncashmentMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const LeaveEncashmentMaster: React.FC = () => {

  const {
    // State
    leaveEncashmentMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    viewLeaveEncashmentMasterDetailsData,
    isViewModalOpen,
    errors,
    editingLeaveEncashmentMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    leaveEncashmentMasterColumns,
    visibleLeaveEncashmentMasterColumns,
    selectedLeaveEncashmentMasterColumnKeys,
    requiredLeaveEncashmentMasterColumnKeys,
    isShowCustomizeLeaveEncashmentMasterColumnsModal,

    // Setters
    setIsViewModalOpen,
    setViewLeaveEncashmentMasterDetailsData,
    setErrors,
    setEditingLeaveEncashmentMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteLeaveEncashmentMasterDetailsData,
    setIsShowCustomizeLeaveEncashmentMasterColumnsModal,
    setSelectedLeaveEncashmentMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewLeaveEncashmentDetails,
    handleEditLeaveEncashmentMasterData,
    handleConfirmationDialogBoxOpen,
    handleFieldChange,
    handleAddLeaveEncashmentMasterModal,
    handleAddUpdateLeaveEncashmentMaster,
    handleDeleteLeaveEncashmentMaster,
    handleExportLeaveEncashmentExcel,
    handleExportLeaveEncashmentPdf,
  } = useLeaveEncashmentMaster();

  const leaveEncashmentListForTable = useMemo(() => leaveEncashmentMasterList, [leaveEncashmentMasterList]);

  const leaveEncashmentMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingLeaveEncashmentMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingLeaveEncashmentMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewLeaveEncashmentMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewLeaveEncashmentMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteLeaveEncashmentMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteLeaveEncashmentMasterDetailsData]);

  const handleResetForm = useCallback(() => {
    setFormData({ ...formData, EarningMasterName: '', MinSalary: 0, MaxSalary: 0, EncashmentRate: 0 });
    setErrors({});
  }, [formData, setFormData, setErrors]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar={false}
        isShowFilterButton={false}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeLeaveEncashmentMasterColumnsModal(true)}
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddLeaveEncashmentMasterModal}
        isShowImportButton={false}
        isShowExportButton={canExport && leaveEncashmentListForTable.length > 0}
        onExportExcel={handleExportLeaveEncashmentExcel}
        onExportPdf={handleExportLeaveEncashmentPdf}
        exportLoading={isLoading}
      />

      <LeaveEncashmentMasterTable
        data={leaveEncashmentListForTable}
        columns={visibleLeaveEncashmentMasterColumns}
        pagination={leaveEncashmentMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewLeaveEncashmentDetails}
        onEdit={handleEditLeaveEncashmentMasterData}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <LeaveEncashmentMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewLeaveEncashmentMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditLeaveEncashmentMasterData}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <LeaveEncashmentMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateLeaveEncashmentMaster}
        onReset={handleResetForm}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingLeaveEncashmentMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeLeaveEncashmentMasterColumnsModal}
        onClose={() => setIsShowCustomizeLeaveEncashmentMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredLeaveEncashmentMasterColumnKeys]))
          setSelectedLeaveEncashmentMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeLeaveEncashmentMasterTableColumns(JSON.stringify(withRequired))
          } catch { }
        }}
        columns={leaveEncashmentMasterColumns}
        selectedKeys={selectedLeaveEncashmentMasterColumnKeys}
        requiredKeys={requiredLeaveEncashmentMasterColumnKeys}
        title="Customize Table Columns"
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteLeaveEncashmentMaster}
        loading={isLoading}
        pageName='leaveEncashment'
      />
    </div>

  )
}

export default LeaveEncashmentMaster
