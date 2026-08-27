import React, { useEffect, useState } from "react";
import type { AddUpdateProjectProfessionalDetails, FilterWithPaginationProjectProfessionalDetails } from "@/features/projectProfessionalDetails/models/ProjectProfessionalDetailsModel";
import { runApiWithLoader } from "@/core/utils";
import { projectProfessionalDetailsService } from "@/features/projectProfessionalDetails/services/ProjectProfessionalDetailsService";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { PROJECT_PROFESSIONAL_DETAILS_STATUS_OPTIONS, TYPE_STATUS_OPTIONS } from "@/core/constants";
import { Input } from "@/ui/components/forms";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import { filterNumbers } from "@/core/utils/fileValidation";
import useToast from "@/core/hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";

const initialFormState = (): AddUpdateProjectProfessionalDetails => ({
    ProjectId: 0,
    ProjectProfessionalDetailsId: 0,
    Uniquekey: "",
    ProfessionalType: "",
    RegistrationNumber: "",
    Type: "",
    CompanyName: "",
    FirstName: "",
    MiddleName: "",
    LastName: "",
    Designation: "",
    UnitNumber: "",
    BuildingName: "",
    StreetName: "",
    Locality: "",
    LandMark: "",
    CountryMasterId: 0,
    CityMasterId: 0,
    StateMasterId: 0,
    DistrictMasterId: 0,
    VillageMasterId: 0,
    PinCode: "",
    PrimaryContactNumber: "",
    AlternateContactNumber: "",
    OfficeLandlineNumber: "",
    EmailId: "",
});

