import React, { useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import appLogo from '@/assets/images/appLogo.png'
import { LocalStorageHelper } from '@/core/utils/localStorageHelper'
import { Modal } from '@/ui/components/Modal/Modal'
import { useNavigate } from 'react-router-dom'
import { FieldItem } from '@/ui/components/forms/FieldItem'
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat'
interface HeaderProps {
    isSidebarOpen: boolean
    onToggleSidebar: () => void
    pageTitle?: string
    pageDescription?: string
}

export const Header: React.FC<HeaderProps> = ({
    isSidebarOpen,
    onToggleSidebar,
    pageTitle = 'Dashboard',
    pageDescription
}) => {

    const navigate = useNavigate()

    const [isEmployeeProfileModalOpen, setIsEmployeeProfileModalOpen] = useState(false);

    const handleEmployeeProfileClick = () => {

        setIsEmployeeProfileModalOpen(true);
    }


    const emp = LocalStorageHelper.getStoredEmployeeData?.() ?? null;
    const fullName = emp?.FullName ?? '—';
    const personalMobileNumber = emp?.PersonalMobileNumber ?? '—';
    const emailId = emp?.EmailId ?? '—';
    const officeEmailId = emp?.OfficeEmailId ?? '—';
    const department = emp?.Department ?? '—';
    const designation = emp?.Designation ?? '—';
    const employeeCode = emp?.EmployeeCode ?? '—';
    const branch = emp?.Branch ?? '—';
    const LastLogin = emp?.LastLogin ?? '—';

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            {/* Left side - Menu toggle and title */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 touch-manipulation flex-shrink-0"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-5 w-5 text-gray-600" />
                </button>

                <div className="flex flex-col min-w-0 flex-1">
                    <h1 className="text-base lg:text-lg xl:text-xl font-semibold text-gray-800 truncate">{pageTitle}</h1>
                    {pageDescription && (
                        <p className="text-xs text-gray-600 truncate hidden sm:block">{pageDescription}</p>
                    )}
                </div>
            </div>

            {/* Right side - Project info and actions */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
                {/* Notifications - Hidden on small mobile */}
                <button className="hidden sm:block p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 relative touch-manipulation">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        3
                    </span>
                </button>
                <button
                    onClick={handleEmployeeProfileClick}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 touch-manipulation"
                    aria-label="Select Project"
                >
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <img
                            src={appLogo}
                            alt={LocalStorageHelper.getStoredEmployeeData()?.FullName}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    </div>

                </button>
            </div>

            {/* EMPLOYEE PROFILE MODAL  */}
            <Modal
                isOpen={isEmployeeProfileModalOpen}
                onClose={() => setIsEmployeeProfileModalOpen(false)}
                title="Profile"
                size="small-half"
            >
                <div className="p-4">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img
                                src={appLogo} // appLogo must be imported where used
                                alt={fullName}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = appLogo }}
                            />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-gray-900 truncate">{fullName}</h2>
                            <p className="text-sm text-gray-500 truncate">{department} | {designation}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldItem label="Employee Code" value={employeeCode} />
                        <FieldItem label="Personal Mobile Number" value={personalMobileNumber} />
                        <FieldItem label="Email Id" value={emailId} />
                        <FieldItem label="Office Email Id" value={officeEmailId} />
                        <FieldItem label="Branch" value={branch} />
                        <FieldItem
                            label="Last Login"
                            value={formatDate_dd_MonthName_yy_hh_mm(LastLogin)}
                        />

                    </div>

                    <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-50">
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex-1 mr-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                        >
                            View Profile
                        </button>
                        <button
                            onClick={() => console.log('Set MPIN clicked')}
                            className="flex-1 ml-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                        >
                            Set MPIN
                        </button>
                    </div>
                </div>
            </Modal>
        </header>
    )
}
