import React, { useState, useEffect, useRef } from "react";

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface MultiSelectPaginationProps {
  label?: string;
  options: DropdownOption[];
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
}

const MultiSelectPagination: React.FC<MultiSelectPaginationProps> = ({
  label,
  options,
  selectedValues,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>(options);
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

  // ✅ Select all
  const selectAll = () => {
    onChange(options.map((opt) => opt.value));
  };

  // ✅ Clear all
  const clearAll = () => {
    onChange([]);
  };

  // ✅ Toggle single selection
  const toggleSelect = (value: string | number) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(updated);
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

      {/* Search & Tag Container */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          overflowX: "auto",
          whiteSpace: "nowrap",
          minHeight: "44px",
          maxHeight: "44px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "6px 10px",
          background: "#fff",
          cursor: "pointer",
          position: "relative",
          scrollbarWidth: "none",
        }}
      >
        <style>
          {`
            ::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {/* Selected Tags */}
        {visibleTags.map((label, index) => (
          <div
            key={`${label}-${index}`}
            style={{
              backgroundColor: "#e0f2fe",
              color: "#0369a1",
              padding: "2px 6px",
              borderRadius: "4px",
              marginRight: "6px",
              display: "inline-flex",
              alignItems: "center",
              fontSize: "13px",
              maxWidth: "100px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
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
                marginLeft: "4px",
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
              fontSize: "13px",
              color: "#555",
              fontWeight: 500,
              marginRight: "8px",
            }}
          >
            +{remainingCount} more
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
            fontSize: "14px",
            padding: "6px 0",
            minWidth: "0",
            width: "100%",
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
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {/* ✅ Sticky Header with Select All / Clear All */}
          <div
            style={{
              position: "sticky",
              top: 0,
              background: "#fff",
              zIndex: 10,
              padding: "8px 10px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "flex-start",
              gap: "20px",
            }}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                selectAll();
              }}
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              Select All
            </span>

            <span
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#dc2626",
                cursor: "pointer",
              }}
            >
              Clear All
            </span>
          </div>

          {/* ✅ Scrollable Options */}
          <div
            style={{
              padding: "8px 10px",
            }}
          >
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
                  <label style={{ cursor: "pointer", fontSize: "14px", lineHeight: "1.4" }}>
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
        </div>
      )}
    </div>
  );
};

export default MultiSelectPagination;
