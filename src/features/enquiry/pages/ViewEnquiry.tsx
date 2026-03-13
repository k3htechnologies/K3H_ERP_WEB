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
import { FINAL_STAGE_DETAILS_TYPE_OPTIONS, FINAL_STAGE_TYPE_OPTIONS } from "@/core/constants";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { TextArea } from "@/ui/components/forms/Textarea";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { Edit, Trash2 } from "lucide-react";
import { getStatusColor } from "./Status";
import { calculateAge, isDateWithinPastDays } from "@/core/utils/comman";

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
        LostReason: '',
        NextFollowUpDate: '',
        Remark: '',
        Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    });
    const [enquiryFollowUpFormErrors, setEnquiryFollowUpErrors] = useState<{
        Status?: string;
        LostReason?: string;
        NextFollowUpDate?: string;
        Remark?: string;
    }>({});



    //#region MENU PERMISSION
    const { canAction } = useMenuPermissions('/enquiry');

    //#region FETCH ENQUIRY DETAILS
    useEffect(() => {
        if (!projectId || !currentEnquiryId || currentEnquiryId === 0) return;

        fetchEnquiryDetails();

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
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListEnquiry = () => {
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
                LostReason: item.LostReason || '',
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
                LostReason: '',
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
            LostReason: '',
            Remark: '',
        });
        setEnquiryFollowUpErrors({});
    };

    const validateEnquiryFollowUpForm = (): boolean => {
        const errors: {
            Status?: string;
            LostReason?: string;
            NextFollowUpDate?: string;
            Remark?: string;
        } = {};

        if (!enquiryFollowUpFormData.Status?.trim()) {
            errors.Status = 'Status is required';
        }

        if (enquiryFollowUpFormData.Status?.trim() === "Lost" && enquiryFollowUpFormData.LostReason?.trim() === "") {
            errors.LostReason = 'Lost Reason is required';
        }

        if (enquiryFollowUpFormData.Status?.trim() !== "Lost" && enquiryFollowUpFormData.Status?.trim() !== 'Booking Done' && enquiryFollowUpFormData.Status?.trim() !== 'Cancelled' && !enquiryFollowUpFormData.NextFollowUpDate?.trim()) {
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
                    LostReason: enquiryFollowUpFormData.LostReason || '',
                    NextFollowUpDate: enquiryFollowUpFormData.NextFollowUpDate || null,
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

    const canActionPerform = canAction && enquiryData?.FinalStage?.toUpperCase() !== "LOST" && enquiryData?.FinalStage?.toUpperCase() !== 'BOOKING DONE' && enquiryData?.FinalStage?.toUpperCase() !== 'CANCELLED';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            {/* Header Details*/}
            <HeaderActionBar
                titleText={enquiryData?.Name ? `${enquiryData.Name} :` : ''}
                subTitleText={enquiryData?.SystemGeneratedCode ?? ''}
                subSubTitleText={enquiryData?.FinalStage ?? ''}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListEnquiry()}
                canAction={canActionPerform}
                onEdit={() => {
                    if (enquiryData) handleEditEnquiry(enquiryData!);
                }}
                isLoading={false}
            />

            <div className="grid grid-cols-12 gap-4 pt-5">

                <div className="col-span-6">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">

                        <div className="border-b pb-2 mt-1">
                            <div className="flex items-start justify-between">

                                <h1 className="text-lg font-semibold text-black">
                                    Lead Information
                                </h1>

                                <div className="text-xs text-gray-700">

                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 w-32 text-right">
                                            Enquiry Date
                                        </span>
                                        <span>:</span>
                                        <span className="font-semibold w-32 text-right">
                                            {formatDate_dd_MonthName_yy(safe(enquiryData?.EnquiryDate ?? ""))}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-gray-500 w-32 text-right">
                                            Next Follow-up Date
                                        </span>
                                        <span>:</span>
                                        <span className="font-semibold w-32 text-right">
                                            {formatDate_dd_MonthName_yy(safe(enquiryData?.NextFollowUpDate))}
                                        </span>
                                    </div>

                                </div>

                            </div>
                        </div>


                        {/* Basic Deatils */}

                        <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4">
                            <FieldItem label="Enquiry Code:" value={safe(enquiryData?.SystemGeneratedCode)} />
                            <FieldItem label="Mobile No:" value={safe(enquiryData?.MobileNumber) ? `+91 ${safe(enquiryData?.MobileNumber)}` : '-'} />
                            <FieldItem label="E-Mail ID" value={safe(enquiryData?.EmailId)} />
                            <FieldItem label="Date of Birth" value={safe(enquiryData?.DateOfBirth) ? formatDate_dd_MonthName_yy(safe(enquiryData?.DateOfBirth)) : ""} />
                            <FieldItem label="Age" value={calculateAge(enquiryData?.DateOfBirth || "")} />
                            <FieldItem label="Accommodation" value={safe(enquiryData?.Accommodation)} />
                            <FieldItem label="Occupation Type" value={safe(enquiryData?.OccupationType)} />
                            <FieldItem label="Nationality" value={safe(enquiryData?.Nationality)} />
                            {safe(enquiryData?.Nationality?.toUpperCase()) !== "INDIAN" ? (
                                <>
                                    <FieldItem label="Country Of Residence" value={safe(enquiryData?.CountryOfResidence)} />
                                    <FieldItem label="City Of Residence" value={safe(enquiryData?.CityOfResidence)} />
                                </>
                            ) : null}




                            <FieldItem label="Customer Time In" value={safe(enquiryData?.EnquiryTimeIn)} />
                            <FieldItem label="Customer Time Out" value={safe(enquiryData?.EnquiryTimeOut)} />

                        </div>
                        <hr className="border-t border-gray-200" />

                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Source
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">



                                <FieldItem label="Source " value={safe(enquiryData?.Source)} />

                                {enquiryData?.Source?.toUpperCase() === "CHANNEL PARTNER" && (
                                    <>
                                        <FieldItem label="Sub Source" value={safe(enquiryData?.SubSource)} />
                                        <FieldItem label="CP Name" value={safe(enquiryData?.ChannelPartnerName)} />
                                        <FieldItem label="CP Mobile Number" value={safe(enquiryData?.ChannelPartnerMobileNumber) ? `+91 ${safe(enquiryData?.ChannelPartnerMobileNumber)}` : '-'} />
                                        <FieldItem label="CP Designation" value={safe(enquiryData?.ChannelPartnerDesignation)} />
                                        <FieldItem label="CP Company Name" value={safe(enquiryData?.ChannelPartnerCompany)} />
                                        <FieldItem label="CP Firms Type" value={safe(enquiryData?.ChannelPartnerFirmsType)} />
                                        <FieldItem label="CP Type" value={safe(enquiryData?.ChannelPartnerType)} />

                                        {enquiryData?.ChannelPartnerTeamMemberName && (<FieldItem label="CP Team Member Name " value={safe(enquiryData?.ChannelPartnerTeamMemberName)} />)}
                                        {enquiryData?.ChannelPartnerTeamMemberMobileNumber && (<FieldItem label="CP Team Member Mobile Number" value={safe(enquiryData?.ChannelPartnerTeamMemberMobileNumber) ? `+91 ${safe(enquiryData?.ChannelPartnerTeamMemberMobileNumber)}` : '-'} />)}
                                    </>
                                )}

                                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Advertisement' && (
                                    <>
                                        <FieldItem label="Sub Source" value={safe(enquiryData?.SubSource)} />
                                        <FieldItem label="Sub Sub Source" value={safe(enquiryData?.SubSubSource)} />
                                    </>
                                )}

                                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource !== 'Advertisement' && (
                                    <>
                                        <FieldItem label="Sub Source" value={safe(enquiryData?.SubSource)} />
                                    </>
                                )}

                                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Reference' && (
                                    <>
                                        <FieldItem label="Referral Project Name" value={safe(enquiryData?.ReferelProjectName ?? "")} />
                                        <FieldItem label="Referral Unit Number" value={safe(enquiryData?.ReferelUnitNumber ?? "")} />
                                        <FieldItem label="Unit Owner" value={safe(enquiryData?.ReferelUnitOwnerName ?? "")} />

                                    </>
                                )}
                                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Loyalty' && (
                                    <>
                                        <FieldItem label="Existing Project Name" value={safe(enquiryData?.LoyaltyExistingProjectName ?? "")} />
                                        <FieldItem label="Existing Unit Number" value={safe(enquiryData?.LoyaltyExistingUnitNumber ?? "")} />
                                        <FieldItem label="Unit Owner" value={safe(enquiryData?.LoyaltyExistingUnitOwnerName ?? "")} />

                                    </>
                                )}
                                {enquiryData?.Source === 'Direct Walking' && enquiryData?.SubSource === 'Employee Reference' && (
                                    <>
                                        <FieldItem label="Employee Reference Name" value={safe(enquiryData?.EmployeeReferenceName ?? "")} />
                                        <FieldItem label="Employee Reference Mobile Number" value={safe(enquiryData?.EmployeeReferenceMobileNumber) ? `+91 ${safe(enquiryData?.EmployeeReferenceMobileNumber)}` : '-'} />
                                    </>
                                )}

                            </div>
                        </section>

                        <hr className="border-t border-gray-200" />

                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Address
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                <FieldItem label="Current Location" value={safe(enquiryData?.CurrentLocation)} />
                            </div>
                        </section>

                        <hr className="border-t border-gray-200" />

                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Property Preferences
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Budget (In CR)" value={safe(enquiryData?.Budget)} />
                                <FieldItem label="Possession Type" value={safe(enquiryData?.PossessionType)} />
                                <FieldItem label="Requirement" value={safe(enquiryData?.Requirement)} />
                                <FieldItem label={
                                    enquiryData?.Requirement === "Residential"
                                        ? "Residential Type"
                                        : enquiryData?.Requirement === "Commercial"
                                            ? "Commercial Type"
                                            : "Type"
                                }
                                    value={safe(enquiryData?.RequirementType)}
                                />
                                <FieldItem label="Location" value={safe(enquiryData?.VillageName)} />
                                <FieldItem label="Timeline" value={safe(enquiryData?.Timeline)} />
                                <FieldItem label="Area Preferred (SqFt)" value={safe(enquiryData?.AreaPreferred)} />
                                <FieldItem label="Desired Floor Band" value={safe(enquiryData?.DesiredFloorBand)} />


                            </div>
                        </section>
                        <hr className="border-t border-gray-200" />
                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Customer Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Customer Classification" value={safe(enquiryData?.CustomerClassification)} />
                                <FieldItem label="Source Of Funding" value={safe(enquiryData?.SourceOfFunding)} />
                                <FieldItem label="Ethnicity" value={safe(enquiryData?.Ethnicity)} />
                            </div>
                        </section>
                        <hr className="border-t border-gray-200" />
                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Enquiry Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Stage " value={safe(enquiryData?.FinalStage)} />
                                {safe(enquiryData?.FinalStageDetail) !== "" ? <FieldItem label="Stage Reason " value={safe(enquiryData?.FinalStageDetail)} /> : ""}

                            </div>
                        </section>
                        <hr className="border-t border-gray-200" />
                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Sales Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Sales Advisor" value={safe(enquiryData?.SalesAdvisor)} />
                                <FieldItem label="Sourcing Manager" value={safe(enquiryData?.SourcingManager)} />
                            </div>
                        </section>
                        <hr className="border-t border-gray-200" />
                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Enquiry Remark
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                <FieldItem label="Remark" value={safe(enquiryData?.Remark)} />
                            </div>
                        </section>
                        <hr className="border-t border-gray-200" />
                        <section className="p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Action Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Created By" value={enquiryData?.CreatedBy ?? '-'} />
                                <FieldItem
                                    label="Created Date"
                                    value={formatDate_dd_MonthName_yy_hh_mm(enquiryData?.CreatedDate ?? '-')}
                                />
                                <FieldItem label="Modified By" value={enquiryData?.ModifiedBy ?? '-'} />
                                <FieldItem
                                    label="Modified Date"
                                    value={formatDate_dd_MonthName_yy_hh_mm(enquiryData?.ModifiedDate ?? '-')}
                                />
                            </div>
                        </section>
                    </div>
                </div>

                {/*  RIGHT SIDE  */}
                <div className="col-span-6">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

                        <div className="border-b pb-2 mt-1">
                            <div className="flex items-start justify-between">

                                {/* LEFT — TITLE */}
                                <h1 className="text-lg font-semibold text-black">
                                    Remark & Activity
                                </h1>

                                {/* RIGHT — DATES */}
                                <div className="text-xs text-gray-700">

                                    <div className="flex items-center gap-2">
                                        {canActionPerform && (
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
                                        )}
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
                                        {/* TOP ROW */}
                                        <div className="flex items-start justify-between gap-3">

                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-900">
                                                    {
                                                        item.ModifiedBy
                                                            ? `${item.ModifiedBy} - ${formatDate_dd_MonthName_yy_hh_mm(item.ModifiedDate ?? "")}`
                                                            : `${item.CreatedBy ?? ""} - ${formatDate_dd_MonthName_yy_hh_mm(item.CreatedDate ?? "")}`
                                                    }
                                                </span>

                                                <span className="text-xs text-gray-500 flex flex-col gap-1">
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
                                            </div>

                                            {index === 0 && canActionPerform && isDateWithinPastDays(item.CreatedDate, 2) && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        color="transparent"
                                                        isborderRadius
                                                        size="sm"
                                                        style={{ color: 'blue', padding: '4px 8px' }}
                                                        title="Edit"
                                                        onClick={() => handleOpenEnquiryFollowUpModal(item)}
                                                        disabled={isLoading}
                                                        leftIcon={<Edit className="h-4 w-4" />}
                                                    />

                                                    <Button
                                                        color="transparent"
                                                        isborderRadius
                                                        size="sm"
                                                        style={{ color: 'red', padding: '4px 8px' }}
                                                        title="Delete"
                                                        onClick={() => handleDeleteEnquiryFollowUp(item)}
                                                        disabled={isLoading}
                                                        leftIcon={<Trash2 className="h-4 w-4" />}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* LOST REASON */}
                                        {item.Status?.toLowerCase() === "lost" && (
                                            <span className="block mt-1 text-xs text-gray-500 italic">
                                                Lost Reason: {item.LostReason || "-"}
                                            </span>
                                        )}

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

                    </div>
                </div>

            </div>

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
                <div className="space-y-6 p-6 bg-blue-100">

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

                    {enquiryFollowUpFormData.Status === 'Lost' && (
                        <div>
                            <SinglePageSelection
                                label="Lost Reason"
                                required
                                placeholder="Select Lost Reason"
                                value={enquiryFollowUpFormData.LostReason ?? ''}
                                onChange={(e) => setEnquiryFollowUpFormData({ ...enquiryFollowUpFormData, LostReason: String(e) })}
                                options={FINAL_STAGE_DETAILS_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                error={enquiryFollowUpFormErrors.LostReason}
                            />
                        </div>
                    )}

                    {enquiryFollowUpFormData.Status !== 'Lost' && enquiryFollowUpFormData.Status !== 'Booking Done' && enquiryFollowUpFormData.Status !== 'Cancelled' && (
                        <DatePickerInput
                            label="Next Follow Up Date"
                            required
                            value={formatDate_dd_mm_yyyy(enquiryFollowUpFormData.NextFollowUpDate) ?? ''}
                            onChange={(e) => setEnquiryFollowUpFormData({ ...enquiryFollowUpFormData, NextFollowUpDate: convert_dd_mm_yyyy_To_Yyyy_mm_dd(e) })}
                            error={enquiryFollowUpFormErrors.NextFollowUpDate}
                        />
                    )}
                    {/* REMARK */}
                    <TextArea
                        label="Remark"
                        placeholder="Enter Remark"
                        required
                        className='thin-scroll'
                        value={enquiryFollowUpFormData.Remark ?? ""}
                        onChange={(e) => setEnquiryFollowUpFormData({ ...enquiryFollowUpFormData, Remark: e.target.value })}
                        error={enquiryFollowUpFormErrors.Remark} />


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
        </div>
    );
};

export default ViewEnquiry;
