import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useBranchAssociationsMaster } from '@/features/branchAssociationsMaster/hooks/useBranchAssociationsMaster';
import {
  BranchAssociationsMasterTable,
  BranchAssociationsMasterViewModal,
  BranchAssociationsMasterFormModal
} from '../components';
import { createFormResetHandler } from '@/features/branchAssociationsMaster/utils/branchAssociationsMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const BranchAssociationsMaster: React.FC = () => {

  const {
    // State
    branchAssociationsMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewBranchAssociationsMasterDetailsData,
    isViewModalOpen,
    errors,
    editingBranchAssociationMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    branchAssociationsMasterColumns,
    dropdownLabels,
    dropdownResetKey,

    employeeDetails,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewBranchAssociationsMasterDetailsData,
    setErrors,
    setEditingBranchAssociationMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteBranchAssociationsData,
    setDropdownLabels,
    setDropdownResetKey,
    setEmployeeDetails,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewBranchAssociationsDetails,
    handleEditBranchAssociationsMaster,
    handleConfirmationDialogBoxOpen,
    handleFieldChange,
    handleAddBranchAssociationsMaster,
    handleAddUpdateBranchAssociationsMaster,
    handleDeleteBranchAssociations,
    handleExportBranchAssociationsExcel,
    handleExportBranchAssociationsPdf,
    handleResetForm,
    debouncedSearch,
    clearsearchBranchAssociations,
  } = useBranchAssociationsMaster();

  const branchAssociationsListForTable = useMemo(() => branchAssociationsMasterList, [branchAssociationsMasterList]);

  const branchAssociationsMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingBranchAssociationMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey),
    [setIsAddUpdateModalOpen, setEditingBranchAssociationMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewBranchAssociationsMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewBranchAssociationsMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteBranchAssociationsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteBranchAssociationsData]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Employee Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchBranchAssociations}
        isShowFilterButton={false}
        isShowCustomizeButton={false}
        isShowAddButton={canAction}
        addTitle='Add'
        onAdd={handleAddBranchAssociationsMaster}
        isShowImportButton={false}
        isShowExportButton={canExport && branchAssociationsListForTable.length > 0}
        onExportExcel={handleExportBranchAssociationsExcel}
        onExportPdf={handleExportBranchAssociationsPdf}
        exportLoading={isLoading}
      />

      <BranchAssociationsMasterTable
        data={branchAssociationsListForTable}
        columns={branchAssociationsMasterColumns}
        pagination={branchAssociationsMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewBranchAssociationsDetails}
        onEdit={handleEditBranchAssociationsMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <BranchAssociationsMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewBranchAssociationsMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditBranchAssociationsMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <BranchAssociationsMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateBranchAssociationsMaster}
        onReset={handleResetForm}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingBranchAssociationMasterData}
        loading={isLoading}
        dropdownLabels={dropdownLabels}
        dropdownResetKey={dropdownResetKey}
        employeeDetails={employeeDetails}
        setEmployeeDetails={setEmployeeDetails}

      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteBranchAssociations}
        loading={isLoading}
        pageName='Branch Association'
      />
    </div>

  )
}

export default BranchAssociationsMaster
