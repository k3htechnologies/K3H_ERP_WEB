import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useSubMaterialMaster } from '@/features/subMaterialMaster/hooks/useSubMaterialMaster';
import {
  SubMaterialMasterTable,
  SubMaterialMasterViewModal,
  SubMaterialMasterFormModal,
  SubMaterialMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/subMaterialMaster/utils/subMaterialMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const SubMaterialMaster: React.FC = () => {

  const {
    // State
    subMaterialMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewSubMaterialMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingSubMaterialMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    showImportModal,
    canAction,
    canExport,
    subMaterialMasterColumns,
    visibleSubMaterialMasterColumns,
    selectedSubMaterialMasterColumnKeys,
    requiredSubMaterialMasterColumnKeys,
    isShowCustomizeSubMaterialMasterColumnsModal,
    dropdownLabels,
    dropdownResetKey,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewSubMaterialMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingSubMaterialMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteSubMaterialMasterDetailsData,
    setIsShowCustomizeSubMaterialMasterColumnsModal,
    setShowImportModal,
    setSelectedSubMaterialMasterColumnKeys,
    setDropdownLabels,
    setDropdownResetKey,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewSubMaterialDetails,
    handleEditSubMaterialMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddSubMaterialModal,
    handleAddUpdateSubMaterialMaster,
    handleDeleteSubMaterialMaster,
    handleExportSubMaterialExcel,
    handleExportSubMaterialPdf,
    handleDownloadExcelSampleSubMaterialMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchSubMaterials,
  } = useSubMaterialMaster();

  const subMaterialListForTable = useMemo(() => subMaterialMasterList, [subMaterialMasterList]);

  const subMaterialMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingSubMaterialMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey),
    [setIsAddUpdateModalOpen, setEditingSubMaterialMasterData, setFormData, setErrors, setDropdownLabels, setDropdownResetKey]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewSubMaterialMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewSubMaterialMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteSubMaterialMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteSubMaterialMasterDetailsData]);

  const handleOpenFilter = useCallback(() => {
    setTempFilters(filters);
    setShowFilterPopup(true);
  }, [filters, setTempFilters, setShowFilterPopup]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Sub Material Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchSubMaterials}
        isShowFilterButton={true}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeSubMaterialMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddSubMaterialModal}
        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleSubMaterialMaster}
        // EXPORT
        isShowExportButton={canExport && subMaterialListForTable.length > 0}
        onExportExcel={handleExportSubMaterialExcel}
        onExportPdf={handleExportSubMaterialPdf}
        exportLoading={isLoading}
      />

      <SubMaterialMasterTable
        data={subMaterialListForTable}
        columns={visibleSubMaterialMasterColumns}
        pagination={subMaterialMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewSubMaterialDetails}
        onEdit={handleEditSubMaterialMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <SubMaterialMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewSubMaterialMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditSubMaterialMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <SubMaterialMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateSubMaterialMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingSubMaterialMasterData}
        loading={isLoading}
        dropdownLabels={dropdownLabels}
        dropdownResetKey={dropdownResetKey}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeSubMaterialMasterColumnsModal}
        onClose={() => setIsShowCustomizeSubMaterialMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredSubMaterialMasterColumnKeys]),
          )
          setSelectedSubMaterialMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeSubMaterialMasterTableColumns(
              JSON.stringify(withRequired),
            )
          } catch { }
        }}
        columns={subMaterialMasterColumns}
        selectedKeys={selectedSubMaterialMasterColumnKeys}
        requiredKeys={requiredSubMaterialMasterColumnKeys}
        title="Customize Table Columns"
      />

      <SubMaterialMasterFilterModal
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
        onConfirm={handleDeleteSubMaterialMaster}
        loading={isLoading}
        pageName='subMaterial'
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

export default SubMaterialMaster
