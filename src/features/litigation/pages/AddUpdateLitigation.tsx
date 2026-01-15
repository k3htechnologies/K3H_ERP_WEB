import { useEffect, useState } from "react";
import type { AddUpdateLitigationRequest, FilterWithPaginationLitigationRequest } from "../models/LitigationModel";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useToast from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { Input } from "@/ui/components/forms";
import { litigationService } from "@/features/litigation/services/LitigationServices";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { CASE_TYPE_OPTION, COURT_TYPE_OPTION } from "@/core/constants";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Loader } from "@/core/utils/loader";
import { TextArea } from "@/ui/components/forms/Textarea";

const initialFormState = (): AddUpdateLitigationRequest => ({
    LitigationId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ProjectId: 0,
    Title: '',
    CaseNumber: '',
    CaseType: '',
    DateOfFilling: '',
    CourtLocation: '',
    CourtType: '',
    CourtName: '',
    Plantiff: '',
    Defendant: '',
    AssignedRepresentative: '',
    OpposingRepresentative: '',
    Remark: '',
    CaseBrief: ''
})

export const AddUpdateLitigation: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateLitigationRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // NAVIGATE
    const navigate = useNavigate();
    const location = useLocation();

    // GET VALUE FROM URL LITIGATION ID
    const { LitigationId } = useParams<{ LitigationId?: string }>();
    const litigationId = LitigationId ? Number(LitigationId) : 0;
    const isAddMode = litigationId === 0;

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { projectId } = useProject();

    // TOAST
    const { addToast } = useToast();
    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/litigation');
    //#endregion

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateLitigationRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    //#region INITIALIZATION

    useEffect(() => {
        if (!isAddMode) {
            fetchLitigationDetails();
        }
        
    }, [litigationId]);
    //#endregion

    //#region FETCH LITIGATION  DETAILS
    const fetchLitigationDetails = async () => {

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,

            async () => {

                const params: FilterWithPaginationLitigationRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    LitigationId: Number(LitigationId),
                    ProjectId: Number(projectId),
                };

                const response = await litigationService.apiCallPullLitigation(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                            LitigationId: e.LitigationId ?? prev.LitigationId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            ProjectId: e.ProjectId ?? prev.ProjectId,
                            Title: e.Title ?? prev.Title,
                            CaseNumber: e.CaseNumber ?? prev.CaseNumber,
                            CaseType: e.CaseType ?? prev.CaseType,
                            CourtType: e.CourtType ?? prev.CourtType,
                            DateOfFilling: e.DateOfFilling ?? prev.DateOfFilling,
                            CourtLocation: e.CourtLocation ?? prev.CourtLocation,
                            CourtName: e.CourtName ?? prev.CourtName,
                            Plantiff: e.Plantiff ?? prev.Plantiff,
                            Defendant: e.Defendant ?? prev.Defendant,
                            AssignedRepresentative: e.AssignedRepresentative ?? prev.AssignedRepresentative,
                            OpposingRepresentative: e.OpposingRepresentative ?? prev.OpposingRepresentative,
                            Remark: e.Remark ?? prev.Remark,
                            CaseBrief: e.CaseBrief ?? prev.CaseBrief
                        }));

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
            'Loading Litigation'
        );
    };
    //#endregion

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddLitigationForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.Title?.trim()) {
            newErrors.Title = 'Title  is required.';
        } else if (formData.Title.trim().length > 50) {
            newErrors.Title = 'Title  must be at most 50 characters';
        }
        if (!formData.DateOfFilling) {
            newErrors.DateOfFilling = 'Date Of Filling is required.';
        }
        if (!formData.CaseType) {
            newErrors.CaseType = 'Case Type is required.';
        }
        if (!formData.CaseNumber) {
            newErrors.CaseNumber = 'Case Number is required.';
        }
        if (!formData.CourtName) {
            newErrors.CourtName = 'Court Name is required.';
        }
        if (!formData.CourtLocation) {
            newErrors.CourtLocation = 'Court Location is required.';
        }
        if (!formData.CourtType) {
            newErrors.CourtType = 'Court Type is required.';
        }
        if (!formData.Plantiff) {
            newErrors.Plantiff = 'Plantiff is required.';
        }
        if (!formData.Defendant) {
            newErrors.Defendant = 'Defendant is required.';
        }
        if (!formData.AssignedRepresentative) {
            newErrors.AssignedRepresentative = 'Assigned Representative is required.';
        }
        if (!formData.OpposingRepresentative) {
            newErrors.OpposingRepresentative = 'Opposing Representative is required.';
        }
        if (!formData.CaseBrief) {
            newErrors.CaseBrief = 'Case Brief is required.';
        }
        if (!formData.Remark) {
            newErrors.Remark = 'Remark is required.';
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    //#region PUSH DATA
    const PushAddUpdateLigitigationData = (): AddUpdateLitigationRequest => {

        return {
            LitigationId: formData.LitigationId ?? 0,
            Uniquekey: formData.Uniquekey ?? "",
            ProjectId: Number(projectId) ?? "",
            Title: formData.Title ?? "",
            CaseNumber: formData.CaseNumber ?? "",
            CaseType: formData.CaseType ?? "",
            CourtType: formData.CourtType ?? "",
            DateOfFilling: formData.DateOfFilling ?? "",
            CourtLocation: formData.CourtLocation ?? "",
            CourtName: formData.CourtName ?? "",
            Plantiff: formData.Plantiff ?? "",
            Defendant: formData.Defendant ?? "",
            AssignedRepresentative: formData.AssignedRepresentative ?? "",
            OpposingRepresentative: formData.OpposingRepresentative ?? "",
            Remark: formData.Remark ?? "",
            CaseBrief: formData.CaseBrief ?? "",
        };
    }
    //#endregion

    //#region HANDLE  ADD UPDATE
    
    const handleAddUpdateLitigation = async () => {
        setErrors({});

        const validation = validateAddLitigationForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }
        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,

            async () => {
                const payload = PushAddUpdateLigitigationData();

                const response = await litigationService.apiCallAddUpdateLitigation(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

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
                    navigate("/litigation",
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
            isAddMode ? 'Add Litigation' : 'Update Litigation'
        );
    };
    //#endregion

    //endregion
    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

                <form onSubmit={handleAddUpdateLitigation}>

                    {/* Basic Litigation Details */}

                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Case Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Title '
                                    value={formData.Title ?? ""}
                                    onChange={(e) => handleFieldChange("Title", e.target.value)}
                                    placeholder="Enter Title "
                                    maxLength={250}
                                    error={errors.Title}
                                />
                            </div>

                            <div>
                                <DatePickerInput
                                    label="Date Of Filling"
                                    value={formatDate_dd_mm_yyyy(formData.DateOfFilling)}
                                    onChange={(val) => handleFieldChange('DateOfFilling', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                                    required
                                    error={errors.DateOfFilling}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">

                            <div>
                                <SinglePageSelection
                                    label="Case Type"
                                    placeholder="Select Case Type"
                                    value={formData.CaseType ?? ''}
                                    onChange={(value) => handleFieldChange("CaseType", value)}
                                    options={CASE_TYPE_OPTION.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.CaseType}
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Case Number'
                                    value={formData.CaseNumber?.toUpperCase() ?? ""}
                                    onChange={(e) => handleFieldChange("CaseNumber", e.target.value)}
                                    placeholder="Enter Case Number"
                                    maxLength={16}
                                    error={errors.CaseNumber}
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Case Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Court Name'
                                    value={formData.CourtName ?? ""}
                                    onChange={(e) => handleFieldChange("CourtName", e.target.value)}
                                    placeholder="Enter Court Name"
                                    maxLength={250}
                                    error={errors.CourtName}
                                />
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Court Location'
                                    value={formData.CourtLocation ?? ""}
                                    onChange={(e) => handleFieldChange("CourtLocation", e.target.value)}
                                    placeholder="Enter Court Location"
                                    maxLength={250}
                                    error={errors.CourtLocation}
                                />
                            </div>

                            <div>
                                <SinglePageSelection
                                    label="Court Type"
                                    placeholder="Select Court Type"
                                    value={formData.CourtType ?? ''}
                                    onChange={(value) => handleFieldChange("CourtType", value)}
                                    options={COURT_TYPE_OPTION.map(opt => ({ label: opt.name, value: opt.id }))}
                                    error={errors.CourtType}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Plantiff'
                                    value={formData.Plantiff ?? ""}
                                    onChange={(e) => handleFieldChange("Plantiff", e.target.value)}
                                    placeholder="Enter Plantiff"
                                    maxLength={250}
                                    error={errors.Plantiff}
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Defendant'
                                    value={formData.Defendant ?? ""}
                                    onChange={(e) => handleFieldChange("Defendant", e.target.value)}
                                    placeholder="Enter Defendant"
                                    maxLength={250}
                                    error={errors.Defendant}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Assigned Representative'
                                    value={formData.AssignedRepresentative ?? ""}
                                    onChange={(e) => handleFieldChange("AssignedRepresentative", e.target.value)}
                                    placeholder="Enter Assigned Representative"
                                    maxLength={250}
                                    error={errors.AssignedRepresentative}
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Opposing Representative'
                                    value={formData.OpposingRepresentative ?? ""}
                                    onChange={(e) => handleFieldChange("OpposingRepresentative", e.target.value)}
                                    placeholder="Enter Opposing Representative"
                                    maxLength={250}
                                    error={errors.OpposingRepresentative}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">

                            <div>
                                <TextArea
                                    label="Case Brief"
                                    required
                                    className='thin-scroll'
                                    value={formData.CaseBrief ?? ""}
                                    placeholder="Enter Case Brief"
                                    maxLength={400}
                                    onChange={(e) => handleFieldChange("CaseBrief", e.target.value)}
                                    error={errors.CaseBrief} />
                            </div>

                            <div>
                                <TextArea
                                    label="Remarks"
                                    required
                                    className='thin-scroll'
                                    value={formData.Remark ?? ""}
                                    placeholder="Enter Remarks"
                                    maxLength={400}
                                    onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                    error={errors.Remark} />
                            </div>
                        </div>

                    </div>
                </form>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.LitigationId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdateLitigation();
                }}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AddUpdateLitigation;
