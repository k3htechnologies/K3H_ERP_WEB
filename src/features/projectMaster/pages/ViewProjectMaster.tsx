import React, { useCallback, useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { useNavigate } from 'react-router-dom';
import { useProjectMasterListState } from '@/features/projectMaster/context/ProjectMasterListStateContext';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { Tabs, type TabItem } from '@/ui/components/Tab/Tab';
import type { FilterWithPaginationProjectMasterRequest, ProjectMasterData, ProjectWithBankDetails } from '@/features/projectMaster/models/ProjectMasterModel';
import ImageCarousel from '@/ui/components/ImageViewer/ImageCarousel';
import { runApiWithLoader } from '@/core/utils';
import { projectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import * as E from 'fp-ts/Either';
import type { EmployeeMasterData } from '@/features/employeeMaster/models/EmployeeMasterModel';
import useToast from '@/core/hooks/useToast';
import type { CompanyMasterData } from '@/features/companyMaster/models/CompanyMasterModel';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { modulesWorkflowApprovalService } from '@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService';
import type { AddUpdateModulesWorkflowApprovalRequest, DeleteModulesWorkflowApprovalRequest, FilterModulesWorkflowApprovalRequest, ModulesWorkflowApprovalData } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import { BadgeCheck, BadgeDollarSign, Circle, ContactRound, DraftingCompass, History, IndianRupee, Landmark, Mail, MapPin, Phone, Plus, Search, Swords, Trash2, Wallet } from 'lucide-react';
import { getStatusColor } from '../utils/Status';
import { formatCurrency } from '@/core/utils/comman';
import { Button, Input } from '@/ui/components/forms';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { Modal } from '@/ui/components/Modal/Modal';
import { fetchPaginationProjectWithEmployeeDropdown } from '../projectWiseEmployeeDropdown';
import Checkbox from '@/ui/components/forms/Checkbox';

const initialFormState = (): AddUpdateModulesWorkflowApprovalRequest => ({
    EmployeeId: "",
    ProjectId: 0,
    ModulesMasterId: 0,
    SubModulesMasterId: 0,
    SubSubModulesMasterId: 0,
});

export const ViewProjectMaster: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);

    const [searchTermForEmployee, setSearchTermForEmployeeName] = useState('')
    const debouncedSearchForEmployeeName = useDebouncedCallback((value: string) => {
        searchEmployeeName(value)
    }, 350)


    const [companyMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);

    const [projectWithBankDetailsList, setProjectWithBankDetailsList] = useState<ProjectWithBankDetails[]>([]);

    const [modulesWorkflowApprovalList, setModulesWorkflowApprovalList] = useState<ModulesWorkflowApprovalData[]>([]);

    const [activeModuleTab, setActiveModuleTab] = useState<string>("");

    const [activeTabForModulesWorkflowApproval, setActiveTabForModulesWorkflowApproval] = useState<TabItem[]>([]);

    const { addToast } = useToast()

    const navigate = useNavigate();

    const { listState } = useProjectMasterListState();

    const { canView: canProjectView, canAction: canProjectAction } = useMenuPermissions('/projectDetails');

    const { canView: canApprovalView, canAction: canApprovalAction } = useMenuPermissions('/projectMasterApprovalSetup');

    const { canView: canBankView, canAction: canBankAction } = useMenuPermissions('/projectMasterBankDetails');

    const { canView: canCompanyView, canAction: canCompanyAction } = useMenuPermissions('/projectMasterSetCompany');

    const { canView: canAssignEmployeeView, canAction: canAssignEmployeeAction } = useMenuPermissions('/projectMasterAssignEmployee');

    const [editProjectData, setEditProjectData] = useState<ProjectMasterData | null>(null);

    const TabList: { id: string; label: string }[] = [

        canProjectView ? { id: "Project Overview", label: "Project Overview" } : null,

        canAssignEmployeeView ? { id: "Employee", label: "Employee" } : null,

        canBankView ? { id: "Bank Details", label: "Bank Details" } : null,

        canCompanyView ? { id: "Company", label: "Company" } : null,

        canApprovalView ? { id: "Approval", label: "Approval" } : null

    ].filter(Boolean) as { id: string; label: string }[];

    const [activeTab, setActiveTab] = useState<string>(TabList?.[0]?.id ?? '');

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

    const [deleteModulesWorkflowApprovalData, setDeleteModulesWorkflowApprovalData] = useState<{
        module: ModulesWorkflowApprovalData
        employeeId: number
    } | null>(null);

    const projectId = listState.projectId;

    const [searchEmployeeNameTerm, setSearchEmployeeNameTerm] = useState('');

    const [formData, setFormData] = useState<AddUpdateModulesWorkflowApprovalRequest>(() => initialFormState());

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string[]>([]);

    const [projectWithEmployeeListOptions, setProjectWithEmployeeListOptions] = useState<
        { label: string; value: string }[]
    >([]);

    const [isOpenAddProjectMasterWithEmployee, setIsOpenAddProjectMasterWithEmployee] = useState(false);

    useEffect(() => {
        if (!isOpenAddProjectMasterWithEmployee) return;

        const loadProjectWithEmployeeList = async () => {
            const response = await fetchPaginationProjectWithEmployeeDropdown(1, {
                projectId: listState.projectId,
            });
            setProjectWithEmployeeListOptions(response.itemList);
        };
        loadProjectWithEmployeeList();
    }, [isOpenAddProjectMasterWithEmployee]);

    const handleAddEmployeeModal = (employeeId: string) => {
        setSelectedEmployeeId(prev => {
            const updated = prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId];

            setFormData(f => ({
                ...f,
                ProjectId: listState.projectId,
                EmployeeId: updated.join(','),
            }));

            if (errors.EmployeeId) {
                setErrors(e => ({ ...e, EmployeeId: '' }));
            }
            return updated;
        });
    };

    useEffect(() => {
        if (listState.projectId) {

            loadProjectData();
        }
    }, [listState.projectId]);

    useEffect(() => {
        if (!editProjectData) return;

        if (activeTab === 'Project Overview') {

        }
        else if (activeTab === 'Employee') {
            loadProjectMasterWithEmployee(editProjectData.ProjectId, '');
        }
        else if (activeTab === 'Bank Details') {
            loadProjectMasterWithBankDetails(editProjectData.ProjectId);
        }
        else if (activeTab === 'Company') {
            loadProjectMasterWithCompany(editProjectData.ProjectId);
        }
        else if (activeTab === 'Approval') {
            loadModulesWorkflowApproval(editProjectData.ProjectId);
        }
    }, [activeTab, editProjectData]);

    const loadProjectData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: listState.projectId,
                    IsProjectAccess: false
                };
                const response = await projectMasterService.apiCallPullProjectMaster(params);
                if (E.isRight(response)) {
                    setEditProjectData(response.right.Data[0]);
                } else {
                    addToast({ type: 'error', title: response.left?.message || 'Failed to load project data' });
                }
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Project Data'
        );
    };

    const loadProjectMasterWithEmployee = async (ProjectId: number, searchText = "") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithEmployee(ProjectId, searchText);

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

    const searchEmployeeName = async (searchValue: string) => {

        setSearchTermForEmployeeName(searchValue);
        await loadProjectMasterWithEmployee(editProjectData!.ProjectId, searchValue);

    }

    const clearsearchForEmployeeName = async () => {
        setSearchTermForEmployeeName('');
        debouncedSearchForEmployeeName.cancel?.();
        await loadProjectMasterWithEmployee(editProjectData!.ProjectId);
    }

    const loadProjectMasterWithCompany = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithCompany(ProjectId);

                if (E.isRight(response)) {

                    setCompanyMasterList(response.right.Data);

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
            'Loading Company'
        );
    };

    const loadProjectMasterWithBankDetails = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithBankDetails(ProjectId);

                if (E.isRight(response)) {

                    setProjectWithBankDetailsList(response.right.Data);

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
            'Loading Bank Details'
        );
    };

    const loadModulesWorkflowApproval = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterModulesWorkflowApprovalRequest = {
                    ProjectId: ProjectId,
                };

                const response = await modulesWorkflowApprovalService.apiCallPullModulesWorkflowApproval(params);

                if (E.isRight(response)) {

                    const items = Array.isArray(response?.right.Data) ? response.right.Data : [];

                    setModulesWorkflowApprovalList(items);

                    const tabs: TabItem[] = Array.from(
                        new Map(
                            items
                                .filter(x => x.ModulesMasterId && x.ModuleName)
                                .map(x => [x.ModulesMasterId, x])
                        ).values()
                    ).map(x => ({
                        id: String(x.ModulesMasterId),
                        label: x.ModuleName!,
                    }));

                    setActiveTabForModulesWorkflowApproval(tabs);

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
            'Loading Permission'
        );
    };


    const handleBackToListProjectMaster = () => {
        navigate('/projectMaster');
    };

    const handleEditProjectMaster = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate(`/projectMaster/add/${row.ProjectId}`);
    };

    const handleEditProjectMasterWithEmployee = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate('/projectMaster/employee');
    };

    const handleEditProjectMasterWithCompany = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate('/projectMaster/company');
    };

    const handleEditProjectMasterWithBank = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate('/projectMaster/bank');
    };

    const handleEditApproval = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate('/projectMaster/approval');
    };


    useEffect(() => {
        if (activeTabForModulesWorkflowApproval.length > 0 && !activeModuleTab) {
            setActiveModuleTab(activeTabForModulesWorkflowApproval[0].id);
        }
    }, [activeTabForModulesWorkflowApproval]);

    const filteredApprovalList = modulesWorkflowApprovalList.filter(
        x => String(x.ModulesMasterId) === activeModuleTab
    );

    const { bg, text } = getStatusColor(editProjectData?.ProjectStatus || "");

    function sendEmail(email: string) {
        if (email) {
            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
        }
    }

    const handleAddUpdateEmployee = (item: ModulesWorkflowApprovalData) => {
        setDeleteModulesWorkflowApprovalData(null);
        setSelectedEmployeeId([]);
        setFormData({
            ...initialFormState(),
            ProjectId: projectId,
            ModulesMasterId: item.ModulesMasterId,
            SubModulesMasterId: item.SubModulesMasterId,
            SubSubModulesMasterId: item.SubSubModulesMasterId,
        });
        setSearchEmployeeNameTerm('');
        setErrors({});
        setIsOpenAddProjectMasterWithEmployee(true);
    }

    const PushModulesWorkflowApproval = (): AddUpdateModulesWorkflowApprovalRequest => {
        return {
            ProjectId: formData.ProjectId,
            EmployeeId: selectedEmployeeId.join(","),
            ModulesMasterId: formData.ModulesMasterId,
            SubModulesMasterId: formData.SubModulesMasterId,
            SubSubModulesMasterId: formData.SubSubModulesMasterId,
        };

    };

    const handleAddUpdateModulesWorkflowApproval = async (e: React.FormEvent) => {

        e.preventDefault();

        if (selectedEmployeeId.length === 0) {

            addToast({ type: "error", title: "At least one employee is required" });
            return
        }

        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,
            async () => {

                const payload = PushModulesWorkflowApproval();

                const response = await modulesWorkflowApprovalService.apiCallAddUpdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    await loadModulesWorkflowApproval(projectId);

                    setIsOpenAddProjectMasterWithEmployee(false);

                    addToast({ type: 'success', title: "Access added successfully" })

                } else {

                    addToast({ type: "error", title: response.left?.message });

                }
                return response;
            },
            undefined,
            (error: any) => {

                addToast({ type: 'error', title: error.message })
            },
            undefined,

            "Add Permission"
        )
    };

    const handleConfirmationDialogBoxOpen = useCallback((module: ModulesWorkflowApprovalData, employeeId: number) => {

        setDeleteModulesWorkflowApprovalData({ module, employeeId })
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const handleDeleteModulesWorkflowApprovalData = async () => {

        setIsConfirmationDialogBoxOpen(false);
        if (!deleteModulesWorkflowApprovalData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteModulesWorkflowApprovalRequest = {
                    ProjectId: projectId,
                    EmployeeId: deleteModulesWorkflowApprovalData.employeeId,
                    ModulesMasterId: deleteModulesWorkflowApprovalData.module.ModulesMasterId,
                    SubModulesMasterId: deleteModulesWorkflowApprovalData.module.SubModulesMasterId,
                    SubSubModulesMasterId: deleteModulesWorkflowApprovalData.module.SubSubModulesMasterId,
                };

                const response = await modulesWorkflowApprovalService.apiCallDeleteModulesWorkflowApproval(params);

                if (E.isRight(response)) {

                    await loadModulesWorkflowApproval(projectId);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteModulesWorkflowApprovalData(null);
                } else {

                    addToast({ type: 'error', title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Permission"
        );
    };

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}> <div></div>  </Loader>

            <HeaderActionBar
                titleText={'Project Details : '}
                subTitleText={editProjectData?.ProjectName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListProjectMaster()}
                canAction={activeTab === "Project Overview" ? canProjectAction
                    : activeTab === 'Employee' ? canAssignEmployeeAction
                        : activeTab === 'Bank Details' ? canBankAction
                            : activeTab === 'Company' ? canCompanyAction
                                : canApprovalAction}
                onEdit={() => {

                    if (activeTab === "Project Overview") {

                        if (editProjectData) handleEditProjectMaster(editProjectData);
                    }

                    else if (activeTab === 'Employee') {

                        if (editProjectData) handleEditProjectMasterWithEmployee(editProjectData);
                    }
                    else if (activeTab === 'Bank Details') {

                        if (editProjectData) handleEditProjectMasterWithBank(editProjectData);

                    }
                    else if (activeTab === 'Company') {

                        if (editProjectData) handleEditProjectMasterWithCompany(editProjectData);
                    }
                    else if (activeTab === 'Approval') {

                        if (editProjectData) handleEditApproval(editProjectData);
                    }
                }}
                isLoading={isLoading}
            />

            <div className='pt-5'>
                <Tabs
                    tabs={TabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);

                    }}
                />

                {activeTab === 'Project Overview' && (
                    <div className="col-span-12 lg:col-span-7">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm px-5 py-5 mt-5">
                            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                                <div className="w-full lg:w-[240px] shrink-0">
                                    <div className="relative w-full lg:w-[220px] h-[200px] lg:h-[150px] rounded-xl overflow-hidden">
                                        <ImageCarousel
                                            images={editProjectData?.ProjectPhotoURL ?? ""}
                                            thumbHeight="h-full"
                                        />

                                        <div className="absolute top-2 right-2 z-20">
                                            <FieldItem
                                                label=""
                                                urls={editProjectData?.ProjectPhotoURL}
                                                isIcon
                                                isSetValue={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF4FF] text-[#464554] font-medium text-xs  mt-2">
                                        <MapPin className="text-[#4648D4]" size={18} />
                                        {editProjectData?.CityName}, {editProjectData?.StateName}
                                    </div>
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="flex flex-col xl:flex-row gap-6 xl:gap-10">
                                        <div className="flex-1 min-w-0 space-y-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-lg font-semibold text-gray-800">
                                                    {editProjectData?.ProjectName ?? "-"}
                                                </span>

                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${editProjectData?.Category?.toLowerCase() === "tender"
                                                        ? "bg-[#4346551F] text-[#434655]"
                                                        : "bg-green-100 text-green-700"
                                                        }`}
                                                >
                                                    {editProjectData?.Category || "-"}
                                                </span>

                                                {editProjectData?.ProjectStatus && (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: bg,
                                                            color: text,
                                                        }}
                                                    >
                                                        <Circle
                                                            size={8}
                                                            fill={text}
                                                            color={text}
                                                            strokeWidth={1}
                                                        />
                                                        {editProjectData?.ProjectStatus || "-"}
                                                    </span>
                                                )}
                                            </div>

                                            <FieldItem label="Business Category" value={editProjectData?.BussinessCategory} isRow />
                                            <FieldItem label="Federation" value={editProjectData?.IsFederation ? "YES" : "NO"} isRow />
                                            <FieldItem label="Federation Amount" value={formatCurrency(editProjectData?.FederationAmount ?? 0)} isRow />
                                        </div>

                                        <div className="w-full xl:w-[400px] space-y-4">

                                            <FieldItem label="Redevelopment" value={editProjectData?.IsRedevelopment ? "YES" : "NO"} isRow isUsedForInventoryFlat />
                                            <FieldItem label="Scope" value={editProjectData?.ProjectScope} isRow isUsedForInventoryFlat />
                                            <FieldItem label="Scheme" value={editProjectData?.ProjectScheme} isRow isUsedForInventoryFlat />
                                            <FieldItem label="Sub Scheme" value={editProjectData?.ProjectSubScheme?.replace(/,/g, " + ") ?? "-"} isRow isUsedForInventoryFlat />
                                            <FieldItem label="File Number" value={editProjectData?.FileNumber} isRow isUsedForInventoryFlat />

                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <FieldItem label="CTS Number" value={editProjectData?.CTSNumber} isRow />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {editProjectData?.Category == "Tender" && (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-5">
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                                            <BadgeDollarSign className="w-5 h-5 text-emerald-600" />
                                        </div>

                                        <h2 className="text-[16px] font-semibold text-slate-800">
                                            Tender Amount Details
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <FieldItem label="Amount" value={formatCurrency(editProjectData?.TenderAmount ?? "-")} />
                                        <FieldItem label="Purchase Start Date" value={formatDate_dd_MonthName_yy(editProjectData?.TenderPurchaseStartDate ?? '-')} />
                                        <FieldItem label="Purchase End Date" value={formatDate_dd_MonthName_yy(editProjectData?.TenderPurchaseEndDate ?? '-')} />
                                        <FieldItem label="Payment Mode" value={editProjectData?.TenderAmountPaymentMode} />
                                        <FieldItem label="Transaction / Cheque / DD No" value={editProjectData?.TenderAmountChequeNumber} urls={editProjectData.TenderAmountChequeNumberURL} isIcon />
                                        <FieldItem label="Payorder Remark" value={editProjectData?.TenderAmountPayorderRemark} />
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <Wallet className="w-5 h-5 text-indigo-600" />
                                        </div>

                                        <h2 className="text-[16px] font-semibold text-slate-800">
                                            Tender EMD Details
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <FieldItem label="EMD Amount" value={formatCurrency(editProjectData?.TenderEMDAmount ?? "-")} />
                                        <FieldItem label="Submission Date" value={formatDate_dd_MonthName_yy(editProjectData?.TenderSubmissionDate ?? "-")} />
                                        <FieldItem label="Payment Mode" value={editProjectData?.TenderEMDPaymentMode} />
                                        <FieldItem label="Transaction / Cheque / DD No" value={editProjectData?.TenderEMDChequeNumber} urls={editProjectData.TenderEMDChequeNumberURL} isIcon />
                                        <FieldItem label="Payorder Remark" value={editProjectData?.TenderEMDPayorderRemark} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-5">


                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                        <DraftingCompass className="w-5 h-5 text-indigo-600" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Liasoning Architect
                                    </h2>
                                </div>

                                <div className="mt-4  space-y-4">

                                    <FieldItem label="Name" value={editProjectData?.LiasoningArchitectName ?? '-'} isRow isUsedForInventoryFlat />

                                    <FieldItem label="Mobile No" value={editProjectData?.LiasoningArchitectMobileNumber ? `+91 ${editProjectData.LiasoningArchitectMobileNumber}` : "-"} isRow isUsedForInventoryFlat />

                                </div>
                            </div>

                            {/* Designing Architect */}
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                                        <Swords className="w-5 h-5 text-violet-600" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Designing Architect
                                    </h2>
                                </div>
                                <div className="mt-4  space-y-4">

                                    <FieldItem label="Name" value={editProjectData?.DesigningArchitectName ?? '-'} isRow isUsedForInventoryFlat />

                                    <FieldItem label="Mobile No" value={editProjectData?.DesigningArchitectMobileNumber ? `+91 ${editProjectData.DesigningArchitectMobileNumber}` : "-"} isRow isUsedForInventoryFlat />

                                </div>

                            </div>

                            {/* RCC Consultant */}
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Landmark className="w-5 h-5 text-emerald-600" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        RCC Consultant
                                    </h2>
                                </div>
                                <div className="mt-4  space-y-4">

                                    <FieldItem label="Name" value={editProjectData?.RCCConsultantName ?? '-'} isRow isUsedForInventoryFlat />

                                    <FieldItem label="Mobile No" value={editProjectData?.RCCConsultantMobileNumber ? `+91 ${editProjectData.RCCConsultantMobileNumber}` : "-"} isRow isUsedForInventoryFlat />

                                </div>

                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 pt-5">
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-indigo-600" />
                                        </div>

                                        <h2 className="text-[16px] font-semibold text-slate-800">
                                            Location Details
                                        </h2>
                                    </div>

                                    {editProjectData?.GoogleLocation && (
                                        <span
                                            className="text-blue-600 text-sm underline cursor-pointer"
                                            onClick={() => window.open(editProjectData.GoogleLocation, "_blank")}
                                        >
                                            Google Location
                                        </span>
                                    )}
                                </div>


                                <div className="grid grid-cols-6 text-sm font-semibold text-gray-500 pb-2 pt-3">
                                    <span>Country</span>
                                    <span>State</span>
                                    <span>District</span>
                                    <span>City</span>
                                    <span>Village</span>
                                    <span>Pin Code</span>
                                </div>

                                <div className="border-t border-gray-300"></div>
                                <div className="grid grid-cols-6 pt-3 mb-3 text-md font-medium text-slate-800">
                                    <span>{editProjectData?.CountryName || "-"}</span>
                                    <span>{editProjectData?.StateName || "-"}</span>
                                    <span>{editProjectData?.DistrictName || "-"}</span>
                                    <span>{editProjectData?.CityName || "-"}</span>
                                    <span>{editProjectData?.VillageName || "-"}</span>
                                    <span>{editProjectData?.ZipCode || "-"}</span>
                                </div>

                                <div className="flex items-center justify-between gap-4 mt-4">

                                    <p className="text-sm bg-blue-50 rounded-lg p-4 border border-blue-200 px-4 py-3 flex-1 mb-0">
                                        Project Location : {editProjectData?.ProjectLocation}
                                    </p>

                                </div>

                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-5 pt-5 items-stretch">

                            {/* 3 Columns */}
                            <div className="col-span-12 lg:col-span-4">
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 h-full">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
                                            <BadgeCheck className="w-5 h-5 text-violet-600" />
                                        </div>

                                        <h2 className="text-[16px] font-semibold text-slate-800">
                                            Project Documentation
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <FieldItem label="RERA Number" value={editProjectData?.RERANumber} />
                                        <FieldItem label="RERA Certificate Date" value={formatDate_dd_MonthName_yy(editProjectData?.RERACertificateDate ?? '-')} />
                                        <FieldItem label="RERA Possession Date" value={formatDate_dd_MonthName_yy(editProjectData?.RERAPossessionDate ?? '-')} />
                                        <FieldItem label="APF Number" value={editProjectData?.APFNumber} />
                                    </div>
                                </div>

                            </div>

                            {/* 5 Columns */}
                            <div className="col-span-12 lg:col-span-5">
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 h-full">

                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <IndianRupee className="w-5 h-5 text-indigo-600" />
                                        </div>

                                        <h2 className="text-[16px] font-semibold text-slate-800">
                                            Project Financials
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-3">
                                        <div className="bg-[#F9F9FB] rounded-md border border-gray-200 p-4">
                                            <FieldItem label="Estimation Cost (₹)" value={formatCurrency(editProjectData?.ProjectEstimateCost)} />
                                        </div>

                                        <div className="bg-[#F9F9FB] rounded-md border border-gray-200 p-4">
                                            <FieldItem label="Ongoing Budget (₹)" value={formatCurrency(editProjectData?.OnGoingBudgetCost)} />
                                        </div>

                                        <div className="bg-[#F9F9FB] rounded-md border border-gray-200 p-4">
                                            <FieldItem label="Project Area in (SqFt)" value={editProjectData?.ProjectAreaInSqft} />
                                        </div>

                                        <div className="bg-[#F9F9FB] rounded-md border border-gray-200 p-4">
                                            <FieldItem label="Project Area in (SqMt)" value={editProjectData?.ProjectAreaInSqmt} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4 Columns */}
                            <div className="col-span-12 lg:col-span-3">
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 h-full">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <IndianRupee className="w-5 h-5 text-indigo-600" />
                                        </div>

                                        <h2 className="text-[16px] font-semibold text-slate-800">
                                            Project Timeline
                                        </h2>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            {
                                                label: "Survey Date",
                                                value: editProjectData?.SurveyDate
                                                    ? formatDate_dd_MonthName_yy(editProjectData.SurveyDate)
                                                    : "-",
                                            },
                                            {
                                                label: "Expected Start Date",
                                                value: editProjectData?.ExpectedStartDate
                                                    ? formatDate_dd_MonthName_yy(editProjectData.ExpectedStartDate)
                                                    : "-",
                                            },
                                            {
                                                label: "Execution Start Date",
                                                value: editProjectData?.ExecutionStartDate
                                                    ? formatDate_dd_MonthName_yy(editProjectData.ExecutionStartDate)
                                                    : "-",
                                            },
                                        ].map((item, index, arr) => (
                                            <div key={index} className="relative pl-8">
                                                {index !== arr.length - 1 && (
                                                    <div className="absolute left-[11px] top-6 h-[calc(100%+16px)] w-[2px] bg-gray-300" />
                                                )}

                                                <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-700" />
                                                </div>

                                                <p className="text-[14px] tracking-wider font-semibold text-gray-500">
                                                    {item.label}
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-slate-900">
                                                    {item.value ?? "-"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 pt-5">
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <ContactRound className="w-5 h-5 text-emerald-700" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Site Contact Information
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-3">
                                    {[
                                        {
                                            name: editProjectData?.SiteContactName,
                                            designation: editProjectData?.SiteContactDesignation,
                                            mobile: editProjectData?.SiteContactMobileNumber,
                                        },
                                        {
                                            name: editProjectData?.SiteContact2Name,
                                            designation: editProjectData?.SiteContact2Designation,
                                            mobile: editProjectData?.SiteContact2MobileNumber,
                                        },
                                        {
                                            name: editProjectData?.SiteContact3Name,
                                            designation: editProjectData?.SiteContact3Designation,
                                            mobile: editProjectData?.SiteContact3MobileNumber,
                                        },
                                    ].map((contact, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                        >
                                            <div className="flex flex-col h-full space-y-4">
                                                <FieldItem label="Name" value={contact.name ?? '-'} isRow isUsedForInventoryFlat />
                                                <FieldItem label="Designation" value={contact.designation ?? '-'} isRow isUsedForInventoryFlat />

                                                <p className="pb-1 text-[14px] font-medium text-slate-700 border-b border-gray-200"></p>

                                                <div className="flex items-center gap-2 ">

                                                    <FieldItem label="Mobile No" value={contact.mobile ? `+91 ${contact.mobile}` : "-"} isRow isUsedForInventoryFlat />

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 pt-5">
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                                        <History className="w-5 h-5 text-slate-600" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Action Details
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 space-y-4">
                                    <FieldItem label="Created By" value={editProjectData?.CreatedBy} />
                                    <FieldItem label="Created Date" value={editProjectData?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(editProjectData?.CreatedDate) : ""} />
                                    {editProjectData?.ModifiedBy && (
                                        <>
                                            <FieldItem label="Modified By" value={editProjectData?.ModifiedBy} />
                                            <FieldItem label="Modified Date" value={editProjectData?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(editProjectData?.ModifiedDate) : ""} />
                                        </>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Employee' && (
                    <div className="space-y-2 pt-5">
                        <TableActionToolbar
                            isShowSearchBar
                            searchTerm={searchTermForEmployee}
                            searchPlaceholder="Search By Employee Name or Department"
                            onSearchChange={(v) => {
                                setSearchTermForEmployeeName(v)
                                debouncedSearchForEmployeeName(v)
                            }}
                            onClearSearch={clearsearchForEmployeeName}
                            isShowFilterButton={false}
                            exportLoading={isLoading}
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
                                        className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5 overflow-hidden"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-3 pb-4">
                                                <div className="w-12 h-12 rounded-full bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center text-[16px] font-semibold">
                                                    {initials}
                                                </div>

                                                <div>
                                                    <h4 className="text-[16px] font-semibold text-gray-600">
                                                        {emp.FullName || '-'}
                                                    </h4>

                                                    <p className="text-[12px] text-gray-500 mt-0">
                                                        {emp.Designation ?? '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                                Employee Code :
                                                <span className="text-md text-gray-900"> {emp.EmployeeCode ?? '-'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                            <FieldItem label="Department" value={emp.Department ?? '-'} />
                                            <FieldItem label="Reporting Person" value={emp.ReportPersonName ?? '-'} />
                                            <FieldItem label="Mobile Number" value={emp.PersonalMobileNumber ? `+91 ${emp.PersonalMobileNumber}` : '-'} />
                                            <FieldItem
                                                label="Email"
                                                value={
                                                    <a
                                                        href={`mailto:${emp.EmailId}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            sendEmail(emp.EmailId || '');
                                                        }}
                                                        className="text-blue-600 text-sm hover:underline truncate"
                                                    >
                                                        {emp.EmailId ?? '-'}
                                                    </a>
                                                }
                                            />
                                        </div>

                                        <div className="border-t border-gray-200 mt-3 pt-3">
                                            <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                                Last Login :
                                                <span className="text-md text-gray-900"> {emp.LastLogin ? formatDate_dd_MonthName_yy_hh_mm(emp.LastLogin) : '-'}</span>
                                            </div>
                                        </div>
                                    </section>
                                );
                            })
                        ) : (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Employee's Found" />
                            </section>
                        )}
                    </div>
                )}

                {activeTab === "Bank Details" && (
                    <div className="space-y-3 pt-5">
                        {projectWithBankDetailsList?.length ? (
                            projectWithBankDetailsList.map((b, i) => (
                                <section
                                    key={i}
                                    className="relative bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                                    <div className="bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">
                                        <div className="flex items-center justify-start gap-6 mb-1">
                                            <h4 className="text-lg font-semibold text-gray-900 ">
                                                {b.BeneficiaryAccountHolderName ?? "Account Details"}
                                            </h4>

                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 border border-[#A7F3D0]">
                                                ● Active
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-[#1D1D1D80] pb-1">
                                                    Nature Of Account
                                                </p>

                                                <span className="inline-block px-2 py-1 rounded text-sm font-medium bg-[#EFF6FF] text-[#1D4ED8]">
                                                    {b.NatureOfAccount ?? "-"}
                                                </span>
                                            </div>

                                            <FieldItem label="Account Type" value={b.AcType ?? "-"} />
                                            <FieldItem label="Branch" value={b.Branch ?? "-"} />
                                            <FieldItem label="Bank Name" value={b.BankName ?? "-"} />
                                            <FieldItem label="Account Number" value={b.AccountNumber ?? "-"} />
                                            <FieldItem label="IFSC Code" value={b.IFSCCode ?? "-"} />
                                        </div>
                                    </div>
                                </section>
                            ))
                        ) : (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Bank's Found" />
                            </section>
                        )}
                    </div>
                )}

                {activeTab === "Company" && (
                    <div className="space-y-4 pt-5">
                        {companyMasterList?.length ? (
                            companyMasterList.map((c, i) => (
                                <section
                                    key={i}
                                    className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        {c.CompanyName ?? "-"}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Firms Type" value={c.FirmsType ?? "-"} />
                                        <FieldItem label="Contact Person" value={c.ContactPerson ?? "-"} />
                                        <FieldItem label="Mobile Number" value={`+91 ${c.MobileNumber ?? "-"}`} />
                                        <FieldItem label="E-Mail ID" value={c.EmailId ?? "-"} />
                                        <FieldItem label="PAN Number" value={c?.PANNumber ?? '-'} urls={c?.PanCardURL} isIcon />
                                        <FieldItem label="GST Number" value={c?.GSTNumber ?? '-'} urls={c?.GSTCertificateURL} isIcon />
                                        <FieldItem label="CIN Number" value={c?.CINNumber ?? '-'} urls={c?.CINURL} isIcon />
                                        <FieldItem label="TAN Number" value={c?.TANNumber ?? '-'} urls={c?.TANURL} isIcon />
                                        <FieldItem label="City" value={c.CityName ?? "-"} />
                                    </div>
                                </section>
                            ))
                        ) : (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Company's Found" />
                            </section>
                        )}

                    </div>
                )}

                {activeTab === "Approval" && (
                    <div className="space-y-4 pt-5">
                        <Tabs
                            tabs={activeTabForModulesWorkflowApproval}
                            defaultActive={activeModuleTab}
                            isChips={true}
                            onTabChange={(tab: TabItem) => {
                                setActiveModuleTab(tab.id);
                            }}
                        />

                        {filteredApprovalList?.length ? (
                            filteredApprovalList.map((item, i) => (
                                <section
                                    key={i}
                                    className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-5 overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="bg-[#F8FAFD] border-b border-gray-200 px-5 py-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[18px] font-semibold text-slate-900">
                                                {item.SubSubModuleName ?? "-"}
                                            </h3>

                                            <Button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleAddUpdateEmployee(item);
                                                }}
                                                color="blue"
                                                variant="solid"
                                                colorMode="extraLight"
                                                style={{ width: 34, height: 34 }}
                                                centerIcon={<Plus className="h-6 w-6" />}
                                                title="Add"
                                            />
                                        </div>

                                        {item.EmployeeData && item.EmployeeData.length > 0 && (
                                            <div className="text-sm font-medium text-[#1D1D1D80] pb-1">
                                                Assigned Employee :
                                                <span className="ml-1 text-md font-semibold text-gray-900">
                                                    {item.EmployeeData.length}
                                                </span>
                                            </div>
                                        )}

                                    </div>

                                    <div className="p-5">
                                        {/* Employee List */}
                                        {item.EmployeeData && item.EmployeeData.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {item.EmployeeData.map((member, index) => {
                                                    const fullName = (member.FullName ?? "").trim();

                                                    const initials = fullName
                                                        ? fullName
                                                            .split(/\s+/)
                                                            .map((word: string) => word[0])
                                                            .join("")
                                                            .toUpperCase()
                                                            .slice(0, 2)
                                                        : "NA";

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="border border-gray-200 rounded-lg p-3 hover:shadow transition"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-[#EDF3FF] text-[#135BEC] flex items-center justify-center text-sm font-semibold">
                                                                        {initials}
                                                                    </div>

                                                                    <div>
                                                                        <h5 className="text-md font-semibold text-gray-900 truncate">
                                                                            {member.FullName || "-"}
                                                                        </h5>

                                                                        <span className="text-sm text-gray-500">
                                                                            {member.Designation || "—"}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleConfirmationDialogBoxOpen(item, member.EmployeeId)
                                                                    }}
                                                                    color="transparent"
                                                                    isborderRadius
                                                                    size="sm"
                                                                    style={{
                                                                        color: "red",
                                                                        padding: "4px 8px",
                                                                    }}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="border-t border-gray-200 mt-3 pt-3 space-y-2">
                                                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                                                    <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                                                                    <span>{member.PersonalMobileNumber
                                                                        ? `+91 ${member.PersonalMobileNumber}`
                                                                        : "-"}
                                                                    </span>
                                                                </p>

                                                                <p className="text-xs flex items-center gap-2 break-all">
                                                                    <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                                                                    <span className="text-blue-600">
                                                                        {
                                                                            <a
                                                                                href={`mailto:${member.EmailId}`}
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    sendEmail(member.EmailId || '');
                                                                                }}
                                                                                className="text-blue-600 text-sm hover:underline truncate"
                                                                            >
                                                                                {member.EmailId ?? '-'}
                                                                            </a>
                                                                        }
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500">
                                                No Employee Assigned
                                            </div>
                                        )}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                <NoDataView message="No Approval Found" />
                            </section>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isOpenAddProjectMasterWithEmployee}
                onClose={() => {
                    setIsOpenAddProjectMasterWithEmployee(false);
                    setFormData(initialFormState());
                    setSelectedEmployeeId([]);
                    setErrors({});
                    setSearchEmployeeNameTerm('');
                }}
                onCancel={() => {
                    setIsOpenAddProjectMasterWithEmployee(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setSearchEmployeeNameTerm("");
                }}
                title='Add Employee'
                onSubmit={handleAddUpdateModulesWorkflowApproval}
                saveText='Add'
                loading={isLoading}
                size="small-half"
            >
                <div className=" space-y-4 ">
                    <Input
                        type="text"
                        placeholder="Search By Employee Name or Department"
                        value={searchEmployeeNameTerm}
                        onChange={e => {
                            setSearchEmployeeNameTerm(e.target.value);
                        }}
                        leftIcon={<Search className="h-8 w-8 pb-1 text-gray-400" />}
                        className="w-full p-12 border border-[#3333334f] rounded mb-1"
                    />

                    <div className="overflow-x-auto thin-scroll">
                        <div className="flex items-center justify-between px-6 py-2">
                            <button
                                type="button"
                                className="text-sm font-medium text-[#1D1D1D80]"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    const filteredEmployees = projectWithEmployeeListOptions
                                        .filter(employee =>
                                            employee.label.toLowerCase().includes(searchEmployeeNameTerm.toLowerCase())
                                        )
                                        .map(employee => employee.value);

                                    setSelectedEmployeeId(filteredEmployees);
                                }}
                            >
                                Select All
                            </button>

                            <button
                                type="button"
                                className="text-sm font-medium text-[#1D1D1D80]"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedEmployeeId([]);
                                }}
                            >
                                Clear All
                            </button>
                        </div>
                        {projectWithEmployeeListOptions
                            .filter(employee =>
                                employee.label.toLowerCase().includes(searchEmployeeNameTerm.toLowerCase())
                            ).length === 0 ? (
                            <div className="flex items-center justify-center h-100 text-gray-500 text-sm">
                                <NoDataView />
                            </div>

                        ) : (
                            projectWithEmployeeListOptions
                                .filter(employee =>
                                    employee.label.toLowerCase().includes(searchEmployeeNameTerm.toLowerCase())
                                )
                                .map(employee => {
                                    const checked = selectedEmployeeId.includes(employee.value);
                                    return (
                                        <label
                                            key={employee.value}
                                            className="flex items-center justify-between gap-2 px-6 py-3 border-b border-blue-200 cursor-pointer last:border-b-0"
                                        >
                                            <span className="text-sm text-gray-800">{employee.label}</span>
                                            <Checkbox
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleAddEmployeeModal(employee.value)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </label>
                                    );
                                })
                        )}
                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteModulesWorkflowApprovalData(null)
                }}
                onConfirm={handleDeleteModulesWorkflowApprovalData}
                loading={isLoading}
                pageName='Module Permission'
            />
        </div >

    );
};

export default ViewProjectMaster;