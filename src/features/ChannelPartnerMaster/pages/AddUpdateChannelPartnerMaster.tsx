import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/ui/components/forms/Button";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateChannelPartnerMasterRequest, FilterWithPaginationChannelPartnerMasterRequest } from "../models/ChannelPartnerMasterModel";
import { ChannelPartnerMasterService } from "../services/ChannelPartnerMasterService";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { Mail, Phone } from "lucide-react";
import { filterAadhaar, filterEmail, filterGST, filterMobile, filterPAN, filterRERA, isValidAadhaar, isValidEmail, isValidMobile, isValidPAN } from "@/core/utils/fileValidation";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { SPECIALITY_TYPE } from "@/core/constants";
import { fetchProjectMasterDropdown } from "../services/ProjectMasterDropDown";

const initialFormState = (): AddUpdateChannelPartnerMasterRequest => ({
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
    ProjectName: '',
   
});

export const AddUpdateChannelPartnerMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateChannelPartnerMasterRequest>(() => initialFormState());
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

    // GET VALUE FROM URL CHANNELPARTNERID
    const { ChannelPartnerId } = useParams<{ ChannelPartnerId?: string }>();
    const ChannelPartnerMasterId = ChannelPartnerId ? Number(ChannelPartnerId) : 0;
    const isAddMode = ChannelPartnerMasterId === 0;

    // TOASTs
    const { addToast } = useToast();

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    //#endregion


    const [dropdownLabels, setDropdownLabels] = useState<{
        designationName?: string;
        projectName?: string
    }>({});

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateChannelPartnerMasterRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    //#region INITIALIZATION
    useEffect(() => {
        if (!isAddMode) {
            fetchChannelPartnerMasterDetails();
        }
    }, [ChannelPartnerId]);
    //#endregion

    //#region FETCH CHANNEL PARTNER MASTER DETAILS
    const fetchChannelPartnerMasterDetails = async () => {
        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {

                const params: FilterWithPaginationChannelPartnerMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    ChannelPartnerId: ChannelPartnerId ? Number(ChannelPartnerId) : undefined
                };

                const response = await ChannelPartnerMasterService.apiCallPullChannelPartnerMaster(params);

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
                            ProjectId: e.ProjectId ?? prev.ProjectId,
                        }));
                        setPanCardURLFiles([])
                        setPanCardURL(e.PanCardURL ? e.PanCardURL.split(",") : []);
                        setRemovePanCardUrls([])
                        setAadharCardURLFiles([]);
                        setAadharCardURL(e.AadharCardURL ? e.AadharCardURL.split(",") : []);
                        setRemoveAadharCardUrls([]);

                        setDropdownLabels({
                            projectName: e.ProjectName || '',

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
            'Loading Channel Partner Data'
        );
    };
    //#endregion

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddChannelPartnerMasterForm = (): {

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
            newErrors.EmailId = 'Enter a valid email address.';
        }


        if (!formData.MobileNumber?.trim()) {
            newErrors.MobileNumber = 'Mobile Number is required.'
        } else if (!isValidMobile(formData.MobileNumber.trim())) {
            newErrors.MobileNumber = 'Enter a valid 10-digit mobile number.'
        }

        if (!formData.AadharCardNumber?.trim()) {
            newErrors.AadharCardNumber = 'Aadhar Number is required.'
        } else if (!isValidAadhaar(formData.AadharCardNumber.trim())) {
            newErrors.AadharCardNumber = 'Enter a valid 12-digit Aadhar Number.'
        }

        if (!formData.PanNumber?.trim()) {
            newErrors.PanNumber = 'PAN Number is required.'
        } else if (!isValidPAN(formData.PanNumber.trim())) {
            newErrors.PanNumber = 'Enter a valid PAN Number.'
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

        if (!formData.ProjectId) {
            newErrors.ProjectId = 'Project Name is Required.';
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    //#region PUSH DATA
    const PushChannelPartnerMasterFormData = (): FormData => {
        const fd = new FormData();

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
        fd.append("ProjectId", formData.ProjectId ?? "");

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
    const handleAddUpdateChannelPartnerMaster = async (e: React.FormEvent) => {

        e.preventDefault();

        setErrors({});

        const validation = validateAddChannelPartnerMasterForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }

        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {
                const payload = PushChannelPartnerMasterFormData();
                console.log(payload)
                const response = await ChannelPartnerMasterService.apiCallAddUpdateChannelPartnerMaster(payload);

                if (E.isRight(response)) {
                    addToast({ type: "success", title: isAddMode ? "Channel Partner added successfully" : "Channel Partner updated successfully" });

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

            <div className="flex-1 space-y-2 px-6 py-3 pb-40 overflow-y-auto thin-scroll ">

                <form onSubmit={handleAddUpdateChannelPartnerMaster}>

                    {/* Basic ChannelPartner Details */}

                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Channel Partner Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label='Full Name'
                                    value={formData.Name ?? ""}
                                    onChange={(e) => handleFieldChange("Name", e.target.value)}
                                    placeholder="Enter channel partner name"
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
                                    leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                                    onChange={(e) => {
                                        const emailId = filterEmail(e.target.value);
                                        handleFieldChange('EmailId', emailId)
                                    }}
                                    placeholder="Enter valid email id"
                                />
                            </div>

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            <div>
                                <Input
                                    label='Mobile Number'
                                    required
                                    error={errors.MobileNumber}
                                    type="text"
                                    value={formData.MobileNumber}
                                    maxLength={10}
                                    leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    onChange={(e) => {
                                        const mobileNumber = filterMobile(e.target.value);
                                        handleFieldChange('MobileNumber', mobileNumber)
                                    }}
                                    placeholder="Enter valid mobile number"
                                />

                            </div>
                            <div>
                                <Input
                                    type="text"
                                    label='Alternative Contact No.'
                                    value={formData.AlternativeMobileNumber ?? ""}
                                    maxLength={10}
                                    leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                                    onChange={(e) => {
                                        const AlternativeMobileNumber = filterMobile(e.target.value);
                                        handleFieldChange('AlternativeMobileNumber', AlternativeMobileNumber)
                                    }}
                                    placeholder="Enter Alternative Contact Number"
                                    error={errors.AlternativeMobileNumber}
                                />
                            </div>


                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            <div>
                                <Input
                                    type="text"
                                    required
                                    label="Aadhar Number"
                                    value={formData.AadharCardNumber ?? ""}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, '');
                                        handleFieldChange("AadharCardNumber", filterAadhaar(digits));
                                    }}
                                    placeholder="Enter Aadhar Number"
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
                                    onChange={(e) => handleFieldChange("PanNumber", filterPAN(e.target.value).toUpperCase())}
                                    placeholder="Enter Pan Number"
                                    maxLength={10}
                                    error={errors.PanNumber}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                            <div>
                                <MultiFilePicker
                                    label=' Upload Aadhar Card '
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
                                        setAadharCardURL(prev => prev.filter(u => u !== url));

                                    }}

                                />
                            </div>
                            <div>
                                <MultiFilePicker
                                    label=' Upload Pan Card'
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
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
                            <div>
                                <Input
                                    label='RERA Number'
                                    required
                                    type="text"
                                    value={formData.RERANumber}
                                    error={errors.RERANumber}
                                    maxLength={20}
                                    onChange={(e) => {
                                        const reraNumber = filterRERA(e.target.value);
                                        handleFieldChange('RERANumber', reraNumber)
                                    }}
                                    placeholder="Enter valid RERA Number"
                                />
                            </div>
                            <div>
                                <Input
                                    label='GST Number'
                                    required
                                    type="text"
                                    value={formData.GSTNumber}
                                    error={errors.GSTNumber}
                                    onChange={(e) => {
                                        const gstNumber = filterGST(e.target.value);
                                        handleFieldChange('GSTNumber', gstNumber)
                                    }}
                                    placeholder="Enter valid GST Number"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">

                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Project"
                                    title="Select Project"
                                    size="lg"
                                    required
                                    dataFetchCallBack={fetchProjectMasterDropdown}
                                    onSelected={(item) => handleFieldChange('ProjectId', String(item.value))}
                                    initialValue={createDropdownInitialValue(formData.ProjectId, dropdownLabels.projectName)}
                                    error={errors.ProjectId}
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

                        <div>
                            <Input
                                type="text"
                                required
                                label='Office Address'
                                value={formData.OfficeAddress ?? ""}
                                onChange={(e) => handleFieldChange("OfficeAddress", e.target.value)}
                                placeholder="Enter Office Address"
                                maxLength={250}
                                error={errors.OfficeAddress}
                            />

                        </div>
                    </div>
                </form>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)', left: "299px", right: '14px' }}>
                <Button
                    color="transparent"
                    variant='transparent_border'
                    size="sm"
                    onClick={() => { navigate(-1); }}
                    className="px-6"
                >
                    Cancel
                </Button>

                <Button
                    color="green"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault();
                        handleAddUpdateChannelPartnerMaster(e);
                    }}
                    className="px-6"
                    disabled={isLoading}
                >
                    {isAddMode ? "Save" : "Update"}
                </Button>
            </div>
        </div>

    );
};

export default AddUpdateChannelPartnerMaster;
