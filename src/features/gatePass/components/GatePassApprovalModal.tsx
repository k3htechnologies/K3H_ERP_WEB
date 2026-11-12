import React, { useState, useEffect } from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import RadioPill from '@/ui/components/forms/RadioPill';
import { TextArea } from '@/ui/components/forms/Textarea';

interface GatePassApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (status: 'Accept' | 'Reject', remark: string) => void;
    loading: boolean;
}

export const GatePassApprovalModal: React.FC<GatePassApprovalModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading,
}) => {
    const [approvalStatus, setApprovalStatus] = useState<'Accept' | 'Reject'>('Accept');
    const [remark, setRemark] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setApprovalStatus('Accept');
            setRemark('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!remark.trim()) {
            setError('Remark is required');
            return;
        }
        onSubmit(approvalStatus, remark.trim());
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Approval"
            onSubmit={handleSubmit}
            saveText="Add"
            loading={loading}
            size="md"
        >
            <div className="space-y-4 p-6 bg-blue-100">
                <div className="flex gap-3">
                    <RadioPill
                        name="ApprovalStatus"
                        label="Accept"
                        value="Accept"
                        checked={approvalStatus === 'Accept'}
                        onChange={() => setApprovalStatus('Accept')}
                    />

                    <RadioPill
                        name="ApprovalStatus"
                        label="Reject"
                        value="Reject"
                        checked={approvalStatus === 'Reject'}
                        onChange={() => setApprovalStatus('Reject')}
                    />
                </div>

                <TextArea
                    label="Remark"
                    placeholder="Enter Remark"
                    required
                    className="thin-scroll"
                    value={remark}
                    onChange={(e) => {
                        setRemark(e.target.value);
                        if (error) setError('');
                    }}
                    error={error}
                />
            </div>
        </Modal>
    );
};
export default GatePassApprovalModal;
