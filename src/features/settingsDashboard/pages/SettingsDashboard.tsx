import React, { useState, useEffect } from 'react'
import OverviewCards from '../components/OverviewCards'
import CompanySetup from '../components/CompanySetup'
import ProcurementMaster from '../components/ProcurementMaster'
import VendorManagement from '../components/VendorManagement'
import VendorGraphCard from '../components/VendorGraphCard'
import ProjectManagement from '../components/ProjectManagement'
import ProjectStatus from '../components/ProjectStatus'
// import PayrollMaster from '../components/PayrollMaster'
import { runApiWithLoader } from '@/core/utils'
import { settingsDashboardService } from '@/features/settingsDashboard/services/SettingsDashboardServices';
import { useToast } from '@/core/hooks/useToast';

import * as E from 'fp-ts/Either';

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
  // const [payrollMaster, setPayrollMaster] = useState<any>([]);

  const { addToast } = useToast();

  // PAGINATION STATE

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
          console.log('Respo', response);
          return response;
        }
      }
    )
  }

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-3">
      <OverviewCards overViewData={overViewCards} />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <CompanySetup companySetupData={companySetup} />
        <ProcurementMaster procurementMasterData={procurementMaster} />
        <VendorManagement vendorManagementData={vendorManagement} />
        <VendorGraphCard vendorGraphData={vendorGraphCard} />
        <ProjectManagement projectManagementData={projectManagement} />
        <ProjectStatus projectStatusData={projectStatus} />
      </div>
      {/* <div>
        <PayrollMaster />
      </div> */}
    </div>
  )
}

export default SettingsDashboard
