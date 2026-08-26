import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useDrawingDocumentCategoryMaster } from '@/features/drawingDocumentCategory/hooks/useDrawingDocumentCategoryMaster';
import {
  DrawingDocumentCategoryMasterTable,
  DrawingDocumentCategoryMasterViewModal,
  DrawingDocumentCategoryMasterFormModal,
  DrawingDocumentCategoryMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/drawingDocumentCategory/utils/drawingDocumentCategoryMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const DrawingDocumentCategoryMaster: React.FC = () => {

  const { projectId } = useProject();

  const {
    // State
    drawingDocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewDrawingDocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingDrawingDocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    showImportModal,
    canAction,
    canExport,
    drawingDocumentCategoryMasterColumns,
    visibleDrawingDocumentCategoryMasterColumns,
    selectedDrawingDocumentCategoryMasterColumnKeys,
    requiredDrawingDocumentCategoryMasterColumnKeys,
    isShowCustomizeDrawingDocumentCategoryMasterColumnsModal,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewDrawingDocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingDrawingDocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteDrawingDocumentCategoryMasterDetailsData,
    setIsShowCustomizeDrawingDocumentCategoryMasterColumnsModal,
    setShowImportModal,
    setSelectedDrawingDocumentCategoryMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewDrawingDocumentCategoryDetails,
    handleEditDrawingDocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddDrawingDocumentCategoryModal,
    handleAddUpdateDrawingDocumentCategoryMaster,
    handleDeleteDrawingDocumentCategoryMaster,
    handleExportDrawingDocumentCategoryExcel,
    handleExportDrawingDocumentCategoryPdf,
    handleDownloadExcelSampleDrawingDocumentCategoryMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchDrawingDocumentCategories,
  } = useDrawingDocumentCategoryMaster();

  const drawingDocumentCategoryListForTable = useMemo(
    () => drawingDocumentCategoryMasterList,
    [drawingDocumentCategoryMasterList]
  );

  const drawingDocumentCategoryMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingDrawingDocumentCategoryMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingDrawingDocumentCategoryMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewDrawingDocumentCategoryMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewDrawingDocumentCategoryMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteDrawingDocumentCategoryMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteDrawingDocumentCategoryMasterDetailsData]);

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
        searchPlaceholder="Search By Drawing Document Category"
        onSearchChange={(v) => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearsearchDrawingDocumentCategories}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeDrawingDocumentCategoryMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction && Number(projectId) > 0 ? true : false }
        addTitle="Add"
        onAdd={handleAddDrawingDocumentCategoryModal}
        // IMPORT
        isShowImportButton={canAction && Number(projectId) > 0 ? true : false}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleDrawingDocumentCategoryMaster}
        // EXPORT
        isShowExportButton={canExport && drawingDocumentCategoryListForTable.length > 0}
        onExportExcel={handleExportDrawingDocumentCategoryExcel}
        onExportPdf={handleExportDrawingDocumentCategoryPdf}
        exportLoading={isLoading}
      />

      <DrawingDocumentCategoryMasterTable
        data={drawingDocumentCategoryListForTable}
        columns={visibleDrawingDocumentCategoryMasterColumns}
        pagination={drawingDocumentCategoryMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewDrawingDocumentCategoryDetails}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <DrawingDocumentCategoryMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewDrawingDocumentCategoryMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditDrawingDocumentCategoryMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <DrawingDocumentCategoryMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateDrawingDocumentCategoryMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingDrawingDocumentCategoryMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeDrawingDocumentCategoryMasterColumnsModal}
        onClose={() => setIsShowCustomizeDrawingDocumentCategoryMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredDrawingDocumentCategoryMasterColumnKeys]));
          setSelectedDrawingDocumentCategoryMasterColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeDrawingDocumentCategoryMasterTableColumns(JSON.stringify(withRequired));
          } catch { }
        }}
        columns={drawingDocumentCategoryMasterColumns}
        selectedKeys={selectedDrawingDocumentCategoryMasterColumnKeys}
        requiredKeys={requiredDrawingDocumentCategoryMasterColumnKeys}
        title="Customize Table Columns"
      />

      <DrawingDocumentCategoryMasterFilterModal
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
        onConfirm={handleDeleteDrawingDocumentCategoryMaster}
        loading={isLoading}
        pageName='drawing document category'
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

export default DrawingDocumentCategoryMaster;
