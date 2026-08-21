import { Loader } from "@/core/utils/loader"
import { useGatePass } from "../hooks/useGatePass";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useCallback, useMemo } from "react";
import { GatePassTable } from "../components/GatePassTable";
import { GatePassFormModal } from "../components/GatePassFormModal";
import { createFormResetHandler } from "../utils/gatePassUtils";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { GatePassViewModal } from "../components/GatePassViewModal";
import { GatePassFilterModal } from "../components/GatePassFilterModal";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";

export const GatePass: React.FC = () => {
    const {
        // States
        isLoading,
        loadingMessage,
        searchTerm,
        debouncedSearch,
        filters,
        canAction,
        canExport,
        gatePassList,
        visibleGatePassColumns,
        pagination,
        sortInfo,
        lastUpdatedRow,
        isAddUpdateModalOpen,
        formData,
        errors,
        editingGatePassData,
        isConfirmationDialogBoxOpen,
        isViewModalOpen,
        viewGatePassDetailsData,
        showFilterPopup,
        tempFilters,
        requiredGatePassColumnKeys,
        selectedGatePassColumnKeys,
        isShowCustomizeGatePassColumnsModal,
        gatePassColumns,
        applyFilters,
        clearFilters,
        clearSearchGatePass,


        // Setters
        setSearchTerm,
        setIsAddUpdateModalOpen,
        setEditingGatePassData,
        setFormData,
        setErrors,
        setIsConfirmationDialogBoxOpen,
        setDeleteGatePassDetailsData,
        setIsViewModalOpen,
        setViewGatePassDetailsData,
        setTempFilters,
        setShowFilterPopup,
        setSelectedGatePassColumnKeys,
        setIsShowCustomizeGatePassColumnsModal,

        // Actions
        handleAddGatePassModal,
        handleFilterChange,
        handleExportGatePassExcel,
        handleExportGatePassPdf,
        handlePageChange,
        handleSortColumn,
        handleViewGatePassDetails,
        handleAddUpdateGatePass,
        handleFieldChange,
        handleDeleteGatePass,
        handleConfirmationDialogBoxOpen,
        handleEditGatePass,
    } = useGatePass();

    const gatePassListForTable = useMemo(() => gatePassList, [gatePassList]);

    const gatePassPaginationInfo = useMemo(
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

        createFormResetHandler(setIsAddUpdateModalOpen, setEditingGatePassData, setFormData, setErrors),

        [setIsAddUpdateModalOpen, setEditingGatePassData, setFormData, setErrors]

    );

    const handleViewModalClose = useCallback(() => {
        setIsViewModalOpen(false);
        setViewGatePassDetailsData(null);
    }, [setIsViewModalOpen, setViewGatePassDetailsData]);


    const handleDeleteDialogClose = useCallback(() => {

        setIsConfirmationDialogBoxOpen(false);

        setDeleteGatePassDetailsData(null);

    }, [setIsConfirmationDialogBoxOpen, setDeleteGatePassDetailsData]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Full Name"
                onSearchChange={(v) => {
                    setSearchTerm(v)
                    debouncedSearch(v)
                }}
                onClearSearch={clearSearchGatePass}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeGatePassColumnsModal(true)}
                // FILTER
                isShowFilterButton
                filters={filters}
                onOpenFilter={() => setShowFilterPopup(true)}
                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddGatePassModal}
                // EXPORT
                isShowExportButton={canExport && gatePassListForTable.length > 0}
                onExportExcel={handleExportGatePassExcel}
                onExportPdf={handleExportGatePassPdf}
                exportLoading={isLoading}
            />

            <div className="mt-5">
                <GatePassTable
                    data={gatePassListForTable}
                    columns={visibleGatePassColumns}
                    pagination={gatePassPaginationInfo}
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                    onView={handleViewGatePassDetails}
                    onEdit={handleEditGatePass}
                    onDelete={handleConfirmationDialogBoxOpen}
                    lastUpdatedRow={lastUpdatedRow}
                    canAction={canAction}
                    loading={isLoading}
                />
            </div>

            <GatePassViewModal
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                data={viewGatePassDetailsData}
                canAction={canAction}
                onEdit={handleEditGatePass}
                onDelete={handleConfirmationDialogBoxOpen}
            />

            <GatePassFormModal
                isOpen={isAddUpdateModalOpen}
                onClose={handleFormReset}
                onCancel={handleFormReset}
                onSubmit={handleAddUpdateGatePass}
                formData={formData}
                onFieldChange={handleFieldChange}
                errors={errors}
                editingData={editingGatePassData}
                loading={isLoading}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeGatePassColumnsModal}
                onClose={() => setIsShowCustomizeGatePassColumnsModal(false)}
                onApply={(keys) => {

                    const withRequired = Array.from(new Set([...keys, ...requiredGatePassColumnKeys]),)

                    setSelectedGatePassColumnKeys(withRequired)

                    try {
                        LocalStorageHelper.storeGatePassTableColumns(JSON.stringify(withRequired),)

                    }
                    catch {
                    }
                }}
                columns={gatePassColumns}
                selectedKeys={selectedGatePassColumnKeys}
                requiredKeys={requiredGatePassColumnKeys}
                title="Customize Table Columns"
            />

            <GatePassFilterModal
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
                onConfirm={handleDeleteGatePass}
                loading={isLoading}
                pageName='Gate Pass'
            />
        </div>
    )
}