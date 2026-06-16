import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import type { NoticeSectionMasterData } from '@/features/noticeSectionMaster/models/NoticeSectionMasterModel';

interface NoticeSectionMasterViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: NoticeSectionMasterData | null;
    canAction: boolean;
    onEdit: (data: NoticeSectionMasterData) => void;
    onDelete: (data: NoticeSectionMasterData) => void;
}

export const NoticeSectionMasterViewModal: React.FC<NoticeSectionMasterViewModalProps> = ({
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
            title="Notice Section Master Details"
            onSubmit={(e) => {
                e.preventDefault()
                onClose()
            }}
            cancelText="Close"
            loading={false}
            size='xl'
        >
            <div className="space-y-6">

                <FieldItem label="Notice Type" value={data.NoticeType} isRow withBorder={true} />
                <FieldItem label="Notice U/S" value={data.NoticeSection} isRow withBorder={true} />

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
