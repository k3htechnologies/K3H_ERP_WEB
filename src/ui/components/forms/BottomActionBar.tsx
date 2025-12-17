import React from "react";
import { Button } from "./Button";

interface BottomActionBarProps {
  cancelText?: string;
  saveText?: string;
  onCancel?: () => void;
  onSave?: () => void;
  canAction?: boolean;
  isLoading?: boolean;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  cancelText = "Cancel",
  saveText = "Save",
  onCancel,
  onSave,
  canAction = false,
  isLoading = false,
}) => {
  return (
    
    <div className="flex justify-end gap-3">
      <Button
        color="cancel"
        size="md"
        onClick={onCancel}
      >
        {cancelText}
      </Button>

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
    </div>
  );
};

export default BottomActionBar;
