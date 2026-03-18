import { useState, useEffect, useRef, forwardRef, useCallback, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Info, InfoIcon, Search, X } from "lucide-react";
import type { SinglePageSelectionProps } from "@/core/types/dropDownSelectionType";
import { THEME } from "@/core/constants/theme";


export const SinglePageSelection = forwardRef<
  HTMLDivElement,
  SinglePageSelectionProps & {
    labelKey?: string;
    valueKey?: string;
    searchable?: boolean;
    error?: string;
    required?: boolean;
    className?: string;
    selectedTextColor?: string;
    leftIcon?: ReactNode
    leftIconClick?: () => void
  }
>(
  (
    {
      label,
      options,
      value,
      onChange,
      disabled = false,
      placeholder = "Select",
      labelKey = "label",
      valueKey = "value",
      searchable = true,
      size = "md",
      required = false,
      error,
      className,
      selectedTextColor,
      leftIcon,
      leftIconClick,
      isShowClearSelection = true
    },
    ref
  ) => {
    const theme = THEME;

    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);

    /* ================= SIZE CONFIG (UNCHANGED) ================= */

    const sizeConfig = {
      sm: { height: "36px", padding: "6px 12px", fontSize: theme.fontSize.sm, dropdownHeight: 150, paddingNum: 6 },
      md: { height: "44px", padding: "8px 16px", fontSize: theme.fontSize.md, dropdownHeight: 200, paddingNum: 8 },
      lg: { height: "52px", padding: "10px 20px", fontSize: theme.fontSize.lg, dropdownHeight: 250, paddingNum: 10 },
    };

    const currentSize = sizeConfig[size];


    /* ================= FILTER LOGIC (UNCHANGED)  ================= */

    useEffect(() => {
      if (!searchable) {
        setFilteredOptions(options);
        return;
      }

      if (!searchTerm.trim()) {
        setFilteredOptions(options);
      } else {
        setFilteredOptions(
          options.filter((opt: any) =>
            String(opt[labelKey])
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        );
      }
    }, [searchTerm, options, searchable, labelKey]);

    /* ================= CLICK OUTSIDE / ESC (UNCHANGED) ================= */

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.removeEventListener("keydown", handleKey);
      };
    }, []);

    /* ================= SELECTED LABEL (UNCHANGED) ================= */

    const selectedLabel = options.find((opt: any) => opt[valueKey] === value)?.[labelKey] || placeholder;

    const chosenSelectedColor = selectedTextColor ?? theme.colors.primary ?? "#0b5fff";

    const isPlaceholder = !value;

    /* ================= CLEAR SELECTED LABEL (UNCHANGED) ================= */
    const clearSelection = () => {
      onChange("");   // notify parent
      setSearchTerm("");
    };

    /* ================= OPTION STYLES (MATCH SingleSelectDropdownWithPagination) ================= */
    const getOptionStyles = (selected: boolean, hovered = false): CSSProperties => {
      return {
        padding: "10px 14px",
        borderBottom: "1px solid #f3f3f3",
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: selected
          ? "rgba(11,95,255,0.18)"
          : hovered
            ? "rgba(11,95,255,0.12)"
            : theme.colors.background,


        transition: theme.transitions.normal,
      };
    };

    /* ================= PORTAL POSITION (MATCH SingleSelectDropdownWithPagination) ================= */

    const [portalPos, setPortalPos] = useState<{
      top: number;
      left: number;
      width: number;
      maxHeight: number;
      openUpward: boolean;
    } | null>(null);

    const updatePortalPosition = useCallback(() => {
      const buttonNode = buttonRef.current;
      const containerNode = containerRef.current;
      if (!buttonNode || !containerNode || typeof window === "undefined") {
        setPortalPos(null);
        return;
      }

      // Use button's position for accurate attachment
      const rect = buttonNode.getBoundingClientRect();
      const containerRect = containerNode.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const preferredHeight = currentSize.dropdownHeight;
      const padding = 8;

      // Calculate exact content height based on number of items (no extra space)
      const searchBarHeight = searchable ? 48 : 0; // search bar height (padding + input + border) or 0 if not searchable
      // Item height: padding top/bottom + font size
      const fontSizeNum = parseFloat(currentSize.fontSize.replace('px', ''));
      const itemHeight = 10 + 14 + (fontSizeNum * 1.2); // padding top (10px) + bottom (14px) + font
      const optionsTopPadding = 0; // no extra padding
      const minHeight = searchBarHeight + optionsTopPadding + itemHeight; // minimum: search bar + spacing + at least one item
      const maxItems = Math.max(1, filteredOptions.length);
      // Calculate exact content height: search bar + spacing + items (no extra padding)
      const contentHeight = searchBarHeight + optionsTopPadding + (maxItems * itemHeight);
      // Use exact content height when less than preferred, otherwise cap at preferred
      const calculatedHeight = contentHeight <= preferredHeight ? contentHeight : preferredHeight;

      // Calculate available space below and above
      const availableSpaceBelow = vh - rect.bottom - padding;
      const availableSpaceAbove = rect.top - padding;

      // Determine if we should open above or below
      const hasEnoughSpaceBelow = availableSpaceBelow >= calculatedHeight;
      const hasMoreSpaceAbove = availableSpaceAbove > availableSpaceBelow;

      let top: number;
      let maxHeight: number;
      let openUpward = false;

      if (hasEnoughSpaceBelow) {
        // Open below with calculated height - position exactly at bottom edge
        top = rect.bottom;
        maxHeight = calculatedHeight;
      } else if (hasMoreSpaceAbove && availableSpaceAbove >= minHeight) {
        // Open above - position exactly at top edge
        openUpward = true;
        maxHeight = Math.min(calculatedHeight, Math.max(minHeight, availableSpaceAbove));
        top = rect.top - maxHeight;
      } else {
        // Not enough space in either direction, open below with reduced height
        top = rect.bottom;
        maxHeight = Math.max(minHeight, availableSpaceBelow);
      }

      // Clamp top position to stay within viewport
      top = Math.max(padding, Math.min(top, vh - maxHeight - padding));

      // left and width (clamp right edge) - use container for width, button for left alignment
      let left = rect.left;
      let width = containerRect.width;
      const rightOverflow = left + width - vw;
      if (rightOverflow > padding) {
        left = Math.max(padding, left - rightOverflow);
      }

      setPortalPos({ left, top, width, maxHeight, openUpward });
    }, [currentSize.dropdownHeight, currentSize.fontSize, filteredOptions.length, searchable]);

    useEffect(() => {
      if (!isOpen) return;
      // Use setTimeout to ensure DOM is updated before calculating position
      setTimeout(() => {
        updatePortalPosition();
      }, 0);

      const onUpdate = () => updatePortalPosition();
      window.addEventListener("resize", onUpdate);
      window.addEventListener("scroll", onUpdate, true); // track ancestor scroll too
      return () => {
        window.removeEventListener("resize", onUpdate);
        window.removeEventListener("scroll", onUpdate, true);
      };
    }, [isOpen, updatePortalPosition, filteredOptions.length]);

    /* ================= TOGGLE (UNCHANGED BEHAVIOR) ================= */

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(prev => !prev);
    };

    /* ================= RENDER ================= */

    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === "function") ref(node);
            else ref.current = node;
          }
          containerRef.current = node;
        }}
        style={{ width: "100%", position: "relative" }}
        className={className}
      >
        {/* Label */}
        {label && (
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              color: theme.colors.text,
            }}
          >
            {label}
            {required && (
              <span style={{ color: theme.colors.error, marginLeft: "4px" }}>
                *
              </span>
            )}
          </label>
        )}

        {/* Select Box */}
        <div
          ref={buttonRef}
          onClick={handleToggle}
          // style={{
          //   position: "relative",   // 👈 IMPORTANT
          //   height: currentSize.height,
          //   fontSize: currentSize.fontSize,
          //   padding: currentSize.padding,
          //   // paddingLeft: leftIcon ? "38px" : "8px",
          //   borderRadius: "6px",
          //   backgroundColor: disabled ? "#f5f5f5" : theme.colors.background,
          //   cursor: disabled ? "not-allowed" : "pointer",
          //   display: "flex",
          //   alignItems: "center",
          //   justifyContent: "space-between",
          //   border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
          // }}
          style={{
            position: 'relative',
            height: currentSize.height,
            fontSize: currentSize.fontSize,
            padding: currentSize.padding,
            paddingLeft: leftIcon ? "38px" : "8px",
            borderRadius: "6px",
            backgroundColor: disabled ? "#f5f5f5" : theme.colors.background,
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
            overflow: "hidden",
          }}

        >
          {/* LEFT CLICKABLE ICON */}
          {leftIcon && (
            <div
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                leftIconClick?.();

              }}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Info size={18} color="#135BEC" />
            </div>
          )}

          <span
            style={{
              fontSize: currentSize.fontSize,
              color: selectedLabel === placeholder
                ? "#9ca3af" // placeholder color
                : selectedTextColor
                  ? chosenSelectedColor
                  : "#000", // default text color
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: selectedTextColor ? "700" : "400",
            }}
          >
            {selectedLabel}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

            {isShowClearSelection && !isPlaceholder && !disabled && (
              <X
                size={14}
                style={{ cursor: "pointer", color: "#888" }}
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              />
            )}

            {isOpen ? (
              <ChevronUp size={20} color="#888" />
            ) : (
              <ChevronDown size={20} color="#888" />
            )}

          </div>

        </div>


        {/* ===== PORTAL DROPDOWN (UI UNCHANGED) ===== */}
        {isOpen &&
          !disabled &&
          portalPos &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: portalPos.top,
                left: portalPos.left,
                width: portalPos.width,
                maxHeight: portalPos.maxHeight,
                overflow: "hidden",
                margin: 0,
                border: `1px solid ${theme.colors.border}`,
                borderTop: portalPos.openUpward ? `1px solid ${theme.colors.border}` : "none",
                borderBottom: portalPos.openUpward ? "none" : `1px solid ${theme.colors.border}`,
                borderLeft: `1px solid ${theme.colors.border}`,
                borderRight: `1px solid ${theme.colors.border}`,
                borderRadius: portalPos.openUpward
                  ? `${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0`
                  : `0 0 ${theme.borderRadius.sm} ${theme.borderRadius.sm}`,
                boxShadow: theme.shadows.lg,
                zIndex: 9999,
                padding: 0,
                backgroundColor: theme.colors.background,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Search */}
              {searchable && (
                <div
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: theme.colors.background,
                    zIndex: 30,
                    borderBottom: "1px solid #eee",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "6px",
                  }}
                >
                  <Search size={16} color="#888" style={{ marginRight: "8px" }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    style={{
                      width: "100%",
                      fontSize: theme.fontSize.md,
                      border: "none",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              {/* Options */}
              <div
                className="thin-scroll"
                style={{
                  overflowY: "auto",
                  flex: 1,
                  maxHeight: portalPos.maxHeight - (searchable ? 48 : 0), // leave room for search if searchable
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                  boxSizing: "border-box",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${theme.colors.border} transparent`,
                }}
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt: any, idx: number) => {
                    const selected = opt[valueKey] === value;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          onChange(opt[valueKey]);
                          setIsOpen(false);
                          setSearchTerm("");
                        }}
                        onMouseEnter={e =>
                          !disabled && Object.assign(e.currentTarget.style, getOptionStyles(selected, true))
                        }
                        onMouseLeave={e =>
                          !disabled && Object.assign(e.currentTarget.style, getOptionStyles(selected, false))
                        }
                        style={getOptionStyles(selected)}
                      >
                        {opt[labelKey]}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      color: "#999",
                    }}
                  >
                    No results found
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: theme.spacing.sm,
              fontSize: theme.fontSize.sm,
              color: theme.colors.error,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <InfoIcon height={14} />
            {error}
          </div>
        )}
      </div>
    );
  }
);

SinglePageSelection.displayName = "SinglePageSelection";
