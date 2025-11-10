import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import * as E from 'fp-ts/Either';
import { useNetworkStatus } from "@/core/hooks/useNetworkStatus";
import { menuService } from '@/features/menu/services/MenuService'
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import type { PullMenuRequest } from '@/features/menu/models/MenuModel';
import type { ModuleData, SubModuleData, SubSubModuleData } from '@/features/menu/models/MenuModel';
import { getPageInfo } from '@/core/constants/pageInfo';

export const Layout: React.FC = () => {
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [menuData, setMenuData] = useState<ModuleData[]>([])
    const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null)
    const [selectedSubModule, setSelectedSubModule] = useState<SubModuleData | null>(null)
    const [selectedSubSubModule, setSelectedSubSubModule] = useState<SubSubModuleData | null>(null)
    const pageInfo = getPageInfo(location.pathname);

    // THIS WILL AUTOMATICALLY HANDLE OFFLINE / ONLINE REDIRECTS
    useNetworkStatus();

    const hasFetchedMenu = useRef(false);

    useEffect(() => {

        if (hasFetchedMenu.current) return

        hasFetchedMenu.current = true;

        const loadMenuData = async () => {
            try {
                const request: PullMenuRequest = {
                    EmployeeId: LocalStorageHelper.getStoredEmployeeData()?.EmployeeId ?? 0,
                };
                const response = await menuService.apiCallPullMenu(request)

                if (E.isRight(response)) {
                    const menu = response.right.Data;
                    if (menu) {
                        setMenuData(response.right.Data);
                    } else {
                        setMenuData([]);
                    }
                }
            } catch (err: any) {
                throw err;
            } finally {

            }
        }

        loadMenuData();
    }, [])

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false)
    }

    const handleModuleSelect = (module: ModuleData) => {
        setSelectedModule(module)
        setSelectedSubModule(null)
        setSelectedSubSubModule(null)
    }

    const handleSubModuleSelect = (subModule: SubModuleData) => {
        setSelectedSubModule(subModule)
        setSelectedModule(null)
        setSelectedSubSubModule(null)
    }

    const handleSubSubModuleSelect = (subSubModule: SubSubModuleData) => {
        setSelectedSubSubModule(subSubModule)
        setSelectedModule(null)
        setSelectedSubModule(null)
    }

    const handleLogout = () => {
        LocalStorageHelper.clearLocalStorageData();
        window.location.href = '/sign-in'
    }

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                modules={menuData}
                onModuleSelect={handleModuleSelect}
                onSubModuleSelect={handleSubModuleSelect}
                onSubSubModuleSelect={handleSubSubModuleSelect}
                onClose={handleCloseSidebar}
                onLogout={handleLogout}
                selectedModule={selectedModule || undefined}
                selectedSubModule={selectedSubModule || undefined}
                selectedSubSubModule={selectedSubSubModule || undefined}
            />

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <Header
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={handleToggleSidebar}
                    pageTitle={pageInfo.title}
                    pageDescription={pageInfo.description}
                />

                {/* Main content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-3 bg-gray-50">
                    {/* Selected module info */}
                    {selectedModule && (
                        <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-3 lg:space-x-4">
                                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm lg:text-lg font-bold">
                                        {selectedModule.ModuleName.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base lg:text-lg font-semibold text-gray-800 truncate">
                                        {selectedModule.ModuleName}
                                    </h2>
                                    <p className="text-xs lg:text-sm text-gray-600">
                                        Module ID: {selectedModule.ModulesMasterId}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selected sub-module info */}
                    {selectedSubModule && (
                        <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-3 lg:space-x-4">
                                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm lg:text-lg font-bold">
                                        {selectedSubModule.SubModuleName.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base lg:text-lg font-semibold text-gray-800 truncate">
                                        {selectedSubModule.SubModuleName}
                                    </h2>
                                    <p className="text-xs lg:text-sm text-gray-600 truncate">
                                        Path: {selectedSubModule.Path} • ID: {selectedSubModule.SubModulesMasterId}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selected sub-sub-module info */}
                    {selectedSubSubModule && (
                        <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-3 lg:space-x-4">
                                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm lg:text-lg font-bold">
                                        {selectedSubSubModule.SubSubModuleName.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base lg:text-lg font-semibold text-gray-800 truncate">
                                        {selectedSubSubModule.SubSubModuleName}
                                    </h2>
                                    <p className="text-xs lg:text-sm text-gray-600 truncate">
                                        Path: {selectedSubSubModule.Path} • ID: {selectedSubSubModule.SubSubModulesMasterId}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Page content */}
                    <div className="min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
