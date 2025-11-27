import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { EmployeeMasterData } from '../models/EmployeeMasterModel';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import Accordion from '@/ui/components/Card/Accordion';
import { Tabs } from '@/ui/components/Tab/Tab';
import { runApiWithLoader } from '@/core/utils';
import type { AssetMappingMasterData, FilterWithPaginationAssetMappingMasterRequest } from '@/features/assetMappingMaster/models/AssetMappingMasterModel';
import { assetMappingMasterService } from '@/features/assetMappingMaster/services/AssetMappingMasterService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';

export const ViewEmployeeMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [assetMappingMasterList, setAssetMappingMasterList] = useState<AssetMappingMasterData[]>([]);
    const [projectList, setProjectList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    // TOAST
    const { addToast } = useToast();

    //LOCATION
    const navigate = useNavigate();
    const location = useLocation() as {
        state?: {
            editEmployeeMasterData?: EmployeeMasterData | null;
            fromList?: boolean;
            listState?: {
                page: number;
                filters: any;
            };
        };
    };

    //#endregion
    //#region Get EMPLOYEE DATA FROM LOCATION STATE
    const editEmployeeData = (location.state?.editEmployeeMasterData ?? null) as EmployeeMasterData | null;
    //#endregion
    //#region TAB ACTIVITY
    const TabList = [
        { id: "Project", label: "Project" },
        { id: "Assets", label: "Assets" },
    ];

    const [activeTab, setActiveTab] = useState<string>(TabList[0].id);

    //#endregion
    //#region INIT
    useEffect(() => {
        if (activeTab === 'Assets') {
            loadAssetMasterMapping(editEmployeeData!.FullName.trim());
        }
        else if (activeTab === 'Project') {
            const stored = LocalStorageHelper.getStoredEmployeeData();
            setProjectList(stored?.ProjectData || []);
        }

    }, [activeTab]);

    //#endregion
    //#region DATA LOAD

    const loadAssetMasterMapping = async (FullName: string) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationAssetMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    EmployeeName: FullName
                };

                const response = await assetMappingMasterService.apiCallPullAssetMappingMaster(params);

                if (E.isRight(response)) {

                    setAssetMappingMasterList(response.right.Data);

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
            'Loading Asset'
        );
    };

    //#endregion 
    //#region EDIT EMPLOYEE

    const handleEditEmployee = (row: EmployeeMasterData) => {
        navigate(`/employeeMaster/add/${row.EmployeeId}`); // assuming EmployeeId is the identifier

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


                        <div className="pt-10 px-2 pb-2">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900">{editEmployeeData?.FullName} <span className="inline-block ml-2 text-green-500">●</span></h3>
                                <div className="mt-2 flex justify-center gap-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{editEmployeeData?.Designation}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{editEmployeeData?.Department}</span>
                                </div>
                            </div>


                            {/* Basic Info box */}
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Basic information
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Mobile Number" value={editEmployeeData!.PersonalMobileNumber} isRow />
                                    <FieldItem label="Email ID" value={editEmployeeData!.EmailId} isRow />
                                    <FieldItem label="Gender" value={editEmployeeData!.Gender} isRow />
                                    <FieldItem label="DOB"
                                        value={editEmployeeData!.DateOfBirth ? formatDate_dd_MonthName_yy(editEmployeeData!.DateOfBirth) : ''}
                                        isRow
                                    />

                                    <FieldItem
                                        label="Joining Date"
                                        value={editEmployeeData!.JoiningDate ? formatDate_dd_MonthName_yy(editEmployeeData!.JoiningDate) : ''}
                                        isRow
                                    />
                                    <FieldItem label="Reporting Person" value={editEmployeeData!.ReportPersonName} isRow />

                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleEditEmployee(editEmployeeData!)
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
                            {/* Personal Information */}
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Personal Information
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Marital Status" value={editEmployeeData!.MaritalStatus} isRow />
                                    <FieldItem label="Blood Group" value={editEmployeeData!.BloodGroup} isRow />
                                    <FieldItem label="Office Email ID" value={editEmployeeData!.OfficeEmailId} isRow />
                                    <FieldItem label="Office Mobile Number" value={editEmployeeData!.OfficeMobileNumber} isRow />
                                    <FieldItem label="Employment Type" value={editEmployeeData!.EmployeeType} isRow />

                                </div>
                            </div>

                            {/* Emergency contact */}
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Emergency Contact Details
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Relationship" value={editEmployeeData!.EmergencyContactPersonRelationship} isRow />
                                    <FieldItem label="Contact Number" value={editEmployeeData!.EmergencyMobileNumber} isRow />
                                </div>
                            </div>

                            {/* ADDRESS */}
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Address Details
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem
                                        label="Communication Address"
                                        value={editEmployeeData!.CommunicationAddress}
                                        isRow={false}
                                    />
                                    <FieldItem
                                        label="Permanent Address"
                                        value={editEmployeeData!.PermanentAddress}
                                        isRow={false}
                                    />

                                    <FieldItem label="Country" value={editEmployeeData!.CountryName} isRow />
                                    <FieldItem label="State" value={editEmployeeData!.StateName} isRow />
                                    <FieldItem label="District" value={editEmployeeData!.DistrictName} isRow />
                                    <FieldItem label="City" value={editEmployeeData!.CityName} isRow />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right column: details and accordions */}
                <div className="col-span-7 space-y-4">

                    <div className="grid grid-cols-1 gap-4">

                        <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                            <h4 className="font-semibold mb-3">Bank Information</h4>

                            <FieldItem label="Bank Name" value={editEmployeeData!.BankName} isRow withBorder />
                            <FieldItem label="Branch" value={editEmployeeData!.Branch} isRow withBorder />
                            <FieldItem label="Account No" value={editEmployeeData!.AccountNo} isRow withBorder />
                            <FieldItem label="IFSC Code" value={editEmployeeData!.IFSCCode} isRow withBorder />
                        </div>
                    </div>

                    {/* accordion cards */}
                    <div className="space-y-3">
                        <Accordion
                            items={[
                                {
                                    key: "family",
                                    title: "Family Information",
                                    defaultOpen: false,
                                    content: (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <FieldItem label="Bank Name" value={editEmployeeData!.BankName} />
                                            <FieldItem label="Branch" value={editEmployeeData!.Branch} />
                                            <FieldItem label="Account No" value={editEmployeeData!.AccountNo} />
                                            <FieldItem label="IFSC Code" value={editEmployeeData!.IFSCCode} />
                                        </div>
                                    )
                                },
                                {
                                    key: "education",
                                    title: "Education Details",
                                    content: (
                                        <div>

                                        </div>
                                    )
                                },
                                {
                                    key: "experience",
                                    title: "Experience",
                                    content: (
                                        <div>

                                        </div>
                                    )
                                },
                                {
                                    key: "document",
                                    title: "Document",
                                    content: (
                                        <div>

                                        </div>
                                    )
                                }
                            ]}
                        />

                    </div>

                    {/* Projects & Assets tabs */}
                    <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
                        <Tabs
                            tabs={TabList}
                            defaultActive={activeTab}
                            onTabChange={(t) => {
                                setActiveTab(t.id);
                                if (t.id === "Assets") {
                                    loadAssetMasterMapping(editEmployeeData!.FullName);
                                }
                                else if (t.id === "Project") {

                                    const stored = LocalStorageHelper.getStoredEmployeeData();
                                    setProjectList(stored?.ProjectData || []);
                                }
                            }}
                        />

                        <div className="mt-1">
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

                        </div>
                    </div>

                </div>
            </div>

        </div >
    );
};

export default ViewEmployeeMaster;
