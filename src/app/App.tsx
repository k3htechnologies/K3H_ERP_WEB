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
import EmployeeMaster from '@/features/employeeMaster/pages/EmployeeMaster';

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
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/error" element={<ErrorFallbackPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/employeeModuleAccess" element={<EmployeeModuleAccess />} />


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
          <Route path="designationMaster" element={<DesignationMaster />} />
          <Route path="employeeMaster" element={<EmployeeMaster />} />

        </Route>

        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
