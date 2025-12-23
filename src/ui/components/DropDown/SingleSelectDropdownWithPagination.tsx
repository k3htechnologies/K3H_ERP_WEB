// SingleSelectDropdownWithPagination.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import { THEME } from "@/core/constants/theme";
import { InfoIcon, Search, X } from "lucide-react";
import type { SingleSelectWithPaginationProps } from "@/core/types/dropDownSelectionType";

export const SingleSelectDropdownWithPagination = forwardRef<
  HTMLDivElement,
  SingleSelectWithPaginationProps
>(
  (
    {
      dataFetchCallBack,
      onSelected,
      title,
      label,
      validator,
      initialValue,
      dataList = [],
      disabled = false,
      required = false,
      error: externalError,
      hasSubmitted = false,
      className = "",
      style,
      size = "md",
    },
    ref
  ) => {
    const theme = THEME;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const [options, setOptions] = useState(dataList);
    const [selectedItem, setSelectedItem] = useState(initialValue || null);
    const [searchText, setSearchText] = useState("");
    const [, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);
    const [, setOpenUpward] = useState(false);

    const isFetchingRef = useRef(false);
    const pageRef = useRef(1);
    const prevInitialValueRef = useRef<{ label: string; value: string | number } | null | undefined>(initialValue);
    const userSelectedRef = useRef(false); // Track if user made a selection

    const SIZE_MAP = {
      sm: { fontSize: 12, padding: 6, dropdownHeight: 150 },
      md: { fontSize: 14, padding: 6, dropdownHeight: 200 },
      lg: { fontSize: 16, padding: 6, dropdownHeight: 250 },
    };

    const sizeStyles = SIZE_MAP[size as keyof typeof SIZE_MAP];

    const fetchData = useCallback(
      async (reset?: boolean, search?: string) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoading(true);

        if (typeof dataFetchCallBack !== "function") {
          setLoading(false);
          isFetchingRef.current = false;
          return;
        }

        try {
          const currentPage = reset ? 1 : pageRef.current;
          const searchValue = search ?? searchText;

          const result = await dataFetchCallBack(currentPage, { value: searchValue });

          setOptions(prev => (reset ? result.itemList : [...prev, ...result.itemList]));
          setTotalRecords(result.totalNumberOfRecord ?? 0);

          pageRef.current = currentPage + 1;
          setPage(pageRef.current);
        } finally {
          setLoading(false);
          isFetchingRef.current = false;
        }
      },
      [dataFetchCallBack, searchText]
    );

    // initial load once
    useEffect(() => {
      fetchData(true);
    }, [fetchData]);

    // infinite scroll handler
    const handleScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el || loading) return;

      const nearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
      if (nearBottom && options.length < totalRecords) {
        fetchData(false);
      }
    }, [loading, options.length, totalRecords, fetchData]);

    useEffect(() => {
      if (!isOpen) return;
      const el = scrollRef.current;
      if (el) el.addEventListener("scroll", handleScroll);
      return () => {
        if (el) el.removeEventListener("scroll", handleScroll);
      };
    }, [isOpen, handleScroll]);

    // select item
    const handleSelect = (item: { label: string; value: string | number }) => {
      const selectedItemObj = { label: item.label, value: item.value };
      setSelectedItem(selectedItemObj);
      userSelectedRef.current = true;
      prevInitialValueRef.current = selectedItemObj;
      onSelected?.(selectedItemObj);
      setIsOpen(false);
      setSearchText("");
      if (validator) {
        setError(validator(item.value));
      } else if (required && !item.value) {
        setError(`${label || "This field"} is required`);
      } else {
        setError(undefined);
      }
    };

    // search handlers (sticky search)
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      setPage(1);
      // reset page and fetch new results, then scroll smoothly to top
      fetchData(true, value).then(() => {
        if (scrollRef.current) {
          try {
            scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
          } catch {
            scrollRef.current.scrollTop = 0;
          }
        }
      });
    };

    const clearSearch = () => {
      setSearchText("");
      setPage(1);
      fetchData(true, "").then(() => {
        if (scrollRef.current) {
          try {
            scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
          } catch {
            scrollRef.current.scrollTop = 0;
          }
        }
      });
    };

    // sync initialValue with selectedItem (preserve user selection)
    useEffect(() => {
      if (userSelectedRef.current) {
        const currentSelectedValue = selectedItem?.value;
        const newValue = initialValue?.value;
        if (newValue !== undefined && newValue !== null && newValue !== currentSelectedValue) {
          setSelectedItem(initialValue || null);
          prevInitialValueRef.current = initialValue;
          userSelectedRef.current = false;
        }
        return;
      }

      const prevValue = prevInitialValueRef.current?.value;
      const newValue = initialValue?.value;
      if (prevValue !== newValue) {
        setSelectedItem(initialValue || null);
        prevInitialValueRef.current = initialValue;
      } else if (initialValue !== prevInitialValueRef.current) {
        setSelectedItem(initialValue || null);
        prevInitialValueRef.current = initialValue;
      }
    }, [initialValue, selectedItem?.value]);

    // external validation and on submit validation
    useEffect(() => {
      if (externalError !== undefined) {
        setError(externalError);
        return;
      }

      if (!hasSubmitted) {
        setError(undefined);
        return;
      }

      if (validator) {
        setError(validator(selectedItem?.value));
      } else if (required && !selectedItem?.value) {
        setError(`${label || "This field"} is required`);
      } else {
        setError(undefined);
      }
    }, [selectedItem, validator, required, label, externalError, hasSubmitted]);

    const displayError = externalError !== undefined ? externalError : error;

    const getOptionStyles = (selected: boolean, hovered = false): React.CSSProperties => {
      const isActive = selected || hovered;
      return {
        padding: `${sizeStyles.padding}px ${sizeStyles.padding * 2 + 16}px`,
        fontSize: sizeStyles.fontSize,
        borderRadius: theme.borderRadius.sm,
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: isActive ? theme.colors.hover : theme.colors.background,
        color: theme.colors.textSecondary,
        transition: theme.transitions.normal,
      };
    };

    // close dropdown when clicking outside
    useEffect(() => {
      function handleDocClick(e: MouseEvent) {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
      // handle Escape key
      function handleKey(e: KeyboardEvent) {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleDocClick);
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("mousedown", handleDocClick);
        document.removeEventListener("keydown", handleKey);
      };
    }, []);

    // PORTAL POSITIONING: compute where the portal should be placed (fixed coords)
    const DROPDOWN_ESTIMATED_HEIGHT = sizeStyles.dropdownHeight + 12;
    const [portalPos, setPortalPos] = useState<{
      left: number;
      top: number;
      width: number;
      maxHeight: number;
    } | null>(null);

    const updatePortalPos = useCallback(() => {
      const node = containerRef.current;
      if (!node || typeof window === "undefined") {
        setPortalPos(null);
        return;
      }

      const rect = node.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const dropdownH = sizeStyles.dropdownHeight;
      const spaceBelow = vh - rect.bottom;
      const spaceAbove = rect.top;

      // open below if enough space; otherwise open above
      const openBelow = spaceBelow >= DROPDOWN_ESTIMATED_HEIGHT || spaceBelow >= spaceAbove;

      // compute top for fixed positioning (viewport coords)
      let top = openBelow ? rect.bottom + 6 : rect.top - dropdownH - 6;

      // clamp so popup remains on-screen
      const minTop = 8;
      const maxTop = Math.max(8, vh - dropdownH - 8);
      top = Math.min(Math.max(top, minTop), maxTop);

      // left and width (clamp right edge)
      let left = rect.left;
      let width = rect.width;
      const rightOverflow = left + width - vw;
      if (rightOverflow > 8) {
        left = Math.max(8, left - rightOverflow);
      }

      setPortalPos({ left, top, width, maxHeight: dropdownH });

      // also set openUpward (for backwards compatibility if needed)
      setOpenUpward(!openBelow);
    }, [sizeStyles.dropdownHeight]);

    useEffect(() => {
      if (!isOpen) return;
      updatePortalPos(); // initial compute

      const onUpdate = () => updatePortalPos();
      window.addEventListener("resize", onUpdate);
      window.addEventListener("scroll", onUpdate, true); // track ancestor scroll too
      return () => {
        window.removeEventListener("resize", onUpdate);
        window.removeEventListener("scroll", onUpdate, true);
      };
    }, [isOpen, updatePortalPos]);

    // handle toggle: compute portal position when opening
    const handleToggle = () => {
      if (disabled) return;

      const node = containerRef.current;
      if (!node || typeof window === "undefined") {
        setIsOpen(prev => !prev);
        return;
      }

      const rect = node.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;

      // maintain openUpward fallback
      if (spaceBelow < DROPDOWN_ESTIMATED_HEIGHT && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }

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

    return (
      <div
        ref={(node) => {
          // forward ref + local containerRef
          if (ref) {
            if (typeof ref === "function") ref(node);
            else (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
          containerRef.current = node;
        }}
        className={className}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          minWidth: "150px",
          marginLeft: "0",
          ...style,
        }}
      >
        {label && (
          <div
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: theme.fontSize.sm,
              fontWeight: theme.fontWeight.medium,
              color: theme.colors.text,
            }}
          >
            {label}
            {required && <span style={{ color: theme.colors.error, marginLeft: "4px" }}>*</span>}
          </div>
        )}

        <div
          role="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={handleToggle}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: theme.fontWeight.medium,
            padding: `${sizeStyles.padding + 2}px ${sizeStyles.padding * 2}px`,
            fontSize: sizeStyles.fontSize,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.background,
            border: `1px solid ${displayError ? theme.colors.error : theme.colors.border}`,
            cursor: disabled ? "not-allowed" : "pointer",
            color: theme.colors.text,
            userSelect: "none",
            boxSizing: "border-box",
            minHeight: "38px",
            transition: "all 0.2s ease-in-out",
            boxShadow: isOpen ? theme.shadows.sm : "none",
          }}
        >
          <span
            style={{
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: selectedItem ? theme.colors.black : "#888",
            }}
            className={selectedItem ? "font-medium" : "font-normal"}
          >
            {selectedItem?.label ?? title}
          </span>

          <svg
            width={sizeStyles.fontSize + 4}
            height={sizeStyles.fontSize + 4}
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0)",
              transition: theme.transitions.normal,
            }}
            fill="none"
            stroke={theme.colors.text}
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Portal popup: render into document.body so modal is not affected */}
        {isOpen && portalPos && typeof document !== "undefined" && createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()} // avoid body click from closing while interacting
            style={{
              position: "fixed",
              left: portalPos.left,
              top: portalPos.top,
              width: portalPos.width,
              maxHeight: portalPos.maxHeight,
              overflow: "hidden",
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.sm,
              boxShadow: theme.shadows.lg,
              zIndex: 9999, // ensure above modal overlay
              padding: 0,
              background: theme.colors.background,
            }}
          >
            {/* Sticky search bar */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                padding: 8,
                borderBottom: `1px solid ${theme.colors.border}`,
                background: theme.colors.background,
                display: "flex",
                alignItems: "center",
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={handleSearch}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: `${sizeStyles.padding}px ${sizeStyles.padding * 2 + 24}px`,
                    border: "1px solid transparent",
                    borderRadius: theme.borderRadius.sm,
                    outline: "none",
                    fontSize: sizeStyles.fontSize,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    boxSizing: "border-box",
                  }}
                />
                <Search
                  size={sizeStyles.fontSize + 2}
                  color={theme.colors.textSecondary}
                  style={{
                    position: "absolute",
                    left: sizeStyles.padding,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                {searchText.trim() && (
                  <X
                    size={sizeStyles.fontSize + 2}
                    color="#000"
                    style={{
                      position: "absolute",
                      right: sizeStyles.padding,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      clearSearch();
                    }}
                  />
                )}
              </div>
            </div>

            {/* Options with smooth scrolling */}
            <div
              ref={scrollRef}
              className="thin-scroll"
              style={{
                overflowY: "auto",
                maxHeight: portalPos.maxHeight - 48, // leave room for search
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                paddingBottom: 10,          // ensure last item not clipped
                boxSizing: "border-box",
              }}
              onMouseDown={(e) => {
                // prevent document mousedown from closing when interacting inside list
                e.stopPropagation();
              }}
            >
              {options.length > 0 ? (
                options.map(item => {
                  const selected = selectedItem?.value === item.value;
                  return (
                    <div
                      key={String(item.value)}
                      onClick={() => !disabled && handleSelect(item)}
                      onMouseEnter={e =>
                        !disabled && Object.assign(e.currentTarget.style, getOptionStyles(selected, true))
                      }
                      onMouseLeave={e =>
                        !disabled && Object.assign(e.currentTarget.style, getOptionStyles(selected, false))
                      }
                      style={{
                        ...getOptionStyles(selected),
                        borderRadius: theme.borderRadius.sm,
                      }}
                    >
                      {item.label}
                    </div>
                  );
                })
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

              {loading && (
                <div
                  style={{
                    textAlign: "center",
                    color: theme.colors.primary,
                    fontSize: theme.fontSize.xs,
                    padding: theme.spacing.xs,
                  }}
                >
                  Loading more...
                </div>
              )}
              <div style={{ height: 12, pointerEvents: "none" }} />
            </div>
          </div>,
          document.body
        )}

        {/* Error message */}
        {(error) && (
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
                height: 14
              }}
            />

            {error}
          </div>
        )}
      </div>
    );
  }
);

SingleSelectDropdownWithPagination.displayName = "SingleSelectDropdownWithPagination";

export default SingleSelectDropdownWithPagination;
