import React, { useEffect, useRef, useState } from "react";

export interface StatusConfig {
    backgroundColor: string;
    textColor: string;
}

interface StatusBadgeDropdownProps {
    initialValue: string;
    itemConfig: Record<string, StatusConfig>;
    onSelect: (value: string) => Promise<boolean>;
    disabled?: boolean;
}

const StatusBadgeDropdown: React.FC<StatusBadgeDropdownProps> = ({
    initialValue,
    itemConfig,
    onSelect,
    disabled = false,
}) => {
    const [selectedValue, setSelectedValue] = useState(initialValue);
    const [isOpen, setIsOpen] = useState(false);
    const [showBelow, setShowBelow] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    /*
     * Sync selected value when parent changes initialValue
     */
    useEffect(() => {
        setSelectedValue(initialValue);
    }, [initialValue]);

    /*
     * Close dropdown when clicking outside
     */
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                containerRef.current &&
                !containerRef.current.contains(target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener(
                "mousedown",
                handleOutsideClick
            );
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, [isOpen]);

    /*
     * Calculate whether dropdown should open
     * above or below the badge
     */
    const calculateDropdownPosition = () => {
        if (!containerRef.current) return;

        const rect =
            containerRef.current.getBoundingClientRect();

        const itemHeight = 48;

        const dropdownHeight =
            Object.keys(itemConfig).length *
            itemHeight;

        const verticalGap = 4;

        const screenHeight =
            window.innerHeight;

        const spaceBelow =
            screenHeight - rect.bottom;

        const spaceAbove = rect.top;

        const shouldShowBelow =
            spaceBelow >=
            dropdownHeight + verticalGap ||
            spaceBelow >= spaceAbove;

        setShowBelow(shouldShowBelow);
    };

    /*
     * Open / close dropdown
     */
    const handleToggleDropdown = () => {
        if (disabled) return;

        if (!isOpen) {
            calculateDropdownPosition();
        }

        setIsOpen((previous) => !previous);
    };

    /*
     * Select an item
     */
    const handleSelect = async (value: string) => {
        setIsOpen(false);

        const success = await onSelect(value);

        if (success) {
            setSelectedValue(value);
        }
    };

    const statusConfig =
        itemConfig[selectedValue];

    /*
     * Current badge position
     */
    const rect =
        containerRef.current?.getBoundingClientRect();

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                display: "inline-block",
            }}
        >
            {/* ================= BADGE ================= */}

            <div
                onClick={handleToggleDropdown}
                style={{
                    display: "inline-flex",
                    alignItems: "center",

                    gap: "6px",

                    padding: "2px 8px",

                    backgroundColor:
                        statusConfig?.backgroundColor ??
                        "transparent",

                    border: `1px solid ${statusConfig?.textColor ??
                        "transparent"
                        }`,

                    borderRadius: "20px",

                    cursor: disabled
                        ? "not-allowed"
                        : "default",

                    userSelect: "none",
                }}
            >
                {/* Status Dot */}
                <div
                    style={{
                        width: "6px",
                        height: "6px",

                        borderRadius: "50%",

                        backgroundColor:
                            statusConfig?.textColor ??
                            "transparent",

                        flexShrink: 0,
                    }}
                />

                {/* Status Text */}
                <span
                    style={{
                        fontSize: "12px",
                        fontWeight: 600,

                        color:
                            statusConfig?.textColor ??
                            "inherit",

                        whiteSpace: "nowrap",
                    }}
                >
                    {selectedValue}
                </span>

                {/* Dropdown Arrow */}
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,

                        transition:
                            "transform 0.15s ease",

                        transform: isOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                    }}
                >
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2 3.5L5 6.5L8 3.5"
                            stroke={
                                statusConfig?.textColor ??
                                "currentColor"
                            }
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </div>

            {/* ================= DROPDOWN ================= */}

            {isOpen && !disabled && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: "fixed",

                        left:
                            rect?.left ?? 0,

                        /*
                         * Open below
                         */
                        top: showBelow
                            ? (rect?.bottom ?? 0) +
                            4
                            : undefined,

                        /*
                         * Open above
                         */
                        bottom: showBelow
                            ? undefined
                            : window.innerHeight -
                            (rect?.top ?? 0) +
                            4,

                        minWidth: "120px",

                        maxHeight:
                            "calc(100vh - 16px)",

                        overflowY: "auto",

                        backgroundColor:
                            "#ffffff",

                        borderRadius: "8px",

                        boxShadow:
                            "0 4px 12px rgba(0, 0, 0, 0.15)",

                        zIndex: 9999,

                        overflow: "hidden",
                    }}
                >
                    {Object.keys(
                        itemConfig
                    ).map((item) => {
                        return (
                            <div
                                key={item}
                                onClick={() =>
                                    handleSelect(
                                        item
                                    )
                                }
                                style={{
                                    height: "48px",

                                    padding:
                                        "0 12px",

                                    display: "flex",

                                    alignItems:
                                        "center",

                                    cursor:
                                        "pointer",

                                    fontSize:
                                        "12px",

                                    fontWeight:
                                        500,

                                    whiteSpace:
                                        "nowrap",

                                    backgroundColor:
                                        item ===
                                            selectedValue
                                            ? "#f5f5f5"
                                            : "transparent",

                                    transition:
                                        "background-color 0.15s ease",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    event.currentTarget.style.backgroundColor =
                                        "#f5f5f5";
                                }}
                                onMouseLeave={(
                                    event
                                ) => {
                                    event.currentTarget.style.backgroundColor =
                                        item ===
                                            selectedValue
                                            ? "#f5f5f5"
                                            : "transparent";
                                }}
                            >
                                {item}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StatusBadgeDropdown;