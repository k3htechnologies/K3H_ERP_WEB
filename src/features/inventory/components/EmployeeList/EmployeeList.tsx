import React from 'react'
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar'
import NoDataView from '@/ui/components/NoDataView/NoDataView'
import type { EmployeeMasterData } from '@/features/employeeMaster/models/EmployeeMasterModel'

interface EmployeeListProps {
    employees: EmployeeMasterData[]
    searchTerm: string
    onSearchChange: (value: string) => void
    onClearSearch: () => void
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
    employees,
    searchTerm,
    onSearchChange,
    onClearSearch
}) => {
    return (
        <div className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-xl">
                {/* Search Bar Toolbar */}
                <TableActionToolbar
                    isShowSearchBar
                    searchTerm={searchTerm}
                    searchPlaceholder="Search By Employee Name"
                    onSearchChange={onSearchChange}
                    onClearSearch={onClearSearch}
                    isShowFilterButton={false}
                    exportLoading={false}
                />

                {employees?.length ? (
                    employees.map(emp => {
                        const fullName = (emp?.FullName ?? '').trim();

                        const initials = fullName
                            ? fullName.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
                            : 'NA';

                        return (
                            <section
                                key={emp.EmployeeCode}
                                className="bg-white p-2 border-b border-[#3333334f] mb-2"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 
                                                    flex items-center justify-center text-xs font-semibold 
                                                    border border-blue-300 shadow-sm">
                                        {initials}
                                    </div>

                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-md font-medium text-gray-900 leading-tight">
                                                {emp.FullName || '-'}
                                            </h4>

                                            <span className="text-sm text-gray-500">
                                                ({emp.PersonalMobileNumber || '-'})
                                            </span>

                                            <span>{emp.Department || '-'}</span>

                                            <span className="text-gray-400"> | </span>

                                            <span>{emp.Designation || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )
                    })
                ) : (
                    <p className="text-center text-gray-500 py-6">
                        <NoDataView />
                    </p>
                )}
            </section>
        </div>
    )
}

export default EmployeeList