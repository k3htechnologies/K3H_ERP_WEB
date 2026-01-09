<<<<<<< HEAD
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { EnquiryData, FilterWithPaginationEnquiryRequest } from "../models/EnquiryModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useEnquiryListState } from "@/features/enquiry/context/EnquiryListStateContext";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { EnquiryService } from "@/features/enquiry/services/EnquiryServices";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import type { AddUpdateEnquiryFollowUpRequest, DeleteEnquiryFollowUpRequest, EnquiryFollowUpData, FilterWithPaginationEnquiryFollowUpRequest } from "../models/EnquiryFollowUpModel";
import { enquiryFollowUpService } from "@/features/enquiry/services/EnquiryFollowUpServices";
import { Button } from "@/ui/components/forms/Button";
import { Modal } from "@/ui/components/Modal/Modal";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { FINAL_STAGE_TYPE_OPTIONS } from "@/core/constants";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { Input } from "@/ui/components/forms";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { Edit, Trash2 } from "lucide-react";
import { getStatusColor } from "./Status";

const ViewEnquiry: React.FC = () => {

    // NAVIGATION
    const navigate = useNavigate();
    const { EnquiryId } = useParams<{ EnquiryId?: string }>();
    const { projectId } = useProject();
    const { listState } = useEnquiryListState();
    const { enquiryId: contextEnquiryId } = listState;
    const currentEnquiryId = EnquiryId ? Number(EnquiryId) : contextEnquiryId;
    const { addToast } = useToast();

    const [editEnquiryData, setEditEnquiryData] = useState<EnquiryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [editEnquiryFollowUpData, setEditEnquiryFollowUpData] = useState<EnquiryFollowUpData[]>([]);
    const [isEnquiryFollowUpModalOpen, setIsEnquiryFollowUpModalOpen] = useState(false);
    const [, setIsEditEnquiryFollowUpMode] = useState(false);

    // Delete confirmation states
    const [isDeleteEnquiryFollowUpDialogOpen, setIsDeleteEnquiryFollowUpDialogOpen] = useState(false);
    const [selectedEnquiryFollowUpItem, setSelectedEnquiryFollowUpItem] = useState<EnquiryFollowUpData | null>(null);

    // ENQUIRY FOLLOW UP form state
    const [enquiryFollowUpFormData, setEnquiryFollowUpFormData] = useState<AddUpdateEnquiryFollowUpRequest>({
        EnquiryFollowUpId: 0,
        ProjectId: Number(projectId) || 0,
        EnquiryId: EnquiryId ? Number(EnquiryId) : contextEnquiryId,
        Status: '',
        NextFollowUpDate: '',
        Remark: '',
        Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
    const [enquiryFollowUpFormErrors, setEnquiryFollowUpErrors] = useState<{
        Status?: string;
        NextFollowUpDate?: string;
        Remark?: string;
    }>({});
=======
import { useLocation, useNavigate } from "react-router-dom";
import type { EnquiryData } from "../models/EnquiryModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const ViewEnquiry: React.FC = () => {

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5

    //#region MENU PERMISSION
    const { canAction } = useMenuPermissions('/enquiry');

<<<<<<< HEAD
    //#region FETCH ENQUIRY DETAILS
    useEffect(() => {
        if (!projectId || !currentEnquiryId || currentEnquiryId === 0) return;

        fetchEnquiryDetails();

        fetchEnquiryFollowUpDetails();

    }, [projectId, currentEnquiryId, addToast]);
    //#endregion

    //#region FETCH ENQUIRY DETAILS

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

                    const enquiryList = Array.isArray(response.right.Data) ? response.right.Data : [];

                    setEditEnquiryData(enquiryList);

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


    const fetchEnquiryFollowUpDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationEnquiryFollowUpRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    EnquiryId: currentEnquiryId,
                    ProjectId: Number(projectId)
                };

                const response = await enquiryFollowUpService.apiCallPullEnquiryFollowUp(params);

                if (E.isRight(response)) {

                    setEditEnquiryFollowUpData(response.right.Data);

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
            'Loading Enquiry Follow Up'
        );
    };

    //#endregion


    //#region EDIT ENQUIRY MASTER
    const handleEditEnquiry = (row: EnquiryData) => {
        if (!row?.EnquiryId) return;
        navigate(`/enquiry/add/${row.EnquiryId}`);
=======
    const editEnquiryData = location.state?.editEnquiryData as EnquiryData;

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editEnquiryData) return <div>No Enquiry Data Found</div>;

    //#region EDIT ENQUIRY 
    const handleEditEnquiry = (row: EnquiryData) => {
        if (!row?.EnquiryId) return;
        navigate(`/enquiry/add/${row.EnquiryId}`, {
            state: {
                editEnquiryData: row,
                fromList: true,
                listState: listState ?? {
                    page: 1,
                    filters: {},
                    sortInfo: undefined,
                    searchTerm: ''
                }
            }
        });
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListEnquiry = () => {
<<<<<<< HEAD
        navigate('/enquiry');
    };
    //#endregion

    //#region EDUCATION MODAL HANDLERS
    const handleOpenEnquiryFollowUpModal = (item?: EnquiryFollowUpData) => {
        if (item) {
            setEnquiryFollowUpFormData({
                EnquiryFollowUpId: item.EnquiryFollowUpId,
                Uniquekey: item.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                EnquiryId: Number(currentEnquiryId),
                ProjectId: Number(projectId),
                Status: item.Status || '',
                NextFollowUpDate: item.NextFollowUpDate || '',
                Remark: item.Remark || '',

            });
            setIsEditEnquiryFollowUpMode(true);
        } else {
            // Add mode
            setEnquiryFollowUpFormData({
                EnquiryFollowUpId: 0,
                Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                EnquiryId: Number(currentEnquiryId),
                ProjectId: Number(projectId),
                Status: '',
                NextFollowUpDate: '',
                Remark: '',
            });
            setIsEditEnquiryFollowUpMode(false);
        }
        setEnquiryFollowUpErrors({});
        setIsEnquiryFollowUpModalOpen(true);
    };

    const handleCloseEnquiryFollowUpModal = () => {
        setIsEnquiryFollowUpModalOpen(false);
        setIsEditEnquiryFollowUpMode(false);
        setEnquiryFollowUpFormData({
            EnquiryFollowUpId: 0,
            Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            EnquiryId: Number(EnquiryId),
            ProjectId: Number(projectId),
            Status: '',
            NextFollowUpDate: '',
            Remark: '',
        });
        setEnquiryFollowUpErrors({});
    };

    const validateEnquiryFollowUpForm = (): boolean => {
        const errors: {
            Status?: string;
            NextFollowUpDate?: string;
            Remark?: string;
        } = {};

        if (!enquiryFollowUpFormData.Status?.trim()) {
            errors.Status = 'Status is required';
        }
        if (!enquiryFollowUpFormData.NextFollowUpDate?.trim()) {
            errors.NextFollowUpDate = 'Next FollowUp Date is required';
        }
        if (!enquiryFollowUpFormData.Remark?.trim()) {
            errors.Remark = 'Remark is required';
        }

        setEnquiryFollowUpErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEnquiryFollowUpFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEnquiryFollowUpForm()) {
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: AddUpdateEnquiryFollowUpRequest = {
                    EnquiryFollowUpId: enquiryFollowUpFormData.EnquiryFollowUpId,
                    Uniquekey: enquiryFollowUpFormData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    EnquiryId: Number(currentEnquiryId),
                    ProjectId: Number(projectId),
                    Status: enquiryFollowUpFormData.Status || '',
                    NextFollowUpDate: enquiryFollowUpFormData.NextFollowUpDate || '',
                    Remark: enquiryFollowUpFormData.Remark || '',
                };

                const response = await enquiryFollowUpService.apiCallAddUpdateEnquiryFollowUp(params);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    handleCloseEnquiryFollowUpModal();
                    fetchEnquiryFollowUpDetails();
                    fetchEnquiryDetails();

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
            'Add Follow Up'
        );
    };

    //#endregion

    //#region ENQUIRY FOLLOW UP DELETE HANDLER

    const handleDeleteEnquiryFollowUp = (item: EnquiryFollowUpData) => {
        setSelectedEnquiryFollowUpItem(item);
        setIsDeleteEnquiryFollowUpDialogOpen(true);
    };

    const handleConfirmDeleteEnquiryFollowUp = async () => {
        if (!selectedEnquiryFollowUpItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteEnquiryFollowUpRequest = {
                    EnquiryFollowUpId: selectedEnquiryFollowUpItem.EnquiryFollowUpId || 0,
                    Uniquekey: selectedEnquiryFollowUpItem.Uniquekey || '',
                    EnquiryId: Number(currentEnquiryId),
                    ProjectId: Number(projectId)
                };

                const response = await enquiryFollowUpService.apiCallDeleteEnquiryFollowUp(params);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    setIsDeleteEnquiryFollowUpDialogOpen(false);
                    setSelectedEnquiryFollowUpItem(null);
                    fetchEnquiryFollowUpDetails();
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
            'Deleting Enquiry Follow Up Details'
        );
    };

    //#endregion

    const enquiryData = editEnquiryData!.length > 0 ? editEnquiryData[0] : undefined

    const safe = (value?: any) => (value === null || value === undefined || value === '' ? '-' : value)

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            {/* Header Details*/}
            <HeaderActionBar
                titleText={enquiryData?.Name ?? ''}
                subTitleText={enquiryData?.FinalStage ?? ''}
=======
        navigate('/enquiry', {
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
                titleText={editEnquiryData.Name ?? ''}
                subTitleText={editEnquiryData.FinalStage ?? ''}
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListEnquiry()}
                canAction={canAction}
                onEdit={() => {
<<<<<<< HEAD
                    if (enquiryData) handleEditEnquiry(enquiryData!);
=======
                    if (editEnquiryData) handleEditEnquiry(editEnquiryData!);
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5
                }}
                isLoading={false}
            />

            <div className="grid grid-cols-12 gap-4 pt-5">

                {/* LEFT SIDE PROFILE CARD */}
                <div className="col-span-6">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">

                        {/* HEADER  DETAILS */}
<<<<<<< HEAD
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
                                            {formatDate_dd_mm_yyyy(safe(enquiryData?.EnquiryDate ?? ""))}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-gray-500 w-32 text-right">
                                            Next Follow-up Date
                                        </span>
                                        <span>:</span>
                                        <span className="font-semibold w-24 text-right">
                                            {formatDate_dd_mm_yyyy(safe(enquiryData?.NextFollowUpDate))}
                                        </span>
                                    </div>

=======
                        <div className="mt-1 pb-2 border-b-2 border-gray-300">
                            <div className="flex items-center gap-50">
                                <h1 className="text-lg text-black">Enquiry Details</h1>

                                <div className="flex flex-col gap-3 text-xs text-gray-700">
                                    <div>
                                        <span className="font-medium ">Enquiry Date:</span>{" "}
                                        {editEnquiryData.EnquiryDate
                                            ? formatDate_dd_mm_yyyy(editEnquiryData.EnquiryDate)
                                            : "-"}
                                    </div>

                                    <div>
                                        <span className="font-medium">Next Follow-Up Date:</span>{" "}
                                        {editEnquiryData.NextFollowUpDate
                                            ? formatDate_dd_mm_yyyy(editEnquiryData.NextFollowUpDate)
                                            : "-"}
                                    </div>
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5
                                </div>

                            </div>
                        </div>

<<<<<<< HEAD

                        {/* Basic Deatils */}

                        <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4">
                            <FieldItem label="Unique Code:" value={safe(enquiryData?.SystemGeneratedCode)} />
                            <FieldItem label="Mobile No:" value={safe(enquiryData?.MobileNumber) ? `+91 ${safe(enquiryData?.MobileNumber)}` : '-'} />
                            <FieldItem label="E-Mail ID" value={safe(enquiryData?.EmailId)} />
                            <FieldItem label="Age" value={safe(enquiryData?.Age)} />
                            <FieldItem label="Accommodation" value={safe(enquiryData?.Accommodation)} />
                            <FieldItem label="Occupation Type" value={safe(enquiryData?.OccupationType)} />
                            <FieldItem label="Nationality" value={safe(enquiryData?.Nationality)} />
                            {safe(enquiryData?.Nationality?.toUpperCase()) !== "INDIAN" ? (
                                <>
                                    <FieldItem label="Country Of Residence" value={safe(enquiryData?.CountryOfResidence)} />
                                    <FieldItem label="City Of Residence" value={safe(enquiryData?.CityOfResidence)} />
                                </>
                            ) : null}

                            <FieldItem label="Possession Type" value={safe(enquiryData?.PossessionType)} />
                            <FieldItem label="Area Preferred" value={safe(enquiryData?.AreaPreferred)} />
                            <FieldItem label="Desired Floor Band" value={safe(enquiryData?.DesiredFloorBand)} />
                            <FieldItem label="Budget (In CR)" value={safe(enquiryData?.Budget)} />
                            <FieldItem label="Neighborhood Places" value={safe(enquiryData?.NeighborhoodPlacesInterestedIn)} />
                            <FieldItem label="Requirement" value={safe(enquiryData?.Requirement)} />
                            <FieldItem label="Requirement Type" value={safe(enquiryData?.RequirementType)} />
                            <FieldItem label="Customer Classification" value={safe(enquiryData?.CustomerClassification)} />
                            <FieldItem label="Source Of Funding" value={safe(enquiryData?.SourceOfFunding)} />
                            <FieldItem label="Ethnicity" value={safe(enquiryData?.Ethnicity)} />
                            <FieldItem label="Source " value={safe(enquiryData?.Source)} />
                            {safe(enquiryData?.SubSource) !== "" ? <FieldItem label="Sub Source " value={safe(enquiryData?.SubSource)} /> : ""}
                            {safe(enquiryData?.ChannelPartnerName) !== "" ? <FieldItem label="Channel Partner " value={safe(enquiryData?.ChannelPartnerName)} /> : ""}
                            {safe(enquiryData?.ChannelPartnerName) !== "" ? <FieldItem label="Channel Partner Number:" value={safe(enquiryData?.ChannelPartnerMobileNumber) ? `+91 ${safe(enquiryData?.ChannelPartnerMobileNumber)}` : '-'} /> : ""}
                            <FieldItem label="Final Stage " value={safe(enquiryData?.FinalStage)} />
                            {safe(enquiryData?.FinalStageDetail) !== "" ? <FieldItem label="Final Stage Detail " value={safe(enquiryData?.FinalStageDetail)} /> : ""}
                            <FieldItem label="Sales Advisor" value={safe(enquiryData?.SalesAdvisor)} />
                            <FieldItem label="Sourcing Manager" value={safe(enquiryData?.SourcingManager)} />
                            <FieldItem label="Presales Executive" value={safe(enquiryData?.PresalesExecutive)} />
                            <FieldItem label="Customer Time In" value={safe(enquiryData?.EnquiryTimeIn)} />
                            <FieldItem label="Customer Time Out" value={safe(enquiryData?.EnquiryTimeOut)} />
                            <FieldItem label="Remarks" value={safe(enquiryData?.Remark)} />
                            <FieldItem label="Created By" value={safe(enquiryData?.CreatedBy)} />
                            <FieldItem label="Created Date" value={safe(enquiryData?.CreatedDate) ? formatDate_dd_MonthName_yy(safe(enquiryData?.CreatedDate)) : ""} />
                            <FieldItem label="Modified By" value={safe(enquiryData?.ModifiedBy)} />
                            <FieldItem label="Modified Date" value={safe(enquiryData?.ModifiedDate) ? formatDate_dd_MonthName_yy(safe(enquiryData?.ModifiedDate)) : ""} />
=======
                        {/* Basic Deatils */}

                        <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4">

                            <FieldItem label="Contact No:" value={editEnquiryData.MobileNumber ? `+91 ${editEnquiryData.MobileNumber}` : '-'} />
                            <FieldItem label="E-Mail ID" value={editEnquiryData.EmailId} />
                            <FieldItem label="Project Name" value={editEnquiryData.ProjectName} />
                            <FieldItem label="Age" value={editEnquiryData.Age} />
                            <FieldItem label="Accommodation" value={editEnquiryData.Accommodation} />
                            <FieldItem label="Occupation Type" value={editEnquiryData.OccupationType} />
                            <FieldItem label="Nationality" value={editEnquiryData.Nationality} />
                            <FieldItem label="Country Of Residence" value={editEnquiryData.CountryOfResidence} />
                            <FieldItem label="City Of Residence" value={editEnquiryData.CityOfResidence} />
                            <FieldItem label="Possession Type" value={editEnquiryData.PossessionType} />
                            <FieldItem label="Area Preferred" value={editEnquiryData.AreaPreferred} />
                            <FieldItem label="Desired Floor Band" value={editEnquiryData.DesiredFloorBand} />
                            <FieldItem label="Budget" value={editEnquiryData.Budget} />
                            <FieldItem label="Neighborhood Places" value={editEnquiryData.NeighborhoodPlacesInterestedIn} />
                            <FieldItem label="Requirement" value={editEnquiryData.Requirement} />
                            <FieldItem label="Requirement Type" value={editEnquiryData.RequirementType} />
                            <FieldItem label="Customer Classification" value={editEnquiryData.CustomerClassification} />
                            <FieldItem label="Source Of Funding" value={editEnquiryData.SourceOfFunding} />
                            <FieldItem label="Ethnicity" value={editEnquiryData.Ethnicity} />
                            <FieldItem label="Source " value={editEnquiryData.Source} />
                            <FieldItem label="Sub Source " value={editEnquiryData.SubSource} />
                            <FieldItem label="Channel Partner " value={editEnquiryData.ChannelPartnerName} />
                            <FieldItem label="Channel Partner Number:" value={editEnquiryData.ChannelPartnerMobileNumber ? 
                                `+91 ${editEnquiryData.ChannelPartnerMobileNumber}` : '-'} />
                            <FieldItem label="Final Stage " value={editEnquiryData.FinalStage} />
                            <FieldItem label="Final Stage Detail " value={editEnquiryData.FinalStageDetail} />
                            <FieldItem label="Sales Advisor" value={editEnquiryData.SalesAdvisor} />
                            <FieldItem label="Sourcing Manager" value={editEnquiryData.SourcingManager} />
                            <FieldItem label="Presales Executive" value={editEnquiryData.PresalesExecutive} />
                            <FieldItem label="Customer Time In" value={editEnquiryData.EnquiryTimeIn} />
                            <FieldItem label="Customer Time Out" value={editEnquiryData.EnquiryTimeOut} />
                            <FieldItem label="Remarks" value={editEnquiryData.Remark} />
                            <FieldItem label="Created By" value={editEnquiryData.CreatedBy} />
                            <FieldItem label="Created Date" value={editEnquiryData.CreatedDate ? formatDate_dd_MonthName_yy(editEnquiryData.CreatedDate) : "-"} />
                            <FieldItem label="Modified By" value={editEnquiryData.ModifiedBy} />
                            <FieldItem label="Modified Date" value={editEnquiryData.ModifiedDate ? formatDate_dd_MonthName_yy(editEnquiryData.ModifiedDate) : "-"} />
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5

                        </div>
                    </div>
                </div>

                {/*  RIGHT SIDE  */}
                <div className="col-span-6">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

<<<<<<< HEAD
                        <div className="border-b pb-2 mt-1">
                            <div className="flex items-start justify-between">

                                {/* LEFT — TITLE */}
                                <h1 className="text-lg font-semibold text-black">
                                    Remark & Activity
                                </h1>

                                {/* RIGHT — DATES */}
                                <div className="text-xs text-gray-700">

                                    <div className="flex items-center gap-2">
                                        <Button
                                            color="blue"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEnquiryFollowUpModal()
                                            }}
                                            title="Follow-Up">
                                            Follow Up
                                        </Button>
                                    </div>

                                </div>

                            </div>
                        </div>

                        <div className="mt-3">

                            {editEnquiryFollowUpData?.map((item, index) => (
                                <div key={item.EnquiryFollowUpId} className="grid grid-cols-[24px_1fr] gap-3">

                                    {/* LEFT — DOT + LINE */}
                                    <div className="flex flex-col items-center">

                                        {/* DOT */}
                                        <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                                        <div className="w-[3px] bg-blue-600 flex-1"></div>
                                        {/* LINE (hide after last item) */}
                                        {index !== editEnquiryFollowUpData.length - 1 && (
                                            <div className="w-[3px] bg-blue-600 flex-1"></div>
                                        )}
                                    </div>

                                    {/* RIGHT — CONTENT */}
                                    <div>

                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-900">
                                                {formatDate_dd_MonthName_yy_hh_mm(item.CreatedDate ?? "")}
                                            </span>

                                            <span className="text-xs text-gray-500">
                                                {(() => {
                                                    const { bg, text } = getStatusColor(item.Status || '');
                                                    return (
                                                        <span
                                                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                                            style={{ backgroundColor: bg, color: text }}
                                                        >
                                                            {item.Status || "-"}
                                                        </span>
                                                    );
                                                })()}
                                            </span>
                                            {index === 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        color='transparent'
                                                        isborderRadius
                                                        size='sm'
                                                        style={{
                                                            color: 'blue',
                                                            padding: '4px 8px'
                                                        }}
                                                        title="Edit"
                                                        onClick={() => handleOpenEnquiryFollowUpModal(item)}
                                                        disabled={isLoading}
                                                        leftIcon={<Edit className="h-4 w-4" />}
                                                    >
                                                    </Button>
                                                    <Button
                                                        color='transparent'
                                                        isborderRadius
                                                        size='sm'
                                                        style={{
                                                            color: 'red',
                                                            padding: '4px 8px'
                                                        }}
                                                        title="Delete"
                                                        onClick={() => handleDeleteEnquiryFollowUp(item)}
                                                        disabled={isLoading}
                                                        leftIcon={<Trash2 className="h-4 w-4" />}
                                                    >
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* REMARK */}
                                        <p className="mt-2 text-sm text-gray-700 leading-relaxed pb-5">
                                            {item.Remark || "-"}
                                        </p>
                                    </div>
                                </div>
                            ))}


                            {/* LAST ROW — NEXT FOLLOW-UP */}
                            <div className="grid grid-cols-[24px_1fr] gap-3">

                                <div className="flex flex-col items-center">
                                    <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        {enquiryData?.NextFollowUpDate
                                            ? formatDate_dd_MonthName_yy(enquiryData.NextFollowUpDate)
                                            : "-"}
                                    </span>

                                    <span className="text-sm font-semibold text-gray-600">
                                        Next Follow-up
                                    </span>
                                </div>

                            </div>

                        </div>

