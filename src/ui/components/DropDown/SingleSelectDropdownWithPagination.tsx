import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react'
import { THEME } from '@/core/constants/theme'
import { Search, X } from 'lucide-react'
import type { SingleSelectWithPaginationProps } from '@/core/types/dropDownSelectionType'

export const SingleSelectDropdownWithPagination = forwardRef<HTMLDivElement, SingleSelectWithPaginationProps>(
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
      className = '',
      style,
      size = 'md',
    },
    ref
  ) => {
    const theme = THEME

    const scrollRef = useRef<HTMLDivElement>(null)
    const [options, setOptions] = useState(dataList)
    const [selectedItem, setSelectedItem] = useState(initialValue || null)
    const [searchText, setSearchText] = useState('')
    const [, setPage] = useState(1)
    const [totalRecords, setTotalRecords] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const [isOpen, setIsOpen] = useState(false)
    const isFetchingRef = useRef(false)
    const pageRef = useRef(1)
    const prevInitialValueRef = useRef<{ label: string; value: string | number } | null | undefined>(initialValue)
    const userSelectedRef = useRef(false) // Track if user has made a selection

    const SIZE_MAP = {
      sm: { fontSize: 12, padding: 6, dropdownHeight: 150},
      md: { fontSize: 14, padding: 8, dropdownHeight: 200},
      lg: { fontSize: 16, padding: 8, dropdownHeight: 250},
    }

    const sizeStyles = SIZE_MAP[size as keyof typeof SIZE_MAP]

const fetchData = useCallback(
  async (reset?: boolean, search?: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    // ✅ Case 1: No dataFetchCallBack provided → exit without fetching
    if (typeof dataFetchCallBack !== "function") {
      setLoading(false);
      isFetchingRef.current = false;
      return;
    }

    try {
      const currentPage = reset ? 1 : pageRef.current;
      const searchValue = search ?? searchText;

      const result = await dataFetchCallBack(currentPage, { value: searchValue });

      setOptions(prev =>
        reset ? result.itemList : [...prev, ...result.itemList]
      );

      setTotalRecords(result.totalNumberOfRecord);
      pageRef.current = currentPage + 1;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  },
  [dataFetchCallBack, searchText]
);


    useEffect(() => {
      fetchData(true)
    }, [fetchData])



    const handleScroll = useCallback(() => {
      const el = scrollRef.current
      if (!el || loading) return

      const nearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10
      if (nearBottom && options.length < totalRecords) {
        fetchData(false)
      }
    }, [loading, options.length, totalRecords, fetchData])

    useEffect(() => {
      if (!isOpen) return
      const el = scrollRef.current
      if (el) el.addEventListener('scroll', handleScroll)
      return () => {
        if (el) el.removeEventListener('scroll', handleScroll)
      }
    }, [isOpen, handleScroll])

    const handleSelect = (item: { label: string; value: string | number }) => {
      // Create a new object to ensure React detects the state change
      const selectedItemObj = { label: item.label, value: item.value }
      setSelectedItem(selectedItemObj)
      // Mark that user has made a selection and update refs
      userSelectedRef.current = true
      prevInitialValueRef.current = selectedItemObj
      onSelected(selectedItemObj)
      setIsOpen(false)
      // Clear search when item is selected
      setSearchText('')
      // Validate when a selection is made
      if (validator) {
        const validationError = validator(item.value)
        setError(validationError)
      } else if (required && !item.value) {
        setError(`${label || 'This field'} is required`)
      } else {
        // Clear error if valid selection is made
        setError(undefined)
      }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchText(value)
      setPage(1)
      fetchData(true, value)
    }

    const clearSearch = () => {
      setSearchText('')
      setPage(1)
      fetchData(true, '')
    }

    // Sync initialValue prop changes with selectedItem state
    // This allows the dropdown to update when initialValue changes (e.g., when form data loads)
    // But don't override user selections unless the value actually changes from parent
    useEffect(() => {
      // If user has made a selection, only update if parent explicitly changes to a different value
      if (userSelectedRef.current) {
        const currentSelectedValue = selectedItem?.value
        const newValue = initialValue?.value
        
        // Only override user selection if parent explicitly sets a different value
        if (newValue !== undefined && newValue !== null && newValue !== currentSelectedValue) {
          setSelectedItem(initialValue || null)
          prevInitialValueRef.current = initialValue
          userSelectedRef.current = false // Reset flag since parent is overriding
        }
        // Otherwise, keep user's selection - don't update
        return
      }
      
      // User hasn't made a selection yet - sync with initialValue
      const prevValue = prevInitialValueRef.current?.value
      const newValue = initialValue?.value
      
      // Update if the value actually changed
      if (prevValue !== newValue) {
        setSelectedItem(initialValue || null)
        prevInitialValueRef.current = initialValue
      } else if (initialValue !== prevInitialValueRef.current) {
        // Even if value is the same, update if the object reference changed (e.g., label updated)
        setSelectedItem(initialValue || null)
        prevInitialValueRef.current = initialValue
      }
    }, [initialValue, selectedItem?.value])

    // Use external error if provided, otherwise use internal validation
    const displayError = externalError !== undefined ? externalError : error
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
    const validationError = validator(selectedItem?.value);
    setError(validationError);
  } else if (required && !selectedItem?.value) {
    setError(`${label || 'This field'} is required`);
  } else {
    setError(undefined);
  }
}, [selectedItem, validator, required, label, externalError, hasSubmitted]);



    const getOptionStyles = (selected: boolean, hovered = false): React.CSSProperties => {
      const isActive = selected || hovered
      return {
        padding: `${sizeStyles.padding}px ${sizeStyles.padding * 2 + 16}px`,
        fontSize: sizeStyles.fontSize,
        borderRadius: theme.borderRadius.sm,
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: isActive ? theme.colors.hover : theme.colors.background,
        color: theme.colors.textSecondary,
        transition: theme.transitions.normal,
      }
    }

   return (
  
    
  <div
    ref={ref}
    className={className}
    style={{
      position: 'relative',
      width:"100%",
      maxWidth: "100%",
      minWidth:"150px",
      marginLeft: '0',
      ...style,
    }}
  >
     {label && (
      <div
        style={{
          marginBottom: '6px',
          fontSize: sizeStyles.fontSize,
          fontWeight: theme.fontWeight.medium,
          color: theme.colors.black,
        }}
      >
        {label}
        {required && (
          <span style={{ color: theme.colors.error, marginLeft: '4px' }}>*</span>
        )}
      </div>
    )}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: theme.fontWeight.medium,
        padding: `${sizeStyles.padding + 2}px ${sizeStyles.padding * 2}px`,
        fontSize: sizeStyles.fontSize,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background,
        border: `1px solid ${displayError ? theme.colors.error : theme.colors.border}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: theme.colors.text,
        userSelect: 'none',
        boxSizing: 'border-box',
        minHeight: '38px',
        transition: 'all 0.2s ease-in-out',
        boxShadow: isOpen ? theme.shadows.sm : 'none',
      }}
      onClick={() => !disabled && setIsOpen(prev => !prev)}
    >
    <span style={{
      flex: 1,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontWeight: "normal",
      color: selectedItem ? theme.colors.text : '#888'
    }}>
      {selectedItem?.label ?? title}
    </span>
      <svg
        width={sizeStyles.fontSize + 4}
        height={sizeStyles.fontSize + 4}
        style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
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

    {isOpen && (
      <div
        ref={scrollRef}
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          width: '100%',
          maxHeight: sizeStyles.dropdownHeight,
          overflowY: 'auto',
          border: `1px solid ${theme.colors.border}`,
          borderRadius:theme.colors.background,
          boxShadow: theme.shadows.lg,
          zIndex: 999,
          padding: '6px',
        }}
      >
        <div style={{ position: 'relative', marginBottom: '6px' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearch}
            autoFocus
            style={{
              width: '100%',
              padding: `${sizeStyles.padding}px ${sizeStyles.padding * 2 + 24}px`,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.sm,
              outline: 'none',
              fontSize: sizeStyles.fontSize,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              boxSizing: 'border-box',
            }}
          />
          <Search
            size={sizeStyles.fontSize + 2}
            color={theme.colors.textSecondary}
            style={{
              position: 'absolute',
              left: sizeStyles.padding,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          {searchText.trim() && (
            <X
              size={sizeStyles.fontSize + 2}
              color="#000"
              style={{
                position: 'absolute',
                right: sizeStyles.padding,
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
              }}
              onClick={clearSearch}
            />
          )}
        </div>

        {options.length > 0 ? (
          options.map(item => {
            const selected = selectedItem?.value === item.value
            return (
              <div
                key={item.value}
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
            )
          })
        ) : (
          <div
            style={{
              padding: theme.spacing.sm,
              textAlign: 'center',
              color: theme.colors.textLight,
            }}
          >
            No records found
          </div>
        )}

        {loading && (
          <div
            style={{
              textAlign: 'center',
              color: theme.colors.primary,
              fontSize: theme.fontSize.xs,
              padding: theme.spacing.xs,
            }}
          >
            Loading more...
          </div>
        )}

      </div>
    )}
    {/* Error message displayed below the dropdown */}
    {displayError && (
      <p
        style={{
          color: theme.colors.error,
          fontSize: theme.fontSize.sm,
          marginTop: '4px',
          marginLeft: '0',
          marginBottom: '0',
        }}
      >
        {displayError}
      </p>
    )}
  </div>
)

  }
)

SingleSelectDropdownWithPagination.displayName = 'SingleSelectDropdownWithPagination'
