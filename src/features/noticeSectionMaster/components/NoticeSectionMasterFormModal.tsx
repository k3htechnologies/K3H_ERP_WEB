import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import type { AddUpdateNoticeSectionMasterRequest } from '@/features/noticeSectionMaster/models/NoticeSectionMasterModel';
import { Input } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { NOTICE_TYPE_OPTIONS } from '@/core/constants';

interface NoticeSectionMasterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: AddUpdateNoticeSectionMasterRequest;
    onFieldChange: (field: keyof AddUpdateNoticeSectionMasterRequest, value: any) => void;
    errors: { [k: string]: string };
    editingData: any;
    loading: boolean;
}

export const NoticeSectionMasterFormModal: React.FC<NoticeSectionMasterFormModalProps> = ({
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
            title={editingData ? 'Update Notice Section' : 'Add Notice Section'}
            onSubmit={onSubmit}
            saveText={editingData ? 'Update' : 'Add'}
            loading={loading}
            size='lg'
        >
            <div className="space-y-10 p-6 bg-blue-100">
                <div className="space-y-4" >
                    <div>
                        <SinglePageSelection
                            label="Government Compliance"
                            onChange={(e) => {
                                onFieldChange("GovernmentCompliance", String(e));
                            }}
                            options={NOTICE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                            value={formData.GovernmentCompliance}
                            placeholder="Select Government Compliance"
                            required
                            error={errors.GovernmentCompliance}
                        />
                    </div>

                    <div>
                        <Input
                            label='Notice U/S'
                            required
                            error={errors.NoticeSection}
                            type="text"
                            value={formData.NoticeSection}
                            maxLength={100}
                            onChange={(e) => onFieldChange('NoticeSection', e.target.value)}
                            placeholder="Enter Notice U/S"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};