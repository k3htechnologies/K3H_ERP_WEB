import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateChannelPartnerRequest, FilterWithPaginationChannelPartnerRequest } from "../models/ChannelPartnerModel";
import { ChannelPartnerService } from "../services/ChannelPartnerService";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { IdCard, Mail, Phone } from "lucide-react";
import { filterAadhaar, filterEmail, filterGST, filterMobile, filterPAN, filterRERA, isValidAadhaar, isValidEmail, isValidMobile, isValidPAN } from "@/core/utils/fileValidation";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { SPECIALITY_TYPE } from "@/core/constants";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { TextArea } from "@/ui/components/forms/Textarea";
import { fetchProjectDropdown } from "@/features/projectMaster/projectDropdown";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";

const initialFormState = (): AddUpdateChannelPartnerRequest => ({
    ChannelPartnerId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    Name: '',
    CompanyName: '',
    MobileNumber: '',
    AlternativeMobileNumber: '',
    EmailId: '',
    AadharCardNumber: '',
    PanNumber: '',
    PanCardURL: null,
    RemovePanCardURL: '',
    RemoveAadharCardURL: '',
    GSTNumber: '',
    RERANumber: '',
    Speciality: '',
    OfficeAddress: '',
    ProjectId: '',
    AadharCardURL: null,
    VillageMasterId: ''

});

