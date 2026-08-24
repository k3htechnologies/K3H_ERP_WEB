import React, { useEffect, useState } from "react";
import { Input } from "@/ui/components/forms";
import { TextArea } from "@/ui/components/forms/Textarea";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import {
    EXISTING_GROUND_CONDITION_OPTIONS,
    LAND_OWNERSHIP_TYPE_OPTIONS, LAND_TENURE_TYPE_OPTIONS, PLOT_SHAPE_OPTIONS, SOIL_TYPE_OPTIONS, SURROUNDING_LAND_USE_OPTIONS, WATER_SUPPLY_AVAILABLE_OPTIONS,
} from "@/core/constants";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import Checkbox from "@/ui/components/forms/Checkbox";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "@/core/utils/loader";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import type { AddUpdateProjectLandData, FilterWithPaginationProjectLandRequest } from "../models/ProjectLandModel";
import { projectLandService } from "../services/ProjectLandService";

const initialLandFormState = (): AddUpdateProjectLandData => ({
    ProjectLandId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    CityMasterId: 0,
    StateMasterId: 0,
    DistrictMasterId: 0,
    CountryMasterId: 0,
    PinCode: "",
    PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber: "",
    WardNumberZone: "",
    TotalPlotAreaSqM: 0,
    LandOwnerName: "",
    LandAddress: "",
    IdentificationLocation: "",
    LatitudeLongitude: "",
    ContactPersonName: "",
    ContactPersonMobile: "",
    ContactPersonEmail: "",
    TypeOfLandTenureType: "",
    LandOwnershipType: "",
    PlotShape: "",
    Frontage: 0,
    PlotDepth: 0,
    RoadWidth: 0,
    IsAnyPowerofAttorneyInvolved: false,
    IsFencingBoundaryWallPresent: false,
    SoilType: "",
    ExistingGroundCondition: "",
    IsLandConvertedToNonAgricultural: false,
    IsAccessRoadAvailable: false,
    IsElectricityConnectionNearby: false,
    IsUnderLitigationOrStayOrder: false,
    Is712Available: false,
    FSIPermissible: 0,
    WaterSupplyAvailable: "",
    SurroundingLandUse: "",
    DistanceFromNearestTownKM: 0,
    DistanceFromHighwayKM: 0,
    DistanceFromRailwayStationKM: 0,
    DistanceFromAirportKM: 0,
    TotalNumberOfTreesonSite: 0,
    PhotoURL: "",
    RemovePhotoURL: null,
    Remark: "",
});

