import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type {
  AddUpdateChannelPartnerRequest,
  FilterWithPaginationChannelPartnerRequest,
} from "@/features/ChannelPartner/models/ChannelPartnerModel";
import { ChannelPartnerService } from "@/features/ChannelPartner/services/ChannelPartnerService";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { Globe, IdCard, Mail, Phone } from "lucide-react";
import {
  filterAadhaar,
  filterEmail,
  filterGST,
  filterMobile,
  filterPAN,
  filterRERA,
  filterWebsiteUrl,
  hasAnyDocumentFile,
  isValidAadhaar,
  isValidEmail,
  isValidGST,
  isValidMobile,
  isValidPAN,
  isValidRERA,
  isValidWebsiteUrl,
} from "@/core/utils/fileValidation";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import {
  CHANNE_PARTNER_DESIGNATION,
  CHANNE_PARTNER_TYPE,
  COMPANY_TYPE_OPTIONS,
  FIRMS_TYPE_OPTIONS,
  SPECIALITY_TYPE,
} from "@/core/constants";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { TextArea } from "@/ui/components/forms/Textarea";
import Checkbox from "@/ui/components/forms/Checkbox";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import {
  fetchChannelPartnerById,
  fetchChannelPartnerCompanyDropdown,
} from "@/features/ChannelPartner/channelPartnerDropDown";
import CompleteVerificationSection from "@/ui/components/TwoWayVerification/CompleteVerificationSection";
import { Modal } from "@/ui/components/Modal/Modal";
import { sendOTP } from "@/features/technical/services/OTPService";
import { getChannelPartnerVerificationSteps } from "@/features/ChannelPartner/utils/channelPartnerVerificationSteps";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { fetchProjectDropdown } from "@/features/projectMaster/projectDropdown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { checkDuplicateField } from "@/core/utils/duplicateValidation";
import MobileNumberInput from "@/ui/components/forms/MobileNumberInput";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";

const initialFormState = (): AddUpdateChannelPartnerRequest => ({
  ChannelPartnerId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  Name: "",
  DateOfBirth: null,
  WebsiteURL: "",
  CompanyName: "",

  FirmsType: "",
  Designation: "",
  Type: "",
  CompanyType: "",

  MobileNumberCountryCode: "+91",
  MobileNumber: "",
  AlternativeMobileNumber: "",
  EmailId: "",
  PanNumber: "",
  PanCardURL: null,
  RemovePanCardURL: "",

  AadharCardNumber: "",
  AadharCardURL: null,
  RemoveAadharCardURL: "",

  GSTNumber: "",
  GSTCertificateURL: null,
  RemoveGSTCertificateURL: "",

  IsRERANumber: 0,
  RERANumber: "",
  Speciality: "",
  OfficeAddress: "",

  CountryMasterId: 1,
  DistrictMasterId: null,
  StateMasterId: null,
  CityMasterId: null,
  VillageMasterId: null,
  PrimaryProjectPortfolioId: 0,
  SecondaryProjectPortfolioId: "",

  AOPFromDate: null,
  AOPToDate: null,
  AOPDocumentURL: null,
  RemoveAOPDocumentURL: "",

  OTP: "",
});

