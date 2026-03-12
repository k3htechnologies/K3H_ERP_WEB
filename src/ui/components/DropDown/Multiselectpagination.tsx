import React, { useState, useEffect, useRef, useCallback } from "react";
import { THEME } from "@/core/constants/theme";

export interface DropdownOptions {
  label: string;
  value: string | number;
}

interface MultiSelectPaginationProps {
  label?: string;
  title?: string;
  options?: DropdownOptions[]; // optional when using dataFetchCallBack
  selectedValues: (string | number)[];
  required?: boolean;
  onChange: (updatedSelectedValues: (string | number)[]) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg";
  className?: string;
  error?: string;
  dataFetchCallBack?: (
    pageNumber: number,
    params?: { value?: string },
  ) => Promise<{ totalNumberOfRecord: number; itemList: DropdownOptions[] }>;
}

const MultiSelectPagination: React.FC<MultiSelectPaginationProps> = ({
  label,
  title,
  options: propOptions = [],
  selectedValues,
  required = false,
  onChange,
  disabled = false,
  style,
  size = "md",
  className = "",
  error,
  dataFetchCallBack,
}) => {
  const theme = THEME;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<DropdownOptions[]>(propOptions || []);
  const [filteredOptions, setFilteredOptions] = useState<DropdownOptions[]>(propOptions || []);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const pageRef = useRef(1);
  const SIZE_MAP = {
    sm: { fontSize: 12, paddingY: 6, paddingX: 12, height: 38, dropdownHeight: 150 },
    md: { fontSize: 16, paddingY: 8, paddingX: 16, height: 46, dropdownHeight: 200 },
    lg: { fontSize: 16, paddingY: 10, paddingX: 20, height: 54, dropdownHeight: 250 },
  };

  const currentSize = SIZE_MAP[size as keyof typeof SIZE_MAP] || SIZE_MAP.md;

  const hasSelections = selectedValues.length > 0;

  const fetchOptions = useCallback(
    async (reset?: boolean, search?: string) => {
      if (!dataFetchCallBack || isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);

      try {
        const currentPage = reset ? 1 : pageRef.current;
        const searchValue = search ?? searchTerm;

        const result = await dataFetchCallBack(currentPage, { value: searchValue });
        const list = Array.isArray(result?.itemList) ? result.itemList : [];
        const total = result?.totalNumberOfRecord ?? 0;

        setTotalRecords(total);

        if (reset) {
          // Reset mode: replace options and merge with propOptions
          const mergedOptions: DropdownOptions[] = [...(propOptions || [])];
          list.forEach((newOpt) => {
            if (!mergedOptions.some((opt) => String(opt.value) === String(newOpt.value))) {
              mergedOptions.push(newOpt);
            }
          });
          setOptions(mergedOptions);
          setFilteredOptions(mergedOptions);
          pageRef.current = 2;
        } else {
          // Append mode: add new options to existing ones
          setOptions((prev) => {
            const merged = [...prev];
            list.forEach((newOpt) => {
              if (!merged.some((opt) => String(opt.value) === String(newOpt.value))) {
                merged.push(newOpt);
              }
            });
            return merged;
          });
          setFilteredOptions((prev) => {
            const merged = [...prev];
            list.forEach((newOpt) => {
              if (!merged.some((opt) => String(opt.value) === String(newOpt.value))) {
                merged.push(newOpt);
              }
            });
            return merged;
          });
          pageRef.current = currentPage + 1;
        }
      } catch (err) {
        console.error("MultiSelectPagination fetch error:", err);
        // On error, at least keep the existing options
        if (reset) {
          setOptions(propOptions || []);
          setFilteredOptions(propOptions || []);
        }
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [dataFetchCallBack, propOptions, searchTerm],
  );

  // Filter options based on search input (local mode)
  useEffect(() => {
    if (dataFetchCallBack) return;
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = (options || []).filter((opt) => opt.label.toLowerCase().includes(lowerSearch));
    setFilteredOptions(filtered);
  }, [searchTerm, options, dataFetchCallBack]);

  // Clear options when dataFetchCallBack changes (e.g., department filter changes)
  useEffect(() => {
    if (!dataFetchCallBack) return;
    // Clear options when callback changes to force fresh fetch
    setOptions([]);
    setFilteredOptions([]);
  }, [dataFetchCallBack]);

  // Initial load when dropdown opens and reset when it closes
  useEffect(() => {
    if (!dataFetchCallBack) return;
    if (isOpen) {
      // Reset pagination when opening
      pageRef.current = 1;
      fetchOptions(true, searchTerm);
    } else {
      // Reset pagination when closing
      pageRef.current = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataFetchCallBack, isOpen]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loading || !dataFetchCallBack) return;

    const nearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;

    if (nearBottom && options.length < totalRecords) {
      const previousScrollHeight = el.scrollHeight;

      fetchOptions(false).then(() => {
        // restore scroll position
        requestAnimationFrame(() => {
          if (!scrollRef.current) return;

          const newScrollHeight = scrollRef.current.scrollHeight;
          scrollRef.current.scrollTop += newScrollHeight - previousScrollHeight;
        });
      });
    }
  }, [loading, options.length, totalRecords, fetchOptions, dataFetchCallBack]);
  // Add scroll event listener
  useEffect(() => {
    if (!isOpen || !dataFetchCallBack) return;
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      return () => {
        el.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isOpen, handleScroll, dataFetchCallBack]);

  // Sync when prop options change (local mode or merge with fetched options)
  useEffect(() => {
    if (dataFetchCallBack) {
      // When using dataFetchCallBack, merge propOptions with existing options
      if (propOptions && propOptions.length > 0) {
        setOptions((current) => {
          const merged = [...(propOptions || [])];
          current.forEach((opt) => {
            if (!merged.some((mOpt) => String(mOpt.value) === String(opt.value))) {
              merged.push(opt);
            }
          });
          return merged;
        });
        setFilteredOptions((current) => {
          const merged = [...(propOptions || [])];
          current.forEach((opt) => {
            if (!merged.some((mOpt) => String(mOpt.value) === String(opt.value))) {
              merged.push(opt);
            }
          });
          return merged;
        });
      }
      return;
    }
    setOptions(propOptions || []);
    setFilteredOptions(propOptions || []);
  }, [propOptions, dataFetchCallBack]);

  // Toggle selection of options
  const toggleSelect = (value: string | number) => {
    // Ensure type-safe comparison
    const isCurrentlySelected = selectedValues.some((sv) => String(sv) === String(value));
    const updated = isCurrentlySelected ? selectedValues.filter((v) => String(v) !== String(value)) : [...selectedValues, String(value)];

    onChange(updated);

  };

  // Handle search input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Reset pagination and fetch new results when search changes
    if (dataFetchCallBack && isOpen) {
      fetchOptions(true, value).then(() => {
        if (scrollRef.current) {
          try {
            scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
          } catch {
            scrollRef.current.scrollTop = 0;
          }
        }
      });
    }
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
  const selectedLabels = options.filter((opt) => selectedValues.some((sv) => String(sv) === String(opt.value))).map((opt) => opt.label);

  const visibleTags = selectedLabels.slice(0, 2);
  const remainingCount = selectedLabels.length - visibleTags.length;
  const displayTitle = selectedLabels.length > 0 ? selectedLabels.join(", ") : title || "select " + label;

  return (
    <div
      ref={dropdownRef}
      className={className}
      style={{
        width: "100%",
        position: "relative",
      }}
    >
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
          {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
        </label>
      )}

      <div
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        title={displayTitle}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between",
          fontWeight: theme.fontWeight.medium,
          height: `${currentSize.height}px`,
          padding: `${currentSize.paddingY}px ${currentSize.paddingX}px`,
          fontSize: currentSize.fontSize,
          borderRadius: theme.borderRadius.md,
          backgroundColor: disabled ? "#f5f5f5" : theme.colors.background,
          border: error ? `1px solid ${theme.colors.error}` : `1px solid ${theme.colors.border}`,
          cursor: disabled ? "not-allowed" : "pointer",
          color: theme.colors.text,
          userSelect: "none",
          boxSizing: "border-box",
          transition: "all 0.2s ease-in-out",
          boxShadow: isOpen ? theme.shadows.sm : "none",
          opacity: disabled ? 0.6 : 1,
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          minWidth: "150px",
          marginLeft: "0",
          ...style,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", flex: 1, gap: "6px" }} title={selectedLabels.join(", ")}>
          {hasSelections ? (
            <>
              {visibleTags.map((tagLabel, index) => (
                <div
                  key={`${tagLabel}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: currentSize.fontSize,
                    color: "#000",
                    fontWeight: theme.fontWeight.normal,
                  }}
                >
                  {tagLabel}
                  {index < visibleTags.length - 1 && <span style={{ margin: "0 4px", color: theme.colors.border }}>,</span>}
                </div>
              ))}
              {remainingCount > 0 && (
                <span
                  style={{
                    marginLeft: 4,
                    fontSize: currentSize.fontSize - 1,
                    color: theme.colors.text,
                    fontWeight: theme.fontWeight.medium,
                  }}
                >
                  +{remainingCount}
                </span>
              )}
            </>
          ) : (
            <span
              style={{
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: selectedLabels ? "#9ca3af" : theme.colors.textLight,
                fontWeight: "400",
              }}
              title={displayTitle}
            >
              {displayTitle}
            </span>
          )}
        </div>

        <svg
          width={currentSize.fontSize + 4}
          height={currentSize.fontSize + 4}
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
            right: 0,
            width: "100%",
            minWidth: "100%",
            maxHeight: `${currentSize.dropdownHeight}px`,
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
              padding: `${currentSize.paddingY}px ${currentSize.paddingX - 1}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              onClick={(e) => e.stopPropagation()}
              disabled={disabled}
              style={{
                width: "100%",
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.sm,
                outline: "none",
                fontSize: currentSize.fontSize,
                padding: "6px 8px",
                background: disabled ? "#f5f5f5" : "transparent",
                color: "#000",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              alignItems: "center",
              padding: `${currentSize.paddingY + 2}px ${currentSize.paddingX}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
              columnGap: "12px",
            }}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange(options.map((opt) => opt.value));
              }}
              style={{
                justifySelf: "start",
                cursor: "pointer",
                fontSize: currentSize.fontSize - 1,
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
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              style={{
                justifySelf: "end",
                cursor: "pointer",
                fontSize: currentSize.fontSize - 1,
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
            </span>
          </div>

          {/* Options list */}
          <div
            ref={scrollRef}
            className="thin-scroll"
            style={{
              maxHeight: currentSize.dropdownHeight - 48, // Leave room for header
              overflowY: "auto",
              padding: 0,
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {loading && options.length === 0 && (
              <div
                style={{
                  padding: theme.spacing.sm,
                  textAlign: "center",
                  color: theme.colors.textLight,
                  fontSize: currentSize.fontSize,
                }}
              >
                Loading...
              </div>
            )}
            {!loading && filteredOptions.length > 0 ? (
              <>
                {filteredOptions.map((opt) => {
                  const isSelected = selectedValues.some((sv) => String(sv) === String(opt.value));
                  return (
                    <div
                      key={`${String(opt.value)}-${opt.label}`}
                      style={{
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "center",
                        padding: `${currentSize.paddingY}px ${currentSize.paddingX + 16}px`,
                        borderRadius: theme.borderRadius.sm,
                        backgroundColor: isSelected ? "#e6f0ff" : "#fff",
                        cursor: disabled ? "not-allowed" : "pointer",
                        color: "#000",
                        fontSize: currentSize.fontSize,
                        transition: theme.transitions.normal,
                      }}
                      onClick={() => !disabled && toggleSelect(opt.value)}
                      onMouseEnter={(e) => {
                        if (!disabled && !isSelected) {
                          e.currentTarget.style.backgroundColor = "#e6f0ff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!disabled && !isSelected) {
                          e.currentTarget.style.backgroundColor = theme.colors.background;
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        style={{
                          marginRight: 8,
                          accentColor: theme.colors.primary,
                          cursor: "pointer",
                          width: `${currentSize.fontSize}px`,
                          height: `${currentSize.fontSize}px`,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: currentSize.fontSize }} title={opt.label}>
                        {opt.label}
                      </span>{" "}
                    </div>
                  );
                })}
                {loading && options.length > 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      color: theme.colors.primary,
                      fontSize: currentSize.fontSize - 2,
                      padding: theme.spacing.xs,
                    }}
                  >
                    Loading more...
                  </div>
                )}
                <div style={{ height: 12, pointerEvents: "none" }} />
              </>
            ) : !loading ? (
              <div
                style={{
                  padding: theme.spacing.sm,
                  textAlign: "center",
                  color: theme.colors.textLight,
                  fontSize: currentSize.fontSize,
                }}
              >
                {dataFetchCallBack ? "No options available" : "No records found"}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {error && <p style={{ color: theme.colors.error, fontSize: currentSize.fontSize - 2, marginTop: "8px" }}>{error}</p>}
    </div>
  );
};

export default MultiSelectPagination;
