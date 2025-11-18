import { useState, useEffect, useRef, forwardRef } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import type { SinglePageSelectionProps } from "@/core/types/dropDownSelectionType";
import { THEME } from "@/core/constants/theme";

export const SinglePageSelection = forwardRef<
  HTMLDivElement,
  SinglePageSelectionProps & {
    labelKey?: string; 
    valueKey?: string; 
    searchable?: boolean;
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
    
    },
    ref
  ) => {
    const theme = THEME
    
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);

    const containerRef = useRef<HTMLDivElement>(null);

    const sizeConfig = {
      sm: { height: "36px", padding: "6px 12px", fontSize: theme.fontSize.sm },
      md: { height: "44px", padding: "8px 16px", fontSize: theme.fontSize.md },
      lg: { height: "52px", padding: "10px 20px", fontSize: theme.fontSize.lg },
    };

    const currentSize = sizeConfig[size];

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

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const selectedLabel =
      options.find((opt: any) => opt[valueKey] === value)?.[labelKey] ||
      placeholder;

    return (
      <div ref={ref || containerRef} style={{ width: "100%", position: "relative" }}>
        {/* Label */}
        {label && (
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              fontSize: theme.fontSize.md,
              color: "#333",
            }}
          >
            {label}
          </label>
        )}

        {/* Select box */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{
            height: currentSize.height,
            fontSize: currentSize.fontSize,
            padding: currentSize.padding,
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: disabled ? "#f5f5f5" : theme.colors.background,
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
              top: "102%",
              left: 0,
              right: 0,
              backgroundColor: theme.colors.background,
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginTop: "4px",
              zIndex: 20,
              maxHeight: "240px",
              overflowY: "auto",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            {/* Search input */}
            {searchable && (
              <div style={{ position: "relative", borderBottom: "1px solid #eee" }}>
                <Search
                  size={16}
                  color="#888"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    fontSize: theme.fontSize.md,
                    border: "none",
                    outline: "none",
                  }}
                />
              </div>
            )}

            {/* Options */}
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
                      opt[valueKey] === value ? "#e6f0ff" : theme.colors.background,
                  }}
                >
                  {opt[labelKey]}
                </div>
              ))
            ) : (
              <div style={{ padding: "12px", textAlign: "center", color: "#999" }}>
                No results found
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

SinglePageSelection.displayName = "SinglePageSelection";
