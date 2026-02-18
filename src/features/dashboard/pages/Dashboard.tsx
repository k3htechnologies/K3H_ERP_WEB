import React, { useEffect, useState } from "react";

import WorktimeOverview from "../components/WorktimeOverview";
import { HeaderSection } from "../components/HeaderSection";
import DailyActivities from "../components/DailyActivities";
import ScheduledTask from "../components/ScheduledTask";
import EmployeeTable from "../components/EmployeeTable";
import AttendanceSummary from "@/features/dashboard/components/AttendanceSummary";
import WorkHourSummary from "../components/WorkHourSummary";
import QuickActions from "../components/QuickActions";
import AttendanceSummaryCard from "../components/AttendanceSummaryCard";
import LeaveHoliday from "../components/LeaveHoliday";
import { userDashboardServices } from "../services/UserDashboardServices";
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { useToast } from '@/core/hooks/useToast';
import EventsMore from "../components/EventsMore";

// for now work only on attendance summary
const Dashboard: React.FC = () => {
  const [attendanceSummaryData, setAttendanceSummaryData] = React.useState<any[]>([]);
  const [employeeOverviewTable, setEmployeeOverviewTable] = React.useState<any[]>([]);
  const [workHourStatus, setWorkHourStatus] = React.useState<any[]>([]);
  const [workHourBarGraphStatus, setWorkHourBarGraphStatus] = React.useState<any[]>([]);
  const [leaveBalanceData, setLeaveBalanceData] = React.useState<any[]>([]);
  const [attendanceSummaryShiftPatternData, setAttendanceSummaryShiftPatternData] = React.useState<any[]>([]);
  const [attendanceSummaryPresentDays, setAttendanceSummaryPresentDays] = React.useState<any[]>([]);
  const [leaveSummaryData, setLeaveSummaryData] = React.useState<any[]>([])
  const [holidayData, setHolidayData] = React.useState<any[]>([]);
  const [birthdays, setBirthdays] = React.useState<any[]>([]);
  const [reportingData, setReportingData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = React.useState<string | null>(null);

  const { addToast } = useToast()

  useEffect(() => {
    loadUserDashboardData();
  }, [])

  //#region DATA LOADING | FETCH 
  const loadUserDashboardData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await userDashboardServices.apiCallPullUserDashboard();
        if (E.isRight(response)) {
          const e = response.right.Data;
          setAttendanceSummaryData(e.Table7 || [])
          setEmployeeOverviewTable(e.Table0 || [])
          setWorkHourStatus(e.Table2 || [])
          setWorkHourBarGraphStatus(e.Table3 || [])
          setAttendanceSummaryShiftPatternData(e.Table1 || []);
          setAttendanceSummaryPresentDays(e.Table1 || []);
          setLeaveBalanceData(e.Table4 || []);
          setLeaveSummaryData(e.Table4 || []);
          setHolidayData(e.Table6 || []);
          setBirthdays(e.Table8 || []);
          setReportingData(e.Table10 || []);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading User Dashboard'
    )
  }

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
      <HeaderSection />
      <div className="grid grid-cols-12 gap-4 ">
        <div className="col-span-4">
          <WorktimeOverview />
        </div>
        <div className="col-span-4">
          <DailyActivities />
        </div>
        <div className="col-span-4">
          <ScheduledTask />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <EmployeeTable employeeOverviewTable={employeeOverviewTable} />
        </div>
        <div className="col-span-1">
          <AttendanceSummary attendanceSummaryData={attendanceSummaryData} />
        </div>
      </div>

      {/* Work hour grid */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <WorkHourSummary workHourStatus={workHourStatus} workHourBarGraphStatus={workHourBarGraphStatus} />
        </div>
        <div className="col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Attendance summary section */}
      <AttendanceSummaryCard attendanceSummaryShiftData={attendanceSummaryShiftPatternData} attendancePresentData={attendanceSummaryPresentDays} />

      {/* Leave & Holiday */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <LeaveHoliday leaveBalanceData={leaveBalanceData} holidayData={holidayData} />
        </div>
      </div>

      {/* Events and More */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <EventsMore birthdays={birthdays} reportingData={reportingData} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

