import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { ContractMasterData } from '@/features/contractMaster/models/ContractMasterModel';

interface ContractMasterViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ContractMasterData | null;
    canAction: boolean;
    onEdit: (data: ContractMasterData) => void;
    onDelete: (data: ContractMasterData) => void;
}

export const ContractMasterViewModal: React.FC<ContractMasterViewModalProps> = ({
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
            title="Contract Master Details"
            onSubmit={(e) => {
                e.preventDefault()
                onClose()
            }}
            cancelText="Close"
            loading={false}
            size='xl'
        >
            <div className="space-y-6">
                <FieldItem label="Contract Code" value={data.ContractCode?.toString()} isRow withBorder={true} />
                <FieldItem label="Contract Name" value={data.ContractName} isRow withBorder={true} className='font-medium text-blue-900 ' />

                <h4 className="text-lg font-semibold">
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
                                color='red'
                                variant='solid'
                                colorMode="light"
                                size='md'
                                onClick={handleDelete}
                            >

                                Delete
                            </Button>
                            <Button
                                color='blue'
                                size='md'
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
