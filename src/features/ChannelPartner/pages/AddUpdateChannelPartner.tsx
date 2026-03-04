import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateChannelPartnerRequest, FilterWithPaginationChannelPartnerRequest } from "@/features/ChannelPartner/models/ChannelPartnerModel";
import { ChannelPartnerService } from "@/features/ChannelPartner/services/ChannelPartnerService";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { IdCard, Mail, Phone } from "lucide-react";
import { filterAadhaar, filterEmail, filterGST, filterMobile, filterPAN, filterRERA, hasAnyDocumentFile, isValidAadhaar, isValidGST, isValidMobile, isValidPAN, isValidRERA } from "@/core/utils/fileValidation";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { CHANNE_PARTNER_DESIGNATION, CHANNE_PARTNER_TYPE, COMPANY_TYPE_OPTIONS, FIRMS_TYPE_OPTIONS, SPECIALITY_TYPE } from "@/core/constants";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { TextArea } from "@/ui/components/forms/Textarea";
import Checkbox from "@/ui/components/forms/Checkbox";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchChannelPartnerById, fetchChannelPartnerCompanyDropdown } from "@/features/ChannelPartner/channelPartnerDropDown";
import CompleteVerificationSection from "@/ui/components/TwoWayVerification/CompleteVerificationSection";
import { Modal } from "@/ui/components/Modal/Modal";
import { sendOTP } from "@/features/technical/services/OTPService";
import { getChannelPartnerVerificationSteps } from "@/features/ChannelPartner/utils/channelPartnerVerificationSteps";

const initialFormState = (): AddUpdateChannelPartnerRequest => ({
    ChannelPartnerId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    Name: '',
    CompanyName: '',

    FirmsType: '',
    Designation: '',
    Type: '',
    CompanyType: '',

    MobileNumber: '',
    AlternativeMobileNumber: '',
    EmailId: '',
    PanNumber: '',
    PanCardURL: null,
    RemovePanCardURL: '',

    AadharCardNumber: '',
    AadharCardURL: null,
    RemoveAadharCardURL: '',

    GSTNumber: '',
    GSTCertificateURL: null,
    RemoveGSTCertificateURL: '',

    IsRERANumber: 0,
    RERANumber: '',
    Speciality: '',
    OfficeAddress: '',


    CountryMasterId: 1,
    DistrictMasterId: null,
    StateMasterId: null,
    CityMasterId: null,
    VillageMasterId: null,
    OTP: "",
});