export const AddUpdateChannelPartner: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateChannelPartnerRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // AADHAR CARD URL
    const [panCardURLFiles, setPanCardURLFiles] = useState<(File | string)[]>([]);
    const [panCardURL, setPanCardURL] = useState<string[]>([]);
    const [removePanCardUrls, setRemovePanCardUrls] = useState<string[]>([]);

    // PAN CARD URL
    const [aadharCardURLFiles, setAadharCardURLFiles] = useState<(File | string)[]>([]);
    const [aadharCardURL, setAadharCardURL] = useState<string[]>([]);
    const [removeAadharCardUrls, setRemoveAadharCardUrls] = useState<string[]>([]);

    // NAVIGATE
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedProjectValues, setSelectedProjectValues] = useState<string | number | null>(null);

    const projectMasterDropdown = useMultiSelectDropdown({
        value: selectedProjectValues,
        fetchCallback: fetchProjectDropdown,
        autoFetchOptions: true,
    });

    // GET VALUE FROM URL CHANNEL PARTNERID
    const { ChannelPartnerId } = useParams<{ ChannelPartnerId?: string }>();
    const channelPartnerIdParam = ChannelPartnerId ? Number(ChannelPartnerId) : 0;
    const isAddMode = channelPartnerIdParam === 0;

    // TOASTs
    const { addToast } = useToast();

    const { projectId } = useProject();

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/channelPartner');
    //#endregion

        //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateChannelPartnerRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    //#region INITIALIZATION
    useEffect(() => {
        if (!isAddMode) {
            fetchChannelPartnerDetails();
        }
    }, [ChannelPartnerId]);
    //#endregion

    //#region FETCH CHANNEL PARTNER MASTER DETAILS
    const fetchChannelPartnerDetails = async () => {
        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {

                const params: FilterWithPaginationChannelPartnerRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    ChannelPartnerId: ChannelPartnerId ? Number(ChannelPartnerId) : undefined,
                    ProjectId: Number(projectId)

                };

                const response = await ChannelPartnerService.apiCallPullChannelPartner(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                            ChannelPartnerId: e.ChannelPartnerId ?? prev.ChannelPartnerId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            Name: e.Name ?? prev.Name,
                            CompanyName: e.CompanyName ?? prev.CompanyName,
                            EmailId: e.EmailId ?? prev.EmailId,
                            MobileNumber: e.MobileNumber ?? prev.MobileNumber,
                            AlternativeMobileNumber: e.AlternativeMobileNumber ?? prev.AlternativeMobileNumber,
                            AadharCardNumber: e.AadharCardNumber ?? prev.AadharCardNumber,
                            PanNumber: e.PanNumber ?? prev.PanNumber,
                            AadharCardURL: null,
                            RemoveAadharCardURL: '',
                            PanCardURL: null,
                            RemovePanCardURL: '',
                            RERANumber: e.RERANumber ?? prev.RERANumber,
                            GSTNumber: e.GSTNumber ?? prev.GSTNumber,
                            Speciality: e.Speciality ?? prev.Speciality,
                            OfficeAddress: e.OfficeAddress ?? prev.OfficeAddress,
                            ProjectId: e.ProjectId ?? prev.ProjectId

                        }));
                        setSelectedProjectValues(e.ProjectId);
                        setPanCardURLFiles([])
                        setPanCardURL(e.PanCardURL ? e.PanCardURL.split(",") : []);
                        setRemovePanCardUrls([])
                        setAadharCardURLFiles([]);
                        setAadharCardURL(e.AadharCardURL ? e.AadharCardURL.split(",") : []);
                        setRemoveAadharCardUrls([]);
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
            'Loading Channel Partner'
        );
    };
    //#endregion

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddChannelPartnerForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};


        if (!formData.Name) {
            newErrors.Name = 'Name is required.';
        }

        if (!formData.EmailId?.trim()) {
            newErrors.EmailId = 'Email is required.';
        } else if (!isValidEmail(formData.EmailId.trim())) {
            newErrors.EmailId = 'Enter a Valid email address.';
        }


        if (!formData.MobileNumber?.trim()) {
            newErrors.MobileNumber = 'Mobile Number is required.'
        } else if (!isValidMobile(formData.MobileNumber.trim())) {
            newErrors.MobileNumber = 'Enter a Valid 10-digit mobile number.'
        }

        if (!formData.AadharCardNumber?.trim()) {
            newErrors.AadharCardNumber = 'Aadhar Number is required.'
        } else if (!isValidAadhaar(formData.AadharCardNumber.trim())) {
            newErrors.AadharCardNumber = 'Enter a Valid 12-digit Aadhar Number.'
        }

        if (!formData.PanNumber?.trim()) {
            newErrors.PanNumber = 'PAN Number is required.'
        } else if (!isValidPAN(formData.PanNumber.trim())) {
            newErrors.PanNumber = 'Enter a Valid PAN Number.'
        }

        if (!formData.CompanyName) {
            newErrors.CompanyName = ' Company Name is required.';
        }


        if (!formData.RERANumber) {
            newErrors.RERANumber = ' RERA Number is required.';
        }

        if (!formData.GSTNumber) {
            newErrors.GSTNumber = 'GST Number is required.';
        }

        if (!panCardURLFiles.length && !panCardURL.length) {
            newErrors.PanCardURL = "Pan Card is required.";
        }

        if (!aadharCardURLFiles.length && !aadharCardURL.length) {
            newErrors.AadharCardURL = "Aadhar Card is required.";
        }


        if (!formData.Speciality) {
            newErrors.Speciality = 'Speciality is required.';
        }

        if (!formData.OfficeAddress) {
            newErrors.OfficeAddress = 'Office Address is required.';
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    //#region PUSH DATA
    const PushChannelPartnerFormData = (): FormData => {
        const fd = new FormData();

        const projectIdsString = projectMasterDropdown.selectedValues.length > 0
            ? projectMasterDropdown.selectedValues.join(',')
            : '';

        fd.append("ChannelPartnerId", String(formData.ChannelPartnerId ?? 0));
        fd.append("Uniquekey", formData.Uniquekey ?? "");
        fd.append("Name", formData.Name ?? "");
        fd.append("CompanyName", formData.CompanyName ?? "");
        fd.append("EmailId", formData.EmailId ?? "");
        fd.append("MobileNumber", formData.MobileNumber ?? "");
        fd.append("AlternativeMobileNumber", formData.AlternativeMobileNumber ?? "");
        fd.append("AadharCardNumber", formData.AadharCardNumber ?? "");
        fd.append("PanNumber", formData.PanNumber ?? "");
        fd.append("RERANumber", formData.RERANumber ?? "");
        fd.append("GSTNumber", formData.GSTNumber ?? "");
        fd.append("OfficeAddress", formData.OfficeAddress ?? "");
        fd.append("Speciality", formData.Speciality ?? "");
        fd.append("ProjectId", projectIdsString ?? "");

        panCardURLFiles.forEach(file => {
            if (file instanceof File) {
                fd.append("PanCardURL", file);
            }
        });

        fd.append("RemovePanCardURL", removePanCardUrls.join(","));

        aadharCardURLFiles.forEach(file => {
            if (file instanceof File) {
                fd.append("AadharCardURL", file);
            }
        });

        fd.append("RemoveAadharCardURL", removeAadharCardUrls.join(","));

        return fd;
    };
    //#endregion

    //#region HANDLE ADD AND UPDATE CHANNEL PARTNER MASTER
    const handleAddUpdateChannelPartner = async () => {

        setErrors({});

        const validation = validateAddChannelPartnerForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }

        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {
                const payload = PushChannelPartnerFormData();

                const response = await ChannelPartnerService.apiCallAddUpdateChannelPartner(payload);

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

                    navigate("/channelPartner",
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
            isAddMode ? 'Add' : 'Update'
        );
    };
    //#endregion

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

                <form onSubmit={handleAddUpdateChannelPartner}>

                    {/* Basic ChannelPartner Details */}

                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">

                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Full Name'
                                    value={formData.Name ?? ""}
                                    onChange={(e) => handleFieldChange("Name", e.target.value)}
                                    placeholder="Enter Full Name"
                                    maxLength={250}
                                    error={errors.Name}
                                />
                            </div>

                            <div>
                                <Input
                                    label='Email Id'
                                    required
                                    type="text"
                                    value={formData.EmailId}
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
                                <Input
                                    leftIcon="+91"
                                    label=" Mobile Number"
                                    required
                                    maxLength={10}
                                    value={formData.MobileNumber}
                                    rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    onChange={(e) => handleFieldChange("MobileNumber", filterMobile(e.target.value))}
                                    placeholder="Enter Mobile Number"
                                    error={errors.MobileNumber} />
                            </div>
                            <div>
                                <Input
                                    leftIcon="+91"
                                    label="Alternative Mobile Number"
                                    maxLength={10}
                                    value={formData.AlternativeMobileNumber}
                                    rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    onChange={(e) => handleFieldChange("AlternativeMobileNumber", filterMobile(e.target.value))}
                                    placeholder="Enter Alternative Mobile Number"
                                    error={errors.AlternativeMobileNumber} />
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Company Name'
                                    value={formData.CompanyName ?? ""}
                                    onChange={(e) => handleFieldChange("CompanyName", e.target.value)}
                                    placeholder="Enter Company Name"
                                    maxLength={250}
                                    error={errors.CompanyName}
                                />
                            </div>

                        </div>
                    </div>

                    {/* ============================================================= [BANK DETAILS] ============================================================================================= */}
                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Document Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label="Aadhaar Number"
                                    value={formData.AadharCardNumber ?? ""}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, '');
                                        handleFieldChange("AadharCardNumber", filterAadhaar(digits));
                                    }}
                                    placeholder="Enter Aadhaar Number"
                                    rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                                    maxLength={12}
                                    error={errors.AadharCardNumber}
                                />
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='PAN Number'
                                    value={formData.PanNumber.toUpperCase() ?? ""}
                                    rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                                    onChange={(e) => handleFieldChange("PanNumber", filterPAN(e.target.value).toUpperCase())}
                                    placeholder="Enter Pan Number"
                                    maxLength={10}
                                    error={errors.PanNumber}
                                />
                            </div>
                            <div>
                                <MultiFilePicker
                                    label=' Upload Aadhaar Card'
                                    placeholder="Select Aadhaar Card"
                                    required
                                    error={errors.AadharCardURL}
                                    value={aadharCardURLFiles}
                                    onChange={setAadharCardURLFiles}
                                    availableFilesURL={aadharCardURL ?? ""}
                                    allowedTypes={[
                                        "image/jpeg",
                                        "image/png",
                                        "image/jpg"]}
                                    maxFiles={5}
                                    maxSizeMB={50}
                                    onRemoveExisting={(url) => {
                                        setRemoveAadharCardUrls(prev => [...prev, url]);

                                    }}

                                />
                            </div>
                            <div>
                                <MultiFilePicker
                                    label=' Upload PAN Card'
                                    placeholder="Select PAN Card"
                                    required
                                    error={errors.PanCardURL}
                                    value={panCardURLFiles}
                                    onChange={setPanCardURLFiles}
                                    availableFilesURL={panCardURL ?? ""}
                                    allowedTypes={[
                                        "image/jpeg",
                                        "image/png",
                                        "image/jpg"]}
                                    maxFiles={5}
                                    maxSizeMB={50}
                                    onRemoveExisting={(url) => {
                                        setRemovePanCardUrls(prev => [...prev, url]);
                                    }}
                                />

                            </div>

                            <div>
                                <Input
                                    label='RERA Number'
                                    required
                                    type="text"
                                    value={formData.RERANumber}
                                    error={errors.RERANumber}
                                    rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                                    maxLength={20}
                                    onChange={(e) => {
                                        const reraNumber = filterRERA(e.target.value);
                                        handleFieldChange('RERANumber', reraNumber)
                                    }}
                                    placeholder="Enter Valid RERA Number"
                                />
                            </div>
                            <div>
                                <Input
                                    label='GST Number'
                                    required
                                    type="text"
                                    value={formData.GSTNumber}
                                    rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                                    error={errors.GSTNumber}
                                    onChange={(e) => {
                                        const gstNumber = filterGST(e.target.value);
                                        handleFieldChange('GSTNumber', gstNumber)
                                    }}
                                    placeholder="Enter Valid GST Number"
                                />
                            </div>

                            <div>
                                <SinglePageSelection
                                    label="Speciality"
                                    required
                                    value={formData.Speciality}
                                    onChange={(e) => handleFieldChange('Speciality', String(e))}
                                    options={SPECIALITY_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Speciality}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Project Details</h3>

                        <div>

                            <MultiSelectPagination
                                label="Add Project"
                                dataFetchCallBack={fetchProjectDropdown}
                                selectedValues={projectMasterDropdown.selectedValues}
                                options={projectMasterDropdown.initialOptions}
                                onChange={(values) => {
                                    const { idsString } = projectMasterDropdown.handleChange(values);
                                    setSelectedProjectValues(idsString || null);
                                    if (errors.ProjectId) {
                                        setErrors((prev) => ({ ...prev, ProjectId: '' }));
                                    }
                                }}
                            />

                        </div>

                    </div>
                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Address Details</h3>

                        <TextArea
                            required
                            label='Office Address'
                            className='thin-scroll'
                            value={formData.OfficeAddress ?? ""}
                            onChange={(e) => handleFieldChange("OfficeAddress", e.target.value)}
                            placeholder="Enter Office Address"
                            maxLength={500}
                            error={errors.OfficeAddress}
                        />

                    </div>

                </form>
            </div >

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.ChannelPartnerId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdateChannelPartner();
                }}
                isLoading={isLoading}
            />
        </div >
    );
};

export default AddUpdateChannelPartner;
