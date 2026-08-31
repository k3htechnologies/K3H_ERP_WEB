import { BUSINESS_CATEGORY, CONSTRUCTION_TYPE_OPTIONS, LAND_TENURE_TYPE_OPTIONS, PLOT_SHAPE_OPTIONS, ROAD_WIDTH } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { Input } from "@/ui/components/forms";
import Checkbox from "@/ui/components/forms/Checkbox";
import { TextArea } from "@/ui/components/forms/Textarea";
import React, { useEffect, useState } from "react";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import type { AddUpdateProjectRedevelopmentData, FilterWithPaginationProjectRedevelopmentRequest } from "@/features/projectLead/models/ProjectRedevelopmentModel";
import useToast from "@/core/hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { runApiWithLoader } from "@/core/utils";
import { projectRedevelopmentService } from "@/features/projectLead/services/ProjectRedevelopmentService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { allowPercentage, filterGoogleMapsUrl, filterMobile, filterNumbers, filterNumbersWithDecimal, hasAnyDocumentFile, isValidEmail, isValidGoogleMapsUrl, isValidMobile } from "@/core/utils/fileValidation";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { Phone } from "lucide-react";

const initialRedevelopmentFormState = (): AddUpdateProjectRedevelopmentData => ({
    ProjectRedevelopmentId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    BuildingName: "",
    BuildingAddress: "",
    CountryMasterId: 0,
    StateMasterId: 0,
    DistrictMasterId: 0,
    CityMasterId: 0,
    PinCode: "",
    PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber: "",
    WardNumberZone: "",
    TotalPlotAreaSqM: 0,
    YearOfOriginalConstruction: 0,
    ExistingBuildingType: "",
    NumberOfExistingFloors: 0,
    TotalNumberExistingFlatsUnits: 0,
    IdentificationLocation: "",
    LatitudeLongitude: "",
    ContactPersonName: "",
    ContactPersonMobile: "",
    ContactPersonEmail: "",
    PercentageMemberInFavor: 0,
    TypeOfLandTenure: "",
    PlotShape: "",
    Frontage: 0,
    PlotDepth: 0,
    RoadWidth: "",
    NumberOfExistingBuildingsWings: 0,
    NumberOfFloorsPerWing: 0,
    TotalBuildUpArea: 0,
    TotalCarpetArea: 0,
    TotalCommonArea: 0,
    IsLiftAvailable: false,
    IsFireSafetyProvisionPresent: false,
    IsPlotUnderLitigationStay: false,
    ConstructionType: "",
    Remarks: "",
    PhotoURL: "",
    RemovePhotoURL: "",
    IsConveyanceDeed: false,
});

