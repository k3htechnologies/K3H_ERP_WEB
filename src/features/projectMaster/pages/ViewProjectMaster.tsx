import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Tabs } from '@/ui/components/Tab/Tab';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { ProjectMasterData } from '../models/ProjectMasterModel';

export const ViewProjectMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [isLoading] = useState(false);
    const [loadingMessage] = useState('');

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
    const editProjectMasterData = (location.state?.editProjectMasterData ?? null) as ProjectMasterData | null;

    //TAB ACTIVITY
    const TabList = [
        { id: "Employee", label: "Employee" },
        { id: "Bank Details", label: "Bank Details" },
        { id: "Company", label: "Company" },
        { id: "Set Approval", label: "Set Approval" },
    ];

    const [activeTab, setActiveTab] = useState<string>(TabList[0].id);

    //#endregion
    //#region INIT
    useEffect(() => {
        if (activeTab === 'Employee') {
        }
        else if (activeTab === 'Bank Details') {
        }
        else if (activeTab === 'Company') {
        }

    }, [activeTab]);

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


                        <div className="pt-10 px-6 pb-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900">{editProjectMasterData?.ProjectName} <span className="inline-block ml-2 text-green-500">●</span></h3>
                                <div className="mt-2 flex justify-center gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{editProjectMasterData?.CTSNumber}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{editProjectMasterData?.CityName}</span>
                                </div>
                            </div>


                            <div className="mt-6 rounded">
                                <h4 className="font-semibold text-sm text-gray-800 mb-3">Project Identification</h4>
                                <FieldItem label="Project Name" value={editProjectMasterData!.ProjectName} isRow />
                                <FieldItem label="CTS Number" value={editProjectMasterData!.CTSNumber} isRow />
                                <FieldItem label="Project Location" value={editProjectMasterData!.ProjectLocation} isRow />
                                <FieldItem label="Business Category" value={editProjectMasterData!.BussinessCategory} isRow />
                                <FieldItem label="Project Status" value={editProjectMasterData!.ProjectStatus} isRow />
                                <FieldItem label="Is Redevelopment" value={editProjectMasterData!.IsRedevelopment ? 'Yes' : 'No'} isRow />


                            </div>

                            <div className="mt-4 flex gap-3">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleEditProjectMaster(editProjectMasterData!)
                                    }}
                                    color='blue'
                                    fullWidth
                                    size='sm'
                                    title="Edit Info">
                                    <Edit className="w-4 h-4" /> Edit Info
                                </Button>
                                <Button onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    navigate(-1);

                                }}
                                    color='transparent'
                                    variant='transparent_border'
                                    fullWidth
                                    size='sm'
                                    title="Back">
                                    <ArrowLeft className="w-4 h-4" />  Cancel
                                </Button>
                            </div>
                            <div className="mt-6 rounded">
                                <h4 className="font-semibold text-sm text-gray-800 mb-3">Location Details</h4>

                                <FieldItem label="Country" value={editProjectMasterData!.CountryName} isRow />
                                <FieldItem label="State" value={editProjectMasterData!.StateName} isRow />
                                <FieldItem label="District" value={editProjectMasterData!.DistrictName} isRow />
                                <FieldItem label="City" value={editProjectMasterData!.CityName} isRow />
                                <FieldItem label="PIN Code" value={editProjectMasterData!.ZipCode} isRow />
                            </div>

                            <div className="mt-6 rounded">
                                <h4 className="font-semibold text-sm text-gray-800 mb-3">Project Documentation</h4>
                                <FieldItem label="RERA Number" value={editProjectMasterData!.RERANumber} isRow />
                                <FieldItem label="RERA Certificate Date" value={editProjectMasterData!.RERACertificateDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.RERACertificateDate) : '-'} isRow />
                                <FieldItem label="RERA Completion Date" value={editProjectMasterData!.RERAComplitionDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.RERAComplitionDate) : '-'} isRow />
                            </div>
                            <div className="mt-6 rounded">
                                <h4 className="font-semibold text-sm text-gray-800 mb-3">Project Financials</h4>
                                <FieldItem label="Project Estimate Cost" value={editProjectMasterData!.ProjectEstimateCost?.toString() || '-'} isRow />
                                <FieldItem label="On Going Budget Cost" value={editProjectMasterData!.OnGoingBudgetCost || '-'} isRow />
                                <FieldItem label="Project Area in Sqft" value={editProjectMasterData!.ProjectAreaInSqft || '-'} isRow />
                            </div>
                            <div className="mt-6 rounded">
                                <h4 className="font-semibold text-sm text-gray-800 mb-3">Project TimeLine</h4>
                                <FieldItem label="Survey Date" value={editProjectMasterData!.SurveyDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.SurveyDate) : '-'} isRow />
                                <FieldItem label="Expected Start Date" value={editProjectMasterData!.ExpectedStartDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.ExpectedStartDate) : '-'} isRow />
                                <FieldItem label="Execution Start Date" value={editProjectMasterData!.ExecutionStartDate ? formatDate_dd_MonthName_yy(editProjectMasterData!.ExecutionStartDate) : '-'} isRow />
                            </div>
                            <div className="mt-6 rounded">
                                <h4 className="font-semibold text-sm text-gray-800 mb-3">Contact Information</h4>
                                <FieldItem label="Site Contact Name" value={editProjectMasterData!.SiteContactName} isRow />
                                <FieldItem label="Site Contact Mobile Number" value={editProjectMasterData!.SiteContactMobileNumber} isRow />
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
                                if (t.id === "Assets") {
                                    // loadAssetMasterMapping(editEmployeeData!.FullName);
                                }
                                else if (t.id === "Project") {

                                    // const stored = LocalStorageHelper.getStoredEmployeeData();
                                    // setProjectList(stored?.ProjectData || []);
                                }
                            }}
                        />

                        {/* <div className="mt-4">
                            {activeTab === 'Assets' && (
                                <div className="space-y-4">
                                    {assetMappingMasterList.length === 0 ? (
                                        <div className="text-sm text-gray-500 p-4">No assets found.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {assetMappingMasterList.map((asset) => {

                                                return (
                                                    <div key={asset!.AssetMasterMappingId} className="flex items-center justify-between border border-gray-200 rounded p-3 bg-white">
                                                        <div className="flex items-center gap-4">

                                                            <div>
                                                                <div className="font-semibold text-gray-800">{asset.AssetName} {asset.AssetModel}</div>
                                                                {`Assigned on ${formatDate_dd_MonthName_yy(asset.AssignedDate ?? '-')}`}
                                                                <div className="">{`Purchased on ${formatDate_dd_MonthName_yy(asset.PurchaseDate ?? '-')}`}</div>
                                                                <div className="">{`Supplier Name on ${asset.SupplierName ?? '-'}`}</div>

                                                            </div>

                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="text-xs text-gray-400 text-right">
                                                                <div className="text-xs text-gray-500">Serial Number</div>
                                                                <div className="font-medium text-sm">{asset.SerialNumber}</div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "Project" && (
                                <div className="space-y-4">
                                    {projectList.length === 0 ? (
                                        <div className="text-sm text-gray-500 p-4">No projects found.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {projectList.map((project) => (
                                                <div key={project.ProjectId} className="border border-gray-200 p-3 rounded bg-white flex justify-between">

                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden">
                                                            <img
                                                                src={project.ProjectPhotoURL}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        <div>
                                                            <div className="font-semibold">{project.ProjectName}</div>
                                                            <div className="text-xs text-gray-500">{project.ProjectLocation}</div>
                                                        </div>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div> */}
                    </div>

                </div>
            </div>

        </div >
    );
};

export default ViewProjectMaster;
