import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useApprovalDocumentCategoryMaster } from '@/features/approvalDocumentCategory/hooks/useApprovalDocumentCategoryMaster';
import {
  ApprovalDocumentCategoryMasterTable,
  ApprovalDocumentCategoryMasterViewModal,
  ApprovalDocumentCategoryMasterFormModal,
  ApprovalDocumentCategoryMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/approvalDocumentCategory/utils/approvalDocumentCategoryMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const ApprovalDocumentCategoryMaster: React.FC = () => {

  const { projectId } = useProject();
  const {
    // State
    approvalDocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewApprovalDocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingApprovalDocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    showImportModal,
    canAction,
    canExport,
    approvalDocumentCategoryMasterColumns,
    visibleApprovalDocumentCategoryMasterColumns,
    selectedApprovalDocumentCategoryMasterColumnKeys,
    requiredApprovalDocumentCategoryMasterColumnKeys,
    isShowCustomizeApprovalDocumentCategoryMasterColumnsModal,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewApprovalDocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingApprovalDocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteApprovalDocumentCategoryMasterDetailsData,
    setIsShowCustomizeApprovalDocumentCategoryMasterColumnsModal,
    setShowImportModal,
    setSelectedApprovalDocumentCategoryMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewApprovalDocumentCategoryDetails,
    handleEditApprovalDocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddApprovalDocumentCategoryModal,
    handleAddUpdateApprovalDocumentCategoryMaster,
    handleDeleteApprovalDocumentCategoryMaster,
    handleExportApprovalDocumentCategoryExcel,
    handleExportApprovalDocumentCategoryPdf,
    handleDownloadExcelSampleApprovalDocumentCategoryMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchApprovalDocumentCategories,
  } = useApprovalDocumentCategoryMaster();

  const approvalDocumentCategoryListForTable = useMemo(
    () => approvalDocumentCategoryMasterList,
    [approvalDocumentCategoryMasterList]
  );

  const approvalDocumentCategoryMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingApprovalDocumentCategoryMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingApprovalDocumentCategoryMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewApprovalDocumentCategoryMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewApprovalDocumentCategoryMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteApprovalDocumentCategoryMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteApprovalDocumentCategoryMasterDetailsData]);

  const handleOpenFilter = useCallback(() => {
    setTempFilters(filters);
    setShowFilterPopup(true);
  }, [filters, setTempFilters, setShowFilterPopup]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Approval Document Category"
        onSearchChange={(v) => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearsearchApprovalDocumentCategories}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeApprovalDocumentCategoryMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction && Number(projectId) > 0 ? true : false}
        addTitle="Add"
        onAdd={handleAddApprovalDocumentCategoryModal}
        // IMPORT
        isShowImportButton={canAction && Number(projectId) > 0 ? true : false}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleApprovalDocumentCategoryMaster}
        // EXPORT
        isShowExportButton={canExport && approvalDocumentCategoryListForTable.length > 0}
        onExportExcel={handleExportApprovalDocumentCategoryExcel}
        onExportPdf={handleExportApprovalDocumentCategoryPdf}
        exportLoading={isLoading}
      />

      <ApprovalDocumentCategoryMasterTable
        data={approvalDocumentCategoryListForTable}
        columns={visibleApprovalDocumentCategoryMasterColumns}
        pagination={approvalDocumentCategoryMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewApprovalDocumentCategoryDetails}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <ApprovalDocumentCategoryMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewApprovalDocumentCategoryMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditApprovalDocumentCategoryMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <ApprovalDocumentCategoryMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateApprovalDocumentCategoryMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingApprovalDocumentCategoryMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeApprovalDocumentCategoryMasterColumnsModal}
        onClose={() => setIsShowCustomizeApprovalDocumentCategoryMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredApprovalDocumentCategoryMasterColumnKeys]));
          setSelectedApprovalDocumentCategoryMasterColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeApprovalDocumentCategoryMasterTableColumns(JSON.stringify(withRequired));
          } catch { }
        }}
        columns={approvalDocumentCategoryMasterColumns}
        selectedKeys={selectedApprovalDocumentCategoryMasterColumnKeys}
        requiredKeys={requiredApprovalDocumentCategoryMasterColumnKeys}
        title="Customize Table Columns"
      />

      <ApprovalDocumentCategoryMasterFilterModal
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
        onConfirm={handleDeleteApprovalDocumentCategoryMaster}
        loading={isLoading}
        pageName='approval document category'
      />

      <ExportImport
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUpload={(file, mergeExisting) => {
          setShowImportModal(false);
          uploadExcel(file, mergeExisting);
        }}
      />
    </div>
  );
};

export default ApprovalDocumentCategoryMaster;
