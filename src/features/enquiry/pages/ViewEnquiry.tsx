import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { EnquiryData, FilterWithPaginationEnquiryRequest } from "../models/EnquiryModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useEnquiryListState } from "@/features/enquiry/context/EnquiryListStateContext";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { EnquiryService } from "../services/EnquiryServices";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";

const ViewEnquiry: React.FC = () => {

    // NAVIGATION
    const navigate = useNavigate();
    const { EnquiryId } = useParams<{ EnquiryId?: string }>();
    const { projectId } = useProject();
    const { listState } = useEnquiryListState();
    const { enquiryId: contextEnquiryId } = listState;
    const { addToast } = useToast();

    const [editEnquiryData, setEditEnquiryData] = useState<EnquiryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const currentEnquiryId = EnquiryId ? Number(EnquiryId) : contextEnquiryId;

    //#region MENU PERMISSION
    const { canAction } = useMenuPermissions('/enquiry');

    //#region FETCH ENQUIRY DETAILS
    useEffect(() => {
        if (!projectId || !currentEnquiryId || currentEnquiryId === 0) return;

        const fetchEnquiryDetails = async () => {
            await runApiWithLoader(
                setIsLoading,
                setLoadingMessage,
                async () => {
                    const params: FilterWithPaginationEnquiryRequest = {
                        PageNumber: 1,
                        PageSize: 1,
                        EnquiryId: currentEnquiryId,
                        ProjectId: Number(projectId)
                    };

                    const response = await EnquiryService.apiCallPullEnquiry(params);

                    if (E.isRight(response)) {
                        const enquiry = response.right.Data?.[0];
                        if (enquiry) {
                            setEditEnquiryData(enquiry);
                        } else {
                            addToast({ type: 'error', title: 'Enquiry not found' });
                        }
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
                'Loading Enquiry'
            );
        };

        fetchEnquiryDetails();
    }, [projectId, currentEnquiryId, addToast]);

    // MESSAGE IF DATA NOT FOUND
    if (!editEnquiryData) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
                <Loader loading={isLoading} title={loadingMessage}>
                    <div>No Enquiry Data Found</div>
                </Loader>
            </div>
        );
    }

    //#region EDIT ENQUIRY MASTER
    const handleEditEnquiry = (row: EnquiryData) => {
        if (!row?.EnquiryId) return;
        navigate(`/enquiry/add/${row.EnquiryId}`);
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListEnquiry = () => {
        navigate('/enquiry');
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            {/* Header Details*/}
            <HeaderActionBar
                titleText={editEnquiryData.Name ?? ''}
                subTitleText={editEnquiryData.FinalStage ?? ''}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListEnquiry()}
                canAction={canAction}
                onEdit={() => {
                    if (editEnquiryData) handleEditEnquiry(editEnquiryData!);
                }}
                isLoading={false}
            />

            <div className="grid grid-cols-12 gap-4 pt-5">

                {/* LEFT SIDE PROFILE CARD */}
                <div className="col-span-6">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">

                        {/* HEADER  DETAILS */}
                        <div className="border-b pb-2 mt-1">
                            <div className="flex items-start justify-between">

                                {/* LEFT — TITLE */}
                                <h1 className="text-lg font-semibold text-black">
                                    Lead Information
                                </h1>

                                {/* RIGHT — DATES */}
                                <div className="text-xs text-gray-700">

                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 w-32 text-right">
                                            Enquiry Date
                                        </span>
                                        <span>:</span>
                                        <span className="font-semibold w-24 text-right">
                                            {formatDate_dd_mm_yyyy(editEnquiryData.EnquiryDate)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-gray-500 w-32 text-right">
                                            Next Follow-up Date
                                        </span>
                                        <span>:</span>
                                        <span className="font-semibold w-24 text-right">
                                            {formatDate_dd_mm_yyyy(editEnquiryData.NextFollowUpDate)}
                                        </span>
                                    </div>

                                </div>

                            </div>
                        </div>


                        {/* Basic Deatils */}

                        <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4">

                            <FieldItem label="Mobile No:" value={editEnquiryData.MobileNumber ? `+91 ${editEnquiryData.MobileNumber}` : '-'} />
                            <FieldItem label="E-Mail ID" value={editEnquiryData.EmailId} />
                            <FieldItem label="Age" value={editEnquiryData.Age} />
                            <FieldItem label="Accommodation" value={editEnquiryData.Accommodation} />
                            <FieldItem label="Occupation Type" value={editEnquiryData.OccupationType} />
                            <FieldItem label="Nationality" value={editEnquiryData.Nationality} />
                            {editEnquiryData.Nationality?.toUpperCase() !== "INDIAN" ? (
                                <>
                                    <FieldItem label="Country Of Residence" value={editEnquiryData.CountryOfResidence} />
                                    <FieldItem label="City Of Residence" value={editEnquiryData.CityOfResidence} />
                                </>
                            ) : null}

                            <FieldItem label="Possession Type" value={editEnquiryData.PossessionType} />
                            <FieldItem label="Area Preferred" value={editEnquiryData.AreaPreferred} />
                            <FieldItem label="Desired Floor Band" value={editEnquiryData.DesiredFloorBand} />
                            <FieldItem label="Budget (In CR)" value={editEnquiryData.Budget} />
                            <FieldItem label="Neighborhood Places" value={editEnquiryData.NeighborhoodPlacesInterestedIn} />
                            <FieldItem label="Requirement" value={editEnquiryData.Requirement} />
                            <FieldItem label="Requirement Type" value={editEnquiryData.RequirementType} />
                            <FieldItem label="Customer Classification" value={editEnquiryData.CustomerClassification} />
                            <FieldItem label="Source Of Funding" value={editEnquiryData.SourceOfFunding} />
                            <FieldItem label="Ethnicity" value={editEnquiryData.Ethnicity} />
                            <FieldItem label="Source " value={editEnquiryData.Source} />
                            {editEnquiryData.SubSource !== "" ? <FieldItem label="Sub Source " value={editEnquiryData.SubSource} /> : ""}
                            {editEnquiryData.ChannelPartnerName !== "" ? <FieldItem label="Channel Partner " value={editEnquiryData.ChannelPartnerName} /> : ""}
                            {editEnquiryData.ChannelPartnerName !== "" ? <FieldItem label="Channel Partner Number:" value={editEnquiryData.ChannelPartnerMobileNumber ? `+91 ${editEnquiryData.ChannelPartnerMobileNumber}` : '-'} /> : ""}
                            <FieldItem label="Final Stage " value={editEnquiryData.FinalStage} />
                            {editEnquiryData.FinalStageDetail !== "" ? <FieldItem label="Final Stage Detail " value={editEnquiryData.FinalStageDetail} /> : ""}
                            <FieldItem label="Sales Advisor" value={editEnquiryData.SalesAdvisor} />
                            <FieldItem label="Sourcing Manager" value={editEnquiryData.SourcingManager} />
                            <FieldItem label="Presales Executive" value={editEnquiryData.PresalesExecutive} />
                            <FieldItem label="Customer Time In" value={editEnquiryData.EnquiryTimeIn} />
                            <FieldItem label="Customer Time Out" value={editEnquiryData.EnquiryTimeOut} />
                            <FieldItem label="Remarks" value={editEnquiryData.Remark} />
                            <FieldItem label="Created By" value={editEnquiryData.CreatedBy} />
                            <FieldItem label="Created Date" value={editEnquiryData.CreatedDate ? formatDate_dd_MonthName_yy(editEnquiryData.CreatedDate) : ""} />
                            <FieldItem label="Modified By" value={editEnquiryData.ModifiedBy} />
                            <FieldItem label="Modified Date" value={editEnquiryData.ModifiedDate ? formatDate_dd_MonthName_yy(editEnquiryData.ModifiedDate) : ""} />

                        </div>
                    </div>
                </div>

                {/*  RIGHT SIDE  */}
                <div className="col-span-6">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

                        <div className="mt-2 pb-4 border-b-2 border-gray-300">

                            <div className="flex items-center gap-4">
                                <h1 className="text-lg font-semibold text-black">Remarks & Activity</h1>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ViewEnquiry;
