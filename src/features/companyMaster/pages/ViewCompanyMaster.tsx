import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { CompanyMasterData, CompanyMasterWithBankDetails, FilterWithPaginationCompanyMasterRequest, FilterWithPaginationCompanyMasterWithBankDetails } from "@/features/companyMaster/models/CompanyMasterModel";
import { useCompanyListState } from "@/features/companyMaster/context/CompanyListStateContext";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { CollapseCard } from "@/ui/components/Card/CollapseCard";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { companyMasterService } from "@/features/companyMaster/services/CompanyMasterService";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import Tabs from "@/ui/components/Tab/Tab";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";

export const ViewCompanyMaster: React.FC = () => {
    //#region STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [editCompanyData, setEditCompanyData] = useState<CompanyMasterData | null>(null);
    const [companyMasterWithBankDetailsList, setCompanyMasterWithBankDetailsList] = useState<CompanyMasterWithBankDetails[]>([]);

    const { canAction } = useMenuPermissions('/companyMaster');
    const { addToast } = useToast();

    //LOCATION
    const navigate = useNavigate();
    const { listState } = useCompanyListState();
    const companyName = listState.companyName || '';
    //#endregion

    const CompanyMasterTablist = [
        { id: "Overview", label: "Overview" },
        { id: "Bank Details", label: "Bank Details" }
    ]

    const [activeTab, setActiveTab] = useState<string>(CompanyMasterTablist[0].id);

    //#region INIT - Load Company Data
    useEffect(() => {

        if (listState.companyId) {
            loadCompany();
        }
    }, [listState.companyId]);
    //#endregion

    //#region LOAD COMPANY DATA
    const loadCompany = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const filterParams: FilterWithPaginationCompanyMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsCheckPermission: false,
                    CompanyId: Number(listState.companyId)
                };

                const response = await companyMasterService.apiCallPullCompanyMaster(filterParams);

                if (E.isRight(response)) {

                    const companyList = Array.isArray(response.right.Data) ? response.right.Data : [];

                    setEditCompanyData(companyList[0] || null);

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
            'Loading Company Data'
        );
    };
    //#endregion

    const loadCompanyMasterWithBankDetails = async () => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCompanyMasterWithBankDetails = {
                    CompanyId: Number(listState.companyId),
                }

                const response = await companyMasterService.apiCallPullCompanyMasterWithBankDetails(params);

                if (E.isRight(response)) {

                    setCompanyMasterWithBankDetailsList(response.right.Data);

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
            'Loading Company Bank Data'
        );
    };

    //#region EDIT COMPANY

    const handleEditCompany = (row: CompanyMasterData) => {
        if (!row?.CompanyId) return;
        navigate(`/companyMaster/add/${row.CompanyId}`);
    };

    const handleEditCompanyBank = (row: CompanyMasterData) => {
        if (!row?.CompanyId) return;
        navigate('/companyMaster/bank');
    };

    //#endregion

    //#region BACK COMPANY MASTER PAGE
    const handleBackToListCompanyMaster = () => {
        navigate('/companyMaster');
    };
    //#endregion
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            {/* Header */}
            <HeaderActionBar
                titleText={'Company Details : '}
                subTitleText={companyName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListCompanyMaster()}
                canAction={canAction}
                onEdit={() => {
                    if (activeTab === "Overview") {
                        if (editCompanyData) handleEditCompany(editCompanyData);
                    } else {
                        if (editCompanyData) handleEditCompanyBank(editCompanyData);
                    }
                }}
                isLoading={isLoading}
            />

            <div className="pt-5">
                <Tabs
                    tabs={CompanyMasterTablist}
                    defaultActive={activeTab}
                    islarge
                    onTabChange={(t) => {
                        setActiveTab(t.id);

                        if (t.id === "Overview") {

                            loadCompany();
                        } else if (t.id === "Bank Details") {
                            loadCompanyMasterWithBankDetails();
                        }
                    }}
                />
            </div>

            {activeTab === "Overview" && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                        {/* ================= LEFT (2/3 WIDTH) ================= */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* ================= BASIC DETAILS ================= */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-[#E7F2FF] px-4 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                        Basic Information
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Firms Type" value={editCompanyData?.FirmsType ?? "-"} />
                                    <FieldItem label="Contact Person" value={editCompanyData?.ContactPerson ?? "-"} />
                                    <FieldItem label="Mobile Number" value={`+91 ${editCompanyData?.MobileNumber ?? "-"}`} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    <FieldItem label="Email" value={editCompanyData?.EmailId ?? "-"} />
                                    <FieldItem label="Landline" value={editCompanyData?.LandLineNumber ?? "-"} />
                                </div>
                            </section>

                            {/* ================= GENERAL / REGISTRATION ================= */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                <div className="bg-[#FFF6EB] px-4 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#C2410C]">
                                        Registration & Compliance
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="PAN Number" value={editCompanyData?.PANNumber ?? '-'} urls={editCompanyData?.PanCardURL} isIcon />
                                    <FieldItem label="GST Number" value={editCompanyData?.GSTNumber ?? '-'} urls={editCompanyData?.GSTCertificateURL} isIcon />
                                    <FieldItem label="CIN Number" value={editCompanyData?.CINNumber ?? '-'} urls={editCompanyData?.CINURL} isIcon />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    <FieldItem label="TAN Number" value={editCompanyData?.TANNumber ?? '-'} urls={editCompanyData?.TANURL} isIcon />

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
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                <div className="bg-[#EAFCFF] px-4 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#12A3DD]">
                                        Address Details
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Country" value={editCompanyData?.CountryName ?? '-'} />
                                    <FieldItem label="State" value={editCompanyData?.StateName ?? '-'} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
                                    <FieldItem label="District" value={editCompanyData?.DistrictName ?? '-'} />
                                    <FieldItem label="City" value={editCompanyData?.CityName ?? '-'} />
                                </div>
                            </section>

                            {/* ================= ACTION DETAILS ================= */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                <div className="bg-[#FFFFE4] px-4 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#7B6B28]">
                                        Action Details
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Created By" value={editCompanyData?.CreatedBy ?? '-'} />
                                    <FieldItem
                                        label="Created Date"
                                        value={formatDate_dd_MonthName_yy_hh_mm(editCompanyData?.CreatedDate ?? '-')}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
                                    <FieldItem label="Modified By" value={editCompanyData?.ModifiedBy ?? '-'} />
                                    <FieldItem
                                        label="Modified Date"
                                        value={formatDate_dd_MonthName_yy_hh_mm(editCompanyData?.ModifiedDate ?? '-')}
                                    />
                                </div>
                            </section>

                        </div>

                    </div>

                    <div className="lg:col-span-1 space-y-6 pt-5">
                        {/* ================= PARTNERS ================= */}
                        <section className="border border-[#33333321] rounded-xl overflow-hidden">
                            <div className="bg-[#E6FFE6] px-4 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#00A800]">
                                    Partners ({editCompanyData?.CompanyPartnerData?.length ?? 0})
                                </h4>
                            </div>

                            {editCompanyData?.CompanyPartnerData?.length ? (
                                <div className="space-y-5 p-5">
                                    {editCompanyData.CompanyPartnerData.map((partner, idx) => (
                                        <CollapseCard
                                            key={partner.CompanyPartnerId ?? idx}
                                            name={partner.FullName || partner.FirstName || '-'}
                                            mobileNumber={partner.MobileNumber || '-'}
                                            partnershipPercent={partner.PartnerPercentage ?? '-'}
                                            gender={partner.Gender || '-'}
                                            photoURL={partner.PhotoURL || '-'}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(partner.DateOfBirth ?? '-')} />
                                                <FieldItem label="Email" value={partner.EmailId ?? '-'} />
                                                <FieldItem label="PAN Number" value={partner.PanNumber ?? '-'} urls={partner.PanCardURL} isIcon={true} />
                                                <FieldItem label="Aadhaar Card" value={partner.AadharCardNumber ?? '-'} urls={partner.AadharCardURL} isIcon={true} />
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
                </>
            )}

            {activeTab === "Bank Details" && (
                <div className="space-y-3 pt-5">
                    {companyMasterWithBankDetailsList?.length ? (
                        companyMasterWithBankDetailsList.map((b, i) => (
                            <section
                                key={i}
                                className="relative bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                                <div className="bg-[#F8FAFC] border-b border-gray-200 px-5 py-4">
                                    <div className="flex justify-between">

                                        <div className="flex items-center justify-start gap-6 mb-1">
                                            <h4 className="text-lg font-semibold text-gray-900 ">
                                                {b.BeneficiaryAccountHolderName ?? "Account Details"}
                                            </h4>

                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 border border-[#A7F3D0]">
                                                {b.Status}
                                            </span>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                                MICR Code :
                                                <span className="text-md text-gray-900"> {b.MICRCode ?? '-'}</span>
                                            </div>

                                            <div className="flex items-center pt-2">
                                                <span className="w-32 text-sm font-medium text-[#1D1D1D80]">
                                                    Cancel Cheque :
                                                </span>

                                                <MultiImageViewer
                                                    images={parseDocumentUrls(b.CancelChequeURL ?? "-")}
                                                    title="Cancel Cheque"
                                                    isIcon={false}
                                                    triggerLabel="-"
                                                />
                                            </div>
                                        </div>

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

        </div>
    );
};

export default ViewCompanyMaster;