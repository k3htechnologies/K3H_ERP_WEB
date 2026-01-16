import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useDesignationMaster } from '@/features/designationMaster/hooks/useDesignationMaster';
import {
  DesignationMasterTable,
  DesignationMasterViewModal,
  DesignationMasterFormModal,
  DesignationMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/designationMaster/utils/designationMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const DesignationMaster: React.FC = () => {

  const {
    // State
    designationMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewDesignationMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingDesignationMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    showImportModal,
    canAction,
    canExport,
    designationMasterColumns,
    visibleDesignationMasterColumns,
    selectedDesignationMasterColumnKeys,
    requiredDesignationMasterColumnKeys,
    isShowCustomizeDesignationMasterColumnsModal,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewDesignationMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingDesignationMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteDesignationMasterDetailsData,
    setIsShowCustomizeDesignationMasterColumnsModal,
    setShowImportModal,
    setSelectedDesignationMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewDesignationDetails,
    handleEditDesignationMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddDesignationModal,
    handleAddUpdateDesignationMaster,
    handleDeleteDesignationMaster,
    handleExportDesignationExcel,
    handleExportDesignationPdf,
    handleDownloadExcelSampleDesignationMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchDesignationMaster,
  } = useDesignationMaster();

  const designationMasterListForTable = useMemo(() => designationMasterList, [designationMasterList]);

  const designationMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingDesignationMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingDesignationMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewDesignationMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewDesignationMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteDesignationMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteDesignationMasterDetailsData]);

  const handleOpenFilter = useCallback(() => {
    setTempFilters(filters);
    setShowFilterPopup(true);
  }, [filters, setTempFilters, setShowFilterPopup]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Designation Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchDesignationMaster}
        isShowFilterButton={true}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeDesignationMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddDesignationModal}
        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleDesignationMaster}
        // EXPORT
        isShowExportButton={canExport && designationMasterListForTable.length > 0}
        onExportExcel={handleExportDesignationExcel}
        onExportPdf={handleExportDesignationPdf}
        exportLoading={isLoading}
      />

      <DesignationMasterTable
        data={designationMasterListForTable}
        columns={visibleDesignationMasterColumns}
        pagination={designationMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewDesignationDetails}
        onEdit={handleEditDesignationMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <DesignationMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewDesignationMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditDesignationMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <DesignationMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateDesignationMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingDesignationMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeDesignationMasterColumnsModal}
        onClose={() => setIsShowCustomizeDesignationMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredDesignationMasterColumnKeys]),
          )
          setSelectedDesignationMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeDesignationMasterTableColumns(
              JSON.stringify(withRequired),
            )
          } catch { }
        }}
        columns={designationMasterColumns}
        selectedKeys={selectedDesignationMasterColumnKeys}
        requiredKeys={requiredDesignationMasterColumnKeys}
        title="Customize Table Columns"
      />

      <DesignationMasterFilterModal
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
        onConfirm={handleDeleteDesignationMaster}
        loading={isLoading}
        pageName='designation'
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
  )
}

export default DesignationMaster
