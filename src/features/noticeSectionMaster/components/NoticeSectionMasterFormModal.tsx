import React from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import type { AddUpdateNoticeSectionMasterRequest } from '@/features/noticeSectionMaster/models/NoticeSectionMasterModel';
// import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
// import { NOTICE_TYPE_OPTIONS } from '@/core/constants';
import { Input } from '@/ui/components/forms';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchGovernmentComplianceDropdown } from '../NoticeSectionDropdown';

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
            size='xl'
        >
            <div className="space-y-10 p-6 bg-blue-100">
                <div className="space-y-4" >
                    <div>
                        <div>
                            {/* 1. Government Compliance Dropdown */}
                            <SingleSelectDropdownWithPagination
                                label="Government Compliance"
                                title="Select Government Compliance"
                                size="lg"
                                dataFetchCallBack={fetchGovernmentComplianceDropdown}
                                onSelected={(item) => {
                                    if (!item) {
                                        onFieldChange("GovernmentCompliance", null);
                                        onFieldChange("NoticeSection", null);
                                        onFieldChange("NoticeSectionMasterId", 0);
                                        return;
                                    }
                                    onFieldChange("GovernmentCompliance", item.value);

                                    // Reset notice state if parent compliance changes
                                    onFieldChange("NoticeSection", null);
                                    onFieldChange("NoticeSectionMasterId", 0);
                                }}
                                error={errors.GovernmentCompliance}
                            />

                            {/* 2. Dependent Notice U/S Dropdown */}

                        </div>
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