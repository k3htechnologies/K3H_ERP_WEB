import React, { useState, useEffect, useRef } from "react";
import { THEME } from "@/core/constants/theme";

export interface DropdownOptions {
  label: string;
  value: string | number;
}

interface MultiSelectPaginationProps {
  label?: string;
  options: DropdownOptions[];
  selectedValues: (string | number)[];
  required?: boolean;
  onChange: (updatedSelectedValues: (string | number)[]) => void;
  disabled?: boolean;
  hasSubmitted?:boolean;

}

const MultiSelectPagination: React.FC<MultiSelectPaginationProps> = ({
  label,
  options,
  selectedValues,
  hasSubmitted = false,
  required = false,
  onChange,
  disabled = false,
}) => {
  const theme = THEME;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<DropdownOptions[]>(options);
  const [error, setError] = useState<string | undefined>(undefined);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasSelections = selectedValues.length > 0;

  // Filter options based on search input
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerSearch)
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Validate required field on selection change
  // useEffect(() => {
  //   if (required && selectedValues.length === 0) {
  //     setError(`${label || "This field"} is required`);
  //   } else {
  //     setError(undefined);
  //   }
  // }, [selectedValues, required, label]);
useEffect(() => {
  if (hasSubmitted) {
    if (required && selectedValues.length === 0) {
      setError(`${label || "This field"} is required`);
    } else {
      setError(undefined);
    }
  }
}, [hasSubmitted, selectedValues, required, label]);

  // Toggle selection of options
  const toggleSelect = (value: string | number) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    onChange(updated);

    if (required && updated.length === 0) {
      setError(`${label || "This field"} is required`);
    } else {
      setError(undefined);
    }
  };



  // Handle search input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Close the dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Selected labels and visible tags (up to 4)
  const selectedLabels = options
    .filter((opt) => selectedValues.includes(opt.value))
    .map((opt) => opt.label);

  const visibleTags = selectedLabels.slice(0, 4);
  const remainingCount = selectedLabels.length - visibleTags.length;

  return (
    <div
      ref={dropdownRef}
      style={{
        width: "100%",
        maxWidth: "400px",
        position: "relative",
      }}
    >
      {label && (
        <label
          style={{
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.medium,
            color: theme.colors.text,
            marginBottom: "6px",
            display: "block",
          }}
        >
          {label}
          {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
        </label>
      )}

      <div
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between",
          fontWeight: theme.fontWeight.medium,
          padding: "8px 12px",
          fontSize: theme.fontSize.md,
          borderRadius: theme.borderRadius.md,
          backgroundColor: disabled ? "#f5f5f5" : theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
          cursor: disabled ? "not-allowed" : "pointer",
          color: theme.colors.text,
          userSelect: "none",
          boxSizing: "border-box",
          minHeight: "38px",
          transition: "all 0.2s ease-in-out",
          boxShadow: isOpen ? theme.shadows.sm : "none",
          opacity: disabled ? 0.6 : 1,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", flex: 1, gap: "6px" }}>
          {visibleTags.map((tagLabel, index) => (
            <div
              key={`${tagLabel}-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: theme.fontSize.sm,
                color: theme.colors.text,
              }}
            >
              {tagLabel}
              {index < visibleTags.length - 1 && (
                <span style={{ margin: "0 4px", color: theme.colors.border }}>,</span>
              )}
            </div>
          ))}
          {remainingCount > 0 && (
            <span
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.text,
                fontWeight: theme.fontWeight.medium,
              }}
            >
              + {remainingCount} more
            </span>
          )}

          <input
            type="text"
            placeholder={hasSelections ? "" : "Search..."}
            value={searchTerm}
            onChange={handleSearch}
            disabled={disabled}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              minWidth: "100px",
              fontSize: theme.fontSize.md,
              padding: "0",
              background: "transparent",
              cursor: disabled ? "not-allowed" : "text",
              color: hasSelections ? theme.colors.text : "#888",
              fontWeight: "normal",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
        </div>

        <svg
          width={18}
          height={18}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: theme.transitions.normal,
            pointerEvents: "none",
            flexShrink: 0,
            marginLeft: "8px",
          }}
          fill="none"
          stroke={theme.colors.text}
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            width: "100%",
            maxHeight: "200px",
            overflow: "hidden",
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.sm,
            boxShadow: theme.shadows.lg,
            zIndex: 999,
            padding: 0,
            background: theme.colors.background,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 10px",
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            <button
              onClick={() => onChange(options.map((opt) => opt.value))}
              style={{
                padding: "6px 10px",
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Select All
            </button>
            <button
              onClick={() => onChange([])}
              style={{
                padding: "6px 10px",
                backgroundColor: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Clear All
            </button>
          </div>

          <div style={{ maxHeight: "150px", overflowY: "auto", padding: "8px 10px" }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  style={{
                    marginBottom: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: selectedValues.includes(opt.value)
                      ? theme.colors.hover
                      : theme.colors.background,
                    cursor: disabled ? "not-allowed" : "pointer",
                    color: theme.colors.text,
                    fontSize: theme.fontSize.sm,
                    transition: theme.transitions.normal,
                  }}
                  onClick={() => !disabled && toggleSelect(opt.value)}
                >
                  <span>{opt.label}</span>
                  {selectedValues.includes(opt.value) && (
                    <span style={{ color: theme.colors.primary }}>✓</span>
                  )}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: theme.spacing.sm,
                  textAlign: "center",
                  color: theme.colors.textLight,
                }}
              >
                No records found
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p style={{ color: theme.colors.error, fontSize: theme.fontSize.sm, marginTop: "8px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default MultiSelectPagination;
