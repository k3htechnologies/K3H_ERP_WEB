import React, { useState, useEffect } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { useNavigate } from "react-router-dom";

interface SubSubModule {
    SubSubModulesMasterId: number;
    SubSubModuleName: string;
    Icon?: string;
    Path: string;
    IsDisplay?: boolean;
    IsAction?: boolean;
    IsView?: boolean;
    IsExport?: boolean;
}

interface SubModule {
    SubModulesMasterId: number;
    SubModuleName: string;
    Icon?: string;
    Path: string;
    IsAction?: boolean;
    IsView?: boolean;
    IsExport?: boolean;
    SubSubModuleData?: SubSubModule[];
}

interface ModuleItem {
    ModulesMasterId: number;
    ModuleName: string;
    Icon?: string;
    Path: string;
    SubModuleData?: SubModule[];
}

export const ErpRoadmap: React.FC = () => {
    const [modules, setModules] = useState<ModuleItem[]>([]);
    const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
    const [selectedSubModule, setSelectedSubModule] = useState<SubModule | null>(null);
    const [selectedSubSubModule, setSelectedSubSubModule] = useState<SubSubModule | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    const handleNavigation = (path?: string) => {
        if (!path) return;
        navigate(path);
    };

    useEffect(() => {
        const rawData = LocalStorageHelper.getMenuData();
        if (rawData) {
            const dataArray: ModuleItem[] = Array.isArray(rawData) ? rawData : [rawData];
            setModules(dataArray);
        }
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (value) {
            setSelectedModule(null);
            setSelectedSubModule(null);
            setSelectedSubSubModule(null);
        }
    };

    const handleModuleClick = (mod: ModuleItem) => {
        setSelectedModule(mod);
        setSelectedSubModule(null);
        setSelectedSubSubModule(null);
    };

    const handleSubModuleClick = (sub: SubModule) => {
        setSelectedSubModule(sub);
        setSelectedSubSubModule(null);
    };

    const handleSubSubModuleClick = (subSub: SubSubModule) => {
        setSelectedSubSubModule(subSub);
    };

    const filteredModules = modules.filter((mod) => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) return true;

        const moduleMatch = mod.ModuleName?.toLowerCase().includes(search);

        const subModuleMatch = mod.SubModuleData?.some((sub) =>
            sub.SubModuleName?.toLowerCase().includes(search)
        );

        const subSubModuleMatch = mod.SubModuleData?.some((sub) =>
            sub.SubSubModuleData?.some((subSub) =>
                subSub.SubSubModuleName?.toLowerCase().includes(search)
            )
        );

        return moduleMatch || subModuleMatch || subSubModuleMatch;
    });

    const searchLower = searchTerm.toLowerCase().trim();

    let displaySections: SubModule[] = [];
    let displaySubSections: SubSubModule[] = [];

    if (selectedModule) {
        displaySections = (selectedModule.SubModuleData || []).filter((sub) => {
            if (!searchLower) return true;
            if (selectedModule.ModuleName?.toLowerCase().includes(searchLower)) return true;
            const subMatch = sub.SubModuleName?.toLowerCase().includes(searchLower);
            const ssMatch = sub.SubSubModuleData?.some((ss) =>
                ss.SubSubModuleName?.toLowerCase().includes(searchLower)
            );
            return subMatch || ssMatch;
        });
    } else if (searchLower) {
        displaySections = modules.flatMap((mod) => {
            const modMatch = mod.ModuleName?.toLowerCase().includes(searchLower);
            return (mod.SubModuleData || []).filter((sub) => {
                if (modMatch) return true;
                const subMatch = sub.SubModuleName?.toLowerCase().includes(searchLower);
                const ssMatch = sub.SubSubModuleData?.some((ss) =>
                    ss.SubSubModuleName?.toLowerCase().includes(searchLower)
                );
                return subMatch || ssMatch;
            });
        });
    }

    if (selectedSubModule) {
        displaySubSections = (selectedSubModule.SubSubModuleData || []).filter((subSub) => {
            if (!searchLower) return true;
            const modMatch = selectedModule?.ModuleName?.toLowerCase().includes(searchLower);
            const subMatch = selectedSubModule.SubModuleName?.toLowerCase().includes(searchLower);
            if (modMatch || subMatch) return true;
            return subSub.SubSubModuleName?.toLowerCase().includes(searchLower);
        });
    } else if (searchLower) {
        displaySubSections = modules.flatMap((mod) => {
            const modMatch = mod.ModuleName?.toLowerCase().includes(searchLower);
            return (mod.SubModuleData || []).flatMap((sub) => {
                const subMatch = sub.SubModuleName?.toLowerCase().includes(searchLower);
                return (sub.SubSubModuleData || []).filter((ss) => {
                    if (modMatch || subMatch) return true;
                    return ss.SubSubModuleName?.toLowerCase().includes(searchLower);
                });
            });
        });
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[500px]">
            <div className="space-y-4">
                <TableActionToolbar
                    isShowSearchBar
                    searchPlaceholder="Search By Modules or Sections or Subsections"
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    onClearSearch={() => {
                        setSearchTerm('');
                    }}
                />
            </div>

            <div className="w-full bg-blue-100 p-2 rounded-lg flex items-center flex-wrap gap-2 border border-gray-300">
                <span className="text-sm text-[#4b5563] font-semibold p-1">Nav Path :</span>

                {selectedModule && (
                    <span
                        className={
                            !selectedSubModule
                                ? "text-sm text-blue-600 font-semibold bg-white rounded px-2 py-0.5 border border-gray-300 shadow-xs"
                                : "text-sm text-gray-700 "
                        }
                    >
                        {selectedModule.ModuleName}
                    </span>
                )}

                {selectedSubModule && (
                    <>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span
                            className={
                                !selectedSubSubModule
                                    ? "text-sm text-blue-600 font-semibold bg-white rounded px-2 py-0.5 border border-gray-300 shadow-xs"
                                    : "text-sm text-gray-700"
                            }
                        >
                            {selectedSubModule.SubModuleName}
                        </span>
                    </>
                )}

                {selectedSubSubModule && (
                    <>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-blue-600 font-semibold bg-white rounded px-2 py-0.5 border border-gray-300 shadow-xs">
                            {selectedSubSubModule.SubSubModuleName}
                        </span>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 mt-4 ">
                {/* Column 1 */}
                <div className="md:pr-6">
                    <h2 className="font-semibold text-gray-800 text-base mb-4">Modules</h2>
                    <ul className="space-y-1 overflow-y-auto thin-scroll h-[480px]">
                        {filteredModules.map((mod) => {
                            const isSelected = selectedModule?.ModulesMasterId === mod.ModulesMasterId;
                            return (
                                <li
                                    key={mod.ModulesMasterId}
                                    onClick={() => handleModuleClick(mod)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${isSelected
                                        ? "bg-blue-50 text-blue-600 font-semibold"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-block w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-gray-400"
                                                }`}
                                        />
                                        <span>{mod.ModuleName}</span>
                                    </div>
                                    {isSelected && (
                                        mod.SubModuleData && mod.SubModuleData.length > 0 ? (
                                            <ChevronRight className="w-4 h-4 text-blue-600" />
                                        ) : (
                                            <ArrowRight
                                                className="w-4 h-4 text-blue-600 cursor-pointer hover:translate-x-0.5 transition-transform"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNavigation(mod.Path);
                                                }}
                                            />
                                        )
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Column 2 */}
                <div className="md:px-6 pt-4 md:pt-0">
                    <h2 className="font-semibold text-gray-800 text-base">Sections</h2>
                    {selectedModule && (
                        <p className="text-xs uppercase text-gray-400 tracking-wider mb-4 font-medium">
                            {selectedModule.ModuleName}
                        </p>
                    )}

                    <ul className="space-y-1">
                        {displaySections.length > 0 ? (
                            displaySections.map((sub) => {
                                const isSelected = selectedSubModule?.SubModulesMasterId === sub.SubModulesMasterId;

                                return (
                                    <li
                                        key={sub.SubModulesMasterId}
                                        onClick={() => handleSubModuleClick(sub)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${isSelected
                                            ? "bg-blue-50 text-blue-600 font-semibold border border-blue-200"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-block w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-gray-400"
                                                    }`}
                                            />
                                            <span>{sub.SubModuleName}</span>
                                        </div>

                                        {isSelected && (
                                            sub.SubSubModuleData && sub.SubSubModuleData.length > 0 ? (
                                                <ChevronRight className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <ArrowRight
                                                    className="w-4 h-4 text-blue-600 cursor-pointer hover:translate-x-0.5 transition-transform"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNavigation(sub.Path);
                                                    }}
                                                />
                                            )
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-400 italic py-2">No sections available</p>
                        )}
                    </ul>
                </div>

                {/* Column 3 */}
                <div className="md:pl-6 pt-4 md:pt-0">
                    <h2 className="font-semibold text-gray-800 text-base">Sub-Sections</h2>
                    {selectedSubModule && (
                        <p className="text-xs uppercase text-gray-400 tracking-wider mb-4 font-medium">
                            {selectedSubModule.SubModuleName}
                        </p>
                    )}

                    <ul className="space-y-1">
                        {displaySubSections.length > 0 ? (
                            displaySubSections.map((subSub) => {
                                const isSelected =
                                    selectedSubSubModule?.SubSubModulesMasterId ===
                                    subSub.SubSubModulesMasterId;

                                return (
                                    <li
                                        key={subSub.SubSubModulesMasterId}
                                        onClick={() => handleSubSubModuleClick(subSub)}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${isSelected
                                            ? "bg-blue-50 text-blue-600 font-semibold border border-blue-200"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-block w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-gray-400"
                                                    }`}
                                            />
                                            <span>{subSub.SubSubModuleName}</span>
                                        </div>
                                        {isSelected && (
                                            <ArrowRight
                                                className="w-4 h-4 text-blue-600 cursor-pointer hover:translate-x-0.5 transition-transform"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNavigation(subSub.Path);
                                                }}
                                            />
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-400 italic py-2">No sub-sections available</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};