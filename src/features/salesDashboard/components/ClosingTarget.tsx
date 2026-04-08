import type { Table2 } from '../models/SalesDashboardModel';
import { useEffect, useMemo, useState } from 'react';
import { CustomTable, type TableColumn } from '@/ui/components/DataTable/CustomTable';

interface Props {
    performanceReportClosingData: Table2[];
}

export default function ClosingTarget({ performanceReportClosingData }: Props) {

    const [performanceReportClosingList, setPerformanceReportClosingList] = useState<Table2[]>(performanceReportClosingData || []);

    useEffect(() => {
        setPerformanceReportClosingList(performanceReportClosingData || []);
    }, [performanceReportClosingData]);

    const PerformanceReportClosingColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'EmployeeName',
            label: 'Employee Name',
            width: '15',
            sortable: true,
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
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },

        // Walkins By CP
        {
            key: "WalkinsByCPGroup",
            label: "Walkins By CP",
            align: "center",
            children: [
                { key: "WalkinsByCP", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualWalkinsByCP", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceWalkinsByCP", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },
        {
            key: "WalkinsDirectGroup",
            label: "Walkins Direct",
            align: "center",
            children: [
                { key: "WalkinsDirect", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualWalkinsDirect", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceWalkinsDirect", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },
        {
            key: "FreshVisitsGroup",
            label: "Fresh Visits",
            align: "center",
            children: [
                { key: "FreshVisits", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualFreshVisits", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceFreshVisits", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },

        {
            key: "RevisitsGroup",
            label: "Revisits",
            align: "center",
            children: [
                { key: "Revisits", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualRevisits", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceRevisits", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },
        {
            key: "BookingByCPGroup",
            label: "Booking By CP",
            align: "center",
            children: [
                { key: "BookingByCP", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualBookingByCP", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceBookingByCP", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        },
        {
            key: "BookingDirectGroup",
            label: "Booking Direct",
            align: "center",
            children: [
                { key: "BookingDirect", label: "T", align: "center", render: (v: number) => v || 0 },
                { key: "ActualBookingDirect", label: "A", align: "center", render: (v: number) => v || 0 },
                { key: "PerformanceBookingDirect", label: "P", align: "center", render: (v: number) => `${v}%` || "0%" }
            ]
        }

    ], []);
    //#endregion

    //#region
    return (
        <div className="space-y-3 pt-4">

            <h2 className="text-lg font-semibold text-gray-800">
                Closing Target{" "}
                <span className="text-sm font-normal text-gray-500">
                    (Current Month – Project-wise)
                </span>
            </h2>

            <div className="flex-1 bg-white rounded-xl p-5 border border-gray-100 min-w-0 overflow-hidden flex flex-col">
                <CustomTable
                    data={performanceReportClosingList}
                    columns={PerformanceReportClosingColumns}
                    emptyMessage="No Performance Report Data Found"
                    fixedHeight={true}
                    className="flex-1"
                />
            </div>

        </div>
    )
}