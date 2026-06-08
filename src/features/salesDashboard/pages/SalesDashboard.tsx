import React, { useCallback, useEffect, useState } from "react";
import { runApiWithLoader } from '@/core/utils'
import { salesDashboardService } from '@/features/salesDashboard/services/SalesDashboardServices';
import { useToast } from '@/core/hooks/useToast';
import * as E from 'fp-ts/Either';
import { Loader } from '@/core/utils/loader';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import Enquiries from "@/features/salesDashboard/components/Enquiries";
import FollowUp from "@/features/salesDashboard/components/FollowUp";
import type { Table0, Table1, Table2, Table3, Table4, Table6,Table7 } from "@/features/salesDashboard/models/SalesDashboardModel";
import ClosingTarget from "@/features/salesDashboard/components/ClosingTarget";
import SourcingTarget from "@/features/salesDashboard/components/SourcingTarget";
import AttendanceSummary from "@/features/dashboard/components/AttendanceSummary";
import type { ProjectAchievementData } from "@/features/achievement/models/AchievementReportModel";
import ProjectAchievement from "@/features/salesDashboard/components/ProjectAchievement";
import { DateRangeWithActions } from "@/ui/components/DateRangeWithActions";
import RecentBooking from "@/features/salesDashboard/components/RecentBooking";

const SalesDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [enquiryData, setEnquiryData] = useState<Table0[]>([]);
    const [enquiryFollowUpData, setEnquiryFollowUpData] = useState<Table1[]>([]);
    const [performanceReportClosingData, setPerformanceReportClosingData] = useState<Table2[]>([]);
    const [performanceReportSourcingData, setPerformanceReportSourcingData] = useState<Table3[]>([]);
    const [attendanceSummaryData, setAttendanceSummaryData] = useState<Table4[]>([]);
    const [projectAchievementData, setProjectAchievementData] = useState<ProjectAchievementData[]>([]);
    const [bookingData, setBookingData] = useState<Table6[]>([]);
    const [employeeOverviewTable, setEmployeeOverviewTable] = useState<Table7[]>([]);

    const { addToast } = useToast();
    const { projectId } = useProject();

    const [filterType, setFilterType] = useState<"TODAY" | "WEEKLY" | "MONTHLY" | "DATEWISE">("MONTHLY");
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);

    const shouldLoadData = filterType !== "DATEWISE" || (fromDate && toDate);

    useEffect(() => {

        if (filterType.toUpperCase() === "DATEWISE" && (!fromDate || !toDate)) return;

        loadSalesDashboardData();
    }, [projectId, filterType, fromDate, toDate]);

    //#region DATA LOADING | FETCH |  LOAD 
    const loadSalesDashboardData = useCallback(async () => {
        await runApiWithLoader(setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await salesDashboardService.apiCallPullSalesDashboard(Number(projectId),
                    filterType.toUpperCase(),
                    filterType.toUpperCase() === "DATEWISE" ? fromDate : "",
                    filterType.toUpperCase() === "DATEWISE" ? toDate : "");

                if (E.isRight(response)) {

                    const e = response.right.Data;

                    setEnquiryData(e.Table0 || []);

                    setEnquiryFollowUpData(e.Table1 || []);

                    setPerformanceReportClosingData(e.Table2 || []);

                    setPerformanceReportSourcingData(e.Table3 || []);

                    setAttendanceSummaryData(e.Table4 || []);

                    setProjectAchievementData(e.Table5 || []);

                    setBookingData(e.Table6 || []);

                    setEmployeeOverviewTable(e.Table7 || [])

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

    //#endregion

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <div className="flex flex-wrap items-center justify-between gap-3">

                <div className="flex gap-2">

                    {["Today", "Weekly", "Monthly", "Datewise", "Overall"].map((tab) => {

                        const tabValue = tab.toUpperCase();

                        return (
                            <button
                                key={tab}
                                onClick={() => {

                                    setFilterType(tabValue as any);

                                    if (tabValue !== "DATEWISE") {
                                        setFromDate(null);
                                        setToDate(null);
                                    }
                                }}
                                className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${filterType === tabValue ? "bg-blue-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>


                {filterType.toUpperCase() === "DATEWISE" && (
                    <div className="flex items-center gap-2">
                        <DateRangeWithActions
                            fromDate={fromDate}
                            toDate={toDate}
                            onBothDatesChange={(f, t) => {
                                setFromDate(f);
                                setToDate(t);
                            }}
                            onFromDateChange={(f) => setFromDate(f)}
                            onToDateChange={(t) => setToDate(t)}
                            exportLoading={false}
                        />
                    </div>
                )}

            </div>

            <div>

                {enquiryData.length > 0 && shouldLoadData &&
                    <div className="grid grid-cols-3 gap-5">
                        <div className="col-span-3 lg:col-span-1">
                            <AttendanceSummary attendanceSummaryData={attendanceSummaryData} employeeOverviewTable={employeeOverviewTable} />
                        </div>
                        <div className="col-span-3 lg:col-span-2">
                            <RecentBooking data={bookingData} />
                        </div>
                    </div>
                }
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                    {projectAchievementData.length > 0 && shouldLoadData && <ProjectAchievement projectAchievementData={projectAchievementData} filterType={filterType} fromDate={fromDate} toDate={toDate} />}
                    {enquiryData.length > 0 && shouldLoadData && <Enquiries enquiryData={enquiryData} />}
                    {enquiryFollowUpData.length > 0 && shouldLoadData && <FollowUp enquiryFollowUpData={enquiryFollowUpData} />}
                    {performanceReportClosingData.length > 0 && shouldLoadData && <ClosingTarget performanceReportClosingData={performanceReportClosingData} />}
                    {performanceReportSourcingData.length > 0 && shouldLoadData && <SourcingTarget performanceReportSourcingData={performanceReportSourcingData} />}

                </div>
            </div>
        </div>
    )
}

export default SalesDashboard