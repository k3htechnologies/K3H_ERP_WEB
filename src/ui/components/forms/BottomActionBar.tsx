// BottomActionBar.tsx
import React from "react";
import { Button } from "./Button";

interface BottomActionBarProps {
    cancelText?: string;
    saveText?: string;
    onCancel?: () => void;
    onSave?: () => void;
    canAction?: boolean;
    isLoading?: boolean;
    leftOffset?: string | number;
    rightOffset?: string | number;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
    cancelText = "Cancel",
    saveText = "Save",
    onCancel,
    onSave,
    canAction = false,
    isLoading = false,
    leftOffset = "301px",
    rightOffset = "14px",
}) => {
    return (
        <div
            className="fixed bottom-0 z-20 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16"
            style={{
                paddingBottom: "env(safe-area-inset-bottom)",
                left: leftOffset,
                right: rightOffset,
            }}
        >
            {/* Cancel Button */}
            <Button
                color="transparent"
                variant='transparent_border'
                size="sm"
                onClick={onCancel}
                className="px-6"
            >
                {cancelText}
            </Button>

            {/* Save Button */}
            {canAction ?
                <Button
                    color="green"
                    size="sm"
                    onClick={onSave}
                    className="px-6"
                    disabled={isLoading}
                >
                    {saveText}
                </Button>

                : ""}
        </div>
    );
};

export default BottomActionBar;
