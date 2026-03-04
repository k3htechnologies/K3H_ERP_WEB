import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import type { AddUpdateEnquiryRequest, FilterWithPaginationEnquiryRequest } from "@/features/enquiry//models/EnquiryModel";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { TextArea } from "@/ui/components/forms/Textarea";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { EnquiryService } from "@/features/enquiry/services/EnquiryServices";
import { filterEmail, filterMobile, isValidEmail, isValidMobile } from "@/core/utils/fileValidation";
import { Mail, Phone, Search } from "lucide-react";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { ACCOMODATION_TYPE_OPTIONS, BUDGET_TYPE_OPTIONS, COMMERCIAL_FLAT_CONFIGURATION, CUSTOMER_CLASSIFICATION_TYPE, DESIRED_FLOOR_BAND, ENQUIRY_TIMELINE, ETHNICITY_TYPE_OPTION, FINAL_STAGE_DETAILS_TYPE_OPTIONS, FINAL_STAGE_TYPE_OPTIONS, OCCUPATION_TYPE_OPTIONS, POSSESSION_TYPE_OPTIONS, REQUIREMENT_TYPE_OPTIONS, RESIDENTIAL_FLAT_CONFIGURATION, SOURCE_OF_FUNDING_TYPE, SOURCE_TYPE_OPTIONS, SUB_SUB_SOURCE_CHANNEL_PARTNER_OPTIONS, SUB_SUB_SOURCE_TYPE_OPTIONS, SUBSOURCE_TYPE_OPTIONS } from "@/core/constants";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";
import RadioPill from "@/ui/components/forms/RadioPill";
import { RangeSelector } from "@/ui/components/forms/RangeSelector";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { calculateAge, isDateWithinPastDays, isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { fetchChannelPartnerByMobileNumber, fetchChannelPartnerTeamMemberDropdown } from "@/features/ChannelPartner/channelPartnerDropDown";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { fetchVillageDropdown } from "@/features/technical/villageDropDown";
import { getCustomerClassification } from "@/features/enquiry/utils/customerClassification";
import CompleteVerificationSection from "@/ui/components/TwoWayVerification/CompleteVerificationSection";
import { Modal } from "@/ui/components/Modal/Modal";
import { sendOTP } from "@/features/technical/services/OTPService";
import { getEnquiryVerificationSteps } from "@/features/enquiry/utils/verificationSteps";

const initialFormState = (): AddUpdateEnquiryRequest => ({
    EnquiryId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,

    EnquiryTimeOut: "00:00",

    Name: "",
    MobileNumber: "",
    EmailId: "",
    DateOfBirth: "",

    Accommodation: "",
    OccupationType: "",

    Source: "",
    SubSource: "",
    SubSubSource: "",

    // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS REFERENCE]=========================
    ReferelName: "",
    ReferelMobileNumber: "",
    ReferelProjectName: "",
    ReferelUnitNumber: "",

    // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS LOTALTY]=========================
    LoyaltyExistingProjectName: "",
    LoyaltyExistingUnitNumber: "",

    // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS EMPLOYEE REFERENCE]=========================
    EmployeeReferenceMobileNumber: "",
    EmployeeReferenceName: "",

    ChannelPartnerTeamMemberId: 0,
    ChannelPartnerTeamMemberMobileNumber: "",
    ChannelPartnerTeamMemberName: "",

    Nationality: "",
    CountryOfResidence: "",
    CityOfResidence: "",
    CurrentLocation: "",
    VillageMasterId: "",

    PossessionType: "",
    AreaPreferred: 0,
    DesiredFloorBand: "",
    Budget: "",

    Requirement: "",
    RequirementType: "",

    CustomerClassification: "",
    SourceOfFunding: "",
    Ethnicity: "",

    FinalStage: "",
    FinalStageDetail: "",

    EnquiryDate: "",
    NextFollowUpDate: "",

    SalesAdvisorId: 0,
    SourcingManagerId: 0,

    EnquiryTimeIn: "00:00",

    Remark: "",

    OTP: "",

});


export const AddUpdateEnquiry: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateEnquiryRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [channelPartnerSearchByMobileNumber, setChannelPartnerSearchByMobileNumber] = useState<string>();
    const [channelPartnerId, setChannelPartnerId] = useState<number>();
    const [calculatedAge, setCalculatedAge] = useState<string>();
    const [selectedVillageValues, setSelectedVillageValues] = useState<string | number | null>(null);

    //SET CHANNEL PARTNER DETAILS

    const [channelPartnerFullName, setChannelPartnerFullName] = useState<string>();
    const [channelPartnerCompanyName, setChannelPartnerCompanyName] = useState<string>();
    const [channelPartnerFirmsType, setChannelPartnerFirmsType] = useState<string>();
    const [channelPartnerPanNumber, setChannelPartnerPanNumber] = useState<string>();
    const [channelPartnerAadhaarCardNumber, setChannelPartnerAadhaarCardNumber] = useState<string>();
    const [channelPartnerRERANUmber, setChannelPartnerRERANUmber] = useState<string>();
    const [channelPartnerMobileNumber, setChannelPartnerMobileNumber] = useState<string>();
    const [channelPartnerDesignation, setChannelPartnerDesignation] = useState<string>();
    const [channelPartnerType, setChannelPartnerType] = useState<string>();
    //COMPLETE VERIFICATION

    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [showOtpSection, setShowOtpSection] = useState(false);

    // NAVIGATE
    const navigate = useNavigate();

    // GET VALUE FROM URL ENQUIRY MASTER ID
    const { EnquiryId } = useParams<{ EnquiryId?: string }>();

    const { projectId } = useProject();

    const enquiryMasterId = EnquiryId ? Number(EnquiryId) : 0;

    const isAddMode = enquiryMasterId === 0;

    const [, setNationality] = useState<string>("Indian");

    // TOAST
    const { addToast } = useToast();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/enquiry');
    //#endregion

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    //#endregion

    const [dropdownLabels, setDropdownLabels] = useState<{
        channelPartnerName?: string,
        MobileNumber?: string
        SalesAdvisor?: string;
        SourcingManager?: string;
        VillageName?: string;
        ChannelPartnerTeamMemberName?: string,

    }>({})

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateEnquiryRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    //#region FETCH EMPLOYEE DROPDOWN WITH DEPARTMENT
    const fetchEmployeesByDept = (dept: string) =>
        (page: number, params?: { value?: string }) =>
            fetchEmployeeMasterDropdown(page, {
                value: params?.value || "",
                departmentName: dept,
            });
    //#endregion

    //#region INITIALIZATION
    useEffect(() => {
        if (!isAddMode) {
            fetchEnquiryDetails();
        }
    }, [EnquiryId]);

    useEffect(() => {
        if (formData.EnquiryTimeIn === "00:00") {
            const currentTime = new Date().toTimeString().slice(0, 5)
            handleFieldChange("EnquiryTimeIn", currentTime)
        }
    }, [])

    //#endregion

    //#region FETCH ENQUIRY  MASTER DETAILS
    const fetchEnquiryDetails = async () => {
        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {

                const params: FilterWithPaginationEnquiryRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    EnquiryId: enquiryMasterId,
                    ProjectId: Number(projectId)
                };

                const response = await EnquiryService.apiCallPullEnquiry(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {

                        setFormData(prev => ({
                            ...prev,

                            EnquiryId: e.EnquiryId ?? prev.EnquiryId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            ProjectId: Number(projectId),
                            Name: e.Name ?? prev.Name,
                            EmailId: e.EmailId ?? prev.EmailId,
                            MobileNumber: e.MobileNumber ?? prev.MobileNumber,
                            DateOfBirth: e.DateOfBirth ?? prev.DateOfBirth,

                            CurrentLocation: e.CurrentLocation ?? prev.CurrentLocation,

                            VillageMasterId: e.VillageMasterId ?? prev.VillageMasterId,

                            OccupationType: e.OccupationType ?? prev.OccupationType,
                            Accommodation: e.Accommodation ?? prev.Accommodation,
                            Budget: e.Budget ?? prev.Budget,
                            Requirement: e.Requirement ?? prev.Requirement,
                            RequirementType: e.RequirementType ?? prev.RequirementType,
                            AreaPreferred: e.AreaPreferred ?? prev.AreaPreferred,
                            PossessionType: e.PossessionType ?? prev.PossessionType,
                            Source: e.Source ?? prev.Source,
                            SubSource: e.SubSource ?? prev.SubSource,
                            SubSubSource: e.SubSubSource ?? prev.SubSubSource,

                            // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS REFERENCE]=========================
                            ReferelName: e.ReferelName ?? prev.ReferelName,
                            ReferelMobileNumber: e.ReferelMobileNumber ?? prev.ReferelMobileNumber,
                            ReferelProjectName: e.ReferelProjectName ?? prev.ReferelProjectName,
                            ReferelUnitNumber: e.ReferelUnitNumber ?? prev.ReferelUnitNumber,

                            // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS LOTALTY]=========================
                            LoyaltyExistingProjectName: e.LoyaltyExistingProjectName ?? prev.LoyaltyExistingProjectName,
                            LoyaltyExistingUnitNumber: e.LoyaltyExistingUnitNumber ?? prev.LoyaltyExistingUnitNumber,

                            // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS EMPLOYEE REFERENCE]=========================
                            EmployeeReferenceMobileNumber: e.EmployeeReferenceMobileNumber ?? prev.EmployeeReferenceMobileNumber,
                            EmployeeReferenceName: e.EmployeeReferenceName ?? prev.EmployeeReferenceName,

                            ChannelPartnerTeamMemberId: e.ChannelPartnerTeamMemberId ?? prev.ChannelPartnerTeamMemberId,
                            ChannelPartnerTeamMemberMobileNumber: Number(e.ChannelPartnerTeamMemberId) > 0 ? "" : e.ChannelPartnerTeamMemberMobileNumber ?? prev.ChannelPartnerTeamMemberMobileNumber,
                            ChannelPartnerTeamMemberName: Number(e.ChannelPartnerTeamMemberId) > 0 ? "" : e.ChannelPartnerTeamMemberName ?? prev.ChannelPartnerTeamMemberName,

                            FinalStage: e.FinalStage ?? prev.FinalStage,
                            FinalStageDetail: e.FinalStageDetail ?? prev.FinalStageDetail,
                            NextFollowUpDate: e.NextFollowUpDate ?? prev.NextFollowUpDate,
                            EnquiryDate: e.EnquiryDate ?? prev.EnquiryDate,
                            Remark: e.Remark ?? prev.Remark,
                            SalesAdvisorId: e.SalesAdvisorId ?? prev.SalesAdvisorId,
                            SourcingManagerId: e.SourcingManagerId ?? prev.SourcingManagerId,
                            Nationality: e.Nationality ?? prev.Nationality,
                            DesiredFloorBand: e.DesiredFloorBand ?? prev.DesiredFloorBand,
                            CustomerClassification: e.CustomerClassification ?? prev.CustomerClassification,
                            CountryOfResidence: e.CountryOfResidence ?? prev.CountryOfResidence,
                            CityOfResidence: e.CityOfResidence ?? prev.CityOfResidence,
                            SourceOfFunding: e.SourceOfFunding ?? prev.SourceOfFunding,
                            Ethnicity: e.Ethnicity ?? prev.Ethnicity,
                            Timeline: e.Timeline ?? prev.Timeline,

                            EnquiryTimeIn: e.EnquiryTimeIn ?? prev.EnquiryTimeIn,
                            EnquiryTimeOut: e.EnquiryTimeOut ?? prev.EnquiryTimeOut

                        }));

                        setDropdownLabels({
                            channelPartnerName: e.ChannelPartnerName || '',
                            SalesAdvisor: e.SalesAdvisor || "",
                            SourcingManager: e.SourcingManager || "",
                            ChannelPartnerTeamMemberName: e.ChannelPartnerTeamMemberName || "",

                        });
                        setSelectedVillageValues(e.VillageMasterId || "")
                        const age = calculateAge(e.DateOfBirth || "")

                        setCalculatedAge(age);

                        if (e.Source === 'Channel Partner') {
                        } setChannelPartnerSearchByMobileNumber(e.ChannelPartnerMobileNumber ? e.ChannelPartnerMobileNumber.toString() : '');
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
            'Loading Enquiry '
        );
    };
    //#endregion

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddEnquiryForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.Name) {
            newErrors.Name = 'Full Name is required';
        } else if (formData.Name.trim().length > 50) {
            newErrors.Name = 'Full Name must be at most 50 characters';
        }

        if (!formData.MobileNumber) {
            newErrors.MobileNumber = 'Mobile Number is required';
        } else if (!isValidMobile(formData.MobileNumber.trim())) {
            newErrors.MobileNumber = 'Enter a valid 10-Digit Mobile Number'
        }


        if (formData.EmailId !== '') {

            if (!isValidEmail(formData.EmailId!.trim())) {
                newErrors.EmailId = 'Enter a Valid E-mail Id'
            }
        }

        if (!formData.Accommodation) {
            newErrors.Accommodation = 'Current Accommodation is required';
        }

        if (!formData.OccupationType) {
            newErrors.OccupationType = 'Occupation Type is required';
        }

        if (!formData.Source) {
            newErrors.Source = 'Source is required';
        }

        if (formData.Nationality === "NRI") {

            if (!formData.CountryOfResidence) {
                newErrors.CountryOfResidence = 'Country Of Residence is required';
            }

            if (!formData.CityOfResidence) {
                newErrors.CityOfResidence = 'City Of Residence is required'
            }

        }

        if (formData.Source?.toUpperCase() === "CHANNEL PARTNER") {

            if (!channelPartnerId) {
                newErrors.ChannelPartnerId = 'Channel Partner is required';
            }

            if (!formData.SubSource) {
                newErrors.SubSource = 'Sub Source is required';
            }

        }

        if (formData.Source?.toUpperCase() === "ADVERTISEMENT") {

            if (!formData.SubSource) {
                newErrors.SubSource = 'Sub Source is required';
            }

        }

        // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS REFERENCE]=========================
        if (formData.Source?.toUpperCase() === "DIRECT WALKING" && formData.SubSource?.toUpperCase() === "REFERENCE") {
            if (!formData.ReferelName) {
                newErrors.ReferelName = 'Referel Name is required';
            }
            if (!formData.ReferelMobileNumber) {
                newErrors.ReferelMobileNumber = 'Referel Mobile Number is required';
            } else if (!isValidMobile(formData.ReferelMobileNumber.trim())) {
                newErrors.ReferelMobileNumber = 'Enter a valid 10-Digit Referel Mobile Number'
            }


            if (!formData.ReferelProjectName) {
                newErrors.ReferelProjectName = 'Referel Project Name is required';
            }
            if (!formData.ReferelUnitNumber) {
                newErrors.ReferelUnitNumber = 'Referel Unit Number is required';
            }
        }

        // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS LOTALTY]=========================
        if (formData.Source?.toUpperCase() === "DIRECT WALKING" && formData.SubSource?.toUpperCase() === "LOYALTY") {
            if (!formData.LoyaltyExistingProjectName) {
                newErrors.LoyaltyExistingProjectName = 'Loyalty Existing Project Name is required';
            }
            if (!formData.LoyaltyExistingUnitNumber) {
                newErrors.LoyaltyExistingUnitNumber = 'Loyalty Existing Unit Number is required';
            }
        }

        // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS EMPLOYEE REFERENCE]=========================
        if (formData.Source?.toUpperCase() === "DIRECT WALKING" && formData.SubSource?.toUpperCase() === "EMPLOYEE REFERENCE") {

            if (!formData.EmployeeReferenceMobileNumber) {
                newErrors.EmployeeReferenceMobileNumber = 'Employee Reference Mobile Number is required';
            } else if (!isValidMobile(formData.EmployeeReferenceMobileNumber.trim())) {
                newErrors.EmployeeReferenceMobileNumber = 'Enter a valid 10-Digit Employee Reference Mobile Number'
            }

            if (!formData.EmployeeReferenceName) {
                newErrors.EmployeeReferenceName = 'Employee Reference Name is required';
            }
        }

        if (!formData.CurrentLocation) {
            newErrors.CurrentLocation = 'Current Location is required';
        } else if (formData.CurrentLocation.trim().length > 500) {
            newErrors.CurrentLocation = 'Current Location must be at most 500 characters';
        }

        // =====================[CHANNEL PARTNER]=========================
        const name = formData.ChannelPartnerTeamMemberName?.trim() || '';
        const mobile = formData.ChannelPartnerTeamMemberMobileNumber?.trim() || '';
        if (mobile && !name) {
            newErrors.ChannelPartnerTeamMemberName = 'Channel Partner Team Member Name is required';
        }

        // 2️⃣ If name entered → mobile required
        if (name && !mobile) {
            newErrors.ChannelPartnerTeamMemberMobileNumber = 'Mobile Number is required';
        }

        // 3️⃣ If mobile entered → validate format
        if (mobile && !isValidMobile(mobile)) {
            newErrors.ChannelPartnerTeamMemberMobileNumber = 'Enter a valid 10-digit mobile number';
        }


        if (Number(formData.EnquiryDate) === 0 && !formData.EnquiryDate) {
            newErrors.EnquiryDate = "Enquiry date is required";
        } else if (Number(formData.EnquiryDate) === 0 && !isDateWithinPastDays(formData.EnquiryDate, 2)) {
            newErrors.EnquiryDate = "Enquiry date can only be today or within the previous 2 days";
        }

        if (formData.FinalStage?.toUpperCase() === "LOST") {

            if (!formData.FinalStageDetail) {
                newErrors.FinalStageDetail = 'Final Stage Detail is required';
            }

        }

        if (Number(formData.EnquiryId) === 0 && formData.NextFollowUpDate != null && formData.NextFollowUpDate !== "" && !isToDateGreaterOrEqualFromDate(formData.EnquiryDate || "", formData.NextFollowUpDate!)) {
            newErrors.NextFollowUpDate = "Next Follow Up Date must be greater than or equal to Enquiry Date";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    //#region PUSH DATA
    const PushEnquiryFormData = (): AddUpdateEnquiryRequest => {

        const villageIdsString = villageDropdown.selectedValues.length > 0
            ? villageDropdown.selectedValues.join(',')
            : '';

        const customerClassification = getCustomerClassification({
            Budget: formData.Budget,
            PossessionType: formData.PossessionType,
            Requirement: formData.Requirement,
            VillageMasterId: villageIdsString,
            Timeline: formData.Timeline ?? "",
        });

        // =====================[DIRECT WALKING → REFERENCE]=========================
        const isDirectReference = formData.Source?.toUpperCase() === 'DIRECT WALKING' && formData.SubSource?.toUpperCase() === 'REFERENCE';
        // =====================[DIRECT WALKING → LOYALTY]=========================
        const isDirectLoyalty = formData.Source?.toUpperCase() === 'DIRECT WALKING' && formData.SubSource?.toUpperCase() === 'LOYALTY';

        // =====================[DIRECT WALKING → EMPLOYEE REFERENCE]=========================
        const isEmployeeReference = formData.Source?.toUpperCase() === 'DIRECT WALKING' && formData.SubSource?.toUpperCase() === 'EMPLOYEE REFERENCE';

        const isIndian = formData.Nationality === '' || formData.Nationality?.toUpperCase() === 'Indian';

        return {
            EnquiryId: formData.EnquiryId,
            Uniquekey: formData.Uniquekey,
            ProjectId: Number(projectId),

            EnquiryTimeOut: formData.EnquiryTimeOut,

            Name: formData.Name,
            MobileNumber: formData.MobileNumber,
            EmailId: formData.EmailId,
            DateOfBirth: formData.DateOfBirth === "" ? null : formData.DateOfBirth,

            Accommodation: formData.Accommodation,
            OccupationType: formData.OccupationType,

            Source: formData.Source,
            SubSource: formData.SubSource,
            SubSubSource: (formData.Source)?.toUpperCase() === "CHANNEL PARTNER" ? String(channelPartnerId) : formData.SubSubSource,


            // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS REFERENCE]=========================
            ReferelName: isDirectReference ? formData.ReferelName : '',
            ReferelMobileNumber: isDirectReference ? formData.ReferelMobileNumber : '',
            ReferelProjectName: isDirectReference ? formData.ReferelProjectName : '',
            ReferelUnitNumber: isDirectReference ? formData.ReferelUnitNumber : '',

            // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS LOTALTY]=========================
            LoyaltyExistingProjectName: isDirectLoyalty ? formData.LoyaltyExistingProjectName : '',
            LoyaltyExistingUnitNumber: isDirectLoyalty ? formData.LoyaltyExistingUnitNumber : '',

            // =====================[SOURCE IS DIRECT WALKING AND SUB SOURCE IS EMPLOYEE REFERENCE]=========================
            EmployeeReferenceMobileNumber: isEmployeeReference ? formData.EmployeeReferenceMobileNumber : '',
            EmployeeReferenceName: isEmployeeReference ? formData.EmployeeReferenceName : '',

            ChannelPartnerTeamMemberId: formData.ChannelPartnerTeamMemberId,
            ChannelPartnerTeamMemberName: Number(formData.ChannelPartnerTeamMemberId) > 0 ? '' : formData.ChannelPartnerTeamMemberName,
            ChannelPartnerTeamMemberMobileNumber: Number(formData.ChannelPartnerTeamMemberId) > 0 ? '' : formData.ChannelPartnerTeamMemberMobileNumber,

            Nationality: isIndian ? 'Indian' : formData.Nationality,
            CountryOfResidence: isIndian ? '' : formData.CountryOfResidence,
            CityOfResidence: isIndian ? '' : formData.CityOfResidence,

            CurrentLocation: formData.CurrentLocation,
            VillageMasterId: villageIdsString,

            PossessionType: formData.PossessionType,
            AreaPreferred: formData.AreaPreferred,
            DesiredFloorBand: formData.DesiredFloorBand,
            Budget: formData.Budget,

            Requirement: formData.Requirement,
            RequirementType: formData.RequirementType || null,

            CustomerClassification: customerClassification,
            SourceOfFunding: formData.SourceOfFunding,
            Ethnicity: formData.Ethnicity,
            Timeline: formData.Timeline,

            FinalStage: formData.FinalStage,
            FinalStageDetail: formData.FinalStageDetail,

            EnquiryDate: formData.EnquiryDate,
            NextFollowUpDate: formData.NextFollowUpDate === "" ? null : formData.NextFollowUpDate,

            SalesAdvisorId: formData.SalesAdvisorId,
            SourcingManagerId: formData.SourcingManagerId,

            EnquiryTimeIn: formData.EnquiryTimeIn,

            Remark: formData.Remark,

            OTP: otp?.trim()

        };
    };

    //#endregion

    //#region HANDLE ADD AND UPDATE Enquiry  MASTER
    const handleAddUpdateEnquiry = async () => {

        setErrors({});

        const validation = validateAddEnquiryForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            addToast({ type: 'error', title: 'Please fill the required filed' });

            return;
        }

        if (formData.EnquiryId === 0 && !isOtpVerified) {

            if (!isOtpSent) {

                const sent = await sendOTP({

                    mobileNumber: formData.MobileNumber || "",
                    module: "ENQUIRY",
                    setIsLoading,
                    setLoadingMessage,
                    addToast
                });


                if (sent) {
                    setShowOtpSection(true);
                    setIsOtpSent(true);

                }

                return;
            }

        }

        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {
                const payload = PushEnquiryFormData();

                const response = await EnquiryService.apiCallAddUpdateEnquiry(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/enquiry");

                } else {
                    addToast({ type: "error", title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            isAddMode ? 'Add ' : 'Update '
        );
    };
    //#endregion
    //#region HANDLE SEARCH CHANGE EVENT CHANNEL PARTNER

    const handleSearchByChannelPartner = (searchValue: string) => {
        setChannelPartnerSearchByMobileNumber(searchValue);
    };

    const clearChannelPartnerDetails = () => {
        setChannelPartnerFullName("");
        setChannelPartnerCompanyName("");
        setChannelPartnerFirmsType("");
        setChannelPartnerPanNumber("");
        setChannelPartnerAadhaarCardNumber("");
        setChannelPartnerRERANUmber("");
        setChannelPartnerDesignation("");
        setChannelPartnerMobileNumber("");
        setChannelPartnerType("");
        setChannelPartnerId(0);
        handleFieldChange("ChannelPartnerTeamMemberId", 0);
    };

    const clearChannelPartnerAll = () => {
        setChannelPartnerSearchByMobileNumber("");
        clearChannelPartnerDetails();
    };


    useEffect(() => {
        const mobile = channelPartnerSearchByMobileNumber?.trim() || "";

        if (mobile.length !== 10) {
            clearChannelPartnerDetails();
            return;
        }

        fetchChannelPartnerByMobileNumber(mobile).then(channelPartner => {

            if (!channelPartner) return;

            setChannelPartnerId(Number(channelPartner.ChannelPartnerId));

            setChannelPartnerFullName(channelPartner.Name ?? "");
            setChannelPartnerFirmsType(channelPartner.FirmsType ?? "");
            setChannelPartnerCompanyName(channelPartner.CompanyName ?? "");
            setChannelPartnerPanNumber(channelPartner.PanNumber ?? "");
            setChannelPartnerAadhaarCardNumber(channelPartner.AadharCardNumber ?? "");
            setChannelPartnerRERANUmber(channelPartner.RERANumber ?? "");
            setChannelPartnerDesignation(channelPartner.Designation ?? "");
            setChannelPartnerMobileNumber(channelPartner.MobileNumber ?? "");
            setChannelPartnerType(channelPartner.Type ?? "");

        });

    }, [channelPartnerSearchByMobileNumber]);


    //#endregion

    //#region FETCH CHANNEL PARTNER DROPDOWN WITH TEAM MEMBER
    const fetchChannelPartnerTeamMember = useCallback(
        async (pageNumber: number, params?: { value?: string }) => {

            return fetchChannelPartnerTeamMemberDropdown(pageNumber, {

                ...params,
                value: channelPartnerCompanyName || "",

            });
        },
        [channelPartnerCompanyName]
    );

    //#endregion
    //#region FETCH CHANNEL PARTNER DROPDOWN WITH TEAM MEMBER
    const villageDropdown = useMultiSelectDropdown({
        value: selectedVillageValues,
        fetchCallback: fetchVillageDropdown,
        autoFetchOptions: true
    });
    //#endregion

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

                <form onSubmit={handleAddUpdateEnquiry}>

                    {/* Basic Enquiry Details */}

                    <div className="space-y-4 pb-2">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Enquiry Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div>
                                <TimePicker
                                    label="Customer Time In"
                                    required
                                    disabled
                                    size="md"
                                    format={24}
                                    value={formData.EnquiryTimeIn || ""}
                                    onChange={(val) => handleFieldChange("EnquiryTimeIn", val)}
                                    error={errors.EnquiryTimeIn}
                                />
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Full Name'
                                    value={formData.Name ?? ""}
                                    onChange={(e) => handleFieldChange("Name", e.target.value)}
                                    placeholder="Enter Name"
                                    maxLength={250}
                                    error={errors.Name}
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Mobile Number'
                                    leftIcon="+91"
                                    rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    value={formData.MobileNumber ?? ""}
                                    onChange={(e) => {
                                        const mobile = filterMobile(e.target.value)
                                        handleFieldChange("MobileNumber", mobile)
                                    }
                                    }
                                    placeholder="Enter Mobile Number"
                                    maxLength={10}
                                    error={errors.MobileNumber}
                                />
                            </div>
                            <div>
                                <Input
                                    label='E-mail ID'
                                    type="text"
                                    value={formData.EmailId ?? ""}
                                    error={errors.EmailId}
                                    rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
                                    onChange={(e) => {
                                        const emailId = filterEmail(e.target.value);
                                        handleFieldChange('EmailId', emailId)
                                    }}
                                    placeholder="Enter Valid E-mail Id"
                                />
                            </div>
                            <div>
                                <DatePickerInput
                                    label="DOB"
                                    value={formatDate_dd_mm_yyyy(formData.DateOfBirth)}
                                    onChange={(val) => {

                                        const dob = convert_dd_mm_yyyy_To_Yyyy_mm_dd(val)

                                        handleFieldChange('DateOfBirth', dob)

                                        const age = calculateAge(dob || "")

                                        setCalculatedAge(age)
                                    }}
                                    error={errors.DateOfBirth}

                                />

                            </div>
                            <div>
                                <Input
                                    type="text"
                                    disabled
                                    label='Age'
                                    value={calculatedAge ?? ""}
                                    onChange={(e) => setCalculatedAge(e.target.value)}
                                    placeholder="System calculated Age"
                                    maxLength={250}
                                    error={errors.Age}
                                />

                            </div>

                            <div>
                                <SinglePageSelection
                                    label="Current Accommodation"
                                    required
                                    placeholder="Select Current Accommodation"
                                    value={formData.Accommodation ?? ''}
                                    onChange={(value) => handleFieldChange("Accommodation", value)}
                                    options={ACCOMODATION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Accommodation}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Occupation Type"
                                    required
                                    placeholder="Select Occupation Type"
                                    value={formData.OccupationType ?? ''}
                                    onChange={(value) => handleFieldChange("OccupationType", value)}
                                    options={OCCUPATION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.OccupationType}
                                />
                            </div>

                        </div>



                        <div className="grid grid-cols-1 md:grid-cols-3  gap-6">


                            <div >
                                <p className="text-sm text-gray-600 mb-2">
                                    Nationality
                                </p>
                                <div className="flex gap-3">
                                    <RadioPill
                                        name="Nationality"
                                        label="Indian"
                                        value="Indian"
                                        checked={formData.Nationality === "Indian"}
                                        onChange={() => {
                                            setNationality("Indian");
                                            handleFieldChange("Nationality", "Indian");
                                        }}
                                    />

                                    <RadioPill
                                        name="Nationality"
                                        label="NRI"
                                        value="NRI"
                                        checked={formData.Nationality === "NRI"}
                                        onChange={() => {
                                            setNationality("NRI");
                                            handleFieldChange("Nationality", "NRI");
                                        }}

                                    />
                                </div>
                            </div>

                            {formData.Nationality === 'NRI' && (
                                <>
                                    <div>
                                        <Input
                                            type="text"
                                            required
                                            label='Country Of Residence'
                                            value={formData.CountryOfResidence ?? ""}
                                            onChange={(e) => handleFieldChange("CountryOfResidence", e.target.value)}
                                            placeholder="Enter Country Of Residence"
                                            maxLength={250}
                                            error={errors.CountryOfResidence}
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            required
                                            type="text"
                                            label='City Of Residence'
                                            value={formData.CityOfResidence ?? ""}
                                            onChange={(e) => handleFieldChange("CityOfResidence", e.target.value)}
                                            placeholder="Enter City Of Residence"
                                            maxLength={250}
                                            error={errors.CityOfResidence}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ============================================================= [SOURCE] ============================================================================================= */}
                        <div className="space-y-4 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Source</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <SinglePageSelection
                                        label="Source"
                                        required
                                        placeholder="Select Source"
                                        value={formData.Source ?? ''}
                                        onChange={(e) => {
                                            handleFieldChange("Source", e);
                                            handleFieldChange("SubSource", "");
                                            handleFieldChange("SubSubSource", "");

                                            if (e !== "Channel Partner") {
                                                clearChannelPartnerAll();
                                            }
                                        }}
                                        options={SOURCE_TYPE_OPTIONS.map(opt => ({
                                            label: opt.name,
                                            value: opt.id
                                        }))}
                                        error={errors.Source}
                                    />

                                </div>

                                {formData.Source === 'Direct Walking' && (
                                    <div>
                                        <SinglePageSelection
                                            label="Sub Source"
                                            required={formData.Source === 'Direct Walking' ? true : false}
                                            placeholder="Select Sub Source"
                                            value={formData.SubSource ?? ''}
                                            onChange={(e) => {
                                                handleFieldChange("SubSource", e);
                                                handleFieldChange("SubSubSource", "");
                                            }}
                                            options={SUBSOURCE_TYPE_OPTIONS.map(opt => ({
                                                label: opt.name,
                                                value: opt.id
                                            }))}
                                            error={errors.SubSource}
                                        />
                                    </div>
                                )}

                                {formData.Source === 'Direct Walking' && formData.SubSource === 'Advertisement' && (
                                    <div>
                                        <SinglePageSelection
                                            label="Sub Sub Source"
                                            required={formData.Source === 'Direct Walking' && formData.SubSource === 'Advertisement' ? true : false}
                                            placeholder="Select Sub Sub Source"
                                            value={formData.SubSubSource ?? ''}
                                            onChange={(value) => handleFieldChange("SubSubSource", String(value))}
                                            options={SUB_SUB_SOURCE_TYPE_OPTIONS.map(opt => ({
                                                label: opt.name,
                                                value: opt.id
                                            }))}
                                            error={errors.SubSubSource}
                                        />
                                    </div>
                                )}

                                {formData.Source === 'Direct Walking' && formData.SubSource === 'Reference' && (
                                    <>
                                        <Input
                                            label="Referral Name"
                                            type="text"
                                            required
                                            value={formData.ReferelName ?? ""}
                                            error={errors.ReferelName}
                                            onChange={(e) => handleFieldChange("ReferelName", e.target.value)}
                                            placeholder="Enter Referral Name"
                                            maxLength={150}
                                        />

                                        <Input
                                            label="Referral Mobile Number"
                                            required
                                            type="text"
                                            maxLength={10}
                                            value={formData.ReferelMobileNumber ?? ""}
                                            error={errors.ReferelMobileNumber}
                                            leftIcon="+91"
                                            rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    "ReferelMobileNumber",
                                                    filterMobile(e.target.value)
                                                )
                                            }
                                            placeholder="Enter Referral Mobile Number"
                                        />

                                        <Input
                                            label="Referral Project Name"
                                            required
                                            type="text"
                                            value={formData.ReferelProjectName ?? ""}
                                            error={errors.ReferelProjectName}
                                            onChange={(e) =>
                                                handleFieldChange("ReferelProjectName", e.target.value)
                                            }
                                            placeholder="Enter Referral Project Name"
                                            maxLength={200}
                                        />

                                        <Input
                                            label="Referral Unit Number"
                                            required
                                            type="text"
                                            value={formData.ReferelUnitNumber ?? ""}
                                            error={errors.ReferelUnitNumber}
                                            onChange={(e) =>
                                                handleFieldChange("ReferelUnitNumber", e.target.value)
                                            }
                                            placeholder="Enter Referral Unit Number"
                                            maxLength={50}
                                        />
                                    </>
                                )}
                                {formData.Source === 'Direct Walking' && formData.SubSource === 'Loyalty' && (
                                    <>
                                        <Input
                                            label="Existing Project Name"
                                            required
                                            type="text"
                                            value={formData.LoyaltyExistingProjectName ?? ""}
                                            error={errors.LoyaltyExistingProjectName}
                                            onChange={(e) =>
                                                handleFieldChange("LoyaltyExistingProjectName", e.target.value)
                                            }
                                            placeholder="Enter Existing Project Name"
                                            maxLength={200}
                                        />

                                        <Input
                                            label="Existing Unit Number"
                                            required
                                            type="text"
                                            value={formData.LoyaltyExistingUnitNumber ?? ""}
                                            error={errors.LoyaltyExistingUnitNumber}
                                            onChange={(e) =>
                                                handleFieldChange("LoyaltyExistingUnitNumber", e.target.value)
                                            }
                                            placeholder="Enter Existing Unit Number"
                                            maxLength={50}
                                        />

                                    </>
                                )}

                                {formData.Source === 'Direct Walking' && formData.SubSource === 'Employee Reference' && (
                                    <>
                                        <Input
                                            label="Employee Name"
                                            required
                                            type="text"
                                            value={formData.EmployeeReferenceName ?? ""}
                                            error={errors.EmployeeReferenceName}
                                            onChange={(e) =>
                                                handleFieldChange("EmployeeReferenceName", e.target.value)
                                            }
                                            placeholder="Enter Employee Name"
                                            maxLength={150}
                                        />

                                        <Input
                                            label="Employee Mobile Number"
                                            required
                                            type="text"
                                            maxLength={10}
                                            value={formData.EmployeeReferenceMobileNumber ?? ""}
                                            error={errors.EmployeeReferenceMobileNumber}
                                            leftIcon="+91"
                                            rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                            onChange={(e) =>
                                                handleFieldChange("EmployeeReferenceMobileNumber", filterMobile(e.target.value)
                                                )
                                            }
                                            placeholder="Enter Employee Mobile Number"
                                        />


                                    </>
                                )}

                                {formData.Source === 'Channel Partner' && (
                                    <>
                                        <SinglePageSelection
                                            label="Sub Source"
                                            required={formData.Source === 'Channel Partner' ? true : false}
                                            placeholder="Select Sub Source"
                                            value={formData.SubSource ?? ''}
                                            onChange={(value) => handleFieldChange("SubSource", String(value))}
                                            options={SUB_SUB_SOURCE_CHANNEL_PARTNER_OPTIONS.map(opt => ({
                                                label: opt.name,
                                                value: opt.id
                                            }))}
                                            error={errors.SubSource}
                                        />
                                        <div>
                                            <Input
                                                type="text"
                                                required
                                                label="Channel Partner"
                                                value={channelPartnerSearchByMobileNumber}
                                                maxLength={10}
                                                onChange={(e) => {
                                                    handleSearchByChannelPartner(e.target.value);
                                                    setChannelPartnerSearchByMobileNumber(e.target.value);
                                                }}
                                                placeholder="Search By Mobile Number"
                                                leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                                                error={errors.ChannelPartnerId}

                                            />

                                        </div>
                                        {channelPartnerFullName != '' && (
                                            <>
                                                {(formData.ChannelPartnerTeamMemberName === "" && formData.ChannelPartnerTeamMemberMobileNumber === "") && (
                                                    <div>
                                                        <SingleSelectDropdownWithPagination
                                                            label="Team Member"
                                                            title="Select Team Member"
                                                            size="lg"
                                                            initialValue={createDropdownInitialValue(
                                                                formData.ChannelPartnerTeamMemberId,
                                                                dropdownLabels.ChannelPartnerTeamMemberName
                                                            )}
                                                            dataFetchCallBack={fetchChannelPartnerTeamMember}
                                                            onSelected={(item) => {
                                                                if (!item) {
                                                                    handleFieldChange("ChannelPartnerTeamMemberId", null);
                                                                    handleFieldChange("ChannelPartnerTeamMemberName", "");
                                                                    handleFieldChange("ChannelPartnerTeamMemberMobileNumber", "");
                                                                    return;
                                                                }

                                                                handleFieldChange(
                                                                    "ChannelPartnerTeamMemberId",
                                                                    Number(item.value)
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {/* SHOW ONLY WHEN TEAM MEMBER IS NOT SELECTED */}
                                                {!formData.ChannelPartnerTeamMemberId && (
                                                    <>
                                                        <div>
                                                            <Input
                                                                type="text"
                                                                label="Team Member Name"
                                                                value={formData.ChannelPartnerTeamMemberName ?? ""}
                                                                onChange={(e) =>
                                                                    handleFieldChange(
                                                                        "ChannelPartnerTeamMemberName",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Enter Team Member Name"
                                                                maxLength={100}
                                                                error={errors.ChannelPartnerTeamMemberName}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Input
                                                                label="Team Member Mobile Number"
                                                                type="text"
                                                                maxLength={10}
                                                                value={formData.ChannelPartnerTeamMemberMobileNumber ?? ""}
                                                                leftIcon="+91"
                                                                rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                                                onChange={(e) =>
                                                                    handleFieldChange("ChannelPartnerTeamMemberMobileNumber", filterMobile(e.target.value)
                                                                    )
                                                                }
                                                                placeholder="Enter Team Member Mobile Number"
                                                                error={errors.ChannelPartnerTeamMemberMobileNumber}
                                                            />

                                                        </div>
                                                    </>
                                                )}

                                            </>
                                        )}
                                    </>

                                )}
                            </div>

                            {formData.Source?.toUpperCase() === "CHANNEL PARTNER" &&
                                channelPartnerSearchByMobileNumber?.length === 10 && (

                                    <>
                                        {channelPartnerId ? (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {channelPartnerFullName && (
                                                        <FieldItem label="Full Name" value={channelPartnerFullName} />
                                                    )}

                                                    {channelPartnerCompanyName && (
                                                        <FieldItem label="Company Name" value={channelPartnerCompanyName} />
                                                    )}

                                                    {channelPartnerFirmsType && (
                                                        <FieldItem label="Firms Type" value={channelPartnerFirmsType} />
                                                    )}

                                                    {channelPartnerMobileNumber && (
                                                        <FieldItem label="Mobile Number" value={channelPartnerMobileNumber} />
                                                    )}

                                                    {channelPartnerDesignation && (
                                                        <FieldItem label="Designation" value={channelPartnerDesignation} />
                                                    )}

                                                    {channelPartnerType && (
                                                        <FieldItem label="Type" value={channelPartnerType} />
                                                    )}

                                                    {channelPartnerPanNumber && (
                                                        <FieldItem label="PAN Number" value={channelPartnerPanNumber} />
                                                    )}

                                                    {channelPartnerAadhaarCardNumber && (
                                                        <FieldItem label="Aadhaar Card Number" value={channelPartnerAadhaarCardNumber} />
                                                    )}

                                                    {channelPartnerRERANUmber && (
                                                        <FieldItem label="RERA Number" value={channelPartnerRERANUmber} />
                                                    )}

                                                </div>
                                            </div>
                                        ) : (
                                            !channelPartnerId && (
                                                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700">
                                                    No Channel Partner found for this mobile number
                                                </div>
                                            )
                                        )}
                                    </>
                                )}


                        </div>

                        {/* ============================================================= [ADDRESS] ============================================================================================= */}
                        <div className="space-y-4 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                <div>
                                    <TextArea
                                        label="Current Location"
                                        placeholder="Enter Current Location"
                                        required
                                        className='thin-scroll'
                                        value={formData.CurrentLocation ?? ""}
                                        onChange={(e) => handleFieldChange("CurrentLocation", e.target.value)}
                                        error={errors.CurrentLocation} />
                                </div>
                            </div>


                        </div>
                        {LocalStorageHelper.getStoredEmployeeData()?.Designation !== "GRE" && (
                            <>
                                <div className="space-y-4 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Property Preferences</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                                        <div>

                                            <RangeSelector
                                                label="Budget (In Cr)"
                                                value={formData.Budget ?? ""}
                                                onChange={(v) => handleFieldChange("Budget", v)}
                                                options={BUDGET_TYPE_OPTIONS}
                                                error={errors.Budget}
                                            />
                                        </div>
                                        <div>
                                            <SinglePageSelection
                                                label="Possession Type"
                                                placeholder="Select Possession Type"
                                                value={formData.PossessionType ?? ''}
                                                onChange={(value) => handleFieldChange("PossessionType", value)}
                                                options={POSSESSION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                                error={errors.PossessionType}
                                            />
                                        </div>
                                        <div>
                                            <SinglePageSelection
                                                label="Requirement"
                                                placeholder="Select Requirement"
                                                value={formData.Requirement ?? ''}
                                                onChange={(value) => handleFieldChange("Requirement", value)}
                                                options={REQUIREMENT_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                                error={errors.Requirement}
                                            />
                                        </div>
                                        {formData.Requirement && (
                                            <div>
                                                <SinglePageSelection
                                                    label={formData.Requirement === 'Residential' ? "Residential Type" : formData.Requirement === 'Commercial' ? "Commercial Type" : "Type"}
                                                    placeholder={`Select ${formData.Requirement === 'Residential' ? "Residential" : formData.Requirement === 'Commercial' ? "Commercial" : "Type"} Type`}
                                                    value={formData.RequirementType ?? ''}
                                                    onChange={(value) => handleFieldChange("RequirementType", value)}
                                                    options={
                                                        formData.Requirement === 'Residential'
                                                            ? RESIDENTIAL_FLAT_CONFIGURATION.map(opt => ({ label: opt.name, value: opt.id }))
                                                            : formData.Requirement === 'Commercial' || formData.Requirement === 'Commercial Leasing'
                                                                ? COMMERCIAL_FLAT_CONFIGURATION.map(opt => ({ label: opt.name, value: opt.id }))
                                                                : []
                                                    }
                                                    error={errors.Residential}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <MultiSelectPagination
                                                label="Location"
                                                dataFetchCallBack={fetchVillageDropdown}
                                                selectedValues={villageDropdown.selectedValues}
                                                options={villageDropdown.initialOptions}
                                                onChange={(values) => {
                                                    const { idsString } = villageDropdown.handleChange(values);
                                                    setSelectedVillageValues(idsString || null);
                                                    if (errors.VillageMasterId) {
                                                        setErrors((prev) => ({ ...prev, VillageMasterId: '' }));
                                                    }
                                                }}
                                            />


                                        </div>
                                        <div>
                                            <SinglePageSelection
                                                label="Timeline"
                                                placeholder="Select Timeline"
                                                value={formData.Timeline ?? ''}
                                                onChange={(value) => handleFieldChange("Timeline", value)}
                                                options={ENQUIRY_TIMELINE.map(opt => ({ label: opt.name, value: opt.id }))}
                                                error={errors.Timeline}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label='Area Preferred (SqFt)'
                                                error={errors.AreaPreferred}
                                                type="text"
                                                value={formData.AreaPreferred ?? ''}
                                                rightIcon="SqFt"
                                                maxLength={10}
                                                onChange={(e) => {
                                                    const digits = e.target.value.replace(/\D/g, '');
                                                    handleFieldChange('AreaPreferred', digits === '' ? 0 : Number(digits));
                                                }}
                                                placeholder="Enter Area Preferred"
                                            />
                                        </div>
                                        <div>
                                            <SinglePageSelection
                                                label="Desired Floor Band"
                                                placeholder="Select Desired Floor Band"
                                                value={formData.DesiredFloorBand ?? ''}
                                                onChange={(value) => handleFieldChange("DesiredFloorBand", value)}
                                                options={DESIRED_FLOOR_BAND.map(opt => ({ label: opt.name, value: opt.id }))}
                                                error={errors.DesiredFloorBand}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Customer Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                                        <div style={{ display: "none" }}>
                                            <SinglePageSelection
                                                label="Customer Classification"
                                                placeholder="Select Customer Classification"
                                                value={formData.CustomerClassification ?? ''}
                                                onChange={(value) => handleFieldChange("CustomerClassification", value)}
                                                options={CUSTOMER_CLASSIFICATION_TYPE.map(opt => ({ label: opt.name, value: opt.id }))}
                                                error={errors.CustomerClassification}
                                            />
                                        </div>
                                        <div>
                                            <SinglePageSelection
                                                label="Source Of Funding"
                                                placeholder="Select Source Of Funding"
                                                value={formData.SourceOfFunding ?? ''}
                                                onChange={(value) => handleFieldChange("SourceOfFunding", value)}
                                                options={SOURCE_OF_FUNDING_TYPE.map(opt => ({ label: opt.name, value: opt.id }))}
                                                error={errors.SourceOfFunding}
                                            />
                                        </div>
                                        <div>
                                            <SinglePageSelection
                                                label="Ethnicity"
                                                placeholder="Select Ethnicity"
                                                value={formData.Ethnicity ?? ''}
                                                onChange={(value) => handleFieldChange("Ethnicity", value)}
                                                options={ETHNICITY_TYPE_OPTION.map(opt => ({ label: opt.name, value: opt.id }))}
                                                error={errors.Ethnicity}
                                            />
                                        </div>

                                    </div>
                                </div>

                                <div className="space-y-4 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Enquiry Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                        <div>
                                            <SinglePageSelection
                                                label="Stage"
                                                placeholder="Select Stage"
                                                disabled={Number(formData.EnquiryId) > 0 ? true : false}
                                                value={formData.FinalStage ?? ''}
                                                onChange={(value) => handleFieldChange("FinalStage", value)}
                                                options={FINAL_STAGE_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                                error={errors.FinalStage}
                                            />
                                        </div>
                                        {formData.FinalStage === 'Lost' && (
                                            <div>
                                                <SinglePageSelection
                                                    label="Final Stage Detail"
                                                    placeholder="Select Final Stage Detail"
                                                    value={formData.FinalStageDetail ?? ''}
                                                    onChange={(value) => handleFieldChange("FinalStageDetail", value)}
                                                    options={FINAL_STAGE_DETAILS_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                                    error={errors.FinalStageDetail}
                                                    disabled={Number(formData.EnquiryId) > 0 ? true : false}
                                                />
                                            </div>
                                        )}
                                    </div>

                                </div>
                                <div className="space-y-4 pb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Follow Up Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                                        <div>
                                            <DatePickerInput
                                                label="Enquiry Date"
                                                required
                                                isDisplayCurrentDate={true}
                                                value={formatDate_dd_mm_yyyy(formData.EnquiryDate)}
                                                onChange={(val) => handleFieldChange('EnquiryDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                                error={errors.EnquiryDate}
                                                disabled={Number(formData.EnquiryId) > 0 ? true : false}

                                            />

                                        </div>

                                        <div>
                                            <DatePickerInput
                                                label="Next Follow-Up Date"
                                                value={formatDate_dd_mm_yyyy(formData.NextFollowUpDate)}
                                                onChange={(val) => handleFieldChange('NextFollowUpDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                                error={errors.NextFollowUpDate}
                                                disabled={Number(formData.EnquiryId) > 0 ? true : false}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                    {LocalStorageHelper.getStoredEmployeeData()?.Designation !== "GRE" && (
                        <div className="space-y-4 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">  Sales Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                                <div>
                                    <SingleSelectDropdownWithPagination
                                        label="Sales Advisor"
                                        title="Select Advisor"
                                        size="lg"
                                        dataFetchCallBack={fetchEmployeesByDept("Sale")}
                                        onSelected={(item) => handleFieldChange("SalesAdvisorId", Number(item.value))}
                                        initialValue={createDropdownInitialValue(formData.SalesAdvisorId, dropdownLabels.SalesAdvisor)}
                                        error={errors.SalesAdvisorId}
                                    />
                                </div>

                                <div>
                                    <SingleSelectDropdownWithPagination
                                        label="Sourcing Manager"
                                        title="Select Sourcing Manager"
                                        size="lg"
                                        dataFetchCallBack={fetchEmployeesByDept("Sale")}
                                        onSelected={(item) => handleFieldChange("SourcingManagerId", Number(item.value))}
                                        initialValue={createDropdownInitialValue(formData.SourcingManagerId, dropdownLabels.SourcingManager)}
                                        error={errors.SourcingManagerId}
                                    />

                                </div>
                                <div>
                                    <TimePicker
                                        label="Customer Time Out"
                                        size="md"
                                        format={24}
                                        value={formData.EnquiryTimeOut || ""}
                                        onChange={(val) => handleFieldChange("EnquiryTimeOut", val)}
                                        error={errors.EnquiryTimeOut}
                                    />
                                </div>

                            </div>

                            <div>
                                <TextArea
                                    label="Remarks"
                                    className='thin-scroll'
                                    value={formData.Remark ?? ""}
                                    placeholder="Enter Remarks"
                                    onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                    error={errors.Remark} />
                            </div>
                        </div>
                    )}

                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.EnquiryId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction && (
                    formData.EnquiryId === 0 ||
                    formData?.FinalStage?.toLowerCase() !== "lost"
                )}
                onSave={() => {
                    handleAddUpdateEnquiry();
                }}
                isLoading={isLoading}
            />

            <Modal
                isOpen={showOtpSection && formData.EnquiryId === 0}
                onClose={() => {
                    setOtp("");
                    setIsOtpSent(false);
                    setIsOtpVerified(false);
                    setShowOtpSection(false);

                }}
                title="Complete Verification"
                saveText={formData.EnquiryId ? "Update" : "Verify OTP & Add"}
                size="md"
                onSubmit={(e) => {

                    e.preventDefault();

                    if (!otp) {

                        addToast({ type: "error", title: "Please enter OTP" });
                        return;
                    }

                    setIsOtpVerified(true);

                    handleAddUpdateEnquiry();
                }}
            >

                <CompleteVerificationSection
                    steps={getEnquiryVerificationSteps({ formData })}
                    otp={otp}
                    onOtpChange={setOtp}
                    mobileNumber={formData.MobileNumber ?? ""}
                />

            </Modal>

        </div>
    );
};

export default AddUpdateEnquiry;
