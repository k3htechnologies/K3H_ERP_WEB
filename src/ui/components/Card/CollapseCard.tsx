import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { FieldItem } from '../forms/FieldItem'
import { Button } from '../forms'

interface CollapseCardProps {
  name: string
  mobileNumber: string
  partnershipPercent: string | number
  gender: string
  photoURL?: string
  defaultOpen?: boolean
  children?: React.ReactNode
}

export const CollapseCard: React.FC<CollapseCardProps> = ({
  name,
  mobileNumber,
  partnershipPercent,
  gender,
  photoURL,
  defaultOpen = false,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggle = () => setIsOpen(prev => !prev)

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden">

      <div className="flex items-start px-4 py-4 relative">

        {/* Avatar */}
        {photoURL && photoURL.trim() !== "" && (
          <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
            <img
              src={photoURL.split(',')[0].trim()}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex-1">

          {/* TOP ROW */}
          <div className="grid grid-cols-4 gap-4">
            <FieldItem label="Full Name" value={name} urls={photoURL}  isIcon={true}/>
            <FieldItem label="Mobile Number" value={`+91 ${mobileNumber ?? "-"}`} />
            <FieldItem label="Share %" value={partnershipPercent} />
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