export const AddUpdateProjectRedevelopment: React.FC = () => {

    const [RedevelopmentformData, setRedevelopmentFormData] = useState<AddUpdateProjectRedevelopmentData>(() => initialRedevelopmentFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { canAction } = useMenuPermissions('/projectLead');

    const { ProjectRedevelopmentId } = useParams<{ ProjectRedevelopmentId?: string }>();
    const projectRedevelopmentId = ProjectRedevelopmentId ? Number(ProjectRedevelopmentId) : 0;
    const isAddMode = projectRedevelopmentId === 0;

    const [photoURLFiles, setPhotoURLFiles] = useState<(File | string)[]>([]);
    const [removePhotoUrls, SetRemovePhotoUrls] = useState<string[]>([]);
    const [photoURL, setPhotoURL] = useState<string>();

    const {
        isLoading: isLocationLoading,
        countries,
        statesByCountryId,
        districtsByStateId,
        citiesByDistrictId,
    } = useCountryStateCityDistrictVillageData()

    const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1)
    const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)
    const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null)
    const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null)

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

    useEffect(() => {
        if (!isAddMode) {
            LoadProjectRedevelopment();
        }
        setSelectedCountryId(1);
        handleFieldChange("CountryMasterId", 1);
    }, [projectRedevelopmentId]);

    const LoadProjectRedevelopment = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectRedevelopmentRequest = {
                    PageNumber: 1,
                    PageSize: 20,
                    ProjectRedevelopmentId: projectRedevelopmentId
                }

                const response = await projectRedevelopmentService.apiCallPullProjectRedevelopment(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setRedevelopmentFormData((prev) => ({
                            ...prev,
                            ProjectRedevelopmentId: e.ProjectRedevelopmentId ?? prev.ProjectRedevelopmentId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            BuildingName: e.BuildingName ?? prev.BuildingName,
                            BuildingAddress: e.BuildingAddress ?? prev.BuildingAddress,
                            CountryMasterId: e.CountryMasterId ?? prev.CountryMasterId,
                            StateMasterId: e.StateMasterId ?? prev.StateMasterId,
                            DistrictMasterId: e.DistrictMasterId ?? prev.DistrictMasterId,
                            CityMasterId: e.CityMasterId ?? prev.CityMasterId,
                            PinCode: e.PinCode ?? prev.PinCode,
                            PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber: e.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber ?? prev.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber,
                            WardNumberZone: e.WardNumberZone ?? prev.WardNumberZone,
                            TotalPlotAreaSqM: e.TotalPlotAreaSqM ?? prev.TotalPlotAreaSqM,
                            YearOfOriginalConstruction: e.YearOfOriginalConstruction ?? prev.YearOfOriginalConstruction,
                            ExistingBuildingType: e.ExistingBuildingType ?? prev.ExistingBuildingType,
                            NumberOfExistingFloors: e.NumberOfExistingFloors ?? prev.NumberOfExistingFloors,
                            TotalNumberExistingFlatsUnits: e.TotalNumberExistingFlatsUnits ?? prev.TotalNumberExistingFlatsUnits,
                            IdentificationLocation: e.IdentificationLocation ?? prev.IdentificationLocation,
                            LatitudeLongitude: e.LatitudeLongitude ?? prev.LatitudeLongitude,
                            ContactPersonName: e.ContactPersonName ?? prev.ContactPersonName,
                            ContactPersonMobile: e.ContactPersonMobile ?? prev.ContactPersonMobile,
                            ContactPersonEmail: e.ContactPersonEmail ?? prev.ContactPersonEmail,
                            PercentageMemberInFavor: e.PercentageMemberInFavor ?? prev.PercentageMemberInFavor,
                            TypeOfLandTenure: e.TypeOfLandTenure ?? prev.TypeOfLandTenure,
                            PlotShape: e.PlotShape ?? prev.PlotShape,
                            Frontage: e.Frontage ?? prev.Frontage,
                            PlotDepth: e.PlotDepth ?? prev.PlotDepth,
                            RoadWidth: e.RoadWidth ?? prev.RoadWidth,
                            NumberOfExistingBuildingsWings: e.NumberOfExistingBuildingsWings ?? prev.NumberOfExistingBuildingsWings,
                            NumberOfFloorsPerWing: e.NumberOfFloorsPerWing ?? prev.NumberOfFloorsPerWing,
                            TotalBuildUpArea: e.TotalBuildUpArea ?? prev.TotalBuildUpArea,
                            TotalCarpetArea: e.TotalCarpetArea ?? prev.TotalCarpetArea,
                            TotalCommonArea: e.TotalCommonArea ?? prev.TotalCommonArea,
                            IsLiftAvailable: e.IsLiftAvailable ?? prev.IsLiftAvailable,
                            IsFireSafetyProvisionPresent: e.IsFireSafetyProvisionPresent ?? prev.IsFireSafetyProvisionPresent,
                            IsPlotUnderLitigationStay: e.IsPlotUnderLitigationStay ?? prev.IsPlotUnderLitigationStay,
                            ConstructionType: e.ConstructionType ?? prev.ConstructionType,
                            PhotoURL: e.PhotoURL ?? prev.PhotoURL,
                            Remarks: e.Remarks ?? prev.Remarks,
                            IsConveyanceDeed: e.IsConveyanceDeed ?? prev.IsConveyanceDeed,
                        }));
                        setSelectedCountryId(e.CountryMasterId ?? null);
                        setSelectedStateId(e.StateMasterId ?? null);
                        setSelectedDistrictId(e.DistrictMasterId ?? null);
                        setSelectedCityId(e.CityMasterId ?? null);
                    }
                    setPhotoURL(e.PhotoURL ?? "")
                    setPhotoURLFiles([])
                    SetRemovePhotoUrls([]);
                } else {
                    setPhotoURL('')
                    setPhotoURLFiles([])
                    SetRemovePhotoUrls([]);
                    addToast({ type: 'error', title: response.left.message });
                }
                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Project Redevelopment'
        );
    };

    const ValidateAddUpdateProjectRedevelopment = (): {

        isValid: boolean;
        errors: { [key: string]: string };

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!RedevelopmentformData.BuildingName?.trim()) {
            newErrors.BuildingName = "Building Name is required.";
        } else if (RedevelopmentformData.BuildingName.trim().length > 100) {
            newErrors.BuildingName = "Building Name must be at most 100 characters";
        }
        if (!RedevelopmentformData.BuildingAddress?.trim()) {
            newErrors.BuildingAddress = "Building Address is required.";
        }
        if (!RedevelopmentformData.CountryMasterId) {
            newErrors.CountryMasterId = "Country is required.";
        }
        if (!RedevelopmentformData.StateMasterId) {
            newErrors.StateMasterId = "State is required.";
        }
        if (!RedevelopmentformData.DistrictMasterId) {
            newErrors.DistrictMasterId = "District is required.";
        }
        if (!RedevelopmentformData.CityMasterId) {
            newErrors.CityMasterId = "City is required.";
        }
        if (!RedevelopmentformData.PinCode?.trim()) {
            newErrors.PinCode = "Pin Code is required.";
        }
        if (!RedevelopmentformData.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber?.trim()) {
            newErrors.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber = "Plot Number / CTS Number / Survey Number / Subdivision Number is required.";
        }
        if (!RedevelopmentformData.TotalPlotAreaSqM) {
            newErrors.TotalPlotAreaSqM = "Total Plot Area is required.";
        }
        if (!RedevelopmentformData.YearOfOriginalConstruction) {
            newErrors.YearOfOriginalConstruction = "Year of Original Construction is required.";
        }
        if (!RedevelopmentformData.ExistingBuildingType) {
            newErrors.ExistingBuildingType = "Existing Building Type is required.";
        }
        if (!RedevelopmentformData.NumberOfExistingFloors) {
            newErrors.NumberOfExistingFloors = "Number of Existing Floors is required.";
        }
        if (!RedevelopmentformData.TotalNumberExistingFlatsUnits) {
            newErrors.TotalNumberExistingFlatsUnits = "Total Number of Existing Flats / Units is required.";
        }
        if (!RedevelopmentformData.IdentificationLocation?.trim()) {
            newErrors.IdentificationLocation = "Identification And Location is required.";
        } else if (!isValidGoogleMapsUrl(RedevelopmentformData.IdentificationLocation.trim())) {
            newErrors.IdentificationLocation = 'Enter a valid Google Location'
        }


        if (!RedevelopmentformData.ContactPersonName?.trim()) {
            newErrors.ContactPersonName = "Contact Person Name is required.";
        } else if (RedevelopmentformData.ContactPersonName.trim().length > 50) {
            newErrors.ContactPersonName = "Contact Person Name must be at most 50 characters";
        }
        if (RedevelopmentformData.ContactPersonEmail && !isValidEmail(RedevelopmentformData.ContactPersonEmail)) {
            newErrors.ContactPersonEmail = "Enter a Valid E-mail Id";
        }
        if (!RedevelopmentformData.ContactPersonMobile?.trim()) {
            newErrors.ContactPersonMobile = "Contact Person Mobile Number is required.";
        } else if (!isValidMobile(RedevelopmentformData.ContactPersonMobile)) {
            newErrors.ContactPersonMobile = "Enter a valid 10-digit mobile number";
        }
        if (!RedevelopmentformData.PercentageMemberInFavor) {
            newErrors.PercentageMemberInFavor = "Percentage of Member in Favor is required.";
        }
        if (!RedevelopmentformData.TypeOfLandTenure) {
            newErrors.TypeOfLandTenure = "Type Of Land Tenure is required.";
        }
        if (!RedevelopmentformData.PlotShape) {
            newErrors.PlotShape = "Plot Shape is required.";
        }
        if (!RedevelopmentformData.PlotDepth) {
            newErrors.PlotDepth = "Depth Of The Plot is required.";
        }
        if (!RedevelopmentformData.RoadWidth) {
            newErrors.RoadWidth = "Road Width In Front Of Plot is required.";
        }
        if (!RedevelopmentformData.NumberOfExistingBuildingsWings) {
            newErrors.NumberOfExistingBuildingsWings = "Number Of Existing Building / Wings is required.";
        }
        if (!RedevelopmentformData.NumberOfFloorsPerWing) {
            newErrors.NumberOfFloorsPerWing = "Number Of Floors Per Wing is required.";
        }
        if (!RedevelopmentformData.TotalBuildUpArea) {
            newErrors.TotalBuildUpArea = "Total Build-Up Area is required.";
        }
        if (!RedevelopmentformData.TotalCarpetArea) {
            newErrors.TotalCarpetArea = "Total Carpet Area is required.";
        }
        if (!RedevelopmentformData.TotalCommonArea) {
            newErrors.TotalCommonArea = "Total Common Area is required.";
        }
        if (!RedevelopmentformData.ConstructionType) {
            newErrors.ConstructionType = "Construction Type is required.";
        }

        if (!hasAnyDocumentFile(photoURLFiles, photoURL, removePhotoUrls)) {
            newErrors.PhotoURL = "Building Photo is required.";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushAddUpdateProjectRedevelopment = (): FormData => {

        const fd = new FormData();

        fd.append("ProjectRedevelopmentId", String(RedevelopmentformData.ProjectRedevelopmentId ?? 0));
        fd.append("Uniquekey", RedevelopmentformData.Uniquekey ?? "");
        fd.append("BuildingName", RedevelopmentformData.BuildingName ?? "");
        fd.append("BuildingAddress", RedevelopmentformData.BuildingAddress ?? "");
        fd.append("CountryMasterId", String(RedevelopmentformData.CountryMasterId ?? 0));
        fd.append("StateMasterId", String(RedevelopmentformData.StateMasterId ?? 0));
        fd.append("DistrictMasterId", String(RedevelopmentformData.DistrictMasterId ?? 0));
        fd.append("CityMasterId", String(RedevelopmentformData.CityMasterId ?? 0));
        fd.append("PinCode", RedevelopmentformData.PinCode ?? "");
        fd.append("PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber", RedevelopmentformData.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber ?? "");
        fd.append("WardNumberZone", RedevelopmentformData.WardNumberZone ?? "");
        fd.append("TotalPlotAreaSqM", String(RedevelopmentformData.TotalPlotAreaSqM ?? 0));
        fd.append("YearOfOriginalConstruction", String(RedevelopmentformData.YearOfOriginalConstruction ?? 0));
        fd.append("ExistingBuildingType", RedevelopmentformData.ExistingBuildingType ?? "");
        fd.append("NumberOfExistingFloors", String(RedevelopmentformData.NumberOfExistingFloors ?? 0));
        fd.append("TotalNumberExistingFlatsUnits", String(RedevelopmentformData.TotalNumberExistingFlatsUnits ?? 0));
        fd.append("IdentificationLocation", RedevelopmentformData.IdentificationLocation ?? "");
        fd.append("LatitudeLongitude", RedevelopmentformData.LatitudeLongitude ?? "");
        fd.append("ContactPersonName", RedevelopmentformData.ContactPersonName ?? "");
        fd.append("ContactPersonMobile", RedevelopmentformData.ContactPersonMobile ?? "");
        fd.append("ContactPersonEmail", RedevelopmentformData.ContactPersonEmail ?? "");
        fd.append("PercentageMemberInFavor", String(RedevelopmentformData.PercentageMemberInFavor ?? 0));
        fd.append("TypeOfLandTenure", RedevelopmentformData.TypeOfLandTenure ?? "");
        fd.append("PlotShape", RedevelopmentformData.PlotShape ?? "");
        fd.append("Frontage", String(RedevelopmentformData.Frontage ?? 0));
        fd.append("PlotDepth", String(RedevelopmentformData.PlotDepth ?? 0));
        fd.append("RoadWidth", RedevelopmentformData.RoadWidth ?? "");
        fd.append("NumberOfExistingBuildingsWings", String(RedevelopmentformData.NumberOfExistingBuildingsWings ?? 0));
        fd.append("NumberOfFloorsPerWing", String(RedevelopmentformData.NumberOfFloorsPerWing ?? 0));
        fd.append("TotalBuildUpArea", String(RedevelopmentformData.TotalBuildUpArea ?? 0));
        fd.append("TotalCarpetArea", String(RedevelopmentformData.TotalCarpetArea ?? 0));
        fd.append("TotalCommonArea", String(RedevelopmentformData.TotalCommonArea ?? 0));
        fd.append("IsLiftAvailable", String(RedevelopmentformData.IsLiftAvailable ?? false));
        fd.append("IsFireSafetyProvisionPresent", String(RedevelopmentformData.IsFireSafetyProvisionPresent ?? false));
        fd.append("IsPlotUnderLitigationStay", String(RedevelopmentformData.IsPlotUnderLitigationStay ?? false));
        fd.append("ConstructionType", RedevelopmentformData.ConstructionType ?? "");
        fd.append("Remarks", RedevelopmentformData.Remarks ?? "");
        fd.append("IsConveyanceDeed", String(RedevelopmentformData.IsConveyanceDeed ?? false));

        photoURLFiles.forEach((file) => {
            if (file instanceof File) {
                fd.append("PhotoURL", file);
            }
        });

        fd.append("RemovePhotoURL", removePhotoUrls.join(","));

        return fd;
    };

    const handleProjectLeaddUpdateProjectRedevelopment = async () => {
        console.log("Add clicked", RedevelopmentformData); // temp debug

        setErrors({});

        const validation = ValidateAddUpdateProjectRedevelopment();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const payload = PushAddUpdateProjectRedevelopment();

                const response = await projectRedevelopmentService.apiCallAddUpdateProjectRedevelopment(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/projectLead", {
                        state: { activeTab: "Redevelopment" }
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
            isAddMode ? 'Add Project Redevelopment' : "Update Project Redevelopment"
        );
    };

    const handleFieldChange = (field: keyof AddUpdateProjectRedevelopmentData, value: any) => {
        setRedevelopmentFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Redevelopment : Property Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <Input
                            type="text"
                            required
                            label="Building Name"
                            value={RedevelopmentformData.BuildingName ?? ""}
                            onChange={(e) => handleFieldChange("BuildingName", e.target.value)}
                            placeholder="Enter Building Name"
                            maxLength={100}
                            error={errors.BuildingName}
                        />
                    </div>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

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

                                    handleFieldChange("CountryMasterId", 0);
                                    handleFieldChange("StateMasterId", 0);
                                    handleFieldChange("DistrictMasterId", 0);
                                    handleFieldChange("CityMasterId", 0);

                                    return;
                                }

                                const id = Number(item);

                                setSelectedCountryId(id);
                                setSelectedStateId(null);
                                setSelectedDistrictId(null);
                                setSelectedCityId(null);

                                handleFieldChange("CountryMasterId", id);
                                handleFieldChange("StateMasterId", 0);
                                handleFieldChange("DistrictMasterId", 0);
                                handleFieldChange("CityMasterId", 0);
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

                                    handleFieldChange("StateMasterId", 0);
                                    handleFieldChange("DistrictMasterId", 0);
                                    handleFieldChange("CityMasterId", 0);

                                    return;
                                }

                                const id = Number(item);

                                setSelectedStateId(id);
                                setSelectedDistrictId(null);
                                setSelectedCityId(null);

                                handleFieldChange("StateMasterId", id);
                                handleFieldChange("DistrictMasterId", 0);
                                handleFieldChange("CityMasterId", 0);
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

                                    handleFieldChange("DistrictMasterId", 0);
                                    handleFieldChange("CityMasterId", 0);
                                    return;
                                }

                                const id = Number(item);

                                setSelectedDistrictId(id);
                                setSelectedCityId(null);

                                handleFieldChange("DistrictMasterId", id);
                                handleFieldChange("CityMasterId", 0);
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
                                    handleFieldChange("CityMasterId", 0);
                                    return;
                                }

                                const id = Number(item);

                                setSelectedCityId(id);
                                handleFieldChange("CityMasterId", id);
                            }}
                            disabled={!selectedDistrictId || cityOptions.length === 0}
                            options={cityOptions}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Pin Code"
                            value={RedevelopmentformData.PinCode ?? ""}
                            onChange={(e) => handleFieldChange("PinCode", filterNumbers(e.target.value))}
                            placeholder="Enter Pin Code"
                            maxLength={6}
                            error={errors.PinCode}
                        />
                    </div>
                    <div>
                        <Input
                            type="text"
                            required
                            label="Plot / CTS / Survey / Subdivision Number"
                            value={RedevelopmentformData.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber ?? ""}
                            onChange={(e) => handleFieldChange("PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber", e.target.value)}
                            placeholder="Enter Plot Number"
                            maxLength={100}
                            error={errors.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber}
                        />
                    </div>
                    <div>
                        <MultiFilePicker
                            label="Building Photo"
                            placeholder="Select Files"
                            required
                            error={errors.PhotoURL}
                            value={photoURLFiles}
                            onChange={setPhotoURLFiles}
                            availableFilesURL={photoURL ?? ""}
                            allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                            maxFiles={5}
                            maxSizeMB={50}
                            onRemoveExisting={(url) => {
                                SetRemovePhotoUrls((prev) => [...prev, url]);
                            }}
                        />
                    </div>

                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <TextArea
                            required
                            label="Building Address"
                            value={RedevelopmentformData.BuildingAddress ?? ""}
                            onChange={(e) => handleFieldChange("BuildingAddress", e.target.value)}
                            placeholder="Enter Building Address"
                            maxLength={250}
                            error={errors.BuildingAddress}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Plot Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div>
                        <Input
                            type="text"
                            label="Ward Number (Zone)"
                            value={RedevelopmentformData.WardNumberZone ?? ""}
                            onChange={(e) => handleFieldChange("WardNumberZone", e.target.value)}
                            placeholder="Enter Ward Number (Zone)"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Total Plot Area (SqMt)"
                            value={RedevelopmentformData.TotalPlotAreaSqM ?? ""}
                            onChange={(e) => handleFieldChange("TotalPlotAreaSqM", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Total Plot Area"
                            rightIcon="SqMt"
                            error={errors.TotalPlotAreaSqM}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Year of Original Construction"
                            value={RedevelopmentformData.YearOfOriginalConstruction ?? ""}
                            onChange={(e) => handleFieldChange("YearOfOriginalConstruction", Number(e.target.value))}
                            placeholder="Enter Year of Original Construction"
                            error={errors.YearOfOriginalConstruction}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Existing Building Type"
                            required
                            placeholder="Select Existing Building Type"
                            value={RedevelopmentformData.ExistingBuildingType ?? ""}
                            onChange={(value) => handleFieldChange("ExistingBuildingType", value)}
                            options={BUSINESS_CATEGORY.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            error={errors.ExistingBuildingType}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Number of Existing Floors"
                            value={RedevelopmentformData.NumberOfExistingFloors ?? ""}
                            onChange={(e) => handleFieldChange("NumberOfExistingFloors", filterNumbers(e.target.value))}
                            placeholder="Enter Number of Existing Floors"
                            maxLength={2}
                            error={errors.NumberOfExistingFloors}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Total Number of Existing Flats / Units"
                            value={RedevelopmentformData.TotalNumberExistingFlatsUnits ?? ""}
                            onChange={(e) => handleFieldChange("TotalNumberExistingFlatsUnits", filterNumbers(e.target.value))}
                            placeholder="Enter Total Number of Existing Flats"
                            maxLength={3}
                            error={errors.TotalNumberExistingFlatsUnits}
                        />
                    </div>



                    <div>
                        <Input
                            type="text"
                            label="Latitude & Longitude (For GIS Mapping)"
                            value={RedevelopmentformData.LatitudeLongitude ?? ""}
                            onChange={(e) => handleFieldChange("LatitudeLongitude", e.target.value)}
                            placeholder="Enter Latitude And Longitude"
                            maxLength={50}
                        />
                    </div>
                    <div>
                        <TextArea
                            label="Identification And Location"
                            required
                            value={RedevelopmentformData.IdentificationLocation ?? ""}
                            onChange={e => handleFieldChange('IdentificationLocation', filterGoogleMapsUrl(e.target.value))}
                            className="thin-scroll"
                            error={errors.IdentificationLocation}
                            placeholder="Enter Identification And Location"
                        />
                    </div>

                </div>
            </div>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div>
                        <Input
                            type="text"
                            required
                            label="Contact Person Name"
                            value={RedevelopmentformData.ContactPersonName ?? ""}
                            onChange={(e) => handleFieldChange("ContactPersonName", e.target.value)}
                            placeholder="Enter Contact Person Name"
                            maxLength={100}
                            error={errors.ContactPersonName}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            leftIcon="+91"
                            required
                            label="Contact Person Mobile Number"
                            value={RedevelopmentformData.ContactPersonMobile ?? ""}
                            onChange={(e) => handleFieldChange("ContactPersonMobile", filterMobile(e.target.value))}
                            placeholder="Enter Contact Person Mobile Number"
                            rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                            maxLength={10}
                            error={errors.ContactPersonMobile}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Contact Person E-Mail ID"
                            value={RedevelopmentformData.ContactPersonEmail ?? ""}
                            onChange={(e) => handleFieldChange("ContactPersonEmail", e.target.value)}
                            placeholder="Enter Contact Person E-Mail ID"
                            maxLength={250}
                            error={errors.ContactPersonEmail}
                        />
                    </div>

                    <div>

                        <Input
                            value={RedevelopmentformData.PercentageMemberInFavor ?? ""}
                            label="Percentage of Member in Favor (%)"
                            required
                            error={errors.PercentageMemberInFavor}
                            placeholder="Enter Percentage of Member in Favor (%)"
                            onChange={(e) => {
                                const val = allowPercentage(e.target.value);
                                if (val !== null) {
                                    handleFieldChange("PercentageMemberInFavor", filterNumbersWithDecimal(e.target.value));
                                }
                            }}

                            rightIcon="%"
                        />

                    </div>

                </div>
            </div>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Land & Plot Characteristics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div>
                        <SinglePageSelection
                            label="Type Of Land Tenure"
                            required
                            placeholder="Select Type Of Land Tenure"
                            value={RedevelopmentformData.TypeOfLandTenure ?? ""}
                            onChange={(value) => handleFieldChange("TypeOfLandTenure", value)}
                            options={LAND_TENURE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            error={errors.TypeOfLandTenure}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Plot Shape"
                            required
                            placeholder="Select Plot Shape"
                            value={RedevelopmentformData.PlotShape ?? ""}
                            onChange={(value) => handleFieldChange("PlotShape", value)}
                            options={PLOT_SHAPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            error={errors.PlotShape}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Depth Of The Plot"
                            value={RedevelopmentformData.PlotDepth ?? ""}
                            onChange={(e) => handleFieldChange("PlotDepth", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Depth Of The Plot"
                            maxLength={15}
                            error={errors.PlotDepth}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Road Width"
                            placeholder="Select Road Width"
                            required
                            value={RedevelopmentformData.RoadWidth ?? ""}
                            onChange={(e) => handleFieldChange('RoadWidth', String(e))}
                            options={ROAD_WIDTH.map((opt) => ({ label: opt.name, value: opt.id }))}
                            error={errors.RoadWidth}
                        />
                    </div>

                </div>
            </div>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Building Structure
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div>
                        <Input
                            type="text"
                            required
                            label="Number of Existing Building / Wings"
                            value={RedevelopmentformData.NumberOfExistingBuildingsWings ?? ""}
                            onChange={(e) => handleFieldChange("NumberOfExistingBuildingsWings", filterNumbers(e.target.value))}
                            placeholder="Enter Number Of Existing Building Wings"
                            maxLength={2}
                            error={errors.NumberOfExistingBuildingsWings}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Number Of Floor Per Wings"
                            value={RedevelopmentformData.NumberOfFloorsPerWing ?? ""}
                            onChange={(e) => handleFieldChange("NumberOfFloorsPerWing", filterNumbers(e.target.value))}
                            placeholder="Enter Number Of Floor Per Wings"
                            maxLength={2}
                            error={errors.NumberOfFloorsPerWing}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Total Build-Up Area (SqFt)"
                            value={RedevelopmentformData.TotalBuildUpArea ?? ""}
                            onChange={(e) => handleFieldChange("TotalBuildUpArea", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Total Build Up Area"
                            rightIcon="SqFt"
                            error={errors.TotalBuildUpArea}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Total Carpet Area (SqFt)"
                            value={RedevelopmentformData.TotalCarpetArea ?? ""}
                            onChange={(e) => handleFieldChange("TotalCarpetArea", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Total Carpet Area"
                            rightIcon="SqFt"
                            error={errors.TotalCarpetArea}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Total Common Area (SqFt)"
                            value={RedevelopmentformData.TotalCommonArea ?? ""}
                            onChange={(e) => handleFieldChange("TotalCommonArea", filterNumbersWithDecimal(e.target.value))}
                            placeholder="Enter Total Common Area"
                            rightIcon="SqFt"
                            error={errors.TotalCommonArea}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Construction Type"
                            required
                            placeholder="Select Construction Type"
                            value={RedevelopmentformData.ConstructionType ?? ""}
                            onChange={(value) => handleFieldChange("ConstructionType", value)}
                            options={CONSTRUCTION_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            error={errors.ConstructionType}
                        />
                    </div>

                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                    <Checkbox
                        label="Lift Available?"
                        checked={RedevelopmentformData.IsLiftAvailable ?? false}
                        onChange={(e) => handleFieldChange("IsLiftAvailable", e.target.checked)}
                    />

                    <Checkbox
                        label="Fire Safety Provisions Present?"
                        checked={RedevelopmentformData.IsFireSafetyProvisionPresent ?? false}
                        onChange={(e) => handleFieldChange("IsFireSafetyProvisionPresent", e.target.checked)}
                    />

                    <Checkbox
                        label="Plot Under Litigation / Stay Orders?"
                        checked={RedevelopmentformData.IsPlotUnderLitigationStay ?? false}
                        onChange={(e) => handleFieldChange("IsPlotUnderLitigationStay", e.target.checked)}
                    />

                    <Checkbox
                        label="Conveyance Deed?"
                        checked={RedevelopmentformData.IsConveyanceDeed ?? false}
                        onChange={(e) => handleFieldChange("IsConveyanceDeed", e.target.checked)}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

                    <div>
                        <TextArea
                            label="Remarks"
                            value={RedevelopmentformData.Remarks ?? ""}
                            onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                            placeholder="Enter Remarks"
                            error={errors.Remarks}
                        />
                    </div>

                </div>
            </div>



            <BottomActionBar
                cancelText="Cancel"
                saveText={RedevelopmentformData.ProjectRedevelopmentId ? "Update" : "Add"}
                onCancel={() => navigate("/projectLead", {
                    state: { activeTab: "Redevelopment" }
                })}
                canAction={canAction}
                onSave={() => {
                    handleProjectLeaddUpdateProjectRedevelopment();
                }}
                isLoading={isLoading}
            />
        </div>
    )
}
export default AddUpdateProjectRedevelopment;
