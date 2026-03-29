import React, { useEffect, useState } from "react";
import WorktimeOverview from "@/features/dashboard/components/WorktimeOverview";
import { HeaderSection } from "@/features/dashboard/components/HeaderSection";
import EmployeeTable from "@/features/dashboard/components/EmployeeTable";
import AttendanceSummary from "@/features/dashboard/components/AttendanceSummary";
import WorkHourSummary from "@/features/dashboard/components/WorkHourSummary";
import QuickActions from "@/features/dashboard/components/QuickActions";
import AttendanceSummaryCard from "@/features/dashboard/components/AttendanceSummaryCard";
import LeaveHoliday from "@/features/dashboard/components/LeaveHoliday";
import { userDashboardServices } from "@/features/dashboard/services/UserDashboardServices";
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { useToast } from '@/core/hooks/useToast';
import EventsMore from "@/features/dashboard/components/EventsMore";
import { Loader } from "@/core/utils/loader";
import type { Table7, Table0, Table2, Table3, Table4, Table1, Table6, Table5, Table8, Table10, Table11, Table12, Table13 } from "@/features/dashboard/models/UserDashboardModel";
import ModuleWorkFlowApproval from "../components/ModuleWorkFlowApproval";

const Dashboard: React.FC = () => {
  const [attendanceSummaryData, setAttendanceSummaryData] = useState<Table7[]>([]);
  const [employeeOverviewTable, setEmployeeOverviewTable] = useState<Table0[]>([]);
  const [workHourStatus, setWorkHourStatus] = useState<Table2[]>([]);
  const [workHourBarGraphStatus, setWorkHourBarGraphStatus] = useState<Table3[]>([]);
  const [leaveBalanceData, setLeaveBalanceData] = useState<Table4[]>([]);
  const [upcomingApprovedHolidays, setUpcomingApprovedHolidays] = useState<Table5[]>([]);
  const [attendanceSummaryShiftPatternData, setAttendanceSummaryShiftPatternData] = useState<Table1[]>([]);
  const [attendanceSummaryPresentDays, setAttendanceSummaryPresentDays] = useState<Table1[]>([]);
  const [holidayData, setHolidayData] = useState<Table6[]>([]);
  const [birthdays, setBirthdays] = useState<Table8[]>([]);
  const [reportingData, setReportingData] = useState<Table10[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [workTimeOverviewTable, setWorkTimeOverviewTable] = useState<Table11[]>([]);
  const [attendanceSummaryTableUserWorkingHours, setAttendanceSummaryTableUserWorkingHours] = useState<Table12[]>([]);
  const [moduleApproval, setModuleApproval] = useState<Table13[]>([]);

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

          setEmployeeOverviewTable(e.Table0 || [])

          setAttendanceSummaryShiftPatternData(e.Table1 || []);
          setAttendanceSummaryPresentDays(e.Table1 || []);

          setWorkHourStatus(e.Table2 || []);

          setWorkHourBarGraphStatus(e.Table3 || []);

          setLeaveBalanceData(e.Table4 || []);

          setUpcomingApprovedHolidays(e.Table5 || []);

          setHolidayData(e.Table6 || []);

          setAttendanceSummaryData(e.Table7 || []);

          setBirthdays(e.Table8 || []);

          setReportingData(e.Table10 || []);

          setWorkTimeOverviewTable(e.Table11 || []);

          setAttendanceSummaryTableUserWorkingHours(e.Table12 || []);

          setModuleApproval(e.Table13 || []);

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
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
      <HeaderSection />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-3 lg:col-span-1">
          <WorktimeOverview workTimeOverviewTable={workTimeOverviewTable} />
         </div>
        <div className="col-span-3 lg:col-span-2">
          <ModuleWorkFlowApproval moduleApproval={moduleApproval} />
        </div>

      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-3 lg:col-span-2">
          <EmployeeTable employeeOverviewTable={employeeOverviewTable} />
        </div>
        <div className="col-span-3 lg:col-span-1">
          <AttendanceSummary attendanceSummaryData={attendanceSummaryData} />
        </div>
      </div>

      {/* Work hour grid */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <WorkHourSummary workHourStatus={workHourStatus} workHourBarGraphStatus={workHourBarGraphStatus} attendanceSummaryTableUserWorkingHours={attendanceSummaryTableUserWorkingHours} />
        </div>
        <div className="col-span-1">
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1">
        {/* Attendance summary section */}
        <AttendanceSummaryCard attendanceSummaryShiftData={attendanceSummaryShiftPatternData} attendancePresentData={attendanceSummaryPresentDays} />
      </div>


      {/* Leave & Holiday */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <LeaveHoliday leaveBalanceData={leaveBalanceData} holidayData={holidayData} upcomingApprovedHolidays={upcomingApprovedHolidays} />
        </div>
      </div>

      {/* Events and More */}
      <div className="gap-5">

        <EventsMore birthdays={birthdays} reportingData={reportingData} />
      </div>

    </div>
  );
};

export default Dashboard;

