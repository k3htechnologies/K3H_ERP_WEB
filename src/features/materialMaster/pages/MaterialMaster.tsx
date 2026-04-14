import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMaterialMaster } from '@/features/materialMaster/hooks/useMaterialMaster';
import {
  MaterialMasterTable,
  MaterialMasterViewModal,
  MaterialMasterFormModal,
  MaterialMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/materialMaster/utils/materialMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const MaterialMaster: React.FC = () => {

  const {
    // State
    materialMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewMaterialMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingMaterialMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    showImportModal,
    canAction,
    canExport,
    materialMasterColumns,
    visibleMaterialMasterColumns,
    selectedMaterialMasterColumnKeys,
    requiredMaterialMasterColumnKeys,
    isShowCustomizeMaterialMasterColumnsModal,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewMaterialMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingMaterialMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteMaterialMasterDetailsData,
    setIsShowCustomizeMaterialMasterColumnsModal,
    setShowImportModal,
    setSelectedMaterialMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewMaterialDetails,
    handleEditMaterialMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddMaterialModal,
    handleAddUpdateMaterialMaster,
    handleDeleteMaterialMaster,
    handleExportMaterialExcel,
    handleExportMaterialPdf,
    handleDownloadExcelSampleMaterialMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchMaterials,
  } = useMaterialMaster();

  const materialListForTable = useMemo(() => materialMasterList, [materialMasterList]);

  const materialMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingMaterialMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingMaterialMasterData, setFormData, setErrors]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewMaterialMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewMaterialMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteMaterialMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteMaterialMasterDetailsData]);

  const handleOpenFilter = useCallback(() => {
    setTempFilters(filters);
    setShowFilterPopup(true);
  }, [filters, setTempFilters, setShowFilterPopup]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Material Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchMaterials}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeMaterialMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddMaterialModal}
        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleMaterialMaster}
        // EXPORT
        isShowExportButton={canExport && materialListForTable.length > 0}
        onExportExcel={handleExportMaterialExcel}
        onExportPdf={handleExportMaterialPdf}
        exportLoading={isLoading}
      />

      <MaterialMasterTable
        data={materialListForTable}
        columns={visibleMaterialMasterColumns}
        pagination={materialMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewMaterialDetails}
        onEdit={handleEditMaterialMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <MaterialMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewMaterialMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditMaterialMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <MaterialMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateMaterialMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingMaterialMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeMaterialMasterColumnsModal}
        onClose={() => setIsShowCustomizeMaterialMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredMaterialMasterColumnKeys]),
          )
          setSelectedMaterialMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeMaterialMasterTableColumns(
              JSON.stringify(withRequired),
            )
          } catch { }
        }}
        columns={materialMasterColumns}
        selectedKeys={selectedMaterialMasterColumnKeys}
        requiredKeys={requiredMaterialMasterColumnKeys}
        title="Customize Table Columns"
      />

      <MaterialMasterFilterModal
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
        onConfirm={handleDeleteMaterialMaster}
        loading={isLoading}
        pageName='material'
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

export default MaterialMaster
