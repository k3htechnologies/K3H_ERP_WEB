import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { TextArea } from "@/ui/components/forms/Textarea";
import { Button } from "@/ui/components/forms/Button";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import { Loader } from "@/core/utils/loader";
import { useToast } from "@/core/hooks/useToast";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import { vendorService } from "@/features/vendor/services/VendorService";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { runApiWithLoader } from "@/core/utils";
import { filterEmail, filterPAN, filterGST, filterAadhaar, isValidEmail, isValidMobile, isValidPAN, isValidGST, isValidAadhaar, hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { FIRMS_TYPE_OPTIONS, VENDOR_TYPE_OPTIONS } from "@/core/constants/staticData";
import type { AddUpdateVendorRequest, FilterWithPaginationVendorRequest } from "../models/VendorModel";
import type { FilterWithPaginationMaterialSubMaterialMasterUOM, MaterialSubMaterialUOM } from "@/features/technical/models/TechnicalModel";
import * as E from "fp-ts/Either";
import { useEffect, useState, useCallback, useMemo } from "react";
import React from "react";
import { Tabs } from "@/ui/components/Tab/Tab";
import { Trash2, Plus, Search, IdCard, Mail } from "lucide-react";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { checkDuplicateField } from "@/core/utils/duplicateValidation";
import MobileNumberInput from "@/ui/components/forms/MobileNumberInput";

const initialFormState = (): AddUpdateVendorRequest => ({
  VendorId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  VendorType: '',
  CompanyName: "",
  CompanyType: "",
  VendorName: "",
  MobileNumberCountryCode: "+91",
  MobileNumber: "",
  EmailId: "",
  AadharCardNumber: "",
  AadharCardURL: null,
  RemoveAadharCardURL: "",
  PanCardNumber: "",
  PanCardURL: null,
  RemovePanCardURL: "",
  GSTNumber: "",
  GSTCertificateURL: null,
  RemoveGSTCertificateURL: "",
  Address: "",
  CountryMasterId: 0,
  StateMasterId: 0,
  DistrictMasterId: 0,
  CityMasterId: 0,
  AvailableMaterialList: "",
  AvailableContractList: "",
  MagicLinkUniquekey: null,
  ClientRegistrationId: 0,
});

export const AddUpdateVendor: React.FC = () => {

  const [formData, setFormData] = useState<AddUpdateVendorRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [activeTab, setActiveTab] = useState("material");
  const [materialsubmaterialList, setMaterialSubMaterialList] = useState<MaterialSubMaterialUOM[]>([]);
  const [searchMaterial, setSearchMaterial] = useState<string>("");
  const [selectedMaterials, setSelectedMaterials] = useState<Set<number>>(new Set());

  const [gstGSTCertificateFiles, setGSTCertificateFiles] = useState<(File | string)[]>([]);
  const [removedGSTCertificateUrls, setRemovedGSTCertificateUrls] = useState<string[]>([]);
  const [gSTCertificateURL, setGSTCertificateURL] = useState<string>();

  const [panCardURLFiles, setPANCardURLFiles] = useState<(File | string)[]>([]);
  const [removedPanCardUrls, setRemovedPanCardUrls] = useState<string[]>([]);
  const [panCardURL, setPanCardURL] = useState<string>();

  const [aadharCardURLFiles, setAadharCardURLFiles] = useState<(File | string)[]>([]);
  const [removedAadharCardUrls, setRemovedAadharCardUrls] = useState<string[]>([]);
  const [aadharCardURL, setAadharCardURL] = useState<string>();

  const navigate = useNavigate();

  const { vendorId } = useParams<{ vendorId?: string }>();

  const { addToast } = useToast();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { canAction } = useMenuPermissions('/vendor');

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



  const handleFieldChange = (field: keyof AddUpdateVendorRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {

    if (vendorId) {

      fetchVendorData();
      return;
    }

    setSelectedCountryId(1);
    handleFieldChange('CountryMasterId', 1);
  }, [vendorId]);


  useEffect(() => {
    if (activeTab === "material" && materialsubmaterialList.length === 0) {
      loadMaterialsSubMaterialMasterUOM();
    }
  }, [activeTab, materialsubmaterialList.length]);

  const fetchVendorData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationVendorRequest = {
          PageNumber: 1,
          PageSize: 1,
          VendorId: Number(vendorId),
          IsCheckPermission: true,
        };

        const response = await vendorService.apiCallPullVendor(params);

        if (E.isRight(response)) {

          const row = response.right.Data[0];

          if (row) {
            setFormData((prev) => ({

              ...prev,
              VendorId: row.VendorId ?? prev.VendorId,
              Uniquekey: row.Uniquekey ?? prev.Uniquekey,
              VendorType: row.VendorType ?? prev.VendorType,
              CompanyName: row.CompanyName ?? prev.CompanyName,
              CompanyType: row.CompanyType ?? prev.CompanyType,
              VendorName: row.VendorName ?? prev.VendorName,
              MobileNumberCountryCode: row.MobileNumberCountryCode ?? prev.MobileNumberCountryCode,
              MobileNumber: row.MobileNumber ?? prev.MobileNumber,
              EmailId: row.EmailId ?? prev.EmailId,
              AadharCardNumber: row.AadharCardNumber ?? prev.AadharCardNumber,
              AadharCardURL: null,
              RemoveAadharCardURL: "",
              PanCardNumber: row.PanCardNumber ?? prev.PanCardNumber,
              PanCardURL: null,
              RemovePanCardURL: "",
              GSTNumber: row.GSTNumber ?? prev.GSTNumber,
              GSTCertificateURL: null,
              RemoveGSTCertificateURL: "",
              Address: row.Address ?? prev.Address,
              CountryMasterId: row.CountryMasterId ?? prev.CountryMasterId,
              StateMasterId: row.StateMasterId ?? prev.StateMasterId,
              DistrictMasterId: row.DistrictMasterId ?? prev.DistrictMasterId,
              CityMasterId: row.CityMasterId ?? prev.CityMasterId,
              AvailableMaterialList: row.AvailableMaterialList ?? prev.AvailableMaterialList,
              AvailableContractList: row.AvailableContractList ?? prev.AvailableContractList,
              MagicLinkUniquekey: row.MagicLinkURL ?? prev.MagicLinkUniquekey,
              ClientRegistrationId: prev.ClientRegistrationId,

            }));
            setPANCardURLFiles([]);
            setPanCardURL(row.PanCardURL)
            setRemovedPanCardUrls([]);

            setAadharCardURLFiles([]);
            setAadharCardURL(row.AadharCardURL)
            setRemovedAadharCardUrls([]);

            setGSTCertificateFiles([]);
            setGSTCertificateURL(row.GSTCertificateURL)
            setRemovedGSTCertificateUrls([]);

            // Set location dropdowns
            setSelectedCountryId(row.CountryMasterId ?? null);
            setSelectedStateId(row.StateMasterId ?? null);
            setSelectedDistrictId(row.DistrictMasterId ?? null);
            setSelectedCityId(row.CityMasterId ?? null);
          }
          // Initialize selected materials from existing data
          if (row.AvailableMaterialList) {
            const materialIds = row.AvailableMaterialList.split(",")
              .map((id) => Number(id.trim()))
              .filter((id) => !isNaN(id) && id > 0);
            setSelectedMaterials(new Set(materialIds));
          }
        }

        return response;
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Failed to load vendor data";
        addToast({ type: "error", title: errorMessage });
      },
      undefined,
      "Loading Vendor"
    );
  };

  const loadMaterialsSubMaterialMasterUOM = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const employeeData = LocalStorageHelper.getStoredEmployeeData();
        const projectId = employeeData?.ProjectData?.[0]?.ProjectId ?? 0;
        const ClientRegistrationId = Number(employeeData?.ClientRegistrationId);

        const params: FilterWithPaginationMaterialSubMaterialMasterUOM = {
          ProjectId: projectId,
          ClientRegistrationId: ClientRegistrationId
        };

        const apiResponse = await technicalService.apiCallMaterialSubMaterialMasterUOMList(params);

        if (E.isRight(apiResponse)) {

          setMaterialSubMaterialList(apiResponse.right.Data.MaterialMasterSubMaterialMasterData);

        } else {

          addToast({ type: "error", title: "Error Fetching material list" });
        }
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Failed to load vendor data";
        addToast({ type: "error", title: errorMessage });
      },
      undefined,
      "Loading Data"
    );
  };

  const validateAddVendorForm = (): {

    isValid: boolean;

    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.VendorType?.trim()) {
      newErrors.VendorType = "Vendor Type is required";
    }

    if (!formData.VendorName?.trim()) {
      newErrors.VendorName = "Vendor name is required";
    }

    if (!formData.CompanyName?.trim()) {
      newErrors.CompanyName = "Company name is required";
    }

    if (!formData.MobileNumber?.trim()) {
      newErrors.MobileNumber = "Mobile Number is required";
    } else if (!isValidMobile(formData.MobileNumber.trim(), formData.MobileNumberCountryCode!)) {
      newErrors.MobileNumber = "Enter a Valid mobile number";
    }

    if (formData.MobileNumberCountryCode !== "+91" && formData.EmailId.trim() === "") {
      newErrors.EmailId = "E-Mail ID is mandatory";
    }

    if (!formData.EmailId?.trim()) {
      newErrors.EmailId = "E-Mail ID is required.";
    } else if (!isValidEmail(formData.EmailId?.trim())) {
      newErrors.EmailId = "Enter a valid E-Mail ID";
    }

    if (!formData.CompanyType?.trim()) {
      newErrors.CompanyType = "Company type is required";
    }

    if (!formData.Address?.trim()) {
      newErrors.Address = "Address is required";
    } else if (formData.Address.trim().length < 25) {
      newErrors.Address = "Address must be at least 25 characters long.";
    }

    if (!formData.CountryMasterId) {
      newErrors.CountryMasterId = "Country is required.";
    }
    if (!formData.StateMasterId) {
      newErrors.StateMasterId = "State is required.";
    }
    if (!formData.DistrictMasterId) {
      newErrors.DistrictMasterId = "District is required.";
    }

    if (!formData.CityMasterId) {
      newErrors.CityMasterId = "City is required.";
    }

    if (!formData.AadharCardNumber?.trim()) {
      newErrors.AadharCardNumber = "Please enter a valid 12-digit Aadhaar number";
    } else if (!isValidAadhaar(formData.AadharCardNumber.trim())) {
      newErrors.AadharCardNumber = "Enter a valid Aadhar Card Number.";
    }

    if (!formData.GSTNumber?.trim()) {
      newErrors.GSTNumber = "GST Number is required.";
    }
    else if (!isValidGST(formData.GSTNumber?.trim())) {
      newErrors.GSTNumber = "Enter a valid GST Number.";
    }

    if (!formData.PanCardNumber?.trim()) {
      newErrors.PanCardNumber = "PAN Number is required.";
    } else if (!isValidPAN(formData.PanCardNumber?.trim())) {
      newErrors.PanCardNumber = "Enter a valid PAN Number.";
    }

    if (!hasAnyDocumentFile(aadharCardURLFiles, aadharCardURL, removedAadharCardUrls)) {
      newErrors.AadharCardURL = "Aadhaar card file is required.";
    }

    if (!hasAnyDocumentFile(panCardURLFiles, panCardURL, removedPanCardUrls)) {
      newErrors.PanCardURL = "PAN card file is required.";
    }

    if (!hasAnyDocumentFile(gstGSTCertificateFiles, gSTCertificateURL, removedGSTCertificateUrls)) {
      newErrors.GSTCertificateURL = "GST certificate file is required.";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const PushVendorFormData = (): FormData => {

    const materialIds = Array.from(selectedMaterials).join(",");

    const fd = new FormData();

    fd.append('VendorId', String(formData.VendorId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6');
    fd.append('VendorType', formData.VendorType?.trim() || '');
    fd.append('CompanyName', formData.CompanyName?.trim() || '');
    fd.append('CompanyType', formData.CompanyType?.trim() || '');
    fd.append('VendorName', formData.VendorName?.trim() || '');
    fd.append("MobileNumberCountryCode", formData.MobileNumberCountryCode ?? "");
    fd.append('MobileNumber', formData.MobileNumber?.trim() || '');
    fd.append('EmailId', formData.EmailId?.trim() || '');
    fd.append('AadharCardNumber', formData.AadharCardNumber?.trim() || '');
    fd.append('PanCardNumber', formData.PanCardNumber?.trim() || '');
    fd.append('GSTNumber', formData.GSTNumber?.trim() || '');
    fd.append('Address', formData.Address?.trim() || '');
    fd.append('CountryMasterId', String(formData.CountryMasterId ?? 0));
    fd.append('StateMasterId', String(formData.StateMasterId ?? 0));
    fd.append('DistrictMasterId', String(formData.DistrictMasterId ?? 0));
    fd.append('CityMasterId', String(formData.CityMasterId ?? 0));
    fd.append('AvailableMaterialList', materialIds);
    fd.append('AvailableContractList', formData.AvailableContractList || '');

    aadharCardURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append('AadharCardURL', file);
      }
    });
    fd.append('RemoveAadharCardURL', removedAadharCardUrls.join(','));

    panCardURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append('PanCardURL', file);
      }
    });
    fd.append('RemovePanCardURL', removedPanCardUrls.join(','));


    gstGSTCertificateFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append('GSTCertificateURL', file);
      }
    });

    fd.append('RemoveGSTCertificateURL', removedGSTCertificateUrls.join(','));

    return fd;
  }


  const handleAddMaterial = useCallback((SubMaterialdata: MaterialSubMaterialUOM) => {
    const materialId = SubMaterialdata.SubMaterialMasterId;

    setSelectedMaterials((prev) => {

      const newSet = new Set(prev);

      if (newSet.has(materialId)) {
        newSet.delete(materialId);
      } else {
        newSet.add(materialId);
      }

      return newSet;
    });
  },
    []
  );

  const filteredMaterialList = useMemo(() => {

    if (!searchMaterial.trim()) return materialsubmaterialList;

    const searchLower = searchMaterial.toLowerCase();

    return materialsubmaterialList.filter((item) =>

      item.SubMaterialName?.toLowerCase().includes(searchLower) ||

      item.MaterialName?.toLowerCase().includes(searchLower)

    );
  }, [materialsubmaterialList, searchMaterial]);



  const handleSubmit = async () => {
    setErrors({})


    const validation = validateAddVendorForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    if (formData.VendorType.toUpperCase() === "VENDOR" || formData.VendorType.toUpperCase() === "BOTH" && selectedMaterials.size === 0) {
      addToast({ type: "error", title: "Please select at least one material" });
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const formDataToSubmit = PushVendorFormData();

        const response = await vendorService.apiCallAddUpdateVendor(formDataToSubmit);

        if (E.isRight(response)) {

          addToast({ type: "success", title: formData.VendorId ? "Vendor updated successfully" : "New Vendor added successfully" });

          navigate("/vendor");

        } else {

          addToast({ type: "error", title: response.left?.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Operation failed' })
      },
      undefined,
      formData.VendorId ? "Updating Vendor" : "Add Vendor"
    );
  };

  const checkDuplicateMobileNumber = async (mobileNumber: string, countryCode: string) => {

    if (Number(formData.VendorId) > 0) {
      return;
    }

    if (!isValidMobile(mobileNumber, countryCode)) {
      return;
    }

    const isDuplicate = await checkDuplicateField({

      fieldName: "MobileNumber",

      fieldValue: mobileNumber,

      apiCallback: vendorService.apiCallPullVendor,

      extraParams: { MobileNumberCountryCode: countryCode }
    });

    if (isDuplicate) {

      setErrors((prev) => ({
        ...prev,
        MobileNumber: "Mobile number already exists"
      }));

    } else {

      setErrors((prev) => ({
        ...prev,
        MobileNumber: ""
      }));
    }
  };

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}><div></div> </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

        {/* ============================================================= [BASIC VENDOR DETAILS] ============================================================================================= */}
        <div className="space-y-4 pb-3">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
            Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SinglePageSelection
              label="Vendor Type"
              placeholder="Select Vendor Type"
              required
              value={formData.VendorType}
              onChange={(val) => handleFieldChange("VendorType", String(val))}
              options={VENDOR_TYPE_OPTIONS.map((opt) => ({
                label: opt.name,
                value: opt.id,
              }))}
              error={errors.VendorType}
            />

            <Input
              label="Vendor Name"
              placeholder="Enter Vendor Name"
              required
              value={formData.VendorName}
              maxLength={200}
              onChange={(e) => handleFieldChange("VendorName", e.target.value)}
              error={errors.VendorName}
            />
            <Input
              label="Company Name"
              placeholder="Enter Company Name"
              required
              maxLength={200}
              value={formData.CompanyName}
              onChange={(e) => handleFieldChange("CompanyName", e.target.value)}
              error={errors.CompanyName}
            />

            <MobileNumberInput
              mobileNumber={formData.MobileNumber ?? ""}
              countryCode={formData.MobileNumberCountryCode ?? "+91"}
              disabled={Number(formData.VendorId) > 0}
              required
              error={errors.MobileNumber}
              onMobileChange={async (value) => {

                handleFieldChange("MobileNumber", value);

                await checkDuplicateMobileNumber(value, formData.MobileNumberCountryCode || "+91");
              }}
              onCountryCodeChange={(value) =>
                handleFieldChange("MobileNumberCountryCode", value)
              }
            />
            <Input
              label="E-Mail ID"
              placeholder="Enter E-Mail ID"
              required
              type="email"
              rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
              value={formData.EmailId}
              onChange={(e) => handleFieldChange("EmailId", filterEmail(e.target.value))}
              error={errors.EmailId}
            />
            <SinglePageSelection
              label="Company Type"
              placeholder="Select Company Type"
              required
              value={formData.CompanyType}
              onChange={(val) => handleFieldChange("CompanyType", String(val))}
              options={FIRMS_TYPE_OPTIONS.map((opt) => ({
                label: opt.name,
                value: opt.id,
              }))}
              error={errors.CompanyType}
            />
          </div>
        </div>

        {/* GOVERNMENT IDENTIFIERS */}
        <div className="space-y-4 pb-3">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
            Government Identifiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Aadhaar Card Number"
              required
              value={formData.AadharCardNumber}
              rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
              onChange={(e) => handleFieldChange("AadharCardNumber", filterAadhaar(e.target.value))}
              placeholder="Enter Aadhaar Card Number"
              error={errors.AadharCardNumber}
            />

            <MultiFilePicker
              label='Aadhaar Card'
              placeholder="Select Aadhaar Card"
              required
              error={errors.AadharCardURL}
              value={aadharCardURLFiles}
              onChange={setAadharCardURLFiles}
              availableFilesURL={aadharCardURL ?? ""}
              allowedTypes={[
                "image/jpeg",
                "image/png",
                "application/pdf",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              ]}
              maxFiles={5}
              onRemoveExisting={(url) => {
                setRemovedAadharCardUrls((prev) => [...prev, url])
              }}
            />

            <Input
              label="PAN Card Number"
              required
              value={formData.PanCardNumber}
              rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
              onChange={(e) => handleFieldChange("PanCardNumber", filterPAN(e.target.value))}
              placeholder="Enter PAN Card Number"
              error={errors.PanCardNumber}
            />
            <MultiFilePicker
              label='PAN Card'
              placeholder="Select PAN Card"
              required
              error={errors.PanCardURL}
              value={panCardURLFiles}
              onChange={setPANCardURLFiles}
              availableFilesURL={panCardURL ?? ""}
              allowedTypes={[
                "image/jpeg",
                "image/png",
                "application/pdf",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              ]}
              maxFiles={5}
              onRemoveExisting={(url) => {
                setRemovedPanCardUrls((prev) => [...prev, url])
              }}
            />
            <Input
              label="GST Number"
              required
              value={formData.GSTNumber}
              rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
              onChange={(e) => handleFieldChange("GSTNumber", filterGST(e.target.value))}
              placeholder="Enter GST Number"
              error={errors.GSTNumber}
            />

            <MultiFilePicker
              label='GST Certificate'
              placeholder="Select GST Certificate"
              required
              error={errors.GSTCertificateURL}
              value={gstGSTCertificateFiles}
              onChange={setGSTCertificateFiles}
              availableFilesURL={gSTCertificateURL ?? ""}
              allowedTypes={[
                "image/jpeg",
                "image/png",
                "application/pdf",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              ]}
              maxFiles={5}
              onRemoveExisting={(url) => {
                setRemovedGSTCertificateUrls((prev) => [...prev, url])
              }}
            />
          </div>
        </div>

        {/* ADDRESS */}
        <div className="space-y-4 pb-3">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
            Address Details
          </h3>

          <TextArea
            label="Address"
            placeholder="Enter Address"
            required
            rows={3}
            className="thin-scroll"
            value={formData.Address}
            onChange={(e) => handleFieldChange("Address", e.target.value)}
            error={errors.Address}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

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

                    handleFieldChange('CountryMasterId', 0);
                    handleFieldChange('StateMasterId', 0);
                    handleFieldChange('DistrictMasterId', 0);
                    handleFieldChange('CityMasterId', 0);

                    return;
                  }

                  const id = Number(item);

                  setSelectedCountryId(id);
                  setSelectedStateId(null);
                  setSelectedDistrictId(null);
                  setSelectedCityId(null);

                  handleFieldChange('CountryMasterId', id);
                  handleFieldChange('StateMasterId', 0);
                  handleFieldChange('DistrictMasterId', 0);
                  handleFieldChange('CityMasterId', 0);
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
                label='District'
                placeholder="Select District"
                required
                value={selectedDistrictId ?? ''}
                error={errors.DistrictMasterId}
                onChange={(item) => {

                  if (!item) {
                    setSelectedDistrictId(null);
                    setSelectedCityId(null);

                    handleFieldChange('DistrictMasterId', 0);
                    handleFieldChange('CityMasterId', 0);
                    return;
                  }

                  const id = Number(item);

                  setSelectedDistrictId(id);
                  setSelectedCityId(null);

                  handleFieldChange('DistrictMasterId', id);
                  handleFieldChange('CityMasterId', 0);
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
                    handleFieldChange('CityMasterId', 0);
                    return;
                  }

                  const id = Number(item);

                  setSelectedCityId(id);
                  handleFieldChange('CityMasterId', id);
                }}
                disabled={!selectedDistrictId || cityOptions.length === 0}
                options={cityOptions}
              />

            </div>
          </div>
        </div>

        {/* MATERIAL / CONTRACT */}
        <div className="space-y-4 pb-3">
          <h3 className="text-lg font-semibold border-b border-gray-300 pb-2">
            Material and Contract Management
          </h3>

          <Tabs
            tabs={[
              { id: "material", label: "Material" },
              { id: "contract", label: "Contract" },
            ]}

            defaultActive={activeTab}
            onTabChange={(tab) => setActiveTab(tab.id)}
            islarge
            isChips
          />

          {/* Material Tab Content */}
          {activeTab === "material" && (
            <div className="space-y-4">

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 h-[400px] flex flex-col">

                <Input
                  type="text"
                  placeholder="Search By Material Name"
                  value={searchMaterial}
                  onChange={(e) => setSearchMaterial(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                />

                <div className="space-y-2 flex-1 overflow-y-auto thin-scroll">
                  {filteredMaterialList.length > 0 ? (
                    filteredMaterialList.map((item) => {

                      const isSelected = selectedMaterials.has(item.SubMaterialMasterId);
                      return (

                        <div key={item.SubMaterialMasterId} className="bg-white rounded-lg p-2 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{item.SubMaterialName}</p>
                            <p className="text-xs text-gray-500">{item.MaterialName}</p>
                          </div>

                          <Button
                            type="button"
                            color="transparent"
                            onClick={() => handleAddMaterial(item)}
                          >
                            {isSelected ? (<Trash2 className="w-4 h-4" style={{ color: "red" }} />
                            ) : (<Plus className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-400 py-12">
                      <NoDataView />
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}



          {activeTab === "contract" && (
            <div className="space-y-4">

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 h-[400px] flex flex-col">
                <Input
                  type="text"
                  placeholder="Search By Contract Name"
                  value={""}
                  onChange={() => { }}
                  disabled
                />


                <div className="flex-1 overflow-y-auto flex items-center justify-center">
                  <p className="text-center text-gray-400 py-3">
                    Contract management coming soon
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.VendorId ? "Update" : "Add"}
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

export default AddUpdateVendor;