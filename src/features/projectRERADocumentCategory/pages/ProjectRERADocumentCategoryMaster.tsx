import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useProjectRERADocumentCategoryMaster } from '@/features/projectRERADocumentCategory/hooks/useProjectRERADocumentCategoryMaster';
import {
  ProjectRERADocumentCategoryMasterTable,
  ProjectRERADocumentCategoryMasterViewModal,
  ProjectRERADocumentCategoryMasterFormModal,
  ProjectRERADocumentCategoryMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/projectRERADocumentCategory/utils/projectRERADocumentCategoryMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const ProjectRERADocumentCategoryMaster: React.FC = () => {

  const { projectId } = useProject();

  const {
    // State
    projectRERADocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewProjectRERADocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingProjectRERADocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    projectRERADocumentCategoryMasterColumns,
    visibleProjectRERADocumentCategoryMasterColumns,
    selectedProjectRERADocumentCategoryMasterColumnKeys,
    requiredProjectRERADocumentCategoryMasterColumnKeys,
    isShowCustomizeProjectRERADocumentCategoryMasterColumnsModal,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewProjectRERADocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingProjectRERADocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteProjectRERADocumentCategoryMasterDetailsData,
    setIsShowCustomizeProjectRERADocumentCategoryMasterColumnsModal,
    setSelectedProjectRERADocumentCategoryMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewProjectRERADocumentCategoryDetails,
    handleEditProjectRERADocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddProjectRERADocumentCategoryModal,
    handleAddUpdateProjectRERADocumentCategoryMaster,
    handleDeleteProjectRERADocumentCategoryMaster,
    handleExportProjectRERADocumentCategoryExcel,
    handleExportProjectRERADocumentCategoryPdf,
    debouncedSearch,
    clearsearchProjectRERADocumentCategories,
  } = useProjectRERADocumentCategoryMaster();

  const projectRERADocumentCategoryListForTable = useMemo(
    () => projectRERADocumentCategoryMasterList,
    [projectRERADocumentCategoryMasterList]
  );

  const projectRERADocumentCategoryMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingProjectRERADocumentCategoryMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingProjectRERADocumentCategoryMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewProjectRERADocumentCategoryMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewProjectRERADocumentCategoryMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteProjectRERADocumentCategoryMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteProjectRERADocumentCategoryMasterDetailsData]);

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
        searchPlaceholder="Search By Project RERA Document Category"
        onSearchChange={(v) => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearsearchProjectRERADocumentCategories}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeProjectRERADocumentCategoryMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction && Number(projectId) > 0 ? true : false}
        addTitle="Add"
        onAdd={handleAddProjectRERADocumentCategoryModal}
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && projectRERADocumentCategoryListForTable.length > 0}
        onExportExcel={handleExportProjectRERADocumentCategoryExcel}
        onExportPdf={handleExportProjectRERADocumentCategoryPdf}
        exportLoading={isLoading}
      />

      <ProjectRERADocumentCategoryMasterTable
        data={projectRERADocumentCategoryListForTable}
        columns={visibleProjectRERADocumentCategoryMasterColumns}
        pagination={projectRERADocumentCategoryMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewProjectRERADocumentCategoryDetails}
        canAction={canAction}
        loading={isLoading}
      />

      <ProjectRERADocumentCategoryMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewProjectRERADocumentCategoryMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditProjectRERADocumentCategoryMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <ProjectRERADocumentCategoryMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateProjectRERADocumentCategoryMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingProjectRERADocumentCategoryMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeProjectRERADocumentCategoryMasterColumnsModal}
        onClose={() => setIsShowCustomizeProjectRERADocumentCategoryMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredProjectRERADocumentCategoryMasterColumnKeys]));
          setSelectedProjectRERADocumentCategoryMasterColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeProjectRERADocumentCategoryMasterTableColumns(JSON.stringify(withRequired));
          } catch { }
        }}
        columns={projectRERADocumentCategoryMasterColumns}
        selectedKeys={selectedProjectRERADocumentCategoryMasterColumnKeys}
        requiredKeys={requiredProjectRERADocumentCategoryMasterColumnKeys}
        title="Customize Table Columns"
      />

      <ProjectRERADocumentCategoryMasterFilterModal
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
        onConfirm={handleDeleteProjectRERADocumentCategoryMaster}
        loading={isLoading}
        pageName='project RERA document category'
      />
    </div>
  );
};

export default ProjectRERADocumentCategoryMaster;
