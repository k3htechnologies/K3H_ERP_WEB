import React, { useCallback, useMemo } from "react";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { usePaymentScheduleMaster } from "@/features/paymentScheduleMaster/hooks/usePaymentScheduleMaster";
import {
  PaymentScheduleMasterTable,
  PaymentScheduleMasterFormModal,
  PaymentScheduleMasterViewModal,
  PaymentScheduleMasterFilterModal
} from "@/features/paymentScheduleMaster/components";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";

export const PaymentScheduleMaster: React.FC = () => {
  const {
    // State
    PaymentScheduleMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewPaymentScheduleMasterData,
    isViewModalOpen,
    showFilterPopup,
    filters,
    tempFilters,
    errors,
    editingPaymentScheduleMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    PaymentScheduleMasterColumns,
    isShowCustomizePaymentScheduleMasterColumnsModal,
    selectedPaymentScheduleMasterColumnKeys,
    requiredPaymentScheduleMasterColumnKeys,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewPaymentScheduleMasterData,
    setShowFilterPopup,
    setTempFilters,
    setErrors,
    setEditingPaymentScheduleMasterData,
    setIsAddUpdateModalOpen,
    setIsConfirmationDialogBoxOpen,
    setDeletePaymentScheduleMasterData,
    setIsShowCustomizePaymentScheduleMasterColumnsModal,
    setSelectedPaymentScheduleMasterColumnKeys,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewPaymentScheduleMasterDetails,
    handleEditPaymentScheduleMaster,
    handleConfirmationDialogBoxOpen,
    applyFilters,
    clearFilters,
    handleFilterChange,
    handleFieldChange,
    handleAddPaymentScheduleMasterModal,
    handleAddUpdatePaymentScheduleMaster,
    handleDeletePaymentScheduleMaster,
    handleExportPaymentScheduleMasterExcel,
    handleExportPaymentScheduleMasterPdf,
    debouncedSearch,
    clearSearchPaymentScheduleMaster
  } = usePaymentScheduleMaster();

  const PaymentScheduleMasterListForTable = useMemo(
    () => PaymentScheduleMasterList,
    [PaymentScheduleMasterList]
  );

  const PaymentScheduleMasterPaginationInfo = useMemo(
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
    setEditingPaymentScheduleMasterData(null);
    setErrors({});
  }, [setIsAddUpdateModalOpen, setEditingPaymentScheduleMasterData, setErrors]);

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewPaymentScheduleMasterData(null);
  }, [setIsViewModalOpen, setViewPaymentScheduleMasterData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeletePaymentScheduleMasterData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeletePaymentScheduleMasterData]);

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
        searchPlaceholder="Search By Type"
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchPaymentScheduleMaster}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={handleOpenFilter}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizePaymentScheduleMasterColumnsModal(true)}

        // ADD
        isShowAddButton={true}
        addTitle="Add"
        onAdd={handleAddPaymentScheduleMasterModal}
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && PaymentScheduleMasterListForTable.length > 0}
        onExportExcel={handleExportPaymentScheduleMasterExcel}
        onExportPdf={handleExportPaymentScheduleMasterPdf}
        exportLoading={isLoading}
      />

      <PaymentScheduleMasterTable
        data={PaymentScheduleMasterListForTable}
        columns={PaymentScheduleMasterColumns}
        pagination={PaymentScheduleMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewPaymentScheduleMasterDetails}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <PaymentScheduleMasterFilterModal
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
        isOpen={isShowCustomizePaymentScheduleMasterColumnsModal}
        onClose={() => setIsShowCustomizePaymentScheduleMasterColumnsModal(false)}
        onApply={(keys) => {

          const withRequired = Array.from(new Set([...keys, ...requiredPaymentScheduleMasterColumnKeys]),)

          setSelectedPaymentScheduleMasterColumnKeys(withRequired)

          try {

            LocalStorageHelper.storePaymentScheduleMasterTableColumns(JSON.stringify(withRequired),)

          }
          catch {

          }
        }}
        columns={PaymentScheduleMasterColumns}
        selectedKeys={selectedPaymentScheduleMasterColumnKeys}
        requiredKeys={requiredPaymentScheduleMasterColumnKeys}
        title="Customize Table Columns"
      />

      <PaymentScheduleMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdatePaymentScheduleMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingPaymentScheduleMasterData}
        loading={isLoading}
      />

      <PaymentScheduleMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewPaymentScheduleMasterData}
        canAction={canAction}
        onEdit={handleEditPaymentScheduleMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeletePaymentScheduleMaster}
        loading={isLoading}
        pageName="Payment Schedule Master"
      />
    </div>
  );
};

export default PaymentScheduleMaster;
