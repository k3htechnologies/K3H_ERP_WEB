import { useState, useEffect, useRef, forwardRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { THEME } from "@/core/constants/theme";

export const MultiSelectDropdown = forwardRef<
  HTMLDivElement,
  {
    label?: string;
    options: Record<string, any>[];
    selectedValues: (string | number)[];
    onChange: (values: (string | number)[]) => void;
    disabled?: boolean;
    placeholder?: string;
    size?: "sm" | "md" | "lg";
    required?: boolean;
    error?: string;
    labelKey?: string;
    valueKey?: string;
    searchable?: boolean;
  }
>(
  (
    {
      label,
      options,
      selectedValues,
      onChange,
      disabled = false,
      placeholder = "Select",
      labelKey = "label",
      valueKey = "value",
      searchable = true,
      size = "md",
      required = false,
      error,
    },
    ref
  ) => {
    const theme = THEME;

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);

    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const portalRef = useRef<HTMLDivElement | null>(null);

    // const sizeConfig = {
    //   sm: { height: "38px", padding: "6px 12px", fontSize: theme.fontSize.sm, dropdownHeight: 200 },
    //   md: { height: "46px", padding: "8px 16px", fontSize: theme.fontSize.md, dropdownHeight: 250 },
    //   lg: { height: "54px", padding: "10px 20px", fontSize: theme.fontSize.lg, dropdownHeight: 300 },
    // };
    const sizeConfig = {
      sm: { height: "36px", padding: "6px 12px", fontSize: theme.fontSize.sm, dropdownHeight: 150, paddingNum: 6 },
      md: { height: "44px", padding: "8px 16px", fontSize: theme.fontSize.md, dropdownHeight: 200, paddingNum: 8 },
      lg: { height: "52px", padding: "10px 20px", fontSize: theme.fontSize.lg, dropdownHeight: 250, paddingNum: 10 },
    };

    const currentSize = sizeConfig[size];

    // Portal positioning state
    const [portalPos, setPortalPos] = useState<{
      left: number;
      top: number;
      width: number;
      maxHeight: number;
      openUpward: boolean;
    } | null>(null);

    // Filter options
    useEffect(() => {
      if (!searchTerm.trim()) {
        setFilteredOptions(options);
      } else {
        setFilteredOptions(
          options.filter((opt: any) =>
            String(opt[labelKey]).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
    }, [searchTerm, options]);

    // Portal position calculation
    const updatePortalPos = useCallback(() => {
      const buttonNode = buttonRef.current;
      const containerNode = containerRef.current;
      if (!buttonNode || !containerNode || typeof window === "undefined") {
        setPortalPos(null);
        return;
      }

      const rect = buttonNode.getBoundingClientRect();
      const containerRect = containerNode.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const preferredHeight = currentSize.dropdownHeight;
      const padding = 8;

      // Calculate content height
      const searchBarHeight = searchable ? 48 : 0;
      const selectAllHeight = 40;
      const itemHeight = 44; // approximate item height
      const minHeight = searchBarHeight + selectAllHeight + itemHeight;
      const maxItems = Math.max(1, filteredOptions.length);
      const contentHeight = searchBarHeight + selectAllHeight + (maxItems * itemHeight);
      const calculatedHeight = contentHeight <= preferredHeight ? contentHeight : preferredHeight;

      // Calculate available space
      const availableSpaceBelow = vh - rect.bottom - padding;
      const availableSpaceAbove = rect.top - padding;

      const hasEnoughSpaceBelow = availableSpaceBelow >= calculatedHeight;
      const hasMoreSpaceAbove = availableSpaceAbove > availableSpaceBelow;

      let top: number;
      let maxHeight: number;
      let openUpward = false;

      if (hasEnoughSpaceBelow) {
        top = rect.bottom;
        maxHeight = calculatedHeight;
      } else if (hasMoreSpaceAbove && availableSpaceAbove >= minHeight) {
        openUpward = true;
        maxHeight = Math.min(calculatedHeight, Math.max(minHeight, availableSpaceAbove));
        top = rect.top - maxHeight;
      } else {
        top = rect.bottom;
        maxHeight = Math.max(minHeight, availableSpaceBelow);
      }

      // Clamp top position
      top = Math.max(padding, Math.min(top, vh - maxHeight - padding));

      // Calculate left and width
      let left = rect.left;
      let width = containerRect.width;
      const rightOverflow = left + width - vw;
      if (rightOverflow > padding) {
        left = Math.max(padding, left - rightOverflow);
      }

      setPortalPos({ left, top, width, maxHeight, openUpward });
    }, [currentSize.dropdownHeight, filteredOptions.length, searchable]);

    // Update portal position when dropdown opens or options change
    useEffect(() => {
      if (!isOpen) return;
      setTimeout(() => {
        updatePortalPos();
      }, 0);

      const onUpdate = () => updatePortalPos();
      window.addEventListener("resize", onUpdate);
      window.addEventListener("scroll", onUpdate, true);
      return () => {
        window.removeEventListener("resize", onUpdate);
        window.removeEventListener("scroll", onUpdate, true);
      };
    }, [isOpen, updatePortalPos, filteredOptions.length]);

    // Click outside to close
    useEffect(() => {
      const handlePointerDown = (e: PointerEvent) => {
        const target = e.target as Node;
        if (
          containerRef.current?.contains(target) ||
          portalRef.current?.contains(target)
        ) {
          return;
        }
        setIsOpen(false);
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };

      document.addEventListener("pointerdown", handlePointerDown, true);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
        document.removeEventListener("keydown", handleEscape);
      };
    }, []);

    // Toggle dropdown
    const handleToggle = () => {
      if (disabled) return;
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

    // Display selected labels (show only 3, then + count)
    const allSelectedLabels = selectedValues.length > 0
      ? options
        .filter((opt) => selectedValues.includes(opt[valueKey]))
        .map((opt) => opt[labelKey])
      : [];

    const visibleTags = allSelectedLabels.slice(0, 3);
    const remainingCount = allSelectedLabels.length - visibleTags.length;
    const hasSelections = selectedValues.length > 0;

    const toggleSelection = (val: string | number) => {
      if (selectedValues.includes(val)) {
        onChange(selectedValues.filter((v) => v !== val));
      } else {
        onChange([...selectedValues, val]);
      }
    };

    // --- SELECT ALL ---
    const handleSelectAll = () => {
      const allValues = options.map((o) => o[valueKey]);
      onChange(allValues);
    };

    // --- CLEAR ALL ---
    const handleClearAll = () => {
      onChange([]);
    };

    return (
      <>
        <style>{`
          .thin-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .thin-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .thin-scroll::-webkit-scrollbar-thumb {
            background-color: ${theme.colors.border};
            border-radius: 3px;
          }
          .thin-scroll::-webkit-scrollbar-thumb:hover {
            background-color: ${theme.colors.textSecondary || "#888"};
          }
        `}</style>
        <div ref={ref || containerRef} style={{ width: "100%", position: "relative" }}>
          {/* Label */}
          {label && (
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: 500,
                fontSize: theme.fontSize.sm,
                color: theme.colors.text
                ,
              }}
            >
              {label}
              {required && <span style={{ color: theme.colors.error }}> *</span>}
            </label>
          )}

          {/* Select box */}
          <div
            ref={buttonRef}
            onClick={handleToggle}
            style={{
              height: currentSize.height,
              fontSize: currentSize.fontSize,
              padding: currentSize.padding,
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
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", flex: 1, gap: "6px" }}>
              {hasSelections ? (
                <>
                  {visibleTags.map((tagLabel, index) => {
                    return (
                      <div
                        key={`${tagLabel}-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontSize: currentSize.fontSize,
                          fontFamily: "inherit",
                          fontWeight: theme.fontWeight.normal,
                          // color: theme.colors.text,
                          color: "#000",
                        }}
                      >
                        {tagLabel}
                        {index < visibleTags.length - 1 && (
                          <span style={{ margin: "0 4px", color: theme.colors.border }}>,</span>
                        )}
                      </div>
                    );
                  })}
                  {remainingCount > 0 && (
                    <span
                      style={{
                        marginLeft: 4,
                        fontSize: `${(parseFloat(String(currentSize.fontSize).replace('px', '')) || 14) - 1}px`,
                        color: "#000",
                        fontWeight: theme.fontWeight.normal,
                      }}
                    >
                      +{remainingCount}
                    </span>
                  )}
                </>
              ) : (
                <span
                  style={{
                    fontSize: currentSize.fontSize,
                    color: "#9ca3af",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {placeholder}
                </span>
              )}
            </div>

            {isOpen ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
          </div>

          {/* Portal Dropdown */}
          {isOpen && !disabled && portalPos && typeof document !== "undefined" && createPortal(
            <div
              ref={portalRef}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                left: portalPos.left,
                top: portalPos.top,
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
                background: theme.colors.background,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Search */}
              {searchable && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#fff",
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
                      border: "none",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              {/* Select All / Clear All */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#fafafa",
                }}
              >
                <button
                  onClick={handleSelectAll}
                  type="button"
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: theme.fontSize.sm,
                    color: "#6b7280",
                    transition: theme.transitions.fast,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#4b5563";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#6b7280";
                  }}
                >
                  Select All
                </button>

                <button
                  onClick={handleClearAll}
                  type="button"
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: theme.fontSize.sm,
                    color: "#6b7280",
                    transition: theme.transitions.fast,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#4b5563";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#6b7280";
                  }}
                >
                  Clear All
                </button>
              </div>

              {/* Options */}
              <div
                className="thin-scroll"
                style={{
                  overflowY: "auto",
                  flex: 1,
                  maxHeight: portalPos.maxHeight - (searchable ? 48 : 0) - 40, // leave room for search and select all
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                  boxSizing: "border-box",
                }}
              >
                {filteredOptions.map((opt: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => toggleSelection(opt[valueKey])}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #f3f3f3",
                      cursor: "pointer",
                      backgroundColor: selectedValues.includes(opt[valueKey])
                        ? theme.colors.hover
                        : '#fff',
                      color: selectedValues.includes(opt[valueKey])
                        ? "#000"
                        : theme.colors.textSecondary,
                      borderRadius: theme.borderRadius.sm,
                      transition: theme.transitions.normal,
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(opt[valueKey])}
                      readOnly
                      style={{
                        marginRight: 8,
                        accentColor: theme.colors.primary1,
                        cursor: "pointer",
                      }}
                    />
                    {opt[labelKey]}
                  </div>

                ))}

                {filteredOptions.length === 0 && (
                  <div style={{ padding: "12px", textAlign: "center", color: "#999" }}>
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
              }}
            >
              {error}
            </div>
          )}
        </div>
      </>
    );
  }
);

MultiSelectDropdown.displayName = "MultiSelectDropdown";