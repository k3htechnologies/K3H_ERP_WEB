import React, { useEffect, useRef, useState } from 'react'
import useToast from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils/apiLoaderHelper';
import type { EmployeeMasterData, FilterWithPaginationEmployeeMasterRequest } from '@/features/employeeMaster/models/EmployeeMasterModel';
import ToastContainer from '@/ui/components/Toast/ToastContainer';
import * as E from 'fp-ts/Either';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';
import { Loader } from '@/core/utils/loader';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { Button } from '@/ui/components/forms';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {

    //#region STATE MANAGEMENT
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');

    // TOAST
    const { toasts, removeToast, addToast } = useToast()

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
            'Loading Employee Data...'
        )
    }

    //#endregion

    const employeeData = employeeMasterList.length > 0 ? employeeMasterList[0] : null

    const safe = (value?: any) => (value === null || value === undefined || value === '' ? '-' : value)

    return (
        <>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

            {/* Main Scrollable Container with Bottom Padding */}
            <div className="relative h-full flex flex-col bg-gray-50 p-2 rounded-lg overflow-y-auto pb-1">

                {/* Loader */}

                <Loader loading={isLoading} title={loadingMessage}>
                    <div />
                </Loader>

                {!isLoading && employeeData && (
                    <>
                        {/* ================== BASIC DETAILS ================== */}
                        <section className="mb-4 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                Basic Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FieldItem label="First Name" value={safe(employeeData.FirstName)} />
                                <FieldItem label="Middle Name" value={safe(employeeData.MiddleName)} />
                                <FieldItem label="Last Name" value={safe(employeeData.LastName)} />
                                <FieldItem label="Gender" value={safe(employeeData.Gender)} />
                                <FieldItem label="Marital Status" value={safe(employeeData.MaritalStatus)} />
                                <FieldItem label="Blood Group" value={safe(employeeData.BloodGroup)} />
                                <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(safe(employeeData.DateOfBirth))} />
                                <FieldItem label="Office Email ID" value={safe(employeeData.OfficeEmailId)} />
                                <FieldItem label="Email ID" value={safe(employeeData.EmailId)} />
                                <FieldItem label="Personal Mobile" value={safe(employeeData.PersonalMobileNumber)} />
                                <FieldItem label="Office Mobile" value={safe(employeeData.OfficeMobileNumber)} />
                                <FieldItem label="Employment Type" value={safe(employeeData.EmployeeType)} />
                            </div>
                        </section>

                        {/* ================== EMPLOYEE INFO ================== */}
                        <section className="mb-4 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                Employee Info
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FieldItem label="Company Name" value={safe(employeeData.CompanyName)} />
                                <FieldItem label="Branch" value={safe(employeeData.Branch)} />
                                <FieldItem label="Department" value={safe(employeeData.Department)} />
                                <FieldItem label="Designation" value={safe(employeeData.Designation)} />
                                <FieldItem
                                    label="Joining Date"
                                    value={formatDate_dd_MonthName_yy(safe(employeeData.JoiningDate))}
                                />
                                <FieldItem label="Reporting Person" value={safe(employeeData.ReportPersonName)} />
                            </div>
                        </section>

                        {/* ================== ADDRESS ================== */}
                        <section className="mb-4 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                Address
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="md:col-span-2 lg:col-span-3">
                                    <FieldItem
                                        label="Communication Address"
                                        value={safe(employeeData.CommunicationAddress)}
                                    />
                                </div>

                                <div className="md:col-span-2 lg:col-span-3">
                                    <FieldItem
                                        label="Permanent Address"
                                        value={safe(employeeData.PermanentAddress)}
                                    />
                                </div>

                                <FieldItem label="Country" value={safe(employeeData.CountryName)} />
                                <FieldItem label="State" value={safe(employeeData.StateName)} />
                                <FieldItem label="District" value={safe(employeeData.DistrictName)} />
                                <FieldItem label="City" value={safe(employeeData.CityName)} />
                            </div>
                        </section>

                        {/* ================== BANK DETAILS ================== */}
                        <section className="mb-4 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                Bank Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FieldItem label="Bank Name" value={safe(employeeData.BankName)} />
                                <FieldItem label="Account Number" value={safe(employeeData.AccountNo)} />
                                <FieldItem label="Bank Branch Name" value={safe(employeeData.BankBranchName)} />
                                <FieldItem label="IFSC Code" value={safe(employeeData.IFSCCode)} />
                            </div>
                        </section>

                        {/* ================== ACTION DETAILS ================== */}
                        <section className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm mb-20">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                Action Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FieldItem label="Created By" value={safe(employeeData.CreatedBy)} />
                                <FieldItem
                                    label="Created Date"
                                    value={formatDate_dd_MonthName_yy(safe(employeeData.CreatedDate))}
                                />
                                <FieldItem label="Modified By" value={safe(employeeData.ModifiedBy)} />
                                <FieldItem
                                    label="Modified Date"
                                    value={formatDate_dd_MonthName_yy_hh_mm(safe(employeeData.ModifiedDate))}
                                />
                            </div>
                        </section>
                    </>
                )}

                {/* ✅ Fixed Bottom Close Button */}
                <div
                    className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2 flex justify-end shadow-md h-16"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    <Button onClick={() => navigate(-1)} size="md">
                        Close
                    </Button>
                </div>
            </div>
        </>
    )
}

export default Profile
