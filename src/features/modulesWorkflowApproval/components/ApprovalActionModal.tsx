import React, { useState, useEffect } from "react";
import { Modal } from "@/ui/components/Modal/Modal";
import { TextArea } from "@/ui/components/forms/Textarea";

interface Props {
  isOpen: boolean;
  title?: string
  onClose: () => void;
  onSubmit: (remark: string) => void;
  loading?: boolean;
  actionType: "approve" | "reject";
  titleText?: string;
  subTitleText?: string;
  subSubTitleText?: string;
}

const ApprovalActionModal: React.FC<Props> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  loading,
  actionType,
  titleText,
  subTitleText,
  subSubTitleText,
}) => {

  const [remark, setRemark] = useState("");
    const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRemark("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!remark.trim()) {
      setError("Remark is required");
      return;
    }

    setError("");
    onSubmit(remark.trim());
  };

  const modalTitle = (<span className="font-semibold"> {actionType === "approve" ? "Approve" : "Reject"} {title}
      {titleText && (
        <span className="text-gray-500 font-medium">
          {" : "}
          {titleText}
          {subTitleText && <> {" > "} {subTitleText}</>}
          {subSubTitleText && <> {" > "} {subSubTitleText}</>}
        </span>
      )}
    </span>
  );

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

        <TextArea
          label="Remark"
          placeholder="Enter Remark"
          value={remark}
          required
          error={error}
          onChange={(e) => {
            setRemark(e.target.value);
            if (error) setError("");
          }}
        />

      </div>

    </Modal>
  );
};

export default ApprovalActionModal;