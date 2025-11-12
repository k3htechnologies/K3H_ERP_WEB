import React, { useState, useEffect, forwardRef } from 'react'
import { THEME } from '../../../core/constants/theme'
import { COLOR_MAP } from '../../../core/constants'
import { Search, X } from 'lucide-react';

interface MultiSelectDropdownProps {
  dataList: { label: string; value: string | number }[]
  onSelected: (selectedItems: { label: string; value: string | number }[]) => void
  title: string
  validator?: (values: (string | number)[]) => string | undefined
  initialValues?: { label: string; value: string | number }[]
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  color?: keyof typeof COLOR_MAP
  variant?: 'solid' | 'outline'
  onSearch?: (searchValue: string) => void
  loading?: boolean
  noDataText?: string
}

export const MultiSelectDropdown = forwardRef<HTMLDivElement, MultiSelectDropdownProps>(
  (
    {
      dataList,
      onSelected,
      title,
      validator,
      initialValues = [],
      disabled = false,
      className = '',
      style,
      color = 'primary',
      variant = 'outline',
      onSearch,
      loading = false,
      noDataText = 'No records found',
    },
    ref
  ) => {
    const theme = THEME

    const [options, setOptions] = useState(dataList)
    const [selectedItems, setSelectedItems] = useState(initialValues)
    const [searchText, setSearchText] = useState('')
    const [error, setError] = useState<string | undefined>(undefined)
    const [isOpen, setIsOpen] = useState(false)

       // Base color style for variant
    const baseColor = COLOR_MAP[color as keyof typeof COLOR_MAP]?.[variant as keyof (typeof COLOR_MAP)[keyof typeof COLOR_MAP]] ||COLOR_MAP.primary.outline

    const containerStyles: React.CSSProperties = {
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      backgroundColor: baseColor.backgroundColor || theme.colors.background,
      color: theme.colors.text,
      padding: theme.spacing.sm,
      fontFamily: 'Inter, sans-serif',
      fontSize: theme.fontSize.sm,
      width: '100%',
      ...style,
    }

    const headerStyles: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: baseColor.backgroundColor,
      border: `1px solid ${theme.colors.border}`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: theme.colors.text,
      userSelect: 'none',
    }

    // const searchInputStyles: React.CSSProperties = {
    //   width: '100%',
    //   border: `1px solid ${theme.colors.border}`,
    //   borderRadius: theme.borderRadius.sm,
    //   padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    //   fontSize: theme.fontSize.sm,
    //   color: theme.colors.text,
    //   backgroundColor: baseColor.backgroundColor,
    //   outline: 'none',
    //   marginBottom: theme.spacing.sm,
    // }

    const dropdownListStyles: React.CSSProperties = {
      maxHeight: 180,
      overflowY: 'auto',
      borderRadius: theme.borderRadius.sm,
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: baseColor.backgroundColor,
      boxShadow: theme.shadows.sm,
      marginTop: theme.spacing.sm,
    }

    const getOptionStyles = (selected: boolean): React.CSSProperties => ({
      padding: `${theme.spacing.xs} ${theme.spacing.md}`,
      fontSize: theme.fontSize.sm,
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: selected ? theme.colors.hover : baseColor.backgroundColor,
      color: selected ? theme.colors.text : theme.colors.textSecondary,
      transition: theme.transitions.normal,
    })
//   const getOptionStyles = (selected: boolean): React.CSSProperties => ({
//   padding: `${theme.spacing.xs} ${theme.spacing.md}`,
//   fontSize: theme.fontSize.sm,
//   cursor: disabled ? 'not-allowed' : 'pointer',
//   backgroundColor: selected ? theme.colors.text : theme.colors.background, // ✅ use theme color
//   color: selected ? theme.colors.background : theme.colors.textSecondary, // ✅ contrast text
//   borderRadius: theme.borderRadius.sm,
//   transition: theme.transitions.normal,
// })


    // --- Handlers ---
    const handleSelect = (item: { label: string; value: string | number }) => {
      const alreadySelected = selectedItems.some((s) => s.value === item.value)
      const newSelection = alreadySelected
        ? selectedItems.filter((s) => s.value !== item.value)
        : [...selectedItems, item]

      setSelectedItems(newSelection)
      onSelected(newSelection)
    }

    const handleSearchLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchText(value)
      if (onSearch) {
        onSearch(value)
      } else {
        setOptions(
          dataList.filter((item) =>
            item.label.toLowerCase().includes(value.toLowerCase())
          )
        )
      }
    }

    const handleSelectAll = () => {
      setSelectedItems(options)
      onSelected(options)
    }

    const handleClearAll = () => {
      setSelectedItems([])
      onSelected([])
    }
  const clearSearch = () => {
  setSearchText('')
    if (onSearch) {
    onSearch('')
    } 
    else {
    setOptions(dataList)
  }
 }


    // --- Sync and validate ---
    useEffect(() => {
      setOptions(dataList)
    }, [dataList])

    useEffect(() => {
      if (validator) setError(validator(selectedItems.map((i) => i.value)))
    }, [selectedItems, validator])

    return (
      <div ref={ref} className={className} style={containerStyles}>
        {title && (
          <div style={headerStyles} onClick={() => !disabled && setIsOpen(!isOpen)}>
           {selectedItems.length > 0 ? (
  selectedItems.length === options.length ? (
    // All selected → show first 4 then ...
    `${selectedItems.slice(0, 4).map((s) => s.label).join(', ')}${selectedItems.length > 4 ? ', ...' : ''}`
  ) : (
    // Partial selection → show all
    selectedItems.map((s) => s.label).join(', ')
  )
) : title}

             <svg
              width="16"
              height="16"
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
        )}

        {isOpen && (
          <div>
                <div style={{ position: 'relative', marginBottom: theme.spacing.sm }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchLocal}
            autoFocus
            style={{
              width: '100%',
              padding: '6px 28px 6px 28px',
              border: `1px solid ${theme.colors.border}`,
              outline: 'none',
              fontSize: theme.fontSize.sm,
              backgroundColor: baseColor.backgroundColor,
              borderRadius: theme.borderRadius.sm,
              color: theme.colors.text,
            }}
          />
          <Search
            size={16}
            color={theme.colors.textSecondary}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          {searchText.trim() && (
            <X
              size={16}
              color="#000"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                zIndex: 2,
              }}
              onClick={clearSearch}
            />
          )}
        </div>

            {/* 🔘 Select / Clear All Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
              <button
                onClick={handleSelectAll}
                disabled={disabled || loading || options.length === 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.primary,
                  cursor: 'pointer',
                  fontSize: theme.fontSize.xs,
                }}
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                disabled={disabled || loading || selectedItems.length === 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.error,
                  cursor: 'pointer',
                  fontSize: theme.fontSize.xs,
                }}
              >
                Clear All
              </button>
            </div>

            <div style={dropdownListStyles}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: theme.spacing.sm }}>Loading...</div>
              ) : options.length > 0 ? (
                options.map((item) => {
                  const selected = selectedItems.some((s) => s.value === item.value)
                  return (
                    <div
                      key={item.value}
                      onClick={() => !disabled && handleSelect(item)}
                      style={getOptionStyles(selected)}
                    >
                      <input type="checkbox" checked={selected} readOnly style={{ marginRight: 8 ,accentColor:theme.colors.text}} />
                      {item.label}
                    </div>
                  )
                })
              ) : (
                <div style={{ textAlign: 'center', padding: theme.spacing.sm, color: theme.colors.textLight }}>
                  {noDataText}
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <p style={{ color: theme.colors.error, fontSize: theme.fontSize.xs, marginTop: theme.spacing.xs }}>
            {error}
          </p>
        )}
      </div>
    )
  }
)

MultiSelectDropdown.displayName = 'MultiSelectDropdown'
