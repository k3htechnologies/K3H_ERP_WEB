import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateSpecificationMaster } from '@/features/specificationMaster/models/SpecificationMasterModel';

interface ContractMasterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: AddUpdateSpecificationMaster;
    onFieldChange: (field: keyof AddUpdateSpecificationMaster, value: any) => void;
    errors: { [k: string]: string };
    editingData: any;
    loading: boolean;
}

export const ContractMasterFormModal: React.FC<ContractMasterFormModalProps> = ({
    isOpen,
    onClose,
    onCancel,
    onSubmit,
    formData,
    onFieldChange,
    errors,
    editingData,
    loading
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onCancel={onCancel}
            title={editingData ? 'Update Contract' : 'Add Contract'}
            onSubmit={onSubmit}
            saveText={editingData ? 'Update' : 'Add'}
            loading={loading}
            size='xl'
        >
            <div className="space-y-10 p-6 bg-blue-100">
                <div className="space-y-4" >
                    <div>
                        <Input
                            label='Contract Name'
                            required
                            error={errors.CategoryName}
                            type="text"
                            value={formData.CategoryName ?? ""}
                            maxLength={500}
                            onChange={(e) => onFieldChange('CategoryName', e.target.value)}
                            placeholder="Enter Contract Name"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
