import { Loader } from "@/core/utils/loader";
import { useNoticeSectionMaster } from "@/features/noticeSectionMaster/hooks/useNoticeSectionMaster";
import { NoticeSectionMasterTable } from "@/features/noticeSectionMaster/components/NoticeSectionMasterTable";
import { useCallback, useMemo } from "react";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { NoticeSectionMasterFormModal } from "@/features/noticeSectionMaster/components/NoticeSectionMasterFormModal";
import { createFormResetHandler } from "@/features/noticeSectionMaster/utils/noticeSectionMasterUtils";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { NoticeSectionMasterViewModal } from "@/features/noticeSectionMaster/components/NoticeSectionMasterViewModal";
import { Tabs } from "@/ui/components/Tab/Tab";

export const NoticeSectionMaster: React.FC = () => {

    const {
        // State
        noticeSectionMasterList,
        isLoading,
        loadingMessage,
        visibleNoticeSectionMasterColumns,
        pagination,
        sortInfo,
        canAction,
        lastUpdatedRow,
        searchTerm,
        debouncedSearch,
        canExport,
        formData,
        isShowCustomizeNoticeSectionMasterColumnsModal,
        requiredNoticeSectionMasterMasterColumnKeys,
        noticeSectionMasterColumns,
        selectedNoticeSectionMasterColumnKeys,
        isAddUpdateModalOpen,
        errors,
        editingNoticeSectionMasterData,
        isConfirmationDialogBoxOpen,
        isViewModalOpen,
        viewNoticeSectionMasterDetailsData,
        governementComplianceTabList,
        activeTab,
        filteredNoticeSectionMasterList,

        //Setters
        setSearchTerm,
        setIsShowCustomizeNoticeSectionMasterColumnsModal,
        setSelectedNoticeSectionMasterColumnKeys,
        setIsAddUpdateModalOpen,
        setEditingNoticeSectionMasterData,
        setFormData,
        setErrors,
        setIsConfirmationDialogBoxOpen,
        setDeleteNoticeSectionMasterDetailsData,
        setIsViewModalOpen,
        setViewNoticeSectionMasterDetailsData,
        setActiveTab,

        //Actions
        handleSortColumn,
        handlePageChange,
        handleViewNoticeSectionMasterDetails,
        handleEditNoticeSectionMaster,
        handleConfirmationDialogBoxOpen,
        clearSearchNoticeSectionMaster,
        handleExportNoticeSectionMasterExcel,
        handleExportNoticeSectionMasterPdf,
        handleAddNoticeSectionModal,
        handleAddUpdateNoticeSectionMaster,
        handleFieldChange,
        handleDeleteNoticeSectionMaster,
    } = useNoticeSectionMaster();


    const noticeSectionListForTable = useMemo(() => noticeSectionMasterList, [noticeSectionMasterList]);

    const noticeSectionMasterPaginationInfo = useMemo(
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

        createFormResetHandler(setIsAddUpdateModalOpen, setEditingNoticeSectionMasterData, setFormData, setErrors),

        [setIsAddUpdateModalOpen, setEditingNoticeSectionMasterData, setFormData, setErrors]

    );

    const handleViewModalClose = useCallback(() => {
        setIsViewModalOpen(false);
        setViewNoticeSectionMasterDetailsData(null);
    }, [setIsViewModalOpen, setViewNoticeSectionMasterDetailsData]);

    const handleDeleteDialogClose = useCallback(() => {

        setIsConfirmationDialogBoxOpen(false);

        setDeleteNoticeSectionMasterDetailsData(null);

    }, [setIsConfirmationDialogBoxOpen, setDeleteNoticeSectionMasterDetailsData]);



    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

            {/* Table Action Bar */}

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Notice Section"
                onSearchChange={(v) => {
                    setSearchTerm(v)
                    debouncedSearch(v)
                }}
                onClearSearch={clearSearchNoticeSectionMaster}
                isShowCustomizeButton
                onCustomize={() => setIsShowCustomizeNoticeSectionMasterColumnsModal(true)}
                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddNoticeSectionModal}
                // EXPORT
                isShowExportButton={canExport && noticeSectionListForTable.length > 0}
                onExportExcel={handleExportNoticeSectionMasterExcel}
                onExportPdf={handleExportNoticeSectionMasterPdf}
                exportLoading={isLoading}
            />

            <Tabs
                tabs={governementComplianceTabList}
                defaultActive={activeTab}
                islarge={true}
                onTabChange={(t) => {
                    setActiveTab(t.id);
                }}
            />

            <div className="mt-5">
                <NoticeSectionMasterTable
                    data={filteredNoticeSectionMasterList}
                    columns={visibleNoticeSectionMasterColumns}
                    pagination={noticeSectionMasterPaginationInfo}
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                    onView={handleViewNoticeSectionMasterDetails}
                    onEdit={handleEditNoticeSectionMaster}
                    onDelete={handleConfirmationDialogBoxOpen}
                    lastUpdatedRow={lastUpdatedRow}
                    canAction={canAction}
                    loading={isLoading}
                />
            </div>


            <NoticeSectionMasterViewModal
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                data={viewNoticeSectionMasterDetailsData}
                canAction={canAction}
                onEdit={handleEditNoticeSectionMaster}
                onDelete={handleConfirmationDialogBoxOpen}
            />

            <NoticeSectionMasterFormModal
                isOpen={isAddUpdateModalOpen}
                onClose={handleFormReset}
                onCancel={handleFormReset}
                onSubmit={handleAddUpdateNoticeSectionMaster}
                formData={formData}
                onFieldChange={handleFieldChange}
                errors={errors}
                editingData={editingNoticeSectionMasterData}
                loading={isLoading}
            />

            <CustomizeColumnsModal
                isOpen={isShowCustomizeNoticeSectionMasterColumnsModal}
                onClose={() => setIsShowCustomizeNoticeSectionMasterColumnsModal(false)}
                onApply={(keys) => {

                    const withRequired = Array.from(new Set([...keys, ...requiredNoticeSectionMasterMasterColumnKeys]),)

                    setSelectedNoticeSectionMasterColumnKeys(withRequired)

                    try {

                        LocalStorageHelper.storeNoticeSectionMasterTableColumns(JSON.stringify(withRequired),)

                    }
                    catch {

                    }
                }}
                columns={noticeSectionMasterColumns}
                selectedKeys={selectedNoticeSectionMasterColumnKeys}
                requiredKeys={requiredNoticeSectionMasterMasterColumnKeys}
                title="Customize Table Columns"
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteNoticeSectionMaster}
                loading={isLoading}
                pageName='notice section'
            />

        </div>
    )
}

export default NoticeSectionMaster;
