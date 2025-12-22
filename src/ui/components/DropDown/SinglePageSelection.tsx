import { useState, useEffect, useRef, forwardRef, useCallback } from "react";
import { ChevronDown, ChevronUp, InfoIcon, Search } from "lucide-react";
import type { SinglePageSelectionProps } from "@/core/types/dropDownSelectionType";
import { THEME } from "@/core/constants/theme";

export const SinglePageSelection = forwardRef<HTMLDivElement, SinglePageSelectionProps & {
  labelKey?: string;
  valueKey?: string;
  searchable?: boolean;
  error?: string;
  required?: boolean;
}
>(
  (
    {
      label,
      options,
      value,
      onChange,
      disabled = false,
      placeholder = "Select...",
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
    const [openUpward, setOpenUpward] = useState(false);
    const [dropdownMaxHeight, setDropdownMaxHeight] = useState(260);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const containerRef = useRef<HTMLDivElement>(null);

    const sizeConfig = {
      sm: { height: "36px", padding: "6px 12px", fontSize: theme.fontSize.sm },
      md: { height: "44px", padding: "8px 16px", fontSize: theme.fontSize.md },
      lg: { height: "52px", padding: "10px 20px", fontSize: theme.fontSize.lg },
    };

    const currentSize = sizeConfig[size];

    // FILTER LOGIC
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

    // CLICK OUTSIDE
    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // SELECTED LABEL
    const selectedLabel =
      options.find((opt: any) => opt[valueKey] === value)?.[labelKey] ||
      placeholder;

    // CALCULATE DROPDOWN POSITION AND SIZE BASED ON VIEWPORT
    const calculateDropdownPosition = useCallback(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Calculate available space
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Determine if dropdown should open upward
      const prefersUpward = spaceBelow < spaceAbove && spaceBelow < 200;
      setOpenUpward(prefersUpward);
      
      // Calculate max height based on available space
      const availableSpace = prefersUpward ? spaceAbove : spaceBelow;
      const searchHeight = searchable ? 50 : 0; // Approximate search input height
      const padding = 20; // Padding from viewport edges
      const calculatedMaxHeight = Math.max(
        150, // Minimum height
        Math.min(availableSpace - searchHeight - padding, 400) // Max 400px, but respect available space
      );
      setDropdownMaxHeight(calculatedMaxHeight);
      
      // Handle horizontal positioning for smaller screens
      const dropdownWidth = rect.width;
      const style: React.CSSProperties = {};
      
      // If dropdown would overflow on the right, constrain width
      if (rect.left + dropdownWidth > windowWidth - 10) {
        const maxWidth = windowWidth - rect.left - 10;
        style.maxWidth = `${Math.max(maxWidth, 200)}px`; // Minimum 200px width
      }
      
      setDropdownStyle(style);
    }, [searchable]);

    // DETECT SPACE FOR UPWARD OPEN
    const handleToggle = () => {
      if (disabled) return;
      
      if (!isOpen) {
        calculateDropdownPosition();
      }
      
      setIsOpen(!isOpen);
    };

    // Recalculate position when dropdown opens
    useEffect(() => {
      if (isOpen) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          calculateDropdownPosition();
        }, 0);
      }
    }, [isOpen, calculateDropdownPosition]);

    // Handle window resize to recalculate position
    useEffect(() => {
      if (!isOpen) return;

      const handleResize = () => {
        calculateDropdownPosition();
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }, [isOpen, calculateDropdownPosition]);

    return (
      <div
        ref={ref || containerRef}
        style={{ width: "100%", position: "relative" }}
      >
        {/* Label */}
        {label && (
          <label
            style={{
              display: "block",
              marginBottom: theme.spacing.sm,
              fontWeight: theme.fontWeight.medium,
              fontSize: theme.fontSize.sm,
              color: theme.colors.text,
            }}
          >
            {label}
            {required && <span style={{ color: theme.colors.error, marginLeft: '4px' }}>*</span>}
          </label>
        )}

        {/* Select box */}
        <div
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

          }}
        >
          <span style={{ color: value ? "#000" : "#888" }}>{selectedLabel}</span>
          {isOpen ? (
            <ChevronUp size={20} color="#888" />
          ) : (
            <ChevronDown size={20} color="#888" />
          )}
        </div>
        {/* Dropdown */}
        {isOpen && !disabled && (
          <div
            style={{
              position: "absolute",
              top: openUpward ? "auto" : "102%",
              bottom: openUpward ? "102%" : "auto",
              left: 0,
              right: 0,
              width: "100%",
              ...dropdownStyle,
              backgroundColor: theme.colors.background,
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginTop: openUpward ? "0" : "4px",
              marginBottom: openUpward ? "4px" : "0",
              zIndex: 20,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              maxHeight: `${dropdownMaxHeight}px`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Search input (sticky) */}
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

            {/* Scrollable options */}
            <div className="thin-scroll" style={{ overflowY: "auto", flex: 1 }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt: any, idx: number) => {
                  const isSelected = opt[valueKey] === value;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        onChange(opt[valueKey]);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = "#e6f0ff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = isSelected
                          ? "#e6f0ff"
                          : theme.colors.background;
                      }}
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid #f3f3f3",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#e6f0ff" : theme.colors.background,
                      }}
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
          </div>
        )}
        {/* Error message */}
        {(error ) && (
          <div
            style={{
              marginTop: theme.spacing.sm,
              fontSize: theme.fontSize.sm,
              color: error ? theme.colors.error : theme.colors.textSecondary,
              display: "flex",
              alignItems: "center",
              gap: "6px",       // spacing between icon & text
            }}
          >
            <InfoIcon
              style={{
                fontSize: theme.fontSize.xs,
                color: error ? theme.colors.error : theme.colors.textSecondary,
                height:14
              }}
            />

            {error }
          </div>
        )}
      </div>
    );
  }
);

SinglePageSelection.displayName = "SinglePageSelection";
