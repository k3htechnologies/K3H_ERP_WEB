import React, { useState, useEffect } from 'react'
import OverviewCards from '../components/OverviewCards'
import CompanySetup from '../components/CompanySetup'
import ProcurementMaster from '../components/ProcurementMaster'
import VendorManagement from '../components/VendorManagement'
import VendorGraphCard from '../components/VendorGraphCard'
import ProjectManagement from '../components/ProjectManagement'
import ProjectStatus from '../components/ProjectStatus'
import PayrollMaster from '../components/PayrollMaster'
import { runApiWithLoader } from '@/core/utils'
import { usePagination } from '@/core/hooks/usePagination';
import type { FilterWithPaginationSettingsDashboard } from '@/features/settingsDashboard/models/SettingsDashboardModel';
import { settingsDashboardService } from '@/features/settingsDashboard/services/SettingsDashboardServices';
import { useToast } from '@/core/hooks/useToast';
import * as E from 'fp-ts/Either';

const SettingsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const { addToast } = useToast();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(10);

  useEffect(() => {
    loadSettingsDashboardData(pagination.currentPage);
  }, []);


  //#region DATA LOADING | FETCH |  LOAD | SEARCH 
  const loadSettingsDashboardData = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationSettingsDashboard = {
          PageNumber: page,
          PageSize: pagination.pageSize,
        }
        const response = await settingsDashboardService.apiCallPullSettingsDashboard(params);
        console.log('Settings Dashboard Response is: ', response);
        if (E.isRight(response)) {
          setPagination({
            currentPage: page,
          });
        } else {
          addToast({ type: 'error', title: response.left.message });
          console.log('Respo', response);
          return response;
        }
      }
    )
  }

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
      <OverviewCards />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <CompanySetup />
        <ProcurementMaster />
        <VendorManagement />
        <VendorGraphCard />
        <ProjectManagement />
        <ProjectStatus />
      </div>
      <div>
        <PayrollMaster />
      </div>
    </div>
  )
}

export default SettingsDashboard
