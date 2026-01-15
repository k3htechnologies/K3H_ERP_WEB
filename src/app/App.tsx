import React, { useEffect, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../ui/layouts/Layout';
import ErrorFallbackPage from '@/features/errorFallbackPage/pages/ErrorFallbackPage'
import { useNetworkStatus } from '@/core/hooks/useNetworkStatus';
import { SignIn } from '@/features/authentication/pages/signIn';
import Dashboard from '@/features/dashboard/pages/Dashboard';
import { Profile } from '@/features/profile/page/profile';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import EmployeeModuleAccess from '@/features/employeeModuleAccess/pages/EmployeeModuleAccess';
import { DesignationMaster } from '@/features/designationMaster/pages/DesignationMaster';
import { EmployeeMaster } from '@/features/employeeMaster/pages/EmployeeMaster';
import { BranchMaster } from '@/features/branchMaster/pages/BranchMaster';
import BranchAssociationsMaster from '@/features/branchAssociationsMaster/pages/BranchAssociationsMaster';
import AssetMaster from '@/features/assetMaster/pages/AssetMaster';
import AssetMappingMaster from '@/features/assetMappingMaster/pages/AssetMappingMaster';
import DeductionMaster from '@/features/deductionMaster/pages/DeductionMaster';
import HolidayMaster from '@/features/holidayMaster/pages/HolidayMaster';
import HolidayMappingMaster from '@/features/holidayMappingMaster/pages/HolidayMappingMaster';
import LeaveEncashmentMaster from '@/features/leaveEncashmentMaster/pages/LeaveEncashmentMaster';
import LeaveTypeMaster from '@/features/leaveTypeMaster/pages/LeaveTypeMaster';
import ShiftMaster from '@/features/shiftMaster/pages/ShiftMaster';
import ShiftMappingMaster from '@/features/shiftMappingMaster/pages/ShiftMappingMaster';
import WeekOffMasterMaster from '@/features/weekOffMaster/pages/WeekOffMaster';
import WeekOffMappingMaster from '@/features/weekOffMappingMaster/pages/WeekOffMappingMaster';
import Vendor from '@/features/vendor/pages/Vendor';
import CompanyMaster from '@/features/companyMaster/pages/CompanyMaster';
import TncMaster from '@/features/tnc/pages/TncMaster';
import BankListMaster from '@/features/bankListMaster/pages/BankListMaster';
import AddCompany from '@/features/companyMaster/pages/AddCompany';
import { CountryStateCityDistrictVillage } from '@/core/hooks/useCountryStateCityDistrictVillage';
import ProjectMaster from '@/features/projectMaster/pages/ProjectMaster';
import AddUpdateEmployeeMaster from '@/features/employeeMaster/pages/AddUpdateEmployeeMaster';
import { MaterialMaster } from '@/features/materialMaster/pages/MaterialMaster';
import ViewEmployeeMaster from '@/features/employeeMaster/pages/ViewEmployeeMaster';
import ViewProjectMaster from '@/features/projectMaster/pages/ViewProjectMaster';
import AddUpdateProjectMaster from '@/features/projectMaster/pages/AddUpdateProjectMaster';
import { AddUpdateAssetMaster } from '@/features/assetMaster/pages/AddUpdateAssetMaster';
import ViewAssetMaster from '@/features/assetMaster/pages/ViewAssetMaster';
import { AddUpdateWeekOffMaster } from '@/features/weekOffMaster/pages/AddUpdateWeekOffMaster';
import AddUpdateAssetMappingMaster from '@/features/assetMappingMaster/pages/AddUpdateAssetMappingMaster';
import AddUpdateDeductionMaster from '@/features/deductionMaster/pages/AddUpdateDeductionMaster';
import AddUpdateShiftMaster from '@/features/shiftMaster/pages/AddUpdateShiftMaster';
import ViewAssetMappingMaster from '@/features/assetMappingMaster/pages/ViewAssetMappingMaster';
import ViewShiftMaster from '@/features/shiftMaster/pages/ViewShiftMaster';
import ViewDeductionMaster from '@/features/deductionMaster/pages/ViewDeductionMaster';
import ViewWeekOffMaster from '@/features/weekOffMaster/pages/ViewWeekOffPage';
import SubMaterialMaster from '@/features/subMaterialMaster/pages/SubMaterialMaster';
import { UomMaster } from '@/features/uomMaster/pages/UomMaster';
import ProjectDocumentCategoryMaster from '@/features/projectDocumentCategory/pages/ProjectDocumentCategoryMaster';
import ProjectDocument from '@/features/projectDocument/pages/ProjectDocument';
import ApprovalDocumentCategoryMaster from '@/features/approvalDocumentCategory/pages/ApprovalDocumentCategoryMaster';
import ApprovalDocument from '@/features/approvalDocument/pages/ApprovalDocument';
import ProjectRERADocumentCategoryMaster from '@/features/projectRERADocumentCategory/pages/ProjectRERADocumentCategoryMaster';
import ProjectRERADocument from '@/features/projectRERADocument/pages/ProjectRERADocument';
import ViewCompantMaster from '@/features/companyMaster/pages/ViewCompanyMaster';
import Inventory from '@/features/inventory/pages/Inventory';
import InventorySpecification from '@/features/inventory/pages/InventorySpecification';
import { OutDoor } from '@/features/outdoor/pages/OutDoor';

import { ViewVendor } from '@/features/vendor/pages/ViewVendor';
import SiteProgress from '@/features/siteProgress/pages/SiteProgress';
import SiteProgressSubConstruction from '@/features/siteProgress/pages/SiteProgressSubConstruction';
import SiteProgressWingConstruction from '@/features/siteProgress/pages/SiteProgressWingConstruction';
import SiteProgressFloorConstruction from '@/features/siteProgress/pages/SiteProgressFloorConstruction';
import SiteProgressFlatConstruction from '@/features/siteProgress/pages/SiteProgressFlatConstruction';
import SiteProgressConstructionActivity from '@/features/siteProgress/pages/SiteProgressConstructionActivity';
import SiteProgressConstructionSubActivity from '@/features/siteProgress/pages/SiteProgressConstructionSubActivity';
import { Building } from '@/features/building/pages/Building';
import ViewBuilding from '@/features/building/pages/ViewBuilding';
import AddUpdateBuilding from '@/features/building/pages/AddUpdateBuilding';
import Tenant from '@/features/tenant/pages/Tenant';
import AddUpdateTenant from '@/features/tenant/pages/AddUpdateTenant';
import ViewTenant from '@/features/tenant/pages/ViewTenant';
import AddUpdateVendor from '@/features/vendor/pages/AddUpdateVendor';
import { ChannelPartner } from '@/features/ChannelPartner/pages/ChannelPartner';
import { AddUpdateChannelPartner } from '@/features/ChannelPartner/pages/AddUpdateChannelPartner';
import BuildingDescription from '@/features/building/pages/BuildingDescription';
import BuildingDocument from '@/features/building/pages/BuildingDocument';
import { BuildingListStateProvider } from '@/features/building/context/BuildingListStateContext';
import { TenantListStateProvider } from '@/features/tenant/context/TenantListStateContext';
import TenantDocument from '@/features/tenant/pages/TenantDocument';
import ProposedOffer from '@/features/proposedOffer/pages/ProposedOffer';
import Company from '@/features/projectMaster/pages/Company';
import Bank from '@/features/projectMaster/pages/Bank';
import Employee from '@/features/projectMaster/pages/Employee';
import EmployeeDocument from '@/features/employeeMaster/pages/EmployeeDocument';
import Rent from '@/features/rent/pages/Rent';
import Event from '@/features/event/pages/Event';
import CompOff from '@/features/compOff/pages/compoff';
import LeaveCreditDebit from '@/features/leaveCreditDebit/pages/LeaveCreditDebit';
import AddUpdateLeaveCreditDebit from '@/features/leaveCreditDebit/pages/AddUpdateLeaveCreditDebit';
import ViewLeaveCreditDebit from '@/features/leaveCreditDebit/pages/ViewLeaveCreditDebit';
import { AddUpdateOutDoorPage } from '@/features/outdoor/pages/AddUpdateOutDoor';
import Leave from '@/features/leave/pages/Leave';
import AddUpdateLeave from '@/features/leave/pages/AddUpdateLeave';
import ViewLeave from '@/features/leave/pages/ViewLeave';
import ViewEnquiry from '@/features/enquiry/pages/ViewEnquiry';
import Enquiry from '@/features/enquiry/pages/Enquiry';
import AddUpdateEnquiry from '@/features/enquiry/pages/AddUpdateEnquiry';
import { EnquiryListStateProvider } from '@/features/enquiry/context/EnquiryListStateContext';
import EarningMaster from '@/features/earningMaster/pages/EarningMaster';
import ProposedPlan from '@/features/proposedOffer/pages/ProposedPlan';
import ViewChannelPartner from '@/features/ChannelPartner/pages/ViewChannelPartner';
import EmployeeResignation from '@/features/resignation/pages/EmployeeResignation';
import PayrollReport from '@/features/payrollReport/pages/PayrollReport';
import DepartmentMaster from '@/features/departmentMaster/pages/DepartmentMaster';

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
)

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {

  const token = LocalStorageHelper.getStoredTokenData();

  if (!token) {

    LocalStorageHelper.clearLocalStorageData();

    return <Navigate to="/sign-in" replace />
  }

  return <>{children}</>
}