export const AddUpdateChannelPartner: React.FC = () => {
  const [formData, setFormData] = useState<AddUpdateChannelPartnerRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [panCardURLFiles, setPanCardURLFiles] = useState<(File | string)[]>([]);
  const [panCardURL, setPanCardURL] = useState<string>();
  const [removePanCardUrls, setRemovePanCardUrls] = useState<string[]>([]);

  const [aadharCardURLFiles, setAadharCardURLFiles] = useState<(File | string)[]>([]);
  const [aadharCardURL, setAadharCardURL] = useState<string>();
  const [removeAadharCardUrls, setRemoveAadharCardUrls] = useState<string[]>([]);

  const [gSTCertificateURLFiles, setGSTCertificateURLFiles] = useState<(File | string)[]>([]);
  const [gSTCertificateURL, setGSTCertificateURL] = useState<string>();
  const [removeGSTCertificateUrls, setRemoveGSTCertificateUrls] = useState<string[]>([]);

  const [aopDocumentURLFiles, setAopDocumentURLFiles] = useState<(File | string)[]>([]);
  const [aopDocumentURL, setAopDocumentURL] = useState<string>();
  const [removeAopDocumentUrls, setRemoveAopDocumentUrls] = useState<string[]>([]);

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);

  const navigate = useNavigate();
  const { ChannelPartnerId } = useParams<{ ChannelPartnerId?: string }>();
  const channelPartnerIdParam = ChannelPartnerId ? Number(ChannelPartnerId) : 0;
  const isAddMode = channelPartnerIdParam === 0;

  const [isReadOnly, setIsReadOnly] = useState<boolean>();

  const { addToast } = useToast();

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const { canAction } = useMenuPermissions("/channelPartner");

  const {
    isLoading: isLocationLoading,
    countries,
    statesByCountryId,
    districtsByStateId,
    citiesByDistrictId,
    villagesByCityId,
  } = useCountryStateCityDistrictVillageData();

  const [selectedCountryId, setSelectedCountryId] = React.useState<
    number | null
  >(1);
  const [selectedStateId, setSelectedStateId] = React.useState<number | null>(
    null,
  );
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<
    number | null
  >(null);
  const [selectedCityId, setSelectedCityId] = React.useState<number | null>(
    null,
  );
  const [selectedVillageId, setSelectedVillageId] = React.useState<
    number | null
  >(null);

  const countryOptions = countries.map((c) => ({ label: c.name, value: c.id }));

  const stateOptions =
    selectedCountryId != null
      ? (statesByCountryId[selectedCountryId] || []).map((s) => ({
        label: s.name,
        value: s.id,
      }))
      : [];

  const districtOptions =
    selectedStateId != null
      ? (districtsByStateId[selectedStateId] || []).map((d) => ({
        label: d.name,
        value: d.id,
      }))
      : [];

  const cityOptions =
    selectedDistrictId != null
      ? (citiesByDistrictId[selectedDistrictId] || []).map((c) => ({
        label: c.name,
        value: c.id,
      }))
      : [];

  const villageOptions =
    selectedCityId != null
      ? (villagesByCityId[selectedCityId] || []).map((c) => ({
        label: c.name,
        value: c.id,
      }))
      : [];

  const [dropdownLabels, setDropdownLabels] = useState<{
    primaryProjectPortfolio?: string;
  }>({});

  const [selectedSecondaryProjectValues, setSelectedSecondaryProjectValues] = useState<string | number | null>(null);

  const secondaryProjectDropdown = useMultiSelectDropdown({
    value: selectedSecondaryProjectValues,
    fetchCallback: fetchProjectDropdown,
    autoFetchOptions: true,
  });


  const handleFieldChange = (field: keyof AddUpdateChannelPartnerRequest, value: any,) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    if (!isAddMode) {
      fetchChannelPartnerDetails();
    }
  }, [ChannelPartnerId]);


  const fetchChannelPartnerDetails = async () => {
    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,

      async () => {
        const params: FilterWithPaginationChannelPartnerRequest = {
          PageNumber: 1,
          PageSize: 1,
          ChannelPartnerId: ChannelPartnerId
            ? Number(ChannelPartnerId)
            : undefined,
        };

        const response =
          await ChannelPartnerService.apiCallPullChannelPartner(params);

        if (E.isRight(response)) {
          const e = response.right.Data?.[0];

          if (e) {
            setFormData((prev) => ({
              ...prev,
              ChannelPartnerId: e.ChannelPartnerId ?? prev.ChannelPartnerId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              Name: e.Name ?? prev.Name,
              DateOfBirth: e.DateOfBirth ?? prev.DateOfBirth,
              WebsiteURL: e.WebsiteURL ?? prev.WebsiteURL,
              CompanyName: e.CompanyName ?? prev.CompanyName,
              FirmsType: e.FirmsType ?? prev.FirmsType ?? "",
              Type: e.Type ?? prev.Type ?? "",
              Designation: e.Designation ?? prev.Designation ?? "",
              EmailId: e.EmailId ?? prev.EmailId,
              MobileNumberCountryCode: e.MobileNumberCountryCode ?? prev.MobileNumberCountryCode,
              MobileNumber: e.MobileNumber ?? prev.MobileNumber,
              AlternativeMobileNumber: e.AlternativeMobileNumber ?? prev.AlternativeMobileNumber,
              AadharCardNumber: e.AadharCardNumber ?? prev.AadharCardNumber,
              PanNumber: e.PanNumber ?? prev.PanNumber,
              AadharCardURL: null,
              RemoveAadharCardURL: "",
              PanCardURL: null,
              RemovePanCardURL: "",
              IsRERANumber: e.RERANumber !== "" ? 1 : 0,
              RERANumber: e.RERANumber ?? prev.RERANumber,
              GSTNumber: e.GSTNumber ?? prev.GSTNumber,
              Speciality: e.Speciality ?? prev.Speciality,
              OfficeAddress: e.OfficeAddress ?? prev.OfficeAddress,
              CountryMasterId: e.CountryMasterId ?? prev.CountryMasterId,
              StateMasterId: e.StateMasterId ?? prev.StateMasterId,
              DistrictMasterId: e.DistrictMasterId ?? prev.DistrictMasterId,
              CityMasterId: e.CityMasterId ?? prev.CityMasterId,
              VillageMasterId: e.VillageMasterId ?? prev.VillageMasterId,
              PrimaryProjectPortfolioId: e.PrimaryProjectPortfolioId ?? prev.PrimaryProjectPortfolioId,
              SecondaryProjectPortfolioId: e.SecondaryProjectPortfolioId ?? prev.SecondaryProjectPortfolioId,
              AOPFromDate: e.AOPFromDate ?? prev.AOPFromDate,
              AOPToDate: e.AOPToDate ?? prev.AOPToDate,
              RemoveAOPDocumentURL: "",
            }));
            setPanCardURLFiles([]);
            setPanCardURL(e.PanCardURL);
            setRemovePanCardUrls([]);

            setAadharCardURLFiles([]);
            setAadharCardURL(e.AadharCardURL);
            setRemoveAadharCardUrls([]);

            setGSTCertificateURLFiles([]);
            setGSTCertificateURL(e.GSTCertificateURL);
            setRemoveGSTCertificateUrls([]);

            setAopDocumentURLFiles([]);
            setAopDocumentURL(e.AOPDocumentURL);
            setRemoveAopDocumentUrls([]);

            setSelectedCountryId(e.CountryMasterId ?? null);
            setSelectedStateId(e.StateMasterId ?? null);
            setSelectedDistrictId(e.DistrictMasterId ?? null);
            setSelectedCityId(e.CityMasterId ?? null);
            setSelectedVillageId(e.VillageMasterId ?? null);

            setIsReadOnly(e.Designation === "Owner" ? false : true);

            setDropdownLabels({
              primaryProjectPortfolio: e.PrimaryProjectPortfolio || ""
            });

            setSelectedSecondaryProjectValues(e.SecondaryProjectPortfolioId || "");
          }

        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Channel Partner",
    );
  };

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddChannelPartnerForm = (): {
    isValid: boolean;

    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.Name) {
      newErrors.Name = "Full Name is required";
    }

    if (formData.DateOfBirth !== "") {
      const dob = new Date(formData.DateOfBirth as unknown as string);
      const today = new Date();
      if (dob > today) {
        newErrors.DateOfBirth = "Date of Birth cannot be in the future";
      }
    }

    if (formData.WebsiteURL?.trim() !== "" && !isValidWebsiteUrl(formData.WebsiteURL.trim())) {
      newErrors.WebsiteURL = 'Enter a valid Website URL'
    }

    if (!formData.MobileNumber?.trim()) {
      newErrors.MobileNumber = "Mobile Number is required";
    } else if (!isValidMobile(formData.MobileNumber.trim(), formData.MobileNumberCountryCode!)) {
      newErrors.MobileNumber = "Enter a Valid mobile number";
    }

    if (formData.EmailId !== "") {
      if (!isValidEmail(formData.EmailId!.trim())) {
        newErrors.EmailId = "Enter a Valid E-Mail ID";
      }
    }

    if (formData.MobileNumberCountryCode !== "+91" && formData.EmailId.trim() === "") {
      newErrors.EmailId = "E-Mail ID is mandatory";
    }

    if (formData.AlternativeMobileNumber?.trim()) {
      if (!isValidMobile(formData.AlternativeMobileNumber.trim())) {
        newErrors.AlternativeMobileNumber = "Enter a valid 10-digit Alternative Mobile Number";
      }
    }

    if (formData.ChannelPartnerId === 0 && !formData.CompanyName) {
      newErrors.CompanyType = " Company Type is required";
    }

    if (!formData.CompanyName) {
      newErrors.CompanyName = " Company Name is required";
    }

    if (!formData.FirmsType?.trim()) {
      newErrors.FirmsType = "Firms Type is required";
    }

    if (!formData.Speciality) {
      newErrors.Speciality = "Speciality is required";
    }

    if (!formData.Designation) {
      newErrors.Designation = "Designation is required";
    }
    if (!formData.Type) {
      newErrors.Type = "Type is required";
    }

    if (!formData.OfficeAddress) {
      newErrors.OfficeAddress = "Office Address is required";
    }

    if (formData.IsRERANumber === 1 && !formData.RERANumber) {
      newErrors.RERANumber = " RERA Number is required";
    } else if (formData.IsRERANumber === 1 && !isValidRERA(formData.RERANumber.trim())) {
      newErrors.RERANumber = "Enter a valid RERA Number";
    }

    const hasAadharNumber = !!formData.AadharCardNumber?.trim();
    const hasAadharFile = hasAnyDocumentFile(aadharCardURLFiles, aadharCardURL, removeAadharCardUrls);

    if (hasAadharNumber && !hasAadharFile) {
      newErrors.AadharCardURL = "Aadhaar card file is required.";
    }

    if (!hasAadharNumber && hasAadharFile) {
      newErrors.AadharCardNumber = "Aadhaar number is required if document is uploaded.";
    }

    if (hasAadharNumber && !isValidAadhaar(formData.AadharCardNumber.trim())) {
      newErrors.AadharCardNumber = "Enter a valid 12-digit Aadhaar number.";
    }

    const hasPanNumber = !!formData.PanNumber?.trim();
    const hasPanFile = hasAnyDocumentFile(panCardURLFiles, panCardURL, removePanCardUrls);

    if (hasPanNumber && !hasPanFile) {
      newErrors.PanCardURL = "PAN card file is required.";
    }

    if (!hasPanNumber && hasPanFile) {
      newErrors.PanNumber = "PAN number is required.";
    }

    if (hasPanNumber && !isValidPAN(formData.PanNumber.trim())) {
      newErrors.PanNumber = "Enter a valid PAN Number.";
    }

    const hasGSTNumber = !!formData.GSTNumber?.trim();
    const hasGSTFile = hasAnyDocumentFile(gSTCertificateURLFiles, gSTCertificateURL, removeGSTCertificateUrls);

    if (hasGSTNumber && !hasGSTFile) {
      newErrors.GSTCertificateURL = "GST Certificate file is required.";
    }

    if (!hasGSTNumber && hasGSTFile) {
      newErrors.GSTNumber = "GST Number is required.";
    }

    if (hasGSTNumber && !isValidGST(formData.GSTNumber.trim())) {
      newErrors.GSTNumber = "Enter a valid GST Number.";
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

    // AOP VALIDATION
    const hasAOPDocument = hasAnyDocumentFile(aopDocumentURLFiles, aopDocumentURL, removeAopDocumentUrls);

    const hasAOPFromDate = !!formData.AOPFromDate;
    const hasAOPToDate = !!formData.AOPToDate;

    const aopFromDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.AOPFromDate ? new Date(formData.AOPFromDate) : undefined);
    const aopToDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.AOPToDate ? new Date(formData.AOPToDate) : undefined);

    if (hasAOPDocument) {
      if (!hasAOPFromDate) {
        newErrors.AOPFromDate = "From Date is required.";
      }

      if (!hasAOPToDate) {
        newErrors.AOPToDate = "To Date is required.";
      }
    }

    if (hasAOPFromDate || hasAOPToDate) {
      if (!hasAOPDocument) {
        newErrors.AOPDocumentURL = "AOP Document is required.";
      }
    }

    if (hasAOPFromDate && hasAOPToDate) {
      if (!isToDateGreaterOrEqualFromDate(aopFromDate, aopToDate)) {
        newErrors.AOPToDate = "To Date must be greater than or equal to From Date.";
      }
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const PushChannelPartnerFormData = (): FormData => {

    const secondaryProjectIdsString = secondaryProjectDropdown.selectedValues.length > 0 ? secondaryProjectDropdown.selectedValues.join(",") : "";
    const fd = new FormData();

    fd.append("ChannelPartnerId", String(formData.ChannelPartnerId ?? 0));
    fd.append("Uniquekey", formData.Uniquekey ?? "");
    fd.append("Name", formData.Name ?? "");
    fd.append("DateOfBirth", formData.DateOfBirth ?? "");
    fd.append("WebsiteURL", formData.WebsiteURL ?? "");
    fd.append("CompanyName", formData.CompanyName ?? "");
    fd.append("FirmsType", formData.FirmsType ?? "");
    fd.append("Type", formData.Type ?? "");
    fd.append("Designation", formData.Designation ?? "");
    fd.append("EmailId", formData.EmailId ?? "");
    fd.append("MobileNumberCountryCode", formData.MobileNumberCountryCode ?? "");
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
    fd.append("PrimaryProjectPortfolioId", String(formData.PrimaryProjectPortfolioId ?? 0));
    fd.append("SecondaryProjectPortfolioId", secondaryProjectIdsString);
    fd.append("AOPFromDate", formData.AOPFromDate ?? "");
    fd.append("AOPToDate", formData.AOPToDate ?? "");
    fd.append("OTP", otp?.trim() ?? "");

    panCardURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("PanCardURL", file);
      }
    });

    fd.append("RemovePanCardURL", removePanCardUrls.join(","));

    aadharCardURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("AadharCardURL", file);
      }
    });

    fd.append("RemoveAadharCardURL", removeAadharCardUrls.join(","));

    gSTCertificateURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("GSTCertificateURL", file);
      }
    });

    fd.append("RemoveGSTCertificateURL", removeGSTCertificateUrls.join(","));

    aopDocumentURLFiles.forEach((file) => {
      if (file instanceof File) {
        fd.append("AOPDocumentURL", file);
      }
    });

    fd.append("RemoveAOPDocumentURL", removeAopDocumentUrls.join(","));


    return fd;
  };

  const handleAddUpdateChannelPartner = async () => {

    setErrors({});

    const validation = validateAddChannelPartnerForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      addToast({ type: "error", title: "Please fill the required filed" });

      return;
    }
    if (formData.ChannelPartnerId === 0) {
      const isDuplicate = await checkDuplicateField({
        fieldName: "MobileNumber",
        fieldValue: formData.MobileNumber,
        apiCallback: ChannelPartnerService.apiCallPullChannelPartner,
        setIsLoading,
        setLoadingMessage,
        loadingMessage: "Checking mobile number..."
      });

      if (isDuplicate) {
        setErrors(prev => ({
          ...prev,
          MobileNumber: "Mobile number already exists"
        }));

        addToast({ type: "error", title: "Mobile number already exists" });

        return;
      }
    }

    if (formData.ChannelPartnerId === 0 && formData.MobileNumberCountryCode === "+91" && !isOtpVerified) {

      if (!isOtpSent) {

        const sent = await sendOTP({
          mobileNumber: formData.MobileNumber || "",
          module: "CHANNEL PARTNER",
          name: formData.Name || "",
          companyName: formData.CompanyName || "",
          setIsLoading,
          setLoadingMessage,
          addToast,
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
        addToast({ type: "error", title: error.message });
      },
      undefined,
      isAddMode ? "Add" : "Update",
    );
  };


  const applyExistingCompanyData = (channelPartner: any) => {

    if (!channelPartner) return;

    setFormData((prev) => ({
      ...prev,
      CompanyName: channelPartner.CompanyName ?? "",
      FirmsType: channelPartner.FirmsType ?? "",
      RERANumber: channelPartner.RERANumber ?? "",
      IsRERANumber: channelPartner.RERANumber ? 1 : 0,
      GSTNumber: channelPartner.GSTNumber ?? "",

      CountryMasterId: channelPartner.CountryMasterId ?? 0,
      StateMasterId: channelPartner.StateMasterId ?? 0,
      DistrictMasterId: channelPartner.DistrictMasterId ?? 0,
      CityMasterId: channelPartner.CityMasterId ?? 0,
      VillageMasterId: channelPartner.VillageMasterId ?? 0,
    }));

    (setGSTCertificateURLFiles([]),
      setGSTCertificateURL(channelPartner.GSTCertificateURL),
      setRemoveGSTCertificateUrls([]));

    setSelectedCountryId(channelPartner.CountryMasterId ?? null);
    setSelectedStateId(channelPartner.StateMasterId ?? null);
    setSelectedDistrictId(channelPartner.DistrictMasterId ?? null);
    setSelectedCityId(channelPartner.CityMasterId ?? null);
    setSelectedVillageId(channelPartner.VillageMasterId ?? null);
  };

  const resetExistingCompanyData = () => {
    setFormData((prev) => ({
      ...prev,
      CompanyName: "",
      FirmsType: "",
      RERANumber: "",
      IsRERANumber: 0,
      GSTNumber: "",

      StateMasterId: 0,
      DistrictMasterId: 0,
      CityMasterId: 0,
      VillageMasterId: 0,
    }));

    setSelectedStateId(null);
    setSelectedDistrictId(null);
    setSelectedCityId(null);
    setSelectedVillageId(null);
    (setGSTCertificateURLFiles([]),
      setGSTCertificateURL(""),
      setRemoveGSTCertificateUrls([]));
  };

  const checkDuplicateMobileNumber = async (mobileNumber: string, countryCode: string) => {

    if (Number(formData.ChannelPartnerId) > 0) {
      return;
    }

    if (!isValidMobile(mobileNumber, countryCode)) {
      return;
    }

    const isDuplicate = await checkDuplicateField({

      fieldName: "MobileNumber",

      fieldValue: mobileNumber,

      apiCallback: ChannelPartnerService.apiCallPullChannelPartner,

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

      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
        <form onSubmit={handleAddUpdateChannelPartner}>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Basic Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label="Full Name"
                  value={formData.Name ?? ""}
                  onChange={(e) => handleFieldChange("Name", e.target.value)}
                  placeholder="Enter Full Name"
                  maxLength={250}
                  error={errors.Name}
                />
              </div>
              <div>
                <DatePickerInput
                  label="DOB"
                  value={formatDate_dd_mm_yyyy(formData.DateOfBirth)}
                  onChange={(val) => handleFieldChange("DateOfBirth", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  error={errors.DateOfBirth} />
              </div>

              <div>
                <MobileNumberInput
                  mobileNumber={formData.MobileNumber ?? ""}
                  countryCode={formData.MobileNumberCountryCode ?? "+91"}
                  disabled={Number(formData.ChannelPartnerId) > 0}
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
              </div>

              <div>
                <Input
                  label="E-Mail ID"
                  type="text"
                  value={formData.EmailId}
                  error={errors.EmailId}
                  rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
                  onChange={(e) => {
                    const emailId = filterEmail(e.target.value);
                    handleFieldChange("EmailId", emailId);
                  }}
                  placeholder="Enter Valid E-Mail ID"
                />
              </div>


              <div>
                <Input
                  leftIcon="+91"
                  label="Alternative Mobile Number"
                  maxLength={10}
                  value={formData.AlternativeMobileNumber}
                  rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                  onChange={(e) =>
                    handleFieldChange(
                      "AlternativeMobileNumber",
                      filterMobile(e.target.value),
                    )
                  }
                  placeholder="Enter Alternative Mobile Number"
                  error={errors.AlternativeMobileNumber}
                />
              </div>

              {Number(formData.ChannelPartnerId || 0) === 0 && (
                <div>
                  <SinglePageSelection
                    label="Company Type"
                    placeholder="Select Company Type"
                    value={formData.CompanyType}
                    error={errors.CompanyType}
                    onChange={(e) => {
                      const value = String(e);

                      handleFieldChange("CompanyType", value);
                      handleFieldChange("CompanyName", "");

                      if (value === "Existing Company") {
                        resetExistingCompanyData();
                        setIsReadOnly(true);
                      } else {
                        setIsReadOnly(false);
                        resetExistingCompanyData();
                      }
                    }}
                    options={COMPANY_TYPE_OPTIONS.map((opt) => ({
                      label: opt.name,
                      value: opt.id,
                    }))}
                  />
                </div>
              )}

              {Number(formData.ChannelPartnerId || 0) > 0 ? (
                <div>
                  <Input
                    type="text"
                    required
                    label="Company Name"
                    value={formData.CompanyName ?? ""}
                    onChange={(e) =>
                      handleFieldChange("CompanyName", e.target.value)
                    }
                    placeholder="Enter Company Name"
                    maxLength={250}
                    error={errors.CompanyName}
                  />
                </div>
              ) : (
                <div>
                  <Input
                    type="text"
                    readOnly={
                      formData.CompanyType === "New Company" ? false : true
                    }
                    required
                    label="Company Name"
                    value={formData.CompanyName ?? ""}
                    onChange={(e) =>
                      handleFieldChange("CompanyName", e.target.value)
                    }
                    placeholder="Enter Company Name"
                    maxLength={250}
                    error={errors.CompanyName}
                  />
                </div>
              )}

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
                      resetExistingCompanyData();
                      return;

                    }

                    const companyId = Number(item.value);

                    handleFieldChange("CompanyName", item.label);

                    setLoadingMessage("Fetch Company Details");

                    setIsLoading(true);

                    const company = await fetchChannelPartnerById(companyId);

                    setIsLoading(false);

                    applyExistingCompanyData(company);
                  }}
                />
              )}
              <div>
                <SinglePageSelection
                  label="Firms Type"
                  disabled={isReadOnly}
                  placeholder="Select Firms Type"
                  required
                  error={errors.FirmsType}
                  value={formData.FirmsType}
                  onChange={(e) => {
                    handleFieldChange("FirmsType", String(e));
                  }}
                  options={FIRMS_TYPE_OPTIONS.map((opt) => ({
                    label: opt.name,
                    value: opt.id,
                  }))}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="Designation"
                  placeholder="Select Designation"
                  required
                  error={errors.Designation}
                  value={formData.Designation}
                  onChange={(e) => {
                    handleFieldChange("Designation", String(e));
                  }}
                  options={CHANNE_PARTNER_DESIGNATION.map((opt) => ({
                    label: opt.name,
                    value: opt.id,
                  }))}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="Type"
                  placeholder="Select Type"
                  required
                  error={errors.Type}
                  value={formData.Type}
                  onChange={(e) => {
                    handleFieldChange("Type", String(e));
                  }}
                  options={CHANNE_PARTNER_TYPE.map((opt) => ({
                    label: opt.name,
                    value: opt.id,
                  }))}
                />
              </div>
              <div>
                <Input
                  label="Website URL"
                  type="text"
                  value={formData.WebsiteURL}
                  onChange={e => handleFieldChange('WebsiteURL', filterWebsiteUrl(e.target.value))}
                  rightIcon={<Globe className="w-4 h-4" />}
                  error={errors.WebsiteURL}
                  placeholder="Enter Website URL"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-5">
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
                  label="RERA Number"
                  disabled={isReadOnly}
                  required={formData.IsRERANumber === 1 ? true : false}
                  type="text"
                  value={formData.RERANumber}
                  error={errors.RERANumber}
                  rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                  maxLength={20}
                  onChange={(e) => {
                    const reraNumber = filterRERA(e.target.value);
                    handleFieldChange("RERANumber", reraNumber);
                  }}
                  placeholder="Enter Valid RERA Number"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              Speciality
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <SinglePageSelection
                  label="Speciality"
                  placeholder="Select Speciality"
                  required
                  value={formData.Speciality}
                  onChange={(e) => handleFieldChange("Speciality", String(e))}
                  options={SPECIALITY_TYPE.map((opt) => ({
                    label: opt.name,
                    value: opt.id,
                  }))}
                  error={errors.Speciality}
                />
              </div>
            </div>
          </div>
          {/* ============================================================= [DOCUMENT DETAILS] ============================================================================================= */}

          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              Document Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  type="text"
                  label="Aadhaar Number"
                  value={formData.AadharCardNumber ?? ""}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    handleFieldChange(
                      "AadharCardNumber",
                      filterAadhaar(digits),
                    );
                  }}
                  placeholder="Enter Aadhaar Number"
                  rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                  maxLength={12}
                  error={errors.AadharCardNumber}
                />
              </div>
              <div>
                <MultiFilePicker
                  label=" Upload Aadhaar Card"
                  placeholder="Select Aadhaar Card"
                  error={errors.AadharCardURL}
                  value={aadharCardURLFiles}
                  onChange={setAadharCardURLFiles}
                  availableFilesURL={aadharCardURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                  maxFiles={5}
                  onRemoveExisting={(url) => {
                    setRemoveAadharCardUrls((prev) => [...prev, url]);
                  }}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="PAN Number"
                  value={formData.PanNumber.toUpperCase() ?? ""}
                  rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                  onChange={(e) =>
                    handleFieldChange(
                      "PanNumber",
                      filterPAN(e.target.value).toUpperCase(),
                    )
                  }
                  placeholder="Enter Pan Number"
                  maxLength={10}
                  error={errors.PanNumber}
                />
              </div>

              <div>
                <MultiFilePicker
                  label=" Upload PAN Card"
                  placeholder="Select PAN Card"
                  error={errors.PanCardURL}
                  value={panCardURLFiles}
                  onChange={setPanCardURLFiles}
                  availableFilesURL={panCardURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                  maxFiles={5}
                  onRemoveExisting={(url) => {
                    setRemovePanCardUrls((prev) => [...prev, url]);
                  }}
                />
              </div>
              <div>
                <Input
                  label="GST Number"
                  type="text"
                  disabled={isReadOnly}
                  value={formData.GSTNumber}
                  rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                  error={errors.GSTNumber}
                  onChange={(e) => {
                    const gstNumber = filterGST(e.target.value);
                    handleFieldChange("GSTNumber", gstNumber);
                  }}
                  placeholder="Enter Valid GST Number"
                />
              </div>

              <div>
                <MultiFilePicker
                  label="GST Certificate"
                  disabled={isReadOnly}
                  placeholder="Select GST Certificate"
                  error={errors.GSTCertificateURL}
                  value={gSTCertificateURLFiles}
                  onChange={setGSTCertificateURLFiles}
                  availableFilesURL={gSTCertificateURL ?? ""}
                  allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                  maxFiles={5}
                  onRemoveExisting={(url) => {
                    setRemoveGSTCertificateUrls((prev) => [...prev, url]);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              Address Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>
            <div>
              <TextArea
                required
                label="Office Address"
                className="thin-scroll"
                value={formData.OfficeAddress ?? ""}
                onChange={(e) =>
                  handleFieldChange("OfficeAddress", e.target.value)
                }
                placeholder="Enter Office Address"
                maxLength={500}
                error={errors.OfficeAddress}
              />
            </div>
          </div>

          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              Primary & Secondary Project Portfolio Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>

                <SingleSelectDropdownWithPagination
                  label="Primary Project"
                  title="Select Project"
                  size="lg"
                  dataFetchCallBack={fetchProjectDropdown}

                  onSelected={(item) => {
                    if (!item) {
                      handleFieldChange("PrimaryProjectPortfolioId", 0);
                      return;
                    }
                    handleFieldChange("PrimaryProjectPortfolioId", Number(item.value));
                  }}

                  initialValue={createDropdownInitialValue(formData.PrimaryProjectPortfolioId, dropdownLabels.primaryProjectPortfolio)}
                  error={errors.PrimaryProjectPortfolioId}
                />
              </div>

              <div>
                <MultiSelectPagination
                  label="Secondary Project"
                  dataFetchCallBack={fetchProjectDropdown}
                  selectedValues={secondaryProjectDropdown.selectedValues}
                  options={secondaryProjectDropdown.initialOptions}
                  onChange={(values) => {

                    const { idsString } = secondaryProjectDropdown.handleChange(values);

                    setSelectedSecondaryProjectValues(idsString || null);

                    if (errors.SecondaryProjectPortfolioId) {
                      setErrors((prev) => ({
                        ...prev,
                        SecondaryProjectPortfolioId: "",
                      }));
                    }
                  }}
                />
              </div>
            </div>

          </div>

          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
              AOP Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <MultiFilePicker
                  label=" Upload AOP Document"
                  placeholder="Select AOP Document"
                  error={errors.AOPDocumentURL}
                  value={aopDocumentURLFiles}
                  onChange={setAopDocumentURLFiles}
                  availableFilesURL={aopDocumentURL ?? ""}
                  allowedTypes={["application/pdf"]}
                  maxFiles={1}
                  onRemoveExisting={(url) => {
                    setRemoveAopDocumentUrls((prev) => [...prev, url]);
                  }}
                />
              </div>
              <div>
                <DatePickerInput
                  label="From Date"
                  value={formatDate_dd_mm_yyyy(formData.AOPFromDate)}
                  onChange={(val) => handleFieldChange("AOPFromDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  error={errors.AOPFromDate} />
              </div>
              <div>
                <DatePickerInput
                  label="To Date"
                  value={formatDate_dd_mm_yyyy(formData.AOPToDate)}
                  onChange={(val) => handleFieldChange("AOPToDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  error={errors.AOPToDate} />
              </div>
            </div>
          </div>
        </form>
      </div>

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
            gSTCertificateURL,
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
