import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { TextArea } from "@/ui/components/forms/Textarea";
import { Button } from "@/ui/components/forms/Button";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import { Loader } from "@/core/utils/loader";
import ToastContainer from "@/ui/components/Toast/ToastContainer";
import { useToast } from "@/core/hooks/useToast";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import { VendorService } from "@/features/vendor/services/VendorService";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { runApiWithLoader } from "@/core/utils";
import { filterEmail, filterMobile, filterPAN, filterGST, filterAadhaar, isValidEmail, isValidMobile, isValidPAN, isValidGST, isValidAadhaar } from "@/core/utils/fileValidation";
import { COMPANY_TYPE_OPTIONS } from "@/core/constants/staticData";
import type { AddUpdateVendorRequest, FilterWithPaginationVendorRequest } from "../models/VendorModel";
import type { FilterWithPaginationMaterialSubMaterialMasterUOM, MaterialSubMaterialUOM } from "@/features/technical/models/TechnicalModel";
import * as E from "fp-ts/Either";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import React from "react";
import { Tabs } from "@/ui/components/Tab/Tab";
import { Trash2, Plus } from "lucide-react";

type FileValue = File | string;

const initialFormState = (): AddUpdateVendorRequest => ({
  VendorId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  CompanyName: "",
  CompanyType: "",
  VendorName: "",
  MobileNumber: "",
  EmailId: "",
  AadharCardNumber: "",
  AadharCardURL: "",
  RemoveAadharCardURL: "",
  PanCardNumber: "",
  PanCardURL: "",
  RemovePanCardURL: "",
  GSTNumber: "",
  GSTCertificateURL: "",
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
  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateVendorRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState("material");
  const [materialsubmaterialList, setMaterialSubMaterialList] = useState<MaterialSubMaterialUOM[]>([]);
  const [searchMaterial, setSearchMaterial] = useState<string>("");
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<number>>(new Set());
  // const [selectedContracts, setSelectedContracts] = useState<Set<number>>(new Set()); // Reserved for future contract functionality

  // File states
  const [gstCertificateFiles, setGSTCertificateFiles] = useState<FileValue[]>([]);
  const [aadharCardFiles, setAadharCardFiles] = useState<FileValue[]>([]);
  const [panCardFiles, setPANCardFiles] = useState<FileValue[]>([]);
  // File removal tracking - computed with useMemo instead of useEffect
  const removedAadharCardUrls = useMemo(() => {
    const aadharUrls = (formData.AadharCardURL || "").split(",").filter((u) => u.trim());
    const currentAadharUrls = aadharCardFiles.filter((f) => typeof f === "string") as string[];
    return aadharUrls.filter((url) => !currentAadharUrls.includes(url));
  }, [aadharCardFiles, formData.AadharCardURL]);

  const removedPanCardUrls = useMemo(() => {
    const panUrls = (formData.PanCardURL || "").split(",").filter((u) => u.trim());
    const currentPanUrls = panCardFiles.filter((f) => typeof f === "string") as string[];
    return panUrls.filter((url) => !currentPanUrls.includes(url));
  }, [panCardFiles, formData.PanCardURL]);

  const removedGSTCertificateUrls = useMemo(() => {
    const gstUrls = (formData.GSTCertificateURL || "").split(",").filter((u) => u.trim());
    const currentGstUrls = gstCertificateFiles.filter((f) => typeof f === "string") as string[];
    return gstUrls.filter((url) => !currentGstUrls.includes(url));
  }, [gstCertificateFiles, formData.GSTCertificateURL]);

  const hasFetchedVendor = useRef(false);
  //#endregion

  // NAVIGATE
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: {
      listState?: {
        page: number;
        filters: Record<string, unknown>;
      };
    };
  };

  // GET VALUE FROM URL :VENDORID
  const { vendorId } = useParams<{ vendorId?: string }>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast();
  //#region COUNTRY STATE CITY DISTRICT
  const {
    isLoading: isLocationLoading,
    countries,
    statesByCountryId,
    districtsByStateId,
    citiesByDistrictId,
  } = useCountryStateCityDistrictVillageData();

  const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1);
  const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null);

  const countryOptions = useMemo(
    () => countries.map((c) => ({ label: c.name, value: c.id })),
    [countries]
  );

  const stateOptions = useMemo(
    () =>
      selectedCountryId != null
        ? (statesByCountryId[selectedCountryId] || []).map((s) => ({
            label: s.name,
            value: s.id,
          }))
        : [],
    [selectedCountryId, statesByCountryId]
  );

  const districtOptions = useMemo(
    () =>
      selectedStateId != null
        ? (districtsByStateId[selectedStateId] || []).map((d) => ({
            label: d.name,
            value: d.id,
          }))
        : [],
    [selectedStateId, districtsByStateId]
  );

  const cityOptions = useMemo(
    () =>
      selectedDistrictId != null
        ? (citiesByDistrictId[selectedDistrictId] || []).map((c) => ({
            label: c.name,
            value: c.id,
          }))
        : [],
    [selectedDistrictId, citiesByDistrictId]
  );
  //#endregion

  const fetchVendorData = useCallback(async () => {
    if (!vendorId) return;

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

        const response = await VendorService.apiCallPullVendor(params);

        if (E.isRight(response) && response.right.Data && response.right.Data.length > 0) {
          const vendor = response.right.Data[0];
          setFormData((prev) => ({
            ...prev,
            VendorId: vendor.VendorId ?? prev.VendorId,
            Uniquekey: vendor.Uniquekey ?? prev.Uniquekey,
            CompanyName: vendor.CompanyName ?? prev.CompanyName,
            CompanyType: vendor.CompanyType ?? prev.CompanyType,
            VendorName: vendor.VendorName ?? prev.VendorName,
            MobileNumber: vendor.MobileNumber ?? prev.MobileNumber,
            EmailId: vendor.EmailId ?? prev.EmailId,
            AadharCardNumber: vendor.AadharCardNumber ?? prev.AadharCardNumber,
            AadharCardURL: vendor.AadharCardURL ?? prev.AadharCardURL,
            RemoveAadharCardURL: "",
            PanCardNumber: vendor.PanCardNumber ?? prev.PanCardNumber,
            PanCardURL: vendor.PanCardURL ?? prev.PanCardURL,
            RemovePanCardURL: "",
            GSTNumber: vendor.GSTNumber ?? prev.GSTNumber,
            GSTCertificateURL: vendor.GSTCertificateURL ?? prev.GSTCertificateURL,
            RemoveGSTCertificateURL: "",
            Address: vendor.Address ?? prev.Address,
            CountryMasterId: vendor.CountryMasterId ?? prev.CountryMasterId,
            StateMasterId: vendor.StateMasterId ?? prev.StateMasterId,
            DistrictMasterId: vendor.DistrictMasterId ?? prev.DistrictMasterId,
            CityMasterId: vendor.CityMasterId ?? prev.CityMasterId,
            AvailableMaterialList: vendor.AvailableMaterialList ?? prev.AvailableMaterialList,
            AvailableContractList: vendor.AvailableContractList ?? prev.AvailableContractList,
            MagicLinkUniquekey: vendor.MagicLinkURL ?? prev.MagicLinkUniquekey,
            ClientRegistrationId: prev.ClientRegistrationId,
          }));

          // Set location dropdowns
          setSelectedCountryId(vendor.CountryMasterId ?? null);
          setSelectedStateId(vendor.StateMasterId ?? null);
          setSelectedDistrictId(vendor.DistrictMasterId ?? null);
          setSelectedCityId(vendor.CityMasterId ?? null);

          // Initialize selected materials from existing data
          if (vendor.AvailableMaterialList) {
            const materialIds = vendor.AvailableMaterialList.split(",")
              .map((id) => Number(id.trim()))
              .filter((id) => !isNaN(id) && id > 0);
            setSelectedMaterials(new Set(materialIds));
          }
        } else {
          const errorMessage = E.isLeft(response) ? response.left.message : "Failed to load vendor data";
          addToast({ type: "error", title: errorMessage });
          navigate("/Vendor");
        }
        return response;
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Failed to load vendor data";
        addToast({ type: "error", title: errorMessage });
      },
      undefined,
      "Loading vendor data..."
    );
  }, [vendorId, navigate, addToast]);

  //#region INITIALIZATION
  useEffect(() => {
    if (vendorId) {
      if (!hasFetchedVendor.current) {
        hasFetchedVendor.current = true;
        fetchVendorData();
      }
      return;
    }
    // create mode defaults
    setSelectedCountryId(1);
    setFormData((prev) => ({ ...prev, CountryMasterId: 1 }));
  }, [vendorId, fetchVendorData]);
  //#endregion
  const handleFieldChange = (field: keyof AddUpdateVendorRequest, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddMaterial = useCallback((SubMaterialdata: MaterialSubMaterialUOM) => {
    const materialId = SubMaterialdata.SubMaterialMasterId;
    
    // Check current state before updating
    const isCurrentlySelected = selectedMaterials.has(materialId);
    
    // Update state
    setSelectedMaterials((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlySelected) {
        newSet.delete(materialId);
      } else {
        newSet.add(materialId);
      }
      return newSet;
    });
    
    // Show toast outside state setter to prevent duplicates
    if (isCurrentlySelected) {
      addToast({
        type: "success",
        title: "Material removed",
        message: `${SubMaterialdata.SubMaterialName} has been removed`,
      });
    } else {
      addToast({
        type: "success",
        title: "Material added",
        message: `${SubMaterialdata.SubMaterialName} has been added`,
      });
    }
  }, [addToast, selectedMaterials]);

 
  const loadMaterialsSubMaterialMasterUOM = useCallback(async () => {
    if (isMaterialsLoading) return;
    
    setIsMaterialsLoading(true);
    try {
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
    } finally {
      setIsMaterialsLoading(false);
    }
  }, [isMaterialsLoading, addToast]);

  // Load materials when material tab becomes active
  useEffect(() => {
    if (activeTab === "material" && materialsubmaterialList.length === 0) {
      loadMaterialsSubMaterialMasterUOM();
    }
  }, [activeTab, materialsubmaterialList.length, loadMaterialsSubMaterialMasterUOM]);

  // Filtered material list
  const filteredMaterialList = useMemo(() => {
    if (!searchMaterial.trim()) return materialsubmaterialList;
    const searchLower = searchMaterial.toLowerCase();
    return materialsubmaterialList.filter((item) =>
      item.SubMaterialName?.toLowerCase().includes(searchLower) ||
      item.MaterialName?.toLowerCase().includes(searchLower)
    );
  }, [materialsubmaterialList, searchMaterial]);



  //#region VALIDATION
  const validateAddVendorForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    const vendorName = formData.VendorName?.trim() || "";
    if (!vendorName) {
      newErrors.VendorName = "Vendor name is required";
    }

    const companyName = formData.CompanyName?.trim() || "";
    if (!companyName) {
      newErrors.CompanyName = "Company name is required";
    }

    const mobileNumber = formData.MobileNumber?.trim() || "";
    if (!mobileNumber) {
      newErrors.MobileNumber = "Mobile number is required";
    } else if (!isValidMobile(mobileNumber)) {
      newErrors.MobileNumber = "Please enter a valid 10-digit mobile number";
    }

    const emailId = formData.EmailId?.trim() || "";
    if (!emailId) {
      newErrors.EmailId = "Email is required";
    } else if (!isValidEmail(emailId)) {
      newErrors.EmailId = "Please enter a valid email address";
    }

    const companyType = formData.CompanyType?.trim() || "";
    if (!companyType) {
      newErrors.CompanyType = "Company type is required";
    }

    const address = formData.Address?.trim() || "";
    if (!address) {
      newErrors.Address = "Address is required";
    }

    const countryId = formData.CountryMasterId ?? 0;
    if (!countryId || countryId === 0) {
      newErrors.CountryMasterId = "Country is required";
    }

    const stateId = formData.StateMasterId ?? 0;
    if (!stateId || stateId === 0) {
      newErrors.StateMasterId = "State is required";
    }

    const districtId = formData.DistrictMasterId ?? 0;
    if (!districtId || districtId === 0) {
      newErrors.DistrictMasterId = "District is required";
    }

    const cityId = formData.CityMasterId ?? 0;
    if (!cityId || cityId === 0) {
      newErrors.CityMasterId = "City is required";
    }

    if (formData.AadharCardNumber?.trim() && !isValidAadhaar(formData.AadharCardNumber.trim())) {
      newErrors.AadharCardNumber = "Please enter a valid 12-digit Aadhaar number";
    }

    if (formData.PanCardNumber?.trim() && !isValidPAN(formData.PanCardNumber.trim())) {
      newErrors.PanCardNumber = "Please enter a valid PAN number";
    }

    if (formData.GSTNumber?.trim() && !isValidGST(formData.GSTNumber.trim())) {
      newErrors.GSTNumber = "Please enter a valid GST number";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };
  //#endregion


  const PushVendorFormData = useCallback((): FormData => {
    // Convert selected materials set to comma-separated string
    const materialIds = Array.from(selectedMaterials).join(",");
    

    const fd = new FormData();
    
    fd.append('VendorId', String(formData.VendorId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6');
    fd.append('CompanyName', formData.CompanyName?.trim() || '');
    fd.append('CompanyType', formData.CompanyType?.trim() || '');
    fd.append('VendorName', formData.VendorName?.trim() || '');
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
    fd.append('AvailableMaterialList', materialIds || formData.AvailableMaterialList || '');
    fd.append('AvailableContractList', formData.AvailableContractList || '');
    fd.append('MagicLinkUniquekey', formData.MagicLinkUniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6');
    fd.append('ClientRegistrationId', String(formData.ClientRegistrationId ?? 0));
    
    // Append files - Aadhar Card
    aadharCardFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append('AadharCardURL', file);
      }
    });
    fd.append('RemoveAadharCardURL', removedAadharCardUrls.join(','));
    
    // Append files - PAN Card
    panCardFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append('PanCardURL', file);
      }
    });
    fd.append('RemovePanCardURL', removedPanCardUrls.join(','));
    
    // Append files - GST Certificate
    gstCertificateFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append('GSTCertificateURL', file);
      }
    });
    fd.append('RemoveGSTCertificateURL', removedGSTCertificateUrls.join(','));
    
    return fd;
  }, [formData, removedAadharCardUrls, removedPanCardUrls, removedGSTCertificateUrls, selectedMaterials, aadharCardFiles, panCardFiles, gstCertificateFiles]);

  const handleSubmit = async () => {
    setErrors({});

    const validation = validateAddVendorForm();

    if (!validation.isValid) {
      setErrors(validation.errors);
      addToast({
        type: "error",
        title: "Please fill all required fields correctly",
      });
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const formDataToSubmit = PushVendorFormData();
        
        // Debug: Log form data keys to verify data
        console.log("Submitting vendor form data with files");

        const response = await VendorService.apiCallAddUpdateVendor(formDataToSubmit);
        if (E.isRight(response)) {
          addToast({
            type: "success",
            title: formData.VendorId ? "Vendor updated successfully" : "Vendor added successfully",
          });
          navigate("/vendor", location.state?.listState ? { state: location.state.listState } : undefined);
        } else {
          // Check if API returned validation errors
          const errorMessage = response.left?.message || "Operation failed";
          
          // If API returns validation errors, parse and display them
          if (errorMessage.includes("required") || errorMessage.includes("Valid")) {
            // Try to extract field-specific errors from API response
            const apiErrors: { [key: string]: string } = {};
            
            // Common API error patterns
            if (errorMessage.includes("Company name")) {
              apiErrors.CompanyName = "Company name is required";
            }
            if (errorMessage.includes("Vendor name")) {
              apiErrors.VendorName = "Vendor name is required";
            }
            if (errorMessage.includes("Mobile number")) {
              apiErrors.MobileNumber = "Mobile number is required";
            }
            if (errorMessage.includes("Email")) {
              apiErrors.EmailId = "Email is required";
            }
            if (errorMessage.includes("Valid country") || errorMessage.includes("Country")) {
              apiErrors.CountryMasterId = "Valid country is required";
            }
            if (errorMessage.includes("Valid state") || errorMessage.includes("State")) {
              apiErrors.StateMasterId = "Valid state is required";
            }
            if (errorMessage.includes("Valid district") || errorMessage.includes("District")) {
              apiErrors.DistrictMasterId = "Valid district is required";
            }
            if (errorMessage.includes("Valid city") || errorMessage.includes("City")) {
              apiErrors.CityMasterId = "Valid city is required";
            }
            
            if (Object.keys(apiErrors).length > 0) {
              setErrors(apiErrors);
            }
          }
          
          addToast({
            type: "error",
            title: errorMessage,
          });
        }
        return response;
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Operation failed";
        addToast({ type: "error", title: errorMessage });
      },
      undefined,
      formData.VendorId ? "Updating vendor..." : "Adding vendor..."
    );
  };

  const handleCancel = () => {
    if (location.state?.listState) {
      navigate("/vendor", { state: location.state.listState });
      return;
    }
    navigate(-1);
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage}>
          {" "}
          <div></div>{" "}
        </Loader>

        <div className="flex-1 space-y-2 px-6 py-3 pb-20 overflow-y-auto thin-scroll ">
          <form>
            {/* ============================================================= [BASIC EMPLOYEE DETAILS] ============================================================================================= */}
            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Vendor Name */}
                <Input
                  label="Vendor Name"
                  required
                  value={formData.VendorName}
                  onChange={(e) => handleFieldChange("VendorName", e.target.value)}
                  error={errors.VendorName}
                />
                <Input
                  label="Company Name"
                  required
                  value={formData.CompanyName}
                  onChange={(e) => handleFieldChange("CompanyName", e.target.value)}
                  error={errors.CompanyName}
                />
                <Input
                  label="Mobile Number"
                  required
                  leftIcon="+91"
                  value={formData.MobileNumber}
                  onChange={(e) => handleFieldChange("MobileNumber", filterMobile(e.target.value))}
                  error={errors.MobileNumber}
                />
                <Input
                  label="Email Id"
                  required
                  type="email"
                  value={formData.EmailId}
                  onChange={(e) => handleFieldChange("EmailId", filterEmail(e.target.value))}
                  error={errors.EmailId}
                />
                <SinglePageSelection
                  label="Company Type"
                  required
                  value={formData.CompanyType}
                  onChange={(val) => handleFieldChange("CompanyType", String(val))}
                  options={COMPANY_TYPE_OPTIONS.map((opt) => ({
                    label: opt.name,
                    value: opt.id,
                  }))}
                  error={errors.CompanyType}
                />
              </div>
            </div>

            {/* GOVERNMENT IDENTIFIERS */}
            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Government Identifiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Aadhaar Card Number" required
                  value={formData.AadharCardNumber}
                  onChange={(e) => handleFieldChange("AadharCardNumber", filterAadhaar(e.target.value))}
                  placeholder="Enter Aadhaar card number"
                  error={errors.AadharCardNumber}
                />
                <MultiFilePicker
                  label="Aadhar Card" required
                  value={aadharCardFiles}
                  onChange={setAadharCardFiles}
                  availableFilesURL={formData?.AadharCardURL ?? ""}
                  allowedTypes={[
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                  ]}
                  maxFiles={5}
                  maxSizeMB={10}
                />
                <Input 
                  label="PAN Card Number" required
                  value={formData.PanCardNumber}
                  onChange={(e) => handleFieldChange("PanCardNumber", filterPAN(e.target.value))}
                  placeholder="Enter PAN card number"
                  error={errors.PanCardNumber}
                />
                <MultiFilePicker
                  label="PAN Card" required
                  value={panCardFiles}
                  onChange={setPANCardFiles}
                  availableFilesURL={formData?.PanCardURL ?? ""}
                  allowedTypes={[
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                  ]}
                  maxFiles={5}
                  maxSizeMB={10}
                />
                <Input
                  label="GST Number" required
                  value={formData.GSTNumber}
                  onChange={(e) => handleFieldChange("GSTNumber", filterGST(e.target.value))}
                  placeholder="Enter GST number"
                  error={errors.GSTNumber}
                />
                <MultiFilePicker required
                  label="GST Certificate"
                  value={gstCertificateFiles}
                  onChange={setGSTCertificateFiles}
                  availableFilesURL={formData?.GSTCertificateURL ?? ""}
                  allowedTypes={[
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                  ]}
                  maxFiles={5}
                  maxSizeMB={10}
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Address
              </h3>

              <TextArea
                label="Address"
                required
                rows={3}
                className="thin-scroll"
                value={formData.Address}
                onChange={(e) => handleFieldChange("Address", e.target.value)}
                error={errors.Address}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SinglePageSelection
                  label="Country"
                  value={selectedCountryId || ""}
                  required
                  onChange={(val) => {
                    const id = Number(val);
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
                  error={errors.CountryMasterId}
                />

                <SinglePageSelection
                  label="State"
                  value={selectedStateId || ""}
                  required
                  onChange={(val) => {
                    const id = Number(val);
                    setSelectedStateId(id);
                    setSelectedDistrictId(null);
                    setSelectedCityId(null);
                    handleFieldChange("StateMasterId", id);
                    handleFieldChange("DistrictMasterId", 0);
                    handleFieldChange("CityMasterId", 0);
                  }}
                  disabled={!selectedCountryId || stateOptions.length === 0}
                  options={stateOptions}
                  error={errors.StateMasterId}
                />

                <SinglePageSelection
                  label="District"
                  value={selectedDistrictId || ""}
                  required
                  onChange={(val) => {
                    const id = Number(val);
                    setSelectedDistrictId(id);
                    setSelectedCityId(null);
                    handleFieldChange("DistrictMasterId", id);
                    handleFieldChange("CityMasterId", 0);
                  }}
                  disabled={!selectedStateId || districtOptions.length === 0}
                  options={districtOptions}
                  error={errors.DistrictMasterId}
                />

                <SinglePageSelection
                  label="City"
                  value={selectedCityId || ""}
                  required
                  onChange={(val) => {
                    const id = Number(val);
                    setSelectedCityId(id);
                    handleFieldChange("CityMasterId", id);
                  }}
                  disabled={!selectedDistrictId || cityOptions.length === 0}
                  options={cityOptions}
                  error={errors.CityMasterId}
                />
              </div>
            </div>

            {/* MATERIAL / CONTRACT */}
            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Material and Contract Management
              </h3>

              <Tabs
                tabs={[
                  { id: "material", label: "Material" },
                  { id: "contract", label: "Contract" },
                ]}
                defaultActive={activeTab}
                onTabChange={(tab) => setActiveTab(tab.id)}
              />

              {/* Material Tab Content */}
              {activeTab === "material" && (
                <div className="space-y-4">
                  {/* Search and Add Section */}
                  <div className="bg-gray-50 border rounded-lg p-4 space-y-3" style={{ minHeight: "400px", maxHeight: "400px", display: "flex", flexDirection: "column" }}>
                    <Input
                      type="text"
                      placeholder="Search Material"
                      value={searchMaterial}
                      onChange={(e) => setSearchMaterial(e.target.value)}
                    />

                    {/* Material List */}
                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {isMaterialsLoading ? (
                        <p className="text-center text-gray-400 py-3">Loading materials...</p>
                      ) : filteredMaterialList.length > 0 ? (
                        filteredMaterialList.map((item) => {
                          const isSelected = selectedMaterials.has(item.SubMaterialMasterId);
                          return (
                            <div
                              key={item.SubMaterialMasterId}
                              className="bg-white rounded-lg p-3 flex justify-between items-center hover:bg-gray-50"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.SubMaterialName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.MaterialName}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddMaterial(item)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors ${
                                  isSelected
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-emerald-500 hover:bg-emerald-600"
                                }`}
                                title={isSelected ? "Remove material" : "Add material"}
                              >
                                {isSelected ? (
                                  <Trash2 className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-gray-400 py-3">
                          {searchMaterial.trim() ? "No materials found matching your search" : "No materials found"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Selected Materials Table */}
                  {/* {selectedMaterials.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 border-b">
                        <h4 className="font-semibold text-gray-700">
                          Selected Materials ({selectedMaterials.length})
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="border px-3 py-2 text-left">Material Name</th>
                              <th className="border px-3 py-2 text-left">Material Code</th>
                              <th className="border px-3 py-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMaterials.map((material) => (
                              <tr key={material.MaterialMasterId} className="hover:bg-gray-50">
                                <td className="border px-3 py-2">{material.MaterialName}</td>
                                <td className="border px-3 py-2">{material.MaterialCode}</td>
                                <td className="border px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMaterial(material.MaterialMasterId)}
                                    className="text-red-600 hover:text-red-800 font-medium"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )} */}
                </div>
              )}

              {/* Contract Tab Content */}
              {activeTab === "contract" && (
                <div className="space-y-4">
                  {/* Search and Add Section */}
                  <div className="bg-gray-50 border rounded-lg p-4 space-y-3" style={{ minHeight: "400px", maxHeight: "400px", display: "flex", flexDirection: "column" }}>
                    <Input
                      type="text"
                      placeholder="Search Contract"
                      value={""}
                      onChange={() => {}}
                      disabled
                    />

                    {/* Contract List */}
                    <div className="flex-1 overflow-y-auto flex items-center justify-center">
                      <p className="text-center text-gray-400 py-3">
                        Contract management coming soon
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </form>
        </div>
        <div
          className="sticky bottom-0 z-40 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Button
            color="transparent"
            variant='transparent_border'
            size="sm"
            onClick={() => {
              handleCancel();
            }}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            color="green"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="px-6"
            disabled={isLoading}
          >
            {formData.VendorId ? "Update Vendor" : "Add Vendor"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddUpdateVendor;
