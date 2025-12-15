import React, { useEffect, useRef, useState } from 'react'
import { Menu, Bell, User } from 'lucide-react'
import { LocalStorageHelper } from '@/core/utils/localStorageHelper'
import { Modal } from '@/ui/components/Modal/Modal'
import { useNavigate } from 'react-router-dom'
import { FieldItem } from '@/ui/components/forms/FieldItem'
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat'
import usePagination from '@/core/hooks/usePagination'
import { runApiWithLoader } from '@/core/utils'
import type { FilterWithPaginationNotificationRequest, NotificationData } from '@/features/technical/models/TechnicalModel'
import { technicalService } from '@/features/technical/services/TechnicalService'
import * as E from 'fp-ts/Either';
import useToast from '@/core/hooks/useToast'
import { COLORS } from '@/core/constants'
import { SinglePageSelection } from '../components/DropDown/SinglePageSelection'
import { useProject } from '@/features/projectMaster/context/ProjectContext'

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
    //#region STATE MANAGEMENT
    const navigate = useNavigate()

    // EMPLOYEE PROFILE MODAL
    const [isEmployeeProfileModalOpen, setIsEmployeeProfileModalOpen] = useState(false);

    // NOTIFICATION
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notificationList, setNotificationList] = useState<NotificationData[]>([]);
    const [isFetchingMoreNotification, setIsFetchingMoreNotification] = useState(false);

    const [, setIsLoading] = useState(false);
    const [, setIsLoadingMessage] = useState('');

    // TOAST
    const { addToast } = useToast()

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);


    //#region HEADER BAR EMPLOYEE PROFILE ICON CLICK
    const handleEmployeeProfileClick = () => {

        setIsEmployeeProfileModalOpen(true);
    }

    //#region PROFILE MODAL VIEW PROFILE CLICK
    const handleClickRedirectProfile = () => {
        setIsEmployeeProfileModalOpen(false);
        navigate('/profile');
    }

    //#region HEADER BAR EMPLOYEE PROFILE ICON CLICK
    const handleNotificationModal = () => {
        setIsNotificationOpen(true);
        loadNotifications(1);
    }

    //#region INITIALIZATION

    const hasFetchedInitialNotifications = useRef(false)

    useEffect(() => {

        if (hasFetchedInitialNotifications.current) return

        hasFetchedInitialNotifications.current = true;

        fetchNotificationList()
    }, [])

    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 

    const fetchNotificationList = async (page: number = pagination.currentPage) => {
        return loadNotifications(page)
    }

    const loadNotifications = async (page: number) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationNotificationRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: 3
                }

                const response = await technicalService.apiCallPullNotification(params);

                if (E.isRight(response)) {

                    setNotificationList(prev =>
                        page === 1
                            ? response.right.Data
                            : [...prev, ...(Array.isArray(response.right.Data) ? response.right.Data : [])]
                    );

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {

                    addToast({ type: 'error', title: response.left.message });

                }

                return response
            },
            undefined,
            (error: any) => {

                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Loading Notification Data'
        )
    }
    //#endregion

    //#region NOTIFICATION SCROLL HANDLER
    const handleNotificationScroll = (e: React.UIEvent<HTMLDivElement>) => {

        const el = e.currentTarget;
        const threshold = 60; // how close to bottom before loading next page

        if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {

            if (pagination.currentPage < (pagination.totalPages || 0) && !isFetchingMoreNotification) {
                const nextPage = pagination.currentPage + 1;
                setIsFetchingMoreNotification(true);
                fetchNotificationList(nextPage).finally(() => setIsFetchingMoreNotification(false));
            }
        }
    };
    //#endregion

    //#region LOCAL STORAGE EMPLOYEE DETAILS
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

    //#endregion

    //#region Project Selection
    const { projectId, setProjectId } = useProject()
    //#endregion
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            {/* Left side - Menu toggle and title */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md  transition-colors duration-200 touch-manipulation flex-shrink-0"
                    aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    style={{ background: COLORS.menu_toggleColor, cursor: "pointer" }}
                >
                    <Menu style={{ color: COLORS.primary1 }} className="h-5 w-5" />
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
                <div className="hidden sm:block w-100">
                    <SinglePageSelection
                        required={false}
                        size="md"
                        options={(emp?.ProjectData ?? []).map(opt => ({
                            label: opt.ProjectName,
                            value: opt.ProjectId
                        }))}
                        value={projectId ?? undefined}
                        onChange={(value: string | number) => {
                            setProjectId(Number(value))
                        }}
                        placeholder="Select Project"
                        selectedTextColor="#135BEC"
                    />


                </div>
                {/* Notifications - Hidden on small mobile */}
                <button
                    onClick={handleNotificationModal}

                    className="hidden sm:block p-1 bg-blue-50 rounded-md hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200 relative touch-manipulation">
                    <Bell className="h-5 w-6 text-blue-800" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        4
                    </span>
                </button>
                <button
                    onClick={handleEmployeeProfileClick}
                    className="flex items-center bg-blue-50 space-x-2 p-1 rounded-md hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200 touch-manipulation">
                    <User className="h-5 w-6 text-blue-800" />

                </button>
            </div>

            {/* NOTIFICATION MODAL  */}

            <Modal
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                title="Notifications"
                size="half-screen"
            >
                <div className="flex flex-1 flex-col min-h-0 relative">

                    <div
                        className="flex-1 min-h-0 overflow-auto divide-y divide-gray-200"
                        onScroll={handleNotificationScroll}
                    >
                        {notificationList.length > 0 ? (
                            notificationList.map((n, i) => (
                                <div
                                    key={n.NotificationId ?? i}
                                    className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                    onClick={() => { if (n.Path) navigate(n.Path); }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {!n.IsRead && <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                                            <p className="text-sm font-medium text-gray-900 break-words">{n.Title}</p>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 mt-1">
                                            <p className="text-xs text-gray-500 flex-1 whitespace-normal break-words">
                                                {n.Description}
                                            </p>
                                            <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                                                {formatDate_dd_MonthName_yy_hh_mm(n.CreatedDate)}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-center text-gray-500 text-sm">No notifications found</div>
                        )}

                        {isFetchingMoreNotification && (
                            <div className="py-3 text-center text-gray-400 text-sm">Loading more...</div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* EMPLOYEE PROFILE MODAL  */}
            <Modal
                isOpen={isEmployeeProfileModalOpen}
                onClose={() => setIsEmployeeProfileModalOpen(false)}
                title="Profile"
                size="small25"
            >
                <div className="p-4">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">

                            <div className="w-14 h-14 
                                                                        rounded-full 
                                                                        bg-gradient-to-br from-gray-200 to-gray-300 
                                                                        flex items-center justify-center 
                                                                        text-gray-700 font-bold text-lg
                                                                        border border-gray-300">
                                {fullName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
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
                            onClick={handleClickRedirectProfile}
                            type="button"
                            className="flex-1 mr-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                        >
                            View Profile
                        </button>
                        <button
                            onClick={() => console.log('Set MPIN clicked')}
                            type="button"
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
