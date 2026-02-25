import { useNavigate } from "react-router-dom";
import type { ChannelPartnerData } from "../models/ChannelPartnerModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useChannelPartnerListState } from "../context/ChannelPartnerListStateContext";
import { useEffect, useState } from "react";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import type { FilterWithPaginationChannelPartnerRequest } from "../models/ChannelPartnerModel";
import { ChannelPartnerService } from "../services/ChannelPartnerService";
import { Mail, Phone } from "lucide-react";

const ViewChannelPartner: React.FC = () => {

    // NAVIGATION
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
    //#region EDIT CHANNEL PARTNER MASTER
    const handleEditChannelPartner = (row: ChannelPartnerData) => {
        if (!row?.ChannelPartnerId) return;
        navigate(`/channelPartner/add/${row.ChannelPartnerId}`, {
            state: {
                fromList: true
            }
        });
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListChannelPartner = () => {
        navigate('/channelPartner');
    };
    //#endregion


    const filteredTeamMembers = channelPartnerTeamMemberData.filter(
        member =>
            member.ChannelPartnerId !== editChannelPartnerData?.ChannelPartnerId
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            {/* Loader */}
            <Loader loading={isLoading} title={loadingMessage} ><div></div> </Loader>

            {/* Header Details*/}
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

            <div className="grid grid-cols-12 gap-4 pt-5">

                {/* LEFT SIDE PROFILE CARD */}
                <div className="col-span-8">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">

                        {/* HEADER  DETAILS */}
                        <div className="pl-4 pb-4 border-b-2 border-gray-300">
                            <div className="flex flex-col gap-2">

                                <div className="flex items-start">
                                    <span className="text-gray-500 font-medium text-sm w-[120px]">
                                        Company Name
                                    </span>
                                    <span className="text-gray-500 font-medium text-sm px-2">:</span>
                                    <span className="text-black text-sm break-all">
                                        {editChannelPartnerData?.CompanyName || '-'}
                                    </span>
                                </div>

                                <div className="flex items-start">
                                    <span className="text-gray-500 font-medium text-sm w-[120px]">
                                        Firm Type
                                    </span>
                                    <span className="text-gray-500 font-medium text-sm px-2">:</span>
                                    <span className="text-black text-sm break-all">
                                        {editChannelPartnerData?.FirmsType || '-'}
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Basic Deatils */}
                        <section className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 ">
                                <FieldItem label="Mobile No:" value={editChannelPartnerData?.MobileNumber ? `+91 ${editChannelPartnerData?.MobileNumber}` : '-'} />
                                <FieldItem label="E-Mail ID" value={editChannelPartnerData?.EmailId} />
                                <FieldItem label="Alternative Contact No:" value={editChannelPartnerData?.AlternativeMobileNumber ? `+91 ${editChannelPartnerData?.AlternativeMobileNumber}` : '-'} />
                                <FieldItem label="Speciality" value={editChannelPartnerData?.Speciality} />
                                <FieldItem label="Firms Type" value={editChannelPartnerData?.FirmsType} />
                                <FieldItem label="Type" value={editChannelPartnerData?.Type} />
                                <FieldItem label="Designation" value={editChannelPartnerData?.Designation} />
                            </div>
                        </section>
                        <hr className="border-t border-gray-200" />

                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                RERA Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Available RERA Number" value={editChannelPartnerData?.RERANumber != "" ? 'Yes' : 'No'} />

                                <FieldItem label="RERA Number" value={editChannelPartnerData?.RERANumber} />
                            </div>
                        </section>

                        <hr className="border-t border-gray-200" />

                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Address
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FieldItem label="Country" value={editChannelPartnerData?.CountryName ?? '-'} />
                                <FieldItem label="State" value={editChannelPartnerData?.StateName ?? '-'} />
                                <FieldItem label="District" value={editChannelPartnerData?.DistrictName ?? '-'} />
                                <FieldItem label="City" value={editChannelPartnerData?.CityName ?? '-'} />
                                <FieldItem label="Village" value={editChannelPartnerData?.VillageName ?? '-'} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pt-5">
                                <FieldItem label="Office Address" value={editChannelPartnerData?.OfficeAddress} />
                            </div>
                        </section>
                        <hr className="border-t border-gray-200" />
                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Document Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="PAN Number" value={editChannelPartnerData?.PanNumber} urls={editChannelPartnerData?.PanCardURL} isIcon />
                                <FieldItem label="Aadhaar Number" value={editChannelPartnerData?.AadharCardNumber} urls={editChannelPartnerData?.AadharCardURL} isIcon />
                                <FieldItem label="GST Number" value={editChannelPartnerData?.GSTNumber} urls={editChannelPartnerData?.GSTCertificateURL} isIcon />
                            </div>
                        </section>
                        <hr className="border-t border-gray-200" />
                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Action Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Created By" value={editChannelPartnerData?.CreatedBy} />
                                <FieldItem label="Created Date" value={editChannelPartnerData?.CreatedDate ? formatDate_dd_MonthName_yy(editChannelPartnerData?.CreatedDate) : ""} />
                                {editChannelPartnerData?.ModifiedBy && (
                                    <>
                                        <FieldItem label="Modified By" value={editChannelPartnerData?.ModifiedBy} />
                                        <FieldItem label="Modified Date" value={editChannelPartnerData?.ModifiedDate ? formatDate_dd_MonthName_yy(editChannelPartnerData?.ModifiedDate) : ""} />
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </div>



                {/*  RIGHT SIDE  */}
                {/* RIGHT SIDE – TEAM MEMBERS */}
                <div className="col-span-4">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

                        {/* Header */}
                        <div className="pb-3 border-b border-gray-300">
                            <h4 className="text-gray-700 font-semibold text-sm">
                                Team Members ({filteredTeamMembers.length})
                            </h4>
                        </div>

                        {/* Team Member List */}
                        <div className="mt-4 space-y-4 overflow-y-auto">

                            {filteredTeamMembers.length === 0 && (
                                <p className="text-sm text-gray-400 text-center">
                                    No team members found
                                </p>
                            )}

                            {filteredTeamMembers.map((member, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow transition">

                                    <div className="flex items-start justify-between gap-2">
                                        <h5 className="text-sm font-semibold text-gray-900 truncate">
                                            {member.Name || '-'}
                                        </h5>

                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {member.Designation || '—'}
                                        </span>
                                    </div>


                                    <div className="mt-2 space-y-1">

                                        <p className="text-xs text-gray-600 flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                                            <span>{member.MobileNumber ? `+91 ${member.MobileNumber}` : '-'}</span>
                                        </p>


                                        <p className="text-xs text-gray-600 flex items-center gap-2 break-all">
                                            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                                            <span>{member.EmailId || '-'}</span>
                                        </p>


                                    </div>


                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ViewChannelPartner;
