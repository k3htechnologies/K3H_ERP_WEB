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
import { DepartmentMaster } from '@/features/departmentMaster/pages/DepartmentMaster';
import { DesignationMaster } from '@/features/designationMaster/pages/DesignationMaster';
import { EmployeeMaster } from '@/features/employeeMaster/pages/EmployeeMaster';
import { BranchMaster } from '@/features/branchMaster/pages/BranchMaster';
import BranchAssociationsMaster from '@/features/branchAssociationsMaster/pages/BranchAssociationsMaster';
import AssetMaster from '@/features/assetMaster/pages/AssetMaster';
import AssetMappingMaster from '@/features/assetMappingMaster/pages/AssetMappingMaster';
import DeductionMaster from '@/features/deductionMaster/pages/DeductionMaster';
import EarningMaster from '@/features/earningMaster/pages/EarningMaster';
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
import AddUpdateVendor from '@/features/vendor/pages/AddUpdateVendor';
import ViewAssetMappingMaster from '@/features/assetMappingMaster/pages/ViewAssetMappingMaster';
import ViewShiftMaster from '@/features/shiftMaster/pages/ViewShiftMaster';
import ViewDeductionMaster from '@/features/deductionMaster/pages/ViewDeductionMaster';
import ViewWeekOffMaster from '@/features/weekOffMaster/pages/ViewWeekOffPage';
import SubMaterialMaster from '@/features/subMaterialMaster/pages/SubMaterialMaster';
import { UomMaster } from '@/features/uomMaster/pages/UomMaster';
import ProjectDocumentCategoryMaster from '@/features/projectDocumentCategory/pages/ProjectDocumentCategoryMaster';
import ProjectDocument from '@/features/projectDocument/pages/ProjectDocument';
import ProjectRERADocumentCategoryMaster from '@/features/projectRERADocumentCategory/pages/ProjectRERADocumentCategoryMaster';
import ProjectRERADocument from '@/features/projectRERADocument/pages/ProjectRERADocument';
import ViewCompantMaster from '@/features/companyMaster/pages/ViewCompanyMaster';
import Inventory from '@/features/inventory/pages/Inventory';
import { AddUpdateOutDoorPage } from '@/features/outdoor/pages/AddUpdateOutDoor';
import { OutDoor } from '@/features/outdoor/pages/OutDoor';
import { ViewVendor } from '@/features/vendor/pages/ViewVendor';
import { CompOff } from '@/features/compOff/pages/compOff';
import Leave from '@/features/leave/pages/Leave';
import LeaveCreditDebit from '@/features/leaveCreditDebit/pages/LeaveCreditDebit';
import AddUpdateLeaveCreditDebit from '@/features/leaveCreditDebit/pages/AddUpdateLeaveCreditDebit';

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
          <Route path="profile" element={<Profile />} />
          <Route path="designationMaster/employeeModuleAccess/:designationMasterId" element={<EmployeeModuleAccess />} />
          <Route path="companyMaster/addCompany" element={<AddCompany />} />
          <Route path="compoff" element={<CompOff />} />
          <Route path="leave" element={<Leave />} />
          <Route path="leaveCreditDebit" element={<LeaveCreditDebit />} />
          <Route path="AddUpdateleaveCreditDebit" element={<AddUpdateLeaveCreditDebit />} />


          {/* Protected Routes with Layout */}
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
            <Route path="departmentMaster" element={<DepartmentMaster />} />
            <Route path="/vendor/add/:vendorId?" element={<AddUpdateVendor />} />
            <Route path="designationMaster" element={<DesignationMaster />} />
            <Route path="designationMaster/employeeModuleAccess/:designationMasterId" element={<EmployeeModuleAccess />} />
            <Route path="employeeMaster" element={<EmployeeMaster />} />
            <Route path="employeeMaster/view" element={<ViewEmployeeMaster />} />
            <Route path="employeeMaster/add/:employeeId??" element={<AddUpdateEmployeeMaster />} />
            <Route path="/outdoor/add/:outdoorId?" element={<AddUpdateOutDoorPage />} />
            <Route path="outdoor" element={<OutDoor />} />
            <Route path="compoff" element={<CompOff />} />
            <Route path="companyMaster" element={<CompanyMaster />} />
            <Route path="companyMaster/view" element={<ViewCompantMaster />} />
            <Route path="companyMaster/add/:companyId?" element={<AddCompany />} />
            <Route path="tnc" element={<TncMaster />} />
            <Route path="bankListMaster" element={<BankListMaster />} />
            <Route path="branchMaster" element={<BranchMaster />} />
            <Route path="branchAssociationsMaster" element={<BranchAssociationsMaster />} />
            <Route path="assetMaster" element={<AssetMaster />} />
            <Route path="assetMaster/view" element={<ViewAssetMaster />} />
            <Route path="assetMaster/add/:AssetMasterId??" element={<AddUpdateAssetMaster />} />
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
            <Route path="WeekOffMaster/add/:WeekOffMasterId??" element={<AddUpdateWeekOffMaster />} />
            <Route path="weekOffMappingMaster" element={<WeekOffMappingMaster />} />
            <Route path="vendor" element={<Vendor />} />
            <Route path="vendor/view" element={<ViewVendor />} />
            <Route path="projectMaster" element={<ProjectMaster />} />
            <Route path="projectMaster/view" element={<ViewProjectMaster />} />
            <Route path="/projectMaster/add/:projectId??" element={<AddUpdateProjectMaster />} />
            <Route path="weekOffMappingMaster" element={<WeekOffMappingMaster />} />
            <Route path="materialMaster" element={<MaterialMaster />} />
            <Route path="inventory" element={<Inventory></Inventory>} />
            <Route path="subMaterialMaster" element={<SubMaterialMaster />} />
            <Route path="uomMaster" element={<UomMaster />} />
            <Route path="category" element={<ProjectDocumentCategoryMaster />} />
            <Route path="document" element={<ProjectDocument />} />
            <Route path="reraCategory" element={<ProjectRERADocumentCategoryMaster />} />
            <Route path="rera" element={<ProjectRERADocument />} />
          </Route>

          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </Suspense>
    </CountryStateCityDistrictVillage>
  )
}

export default App
