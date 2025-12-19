import { Button } from "@/ui/components/forms";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ChannelPartnerMasterData } from "../models/ChannelPartnerMasterModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

const ViewChannelPartnerMaster: React.FC = () => {

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    // Selected ChannelPartner data passed from the ChannelPartner List page (via navigate state)
    const editChannelPartnerData = location.state?.editChannelPartnerData as ChannelPartnerMasterData;

    // Stores pagination, filters, and sorting state of ChannelPartner List page to restore on back navigation

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editChannelPartnerData) return <div>No channel Partner Data Found</div>;


    //#region EDIT CHANNEL PARTNER MASTER
    const handleEditChannelPartnerMaster = (row: ChannelPartnerMasterData) => {
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
    const handleBackToListChannelPartnerMaster = () => {
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

            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-300">

                <div className="flex items-center gap-8">
                    <button
                        onClick={handleBackToListChannelPartnerMaster}
                        className="flex items-center justify-center w-6 h-6 rounded-sm bg-blue-100 hover:bg-blue-200 transition"
                        aria-label="Back"
                    >
                        <ChevronLeft className="w-5 h-5 text-black-600" />
                    </button>

                    <span className="text-lg font-semibold-800 text-gray-900">
                        {editChannelPartnerData.Name || '-'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => handleEditChannelPartnerMaster(editChannelPartnerData)}
                    >
                        Edit CP Details
                    </Button>

                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">

                {/* LEFT SIDE PROFILE CARD */}
                <div className="col-span-6">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">

                        {/* HEADER  DETAILS */}
                        <div className="mt-2 pb-4 border-b-2 border-gray-300">
                            <div className="flex items-center gap-28">
                                <h1 className="text-lg text-black">Channel Partner Details</h1>

                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 font-medium text-sm">Company Name:</span>
                                    <span className="text-black text-sm">{editChannelPartnerData.CompanyName || '-'} </span>
                                </div>
                            </div>
                        </div>

                        {/* Basic Deatils */}
                        <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4">
                            <FieldItem label=" Mobile Number" value={editChannelPartnerData.MobileNumber ? `+91 ${editChannelPartnerData.MobileNumber}` : '-'} />
                            <FieldItem label="E-Mail ID" value={editChannelPartnerData.EmailId} />
                            <FieldItem label="Speciality" value={editChannelPartnerData.Speciality} />
                            <FieldItem label="Designation" value={editChannelPartnerData.DesignationName} />
                            <FieldItem label="PAN Number" value={editChannelPartnerData.PanNumber} />
                            <FieldItem label="Aadhar Number" value={editChannelPartnerData.AdharCardNumber} />
                            <FieldItem label="GST Number" value={editChannelPartnerData.GSTNumber} />
                            <FieldItem label="RERA Number" value={editChannelPartnerData.RERANumber} />
                            <FieldItem label="Office Address" value={editChannelPartnerData.OfficeAddress} />
                            <FieldItem label="Project " value={editChannelPartnerData.ProjectName} />
                            <FieldItem label="Created By" value={editChannelPartnerData.CreatedBy} />
                            <FieldItem label="Created Date" value={editChannelPartnerData.CreatedDate ? formatDate_dd_MonthName_yy(editChannelPartnerData.CreatedDate) : ""} />
                            <FieldItem label="Modified By" value={editChannelPartnerData.ModifiedBy} />
                            <FieldItem label="Modified Date" value={editChannelPartnerData.ModifiedDate ? formatDate_dd_MonthName_yy(editChannelPartnerData.ModifiedDate) : ""} />
                        </div>
                    </div>
                </div>

                {/*  RIGHT SIDE  */}
                <div className="col-span-6">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

                        <div className="mt-2 pb-4 border-b-2 border-gray-300">

                            <div className="flex items-center gap-4">
                                <h1 className="text-lg text-black">Remarks & Activity</h1>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ViewChannelPartnerMaster;