export const AddUpdateProjectProfessionalDetail: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { projectId } = useProject();
    const [formData, setFormData] = useState<AddUpdateProjectProfessionalDetails>(() => initialFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { ProjectProfessionalDetailsId } = useParams<{ ProjectProfessionalDetailsId?: string }>();
    const projectProfessionalDetailsId = ProjectProfessionalDetailsId ? Number(ProjectProfessionalDetailsId) : 0;
    const isAddMode = projectProfessionalDetailsId === 0;

    const {
        isLoading: isLocationLoading,
        countries,
        statesByCountryId,
        districtsByStateId,
        citiesByDistrictId,
        villagesByCityId,
    } = useCountryStateCityDistrictVillageData();

    const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1);
    const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null,);
    const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null,);
    const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null);
    const [selectedVillageId, setSelectedVillageId] = React.useState<number | null>(null);
    const { canAction } = useMenuPermissions('/projectProfessionalDetails');

    console.log('Project Professional Details Can Action', canAction);

    const countryOptions = countries.map((c) => ({ label: c.name, value: c.id }));

    const stateOptions = selectedCountryId != null
        ? (statesByCountryId[selectedCountryId] || []).map((s) => ({
            label: s.name,
            value: s.id,
        }))
        : [];

    const districtOptions = selectedStateId != null
        ? (districtsByStateId[selectedStateId] || []).map((d) => ({
            label: d.name,
            value: d.id,
        }))
        : [];

    const cityOptions = selectedDistrictId != null
        ? (citiesByDistrictId[selectedDistrictId] || []).map((c) => ({
            label: c.name,
            value: c.id,
        }))
        : [];

    const villageOptions = selectedCityId != null
        ? (villagesByCityId[selectedCityId] || []).map((c) => ({
            label: c.name,
            value: c.id,
        }))
        : [];


    useEffect(() => {
        if (!projectId) return

        loadProjectProfessionalDetails();
    }, [projectId]);

    const loadProjectProfessionalDetails = async () => {

        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectProfessionalDetails = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    ProjectProfessionalDetailsId: Number(ProjectProfessionalDetailsId)
                }

                const response = await projectProfessionalDetailsService.apiCallPullProjectProfessionalDetails(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                            ProjectProfessionalDetailsId: e.ProjectProfessionalDetailsId ?? prev.ProjectProfessionalDetailsId,
                            ProjectId: Number(projectId),
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            ProfessionalType: e.ProfessionalType ?? prev.ProfessionalType,
                            RegistrationNumber: e.RegistrationNumber ?? prev.RegistrationNumber,
                            Type: e.Type ?? prev.Type,
                            CompanyName: e.CompanyName ?? prev.CompanyName,
                            FirstName: e.FirstName ?? prev.FirstName,
                            MiddleName: e.MiddleName ?? prev.MiddleName,
                            LastName: e.LastName ?? prev.LastName,
                            Designation: e.Designation ?? prev.Designation,
                            UnitNumber: e.UnitNumber ?? prev.UnitNumber,
                            BuldingName: e.BuldingName ?? prev.BuildingName,
                            StreetName: e.StreetName ?? prev.StreetName,
                            Locality: e.Locality ?? prev.Locality,
                            LandMark: e.LandMark ?? prev.LandMark,
                            CountryMasterId: e.CountryMasterId ?? prev.CountryMasterId,
                            DistrictMasterId: e.DistrictMasterId ?? prev.DistrictMasterId,
                            StateMasterId: e.StateMasterId ?? prev.StateMasterId,
                            CityMasterId: e.CityMasterId ?? prev.CityMasterId,
                            VillageMasterId: e.VillageMasterId ?? prev.VillageMasterId,
                            PinCode: e.PinCode ?? prev.PinCode,
                            PrimaryContactNumber: e.PrimaryContactNumber ?? prev.PrimaryContactNumber,
                            AlternateContactNumber: e.AlternateContactNumber ?? prev.AlternateContactNumber,
                            OfficeLandlineNumber: e.OfficeLandlineNumber ?? prev.OfficeLandlineNumber,
                            EmailId: e.EmailId ?? prev.EmailId
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
            'Loading  Project Professional Details'
        )
    };

    const ValidProjectProfessionalDetails = (): {

        isValid: boolean
        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.ProfessionalType) {
            newErrors.ProfessionalType = 'Professional Type is required.';
        }
        if (!formData.RegistrationNumber) {
            newErrors.RegistrationNumber = 'Registration Number is required.';
        }
        if (!formData.Type) {
            newErrors.Type = ' Type is required.';
        }
        if (!formData.FirstName) {
            newErrors.FirstName = 'First Name is required.';
        }
        if (!formData.MiddleName) {
            newErrors.MiddleName = 'Middel Name is required.';
        }
        if (!formData.LastName) {
            newErrors.LastName = 'Last Name is required.';
        }
        if (!formData.ProfessionalType) {
            newErrors.ProfessionalType = 'Professional Type is required.';
        }
        if (!formData.UnitNumber) {
            newErrors.UnitNumber = 'Unit Number is required.';
        }
        if (!formData.BuildingName) {
            newErrors.BuildingName = 'Building Name is required.';
        }
        if (!formData.StreetName) {
            newErrors.StreetName = 'Street Name is required.';
        }
        if (!formData.Locality) {
            newErrors.Locality = 'Locality is required.';
        }
        if (!formData.LandMark) {
            newErrors.LandMark = 'LandMark is required.';
        }
        if (!formData.StateMasterId) {
            newErrors.StateMasterId = 'State Name is required.';
        }
        if (!formData.DistrictMasterId) {
            newErrors.DistrictMasterId = 'District Name is required.';
        }
        if (!formData.VillageMasterId) {
            newErrors.VillageMasterId = 'Village Name is required.';
        }
        if (!formData.CityMasterId) {
            newErrors.CityMasterId = 'City Name is required.';
        }
        if (!formData.PinCode) {
            newErrors.PinCode = 'Pin Code is required.';
        }
        if (!formData.PrimaryContactNumber) {
            newErrors.PrimaryContactNumber = 'Primary Contact Number is required.';
        }
        if (!formData.AlternateContactNumber) {
            newErrors.AlternateContactNumber = 'Alternate Contact Number is required.';
        }
        if (!formData.OfficeLandlineNumber) {
            newErrors.OfficeLandlineNumber = 'Office Landline Number is required.';
        }
        if (!formData.EmailId) {
            newErrors.EmailId = 'Email Id is required.';
        }

        if (formData.Type === "Person /Individual") {
            if (!formData.FirstName) {
                newErrors.FirstName = 'First Name is required.';
            }
            if (!formData.MiddleName) {
                newErrors.MiddleName = 'Middel Name is required.';
            }
            if (!formData.LastName) {
                newErrors.LastName = 'Last Name is required.';
            }
            if (!formData.Designation) {
                newErrors.Designation = 'Designation is required.';
            }
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const PushProjectProfessionalDetails = (): AddUpdateProjectProfessionalDetails => {
        return {
            ProjectId: Number(projectId),
            ProjectProfessionalDetailsId: formData.ProjectProfessionalDetailsId ?? 0,
            Uniquekey: formData.Uniquekey ?? "",
            ProfessionalType: formData.ProfessionalType ?? "",
            RegistrationNumber: formData.RegistrationNumber ?? "",
            Type: formData.Type ?? "",
            CompanyName: formData.CompanyName ?? "",
            FirstName: formData.FirstName ?? "",
            MiddleName: formData.MiddleName ?? "",
            LastName: formData.LastName ?? "",
            Designation: formData.Designation ?? "",
            UnitNumber: formData.UnitNumber ?? "",
            BuildingName: formData.BuildingName ?? "",
            StreetName: formData.StreetName ?? "",
            Locality: formData.Locality ?? "",
            LandMark: formData.LandMark ?? "",
            CountryMasterId: Number(formData.CountryMasterId) || 0,
            StateMasterId: Number(formData.StateMasterId) || 0,
            DistrictMasterId: Number(formData.DistrictMasterId) || 0,
            CityMasterId: Number(formData.CityMasterId) || 0,
            VillageMasterId: Number(formData.VillageMasterId) || 0,
            PinCode: formData.PinCode ?? "",
            PrimaryContactNumber: formData.PrimaryContactNumber ?? "",
            AlternateContactNumber: formData.AlternateContactNumber ?? "",
            OfficeLandlineNumber: formData.OfficeLandlineNumber ?? "",
            EmailId: formData.EmailId ?? "",
        };
    };

    const handleAddUpdateProjectProfessionalDetails = async () => {
        const validation = ValidProjectProfessionalDetails();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        const payload = PushProjectProfessionalDetails();

        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const response = await projectProfessionalDetailsService.apiCallAddUpdateProjectProfessionalDettails(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/projectProfessionalDetails");

                } else {
                    addToast({ type: "error", title: response.left.message, });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message, });
            },
            undefined,
            isAddMode ? "Add Project Professional Details" : "Update Project Professional Details"
        );
    };

    const handleFieldChange = (field: keyof AddUpdateProjectProfessionalDetails, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

            <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Personal Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <SinglePageSelection
                                label="Professional Type"
                                required
                                placeholder="Select Professional Type"
                                value={formData.ProfessionalType ?? ""}
                                onChange={(value) => handleFieldChange("ProfessionalType", value)}
                                options={PROJECT_PROFESSIONAL_DETAILS_STATUS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                error={errors.ProfessionalType}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData.ProfessionalType === "Architect" && (
                            <div>
                                <Input
                                    label="Registration Number"
                                    type="text"
                                    required
                                    value={formData.RegistrationNumber ?? ""}
                                    onChange={(e) => handleFieldChange("RegistrationNumber", e.target.value)}
                                    placeholder="Enter Registration Number"
                                    maxLength={200}
                                    error={errors.RegistrationNumber}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <SinglePageSelection
                                label="Type"
                                required
                                value={formData.Type ?? ""}
                                onChange={(value) => handleFieldChange("Type", value)}
                                options={TYPE_STATUS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                                placeholder="Select Type"
                                error={errors.Type}
                            />
                        </div>

                        {formData.Type === "Person /Individual" && (
                            <>
                                <div>
                                    <Input
                                        label="Executive Officer First Name"
                                        required
                                        type="text"
                                        placeholder="Executive Officer First Name"
                                        value={formData.FirstName ?? ""}
                                        onChange={(e) => handleFieldChange("FirstName", e.target.value)}
                                        error={errors.FirstName}
                                        maxLength={200}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Executive Officer Middle Name"
                                        required
                                        type="text"
                                        placeholder="Executive Officer Middle Name"
                                        value={formData.MiddleName ?? ""}
                                        onChange={(e) => handleFieldChange("MiddleName", e.target.value)}
                                        error={errors.MiddleName}
                                        maxLength={200}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Executive Officer Last Name"
                                        required
                                        type="text"
                                        placeholder="Executive Officer Last Name"
                                        value={formData.LastName ?? ""}
                                        onChange={(e) => handleFieldChange("LastName", e.target.value)}
                                        error={errors.LastName}
                                        maxLength={200}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Designation"
                                        required
                                        type="text"
                                        placeholder="Designation"
                                        value={formData.Designation ?? ""}
                                        onChange={(e) => handleFieldChange("Designation", e.target.value)}
                                        error={errors.Designation}
                                        maxLength={200}
                                    />
                                </div>
                            </>
                        )}

                        {formData.Type == "Legal Entity / Other" && (
                            <Input
                                label="Entity / Company Name"
                                required
                                type="text"
                                placeholder="Company Name"
                                value={formData.CompanyName ?? ""}
                                onChange={(e) => handleFieldChange("CompanyName", e.target.value)}
                                error={errors.CompanyName}
                                maxLength={200}
                            />
                        )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Communication  Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <Input
                                label="Unit Number"
                                required
                                type="text"
                                placeholder="Enter Unit Number"
                                value={formData.UnitNumber ?? ""}
                                onChange={(e) => handleFieldChange("UnitNumber", e.target.value)}
                                error={errors.UnitNumber}
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <Input
                                label="Building Name"
                                required
                                type="text"
                                placeholder="Enter Building Name"
                                value={formData.BuildingName ?? ""}
                                onChange={(e) => handleFieldChange("BuildingName", e.target.value)}
                                error={errors.BuildingName}
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <Input
                                label="Street Name"
                                required
                                type="text"
                                placeholder="Enter Street Name"
                                value={formData.StreetName ?? ""}
                                onChange={(e) => handleFieldChange("StreetName", e.target.value)}
                                error={errors.StreetName}
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <Input
                                label="Locality"
                                required
                                type="text"
                                placeholder="Enter Locality"
                                value={formData.Locality ?? ""}
                                onChange={(e) => handleFieldChange("Locality", e.target.value)}
                                error={errors.Locality}
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <Input
                                label="Landmark"
                                required
                                type="text"
                                placeholder="Enter Landmark"
                                value={formData.LandMark ?? ""}
                                onChange={(e) => handleFieldChange("LandMark", e.target.value)}
                                error={errors.LandMark}
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <SinglePageSelection
                                label="Country"
                                placeholder="Select Country"
                                required
                                value={selectedCountryId || ""}
                                error={errors.CountryMasterId}
                                onChange={(item) => {
                                    if (!item) {
                                        setSelectedCountryId(null);
                                        setSelectedStateId(null);
                                        setSelectedDistrictId(null);
                                        setSelectedCityId(null);
                                        setSelectedVillageId(null);

                                        handleFieldChange("CountryMasterId", 0);
                                        handleFieldChange("StateMasterId", 0);
                                        handleFieldChange("DistrictMasterId", 0);
                                        handleFieldChange("CityMasterId", 0);
                                        handleFieldChange("VillageMasterId", 0);

                                        return;
                                    }

                                    const id = Number(item);

                                    setSelectedCountryId(id);
                                    setSelectedStateId(null);
                                    setSelectedDistrictId(null);
                                    setSelectedCityId(null);
                                    setSelectedVillageId(null);

                                    handleFieldChange("CountryMasterId", id);
                                    handleFieldChange("StateMasterId", 0);
                                    handleFieldChange("DistrictMasterId", 0);
                                    handleFieldChange("CityMasterId", 0);
                                    handleFieldChange("VillageMasterId", 0);
                                }}
                                disabled={isLocationLoading}
                                options={countryOptions}
                            />
                        </div>

                        <div>
                            <SinglePageSelection
                                label="State"
                                placeholder="Select State"
                                required
                                value={selectedStateId ?? ""}
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
                                        handleFieldChange("VillageMasterId", 0);

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
                                    handleFieldChange("VillageMasterId", 0);
                                }}
                                disabled={!selectedCountryId || stateOptions.length === 0}
                                options={stateOptions}
                            />
                        </div>

                        <div>
                            <SinglePageSelection
                                label="District"
                                placeholder="Select District"
                                required
                                value={selectedDistrictId ?? ""}
                                error={errors.DistrictMasterId}
                                onChange={(item) => {
                                    if (!item) {
                                        setSelectedDistrictId(null);
                                        setSelectedCityId(null);
                                        setSelectedVillageId(null);

                                        handleFieldChange("DistrictMasterId", 0);
                                        handleFieldChange("CityMasterId", 0);
                                        handleFieldChange("VillageMasterId", 0);
                                        return;
                                    }

                                    const id = Number(item);

                                    setSelectedDistrictId(id);
                                    setSelectedCityId(null);
                                    setSelectedVillageId(null);

                                    handleFieldChange("DistrictMasterId", id);
                                    handleFieldChange("CityMasterId", 0);
                                    handleFieldChange("VillageMasterId", 0);
                                }}
                                disabled={!selectedStateId || districtOptions.length === 0}
                                options={districtOptions}
                            />
                        </div>

                        <div>
                            <SinglePageSelection
                                label="City"
                                placeholder="Select City"
                                required
                                value={selectedCityId ?? ""}
                                error={errors.CityMasterId}
                                onChange={(item) => {
                                    if (!item) {
                                        setSelectedCityId(null);
                                        setSelectedVillageId(null);
                                        handleFieldChange("CityMasterId", 0);
                                        handleFieldChange("VillageMasterId", 0);
                                        return;
                                    }

                                    const id = Number(item);

                                    setSelectedCityId(id);
                                    setSelectedVillageId(null);
                                    handleFieldChange("CityMasterId", id);
                                    handleFieldChange("VillageMasterId", 0);
                                }}
                                disabled={!selectedDistrictId || cityOptions.length === 0}
                                options={cityOptions}
                            />
                        </div>
                        <div>
                            <SinglePageSelection
                                label="Village"
                                placeholder="Select Village"
                                value={selectedVillageId ?? ""}
                                required
                                error={errors.VillageMasterId}
                                onChange={(item) => {
                                    if (!item) {
                                        setSelectedVillageId(null);
                                        handleFieldChange("VillageMasterId", 0);
                                        return;
                                    }

                                    const id = Number(item);

                                    setSelectedVillageId(id);
                                    handleFieldChange("VillageMasterId", id);
                                }}
                                disabled={!selectedCityId || villageOptions.length === 0}
                                options={villageOptions}
                            />
                        </div>

                        <div>
                            <Input
                                label="Pin Code"
                                required
                                type="text"
                                placeholder="Pin Code"
                                value={formData.PinCode ?? ""}
                                onChange={(e) => handleFieldChange("PinCode", filterNumbers(e.target.value))}
                                error={errors.PinCode}
                                maxLength={200}
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Contact Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Input
                                label="Primary Contact Number"
                                required
                                type="text"
                                placeholder="Enter Primary Contact Number"
                                value={formData.PrimaryContactNumber ?? ""}
                                onChange={(e) => handleFieldChange("PrimaryContactNumber", e.target.value)}
                                error={errors.PrimaryContactNumber}
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <Input
                                label="Alternate Contact Number"
                                required
                                type="text"
                                placeholder="Enter Alternate Contact Number"
                                value={formData.AlternateContactNumber ?? ""}
                                onChange={(e) => handleFieldChange("AlternateContactNumber", e.target.value)}
                                error={errors.AlternateContactNumber}
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <Input
                                label="Office Landline Number"
                                required
                                type="text"
                                placeholder="Enter Office Landline Number"
                                value={formData.OfficeLandlineNumber ?? ""}
                                onChange={(e) => handleFieldChange("OfficeLandlineNumber", e.target.value)}
                                error={errors.OfficeLandlineNumber}
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <Input
                                label="Email Id"
                                required
                                type="text"
                                placeholder="Enter Email-Id"
                                value={formData.EmailId ?? ""}
                                onChange={(e) => handleFieldChange("EmailId", e.target.value)}
                                error={errors.EmailId}
                                maxLength={200}
                            />
                        </div>

                    </div>
                </div>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={formData.ProjectProfessionalDetailsId ? "Update" : "Add"}
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdateProjectProfessionalDetails();
                }}
                isLoading
            />
        </div>
    )
}
export default AddUpdateProjectProfessionalDetail; 