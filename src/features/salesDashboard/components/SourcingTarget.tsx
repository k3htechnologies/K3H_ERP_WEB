import type {  Table3 } from '../models/SalesDashboardModel';
import { useEffect, useMemo, useState } from 'react';
import { CustomTable, type TableColumn } from '@/ui/components/DataTable/CustomTable';

interface Props {
    performanceReportSourcingData: Table3[];
}

export default function SourcingTarget({ performanceReportSourcingData }: Props) {

    const [performanceReportSourcingList, setPerformanceReportSourcingList] = useState<Table3[]>(performanceReportSourcingData ||[]);

     useEffect(() => {
            setPerformanceReportSourcingList(performanceReportSourcingData || []);
        }, [performanceReportSourcingData]);

    const PerformanceReportSourcingColumns = useMemo<TableColumn[]>(() => [
    
            {
                key: 'EmployeeName',
                label: 'Employee Name',
                sortable: true,
                width: '15',
                fixed: 'left',
                align: 'left',
                render: (value) => (
                    <span className="text-blue-600 font-semibold">
                        {value}
                    </span>
                )
            },
    
            {
                key: 'DesignationName',
                label: 'Designation Name',
                sortable: false,
                width: '25',
                align: 'center',
                render: value => value || '-'
            },
    
            {
                key: "WalkinsByCPGroup",
                label: "Walkins By CP",
                align: "center",
                children: [
                    { key: "WalkinsByCP", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualWalkinsByCP", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceWalkinsByCP", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
            {
                key: "FreshVisitsGroup",
                label: "Fresh Visits",
                align: "center",
                children: [
                    { key: "FreshVisits", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualFreshVisits", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceFreshVisits", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
            {
                key: "RevisitsGroup",
                label: "Revisits",
                align: "center",
                children: [
                    { key: "Revisits", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualRevisits", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceRevisits", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
    
            {
                key: "BookingsGroup",
                label: "Bookings",
                align: "center",
                children: [
                    { key: "Bookings", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualBookings", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceBookings", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
            {
                key: "TotalMeetingsGroup",
                label: "Total Meetings",
                align: "center",
                children: [
                    { key: "TotalMeetings", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualTotalMeetings", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceTotalMeetings", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
    
            {
                key: "TotalOBMGroup",
                label: "Total OBM",
                align: "center",
                children: [
                    { key: "TotalOBM", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualTotalOBM", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceTotalOBM", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
    
            {
                key: "TotalOBMFreshVisitsGroup",
                label: "OBM Fresh Visits",
                align: "center",
                children: [
                    { key: "TotalOBMFreshVisits", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualTotalOBMFreshVisits", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceTotalOBMFreshVisits", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
    
            {
                key: "TotalOBMRevisitsGroup",
                label: "OBM Revisits",
                align: "center",
                children: [
                    { key: "TotalOBMRevisits", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualTotalOBMRevisits", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceTotalOBMRevisits", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
    
            {
                key: "TotalIBMGroup",
                label: "Total IBM",
                align: "center",
                children: [
                    { key: "TotalIBM", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualTotalIBM", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceTotalIBM", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
    
            {
                key: "UniqueCPGroup",
                label: "Unique CPs",
                align: "center",
                children: [
                    { key: "UniqueCPs", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualUniqueCPs", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceUniqueCPs", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
            {
                key: "ActiveCPGroup",
                label: "Active CP",
                align: "center",
                children: [
                    { key: "ActiveCP", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualActiveCP", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceActiveCP", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            },
            {
                key: "NewCPGroup",
                label: "New CP",
                align: "center",
                children: [
                    { key: "NewCP", label: "T", align: "center", render: (v: number) => v || 0 },
                    { key: "ActualNewCP", label: "A", align: "center", render: (v: number) => v || 0 },
                    { key: "PerformanceNewCP", label: "P", align: "center", render: (v: number) => `${v}%` }
                ]
            }
    
        ], [])

    //#endregion

    //#region
    return (
        <div className="space-y-3 pt-4">
            
            <h2 className="text-lg font-semibold text-gray-800">
                Sourcing Target{" "}
                <span className="text-sm font-normal text-gray-500">
                    (Current Month – Project-wise)
                </span>
            </h2>

            <div className="flex-1 bg-white rounded-xl p-5 border border-gray-100 min-w-0 overflow-hidden flex flex-col">
                <CustomTable
                    data={performanceReportSourcingList}
                    columns={PerformanceReportSourcingColumns}
                    emptyMessage="No Performance Report Data Found"
                    className="flex-1"
                    fixedHeight={true}
                />
            </div>

        </div>
    )
}