import React from 'react'
import type { AgendaData } from '@/features/meeting/models/AgendaModel'
import { getNameInitials } from '@/core/utils/getNameInitials'

type AgendaResponsiblePersonCellProps = {
    agenda: AgendaData
}

export const AgendaResponsiblePersonCell: React.FC<AgendaResponsiblePersonCellProps> = ({
    agenda,
}) => {
    const names = agenda.ResponsiblePersonDetails.map((item) => item.ResponsiblePersonName)
    const maxVisible = 2

    if (!names.length) {
        return <span className="text-sm text-gray-500">-</span>
    }

    const visible = names.slice(0, maxVisible)
    const remaining = names.length > maxVisible ? names.length - maxVisible : 0

    return (
        <div className="flex min-w-0 items-center gap-2">
            <div className="flex items-center -space-x-2">
                {visible.map((name, index) => (
                    <div
                        key={`${name}-${index}`}
                        className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs border-2 border-white"
                        title={name}
                    >
                        {getNameInitials(name)}
                    </div>
                ))}
            </div>

            {names.length === 1 && remaining === 0 && (
                <span className="min-w-0 truncate text-sm text-gray-900" title={names[0]}>
                    {names[0]}
                </span>
            )}

            {remaining > 0 && (
                <span
                    className="text-sm font-medium text-[#2364DB]"
                    title={names.slice(maxVisible).join(', ')}
                >
                    +{remaining}
                </span>
            )}
        </div>
    )
}

export default AgendaResponsiblePersonCell
