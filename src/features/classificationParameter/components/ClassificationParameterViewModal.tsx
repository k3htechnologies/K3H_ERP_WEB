import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { ClassificationParameterData } from '@/features/classificationParameter/models/ClassificationParameterModel';

interface ClassificationParameterViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ClassificationParameterData | null;
    canAction: boolean;
    onEdit: (data: ClassificationParameterData) => void;
    onDelete: (data: ClassificationParameterData) => void;
}

export const ClassificationParameterViewModal: React.FC<ClassificationParameterViewModalProps> = ({
    isOpen,
    onClose,
    data,
    canAction,
    onEdit,
    onDelete
}) => {

    if (!data) return null;

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        onEdit(data);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        onDelete(data);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Classification Parameter Details"
            onSubmit={(e) => {
                e.preventDefault()
                onClose()
            }}
            cancelText="Close"
            loading={false}
            size='xl'
        >
            <div className="space-y-6">

                <FieldItem label="Possession Type" value={data.PossessionType} isRow withBorder={true} className='font-medium text-blue-900 ' />

                <FieldItem label="Requirement" value={data.Requirement} isRow withBorder={true} />

                <FieldItem label="Requirement Type" value={data.RequirementType} isRow withBorder={true} />

                <FieldItem label="Min Budget" value={data.MinBudget} isRow withBorder={true} />

                <FieldItem label="Location" value={data.VillageName} isRow withBorder={true} />

                <FieldItem label="TimeLine" value={data.TimeLine} isRow withBorder={true} />


                <h4 className="text-lg font-semibold pb-2">
                    Action Details
                </h4>

                <FieldItem label="Created By / Date" isRow={true} value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={data.ModifiedBy !== '' ? true : false} />

                {data.ModifiedBy !== '' ?
                    <FieldItem label="Modified By / Date" isRow={true} value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />
                    :
                    ''}

                <div className="flex justify-between items-center">
                    {canAction && (
                        <>
                            <Button
                                color="red"
                                variant="solid"
                                colorMode="light"
                                size="md"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>

                            <div style={{ width: "120px", height: "44px" }}></div>

                            <Button
                                color="blue"
                                size="md"
                                onClick={handleEdit}
                            >
                                Edit
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};
