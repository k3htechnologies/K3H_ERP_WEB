import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import {  formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { GatePassData } from '@/features/gatePass/models/GatePassModel';
import { getStatusColor } from '../utils/Status';

interface GatePassViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: GatePassData | null;
    canAction: boolean;
    onEdit: (data: GatePassData) => void;
    onDelete: (data: GatePassData) => void;
}

export const GatePassViewModal: React.FC<GatePassViewModalProps> = ({
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
            title={
                <div className="flex items-center gap-15">
                    <span>Gate Pass Details</span>

                    {data?.Purpose && (() => {
                        const { bg, text } = getStatusColor(data.Purpose);

                        return (
                            <span
                                className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                style={{
                                    backgroundColor: bg,
                                    color: text
                                }}
                            >
                                {data.Purpose}
                            </span>
                        );
                    })()}
                </div>
            }
            onSubmit={(e) => {
                e.preventDefault()
                onClose()
            }}
            cancelText="Close"
            loading={false}
            size='xl'
        >
            <div className="space-y-6">


                <FieldItem
                    label="Visitor Name"
                    value={`${data.FullName || '-'}${Number(data.NoOfParticipants) > 0 ? ` + ${data.NoOfParticipants}` : ''}`}
                    isRow
                    withBorder={true}
                    urls={data.PhotoURL}
                    isIcon
                />

                <FieldItem label="Address" value={data.Address} isRow withBorder={true} />

                <FieldItem label="Mobile Number" value={data?.MobileNumber ? `+91 ${(data?.MobileNumber)}` : '-'} isRow withBorder={true} />


                <FieldItem
                    label="Appointment With"
                    value={data.EmployeeName}
                    isRow
                    withBorder={true}
                />

                <FieldItem
                    label="Appointment Date"
                    value={`${formatDate_dd_MonthName_yy_hh_mm(data.PassDateTime)}`}
                    isRow
                    withBorder={true}
                />
                <FieldItem
                    label="Out Date"
                    value={`${formatDate_dd_MonthName_yy_hh_mm(data.OutDateTime)}`}
                    isRow
                    withBorder={true}
                />

                <FieldItem label="Remark" value={data.Remark} isRow />

                <h4 className="text-lg font-semibold pb-2">
                    Action Details
                </h4>

                <FieldItem label="Created By / Date" isRow={true} value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={data.ModifiedBy !== '' ? true : false} />

                {data.ModifiedBy !== '' ?
                    <FieldItem label="Modified By / Date" isRow={true} value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />
                    :
                    ''}
                <div className="flex justify-between items-center">
                    {canAction && data.IsDelete && (
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
