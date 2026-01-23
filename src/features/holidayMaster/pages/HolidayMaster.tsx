import React, { useMemo, useCallback } from 'react';
import { Loader } from '@/core/utils/loader';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useHolidayMaster } from '@/features/holidayMaster/hooks/useHolidayMaster';
import {
  HolidayMasterTable,
  HolidayMasterViewModal,
  HolidayMasterFormModal
} from '../components';
import { createFormResetHandler } from '@/features/holidayMaster/utils/holidayMasterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const HolidayMaster: React.FC = () => {

  const {
    // State
    holidayMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewHolidayMasterDetailsData,
    isViewModalOpen,
    errors,
    editingHolidayMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    canAction,
    canExport,
    holidayMasterColumns,
    holidayFiles,
    removedHolidayUrls,
    holidayURL,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewHolidayMasterDetailsData,
    setErrors,
    setEditingHolidayMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteHolidayMasterDetailsData,
    setHolidayFiles,
    setRemovedHolidayUrls,
    setHolidayURL,

    // Actions
    handlePageChange,
    handleSortColumn,
    handleViewHolidayDetails,
    handleEditHolidayMaster,
    handleConfirmationDialogBoxOpen,
    handleFieldChange,
    handleAddHolidayMasterModal,
    handleAddUpdateHolidayMaster,
    handleDeleteHolidayMaster,
    handleExportHolidayExcel,
    handleExportHolidayPdf,
    debouncedSearch,
    clearsearchHolidays,
  } = useHolidayMaster();

  const holidayListForTable = useMemo(() => holidayMasterList, [holidayMasterList]);

  const holidayMasterPaginationInfo = useMemo(
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
    createFormResetHandler(setIsAddUpdateModalOpen, setEditingHolidayMasterData, setFormData, setErrors, setHolidayFiles, setHolidayURL, setRemovedHolidayUrls),
    [setIsAddUpdateModalOpen, setEditingHolidayMasterData, setFormData, setErrors, setHolidayFiles, setHolidayURL, setRemovedHolidayUrls]
  );

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewHolidayMasterDetailsData(null);
  }, [setIsViewModalOpen, setViewHolidayMasterDetailsData]);

  const handleDeleteDialogClose = useCallback(() => {
    setIsConfirmationDialogBoxOpen(false);
    setDeleteHolidayMasterDetailsData(null);
  }, [setIsConfirmationDialogBoxOpen, setDeleteHolidayMasterDetailsData]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Holiday Name"
        onSearchChange={(v) => {
          setSearchTerm(v)
          debouncedSearch(v)
        }}
        onClearSearch={clearsearchHolidays}
        isShowFilterButton={false}
        isShowCustomizeButton={false}
        // ADD
        isShowAddButton={canAction}
        addTitle='Add'
        onAdd={handleAddHolidayMasterModal}
        // IMPORT
        isShowImportButton={false}
        // EXPORT
        isShowExportButton={canExport && holidayListForTable.length > 0}
        onExportExcel={handleExportHolidayExcel}
        onExportPdf={handleExportHolidayPdf}
        exportLoading={isLoading}
      />

      <HolidayMasterTable
        data={holidayListForTable}
        columns={holidayMasterColumns}
        pagination={holidayMasterPaginationInfo}
        sortInfo={sortInfo}
        onSort={handleSortColumn}
        onView={handleViewHolidayDetails}
        onEdit={handleEditHolidayMaster}
        onDelete={handleConfirmationDialogBoxOpen}
        canAction={canAction}
        loading={isLoading}
      />

      <HolidayMasterViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        data={viewHolidayMasterDetailsData}
        canAction={canAction}
        onEdit={handleEditHolidayMaster}
        onDelete={handleConfirmationDialogBoxOpen}
      />

      <HolidayMasterFormModal
        isOpen={isAddUpdateModalOpen}
        onClose={handleFormReset}
        onCancel={handleFormReset}
        onSubmit={handleAddUpdateHolidayMaster}
        formData={formData}
        onFieldChange={handleFieldChange}
        errors={errors}
        editingData={editingHolidayMasterData}
        loading={isLoading}
        holidayFiles={holidayFiles}
        setHolidayFiles={setHolidayFiles}
        holidayURL={holidayURL}
        removedHolidayUrls={removedHolidayUrls}
        setRemovedHolidayUrls={setRemovedHolidayUrls}
      />

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteHolidayMaster}
        loading={isLoading}
        pageName='holiday'
      />
    </div>

  )
}

export default HolidayMaster