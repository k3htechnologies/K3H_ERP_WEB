import React from 'react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';

interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    pageName: string
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading,
    pageName
}) => {
    return (

        <ConfirmationDialogBox
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={`You are about to delete a ${pageName}?`}
            message={`Deleting this ${pageName} will permanently remove its contents`}
            confirmText="Delete"
            cancelText="Cancel"
            loading={loading}
            variant="danger"
        />

    );
};
