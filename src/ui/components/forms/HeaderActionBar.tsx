import React from "react";
import { Button } from "./Button";
import { ChevronLeft } from "lucide-react";

interface HeaderActionBarProps {
    titleText?: string;
    subTitleText?: string;
    cancelText?: string;
    EditText?: string;
    onCancel?: () => void;
    onEdit?: () => void;
    canAction?: boolean;
    isLoading?: boolean;
}

const HeaderActionBar: React.FC<HeaderActionBarProps> = ({
    titleText,
    subTitleText,
    cancelText = "Cancel",
    EditText = "Edit",
    onCancel,
    onEdit,
    canAction = false,
    isLoading = false,
}) => {


    return (
        <div className="flex items-center justify-between">


            <div className="flex items-center gap-2">
                <Button
                    color="primary"
                    size="sm"
                    onClick={onCancel}
                    leftIcon={<ChevronLeft className="w-5 h-5 text-gray-700" strokeWidth={3.0} />}
                    title={cancelText}
                    style={{ backgroundColor: "#DBEAFE" }}
                    className="hover:bg-[#DBEAFE]"
                >
                </Button>

                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pl-3">

                    <span>{titleText}</span>

                    {subTitleText && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 max-w-[900px] truncate">
                            {subTitleText}
                        </span>
                    )}

                </h2>

            </div>

            {canAction ? (
                <Button
                    color="blue"
                    size="sm"
                    title="Edit Info"
                    onClick={onEdit}
                    disabled={isLoading}
                > {EditText}
                </Button>
            ) : (
                ""
            )}
        </div>
    );
};

export default HeaderActionBar;
