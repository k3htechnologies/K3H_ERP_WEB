import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import type { AddUpdatePaymentScheduleSchemeMasterRequest } from '@/features/paymentScheduleSchemeMaster/models/PaymentScheduleSchemeMasterModel';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';

interface PaymentScheduleSchemeMasterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: AddUpdatePaymentScheduleSchemeMasterRequest;
    onFieldChange: (field: keyof AddUpdatePaymentScheduleSchemeMasterRequest, value: any) => void;
    errors: { [k: string]: string };
    editingData: any;
    loading: boolean;
    buildingOptions: { label: string; value: number }[];
    wingOptions: { label: string; value: number }[];
    handleBuildingChange: (inventoryBuildingId: number) => void;
}

export const PaymentScheduleSchemeMasterFormModal: React.FC<PaymentScheduleSchemeMasterFormModalProps> = ({
    isOpen,
    onClose,
    onCancel,
    onSubmit,
    formData,
    onFieldChange,
    errors,
    editingData,
    loading,
    buildingOptions,
    wingOptions,
    handleBuildingChange
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onCancel={onCancel}
            title={editingData ? 'Update Scheme' : 'Add Scheme'}
            onSubmit={onSubmit}
            saveText={editingData ? 'Update' : 'Add'}
            loading={loading}
            size='xl'
        >
            <div className="space-y-10 p-6 bg-blue-100">
                <div className="space-y-4" >
                    <div>
                        <SinglePageSelection
                            label='Select Building'
                            placeholder='Select Building'
                            options={buildingOptions}
                            value={formData.InventoryBuildingId || 0}
                            required
                            error={errors.InventoryBuildingId}
                            onChange={(value) => handleBuildingChange(Number(value))}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label='Select Wing'
                            placeholder='Select Wing'
                            options={wingOptions}
                            value={formData.InventoryFlatFloorBasementPodiumWingId || 0}
                            required
                            error={errors.InventoryFlatFloorBasementPodiumWingId}
                            onChange={(value) => onFieldChange('InventoryFlatFloorBasementPodiumWingId', Number(value))}
                        />
                    </div>
                    <div>
                        <Input
                            label='Scheme'
                            required
                            error={errors.PaymentScheduleScheme}
                            type="text"
                            value={formData.PaymentScheduleScheme || ''}
                            maxLength={100}
                            onChange={(e) => onFieldChange('PaymentScheduleScheme', e.target.value)}
                            placeholder="Enter Scheme"
                        />
                    </div>
                </div>

            </div>
        </Modal>
    );
};
