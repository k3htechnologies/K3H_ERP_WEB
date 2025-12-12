import React, { useEffect, useRef, useState } from 'react'
import useToast from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils/apiLoaderHelper';
import type { EmployeeMasterData, FilterWithPaginationEmployeeMasterRequest } from '@/features/employeeMaster/models/EmployeeMasterModel';
import * as E from 'fp-ts/Either';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';
import { Loader } from '@/core/utils/loader';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/forms';
import { ChevronLeft, MoveLeftIcon } from 'lucide-react';
import { COLORS } from '@/core/constants';

export const Profile: React.FC = () => {

    //#region STATE MANAGEMENT
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');

    // TOAST
    const { addToast } = useToast()

    //#endregion

    //#region NAVIGATE PREVIOUS PAGE
    const navigate = useNavigate() // ✅ initialize router navigate

    //#region INITIALIZATION

    const hasFetchedInitialEmployee = useRef(false)

    useEffect(() => {

        if (hasFetchedInitialEmployee.current) return

        hasFetchedInitialEmployee.current = true;

        fetchEmployeeList()
    }, [])
    //#endregion

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 

    const fetchEmployeeList = async () => {
        return loadEmployee()
    }

    const loadEmployee = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const filterParams: FilterWithPaginationEmployeeMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsCheckPermission: false,
                    EmployeeId: Number(LocalStorageHelper.getStoredEmployeeData()?.EmployeeId)
                }

                const response = await employeeMasterService.apiCallPullEmployeeMaster(filterParams);

                if (E.isRight(response)) {

                    const employeeList = Array.isArray(response.right.Data) ? response.right.Data : []

                    setEmployeeMasterList(employeeList);
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
            'Loading Employee'
        )
    }

    //#endregion

    const employeeData = employeeMasterList.length > 0 ? employeeMasterList[0] : null

    const safe = (value?: any) => (value === null || value === undefined || value === '' ? '-' : value)

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
                <div className="flex items-center gap-2">

                    <Button
                        type="button"
                        onClick={() => navigate(-1)}
                        color='transparent'
                        size='sm'
                        style={{backgroundColor:COLORS.primary,height:16,width:5}}
                        leftIcon={<ChevronLeft/>}
                    >
                       
                    </Button>

                    <h2 className="text-lg font-semibold text-gray-900 pl-3">
                        Profile Details
                    </h2>
                </div>
                {/* Loader */}
                <Loader loading={isLoading} title={loadingMessage}>
                    <div />
                </Loader>

                {!isLoading && employeeData && (
                    <>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                            <div className="lg:col-span-2 space-y-6">

                                {/* ================== BASIC DETAILS ================== */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Basic Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="First Name" value={safe(employeeData.FirstName)} />
                                                <FieldItem label="Middle Name" value={safe(employeeData.MiddleName)} />
                                                <FieldItem label="Last Name" value={safe(employeeData.LastName)} />
                                            </div>
                                        </div>


                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Gender" value={safe(employeeData.Gender)} />
                                                <FieldItem label="Marital Status" value={safe(employeeData.MaritalStatus)} />
                                                <FieldItem label="Blood Group" value={safe(employeeData.BloodGroup)} />
                                            </div>
                                        </div>


                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(safe(employeeData.DateOfBirth))} />
                                                <FieldItem label="Email ID" value={safe(employeeData.EmailId)} />
                                                <FieldItem label="Personal Mobile No." value={safe(employeeData.PersonalMobileNumber)} />
                                            </div>
                                        </div>

                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem
                                                    label="Communication Address"
                                                    value={safe(employeeData.CommunicationAddress)}
                                                />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-3  pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem
                                                    label="Permanent Address"
                                                    value={safe(employeeData.PermanentAddress)}
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
                                                <FieldItem label="Company Name" value={safe(employeeData.CompanyName)} />
                                                <FieldItem label="Branch" value={safe(employeeData.Branch)} />
                                                <FieldItem label="Department" value={safe(employeeData.Department)} />

                                            </div>
                                        </div>
                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Designation" value={safe(employeeData.Designation)} />
                                                <FieldItem
                                                    label="Joining Date"
                                                    value={formatDate_dd_MonthName_yy(safe(employeeData.JoiningDate))}
                                                />
                                                <FieldItem label="Reporting Person" value={safe(employeeData.ReportPersonName)} />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Employment Type" value={safe(employeeData.EmployeeType)} />

                                                <FieldItem label="Office Number" value={safe(employeeData.OfficeMobileNumber)} />
                                                <FieldItem label="Office E-mail ID" value={safe(employeeData.OfficeEmailId)} />
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

                                                <FieldItem label="Country" value={safe(employeeData.CountryName)} />
                                                <FieldItem label="State" value={safe(employeeData.StateName)} />

                                            </div>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                <FieldItem label="District" value={safe(employeeData.DistrictName)} />
                                                <FieldItem label="City" value={safe(employeeData.CityName)} />
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
                                                <FieldItem label="Bank Name" value={safe(employeeData.BankName)} />
                                                <FieldItem label="Account Number" value={safe(employeeData.AccountNo)} />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                <FieldItem label="Bank Branch Name" value={safe(employeeData.BankBranchName)} />
                                                <FieldItem label="IFSC Code" value={safe(employeeData.IFSCCode)} />
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
                                                <FieldItem label="Created By" value={safe(employeeData.CreatedBy)} />
                                                <FieldItem
                                                    label="Created Date"
                                                    value={formatDate_dd_MonthName_yy(safe(employeeData.CreatedDate))}
                                                />
                                            </div>
                                        </div>
                                        <div className="lg:col-span-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                <FieldItem label="Modified By" value={safe(employeeData.ModifiedBy)} />
                                                <FieldItem
                                                    label="Modified Date"
                                                    value={formatDate_dd_MonthName_yy_hh_mm(safe(employeeData.ModifiedDate))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            </div>

                            {/* ================== RIGHT SIDE (1/3 WIDTH) ================== */}
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

                            </div>

                        </div>
                    </>
                )}

            </div>
        </div>
    )
}

export default Profile
