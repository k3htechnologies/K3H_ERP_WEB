import React, { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeaderActionBarProps {
    titleText?: string;
    subTitleText?: string;
    subSubTitleText?: string;

    cancelText?: string;
    onCancel?: () => void;

    EditText?: string;
    onEdit?: () => void;
    canAction?: boolean;


    ExtraButtontitleText?: string;
    ExtraButtontitleTextIcon?: React.ElementType;
    ExtraButtonText?: string;
    onExtraButton?: () => void;
    canActionExtraButtonText?: boolean;

    ExtraExtraButtonText?: string;
    onExtraExtraButton?: () => void;
    canActionExtraExtraButton?: boolean;

    isLoading?: boolean;
}

const HeaderActionBar: React.FC<HeaderActionBarProps> = ({
    titleText,
    subTitleText,
    subSubTitleText,
    EditText = "Edit",


    ExtraButtontitleText,
    ExtraButtontitleTextIcon,
    ExtraButtonText = "",
    onCancel,
    onEdit,
    onExtraButton,
    canAction = false,
    canActionExtraButtonText = false,

    ExtraExtraButtonText = "",
    onExtraExtraButton,
    canActionExtraExtraButton = false,

    isLoading = false,
}) => {

    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const generateRef = useRef<HTMLDivElement | null>(null);
    const Icon = ExtraButtontitleTextIcon;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (generateRef.current && !generateRef.current.contains(e.target as Node)) {
                setIsGenerateOpen(false);
            }
        }

        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsGenerateOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);
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

                <h2 className={`text-lg font-semibold text-gray-900 flex items-center gap-2 ${onCancel ? 'pl-3' : 'pl-0'}`}>

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
                {(onExtraButton || onExtraExtraButton ) && canActionExtraButtonText && canActionExtraExtraButton && (
                    <div className="relative" ref={generateRef}>
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsGenerateOpen((s) => !s);
                            }}
                            color="blue"
                            colorMode="gradient_light"
                            size="sm"
                            defineWidth
                            title={ExtraButtontitleText}
                            aria-haspopup="menu"
                            style={{ width: '95px' }}
                            leftIcon={Icon ? <Icon className="h-4 w-4" /> : undefined}
                        >
                            {ExtraButtontitleText}
                        </Button>

                        {isGenerateOpen && (
                            <div className="absolute right-0 mt-2 min-w-[168px] bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-150 z-100">

                                {onExtraButton &&  canActionExtraButtonText &&(

                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            onExtraButton()
                                            setIsGenerateOpen(false)
                                        }}
                                        disabled={isLoading}
                                        color="transparent"
                                        fullWidth
                                        isborderRadius
                                        size="sm"
                                        title={ExtraButtonText}
                                        style={{ justifyContent: "left" }}
                                    >
                                        {ExtraButtonText}
                                    </Button>


                                )}

                                {onExtraExtraButton && canActionExtraExtraButton && (

                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            onExtraExtraButton()
                                            setIsGenerateOpen(false)
                                        }}
                                        disabled={isLoading}
                                        color="transparent"
                                        fullWidth
                                        isborderRadius
                                        size="sm"
                                        title={ExtraExtraButtonText}
                                        style={{ justifyContent: "left" }}
                                    >

                                        {ExtraExtraButtonText}
                                    </Button>

                                )}
                            </div>
                        )}
                    </div>
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
