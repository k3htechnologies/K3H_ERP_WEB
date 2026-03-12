import React, { useState, useEffect } from "react";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";

interface Props {
  isOpen: boolean;
  title?:string
  onClose: () => void;
  onSubmit: (remark: string) => void;
  loading?: boolean;
  actionType: "approve" | "reject";
  documentName?: string;
}

const ApprovalActionModal: React.FC<Props> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  loading,
  actionType,
  documentName
}) => {

  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRemark("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(remark);
  };

  const modalTitle = actionType === "approve" ? `Approve ${title ?? "Document"}` : `Reject ${title ?? "Document"}`;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      onSubmit={handleSubmit}
      title={modalTitle}
      saveText={actionType === "approve" ? "Approve" : "Reject"}
      size="lg"
      loading={loading}
    >

      <div className="space-y-6 p-6 bg-blue-100">

        <div className="text-sm font-semibold text-gray-700">
          {documentName}
        </div>

        <TextArea
          label="Remark"
          placeholder="Enter Remark"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />

      </div>

    </Modal>
  );
};

export default ApprovalActionModal;