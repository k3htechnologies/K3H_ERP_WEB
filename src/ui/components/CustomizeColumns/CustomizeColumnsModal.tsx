import React, { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/ui/components/Modal/Modal'
import Checkbox from '@/ui/components/forms/Checkbox'
import type { TableColumn } from '@/ui/components/DataTable/DataTable'

export interface CustomizeColumnsModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (keys: string[]) => void
  columns: TableColumn[]
  selectedKeys: string[]
  requiredKeys?: string[]
  title?: string
}

export const CustomizeColumnsModal: React.FC<CustomizeColumnsModalProps> = ({
  isOpen,
  onClose,
  onApply,
  columns,
  selectedKeys,
  requiredKeys = [],
  title = 'Customize Table Columns',
}) => {
  const [localKeys, setLocalKeys] = useState<string[]>(selectedKeys)

  // Sync local state when modal opens / selectedKeys changes
  useEffect(() => {
    if (isOpen) {
      setLocalKeys(
        Array.from(
          new Set([
            ...selectedKeys,
            ...requiredKeys,
          ]),
        ),
      )
    }
  }, [isOpen, selectedKeys, requiredKeys])

  // Derived booleans for the two checkboxes
  const allColumnKeys = useMemo(() => columns.map(c => c.key), [columns])
  const selectAllChecked = useMemo(
    () => allColumnKeys.every(k => localKeys.includes(k)),
    [allColumnKeys, localKeys]
  )
  const clearAllChecked = useMemo(
    () => localKeys.length === requiredKeys.length,
    [localKeys, requiredKeys]
  )

  const toggleKey = (key: string) => {
    if (requiredKeys.includes(key)) return
    setLocalKeys(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key],
    )
  }

  const selectAll = () =>
    setLocalKeys(
      Array.from(
        new Set([
          ...allColumnKeys,
          ...requiredKeys,
        ]),
      ),
    )

  const clearAll = () => setLocalKeys([...requiredKeys])

  // Checkbox handlers
  const handleSelectAllCheckbox = (checked: boolean) => {
    if (checked) {
      selectAll()
    } else {
      // unchecking sets to required-only (consistent with Clear All)
      clearAll()
    }
  }

  const handleClearAllCheckbox = (checked: boolean) => {
    if (checked) {
      clearAll()
    } else {
      // unchecking sets to all selected
      selectAll()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onApply(localKeys)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      title={title}
      onSubmit={handleSubmit}
      saveText="Save Changes"
      size='small30'
    >
      <div className="space-y-4">
        {/* Top action checkboxes */}
        <div className="flex items-center justify-end space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              label="Select All"
              checked={selectAllChecked}
              onChange={(e) => handleSelectAllCheckbox(e.target.checked)}
              size="sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              label="Clear All"
              checked={clearAllChecked}
              onChange={(e) => handleClearAllCheckbox(e.target.checked)}
              size="sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-2 overflow-y-auto thin-scroll">
          {columns.map(col => {
            const checked = localKeys.includes(col.key)
            const required = requiredKeys.includes(col.key)

            return (
              <label
                key={col.key}
                className="flex items-center justify-between px-3 py-2  rounded-md bg-[#E4F0FF]"
              >
                <span
                  className={`text-sm flex-1 ${required ? 'text-gray-500' : 'text-black'}`}
                >
                  {col.label}{' '}
                  {required && (
                    <span className="ml-1 text-xs text-gray-500">
                      (Required)
                    </span>
                  )}
                </span>

                <Checkbox
                  size="sm"
                  checked={checked}
                  disabled={required}
                  onChange={() => toggleKey(col.key)}
                  className="h-4 w-4"
                />
              </label>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

export default CustomizeColumnsModal
