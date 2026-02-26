import React, { useCallback, useMemo } from "react";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { useOtherCharges } from "@/features/otherCharges/hooks/useOtherCharges";
import {
  OtherChargesTable,
  OtherChargesFormModal,
  OtherChargesViewModal,
  OtherChargesFilterModal
} from "@/features/otherCharges/components";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";

export const OtherCharges: React.FC = () => {

  const { projectId } = useProject();

  const {
    // State
    otherChargesList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewOtherChargesData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingOtherChargesData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    otherChargesColumns,
    isShowCustomizeOtherChargesColumnsModal,
    selectedOtherChargesColumnKeys,
    requiredOtherChargesColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewOtherChargesData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingOtherChargesData,
    setIsAddUpdateModalOpen,
    setIsConfirmationDialogBoxOpen,
    setDeleteOtherChargesData,
    setIsShowCustomizeOtherChargesColumnsModal,
    setSelectedOtherChargesColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewOtherChargesDetails,
    handleEditOtherCharges,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddOtherChargesModal,
    handleAddUpdateOtherCharges,
    handleDeleteOtherCharges,
    handleExportOtherChargesExcel,
    handleExportOtherChargesPdf,
    debouncedSearch,
    clearSearchOtherCharges
  } = useOtherCharges();

  const otherChargesListForTable = useMemo(
    () => otherChargesList,
    [otherChargesList]
  );

  const otherChargesPaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [
      pagination.currentPage,
      pagination.totalPages,
      pagination.totalRecords,
      pagination.pageSize,
      handlePageChange
    ]
  );

  const handleFormReset = useCallback(() => {
    setIsAddUpdateModalOpen(false);
    setEditingOtherChargesData(null);
    setErrors({});
  }, [setIsAddUpdateModalOpen, setEditingOtherChargesData, setErrors]);

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewOtherChargesData(null);
  }, [setIsViewModalOpen, setViewOtherChargesData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteOtherChargesData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteOtherChargesData]);

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
        searchPlaceholder="Search By Charges"
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchOtherCharges}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeOtherChargesColumnsModal(true)}

        // ADD
        isShowAddButton={canAction && Number(projectId) > 0}
        addTitle="Add"
        onAdd={handleAddOtherChargesModal}
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && otherChargesListForTable.length > 0}
        onExportExcel={handleExportOtherChargesExcel}
        onExportPdf={handleExportOtherChargesPdf}
        exportLoading={isLoading}
      />

      <OtherChargesTable
        data={otherChargesListForTable}
        columns={otherChargesColumns}
        pagination={otherChargesPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewOtherChargesDetails}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <OtherChargesFilterModal
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

      <CustomizeColumnsModal
        isOpen={isShowCustomizeOtherChargesColumnsModal}
        onClose={() => setIsShowCustomizeOtherChargesColumnsModal(false)}
        onApply={(keys) => {

          const withRequired = Array.from(new Set([...keys, ...requiredOtherChargesColumnKeys]),)

          setSelectedOtherChargesColumnKeys(withRequired)

          try {

            LocalStorageHelper.storeOtherChargesTableColumns(JSON.stringify(withRequired),)

          }
          catch {

          }
        }}
        columns={otherChargesColumns}
        selectedKeys={selectedOtherChargesColumnKeys}
        requiredKeys={requiredOtherChargesColumnKeys}
        title="Customize Table Columns"
      />

      <OtherChargesFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateOtherCharges}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingOtherChargesData}
        loading={isLoading}
      />

      <OtherChargesViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewOtherChargesData}
        canAction={canAction}
        onEdit={handleEditOtherCharges}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteOtherCharges}
        loading={isLoading}
        pageName="Other Charges"
      />
    </div>
  );
};

export default OtherCharges;