=======
                        <div className="mt-2 pb-4 border-b-2 border-gray-300">

                            <div className="flex items-center gap-4">
                                <h1 className="text-lg text-black">Remarks & Activity</h1>

                            </div>
                        </div>
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5
                    </div>
                </div>

            </div>
<<<<<<< HEAD

            <Modal
                isOpen={isEnquiryFollowUpModalOpen}
                onClose={handleCloseEnquiryFollowUpModal}
                title={"Follow Up"}
                onSubmit={handleEnquiryFollowUpFormSubmit}
                saveText="Save"
                cancelText="Cancel"
                onCancel={handleCloseEnquiryFollowUpModal}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-4">

                    {/* STATUS / FINAL STAGE */}
                    <SinglePageSelection
                        label="Status"
                        placeholder="Select Status"
                        value={enquiryFollowUpFormData.Status ?? ''}
                        onChange={(e) => setEnquiryFollowUpFormData({ ...enquiryFollowUpFormData, Status: String(e) })}
                        options={FINAL_STAGE_TYPE_OPTIONS.map(opt => ({
                            label: opt.name,
                            value: opt.id
                        }))}
                        error={enquiryFollowUpFormErrors.Status}
                        required
                    />

                    {/* NEXT FOLLOW UP DATE */}
                    <DatePickerInput
                        label="Next Follow Up Date"
                        required
                        value={formatDate_dd_mm_yyyy(enquiryFollowUpFormData.NextFollowUpDate) ?? ''}
                        onChange={(e) => setEnquiryFollowUpFormData({ ...enquiryFollowUpFormData, NextFollowUpDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(e) })}
                        error={enquiryFollowUpFormErrors.NextFollowUpDate}
                    />

                    {/* REMARK */}
                    <Input
                        type="text"
                        label="Remark"
                        value={enquiryFollowUpFormData.Remark ?? ''}
                        onChange={(e) => setEnquiryFollowUpFormData({ ...enquiryFollowUpFormData, Remark: e.target.value })}
                        required
                        error={enquiryFollowUpFormErrors.Remark}
                        placeholder="Enter Remark"
                    />

                </div>

            </Modal>

            <ConfirmationDialogBox
                isOpen={isDeleteEnquiryFollowUpDialogOpen}
                onClose={() => {
                    setIsDeleteEnquiryFollowUpDialogOpen(false);
                    setSelectedEnquiryFollowUpItem(null);
                }}
                onConfirm={handleConfirmDeleteEnquiryFollowUp}
                title="Delete follow up Details"
                message={`Are you sure you want to delete this follow up detail? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
                variant="danger"
            />
=======
>>>>>>> bfa44a9e8ca7f45ab97331bc2bbbfdc1c50e4df5
        </div>
    );
};

export default ViewEnquiry;
