import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Tabs } from '@/ui/components/Tab/Tab';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { ProjectMasterData, ProjectWithBankDetails } from '../models/ProjectMasterModel';
import ImageCarousel from '@/ui/components/ImageViewer/ImageCarousel';
import { runApiWithLoader } from '@/core/utils';
import { ProjectMasterService } from '../services/ProjectMasterService';
import * as E from 'fp-ts/Either';
import type { EmployeeMasterData } from '@/features/employeeMaster/models/EmployeeMasterModel';
import useToast from '@/core/hooks/useToast';
import type { CompanyMasterData } from '@/features/companyMaster/models/CompanyMasterModel';

export const ViewProjectMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);
    const [compantMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);
    const [projectWithBankDetailsList, setProjectWithBankDetailsList] = useState<ProjectWithBankDetails[]>([]);

    // TOAST
    const { addToast } = useToast();

    //LOCATION
    const navigate = useNavigate();
    const location = useLocation() as {
        state?: {
            editProjectMasterData?: ProjectMasterData | null;
            fromList?: boolean;
            listState?: {
                page: number;
                filters: any;
            };
        };
    };
    //#endregion
    //#region Get PROJECT MASTER DATA FROM LOCATION STATE
    //#region DATA FETCH FROM STAE 
    const editProjectMasterData = (location.state?.editProjectMasterData ?? null) as ProjectMasterData | null;
    //#endregion
    //#region TAB ACTIVITY
    const TabList = [
    { id: "Employee", label: `Employee (${employeeMasterList.length})` },
    { id: "Bank Details", label: `Bank Details (${projectWithBankDetailsList.length})` },
    { id: "Company", label: `Company (${compantMasterList.length})` },
    { id: "Set Approval", label: "Set Approval (0)" },
];


    const [activeTab, setActiveTab] = useState<string>(TabList[0].id);
    //#endregion
    //#endregion
    //#region INIT
    useEffect(() => {
        if (activeTab === 'Employee') {
            loadProjectMasterWithEmployee(editProjectMasterData!.ProjectId);
        }
        else if (activeTab === 'Bank Details') {
            loadProjectMasterWithBankDetails(editProjectMasterData!.ProjectId);
        }
        else if (activeTab === 'Company') {
            loadProjectMasterWithCompany(editProjectMasterData!.ProjectId);
        }

    }, [activeTab]);

    //#endregion
    //#region DATA LOAD PROJECT WITH EMPLOYEE | COMPANY | BANK DETAILS

    const loadProjectMasterWithEmployee = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const response = await ProjectMasterService.apiCallPullProjectMasterWithEmployee(ProjectId);

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

    const loadProjectMasterWithCompany = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const response = await ProjectMasterService.apiCallPullProjectMasterWithCompany(ProjectId);

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
            setIsLoadingMessage,
            async () => {

                const response = await ProjectMasterService.apiCallPullProjectMasterWithBankDetails(ProjectId);

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

    //#endregion 
    //#region EDIT PROJECT 

    const handleEditProjectMaster = (row: ProjectMasterData) => {
        navigate(`/projectMaster/add/${row.ProjectId}`);

    };
    //#endregion


    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="grid grid-cols-12 gap-6">
                {/* Left column: profile card */}
                <div className="col-span-5">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">

                        <div>
                            <div className="px-4 pt-4">
                                <div className="w-full max-w-[400px] mx-auto bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                                    <ImageCarousel
                                        images={editProjectMasterData?.ProjectPhotoURL ?? ""}
                                        thumbHeight="h-50"
                                        containerStyle={{ width: 400 }}
                                    />
                                </div>
                            </div>


                            <div className="mt-4 px-6 text-center">
                                <h3 className="text-lg font-semibold text-gray-900 flex justify-center items-center gap-2">
                                    {editProjectMasterData?.ProjectName ?? "—"}
                                    <span className="text-green-500">●</span>
                                </h3>
                            </div>
                        </div>


                        {/* BODY */}
                        <div className="px-2 pb-6">
                            <div className="text-center">
                                <div className="mt-2 flex justify-center gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                        {editProjectMasterData?.CTSNumber ?? "-"}
                                    </span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                        {editProjectMasterData?.CityName ?? "-"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Project Identification
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Project Location" value={editProjectMasterData?.ProjectLocation ?? '-'} isRow />
                                    <FieldItem label="Business Category" value={editProjectMasterData?.BussinessCategory ?? '-'} isRow />
                                    <FieldItem label="Project Status" value={editProjectMasterData?.ProjectStatus ?? '-'} isRow />
                                    <FieldItem label="Is Redevelopment" value={editProjectMasterData?.IsRedevelopment ? 'Yes' : 'No'} isRow />
                                </div>
                            </div>


                            <div className="mt-4 flex gap-3">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault(); e.stopPropagation();
                                        handleEditProjectMaster(editProjectMasterData!);
                                    }}
                                    color='blue'
                                    fullWidth
                                    size='sm'
                                    title="Edit Info"
                                >
                                    <Edit className="w-4 h-4" /> Edit Info
                                </Button>

                                <Button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(-1); }}
                                    color='transparent'
                                    variant='transparent_border'
                                    fullWidth
                                    size='sm'
                                    title="Back"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Cancel
                                </Button>
                            </div>

                            {/* Location */}
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Location Details
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Country" value={editProjectMasterData?.CountryName ?? '-'} isRow />
                                    <FieldItem label="State" value={editProjectMasterData?.StateName ?? '-'} isRow />
                                    <FieldItem label="District" value={editProjectMasterData?.DistrictName ?? '-'} isRow />
                                    <FieldItem label="City" value={editProjectMasterData?.CityName ?? '-'} isRow />
                                    <FieldItem label="PIN Code" value={editProjectMasterData?.ZipCode ?? '-'} isRow />
                                </div>
                            </div>

                            {/* Documentation */}

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Project Documentation
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="RERA Number" value={editProjectMasterData?.RERANumber ?? '-'} isRow />
                                    <FieldItem label="RERA Certificate Date" value={editProjectMasterData?.RERACertificateDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.RERACertificateDate) : '-'} isRow />
                                    <FieldItem label="RERA Completion Date" value={editProjectMasterData?.RERAComplitionDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.RERAComplitionDate) : '-'} isRow />
                                </div>
                            </div>


                            {/* Financials */}

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Project Financials
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Project Estimate Cost" value={editProjectMasterData?.ProjectEstimateCost?.toString() ?? '-'} isRow />
                                    <FieldItem label="On Going Budget Cost" value={editProjectMasterData?.OnGoingBudgetCost?.toString() ?? '-'} isRow />
                                    <FieldItem label="Project Area in Sqft" value={editProjectMasterData?.ProjectAreaInSqft?.toString() ?? '-'} isRow />
                                </div>
                            </div>



                            {/* Timeline */}
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Project TimeLine
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Survey Date" value={editProjectMasterData?.SurveyDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.SurveyDate) : '-'} isRow />
                                    <FieldItem label="Expected Start Date" value={editProjectMasterData?.ExpectedStartDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.ExpectedStartDate) : '-'} isRow />
                                    <FieldItem label="Execution Start Date" value={editProjectMasterData?.ExecutionStartDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.ExecutionStartDate) : '-'} isRow />
                                </div>
                            </div>

                            {/* Contact */}

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Contact Information
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Site Contact Name" value={editProjectMasterData?.SiteContactName ?? '-'} isRow />
                                    <FieldItem label="Site Contact Mobile Number" value={editProjectMasterData?.SiteContactMobileNumber ?? '-'} isRow />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>


                {/* Right column: details and accordions */}
                <div className="col-span-7 space-y-4">

                    {/* Projects & Assets tabs */}
                    <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                        <Tabs
                            tabs={TabList}
                            defaultActive={activeTab}
                            onTabChange={(t) => {
                                setActiveTab(t.id);
                                if (t.id === 'Employee') {
                                    loadProjectMasterWithEmployee(editProjectMasterData!.ProjectId);
                                }
                                else if (t.id === 'Bank Details') {
                                    loadProjectMasterWithBankDetails(editProjectMasterData!.ProjectId);
                                }
                                else if (t.id === 'Company') {
                                    loadProjectMasterWithCompany(editProjectMasterData!.ProjectId);
                                }
                            }}
                        />

                        <div className="mt-1">
                            {activeTab === 'Employee' && (
                                <div className="space-y-4">
                                    {employeeMasterList.length === 0 ? (
                                        <div className="text-sm text-gray-500 p-4">No Employee found.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {employeeMasterList.map((employee) => {

                                                return (
                                                    <div key={employee!.EmployeeId} className="flex items-center justify-between border border-gray-200 rounded p-3 bg-white">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 
                                                                        rounded-full 
                                                                        bg-gradient-to-br from-gray-200 to-gray-300 
                                                                        flex items-center justify-center 
                                                                        text-gray-700 font-bold text-lg
                                                                        border border-gray-300">
                                                                {((employee.FirstName[0] ?? "") + (employee.LastName[0] ?? "")).toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <div className="font-medium text-gray-800">{employee.FullName}</div>
                                                                <div className="text-xs text-gray-500   ">{employee.Designation} | {employee.PersonalMobileNumber}</div>


                                                            </div>

                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "Bank Details" && (
                                <div className="space-y-4">
                                    {projectWithBankDetailsList.length === 0 ? (
                                        <div className="text-sm text-gray-500 p-4">No Bank Details found.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {projectWithBankDetailsList.map((projectWithBankDetails) => (
                                                <div key={projectWithBankDetails.ProjectWithBankDetailsId} className="border border-gray-200 p-3 rounded bg-white flex justify-between">

                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <FieldItem label="Account Holder" value={projectWithBankDetails.BeneficiaryAccountHolderName} isRow withBorder={true} />
                                                            <FieldItem label="Account Number" value={projectWithBankDetails.AccountNumber} isRow withBorder={true} className='font-medium text-blue-900 ' />
                                                            <FieldItem label="Bank" value={projectWithBankDetails.BankName} isRow withBorder={true} />

                                                            <FieldItem label="Branch" value={projectWithBankDetails.Branch} isRow withBorder={true} />
                                                            <FieldItem label="Account Type" value={projectWithBankDetails.AcType} isRow withBorder={true} className='font-medium text-blue-900 ' />
                                                            <FieldItem label="IFSC" value={projectWithBankDetails.IFSCCode} isRow withBorder={true} />

                                                        </div>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "Company" && (
                                <div className="space-y-4">
                                    {compantMasterList.length === 0 ? (
                                        <div className="text-sm text-gray-500 p-4">No Company found.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {compantMasterList.map((company) => (
                                                <div key={company.CompanyId} className="border border-gray-200 p-3 rounded bg-white flex justify-between">

                                                    <div className="flex items-center gap-4">

                                                        <div>
                                                            <div className="font-medium text-gray-800">{company.CompanyName}</div>
                                                            <div className="text-xs text-gray-500">{company.CompanyType} | {company.MobileNumber}</div>
                                                        </div>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default ViewProjectMaster;
