import React, { useEffect, useState } from 'react'
import { Modal } from '@/ui/components/Modal/Modal'
import { Button } from '@/ui/components/forms'
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

  useEffect(() => {
    if (isOpen) {
      // ensure required keys are always included
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
          ...columns.map(c => c.key),
          ...requiredKeys,
        ]),
      ),
    )

  const clearAll = () => setLocalKeys([...requiredKeys])

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
      saveText="Apply Changes"
      cancelText="Cancel"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end space-x-2">
          <Button type="button" onClick={selectAll} size="sm" color="gray">
            Select All
          </Button>
          <Button type="button" onClick={clearAll} size="sm" color="gray">
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto thin-scroll">
          {columns.map(col => {
            const checked = localKeys.includes(col.key)
            const required = requiredKeys.includes(col.key)

            return (
              <label
                key={col.key}
                className="flex items-center justify-between px-3 py-2 border rounded-md bg-gray-50"
              >
                <span className="text-sm text-gray-800 flex-1">
                  {col.label}{' '}
                  {required && (
                    <span className="ml-1 text-xs text-blue-600">
                      (Required)
                    </span>
                  )}
                </span>
                <Checkbox
                  size="sm"
                  type="checkbox"
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
