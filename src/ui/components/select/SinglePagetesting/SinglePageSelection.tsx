import { useState, useEffect, useRef, forwardRef } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export interface DropdownOption {
  DepartmentName: string | "";
  value: string | number;
  DepartmentCode?: string;
  LastModifiedBy?: string;
  LastModifiedDate?: string | null;
}

export interface SinglePageSelectionProps {
  label?: string;
  options: DropdownOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  theme?: {
    spacing: Record<string, string>;
    fontSize: Record<string, string>;
  };
}

export const SinglePageSelection = forwardRef<
  HTMLDivElement,
  SinglePageSelectionProps
>(
  (
    {
      label,
      options,
      value,
      onChange,
      disabled = false,
      placeholder = "Select...",
      size = "md",
      theme = {
        spacing: { sm: "4px", md: "8px", lg: "12px", xl: "16px", xxl: "20px" },
        fontSize: { sm: "12px", md: "14px", lg: "16px" },
      },
    },
    ref //  Added this to fix the forwardRef warning
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const containerRef = useRef<HTMLDivElement>(null);

    const sizeConfig = {
      sm: { height: "36px", padding: `${theme.spacing.sm} ${theme.spacing.lg}`, fontSize: theme.fontSize.sm, iconSize: 16 },
      md: { height: "44px", padding: `${theme.spacing.md} ${theme.spacing.xl}`, fontSize: theme.fontSize.md, iconSize: 20 },
      lg: { height: "52px", padding: `${theme.spacing.lg} ${theme.spacing.xxl}`, fontSize: theme.fontSize.lg, iconSize: 24 },
    };

    const currentSize = sizeConfig[size];

    //  Filter options by DepartmentName
    useEffect(() => {
      if (searchTerm.trim() === "") {
        setFilteredOptions(options);
      } else {
        const filtered = options.filter((opt) =>
          opt.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }, [searchTerm, options]);

    //  Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: DropdownOption) => {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm("");
    };

    const selectedLabel =
      options.find((opt) => opt.value === value)?.DepartmentName || placeholder;

    return (
      <div ref={ref || containerRef} style={{ position: "relative", width: "100%" }}>
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

         {/* Select Box  */}
        <div
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          style={{
            height: currentSize.height,
            padding: currentSize.padding,
            fontSize: currentSize.fontSize,
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: disabled ? "#f5f5f5" : "#fff",
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: value ? "#000" : "#888" }}>{selectedLabel}</span>
          {isOpen ? (
            <ChevronUp color="#007BFF" size={currentSize.iconSize} />
          ) : (
            <ChevronDown color="#007BFF" size={currentSize.iconSize} />
          )}
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginTop: "4px",
              zIndex: 10,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Search Box */}
            <div style={{ position: "relative", borderBottom: "1px solid #eee" }}>
              <Search
                size={16}
                color="#999"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  border: "none",
                  outline: "none",
                  fontSize: theme.fontSize.md,
                }}
              />
            </div>

            {/* Options */}
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      backgroundColor: value === opt.value ? "#e6f0ff" : "#fff",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f9ff")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        value === opt.value ? "#e6f0ff" : "#fff")
                    }
                  >
                    {opt.DepartmentName}
                  </div>
                ))
              ) : (
                <div style={{ padding: "10px", textAlign: "center", color: "#888" }}>
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SinglePageSelection.displayName = "SinglePageSelection";
