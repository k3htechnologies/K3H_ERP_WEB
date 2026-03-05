import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { PaymentScheduleSchemeMasterData } from '@/features/paymentScheduleSchemeMaster/models/PaymentScheduleSchemeMasterModel';

interface PaymentScheduleSchemeMasterViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: PaymentScheduleSchemeMasterData | null;
    canAction: boolean;
    onEdit: (data: PaymentScheduleSchemeMasterData) => void;
    onDelete: (data: PaymentScheduleSchemeMasterData) => void;
}

export const PaymentScheduleSchemeMasterViewModal: React.FC<PaymentScheduleSchemeMasterViewModalProps> = ({
    isOpen,
    onClose,
    data,
    canAction,
    onEdit,
    onDelete
}) => {
    console.log('can Action', canAction);

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
            title="Payment Schedule Scheme Details"
            onSubmit={(e) => {
                e.preventDefault()
                onClose()
            }}
            cancelText="Close"
            loading={false}
            size='xl'
        >
            <div className="space-y-6">
                <div className="space-y-4">

                    <FieldItem label="Scheme" value={data.PaymentScheduleScheme} isRow withBorder={true} />

                    <FieldItem label="Building" value={data.BuildingNumber} isRow withBorder={true} className='font-medium text-blue-900 ' />

                    <FieldItem label="Wing" value={data.Wing} isRow withBorder={true} />

                </div>

                <div className="space-y-4">
                    <h4 className="text-lg font-semibold pb-2">
                        Action Details
                    </h4>

                    <FieldItem label="Created By / Date" isRow={true} value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={data.ModifiedBy !== '' ? true : false} />

                    {data.ModifiedBy !== '' ?
                        <FieldItem label="Modified By / Date" isRow={true} value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />
                        :
                        ''}
                </div>
                <div className="flex justify-between items-center pt-4">

                    {!canAction && (
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
