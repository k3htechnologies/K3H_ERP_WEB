import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { CompanyMasterData } from "@/features/companyMaster/models/CompanyMasterModel";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { CollapseCard } from "@/ui/components/Card/CollapseCard";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

export const ViewCompantMaster: React.FC = () => {
    //#region STATE MANAGEMENT
    const [isLoading] = useState(false);
    const [loadingMessage] = useState('');

    const { canAction } = useMenuPermissions('/companyMaster');

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

    const handleEditCompany = (row: CompanyMasterData) => {
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
            {/* Header */}
            <HeaderActionBar
                titleText={'Company Details'}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListCompanyMaster()}
                canAction={canAction}
                onEdit={() => {

                    if (editCompanyData) handleEditCompany(editCompanyData);

                }}
                isLoading={isLoading}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                {/* ================= LEFT (2/3 WIDTH) ================= */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ================= BASIC DETAILS ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Basic Information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem label="Company Name" value={editCompanyData?.CompanyName ?? '-'} />
                            <FieldItem label="Company Type" value={editCompanyData?.CompanyType ?? '-'} />
                            <FieldItem label="Contact Person" value={editCompanyData?.ContactPerson ?? '-'} />
                            <FieldItem label="Mobile Number" value={editCompanyData?.MobileNumber ?? '-'} />
                            <FieldItem label="Email" value={editCompanyData?.EmailId ?? '-'} />
                            <FieldItem label="Landline" value={editCompanyData?.LandLineNumber ?? '-'} />
                        </div>
                    </section>

                    {/* ================= GENERAL / REGISTRATION ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Registration & Compliance
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem label="PAN Number" value={editCompanyData?.PANNumber ?? '-'} urls={editCompanyData?.PanCardURL} isIcon/>
                            <FieldItem label="GST Number" value={editCompanyData?.GSTNumber ?? '-'} urls={editCompanyData?.GSTCertificateURL} isIcon />
                            <FieldItem label="CIN Number" value={editCompanyData?.CINNumber ?? '-'} urls={editCompanyData?.CINURL} isIcon />
                            <FieldItem label="RERA Number" value={editCompanyData?.RERANumber ?? '-'} />

                            <FieldItem
                                label="Company Letter Head"
                                value={editCompanyData?.CompanyLetterheadHeaderURL ? 'View Letter Head' : '-'}
                                urls={editCompanyData?.CompanyLetterheadHeaderURL} isIcon
                            />

                            <FieldItem
                                label="Company Letter Footer"
                                value={editCompanyData?.CompanyLetterheadFooterURL ? 'View Letter Footer' : '-'}
                                urls={editCompanyData?.CompanyLetterheadFooterURL} isIcon
                            />
                        </div>
                    </section>







                </div>

                {/* ================= RIGHT (1/3 WIDTH) ================= */}
                <div className="lg:col-span-1 space-y-6">


                    {/* ================= ADDRESS ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Address Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem label="Country" value={editCompanyData?.CountryName ?? '-'} />
                            <FieldItem label="State" value={editCompanyData?.StateName ?? '-'} />
                            <FieldItem label="District" value={editCompanyData?.DistrictName ?? '-'} />
                            <FieldItem label="City" value={editCompanyData?.CityName ?? '-'} />
                        </div>
                    </section>

                    {/* ================= ACTION DETAILS ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Action Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem label="Created By" value={editCompanyData?.CreatedBy ?? '-'} />
                            <FieldItem
                                label="Created Date"
                                value={formatDate_dd_MonthName_yy(editCompanyData?.CreatedDate ?? '-')}
                            />
                            <FieldItem label="Modified By" value={editCompanyData?.ModifiedBy ?? '-'} />
                            <FieldItem
                                label="Modified Date"
                                value={formatDate_dd_MonthName_yy(editCompanyData?.ModifiedDate ?? '-')}
                            />
                        </div>
                    </section>

                </div>

            </div>

            <div className="lg:col-span-1 space-y-6 pt-5">
                {/* ================= PARTNERS ================= */}
                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Partners ({editCompanyData?.CompanyPartnerData?.length ?? 0})
                    </h4>

                    {editCompanyData?.CompanyPartnerData?.length ? (
                        <div className="space-y-3">
                            {editCompanyData.CompanyPartnerData.map((partner, idx) => (
                                <CollapseCard
                                    key={partner.CompanyPartnerId ?? idx}
                                    name={partner.FullName || partner.FirstName || '-'}
                                    mobileNumber={partner.MobileNumber || '-'}
                                    partnershipPercent={partner.PartnerPercentage ?? '-'}
                                    gender={partner.Gender || '-'}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(partner.DateOfBirth ?? '-')} />
                                        <FieldItem label="Email" value={partner.EmailId ?? '-'} />
                                        <FieldItem label="PAN Number" value={partner.PanNumber ?? '-'} />
                                        <FieldItem label="Aadhar Card" value={partner.AadharCardNumber ?? '-'} />
                                    </div>
                                </CollapseCard>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-10">
                            <NoDataView message="No Partner Data Available" />
                        </div>
                    )}
                </section>

            </div >
        </div >
    );
};

export default ViewCompantMaster;