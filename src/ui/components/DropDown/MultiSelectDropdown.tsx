import { useState, useEffect, useRef, forwardRef } from "react";
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
    const [openUpward, setOpenUpward] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const sizeConfig = {
      sm: { height: "36px", padding: "6px 12px", fontSize: theme.fontSize.sm },
      md: { height: "44px", padding: "8px 16px", fontSize: theme.fontSize.md },
      lg: { height: "52px", padding: "10px 20px", fontSize: theme.fontSize.lg },
    };

    const currentSize = sizeConfig[size];

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

    // Click outside to close
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

    // Detect open upward
    const handleToggle = () => {
      if (disabled) return;

      const rect = containerRef.current?.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect) {
        const dropdownHeight = 300;
        setOpenUpward(rect.bottom + dropdownHeight > windowHeight);
      }

      setIsOpen(!isOpen);
    };

    // Display selected labels
    const selectedLabels =
      selectedValues.length > 0
        ? options
          .filter((opt) => selectedValues.includes(opt[valueKey]))
          .map((opt) => opt[labelKey])
          .join(", ")
        : placeholder;

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
      <div ref={ref || containerRef} style={{ width: "100%", position: "relative" }}>
        {/* Label */}
        {label && (
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontWeight: 500,
              fontSize: theme.fontSize.md,
              color: theme.colors.text,
            }}
          >
            {label}
            {required && <span style={{ color: theme.colors.error }}> *</span>}
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
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ color: selectedValues.length ? "#000" : "#888" }}>
            {selectedLabels}
          </span>

          {isOpen ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
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
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "6px",
              zIndex: 20,
              maxHeight: "300px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
                style={{
                  border: "none",
                  background: "none",
                  color: theme.colors.primary1,
                  cursor: "pointer",
                  fontSize: theme.fontSize.sm,
                }}
              >
                Select All
              </button>

              <button
                onClick={handleClearAll}
                style={{
                  border: "none",
                  background: "none",
                  color: theme.colors.error,
                  cursor: "pointer",
                  fontSize: theme.fontSize.sm,
                }}
              >
                Clear All
              </button>
            </div>

            {/* Options */}
            <div style={{ overflowY: "auto", flex: 1 }}>
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
                      : theme.colors.background,
                    color: selectedValues.includes(opt[valueKey])
                      ? theme.colors.text
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
          </div>
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
    );
  }
);

MultiSelectDropdown.displayName = "MultiSelectDropdown";