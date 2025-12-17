// BottomActionBar.tsx (Tailwind responsive)
import React from "react";
import { Button } from "./Button";

interface BottomActionBarProps {
  cancelText?: string;
  saveText?: string;
  onCancel?: () => void;
  onSave?: () => void;
  canAction?: boolean;
  isLoading?: boolean;
  // offsets used only for larger screens
  leftOffsetClass?: string; // e.g. "sm:left-[301px]"
  rightOffsetClass?: string; // e.g. "sm:right-14"
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  cancelText = "Cancel",
  saveText = "Save",
  onCancel,
  onSave,
  canAction = false,
  isLoading = false,
  leftOffsetClass = "sm:left-[301px]",
  rightOffsetClass = "sm:right-14",
}) => {
  // class string: full-width on small screens (left-0 right-0) and custom offsets on larger screens
  const containerClasses = `
    fixed bottom-0 z-20 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16
    left-0 right-0 ${leftOffsetClass} ${rightOffsetClass}
  `;

  return (
    <div
      className={containerClasses}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Button
        color="transparent"
        variant="transparent_border"
        size="sm"
        onClick={onCancel}
        className="px-6"
      >
        {cancelText}
      </Button>

      {canAction ? (
        <Button
          color="green"
          size="sm"
          onClick={onSave}
          className="px-6"
          disabled={isLoading}
        >
          {saveText}
        </Button>
      ) : (
        ""
      )}
    </div>
  );
};

export default BottomActionBar;
