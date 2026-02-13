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
import { useDebouncedCallback } from "@/core/hooks/useDebouncedCallback";

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
      isShowClearSelection = true
    },
    ref
  ) => {
    const theme = THEME;

    const anchorRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const portalRef = useRef<HTMLDivElement | null>(null);

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

    const themeFontSize =
      size === 'sm'
        ? `calc(${theme.fontSize.sm} - 1px)`
        : size === 'md'
          ? `calc(${theme.fontSize.md} - 1px)`
          : `calc(${theme.fontSize.lg} - 1px)`;


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

          // Update pageRef to next page for next fetch
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
      if (!el || loading || isFetchingRef.current || !isOpen) return;

      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const nearBottom = scrollHeight - scrollTop - clientHeight <= 10;

      // Check if we need to fetch more data
      if (nearBottom && options.length < totalRecords) {
        // Use the current pageRef value for next page
        fetchData(false);
      }
    }, [loading, options.length, totalRecords, fetchData, isOpen]);

    useEffect(() => {
      if (!isOpen) {
        // Reset scroll position when closed
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
        return;
      }

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

    // debounced search handler
    const debouncedSearch = useDebouncedCallback((value: string) => {
      setPage(1);
      pageRef.current = 1;
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
    }, 350);

    // search handlers (sticky search)
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      // trigger debounced search
      debouncedSearch(value);
    };

    const clearSearch = () => {
      setSearchText("");
      debouncedSearch.cancel?.();
      setPage(1);
      pageRef.current = 1;
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

    const clearSelection = () => {
      setSelectedItem(null);
      userSelectedRef.current = false;
      prevInitialValueRef.current = null;
      onSelected?.(null as any);
      setSearchText("");
      debouncedSearch.cancel?.();
      setPage(1);
      pageRef.current = 1;
      fetchData(true, "");
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
      return {
        padding: `${sizeStyles.padding}px ${sizeStyles.padding * 2 + 16}px`,
        fontSize: sizeStyles.fontSize,
        borderRadius: theme.borderRadius.sm,
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: selected
          ? "rgba(11,95,255,0.18)"
          : hovered
            ? "rgba(11,95,255,0.12)"
            : theme.colors.background,
        color: theme.colors.textSecondary,
        transition: theme.transitions.normal,
      };
    };

    // cleanup debounced callback on unmount
    useEffect(() => {
      return () => {
        debouncedSearch.cancel?.();
      };
    }, [debouncedSearch]);

    // close dropdown when clicking outside
    useEffect(() => {
      const handlePointerDown = (e: PointerEvent) => {
        const target = e.target as Node;

        if (
          anchorRef.current?.contains(target) ||
          portalRef.current?.contains(target)
        ) {
          return;
        }

        setIsOpen(false);
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };

      // capture phase = runs BEFORE React onClick
      document.addEventListener("pointerdown", handlePointerDown, true);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
        document.removeEventListener("keydown", handleEscape);
      };
    }, []);

    // PORTAL POSITIONING: compute where the portal should be placed (fixed coords)
    const [portalPos, setPortalPos] = useState<{
      left: number;
      top: number;
      width: number;
      maxHeight: number;
      openUpward: boolean;
    } | null>(null);

    const updatePortalPos = useCallback(() => {
      const buttonNode = buttonRef.current;
      const containerNode = anchorRef.current;
      if (!buttonNode || !containerNode || typeof window === "undefined") {
        setPortalPos(null);
        return;
      }

      // Use button's position for accurate attachment
      const rect = buttonNode.getBoundingClientRect();
      const containerRect = containerNode.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const preferredHeight = sizeStyles.dropdownHeight;
      const padding = 8;

      // Calculate exact content height based on number of items (no extra space)
      const searchBarHeight = 48; // search bar height (padding + input + border)
      // Item height: padding top/bottom + font size
      const itemHeight = (sizeStyles.padding * 2) + (sizeStyles.fontSize * 1.2);
      const optionsTopPadding = sizeStyles.padding; // spacing after search box (same as between options)
      const minHeight = searchBarHeight + optionsTopPadding + itemHeight; // minimum: search bar + spacing + at least one item
      const maxItems = Math.max(1, options.length);
      // Calculate exact content height: search bar + spacing + items (no extra padding)
      const contentHeight = searchBarHeight + optionsTopPadding + (maxItems * itemHeight);
      // Use exact content height when less than preferred, otherwise cap at preferred
      const calculatedHeight = contentHeight <= preferredHeight ? contentHeight : preferredHeight;

      // Calculate available space below and above
      const availableSpaceBelow = vh - rect.bottom - padding;
      const availableSpaceAbove = rect.top - padding;

      // Determine if we should open above or below
      const hasEnoughSpaceBelow = availableSpaceBelow >= calculatedHeight;
      const hasMoreSpaceAbove = availableSpaceAbove > availableSpaceBelow;

      let top: number;
      let maxHeight: number;
      let openUpward = false;

      if (hasEnoughSpaceBelow) {
        // Open below with calculated height - position exactly at bottom edge
        top = rect.bottom;
        maxHeight = calculatedHeight;
      } else if (hasMoreSpaceAbove && availableSpaceAbove >= minHeight) {
        // Open above - position exactly at top edge
        openUpward = true;
        maxHeight = Math.min(calculatedHeight, Math.max(minHeight, availableSpaceAbove));
        top = rect.top - maxHeight;
      } else {
        // Not enough space in either direction, open below with reduced height
        top = rect.bottom;
        maxHeight = Math.max(minHeight, availableSpaceBelow);
      }

      // Clamp top position to stay within viewport
      top = Math.max(padding, Math.min(top, vh - maxHeight - padding));

      // left and width (clamp right edge) - use container for width, button for left alignment
      let left = rect.left;
      let width = containerRect.width;
      const rightOverflow = left + width - vw;
      if (rightOverflow > padding) {
        left = Math.max(padding, left - rightOverflow);
      }

      setPortalPos({ left, top, width, maxHeight, openUpward });

      // Set openUpward based on calculated position
      setOpenUpward(openUpward);
    }, [sizeStyles.dropdownHeight, sizeStyles.padding, sizeStyles.fontSize, options.length]);

    useEffect(() => {
      if (!isOpen) return;
      // Use setTimeout to ensure DOM is updated before calculating position
      setTimeout(() => {
        updatePortalPos();
      }, 0);

      const onUpdate = () => updatePortalPos();
      window.addEventListener("resize", onUpdate);
      window.addEventListener("scroll", onUpdate, true); // track ancestor scroll too
      return () => {
        window.removeEventListener("resize", onUpdate);
        window.removeEventListener("scroll", onUpdate, true);
      };
    }, [isOpen, updatePortalPos, options.length]);

    // handle toggle: compute portal position when opening
    const handleToggle = () => {
      if (disabled) return;

      setIsOpen(prev => {
        const next = !prev;
        if (next) {
          // Reset pagination and fetch fresh data when opening dropdown
          pageRef.current = 1;
          setPage(1);
          setOptions([]); // Clear existing options
          // Reset scroll position
          if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
          }
          // Fetch fresh data
          fetchData(true, searchText);
          setTimeout(() => updatePortalPos(), 0);
        } else {
          setPortalPos(null);
        }
        return next;
      });
    };

    return (
      <>
        <style>{`
          .thin-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .thin-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .thin-scroll::-webkit-scrollbar-thumb {
            background-color: ${theme.colors.border};
            border-radius: 3px;
          }
          .thin-scroll::-webkit-scrollbar-thumb:hover {
            background-color: ${theme.colors.textSecondary || "#888"};
          }
        `}</style>
        <div
          ref={(node) => {
            // forward ref + local containerRef
            if (ref) {
              if (typeof ref === "function") ref(node);
              else (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
            anchorRef.current = node;
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
            ref={buttonRef}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={handleToggle}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: theme.fontWeight.normal,
              padding: `${sizeStyles.padding + 4}px ${sizeStyles.padding * 2}px`,
              fontSize: themeFontSize,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.colors.background,
              border: `0.5px solid ${displayError ? theme.colors.error : isOpen ? theme.colors.primary : theme.colors.border}`,
              cursor: disabled ? "not-allowed" : "pointer",
              color: theme.colors.text,
              userSelect: "none",
              boxSizing: "border-box",
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
                color: selectedItem
                  ? "#000"
                  : theme.colors.textLight,
                fontWeight: "400",
              }}
            >
              {selectedItem?.label ?? title}
            </span>

            {isShowClearSelection && selectedItem && !disabled && (
              <X
                size={14}
                style={{
                  marginRight: 6,
                  cursor: "pointer",
                  color: "#888"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              />
            )}


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
              ref={portalRef}
              onMouseDown={(e) => e.stopPropagation()} // avoid body click from closing while interacting
              style={{
                position: "fixed",
                left: portalPos.left,
                top: portalPos.top,
                width: portalPos.width,
                maxHeight: portalPos.maxHeight,
                overflow: "hidden",
                margin: 0,
                border: `1px solid ${theme.colors.border}`,
                borderTop: portalPos.openUpward ? `1px solid ${theme.colors.border}` : "none",
                borderBottom: portalPos.openUpward ? "none" : `1px solid ${theme.colors.border}`,
                borderLeft: `1px solid ${theme.colors.border}`,
                borderRight: `1px solid ${theme.colors.border}`,
                borderRadius: portalPos.openUpward
                  ? `${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0`
                  : `0 0 ${theme.borderRadius.sm} ${theme.borderRadius.sm}`,
                boxShadow: theme.shadows.lg,
                zIndex: 9999, // ensure above modal overlay
                padding: 0,
                background: theme.colors.background,
                boxSizing: "border-box",
              }}
            >
              {/* Sticky search bar */}
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 50,
                  padding: theme.spacing.sm,
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
                      padding: `${sizeStyles.padding + 2}px ${sizeStyles.padding * 2 + 24}px ${sizeStyles.padding + 2}px ${sizeStyles.padding * 2 + 24}px`,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.sm,
                      outline: "none",
                      fontSize: sizeStyles.fontSize,
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      boxSizing: "border-box",
                      transition: theme.transitions.normal,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.primary;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.border;
                    }}
                  />
                  <Search
                    size={sizeStyles.fontSize + 2}
                    color={theme.colors.textSecondary}
                    style={{
                      position: "absolute",
                      left: sizeStyles.padding + 4,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                  {searchText.trim() && (
                    <X
                      size={sizeStyles.fontSize + 2}
                      color={theme.colors.textSecondary}
                      style={{
                        position: "absolute",
                        right: sizeStyles.padding + 4,
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
                  paddingTop: sizeStyles.padding, // same spacing as between options
                  paddingBottom: 0, // no extra padding
                  boxSizing: "border-box",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${theme.colors.border} transparent`,
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
      </>
    );
  }
);

SingleSelectDropdownWithPagination.displayName = "SingleSelectDropdownWithPagination";

export default SingleSelectDropdownWithPagination;   