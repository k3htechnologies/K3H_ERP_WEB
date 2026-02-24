import React, { useEffect, useState } from "react";
import PayrollHeader from "@/features/payrollDashboard/components/PayrollHeader";
import OverviewCards from "@/features/payrollDashboard/components/OverviewCards";
import LeaveManagement from "@/features/payrollDashboard/components/LeaveManagement";
import OutdoorManagement from "@/features/payrollDashboard/components/OutdoorManagement";
import AttendanceOverview from "@/features/payrollDashboard/components/AttendanceOverview";
import CompOffTable from "@/features/payrollDashboard/components/CompOffTable";
import Resignation from '@/features/payrollDashboard/components/Resignation'
import { payrollDashboardService } from "../services/PayrollDashboardServices";
import * as E from 'fp-ts/Either';
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import { useToast } from '@/core/hooks/useToast';
import type { FilterWithPaginationPayrollDashboard } from '@/features/payrollDashboard/models/PayrollDashboardModel';
import { Loader } from "@/core/utils/loader";

const PayrollDashboard: React.FC = () => {
  const [overViewData, setOverViewData] = React.useState<any[]>([]);
  const [attendanceOverviewData, setAttendanceOverviewData] = React.useState<any[]>([]);
  const [leaveData, setLeaveData] = React.useState<any[]>([]);
  const [compOffData, setCompOffData] = React.useState<any[]>([]);
  const [resignationData, setResignationData] = React.useState<any[]>([]);
  const [outdoorManagementData, setOutdoorManagementData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { addToast } = useToast()
  const [filters, setFilters] = useState<FilterInfo>({});

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  useEffect(() => {
    loadPayrollDashboardData(pagination.currentPage);
  }, []);

  const handleFilterChange = (newFilters: FilterInfo) => {
    setFilters(newFilters);
    loadPayrollDashboardData(1, newFilters);
    setPagination({ currentPage: 1 });
  };


  //#region DATA LOADING | FETCH |  LOAD | SEARCH
  const loadPayrollDashboardData = (async (page: number, overrideFilters?: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const currentDate = new Date().toISOString().split('T')[0];
        console.log('Current Date: ', currentDate);
        console.log('Override Filters', overrideFilters, filters);

        const activeFilters = overrideFilters || filters;

        const params: FilterWithPaginationPayrollDashboard = {
          PageSize: pagination.pageSize,
          PageNumber: page,
          StartDate: activeFilters.startDate || currentDate,
          EndDate: activeFilters.endDate || currentDate,
          EmployeeName: activeFilters.searchEmployeeNameTerm
        }

        const response = await payrollDashboardService.apiCallPullPayrollDashboard(params);

        if (E.isRight(response)) {
          const e = response.right.Data;
          setOverViewData(e.Table0 || []);
          setAttendanceOverviewData(e.Table5 || []);
          setLeaveData(e.Table1 || []);
          setCompOffData(e.Table2 || []);
          setResignationData(e.Table4 || []);
          setOutdoorManagementData(e.Table3 || []);
        } else {

          addToast({ type: 'error', title: response.left.message });

        }
        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Payroll Dashboard'
    )
  });

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
      
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <PayrollHeader onFilterChange={handleFilterChange} />
      <OverviewCards overViewData={overViewData} />
      <LeaveManagement leaveData={leaveData} />
      <div className="grid grid-cols-2 gap-5">
        <OutdoorManagement outdoorManagementData={outdoorManagementData} />
        <AttendanceOverview attendanceOverviewData={attendanceOverviewData} />
      </div>
      <CompOffTable compOffData={compOffData} />
      <Resignation resignationData={resignationData} />
    </div>
  );
};

export default PayrollDashboard;
