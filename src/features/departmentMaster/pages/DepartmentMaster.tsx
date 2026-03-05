import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ExportImport from '@/ui/components/ExcelImport/ExcelImport';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useDepartmentMaster } from '@/features/departmentMaster/hooks/useDepartmentMaster';
import {
  DepartmentMasterTable,
  DepartmentMasterViewModal,
  DepartmentMasterFormModal,
  DepartmentMasterFilterModal
} from '../components';
import { createFormResetHandler } from '@/features/departmentMaster/utils/departmentMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const DepartmentMaster: React.FC = () => {

  const {
    // State
    departmentMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewDepartmentMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingDepartmentMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    showImportModal,
    canAction,
    canExport,
    departmentMasterColumns,
    visibleDepartmentMasterColumns,
    selectedDepartmentMasterColumnKeys,
    requiredDepartmentMasterColumnKeys,
    isShowCustomizeDepartmentMasterColumnsModal,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewDepartmentMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingDepartmentMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteDepartmentMasterDetailsData,
    setIsShowCustomizeDepartmentMasterColumnsModal,
    setShowImportModal,
    setSelectedDepartmentMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewDepartmentDetails,
    handleEditDepartmentMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddDepartmentModal,
    handleAddUpdateDepartmentMaster,
    handleDeleteDepartmentMaster,
    handleExportDepartmentExcel,
    handleExportDepartmentPdf,
    handleDownloadExcelSampleDepartmentMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchDepartments,
  } = useDepartmentMaster();

  const departmentListForTable = useMemo(() => departmentMasterList, [departmentMasterList]);

  const departmentMasterPaginationInfo = useMemo(
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

    createFormResetHandler(setIsAddUpdateModalOpen, setEditingDepartmentMasterData, setFormData, setErrors),

    [setIsAddUpdateModalOpen, setEditingDepartmentMasterData, setFormData, setErrors]

  );

  const handleViewModalClose = useCallback(() => {

    setIsViewModalOpen(false);  

    setViewDepartmentMasterDetailsData(null);

  }, [setIsViewModalOpen, setViewDepartmentMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {

    setIsConfirmationDialogBoxOpen(false);

    setDeleteDepartmentMasterDetailsData(null);

  }, [setIsConfirmationDialogBoxOpen, setDeleteDepartmentMasterDetailsData]);

  const handleOpenFilter = useCallback(() => {
    setTempFilters(filters);
    setShowFilterPopup(true);
  }, [filters, setTempFilters, setShowFilterPopup]);

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>


      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Department Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchDepartments}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeDepartmentMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddDepartmentModal}
        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleDepartmentMaster}
        // EXPORT
        isShowExportButton={canExport && departmentListForTable.length > 0}
        onExportExcel={handleExportDepartmentExcel}
        onExportPdf={handleExportDepartmentPdf}
        exportLoading={isLoading}
      />

      <DepartmentMasterTable
        data={departmentListForTable}
        columns={visibleDepartmentMasterColumns}
        pagination={departmentMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewDepartmentDetails}
        onEdit={handleEditDepartmentMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <DepartmentMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewDepartmentMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditDepartmentMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <DepartmentMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateDepartmentMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingDepartmentMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeDepartmentMasterColumnsModal}
        onClose={() => setIsShowCustomizeDepartmentMasterColumnsModal(false)}
        onApply={(keys) => {

          const withRequired = Array.from(new Set([...keys, ...requiredDepartmentMasterColumnKeys]),)

          setSelectedDepartmentMasterColumnKeys(withRequired)

          try {

            LocalStorageHelper.storeDepartmentMasterTableColumns(JSON.stringify(withRequired),)

          }
          catch {

          }
        }}
        columns={departmentMasterColumns}
        selectedKeys={selectedDepartmentMasterColumnKeys}
        requiredKeys={requiredDepartmentMasterColumnKeys}
        title="Customize Table Columns"
      />

      <DepartmentMasterFilterModal
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
        onConfirm={handleDeleteDepartmentMaster}
        loading={isLoading}
        pageName='department'
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

export default DepartmentMaster
