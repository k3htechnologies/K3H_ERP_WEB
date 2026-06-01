import React, { useState, useEffect } from 'react'
import OverviewCards from '@/features/settingsDashboard/components/OverviewCards'
import CompanySetup from '@/features/settingsDashboard/components/CompanySetup'
import ProcurementMaster from '@/features/settingsDashboard/components/ProcurementMaster'
import VendorManagement from '@/features/settingsDashboard/components/VendorManagement'
import ProjectManagement from '@/features/settingsDashboard/components/ProjectManagement'
import { runApiWithLoader } from '@/core/utils'
import { settingsDashboardService } from '@/features/settingsDashboard/services/SettingsDashboardServices';
import { useToast } from '@/core/hooks/useToast';
import * as E from 'fp-ts/Either';
import { Loader } from '@/core/utils/loader';
import type { Table0, Table1, Table2, Table3, Table4, Table5, Table6, Table7 } from "@/features/settingsDashboard/models/SettingsDashboardModel";



const SettingsDashboard: React.FC = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [overViewCards, setOverViewCards] = useState<Table0[]>([]);
  const [companySetup, setCompanySetup] = useState<Table1[]>([]);
  const [procurementMaster, setProcurementMaster] = useState<Table2[]>([]);
  const [vendorManagement, setVendorManagement] = useState<Table3[]>([]);
  const [vendorGraphCard, setVendorGraphCard] = useState<Table5[]>([]);
  const [projectManagement, setProjectManagement] = useState<Table4[]>([]);
  const [projectStatus, setProjectStatus] = useState<Table7[]>([]);
  const [vendorCount, setVendorCount] = useState<Table6[]>([]);

  const { addToast } = useToast();

  useEffect(() => {
    loadSettingsDashboardData();
  }, []);


  //#region DATA LOADING | FETCH |  LOAD | SEARCH 
  const loadSettingsDashboardData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await settingsDashboardService.apiCallPullSettingsDashboard();
        if (E.isRight(response)) {

          const e = response.right.Data;
          setOverViewCards(e.Table0 || []);
          setCompanySetup(e.Table1 || []);
          setProcurementMaster(e.Table2 || []);
          setVendorManagement(e.Table3 || []);
          setProjectManagement(e.Table4 || []);
          setVendorGraphCard(e.Table5 || []);
          setProjectStatus(e.Table7 || []);
          setVendorCount(e.Table6 || []);

        } else {

          addToast({ type: 'error', title: response.left.message });

        }
        return response;
      }
    )
  }

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <OverviewCards overViewData={overViewCards} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <ProcurementMaster procurementMasterData={procurementMaster} />
        <CompanySetup companySetupData={companySetup} />
        <ProjectManagement projectManagementData={projectManagement} projectStatusData={projectStatus} />
        <VendorManagement vendorManagementData={vendorManagement} vendorGraphData={vendorGraphCard} vendorCount={vendorCount} />
      </div>

    </div>
  )
}

export default SettingsDashboard
