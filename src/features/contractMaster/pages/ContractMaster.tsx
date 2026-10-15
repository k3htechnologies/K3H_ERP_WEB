import { useCallback, useMemo } from "react";

import { Loader } from "@/core/utils/loader"
import { useContractMaster } from "@/features/contractMaster/hooks/useContractMaster"
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { ContractMasterTable } from "@/features/contractMaster/components/ContractMasterTable";
import { ContractMasterViewModal } from "@/features/contractMaster/components/ContractMasterViewModal";
import { ContractMasterFormModal } from "@/features/contractMaster/components/ContractMasterFormModal";
import { createFormResetHandler } from "@/features/contractMaster/utils/contractMasterUtils";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { ContractMasterFilterModal } from "@/features/contractMaster/components/ContractMasterFilterModal";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import ExportImport from "@/ui/components/ExcelImport/ExcelImport";

export const ContractMaster: React.FC = () => {
  const {
    contractMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewContractMasterDetailsData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingContractMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    showImportModal,
    canAction,
    canExport,
    contractMasterColumns,
    visibleContractMasterColumns,
    selectedContractMasterColumnKeys,
    requiredContractMasterColumnKeys,
    isShowCustomizeContractMasterColumnsModal,

    setSearchTerm,
    setIsViewModalOpen,
    setViewContractMasterDetailsData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingContractMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteContractMasterDetailsData,
    setIsShowCustomizeContractMasterColumnsModal,
    setShowImportModal,
    setSelectedContractMasterColumnKeys,

    handlePageChange,
    handleSortColumn,
    handleViewContractDetails,
    handleEditContractMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddContractModal,
    handleAddUpdateContractMaster,
    handleDeleteContractMaster,
    handleExportContractExcel,
    handleExportContractPdf,
    handleDownloadExcelSampleContractMaster,
    uploadExcel,
    debouncedSearch,
    clearsearchContracts,
  } = useContractMaster();

  const contractlListForTable = useMemo(() => contractMasterList, [contractMasterList]);

  const contractMasterPaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  );

  const handleOpenFilter = useCallback(() => {
    setTempFilters(filters);
    setShowFilterPopup(true);
  }, [filters, setTempFilters, setShowFilterPopup]);

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewContractMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewContractMasterDetailsData]);

  const handleFormReset = useCallback(
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingContractMasterData, setFormData, setErrors),
    [setIsAddUpdateModalOpen, setEditingContractMasterData, setFormData, setErrors]
  );

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteContractMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteContractMasterDetailsData]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Contract Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchContracts}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeContractMasterColumnsModal(true)}
        // ADD
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddContractModal}
        // IMPORT
        isShowImportButton={canAction}
        onUploadExcel={() => setShowImportModal(true)}
        onDownloadSampleExcel={handleDownloadExcelSampleContractMaster}
        // EXPORT
        isShowExportButton={canExport && contractlListForTable.length > 0}
        onExportExcel={handleExportContractExcel}
        onExportPdf={handleExportContractPdf}
        exportLoading={isLoading}
      />

      <ContractMasterTable
        data={contractlListForTable}
        columns={visibleContractMasterColumns}
        pagination={contractMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewContractDetails}
        onEdit={handleEditContractMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <ContractMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewContractMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditContractMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <ContractMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateContractMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingContractMasterData}
        loading={isLoading}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeContractMasterColumnsModal}
        onClose={() => setIsShowCustomizeContractMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredContractMasterColumnKeys]),
          )
          setSelectedContractMasterColumnKeys(withRequired)
          try {
            LocalStorageHelper.storeContractMasterTableColumns(
              JSON.stringify(withRequired),
            )
          } catch { }
        }}
        columns={contractMasterColumns}
        selectedKeys={selectedContractMasterColumnKeys}
        requiredKeys={requiredContractMasterColumnKeys}
        title="Customize Table Columns"
      />

      <ContractMasterFilterModal
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
        onConfirm={handleDeleteContractMaster}
        loading={isLoading}
        pageName='contract'
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