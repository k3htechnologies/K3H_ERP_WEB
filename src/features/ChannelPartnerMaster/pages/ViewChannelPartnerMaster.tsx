import { Button } from "@/ui/components/forms";
import { Edit, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { useToast } from "@/core/hooks/useToast";
import type { ChannelPartnerMasterData, DeleteChannelPartnerMasterRequest } from "../models/ChannelPartnerMasterModel";
import { ChannelPartnerMasterService } from "../services/ChannelPartnerMasterService";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

const ViewChannelPartnerMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [, setIsLoadingMessage] = useState('');

    //DELETE CHANNEL PARTNER MASTER 
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteChannelPartnerMasterDetailsData, setDeleteChannelPartnerMasterDetailsData] = useState<ChannelPartnerMasterData | null>(null)

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    // TOAST
    const { addToast } = useToast();

    // Selected ChannelPartner data passed from the ChannelPartner List page (via navigate state)
    const editChannelPartnerData = location.state?.editChannelPartnerData as ChannelPartnerMasterData;

    // Stores pagination, filters, and sorting state of ChannelPartner List page to restore on back navigation

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editChannelPartnerData) return <div>No channel Partner Data Found</div>;

    //#region DELETE Channel Partner MASTER
    const handleDeleteChannelPartnerMaster = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteChannelPartnerMasterDetailsData) return;

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,
            async () => {
                const params: DeleteChannelPartnerMasterRequest = {

                    ChannelPartnerId: deleteChannelPartnerMasterDetailsData.ChannelPartnerId || 0,

                    Uniquekey: deleteChannelPartnerMasterDetailsData.Uniquekey || ""
                };

                const response = await ChannelPartnerMasterService.apiCallDeleteChannelPartnerMaster(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/channelPartnerMaster", { state: { listState } });
                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting channel Partner Master Data"
        );
    };

    //#region EDIT CHANNEL PARTNER MASTER
    const handleEditChannelPartnerMaster = (row: ChannelPartnerMasterData) => {
        if (!row?.ChannelPartnerId) return;
        navigate(`/channelPartnerMaster/add/${row.ChannelPartnerId}`, {
            state: {
                editChannelPartnerData: row,
                fromList: true,
                listState: listState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListChannelPartnerMaster = () => {
        navigate('/channelPartnerMaster', {
            state: { listState: listState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
        });
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <div className="grid grid-cols-12 gap-6">

                {/* LEFT SIDE PROFILE CARD */}
                <div className="col-span-5">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">

                        {/* HEADER  DETAILS*/}
                        <div className="pt-6 px-2 pb-4 text-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editChannelPartnerData.Name}
                                <span className="inline-block ml-2 text-green-500">●</span>
                            </h3>

                            <div className="mt-2 flex justify-center gap-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                    {editChannelPartnerData.CompanyName}
                                </span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                    {editChannelPartnerData.MobileNumber}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4">
                            {/* <FieldItem label="Full Name" value={editChannelPartnerData.Name} />
                            <FieldItem label="Contact No" value={editChannelPartnerData.MobileNumber} /> */}
                            <FieldItem label="E-Mail ID" value={editChannelPartnerData.EmailId} />
                            <FieldItem label="Alternative Mobile Number" value={editChannelPartnerData.AlternativeMobileNumber} />
                            <FieldItem label="Speciality" value={editChannelPartnerData.Speciality} />
                            <FieldItem label="Designation" value={editChannelPartnerData.DesignationMasterId} />
                            <FieldItem label="PAN Number" value={editChannelPartnerData.PanNumber} />
                            <FieldItem label="Aadhar Number" value={editChannelPartnerData.AadharCardNumber} />
                            <FieldItem label="GST Number" value={editChannelPartnerData.GSTNumber} />
                            <FieldItem label="RERA Number" value={editChannelPartnerData.RERANumber} />
                            <FieldItem label="Office Address" value={editChannelPartnerData.OfficeAddress} />
                            <FieldItem label="Village Address" value={editChannelPartnerData.VillageMasterId} />
                            <FieldItem label="Created By" value={editChannelPartnerData.CreatedBy} />
                            <FieldItem label="Created Date" value={editChannelPartnerData.CreatedDate ? formatDate_dd_MonthName_yy(editChannelPartnerData.CreatedDate) : ""} />
                            <FieldItem label="Modified By" value={editChannelPartnerData.ModifiedBy} />
                            <FieldItem label="Modified Date" value={editChannelPartnerData.ModifiedDate ? formatDate_dd_MonthName_yy(editChannelPartnerData.ModifiedDate) : ""} />

                        </div>

                        <div className="flex justify-center gap-3 mt-6">
                            <Button
                                color='blue'
                                size='sm'
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditChannelPartnerMaster(editChannelPartnerData!);
                                }}
                            >
                                <Edit className="w-4 h-4" /> Edit
                            </Button>

                            <Button
                                color="gray"
                                variant="solid"
                                size="sm"
                                colorMode="light"
                                onClick={() => {
                                    setDeleteChannelPartnerMasterDetailsData(editChannelPartnerData);
                                    setIsConfirmationDialogBoxOpen(true);
                                }}
                            >
                                <Trash2 className="h-5 w-5" /> Delete
                            </Button>

                            <Button
                                color="transparent"
                                variant="transparent_border"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBackToListChannelPartnerMaster();
                                }}
                            >
                                Cancel
                            </Button>
                        </div>

                    </div>
                </div>

                {/*  RIGHT SIDE  */}
                <div className="col-span-7">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">



                    </div>
                </div>
                {/* DELETE CONFIRMATION  CHANNEL PATNER MODAL */}
                <ConfirmationDialogBox
                    isOpen={isConfirmationDialogBoxOpen}
                    onClose={() => setIsConfirmationDialogBoxOpen(false)}
                    onConfirm={handleDeleteChannelPartnerMaster}
                    title="You are about to delete this Channel Partner?"
                    message="Deleting this Channel Partner will permanently remove its data."
                    confirmText="Delete"
                    cancelText="Cancel"
                    loading={isLoading}
                    variant="danger"
                />

            </div>
        </div>
    );
};

export default ViewChannelPartnerMaster;