function App() {

  useNetworkStatus();

  // Check for existing auth token on app load
  useEffect(() => {
    const token = LocalStorageHelper.getStoredTokenData()
    if (!token) {
      // Token validation could be added here if needed
    }
  }, [])


  return (
    <CountryStateCityDistrictVillage>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="sign-in" element={<SignIn />} />
          <Route path="error" element={<ErrorFallbackPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            //#region SETTING - COMPANY SETUP
            <Route path="departmentMaster" element={<DepartmentMaster />} />
            <Route path="designationMaster" element={<DesignationMaster />} />
            <Route path="designationMaster/employeeModuleAccess/:designationMasterId" element={<EmployeeModuleAccess />} />
            //#endregion
            
            <Route path="compoff" element={<CompOff />} />
            <Route path="vendor/add/:vendorId?" element={<AddUpdateVendor />} />

            <Route path="employeeMaster" element={<EmployeeMaster />} />
            <Route path="employeeMaster/view" element={<ViewEmployeeMaster />} />
            <Route path="employeeMaster/add/:employeeId?" element={<AddUpdateEmployeeMaster />} />
            <Route path="employeeMaster/document" element={<EmployeeDocument />} />
            <Route path="outdoor/add/:outdoorId?" element={<AddUpdateOutDoorPage />} />
            <Route path="leaveCreditDebit" element={<LeaveCreditDebit />} />
            <Route path="leaveCreditDebit/add/:id?" element={<AddUpdateLeaveCreditDebit />} />
            <Route path="leaveCreditDebit/view/:id?" element={<ViewLeaveCreditDebit />} />
            <Route path="outdoor" element={<OutDoor />} />
            <Route path="leave" element={<Leave />} />
            <Route path="leave/add/:id?" element={<AddUpdateLeave />} />
            <Route path="leave/view/:id?" element={<ViewLeave />} />
            <Route path="resignation" element={<EmployeeResignation />} />
            <Route path="payrollReport" element={<PayrollReport />} />
            <Route path="companyMaster" element={<CompanyMaster />} />
            <Route path="companyMaster/view" element={<ViewCompantMaster />} />
            <Route path="companyMaster/add/:companyId?" element={<AddCompany />} />
            <Route path="tnc" element={<TncMaster />} />
            <Route path="bankListMaster" element={<BankListMaster />} />
            <Route path="branchMaster" element={<BranchMaster />} />
            <Route path="branchAssociationsMaster" element={<BranchAssociationsMaster />} />
            <Route path="assetMaster" element={<AssetMaster />} />
            <Route path="assetMaster/view" element={<ViewAssetMaster />} />
            <Route path="assetMaster/add/:AssetMasterId?" element={<AddUpdateAssetMaster />} />
            <Route path="assetMappingMaster" element={<AssetMappingMaster />} />
            <Route path="assetMappingMaster/view" element={< ViewAssetMappingMaster />} />
            <Route path="assetMappingMaster/add/:AssetMasterMappingId?" element={<AddUpdateAssetMappingMaster />} />
            <Route path="deductionMaster" element={<DeductionMaster />} />
            <Route path="deductionMaster/view" element={< ViewDeductionMaster />} />
            <Route path="deductionMaster/add/:DeductionMasterId?" element={<AddUpdateDeductionMaster />} />
            <Route path="earningMaster" element={<EarningMaster />} />
            <Route path="holidayMaster" element={<HolidayMaster />} />
            <Route path="holidayMappingMaster" element={<HolidayMappingMaster />} />
            <Route path="leaveEncashmentMaster" element={<LeaveEncashmentMaster />} />
            <Route path="leaveTypeMaster" element={<LeaveTypeMaster />} />
            <Route path="shiftMaster" element={<ShiftMaster />} />
            <Route path="shiftMaster/view" element={< ViewShiftMaster />} />
            <Route path="shiftMaster/add/:ShiftManagementMasterId?" element={<AddUpdateShiftMaster />} />
            <Route path="shiftMappingMaster" element={<ShiftMappingMaster />} />
            <Route path="weekOffMaster" element={<WeekOffMasterMaster />} />
            <Route path="WeekOffMaster/view" element={<ViewWeekOffMaster />} />
            <Route path="WeekOffMaster/add/:WeekOffMasterId?" element={<AddUpdateWeekOffMaster />} />
            <Route path="weekOffMappingMaster" element={<WeekOffMappingMaster />} />

            <Route path="vendor" element={<Vendor />} />
            <Route path="vendor/view" element={<ViewVendor />} />
            <Route path="projectMaster" element={<ProjectMaster />} />
            <Route path="projectMaster/view" element={<ViewProjectMaster />} />
            <Route path="projectMaster/add/:projectId?" element={<AddUpdateProjectMaster />} />
            <Route path="projectMaster/employee" element={<Employee />} />
            <Route path="projectMaster/bank" element={<Bank />} />
            <Route path="projectMaster/Company" element={<Company />} />
            <Route path="weekOffMappingMaster" element={<WeekOffMappingMaster />} />
            <Route path="materialMaster" element={<MaterialMaster />} />
            <Route path="inventory" element={<Inventory></Inventory>} />
            <Route path="inventorySpecification" element={<InventorySpecification></InventorySpecification>}></Route>
            <Route path="subMaterialMaster" element={<SubMaterialMaster />} />
            <Route path="uomMaster" element={<UomMaster />} />
            <Route path="category" element={<ProjectDocumentCategoryMaster />} />
            <Route path="document" element={<ProjectDocument />} />
            <Route path="approvalCategory" element={<ApprovalDocumentCategoryMaster />} />
            <Route path="approvalDocument" element={<ApprovalDocument />} />
            <Route path="reraCategory" element={<ProjectRERADocumentCategoryMaster />} />
            <Route path="rera" element={<ProjectRERADocument />} />
            <Route path="siteProgress" element={<SiteProgress />} />
            <Route path="siteProgress/SiteProgressSubConstruction" element={<SiteProgressSubConstruction />} />
            <Route path="siteProgress/SiteProgressWingConstruction" element={<SiteProgressWingConstruction />} />
            <Route path="siteProgress/SiteProgressFloorConstruction" element={<SiteProgressFloorConstruction />} />
            <Route path="siteProgress/SiteProgressFlatConstruction" element={<SiteProgressFlatConstruction />} />
            <Route path="siteProgress/SiteProgressConstructionActivity" element={<SiteProgressConstructionActivity />} />
            <Route path="siteProgress/SiteProgressConstructionSubActivity" element={<SiteProgressConstructionSubActivity />} />
            <Route path="profile" element={<Profile />} />


            <Route path="event" element={<Event />} />

            {/* SALES */}
            <Route path="channelPartner" element={<ChannelPartner />} />
            <Route path="channelPartner/view" element={<ViewChannelPartner />} />
            <Route path="channelPartner/add/:ChannelPartnerId?" element={<AddUpdateChannelPartner />} />

            <Route path="enquiry" element={<EnquiryListStateProvider><Enquiry /></EnquiryListStateProvider>} />
            <Route path="enquiry/view/:EnquiryId?" element={<EnquiryListStateProvider><ViewEnquiry /></EnquiryListStateProvider>} />
            <Route path="enquiry/add/:EnquiryId?" element={<EnquiryListStateProvider><AddUpdateEnquiry /></EnquiryListStateProvider>} />

            {/* REDEVELOPMENT */}

            <Route path="building" element={<BuildingListStateProvider><Building /></BuildingListStateProvider>} />
            <Route path="building/view" element={<BuildingListStateProvider><ViewBuilding /></BuildingListStateProvider>} />
            <Route path="building/add/:buildingId?" element={<BuildingListStateProvider><AddUpdateBuilding /></BuildingListStateProvider>} />
            <Route path="building/description" element={<BuildingListStateProvider><BuildingDescription /></BuildingListStateProvider>} />
            <Route path="building/document" element={<BuildingListStateProvider><BuildingDocument /></BuildingListStateProvider>} />

            <Route path="tenant" element={<TenantListStateProvider><Tenant /></TenantListStateProvider>} />
            <Route path="tenant/view" element={<TenantListStateProvider><ViewTenant /></TenantListStateProvider>} />
            <Route path="tenant/add/:tenantId?" element={<TenantListStateProvider><AddUpdateTenant /></TenantListStateProvider>} />
            <Route path="tenant/document" element={<TenantListStateProvider><TenantDocument /></TenantListStateProvider>} />

            <Route path="rent" element={<Rent />} />

            <Route path="proposedOffer" element={<ProposedOffer />} />

            <Route path="proposedPlan" element={<ProposedPlan />} />

          </Route>

          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </Suspense>
    </CountryStateCityDistrictVillage>
  )
}

export default App
