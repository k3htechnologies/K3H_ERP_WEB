import React, { useState, useEffect, forwardRef } from 'react'
import { THEME } from '../../../core/constants/theme'
import { COLOR_MAP } from '../../../core/constants'
import { Search, X } from 'lucide-react'

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
  size?: 'sm' | 'md' | 'lg'
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
      size = 'md',
    },
    ref
  ) => {
    const theme = THEME

    // --- Size Configurations ---
    const SIZE_MAP = {
      sm: { fontSize: 12, padding: 6, dropdownHeight: 150, width: 180 },
      md: { fontSize: 14, padding: 8, dropdownHeight: 200, width: 250 },
      lg: { fontSize: 16, padding: 10, dropdownHeight: 260, width: 320 },
    }

    const sizeStyles = SIZE_MAP[size]

    const [options, setOptions] = useState(dataList)
    const [selectedItems, setSelectedItems] = useState(initialValues)
    const [searchText, setSearchText] = useState('')
    const [error, setError] = useState<string | undefined>(undefined)
    const [isOpen, setIsOpen] = useState(false)

    // --- Colors ---
    const baseColor =
      COLOR_MAP[color as keyof typeof COLOR_MAP]?.[variant as keyof (typeof COLOR_MAP)[keyof typeof COLOR_MAP]] ||
      COLOR_MAP.primary.outline

    // --- Handlers ---
    const handleSelect = (item: { label: string; value: string | number }) => {
      const alreadySelected = selectedItems.some(s => s.value === item.value)
      const newSelection = alreadySelected
        ? selectedItems.filter(s => s.value !== item.value)
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
          dataList.filter(item =>
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
      if (onSearch) onSearch('')
      else setOptions(dataList)
    }

    // --- Sync and validate ---
    useEffect(() => {
      setOptions(dataList)
    }, [dataList])

    useEffect(() => {
      if (validator) setError(validator(selectedItems.map(i => i.value)))
    }, [selectedItems, validator])

    const getOptionStyles = (selected: boolean): React.CSSProperties => ({
      padding: `${sizeStyles.padding}px ${sizeStyles.padding }px`,
      fontSize: sizeStyles.fontSize,
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: selected ? theme.colors.hover : baseColor.backgroundColor,
      color: selected ? theme.colors.text : theme.colors.textSecondary,
      borderRadius: theme.borderRadius.sm,
      transition: theme.transitions.normal,
      display: 'flex',
      alignItems: 'center',
    })

    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          width: sizeStyles.width,
          fontFamily: 'Inter, sans-serif',
          marginLeft:'20px',
          ...style,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${sizeStyles.padding}px ${sizeStyles.padding * 2}px`,
            fontSize: sizeStyles.fontSize,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: baseColor.backgroundColor,
            border: `1px solid ${theme.colors.border}`,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: theme.colors.text,
            userSelect: 'none',
            minHeight: '38px',
          }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedItems.length > 0
              ? selectedItems.length === options.length
                ? `${selectedItems.slice(0, 4).map(s => s.label).join(', ')}${selectedItems.length > 4 ? ', ...' : ''}`
                : selectedItems.map(s => s.label).join(', ')
              : title}
          </span>

          <svg
            width={sizeStyles.fontSize + 2}
            height={sizeStyles.fontSize + 2}
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
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '100%',
              maxHeight: sizeStyles.dropdownHeight,
              overflowY: 'auto',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: baseColor.backgroundColor,
              boxShadow: theme.shadows.md,
              zIndex: 999,
              padding: `${sizeStyles.padding}px`,
            }}
          >
            <div style={{ position: 'relative', marginBottom: sizeStyles.padding }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={handleSearchLocal}
                autoFocus
                style={{
                  width: '100%',
                  padding: `${sizeStyles.padding}px ${sizeStyles.padding * 2 + 24}px`,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.sm,
                  outline: 'none',
                  fontSize: sizeStyles.fontSize,
                  backgroundColor: baseColor.backgroundColor,
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

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: sizeStyles.padding / 2,
              }}
            >
              <button
                onClick={handleSelectAll}
                disabled={disabled || loading || options.length === 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.primary,
                  cursor: 'pointer',
                  fontSize: sizeStyles.fontSize - 2,
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
                  fontSize: sizeStyles.fontSize - 2,
                }}
              >
                Clear All
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: sizeStyles.padding }}>Loading...</div>
            ) : options.length > 0 ? (
              options.map(item => {
                const selected = selectedItems.some(s => s.value === item.value)
                return (
                  <div
                    key={item.value}
                    onClick={() => !disabled && handleSelect(item)}
                    style={getOptionStyles(selected)}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      readOnly
                      style={{
                        marginRight: 8,
                        accentColor: theme.colors.text,
                        cursor: 'pointer',
                      }}
                    />
                    {item.label}
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', padding: sizeStyles.padding, color: theme.colors.textLight }}>
                {noDataText}
              </div>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: theme.colors.error, fontSize: sizeStyles.fontSize - 2, marginTop: theme.spacing.xs }}>
            {error}
          </p>
        )}
      </div>
    )
  }
)

MultiSelectDropdown.displayName = 'MultiSelectDropdown'
