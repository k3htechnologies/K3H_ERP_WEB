import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useTestDocumentCategoryMaster } from '@/features/testDocumentCategory/hooks/useTestDocumentCategoryMaster';
import {
  TestDocumentCategoryMasterTable,
  TestDocumentCategoryMasterViewModal,
  TestDocumentCategoryMasterFormModal,
  TestDocumentCategoryMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/testDocumentCategory/utils/testDocumentCategoryMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const TestDocumentCategoryMaster: React.FC = () => {

  const { projectId } = useProject();

  const {
    
    testDocumentCategoryMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewTestDocumentCategoryMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingTestDocumentCategoryMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    showImportModal,
    canAction,
    canExport,
    testDocumentCategoryMasterColumns,
    visibleTestDocumentCategoryMasterColumns,
    selectedTestDocumentCategoryMasterColumnKeys,
    requiredTestDocumentCategoryMasterColumnKeys,
    isShowCustomizeTestDocumentCategoryMasterColumnsModal,

    
    setSearchTerm,
    setIsViewModalOpen,
    setViewTestDocumentCategoryMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingTestDocumentCategoryMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteTestDocumentCategoryMasterDetailsData,
    setIsShowCustomizeTestDocumentCategoryMasterColumnsModal,
    setShowImportModal,
    setSelectedTestDocumentCategoryMasterColumnKeys,

    
    handlePageChange,
    handleSortColumn,
    handleViewTestDocumentCategoryDetails,
    handleEditTestDocumentCategoryMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddTestDocumentCategoryModal,
    handleAddUpdateTestDocumentCategoryMaster,
    handleDeleteTestDocumentCategoryMaster,
    handleExportTestDocumentCategoryExcel,
    handleExportTestDocumentCategoryPdf,
    handleDownloadExcelSampleTestDocumentCategoryMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchTestDocumentCategories,
  } = useTestDocumentCategoryMaster();

  const testDocumentCategoryListForTable = useMemo(
    () => testDocumentCategoryMasterList,
    [testDocumentCategoryMasterList]
  );

  const testDocumentCategoryMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingTestDocumentCategoryMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingTestDocumentCategoryMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewTestDocumentCategoryMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewTestDocumentCategoryMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteTestDocumentCategoryMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteTestDocumentCategoryMasterDetailsData]);

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
        searchPlaceholder="Search By Test Document Category"
        onSearchChange={(v) => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearsearchTestDocumentCategories}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeTestDocumentCategoryMasterColumnsModal(true)}
        
        isShowAddButton={canAction && Number(projectId) > 0 ? true : false }
        addTitle="Add"
        onAdd={handleAddTestDocumentCategoryModal}
        
        isShowImportButton={canAction && Number(projectId) > 0 ? true : false}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleTestDocumentCategoryMaster}
        
        isShowExportButton={canExport && testDocumentCategoryListForTable.length > 0}
        onExportExcel={handleExportTestDocumentCategoryExcel}
        onExportPdf={handleExportTestDocumentCategoryPdf}
        exportLoading={isLoading}
      />

      <TestDocumentCategoryMasterTable
        data={testDocumentCategoryListForTable}
        columns={visibleTestDocumentCategoryMasterColumns}
        pagination={testDocumentCategoryMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewTestDocumentCategoryDetails}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <TestDocumentCategoryMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewTestDocumentCategoryMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditTestDocumentCategoryMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <TestDocumentCategoryMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateTestDocumentCategoryMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingTestDocumentCategoryMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeTestDocumentCategoryMasterColumnsModal}
        onClose={() => setIsShowCustomizeTestDocumentCategoryMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(new Set([...keys, ...requiredTestDocumentCategoryMasterColumnKeys]));
          setSelectedTestDocumentCategoryMasterColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeTestDocumentCategoryMasterTableColumns(JSON.stringify(withRequired));
          } catch { }
        }}
        columns={testDocumentCategoryMasterColumns}
        selectedKeys={selectedTestDocumentCategoryMasterColumnKeys}
        requiredKeys={requiredTestDocumentCategoryMasterColumnKeys}
        title="Customize Table Columns"
      />

      <TestDocumentCategoryMasterFilterModal
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
        onConfirm={handleDeleteTestDocumentCategoryMaster}
        loading={isLoading}
        pageName='test document category'
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

export default TestDocumentCategoryMaster;
