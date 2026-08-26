import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { TextArea } from "@/ui/components/forms/Textarea";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { buildingService } from "@/features/building/services/BuildingService";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import { filterGoogleMapsUrl, filterNumbers, filterNumbersWithDecimal, isValidGoogleMapsUrl } from "@/core/utils/fileValidation";
import type { AddUpdateBuildingRequest, FilterWithPaginationBuildingRequest } from "@/features/building/models/BuildingModel";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { LAND_OWNERSHIP_TYPE, PROJECT_CATEGORY, ROAD_WIDTH, TENDER_PAYMENT_MODE } from "@/core/constants";
import Checkbox from "@/ui/components/forms/Checkbox";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { MapPin } from "lucide-react";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";

const initialFormState = (): AddUpdateBuildingRequest => ({
  BuildingId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ProjectId: null,
  BuildingName: "",
  CTSNumber: "",
  GoogleLocation: "",
  TotalPlotAreaSqFt: null,
  TotalPlotAreaSqMt: null,
  RoadWidth: "",
  CountryMasterId: 1,
  DistrictMasterId: null,
  StateMasterId: null,
  CityMasterId: null,
  VillageMasterId: null,
  WardMasterId: null,
  TotalNumberOfUnits: null,

  TotalUnitsAreaUtilizedSqFt: null,
  IsGarden: null,
  TotalGardenAreaSqFt: null,
  IsReligiousStructure: null,
  TotalReligiousStructureAreaSqFt: null,
  PropertyAgeYears: null,
  NumberOfFloors: null,
  NumberOfWings: null,
  FSI_TDR_UtilizationSqFt: null,
  LandOwnershipType: "",
  IsLitigation: null,
  LitigationRemarks: "",

  Category: '',

  TenderAmount: 0,
  TenderPurchaseStartDate: null,
  TenderPurchaseEndDate: null,
  TenderAmountPaymentMode: '',
  TenderAmountChequeNumber: '',
  TenderAmountChequeNumberURL: null,
  RemoveTenderAmountChequeNumberURL: '',
  TenderAmountPayorderRemark: '',

  TenderEMDAmount: 0,
  TenderSubmissionDate: null,
  TenderEMDPaymentMode: '',
  TenderEMDChequeNumber: '',
  TenderEMDChequeNumberURL: null,
  RemoveTenderEMDChequeNumberURL: '',
  TenderEMDPayorderRemark: '',
});

