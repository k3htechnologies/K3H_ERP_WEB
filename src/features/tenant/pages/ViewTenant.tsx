import React, { useEffect, useMemo, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { TenantData } from '../models/TenantModel';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { ChevronLeft, Edit } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { COLORS } from '@/core/constants';

export const ViewTenant: React.FC = () => {

    //#region STATE MANAGEMENT
    const [isLoading] = useState(false);
    const [loadingMessage] = useState('');
    const [applicantList, setApplicantList] = useState<any[]>([]);
    const [parkingList, setParkingList] = useState<any[]>([]);


    //LOCATION
    const navigate = useNavigate();

    const location = useLocation() as {
        state?: {
            editTenantData?: TenantData | null;
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

    //#region Get TENANT DATA FROM LOCATION STATE
    const editTenantData = (location.state?.editTenantData ?? null) as TenantData | null;
    //#endregion

    //#region INIT
    useEffect(() => {
        setApplicantList(editTenantData?.TenantApplicantData || []);
        setParkingList(editTenantData?.ParkingData || []);
    }, []);

    //#endregion

    //#region EDIT TENANT

    const handleEditTenant = (row: TenantData) => {
        if (!row?.TenantId) return;
        navigate(`/tenant/add/${row.TenantId}`, {
            state: {
                editTenantData: row,
                fromList: true,
                listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };


    //#endregion

    //#region BACK TENANT  PAGE
    const handleBackToListTenant = () => {
        navigate('/tenant', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
        });
    };
    //#endregion

    //#region APPLICANT TABLE COLUMN
    const applicantColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'ApplicantName',
                label: 'Name',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.PhotoURL)}
                            title="Applicant Document"
                            triggerLabel={value || '-'}
                        />
                    );
                }
            },

            {
                key: 'ApplicantType',
                label: 'Type',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            },
            {
                key: 'ApplicantMobileNumber',
                label: 'Mobile Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            },
            {
                key: 'ApplicantEmailId',
                label: 'Email Id',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            },
            {
                key: 'AadharCardNumber',
                label: 'Aadhar',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.AadharCardURL)}
                            title="Aadhar Card Document"
                            triggerLabel={value || '-'}
                        />
                    );
                }
            },
            {
                key: 'PanNumber',
                label: 'PAN',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {

                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.PanCardURL)}
                            title="Pan Card Document"
                            triggerLabel={value || '-'}
                        />
                    );
                }
            },
            {
                key: 'PassportNumber',
                label: 'Passport',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.PassportURL)}
                            title="Passport Number Document"
                            triggerLabel={value || '-'}
                        />
                    );
                }
            },

            {
                key: 'DrivingLicenseNumber',
                label: 'Driving License',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.DrivingLicenseURL)}
                            title="Driving License Document"
                            triggerLabel={value || '-'}
                        />
                    );
                }
            },
            {
                key: 'VotingIdNumber',
                label: 'Voting',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.VotingIdNumber)}
                            title="Voting Id Document"
                            triggerLabel={value || '-'}
                        />
                    );
                }
            },
            {
                key: 'GSTNumber',
                label: 'GST',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.GSTNumber)}
                            title="GST Document"
                            triggerLabel={value || '-'}
                        />
                    );
                }
            },

            {
                key: 'BankName',
                label: 'Bank',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.ChequeURL)}
                            title="Cheque Document"
                            triggerLabel={value || '-'}
                        />
                    );
                }
            },

            {
                key: 'AccountNumber',
                label: 'Account Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            },
            {
                key: 'IFSCCode',
                label: 'IFSC',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            }


        ],
        []

    );
    //#endregion
    //#region PARKING TABLE COLUMN 
    const parkingColumns = useMemo<TableColumn[]>(
        () => [

            {
                key: 'ParkingNumber',
                label: 'Parking Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            }
        ],
        []

    );
    //#endregion


    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            <div className="flex items-center justify-between">


                <div className="flex items-center gap-2">

                    <Button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBackToListTenant();
                        }}
                        color="transparent"
                        size="sm"
                        style={{ backgroundColor: COLORS.primary, height: 16, width: 5 }}
                        leftIcon={<ChevronLeft />}
                    />

                    <h2 className="text-lg font-semibold text-gray-900 pl-3">
                        Tenant Details
                    </h2>
                </div>


                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (editTenantData) handleEditTenant(editTenantData);
                    }}
                    color="blue"
                    size="sm"
                    title="Edit Info"
                >
                    <Edit className="w-4 h-4" /> Edit Info
                </Button>

            </div>

            <div className="mt-6">
                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                        Basic information</h4>

                    <div className="pt-2">

                        <div className="w-full">
                            <DataTable
                                data={applicantList}
                                columns={applicantColumns}
                                emptyMessage="No applicants found"
                                fixedHeight={false}
                                recordsPerPage={20}
                                className="min-w-full"
                                aria-label="Applicant list"
                            />
                        </div>
                    </div>
                </section>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                <div className="lg:col-span-3 space-y-6">
                    {/* ================== BASIC DETAILS ================== */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Unit Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Wing" value={editTenantData?.Wing} />
                                    <FieldItem label="Floor" value={editTenantData?.Floor} />
                                    <FieldItem label="Unit Number" value={editTenantData?.FlatNumber} />
                                </div>
                            </div>


                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Unit Type" value={editTenantData?.FlatType} />
                                    <FieldItem label="Unit Configuration" value={editTenantData?.FlatConfiguration} />
                                    <FieldItem label="RERA Carpet Area (SqFt)" value={editTenantData?.RERACarpetAreaSqFt} />
                                </div>
                            </div>


                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Unit Facing" value={editTenantData?.Facing} />
                                    <FieldItem label="Free Area Offered (%)" value={editTenantData?.FreeAreaOfferedPercent} />
                                    <FieldItem label="Extra Area Purchased (SqFt)" value={editTenantData?.ExtraAreaPurchasedSqFt} />
                                </div>
                            </div>

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Total Area (SqFt)" value={editTenantData?.TotalAreaSqFt} />
                                </div>
                            </div>


                        </div>


                    </section>

                </div>
            </div>

            <div className="mt-6">
                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                        Parking Details</h4>

                    <div className="pt-2">

                        <div className="w-full">
                            <DataTable
                                data={parkingList}
                                columns={parkingColumns}
                                emptyMessage="No Parking Data found"
                                fixedHeight={false}
                                recordsPerPage={20}
                                className="min-w-full"
                                aria-label="Parking list"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ViewTenant;
