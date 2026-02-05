import { useLocation, useNavigate } from "react-router-dom";
import type { ChannelPartnerData } from "../models/ChannelPartnerModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

const ViewChannelPartner: React.FC = () => {

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    const { canAction } = useMenuPermissions('/channelPartner');

    const editChannelPartnerData = location.state?.editChannelPartnerData as ChannelPartnerData;

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editChannelPartnerData) return <div>No channel Partner Data Found</div>;


    //#region EDIT CHANNEL PARTNER MASTER
    const handleEditChannelPartner = (row: ChannelPartnerData) => {
        if (!row?.ChannelPartnerId) return;
        navigate(`/channelPartner/add/${row.ChannelPartnerId}`, {
            state: {
                editChannelPartnerData: row,
                fromList: true,
                listState: listState ?? {
                    page: 1,
                    filters: {},
                    sortInfo: undefined,
                    searchTerm: ''
                }
            }
        });
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListChannelPartner = () => {
        navigate('/channelPartner', {
            state: {
                listState: listState ?? {
                    page: 1,
                    filters: {},
                    sortInfo: undefined,
                    searchTerm: ''
                }
            }
        });
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            {/* Header Details*/}
            <HeaderActionBar
                titleText="Channel Partner : "
                subTitleText={editChannelPartnerData.Name}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListChannelPartner()}
                canAction={canAction}
                onEdit={() => {

                    if (editChannelPartnerData) handleEditChannelPartner(editChannelPartnerData!);

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
                                        {editChannelPartnerData.CompanyName || '-'}
                                    </span>
                                </div>

                                <div className="flex items-start">
                                    <span className="text-gray-500 font-medium text-sm w-[120px]">
                                        Firm Type
                                    </span>
                                    <span className="text-gray-500 font-medium text-sm px-2">:</span>
                                    <span className="text-black text-sm break-all">
                                        {editChannelPartnerData.FirmsType || '-'}
                                    </span>
                                </div>

                            </div>
                        </div>



                        {/* Basic Deatils */}

                        <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4">
                            <FieldItem label="Mobile No:" value={editChannelPartnerData.MobileNumber ? `+91 ${editChannelPartnerData.MobileNumber}` : '-'} />
                            <FieldItem label="E-Mail ID" value={editChannelPartnerData.EmailId} />
                            <FieldItem label="Alternative Contact No:" value={editChannelPartnerData.AlternativeMobileNumber ? `+91 ${editChannelPartnerData.AlternativeMobileNumber}` : '-'} />
                            <FieldItem label="Speciality" value={editChannelPartnerData.Speciality} />
                            <FieldItem label="Is RERA Number" value={editChannelPartnerData.RERANumber != "" ? 'Yes' : 'No'} />
                            <FieldItem label="RERA Number" value={editChannelPartnerData.RERANumber} />
                            <FieldItem label="Office Address" value={editChannelPartnerData.OfficeAddress} />
                            <FieldItem label="PAN Number" value={editChannelPartnerData.PanNumber} urls={editChannelPartnerData.PanCardURL} isIcon />
                            <FieldItem label="Aadhaar Number" value={editChannelPartnerData.AadharCardNumber} urls={editChannelPartnerData.AadharCardURL} isIcon />
                            <FieldItem label="GST Number" value={editChannelPartnerData.GSTNumber} />
                            <FieldItem label="Created By" value={editChannelPartnerData.CreatedBy} />
                            <FieldItem label="Created Date" value={editChannelPartnerData.CreatedDate ? formatDate_dd_MonthName_yy(editChannelPartnerData.CreatedDate) : ""} />
                            <FieldItem label="Modified By" value={editChannelPartnerData.ModifiedBy} />
                            <FieldItem label="Modified Date" value={editChannelPartnerData.ModifiedDate ? formatDate_dd_MonthName_yy(editChannelPartnerData.ModifiedDate) : ""} />
                        </div>
                    </div>
                </div>

                {/*  RIGHT SIDE  */}
                <div className="col-span-4">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

                        <div className="mt-2 pb-4 border-b-2 border-gray-300">
                            <div className="flex items-center gap-4">
                                <h1 className="text-lg text-black">Project Assigned to this Channel Partner</h1>
                            </div>
                        </div>
                        {editChannelPartnerData?.ProjectName !== "" ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {editChannelPartnerData?.ProjectName?.split(',')
                                    .map(p => p.trim())
                                    .filter(p => p.length > 0)
                                    .map((p, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                        >
                                            {p}
                                        </span>
                                    ))}
                            </div>
                        ) : <div className="flex items-center justify-center  h-full ">
                            <NoDataView message="No Project Assigned to this Channel Partner" />
                        </div>
                        }

                    </div>

                </div>


            </div>
        </div>
    );
};

export default ViewChannelPartner;
