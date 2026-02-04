import React from 'react'
import OverviewCards from '../components/OverviewCards'
import CompanySetup from '../components/CompanySetup'
import ProcurementMaster from '../components/ProcurementMaster'
import VendorManagement from '../components/VendorManagement'
import VendorGraphCard from '../components/VendorGraphCard'
import ProjectManagement from '../components/ProjectManagement'
import ProjectStatus from '../components/ProjectStatus'
import PayrollMaster from '../components/PayrollMaster'

const SettingsDashboard: React.FC = () => {
  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
      <OverviewCards />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <CompanySetup />
        <ProcurementMaster />
        <VendorManagement/>
        <VendorGraphCard/>
        <ProjectManagement/>
        <ProjectStatus/>
      </div>
      <div>
       <PayrollMaster/>
      </div>
    </div>
  )
}

export default SettingsDashboard
