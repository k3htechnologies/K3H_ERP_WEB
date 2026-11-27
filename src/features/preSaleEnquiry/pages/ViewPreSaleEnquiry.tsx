import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { calculateAge, } from "@/core/utils/comman";
import Tabs from "@/ui/components/Tab/Tab";
import CallMonitoring from "@/features/callMonitoring/pages/CallMonitoring";
import { usePreSaleEnquiryListState } from "@/features/preSaleEnquiry/context/PreSaleEnquiryListStateContext";
import type { FilterWithPaginationPreSaleEnquiryRequest, PreSaleEnquiryData } from "@/features/preSaleEnquiry/models/PreSaleEnquiryModel";
import { preSaleEnquiryService } from "@/features/preSaleEnquiry/services/PreSaleEnquiryService";

const ViewPreSalePreSaleEnquiry: React.FC = () => {

    const navigate = useNavigate();
    const { PreSaleEnquiryId } = useParams<{ PreSaleEnquiryId?: string }>();
    const { listState } = usePreSaleEnquiryListState();
    const { PreSaleEnquiryId: contextPreSaleEnquiryId } = listState;
    const currentPreSaleEnquiryId = PreSaleEnquiryId ? Number(PreSaleEnquiryId) : contextPreSaleEnquiryId;
    const { addToast } = useToast();

    const [editPreSaleEnquiryData, setEditPreSaleEnquiryData] = useState<PreSaleEnquiryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { canAction } = useMenuPermissions('/customerInfo');

    const PreSaleEnquiryTabList = [
        { id: "Overview", label: "Overview" },
        { id: "CallLogs", label: "Call Logs" }
    ]

    const [PreSaleEnquiryActiveTab, setPreSaleEnquiryActiveTab] = useState(PreSaleEnquiryTabList[0].id)

    useEffect(() => {
        if (!currentPreSaleEnquiryId || currentPreSaleEnquiryId === 0) return;

        fetchPreSaleEnquiryDetails();
    }, [currentPreSaleEnquiryId, addToast]);

    const fetchPreSaleEnquiryDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationPreSaleEnquiryRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    PreSaleEnquiryId: currentPreSaleEnquiryId,
                };

                const response = await preSaleEnquiryService.apiCallPullPreSaleEnquiry(params);

                if (E.isRight(response)) {

                    const PreSaleEnquiryList = Array.isArray(response.right.Data) ? response.right.Data : [];

                    setEditPreSaleEnquiryData(PreSaleEnquiryList);
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
            'Loading Pre Sale Enquiry'
        );
    };

    const handleEditPreSaleEnquiry = (row: PreSaleEnquiryData) => {
        if (!row?.PreSaleEnquiryId) return;
        navigate(`/customerInfo/add/${row.PreSaleEnquiryId}`);
    };

    const handleBackToListPreSaleEnquiry = () => {
        navigate('/customerInfo');
    };

    const PreSaleEnquiryData = editPreSaleEnquiryData!.length > 0 ? editPreSaleEnquiryData[0] : undefined

    const safe = (value?: any) => (value === null || value === undefined || value === '' ? '-' : value)

    const canActionPerform = canAction && PreSaleEnquiryData?.FinalStage?.toUpperCase() !== "LOST" && PreSaleEnquiryData?.FinalStage?.toUpperCase() !== 'BOOKING DONE' && PreSaleEnquiryData?.FinalStage?.toUpperCase() !== 'CANCELLED';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <HeaderActionBar
                titleText={PreSaleEnquiryData?.ProjectName ? `${PreSaleEnquiryData.ProjectName} :` : ''}
                subTitleText={PreSaleEnquiryData?.Name ?? ""}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListPreSaleEnquiry()}
                canAction={PreSaleEnquiryActiveTab === "Overview" ? canActionPerform : false}
                onEdit={() => {
                    if (PreSaleEnquiryActiveTab === "Overview" && PreSaleEnquiryData) {
                        handleEditPreSaleEnquiry(PreSaleEnquiryData);
                    }
                }}
                isLoading={false}
            />

            <div className="mt-5">
                <Tabs
                    tabs={PreSaleEnquiryTabList}
                    defaultActive={PreSaleEnquiryActiveTab}
                    onTabChange={(t) => setPreSaleEnquiryActiveTab(t.id)}
                    islarge
                />
            </div>

            {PreSaleEnquiryActiveTab === "Overview" &&
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1.3fr] gap-6 pt-5">
                        <div className="lg:col-span-3 space-y-6">

                            {/* Enquiry Details */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">

                                <div className="bg-[#E7F2FF] px-4 py-2 border-b border-[#D0D7DE]">

                                    <div className="flex justify-between">
                                        <h4 className="text-sm font-semibold text-[#1D4ED8] pt-2">
                                            Enquiry Details
                                        </h4>

                                        <div className="flex flex-col items-start text-xs text-gray-700">
                                            <div className="grid grid-cols-[130px_10px_130px] items-center">
                                                <span className="font-semibold text-gray-800">
                                                    Enquiry Date
                                                </span>
                                                <span>:</span>
                                                <span className="font-semibold">
                                                    {formatDate_dd_MonthName_yy(safe(PreSaleEnquiryData?.EnquiryDate ?? ""))}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-[130px_10px_130px] items-center mt-1">
                                                <span className="font-semibold text-gray-600">
                                                    Next Follow-up Date
                                                </span>
                                                <span>:</span>
                                                <span className="font-semibold">
                                                    {formatDate_dd_MonthName_yy(safe(PreSaleEnquiryData?.NextFollowUpDate))}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Mobile No" value={!safe(PreSaleEnquiryData?.MobileNumber) ? "-" : `${PreSaleEnquiryData?.MobileNumberCountryCode ?? "+91"}  ${PreSaleEnquiryData?.MobileNumber}`} />
                                    <FieldItem label="E-Mail ID" value={safe(PreSaleEnquiryData?.EmailId)} />
                                    <FieldItem label="Date of Birth" value={safe(PreSaleEnquiryData?.DateOfBirth) ? formatDate_dd_MonthName_yy(safe(PreSaleEnquiryData?.DateOfBirth)) : ""} />
                                    <FieldItem label="Age" value={calculateAge(PreSaleEnquiryData?.DateOfBirth || "")} />
                                    <FieldItem label="Accommodation" value={safe(PreSaleEnquiryData?.Accommodation)} />
                                    <FieldItem label="Occupation Type" value={safe(PreSaleEnquiryData?.OccupationType)} />
                                    <FieldItem label="Nationality" value={safe(PreSaleEnquiryData?.Nationality)} />
                                    {safe(PreSaleEnquiryData?.Nationality?.toUpperCase()) !== "INDIAN" ? (
                                        <>
                                            <FieldItem label="Country Of Residence" value={safe(PreSaleEnquiryData?.CountryOfResidence)} />
                                            <FieldItem label="City Of Residence" value={safe(PreSaleEnquiryData?.CityOfResidence)} />
                                        </>
                                    ) : null}
                                </div>
                            </section>

                            {/* Source */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                <div className="bg-[#ECFDF5] px-4 py-2 border-b border-[#A7F3D0]">
                                    <h4 className="text-sm font-semibold text-[#059669]">
                                        Source
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Source " value={safe(PreSaleEnquiryData?.Source)} />

                                    {PreSaleEnquiryData?.Source?.toUpperCase() === "CHANNEL PARTNER" && (
                                        <>
                                            <FieldItem label="Sub Source" value={safe(PreSaleEnquiryData?.SubSource)} />
                                            <FieldItem label="CP Code" value={safe(PreSaleEnquiryData?.ChannelPartnerCode)} />
                                            <FieldItem label="CP Name" value={safe(PreSaleEnquiryData?.ChannelPartnerName)} />
                                            <FieldItem label="CP Mobile No" value={!safe(PreSaleEnquiryData?.ChannelPartnerMobileNumber) ? "-" : `${PreSaleEnquiryData?.ChannelPartnerMobileNumberCountryCode || "+91"}  ${PreSaleEnquiryData?.ChannelPartnerMobileNumber}`} />
                                            <FieldItem label="CP Designation" value={safe(PreSaleEnquiryData?.ChannelPartnerDesignation)} />
                                            <FieldItem label="CP Company Name" value={safe(PreSaleEnquiryData?.ChannelPartnerCompany)} />
                                            <FieldItem label="CP Firms Type" value={safe(PreSaleEnquiryData?.ChannelPartnerFirmsType)} />
                                            <FieldItem label="CP Type" value={safe(PreSaleEnquiryData?.ChannelPartnerType)} />


                                            {PreSaleEnquiryData?.ChannelPartnerTeamMemberName && (<FieldItem label="CP Team Member Name " value={safe(PreSaleEnquiryData?.ChannelPartnerTeamMemberName)} />)}

                                            {PreSaleEnquiryData?.ChannelPartnerTeamMemberMobileNumber && (<FieldItem label="CP Team Member Mobile Number" value={safe(PreSaleEnquiryData?.ChannelPartnerTeamMemberMobileNumber) ? `${PreSaleEnquiryData?.ChannelPartnerTeamMemberMobileNumberCountryCode || "+91"} ${safe(PreSaleEnquiryData?.ChannelPartnerTeamMemberMobileNumber)}` : '-'} />)}

                                            {PreSaleEnquiryData?.ChannelPartnerTeamMemberEmailId && (<FieldItem label="CP Team Member E-Mail ID " value={safe(PreSaleEnquiryData?.ChannelPartnerTeamMemberEmailId)} />)}
                                        </>
                                    )}

                                    {PreSaleEnquiryData?.Source === 'Direct Walkin' && PreSaleEnquiryData?.SubSource === 'Advertisement' && (
                                        <>
                                            <FieldItem label="Sub Source" value={safe(PreSaleEnquiryData?.SubSource)} />
                                            <FieldItem label="Sub Sub Source" value={safe(PreSaleEnquiryData?.SubSubSource)} />
                                        </>
                                    )}

                                    {PreSaleEnquiryData?.Source === 'Direct Walkin' && PreSaleEnquiryData?.SubSource !== 'Advertisement' && (
                                        <>
                                            <FieldItem label="Sub Source" value={safe(PreSaleEnquiryData?.SubSource)} />
                                        </>
                                    )}

                                    {PreSaleEnquiryData?.Source === 'Direct Walkin' && PreSaleEnquiryData?.SubSource === 'Reference' && (
                                        <>
                                            <FieldItem label="Referral Project Name" value={safe(PreSaleEnquiryData?.ReferralProjectName ?? "")} />
                                            <FieldItem label="Referral Unit Number" value={safe(PreSaleEnquiryData?.ReferralUnitNumber ?? "")} />
                                            <FieldItem label="Unit Owner" value={safe(PreSaleEnquiryData?.ReferralUnitOwnerName ?? "")} />

                                        </>
                                    )}
                                    {PreSaleEnquiryData?.Source === 'Direct Walkin' && PreSaleEnquiryData?.SubSource === 'Loyalty' && (
                                        <>
                                            <FieldItem label="Existing Project Name" value={safe(PreSaleEnquiryData?.LoyaltyExistingProjectName ?? "")} />
                                            <FieldItem label="Existing Unit Number" value={safe(PreSaleEnquiryData?.LoyaltyExistingUnitNumber ?? "")} />
                                            <FieldItem label="Unit Owner" value={safe(PreSaleEnquiryData?.LoyaltyExistingUnitOwnerName ?? "")} />

                                        </>
                                    )}
                                    {PreSaleEnquiryData?.Source === 'Direct Walkin' && PreSaleEnquiryData?.SubSource === 'Employee Reference' && (
                                        <>
                                            <FieldItem label="Employee Reference Name" value={safe(PreSaleEnquiryData?.EmployeeReferenceName ?? "")} />
                                            <FieldItem label="Employee Reference Mobile Number" value={safe(PreSaleEnquiryData?.EmployeeReferenceMobileNumber) ? `+91 ${safe(PreSaleEnquiryData?.EmployeeReferenceMobileNumber)}` : '-'} />
                                        </>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {/* Property Preferences */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                <div className="bg-[#F3F0FF] px-4 py-2 border-b border-[#DDD6FE]">
                                    <h4 className="text-sm font-semibold text-[#7C3AED]">
                                        Property Preferences
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Budget (In CR)" value={safe(PreSaleEnquiryData?.Budget)} />
                                    <FieldItem label="Possession Type" value={safe(PreSaleEnquiryData?.PossessionType)} />
                                    <FieldItem label="Requirement" value={safe(PreSaleEnquiryData?.Requirement)} />
                                    <FieldItem label={
                                        PreSaleEnquiryData?.Requirement === "Residential"
                                            ? "Residential Type"
                                            : PreSaleEnquiryData?.Requirement === "Commercial"
                                                ? "Commercial Type"
                                                : "Type"
                                    }
                                        value={safe(PreSaleEnquiryData?.RequirementType)}
                                    />
                                    <FieldItem label="Location" value={safe(PreSaleEnquiryData?.VillageName)} />
                                    <FieldItem label="Timeline Of Purchase" value={safe(PreSaleEnquiryData?.Timeline)} />
                                    <FieldItem label="Area Preferred (SqFt)" value={safe(PreSaleEnquiryData?.AreaPreferred)} />
                                    <FieldItem label="Desired Floor Band" value={safe(PreSaleEnquiryData?.DesiredFloorBand)} />

                                </div>
                            </section>

                            {/* Address Details */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                <div className="bg-[#EAFCFF] px-4 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#12A3DD]">
                                        Address Details
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Current Location" value={safe(PreSaleEnquiryData?.CurrentLocation)} />
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-1 space-y-6">

                            {/* Customer Details */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                <div className="bg-[#FCF1FF] px-3 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#561F64]">
                                        Customer Details
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Customer Classification" value={safe(PreSaleEnquiryData?.CustomerClassification)} />
                                    <FieldItem label="Source Of Funding" value={safe(PreSaleEnquiryData?.SourceOfFunding)} />
                                    <FieldItem label="Ethnicity" value={safe(PreSaleEnquiryData?.Ethnicity)} />
                                </div>
                            </section>

                            {/* Enquiry Information */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                <div className="bg-[#FFF6EB] px-4 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#C2410C]">
                                        Enquiry Information
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Stage " value={safe(PreSaleEnquiryData?.FinalStage)} />
                                    {safe(PreSaleEnquiryData?.FinalStageDetail) !== "-" ? <FieldItem label="Stage Reason " value={safe(PreSaleEnquiryData?.FinalStageDetail)} /> : ""}

                                </div>
                            </section>

                            {/* Sales Details */}
                            <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                <div className="bg-[#FEFCE8] px-4 py-2 border-b border-[#FDE68A]">
                                    <h4 className="text-sm font-semibold text-[#A16207]">
                                        Sales Details
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                    <FieldItem label="Sales Advisor" value={safe(PreSaleEnquiryData?.SalesAdvisor)} />
                                    <FieldItem label="Sourcing Manager" value={safe(PreSaleEnquiryData?.SourcingManager)} />
                                </div>
                            </section>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 pt-5">

                        {/* Remark */}
                        <section className="border border-[#33333321] rounded-xl overflow-hidden">
                            <div className="bg-[#FFF1F2] px-3 py-2 border-b border-[#FECDD3]">
                                <h4 className="text-sm font-semibold text-[#E11D48]">
                                    Remark
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 p-4 border-b border-[#135bec2e]">
                                <FieldItem label="Remark" value={safe(PreSaleEnquiryData?.Remark)} />
                            </div>
                        </section>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 pt-5">

                        {/* Action Details */}
                        <section className="border border-[#33333321] rounded-xl overflow-hidden">
                            <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#333333]">
                                    Action Details
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 p-4 border-b border-[#135bec2e]">
                                <FieldItem label="Created By" value={PreSaleEnquiryData?.CreatedBy ?? '-'} />
                                <FieldItem
                                    label="Created Date"
                                    value={formatDate_dd_MonthName_yy_hh_mm(PreSaleEnquiryData?.CreatedDate ?? '-')}
                                />
                                <FieldItem label="Modified By" value={PreSaleEnquiryData?.ModifiedBy ?? '-'} />
                                <FieldItem
                                    label="Modified Date"
                                    value={formatDate_dd_MonthName_yy_hh_mm(PreSaleEnquiryData?.ModifiedDate ?? '-')}
                                />
                            </div>
                        </section>
                    </div>

                </>
            }

            {PreSaleEnquiryActiveTab === "CallLogs" && (
                <CallMonitoring pageName='CustomerInfo' id={currentPreSaleEnquiryId} permissionPath="customerInfo" />
            )}

        </div>
    );
};

export default ViewPreSalePreSaleEnquiry;
