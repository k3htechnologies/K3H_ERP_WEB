import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../ui/layouts/Layout'

// Lazy load routes for code splitting and better performance
const Login = lazy(() => import('../features/authentication/pages/signIn'))
const Dashboard = lazy(() => import('../features/dashboard/pages/Dashboard'))
const DepartmentMaster = lazy(() => import('../features/departmentMaster/pages/DepartmentMaster'))
const DesignationMaster = lazy(() => import('../features/designationMaster/pages/DesignationMaster'))
const EmployeeMaster = lazy(() => import('../features/employeeMaster/pages/EmployeeMaster'))

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
  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {

  // Check for existing auth token on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      // Token validation could be added here if needed
    }
  }, [])

  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
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
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
