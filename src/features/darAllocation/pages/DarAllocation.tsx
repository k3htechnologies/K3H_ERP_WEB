import { Loader } from "@/core/utils/loader"
import { useDarAllocations } from "../hooks/useDarAllocations";
import { DarAllocationTable } from "../components/DarAllocationTable";
import { useCallback, useMemo } from "react";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { DarAllocationFormModal } from "../components/DarAllocationFormModal";
import { createFormResetHandler } from "@/features/darAllocation/utils/darAllocationUtils";
import { DarAllocationViewModal } from "../components/DarAllocationViewModal";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";


export const DarAllocation: React.FC = () => {

    const {
        // state
        isLoading,
        errors,
        loadingMessage,
        darAllocationColumns,
        darAllocationList,
        pagination,
        canAction,
        canExport,
        isAddUpdateModalOpen,
        formData,
        editingDarAllocationData,
        villageDropdown,
        dropdownResetKey,
        isViewModalOpen,
        viewDarAllocationsDetailsData,
        isConfirmationDialogBoxOpen,
        searchTerm,
        debouncedSearch,
        clearSearchDarAllocations,
        fetchEmployeeDropdown,
        selectedEmployeeDetails,
        handleEmployeeSelected,


        // Setter
        setIsAddUpdateModalOpen,
        setEditingDarAllocationData,
        setFormData,
        setErrors,
        setVillageValue,
        setDropdownResetKey,
        setIsViewModalOpen,
        setViewDarAllocationsDetailsData,
        setIsConfirmationDialogBoxOpen,
        setDeleteDarAllocationDetailsData,
        setSearchTerm,
        sortInfo,

        // Actions
        handlePageChange,
        handleSortColumn,
        handleAddDarAllocationModal,
        handleAddUpdateDarAllocation,
        handleFieldChange,
        handleEditDarAllocationDetails,
        handleConfirmationDialogBoxOpen,
        handleViewDarAllocationDetails,
        handleDeleteDarAllocation,
        handleExportDarAllocationExcel,
        handleExportDarAllocationPdf,

    } = useDarAllocations();

    const darAllocationListForTable = useMemo(
        () => darAllocationList,
        [darAllocationList]
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

    const handleFormReset = useCallback(

        createFormResetHandler(setIsAddUpdateModalOpen, setEditingDarAllocationData, setFormData, setErrors, setVillageValue, setDropdownResetKey),

        [setIsAddUpdateModalOpen, setEditingDarAllocationData, setFormData, setErrors, setVillageValue, setDropdownResetKey]

    );

    const handleDeleteDialogClose = useCallback(() => {

        setIsConfirmationDialogBoxOpen(false);

        setDeleteDarAllocationDetailsData(null);

    }, [setIsConfirmationDialogBoxOpen, setDeleteDarAllocationDetailsData]);

    const handleViewModalClose = useCallback(() => {

        setIsViewModalOpen(false);

        setViewDarAllocationsDetailsData(null);

    }, [setIsViewModalOpen, setViewDarAllocationsDetailsData]);


    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Employee Name"
                onSearchChange={(v) => {
                    setSearchTerm(v)
                    debouncedSearch(v)
                }}
                onClearSearch={clearSearchDarAllocations}
                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddDarAllocationModal}
                // EXPORT
                isShowExportButton={canExport && darAllocationListForTable.length > 0}
                onExportExcel={handleExportDarAllocationExcel}
                onExportPdf={handleExportDarAllocationPdf}
                exportLoading={isLoading}

            />

            <DarAllocationTable
                data={darAllocationListForTable}
                columns={darAllocationColumns}
                sortInfo={sortInfo}
                pagination={otherChargesPaginationInfo}
                onSort={handleSortColumn}
                onView={handleViewDarAllocationDetails}
                onDelete={handleConfirmationDialogBoxOpen}
                loading={isLoading}
                canAction={canAction}
            />

            <DarAllocationFormModal
                isOpen={isAddUpdateModalOpen}
                onClose={handleFormReset}
                onCancel={handleFormReset}
                onSubmit={handleAddUpdateDarAllocation}
                formData={formData}
                onFieldChange={handleFieldChange}
                errors={errors}
                editingData={editingDarAllocationData}
                loading={isLoading}
                villageDropdown={villageDropdown}
                dropdownResetKey={dropdownResetKey}
                fetchEmployeeDropdown={fetchEmployeeDropdown}
                employeeDetails={selectedEmployeeDetails}
                onEmployeeSelected={handleEmployeeSelected}
            />

            <DarAllocationViewModal
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                data={viewDarAllocationsDetailsData}
                canAction={canAction}
                onEdit={handleEditDarAllocationDetails}
                onDelete={handleConfirmationDialogBoxOpen}
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteDarAllocation}
                loading={isLoading}
                pageName='DAR Allocation'
            />


        </div>
    )
}