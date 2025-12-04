import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import { THEME } from "@/core/constants/theme";
import { Search, X } from "lucide-react";
import type { MultiSelectPaginationProps } from "@/core/types/dropDownSelectionType";

export interface DropdownOptions {
  label: string;
  value: string | number;
}

const MultiSelectPagination = forwardRef<HTMLDivElement, MultiSelectPaginationProps>(
  (
    {
      dataFetchCallBack,
      onSelected,
      title,
      label,
      validator,
      initialValues,
      dataList = [],
      options: staticOptions,
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
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const [options, setOptions] = useState<DropdownOptions[]>(dataList.length > 0 ? dataList : staticOptions || []);
    // Store only values (IDs) internally, get labels from options when needed
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
      initialValues ? initialValues.map((iv) => iv.value) : []
    );
    const [searchText, setSearchText] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [dropdownPosition, setDropdownPosition] = useState<"down" | "up">("down");

    const isFetchingRef = useRef(false);
    const pageRef = useRef(1);
    const hasInitialLoadRef = useRef(false);
    const dataFetchCallBackRef = useRef(dataFetchCallBack);
    const isMountedRef = useRef(false);
    const filterParamsChangedRef = useRef(false);
    const searchTextRef = useRef(searchText);
    const lastFetchKeyRef = useRef<string>("");
    const disabledRef = useRef(disabled);
    const isUpdatingOptionsRef = useRef(false);
    const lastValidSelectedValuesRef = useRef<(string | number)[]>([]);
    const userSelectedRef = useRef(false); // Track if user made a selection
    const isOpenRef = useRef(isOpen); // Track isOpen state

    // Update refs for frequently changing values
    useEffect(() => {
      searchTextRef.current = searchText;
    }, [searchText]);
    
    useEffect(() => {
      disabledRef.current = disabled;
    }, [disabled]);
    
    useEffect(() => {
      isOpenRef.current = isOpen;
    }, [isOpen]);

    // Create a stable fetch function using refs to avoid dependency issues
    const fetchDataRef = useRef<((reset?: boolean, search?: string) => Promise<void>) | null>(null);
    const fetchInProgressRef = useRef<Set<string>>(new Set()); // Track in-progress fetches by key
    
    // Initialize fetch function once - it will use refs for all values
    if (!fetchDataRef.current) {
      fetchDataRef.current = async (reset?: boolean, search?: string) => {
        // Prevent fetching if already fetching, disabled, or no callback
        if (isFetchingRef.current || !dataFetchCallBackRef.current || disabledRef.current) {
          return;
        }
        
        // Create a key for this fetch to prevent duplicates
        const searchValue = search ?? searchTextRef.current;
        const currentPage = reset ? 1 : pageRef.current;
        const fetchKey = `fetch-${currentPage}-${searchValue}`;
        
        // Prevent duplicate fetches with same key
        if (lastFetchKeyRef.current === fetchKey || fetchInProgressRef.current.has(fetchKey)) {
          return;
        }
        
        // Mark this fetch as in progress
        fetchInProgressRef.current.add(fetchKey);
        lastFetchKeyRef.current = fetchKey;
        isFetchingRef.current = true;
        setLoading(true);

        try {
          const currentPage = reset ? 1 : pageRef.current;
          const searchValue = search ?? searchTextRef.current;

          // Double-check callback still exists before calling
          if (!dataFetchCallBackRef.current) {
            return;
          }

          const result = await dataFetchCallBackRef.current(currentPage, { value: searchValue });

          // Only update if we're still mounted and callback hasn't changed
          if (!dataFetchCallBackRef.current) {
            return;
          }

          // Mark that we're updating options to prevent cleanup effect from running
          isUpdatingOptionsRef.current = true;
          setOptions((prev) => (reset ? result.itemList : [...prev, ...result.itemList]));
          setTotalRecords(result.totalNumberOfRecord ?? 0);
          
          // Reset flag after state update
          setTimeout(() => {
            isUpdatingOptionsRef.current = false;
          }, 0);

          if (!reset) {
            pageRef.current = currentPage + 1;
          } else {
            pageRef.current = 2;
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          if (reset) {
            setOptions([]);
            setTotalRecords(0);
          }
        } finally {
          setLoading(false);
          isFetchingRef.current = false;
          // Remove from in-progress set after a delay to allow for rapid successive calls
          setTimeout(() => {
            fetchInProgressRef.current.delete(fetchKey);
          }, 1000);
        }
      };
    }

    // Track previous callback to detect actual changes
    const prevDataFetchCallBackRef = useRef(dataFetchCallBack);
    const callbackChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isHandlingCallbackChangeRef = useRef(false);
    const lastCallbackChangeTimeRef = useRef<number>(0);
    
    // Update ref when dataFetchCallBack changes - but don't reset initial load
    // This prevents infinite loops when filter parameters change
    useEffect(() => {
      // Always update the ref for immediate use
      dataFetchCallBackRef.current = dataFetchCallBack;
      
      // Don't do anything if component isn't initialized yet
      if (!isMountedRef.current || !hasInitialLoadRef.current) {
        if (!isMountedRef.current || !hasInitialLoadRef.current) {
          prevDataFetchCallBackRef.current = dataFetchCallBack;
        }
        return;
      }
      
      // Don't do anything if already handling a change
      if (isHandlingCallbackChangeRef.current) {
        return;
      }
      
      // Rate limit: don't process callback changes more than once per 500ms
      const now = Date.now();
      if (now - lastCallbackChangeTimeRef.current < 500) {
        prevDataFetchCallBackRef.current = dataFetchCallBack;
        return;
      }
      
      // Clear any pending timeout
      if (callbackChangeTimeoutRef.current) {
        clearTimeout(callbackChangeTimeoutRef.current);
        callbackChangeTimeoutRef.current = null;
      }
      
      const prevCallback = prevDataFetchCallBackRef.current;
      
      // Only proceed if callback actually changed (using reference equality)
      if (prevCallback === dataFetchCallBack) {
        return;
      }
      
      // Mark that we're handling a callback change to prevent re-entry
      isHandlingCallbackChangeRef.current = true;
      lastCallbackChangeTimeRef.current = now;
      prevDataFetchCallBackRef.current = dataFetchCallBack;
      
      // Mark that filter params changed - we'll refetch when dropdown opens
      filterParamsChangedRef.current = true;
      hasRefetchedForFilterChangeRef.current = false; // Reset flag to allow new refetch
      pageRef.current = 1;
      lastFetchKeyRef.current = ""; // Reset fetch key to allow new fetch
      fetchInProgressRef.current.clear(); // Clear any in-progress fetches
      
      // If dropdown is already open, trigger fetch immediately (only once)
      if (isOpenRef.current && !isFetchingRef.current && fetchDataRef.current && !disabledRef.current) {
        isUpdatingOptionsRef.current = true;
        setOptions([]);
        
        // Small delay to ensure state is ready, then fetch once
        callbackChangeTimeoutRef.current = setTimeout(() => {
          if (
            !isFetchingRef.current && 
            dataFetchCallBackRef.current && 
            fetchDataRef.current && 
            !disabledRef.current &&
            isOpenRef.current &&
            !hasRefetchedForFilterChangeRef.current
          ) {
            hasRefetchedForFilterChangeRef.current = true;
            fetchDataRef.current(true);
          }
          setTimeout(() => {
            isUpdatingOptionsRef.current = false;
          }, 0);
          callbackChangeTimeoutRef.current = null;
        }, 100);
      }
      
      // Reset flag after a short delay
      setTimeout(() => {
        isHandlingCallbackChangeRef.current = false;
      }, 100);
      
      return () => {
        if (callbackChangeTimeoutRef.current) {
          clearTimeout(callbackChangeTimeoutRef.current);
          callbackChangeTimeoutRef.current = null;
        }
      };
    }, [dataFetchCallBack]); // Only depend on dataFetchCallBack, not isOpen
    
    // Track previous isOpen state to detect when dropdown actually opens (not just re-renders)
    const prevIsOpenRef = useRef(isOpen);
    const hasRefetchedForFilterChangeRef = useRef(false);
    
    // Separate effect to handle refetch when dropdown opens and filter params changed
    useEffect(() => {
      // Only refetch if dropdown just opened (changed from closed to open), filter params changed, and we have a callback
      const justOpened = isOpen && !prevIsOpenRef.current;
      prevIsOpenRef.current = isOpen;
      
      // If dropdown just opened and filter params changed, refetch once
      if (justOpened && filterParamsChangedRef.current && !hasRefetchedForFilterChangeRef.current && dataFetchCallBackRef.current && !isFetchingRef.current && fetchDataRef.current && !disabledRef.current) {
        filterParamsChangedRef.current = false;
        hasRefetchedForFilterChangeRef.current = true; // Mark that we've refetched for this filter change
        lastFetchKeyRef.current = ""; // Reset to allow refetch
        fetchInProgressRef.current.clear(); // Clear any in-progress fetches
        isUpdatingOptionsRef.current = true;
        setOptions([]);
        
        // Small delay to ensure state is ready
        callbackChangeTimeoutRef.current = setTimeout(() => {
          if (
            !isFetchingRef.current && 
            dataFetchCallBackRef.current && 
            fetchDataRef.current && 
            !disabledRef.current &&
            isOpen
          ) {
            fetchDataRef.current(true);
          }
          setTimeout(() => {
            isUpdatingOptionsRef.current = false;
          }, 0);
          callbackChangeTimeoutRef.current = null;
        }, 100); // Reduced debounce for faster response
      }
      
      // Reset the refetch flag when dropdown closes
      if (!isOpen) {
        hasRefetchedForFilterChangeRef.current = false;
      }
      
      return () => {
        if (callbackChangeTimeoutRef.current) {
          clearTimeout(callbackChangeTimeoutRef.current);
          callbackChangeTimeoutRef.current = null;
        }
      };
    }, [isOpen]); // Only depend on isOpen

    const SIZE_MAP = {
      sm: { fontSize: 12, padding: 6, dropdownHeight: 200, tagFontSize: 11, inputHeight: 36 },
      md: { fontSize: 14, padding: 8, dropdownHeight: 250, tagFontSize: 12, inputHeight: 44 },
      lg: { fontSize: 16, padding: 10, dropdownHeight: 300, tagFontSize: 14, inputHeight: 52 },
    };

    const sizeStyles = SIZE_MAP[size as keyof typeof SIZE_MAP];

    // Validation
    useEffect(() => {
      if (validator) {
        const validationError = validator(selectedValues);
        setError(validationError);
      }
    }, [selectedValues, validator]);

    const displayError = externalError || (hasSubmitted && error);

    // Initial load - only run once on mount or when dataList/staticOptions are first provided
    useEffect(() => {
      if (hasInitialLoadRef.current) return;
      
      isMountedRef.current = true;
      hasInitialLoadRef.current = true; // Mark as loaded immediately to prevent multiple runs
      
      if (dataFetchCallBackRef.current && fetchDataRef.current && !disabled) {
        // Use ref to avoid dependency issues
        lastFetchKeyRef.current = ""; // Reset for initial load
        // Small delay to ensure component is fully mounted
        setTimeout(() => {
          if (!isFetchingRef.current && fetchDataRef.current && dataFetchCallBackRef.current && !disabledRef.current) {
            fetchDataRef.current(true);
          }
        }, 0);
      } else if (dataList.length > 0) {
        setOptions(dataList);
      } else if (staticOptions && staticOptions.length > 0) {
        setOptions(staticOptions);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount - dataList/staticOptions are handled separately

    // Track previous search text to prevent unnecessary fetches
    const prevSearchTextRef = useRef(searchText);
    
    // Handle dataList/staticOptions changes separately (client-side filtering)
    useEffect(() => {
      if (!dataFetchCallBackRef.current && (staticOptions || dataList.length > 0)) {
        const source = staticOptions || dataList;
        const filtered = source.filter((opt) =>
          opt.label.toLowerCase().includes(searchText.toLowerCase())
        );
        setOptions(filtered);
      }
    }, [dataList, staticOptions, searchText]); // Only for client-side filtering
    
    // Handle search with debounce (server-side)
    useEffect(() => {
      if (!dataFetchCallBackRef.current) {
        return; // Client-side filtering handled in separate effect
      }

      // Only search if dropdown has been initialized and not disabled
      if (!hasInitialLoadRef.current || disabled || disabledRef.current) return;

      // Don't search on initial mount (empty searchText)
      if (searchText === "" && !hasInitialLoadRef.current) return;

      // Only proceed if search text actually changed
      if (prevSearchTextRef.current === searchText) {
        return;
      }
      
      prevSearchTextRef.current = searchText;

      // Server-side search with debounce
      const timeoutId = setTimeout(() => {
        // Double check conditions before fetching
        if (
          searchText !== undefined && 
          !isFetchingRef.current && 
          fetchDataRef.current && 
          dataFetchCallBackRef.current &&
          !disabledRef.current &&
          hasInitialLoadRef.current &&
          prevSearchTextRef.current === searchText // Ensure search text hasn't changed during debounce
        ) {
          pageRef.current = 1;
          lastFetchKeyRef.current = ""; // Reset to allow new search
          // Use ref to avoid dependency issues
          fetchDataRef.current(true, searchText);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }, [searchText, disabled]); // Only search text and disabled

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el || loading || !dataFetchCallBackRef.current || !fetchDataRef.current) return;

      const nearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
      if (nearBottom && options.length < totalRecords) {
        // Use ref to avoid dependency issues
        fetchDataRef.current(false);
      }
    }, [loading, options.length, totalRecords]); // Removed fetchData from dependencies

    // Calculate dropdown position
    const calculatePosition = useCallback(() => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - containerRect.bottom;
      const spaceAbove = containerRect.top;
      const dropdownHeight = sizeStyles.dropdownHeight + 50; // Add some buffer

      // Open upward if there's not enough space below and more space above
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("up");
      } else {
        setDropdownPosition("down");
      }
    }, [sizeStyles.dropdownHeight]);

    // Toggle dropdown
    const handleToggle = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (newIsOpen) {
          // Calculate position after a small delay to ensure container is ready
          setTimeout(() => {
            calculatePosition();
          }, 0);
          
          // If filter params changed, refetch data (with guard to prevent loops)
          if (filterParamsChangedRef.current && dataFetchCallBackRef.current && !isFetchingRef.current && fetchDataRef.current) {
            filterParamsChangedRef.current = false;
            lastFetchKeyRef.current = ""; // Reset to allow refetch
            // Use ref to avoid dependency issues
            fetchDataRef.current(true);
          }
        }
      },
      [disabled, isOpen, calculatePosition] // Removed fetchData - using ref instead
    );

    // Handle selection
    const handleSelect = useCallback(
      (item: DropdownOptions) => {
        if (disabled) return;

        const isSelected = selectedValues.includes(item.value);
        let newValues: (string | number)[];

        if (isSelected) {
          newValues = selectedValues.filter((v) => v !== item.value);
        } else {
          newValues = [...selectedValues, item.value];
        }

        // Mark that user made a selection to prevent initialValues sync from interfering
        userSelectedRef.current = true;
        setSelectedValues(newValues);
        // Get full items with labels for onSelected callback
        const selectedItems = newValues
          .map((val) => options.find((opt) => opt.value === val))
          .filter((item): item is DropdownOptions => item !== undefined);
        onSelected(selectedItems);
      },
      [selectedValues, options, onSelected, disabled]
    );

    // Select all
    const handleSelectAll = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        // Mark that user made a selection
        userSelectedRef.current = true;
        const allValues = options.map((opt) => opt.value);
        setSelectedValues(allValues);
        onSelected(options);
      },
      [options, onSelected, disabled]
    );

    // Clear all
    const handleClearAll = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        // Mark that user made a selection
        userSelectedRef.current = true;
        setSelectedValues([]);
        onSelected([]);
      },
      [onSelected, disabled]
    );

    // Remove tag
    const removeTag = useCallback(
      (value: string | number, e?: React.MouseEvent) => {
        if (disabled) return;
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        // Mark that user made a selection
        userSelectedRef.current = true;
        const newValues = selectedValues.filter((v) => v !== value);
        setSelectedValues(newValues);
        // Get full items with labels for onSelected callback
        const selectedItems = newValues
          .map((val) => options.find((opt) => opt.value === val))
          .filter((item): item is DropdownOptions => item !== undefined);
        onSelected(selectedItems);
      },
      [selectedValues, options, onSelected, disabled]
    );

    // Recalculate position when dropdown opens
    useEffect(() => {
      if (isOpen) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          calculatePosition();
        });
      }
    }, [isOpen, calculatePosition]);

    // Close dropdown when clicking outside
    useEffect(() => {
      function handleDocClick(e: MouseEvent) {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
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

    // Track previous initialValues to prevent unnecessary updates
    const prevInitialValuesRef = useRef(initialValues);
    
    // Sync initialValues - only keep values that exist in options
    useEffect(() => {
      // Skip if user just made a selection - don't override user's choice
      if (userSelectedRef.current) {
        // Check if initialValues matches current selection - if so, reset the flag
        if (initialValues) {
          const currentValuesStr = selectedValues.sort().join(',');
          const initialValuesStr = initialValues.map(iv => iv.value).sort().join(',');
          if (currentValuesStr === initialValuesStr) {
            userSelectedRef.current = false;
            prevInitialValuesRef.current = initialValues;
          }
        }
        return;
      }
      
      // Skip if we're currently fetching/updating options
      if (isUpdatingOptionsRef.current || isFetchingRef.current) {
        return;
      }
      
      // Check if initialValues actually changed
      const prevInitialValues = prevInitialValuesRef.current;
      const initialValuesChanged = prevInitialValues !== initialValues && 
        (prevInitialValues?.length !== initialValues?.length || 
         prevInitialValues?.some((iv, idx) => iv.value !== initialValues?.[idx]?.value || iv.label !== initialValues?.[idx]?.label));
      
      if (!initialValuesChanged && !initialValues) {
        return;
      }
      
      prevInitialValuesRef.current = initialValues;
      
      if (initialValues) {
        // Filter to only include values that exist in current options
        // Use current options state, not dependency
        const validValues = initialValues
          .filter((iv) => options.some((opt) => opt.value === iv.value))
          .map((iv) => iv.value);
        
        // Only update if values actually changed
        setSelectedValues((prev) => {
          const currentValuesStr = prev.sort().join(',');
          const validValuesStr = validValues.sort().join(',');
          
          if (currentValuesStr !== validValuesStr) {
            // Only call onSelected if some items were filtered out (not when syncing from parent)
            if (validValues.length !== initialValues.length) {
              const validItems = validValues
                .map((val) => options.find((opt) => opt.value === val))
                .filter((item): item is DropdownOptions => item !== undefined);
              // Use setTimeout to avoid calling onSelected during render
              setTimeout(() => {
                onSelected(validItems);
              }, 0);
            }
            return validValues;
          }
          return prev;
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues]); // Only depend on initialValues - options is checked inside but not a dependency

    // Track previous options to detect actual changes
    const prevOptionsRef = useRef(options);
    
    // Clean up selectedValues that don't exist in options when options change
    // BUT only if we're not currently fetching/updating options
    useEffect(() => {
      // Skip if user just made a selection - don't interfere with user's choice
      if (userSelectedRef.current) {
        prevOptionsRef.current = options;
        return;
      }
      
      // Skip if we're currently updating options (during fetch) or fetching
      if (isUpdatingOptionsRef.current || isFetchingRef.current) {
        return;
      }
      
      // Skip if options is empty (likely during reset/filter change)
      if (options.length === 0) {
        prevOptionsRef.current = options;
        return;
      }
      
      // Check if options actually changed (not just a new array reference)
      const prevOptions = prevOptionsRef.current;
      const optionsChanged = prevOptions.length !== options.length ||
        prevOptions.some((opt, idx) => opt.value !== options[idx]?.value || opt.label !== options[idx]?.label);
      
      if (!optionsChanged) {
        return;
      }
      
      prevOptionsRef.current = options;
      
      setSelectedValues((prev) => {
        const validValues = prev.filter((val) =>
          options.some((opt) => opt.value === val)
        );
        
        // Only update if there's an actual change AND values were removed
        if (validValues.length !== prev.length && prev.length > 0) {
          // Update parent with valid items only if there's a meaningful change
          const validItems = validValues
            .map((val) => options.find((opt) => opt.value === val))
            .filter((item): item is DropdownOptions => item !== undefined);
          
          // Only call onSelected if the valid values actually changed
          const validValuesStr = validValues.sort().join(',');
          const lastValidStr = lastValidSelectedValuesRef.current.sort().join(',');
          if (validValuesStr !== lastValidStr) {
            lastValidSelectedValuesRef.current = validValues;
            // Use setTimeout to avoid calling onSelected during render
            setTimeout(() => {
              onSelected(validItems);
            }, 0);
          }
          return validValues;
        }
        return prev;
      });
    }, [options, onSelected]);

    // Get selected items with labels from options (for display)
    const validSelectedItems = selectedValues
      .map((val) => options.find((opt) => opt.value === val))
      .filter((item): item is DropdownOptions => item !== undefined);

    const selectedLabels = validSelectedItems.map((item) => item.label);
    const visibleTags = selectedLabels.slice(0, 3);
    const remainingCount = selectedLabels.length - visibleTags.length;

    return (
      <div
        ref={(node) => {
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
              marginBottom: "6px",
              fontSize: sizeStyles.fontSize,
              fontWeight: theme.fontWeight.medium,
              color: theme.colors.black,
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
            alignItems: "center",
            flexWrap: "nowrap",
            gap: "6px",
            height: sizeStyles.inputHeight + 2 + "px",
            maxHeight: sizeStyles.inputHeight + 2 + "px",
            overflow: "hidden",
            padding: `${sizeStyles.padding + 2}px ${sizeStyles.padding * 2}px`,
            fontSize: sizeStyles.fontSize,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.background,
            border: `1px solid ${displayError ? theme.colors.error : theme.colors.border}`,
            cursor: disabled ? "not-allowed" : "pointer",
            color: theme.colors.text,
            userSelect: "none",
            boxSizing: "border-box",
            transition: "all 0.2s ease-in-out",
            boxShadow: isOpen ? theme.shadows.sm : "none",
          }}
        >
          {validSelectedItems.length === 0 ? (
            <span
              style={{
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: "normal",
                color: "#888",
              }}
            >
              {title || "Select options..."}
            </span>
          ) : (
            <div style={{ display: "flex", flexWrap: "nowrap", overflow: "hidden", gap: "6px", flex: 1 }}>
              {visibleTags.map((label, index) => {
                const item = validSelectedItems[index];
                if (!item) return null;
                return (
                  <div
                    key={`${item.value}-${index}`}
                    style={{
                      backgroundColor: theme.colors.primary + "10",
                      color: theme.colors.text,
                      padding: `4px ${sizeStyles.padding}px`,
                      borderRadius: theme.borderRadius.sm,
                      display: "flex",
                      alignItems: "center",
                      fontSize: sizeStyles.tagFontSize,
                      gap: "4px",
                      fontWeight: theme.fontWeight.medium,
                      border: `1px solid ${theme.colors.primary}25`,
                      transition: theme.transitions.fast,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled) {
                        e.currentTarget.style.backgroundColor = theme.colors.primary + "20";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!disabled) {
                        e.currentTarget.style.backgroundColor = theme.colors.primary + "10";
                      }
                    }}
                  >
                    <span style={{ whiteSpace: "nowrap" }}>{label}</span>
                    <button
                      type="button"
                      onClick={(e) => removeTag(item.value, e)}
                      style={{
                        background: "none",
                        border: "none",
                        color: theme.colors.text,
                        cursor: disabled ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        fontSize: sizeStyles.tagFontSize,
                        lineHeight: 1,
                        marginLeft: "2px",
                        transition: theme.transitions.fast,
                      }}
                      disabled={disabled}
                      onMouseEnter={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.transform = "scale(1.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
              {remainingCount > 0 && (
                <span
                  style={{
                    fontSize: sizeStyles.fontSize - 1,
                    color: theme.colors.textSecondary,
                    fontWeight: theme.fontWeight.medium,
                    padding: `4px ${sizeStyles.padding}px`,
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderRadius: theme.borderRadius.sm,
                    flexShrink: 0,
                  }}
                >
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
          <svg
            width={sizeStyles.fontSize + 4}
            height={sizeStyles.fontSize + 4}
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0)",
              transition: theme.transitions.normal,
              flexShrink: 0,
            }}
            fill="none"
            stroke={theme.colors.text}
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {displayError && (
          <div
            style={{
              marginTop: "4px",
              fontSize: sizeStyles.fontSize - 2,
              color: theme.colors.error,
            }}
          >
            {displayError}
          </div>
        )}

        {isOpen && (
          <div
            ref={(node) => {
              scrollRef.current = node;
              dropdownRef.current = node;
              // Recalculate position when dropdown is mounted
              if (node) {
                setTimeout(() => {
                  calculatePosition();
                }, 0);
              }
            }}
            style={{
              position: "absolute",
              ...(dropdownPosition === "up"
                ? {
                    bottom: "100%",
                    marginBottom: "4px",
                  }
                : {
                    top: "100%",
                    marginTop: "4px",
                  }),
              left: 0,
              right: 0,
              zIndex: 1000,
              backgroundColor: theme.colors.background,
              border: `1px solid ${theme.colors.primary}40`,
              borderRadius: theme.borderRadius.md,
              boxShadow: theme.shadows.lg,
              maxHeight: sizeStyles.dropdownHeight + "px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Search bar with Select All / Clear All */}
            <div
              style={{
                padding: `${sizeStyles.padding}px`,
                borderBottom: `1px solid ${theme.colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: `${sizeStyles.padding}px`,
                    color: theme.colors.textSecondary,
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  style={{
                    width: "100%",
                    padding: `${sizeStyles.padding}px ${sizeStyles.padding}px ${sizeStyles.padding}px ${sizeStyles.padding * 3 + 4}px`,
                    fontSize: sizeStyles.fontSize,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.sm,
                    outline: "none",
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={disabled || options.length === 0}
                style={{
                  padding: `${sizeStyles.padding - 2}px ${sizeStyles.padding}px`,
                  fontSize: sizeStyles.tagFontSize,
                  fontWeight: theme.fontWeight.medium,
                  backgroundColor: theme.colors.primaryLight,
                  color: theme.colors.white,
                  border: "none",
                  borderRadius: theme.borderRadius.sm,
                  cursor: disabled || options.length === 0 ? "not-allowed" : "pointer",
                  opacity: disabled || options.length === 0 ? 0.5 : 1,
                  transition: theme.transitions.fast,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!disabled && options.length > 0) {
                    e.currentTarget.style.backgroundColor = theme.colors.primaryLight + "DD";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && options.length > 0) {
                    e.currentTarget.style.backgroundColor = theme.colors.primaryLight;
                  }
                }}
              >
                All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={disabled || validSelectedItems.length === 0}
                style={{
                  padding: `${sizeStyles.padding - 2}px ${sizeStyles.padding}px`,
                  fontSize: sizeStyles.tagFontSize,
                  fontWeight: theme.fontWeight.medium,
                  backgroundColor: theme.colors.error,
                  color: theme.colors.white,
                  border: "none",
                  borderRadius: theme.borderRadius.sm,
                  cursor: disabled || validSelectedItems.length === 0 ? "not-allowed" : "pointer",
                  opacity: disabled || validSelectedItems.length === 0 ? 0.5 : 1,
                  transition: theme.transitions.fast,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!disabled && validSelectedItems.length > 0) {
                    e.currentTarget.style.backgroundColor = theme.colors.error + "DD";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && validSelectedItems.length > 0) {
                    e.currentTarget.style.backgroundColor = theme.colors.error;
                  }
                }}
              >
                Clear
              </button>
            </div>

            {/* Options list */}
            <div
              style={{
                overflowY: "auto",
                flex: 1,
                padding: `${sizeStyles.padding / 2}px`,
              }}
              onScroll={handleScroll}
            >
              {loading && options.length === 0 ? (
                <div
                  style={{
                    padding: `${sizeStyles.padding * 2}px`,
                    textAlign: "center",
                    color: theme.colors.textSecondary,
                    fontSize: sizeStyles.fontSize,
                  }}
                >
                  Loading...
                </div>
              ) : options.length === 0 ? (
                <div
                  style={{
                    padding: `${sizeStyles.padding * 2}px`,
                    textAlign: "center",
                    color: theme.colors.textSecondary,
                    fontSize: sizeStyles.fontSize,
                  }}
                >
                  No options found
                </div>
              ) : (
                options.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleSelect(opt)}
                      style={{
                        padding: `${sizeStyles.padding}px ${sizeStyles.padding * 2}px`,
                        fontSize: sizeStyles.fontSize,
                        borderRadius: theme.borderRadius.sm,
                        cursor: disabled ? "not-allowed" : "pointer",
                        backgroundColor: isSelected ? theme.colors.primary + "15" : theme.colors.background,
                        color: theme.colors.textSecondary,
                        transition: theme.transitions.normal,
                        display: "flex",
                        alignItems: "center",
                        gap: `${sizeStyles.padding}px`,
                        marginBottom: "2px",
                      }}
                      onMouseEnter={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.backgroundColor = isSelected 
                            ? theme.colors.primary + "25" 
                            : theme.colors.hover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.backgroundColor = isSelected 
                            ? theme.colors.primary + "15" 
                            : theme.colors.background;
                        }
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          border: `2px solid ${isSelected ? theme.colors.primaryLight : theme.colors.border}`,
                          borderRadius: "4px",
                          backgroundColor: isSelected ? theme.colors.primaryLight : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: theme.transitions.fast,
                        }}
                      >
                        {isSelected && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            style={{ color: theme.colors.white }}
                          >
                            <path
                              d="M2 6L5 9L10 2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span style={{ flex: 1 }}>{opt.label}</span>
                    </div>
                  );
                })
              )}
              {loading && options.length > 0 && (
                <div
                  style={{
                    padding: `${sizeStyles.padding}px`,
                    textAlign: "center",
                    color: theme.colors.textSecondary,
                    fontSize: sizeStyles.fontSize - 1,
                  }}
                >
                  Loading more...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MultiSelectPagination.displayName = "MultiSelectPagination";

export default MultiSelectPagination;
