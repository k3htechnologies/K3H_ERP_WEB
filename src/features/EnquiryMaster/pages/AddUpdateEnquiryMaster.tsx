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
import { filterEmail, filterMobile, isValidEmail, isValidMobile } from "@/core/utils/fileValidation";
import { Mail } from "lucide-react";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { ACCOMODATION_TYPE_OPTIONS, BUDGET_TYPE_OPTIONS, FINAL_STAGE_DETAILS_TYPE_OPTIONS, FINAL_STAGE_TYPE_OPTIONS, OCCUPATION_TYPE_OPTIONS, POSSESSION_TYPE_OPTIONS, REQUIREMENT_TYPE_OPTIONS, SOURCE_TYPE_OPTIONS, SUBSOURCE_TYPE_OPTIONS } from "@/core/constants";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchChannelPartnerMasterDropdown } from "../services/channelPartnerDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { fetchProjectMasterDropdown } from "@/features/ChannelPartnerMaster/services/ProjectMasterDropDown";
import RadioButton from "@/ui/components/forms/RadioButton";

const initialFormState = (): AddUpdateEnquiryMasterRequest => ({
    EnquiryId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
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
    ChannelPartnerId: 0,
    ProjectName: ""
});

export const AddUpdateEnquiryMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateEnquiryMasterRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // NAVIGATE
    const navigate = useNavigate();
    const location = useLocation();

    // GET VALUE FROM URL EnquiryMasterId
    const { EnquiryId } = useParams<{ EnquiryId?: string }>();
    const EnquiryMasterId = EnquiryId ? Number(EnquiryId) : 0;
    const isAddMode = EnquiryMasterId === 0;

    // TOAST
    const { addToast } = useToast();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/enquiry');
    //#endregion

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    //#endregion

    const [dropdownLabels, setDropdownLabels] = useState<{
        channelPartnerName?: string
        projectName?: string
    }>({})

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateEnquiryMasterRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
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
                    EnquiryId: EnquiryMasterId,
                };

                const response = await EnquiryMasterService.apiCallPullEnquiryMaster(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                            EnquiryId: e.EnquiryId ?? prev.EnquiryId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            ProjectId: e.ProjectId && e.ProjectId > 0 ? e.ProjectId : prev.ProjectId,
                            Name: e.Name ?? prev.Name,
                            EmailId: e.EmailId ?? prev.EmailId,
                            MobileNumber: e.MobileNumber ?? prev.MobileNumber,
                            OccupationType: e.OccupationType ?? prev.OccupationType,
                            Accommodation: e.Accommodation ?? prev.Accommodation,
                            Budget: e.Budget ?? prev.Budget,
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
                            Remark: e.Remark ?? prev.Remark
                        }));
                        setDropdownLabels({
                            channelPartnerName: e.ChannelPartnerId?.toString(),
                            projectName: e.ProjectId?.toString()

                        })

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

        if (!formData.EmailId?.trim()) {
            newErrors.EmailId = 'Email is required.';
        } else if (!isValidEmail(formData.EmailId.trim())) {
            newErrors.EmailId = 'Enter a Valid email address.';
        }

        if (!formData.Budget?.trim()) {
            newErrors.Budget = 'Budget is required.';
        }

        if (!formData.MobileNumber?.trim()) {
            newErrors.MobileNumber = 'Mobile Number is required.'
        } else if (!isValidMobile(formData.MobileNumber.trim())) {
            newErrors.MobileNumber = 'Enter a Valid 10-digit mobile number.'
        }

        if (!formData.NextFollowUpDate) {
            newErrors.NextFollowUpDate = "Next Follow Up Date is required";
        }

        if (!formData.EnquiryDate?.trim()) {
            newErrors.EnquiryDate = 'Enquiry Date is required.';
        }

        if (!formData.Accommodation?.trim()) {
            newErrors.Accommodation = 'Accommodation is required.';
        }
        if (!formData.Requirement?.trim()) {
            newErrors.Requirement = 'Requirement is required.';
        }
        if (!formData.PossessionType?.trim()) {
            newErrors.PossessionType = 'Possession Type is required.';
        }

        if (!formData.ProjectId) {
            newErrors.ProjectId = 'Project Name is required.';
        }

        if (!formData.AreaPreferred) {
            newErrors.AreaPreferred = 'Area Preferred is required.';
        }
        if (!formData.Source?.trim()) {
            newErrors.Source = 'Source is required.';
        }

        if (formData.Source === 'Advertisement' && !formData.SubSource?.trim()) {
            newErrors.SubSource = 'Sub Source is required.';
        }

        if (formData.Source === 'Channel Partner' && !formData.ChannelPartnerId) {
            newErrors.ChannelPartnerId = 'Channel Partner is required.';
        }

        if (!formData.FinalStage?.trim()) {
            newErrors.FinalStage = 'Final Stage is required.';
        }
        if (!formData.FinalStageDetail?.trim()) {
            newErrors.FinalStageDetail = 'Final Stage Detail is required.';
        }

        if (!formData.OccupationType?.trim()) {
            newErrors.OccupationType = 'Occupation Type is required.';
        }
        if (!formData.Remark?.trim()) {
            newErrors.Remark = 'Remarks is required.';
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
            ProjectId: Number(formData.ProjectId),
            Name: formData.Name,
            EmailId: formData.EmailId,
            MobileNumber: formData.MobileNumber,
            OccupationType: formData.OccupationType,
            Accommodation: formData.Accommodation,
            Budget: formData.Budget,
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
            Remark: formData.Remark,
            ChannelPartnerId: formData.ChannelPartnerId,
            ProjectName: formData.ProjectName
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
                debugger
                console.log("payload", payload)
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
                                    required
                                    type="text"
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
                                <SingleSelectDropdownWithPagination
                                    label="Project"
                                    title="Select Project"
                                    size="lg"
                                    required
                                    dataFetchCallBack={fetchProjectMasterDropdown}
                                    onSelected={(item) => handleFieldChange('ProjectId', (item.value))}
                                    initialValue={createDropdownInitialValue(formData.ProjectId, dropdownLabels.projectName)}
                                    error={errors.ProjectId}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Accommodation"
                                    required
                                    value={formData.Accommodation ?? ''}
                                    onChange={(value) => handleFieldChange("Accommodation", value)}
                                    options={ACCOMODATION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Accommodation}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Requirement"
                                    required
                                    value={formData.Requirement ?? ''}
                                    onChange={(value) => handleFieldChange("Requirement", value)}
                                    options={REQUIREMENT_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Requirement}
                                />
                            </div>
                            <div>
                            </div>
                        </div>

                        <div className="space-y-4 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Property Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                                <div>
                                    <SinglePageSelection
                                        label="Possession Type"
                                        required
                                        value={formData.PossessionType ?? ''}
                                        onChange={(value) => handleFieldChange("PossessionType", value)}
                                        options={POSSESSION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                        error={errors.PossessionType}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label='Area Preferred'
                                        required
                                        error={errors.AreaPreferred}
                                        type="text"
                                        value={formData.AreaPreferred ?? ''}
                                        maxLength={50}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '');
                                            handleFieldChange('AreaPreferred', digits === '' ? 0 : Number(digits));
                                        }}
                                        placeholder="Enter Area Preferred"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            <div>
                                <SinglePageSelection
                                    label="Occupation Type"
                                    required
                                    value={formData.OccupationType ?? ''}
                                    onChange={(value) => handleFieldChange("OccupationType", value)}
                                    options={OCCUPATION_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.OccupationType}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Budget"
                                    required
                                    value={formData.Budget ?? ''}
                                    onChange={(value) => handleFieldChange("Budget", value)}
                                    options={BUDGET_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Budget}
                                />
                            </div>
                            <div className="flex gap-4">
                                <p>Would You Like To Opt For Home Loan ?</p>
                                
                                <RadioButton
                                    label="Yes"
                                    checked={formData.IsHomeLoan === true}
                                    onChange={() => handleFieldChange("IsHomeLoan", true)}
                                />
                                <RadioButton
                                    label="No"
                                    checked={formData.IsHomeLoan === false}
                                    onChange={() => handleFieldChange("IsHomeLoan", false)}
                                />
                            </div>

                        </div>
                        <div className="space-y-4 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Enquiry Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <SinglePageSelection
                                        label="Source"
                                        required
                                        value={formData.Source ?? ''}
                                        onChange={handleSourceChange}
                                        options={SOURCE_TYPE_OPTIONS.map(opt => ({
                                            label: opt.name,
                                            value: opt.id
                                        }))}
                                        error={errors.Source}
                                    />
                                </div>

                                {/* Advertisement - Sub Source */}
                                {formData.Source === 'Advertisement' && (
                                    <div>
                                        <SinglePageSelection
                                            label="Sub Source"
                                            required
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
                                            required
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
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <SinglePageSelection
                                    label="Final Stage"
                                    required
                                    value={formData.FinalStage ?? ''}
                                    onChange={(value) => handleFieldChange("FinalStage", value)}
                                    options={FINAL_STAGE_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.FinalStage}
                                />
                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Final Stage Detail"
                                    required
                                    value={formData.FinalStageDetail ?? ''}
                                    onChange={(value) => handleFieldChange("FinalStageDetail", value)}
                                    options={FINAL_STAGE_DETAILS_TYPE_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.FinalStageDetail}
                                />
                            </div>
                        </div>
                        <div className="space-y-4 pb-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Follow Up Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                                <div>
                                    <DatePickerInput
                                        label="Enquiry Date"
                                        value={formatDate_dd_mm_yyyy(formData.EnquiryDate)}
                                        onChange={(val) => handleFieldChange('EnquiryDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                        required
                                        error={errors.EnquiryDate}
                                    />
                                </div>

                                <div>
                                    <DatePickerInput
                                        label="Next Follow Up Date"
                                        value={formatDate_dd_mm_yyyy(formData.NextFollowUpDate)}
                                        onChange={(val) => handleFieldChange('NextFollowUpDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                        required
                                        error={errors.NextFollowUpDate}
                                    />
                                </div>
                            </div>

                            <div>
                                <TextArea
                                    label="Remarks"
                                    required
                                    className='thin-scroll'
                                    value={formData.Remark ?? ""}
                                    placeholder="Enter Remarks"
                                    maxLength={500}
                                    onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                    error={errors.Remark} />
                            </div>
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
