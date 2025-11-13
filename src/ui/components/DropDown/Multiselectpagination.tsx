import type { MultiSelectPaginationProps } from "@/core/types/dropDownSelectionType";
import React, { useState, useEffect, useRef } from "react";

export interface DropdownOptions {
  label: string;
  value: string | number;
}


const MultiSelectPagination: React.FC<MultiSelectPaginationProps> = ({
  label,
  options,
  selectedValues,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<DropdownOptions[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Filter options based on search
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerSearch)
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // ✅ Toggle selection
  const toggleSelect = (value: string | number) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(updated);
  };

  // ✅ Select all options
  const selectAll = () => {
    onChange(options.map((opt) => opt.value));
  };

  // ✅ Deselect all options
  const deselectAll = () => {
    onChange([]);
  };

  // ✅ Remove single tag
  const removeTag = (value: string | number) => {
    onChange(selectedValues.filter((v) => v !== value));
  };

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
      {/* Label */}
      {label && (
        <label
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#333",
            marginBottom: "6px",
            display: "block",
          }}
        >
          {label}
        </label>
      )}

      {/* Search & Tag Container with Dropdown Arrow */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          minHeight: "44px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "6px 10px",
          background: "#fff",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {/* Selected Tags */}
        {visibleTags.map((label, index) => (
          <div
            key={`${label}-${index}`}
            style={{
              backgroundColor: "#e0f2fe",
              color: "#0369a1",
              padding: "4px 8px",
              borderRadius: "4px",
              marginRight: "6px",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              fontSize: "13px",
            }}
          >
            {label}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const opt = options.find((o) => o.label === label);
                if (opt) removeTag(opt.value);
              }}
              style={{
                background: "none",
                border: "none",
                marginLeft: "6px",
                color: "#0369a1",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ×
            </button>
          </div>
        ))}

        {/* +X More Indicator */}
        {remainingCount > 0 && (
          <span
            style={{
              fontSize: "14px",
              color: "#333",
              fontWeight: 500,
              marginBottom: "4px",
            }}
          >
            + {remainingCount} more
          </span>
        )}

        {/* Search Input */}
        <input
          type="text"
          placeholder={selectedValues.length > 0 ? "" : "Search departments..."}
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flexGrow: 1,
            border: "none",
            outline: "none",
            minWidth: "100px",
            fontSize: "14px",
            padding: "6px",
          }}
        />

        {/* ▼ Arrow Icon */}
        <span
          style={{
            position: "absolute",
            right: "10px",
            fontSize: "16px",
            color: "#666",
            pointerEvents: "none",
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "6px",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 999,
            maxHeight: "300px",
            overflowY: "auto",
            padding: "8px 10px",
          }}
        >
          {/* Select / Deselect All */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <button
              onClick={selectAll}
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
              onClick={deselectAll}
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

          {/* Options */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                style={{
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <label style={{ cursor: "pointer", fontSize: "14px" }}>
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(opt.value)}
                    onChange={() => toggleSelect(opt.value)}
                    style={{
                      marginRight: "8px",
                      cursor: "pointer",
                      accentColor: "#007bff",
                    }}
                  />
                  {opt.label}
                </label>
              </div>
            ))
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "#f59e0b",
                fontSize: "14px",
                fontWeight: 500,
                margin: "10px 0",
              }}
            >
              No departments found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectPagination;
