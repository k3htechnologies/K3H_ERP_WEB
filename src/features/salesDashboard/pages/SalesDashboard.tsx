import React, { useCallback, useEffect, useState } from "react";
import { runApiWithLoader } from '@/core/utils'
import { salesDashboardService } from '@/features/salesDashboard/services/SalesDashboardServices';
import { useToast } from '@/core/hooks/useToast';
import * as E from 'fp-ts/Either';
import { Loader } from '@/core/utils/loader';
import Enquiries from "@/features/salesDashboard/components/Enquiries";
import FollowUp from "@/features/salesDashboard/components/FollowUp";
import type { Table0, Table1, Table4, Table6, Table7, Table8 } from "@/features/salesDashboard/models/SalesDashboardModel";
import AttendanceSummary from "@/features/dashboard/components/AttendanceSummary";
import type { ProjectAchievementData } from "@/features/achievement/models/AchievementReportModel";
import ProjectAchievement from "@/features/salesDashboard/components/ProjectAchievement";
import { DateRangeWithActions } from "@/ui/components/DateRangeWithActions";
import RecentBooking from "@/features/salesDashboard/components/RecentBooking";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import Tabs from "@/ui/components/Tab/Tab";
import OverviewCards from "@/features/salesDashboard/components/OverviewCards";
import HighestPerformer from "@/features/salesDashboard/components/HighestPerformer";

const SalesDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [enquiryData, setEnquiryData] = useState<Table0[]>([]);
    const [enquiryFollowUpData, setEnquiryFollowUpData] = useState<Table1[]>([]);
    const [attendanceSummaryData, setAttendanceSummaryData] = useState<Table4[]>([]);
    const [projectAchievementData, setProjectAchievementData] = useState<ProjectAchievementData[]>([]);
    const [bookingData, setBookingData] = useState<Table6[]>([]);
    const [employeeOverviewTable, setEmployeeOverviewTable] = useState<Table7[]>([]);
    const [highestPerformerData, setHighestPerformerData] = useState<Table8[]>([]);


    const { addToast } = useToast();
    const [projectId, setProjectId] = useState<number>(0);

    const [filterType, setFilterType] = useState<"TODAY" | "WEEKLY" | "MONTHLY" | "DATEWISE">("MONTHLY");
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);

    const shouldLoadData = filterType !== "DATEWISE" || (fromDate && toDate);

    useEffect(() => {

        if (filterType.toUpperCase() === "DATEWISE" && (!fromDate || !toDate)) return;

        loadSalesDashboardData();

    }, [projectId, filterType, fromDate, toDate]);

    const tabList = [
        { id: "Today", label: "Today" },
        { id: "Weekly", label: "Weekly" },
        { id: "Monthly", label: "Monthly" },
        { id: "Datewise", label: "Datewise" },
        { id: "Overall", label: "Overall" },
    ];

    const [activeTab, setActiveTab] = useState<string>('Monthly');

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

                    // Here 2 ,3 Table Removed DUE TO TARGET WE CAN ADD IN PROJECT CLICK BUTTON

                    setAttendanceSummaryData(e.Table4 || []);

                    setProjectAchievementData(e.Table5 || []);

                    setBookingData(e.Table6 || []);

                    setEmployeeOverviewTable(e.Table7 || []);

                    setHighestPerformerData(e.Table8 || [])

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

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <div className="flex flex-wrap items-center justify-between gap-3">

                <div className="flex gap-2">

                    <Tabs
                        tabs={tabList}
                        defaultActive={activeTab}
                        islarge={true}
                        onTabChange={(t) => {
                            setActiveTab(t.id);

                            const tabValue = t.id.toUpperCase();

                            setFilterType(tabValue as any);

                            if (tabValue !== "DATEWISE") {
                                setFromDate(null);
                                setToDate(null);
                            }
                        }}
                        istoggleTab={true}
                    />
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

                <div className="flex justify-end">
                    <div className="w-full md:w-100">
                        <SinglePageSelection
                            required
                            options={(LocalStorageHelper.getStoredEmployeeData?.()?.ProjectData ?? []).map(opt => ({
                                label: opt.ProjectName,
                                value: opt.ProjectId
                            }))}

                            value={projectId}
                            onChange={(value) => setProjectId(Number(value) || 0)}

                            placeholder="All Project"
                        />
                    </div>
                </div>

            </div>

            <div>

                {shouldLoadData &&
                    <OverviewCards projectAchievementData={projectAchievementData} enquiryFollowUpData={enquiryFollowUpData} />
                }

                {shouldLoadData &&
                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12 lg:col-span-4">
                            <AttendanceSummary attendanceSummaryData={attendanceSummaryData}  employeeOverviewTable={employeeOverviewTable} />
                        </div>

                        <div className="col-span-12 lg:col-span-8">
                            <RecentBooking data={bookingData} />
                        </div>

                        
                    </div>
                }

                {shouldLoadData &&
                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12 lg:col-span-8">
                           {projectAchievementData.length > 0 && shouldLoadData && <ProjectAchievement projectAchievementData={projectAchievementData} filterType={filterType} fromDate={fromDate} toDate={toDate} />}
                        </div>

                        <div className="col-span-12 lg:col-span-4">
                            <HighestPerformer highestPerformerData={highestPerformerData} />
                        </div>
                    </div>
                }
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 pt-3">
                    
                    {enquiryData.length > 0 && shouldLoadData && <Enquiries enquiryData={enquiryData} />}
                    {enquiryFollowUpData.length > 0 && shouldLoadData && <FollowUp enquiryFollowUpData={enquiryFollowUpData} />}

                </div>
            </div>
        </div>
    )
}

export default SalesDashboard