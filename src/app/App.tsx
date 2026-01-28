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
import { OutDoorListStateProvider } from '@/features/outdoor/context/OutDoorListStateContext';
import { TenantListStateProvider } from '@/features/tenant/context/TenantListStateContext';
import { EmployeeListStateProvider } from '@/features/employeeMaster/context/EmployeeListStateContext';
import { CompanyListStateProvider } from '@/features/companyMaster/context/CompanyListStateContext';
import { VendorListStateProvider } from '@/features/vendor/context/VendorListStateContext';
import { ProjectMasterListStateProvider } from '@/features/projectMaster/context/ProjectMasterListStateContext';
import { AssetMasterListStateProvider } from '@/features/assetMaster/context/AssetMasterListStateContext';
import { AssetMappingMasterListStateProvider } from '@/features/assetMappingMaster/context/AssetMappingMasterListStateContext';
import { DeductionMasterListStateProvider } from '@/features/deductionMaster/context/DeductionMasterListStateContext';
import { ShiftMasterListStateProvider } from '@/features/shiftMaster/context/ShiftMasterListStateContext';
import { WeekOffMasterListStateProvider } from '@/features/weekOffMaster/context/WeekOffMasterListStateContext';
import TenantDocument from '@/features/tenant/pages/TenantDocument';
import ProposedOffer from '@/features/proposedOffer/pages/ProposedOffer';
import Company from '@/features/projectMaster/pages/Company';
import Bank from '@/features/projectMaster/pages/Bank';
import Employee from '@/features/projectMaster/pages/Employee';
import EmployeeDocument from '@/features/employeeMaster/pages/EmployeeDocument';
import Rent from '@/features/rent/pages/Rent';
import Event from '@/features/event/pages/Event';
import AttendanceCalendar from '@/features/attendanceCalendar/pages/AttendanceCalendar';
import CompOff from '@/features/compOff/pages/compoff';
import LeaveCreditConfiguration from '@/features/leaveCreditConfiguration/pages/LeaveCreditConfiguration';
import AddUpdateLeaveCreditConfiguration from '@/features/leaveCreditConfiguration/pages/AddUpdateLeaveCreditConfiguration';
import ViewLeaveCreditConfiguration from '@/features/leaveCreditConfiguration/pages/ViewLeaveCreditConfiguration';
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
import Parking from '@/features/parking/pages/Parking';
import RedevelopmentDashboard from '@/features/redevelopmentDashboard/pages/RedevelopmentDashboard';

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

            {/* SETTING -> COMPANY SETUP */}

            <Route path="departmentMaster" element={<DepartmentMaster />} />

            <Route path="designationMaster" element={<DesignationMaster />} />
            <Route path="designationMaster/employeeModuleAccess/:designationMasterId" element={<EmployeeModuleAccess />} />

            <Route path="employeeMaster" element={<EmployeeListStateProvider><EmployeeMaster /></EmployeeListStateProvider>} />
            <Route path="employeeMaster/view" element={<EmployeeListStateProvider><ViewEmployeeMaster /></EmployeeListStateProvider>} />
            <Route path="employeeMaster/add/:employeeId?" element={<EmployeeListStateProvider><AddUpdateEmployeeMaster /></EmployeeListStateProvider>} />
            <Route path="employeeMaster/document" element={<EmployeeListStateProvider><EmployeeDocument /></EmployeeListStateProvider>} />

            <Route path="companyMaster" element={<CompanyListStateProvider><CompanyMaster /></CompanyListStateProvider>} />
            <Route path="companyMaster/view" element={<CompanyListStateProvider><ViewCompantMaster /></CompanyListStateProvider>} />
            <Route path="companyMaster/add/:companyId?" element={<CompanyListStateProvider><AddCompany /></CompanyListStateProvider>} />

            <Route path="tnc" element={<TncMaster />} />

            <Route path="bankListMaster" element={<BankListMaster />} />

            {/* SETTING -> COMPANY SETUP -> PROCUREMENT MASTER */}

            <Route path="materialMaster" element={<MaterialMaster />} />
            <Route path="subMaterialMaster" element={<SubMaterialMaster />} />
            <Route path="uomMaster" element={<UomMaster />} />

            {/* SETTING -> COMPANY SETUP -> PROJECT */}
            <Route path="projectMaster" element={<ProjectMasterListStateProvider><ProjectMaster /></ProjectMasterListStateProvider>} />
            <Route path="projectMaster/view" element={<ProjectMasterListStateProvider><ViewProjectMaster /></ProjectMasterListStateProvider>} />
            <Route path="projectMaster/add/:projectId?" element={<ProjectMasterListStateProvider><AddUpdateProjectMaster /></ProjectMasterListStateProvider>} />
            <Route path="projectMaster/employee" element={<ProjectMasterListStateProvider><Employee /></ProjectMasterListStateProvider>} />
            <Route path="projectMaster/bank" element={<ProjectMasterListStateProvider><Bank /></ProjectMasterListStateProvider>} />
            <Route path="projectMaster/Company" element={<ProjectMasterListStateProvider><Company /></ProjectMasterListStateProvider>} />

            {/* SETTING -> COMPANY SETUP -> VENDOR */}
            <Route path="vendor" element={<VendorListStateProvider><Vendor /></VendorListStateProvider>} />
            <Route path="vendor/view" element={<VendorListStateProvider><ViewVendor /></VendorListStateProvider>} />
            <Route path="vendor/add/:vendorId?" element={<VendorListStateProvider><AddUpdateVendor /></VendorListStateProvider>} />

            {/* SETTING -> COMPANY SETUP -> PAYROLL MASTER */}
            <Route path="branchMaster" element={<BranchMaster />} />

            <Route path="branchAssociationsMaster" element={<BranchAssociationsMaster />} />

            <Route path="assetMaster" element={<AssetMasterListStateProvider><AssetMaster /></AssetMasterListStateProvider>} />
            <Route path="assetMaster/view" element={<AssetMasterListStateProvider><ViewAssetMaster /></AssetMasterListStateProvider>} />
            <Route path="assetMaster/add/:AssetMasterId?" element={<AssetMasterListStateProvider><AddUpdateAssetMaster /></AssetMasterListStateProvider>} />

            <Route path="assetMappingMaster" element={<AssetMappingMasterListStateProvider><AssetMappingMaster /></AssetMappingMasterListStateProvider>} />
            <Route path="assetMappingMaster/view" element={<AssetMappingMasterListStateProvider><ViewAssetMappingMaster /></AssetMappingMasterListStateProvider>} />
            <Route path="assetMappingMaster/add/:AssetMasterMappingId?" element={<AssetMappingMasterListStateProvider><AddUpdateAssetMappingMaster /></AssetMappingMasterListStateProvider>} />

            <Route path="deductionMaster" element={<DeductionMasterListStateProvider><DeductionMaster /></DeductionMasterListStateProvider>} />
            <Route path="deductionMaster/view" element={<DeductionMasterListStateProvider><ViewDeductionMaster /></DeductionMasterListStateProvider>} />
            <Route path="deductionMaster/add/:DeductionMasterId?" element={<DeductionMasterListStateProvider><AddUpdateDeductionMaster /></DeductionMasterListStateProvider>} />

            <Route path="earningMaster" element={<EarningMaster />} />

            <Route path="holidayMaster" element={<HolidayMaster />} />

            <Route path="holidayMappingMaster" element={<HolidayMappingMaster />} />

            <Route path="leaveEncashmentMaster" element={<LeaveEncashmentMaster />} />

            <Route path="leaveTypeMaster" element={<LeaveTypeMaster />} />

            <Route path="shiftMaster" element={<ShiftMasterListStateProvider><ShiftMaster /></ShiftMasterListStateProvider>} />
            <Route path="shiftMaster/view" element={<ShiftMasterListStateProvider><ViewShiftMaster /></ShiftMasterListStateProvider>} />
            <Route path="shiftMaster/add/:ShiftManagementMasterId?" element={<ShiftMasterListStateProvider><AddUpdateShiftMaster /></ShiftMasterListStateProvider>} />

            <Route path="shiftMappingMaster" element={<ShiftMappingMaster />} />

            <Route path="weekOffMaster" element={<WeekOffMasterListStateProvider><WeekOffMasterMaster /></WeekOffMasterListStateProvider>} />

            <Route path="WeekOffMaster/view" element={<WeekOffMasterListStateProvider><ViewWeekOffMaster /></WeekOffMasterListStateProvider>} />
            <Route path="WeekOffMaster/add/:WeekOffMasterId?" element={<WeekOffMasterListStateProvider><AddUpdateWeekOffMaster /></WeekOffMasterListStateProvider>} />
            <Route path="weekOffMappingMaster" element={<WeekOffMappingMaster />} />

            {/* PAYROLL */}

            <Route path="compoff" element={<CompOff />} />
            <Route path="outdoor/add/:outdoorId?" element={<OutDoorListStateProvider><AddUpdateOutDoorPage /></OutDoorListStateProvider>} />
            <Route path="leaveCreditConfiguration" element={<LeaveCreditConfiguration />} />
            <Route path="leaveCreditConfiguration/add/:id?" element={<AddUpdateLeaveCreditConfiguration />} />
            <Route path="leaveCreditConfiguration/view/:id?" element={<ViewLeaveCreditConfiguration />} />
            <Route path="outdoor" element={<OutDoorListStateProvider><OutDoor /></OutDoorListStateProvider>} />
            <Route path="leave" element={<Leave />} />
            <Route path="leave/add/:id?" element={<AddUpdateLeave />} />
            <Route path="leave/view/:id?" element={<ViewLeave />} />
            <Route path="resignation" element={<EmployeeResignation />} />
            <Route path="payrollReport" element={<PayrollReport />} />

            {/* INVENTORY */}
            <Route path="inventory" element={<Inventory></Inventory>} />
            <Route path="inventory/inventorySpecification" element={<InventorySpecification></InventorySpecification>}></Route>
            <Route path="parking" element={<Parking></Parking>} />

            {/* DOCUMENT */}
            <Route path="category" element={<ProjectDocumentCategoryMaster />} />
            <Route path="document" element={<ProjectDocument />} />
            <Route path="approvalCategory" element={<ApprovalDocumentCategoryMaster />} />
            <Route path="approvalDocument" element={<ApprovalDocument />} />
            <Route path="reraCategory" element={<ProjectRERADocumentCategoryMaster />} />
            <Route path="rera" element={<ProjectRERADocument />} />

            {/* PROFILE */}
            <Route path="profile" element={<EmployeeListStateProvider><Profile /></EmployeeListStateProvider>} />

            {/* COMMAN */}
            <Route path="event" element={<Event />} />
            <Route path="attendanceCalendar" element={<AttendanceCalendar />} />

            {/* SALES */}
            <Route path="channelPartner" element={<ChannelPartner />} />
            <Route path="channelPartner/view" element={<ViewChannelPartner />} />
            <Route path="channelPartner/add/:ChannelPartnerId?" element={<AddUpdateChannelPartner />} />

            <Route path="enquiry" element={<EnquiryListStateProvider><Enquiry /></EnquiryListStateProvider>} />
            <Route path="enquiry/view/:EnquiryId?" element={<EnquiryListStateProvider><ViewEnquiry /></EnquiryListStateProvider>} />
            <Route path="enquiry/add/:EnquiryId?" element={<EnquiryListStateProvider><AddUpdateEnquiry /></EnquiryListStateProvider>} />

            {/* REDEVELOPMENT */}

            <Route path="redevelopmentDashboard" element={<RedevelopmentDashboard />} />

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


            {/* OPERATION */}
            <Route path="siteProgress" element={<SiteProgress />} />
            <Route path="siteProgress/SiteProgressSubConstruction" element={<SiteProgressSubConstruction />} />
            <Route path="siteProgress/SiteProgressWingConstruction" element={<SiteProgressWingConstruction />} />
            <Route path="siteProgress/SiteProgressFloorConstruction" element={<SiteProgressFloorConstruction />} />
            <Route path="siteProgress/SiteProgressFlatConstruction" element={<SiteProgressFlatConstruction />} />
            <Route path="siteProgress/SiteProgressConstructionActivity" element={<SiteProgressConstructionActivity />} />
            <Route path="siteProgress/SiteProgressConstructionSubActivity" element={<SiteProgressConstructionSubActivity />} />

          </Route>

          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </Suspense>
    </CountryStateCityDistrictVillage>
  )
}

export default App
