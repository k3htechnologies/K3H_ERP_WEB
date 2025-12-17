import React from "react";
import { Button } from "./Button";
import { ArrowLeft, Edit } from "lucide-react";
import { COLORS } from "@/core/constants";

interface HeaderActionBarProps {
    titleText?: string;
    cancelText?: string;
    EditText?: string;
    onCancel?: () => void;
    onEdit?: () => void;
    canAction?: boolean;
    isLoading?: boolean;
}

const HeaderActionBar: React.FC<HeaderActionBarProps> = ({
    titleText,
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
                    color="transparent"
                    size="sm"
                    className="hover:bg-gray-100 rounded-md"
                    onClick={onCancel}
                    leftIcon={ <ArrowLeft className="w-5 h-5 text-gray-700" />}
                    title={cancelText}
                >
                </Button>

                <h2 className="text-lg font-semibold text-gray-900 pl-3">
                    {titleText}
                </h2>
            </div>

            {canAction ? (
                <Button
                    color="blue"
                    size="sm"
                    title="Edit Info"
                    onClick={onEdit}
                    className="px-6"
                    disabled={isLoading}
                >
                    <Edit className="w-4 h-4" /> {EditText}
                </Button>
            ) : (
                ""
            )}
        </div>
    );
};

export default HeaderActionBar;
