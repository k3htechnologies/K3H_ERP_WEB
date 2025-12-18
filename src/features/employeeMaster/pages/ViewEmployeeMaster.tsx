import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { EmployeeMasterData } from '../models/EmployeeMasterModel';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import Accordion from '@/ui/components/Card/Accordion';
import { Tabs } from '@/ui/components/Tab/Tab';
import { runApiWithLoader } from '@/core/utils';
import type { AssetMappingMasterData, FilterWithPaginationAssetMappingMasterRequest } from '@/features/assetMappingMaster/models/AssetMappingMasterModel';
import { assetMappingMasterService } from '@/features/assetMappingMaster/services/AssetMappingMasterService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';

export const ViewEmployeeMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [assetMappingMasterList, setAssetMappingMasterList] = useState<AssetMappingMasterData[]>([]);
    const [projectList, setProjectList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const { canAction } = useMenuPermissions('/employeeMaster');

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
                sortInfo?: any;
                searchTerm?: string;
            };
        };
    };
    const preservedListState = location.state?.listState;

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
            loadAssetMasterMapping(`${editEmployeeData!.FirstName.trim()} ${editEmployeeData!.LastName.trim()}`);
        }
        else if (activeTab === 'Project') {
            const stored = LocalStorageHelper.getStoredEmployeeData();
            setProjectList(stored?.ProjectData || []);
        }

    }, [activeTab]);

    //#endregion
    //#region DATA LOAD FOR ASSET MAPPING TO EACH EMPLOYEE

    const loadAssetMasterMapping = async (FullName: string) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationAssetMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    EmployeeName: FullName,

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
        if (!row?.EmployeeId) return;
        navigate(`/employeeMaster/add/${row.EmployeeId}`, {
            state: {
                editEmployeeMasterData: row,
                fromList: true,
                listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };


    //#endregion

    //#region BACK EMPLOYE EMASTER PAGE
    const handleBackToListEmployeeMaster = () => {
        navigate('/employeeMaster', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
        });
    };
    //#endregion

    const safe = (value?: any) => (value === null || value === undefined || value === '' ? '-' : value)

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            <HeaderActionBar
                titleText={'Employee Details'}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListEmployeeMaster()}
                canAction={canAction}
                onEdit={() => {

                    if (editEmployeeData) handleEditEmployee(editEmployeeData);

                }}
                isLoading={isLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                {/* ================= LEFT SIDE (2/3) ================= */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ================== BASIC DETAILS ================== */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Basic Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="First Name" value={safe(editEmployeeData!.FirstName)} />
                                    <FieldItem label="Middle Name" value={safe(editEmployeeData!.MiddleName)} />
                                    <FieldItem label="Last Name" value={safe(editEmployeeData!.LastName)} />
                                </div>
                            </div>


                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Gender" value={safe(editEmployeeData!.Gender)} />
                                    <FieldItem label="Marital Status" value={safe(editEmployeeData!.MaritalStatus)} />
                                    <FieldItem label="Blood Group" value={safe(editEmployeeData!.BloodGroup)} />
                                </div>
                            </div>


                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(safe(editEmployeeData!.DateOfBirth))} />
                                    <FieldItem label="Email ID" value={safe(editEmployeeData!.EmailId)} />
                                    <FieldItem label="Personal Mobile No." value={editEmployeeData?.PersonalMobileNumber
                                        ? `+91 ${safe(editEmployeeData?.PersonalMobileNumber)}`
                                        : '-'}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem
                                        label="Communication Address"
                                        value={safe(editEmployeeData!.CommunicationAddress)}
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-3  pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem
                                        label="Permanent Address"
                                        value={safe(editEmployeeData!.PermanentAddress)}
                                    />
                                </div>
                            </div>


                        </div>


                    </section>

                    {/* ================== EMPLOYEE INFO ================== */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Employee Infoformation
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Company Name" value={safe(editEmployeeData!.CompanyName)} />
                                    <FieldItem label="Branch" value={safe(editEmployeeData!.Branch)} />
                                    <FieldItem label="Department" value={safe(editEmployeeData!.Department)} />

                                </div>
                            </div>
                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Designation" value={safe(editEmployeeData!.Designation)} />
                                    <FieldItem
                                        label="Joining Date"
                                        value={formatDate_dd_MonthName_yy(safe(editEmployeeData!.JoiningDate))}
                                    />
                                    <FieldItem label="Reporting Person" value={safe(editEmployeeData!.ReportPersonName)} />
                                </div>
                            </div>
                            <div className="lg:col-span-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Employment Type" value={safe(editEmployeeData!.EmployeeType)} />

                                    <FieldItem label="Office Number" value={editEmployeeData?.OfficeMobileNumber
                                        ? `+91 ${safe(editEmployeeData?.OfficeMobileNumber)}`
                                        : '-'} />

                                    <FieldItem label="Office E-mail ID" value={safe(editEmployeeData!.OfficeEmailId)} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ================== ADDRESS ================== */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Address
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                    <FieldItem label="Country" value={safe(editEmployeeData!.CountryName)} />
                                    <FieldItem label="State" value={safe(editEmployeeData!.StateName)} />

                                </div>
                            </div>
                            <div className="lg:col-span-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="District" value={safe(editEmployeeData!.DistrictName)} />
                                    <FieldItem label="City" value={safe(editEmployeeData!.CityName)} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ================== BANK DETAILS ================== */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900  mb-4">
                            Bank Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Bank Name" value={safe(editEmployeeData!.BankName)} />
                                    <FieldItem label="Account Number" value={safe(editEmployeeData!.AccountNo)} />
                                </div>
                            </div>
                            <div className="lg:col-span-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Bank Branch Name" value={safe(editEmployeeData!.BankBranchName)} />
                                    <FieldItem label="IFSC Code" value={safe(editEmployeeData!.IFSCCode)} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ================== FAMILY DETAILS ================== */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Family Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            <div className="lg:col-span-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                    <FieldItem label="Relation to Emergency Contact" value={safe(editEmployeeData!.EmergencyContactPersonRelationship)} />
                                    <FieldItem
                                        label="Emergency Contact Number"
                                        value={
                                            editEmployeeData?.EmergencyMobileNumber
                                                ? `+91 ${safe(editEmployeeData?.EmergencyMobileNumber)}`
                                                : '-'
                                        }
                                    />


                                </div>
                            </div>

                        </div>
                    </section>
                    {/* ================== ACTION DETAILS ================== */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Action Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Created By" value={safe(editEmployeeData!.CreatedBy)} />
                                    <FieldItem
                                        label="Created Date"
                                        value={formatDate_dd_MonthName_yy(safe(editEmployeeData!.CreatedDate))}
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Modified By" value={safe(editEmployeeData!.ModifiedBy)} />
                                    <FieldItem
                                        label="Modified Date"
                                        value={formatDate_dd_MonthName_yy_hh_mm(safe(editEmployeeData!.ModifiedDate))}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* ================= RIGHT SIDE (1/3) ================= */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Reporting Structure example block */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                            Reporting Structure
                        </h4>
                        <div>Right Panel Data Here</div>
                    </section>

                    {/* Documents example block */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                            Documents
                        </h4>
                        <div>Documents Listing Here</div>
                    </section>

                    {/* ================= FAMILY / EDUCATION / EXPERIENCE ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <Accordion
                            items={[
                                { key: 'education', title: 'Education Details', content: <div /> },
                                { key: 'experience', title: 'Experience', content: <div /> },

                            ]}
                        />
                    </section>

                    {/* ================= PROJECTS & ASSETS ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <Tabs
                            tabs={TabList}
                            defaultActive={activeTab}
                            islarge={true}
                            onTabChange={(t) => {

                                setActiveTab(t.id);

                                if (t.id === "Assets") {

                                    loadAssetMasterMapping(`${editEmployeeData!.FirstName.trim()} ${editEmployeeData!.LastName.trim()}`);
                                }

                                else if (t.id === "Project") {

                                    const stored = LocalStorageHelper.getStoredEmployeeData();
                                    setProjectList(stored?.ProjectData || []);
                                }
                            }}
                        />
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
                    </section>

                </div>

            </div>


        </div >
    );
};

export default ViewEmployeeMaster;
