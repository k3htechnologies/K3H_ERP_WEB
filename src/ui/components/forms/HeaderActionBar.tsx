import React from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeaderActionBarProps {
    titleText?: string;
    subTitleText?: string;
    subSubTitleText?: string;
    cancelText?: string;
    EditText?: string;
    ExtraButtonText?: string;
    onCancel?: () => void;
    onEdit?: () => void;
    onExtraButton?: () => void;
    canAction?: boolean;
    canActionExtraButtonText?: boolean;
    isLoading?: boolean;
}

const HeaderActionBar: React.FC<HeaderActionBarProps> = ({
    titleText,
    subTitleText,
    subSubTitleText,
    EditText = "Edit",
    ExtraButtonText = "",
    onCancel,
    onEdit,
    onExtraButton,
    canAction = false,
    canActionExtraButtonText = false,
    isLoading = false,
}) => {


    return (
        <div className="flex items-center justify-between">


            <div className="flex items-center gap-2">
                {onCancel && (
                    <Button
                        color="primary"
                        size="sm"
                        onClick={onCancel}
                        leftIcon={<ChevronLeft className="w-5 h-5 text-gray-700" strokeWidth={3.0} />}
                        style={{ backgroundColor: "#DBEAFE" }}
                        className="hover:bg-[#DBEAFE]"
                    >
                    </Button>
                )}

                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pl-3">

                    {titleText && <span>{titleText}</span>}

                    {subTitleText && (
                        <span className="flex items-center gap-2 text-lg font-medium text-[#00000080]">
                            {subTitleText}
                            {subSubTitleText && (
                                <>
                                    <ChevronRight className="h-5 w-5 text-gray-800" />

                                    {subSubTitleText}
                                </>
                            )}
                        </span>
                    )}

                </h2>


            </div>


            <div className="flex items-center gap-2">
                {canActionExtraButtonText && ExtraButtonText && (
                    <Button
                        color="blue"
                        variant="solid"
                        colorMode="extraLight"
                        size="sm"
                        title={ExtraButtonText}
                        onClick={onExtraButton}
                        disabled={isLoading}
                    >
                        {ExtraButtonText}
                    </Button>

                )}
                {canAction && (
                    <Button
                        color="blue"
                        size="sm"
                        title="Edit Info"
                        onClick={onEdit}
                        disabled={isLoading}
                    >
                        {EditText}
                    </Button>
                )}
            </div>

        </div>
    );
};

export default HeaderActionBar;
