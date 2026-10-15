import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdateContractMasterRequest } from '@/features/contractMaster/models/ContractMasterModel';

interface ContractMasterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: AddUpdateContractMasterRequest;
    onFieldChange: (field: keyof AddUpdateContractMasterRequest, value: any) => void;
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
                            label='Contract Code'
                            required
                            error={errors.ContractCode}
                            type="text"
                            value={formData.ContractCode.toUpperCase()}
                            maxLength={4}
                            onChange={(e) => onFieldChange('ContractCode', e.target.value)}
                            placeholder="Enter Contract Code"
                        />
                    </div>
                    <div>
                        <Input
                            label='Contract Name'
                            required
                            error={errors.ContractName}
                            type="text"
                            value={formData.ContractName}
                            maxLength={500}
                            onChange={(e) => onFieldChange('ContractName', e.target.value)}
                            placeholder="Enter Contract Name"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
