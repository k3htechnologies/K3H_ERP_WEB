import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { CompanyMasterData } from "@/features/companyMaster/models/CompanyMasterModel";
import { Loader } from "@/core/utils/loader";
import { Button } from "@/ui/components/forms";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { CollapseCard } from "@/ui/components/Card/CollapseCard";

export const ViewCompantMaster: React.FC = () => {
    //#region STATE MANAGEMENT
    const [isLoading] = useState(false);
    const [loadingMessage] = useState('');

    //LOCATION
    const navigate = useNavigate();

    const location = useLocation() as {
        state?: {
            editCompanyMasterData?: CompanyMasterData | null;
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
    //#region Get COMPANY DATA FROM LOCATION STATE
    const editCompanyData = (location.state?.editCompanyMasterData ?? null) as CompanyMasterData | null;
    //#endregion

    //#region EDIT COMPANY

    const handleEditEmployee = (row: CompanyMasterData) => {
        if (!row?.CompanyId) return;
        navigate(`/companyMaster/add/${row.CompanyId}`, {
            state: {
                editCompanyMasterData: row,
                fromList: true,
                listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };


    //#endregion

    //#region BACK COMPANY EMASTER PAGE
    const handleBackToListCompanyMaster = () => {
        navigate('/companyMaster', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
        });
    };
    //#endregion
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            {!editCompanyData ? (
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Company Details</h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleBackToListCompanyMaster}
                                className="px-3 py-1.5 rounded border text-sm"
                            >
                                Back
                            </button>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500">No company data provided.</div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start md:items-center justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold truncate">{editCompanyData.CompanyName || 'Company'}</h1>
                            <div className="mt-1 text-sm text-gray-500">{editCompanyData.CompanyType || '-'}</div>
                        </div>

                        <div className="flex gap-2 items-center">
                            <Button
                                type="button"
                                color="transparent"
                                variant="transparent_border"
                                size="sm"
                                onClick={handleBackToListCompanyMaster}
                            >
                                Back
                            </Button>

                            <Button
                                type="button"
                                color="blue"
                                size="sm"
                                onClick={() => handleEditEmployee(editCompanyData)}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Quick meta */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <FieldItem label="Contact Person" value={editCompanyData!.ContactPerson || '-'} isRow={false} />
                        </div>

                        <div>
                            <FieldItem label="Mobile Number" value={editCompanyData!.MobileNumber || '-'} isRow={false} />
                        </div>

                        <div>
                            <FieldItem label="Email" value={editCompanyData!.EmailId || '-'} isRow={false} />
                        </div>
                    </div>

                    {/* Main grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <div className="space-y-4">

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        General
                                    </h4>
                                </div>


                                <div className="p-4">

                                    <FieldItem label="PAN Number" value={editCompanyData?.PANNumber ?? '-'} urls={editCompanyData?.PanCardURL} isRow withBorder />
                                    <FieldItem label="GST Number" value={editCompanyData?.GSTNumber ?? '-'} urls={editCompanyData?.GSTCertificateURL} isRow withBorder />
                                    <FieldItem label="CIN Number" value={editCompanyData?.CINNumber ?? '-'} urls={editCompanyData?.CINURL} isRow withBorder />
                                    <FieldItem label="RERA Number" value={editCompanyData?.RERANumber ?? '-'} isRow withBorder />

                                    <FieldItem
                                        label="Company Letter Head"
                                        value={editCompanyData?.CompanyLetterheadHeaderURL !== "" ? "Company Letter Head" : "-"}
                                        urls={editCompanyData?.CompanyLetterheadHeaderURL}
                                        isRow
                                        withBorder
                                    />

                                    <FieldItem
                                        label="Company Letter Footer"
                                        value={editCompanyData?.CompanyLetterheadFooterURL !== "" ? "Company Letter Footer" : "-"}
                                        urls={editCompanyData?.CompanyLetterheadFooterURL}
                                        isRow

                                    />

                                </div>
                            </div>

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Address
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Country" value={editCompanyData?.CountryName ?? '-'} isRow withBorder />
                                    <FieldItem label="State" value={editCompanyData?.StateName ?? '-'} isRow withBorder />
                                    <FieldItem label="District" value={editCompanyData?.DistrictName ?? '-'} isRow withBorder />
                                    <FieldItem label="City" value={editCompanyData?.CityName ?? '-'} isRow />
                                </div>
                            </div>

                        </div>

                        {/* Right: Meta & Partners */}
                        <div className="space-y-4">

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Contact & Meta
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Contact Person" value={editCompanyData?.ContactPerson ?? '-'} isRow withBorder />
                                    <FieldItem label="Mobile Number" value={editCompanyData?.MobileNumber ?? '-'} isRow withBorder />
                                    <FieldItem label="Email" value={editCompanyData?.EmailId ?? '-'} isRow withBorder />
                                    <FieldItem label="Landline" value={editCompanyData?.LandLineNumber ?? '-'} isRow />

                                </div>
                            </div>
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Action Details
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Created By" value={editCompanyData?.CreatedBy ?? '-'} isRow withBorder />
                                    <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy(editCompanyData?.CreatedDate ?? '-')} isRow withBorder />
                                    <FieldItem label="Modified By" value={editCompanyData?.ModifiedBy ?? '-'} isRow withBorder />
                                    <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy(editCompanyData?.ModifiedDate ?? '-')} isRow />
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="mt-6 rounded border border-gray-200">

                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-800">
                                Partners ({editCompanyData.CompanyPartnerData.length ?? 0})
                            </h4>
                        </div>
                        {editCompanyData.CompanyPartnerData && editCompanyData.CompanyPartnerData.length > 0 ? (
                            <div className="p-4">
                                {editCompanyData.CompanyPartnerData.map((partner, idx) => (
                                    <CollapseCard
                                        key={partner.CompanyPartnerId ?? idx}
                                        name={partner.FullName || partner.FirstName || '-'}
                                        mobileNumber={partner.MobileNumber || '-'}
                                        partnershipPercent={partner.PartnerPercentage ?? '-'}
                                        gender={partner.Gender || '-'}
                                        defaultOpen={false}
                                    >

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(partner.DateOfBirth || '-')} isRow={false} withBorder={false} />
                                            <FieldItem label="Email" value={partner.EmailId} isRow={false} withBorder={false} />
                                            <FieldItem label="Pan Number" value={partner.PanNumber} isRow={false} withBorder={false} />
                                            <FieldItem label="Aadhar Card" value={partner.AadharCardNumber} isRow={false} withBorder={false} />
                                        </div>
                                    </CollapseCard>
                                ))}
                            </div>
                        )

                            :
                            <div className="flex flex-col items-center justify-center text-center">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                                    alt="No Data"
                                    className="w-32 h-32 opacity-80"
                                />
                                <p className="mt-4 text-gray-600 text-sm">
                                    {"No Partner Data Found"}
                                </p>
                            </div>}

                    </div>
                </div>
            )}

        </div >
    );
};

export default ViewCompantMaster;