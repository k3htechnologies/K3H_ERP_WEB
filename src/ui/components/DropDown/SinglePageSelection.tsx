import { useState, useEffect, useRef, forwardRef, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Info, InfoIcon, Search, X } from "lucide-react";
import type { SinglePageSelectionProps } from "@/core/types/dropDownSelectionType";
import { THEME } from "@/core/constants/theme";
import { COLORS } from "@/core/constants";

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

    const anchorRef = useRef<HTMLDivElement | null>(null);
    const portalRef = useRef<HTMLDivElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);

    const [, setOpenUpward] = useState(false);

    /* ================= SIZE CONFIG (UNCHANGED) ================= */

    const sizeConfig = {
      sm: { height: "36px", padding: "6px 12px", fontSize: theme.fontSize.sm },
      md: { height: "44px", padding: "8px 16px", fontSize: theme.fontSize.md },
      lg: { height: "52px", padding: "10px 20px", fontSize: theme.fontSize.lg },
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
      const handlePointerDown = (e: PointerEvent) => {
        const target = e.target as Node;

        if (
          anchorRef.current?.contains(target) ||
          portalRef.current?.contains(target)
        ) {
          return;
        }

        setIsOpen(false);
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };

      // capture phase = runs BEFORE React onClick
      document.addEventListener("pointerdown", handlePointerDown, true);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
        document.removeEventListener("keydown", handleEscape);
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

    /* ================= PORTAL POSITION (ONLY NEW LOGIC) ================= */

    const SIZE_MAP = {
      sm: { fontSize: 12, padding: 6, dropdownHeight: 150 },
      md: { fontSize: 14, padding: 6, dropdownHeight: 200 },
      lg: { fontSize: 16, padding: 6, dropdownHeight: 250 },
    };

    const sizeStyles = SIZE_MAP[size as keyof typeof SIZE_MAP];

    const DROPDOWN_ESTIMATED_HEIGHT = sizeStyles.dropdownHeight + 12;
    const [portalPos, setPortalPos] = useState<{
      left: number;
      top: number;
      width: number;
      maxHeight: number;
    } | null>(null);

    const updatePortalPos = useCallback(() => {
      const node = anchorRef.current;
      if (!node || typeof window === "undefined") {
        setPortalPos(null);
        return;
      }

      const rect = node.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const dropdownH = sizeStyles.dropdownHeight;
      const spaceBelow = vh - rect.bottom;
      const spaceAbove = rect.top;

      // open below if enough space; otherwise open above
      const openBelow = spaceBelow >= DROPDOWN_ESTIMATED_HEIGHT || spaceBelow >= spaceAbove;

      // compute top for fixed positioning (viewport coords)
      let top = openBelow ? rect.bottom + 6 : rect.top - dropdownH - 6;

      // clamp so popup remains on-screen
      const minTop = 8;
      const maxTop = Math.max(8, vh - dropdownH - 8);
      top = Math.min(Math.max(top, minTop), maxTop);

      // left and width (clamp right edge)
      let left = rect.left;
      let width = rect.width;
      const rightOverflow = left + width - vw;
      if (rightOverflow > 8) {
        left = Math.max(8, left - rightOverflow);
      }

      setPortalPos({ left, top, width, maxHeight: dropdownH });

      // also set openUpward (for backwards compatibility if needed)
      setOpenUpward(!openBelow);
    }, [sizeStyles.dropdownHeight]);


  useEffect(() => {
        if (!isOpen) return;
        updatePortalPos(); // initial compute
  
        const onUpdate = () => updatePortalPos();
        window.addEventListener("resize", onUpdate);
        window.addEventListener("scroll", onUpdate, true); // track ancestor scroll too
        return () => {
          window.removeEventListener("resize", onUpdate);
          window.removeEventListener("scroll", onUpdate, true);
        };
      }, [isOpen, updatePortalPos]);
  
      // handle toggle: compute portal position when opening
      const handleToggle = () => {
        if (disabled) return;
  
        const node = anchorRef.current;
        if (!node || typeof window === "undefined") {
          setIsOpen(prev => !prev);
          return;
        }
  
        const rect = node.getBoundingClientRect();
        const windowHeight = window.innerHeight;
  
        const spaceBelow = windowHeight - rect.bottom;
        const spaceAbove = rect.top;
  
        // maintain openUpward fallback
        if (spaceBelow < DROPDOWN_ESTIMATED_HEIGHT && spaceAbove > spaceBelow) {
          setOpenUpward(true);
        } else {
          setOpenUpward(false);
        }
  
        setIsOpen(prev => {
          const next = !prev;
          if (next) {
            setTimeout(() => updatePortalPos(), 0);
          } else {
            setPortalPos(null);
          }
          return next;
        });
      };
    /* ================= RENDER ================= */

    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === "function") ref(node);
            else ref.current = node;
          }
          anchorRef.current = node;
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
          onClick={handleToggle}
          style={{
            position: "relative",   // 👈 IMPORTANT
            height: currentSize.height,
            fontSize: currentSize.fontSize,
            padding: currentSize.padding,
            paddingLeft: leftIcon ? "38px" : "12px",    // 👈 SPACE FOR ICON
            borderRadius: "6px",
            backgroundColor: disabled ? "#f5f5f5" : theme.colors.background,
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
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
              color: isPlaceholder
                ? COLORS.placeholder
                : selectedTextColor
                  ? chosenSelectedColor
                  : "#000",
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
            ref={portalRef}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: portalPos.top,
                left: portalPos.left,
                width: portalPos.width,
                backgroundColor: theme.colors.background,
                border: "1px solid #ccc",
                borderRadius: "6px",
                zIndex: 9999,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                maxHeight: "260px",
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
              <div className="thin-scroll" style={{ overflowY: "auto", flex: 1 }}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onChange(opt[valueKey]);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid #f3f3f3",
                        cursor: "pointer",
                        backgroundColor:
                          opt[valueKey] === value
                            ? "#e6f0ff"
                            : theme.colors.background,
                      }}
                    >
                      {opt[labelKey]}
                    </div>
                  ))
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
