import { useNavigate } from "react-router-dom";
import type { ChannelPartnerData } from "@/features/ChannelPartner/models/ChannelPartnerModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useChannelPartnerListState } from "@/features/ChannelPartner/context/ChannelPartnerListStateContext";
import { useEffect, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import type { FilterWithPaginationChannelPartnerRequest } from "@/features/ChannelPartner/models/ChannelPartnerModel";
import { ChannelPartnerService } from "@/features/ChannelPartner/services/ChannelPartnerService";
import { BadgeCheck, Building2, ChartNoAxesCombined, Circle, FileBadge2, FolderKanban, IdCard, Mail, MapPin, Phone, Users2, History, Handshake } from "lucide-react";
import { getNameInitials } from "@/core/utils/getNameInitials";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { formatCurrency } from "@/core/utils/comman";
import { Button } from "@/ui/components/forms";

const ViewChannelPartner: React.FC = () => {

    const navigate = useNavigate();

    const { canAction } = useMenuPermissions('/channelPartner');

    const { listState } = useChannelPartnerListState();
    const { channelPartnerId, channelPartnerName } = listState;
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [editChannelPartnerData, setEditChannelPartnerData] = useState<ChannelPartnerData | null>(null);
    const [channelPartnerTeamMemberData, setChannelPartnerTeamMemberData] = useState<ChannelPartnerData[]>([]);

    useEffect(() => {
        if (channelPartnerId) {
            loadChannelPartnerDetails();
        }

    }, [channelPartnerId]);

    const loadChannelPartnerDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationChannelPartnerRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    ChannelPartnerId: channelPartnerId
                };

                const response = await ChannelPartnerService.apiCallPullChannelPartner(params);

                if (E.isRight(response)) {

                    setEditChannelPartnerData(response.right.Data?.[0] || null);

                    loadChannelPartnerTeamMemberDetails(response.right.Data?.[0].CompanyName || "")

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
            'Loading Channel Partner'
        );
    };

    const loadChannelPartnerTeamMemberDetails = async (CompanyName: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationChannelPartnerRequest = {
                    PageNumber: 1,
                    PageSize: 500,
                    CompanyName: CompanyName
                };

                const response = await ChannelPartnerService.apiCallPullChannelPartner(params);

                if (E.isRight(response)) {

                    setChannelPartnerTeamMemberData(response.right.Data);

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
            'Loading Channel Partner'
        );
    };

    const handleEditChannelPartner = (row: ChannelPartnerData) => {
        if (!row?.ChannelPartnerId) return;
        navigate(`/channelPartner/add/${row.ChannelPartnerId}`, {
            state: {
                fromList: true
            }
        });
    };

    const handleBackToListChannelPartner = () => {
        navigate('/channelPartner');
    };

    const handleViewSalesMetrics = (row: ChannelPartnerData) => {
        if (!row?.ChannelPartnerId) return;
        navigate('/channelPartner/salesMetrics', {
            state: {
                fromList: true
            }
        });
    };

    const filteredTeamMembers = channelPartnerTeamMemberData.filter(
        member => member.ChannelPartnerId !== editChannelPartnerData?.ChannelPartnerId
    );

    const isActive = Number(editChannelPartnerData?.NoOfEnquiry) > 0;

    const getAOPStatusStyle = (status?: string) => {
        switch (status?.toUpperCase()) {
            case "AOP":
                return "border-blue-500 bg-blue-50 text-blue-600";

            case "NON-AOP":
                return "border-gray-300 bg-gray-100 text-gray-700";

            case "EXPIRE SOON":
                return "border-orange-300 bg-orange-50 text-orange-600";

            case "EXPIRED":
                return "border-red-300 bg-red-50 text-red-600";

            default:
                return "border-gray-300 bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-300 p-6">

            <Loader loading={isLoading} title={loadingMessage} ><div></div> </Loader>

            <HeaderActionBar
                titleText="Channel Partner : "
                subTitleText={channelPartnerName || editChannelPartnerData?.Name || ''}
                subSubTitleText={editChannelPartnerData?.SystemGeneratedCode || ''}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListChannelPartner()}
                canAction={canAction}
                onEdit={() => {
                    if (editChannelPartnerData) handleEditChannelPartner(editChannelPartnerData);
                }}
                isLoading={false}
            />
            <div className="grid grid-cols-12 gap-5">

                <div className="col-span-12 lg:col-span-7">

                    <div className="bg-white rounded-3xl border border-gray-200  box-shadow: 0px 8px 30px 0px #00000005 px-5 py-5 mt-5">

                        <div className="flex items-center justify-between">

                            <div className="flex items-start gap-6">


                                <div className="relative">
                                    {editChannelPartnerData?.ChannelPartnerPhotoUrl ? (
                                        <img
                                            src={editChannelPartnerData.ChannelPartnerPhotoUrl}
                                            alt={editChannelPartnerData?.Name}
                                            className="w-18 h-18 rounded-full object-cover border border-gray-300"
                                        />
                                    ) : null}

                                    <div className={`w-18 h-18 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-xl ${editChannelPartnerData?.ChannelPartnerPhotoUrl ? "hidden" : "flex"}`}>
                                        {getNameInitials(editChannelPartnerData?.Name)}
                                    </div>

                                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center">
                                        <BadgeCheck size={14} className="text-white" />
                                    </div>
                                </div>

                                <div>

                                    <div className="flex items-center gap-3 flex-wrap">

                                        <h1 className="text-2xl font-bold text-slate-800">
                                            {editChannelPartnerData?.Name}
                                        </h1>

                                        <span
                                            className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 border
                                        ${isActive
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-red-50 text-red-700 border-red-200"
                                                }`}
                                        >
                                            <Circle
                                                size={8}
                                                className={
                                                    isActive
                                                        ? "fill-green-500 text-green-500"
                                                        : "fill-red-500 text-red-500"
                                                }
                                            />

                                            {isActive ? "Active" : "Inactive"}
                                        </span>

                                        {editChannelPartnerData?.RERANumber && (
                                            <span className="px-5 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium flex items-center gap-2 border border-[#E0E7FF]">
                                                <BadgeCheck size={18} />
                                                RERA Verified
                                            </span>
                                        )}

                                        {editChannelPartnerData?.GSTNumber && (
                                            <span className="px-5 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium flex items-center gap-2 border border-[#E0E7FF]">
                                                <BadgeCheck size={18} />
                                                GST Verified
                                            </span>
                                        )}

                                    </div>

                                    <p className="text-lg text-gray-500 mt-2">
                                        {editChannelPartnerData?.Designation} at {editChannelPartnerData?.CompanyName}
                                    </p>

                                    <div className="inline-flex items-center gap-2 mt-2 px-5 py-2 rounded-full bg-[#EFF4FF] text-[#464554] text-1xl font-medium">
                                        <MapPin className="text-[#4648D4]" size={18} />
                                        {editChannelPartnerData?.CityName}, {editChannelPartnerData?.StateName}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-5">

                    <div className="bg-white rounded-3xl border border-gray-200  box-shadow: 0px 8px 30px 0px #00000005 p-5 mt-5">

                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <Handshake className="w-5 h-5 text-violet-600" />
                                </div>

                                <h2 className="text-[16px] font-semibold text-slate-800">
                                    Compliance Status
                                </h2>
                            </div>

                            <Button
                                type="button"
                                variant="link"
                                className="p-0"
                                onClick={() => {
                                    if (editChannelPartnerData) {
                                        handleViewSalesMetrics(editChannelPartnerData);
                                    }
                                }}
                            >
                                View Sales Metrics
                            </Button>
                        </div>


                        <div className="grid grid-cols-2 gap-6">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Status
                                </p>

                                <div className={`inline-flex items-center gap-2 px-5 py-2 mt-4 rounded-[15px] border text-sm font-medium ${getAOPStatusStyle(editChannelPartnerData?.AOPStatus)}`} >

                                    {["AOP", "EXPIRE SOON"].includes(editChannelPartnerData?.AOPStatus?.toUpperCase() || "") ? (

                                        <FieldItem label="" value={editChannelPartnerData?.AOPStatus} urls={editChannelPartnerData?.AOPDocumentURL} isIcon className="-mt-1" />
                                    ) : (
                                        editChannelPartnerData?.AOPStatus
                                    )}
                                </div>
                            </div>


                            {["AOP", "EXPIRE SOON"].includes(editChannelPartnerData?.AOPStatus?.toUpperCase() || "") && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Validity
                                    </p>

                                    <p className="text-[14px] font-medium text-slate-800 leading-6 mt-4">
                                        {editChannelPartnerData?.AOPFromDate &&
                                            editChannelPartnerData?.AOPToDate ? `${formatDate_dd_MonthName_yy(editChannelPartnerData.AOPFromDate)} - ${formatDate_dd_MonthName_yy(editChannelPartnerData.AOPToDate)}` : "-"}
                                    </p>

                                </div>
                            )}


                        </div>
                    </div>

                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-5">

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-indigo-600" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Personal Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">

                        <FieldItem label="Full Name" value={editChannelPartnerData?.Name} />

                        <FieldItem label="Mobile Number" value={editChannelPartnerData?.MobileNumber ? `${editChannelPartnerData?.MobileNumberCountryCode || "+91"} ${editChannelPartnerData.MobileNumber}` : "-"} />

                        <FieldItem label="Alternative Contact No:" value={editChannelPartnerData?.AlternativeMobileNumber ? `+91 ${editChannelPartnerData?.AlternativeMobileNumber}` : '-'} />

                        <FieldItem label="Date Of Birth" value={editChannelPartnerData?.DateOfBirth ? formatDate_dd_MonthName_yy(editChannelPartnerData.DateOfBirth) : "-"} />

                        <FieldItem label="E-Mail ID" value={editChannelPartnerData?.EmailId} />

                        <FieldItem label="Website URL" value={
                            editChannelPartnerData?.WebsiteURL ? (
                                <a
                                    href={editChannelPartnerData.WebsiteURL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline break-all"
                                >
                                    {editChannelPartnerData.WebsiteURL}
                                </a>
                            ) : "-"
                        }
                        />

                    </div>

                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <BadgeCheck className="w-5 h-5 text-emerald-600" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Business Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">

                        <FieldItem label="Company Name" value={editChannelPartnerData?.CompanyName} />

                        <FieldItem label="Firm Type" value={editChannelPartnerData?.FirmsType} />

                        <FieldItem label="Speciality" value={editChannelPartnerData?.Speciality} />

                        <FieldItem label="RERA Number" value={editChannelPartnerData?.RERANumber} />

                        <FieldItem label="Type" value={editChannelPartnerData?.Type} />

                        <FieldItem label="Designation" value={editChannelPartnerData?.Designation} />

                    </div>

                </div>

                <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-orange-500" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Address Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-4 gap-x-8 gap-y-6">

                        <FieldItem label="Country" value={editChannelPartnerData?.CountryName} />

                        <FieldItem label="State" value={editChannelPartnerData?.StateName} />

                        <FieldItem label="District" value={editChannelPartnerData?.DistrictName} />

                        <FieldItem label="City" value={editChannelPartnerData?.CityName} />
                        <FieldItem label="Village" value={editChannelPartnerData?.VillageName} />


                        <div className="col-span-3">
                            <FieldItem label="Office Address" value={editChannelPartnerData?.OfficeAddress} />
                        </div>

                    </div>

                </div>

                <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">
                            <ChartNoAxesCombined className="w-5 h-5 text-gray-500" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Sales Matrix
                        </h2>
                    </div>

                    <div className="grid grid-cols-4 gap-6">

                        <FieldItem label="No Of Enquiry" value={editChannelPartnerData?.NoOfEnquiry} />
                        <FieldItem label="No Of Booking" value={editChannelPartnerData?.NoOfBooking} />

                        <FieldItem label="Brokerage Percentage (%)" value={editChannelPartnerData?.BrokeragePercentage} />
                        <FieldItem label="Brokerage Amount (₹)" value={formatCurrency(editChannelPartnerData?.BrokerageAmount)} />
                        <FieldItem label="Paid Brokerage Amount (₹)" value={formatCurrency(editChannelPartnerData?.PaidBrokerageAmount)} />
                        <FieldItem label="No Of IBM" value={editChannelPartnerData?.NoOfIbm} />
                        <FieldItem label="No Of OBM" value={editChannelPartnerData?.NoOfObm} />

                    </div>
                </div>

                <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center gap-3 mb-5">

                        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-sky-600" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Assigned Projects
                        </h2>

                    </div>

                    <div className="grid grid-cols-12 gap-6">

                        <div className="col-span-12">

                            <p className="text-xs font-semibold uppercase text-gray-400 mb-3">
                                Primary Project
                            </p>

                            <div className="border border-gray-200 rounded-2xl bg-[#F5F7FF] p-4 flex gap-4">

                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                                    <Building2 className="text-indigo-600" size={20} />
                                </div>

                                <div>
                                    <h4 className="font-semibold">
                                        {editChannelPartnerData?.PrimaryProjectPortfolio || "-"}
                                    </h4>

                                </div>

                            </div>

                        </div>


                        <div className="col-span-12">

                            <p className="text-xs font-semibold uppercase text-gray-400 mb-3">
                                Secondary Projects
                            </p>

                            <div className="grid grid-cols-4 gap-3">

                                {(editChannelPartnerData?.SecondaryProjectPortfolio || "")
                                    .split(",")
                                    .filter(x => x.trim() !== "")
                                    .map((item, index) => (

                                        <div key={index} className="border border-gray-200 rounded-xl p-3 flex items-center gap-3"  >
                                            <Building2 size={16} className="text-indigo-600" />

                                            <span>{item.trim()}</span>

                                        </div>

                                    ))}

                            </div>

                        </div>

                    </div>

                </div>

                <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <FileBadge2 className="w-5 h-5 text-indigo-600" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Verification Documents
                        </h2>

                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            {
                                title: "Aadhaar Card",
                                number: editChannelPartnerData?.AadharCardNumber,
                                url: editChannelPartnerData?.AadharCardURL,
                            },
                            {
                                title: "PAN Card",
                                number: editChannelPartnerData?.PanNumber,
                                url: editChannelPartnerData?.PanCardURL,
                            },
                            {
                                title: "GST Certificate",
                                number: editChannelPartnerData?.GSTNumber,
                                url: editChannelPartnerData?.GSTCertificateURL,
                            },
                        ].map((doc, index) => (

                            <div key={index} className="rounded-2xl border border-gray-200 p-5" >

                                <div className="flex justify-between items-start">

                                    <div className="flex gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <IdCard size={18} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                <FieldItem label={doc.title} value={doc?.number} urls={doc?.url} isIcon />
                                            </p>
                                        </div>

                                    </div>

                                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                                        {doc?.url !== "" && doc?.url !== null ? "Verified" : "Not Verified"}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

                <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                            <Users2 size={20} className="text-orange-500" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Team Members
                        </h2>
                    </div>

                    {filteredTeamMembers.length === 0 ? (
                        <NoDataView message="No team members found" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                            {filteredTeamMembers.map((member, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-xl p-4"
                                >
                                    <div className="flex items-center gap-3">

                                        <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center">
                                            {getNameInitials(member.Name)}
                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <h5 className="text-md font-semibold text-gray-900 truncate">
                                                {member.Name}
                                            </h5>

                                            <p className="text-xs text-gray-500">
                                                {member.Designation || "-"}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="mt-4 space-y-2">

                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Phone size={14} className="text-gray-400" />
                                            <span>
                                                {member.MobileNumber ? `${member.MobileNumberCountryCode || "+91"} ${member.MobileNumber}` : "-"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-600 break-all">
                                            <Mail size={14} className="text-gray-400 shrink-0" />
                                            <span>{member.EmailId || "-"}</span>
                                        </div>

                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </div>

                <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                            <History className="w-5 h-5 text-slate-600" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Action Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">

                        <FieldItem label="Created By" value={editChannelPartnerData?.CreatedBy} />
                        <FieldItem label="Created Date" value={editChannelPartnerData?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(editChannelPartnerData?.CreatedDate) : ""} />
                        {editChannelPartnerData?.ModifiedBy && (
                            <>
                                <FieldItem label="Modified By" value={editChannelPartnerData?.ModifiedBy} />
                                <FieldItem label="Modified Date" value={editChannelPartnerData?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(editChannelPartnerData?.ModifiedDate) : ""} />
                            </>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ViewChannelPartner;
