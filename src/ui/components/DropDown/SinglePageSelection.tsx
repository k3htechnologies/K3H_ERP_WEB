import { useState, useEffect, useRef, forwardRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, InfoIcon, Search } from "lucide-react";
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
    },
    ref
  ) => {
    const theme = THEME;

    const containerRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);

    /* ================= SIZE CONFIG (UNCHANGED) ================= */

    const sizeConfig = {
      sm: { height: "36px", padding: "6px 12px", fontSize: theme.fontSize.sm },
      md: { height: "44px", padding: "8px 16px", fontSize: theme.fontSize.md },
      lg: { height: "52px", padding: "10px 20px", fontSize: theme.fontSize.lg },
    };

    const currentSize = sizeConfig[size];

    /* ================= FILTER LOGIC (UNCHANGED) ================= */

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

    const selectedLabel =
      options.find((opt: any) => opt[valueKey] === value)?.[labelKey] ||
      placeholder;

    const chosenSelectedColor =
      selectedTextColor ?? theme.colors.primary ?? "#0b5fff";

    /* ================= PORTAL POSITION (ONLY NEW LOGIC) ================= */

    const DROPDOWN_HEIGHT = 300;

    const [portalPos, setPortalPos] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);

    const updatePortalPosition = useCallback(() => {
      const node = containerRef.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;

      const spaceBelow = vh - rect.bottom;
      const spaceAbove = rect.top;

      const openBelow =
        spaceBelow >= DROPDOWN_HEIGHT + 10 || spaceBelow >= spaceAbove;

      let top = openBelow
        ? rect.bottom + 4
        : rect.top - DROPDOWN_HEIGHT - 4;

      top = Math.max(8, Math.min(top, vh - DROPDOWN_HEIGHT - 8));

      setPortalPos({
        left: rect.left,
        top,
        width: rect.width, // 🔒 EXACT SAME WIDTH AS INPUT
      });
    }, []);

    useEffect(() => {
      if (!isOpen) return;

      updatePortalPosition();

      const onUpdate = () => updatePortalPosition();
      window.addEventListener("resize", onUpdate);
      window.addEventListener("scroll", onUpdate, true);

      return () => {
        window.removeEventListener("resize", onUpdate);
        window.removeEventListener("scroll", onUpdate, true);
      };
    }, [isOpen, updatePortalPosition]);

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
          onClick={handleToggle}
          style={{
            height: currentSize.height,
            fontSize: currentSize.fontSize,
            padding: currentSize.padding,
            borderRadius: "6px",
            backgroundColor: disabled
              ? "#f5f5f5"
              : theme.colors.background,
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${
              error ? theme.colors.error : theme.colors.border
            }`,
          }}
        >
          <span
            style={{
              color: selectedTextColor ? chosenSelectedColor : "#000",
              fontWeight: selectedTextColor ? "700" : "400",
            }}
          >
            {selectedLabel}
          </span>

          {isOpen ? (
            <ChevronUp size={20} color="#888" />
          ) : (
            <ChevronDown size={20} color="#888" />
          )}
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
