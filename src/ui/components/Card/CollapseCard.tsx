import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { FieldItem } from '../forms/FieldItem'
import { Button } from '../forms'

interface CollapseCardProps {
  name: string
  mobileNumber: string
  partnershipPercent: string | number
  gender: string
  defaultOpen?: boolean
  children?: React.ReactNode
}

export const CollapseCard: React.FC<CollapseCardProps> = ({
  name,
  mobileNumber,
  partnershipPercent,
  gender,
  defaultOpen = false,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggle = () => setIsOpen(prev => !prev)

  return (
    <div className="w-full rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden">

      {/* HEADER SECTION */}
      <div className="flex items-start px-4 py-4 relative">

        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>

        {/* Right section fields */}
        <div className="flex-1">

          {/* TOP ROW */}
          <div className="grid grid-cols-4 gap-4">
            <FieldItem label="Name" value={name} />
            <FieldItem label="Mobile Number" value={mobileNumber} />
            <FieldItem label="Partner Ship %" value={partnershipPercent} />
            <FieldItem label="Gender" value={gender} />
          </div>

        </div>

        {/* COLLAPSE BUTTON */}
        <Button
          onClick={toggle}
          type='button'
          color='transparent'
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* COLLAPSIBLE AREA */}
      {isOpen && (
        <div className="px-4 py-4 border-t bg-gray-50">
          {children}
        </div>
      )}
    </div>
  )
}
