import React from "react";
import { Button } from "./Button";

interface BottomActionBarProps {
  cancelText?: string;
  saveText?: string;
  onCancel?: () => void;
  onSave?: () => void;
  onOtherAction?: () => void;
  onOtherActionText?: string;
  canAction?: boolean;
  isLoading?: boolean;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  cancelText = "Cancel",
  saveText = "Save",
  onOtherActionText,
  onCancel,
  onSave,
  onOtherAction,
  canAction = false,
  isLoading = false,
}) => {
  return (
    
    <div className="flex justify-end gap-3  pr-6">
      {onCancel && (
      <Button
        color="cancel"
        size="md"
        onClick={onCancel}
      >
        {cancelText}
      </Button>
      )}

      {canAction && (
        <Button
          color="blue"
          size="md"
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : saveText}
        </Button>
      )}
      {onOtherAction && onOtherActionText && (
        <Button
          color="red"
          size="md"
          onClick={onOtherAction}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : onOtherActionText}
        </Button>
      )}
    </div>
  );
};

export default BottomActionBar;
