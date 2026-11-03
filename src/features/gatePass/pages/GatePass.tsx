import GatePassApprovalModal from '@/features/gatePass/components/GatePassApprovalModal';
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

        isLoading,
        loadingMessage,
        searchTerm,
        debouncedSearch,
        filters,
        canActionGatePass,
        canActionGatePassAdministrativeAccess,
        canExportGatePass,
        canExportGatePassAdministrativeAccess,
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
        isConfirmationDialogBoxOpenforOut,
        isConfirmationDialogBoxOpenforBell,
        isConfirmationDialogBoxOpenforLogin,
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
        employeeDetails,
        photoFiles,
        removedPhotoURLs,
        photoURL,




        setSearchTerm,
        setIsAddUpdateModalOpen,
        setEditingGatePassData,
        setFormData,
        setErrors,
        setIsConfirmationDialogBoxOpen,
        setIsConfirmationDialogBoxOpenforOut,
        setIsConfirmationDialogBoxOpenforBell,
        setIsConfirmationDialogBoxOpenforLogin,
        setDeleteGatePassDetailsData,
        setIsViewModalOpen,
        setViewGatePassDetailsData,
        setTempFilters,
        setShowFilterPopup,
        setSelectedGatePassColumnKeys,
        setIsShowCustomizeGatePassColumnsModal,
        setEmployeeDetails,
        setPhotoFiles,
        setRemovedPhotoURLs,
        setPhotoURL,


        handleLoginGatePass,
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
        handleOutGatePass,
        handleConfirmationDialogBoxOpen,
        handleConfirmationDialogBoxOpenforOut,
        handleConfirmationDialogBoxOpenforBell,
        handleConfirmationDialogBoxOpenforLogin,

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

        createFormResetHandler(setIsAddUpdateModalOpen, setEditingGatePassData, setFormData, setErrors, setPhotoFiles, setPhotoURL, setRemovedPhotoURLs),

        [setIsAddUpdateModalOpen, setEditingGatePassData, setFormData, setErrors, setPhotoFiles, setPhotoURL, setRemovedPhotoURLs]

    );

    const handleViewModalClose = useCallback(() => {
        setIsViewModalOpen(false);
        setViewGatePassDetailsData(null);
    }, [setIsViewModalOpen, setViewGatePassDetailsData]);


    const handleDeleteDialogClose = useCallback(() => {

        setIsConfirmationDialogBoxOpen(false);

        setDeleteGatePassDetailsData(null);

    }, [setIsConfirmationDialogBoxOpen, setDeleteGatePassDetailsData]);

    const handleDeleteDialogCloseforOut = useCallback(() => {

        setIsConfirmationDialogBoxOpenforOut(false);

        setDeleteGatePassDetailsData(null);

    }, [setIsConfirmationDialogBoxOpenforOut, setDeleteGatePassDetailsData]);

    const handleDeleteDialogCloseforLogin = useCallback(() => {
        setIsConfirmationDialogBoxOpenforLogin(false);
        setDeleteGatePassDetailsData(null);
    }, [setIsConfirmationDialogBoxOpenforLogin, setDeleteGatePassDetailsData]);

    const handleDeleteDialogCloseforBell = useCallback(() => {

        setIsConfirmationDialogBoxOpenforBell(false);

        setDeleteGatePassDetailsData(null);

    }, [setIsConfirmationDialogBoxOpenforBell, setDeleteGatePassDetailsData]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Visitor Name"
                onSearchChange={(v) => {
                    setSearchTerm(v)
                    debouncedSearch(v)
                }}
                onClearSearch={clearSearchGatePass}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeGatePassColumnsModal(true)}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => setShowFilterPopup(true)}

                isShowAddButton={canActionGatePass || canActionGatePassAdministrativeAccess}
                addTitle="Add"
                onAdd={handleAddGatePassModal}

                isShowExportButton={(canExportGatePass || canExportGatePassAdministrativeAccess) && gatePassListForTable.length > 0}
                onExportExcel={handleExportGatePassExcel}
                onExportPdf={handleExportGatePassPdf}
                exportLoading={isLoading}
            />


            <GatePassTable
                data={gatePassListForTable}
                columns={visibleGatePassColumns}
                pagination={gatePassPaginationInfo}
                sortInfo={sortInfo}
                onSort={handleSortColumn}
                onView={handleViewGatePassDetails}
                onEdit={handleEditGatePass}
                onDelete={handleConfirmationDialogBoxOpen}
                onLogin={handleConfirmationDialogBoxOpenforLogin}
                onLogout={handleConfirmationDialogBoxOpenforOut}
                onBell={handleConfirmationDialogBoxOpenforBell}
                lastUpdatedRow={lastUpdatedRow}
                canAction={canActionGatePass || canActionGatePassAdministrativeAccess}
                loading={isLoading}
            />


            <GatePassViewModal
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                data={viewGatePassDetailsData}
                canAction={canActionGatePass || canActionGatePassAdministrativeAccess}
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
                employeeDetails={employeeDetails}
                setEmployeeDetails={setEmployeeDetails}
                photoFiles={photoFiles}
                setPhotoFiles={setPhotoFiles}
                photoURL={photoURL}
                removedPhotoUrls={removedPhotoURLs}
                setRemovedPhotoUrls={setRemovedPhotoURLs}
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

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenforOut}
                onClose={handleDeleteDialogCloseforOut}
                onConfirm={() => handleOutGatePass('Out')}
                loading={isLoading}
                pageName='Gate Pass Out'
                title="You are about to mark this Gate Pass Out?"
                message="Marking this Gate Pass Out will confirm that the visitor has exited. Do you want to continue?"
                confirmText="Out"
                variant="generate"
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenforBell}
                onClose={handleDeleteDialogCloseforBell}
                onConfirm={() => handleOutGatePass('Bell')}
                loading={isLoading}
                pageName="Gate Pass Bell"
                title="Notify Appointment Person"
                message="The appointment contact will be notified that their visitor has arrived at reception"
                confirmText="Notify"
                variant="generate"
            />

            <GatePassApprovalModal
                isOpen={isConfirmationDialogBoxOpenforLogin}
                onClose={handleDeleteDialogCloseforLogin}
                onSubmit={handleLoginGatePass}
                loading={isLoading}
            />
        </div>
    )
}