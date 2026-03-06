import React, { useCallback, useMemo } from 'react';
import { Loader } from '@/core/utils/loader';
import { useClassificationParameter } from '@/features/classificationParameter/hooks/useClassificationParameter';
import {
    ClassificationParameterTable,
} from '@/features/classificationParameter/components/ClassificationParameterTable';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { ClassificationParameterFormModal } from '@/features/classificationParameter/components/ClassificationParameterFromModal';
import { createFormResetHandler } from '@/features/classificationParameter/utils/classificationParameterUtils';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { ClassificationParameterViewModal } from '../components/ClassificationParameterViewModal';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const ClassificationParameter: React.FC = () => {

const { projectId } = useProject();

    const {
        //States
        classificationParameterList,
        isLoading,
        loadingMessage,
        canAction,
        pagination,
        isAddUpdateModalOpen,
        formData,
        errors,
        editingClassificationParameterData,
        isConfirmationDialogBoxOpen,
        isViewModalOpen,
        viewClassificationParameterDetailsData,
        canExport,
        villageDropdown,
        classificationParameterColumns,

        //setters
        setFormData,
        setErrors,
        setIsAddUpdateModalOpen,
        setEditingClassificationParameterData,
        setIsConfirmationDialogBoxOpen,
        setDeleteClassificationParameterDetailsData,
        setIsViewModalOpen,
        setViewClassificationParameterDetailsData,
        setVillageValue,

        //Actions
        handlePageChange,
        handleViewClassificationParameterDetails,
        handleEditClassificationParameterDetails,
        handleConfirmationDialogBoxOpen,
        handleAddClassificationParameterModal,
        handleAddUpdateClassificationParameter,
        handleFieldChange,
        handleDeleteClassificationParameter,
        handleExportClassificationParameterExcel,
        handleExportClassificationParameterPdf,


    } = useClassificationParameter();

    const classificationParameterListForTable = useMemo(() => classificationParameterList, [classificationParameterList]);

    const classificationParameterPaginationInfo = useMemo(
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

        createFormResetHandler(setIsAddUpdateModalOpen, setEditingClassificationParameterData, setFormData, setErrors,setVillageValue),

        [setIsAddUpdateModalOpen, setEditingClassificationParameterData, setFormData, setErrors, setVillageValue]

    );

    const handleDeleteDialogClose = useCallback(() => {

        setIsConfirmationDialogBoxOpen(false);

        setDeleteClassificationParameterDetailsData(null);

    }, [setIsConfirmationDialogBoxOpen, setDeleteClassificationParameterDetailsData]);


    const handleViewModalClose = useCallback(() => {

        setIsViewModalOpen(false);

        setViewClassificationParameterDetailsData(null);

    }, [setIsViewModalOpen, setViewClassificationParameterDetailsData]);


    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <Loader loading={isLoading} title={loadingMessage}> <div></div></Loader>

            <TableActionToolbar
                isShowSearchBar={false}
                // ADD
                isShowAddButton={canAction && Number(projectId) > 0}
                addTitle="Add"
                onAdd={handleAddClassificationParameterModal}
                // EXPORT
                isShowExportButton={canExport && classificationParameterListForTable.length > 0}
                onExportExcel={handleExportClassificationParameterExcel}
                onExportPdf={handleExportClassificationParameterPdf}
                exportLoading={isLoading}

            />

            <ClassificationParameterTable
                data={classificationParameterListForTable}
                columns={classificationParameterColumns}
                pagination={classificationParameterPaginationInfo}
                onSort={() => { }}
                onView={handleViewClassificationParameterDetails}
                onEdit={handleEditClassificationParameterDetails}
                onDelete={handleConfirmationDialogBoxOpen}
                canAction={canAction}
                loading={isLoading}
            />

            <ClassificationParameterFormModal
                isOpen={isAddUpdateModalOpen}
                onClose={handleFormReset}
                onCancel={handleFormReset}
                onSubmit={handleAddUpdateClassificationParameter}
                formData={formData}
                onFieldChange={handleFieldChange}
                errors={errors}
                editingData={editingClassificationParameterData}
                loading={isLoading}
                villageDropdown={villageDropdown}
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteClassificationParameter}
                loading={isLoading}
                pageName='classification parameter'
            />

            <ClassificationParameterViewModal
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                data={viewClassificationParameterDetailsData}
                canAction={canAction}
                onEdit={handleEditClassificationParameterDetails}
                onDelete={handleConfirmationDialogBoxOpen}
            />
        </div>
    )

}

export default ClassificationParameter;