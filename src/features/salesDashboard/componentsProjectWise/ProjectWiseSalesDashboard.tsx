import useToast from "@/core/hooks/useToast";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Table0, Table1, Table3 } from "../models/ProjectWiseSalesDashboardModel";
import type { ProjectAchievementData } from "@/features/achievement/models/AchievementReportModel";
import { runApiWithLoader } from "@/core/utils";
import { salesDashboardService } from "../services/SalesDashboardServices";
import * as E from 'fp-ts/Either';
import { Loader } from "@/core/utils/loader";
import { DataTableWithOutBorder, type TableColumn } from "@/ui/components/DataTable/DataTableWithoutBorder";

interface Props {
    filterType: string;
    fromDate: string | null;
    toDate: string | null;
    projectId?: number;
    projectName?: string;
}

export const ProjectWiseSalesDashboard: React.FC<Props> = ({ filterType, fromDate, toDate, projectId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [performanceReportClosingData, setPerformanceReportClosingData] = useState<Table0[]>([]);
    const [performanceReportSourcingData, setPerformanceReportSourcingData] = useState<Table1[]>([]);
    const [projectAchievementData, setProjectAchievementData] = useState<ProjectAchievementData[]>([]);
    const [channelPartnerData, setChannelPartnerData] = useState<Table3[]>([]);

    const { addToast } = useToast();

    useEffect(() => {

        if (filterType.toUpperCase() === "DATEWISE" && (!fromDate || !toDate)) return;

        loadProjectWiseSalesDashboardData();
    }, [projectId, filterType, fromDate, toDate]);


    const loadProjectWiseSalesDashboardData = useCallback(async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await salesDashboardService.apiCallPullProjectWiseSalesDashboard(Number(projectId || 0),
                    filterType.toUpperCase(),
                    filterType.toUpperCase() === "DATEWISE" ? fromDate : "",
                    filterType.toUpperCase() === "DATEWISE" ? toDate : "");

                if (E.isRight(response)) {

                    const e = response.right.Data;

                    setPerformanceReportClosingData(e.Table0 || []);

                    setPerformanceReportSourcingData(e.Table1 || []);

                    setProjectAchievementData(e.Table2 || []);

                    setChannelPartnerData(e.Table3 || []);
                    

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Data"
        );
    }, [projectId, addToast, filterType, fromDate, toDate]);


    const projectAchievementColumns: TableColumn[] = [

        {
            key: 'TotalWalkins',
            label: 'Walkins',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => value || "0",
        },
        {
            key: 'WalkinsByCP',
            label: 'Walkins By CP',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => value || "0",
        },
        {
            key: 'WalkinsDirect',
            label: 'Walkins Direct',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => value || "0",
        },
        {
            key: 'Revisits',
            label: 'Revisits',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => value || "0",
        },
        {
            key: 'TotalBooking',
            label: 'Booking',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => value || "0",
        },
        {
            key: 'TotalRevenue',
            label: 'Revenue (₹)',
            width: '15',
            sortable: false,
            align: 'center',
            render: (value) => value || "0",
        }
    ]

    const PerformanceReportClosingColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'EmployeeName',
            label: 'Employee Name',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: (value) => (
                <span className="text-black-400">
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

        {
            key: 'WalkinsByCP',
            label: 'Walkin By CP',
            align: 'center',
            render: (_, row) => (
                <span>
                    <span className="text-red-500 font-medium">
                        {row.ActualWalkinsByCP || 0}
                    </span>
                    {" / "}
                    <span>{row.WalkinsByCP || 0}</span>
                </span>
            )
        },


        {
            key: 'WalkinsDirect',
            label: 'Walkins Direct',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500 font-medium">
                        {row.ActualWalkinsDirect || 0}
                    </span>
                    {' / '}
                    <span>{row.WalkinsDirect || 0}</span>
                </>
            )
        },
        {
            key: 'FreshVisits',
            label: 'Fresh Visits',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500 font-medium">
                        {row.ActualFreshVisits || 0}
                    </span>
                    {' / '}
                    <span>{row.FreshVisits || 0}</span>
                </>
            )
        },

        {
            key: 'Revisits',
            label: 'Revisits',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500 font-medium">
                        {row.ActualRevisits || 0}
                    </span>
                    {' / '}
                    <span>{row.Revisits || 0}</span>
                </>
            )
        },
        {
            key: 'BookingByCP',
            label: 'Booking By CP',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500 font-medium">
                        {row.ActualBookingByCP || 0}
                    </span>
                    {' / '}
                    <span>{row.BookingByCP || 0}</span>
                </>
            )
        },
        {
            key: 'BookingDirect',
            label: 'Booking Direct',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500 font-medium">
                        {row.ActualBookingDirect || 0}
                    </span>
                    {' / '}
                    <span>{row.BookingDirect || 0}</span>
                </>
            )
        }

    ], []);

    const PerformanceReportSourcingColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'EmployeeName',
            label: 'Employee Name',
            sortable: false,
            width: '15',
            fixed: 'left',
            align: 'left',
            render: (value) => (
                <span className="text-black-400">{value}</span>
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
            key: 'WalkinsByCP',
            label: 'Walkins By CP',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualWalkinsByCP || 0}</span>
                    {' / '}
                    <span>{row.WalkinsByCP || 0}</span>
                </>
            )
        },

        {
            key: 'FreshVisits',
            label: 'Fresh Visits',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualFreshVisits || 0}</span>
                    {' / '}
                    <span>{row.FreshVisits || 0}</span>
                </>
            )
        },

        {
            key: 'Revisits',
            label: 'Revisits',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualRevisits || 0}</span>
                    {' / '}
                    <span>{row.Revisits || 0}</span>
                </>
            )
        },

        {
            key: 'Bookings',
            label: 'Bookings',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualBookings || 0}</span>
                    {' / '}
                    <span>{row.Bookings || 0}</span>
                </>
            )
        },

        {
            key: 'TotalMeetings',
            label: 'Total Meetings',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualTotalMeetings || 0}</span>
                    {' / '}
                    <span>{row.TotalMeetings || 0}</span>
                </>
            )
        },

        {
            key: 'TotalOBM',
            label: 'Total OBM',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualTotalOBM || 0}</span>
                    {' / '}
                    <span>{row.TotalOBM || 0}</span>
                </>
            )
        },

        {
            key: 'TotalOBMFreshVisits',
            label: 'OBM Fresh Visits',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualTotalOBMFreshVisits || 0}</span>
                    {' / '}
                    <span>{row.TotalOBMFreshVisits || 0}</span>
                </>
            )
        },

        {
            key: 'TotalOBMRevisits',
            label: 'OBM Revisits',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualTotalOBMRevisits || 0}</span>
                    {' / '}
                    <span>{row.TotalOBMRevisits || 0}</span>
                </>
            )
        },

        {
            key: 'TotalIBM',
            label: 'Total IBM',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualTotalIBM || 0}</span>
                    {' / '}
                    <span>{row.TotalIBM || 0}</span>
                </>
            )
        },

        {
            key: 'UniqueCPs',
            label: 'Unique CPs',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualUniqueCPs || 0}</span>
                    {' / '}
                    <span>{row.UniqueCPs || 0}</span>
                </>
            )
        },

        {
            key: 'ActiveCP',
            label: 'Active CP',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualActiveCP || 0}</span>
                    {' / '}
                    <span>{row.ActiveCP || 0}</span>
                </>
            )
        },

        {
            key: 'NewCP',
            label: 'New CP',
            align: 'center',
            render: (_, row) => (
                <>
                    <span className="text-red-500">{row.ActualNewCP || 0}</span>
                    {' / '}
                    <span>{row.NewCP || 0}</span>
                </>
            )
        }

    ], []);

    const channelPartnerColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ChannelPartnerName',
            label: 'CP Name',
            width: '15',
            sortable: false,
            fixed: 'left',
            align: 'left',
            render: (value) => (
                <span className="text-black-400">
                    {value}
                </span>
            )
        },
        {
            key: 'SystemGeneratedCode',
            label: 'CP Code',
            width: '25',
            sortable: false,
            align: 'center',
            render: value => value || '-'
        },

        {
            key: 'WalkinsByCP',
            label: 'Walkin By CP',
            align: 'center',
            render: (value) => value || "0",
        },


        {
            key: 'Revisits',
            label: 'Revisits',
            align: 'center',
            render: (value) => value || "0",
        },
        {
            key: 'TotalBooking',
            label: 'Total Booking',
            align: 'center',
            render: (value) => value || "0",
        },

        {
            key: 'TotalRevenue',
            label: 'Total Revenue',
            align: 'center',
            render: (value) => value || "0",
        },
       

    ], []);

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <div>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">

                    <DataTableWithOutBorder
                        columns={projectAchievementColumns}
                        data={projectAchievementData}
                        emptyMessage="No records Found"
                        fixedHeight={true}
                    />

                    <h2 className="text-lg pt-5 font-semibold text-gray-800">Closing Target</h2>

                    <DataTableWithOutBorder
                        data={performanceReportClosingData}
                        columns={PerformanceReportClosingColumns}
                        emptyMessage="No Data Found"
                        className="flex-1"
                        fixedHeight={true}
                    />

                    <h2 className="text-lg pt-5 font-semibold text-gray-800">Sourcing Target</h2>
                    <DataTableWithOutBorder
                        columns={PerformanceReportSourcingColumns}
                        data={performanceReportSourcingData}
                        emptyMessage="No records Found"
                        className="flex-1"
                        fixedHeight={true}
                    />


                    <h2 className="text-lg pt-5 font-semibold text-gray-800">Channel Partner</h2>

                    <DataTableWithOutBorder
                        data={channelPartnerData}
                        columns={channelPartnerColumns}
                        emptyMessage="No Data Found"
                        className="flex-1"
                        fixedHeight={true}
                    />

                </div>
            </div>
        </div>
    )

};
export default ProjectWiseSalesDashboard;