const AddUpdateBuilding: React.FC = () => {

  const [formData, setFormData] = useState<AddUpdateBuildingRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const navigate = useNavigate();

  const { buildingId } = useParams<{ buildingId?: string }>();

  const { addToast } = useToast();
  const [errors, setErrors] = useState<{ [k: string]: string }>({});


  const { projectId } = useProject()

  const { canAction } = useMenuPermissions('/building');

  const [tenderAmountChequeNumberFiles, setTenderAmountChequeNumberFiles] = useState<(File | string)[]>([]);
  const [removedTenderAmountChequeNumberUrls, setRemovedTenderAmountChequeNumberUrls] = useState<string[]>([]);
  const [tenderAmountChequeNumberURL, setTenderAmountChequeNumberURL] = useState<string>();

  const [tenderEMDChequeNumberFiles, setTenderEMDChequeNumberFiles] = useState<(File | string)[]>([]);
  const [removedTenderEMDChequeNumberUrls, setRemovedTenderEMDChequeNumberUrls] = useState<string[]>([]);
  const [tenderEMDChequeNumberURL, setTenderEMDChequeNumberURL] = useState<string>();


  const {
    isLoading: isLocationLoading,
    countries,
    statesByCountryId,
    districtsByStateId,
    citiesByDistrictId,
    wardByDistrictId,
    villagesByCityId
  } = useCountryStateCityDistrictVillageData()

  const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1)
  const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null)
  const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null)
  const [selectedWardId, setSelectedWardId] = React.useState<number | null>(null)
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

  const wardOptions =
    selectedDistrictId != null
      ? (wardByDistrictId[selectedDistrictId] || []).map(c => ({
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


  const handleFieldChange = (field: keyof AddUpdateBuildingRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };


  useEffect(() => {
    if (buildingId) {
      fetchBuildingDetails();
      return;
    }

    setSelectedCountryId(1);
    handleFieldChange('CountryMasterId', 1);

  }, [buildingId]);

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
              GoogleLocation: e.GoogleLocation ?? prev.GoogleLocation,
              TotalPlotAreaSqFt: e.TotalPlotAreaSqFt ?? prev.TotalPlotAreaSqFt,
              TotalPlotAreaSqMt: e.TotalPlotAreaSqMt ?? prev.TotalPlotAreaSqMt,
              RoadWidth: e.RoadWidth ?? prev.RoadWidth,
              CountryMasterId: e.CountryMasterId ?? prev.CountryMasterId,
              DistrictMasterId: e.DistrictMasterId ?? prev.DistrictMasterId,
              StateMasterId: e.StateMasterId ?? prev.StateMasterId,
              CityMasterId: e.CityMasterId ?? prev.CityMasterId,
              VillageMasterId: e.VillageMasterId ?? prev.VillageMasterId,
              WardMasterId: e.WardMasterId ?? prev.WardMasterId,
              TotalNumberOfUnits: e.TotalNumberOfUnits ?? prev.TotalNumberOfUnits,
              TotalUnitsAreaUtilizedSqFt: e.TotalUnitsAreaUtilizedSqFt ?? prev.TotalUnitsAreaUtilizedSqFt,
              IsGarden: e.IsGarden ?? prev.IsGarden,
              TotalGardenAreaSqFt: e.TotalGardenAreaSqFt ?? prev.TotalGardenAreaSqFt,
              IsReligiousStructure: e.IsReligiousStructure ?? prev.IsReligiousStructure,
              TotalReligiousStructureAreaSqFt: e.TotalReligiousStructureAreaSqFt ?? prev.TotalReligiousStructureAreaSqFt,
              PropertyAgeYears: e.PropertyAgeYears ?? prev.PropertyAgeYears,
              NumberOfFloors: e.NumberOfFloors ?? prev.NumberOfFloors,
              NumberOfWings: e.NumberOfWings ?? prev.NumberOfWings,
              FSI_TDR_UtilizationSqFt: e.FSI_TDR_UtilizationSqFt ?? prev.FSI_TDR_UtilizationSqFt,
              LandOwnershipType: e.LandOwnershipType ?? prev.LandOwnershipType,
              IsLitigation: e.IsLitigation ?? prev.IsLitigation,
              LitigationRemarks: e.LitigationRemarks ?? prev.LitigationRemarks,

              Category: e.Category ?? prev.Category ?? '',


              TenderAmount: e.TenderAmount ?? prev.TenderAmount ?? 0,
              TenderPurchaseStartDate: e.TenderPurchaseStartDate ?? prev.TenderPurchaseStartDate,
              TenderPurchaseEndDate: e.TenderPurchaseEndDate ?? prev.TenderPurchaseEndDate,
              TenderAmountPaymentMode: e.TenderAmountPaymentMode ?? prev.TenderAmountPaymentMode ?? '',
              TenderAmountChequeNumber: e.TenderAmountChequeNumber ?? prev.TenderAmountChequeNumber ?? '',
              TenderAmountChequeNumberURL: null,
              RemoveTenderAmountChequeNumberURL: '',
              TenderAmountPayorderRemark: e.TenderAmountPayorderRemark ?? prev.TenderAmountPayorderRemark ?? '',

              TenderEMDAmount: e.TenderEMDAmount ?? prev.TenderEMDAmount ?? 0,
              TenderSubmissionDate: e.TenderSubmissionDate ?? prev.TenderSubmissionDate,
              TenderEMDPaymentMode: e.TenderEMDPaymentMode ?? prev.TenderEMDPaymentMode ?? '',
              TenderEMDChequeNumber: e.TenderEMDChequeNumber ?? prev.TenderEMDChequeNumber ?? '',
              TenderEMDChequeNumberURL: null,
              RemoveTenderEMDChequeNumberURL: '',
              TenderEMDPayorderRemark: e.TenderEMDPayorderRemark ?? prev.TenderEMDPayorderRemark ?? '',
            }));

            setSelectedCountryId(e.CountryMasterId ?? null);
            setSelectedStateId(e.StateMasterId ?? null);
            setSelectedDistrictId(e.DistrictMasterId ?? null);
            setSelectedCityId(e.CityMasterId ?? null);
            setSelectedWardId(e.WardMasterId ?? null);
            setSelectedVillageId(e.VillageMasterId ?? null);

            setTenderAmountChequeNumberFiles([]);
            setTenderAmountChequeNumberURL(e.TenderAmountChequeNumberURL)
            setRemovedTenderAmountChequeNumberUrls([]);

            setTenderEMDChequeNumberFiles([]);
            setTenderEMDChequeNumberURL(e.TenderEMDChequeNumberURL)
            setRemovedTenderEMDChequeNumberUrls([]);
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
      'Loading Building'
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

    if (!formData.Category?.trim()) {
      newErrors.Category = "Category is required.";
    }

    if (formData.Category?.trim().toUpperCase() === "TENDER") {

      if (!formData.TenderAmount) {
        newErrors.TenderAmount = "Amount is required.";
      }

      if (!formData.TenderPurchaseStartDate) {
        newErrors.TenderPurchaseStartDate = "Purchase Start Date is required.";
      }

      if (!formData.TenderPurchaseEndDate) {
        newErrors.TenderPurchaseEndDate = "Purchase End Date is required.";
      }

      const purchaseStartDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.TenderPurchaseStartDate ? new Date(formData.TenderPurchaseStartDate) : undefined);
      const purchaseEndDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.TenderPurchaseEndDate ? new Date(formData.TenderPurchaseEndDate) : undefined);

      if (formData?.TenderPurchaseStartDate && formData.TenderPurchaseEndDate && !isToDateGreaterOrEqualFromDate(purchaseStartDate, purchaseEndDate)) {
        newErrors.TenderPurchaseEndDate = "Purchase End Date must be greater than or equal to Purchase Start Date";
      }

    }


    if (!formData.GoogleLocation?.trim()) {
      newErrors.GoogleLocation = 'Google Location is required'
    } else if (!isValidGoogleMapsUrl(formData.GoogleLocation.trim())) {
      newErrors.GoogleLocation = 'Enter a valid Google Location'
    }

    if (!formData.TotalPlotAreaSqMt) {
      newErrors.TotalPlotAreaSqMt = 'Total Plot Area is required'
    }

    if (formData.IsGarden && !formData.TotalGardenAreaSqFt) {
      newErrors.TotalGardenAreaSqFt = 'Total Garden Area is required'
    }
    if (formData.IsReligiousStructure && !formData.TotalReligiousStructureAreaSqFt) {
      newErrors.TotalReligiousStructureAreaSqFt = 'Total Religious Structure Area is required'
    }
    if (formData.IsLitigation && !formData.LitigationRemarks) {
      newErrors.LitigationRemarks = 'Litigation Remarks is required'
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
    if (!formData.VillageMasterId) {
      newErrors.VillageMasterId = "Village is required";
    }
    if (!formData.WardMasterId) {
      newErrors.WardMasterId = "Ward is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushBuildingFormData = (): FormData => {
    const isTender = formData.Category.toUpperCase() === "TENDER";

    const fd = new FormData();
    fd.append("BuildingId", String(formData.BuildingId ?? 0));
    fd.append("Uniquekey", formData.Uniquekey ?? "");
    fd.append("ProjectId", String(projectId ?? 0));
    fd.append("BuildingName", formData.BuildingName ?? "");
    fd.append("CTSNumber", formData.CTSNumber ?? "");

    fd.append("GoogleLocation", formData.GoogleLocation ?? "");

    fd.append("TotalPlotAreaSqFt", String(formData.TotalPlotAreaSqFt ?? 0));

    fd.append("TotalPlotAreaSqMt", String(formData.TotalPlotAreaSqMt ?? 0));

    fd.append("RoadWidth", formData.RoadWidth ?? "");

    fd.append("CountryMasterId", String(formData.CountryMasterId ?? 0));

    fd.append("StateMasterId", String(formData.StateMasterId ?? 0));

    fd.append("DistrictMasterId", String(formData.DistrictMasterId ?? 0));

    fd.append("CityMasterId", String(formData.CityMasterId ?? 0));

    fd.append("VillageMasterId", String(formData.VillageMasterId ?? 0));

    fd.append("WardMasterId", String(formData.WardMasterId ?? 0));

    fd.append("TotalNumberOfUnits", String(formData.TotalNumberOfUnits ?? 0));

    fd.append("TotalUnitsAreaUtilizedSqFt", String(formData.TotalUnitsAreaUtilizedSqFt ?? 0));

    fd.append("IsGarden", String(formData.IsGarden ?? false));

    fd.append("TotalGardenAreaSqFt", String(formData.TotalGardenAreaSqFt ?? 0));

    fd.append("IsReligiousStructure", String(formData.IsReligiousStructure ?? false));

    fd.append("TotalReligiousStructureAreaSqFt", String(formData.TotalReligiousStructureAreaSqFt ?? 0));

    fd.append("PropertyAgeYears", String(formData.PropertyAgeYears ?? 0));

    fd.append("NumberOfFloors", String(formData.NumberOfFloors ?? 0));

    fd.append("NumberOfWings", String(formData.NumberOfWings ?? 0));

    fd.append("FSI_TDR_UtilizationSqFt", String(formData.FSI_TDR_UtilizationSqFt ?? 0));

    fd.append("LandOwnershipType", formData.LandOwnershipType ?? "");

    fd.append("IsLitigation", String(formData.IsLitigation ?? false));

    fd.append("LitigationRemarks", formData.LitigationRemarks ?? "");
    fd.append("Category", formData.Category ?? "");

    fd.append("TenderAmount", isTender ? String(formData.TenderAmount ?? 0) : "0");
    fd.append("TenderPurchaseStartDate", isTender ? (formData.TenderPurchaseStartDate ?? "") : "");
    fd.append("TenderPurchaseEndDate", isTender ? (formData.TenderPurchaseEndDate ?? "") : "");
    fd.append("TenderAmountPaymentMode", isTender ? (formData.TenderAmountPaymentMode ?? "") : "");
    fd.append("TenderAmountChequeNumber", isTender ? (formData.TenderAmountChequeNumber ?? "") : "");
    fd.append("TenderAmountPayorderRemark", isTender ? (formData.TenderAmountPayorderRemark ?? "") : "");

    // Tender EMD Details
    fd.append("TenderEMDAmount", isTender ? String(formData.TenderEMDAmount ?? 0) : "0");
    fd.append("TenderSubmissionDate", isTender ? (formData.TenderSubmissionDate ?? "") : "");
    fd.append("TenderEMDPaymentMode", isTender ? (formData.TenderEMDPaymentMode ?? "") : "");
    fd.append("TenderEMDChequeNumber", isTender ? (formData.TenderEMDChequeNumber ?? "") : "");
    fd.append("TenderEMDPayorderRemark", isTender ? (formData.TenderEMDPayorderRemark ?? "") : "");

    if (isTender) {
      tenderAmountChequeNumberFiles.forEach((file) => {
        if (file instanceof File) {
          fd.append("TenderAmountChequeNumberURL", file);
        }
      });

      tenderEMDChequeNumberFiles.forEach((file) => {
        if (file instanceof File) {
          fd.append("TenderEMDChequeNumberURL", file);
        }
      });
    }

    fd.append("RemoveTenderAmountChequeNumberURL", isTender ? removedTenderAmountChequeNumberUrls.join(",") : "");
    fd.append("RemoveTenderEMDChequeNumberURL", isTender ? removedTenderEMDChequeNumberUrls.join(",") : "");

    return fd;
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

          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          navigate("/building");

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

      Number(buildingId ?? 0) === 0 ? 'Add Building' : 'Update Building'
    )

  };

  //#endregion
  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
        <form onSubmit={handleSubmit}>
          {/* ============================================================= [BASIC BUILDING DETAILS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">Building Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Building Name"
                  value={formData.BuildingName}
                  required
                  onChange={e => handleFieldChange('BuildingName', e.target.value)}
                  error={errors.BuildingName}
                  maxLength={150}
                  placeholder="Enter Building Name"
                />

              </div>
              <div>
                <Input
                  value={formData.CTSNumber}
                  label="CTS Number"
                  required
                  onChange={e => handleFieldChange('CTSNumber', e.target.value)}
                  error={errors.CTSNumber}
                  maxLength={150}
                  placeholder="Enter CTS Number"
                />
              </div>
              <div>

                <SinglePageSelection
                  label="Road Width"
                  placeholder="Select Road Width"
                  required
                  value={formData.RoadWidth}
                  onChange={(e) => handleFieldChange('RoadWidth', String(e))}
                  options={ROAD_WIDTH.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errors.RoadWidth}
                />
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
                  value={formData.GoogleLocation}
                  label="Google Location"
                  required
                  onChange={e => handleFieldChange('GoogleLocation', filterGoogleMapsUrl(e.target.value))}
                  error={errors.GoogleLocation}
                  rightIcon={<MapPin className="w-4 h-4" />}
                  placeholder="Enter Google Location"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Building Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>

                <SinglePageSelection
                  required
                  label="Category"
                  placeholder="Select Category"
                  value={formData.Category}
                  error={errors.Category}

                  onChange={(item) => {

                    if (!item) {

                      handleFieldChange('Category', '');
                      handleFieldChange('TenderAmount', 0);
                      handleFieldChange('TenderPurchaseStartDate', null);
                      handleFieldChange('TenderPurchaseEndDate', null);
                      handleFieldChange('TenderAmountPaymentMode', "");
                      handleFieldChange('TenderAmountChequeNumber', "");
                      if (tenderAmountChequeNumberURL) {
                        setRemovedTenderAmountChequeNumberUrls(prev => [...prev, tenderAmountChequeNumberURL]);
                      }
                      setTenderAmountChequeNumberFiles([]);
                      setTenderAmountChequeNumberURL("");
                      handleFieldChange('TenderAmountPayorderRemark', "");

                      handleFieldChange('TenderEMDAmount', 0);
                      handleFieldChange('TenderSubmissionDate', null);
                      handleFieldChange('TenderEMDPaymentMode', "");
                      handleFieldChange('TenderEMDChequeNumber', "");
                      if (tenderEMDChequeNumberURL) {
                        setRemovedTenderEMDChequeNumberUrls(prev => [...prev, tenderEMDChequeNumberURL]);
                      }
                      setTenderEMDChequeNumberFiles([]);
                      setTenderEMDChequeNumberURL("");
                      handleFieldChange('TenderEMDPayorderRemark', "");

                      return;
                    }

                    handleFieldChange('Category', String(item));
                    handleFieldChange('TenderAmount', 0);
                    handleFieldChange('TenderPurchaseStartDate', null);
                    handleFieldChange('TenderPurchaseEndDate', null);
                    handleFieldChange('TenderAmountPaymentMode', "");
                    handleFieldChange('TenderAmountChequeNumber', "");
                    if (tenderAmountChequeNumberURL) {
                      setRemovedTenderAmountChequeNumberUrls(prev => [...prev, tenderAmountChequeNumberURL]);
                    }
                    setTenderAmountChequeNumberFiles([]);
                    setTenderAmountChequeNumberURL("");
                    handleFieldChange('TenderAmountPayorderRemark', "");

                    handleFieldChange('TenderEMDAmount', 0);
                    handleFieldChange('TenderSubmissionDate', null);
                    handleFieldChange('TenderEMDPaymentMode', "");
                    handleFieldChange('TenderEMDChequeNumber', "");
                    if (tenderEMDChequeNumberURL) {
                      setRemovedTenderEMDChequeNumberUrls(prev => [...prev, tenderEMDChequeNumberURL]);
                    }
                    setTenderEMDChequeNumberFiles([]);
                    setTenderEMDChequeNumberURL("");
                    handleFieldChange('TenderEMDPayorderRemark', "");

                  }}

                  options={PROJECT_CATEGORY.map(opt => ({ label: opt.name, value: opt.id }))}
                />

              </div>

            </div>

          </div>

          {formData.Category?.toUpperCase() === "TENDER" && (
            <>
              <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Tender Amount Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <div>
                    <Input
                      label="Amount (₹)"
                      required
                      type="text"
                      value={formData.TenderAmount || ''}
                      onChange={(e) => handleFieldChange('TenderAmount', filterNumbersWithDecimal(e.target.value) || 0)}
                      placeholder="Enter Amount (₹)"
                      error={errors.TenderAmount}
                    />
                  </div>
                  <div>
                    <DatePickerInput
                      required
                      label="Purchase Start Date"
                      value={formatDate_dd_mm_yyyy(formData.TenderPurchaseStartDate)}
                      onChange={(val) => handleFieldChange('TenderPurchaseStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                      error={errors.TenderPurchaseStartDate}
                    />
                  </div>

                  <div>
                    <DatePickerInput
                      required
                      label="Purchase End Date"
                      value={formatDate_dd_mm_yyyy(formData.TenderPurchaseEndDate)}
                      error={errors.TenderPurchaseEndDate}
                      onChange={(val) => handleFieldChange('TenderPurchaseEndDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                    />
                  </div>
                  <div>

                    <SinglePageSelection
                      label="Payment Mode"
                      placeholder="Select Payment Mode"
                      value={formData.TenderAmountPaymentMode}
                      onChange={(val) => handleFieldChange('TenderAmountPaymentMode', String(val))}
                      options={TENDER_PAYMENT_MODE.map(opt => ({ label: opt.name, value: opt.id }))}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      label='Transaction / Cheque / Demand Draft No'
                      value={formData.TenderAmountChequeNumber ?? ""}
                      onChange={(e) => handleFieldChange("TenderAmountChequeNumber", e.target.value)}
                      placeholder="Enter Transaction / Cheque / Demand Draft No"
                      maxLength={15}
                      error={errors.TenderAmountChequeNumber}
                    />
                  </div>
                  <div>
                    <MultiFilePicker
                      label="Transaction / Cheque / Demand Draft Image"
                      placeholder="Select Transaction / Cheque / Demand Draft Image"
                      error={errors.TenderAmountChequeNumberURL}
                      value={tenderAmountChequeNumberFiles}
                      onChange={setTenderAmountChequeNumberFiles}
                      availableFilesURL={tenderAmountChequeNumberURL ?? ""}
                      allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                      maxFiles={5}
                      onRemoveExisting={(url) => {
                        setRemovedTenderAmountChequeNumberUrls((prev) => [...prev, url])
                      }}
                    />
                  </div>


                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div>
                    <TextArea
                      label="Payorder Remark"
                      placeholder="Enter Payorder Remark"
                      className="thin-scroll"
                      value={formData.TenderAmountPayorderRemark}
                      onChange={(e) => handleFieldChange("TenderAmountPayorderRemark", e.target.value)}
                      error={errors.TenderAmountPayorderRemark} />
                  </div>
                </div>

              </div>

              <div className="space-y-4 pt-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Tender EMD Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Input
                      label="EMD Amount (₹)"
                      type="text"
                      value={formData.TenderEMDAmount || ''}
                      onChange={(e) => handleFieldChange('TenderEMDAmount', filterNumbersWithDecimal(e.target.value) || 0)}
                      placeholder="Enter Tender EMD Amount (₹)"
                    />
                  </div>

                  <div>
                    <DatePickerInput
                      label="Submission Date"
                      value={formatDate_dd_mm_yyyy(formData.TenderSubmissionDate)}
                      onChange={(val) => handleFieldChange('TenderSubmissionDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                    />
                  </div>
                  <div>

                    <SinglePageSelection
                      label="Payment Mode"
                      placeholder="Select Payment Mode"
                      value={formData.TenderEMDPaymentMode}
                      onChange={(val) => handleFieldChange('TenderEMDPaymentMode', String(val))}
                      options={TENDER_PAYMENT_MODE.map(opt => ({ label: opt.name, value: opt.id }))}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      label='Transaction / Cheque / Demand Draft No'
                      value={formData.TenderEMDChequeNumber ?? ""}
                      onChange={(e) => handleFieldChange("TenderEMDChequeNumber", e.target.value)}
                      placeholder="Enter Transaction / Cheque / Demand Draft No"
                      maxLength={15}
                      error={errors.TendorEMDChequeNumber}
                    />
                  </div>
                  <div>
                    <MultiFilePicker
                      label="Transaction / Cheque / Demand Draft Image"
                      placeholder="Select Transaction / Cheque / Demand Draft Image"
                      error={errors.TenderEMDChequeNumberURL}
                      value={tenderEMDChequeNumberFiles}
                      onChange={setTenderEMDChequeNumberFiles}
                      availableFilesURL={tenderEMDChequeNumberURL ?? ""}
                      allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                      maxFiles={5}
                      onRemoveExisting={(url) => {
                        setRemovedTenderEMDChequeNumberUrls((prev) => [...prev, url])
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div>
                    <TextArea
                      label="Payorder Remark"
                      placeholder="Enter Payorder Remark"
                      className="thin-scroll"
                      value={formData.TenderEMDPayorderRemark}
                      onChange={(e) => handleFieldChange("TenderEMDPayorderRemark", e.target.value)}
                      error={errors.TenderEMDPayorderRemark} />
                  </div>
                </div>
              </div>
            </>

          )}
          {/* ============================================================= [PROPERTY INFORMATION] ============================================================================================= */}
          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>
                <Input
                  value={formData.TotalPlotAreaSqMt ?? ''}
                  label="Total Plot Area (SqMt)"
                  required
                  error={errors.TotalPlotAreaSqMt}
                  placeholder="Enter Total Plot Area"
                  maxLength={9}
                  onChange={e => handleFieldChange('TotalPlotAreaSqMt', filterNumbersWithDecimal(e.target.value) || 0)}
                  rightIcon="SqMt"
                />
              </div>
              <div>
                <Input
                  value={formData.TotalPlotAreaSqFt ?? ''}
                  label="Total Plot Area (SqFt)"
                  error={errors.TotalPlotAreaSqFt}
                  placeholder="Enter Total Plot Area"
                  onChange={e => handleFieldChange('TotalPlotAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  rightIcon="SqFt"
                />
              </div>
              <div>
                <Input
                  value={formData.TotalUnitsAreaUtilizedSqFt ?? ''}
                  label="Utilized Units Area (SqFt)"
                  placeholder="Enter Utilized Units Area"
                  rightIcon="SqFt"
                  error={errors.TotalUnitsAreaUtilizedSqFt}
                  onChange={e => handleFieldChange('TotalUnitsAreaUtilizedSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                />
              </div>
              <div>
                <Input
                  value={formData.TotalNumberOfUnits ?? ''}
                  label="Total Units"
                  maxLength={9}
                  placeholder="Enter Total Units"
                  error={errors.TotalNumberOfUnits}
                  onChange={e => handleFieldChange('TotalNumberOfUnits', filterNumbersWithDecimal(e.target.value) || 0)}
                />
              </div>
              <div>
                <Input
                  value={formData.NumberOfFloors ?? ''}
                  label="Number Of Floors"
                  maxLength={9}
                  placeholder="Enter Number Of Floors"
                  error={errors.NumberOfFloors}
                  onChange={e => handleFieldChange('NumberOfFloors', Number(filterNumbers(e.target.value) || 0))}
                />
              </div>
              <div>
                <Input
                  value={formData.NumberOfWings ?? ''}
                  label="Number Of Wings"
                  maxLength={9}
                  placeholder="Enter Number Of Wings"
                  error={errors.NumberOfWings}
                  onChange={e => handleFieldChange('NumberOfWings', Number(filterNumbers(e.target.value) || 0))}
                />
              </div>
            </div>
            <div className="space-y-4 pt-5">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">FSI / TDR Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    value={formData.PropertyAgeYears ?? ''}
                    label="Property Age (Years)"
                    placeholder="Enter Property Age (Years)"
                    error={errors.PropertyAgeYears}
                    maxLength={20}
                    onChange={e => handleFieldChange('PropertyAgeYears', filterNumbersWithDecimal(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Input
                    value={formData.FSI_TDR_UtilizationSqFt ?? ''}
                    label="FSI / TDR Utilization (SqFt)"
                    maxLength={9}
                    placeholder="Enter FSI / TDR Utilization"
                    error={errors.FSI_TDR_UtilizationSqFt}
                    rightIcon="SqFt"
                    onChange={e => handleFieldChange('FSI_TDR_UtilizationSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-5">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Checkbox
                  label="Garden"
                  checked={formData.IsGarden === true}
                  onChange={(e) => handleFieldChange('IsGarden', e.target.checked ? true : false)}
                />

                <Checkbox
                  label="Religious Structure"
                  checked={formData.IsReligiousStructure === true}
                  onChange={(e) => handleFieldChange('IsReligiousStructure', e.target.checked ? true : false)}
                />

                <Checkbox
                  label="Litigation"
                  checked={formData.IsLitigation === true}
                  onChange={(e) => handleFieldChange('IsLitigation', e.target.checked ? true : false)}
                />


                <div>
                  <Input
                    value={formData.IsGarden === true ? (formData.TotalGardenAreaSqFt ?? '') : ''}
                    label="Garden Area (SqFt)"
                    required={formData.IsGarden === true ? true : false}
                    placeholder="Garden Area"
                    maxLength={9}
                    onChange={e => handleFieldChange('TotalGardenAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                    error={errors.TotalGardenAreaSqFt}
                    rightIcon="SqFt"
                    disabled={formData.IsGarden === true ? false : true}
                  />
                </div>

                <div>
                  <Input
                    value={formData.IsReligiousStructure === true ? (formData.TotalReligiousStructureAreaSqFt ?? '') : ''}
                    label="Religious Structure Area (SqFt)"
                    required={formData.IsReligiousStructure === true ? true : false}
                    placeholder="Religious Structure Area"
                    maxLength={9}
                    onChange={e => handleFieldChange('TotalReligiousStructureAreaSqFt', filterNumbersWithDecimal(e.target.value) || 0)}
                    error={errors.TotalReligiousStructureAreaSqFt}
                    rightIcon="SqFt"
                    disabled={formData.IsReligiousStructure === true ? false : true}
                  />
                </div>

                <div>
                  <TextArea
                    label="Litigation Remarks"
                    required={formData.IsLitigation === true ? true : false}
                    placeholder="Enter Litigation Remarks"
                    className='thin-scroll'
                    value={formData.IsLitigation === true ? (formData.LitigationRemarks ?? '') : ''}
                    error={errors.LitigationRemarks}
                    onChange={(e) => handleFieldChange("LitigationRemarks", e.target.value)}
                    disabled={formData.IsLitigation === true ? false : true}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* ============================================================= [LOCATION] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Location</h3>
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
                      setSelectedWardId(null);
                      setSelectedVillageId(null);

                      handleFieldChange('CountryMasterId', 0);
                      handleFieldChange('StateMasterId', 0);
                      handleFieldChange('DistrictMasterId', 0);
                      handleFieldChange('CityMasterId', 0);
                      handleFieldChange('WardMasterId', 0);
                      handleFieldChange('VillageMasterId', 0);

                      return;
                    }

                    const id = Number(item);

                    setSelectedCountryId(id);
                    setSelectedStateId(null);
                    setSelectedDistrictId(null);
                    setSelectedCityId(null);
                    setSelectedWardId(null);
                    setSelectedVillageId(null);

                    handleFieldChange('CountryMasterId', id);
                    handleFieldChange('StateMasterId', 0);
                    handleFieldChange('DistrictMasterId', 0);
                    handleFieldChange('CityMasterId', 0);
                    handleFieldChange('WardMasterId', 0);
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
                      setSelectedWardId(null);
                      setSelectedVillageId(null);

                      handleFieldChange("StateMasterId", 0);
                      handleFieldChange("DistrictMasterId", 0);
                      handleFieldChange("CityMasterId", 0);
                      handleFieldChange('WardMasterId', 0);
                      handleFieldChange('VillageMasterId', 0);

                      return;
                    }

                    const id = Number(item);

                    setSelectedStateId(id);
                    setSelectedDistrictId(null);
                    setSelectedCityId(null);
                    setSelectedWardId(null);
                    setSelectedVillageId(null);

                    handleFieldChange("StateMasterId", id);
                    handleFieldChange("DistrictMasterId", 0);
                    handleFieldChange("CityMasterId", 0);
                    handleFieldChange('WardMasterId', 0);
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
                      setSelectedWardId(null);
                      setSelectedVillageId(null);

                      handleFieldChange('DistrictMasterId', 0);
                      handleFieldChange('CityMasterId', 0);
                      handleFieldChange('WardMasterId', 0);
                      handleFieldChange('VillageMasterId', 0);
                      return;
                    }

                    const id = Number(item);

                    setSelectedDistrictId(id);
                    setSelectedCityId(null);
                    setSelectedWardId(null);
                    setSelectedVillageId(null);

                    handleFieldChange('DistrictMasterId', id);
                    handleFieldChange('CityMasterId', 0);
                    handleFieldChange('WardMasterId', 0);
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

              <div>

                <SinglePageSelection
                  label='Ward'
                  placeholder="Select Ward"
                  required
                  value={selectedWardId ?? ''}
                  error={errors.WardMasterId}
                  onChange={(item) => {

                    if (!item) {
                      setSelectedWardId(null);
                      handleFieldChange('WardMasterId', 0);
                      return;
                    }

                    const id = Number(item);

                    setSelectedWardId(id);
                    handleFieldChange('WardMasterId', id);
                  }}
                  disabled={!selectedDistrictId || wardOptions.length === 0}
                  options={wardOptions}
                />

              </div>
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.BuildingId ? "Update" : "Add"}
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
