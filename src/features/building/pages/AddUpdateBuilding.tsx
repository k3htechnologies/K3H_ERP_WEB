import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { TextArea } from "@/ui/components/forms/Textarea";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { buildingService } from "@/features/building/services/BuildingService";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import { filterNumbers, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import type { AddUpdateBuildingRequest, FilterWithPaginationBuildingRequest } from "@/features/building/models/BuildingModel";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { LAND_OWNERSHIP_TYPE } from "@/core/constants";
import Checkbox from "@/ui/components/forms/Checkbox";
import { useProject } from "@/features/projectMaster/context/ProjectContext";

const initialFormState = (): AddUpdateBuildingRequest => ({
  BuildingId: null,
  Uniquekey: null,
  ProjectId: null,
  BuildingName: "",
  CTSNumber: "",
  TotalPlotAreaSqFt: null,
  RoadWidth: "",
  CountryMasterId: 1,
  DistrictMasterId: null,
  StateMasterId: null,
  CityMasterId: null,
  TotalNumberOfUnits: null,
  TotalUnitsAreaUtilizedSqFt: null,
  IsGarden: null,
  TotalGardenAreaSqFt: null,
  IsReligiousStructure: null,
  TotalReligiousStructureAreaSqFt: null,
  PropertyAgeYears: null,
  NumberOfFloors: null,
  FSI_TDR_UtilizationSqFt: null,
  LandOwnershipType: "",
  IsLitigation: null,
  LitigationRemarks: "",
});

const AddUpdateBuilding: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateBuildingRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();
  const location = useLocation();

  //GET VALUE FROM URL :BUILDINGID
  const { buildingId } = useParams<{ buildingId?: string }>();

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //#endregion

  //#region PROJECT SELECTION GET ID

  const { projectId } = useProject()

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/building');
  //#endregion

  //#region COUNTRY STATE CITY DISTRICT 
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



  //#endregion

  //#region HANDLE FILED CHNAGE EVENT
  const handleFieldChange = (field: keyof AddUpdateBuildingRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION

  useEffect(() => {
    if (buildingId) {
      fetchBuildingDetails();
      return;
    }

    setSelectedCountryId(1);
    handleFieldChange('CountryMasterId', 1);

  }, [buildingId]);

  //#endregion

  //#region FETCH BUILDING DETAILS
  const fetchBuildingDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationBuildingRequest = {
          PageNumber: 1,
          PageSize: 1,
          IsCheckPermission: false,
          BuildingId: Number(buildingId),
          ProjectId: Number(projectId)
        }

        const response = await buildingService.apiCallPullBuilding(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData(prev => ({
              ...prev,
              BuildingId: e.BuildingId ?? prev.BuildingId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              ProjectId: projectId,
              BuildingName: e.BuildingName ?? prev.BuildingName,
              CTSNumber: e.CTSNumber ?? prev.CTSNumber,
              TotalPlotAreaSqFt: e.TotalPlotAreaSqFt ?? prev.TotalPlotAreaSqFt,
              RoadWidth: e.RoadWidth ?? prev.RoadWidth,
              CountryMasterId: e.CountryMasterId ?? prev.CountryMasterId,
              DistrictMasterId: e.DistrictMasterId ?? prev.DistrictMasterId,
              StateMasterId: e.StateMasterId ?? prev.StateMasterId,
              CityMasterId: e.CityMasterId ?? prev.CityMasterId,
              TotalNumberOfUnits: e.TotalNumberOfUnits ?? prev.TotalNumberOfUnits,
              TotalUnitsAreaUtilizedSqFt: e.TotalUnitsAreaUtilizedSqFt ?? prev.TotalUnitsAreaUtilizedSqFt,
              IsGarden: e.IsGarden ?? prev.IsGarden,
              TotalGardenAreaSqFt: e.TotalGardenAreaSqFt ?? prev.TotalGardenAreaSqFt,
              IsReligiousStructure: e.IsReligiousStructure ?? prev.IsReligiousStructure,
              TotalReligiousStructureAreaSqFt: e.TotalReligiousStructureAreaSqFt ?? prev.TotalReligiousStructureAreaSqFt,
              PropertyAgeYears: e.PropertyAgeYears ?? prev.PropertyAgeYears,
              NumberOfFloors: e.NumberOfFloors ?? prev.NumberOfFloors,
              FSI_TDR_UtilizationSqFt: e.FSI_TDR_UtilizationSqFt ?? prev.FSI_TDR_UtilizationSqFt,
              LandOwnershipType: e.LandOwnershipType ?? prev.LandOwnershipType,
              IsLitigation: e.IsLitigation ?? prev.IsLitigation,
              LitigationRemarks: e.LitigationRemarks ?? prev.LitigationRemarks,
            }));

            setSelectedCountryId(e.CountryMasterId ?? null);
            setSelectedStateId(e.StateMasterId ?? null);
            setSelectedDistrictId(e.DistrictMasterId ?? null);
            setSelectedCityId(e.CityMasterId ?? null);
          }
        } else {

          addToast({ type: 'error', title: response.left.message });

        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Building Data'
    )
  }
  //#endregion

  //#region BUILDING VALIDATION | ADD | UPDATE ACTION
  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddBuildingForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.BuildingName?.trim()) {
      newErrors.BuildingName = 'Building Name is required'
    }

    if (!formData.CTSNumber?.trim()) {
      newErrors.CTSNumber = 'CTS Number is required'
    }
    if (!formData.TotalPlotAreaSqFt) {
      newErrors.TotalPlotAreaSqFt = 'Total Plot Area SqFt is required'
    }
    if (!formData.RoadWidth) {
      newErrors.RoadWidth = 'Road width is required'
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

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushBuildingFormData = (): AddUpdateBuildingRequest => {
    return {
      BuildingId: formData.BuildingId,
      Uniquekey: formData.Uniquekey,
      ProjectId: projectId,
      BuildingName: formData.BuildingName,
      CTSNumber: formData.CTSNumber,
      TotalPlotAreaSqFt: formData.TotalPlotAreaSqFt,
      RoadWidth: formData.RoadWidth,
      CountryMasterId: formData.CountryMasterId,
      DistrictMasterId: formData.DistrictMasterId,
      StateMasterId: formData.StateMasterId,
      CityMasterId: formData.CityMasterId,
      TotalNumberOfUnits: formData.TotalNumberOfUnits,
      TotalUnitsAreaUtilizedSqFt: formData.TotalUnitsAreaUtilizedSqFt,
      IsGarden: formData.IsGarden,
      TotalGardenAreaSqFt: formData.TotalGardenAreaSqFt,
      IsReligiousStructure: formData.IsReligiousStructure,
      TotalReligiousStructureAreaSqFt: formData.TotalReligiousStructureAreaSqFt,
      PropertyAgeYears: formData.PropertyAgeYears,
      NumberOfFloors: formData.NumberOfFloors,
      FSI_TDR_UtilizationSqFt: formData.FSI_TDR_UtilizationSqFt,
      LandOwnershipType: formData.LandOwnershipType,
      IsLitigation: formData.IsLitigation,
      LitigationRemarks: formData.LitigationRemarks,
    };

  };

  const handleSubmit = async () => {

    setErrors({})

    const validation = validateAddBuildingForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushBuildingFormData();

        const response = await buildingService.apiCallAddUpdateBuilding(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: formData.BuildingId ? "Building updated successfully" : "Building added successfully" });

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

          navigate("/building", {
            state: { listState }
          });

        } else {

          addToast({ type: "error", title: response.left?.message });

        }
        return response;
      },
      undefined,
      (error: any) => {

        addToast({ type: 'error', title: error.message })
      },
      undefined,

      Number(buildingId) === 0 ? 'Add Building' : 'Update Building'
    )

  };

  //#endregion
  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


      <div className="flex-1 space-y-2 px-6 py-3 pb-20 overflow-y-auto thin-scroll ">
        <form onSubmit={handleSubmit}>
          {/* ============================================================= [BASIC BUILDING DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Basic Building Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Building Name"
                  value={formData.BuildingName}
                  required
                  onChange={e => handleFieldChange('BuildingName', e.target.value)}
                  error={errors.BuildingName} />
              </div>
              <div>
                <Input
                  value={formData.CTSNumber}
                  label="CTS Number"
                  required
                  onChange={e => handleFieldChange('CTSNumber', e.target.value)}
                  error={errors.CTSNumber} />
              </div>
              <div>
                <SinglePageSelection
                  label="Land Ownership Type"
                  value={formData.LandOwnershipType}
                  onChange={(e) => handleFieldChange('LandOwnershipType', String(e))}
                  options={LAND_OWNERSHIP_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errors.LandOwnershipType}
                />

              </div>
              <div>
                <Input
                  value={formData.RoadWidth}
                  label="Road Width"
                  required
                  onChange={e => handleFieldChange('RoadWidth', e.target.value)}
                  error={errors.RoadWidth} />
              </div>
              <div>
                <Input
                  value={formData.TotalPlotAreaSqFt ?? ''}
                  label="Total Plot Area (sqft)"
                  required
                  error={errors.TotalPlotAreaSqFt}
                  onChange={e => handleFieldChange('TotalPlotAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                />
              </div>
              <div>
                <Input
                  value={formData.TotalUnitsAreaUtilizedSqFt ?? ''}
                  label="Utilized Units Area (sqft)"
                  error={errors.TotalUnitsAreaUtilizedSqFt}
                  onChange={e => handleFieldChange('TotalUnitsAreaUtilizedSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                />
              </div>
              <div>
                <Input
                  value={formData.TotalNumberOfUnits ?? ''}
                  label="Total Units"
                  error={errors.TotalNumberOfUnits}
                  onChange={e => handleFieldChange('TotalNumberOfUnits', filterNumbersWithDecimal(e.target.value) || 0)}
                />
              </div>
              <div>
                <Input
                  value={formData.NumberOfFloors ?? ''}
                  label="Number Of Floors"
                  error={errors.NumberOfFloors}
                  onChange={e => handleFieldChange('NumberOfFloors', Number(filterNumbers(e.target.value) || 0))}
                />
              </div>
              <div>
                <Input
                  value={formData.PropertyAgeYears ?? ''}
                  label="Property Age (Years)"
                  error={errors.PropertyAgeYears}
                  onChange={e => handleFieldChange('PropertyAgeYears', filterNumbersWithDecimal(e.target.value) || 0)}
                />
              </div>
              <div>
                <Input
                  value={formData.FSI_TDR_UtilizationSqFt ?? ''}
                  label="FSI / TDR Utilization (sqft)"
                  error={errors.FSI_TDR_UtilizationSqFt}
                  onChange={e => handleFieldChange('FSI_TDR_UtilizationSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                />
              </div>


              <div className="md:col-span-2 lg:col-span-3">

                <Checkbox
                  label="Is Garden"
                  checked={formData.IsGarden === true}
                  onChange={(e) => handleFieldChange('IsGarden', e.target.checked ? true : false)}
                />

              </div>

              {formData.IsGarden === true ?
                <div>
                  <Input
                    value={formData.TotalGardenAreaSqFt ?? ''}
                    label="Garden Area (sqft)"
                    onChange={e => handleFieldChange('TotalGardenAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                    error={errors.TotalGardenAreaSqFt}
                  />
                </div>
                : ""}

              <div className="md:col-span-2 lg:col-span-3">

                <Checkbox
                  label="Is Religious Structure"
                  checked={formData.IsReligiousStructure === true}
                  onChange={(e) => handleFieldChange('IsReligiousStructure', e.target.checked ? true : false)}
                />

              </div>
              {formData.IsReligiousStructure === true ?
                <div>
                  <Input
                    value={formData.TotalReligiousStructureAreaSqFt ?? ''}
                    label="Religious Structure Area (sqft)"
                    onChange={e => handleFieldChange('TotalReligiousStructureAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                    error={errors.TotalReligiousStructureAreaSqFt}
                  />
                </div>
                : ""}

              <div className="md:col-span-2 lg:col-span-3">

                <Checkbox
                  label="Is Litigation"
                  checked={formData.IsLitigation === true}
                  onChange={(e) => handleFieldChange('IsLitigation', e.target.checked ? true : false)}
                />

              </div>
              {formData.IsLitigation === true ?
                <div className="md:col-span-2 lg:col-span-3">
                  <TextArea
                    label="Litigation Remarks"
                    className='thin-scroll'
                    value={formData.LitigationRemarks ?? ''}
                    error={errors.LitigationRemarks}
                    onChange={(e) => handleFieldChange("LitigationRemarks", e.target.value)}
                  />
                </div>
                : ""}
            </div>
          </div>
          {/* ============================================================= [ADDRESS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <SinglePageSelection
                  label="Country"
                  value={selectedCountryId || ''} required
                  onChange={val => {
                    const id = Number(val)
                    setSelectedCountryId(id)
                    setSelectedStateId(null)
                    setSelectedDistrictId(null)
                    setSelectedCityId(null)

                    handleFieldChange('CountryMasterId', id)
                  }}
                  disabled={isLocationLoading}
                  options={countryOptions}
                  error={errors.CountryMasterId}
                />
              </div>
              <div>

                <SinglePageSelection
                  label="State"
                  value={selectedStateId ?? ''} required
                  onChange={val => {
                    const id = Number(val)
                    setSelectedStateId(id)
                    setSelectedDistrictId(null)
                    setSelectedCityId(null)

                    handleFieldChange('StateMasterId', id)
                  }}
                  disabled={!selectedCountryId || stateOptions.length === 0}
                  options={stateOptions}
                  error={errors.StateMasterId}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="District"
                  value={selectedDistrictId ?? ''} required
                  onChange={val => {
                    const id = Number(val)
                    setSelectedDistrictId(id)
                    setSelectedCityId(null)

                    handleFieldChange('DistrictMasterId', id)
                  }}
                  disabled={!selectedStateId || districtOptions.length === 0}
                  options={districtOptions}
                  error={errors.DistrictMasterId}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="City"
                  value={selectedCityId ?? ''} required
                  onChange={val => {
                    const id = Number(val)
                    setSelectedCityId(id)
                    handleFieldChange('CityMasterId', id)
                  }}
                  disabled={!selectedDistrictId || cityOptions.length === 0}
                  options={cityOptions}
                  error={errors.CityMasterId}
                />
              </div>


            </div>
          </div>

        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.BuildingId ? "Update Building" : "Add Building"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleSubmit();
        }}
        isLoading={isLoading}
      />


    </div>
  );
};

export default AddUpdateBuilding;