export const AddUpdateChannelPartner: React.FC = () => {

    //#region STATE MANAGEMENT
    const [formData, setFormData] = useState<AddUpdateChannelPartnerRequest>(() => initialFormState());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // PAN CARD URL

    const [panCardURLFiles, setPanCardURLFiles] = useState<(File | string)[]>([]);
    const [panCardURL, setPanCardURL] = useState<string>();
    const [removePanCardUrls, setRemovePanCardUrls] = useState<string[]>([]);

    // AADHAR CARD URL
    const [aadharCardURLFiles, setAadharCardURLFiles] = useState<(File | string)[]>([]);
    const [aadharCardURL, setAadharCardURL] = useState<string>();
    const [removeAadharCardUrls, setRemoveAadharCardUrls] = useState<string[]>([]);

    // GST CERTIFICATE URL

    const [gSTCertificateURLFiles, setGSTCertificateURLFiles] = useState<(File | string)[]>([]);
    const [gSTCertificateURL, setGSTCertificateURL] = useState<string>();
    const [removeGSTCertificateUrls, setRemoveGSTCertificateUrls] = useState<string[]>([]);

    //COMPLETE VERIFICATION
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [showOtpSection, setShowOtpSection] = useState(false);

    // NAVIGATE
    const navigate = useNavigate();

    // GET VALUE FROM URL CHANNEL PARTNERID
    const { ChannelPartnerId } = useParams<{ ChannelPartnerId?: string }>();
    const channelPartnerIdParam = ChannelPartnerId ? Number(ChannelPartnerId) : 0;
    const isAddMode = channelPartnerIdParam === 0;

    const [isReadOnly, setIsReadOnly] = useState<boolean>();

    // TOASTs
    const { addToast } = useToast();

    // ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/channelPartner');
    //#endregion

    //#region COUNTRY STATE CITY DISTRICT 
    const {
        isLoading: isLocationLoading,
        countries,
        statesByCountryId,
        districtsByStateId,
        citiesByDistrictId,
        villagesByCityId
    } = useCountryStateCityDistrictVillageData()

    const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1)
    const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)
    const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null)
    const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null)
    const [selectedVillageId, setSelectedVillageId] = React.useState<number | null>(null)

    const countryOptions = countries.map(c => ({ label: c.name, value: c.id }))

    const stateOptions =
        selectedCountryId != null
            ? (statesByCountryId[selectedCountryId] || []).map(s => ({
                label: s.name,
                value: s.id,
            }))
            : []

    const districtOptions =
        selectedStateId != null
            ? (districtsByStateId[selectedStateId] || []).map(d => ({
                label: d.name,
                value: d.id,
            }))
            : []

    const cityOptions =
        selectedDistrictId != null
            ? (citiesByDistrictId[selectedDistrictId] || []).map(c => ({
                label: c.name,
                value: c.id,
            }))
            : [];

    const villageOptions =
        selectedCityId != null
            ? (villagesByCityId[selectedCityId] || []).map(c => ({
                label: c.name,
                value: c.id,
            }))
            : [];



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
                            FirmsType: e.FirmsType ?? prev.FirmsType ?? '',
                            Type: e.Type ?? prev.Type ?? '',
                            Designation: e.Designation ?? prev.Designation ?? '',
                            EmailId: e.EmailId ?? prev.EmailId,
                            MobileNumber: e.MobileNumber ?? prev.MobileNumber,
                            AlternativeMobileNumber: e.AlternativeMobileNumber ?? prev.AlternativeMobileNumber,
                            AadharCardNumber: e.AadharCardNumber ?? prev.AadharCardNumber,
                            PanNumber: e.PanNumber ?? prev.PanNumber,
                            AadharCardURL: null,
                            RemoveAadharCardURL: '',
                            PanCardURL: null,
                            RemovePanCardURL: '',
                            IsRERANumber: e.RERANumber !== '' ? 1 : 0,
                            RERANumber: e.RERANumber ?? prev.RERANumber,
                            GSTNumber: e.GSTNumber ?? prev.GSTNumber,
                            Speciality: e.Speciality ?? prev.Speciality,
                            OfficeAddress: e.OfficeAddress ?? prev.OfficeAddress,
                            CountryMasterId: e.CountryMasterId ?? prev.CountryMasterId,
                            StateMasterId: e.StateMasterId ?? prev.StateMasterId,
                            DistrictMasterId: e.DistrictMasterId ?? prev.DistrictMasterId,
                            CityMasterId: e.CityMasterId ?? prev.CityMasterId,
                            VillageMasterId: e.VillageMasterId ?? prev.VillageMasterId,


                        }));
                        setPanCardURLFiles([])
                        setPanCardURL(e.PanCardURL);
                        setRemovePanCardUrls([])

                        setAadharCardURLFiles([]);
                        setAadharCardURL(e.AadharCardURL);
                        setRemoveAadharCardUrls([]);

                        setGSTCertificateURLFiles([]);
                        setGSTCertificateURL(e.GSTCertificateURL);
                        setRemoveGSTCertificateUrls([]);

                        setSelectedCountryId(e.CountryMasterId ?? null);
                        setSelectedStateId(e.StateMasterId ?? null);
                        setSelectedDistrictId(e.DistrictMasterId ?? null);
                        setSelectedCityId(e.CityMasterId ?? null);
                        setSelectedVillageId(e.VillageMasterId ?? null);

                        setIsReadOnly(e.Designation === "Owner" ? false : true)
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
            newErrors.Name = 'Full Name is required';
        }


        if (!formData.MobileNumber?.trim()) {
            newErrors.MobileNumber = 'Mobile Number is required'
        } else if (!isValidMobile(formData.MobileNumber.trim())) {
            newErrors.MobileNumber = 'Enter a Valid 10-digit mobile number'
        }

        if (formData.AlternativeMobileNumber?.trim()) {
            if (!isValidMobile(formData.AlternativeMobileNumber.trim())) {
                newErrors.AlternativeMobileNumber = 'Enter a valid 10-digit Alternative Mobile Number'
            }
        }


        if (!formData.CompanyName) {
            newErrors.CompanyName = ' Company Name is required';
        }

        if (!formData.FirmsType?.trim()) {
            newErrors.FirmsType = "Firms Type is required";
        }

        if (!formData.Speciality) {
            newErrors.Speciality = 'Speciality is required';
        }
        if (!formData.Designation) {
            newErrors.Designation = 'Designation is required';
        }
        if (!formData.Type) {
            newErrors.Type = 'Type is required';
        }

        if (!formData.OfficeAddress) {
            newErrors.OfficeAddress = 'Office Address is required';
        }

        if (formData.IsRERANumber === 1 && !formData.RERANumber) {
            newErrors.RERANumber = ' RERA Number is required';
        } else if (formData.IsRERANumber === 1 && !isValidRERA(formData.RERANumber.trim())) {
            newErrors.RERANumber = "Enter a valid RERA Number";
        }


        if (formData.AadharCardNumber !== "" && !formData.AadharCardNumber?.trim()) {
            newErrors.AadharCardNumber = "Please enter a valid 12-digit Aadhaar number";
        } else if (formData.AadharCardNumber !== "" && !isValidAadhaar(formData.AadharCardNumber.trim())) {
            newErrors.AadharCardNumber = "Enter a valid Aadhar Card Number.";
        }
        if (formData.AadharCardNumber !== "" && !hasAnyDocumentFile(aadharCardURLFiles, aadharCardURL, removeAadharCardUrls)) {
            newErrors.AadharCardURL = "Aadhaar card file is required.";
        }

        if (formData.PanNumber !== "" && !formData.PanNumber?.trim()) {
            newErrors.PanNumber = "PAN Number is required.";
        } else if (formData.PanNumber !== "" && !isValidPAN(formData.PanNumber?.trim())) {
            newErrors.PanNumber = "Enter a valid PAN Number.";
        }
        if (formData.PanNumber !== "" && !hasAnyDocumentFile(panCardURLFiles, panCardURL, removePanCardUrls)) {
            newErrors.PanCardURL = "PAN card file is required.";
        }

        if (formData.GSTNumber !== "" && !formData.GSTNumber?.trim()) {
            newErrors.GSTNumber = 'GST Number is required';
        } else if (formData.GSTNumber !== "" && !isValidGST(formData.GSTNumber)) {
            newErrors.GSTNumber = 'Valid GST Number is required';
        }

        if (formData.GSTNumber !== "" && !hasAnyDocumentFile(gSTCertificateURLFiles, gSTCertificateURL, removeGSTCertificateUrls)) {
            newErrors.GSTCertificateURL = "GST Certificate file is required.";
        }

        if (!formData.CountryMasterId) {
            newErrors.CountryMasterId = "Country is required";
        }
        if (!formData.StateMasterId) {
            newErrors.StateMasterId = "State is required";
        }
        if (!formData.DistrictMasterId) {
            newErrors.DistrictMasterId = "District is required";
        }
        if (!formData.CityMasterId) {
            newErrors.CityMasterId = "City is required";
        }
        if (!formData.VillageMasterId) {
            newErrors.VillageMasterId = "Village is required";
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

        fd.append("ChannelPartnerId", String(formData.ChannelPartnerId ?? 0));
        fd.append("Uniquekey", formData.Uniquekey ?? "");
        fd.append("Name", formData.Name ?? "");
        fd.append("CompanyName", formData.CompanyName ?? "");
        fd.append('FirmsType', formData.FirmsType ?? '');
        fd.append('Type', formData.Type ?? '');
        fd.append('Designation', formData.Designation ?? '');
        fd.append("EmailId", formData.EmailId ?? "");
        fd.append("MobileNumber", formData.MobileNumber ?? "");
        fd.append("AlternativeMobileNumber", formData.AlternativeMobileNumber ?? "");
        fd.append("AadharCardNumber", formData.AadharCardNumber ?? "");
        fd.append("PanNumber", formData.PanNumber ?? "");
        fd.append("RERANumber", formData.RERANumber ?? "");
        fd.append("GSTNumber", formData.GSTNumber ?? "");
        fd.append("OfficeAddress", formData.OfficeAddress ?? "");
        fd.append("Speciality", formData.Speciality ?? "");

        fd.append("CountryMasterId", String(formData.CountryMasterId ?? 0));
        fd.append("DistrictMasterId", String(formData.DistrictMasterId ?? 0));
        fd.append("StateMasterId", String(formData.StateMasterId ?? 0));
        fd.append("CityMasterId", String(formData.CityMasterId ?? 0));
        fd.append("VillageMasterId", String(formData.VillageMasterId ?? 0));
        fd.append("OTP", otp?.trim() ?? "");

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

        gSTCertificateURLFiles.forEach(file => {
            if (file instanceof File) {
                fd.append("GSTCertificateURL", file);
            }
        });

        fd.append("RemoveGSTCertificateURL", removeGSTCertificateUrls.join(","));

        return fd;
    };
    //#endregion

    //#region HANDLE ADD AND UPDATE CHANNEL PARTNER MASTER
    const handleAddUpdateChannelPartner = async () => {

        setErrors({});

        const validation = validateAddChannelPartnerForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            addToast({ type: 'error', title: 'Please fill the required filed' });

            return;
        }

        if (formData.ChannelPartnerId === 0 && !isOtpVerified) {

            if (!isOtpSent) {

                const sent = await sendOTP({

                    mobileNumber: formData.MobileNumber || "",
                    module: "CHANNEL PARTNER",
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
                const payload = PushChannelPartnerFormData();

                const response = await ChannelPartnerService.apiCallAddUpdateChannelPartner(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/channelPartner");

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

    const applyExistingCompanyData = (channelPartner: any) => {
        if (!channelPartner) return;

        setFormData(prev => ({
            ...prev,
            CompanyName: channelPartner.CompanyName ?? "",
            FirmsType: channelPartner.FirmsType ?? "",
            RERANumber: channelPartner.RERANumber ?? "",
            IsRERANumber: channelPartner.RERANumber ? 1 : 0,

            CountryMasterId: channelPartner.CountryMasterId ?? 0,
            StateMasterId: channelPartner.StateMasterId ?? 0,
            DistrictMasterId: channelPartner.DistrictMasterId ?? 0,
            CityMasterId: channelPartner.CityMasterId ?? 0,
            VillageMasterId: channelPartner.VillageMasterId ?? 0,
        }));


        setSelectedCountryId(channelPartner.CountryMasterId ?? null);
        setSelectedStateId(channelPartner.StateMasterId ?? null);
        setSelectedDistrictId(channelPartner.DistrictMasterId ?? null);
        setSelectedCityId(channelPartner.CityMasterId ?? null);
        setSelectedVillageId(channelPartner.VillageMasterId ?? null);
    };

    const resetExistingCompanyData = () => {
        setFormData(prev => ({
            ...prev,
            CompanyName: "",
            FirmsType: "",
            RERANumber: "",
            IsRERANumber: 0,

            StateMasterId: 0,
            DistrictMasterId: 0,
            CityMasterId: 0,
            VillageMasterId: 0,
        }));

        setSelectedStateId(null);
        setSelectedDistrictId(null);
        setSelectedCityId(null);
        setSelectedVillageId(null);
    };



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
                                    label='E-mail Id'
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
                                    disabled={Number(formData.ChannelPartnerId) > 0 ? true:false}
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

                            {Number(formData.ChannelPartnerId || 0) === 0 && (
                                <div>

                                    <SinglePageSelection
                                        label='Company Type'
                                        placeholder="Select Company Type"
                                        value={formData.CompanyType}
                                        onChange={(e) => {
                                            const value = String(e);

                                            handleFieldChange('CompanyType', value);
                                            handleFieldChange("CompanyName", "");

                                            if (value === "Existing Company") {
                                                setIsReadOnly(true);
                                            } else {
                                                setIsReadOnly(false);
                                                resetExistingCompanyData();
                                            }
                                        }}
                                        options={COMPANY_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    />


                                </div>
                            )}

                            {Number(formData.ChannelPartnerId || 0) > 0 ?

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

                                :

                                <div>
                                    <Input
                                        type="text"
                                        readOnly={formData.CompanyType === "New Company" ? false : true}
                                        required
                                        label='Company Name'
                                        value={formData.CompanyName ?? ""}
                                        onChange={(e) => handleFieldChange("CompanyName", e.target.value)}
                                        placeholder="Enter Company Name"
                                        maxLength={250}
                                        error={errors.CompanyName}
                                    />

                                </div>
                            }

                            {formData.CompanyType === "Existing Company" && (
                                <SingleSelectDropdownWithPagination
                                    label="Company"
                                    required
                                    title="Select Company"
                                    size="lg"
                                    dataFetchCallBack={fetchChannelPartnerCompanyDropdown}
                                    onSelected={async (item) => {

                                        if (!item) {
                                            handleFieldChange("CompanyName", null);
                                            return;
                                        }

                                        const companyId = Number(item.value);

                                        handleFieldChange("CompanyName", item.label);

                                        setLoadingMessage("Fetch Company Details")

                                        setIsLoading(true);

                                        const company = await fetchChannelPartnerById(companyId);

                                        setIsLoading(false);

                                        applyExistingCompanyData(company);
                                    }}
                                />

                            )}
                            <div>

                                <SinglePageSelection
                                    label='Firms Type'
                                    disabled={isReadOnly}
                                    placeholder="Select Firms Type"
                                    required
                                    error={errors.FirmsType}
                                    value={formData.FirmsType}
                                    onChange={(e) => {
                                        handleFieldChange('FirmsType', String(e))
                                    }}

                                    options={FIRMS_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />


                            </div>
                            <div>

                                <SinglePageSelection
                                    label='Designation'
                                    placeholder="Select Designation"
                                    required
                                    error={errors.Designation}
                                    value={formData.Designation}
                                    onChange={(e) => {
                                        handleFieldChange('Designation', String(e))
                                    }}

                                    options={CHANNE_PARTNER_DESIGNATION.map((opt) => ({ label: opt.name, value: opt.id }))} />


                            </div>
                            <div>

                                <SinglePageSelection
                                    label='Type'
                                    placeholder="Select Type"
                                    required
                                    error={errors.Type}
                                    value={formData.Type}
                                    onChange={(e) => {
                                        handleFieldChange('Type', String(e))
                                    }}

                                    options={CHANNE_PARTNER_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))} />


                            </div>

                        </div>
                    </div>
                    <div className="space-y-4 pb-3 pt-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                            <Checkbox
                                label="Do you have RERA Number?"
                                checked={formData.IsRERANumber === 1}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                    const isChecked = e.target.checked ? 1 : 0;

                                    handleFieldChange("IsRERANumber", isChecked);

                                    if (!e.target.checked) {

                                        handleFieldChange("RERANumber", "");
                                    }
                                }}
                            />
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    label='RERA Number'
                                    disabled={isReadOnly}
                                    required={formData.IsRERANumber === 1 ? true : false}
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
                        </div>
                    </div>
                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Speciality</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            <div>
                                <SinglePageSelection
                                    label="Speciality"
                                    placeholder="Select Speciality"
                                    required
                                    value={formData.Speciality}
                                    onChange={(e) => handleFieldChange('Speciality', String(e))}
                                    options={SPECIALITY_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errors.Speciality}
                                />
                            </div>

                        </div>
                    </div>
                    {/* ============================================================= [DOCUMENT DETAILS] ============================================================================================= */}

                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Document Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            <div>
                                <Input
                                    type="text"
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
                                <MultiFilePicker
                                    label=' Upload Aadhaar Card'
                                    placeholder="Select Aadhaar Card"
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
                                <Input
                                    type="text"
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
                                    label=' Upload PAN Card'
                                    placeholder="Select PAN Card"
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
                                    label='GST Number'
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
                                <MultiFilePicker
                                    label='GST Certificate'
                                    placeholder="Select GST Certificate"
                                    error={errors.GSTCertificateURL}
                                    value={gSTCertificateURLFiles}
                                    onChange={setGSTCertificateURLFiles}
                                    availableFilesURL={gSTCertificateURL ?? ""}
                                    allowedTypes={[
                                        "image/jpeg",
                                        "image/png",
                                        "image/jpg"]}
                                    maxFiles={5}
                                    maxSizeMB={50}
                                    onRemoveExisting={(url) => {
                                        setRemoveGSTCertificateUrls(prev => [...prev, url]);
                                    }}
                                />

                            </div>

                        </div>
                    </div>


                    <div className="space-y-4 pb-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Address Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>

                                <SinglePageSelection
                                    label='Country'
                                    placeholder="Select Country"
                                    required
                                    value={selectedCountryId || ''}
                                    error={errors.CountryMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedCountryId(null);
                                            setSelectedStateId(null);
                                            setSelectedDistrictId(null);
                                            setSelectedCityId(null);
                                            setSelectedVillageId(null);

                                            handleFieldChange('CountryMasterId', 0);
                                            handleFieldChange('StateMasterId', 0);
                                            handleFieldChange('DistrictMasterId', 0);
                                            handleFieldChange('CityMasterId', 0);
                                            handleFieldChange('VillageMasterId', 0);

                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedCountryId(id);
                                        setSelectedStateId(null);
                                        setSelectedDistrictId(null);
                                        setSelectedCityId(null);
                                        setSelectedVillageId(null);

                                        handleFieldChange('CountryMasterId', id);
                                        handleFieldChange('StateMasterId', 0);
                                        handleFieldChange('DistrictMasterId', 0);
                                        handleFieldChange('CityMasterId', 0);
                                        handleFieldChange('VillageMasterId', 0);
                                    }}
                                    disabled={isLocationLoading}
                                    options={countryOptions}
                                />


                            </div>

                            <div>

                                <SinglePageSelection
                                    label='State'
                                    placeholder="Select State"
                                    required
                                    value={selectedStateId ?? ''}
                                    error={errors.StateMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedStateId(null);
                                            setSelectedDistrictId(null);
                                            setSelectedCityId(null);
                                            setSelectedVillageId(null);

                                            handleFieldChange("StateMasterId", 0);
                                            handleFieldChange("DistrictMasterId", 0);
                                            handleFieldChange("CityMasterId", 0);
                                            handleFieldChange('VillageMasterId', 0);

                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedStateId(id);
                                        setSelectedDistrictId(null);
                                        setSelectedCityId(null);
                                        setSelectedVillageId(null);

                                        handleFieldChange("StateMasterId", id);
                                        handleFieldChange("DistrictMasterId", 0);
                                        handleFieldChange("CityMasterId", 0);
                                        handleFieldChange('VillageMasterId', 0);
                                    }}
                                    disabled={!selectedCountryId || stateOptions.length === 0}
                                    options={stateOptions}
                                />


                            </div>

                            <div>

                                <SinglePageSelection
                                    label='District'
                                    placeholder="Select District"
                                    required
                                    value={selectedDistrictId ?? ''}
                                    error={errors.DistrictMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedDistrictId(null);
                                            setSelectedCityId(null);
                                            setSelectedVillageId(null);

                                            handleFieldChange('DistrictMasterId', 0);
                                            handleFieldChange('CityMasterId', 0);
                                            handleFieldChange('VillageMasterId', 0);
                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedDistrictId(id);
                                        setSelectedCityId(null);
                                        setSelectedVillageId(null);

                                        handleFieldChange('DistrictMasterId', id);
                                        handleFieldChange('CityMasterId', 0);
                                        handleFieldChange('VillageMasterId', 0);
                                    }}
                                    disabled={!selectedStateId || districtOptions.length === 0}
                                    options={districtOptions}
                                />
                            </div>

                            <div>

                                <SinglePageSelection
                                    label='City'
                                    placeholder="Select City"
                                    required
                                    value={selectedCityId ?? ''}
                                    error={errors.CityMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedCityId(null);
                                            setSelectedVillageId(null);
                                            handleFieldChange('CityMasterId', 0);
                                            handleFieldChange('VillageMasterId', 0);
                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedCityId(id);
                                        setSelectedVillageId(null);
                                        handleFieldChange('CityMasterId', id);
                                        handleFieldChange('VillageMasterId', 0);
                                    }}
                                    disabled={!selectedDistrictId || cityOptions.length === 0}
                                    options={cityOptions}
                                />

                            </div>
                            <div>
                                <SinglePageSelection
                                    label="Village"
                                    placeholder="Select Village"
                                    value={selectedVillageId ?? ''}
                                    required
                                    error={errors.VillageMasterId}
                                    onChange={(item) => {

                                        if (!item) {
                                            setSelectedVillageId(null);
                                            handleFieldChange('VillageMasterId', 0);
                                            return;
                                        }

                                        const id = Number(item);

                                        setSelectedVillageId(id);
                                        handleFieldChange('VillageMasterId', id);
                                    }}
                                    disabled={!selectedCityId || villageOptions.length === 0}
                                    options={villageOptions}
                                />

                            </div>
                        </div>
                        <div>
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
            <Modal
                isOpen={showOtpSection && formData.ChannelPartnerId === 0}
                onClose={() => {
                    setOtp("");
                    setIsOtpSent(false);
                    setIsOtpVerified(false);
                    setShowOtpSection(false);

                }}
                title="Complete Verification"
                saveText={formData.ChannelPartnerId ? "Update" : "Verify OTP & Add"}
                size="md"
                onSubmit={(e) => {

                    e.preventDefault();

                    if (!otp) {

                        addToast({ type: "error", title: "Please enter OTP" });
                        return;
                    }

                    setIsOtpVerified(true);

                    handleAddUpdateChannelPartner();
                }}
            >



                <CompleteVerificationSection
                    steps={getChannelPartnerVerificationSteps({

                        formData,

                        panCardURLFiles,
                        aadharCardURLFiles,
                        gSTCertificateURLFiles,

                        panCardURL,
                        aadharCardURL,
                        gSTCertificateURL

                    })}
                    otp={otp}
                    onOtpChange={setOtp}
                    mobileNumber={formData.MobileNumber ?? ""}
                />

            </Modal>
        </div>
    );
};

export default AddUpdateChannelPartner;
