import { PaymentScheduleSchemeMasterViewModal } from '@/features/paymentScheduleSchemeMaster/components/PaymentScheduleSchemeMasterViewModal';
import { PaymentScheduleSchemeMasterTable } from '@/features/paymentScheduleSchemeMaster/components/PaymentScheduleSchemeMasterTable';
import { usePaymentScheduleSchemeMaster } from '@/features/paymentScheduleSchemeMaster/hooks/usePaymentScheduleSchemeMaster';
import React, { useMemo, useCallback } from 'react';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { PaymentScheduleSchemeMasterFormModal } from '@/features/paymentScheduleSchemeMaster/components/PaymentScheduleSchemeMasterFormModal';

export const PaymentScheduleSchemeMaster: React.FC = () => {

    const {
        //State
        paymentScheduleSchemeMasterList,
        paymentScheduleSchemeMasterColumns,
        pagination,
        handlePageChange,
        sortInfo,
        searchTerm,
        handleSortColumn,
        isLoading,
        canAction,
        visiblePaymentScheduleSchemeMasterColumns,
        selectedPaymentScheduleSchemeMasterColumnKeys,
        requiredPaymentScheduleSchemeMasterColumnKeys,
        isShowCustomizePaymentScheduleSchemeMasterColumnsModal,
        setIsShowCustomizePaymentScheduleSchemeMasterColumnsModal,
        setSelectedPaymentScheduleSchemeMasterColumnKeys,
        isViewModalOpen,
        handleViewPaymentScheduleSchemeMasterDetails,
        viewPaymentScheduleSchemeMasterDetailsData,
        setIsViewModalOpen,
        setViewPaymentScheduleSchemeMasterDetailsData,
        isConfirmationDialogBoxOpen,
        setIsConfirmationDialogBoxOpen,
        setDeletePaymentScheduleSchemeMasterDetailsData,
        handleConfirmationDialogBoxOpen,
        handleDeletePaymentScheduleSchemeMaster,
        setSearchTerm,
        debouncedSearch,
        clearsearchPaymentScheduleSchemeMaster,
        handleExportPaymentScheduleSchemeMasterExcel,
        handleExportPaymentScheduleSchemeMasterPdf,
        handleAddPaymentScheduleSchemeMasterModal,
        handleEditPaymentScheduleSchemeMasterDetails,
        buildingOptions,
        wingOptions,
        handleBuildingChange,
        isAddUpdateModalOpen,
        setIsAddUpdateModalOpen,
        formData,
        handleFieldChange,
        errors,
        editingPaymentScheduleSchemeMasterData,
        handleAddEditPaymentScheduleSchemeMaster

    } = usePaymentScheduleSchemeMaster();

    const paymentScheduleSchemeMasterListForTable = useMemo(() => paymentScheduleSchemeMasterList, [paymentScheduleSchemeMasterList]);


    const paymentScheduleSchemeMasterPaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
    );

    const handleViewModalClose = useCallback(() => {

        setIsViewModalOpen(false);

        setViewPaymentScheduleSchemeMasterDetailsData(null);

    }, [setIsViewModalOpen, setViewPaymentScheduleSchemeMasterDetailsData]);

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeletePaymentScheduleSchemeMasterDetailsData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeletePaymentScheduleSchemeMasterDetailsData]);


    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Scheme"
                onSearchChange={(v) => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearsearchPaymentScheduleSchemeMaster}
                isShowFilterButton={false}
                isShowCustomizeButton={true}
                onCustomize={() => setIsShowCustomizePaymentScheduleSchemeMasterColumnsModal(true)}
                isShowImportButton={false}
                isShowExportButton={paymentScheduleSchemeMasterListForTable?.length > 0}
                onExportExcel={handleExportPaymentScheduleSchemeMasterExcel}
                onExportPdf={handleExportPaymentScheduleSchemeMasterPdf}
                exportLoading={isLoading}
                // ADD
                isShowAddButton={true}
                addTitle="Add"
                onAdd={handleAddPaymentScheduleSchemeMasterModal}
            />

            <PaymentScheduleSchemeMasterTable
                data={paymentScheduleSchemeMasterListForTable}
                columns={visiblePaymentScheduleSchemeMasterColumns}
                pagination={paymentScheduleSchemeMasterPaginationInfo}
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                canAction={canAction}
                loading={isLoading}
                onView={handleViewPaymentScheduleSchemeMasterDetails}
                onEdit={() => { }}
                onDelete={handleConfirmationDialogBoxOpen}
            />

            <PaymentScheduleSchemeMasterViewModal
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                data={viewPaymentScheduleSchemeMasterDetailsData}
                canAction={canAction}
                onEdit={() => viewPaymentScheduleSchemeMasterDetailsData && handleEditPaymentScheduleSchemeMasterDetails(viewPaymentScheduleSchemeMasterDetailsData)}
                onDelete={handleConfirmationDialogBoxOpen}
            />

            <PaymentScheduleSchemeMasterFormModal
                isOpen={isAddUpdateModalOpen}
                onClose={() => setIsAddUpdateModalOpen(false)}
                onCancel={() => setIsAddUpdateModalOpen(false)}
                onSubmit={handleAddEditPaymentScheduleSchemeMaster}
                formData={formData}
                onFieldChange={handleFieldChange}
                errors={errors}
                editingData={editingPaymentScheduleSchemeMasterData}
                loading={isLoading}
                buildingOptions={buildingOptions}
                wingOptions={wingOptions}
                handleBuildingChange={handleBuildingChange}
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeletePaymentScheduleSchemeMaster}
                loading={isLoading}
                pageName='Payment Schedule Scheme'
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizePaymentScheduleSchemeMasterColumnsModal}
                onClose={() => setIsShowCustomizePaymentScheduleSchemeMasterColumnsModal(false)}
                onApply={(keys) => {
                    const withRequired = Array.from(new Set([...keys, ...requiredPaymentScheduleSchemeMasterColumnKeys]));
                    setSelectedPaymentScheduleSchemeMasterColumnKeys(withRequired);
                    try {
                        LocalStorageHelper.storePaymentScheduleSchemeMasterTableColumns(JSON.stringify(withRequired));
                    } catch { }
                }}
                columns={paymentScheduleSchemeMasterColumns}
                selectedKeys={selectedPaymentScheduleSchemeMasterColumnKeys}
                requiredKeys={requiredPaymentScheduleSchemeMasterColumnKeys}
                title="Customize Table Columns"
            />

        </div>
    );
};

export default PaymentScheduleSchemeMaster;