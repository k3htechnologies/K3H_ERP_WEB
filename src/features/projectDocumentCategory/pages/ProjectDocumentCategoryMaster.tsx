import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useProjectDocumentCategoryMaster } from '@/features/projectDocumentCategory/hooks/useProjectDocumentCategoryMaster';
import {
  ProjectDocumentCategoryMasterTable,
  ProjectDocumentCategoryMasterViewModal,
  ProjectDocumentCategoryMasterFormModal,
  ProjectDocumentCategoryMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/projectDocumentCategory/utils/projectDocumentCategoryMasterUtils';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const ProjectDocumentCategoryMaster: React.FC = () => {
  const {
    // State
    projectDocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewProjectDocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingProjectDocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    showImportModal,
    canAction,
    canExport,
    projectDocumentCategoryMasterColumns,
    visibleProjectDocumentCategoryMasterColumns,
    selectedProjectDocumentCategoryMasterColumnKeys,
    requiredProjectDocumentCategoryMasterColumnKeys,
    isShowCustomizeProjectDocumentCategoryMasterColumnsModal,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewProjectDocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingProjectDocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteProjectDocumentCategoryMasterDetailsData,
    setIsShowCustomizeProjectDocumentCategoryMasterColumnsModal,
    setShowImportModal,
    setSelectedProjectDocumentCategoryMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewProjectDocumentCategoryDetails,
    handleEditProjectDocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddProjectDocumentCategoryModal,
    handleAddUpdateProjectDocumentCategoryMaster,
    handleDeleteProjectDocumentCategoryMaster,
    handleExportProjectDocumentCategoryExcel,
    handleExportProjectDocumentCategoryPdf,
    handleDownloadExcelSampleProjectDocumentCategoryMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchProjectDocumentCategories,
  } = useProjectDocumentCategoryMaster();

  const projectDocumentCategoryListForTable = useMemo(
    () => projectDocumentCategoryMasterList,
    [projectDocumentCategoryMasterList]
  );

  const projectDocumentCategoryMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingProjectDocumentCategoryMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingProjectDocumentCategoryMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewProjectDocumentCategoryMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewProjectDocumentCategoryMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteProjectDocumentCategoryMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteProjectDocumentCategoryMasterDetailsData]);

  const handleOpenFilter = useCallback(() => {
    setTempFilters(filters);
    setShowFilterPopup(true);
  }, [filters, setTempFilters, setShowFilterPopup]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Project Document Category"
        onSearchChange={(v) => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearsearchProjectDocumentCategories}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeProjectDocumentCategoryMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddProjectDocumentCategoryModal}
        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleProjectDocumentCategoryMaster}
        // EXPORT
        isShowExportButton={canExport && projectDocumentCategoryListForTable.length > 0}
        onExportExcel={handleExportProjectDocumentCategoryExcel}
        onExportPdf={handleExportProjectDocumentCategoryPdf}
        exportLoading={isLoading}
      />

      <ProjectDocumentCategoryMasterTable
        data={projectDocumentCategoryListForTable}
        columns={visibleProjectDocumentCategoryMasterColumns}
        pagination={projectDocumentCategoryMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewProjectDocumentCategoryDetails}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <ProjectDocumentCategoryMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewProjectDocumentCategoryMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditProjectDocumentCategoryMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <ProjectDocumentCategoryMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateProjectDocumentCategoryMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingProjectDocumentCategoryMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeProjectDocumentCategoryMasterColumnsModal}
        onClose={() => setIsShowCustomizeProjectDocumentCategoryMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredProjectDocumentCategoryMasterColumnKeys]));
          setSelectedProjectDocumentCategoryMasterColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeProjectDocumentCategoryMasterTableColumns(JSON.stringify(withRequired));
          } catch { }
        }}
        columns={projectDocumentCategoryMasterColumns}
        selectedKeys={selectedProjectDocumentCategoryMasterColumnKeys}
        requiredKeys={requiredProjectDocumentCategoryMasterColumnKeys}
        title="Customize Table Columns"
      />

      <ProjectDocumentCategoryMasterFilterModal
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
        onConfirm={handleDeleteProjectDocumentCategoryMaster}
        loading={isLoading}
        pageName='project document category'
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

export default ProjectDocumentCategoryMaster;
