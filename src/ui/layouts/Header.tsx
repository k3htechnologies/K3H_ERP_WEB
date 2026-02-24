import React, { useEffect, useState } from 'react'
import { Menu, Bell, User, Info } from 'lucide-react'
import { LocalStorageHelper } from '@/core/utils/localStorageHelper'
import { Modal } from '@/ui/components/Modal/Modal'
import { useLocation, useNavigate } from 'react-router-dom'
import { FieldItem } from '@/ui/components/forms/FieldItem'
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat'
import usePagination from '@/core/hooks/usePagination'
import { runApiWithLoader } from '@/core/utils'
import type { FilterWithPaginationNotificationRequest, NotificationData } from '@/features/technical/models/TechnicalModel'
import { technicalService } from '@/features/technical/services/TechnicalService'
import * as E from 'fp-ts/Either';
import useToast from '@/core/hooks/useToast'
import { COLORS } from '@/core/constants'
import { SinglePageSelection } from '../components/DropDown/SinglePageSelection'
import { useProject } from '@/features/projectMaster/context/ProjectContext'
import { shouldShowProjectSelection } from '@/core/utils/projectSelectionVisibility'
import { isSubSubRoute } from '@/core/utils/fileValidation'
import { projectMasterService } from '@/features/projectMaster/services/ProjectMasterService'
import type { FilterWithPaginationProjectMasterRequest, ProjectMasterData } from '@/features/projectMaster/models/ProjectMasterModel'
import NoDataView from '../components/NoDataView/NoDataView'
import TableActionToolbar from '../components/TableAction/TableActionToolbar'
import type { EmployeeMasterData, SetEmployeeMPINRequest } from '@/features/employeeMaster/models/EmployeeMasterModel'
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback'
import Tabs from '../components/Tab/Tab'
import { Input } from '../components/forms'
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService'

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

    //PROJECT SELECTION VISIBILITY 

    const location = useLocation();
    const showProjectSelection = shouldShowProjectSelection(location.pathname);
    const readOnlyProject = isSubSubRoute(location.pathname);
    // EMPLOYEE PROFILE MODAL
    const [isEmployeeProfileModalOpen, setIsEmployeeProfileModalOpen] = useState(false);

    // PROJECT MODAL
    const [isProjectDetailsModalOpen, setIsProjectDetailsModalOpen] = useState(false);
    const [projectMasterList, setProjectMasterList] = useState<ProjectMasterData[]>([]);

    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);
    // SINGLE SEARCH TEXT BOX
    const [searchTermForEmployee, setSearchTermForEmployeeName] = useState('')
    const debouncedSearchForEmployeeName = useDebouncedCallback((value: string) => {
        searchEmployeeName(value)
    }, 350)

    //#region TAB ACTIVITY
    const TabList = [
        { id: "Project Overview", label: 'Overview' },
        { id: "Employee", label: 'Employee' },
    ];

    const [activeTab, setActiveTab] = useState<string>(TabList[0].id);

    const [MPIN, setMPIN] = useState('')
    const [isMPINModalOpen, setIsMPINModalOpen] = useState(false);
    //#endregion

    // NOTIFICATION
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notificationList, setNotificationList] = useState<NotificationData[]>([]);
    const [isFetchingMoreNotification, setIsFetchingMoreNotification] = useState(false);

    const [, setIsLoading] = useState(false);
    const [, setLoadingMessage] = useState('');

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

    useEffect(() => {
        fetchNotificationList()
    }, [])


    //#region INIT
    useEffect(() => {
        if (activeTab === 'Project Overview') {
            loadProjectMaster();
        }

        else if (activeTab === 'Employee') {

            loadProjectMasterWithEmployee();
        }

    }, [activeTab]);

    //#endregion
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 

    const fetchNotificationList = async (page: number = pagination.currentPage) => {
        return loadNotifications(page)
    }

    const loadNotifications = async (page: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationNotificationRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId)
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

    //#region DATA LOAD PROJECT WITH EMPLOYEE

    const loadProjectMaster = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationProjectMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsProjectAccess: false,
                    ProjectId: Number(projectId)
                }

                const response = await projectMasterService.apiCallPullProjectMaster(params);

                if (E.isRight(response)) {

                    setProjectMasterList(response.right.Data);


                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Employee'
        );
    };

    const loadProjectMasterWithEmployee = async (searchText = "") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithEmployee(Number(projectId), searchText);

                if (E.isRight(response)) {

                    setEmployeeMasterList(response.right.Data);


                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Employee'
        );
    };

    //#region SERACH EMPLOYEE NAME 
    const searchEmployeeName = async (searchValue: string) => {

        setSearchTermForEmployeeName(searchValue);
        await loadProjectMasterWithEmployee(searchValue);

    }
    //#endregion

    //#region CLEAR SERACH DEPARTMENT 
    const clearsearchForEmployeeName = async () => {
        setSearchTermForEmployeeName('');
        debouncedSearchForEmployeeName.cancel?.();
        await loadProjectMasterWithEmployee('');
    }

    //#endregion
    //#endregion

    //#region VERIFY OTP
    const handleSubmitMPIN = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                if (MPIN.length !== 4) {

                    addToast({ type: 'error', title: 'Please enter a valid 4-digit MPIN' })
                    return
                }

                const params: SetEmployeeMPINRequest = {
                    EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId ?? 0),
                    UniqueKey: LocalStorageHelper.getStoredEmployeeData()?.UniqueKey ?? "",
                    MPIN: MPIN
                }

                const response = await employeeMasterService.apiCallSetEmployeeMPIN(params)

                if (E.isRight(response)) {

                    addToast({
                        type: 'success', title: response.right.SuccessMessage[0]
                    });
                    setIsMPINModalOpen(false);
                    setMPIN('');
                } else {

                    addToast({
                        type: 'error', title: response.left.message
                    });

                }

            },
            undefined,
            (error: any) => {

                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Set MPIN'
        )
    }
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
                {showProjectSelection && (
                    <div className="hidden sm:block w-100">
                        <SinglePageSelection
                            required={false}
                            size="md"
                            isShowClearSelection={false}
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
                            disabled={readOnlyProject}
                            leftIcon={<Info size={18} color="#135BEC" />}
                            leftIconClick={() => {

                                if (!projectId || projectId <= 0) return;

                                loadProjectMaster();
                                setIsProjectDetailsModalOpen(true);
                            }}
                        />
                    </div>
                )}
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
                            <p className="text-sm text-gray-500">{department} | {designation}</p>
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
                            onClick={() => {
                                setIsEmployeeProfileModalOpen(false);
                                setIsMPINModalOpen(true);
                                setMPIN('');
                            }}
                            type="button"
                            className="flex-1 ml-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                        >
                            Set MPIN
                        </button>
                    </div>
                </div>
            </Modal>

            {/* PROJECT DETAILS MODAL  */}
            <Modal
                isOpen={isProjectDetailsModalOpen}
                onClose={() => setIsProjectDetailsModalOpen(false)}
                title={`Project Details : ${projectMasterList[0]?.ProjectName ?? '-'}`}
                size="small50"
            >
                <Tabs
                    tabs={TabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);

                    }}
                />
                {activeTab === 'Project Overview' && (

                    <div className="lg:col-span-2 space-y-6">

                        {/* ================= BASIC PROJECT DETAILS ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Basic Project Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">

                                <FieldItem label="Redevelopment" value={projectMasterList[0]?.IsRedevelopment === true ? 'YES' : 'NO'} />
                                <FieldItem label="Project Name" value={projectMasterList[0]?.ProjectName ?? '-'} />
                                <FieldItem label="Business Category" value={projectMasterList[0]?.BussinessCategory ?? '-'} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pt-5 pb-4 border-b border-[#135bec2e]">
                                <FieldItem label="CTS Number" value={projectMasterList[0]?.CTSNumber ?? '-'} />
                            </div>

                            <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-2">
                                Location Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pb-4 border-b border-[#135bec2e]">

                                <FieldItem label="Project Location" value={projectMasterList[0]?.ProjectLocation ?? '-'} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1 pt-4  pb-4  border-b border-[#135bec2e]">
                                <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                    Google Location
                                </div>
                                {projectMasterList[0]?.GoogleLocation !== "" ?
                                    <span className="text-blue-600 underline cursor-pointer  break-all whitespace-normal"
                                        onClick={() => window.open(projectMasterList[0]?.GoogleLocation, "_blank")}>
                                        {projectMasterList[0]?.GoogleLocation}
                                    </span> : "-"}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                                <FieldItem label="Country" value={projectMasterList[0]?.CountryName ?? '-'} />
                                <FieldItem label="State" value={projectMasterList[0]?.StateName ?? '-'} />
                                <FieldItem label="District" value={projectMasterList[0]?.DistrictName ?? '-'} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 pt-4 border-b border-[#135bec2e]">

                                <FieldItem label="City" value={projectMasterList[0]?.CityName ?? '-'} />
                                <FieldItem label="PIN Code" value={projectMasterList[0]?.ZipCode ?? '-'} />
                            </div>

                            <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-5">
                                Scheme & Scope Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-[#135bec2e]">

                                <FieldItem label="Project Scope" value={projectMasterList[0]?.ProjectScope ?? '-'} />
                                <FieldItem label="Project Scheme" value={projectMasterList[0]?.ProjectScheme ?? '-'} />
                                <FieldItem label="Project Sub Scope" value={projectMasterList[0]?.ProjectSubScheme ?? '-'} />
                            </div>

                            <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-5">
                                Project Documentation
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-[#135bec2e]">

                                <FieldItem label="RERA Number" value={projectMasterList[0]?.RERANumber ?? '-'} />

                                <FieldItem
                                    label="RERA Certificate Date"
                                    value={
                                        projectMasterList[0]?.RERACertificateDate
                                            ? formatDate_dd_MonthName_yy(projectMasterList[0]?.RERACertificateDate)
                                            : '-'
                                    }
                                />
                                <FieldItem
                                    label="RERA Completion Date"
                                    value={
                                        projectMasterList[0]?.RERAComplitionDate
                                            ? formatDate_dd_MonthName_yy(projectMasterList[0]?.RERAComplitionDate)
                                            : '-'
                                    }
                                />
                            </div>


                            <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-5 ">
                                Project Timeline
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-[#135bec2e]">
                                <FieldItem
                                    label="Survey Date"
                                    value={
                                        projectMasterList[0]?.SurveyDate
                                            ? formatDate_dd_MonthName_yy(projectMasterList[0]?.SurveyDate)
                                            : '-'
                                    }
                                />
                                <FieldItem
                                    label="Expected Start Date"
                                    value={
                                        projectMasterList[0]?.ExpectedStartDate
                                            ? formatDate_dd_MonthName_yy(projectMasterList[0]?.ExpectedStartDate)
                                            : '-'
                                    }
                                />
                                <FieldItem
                                    label="Execution Start Date"
                                    value={
                                        projectMasterList[0]?.ExecutionStartDate
                                            ? formatDate_dd_MonthName_yy(projectMasterList[0]?.ExecutionStartDate)
                                            : '-'
                                    }
                                />

                            </div>


                            <h4 className="text-lg font-semibold text-gray-900 mb-4 pt-5">
                                Contact Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FieldItem
                                    label="Site Contact Name"
                                    value={projectMasterList[0]?.SiteContactName ?? '-'}
                                />
                                <FieldItem
                                    label="Site Contact Mobile Number"
                                    value={projectMasterList[0]?.SiteContactMobileNumber ?? '-'}
                                />

                                <FieldItem
                                    label="Project Status"
                                    value={projectMasterList[0]?.ProjectStatus ?? '-'}
                                />
                            </div>
                        </section>

                    </div>

                )}
                {activeTab === 'Employee' && (
                    <>
                        {/* ================= RIGHT SIDE (1/3 WIDTH) ================= */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* ================= PROJECT IMAGE ================= */}
                            <section className="bg-white rounded-xl ">
                                <TableActionToolbar
                                    isShowSearchBar
                                    searchTerm={searchTermForEmployee}
                                    searchPlaceholder="Search By Employee Name"
                                    onSearchChange={(v) => {
                                        setSearchTermForEmployeeName(v)
                                        debouncedSearchForEmployeeName(v)
                                    }}
                                    onClearSearch={clearsearchForEmployeeName}
                                    isShowFilterButton={false}
                                    exportLoading={false}
                                />

                                {employeeMasterList?.length ? (
                                    employeeMasterList.map(emp => {

                                        const fullName = (emp?.FullName ?? '').trim();

                                        const initials = fullName
                                            ? fullName.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
                                            : 'NA';

                                        return (
                                            <section
                                                key={emp.EmployeeCode}
                                                className="bg-white p-2 border-b border-[#3333334f] mb-2"
                                            >
                                                <div className="flex items-start gap-4">

                                                    {/* Avatar */}
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 
                                                                    flex items-center justify-center text-xs font-semibold 
                                                                    border border-blue-300 shadow-sm">
                                                        {initials}
                                                    </div>

                                                    {/* Right side */}
                                                    <div className="flex flex-col gap-1 w-full">

                                                        {/* NAME + MOBILE SAME LINE */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-md font-medium text-gray-900 leading-tight">
                                                                {emp.FullName || '-'}
                                                            </h4>

                                                            <span className="text-sm text-gray-500">
                                                                ({emp.PersonalMobileNumber || '-'})
                                                            </span>
                                                            <span>{emp.Department || '-'}</span>

                                                            <span className="text-gray-400"> | </span>

                                                            <span>{emp.Designation || '-'}</span>

                                                        </div>



                                                    </div>
                                                </div>
                                            </section>
                                        )
                                    })
                                ) : (
                                    <p className="text-center text-gray-500 py-6">
                                        <NoDataView />
                                    </p>
                                )}



                            </section>

                        </div>
                    </>
                )}
            </Modal>

            <Modal
                isOpen={isMPINModalOpen}
                onClose={() => setIsMPINModalOpen(false)}
                title="Set MPIN"
                saveText="Set"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitMPIN();
                }}
                size="md"
                resetText=""

            >
                <div className="space-y-6">

                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            For your security, please enter your 4-digit MPIN
                        </p>

                        <Input
                            type="text"
                            placeholder="Enter MPIN"
                            value={MPIN}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            data-testid="otp-input"
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                                setMPIN(value)
                            }}
                        />
                    </div>

                </div>
            </Modal>
        </header >

    )
}
