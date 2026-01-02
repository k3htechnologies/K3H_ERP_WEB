import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateEnquiryMasterRequest, FilterWithPaginationEnquiryMasterRequest } from "../models/EnquiryMasterModel";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { TextArea } from "@/ui/components/forms/Textarea";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { EnquiryMasterService } from "../services/EnquiryMasterServices";
import { filterEmail, filterMobile } from "@/core/utils/fileValidation";
import { Mail } from "lucide-react";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { ACCOMODATION_TYPE_OPTIONS, AGE_TYPE_OPTION, BUDGET_TYPE_OPTIONS, COMMERCIAL_FLAT_CONFIGURATION, CUSTOMER_CLASSIFICATION_TYPE, DESIRED_FLOOR_BAND, ETHNICITY_TYPE_OPTION, FINAL_STAGE_DETAILS_TYPE_OPTIONS, FINAL_STAGE_TYPE_OPTIONS, NATIONALITY_TYPE_OPTION, NEIGHBORHOOD_PLACES_TYPE_OPTION, OCCUPATION_TYPE_OPTIONS, POSSESSION_TYPE_OPTIONS, REQUIREMENT_TYPE_OPTIONS, RESIDENTIAL_FLAT_CONFIGURATION, SOURCE_OF_FUNDING_TYPE, SOURCE_TYPE_OPTIONS, SUBSOURCE_TYPE_OPTIONS } from "@/core/constants";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchChannelPartnerMasterDropdown } from "../services/channelPartnerDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { TimePicker } from "@/ui/components/TimePicker/TimePicker";

const initialFormState = (): AddUpdateEnquiryMasterRequest => ({
    EnquiryId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    EmployeeId: 0,
    SalesAdvisorId: 0,
    SourcingManagerId: 0,
    PresalesExecutiveId: 0,
    Name: "",
    EmailId: "",
    MobileNumber: "",
    OccupationType: "",
    Accommodation: "",
    Budget: '',
    IsHomeLoan: true,
    Requirement: "",
    RequirementType: "",
    AreaPreferred: 0,
    PossessionType: "",
    Source: "",
    SubSource: "",
    FinalStage: "",
    FinalStageDetail: "",
    NextFollowUpDate: "",
    EnquiryDate: "",
    Remark: "",
    Nationality: "",
    ChannelPartnerId: 0,
    ProjectName: "",
    ChannelPartnerName: "",
    ChannelPartnerMobileNumber: 0,
    CityOfResidence: "",
    CountryOfResidence: "",
    CustomerClassification: "",
    Ethnicity: "",
    DesiredFloorBand: "",
    NeighborhoodPlacesInterestedIn: "",
    SourceOfFunding: "",
    Age: '',
    EnquiryTimeIn: '00:00',
    EnquiryTimeOut: '00:00'
});

