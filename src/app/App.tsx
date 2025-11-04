import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import  Login from '../features/authentication/pages/signIn';
import DepartmentMaster from '../features/departmentMaster/pages/DepartmentMaster'
import  DesignationMaster from '../features/designationMaster/pages/DesignationMaster'
import  EmployeeMaster  from '../features/employeeMaster/pages/EmployeeMaster'
import  Dashboard  from '../features/dashboard/pages/dashboard'
import { Layout } from '../ui/layouts/Layout'

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
    if (token) {
      console.log('User is authenticated');
    }
  }, [])

  
  return (
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
  )
}

export default App