export const AddUpdateProjectLand: React.FC = () => {

    const [LandformData, setLandFormData] = useState<AddUpdateProjectLandData>(() => initialLandFormState());
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { canAction } = useMenuPermissions('/projectLead');
    const { ProjectLandId } = useParams<{ ProjectLandId?: string }>();
    const projectLandId = ProjectLandId ? Number(ProjectLandId) : 0;
    const isAddMode = projectLandId === 0;

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
            LoadProjectLandData();
        }
    }, [ProjectLandId]);

    const LoadProjectLandData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectLandRequest = {
                    PageNumber: 1,
                    PageSize: 20,
                    ProjectLandId: projectLandId,
                }

                const response = await projectLandService.apiCallPullProjectLand(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setLandFormData(prev => ({
                            ...prev,
                            ProjectLandId: e.ProjectLandId ?? prev.ProjectLandId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            LandOwnerName: e.LandOwnerName ?? prev.LandOwnerName,
                            LandAddress: e.LandAddress ?? prev.LandAddress,
                            CityMasterId: e.CityMasterId ?? prev.CityMasterId,
                            StateMasterId: e.StateMasterId ?? prev.StateMasterId,
                            DistrictMasterId: e.DistrictMasterId ?? prev.DistrictMasterId,
                            CountryMasterId: e.CountryMasterId ?? prev.CountryMasterId,
                            PinCode: e.PinCode ?? prev.PinCode,
                            PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber: e.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber ?? prev.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber,
                            WardNumberZone: e.WardNumberZone ?? prev.WardNumberZone,
                            TotalPlotAreaSqM: e.TotalPlotAreaSqM ?? prev.TotalPlotAreaSqM,
                            IdentificationLocation: e.IdentificationLocation ?? prev.IdentificationLocation,
                            LatitudeLongitude: e.LatitudeLongitude ?? prev.LatitudeLongitude,
                            ContactPersonName: e.ContactPersonName ?? prev.ContactPersonName,
                            ContactPersonMobile: e.ContactPersonMobile ?? prev.ContactPersonMobile,
                            ContactPersonEmail: e.ContactPersonEmail ?? prev.ContactPersonEmail,
                            IsAnyPowerofAttorneyInvolved: e.IsAnyPowerofAttorneyInvolved ?? prev.IsAnyPowerofAttorneyInvolved,
                            IsFencingBoundaryWallPresent: e.IsFencingBoundaryWallPresent ?? prev.IsFencingBoundaryWallPresent,
                            PlotShape: e.PlotShape ?? prev.PlotShape,
                            Frontage: e.Frontage ?? prev.Frontage,
                            PlotDepth: e.PlotDepth ?? prev.PlotDepth,
                            RoadWidth: e.RoadWidth ?? prev.RoadWidth,
                            SoilType: e.SoilType ?? prev.SoilType,
                            ExistingGroundCondition: e.ExistingGroundCondition ?? prev.ExistingGroundCondition,
                            IsLandConvertedToNonAgricultural: e.IsLandConvertedToNonAgricultural ?? prev.IsLandConvertedToNonAgricultural,
                            IsAccessRoadAvailable: e.IsAccessRoadAvailable ?? prev.IsAccessRoadAvailable,
                            IsElectricityConnectionNearby: e.IsElectricityConnectionNearby ?? prev.IsElectricityConnectionNearby,
                            IsUnderLitigationOrStayOrder: e.IsUnderLitigationOrStayOrder ?? prev.IsUnderLitigationOrStayOrder,
                            Is712Available: e.Is712Available ?? prev.Is712Available,
                            FSIPermissible: e.FSIPermissible ?? prev.FSIPermissible,
                            WaterSupplyAvailable: e.WaterSupplyAvailable ?? prev.WaterSupplyAvailable,
                            SurroundingLandUse: e.SurroundingLandUse ?? prev.SurroundingLandUse,
                            TypeOfLandTenureType: e.TypeOfLandTenureType ?? prev.TypeOfLandTenureType,
                            LandOwnershipType: e.LandOwnershipType ?? prev.LandOwnershipType,
                            DistanceFromNearestTownKM: e.DistanceFromNearestTownKM ?? prev.DistanceFromNearestTownKM,
                            DistanceFromHighwayKM: e.DistanceFromHighwayKM ?? prev.DistanceFromHighwayKM,
                            DistanceFromRailwayStationKM: e.DistanceFromRailwayStationKM ?? prev.DistanceFromRailwayStationKM,
                            DistanceFromAirportKM: e.DistanceFromAirportKM ?? prev.DistanceFromAirportKM,
                            TotalNumberOfTreesonSite: e.TotalNumberOfTreesonSite ?? prev.TotalNumberOfTreesonSite,
                            PhotoURL: e.PhotoURL ?? prev.PhotoURL,
                            RemovePhotoURL: e.RemovePhotoURL ?? prev.RemovePhotoURL,
                            Remark: e.Remark ?? prev.Remark,
                        }));
                        setSelectedCountryId(e.CityMasterId ?? null);
                        setSelectedStateId(e.StateMasterId ?? null);
                        setSelectedDistrictId(e.DistrictMasterId ?? null);
                        setSelectedCityId(e.CityMasterId ?? null);
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
            'Loading Project Lead'
        );
    };

    const ValidateAddUpdateProjectLand = (): {

        isValid: boolean
        errors: { [key: string]: string }

    } => {

        const newErrors: { [key: string]: string } = {};

        if (!LandformData.LandOwnerName) {
            newErrors.LandOwnerName = 'Land Owner Name is required.';
        }
        if (!LandformData.LandAddress) {
            newErrors.LandAddress = "Land Address is required";
        }
        if (!LandformData.CountryMasterId) {
            newErrors.CountryMasterId = "Country is required";
        }
        if (!LandformData.StateMasterId) {
            newErrors.StateMasterId = "State Name is required";
        }
        if (!LandformData.DistrictMasterId) {
            newErrors.DistrictMasterId = "District Name is required"
        }
        if (!LandformData.CityMasterId) {
            newErrors.CityMasterId = "City Name is required"
        }
        if (!LandformData.PinCode) {
            newErrors.PinCode = "Pin Code  is required"
        }
        if (!LandformData.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber) {
            newErrors.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber = "Plot Number  is required"
        }
        if (!LandformData.WardNumberZone) {
            newErrors.WardNumberZone = "Ward Number  is required"
        }
        if (!LandformData.TotalPlotAreaSqM) {
            newErrors.TotalPlotAreaSqM = "Total Plot Area is required"
        }
        if (!LandformData.IdentificationLocation) {
            newErrors.IdentificationLocation = "Identification And Location is required"
        }
        if (!LandformData.LatitudeLongitude) {
            newErrors.LatitudeLongitude = "Latitude And Longitude is required"
        }
        if (!LandformData.ContactPersonName) {
            newErrors.ContactPersonName = "Contact Person For Land Name is required"
        }
        if (!LandformData.ContactPersonMobile) {
            newErrors.ContactPersonMobile = "Contact Person Mobile Number is required"
        }
        if (!LandformData.ContactPersonEmail) {
            newErrors.ContactPersonEmail = "Contact Person Email is required"
        }
        if (!LandformData.PlotShape) {
            newErrors.PlotShape = "Plot Shape is required"
        }
        if (!LandformData.Frontage) {
            newErrors.Frontage = "Frontage is required"
        }
        if (!LandformData.PlotDepth) {
            newErrors.PlotDepth = "Depth Of The Plotis required"

        } if (!LandformData.RoadWidth) {
            newErrors.RoadWidth = "Road Width In Front Of Plot is required"
        }
        if (!LandformData.SoilType) {
            newErrors.SoilType = "Soil Type is required"
        }
        if (!LandformData.ExistingGroundCondition) {
            newErrors.ExistingGroundCondition = "Existing Ground Conditions is required"
        }
        if (!LandformData.FSIPermissible) {
            newErrors.FSIPermissible = "FSI Permissible is required"
        }
        if (!LandformData.WaterSupplyAvailable) {
            newErrors.WaterSupplyAvailable = "Water Supply Available is required"
        }
        if (!LandformData.SurroundingLandUse) {
            newErrors.SurroundingLandUse = "Surrounding Land Use is required"
        }
        if (!LandformData.TypeOfLandTenureType) {
            newErrors.TypeOfLandTenureType = "Type Of Land Tenure is required"
        }
        if (!LandformData.LandOwnershipType) {
            newErrors.LandOwnershipType = "LandOwner ship Type is required"
        }
        if (!LandformData.DistanceFromNearestTownKM) {
            newErrors.DistanceFromNearestTownKM = "Distance From Nearest Town is required"
        }
        if (!LandformData.Remark) {
            newErrors.Remark = "Remarks is required"
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const PushAddUpdateProjectLandForm = (): FormData => {

        const fd = new FormData();

        fd.append("ProjectLandId", String(LandformData.ProjectLandId ?? 0));
        fd.append("Uniquekey", LandformData.Uniquekey ?? "");
        fd.append("CityMasterId", String(LandformData.CityMasterId ?? 0));
        fd.append("CountryMasterId", String(LandformData.CountryMasterId ?? 0));
        fd.append("StateMasterId", String(LandformData.StateMasterId ?? 0));
        fd.append("DistrictMasterId", String(LandformData.DistrictMasterId ?? 0));
        fd.append("PinCode", LandformData.PinCode ?? "");
        fd.append("PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber", LandformData.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber ?? "");
        fd.append("WardNumberZone", LandformData.WardNumberZone ?? "");
        fd.append("TotalPlotAreaSqM", String(LandformData.TotalPlotAreaSqM ?? 0));
        fd.append("LandOwnerName", LandformData.LandOwnerName ?? "");
        fd.append("LandAddress", LandformData.LandAddress ?? "");
        fd.append("IdentificationLocation", LandformData.IdentificationLocation ?? "");
        fd.append("LatitudeLongitude", LandformData.LatitudeLongitude ?? "");
        fd.append("ContactPersonName", LandformData.ContactPersonName ?? "");
        fd.append("ContactPersonMobile", LandformData.ContactPersonMobile ?? "");
        fd.append("ContactPersonEmail", LandformData.ContactPersonEmail ?? "");
        fd.append("TypeOfLandTenureType", LandformData.TypeOfLandTenureType ?? "");
        fd.append("PlotShape", LandformData.PlotShape ?? "");
        fd.append("Frontage", String(LandformData.Frontage ?? 0));
        fd.append("PlotDepth", String(LandformData.PlotDepth ?? 0));
        fd.append("RoadWidth", String(LandformData.RoadWidth ?? 0));
        fd.append("IsAnyPowerofAttorneyInvolved", String(LandformData.IsAnyPowerofAttorneyInvolved ?? false));
        fd.append("IsFencingBoundaryWallPresent", String(LandformData.IsFencingBoundaryWallPresent ?? false));
        fd.append("SoilType", LandformData.SoilType ?? "");
        fd.append("ExistingGroundCondition", LandformData.ExistingGroundCondition ?? "");
        fd.append("IsLandConvertedToNonAgricultural", String(LandformData.IsLandConvertedToNonAgricultural ?? false));
        fd.append("IsAccessRoadAvailable", String(LandformData.IsAccessRoadAvailable ?? false));
        fd.append("IsElectricityConnectionNearby", String(LandformData.IsElectricityConnectionNearby ?? false));
        fd.append("IsUnderLitigationOrStayOrder", String(LandformData.IsUnderLitigationOrStayOrder ?? false));
        fd.append("Is712Available", String(LandformData.Is712Available ?? false));
        fd.append("FSIPermissible", String(LandformData.FSIPermissible ?? ""));
        fd.append("WaterSupplyAvailable", LandformData.WaterSupplyAvailable ?? "");
        fd.append("SurroundingLandUse", LandformData.SurroundingLandUse ?? "");
        fd.append("LandOwnershipType", LandformData.LandOwnershipType ?? "");
        fd.append("DistanceFromNearestTownKM", String(LandformData.DistanceFromNearestTownKM ?? 0));
        fd.append("DistanceFromHighwayKM", String(LandformData.DistanceFromHighwayKM ?? 0));
        fd.append("DistanceFromRailwayStationKM", String(LandformData.DistanceFromRailwayStationKM ?? 0));
        fd.append("DistanceFromAirportKM", String(LandformData.DistanceFromAirportKM ?? 0));
        fd.append("TotalNumberOfTreesonSite", String(LandformData.TotalNumberOfTreesonSite ?? 0));
        fd.append("PhotoURL", LandformData.PhotoURL ?? "");
        fd.append("RemovePhotoURL", LandformData.RemovePhotoURL ?? "");
        fd.append("Remark", LandformData.Remark ?? "");

        return fd;
    };

    const handleProjectLanddUpdateProjectLand = async () => {
        setErrors({});

        const validation = ValidateAddUpdateProjectLand();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const payload = PushAddUpdateProjectLandForm();

                const response = await projectLandService.apiCallAddUpdateProjectLand(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/projectLead", {
                        state: { activeTab: "Land" }
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
            isAddMode ? 'Add Project Lead' : "Update Project Lead"
        );
    };

    const handleFieldChange = (field: keyof AddUpdateProjectLandData, value: any) => {
        setLandFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Property Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <Input
                            type="text"
                            required
                            label="Land Owner Name"
                            value={LandformData.LandOwnerName ?? ""}
                            onChange={(e) => handleFieldChange("LandOwnerName", e.target.value)}
                            placeholder="Enter Land Owner Name"
                            maxLength={250}
                            error={errors.LandOwnerName}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <TextArea
                            required
                            label="Land Address"
                            value={LandformData.LandAddress ?? ""}
                            onChange={(e) => handleFieldChange("LandAddress", e.target.value)}
                            placeholder="Enter Land Address"
                            maxLength={250}
                            error={errors.LandAddress}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                            value={LandformData.PinCode ?? ""}
                            onChange={(e) => handleFieldChange("PinCode", e.target.value)}
                            placeholder="Enter Pin Code"
                            maxLength={250}
                            error={errors.PinCode}
                        />
                    </div>

                </div>
            </div>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Plot Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <Input
                            type="text"
                            required
                            label="Plot Number / CTS Number / Survey Number / Subdivision Number"
                            value={LandformData.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber ?? ""}
                            onChange={(e) => handleFieldChange("PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber", e.target.value)}
                            placeholder="Enter Plot Number"
                            maxLength={250}
                            error={errors.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Ward Number / Zone"
                            value={LandformData.WardNumberZone ?? ""}
                            onChange={(e) => handleFieldChange("WardNumberZone", e.target.value)}
                            placeholder="Enter Ward Number"
                            maxLength={250}
                            error={errors.WardNumberZone}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Total Plot Area (in Sq. m.)"
                            value={LandformData.TotalPlotAreaSqM ?? ""}
                            onChange={(e) => handleFieldChange("TotalPlotAreaSqM", e.target.value)}
                            placeholder="Enter Total Plot Area"
                            maxLength={250}
                            error={errors.TotalPlotAreaSqM}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Identification And Location"
                            value={LandformData.IdentificationLocation ?? ""}
                            onChange={(e) => handleFieldChange("IdentificationLocation", e.target.value)}
                            placeholder="Enter Identification And Location"
                            maxLength={250}
                            error={errors.IdentificationLocation}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Latitude & Longitude (For GIS Mapping)"
                            value={LandformData.LatitudeLongitude ?? ""}
                            onChange={(e) => handleFieldChange("LatitudeLongitude", e.target.value)}
                            placeholder="Enter Latitude And Longitude"
                            maxLength={250}
                            error={errors.LatitudeLongitude}
                        />
                    </div>

                </div>
            </div>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Society Contact
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <Input
                            type="text"
                            required
                            label="Contact Person For Land Name"
                            value={LandformData.ContactPersonName ?? ""}
                            onChange={(e) => handleFieldChange("ContactPersonName", e.target.value)}
                            placeholder="Enter Contact Person For Land Name"
                            maxLength={250}
                            error={errors.ContactPersonName}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Contact Person Mobile Number"
                            value={LandformData.ContactPersonMobile ?? ""}
                            onChange={(e) => handleFieldChange("ContactPersonMobile", e.target.value)}
                            placeholder="Enter Contact Person Mobile Number"
                            maxLength={250}
                            error={errors.ContactPersonMobile}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Contact Person Email"
                            value={LandformData.ContactPersonEmail ?? ""}
                            onChange={(e) => handleFieldChange("ContactPersonEmail", e.target.value)}
                            placeholder="Enter Contact Person Email"
                            maxLength={250}
                            error={errors.ContactPersonEmail}
                        />
                    </div>

                </div>
            </div>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Land & Plot Characteristics
                </h3>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">

                    <Checkbox
                        label="Any Power of Attorney (POA) involved?"
                        checked={LandformData.IsAnyPowerofAttorneyInvolved ?? false}
                        onChange={(e) => handleFieldChange("IsAnyPowerofAttorneyInvolved", e.target.checked)}
                    />

                    <Checkbox
                        label="Fencing / Boundary Wall Present?"
                        checked={LandformData.IsFencingBoundaryWallPresent ?? false}
                        onChange={(e) => handleFieldChange("IsFencingBoundaryWallPresent", e.target.checked)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <SinglePageSelection
                            label="Plot Shape"
                            required
                            placeholder="Select Plot Shape"
                            value={LandformData.PlotShape ?? ""}
                            onChange={(value) => handleFieldChange("PlotShape", value)}
                            options={PLOT_SHAPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            error={errors.PlotShape}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Frontage (Road Facing Width)"
                            value={LandformData.Frontage ?? ""}
                            onChange={(e) => handleFieldChange("Frontage", e.target.value)}
                            placeholder="Enter Frontage"
                            maxLength={250}
                            error={errors.Frontage}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Depth Of The Plot"
                            value={LandformData.PlotDepth ?? ""}
                            onChange={(e) => handleFieldChange("PlotDepth", e.target.value)}
                            placeholder="Enter Depth Of The Plot"
                            maxLength={250}
                            error={errors.PlotDepth}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            required
                            label="Road Width In Front Of Plot"
                            value={LandformData.RoadWidth ?? ""}
                            onChange={(e) => handleFieldChange("RoadWidth", e.target.value)}
                            placeholder="Enter Road Width In Front Of Plot"
                            maxLength={250}
                            error={errors.RoadWidth}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Soil Type"
                            required
                            placeholder="Select Soil Type"
                            value={LandformData.SoilType ?? ""}
                            onChange={(value) => handleFieldChange("SoilType", value)}
                            options={SOIL_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            error={errors.SoilType}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Existing Ground Conditions"
                            required
                            placeholder="Select Existing Ground Conditions"
                            value={LandformData.ExistingGroundCondition ?? ""}
                            onChange={(value) => handleFieldChange("ExistingGroundCondition", value)}
                            options={EXISTING_GROUND_CONDITION_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            error={errors.ExistingGroundCondition}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                    <Checkbox
                        label="Is Land Converted to Non-Agricultural?"
                        checked={LandformData.IsLandConvertedToNonAgricultural ?? false}
                        onChange={(e) => handleFieldChange("IsLandConvertedToNonAgricultural", e.target.checked)}
                    />

                    <Checkbox
                        label="Availability of Access Road?"
                        checked={LandformData.IsAccessRoadAvailable ?? false}
                        onChange={(e) => handleFieldChange("IsAccessRoadAvailable", e.target.checked)}
                    />

                    <Checkbox
                        label="Electricity Connection Nearby"
                        checked={LandformData.IsElectricityConnectionNearby ?? false}
                        onChange={(e) => handleFieldChange("IsElectricityConnectionNearby", e.target.checked)}
                    />

                    <Checkbox
                        label="Is Plot Under Litigation Or Stay Orders?"
                        checked={LandformData.IsUnderLitigationOrStayOrder ?? false}
                        onChange={(e) => handleFieldChange("IsUnderLitigationOrStayOrder", e.target.checked)}
                    />

                    <Checkbox
                        label="Is 7 / 12?"
                        checked={LandformData.Is712Available ?? false}
                        onChange={(e) => handleFieldChange("Is712Available", e.target.checked)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Input
                            type="text"
                            label="FSI Permissible (Base + TDR if allowed)"
                            value={LandformData.FSIPermissible ?? ""}
                            onChange={(e) => handleFieldChange("FSIPermissible", e.target.value)}
                            placeholder="Enter FSI Permissible"
                            maxLength={250}
                            error={errors.FSIPermissible}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Water Supply Available"
                            required
                            placeholder="Select Water Supply Available"
                            value={LandformData.WaterSupplyAvailable ?? ""}
                            onChange={(value) => handleFieldChange("WaterSupplyAvailable", value)}
                            options={WATER_SUPPLY_AVAILABLE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            error={errors.WaterSupplyAvailable}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Surrounding Land Use"
                            value={LandformData.SurroundingLandUse ?? ""}
                            onChange={(value) => handleFieldChange("SurroundingLandUse", value)}
                            options={SURROUNDING_LAND_USE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            placeholder="Enter Surrounding Land Use"
                            error={errors.SurroundingLandUse}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Type Of Land Tenure"
                            required
                            placeholder="Select Type Of Land Tenure"
                            value={LandformData.TypeOfLandTenureType ?? ""}
                            onChange={(value) => handleFieldChange("TypeOfLandTenureType", value)}
                            options={LAND_TENURE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                            error={errors.TypeOfLandTenureType}
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Land Ownership Type"
                            value={LandformData.LandOwnershipType ?? ""}
                            onChange={(value) => handleFieldChange("LandOwnershipType", value)}
                            options={LAND_OWNERSHIP_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id, }))} placeholder="Enter Land Ownership Type"
                            error={errors.LandOwnershipType}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Distance From Nearest Town"
                            value={LandformData.DistanceFromNearestTownKM ?? ""}
                            onChange={(e) => handleFieldChange("DistanceFromNearestTownKM", e.target.value)}
                            placeholder="Nearest Town (KM)"
                            maxLength={250}
                            error={errors.DistanceFromNearestTownKM}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Distance From Highway"
                            value={LandformData.DistanceFromHighwayKM ?? ""}
                            onChange={(e) => handleFieldChange("DistanceFromHighwayKM", e.target.value)}
                            placeholder="Highway (KM)"
                            maxLength={250}
                            error={errors.DistanceFromHighwayKM}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Distance From Railway Station"
                            value={LandformData.DistanceFromRailwayStationKM ?? ""}
                            onChange={(e) => handleFieldChange("DistanceFromRailwayStationKM", e.target.value)}
                            placeholder="Railway Station (KM)"
                            maxLength={250}
                            error={errors.DistanceFromRailwayStationKM}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Distance From Airport"
                            value={LandformData.DistanceFromAirportKM ?? ""}
                            onChange={(e) => handleFieldChange("DistanceFromAirportKM", e.target.value)}
                            placeholder="Airport (KM)"
                            maxLength={250}
                            error={errors.DistanceFromAirportKM}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Total Number Of Trees On Site"
                            value={LandformData.TotalNumberOfTreesonSite ?? ""}
                            onChange={(e) => handleFieldChange("TotalNumberOfTreesonSite", e.target.value)}
                            placeholder="Enter Total Number Of Trees On Site"
                            maxLength={250}
                            error={errors.TotalNumberOfTreesonSite}
                        />
                    </div>

                </div>
            </div>

            <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                    Additional Info
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <TextArea
                            required
                            label="Remarks"
                            value={LandformData.Remark ?? ""}
                            onChange={(e) => handleFieldChange("Remark", e.target.value)}
                            placeholder="Enter Remarks"
                            maxLength={250}
                            error={errors.Remark}
                        />
                    </div>

                </div>
            </div>

            <BottomActionBar
                cancelText="Cancel"
                saveText={LandformData.ProjectLandId ? "Update" : "Add"}
                onCancel={() => navigate("/projectLead", {
                    state: { activeTab: "Land" }
                })}
                canAction={canAction}
                onSave={() => {
                    handleProjectLanddUpdateProjectLand();
                }}
                isLoading={isLoading}
            />

        </div>
    );
};

export default AddUpdateProjectLand;