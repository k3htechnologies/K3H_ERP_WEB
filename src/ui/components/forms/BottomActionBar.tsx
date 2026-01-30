import React from "react";
import { Button } from "./Button";

interface BottomActionBarProps {
  cancelText?: string;
  saveText?: string;
  onCancel?: () => void;
  onSave?: () => void;
  onOtherAction?: () => void;
  onOtherActionText?: string;
  leftActionText?: string;
  onLeftAction?: () => void;
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
  leftActionText,
  onLeftAction,
  canAction = false,
  isLoading = false,
}) => {
  return (
    
    <div className="flex justify-between items-center pr-6">

      {/* LEFT SIDE BUTTON */}
      <div>
        {onLeftAction && leftActionText && (
          <Button
            color="red"
            size="md"
            onClick={onLeftAction}
            disabled={isLoading}
          >
            {leftActionText}
          </Button>
        )}
      </div>

      {/* RIGHT SIDE BUTTONS */}
      <div className="flex gap-3">
        {onCancel && (
          <Button color="cancel" size="md" onClick={onCancel}>
            {cancelText}
          </Button>
        )}

        {canAction && (
          <Button color="blue" size="md" onClick={onSave} disabled={isLoading}>
            {isLoading ? "Saving..." : saveText}
          </Button>
        )}

        {onOtherAction && onOtherActionText && (
          <Button color="red" size="md" onClick={onOtherAction} disabled={isLoading}>
            {isLoading ? "Saving..." : onOtherActionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BottomActionBar;