export const AddUpdateEnquiryMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateEnquiryMasterRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // NAVIGATE
    const navigate = useNavigate();
    const location = useLocation();

    // GET VALUE FROM URL ENQUIRY MASTER ID
    const { EnquiryId } = useParams<{ EnquiryId?: string }>();

    const { projectId } = useProject();

    const enquiryMasterId = EnquiryId ? Number(EnquiryId) : 0;

    const isAddMode = enquiryMasterId === 0;

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
        employeeName?: string;

    }>({})

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateEnquiryMasterRequest, value: any) => {
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

    //#region HANDLE CHANGE FOR SOURCE DROP DOWN
    const handleSourceChange = (value: string | number) => {

        const sourceValue = String(value);

        setFormData(prev => ({
            ...prev,
            Source: sourceValue,
            SubSource: sourceValue === 'Advertisement' ? prev.SubSource : '',
            ChannelPartnerId: sourceValue === 'Channel Partner' ? prev.ChannelPartnerId : 0
        }));

        setErrors(prev => ({

            ...prev,
            Source: '',
            SubSource: '',
            ChannelPartnerId: ''
        }));
    };

    //#region INITIALIZATION
    useEffect(() => {
        if (!isAddMode) {
            fetchEnquiryMasterDetails();
        }
    }, [EnquiryId]);
    //#endregion

    //#region FETCH ENQUIRY  MASTER DETAILS
    const fetchEnquiryMasterDetails = async () => {
        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {

                const params: FilterWithPaginationEnquiryMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    EnquiryId: enquiryMasterId,
                    ProjectId: Number(projectId)
                };

                const response = await EnquiryMasterService.apiCallPullEnquiryMaster(params);

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
                            OccupationType: e.OccupationType ?? prev.OccupationType,
                            Accommodation: e.Accommodation ?? prev.Accommodation,
                            Budget: e.Budget ?? prev.Budget,
                            Age: e.Age ?? prev.Age,
                            IsHomeLoan: e.IsHomeLoan ?? prev.IsHomeLoan,
                            Requirement: e.Requirement ?? prev.Requirement,
                            RequirementType: e.RequirementType ?? prev.RequirementType,
                            AreaPreferred: e.AreaPreferred ?? prev.AreaPreferred,
                            PossessionType: e.PossessionType ?? prev.PossessionType,
                            Source: e.Source ?? prev.Source,
                            SubSource: e.SubSource ?? prev.SubSource,
                            FinalStage: e.FinalStage ?? prev.FinalStage,
                            FinalStageDetail: e.FinalStageDetail ?? prev.FinalStageDetail,
                            NextFollowUpDate: e.NextFollowUpDate ?? prev.NextFollowUpDate,
                            EnquiryDate: e.EnquiryDate ?? prev.EnquiryDate,
                            Remark: e.Remark ?? prev.Remark,
                            ProjectName: e.ProjectName ?? prev.ProjectName,
                            SalesAdvisorId: e.SalesAdvisorId ?? prev.SalesAdvisorId,
                            SourcingManagerId: e.SourcingManagerId ?? prev.SourcingManagerId,
                            PresalesExecutiveId: e.PresalesExecutiveId ?? prev.PresalesExecutiveId,
                            Nationality: e.Nationality ?? prev.Nationality,
                            DesiredFloorBand: e.DesiredFloorBand ?? prev.DesiredFloorBand,
                            NeighborhoodPlacesInterestedIn: e.NeighborhoodPlacesInterestedIn ?? prev.NeighborhoodPlacesInterestedIn,
                            CustomerClassification: e.CustomerClassification ?? prev.CustomerClassification,
                            CountryOfResidence: e.CountryOfResidence ?? prev.CountryOfResidence,
                            CityOfResidence: e.CityOfResidence ?? prev.CityOfResidence,
                            SourceOfFunding: e.SourceOfFunding ?? prev.SourceOfFunding,
                            Ethnicity: e.Ethnicity ?? prev.Ethnicity,
                            EnquiryTimeIn: e.EnquiryTimeIn ?? prev.EnquiryTimeIn,
                            EnquiryTimeOut: e.EnquiryTimeOut ?? prev.EnquiryTimeOut,
                        }));
                        setDropdownLabels({
                            channelPartnerName: e.ChannelPartnerName || '',
                            employeeName: e.EmployeeName || "",

                        });
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
    const validateAddEnquiryMasterForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.Name) {
            newErrors.Name = 'Enquiry Name is required.';
        } else if (formData.Name.trim().length > 50) {
            newErrors.Name = 'Enquiry Name must be at most 50 characters';
        }

        if (!formData.MobileNumber) {
            newErrors.MobileNumber = 'Mobile Number  is required.';
        }
        if (!formData.EmailId) {
            newErrors.EmailId = 'Email Id  is required.';
        }
        if (!formData.AreaPreferred) {
            newErrors.AreaPreferred = 'Area Preferred is required.';
        }
        if (!formData.EnquiryDate) {
            newErrors.EnquiryDate = 'Enquiry Date  is required.';
        }
        if (!formData.NextFollowUpDate) {
            newErrors.NextFollowUpDate = 'Next Follow-Up Date  is required.';
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    //#region PUSH DATA
    const PushEnquiryMasterFormData = (): AddUpdateEnquiryMasterRequest => {
        return {
            EnquiryId: formData.EnquiryId,
            Uniquekey: formData.Uniquekey,
            ProjectId: Number(projectId),
            EmployeeId: formData.EmployeeId,
            SalesAdvisorId: formData.SalesAdvisorId,
            SourcingManagerId: formData.SourcingManagerId,
            PresalesExecutiveId: formData.PresalesExecutiveId,
            Name: formData.Name,
            EmailId: formData.EmailId,
            MobileNumber: formData.MobileNumber,
            OccupationType: formData.OccupationType,
            Accommodation: formData.Accommodation,
            Budget: formData.Budget,
            Age: formData.Age,
            Nationality: formData.Nationality,
            NeighborhoodPlacesInterestedIn: formData.NeighborhoodPlacesInterestedIn,
            DesiredFloorBand: formData.DesiredFloorBand,
            CustomerClassification: formData.CustomerClassification,
            SourceOfFunding: formData.SourceOfFunding,
            Ethnicity: formData.Ethnicity,
            CountryOfResidence: formData.CountryOfResidence,
            CityOfResidence: formData.CityOfResidence,
            IsHomeLoan: formData.IsHomeLoan,
            Requirement: formData.Requirement,
            RequirementType: formData.RequirementType || null,
            AreaPreferred: formData.AreaPreferred,
            PossessionType: formData.PossessionType,
            Source: formData.Source,
            SubSource: formData.SubSource,
            FinalStage: formData.FinalStage,
            FinalStageDetail: formData.FinalStageDetail,
            NextFollowUpDate: formData.NextFollowUpDate,
            EnquiryDate: formData.EnquiryDate,
            EnquiryTimeIn: formData.EnquiryTimeIn,
            EnquiryTimeOut: formData.EnquiryTimeOut,
            Remark: formData.Remark,
            ChannelPartnerId: formData.ChannelPartnerId,
            ProjectName: formData.ProjectName,
            ChannelPartnerName: formData.ChannelPartnerName,
            ChannelPartnerMobileNumber: formData.ChannelPartnerMobileNumber
        };
    }
    //#endregion

    //#region HANDLE ADD AND UPDATE Enquiry  MASTER
    const handleAddUpdateEnquiryMaster = async () => {

        setErrors({});

        const validation = validateAddEnquiryMasterForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }

        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {
                const payload = PushEnquiryMasterFormData();

                const response = await EnquiryMasterService.apiCallAddUpdateEnquiryMaster(payload);

                if (E.isRight(response)) {
                    addToast({ type: "success", title: isAddMode ? "Enquiry  added successfully" : "Enquiry  updated successfully" });

                    const locationState = location.state as {
                        listState?: {
                            page?: number;
                            filters?: any;
                            sortInfo?: any;
                            searchTerm?: string;
                        };
                    } | null;

                    const listState = locationState?.listState || {
                        page: 1,
                        filters: {},
                        sortInfo: undefined,
                        searchTerm: '',
                    };

                    navigate("/enquiry",
                        {
                            state: { listState }
                        });

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

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

                <form onSubmit={handleAddUpdateEnquiryMaster}>

                    {/* Basic Enquiry Details */}

                    <div className="space-y-4 pb-2">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Basic Enquiry Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
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
                                    label='Contact No.'
                                    leftIcon="+91"
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
                                    label='Email ID'
                                    type="text"
                                    required
                                    value={formData.EmailId ?? ""}
                                    error={errors.EmailId}
                                    rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
                                    onChange={(e) => {
                                        const emailId = filterEmail(e.target.value);
                                        handleFieldChange('EmailId', emailId)
                                    }}
                                    placeholder="Enter Valid Email Id"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3  gap-6">

                            <div>
                                <SinglePageSelection
                                    label="Age"
                                    value={formData.Age ?? ''}
                                    onChange={(value) => handleFieldChange("Age", value)}
                                    options={AGE_TYPE_OPTION.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Age}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Accommodation"
                                    value={formData.Accommodation ?? ''}
                                    onChange={(value) => handleFieldChange("Accommodation", value)}
                                    options={ACCOMODATION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Accommodation}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Occupation Type"
                                    value={formData.OccupationType ?? ''}
                                    onChange={(value) => handleFieldChange("OccupationType", value)}
                                    options={OCCUPATION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.OccupationType}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3  gap-6">

                            <div>
                                <SinglePageSelection
                                    label="Nationality"
                                    value={formData.Nationality ?? ''}
                                    onChange={(value) => handleFieldChange("Nationality", value)}
                                    options={NATIONALITY_TYPE_OPTION.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Nationality}
                                />
                            </div>

                            {formData.Nationality === 'NRI' && (
                                <div>
                                    <Input
                                        type="text"
                                        label='Country Of Residence'
                                        value={formData.CountryOfResidence ?? ""}
                                        onChange={(e) => handleFieldChange("CountryOfResidence", e.target.value)}
                                        placeholder="Enter Country Of Residence"
                                        maxLength={250}
                                        error={errors.CountryOfResidence}
                                    />
                                </div>
                            )}

                            {formData.Nationality === 'NRI' && (
                                <div>
                                    <Input
                                        type="text"
                                        label='City Of Residence'
                                        value={formData.CityOfResidence ?? ""}
                                        onChange={(e) => handleFieldChange("CityOfResidence", e.target.value)}
                                        placeholder="Enter City Of Residence"
                                        maxLength={250}
                                        error={errors.CityOfResidence}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Property Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                                <div>
                                    <SinglePageSelection
                                        label="Possession Type"
                                        value={formData.PossessionType ?? ''}
                                        onChange={(value) => handleFieldChange("PossessionType", value)}
                                        options={POSSESSION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                        error={errors.PossessionType}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label='Area Preferred (In Sq. Ft)'
                                        error={errors.AreaPreferred}
                                        type="text"
                                        required
                                        value={formData.AreaPreferred ?? ''}
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
                                        value={formData.DesiredFloorBand ?? ''}
                                        onChange={(value) => handleFieldChange("DesiredFloorBand", value)}
                                        options={DESIRED_FLOOR_BAND.map(opt => ({ label: opt.name, value: opt.id }))}
                                        error={errors.DesiredFloorBand}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3  gap-6">

                            <div>
                                <SinglePageSelection
                                    label="Budget (In Cr)"
                                    value={formData.Budget ?? ''}
                                    onChange={(value) => handleFieldChange("Budget", value)}
                                    options={BUDGET_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Budget}
                                />
                            </div>

                            <div>
                                <SinglePageSelection
                                    label="Neighborhood Places"
                                    value={formData.NeighborhoodPlacesInterestedIn ?? ''}
                                    onChange={(value) => handleFieldChange('NeighborhoodPlacesInterestedIn', value)}
                                    options={NEIGHBORHOOD_PLACES_TYPE_OPTION.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.NeighborhoodPlaces}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Requirement"
                                    value={formData.Requirement ?? ''}
                                    onChange={(value) => handleFieldChange("Requirement", value)}
                                    options={REQUIREMENT_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Requirement}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            {formData.Requirement === 'Residential' && (
                                <div>
                                    <SinglePageSelection
                                        label="Residential Type"
                                        value={formData.RequirementType ?? ''}
                                        onChange={(value) => handleFieldChange("RequirementType", value)}
                                        options={RESIDENTIAL_FLAT_CONFIGURATION.map(opt => ({ label: opt.name, value: opt.id }))}
                                        error={errors.Residential}
                                    />
                                </div>
                            )}

                            {formData.Requirement === 'Commercial' && (
                                <div>
                                    <SinglePageSelection
                                        label="Commercial Type"
                                        value={formData.RequirementType ?? ''}
                                        onChange={(value) => handleFieldChange("RequirementType", value)}
                                        options={COMMERCIAL_FLAT_CONFIGURATION.map(opt => ({ label: opt.name, value: opt.id }))}
                                        error={errors.CommercialType}
                                    />
                                </div>
                            )}

                        </div>
                        <div className="space-y-4 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Customer Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                                <div>
                                    <SinglePageSelection
                                        label="Customer Classification"
                                        value={formData.CustomerClassification ?? ''}
                                        onChange={(value) => handleFieldChange("CustomerClassification", value)}
                                        options={CUSTOMER_CLASSIFICATION_TYPE.map(opt => ({ label: opt.name, value: opt.id }))}
                                        error={errors.CustomerClassification}
                                    />
                                </div>
                                <div>
                                    <SinglePageSelection
                                        label="Source Of Funding"
                                        value={formData.SourceOfFunding ?? ''}
                                        onChange={(value) => handleFieldChange("SourceOfFunding", value)}
                                        options={SOURCE_OF_FUNDING_TYPE.map(opt => ({ label: opt.name, value: opt.id }))}
                                        error={errors.SourceOfFunding}
                                    />
                                </div>
                                <div>
                                    <SinglePageSelection
                                        label="Ethnicity"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <SinglePageSelection
                                        label="Source"
                                        value={formData.Source ?? ''}
                                        onChange={handleSourceChange}
                                        options={SOURCE_TYPE_OPTIONS.map(opt => ({
                                            label: opt.name,
                                            value: opt.id
                                        }))}
                                        error={errors.Source}
                                    />
                                </div>

                                <div>
                                    <SinglePageSelection
                                        label="Final Stage"
                                        value={formData.FinalStage ?? ''}
                                        onChange={(value) => handleFieldChange("FinalStage", value)}
                                        options={FINAL_STAGE_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                        error={errors.FinalStage}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Advertisement - Sub Source */}
                                {formData.Source === 'Advertisement' && (
                                    <div>
                                        <SinglePageSelection
                                            label="Sub Source"
                                            value={formData.SubSource ?? ''}
                                            onChange={(value) => handleFieldChange("SubSource", String(value))}
                                            options={SUBSOURCE_TYPE_OPTIONS.map(opt => ({
                                                label: opt.name,
                                                value: opt.id
                                            }))}
                                            error={errors.SubSource}
                                        />
                                    </div>
                                )}

                                {/* Channel Partner - Channel Partner Dropdown */}
                                {formData.Source === 'Channel Partner' && (
                                    <div>
                                        <SingleSelectDropdownWithPagination
                                            label="Channel Partner"
                                            title="Select Channel Partner"
                                            size="lg"
                                            dataFetchCallBack={fetchChannelPartnerMasterDropdown}
                                            onSelected={(item) =>
                                                handleFieldChange("ChannelPartnerId", Number(item.value))
                                            }
                                            initialValue={createDropdownInitialValue(formData.ChannelPartnerId,
                                                dropdownLabels.channelPartnerName
                                            )}
                                            error={errors.ChannelPartnerId}
                                        />
                                    </div>
                                )}

                                {formData.FinalStage === 'Lost' && (
                                    <div>
                                        <SinglePageSelection
                                            label="Final Stage Detail"
                                            value={formData.FinalStageDetail ?? ''}
                                            onChange={(value) => handleFieldChange("FinalStageDetail", value)}
                                            options={FINAL_STAGE_DETAILS_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                            error={errors.FinalStageDetail}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Follow Up Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                                <div>
                                    <DatePickerInput
                                        label="Enquiry Date"
                                        required
                                        value={formatDate_dd_mm_yyyy(formData.EnquiryDate)}
                                        onChange={(val) => handleFieldChange('EnquiryDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                        error={errors.EnquiryDate}
                                    />
                                </div>

                                <div>
                                    <DatePickerInput
                                        label="Next Follow-Up Date"
                                        required
                                        value={formatDate_dd_mm_yyyy(formData.NextFollowUpDate)}
                                        onChange={(val) => handleFieldChange('NextFollowUpDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                        error={errors.NextFollowUpDate}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
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
                                    initialValue={createDropdownInitialValue(formData.SalesAdvisorId, dropdownLabels.employeeName)}
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
                                    initialValue={createDropdownInitialValue(formData.SourcingManagerId, dropdownLabels.employeeName
                                    )}
                                    error={errors.SourcingManagerId}
                                />

                            </div>

                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Presales Executive Name"
                                    title="Select Presales Executive Name"
                                    size="lg"
                                    dataFetchCallBack={fetchEmployeesByDept("Sale")}
                                    onSelected={(item) => handleFieldChange("PresalesExecutiveId", Number(item.value))}
                                    initialValue={createDropdownInitialValue(formData.PresalesExecutiveId, dropdownLabels.employeeName)}
                                    error={errors.PresalesExecutiveId}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            <div>
                                <TimePicker
                                    label="Customer Time In"
                                    size="sm"
                                    format={24}
                                    value={formData.EnquiryTimeIn || ""}
                                    onChange={(val) => handleFieldChange("EnquiryTimeIn", val)}
                                    error={errors.EnquiryTimeIn}
                                />
                            </div>
                            <div>
                                <TimePicker
                                    label="Customer Time Out"
                                    size="sm"
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
                                maxLength={500}
                                onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                error={errors.Remark} />
                        </div>
                    </div>

                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.EnquiryId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdateEnquiryMaster();
                }}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AddUpdateEnquiryMaster;
