import React from 'react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';

interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    pageName?: string;
    title?: string;
    message?: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'logout' | 'inactive' | 'generate',
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading,
    pageName,
    title,
    message,
    confirmText,
    variant = "danger"
}) => {
    return (

        <ConfirmationDialogBox
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={title || `You are about to delete a ${pageName} ?`}
            message={message || `Deleting this ${pageName} will permanently remove all associated data.`}
            confirmText={confirmText || 'Delete'}
            cancelText="Cancel"
            loading={loading}
            variant={variant}
        />

    );
};
