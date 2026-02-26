import React, { useState, useEffect } from 'react'
import OverviewCards from '@/features/settingsDashboard/components/OverviewCards'
import CompanySetup from '@/features/settingsDashboard/components/CompanySetup'
import ProcurementMaster from '@/features/settingsDashboard/components/ProcurementMaster'
import VendorManagement from '@/features/settingsDashboard/components/VendorManagement'
import VendorGraphCard from '@/features/settingsDashboard/components/VendorGraphCard'
import ProjectManagement from '@/features/settingsDashboard/components/ProjectManagement'
import ProjectStatus from '@/features/settingsDashboard/components/ProjectStatus'
import { runApiWithLoader } from '@/core/utils'
import { settingsDashboardService } from '@/features/settingsDashboard/services/SettingsDashboardServices';
import { useToast } from '@/core/hooks/useToast';
import * as E from 'fp-ts/Either';
import { Loader } from '@/core/utils/loader'

const SettingsDashboard: React.FC = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [overViewCards, setOverViewCards] = useState<any>([]);
  const [companySetup, setCompanySetup] = useState<any>([]);
  const [procurementMaster, setProcurementMaster] = useState<any>([]);
  const [vendorManagement, setVendorManagement] = useState<any>([]);
  const [vendorGraphCard, setVendorGraphCard] = useState<any>([]);
  const [projectManagement, setProjectManagement] = useState<any>([]);
  const [projectStatus, setProjectStatus] = useState<any>([]);

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
          setProjectStatus(e.Table6 || []);

        } else {

          addToast({ type: 'error', title: response.left.message });
          
        }
        return response;
      }
    )
  }

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-3">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      <OverviewCards overViewData={overViewCards} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <CompanySetup companySetupData={companySetup} />
        <ProcurementMaster procurementMasterData={procurementMaster} />
        <VendorManagement vendorManagementData={vendorManagement} />
        <VendorGraphCard vendorGraphData={vendorGraphCard} />
        <ProjectManagement projectManagementData={projectManagement} />
        <ProjectStatus projectStatusData={projectStatus} />
      </div>

    </div>
  )
}

export default SettingsDashboard
