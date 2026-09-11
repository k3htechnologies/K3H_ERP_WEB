import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { DataTableWithHeaderRowDivider } from '@/ui/components/DataTable/DataTableWithHeaderRowDivider';
import type { Table3 } from '@/features/hireSpaceDashboard/models/HireSpaceDashboardModel';
import { useJobOpeningListState } from '@/features/hireSpace/jobOpening/context/JobOpeningListStateContext';

interface Props {
    openingsData: Table3[];
}

export default function ActiveJobRoleOpenings({ openingsData }: Props) {
    const [tableData, setTableData] = useState<any[]>([]);
    const navigate = useNavigate();
    const { updateListState } = useJobOpeningListState();

    const handleViewJobOpening = useCallback((row: Table3) => {
        updateListState({
            departmentName: row.Department || '',
            jobOpeningMasterId: row.JobOpeningMasterId,
            jobRoleName: row.JobRole || '',
        });
        navigate('/jobOpenings/JobApplicationDetails');
    }, [navigate, updateListState]);

    useEffect(() => {
        setTableData(openingsData || []);
    }, [openingsData]);

    const columns: TableColumn[] = [
        {
            key: 'JobRole',
            label: 'Job Role',
            align: 'left',
            render: (value) => value || '-',
        },
        {
            key: 'Department',
            label: 'Department',
            align: 'left',
            render: (value) => value || '-',
        },
        {
            key: 'Openings',
            label: 'Openings',
            align: 'center',
            render: (value) => value ?? 0,
        },
        {
            key: 'Filled',
            label: 'Filled',
            align: 'center',
            render: (value) => value ?? 0,
        },
        {
            key: 'Remaining',
            label: 'Remaining',
            align: 'center',
            render: (value) => value ?? 0,
        },
        {
            key: 'Applications',
            label: 'Applications',
            align: 'center',
            render: (value) => (
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                    {value ?? 0}
                </span>
            ),
        },
        {
            key: 'JobOpeningMasterId',
            label: 'Action',
            align: 'center',
            render: (_value, row) => (
                <span
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={() => handleViewJobOpening(row)}
                >
                    View Role →
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-3 pt-5">
            <div className="flex-1 bg-white rounded-xl p-5 border border-gray-100 min-w-0 overflow-hidden flex flex-col">
                <h3 className="font-semibold text-gray-500">
                    Active Job Role Openings{' '}
                    <span className="text-sm font-normal text-gray-500">
                        ({tableData.length} Records)
                    </span>
                </h3>

                <div className="pt-5">
                    <DataTableWithHeaderRowDivider
                        columns={columns}
                        data={tableData}
                        emptyMessage="No records Found"
                        fixedHeight={true}
                    />
                </div>
            </div>
        </div>
    );
}
