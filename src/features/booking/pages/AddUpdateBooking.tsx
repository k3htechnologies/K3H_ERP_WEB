import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import type { AddUpdateBookingRequest, FilterWithPaginationBookingRequest, AddUpdateBookingApplicantRequest, BookingApplicantData, AddUpdateBookingPaymentScheduleRequest, AddUpdateBookingOtherChargesRequest } from "../models/BookingModel";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { TextArea } from "@/ui/components/forms/Textarea";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { bookingService } from "@/features/booking/services/BookingService";
import { allowPercentage, calculateMergedFiles, calculateRemovedFiles, createFileUrlString, filterAadhaar, filterDrivingLicenseNumber, filterEmail, filterGST, filterLetters, filterMobile, filterNumbers, filterNumbersWithDecimal, filterPAN, filterPassportNumber, filterVoterId, isValidAadhaar, isValidDrivingLicenseNumber, isValidEmail, isValidGST, isValidMobile, isValidPAN, isValidPassportNumber, isValidVoterId, mergeFiles } from "@/core/utils/fileValidation";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useBookingListState } from "@/features/booking/context/BookingListStateContext";
import { Button } from "@/ui/components/forms";
import { Edit, IdCardIcon, Search, Trash2 } from "lucide-react";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { Modal } from "@/ui/components/Modal/Modal";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { APPLICANT_TYPE, HANDOVER_TYPE, SOURCE_OF_FUNDING_TYPE } from "@/core/constants";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import type { InventoryFlatData } from "@/features/inventory/models/InventoryMasterModel";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { Plus } from "lucide-react";
import RadioPill from "@/ui/components/forms/RadioPill";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { fetchEnquiryBySystemGeneratedCode } from "@/features/enquiry/enquiryDropDown";
import { fetchPaymentScheduleDropdown } from "@/features/paymentScheduleMaster/paymentScheduleDropDown";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { fetchParkingDropdown } from "@/features/parking/parkingDropDown";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import type { ParkingData } from "@/features/parking/models/ParkingModel";
import { fetchTncMasterDropdown } from "@/features/tnc/tncDropDown";
import RichTextEditor from "@/ui/components/forms/RichTextEditor";
import { sendOTP } from "@/features/technical/services/OTPService";
import CompleteVerificationSection from "@/ui/components/TwoWayVerification/CompleteVerificationSection";
import { getBookingVerificationSteps } from "@/features/booking/utils/bookingVerificationSteps";
import type { FilterWithPaginationOtherChargesRequest, OtherChargesData } from "@/features/otherCharges/models/OtherChargesModel";
import { otherChargesService } from "@/features/otherCharges/services/OtherChargesService";
import { mapOtherChargesToBookingOtherCharges } from "@/features/booking/utils/MapOtherCharges";
import { fetchPaymentScheduleSchemeMasterDropDown } from "@/features/paymentScheduleSchemeMaster/PaymentScheduleSchemeMasterDropdown";
import type { FilterWithPaginationPaymentScheduleMasterRequest } from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import { paymentScheduleMasterService } from "@/features/paymentScheduleMaster/services/PaymentScheduleMasterService";
import { mapPaymentScheduleToBookingPaymentSchedule } from "../utils/MapPaymentSchedule";
import type { EnquiryData } from "@/features/enquiry/models/EnquiryModel";
import { DataTableDraggable } from "@/ui/components/DataTable/DataTableDraggable";

const initialFormState = (): AddUpdateBookingRequest => ({
  BookingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ProjectId: 0,
  EnquiryId: 0,
  PermanentAddress: "",
  CommunicationAddress: "",
  BrokeragePercentage: 0,
  BrokerageAmount: 0,
  ReferelPercentage: 0,
  ReferelAmount: 0,

  LoyaltyPercentage: 0,
  LoyaltyAmount: 0,

  EmployeeReferencePercentage: 0,
  EmployeeReferenceAmount: 0,

  InventoryFlatId: 0,
  AgreementValue: 0,
  AgreementValueTDS: 0,
  AgreementValueGSTPercentage: 0,
  AgreementValueGSTAmount: 0,
  StampDutyPercentage: 0,
  StampDutyAmount: 0,
  RegistrationFees: 0,
  ParkingId: "",
  NumberOfParking: 0,
  HandoverType: "",
  RegistrationDate: null,
  SourceOfFunding: "",
  FlatAlterationRemark: "",
  PaymentRemark: "",
  OtherRemark: "",
  TermsAndConditionsDescription: "",
  BookingType: "",
  OtherChargesDetailJSON: null,
  PaymentScheduleSchemeMasterId: 0,
  PaymentScheduleDetailJSON: null,
  BookingAmount: 0,
  ChequeRTGSNumber: "",
  ChequeRTGSDate: null,
  BankListMasterId: 0,
  TransferBookingId: 0,
  TenantId: 0,
  OTP: "",
});

const initialFormStateApplicantDetails = (): AddUpdateBookingApplicantRequest => ({
  BookingApplicantId: 0,
  ApplicantType: "",
  ApplicantName: "",
  ApplicantMobileNumber: "",
  ApplicantEmailId: "",
  PhotoURL: null,
  RemovePhotoURL: "",
  AadharCardNumber: "",
  AadharCardURL: null,
  RemoveAadharCardURL: "",
  PanNumber: "",
  PanCardURL: null,
  RemovePanCardURL: "",
  PassportNumber: "",
  PassportURL: null,
  RemovePassportURL: "",
  DrivingLicenseNumber: "",
  DrivingLicenseURL: null,
  RemoveDrivingLicenseURL: "",
  VotingIdNumber: "",
  VotingIdURL: null,
  RemoveVotingIdURL: "",
  GSTNumber: "",
  GSTNumberURL: null,
  RemoveGSTNumberURL: "",
});

type BookingApplicantWithFiles = BookingApplicantData & {
  _photoFiles?: (File | string)[];
  _aadharFiles?: (File | string)[];
  _panFiles?: (File | string)[];
  _passportFiles?: (File | string)[];
  _drivingFiles?: (File | string)[];
  _votingFiles?: (File | string)[];
  _gstFiles?: (File | string)[];
  RemovePhotoURL?: string;
  RemoveAadharCardURL?: string;
  RemovePanCardURL?: string;
  RemovePassportURL?: string;
  RemoveDrivingLicenseURL?: string;
  RemoveVotingIdURL?: string;
  RemoveGSTNumberURL?: string;
};

export const AddUpdateBooking: React.FC = () => {
  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateBookingRequest>(() => initialFormState());
  const [applicantList, setApplicantList] = useState<BookingApplicantWithFiles[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [parkingId, setParkingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useProject();

  //#region BOOKING LIST STATE CONTEXT
  const { listState, updateListState } = useBookingListState();
  const { bookingId } = listState;
  //#endregion

  // Track source page for navigation after submit
  const [sourcePage, setSourcePage] = useState<"inventory" | "parking" | "booking" | null>(null);

  const isAddMode = bookingId === 0;
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions("/booking");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  //#endregion

  //#region ENQUIRY DETAILS
  const [enquiryList, setEnquiryMasterList] = useState<EnquiryData | null>(null)
  const [enquiryUniqueCode, setEnquiryUniqueCode] = useState<string>();
  const [enquiryId, setEnquiryId] = useState<number | null>(null);

  //#endregion

  //#region BOOKING APPLICANT
  const [formDataForApplicant, setFormDataForApplicant] = useState<AddUpdateBookingApplicantRequest>(() => initialFormStateApplicantDetails());
  const [editingApplicantData, setEditingApplicantData] = useState<{ row: BookingApplicantWithFiles; index: number } | null>(null);

  const [isAddUpdateApplicantModalOpen, setIsAddUpdateApplicantModalOpen] = useState(false);

  // ================= PHOTO =================
  const [applicantPhotoFiles, setApplicantPhotoFiles] = useState<(File | string)[]>([]);
  const [removedApplicantPhotoURLs, setRemovedApplicantPhotoURLs] = useState<string[]>([]);

  // ================= AADHAR =================
  const [aadharCardFiles, setAadharCardFiles] = useState<(File | string)[]>([]);
  const [removedAadharCardURLs, setRemovedAadharCardURLs] = useState<string[]>([]);

  // ================= PAN =================
  const [panCardFiles, setPanCardFiles] = useState<(File | string)[]>([]);
  const [removedPanCardURLs, setRemovedPanCardURLs] = useState<string[]>([]);

  // ================= PASSPORT =================
  const [passportFiles, setPassportFiles] = useState<(File | string)[]>([]);
  const [removedPassportURLs, setRemovedPassportURLs] = useState<string[]>([]);

  // ================= DRIVING LICENSE =================
  const [drivingLicenseFiles, setDrivingLicenseFiles] = useState<(File | string)[]>([]);
  const [removedDrivingLicenseURLs, setRemovedDrivingLicenseURLs] = useState<string[]>([]);

  // ================= VOTING ID =================
  const [votingIdFiles, setVotingIdFiles] = useState<(File | string)[]>([]);
  const [removedVotingIdURLs, setRemovedVotingIdURLs] = useState<string[]>([]);

  // ================= GST =================
  const [gstFiles, setGstFiles] = useState<(File | string)[]>([]);
  const [removedGstURLs, setRemovedGstURLs] = useState<string[]>([]);

  //ERROR SET UP
  const [errorsBookingApplicant, setErrorsBookingApplicant] = useState<{ [k: string]: string }>({});

  //DELETE BOOKING APPLICANT STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteBookingApplicantData, setDeleteBookingApplicantData] = useState<{ row: BookingApplicantWithFiles; index: number } | null>(null);
  //#endregion

  //#region INVENTORY SELECTION STATE
  const [selectedWing, setSelectedWing] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedFlatData, setSelectedFlatData] = useState<InventoryFlatData | null>(null);
  const [parkingData, setParkingData] = useState<ParkingData[]>([]);
  const [selectedParkingValues, setSelectedParkingValues] = useState<string | number | null>(null);

  //COMPLETE VERIFICATION

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);

  const [dropdownLabels, setDropdownLabels] = useState<{
    buildingName?: string;
    bankName?: string;
    parkingNumber?: string;
    paymentScheduleScheme?: string;
    parkingCategory?: string;
    parkingType?: string;
    parkingSubType?: string;
    parkingDimensions?: string;
    isEVChargingAvailable?: boolean;
    buildingNumber?: string;
    floor?: string;
    wing?: string;
  }>({});

  //#region PAYMENT SCHEDULE STATE
  const [paymentSchedules, setPaymentSchedules] = useState<AddUpdateBookingPaymentScheduleRequest[]>([]);
  const [paymentScheduleOptions, setPaymentScheduleOptions] = useState<{ label: string; value: string }[]>([]);

  const [isPaymentScheduleModalOpen, setIsPaymentScheduleModalOpen] = useState(false);
  const [paymentScheduleType, setPaymentScheduleType] = useState<"Date" | "Stage">("Date");
  const [paymentScheduleDate, setPaymentScheduleDate] = useState<string>("");
  const [paymentScheduleStage, setPaymentScheduleStage] = useState<string>("");
  const [paymentScheduleStageOther, setPaymentScheduleStageOther] = useState<string>("");
  const [paymentSchedulePercentage, setPaymentSchedulePercentage] = useState<string>("");
  const [editingPaymentScheduleIndex, setEditingPaymentScheduleIndex] = useState<number | null>(null);
  //#endregion

  //#region OTHER CHARGES STATE
  const [otherCharges, setOtherCharges] = useState<AddUpdateBookingOtherChargesRequest[]>([]);
  const [otherChargesData, setOtherChargesData] = useState<OtherChargesData[]>([]);
  //#endregion

  //#region PAYMENT SCHEDULE CALCULATIONS
  const totalPercentage = useMemo(() => {
    return paymentSchedules.reduce((sum, schedule) => {
      return sum + (schedule.PaymentSchedulePercentage || 0);
    }, 0);
  }, [paymentSchedules]);

  const cumulativePercentages = useMemo(() => {
    let cumulative = 0;
    return paymentSchedules.map((schedule) => {
      cumulative += schedule.PaymentSchedulePercentage || 0;
      return cumulative;
    });
  }, [paymentSchedules]);

  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!projectId) return;

    const flatDataFromState = (location.state as any)?.flatData;

    const parkingDataFromState = (location.state as any)?.parkingData;

    if (flatDataFromState && flatDataFromState.PageName === "UNIT BOOK") {

      setSourcePage("inventory");

      setFormData((prev) => ({
        ...prev,
        ProjectId: Number(projectId),
        InventoryFlatId: flatDataFromState.InventoryFlatId || 0,
        BookingType: "FLAT",
      }));

      setSelectedFlatData({
        InventoryFlatId: flatDataFromState.InventoryFlatId || 0,
        Uniquekey: "",
        InventoryBuildingId: flatDataFromState.InventoryBuildingId || 0,
        BuildingNumber: flatDataFromState.BuildingNumber || "",
        InventoryFlatFloorBasementPodiumWingId: flatDataFromState.InventoryFlatFloorBasementPodiumWingId || 0,
        Wing: flatDataFromState.Wing || "",
        InventoryFloorId: 0,
        Floor: flatDataFromState.Floor || "",
        Flat: flatDataFromState.Flat || "",
        RERACarpetAreaSqFt: flatDataFromState.RERACarpetAreaSqFt || 0,
        FlatType: flatDataFromState.FlatType || "",
        FlatConfiguration: flatDataFromState.FlatConfiguration || "",
        FlatStatus: "Available",
        FlatFacing: "",
        InventoryFlatSpecificationData: [],
        OwnerName: "",
        CreatedById: 0,
        CreatedBy: "",
        CreatedDate: "",
        ModifiedById: 0,
        ModifiedBy: "0",
        ModifiedDate: "",
        BookingId: 0,
        BookingCreatedById: 0,
        BookingCreatedBy: "",
        BookingCreatedDate: null,
      });

      // Set selected values for display
      setSelectedWing(flatDataFromState.Wing || "");
      setSelectedFloor(flatDataFromState.Floor || "");
    } else if (parkingDataFromState && parkingDataFromState.PageName === "PARKING BOOK") {
      setSourcePage("parking");

      const parkingIdString = parkingDataFromState.ParkingId?.toString() || "";

      setFormData((prev) => ({
        ...prev,
        ProjectId: Number(projectId),
        ParkingId: parkingIdString,
        BookingType: "PARKING",
      }));

      setSelectedParkingValues(parkingIdString);

      setDropdownLabels({
        parkingNumber: parkingDataFromState.ParkingNumber || "",
        parkingCategory: parkingDataFromState.ParkingCategory || "",
        parkingType: parkingDataFromState.ParkingType || "",
        parkingSubType: parkingDataFromState.ParkingSubType || "",
        parkingDimensions: parkingDataFromState.ParkingDimensions || "",
        isEVChargingAvailable: parkingDataFromState.IsEVChargingAvailable || false,
        buildingNumber: parkingDataFromState.BuildingNumber || "",
        floor: parkingDataFromState.Floor || "",
        wing: parkingDataFromState.Wing || "",
      });
    } else if (!isAddMode && bookingId) {
      setSourcePage("booking");
      fetchBookingDetails();
    } else {
      setSourcePage("booking");
      setFormData((prev) => ({ ...prev, ProjectId: Number(projectId) }));
    }
  }, [bookingId, projectId, isAddMode, location.state]);
  //#endregion

  //#region HANDLE SEARCH CHANGE EVENT CHANNEL PARTNER


  useEffect(() => {

    const code = enquiryUniqueCode?.trim();
    const hasEnquiryId = Number(enquiryId) > 0;
    const hasValidCode = code && code.length === 18;

    if (hasEnquiryId) {

      fetchEnquiryBySystemGeneratedCode("", Number(projectId), Number(enquiryId)).then(handleEnquiryResponse);
      return;
    }

    if (hasValidCode) {
      fetchEnquiryBySystemGeneratedCode(code, Number(projectId), 0).then(handleEnquiryResponse);
      return;
    }
    if (!hasEnquiryId || !hasValidCode) {

      setEnquiryId(0);

      setFormData(prev => ({
        ...prev,
        EnquiryId: 0
      }));

      setEnquiryMasterList(null);

    }

  }, [enquiryUniqueCode, projectId, enquiryId]);

  const handleEnquiryResponse = (enquiry: any) => {

    setEnquiryId(enquiry?.EnquiryId);

    setFormData(prev => ({
      ...prev,
      EnquiryId: enquiry?.EnquiryId
    }));

    setEnquiryMasterList(enquiry);

  };

  //#endregion

  //#region FETCH BOOKING DETAILS
  const fetchBookingDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationBookingRequest = {
          PageNumber: 1,
          PageSize: 1,
          BookingId: bookingId,
          ProjectId: Number(projectId),
        };

        const response = await bookingService.apiCallPullBooking(params);

        if (E.isRight(response)) {
          const booking = response.right.Data?.[0];

          if (booking) {
            setFormData({
              BookingId: booking.BookingId ?? 0,
              Uniquekey: booking.Uniquekey,
              ProjectId: booking.ProjectId ?? Number(projectId),
              EnquiryId: booking.EnquiryId ?? 0,
              PermanentAddress: booking.PermanentAddress ?? "",
              CommunicationAddress: booking.CommunicationAddress ?? "",
              BrokeragePercentage: booking.BrokeragePercentage ?? 0,
              BrokerageAmount: booking.BrokerageAmount ?? 0,
              ReferelPercentage: booking.ReferelPercentage ?? 0,
              ReferelAmount: booking.ReferelAmount ?? 0,

              LoyaltyPercentage: booking.LoyaltyPercentage ?? 0,
              LoyaltyAmount: booking.LoyaltyAmount ?? 0,

              EmployeeReferencePercentage: booking.EmployeeReferencePercentage ?? 0,
              EmployeeReferenceAmount: booking.EmployeeReferenceAmount ?? 0,
              InventoryFlatId: booking.InventoryFlatId ?? 0,

              AgreementValue: booking.AgreementValue ?? 0,
              AgreementValueTDS: booking.AgreementValueTDS ?? 0,
              AgreementValueGSTPercentage: booking.AgreementValueGSTPercentage ?? 0,
              AgreementValueGSTAmount: booking.AgreementValueGSTAmount ?? 0,
              StampDutyPercentage: booking.StampDutyPercentage ?? 0,
              StampDutyAmount: booking.StampDutyAmount ?? 0,
              RegistrationFees: booking.RegistrationFees ?? 0,
              ParkingId: booking.ParkingId ?? "",
              NumberOfParking: booking.NumberOfParking ?? 0,
              HandoverType: booking.HandoverType ?? "",
              RegistrationDate: booking.RegistrationDate,
              SourceOfFunding: booking.SourceOfFunding ?? "",
              FlatAlterationRemark: booking.FlatAlterationRemark ?? "",
              PaymentRemark: booking.PaymentRemark ?? "",
              OtherRemark: booking.OtherRemark ?? "",
              TermsAndConditionsDescription: booking.TermsAndConditionsDescription ?? "",
              BookingType: booking.BookingType,
              OtherChargesDetailJSON: booking.BookingOtherChargesData ? JSON.stringify(booking.BookingOtherChargesData) : null,
              PaymentScheduleSchemeMasterId: booking.PaymentScheduleSchemeMasterId ?? 0,
              PaymentScheduleDetailJSON: booking.BookingPaymentScheduleData ? JSON.stringify(booking.BookingPaymentScheduleData) : null,
              BookingAmount: booking.BookingAmount ?? 0,
              ChequeRTGSNumber: booking.ChequeRTGSNumber ?? "",
              ChequeRTGSDate: booking.ChequeRTGSDate,
              BankListMasterId: booking.BankListMasterId ?? 0,
              TransferBookingId: booking.TransferBookingId ?? 0,
              TenantId: booking.TenantId ?? 0,
            });

            setEnquiryUniqueCode(booking.SystemGeneratedCode ?? "");

            if (booking.BookingType?.toUpperCase() === "FLAT") {

              setSelectedFlatData({
                InventoryFlatId: booking.InventoryFlatId || 0,
                Uniquekey: "",
                InventoryBuildingId: booking.InventoryBuildingId || 0,
                BuildingNumber: booking.BuildingNumber || "",
                InventoryFlatFloorBasementPodiumWingId: booking.InventoryFlatFloorBasementPodiumWingId || 0,
                Wing: booking.Wing || "",
                InventoryFloorId: 0,
                Floor: booking.Floor || "",
                Flat: booking.Flat || "",
                RERACarpetAreaSqFt: booking.RERACarpetAreaSqFt || 0,
                FlatType: booking.FlatType || "",
                FlatConfiguration: booking.FlatConfiguration || "",
                FlatStatus: "Booked",
                FlatFacing: "",
                InventoryFlatSpecificationData: [],
                OwnerName: "",
                CreatedById: 0,
                CreatedBy: "",
                CreatedDate: "",
                ModifiedById: 0,
                ModifiedBy: "0",
                ModifiedDate: "",
                BookingId: 0,
                BookingCreatedById: 0,
                BookingCreatedBy: "",
                BookingCreatedDate: null,
              });
            }
            setParkingId(booking.ParkingId ?? null);
            setSelectedParkingValues(booking.ParkingId ?? "");
            setParkingData(booking.ParkingData || []);

            setEnquiryId(booking.EnquiryId ?? 0);

            if (booking.InventoryFlatId) {
              handleFieldChange("InventoryFlatId", booking.InventoryFlatId);
            }

            setDropdownLabels({
              bankName: booking.BankName || "",
              paymentScheduleScheme: booking.PaymentScheduleScheme || "",
            });

            const applicantsWithFiles = (booking?.BookingApplicantData || []).map((a) => ({
              ...a,
              _photoFiles: parseDocumentUrls(a.PhotoURL ?? ""),
              _aadharFiles: parseDocumentUrls(a.AadharCardURL ?? ""),
              _panFiles: parseDocumentUrls(a.PanCardURL ?? ""),
              _passportFiles: parseDocumentUrls(a.PassportURL ?? ""),
              _drivingFiles: parseDocumentUrls(a.DrivingLicenseURL ?? ""),
              _votingFiles: parseDocumentUrls(a.VotingIdURL ?? ""),
              _gstFiles: parseDocumentUrls(a.GSTNumberURL ?? ""),
            }));

            setApplicantList(applicantsWithFiles);

            const paymentSchedulesMapped: AddUpdateBookingPaymentScheduleRequest[] = (booking?.BookingPaymentScheduleData || []).map((schedule) => ({
              BookingPaymentScheduleId: schedule.BookingPaymentScheduleId ?? 0,
              Type: schedule.Type ?? null,
              Name: schedule.Name ?? null,
              Date: schedule.Date ?? null,
              PaymentSchedulePercentage: schedule.PaymentSchedulePercentage ?? null,
              PaymentScheduleCumulative: schedule.PaymentScheduleCumulative ?? 0,
              PaymentScheduleAmount: schedule.PaymentScheduleAmount ?? null,
              PaymentScheduleGSTAmount: schedule.PaymentScheduleGSTAmount ?? null,
              PaymentScheduleTDSAmount: schedule.PaymentScheduleTDSAmount ?? null,
              Rank: schedule.Rank ?? null,
            }));

            setPaymentSchedules(paymentSchedulesMapped);

            loadPaymentSchedule();

            const otherChargesMapped: AddUpdateBookingOtherChargesRequest[] = (booking?.BookingOtherChargesData || []).map((charge) => ({
              BookingOtherChargesId: charge.BookingOtherChargesId ?? 0,
              Uniquekey: charge.Uniquekey ?? null,
              ChargeName: charge.ChargeName ?? null,
              CalculatedOn: charge.CalculatedOn ?? null,
              Value: charge.Value ?? 0,
              GSTPercentage: charge.GSTPercentage ?? 0,
              GSTValue: charge.GSTValue ?? 0,
            }));

            setOtherCharges(otherChargesMapped);
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
      "Loading Booking",
    );
  };
  //#endregion

  //#region HANDLE FIELD CHANGE
  const handleFieldChange = (field: keyof AddUpdateBookingRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region EDIT BOOKING APPLICANT
  const handleEditApplicant = useCallback((row: BookingApplicantWithFiles, index: number) => {
    const applicantData: AddUpdateBookingApplicantRequest = {
      BookingApplicantId: row.BookingApplicantId ?? 0,
      ApplicantType: row.ApplicantType || "",
      ApplicantName: row.ApplicantName || "",
      ApplicantMobileNumber: row.ApplicantMobileNumber || "",
      ApplicantEmailId: row.ApplicantEmailId || "",
      RemovePhotoURL: "",
      AadharCardNumber: row.AadharCardNumber || "",
      RemoveAadharCardURL: "",
      PanNumber: row.PanNumber || "",
      RemovePanCardURL: "",
      PassportNumber: row.PassportNumber || "",
      RemovePassportURL: "",
      DrivingLicenseNumber: row.DrivingLicenseNumber || "",
      RemoveDrivingLicenseURL: "",
      VotingIdNumber: row.VotingIdNumber || "",
      RemoveVotingIdURL: "",
      GSTNumber: row.GSTNumber || "",
      RemoveGSTNumberURL: "",
      PhotoURL: null,
      AadharCardURL: null,
      PanCardURL: null,
      PassportURL: null,
      DrivingLicenseURL: null,
      VotingIdURL: null,
      GSTNumberURL: null,
    };

    setEditingApplicantData({ row, index });
    setFormDataForApplicant(applicantData);

    setApplicantPhotoFiles(row._photoFiles ?? []);
    setRemovedApplicantPhotoURLs([]);
    setAadharCardFiles(row._aadharFiles ?? []);
    setRemovedAadharCardURLs([]);
    setPanCardFiles(row._panFiles ?? []);
    setRemovedPanCardURLs([]);
    setPassportFiles(row._passportFiles ?? []);
    setRemovedPassportURLs([]);
    setDrivingLicenseFiles(row._drivingFiles ?? []);
    setRemovedDrivingLicenseURLs([]);
    setVotingIdFiles(row._votingFiles ?? []);
    setRemovedVotingIdURLs([]);
    setGstFiles(row._gstFiles ?? []);
    setRemovedGstURLs([]);

    setIsAddUpdateApplicantModalOpen(true);
  }, []);
  //#endregion

  //#region DELETE BOOKING APPLICANT CONFIRMATION DIALOG
  const handleConfirmationDialogBoxOpen = (row: BookingApplicantWithFiles, index: number) => {
    setDeleteBookingApplicantData({ row, index });
    setIsConfirmationDialogBoxOpen(true);
  };
  //#endregion

  //#region APPLICANT TABLE COLUMN
  const applicantColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "ApplicantName",
        label: "Applicant Name",
        width: "15",
        sortable: false,
        align: "left",
        fixed: "left",
        render: (value, row) => {
          return <MultiImageViewer images={parseDocumentUrls(row.PhotoURL)} title="Applicant Document" triggerLabel={value || "-"} isWrap={false} />;
        },
      },
      {
        key: "ApplicantType",
        label: "Type",
        width: "15",
        sortable: false,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "ApplicantMobileNumber",
        label: "Mobile Number",
        width: "15",
        sortable: false,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "ApplicantEmailId",
        label: "Email Id",
        width: "15",
        sortable: false,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "AadharCardNumber",
        label: "Aadhaar",
        width: "15",
        sortable: false,
        align: "center",
        render: (value: string, row: any) => {
          return <MultiImageViewer images={parseDocumentUrls(row.AadharCardURL)} title="Aadhar Card Document" triggerLabel={value || "-"} isWrap={false} />;
        },
      },
      {
        key: "PanNumber",
        label: "PAN",
        width: "15",
        sortable: false,
        align: "center",
        render: (value: string, row: any) => {
          return <MultiImageViewer images={parseDocumentUrls(row.PanCardURL)} title="Pan Card Document" triggerLabel={value || "-"} isWrap={false} />;
        },
      },
      {
        key: "PassportNumber",
        label: "Passport",
        width: "15",
        sortable: false,
        align: "center",
        render: (value: string, row: any) => {
          return <MultiImageViewer images={parseDocumentUrls(row.PassportURL)} title="Passport Number Document" triggerLabel={value || "-"} isWrap={false} />;
        },
      },
      {
        key: "DrivingLicenseNumber",
        label: "Driving License",
        width: "15",
        sortable: false,
        align: "center",
        render: (value: string, row: any) => {
          return <MultiImageViewer images={parseDocumentUrls(row.DrivingLicenseURL)} title="Driving License Document" triggerLabel={value || "-"} isWrap={false} />;
        },
      },
      {
        key: "VotingIdNumber",
        label: "Voting",
        width: "15",
        sortable: false,
        align: "center",
        render: (value: string, row: any) => {
          return <MultiImageViewer images={parseDocumentUrls(row.VotingIdURL)} title="Voting Id Document" triggerLabel={value || "-"} isWrap={false} />;
        },
      },
      {
        key: "GSTNumber",
        label: "GST",
        width: "15",
        sortable: false,
        align: "center",
        render: (value: string, row: any) => {
          return <MultiImageViewer images={parseDocumentUrls(row.GSTNumberURL)} title="GST Document" triggerLabel={value || "-"} isWrap={false} />;
        },
      },
      {
        key: "actions",
        label: "Actions",
        width: "12",
        fixed: "right",
        align: "center",
        render: (_value, row, index) =>
          canAction ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEditApplicant(row, index);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                title="Edit Applicant"
                leftIcon={<Edit className="h-4 w-4" />}
              ></Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirmationDialogBoxOpen(row, index);
                }}
                color="transparent"
                isborderRadius
                size="sm"
                style={{ color: "red" }}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null,
      },
    ],
    [handleEditApplicant, handleConfirmationDialogBoxOpen, applicantList, canAction],
  );
  //#endregion

  //#region PAYMENT SCHEDULE TABLE COLUMN
  const paymentScheduleColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "Type",
        label: "Type",
        sortable: false,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "Date",
        label: "Date / Stage",
        sortable: false,
        align: "left",

        render: (_value, row) => {

          if (row.Type === "Date" && row.Date) {

            return formatDate_dd_MonthName_yy(row.Date);

          } else if (row.Type === "Stage" && row.Name) {

            return row.Name;
          }
          return "-";
        },
      },
      {
        key: "PaymentSchedulePercentage",
        label: "Percentage (%)",
        sortable: false,
        align: "center",
        render: (value) => `${value || 0}%`,
      },
      {
        key: "Cumulative",
        label: "Cumulative (%)",
        sortable: false,
        align: "center",
        render: (_value, _row, index) => {
          return `${cumulativePercentages[index]?.toFixed(2) || 0}%`;
        },
      },
      {
        key: "PaymentScheduleAmount",
        label: "Amount (₹)",
        sortable: false,
        align: "right",
        render: (value) => {
          if (!value) return "-";
          return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
      },
      {
        key: "PaymentScheduleGSTAmount",
        label: "GST Amount (₹)",
        sortable: false,
        align: "right",
        render: (value) => {
          if (!value) return "-";
          return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
      },
      {
        key: "PaymentScheduleTDSAmount",
        label: "TDS Amount (₹)",
        sortable: false,
        align: "right",
        render: (value) => {
          if (!value) return "-";
          return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
      },
      ...(formData.PaymentScheduleSchemeMasterId !== 0 ? [] : [
        {
          key: "actions",
          label: "Actions",
          render: (_value: any, row: any, index: number) =>
            canAction ? (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingPaymentScheduleIndex(index);
                    setPaymentScheduleType(row.Type === "Date" || row.Type === "Stage" ? row.Type : "Date");
                    setPaymentScheduleDate(row.Date ? formatDate_dd_mm_yyyy(row.Date) : "");

                    const stageExists = paymentScheduleOptions.some((opt) => opt.value === row.Name);
                    if (row.Type === "Stage" && row.Name && !stageExists) {
                      setPaymentScheduleStage("Other");
                      setPaymentScheduleStageOther(row.Name || "");
                    } else {
                      setPaymentScheduleStage(row.Name || "");
                      setPaymentScheduleStageOther("");
                    }

                    setPaymentSchedulePercentage(String(row.PaymentSchedulePercentage || ""));
                    setIsPaymentScheduleModalOpen(true);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  title="Edit Payment Schedule"
                  leftIcon={<Edit className="h-4 w-4" />}
                ></Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPaymentSchedules((prev) => prev.filter((_, i) => i !== index));
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{ color: "red" }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null,
        },
      ]),

    ],
    [cumulativePercentages, canAction, paymentScheduleOptions],
  );
  //#endregion

  //#region OTHER CHARGES TABLE COLUMN
  const otherChargesColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "ChargeName",
        label: "Charges",
        width: "20",
        sortable: false,
        align: "left",
        fixed: "left",
        render: (value) => value || "-",
      },
      {
        key: "CalculatedOn",
        label: "Calculated On",
        width: "15",
        sortable: false,
        align: "center",
        render: (value) => value || "-",
      },
      {
        key: "Value",
        label: "Value (₹)",
        width: "18",
        sortable: false,
        align: "right",
        render: (value) => {
          if (!value) return "-";
          return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
      },
      {
        key: "GSTPercentage",
        label: "GST (%)",
        width: "12",
        sortable: false,
        align: "center",
        render: (value) => `${value || 0}%`,
      },
      {
        key: "GSTValue",
        label: "GST Value (₹)",
        width: "18",
        sortable: false,
        align: "right",
        render: (value) => {
          if (!value) return "-";
          return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
      },
    ],
    [canAction],
  );
  //#endregion

  //#region HANDLE CHANGE EVENT FOR APPLICANT
  const handleFieldChangeBookingApplicant = (field: keyof AddUpdateBookingApplicantRequest, value: any) => {
    setFormDataForApplicant((prev) => ({ ...prev, [field]: value }));
    if (errorsBookingApplicant[field]) {
      setErrorsBookingApplicant((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region VALIDATION
  const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ProjectId || formData.ProjectId === 0) {
      newErrors.ProjectId = "Project is required";
    }
    if (!formData.EnquiryId || formData.EnquiryId === 0) {
      newErrors.EnquiryId = "Enquiry Code is required";
    }

    if (!formData.PermanentAddress) {
      newErrors.PermanentAddress = "Permanent Address is required";
    }
    if (!formData.CommunicationAddress) {
      newErrors.CommunicationAddress = "Communication Address is required";
    }

    if (!formData.AgreementValue || formData.AgreementValue === 0) {
      newErrors.AgreementValue = "Agreement Value is required";
    }
    if (!formData.AgreementValueGSTPercentage) {
      newErrors.AgreementValueGSTPercentage = "Agreement GST (%) is required";
    } else if (formData.AgreementValueGSTPercentage === 0) {
      newErrors.AgreementValueGSTPercentage = "Agreement GST (%) is required";
    }

    if (!formData.StampDutyPercentage) {
      newErrors.StampDutyPercentage = "Stamp Duty (%) is required";
    } else if (formData.StampDutyPercentage === 0) {
      newErrors.StampDutyPercentage = "Stamp Duty (%) is required";
    }

    if (!formData.HandoverType) {
      newErrors.HandoverType = "Handover Type is required";
    }

    if (!formData.SourceOfFunding) {
      newErrors.SourceOfFunding = "Source Of Funding is required";
    }

    if (formData.PaymentScheduleSchemeMasterId === null) {
      newErrors.PaymentScheduleSchemeMasterId = "Payment Schedule Scheme is required";
    }

    if (!formData.RegistrationDate) {
      newErrors.RegistrationDate = "Registration Date is required";
    }

    if (applicantList.length === 0) {
      addToast({ type: "error", title: "At least one applicant is required" });
      return { isValid: false, errors: newErrors };
    }

    if (paymentSchedules.length === 0) {
      addToast({ type: "error", title: "Payment schedule is required" });
      return { isValid: false, errors: newErrors };
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const validateAddApplicantForm = (): {
    isValid: boolean;
    errorsBookingApplicant: { [key: string]: string };
  } => {
    const newErrorsBookingApplicant: { [key: string]: string } = {};

    if (!formDataForApplicant.ApplicantType?.trim()) {
      newErrorsBookingApplicant.ApplicantType = "Applicant Type is required";
    }

    if (!formDataForApplicant.ApplicantName?.trim()) {
      newErrorsBookingApplicant.ApplicantName = "Applicant Name is required";
    }

    if (!formDataForApplicant.ApplicantMobileNumber?.trim()) {
      newErrorsBookingApplicant.ApplicantMobileNumber = "Mobile Number is required";
    } else if (!isValidMobile(formDataForApplicant.ApplicantMobileNumber.trim())) {
      newErrorsBookingApplicant.ApplicantMobileNumber = "Enter a valid 10-Digit Mobile Number";
    }

    if (formDataForApplicant.ApplicantEmailId?.trim() && !isValidEmail(formDataForApplicant.ApplicantEmailId.trim())) {
      newErrorsBookingApplicant.ApplicantEmailId = "Enter a valid Email Id";
    }

    const mergedPhotoFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, removedApplicantPhotoURLs) : applicantPhotoFiles.slice();

    if (mergedPhotoFiles.length === 0) {
      newErrorsBookingApplicant.PhotoURL = "Applicant Photo is required";
    }

    const mergedAadharFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, removedAadharCardURLs) : aadharCardFiles.slice();
    const AadharCardNumber = formDataForApplicant.AadharCardNumber?.trim() || "";
    const hasAadharCardNumber = AadharCardNumber !== "";
    const hasAadharCardNumberFile = mergedAadharFiles.length > 0;

    if (!hasAadharCardNumber) {
      newErrorsBookingApplicant.AadharCardNumber = "Enter a valid Aadhaar Card Number";
    } else if (!isValidAadhaar(AadharCardNumber)) {
      newErrorsBookingApplicant.AadharCardNumber = "Enter a valid Aadhaar Card Number";
    }

    if (hasAadharCardNumber && !hasAadharCardNumberFile) {
      newErrorsBookingApplicant.AadharCardURL = "Aadhaar document is required";
    }

    const mergedPanFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._panFiles, panCardFiles, removedPanCardURLs) : panCardFiles.slice();
    const PanNumber = formDataForApplicant.PanNumber?.trim() || "";
    const hasPanNumber = PanNumber !== "";
    const hasPanFile = mergedPanFiles.length > 0;

    if (!hasPanNumber) {
      newErrorsBookingApplicant.PanNumber = "Enter a valid PAN Card Number";
    } else if (!isValidPAN(PanNumber)) {
      newErrorsBookingApplicant.PanNumber = "Enter a valid PAN Card Number";
    }
    if (!hasPanFile) {
      newErrorsBookingApplicant.PanCardURL = "PAN document is required";
    }

    const mergedPassportFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._passportFiles, passportFiles, removedPassportURLs) : passportFiles.slice();
    const PassportNumber = formDataForApplicant.PassportNumber?.trim() || "";
    const hasPassportNumber = PassportNumber !== "";
    const hasPassportFile = mergedPassportFiles.length > 0;

    if (hasPassportNumber && !isValidPassportNumber(PassportNumber)) {
      newErrorsBookingApplicant.PassportNumber = "Enter a valid Passport Number";
    }
    if (hasPassportNumber && !hasPassportFile) {
      newErrorsBookingApplicant.PassportURL = "Passport document is required";
    }
    if (hasPassportFile && !hasPassportNumber) {
      newErrorsBookingApplicant.PassportNumber = "Passport Number is required";
    }

    const mergedDrivingFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, removedDrivingLicenseURLs) : drivingLicenseFiles.slice();
    const DLNumber = formDataForApplicant.DrivingLicenseNumber?.trim() || "";
    const hasDLNumber = DLNumber !== "";
    const hasDLFile = mergedDrivingFiles.length > 0;

    if (hasDLNumber && !isValidDrivingLicenseNumber(DLNumber)) {
      newErrorsBookingApplicant.DrivingLicenseNumber = "Enter a valid Driving License Number";
    }
    if (hasDLNumber && !hasDLFile) {
      newErrorsBookingApplicant.DrivingLicenseURL = "Driving License document is required";
    }
    if (hasDLFile && !hasDLNumber) {
      newErrorsBookingApplicant.DrivingLicenseNumber = "Driving License Number is required";
    }

    const mergedVotingFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._votingFiles, votingIdFiles, removedVotingIdURLs) : votingIdFiles.slice();
    const VotingIdNumber = formDataForApplicant.VotingIdNumber?.trim() || "";
    const hasVotingIdNumber = VotingIdNumber !== "";
    const hasVotingFile = mergedVotingFiles.length > 0;

    if (hasVotingIdNumber && !isValidVoterId(VotingIdNumber)) {
      newErrorsBookingApplicant.VotingIdNumber = "Enter a valid Voting Id Number";
    }
    if (hasVotingIdNumber && !hasVotingFile) {
      newErrorsBookingApplicant.VotingIdURL = "Voting ID document is required";
    }
    if (hasVotingFile && !hasVotingIdNumber) {
      newErrorsBookingApplicant.VotingIdNumber = "Voting ID Number is required";
    }

    const mergedGstFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._gstFiles, gstFiles, removedGstURLs) : gstFiles.slice();
    const GSTNumber = formDataForApplicant.GSTNumber?.trim() || "";
    const hasGSTNumber = GSTNumber !== "";
    const hasGSTFile = mergedGstFiles.length > 0;

    if (hasGSTNumber && !isValidGST(GSTNumber)) {
      newErrorsBookingApplicant.GSTNumber = "Enter a valid GST Number";
    }
    if (hasGSTNumber && !hasGSTFile) {
      newErrorsBookingApplicant.GSTNumberURL = "GST document is required";
    }
    if (hasGSTFile && !hasGSTNumber) {
      newErrorsBookingApplicant.GSTNumber = "GST Number is required";
    }

    return {
      isValid: Object.keys(newErrorsBookingApplicant).length === 0,
      errorsBookingApplicant: newErrorsBookingApplicant,
    };
  };
  //#endregion

  //#region ADD UPDATE BOOKING APPLICANT
  const handleAddUpdateBookingApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsBookingApplicant({});

    const validation = validateAddApplicantForm();

    if (!validation.isValid) {
      setErrorsBookingApplicant(validation.errorsBookingApplicant);
      return;
    }

    const finalRemovedPhotoURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, removedApplicantPhotoURLs) : removedApplicantPhotoURLs;
    const finalRemovedAadharURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, removedAadharCardURLs) : removedAadharCardURLs;
    const finalRemovedPanURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._panFiles, panCardFiles, removedPanCardURLs) : removedPanCardURLs;
    const finalRemovedPassportURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._passportFiles, passportFiles, removedPassportURLs) : removedPassportURLs;
    const finalRemovedDrivingURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, removedDrivingLicenseURLs) : removedDrivingLicenseURLs;
    const finalRemovedVotingURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._votingFiles, votingIdFiles, removedVotingIdURLs) : removedVotingIdURLs;
    const finalRemovedGstURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._gstFiles, gstFiles, removedGstURLs) : removedGstURLs;

    const mergedPhotoFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, finalRemovedPhotoURLs) : applicantPhotoFiles.slice();
    const mergedAadharFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, finalRemovedAadharURLs) : aadharCardFiles.slice();
    const mergedPanFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._panFiles, panCardFiles, finalRemovedPanURLs) : panCardFiles.slice();
    const mergedPassportFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._passportFiles, passportFiles, finalRemovedPassportURLs) : passportFiles.slice();
    const mergedDrivingFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, finalRemovedDrivingURLs) : drivingLicenseFiles.slice();
    const mergedVotingFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._votingFiles, votingIdFiles, finalRemovedVotingURLs) : votingIdFiles.slice();
    const mergedGstFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._gstFiles, gstFiles, finalRemovedGstURLs) : gstFiles.slice();

    const applicantToSave: BookingApplicantWithFiles = {
      BookingApplicantId: editingApplicantData?.row.BookingApplicantId ?? 0,
      ApplicantType: formDataForApplicant.ApplicantType || "",
      ApplicantName: formDataForApplicant.ApplicantName || "",
      ApplicantMobileNumber: formDataForApplicant.ApplicantMobileNumber || "",
      ApplicantEmailId: formDataForApplicant.ApplicantEmailId || "",
      PhotoURL: createFileUrlString(mergedPhotoFiles),
      AadharCardNumber: formDataForApplicant.AadharCardNumber || "",
      AadharCardURL: createFileUrlString(mergedAadharFiles),
      PanNumber: formDataForApplicant.PanNumber || "",
      PanCardURL: createFileUrlString(mergedPanFiles),
      PassportNumber: formDataForApplicant.PassportNumber || "",
      PassportURL: createFileUrlString(mergedPassportFiles),
      DrivingLicenseNumber: formDataForApplicant.DrivingLicenseNumber || "",
      DrivingLicenseURL: createFileUrlString(mergedDrivingFiles),
      VotingIdNumber: formDataForApplicant.VotingIdNumber || "",
      VotingIdURL: createFileUrlString(mergedVotingFiles),
      GSTNumber: formDataForApplicant.GSTNumber || "",
      GSTNumberURL: createFileUrlString(mergedGstFiles),
      CreatedById: 0,
      CreatedBy: "",
      CreatedDate: null,
      ModifiedById: 0,
      ModifiedBy: "",
      ModifiedDate: null,
      _photoFiles: mergedPhotoFiles,
      _aadharFiles: mergedAadharFiles,
      _panFiles: mergedPanFiles,
      _passportFiles: mergedPassportFiles,
      _drivingFiles: mergedDrivingFiles,
      _votingFiles: mergedVotingFiles,
      _gstFiles: mergedGstFiles,
      RemovePhotoURL: finalRemovedPhotoURLs.join(","),
      RemoveAadharCardURL: finalRemovedAadharURLs.join(","),
      RemovePanCardURL: finalRemovedPanURLs.join(","),
      RemovePassportURL: finalRemovedPassportURLs.join(","),
      RemoveDrivingLicenseURL: finalRemovedDrivingURLs.join(","),
      RemoveVotingIdURL: finalRemovedVotingURLs.join(","),
      RemoveGSTNumberURL: finalRemovedGstURLs.join(","),
    };

    setApplicantList((prev) => {
      if (editingApplicantData) {
        const updated = [...prev];
        updated[editingApplicantData.index] = applicantToSave;
        return updated;
      }
      return [...prev, applicantToSave];
    });

    setIsAddUpdateApplicantModalOpen(false);
    setEditingApplicantData(null);
    setFormDataForApplicant(initialFormStateApplicantDetails());
    setApplicantPhotoFiles([]);
    setAadharCardFiles([]);
    setPanCardFiles([]);
    setPassportFiles([]);
    setDrivingLicenseFiles([]);
    setVotingIdFiles([]);
    setGstFiles([]);
  };
  //#endregion

  //#region DELETE BOOKING APPLICANT
  const handleDeleteApplicant = () => {

    if (!deleteBookingApplicantData) return;

    const removeIndex = deleteBookingApplicantData.index;

    if (removeIndex < 0) {
      setIsConfirmationDialogBoxOpen(false);
      setDeleteBookingApplicantData(null);
      addToast({ type: "error", title: "Unable to find the selected applicant to delete" });
      return;
    }

    setApplicantList((prev) => prev.filter((_, i) => i !== removeIndex));
    setIsConfirmationDialogBoxOpen(false);
    setDeleteBookingApplicantData(null);
    addToast({ type: "success", title: "Applicant Removed" });
  };
  //#endregion

  //#region SUBMIT FORM
  const handleSubmit = async () => {
    setErrors({});

    if (paymentSchedules.length > 0 && totalPercentage !== 100) {
      addToast({ type: "error", title: `Payment schedule total must be exactly 100%. Current total is ${totalPercentage.toFixed(2)}%` });
      return;
    }

    if (formData.BookingType === "FLAT" && (!formData.InventoryFlatId || formData.InventoryFlatId === 0)) {
      addToast({ type: "error", title: "Flat is required" });
      return;
    }

    if (formData.BookingType === "PARKING" && (!formData.ParkingId || formData.ParkingId.trim() === "")) {
      addToast({ type: "error", title: "Parking is required" });
      return;
    }

    if (formData.BookingId === 0 && enquiryList?.FinalStage === "Booking Done") {
      addToast({ type: "error", title: "Booking already done for this enquiry" });
      return;
    }

    const validation = validateForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      addToast({ type: "error", title: "Please fill the required filed" });

      return;
    }

    if (formData.BookingId === 0 && !isOtpVerified) {
      if (!isOtpSent) {
        const sent = await sendOTP({
          mobileNumber: applicantList.find((x) => x.ApplicantType === "Applicant")?.ApplicantMobileNumber || "",
          module: "BOOKING",
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
        const formDataToSend = new FormData();

        // Add booking data
        formDataToSend.append("BookingId", String(formData.BookingId ?? 0));
        formDataToSend.append("Uniquekey", formData.Uniquekey ?? "3fa85f64-5717-4562-b3fc-2c963f66afa6");
        formDataToSend.append("ProjectId", String(formData.ProjectId ?? 0));
        formDataToSend.append("EnquiryId", String(enquiryId ?? 0));
        formDataToSend.append("PermanentAddress", formData.PermanentAddress ?? "");
        formDataToSend.append("CommunicationAddress", formData.CommunicationAddress ?? "");
        formDataToSend.append("BrokeragePercentage", String(formData.BrokeragePercentage ?? 0));
        formDataToSend.append("BrokerageAmount", String(formData.BrokerageAmount ?? 0));

        formDataToSend.append("ReferelPercentage", String(formData.ReferelPercentage ?? 0));
        formDataToSend.append("ReferelAmount", String(formData.ReferelAmount ?? 0));

        formDataToSend.append("LoyaltyPercentage", String(formData.LoyaltyPercentage ?? 0));
        formDataToSend.append("LoyaltyAmount", String(formData.LoyaltyAmount ?? 0));

        formDataToSend.append("EmployeeReferencePercentage", String(formData.EmployeeReferencePercentage ?? 0));
        formDataToSend.append("EmployeeReferenceAmount", String(formData.EmployeeReferenceAmount ?? 0));

        formDataToSend.append("InventoryFlatId", String(formData.InventoryFlatId ?? 0));
        formDataToSend.append("AgreementValue", String(formData.AgreementValue ?? 0));
        formDataToSend.append("AgreementValueTDS", String(formData.AgreementValueTDS ?? 0));
        formDataToSend.append("AgreementValueGSTPercentage", String(formData.AgreementValueGSTPercentage ?? 0));
        formDataToSend.append("AgreementValueGSTAmount", String(formData.AgreementValueGSTAmount ?? 0));
        formDataToSend.append("StampDutyPercentage", String(formData.StampDutyPercentage ?? 0));
        formDataToSend.append("StampDutyAmount", String(formData.StampDutyAmount ?? 0));
        formDataToSend.append("RegistrationFees", String(formData.RegistrationFees ?? 0));
        formDataToSend.append("ParkingId", formData.ParkingId ?? "");
        formDataToSend.append("NumberOfParking", String(formData.NumberOfParking ?? 0));
        formDataToSend.append("HandoverType", formData.HandoverType ?? "");
        formDataToSend.append("RegistrationDate", formData.RegistrationDate ?? "");
        formDataToSend.append("SourceOfFunding", formData.SourceOfFunding ?? "");
        formDataToSend.append("FlatAlterationRemark", formData.FlatAlterationRemark ?? "");
        formDataToSend.append("PaymentRemark", formData.PaymentRemark ?? "");
        formDataToSend.append("OtherRemark", formData.OtherRemark ?? "");
        formDataToSend.append("TermsAndConditionsDescription", formData.TermsAndConditionsDescription ?? "");

        formDataToSend.append("BookingType", formData.BookingType ?? "");

        // Convert other charges to JSON
        const otherChargesJSON = otherCharges.length > 0 ? JSON.stringify(otherCharges) : "";
        formDataToSend.append("OtherChargesDetailJSON", otherChargesJSON);

        // Convert payment schedules to JSON
        formDataToSend.append("PaymentScheduleSchemeMasterId", String(formData.PaymentScheduleSchemeMasterId ?? 0));
        const paymentScheduleJSON = paymentSchedules.length > 0 ? JSON.stringify(paymentSchedules) : "";
        formDataToSend.append("PaymentScheduleDetailJSON", paymentScheduleJSON);
        formDataToSend.append("BookingAmount", String(formData.BookingAmount ?? 0));
        formDataToSend.append("ChequeRTGSNumber", formData.ChequeRTGSNumber ?? "");
        formDataToSend.append("ChequeRTGSDate", formData.ChequeRTGSDate ?? "");
        formDataToSend.append("BankListMasterId", String(formData.BankListMasterId ?? 0));
        formDataToSend.append("TransferBookingId", String(formData.TransferBookingId ?? 0));
        formDataToSend.append("TenantId", String(formData.TenantId ?? 0));
        formDataToSend.append("OTP", otp?.trim());

        // Helper function to add files with existing
        const addFilesWithExisting = (fdLocal: FormData, prefix: string, fileArray: (File | string)[] | undefined, fieldKey: string) => {
          if (!fileArray || fileArray.length === 0) return;

          const existingNames = fileArray
            .filter((x) => typeof x === "string" && String(x).trim().length > 0)
            .map((x) => String(x).trim())
            .join(",");

          if (existingNames) {
            fdLocal.append(`${prefix}.${fieldKey}`, existingNames);
          }

          fileArray.forEach((item) => {
            if (item instanceof File) {
              fdLocal.append(`${prefix}.${fieldKey}`, item, item.name);
            }
          });
        };

        // Add applicants
        applicantList.forEach((app, index) => {
          const prefix = `AddUpdateBookingApplicant[${index}]`;

          formDataToSend.append(`${prefix}.BookingApplicantId`, String(app.BookingApplicantId ?? 0));
          formDataToSend.append(`${prefix}.ApplicantType`, app.ApplicantType ?? "");
          formDataToSend.append(`${prefix}.ApplicantName`, app.ApplicantName ?? "");
          formDataToSend.append(`${prefix}.ApplicantMobileNumber`, app.ApplicantMobileNumber ?? "");
          formDataToSend.append(`${prefix}.ApplicantEmailId`, app.ApplicantEmailId ?? "");
          formDataToSend.append(`${prefix}.AadharCardNumber`, app.AadharCardNumber ?? "");
          formDataToSend.append(`${prefix}.PanNumber`, app.PanNumber ?? "");
          formDataToSend.append(`${prefix}.PassportNumber`, app.PassportNumber ?? "");
          formDataToSend.append(`${prefix}.DrivingLicenseNumber`, app.DrivingLicenseNumber ?? "");
          formDataToSend.append(`${prefix}.VotingIdNumber`, app.VotingIdNumber ?? "");
          formDataToSend.append(`${prefix}.GSTNumber`, app.GSTNumber ?? "");

          formDataToSend.append(`${prefix}.RemovePhotoURL`, app.RemovePhotoURL ?? "");
          formDataToSend.append(`${prefix}.RemoveAadharCardURL`, app.RemoveAadharCardURL ?? "");
          formDataToSend.append(`${prefix}.RemovePanCardURL`, app.RemovePanCardURL ?? "");
          formDataToSend.append(`${prefix}.RemovePassportURL`, app.RemovePassportURL ?? "");
          formDataToSend.append(`${prefix}.RemoveDrivingLicenseURL`, app.RemoveDrivingLicenseURL ?? "");
          formDataToSend.append(`${prefix}.RemoveVotingIdURL`, app.RemoveVotingIdURL ?? "");
          formDataToSend.append(`${prefix}.RemoveGSTNumberURL`, app.RemoveGSTNumberURL ?? "");

          const realApp: any = app;
          addFilesWithExisting(formDataToSend, prefix, realApp._photoFiles, "PhotoURL");
          addFilesWithExisting(formDataToSend, prefix, realApp._aadharFiles, "AadharCardURL");
          addFilesWithExisting(formDataToSend, prefix, realApp._panFiles, "PanCardURL");
          addFilesWithExisting(formDataToSend, prefix, realApp._passportFiles, "PassportURL");
          addFilesWithExisting(formDataToSend, prefix, realApp._drivingFiles, "DrivingLicenseURL");
          addFilesWithExisting(formDataToSend, prefix, realApp._votingFiles, "VotingIdURL");
          addFilesWithExisting(formDataToSend, prefix, realApp._gstFiles, "GSTNumberURL");
        });

        const response = await bookingService.apiCallAddUpdateBooking(formDataToSend);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          updateListState({ bookingId: 0, bookingName: "" });

          const redirectPage = sourcePage;

          setSourcePage(null);

          if (redirectPage === "inventory") {
            navigate("/inventory");

          } else if (redirectPage === "parking") {

            navigate("/parking");

          } else {

            navigate("/booking");

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
      isAddMode ? "Adding Booking" : "Updating Booking",
    );
  };
  //#endregion

  //#region FETCH PARKING DROPDOWN WITH PROJECT WISE
  const fetchParkingProjectWise = useCallback(async (pageNumber: number, params?: { value?: string }) => {
    return fetchParkingDropdown(pageNumber, {
      ...params,
      value: params?.value || "",
      projectId: projectId || 0,
      displayParkingId: parkingId || "",
    });
  }, [projectId, parkingId]);

  const parkingDropdown = useMultiSelectDropdown({
    value: selectedParkingValues,
    fetchCallback: fetchParkingProjectWise,
    autoFetchOptions: true,
  });

  //#endregion

  //#region FETCH TNC DROPDOWN WITH MODULE NAME
  const fetchTncByModuleName = (moduleName: string) => (page: number, params?: { value?: string }) =>
    fetchTncMasterDropdown(page, {
      value: params?.value || "",
      moduleName: moduleName,
    });
  //#endregion

  //#region FETCH OTHER CHARGES WHEN FIRST TIME BOOKING MEANS BOOKINGID===0
  const loadOtherCharges = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationOtherChargesRequest = {
          PageNumber: 1,
          PageSize: 500,
          IsCheckPermission: false,
          ProjectId: Number(projectId),
        };

        const response = await otherChargesService.apiCallPullOtherCharges(params);

        if (E.isRight(response)) {

          setOtherChargesData(response.right.Data);

          const flatDataFromState = (location.state as any)?.flatData;

          const rERACarpetAreaSqFt = flatDataFromState?.RERACarpetAreaSqFt ?? selectedFlatData?.RERACarpetAreaSqFt ?? 0;

          const mappedCharges = mapOtherChargesToBookingOtherCharges(rERACarpetAreaSqFt, response.right.Data);

          setOtherCharges(mappedCharges);
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
      "Loading Other Charges",
    );
  };

  //#endregion

  //#region FETCH PAYMENT SCHEDULE SCHEME DROPDOWN WITH PROJECT ID
  const fetchPaymentScheduleSchemeMaster = () => (page: number) =>
    fetchPaymentScheduleSchemeMasterDropDown(page, {
      projectId: Number(projectId),
      inventoryBuildingId: (location.state as any)?.flatData.InventoryBuildingId ?? selectedFlatData?.InventoryBuildingId ?? 0,
      inventoryFlatFloorBasementPodiumWingId: (location.state as any)?.flatData!.InventoryFlatFloorBasementPodiumWingId ?? selectedFlatData?.InventoryFlatFloorBasementPodiumWingId ?? 0,
    });

  //#endregion

  //#region FETCH PAYMENT SCHEDULE WHEN SELECTED PAYMENT SCHEDULE SCHEME
  const loadPaymentScheduleByPaymentScheduleSchemeId = async (schemeId: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const flatDataFromState = (location.state as any)?.flatData;

        const buildingId = flatDataFromState?.InventoryBuildingId ?? selectedFlatData?.InventoryBuildingId ?? 0;

        const wingId = flatDataFromState?.InventoryFlatFloorBasementPodiumWingId ?? selectedFlatData?.InventoryFlatFloorBasementPodiumWingId ?? 0;

        const params: FilterWithPaginationPaymentScheduleMasterRequest = {
          PageNumber: 1,
          PageSize: 500,
          ProjectId: Number(projectId),
          PaymentScheduleSchemeMasterId: schemeId,
          InventoryBuildingId: buildingId,
          InventoryFlatFloorBasementPodiumWingId: wingId,
        };

        const response = await paymentScheduleMasterService.apiCallPullPaymentScheduleMaster(params);

        if (E.isRight(response)) {

          const mappedPaymentSchedule = mapPaymentScheduleToBookingPaymentSchedule(response.right.Data, Number(formData.AgreementValue), Number(formData.AgreementValueGSTPercentage));

          setPaymentSchedules(mappedPaymentSchedule);
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
      "Loading Payment",
    );
  };

  //#endregion

  //#region FETCH PAYMENT SCHEDULE STAGES
  const loadPaymentSchedule = async () => {
    const flatDataFromState = (location.state as any)?.flatData;

    const buildingId = flatDataFromState?.InventoryBuildingId ?? selectedFlatData?.InventoryBuildingId ?? 0;

    const wingId = flatDataFromState?.InventoryFlatFloorBasementPodiumWingId ?? selectedFlatData?.InventoryFlatFloorBasementPodiumWingId ?? 0;

    const response = await fetchPaymentScheduleDropdown({
      projectId: Number(projectId),
      inventoryBuildingId: buildingId,
      inventoryFlatFloorBasementPodiumWingId: wingId,
    });

    setPaymentScheduleOptions(response.itemList);
  };
  //#endregion
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3">
        <form onSubmit={handleSubmit}>
          <div>
            <Input
              type="text"
              required
              disabled={Number(bookingId) > 0 ? true : false}
              label="Enquiry Code"
              value={enquiryUniqueCode}
              onChange={(e) => {
                setEnquiryMasterList(null);
                setEnquiryUniqueCode(e.target.value);
                setEnquiryId(0);

              }}
              placeholder="Search By Enquiry Unique Code"
              leftIcon={<Search className="h-4 w-4 text-gray-400" />}
              error={errors.EnquiryId}
            />
          </div>

          {enquiryUniqueCode && enquiryUniqueCode.trim() !== "" && (
            Number(enquiryId) > 0 &&
              (Number(bookingId) !== 0 || enquiryList?.FinalStage !== "Booking Done") ? (
              <div className="space-y-4 pt-5 pb-3">
                {/* ===================== ENQUIRY DETAILS ===================== */}
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Enquiry Details</h3>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">
                    <FieldItem label="Enquiry Code" value={enquiryUniqueCode || "-"} />
                    <FieldItem label="Name" value={enquiryList?.Name || "-"} />
                    <FieldItem label="Mobile No" value={enquiryList?.MobileNumber ? `+91 ${enquiryList?.MobileNumber}` : "-"} />
                    <FieldItem label="Source" value={enquiryList?.Source || "-"} />
                    <FieldItem label="Sub Source" value={enquiryList?.SubSource || "-"} />
                    {enquiryList?.Source?.toUpperCase() !== "CHANNEL PARTNER" && !!enquiryList?.SubSubSource?.trim() && <FieldItem label="Sub Sub Source" value={enquiryList?.SubSubSource || "-"} />}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3 pt-5">
                    <FieldItem label="Sales Advisor" value={enquiryList?.SalesAdvisor ?? "-"} />
                    <FieldItem label="Sourcing Manager" value={enquiryList?.SourcingManager ?? "-"} />
                    <FieldItem label="Stage" value={enquiryList?.FinalStage ?? "-"} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-1 gap-3 pt-5">
                    <FieldItem label="Current Location" value={enquiryList?.CurrentLocation || "-"} />
                  </div>
                </div>

                {/* ===================== DIRECT WALKING → REFERENCE ===================== */}
                {enquiryList?.Source === "Direct Walking" && enquiryList?.SubSource === "Reference" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <FieldItem label="Referral Name" value={enquiryList?.ReferelUnitOwnerName || "-"} />
                      <FieldItem label="Referral Project" value={enquiryList?.ReferelProjectName || "-"} />
                      <FieldItem label="Referral Unit No" value={enquiryList?.ReferelUnitNumber || "-"} />
                    </div>
                  </div>
                )}

                {/* ===================== DIRECT WALKING → LOYALTY ===================== */}
                {enquiryList?.Source === "Direct Walking" && enquiryList?.SubSource === "Loyalty" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <FieldItem label="Existing Project" value={enquiryList?.LoyaltyExistingProjectName || "-"} />
                      <FieldItem label="Existing Unit No" value={enquiryList?.LoyaltyExistingUnitNumber || "-"} />
                    </div>
                  </div>
                )}

                {/* ===================== DIRECT WALKING → EMPLOYEE REFERENCE ===================== */}
                {enquiryList?.Source === "Direct Walking" && enquiryList?.SubSource === "Employee Reference" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <FieldItem label="Employee Name" value={enquiryList?.EmployeeReferenceName || "-"} />
                      <FieldItem label="Employee Mobile" value={enquiryList?.EmployeeReferenceMobileNumber ? `+91 ${enquiryList?.EmployeeReferenceMobileNumber}` : "-"} />
                    </div>
                  </div>
                )}

                {/* ===================== CHANNEL PARTNER DETAILS ===================== */}
                {enquiryList?.Source?.toUpperCase() === "CHANNEL PARTNER" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <FieldItem label="Channel Partner" value={enquiryList?.ChannelPartnerName || "-"} />
                      <FieldItem label="CP Mobile" value={enquiryList?.ChannelPartnerMobileNumber ? `+91 ${enquiryList?.ChannelPartnerMobileNumber}` : "-"} />
                      <FieldItem label="CP Team Member" value={enquiryList?.ChannelPartnerTeamMemberName || "-"} />
                      <FieldItem label="CP Team Mobile" value={enquiryList?.ChannelPartnerTeamMemberMobileNumber || "-"} />
                    </div>
                  </div>
                )}
              </div>
            )
              :
              (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700 ">
                  {enquiryList?.FinalStage === "Booking Done" ? "Booking already done for this enquiry" : "No Enquiry details found for this Unique Code"}
                </div>
              ))}

          {/* ============================================================= [APPLICANT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pt-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 border-b border-gray-500 pb-2">
                <HeaderActionBar titleText="Applicant Detail " isLoading={isLoading} />
              </div>
              <div className="ml-4">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingApplicantData(null);
                    setFormDataForApplicant(initialFormStateApplicantDetails());
                    setApplicantPhotoFiles([]);
                    setAadharCardFiles([]);
                    setPanCardFiles([]);
                    setPassportFiles([]);
                    setDrivingLicenseFiles([]);
                    setVotingIdFiles([]);
                    setGstFiles([]);
                    setRemovedApplicantPhotoURLs([]);
                    setRemovedAadharCardURLs([]);
                    setRemovedPanCardURLs([]);
                    setRemovedPassportURLs([]);
                    setRemovedDrivingLicenseURLs([]);
                    setRemovedVotingIdURLs([]);
                    setRemovedGstURLs([]);
                    setIsAddUpdateApplicantModalOpen(true);
                  }}
                  color="blue"
                  size="sm"
                  title="Add Applicant"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Applicant
                </Button>
              </div>
            </div>
            {applicantList.length > 0 ? (
              <DataTable data={applicantList} columns={applicantColumns} emptyMessage="No applicants found" fixedHeight={false} recordsPerPage={20} className="min-w-full" aria-label="Applicant list" />
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">No applicants found</span>
              </div>
            )}
          </div>

          {/* ============================================================= [ADDRESS DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <TextArea label="Permanent Address" required value={formData.PermanentAddress ?? ""} onChange={(e) => handleFieldChange("PermanentAddress", e.target.value)} placeholder="Enter Permanent Address" error={errors.PermanentAddress} />
              <TextArea label="Communication Address" required value={formData.CommunicationAddress ?? ""} onChange={(e) => handleFieldChange("CommunicationAddress", e.target.value)} placeholder="Enter Communication Address" error={errors.CommunicationAddress} />
            </div>
          </div>

          {/* ============================================================= [PROJECT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Project Details</h3>

            {formData.BookingType === "FLAT" && selectedFlatData && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  <FieldItem label="Building" value={selectedFlatData?.BuildingNumber || "-"} />

                  <FieldItem label="Wing" value={selectedFlatData?.Wing || selectedWing || "-"} />

                  <FieldItem label="Floor" value={selectedFlatData?.Floor || selectedFloor || "-"} />

                  <FieldItem label="Unit No" value={selectedFlatData?.Flat || "-"} />

                  <FieldItem label="Category" value={selectedFlatData?.FlatType || "-"} />

                  <FieldItem label="Configuration" value={selectedFlatData?.FlatConfiguration || "-"} />

                  <FieldItem label="RERA Carpet Area (SqFt)" value={selectedFlatData?.RERACarpetAreaSqFt ? `${selectedFlatData.RERACarpetAreaSqFt} SqFt` : "-"} />
                </div>
              </div>
            )}

            {formData.BookingType === "PARKING" && dropdownLabels.buildingNumber === "-" && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                  <FieldItem label="Building" value={dropdownLabels.buildingNumber || "-"} />

                  <FieldItem label="Wing" value={dropdownLabels.wing || "-"} />

                  <FieldItem label="Floor" value={dropdownLabels.floor || "-"} />

                  <FieldItem label="Parking Number" value={dropdownLabels.parkingNumber || "-"} />

                  <FieldItem label="Category" value={dropdownLabels.parkingCategory || "-"} />

                  <FieldItem label="Type" value={dropdownLabels.parkingType || "-"} />

                  <FieldItem label="Size" value={dropdownLabels.parkingSubType || "-"} />

                  <FieldItem label="Dimensions" value={dropdownLabels.parkingDimensions || "-"} />

                  <FieldItem label="EV Charging" value={dropdownLabels.isEVChargingAvailable ? "Yes" : "No"} />
                </div>
              </div>
            )}

            {parkingData && parkingData.length > 0 && (
              <section className="bg-white rounded-xl p-6 border-[0.1px] border-[#3333334f]">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Parking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parkingData.map((parking, index) => (
                    <React.Fragment key={parking.ParkingId || index}>
                      <FieldItem label="Parking Number" value={parking.ParkingNumber} />
                      <FieldItem label="Building" value={parking.BuildingNumber} />
                      <FieldItem label="Wing" value={parking.Wing} />
                      <FieldItem label="Floor" value={parking.Floor} />
                      <FieldItem label="Category" value={parking.ParkingCategory} />
                      <FieldItem label="Type" value={parking.ParkingType} />
                      <FieldItem label="Size" value={parking.ParkingSubType} />
                      <FieldItem label="Dimensions" value={parking.ParkingDimensions} />
                      <FieldItem label="EV Charging" value={parking.IsEVChargingAvailable ? "Yes" : "No"} />
                    </React.Fragment>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ============================================================= [AGREEMENT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Agreement Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Agreement Value (With TDS) (₹)"
                value={formData.AgreementValue?.toString() ?? ""}
                onChange={(e) => {
                  const value = filterNumbersWithDecimal(e.target.value);

                  const agreementValue = Number(value || 0);

                  handleFieldChange("AgreementValue", value);

                  // ================= TDS RULE =================
                  const tdsAmount = agreementValue > 4999999.99 ? (agreementValue * 1) / 100 : 0;

                  handleFieldChange("AgreementValueTDS", tdsAmount.toFixed(2));

                  /* ================= REGISTRATION FEES ================= */
                  const registrationFees = agreementValue > 4999999.99 ? 30000 : (agreementValue * 1) / 100;

                  handleFieldChange("RegistrationFees", registrationFees.toFixed(2));

                  /* ================= AGREMENT GST % ================= */
                  const agreementGSTAMount = (agreementValue * Number(formData.AgreementValueGSTPercentage)) / 100;

                  handleFieldChange("AgreementValueGSTAmount", agreementGSTAMount.toFixed(2));

                  /* ================= STAMP DUTY % ================= */
                  const stampDutyAMount = (agreementValue * Number(formData.StampDutyPercentage)) / 100;

                  handleFieldChange("StampDutyAmount", stampDutyAMount.toFixed(2));

                  /* ================= BROKERAGE  % ================= */
                  const brokerageAMount = (agreementValue * Number(formData.BrokeragePercentage)) / 100;

                  handleFieldChange("BrokerageAmount", brokerageAMount.toFixed(2));

                  /* ================= REFEREL % ================= */
                  const referelAMount = (agreementValue * Number(formData.ReferelPercentage)) / 100;

                  handleFieldChange("ReferelAmount", referelAMount.toFixed(2));

                  /* ================= LOYALTY % ================= */
                  const loyaltyAMount = (agreementValue * Number(formData.LoyaltyPercentage)) / 100;

                  handleFieldChange("LoyaltyAmount", loyaltyAMount.toFixed(2));

                  /* ================= EMPLOYEE REFERENCE % ================= */
                  const employeeReferenceAMount = (agreementValue * Number(formData.EmployeeReferencePercentage)) / 100;

                  handleFieldChange("EmployeeReferenceAmount", employeeReferenceAMount.toFixed(2));

                  // ================= RECALCULATE PAYMENT SCHEDULE AMOUNTS =================
                  if (paymentSchedules.length > 0) {
                    setPaymentSchedules((prev) =>
                      prev.map((schedule) => ({
                        ...schedule,
                        PaymentScheduleAmount: (agreementValue * (schedule.PaymentSchedulePercentage || 0)) / 100,
                      })),
                    );
                  }

                  // ================= RECALCULATE PAYMENT SCHEDULE GST AMOUNTS =================
                  if (paymentSchedules.length > 0) {
                    setPaymentSchedules((prev) =>
                      prev.map((schedule) => ({
                        ...schedule,
                        PaymentScheduleGSTAmount: (agreementValue * (formData.AgreementValueGSTPercentage || 0)) / 100,
                      })),
                    );
                  }

                  // ================= RECALCULATE PAYMENT SCHEDULE TDS AMOUNTS =================
                  if (paymentSchedules.length > 0) {
                    setPaymentSchedules((prev) =>
                      prev.map((schedule) => ({
                        ...schedule,
                        PaymentScheduleTDSAmount: (agreementValue * (formData.AgreementValueGSTPercentage || 0)) / 100,
                      })),
                    );
                  }

                  if (otherCharges.length === 0) {
                    loadOtherCharges();
                  }
                  else {
                    const flatDataFromState = (location.state as any)?.flatData;

                    const rERACarpetAreaSqFt = flatDataFromState?.RERACarpetAreaSqFt ?? selectedFlatData?.RERACarpetAreaSqFt ?? 0;
                    const mappedCharges = mapOtherChargesToBookingOtherCharges(Number(rERACarpetAreaSqFt), otherChargesData);
                    setOtherCharges(mappedCharges);
                  }
                }}
                placeholder="Agreement Value"
                rightIcon="₹"
                required
                error={errors.AgreementValue}
              />

              <Input label="TDS (₹)" value={formData.AgreementValueTDS?.toString() ?? ""} disabled rightIcon="₹" />

              <Input label="Agreement Value (Without TDS) (₹)" value={((formData.AgreementValue || 0) - (formData.AgreementValueTDS || 0)).toFixed(2)} disabled rightIcon="₹" placeholder="Agreement Value - Agreement Value TDS" />
            </div>
          </div>

          {/* ============================================================= [TAX DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Tax Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Agreement GST (%)"
                value={formData.AgreementValueGSTPercentage?.toString() ?? ""}
                required
                onChange={(e) => {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    const percentage = filterNumbersWithDecimal(e.target.value);
                    handleFieldChange("AgreementValueGSTPercentage", percentage);

                    // Calculate CST Amount
                    const agreementValue = formData.AgreementValue || 0;

                    const cstAmount = (agreementValue * Number(percentage)) / 100;

                    handleFieldChange("AgreementValueGSTAmount", cstAmount.toFixed(2));
                  }
                }}
                placeholder="Agreement GST (%)"
                rightIcon="%"
                error={errors.AgreementValueGSTPercentage}
              />
              <Input label="Agreement GST Amount (₹)" value={formData.AgreementValueGSTAmount?.toString() ?? ""} disabled rightIcon="₹" />
              <Input
                label="Stamp Duty (%)"
                required
                value={formData.StampDutyPercentage?.toString() ?? ""}
                onChange={(e) => {
                  const val = allowPercentage(e.target.value);
                  if (val !== null) {
                    const percentage = filterNumbersWithDecimal(e.target.value);
                    handleFieldChange("StampDutyPercentage", percentage);
                    // Calculate Stamp Duty Amount
                    const agreementValue = formData.AgreementValue || 0;
                    const stampDutyAmount = (agreementValue * Number(percentage)) / 100;
                    handleFieldChange("StampDutyAmount", stampDutyAmount.toFixed(2));
                  }
                }}
                placeholder="Stamp Duty (%)"
                rightIcon="%"
                error={errors.StampDutyPercentage}
              />
              <Input label="Stamp Duty Amount (₹)" value={formData.StampDutyAmount?.toString() ?? ""} disabled rightIcon="₹" />
              <Input label="Registration Fees (₹)" value={formData.RegistrationFees?.toString() ?? ""} disabled rightIcon="₹" />
            </div>
          </div>

          {/* ============================================================= [BROKERAGE DETAILS] ============================================================================================= */}
          {enquiryList?.Source?.toUpperCase() === "CHANNEL PARTNER" && (
            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Brokerage Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Channel Partner Brokerage (%)"
                  value={formData.BrokeragePercentage?.toString() ?? ""}
                  disabled={Number(formData.AgreementValue) > 0 ? false : true}
                  required
                  onChange={(e) => {
                    const val = allowPercentage(e.target.value);
                    if (val !== null) {
                      const percentage = filterNumbersWithDecimal(e.target.value);
                      handleFieldChange("BrokeragePercentage", percentage);

                      // Calculate Brokerage Amount
                      const agreementValue = formData.AgreementValue || 0;

                      const cstAmount = (agreementValue * Number(percentage)) / 100;

                      handleFieldChange("BrokerageAmount", cstAmount.toFixed(2));
                    }
                  }}
                  placeholder="Brokerage (%)"
                  rightIcon="%"
                  error={errors.BrokeragePercentage}
                />
                <Input label="Brokerage Amount (₹)" value={formData.BrokerageAmount?.toString() ?? ""} disabled rightIcon="₹" />
              </div>
            </div>
          )}

          {/* ===================== DIRECT WALKING → REFERENCE ===================== */}
          {enquiryList?.Source === "Direct Walking" && enquiryList?.SubSource === "Reference" && (
            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Referel Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Referel (%)"
                  value={formData.ReferelPercentage?.toString() ?? ""}
                  disabled={Number(formData.AgreementValue) > 0 ? false : true}
                  required
                  onChange={(e) => {
                    const val = allowPercentage(e.target.value);
                    if (val !== null) {
                      const percentage = filterNumbersWithDecimal(e.target.value);
                      handleFieldChange("ReferelPercentage", percentage);

                      const agreementValue = formData.AgreementValue || 0;

                      const cstAmount = (agreementValue * Number(percentage)) / 100;

                      handleFieldChange("ReferelAmount", cstAmount.toFixed(2));
                    }
                  }}
                  placeholder="Referel (%)"
                  rightIcon="%"
                  error={errors.ReferelPercentage}
                />
                <Input label="Referel Amount (₹)" value={formData.ReferelAmount?.toString() ?? ""} disabled rightIcon="₹" />
              </div>
            </div>
          )}

          {/* ===================== DIRECT WALKING → LOYALTY ===================== */}
          {enquiryList?.Source === "Direct Walking" && enquiryList?.SubSource === "Loyalty" && (
            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Loyalty Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Loyalty (%)"
                  value={formData.LoyaltyPercentage?.toString() ?? ""}
                  disabled={Number(formData.AgreementValue) > 0 ? false : true}
                  required
                  onChange={(e) => {
                    const val = allowPercentage(e.target.value);
                    if (val !== null) {
                      const percentage = filterNumbersWithDecimal(e.target.value);
                      handleFieldChange("LoyaltyPercentage", percentage);

                      const agreementValue = formData.AgreementValue || 0;

                      const cstAmount = (agreementValue * Number(percentage)) / 100;

                      handleFieldChange("LoyaltyAmount", cstAmount.toFixed(2));
                    }
                  }}
                  placeholder="Loyalty (%)"
                  rightIcon="%"
                  error={errors.LoyaltyPercentage}
                />
                <Input label="Loyalty Amount (₹)" value={formData.LoyaltyAmount?.toString() ?? ""} disabled rightIcon="₹" />
              </div>
            </div>
          )}

          {/* ===================== DIRECT WALKING → EMPLOYEE REFERENCE ===================== */}
          {enquiryList?.Source === "Direct Walking" && enquiryList?.SubSource === "Employee Reference" && (
            <div className="space-y-4 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Employee Reference Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Employee Reference (%)"
                  value={formData.EmployeeReferencePercentage?.toString() ?? ""}
                  disabled={Number(formData.AgreementValue) > 0 ? false : true}
                  required
                  onChange={(e) => {
                    const val = allowPercentage(e.target.value);
                    if (val !== null) {
                      const percentage = filterNumbersWithDecimal(e.target.value);
                      handleFieldChange("EmployeeReferencePercentage", percentage);

                      const agreementValue = formData.AgreementValue || 0;

                      const cstAmount = (agreementValue * Number(percentage)) / 100;

                      handleFieldChange("EmployeeReferenceAmount", cstAmount.toFixed(2));
                    }
                  }}
                  placeholder="Employee Reference (%)"
                  rightIcon="%"
                  error={errors.EmployeeReferencePercentage}
                />
                <Input label="Employee Reference Amount (₹)" value={formData.EmployeeReferenceAmount?.toString() ?? ""} disabled rightIcon="₹" />
              </div>
            </div>
          )}

          {/* ============================================================= [OTHER DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Other Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MultiSelectPagination
                label="Parking"
                dataFetchCallBack={fetchParkingProjectWise}
                selectedValues={parkingDropdown.selectedValues}
                options={parkingDropdown.initialOptions}
                onChange={(values) => {
                  const { idsString } = parkingDropdown.handleChange(values);
                  setSelectedParkingValues(idsString || null);
                  handleFieldChange("ParkingId", idsString);
                  if (errors.ParkingId) {
                    setErrors((prev) => ({ ...prev, ParkingId: "" }));
                  }
                }}
              />
              <div>
                <div>
                  <Input label="Number Of Parking" placeholder="Enter Number Of Parking" value={formData.NumberOfParking ?? 0} maxLength={2} onChange={(e) => handleFieldChange("NumberOfParking", filterNumbers(e.target.value))} error={errors.NumberOfParking} />
                </div>
              </div>

              <div>
                <SinglePageSelection label="Handover Type" required value={formData.HandoverType ?? ""} onChange={(e) => handleFieldChange("HandoverType", String(e))} options={HANDOVER_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))} error={errors.HandoverType} placeholder="Select Handover Type" />
              </div>
              <DatePickerInput label="Expected Registration Date" value={formatDate_dd_mm_yyyy(formData.RegistrationDate)} onChange={(val) => handleFieldChange("RegistrationDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))} required error={errors.RegistrationDate} />
              <div>
                <SinglePageSelection required label="Source Of Funding" placeholder="Select Source Of Funding" value={formData.SourceOfFunding ?? ""} onChange={(value) => handleFieldChange("SourceOfFunding", value)} options={SOURCE_OF_FUNDING_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))} error={errors.SourceOfFunding} />
              </div>
            </div>
          </div>

          <div className="pb-5">
            <SingleSelectDropdownWithPagination
              label="Payment Schedule Scheme"
              title="Select Payment Schedule Scheme"
              required
              size="lg"
              dataFetchCallBack={fetchPaymentScheduleSchemeMaster()}
              onSelected={(item) => {
                const schemeId = Number(item?.value);

                handleFieldChange("PaymentScheduleSchemeMasterId", schemeId);

                setPaymentSchedules([]);

                if (schemeId > 0) {
                  loadPaymentScheduleByPaymentScheduleSchemeId(schemeId);
                }
              }}
              initialValue={createDropdownInitialValue(formData.PaymentScheduleSchemeMasterId, dropdownLabels.paymentScheduleScheme)}
              error={errors.PaymentScheduleSchemeMasterId}
            />
          </div>

          {/* ============================================================= [PAYMENT SCHEDULE TABLE] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>
              </div>
              {paymentSchedules.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700">Total: </span>
                    <span className={`font-bold ${totalPercentage === 100 ? "text-green-600" : "text-red-600"}`}>{totalPercentage.toFixed(2)}%</span>
                  </div>
                  {totalPercentage !== 100 && <span className="text-xs text-red-600">{totalPercentage < 100 ? `Missing ${(100 - totalPercentage).toFixed(2)}%` : `Exceeds by ${(totalPercentage - 100).toFixed(2)}%`}</span>}
                </div>
              )}

              {Number(formData.AgreementValue) > 0 && formData.PaymentScheduleSchemeMasterId === 0 && totalPercentage < 100 && (
                <Button
                  type="button"
                  onClick={() => {
                    setPaymentScheduleType("Date");
                    setPaymentScheduleDate("");
                    setPaymentScheduleStage("");
                    setPaymentSchedulePercentage("");
                    setEditingPaymentScheduleIndex(null);
                    setIsPaymentScheduleModalOpen(true);
                    loadPaymentSchedule();
                  }}
                  color="blue"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Schedule
                </Button>
              )}
            </div>
            {paymentSchedules.length > 0 ? (
              <DataTableDraggable
                data={paymentSchedules}
                columns={paymentScheduleColumns}
                emptyMessage="No payment schedules found. Click 'Add Payment Schedule' to add one."
                fixedHeight={false} recordsPerPage={20}
                className="min-w-full"
                enableRowReorder
                onRowReorder={(newData) => setPaymentSchedules(newData)}
              />
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">No payment schedules found</span>
              </div>
            )}
          </div>

          {/* ============================================================= [OTHER CHARGES TABLE] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Other Charges</h3>
              </div>
            </div>
            {otherCharges.length > 0 ? (
              <DataTable
                data={otherCharges}
                columns={otherChargesColumns}
                emptyMessage="No other charges found. Click 'Add Other Charges' to add one."
                fixedHeight={false}
                recordsPerPage={20}
                className="min-w-full"
                aria-label="Other charges list" />
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">No other charges found</span>
              </div>
            )}
          </div>

          {/* ============================================================= [PAYMENT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input label="Booking Amount" value={formData.BookingAmount?.toString() ?? ""} onChange={(e) => handleFieldChange("BookingAmount", filterNumbersWithDecimal(e.target.value))} placeholder="Booking Amount" />
              <Input label="Cheque / RTGS No." type="text" value={formData.ChequeRTGSNumber ?? ""} onChange={(e) => handleFieldChange("ChequeRTGSNumber", e.target.value)} placeholder="Cheque / RTGS No." />
              <DatePickerInput label="Cheque / RTGS Date" value={formatDate_dd_mm_yyyy(formData.ChequeRTGSDate)} onChange={(val) => handleFieldChange("ChequeRTGSDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))} />
              <div>
                <SingleSelectDropdownWithPagination
                  label="Bank"
                  title="Select Bank"
                  size="lg"
                  dataFetchCallBack={fetchBankListMasterDropdown}
                  onSelected={(item) => {

                    if (!item) {

                      handleFieldChange("BankListMasterId", 0);
                      return;
                    }
                    handleFieldChange("BankListMasterId", Number(item.value));

                  }}
                  initialValue={createDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
                  error={errors.BankListMasterId}
                />
              </div>
            </div>
          </div>

          {/* ============================================================= [ADITIONAL DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
              <div>
                <TextArea className='thin-scroll' label="Unit / Modulation / Customization Remark" required value={formData.FlatAlterationRemark ?? ""} onChange={(e) => handleFieldChange("FlatAlterationRemark", e.target.value)} placeholder="Enter Unit / Modulation / Customization" error={errors.FlatAlterationRemark} />
              </div>
              <div>
                <TextArea  className='thin-scroll' label="Payment Related Remark" value={formData.PaymentRemark ?? ""} onChange={(e) => handleFieldChange("PaymentRemark", e.target.value)} placeholder="Enter Payment Related Remark" error={errors.PaymentRemark} />
              </div>
              <div>
                <TextArea  className='thin-scroll' label="Other Remark" value={formData.OtherRemark ?? ""} onChange={(e) => handleFieldChange("OtherRemark", e.target.value)} placeholder="Enter Other Remark" error={errors.OtherRemark} />
              </div>
              <div>
                <SingleSelectDropdownWithPagination label="Term & Condition" title="Term & Condition" size="lg" dataFetchCallBack={fetchTncByModuleName("Booking")} onSelected={(item) => handleFieldChange("TermsAndConditionsDescription", item?.value)} />
              </div>
              <div>
                <RichTextEditor value={formData.TermsAndConditionsDescription ?? ""} onChange={(html) => handleFieldChange("TermsAndConditionsDescription", html)} readOnly />
              </div>
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={isAddMode ? "Add" : "Update"}
        onCancel={() => {
          if (sourcePage === "inventory") {
            navigate("/inventory");
          } else if (sourcePage === "parking") {
            navigate("/parking");
          } else {
            navigate("/booking");
          }
        }}
        canAction={canAction}
        onSave={() => {
          handleSubmit();
        }}
        isLoading={isLoading}
      />

      {/* ADD EDIT UPDATE BOOKING APPLICANT MODAL */}
      <Modal
        isOpen={isAddUpdateApplicantModalOpen}
        onClose={() => {
          setIsAddUpdateApplicantModalOpen(false);
          setEditingApplicantData(null);
          setFormDataForApplicant(initialFormStateApplicantDetails());
          setErrorsBookingApplicant({});
          setApplicantPhotoFiles([]);
          setAadharCardFiles([]);
          setPanCardFiles([]);
          setPassportFiles([]);
          setDrivingLicenseFiles([]);
          setVotingIdFiles([]);
          setGstFiles([]);
          setRemovedApplicantPhotoURLs([]);
          setRemovedAadharCardURLs([]);
          setRemovedPanCardURLs([]);
          setRemovedPassportURLs([]);
          setRemovedDrivingLicenseURLs([]);
          setRemovedVotingIdURLs([]);
          setRemovedGstURLs([]);
        }}
        onCancel={() => {
          setIsAddUpdateApplicantModalOpen(false);
          setEditingApplicantData(null);
          setFormDataForApplicant(initialFormStateApplicantDetails());
          setErrorsBookingApplicant({});
          setApplicantPhotoFiles([]);
          setAadharCardFiles([]);
          setPanCardFiles([]);
          setPassportFiles([]);
          setDrivingLicenseFiles([]);
          setVotingIdFiles([]);
          setGstFiles([]);
          setRemovedApplicantPhotoURLs([]);
          setRemovedAadharCardURLs([]);
          setRemovedPanCardURLs([]);
          setRemovedPassportURLs([]);
          setRemovedDrivingLicenseURLs([]);
          setRemovedVotingIdURLs([]);
          setRemovedGstURLs([]);
        }}
        title={editingApplicantData ? "Update Booking Applicant" : "Add Booking Applicant"}
        onSubmit={handleAddUpdateBookingApplicant}
        saveText={editingApplicantData ? "Update" : "Add"}
        cancelText="Cancel"
        loading={isLoading}
        size="small50"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection label="Applicant Type" placeholder="Select Applicant Type" required value={formDataForApplicant?.ApplicantType ?? ""} onChange={(e) => handleFieldChangeBookingApplicant("ApplicantType", String(e))} options={APPLICANT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))} error={errorsBookingApplicant.ApplicantType} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input label="Applicant Name" required error={errorsBookingApplicant.ApplicantName} value={formDataForApplicant.ApplicantName ?? ""} maxLength={50} onChange={(e) => handleFieldChangeBookingApplicant("ApplicantName", filterLetters(e.target.value))} placeholder="Enter Applicant Name" />
            </div>
            <div>
              <Input label="Mobile Number" required error={errorsBookingApplicant.ApplicantMobileNumber} type="text" value={formDataForApplicant.ApplicantMobileNumber ?? ""} maxLength={10} leftIcon="+91" onChange={(e) => handleFieldChangeBookingApplicant("ApplicantMobileNumber", filterMobile(e.target.value))} placeholder="Enter Mobile Number" />
            </div>
            <div>
              <Input label="Email Id" error={errorsBookingApplicant.ApplicantEmailId} type="text" value={formDataForApplicant.ApplicantEmailId ?? ""} onChange={(e) => handleFieldChangeBookingApplicant("ApplicantEmailId", filterEmail(e.target.value))} placeholder="Enter Email Id" />
            </div>
            <div>
              <MultiFilePicker label="Photo" placeholder="Select Photo" required error={errorsBookingApplicant.PhotoURL} value={applicantPhotoFiles} onChange={setApplicantPhotoFiles} allowedTypes={["image/jpeg", "image/png"]} maxFiles={1} maxSizeMB={5} onRemoveExisting={(url) => setRemovedApplicantPhotoURLs((prev) => [...prev, url])} />
            </div>
            <div>
              <Input label="Aadhaar Number" error={errorsBookingApplicant.AadharCardNumber} required type="text" value={formDataForApplicant.AadharCardNumber ?? ""} maxLength={12} onChange={(e) => handleFieldChangeBookingApplicant("AadharCardNumber", filterAadhaar(e.target.value))} placeholder="Enter Aadhaar Number" rightIcon={<IdCardIcon />} />
            </div>
            <div>
              <MultiFilePicker label="Aadhaar Card" required placeholder="Select Aadhaar Card" error={errorsBookingApplicant.AadharCardURL} value={aadharCardFiles} onChange={setAadharCardFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={2} maxSizeMB={10} onRemoveExisting={(url) => setRemovedAadharCardURLs((prev) => [...prev, url])} />
            </div>
            <div>
              <Input label="PAN Number" required error={errorsBookingApplicant.PanNumber} type="text" value={formDataForApplicant.PanNumber ?? ""} maxLength={10} onChange={(e) => handleFieldChangeBookingApplicant("PanNumber", filterPAN(e.target.value).toUpperCase())} placeholder="Enter PAN Number" rightIcon={<IdCardIcon />} />
            </div>
            <div>
              <MultiFilePicker label="PAN Card" required placeholder="Select PAN Card" error={errorsBookingApplicant.PanCardURL} value={panCardFiles} onChange={setPanCardFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]} maxFiles={2} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPanCardURLs((prev) => [...prev, url])} />
            </div>
            <div>
              <Input label="Passport Number" error={errorsBookingApplicant.PassportNumber} type="text" value={formDataForApplicant.PassportNumber ?? ""} maxLength={8} onChange={(e) => handleFieldChangeBookingApplicant("PassportNumber", filterPassportNumber(e.target.value.toUpperCase()))} placeholder="Enter Passport Number" rightIcon={<IdCardIcon />} />
            </div>
            <div>
              <MultiFilePicker label="Passport" placeholder="Select Passport" error={errorsBookingApplicant.PassportURL} value={passportFiles} onChange={setPassportFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPassportURLs((prev) => [...prev, url])} />
            </div>
            <div>
              <Input label="Driving License Number" error={errorsBookingApplicant.DrivingLicenseNumber} type="text" value={formDataForApplicant.DrivingLicenseNumber ?? ""} maxLength={15} onChange={(e) => handleFieldChangeBookingApplicant("DrivingLicenseNumber", filterDrivingLicenseNumber(e.target.value.toUpperCase()))} placeholder="Enter Driving License Number" rightIcon={<IdCardIcon />} />
            </div>
            <div>
              <MultiFilePicker label="Driving License" placeholder="Select Driving License" error={errorsBookingApplicant.DrivingLicenseURL} value={drivingLicenseFiles} onChange={setDrivingLicenseFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedDrivingLicenseURLs((prev) => [...prev, url])} />
            </div>
            <div>
              <Input label="Voting ID Number" error={errorsBookingApplicant.VotingIdNumber} type="text" value={formDataForApplicant.VotingIdNumber ?? ""} maxLength={10} onChange={(e) => handleFieldChangeBookingApplicant("VotingIdNumber", filterVoterId(e.target.value.toUpperCase()))} placeholder="Enter Voting ID Number" rightIcon={<IdCardIcon />} />
            </div>
            <div>
              <MultiFilePicker label="Voting ID" placeholder="Select Voting ID" error={errorsBookingApplicant.VotingIdURL} value={votingIdFiles} onChange={setVotingIdFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedVotingIdURLs((prev) => [...prev, url])} />
            </div>
            <div>
              <Input label="GST Number" error={errorsBookingApplicant.GSTNumber} type="text" value={formDataForApplicant.GSTNumber ?? ""} maxLength={15} onChange={(e) => handleFieldChangeBookingApplicant("GSTNumber", filterGST(e.target.value.toUpperCase()))} placeholder="Enter GST Number" rightIcon={<IdCardIcon />} />
            </div>
            <div>
              <MultiFilePicker label="GST Documents" placeholder="Select GST Documents" error={errorsBookingApplicant.GSTNumberURL} value={gstFiles} onChange={setGstFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={5} maxSizeMB={10} onRemoveExisting={(url) => setRemovedGstURLs((prev) => [...prev, url])} />
            </div>
          </div>
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteBookingApplicantData(null);
        }}
        onConfirm={handleDeleteApplicant}
        loading={isLoading}
        pageName="applicant"
      />

      {/* ADD PAYMENT SCHEDULE MODAL */}
      <Modal
        isOpen={isPaymentScheduleModalOpen}
        onClose={() => {
          setIsPaymentScheduleModalOpen(false);
          setPaymentScheduleType("Date");
          setPaymentScheduleDate("");
          setPaymentScheduleStage("");
          setPaymentScheduleStageOther("");
          setPaymentSchedulePercentage("");
          setEditingPaymentScheduleIndex(null);
        }}
        title="Add Payment Schedule"
        onSubmit={(e) => {
          e.preventDefault();

          if (!paymentSchedulePercentage || Number(paymentSchedulePercentage) <= 0) {
            addToast({ type: "error", title: "Please enter a valid percentage" });

            return;
          }

          if (paymentScheduleType === "Date" && !paymentScheduleDate) {
            addToast({ type: "error", title: "Please select a date" });
            return;
          }

          if (paymentScheduleType === "Stage" && !paymentScheduleStage) {
            addToast({ type: "error", title: "Please select a stage" });
            return;
          }
          if (paymentScheduleType === "Stage" && paymentScheduleStage === "Other" && !paymentScheduleStageOther?.trim()) {
            addToast({ type: "error", title: "Please enter a stage name" });
            return;
          }

          const scheduleName = paymentScheduleType === "Stage" ? (paymentScheduleStage === "Other" ? paymentScheduleStageOther : paymentScheduleStage) : "";
          const scheduleDate = paymentScheduleType === "Date" && paymentScheduleDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(paymentScheduleDate) : null;

          const hasDuplicate = paymentSchedules.some((schedule, idx) => {
            if (editingPaymentScheduleIndex !== null && idx === editingPaymentScheduleIndex) {
              return false;
            }

            if (paymentScheduleType === "Date" && schedule.Type === "Date") {
              return schedule.Date === scheduleDate;
            } else if (paymentScheduleType === "Stage" && schedule.Type === "Stage") {
              return schedule.Name === scheduleName;
            }
            return false;
          });

          if (hasDuplicate) {
            const duplicateMessage = paymentScheduleType === "Date" ? "A payment schedule with this date already exists" : "A payment schedule with this stage name already exists";
            addToast({ type: "error", title: duplicateMessage });
            return;
          }

          const agreementValue = formData.AgreementValue || 0;
          const percentage = Number(paymentSchedulePercentage);

          // Calculate new total percentage
          const currentTotal = paymentSchedules.reduce((sum, s, idx) => {
            if (editingPaymentScheduleIndex !== null && idx === editingPaymentScheduleIndex) {
              return sum;
            }
            return sum + (s.PaymentSchedulePercentage || 0);
          }, 0);

          const newTotal = currentTotal + percentage;

          if (newTotal > 100) {
            addToast({ type: "error", title: `Total percentage cannot exceed 100%. Current total would be ${newTotal.toFixed(2)}%` });
            return;
          }

          const amount = (agreementValue * percentage) / 100;

          const newSchedule: AddUpdateBookingPaymentScheduleRequest = {
            BookingPaymentScheduleId: editingPaymentScheduleIndex !== null ? (paymentSchedules[editingPaymentScheduleIndex]?.BookingPaymentScheduleId ?? 0) : 0,
            Type: paymentScheduleType,
            Name: scheduleName,
            Date: scheduleDate,
            PaymentSchedulePercentage: percentage,
            PaymentScheduleAmount: amount,
            PaymentScheduleGSTAmount: (amount * Number(formData.AgreementValueGSTPercentage)) / 100,
            PaymentScheduleTDSAmount: agreementValue > 4999999.99 ? (amount * 1) / 100 : 0,
          };

          if (editingPaymentScheduleIndex !== null) {
            setPaymentSchedules((prev) => {
              const updated = [...prev];
              updated[editingPaymentScheduleIndex] = newSchedule;
              return updated;
            });
          } else {
            setPaymentSchedules((prev) => [...prev, newSchedule]);
          }

          setIsPaymentScheduleModalOpen(false);
          setPaymentScheduleType("Date");
          setPaymentScheduleDate("");
          setPaymentScheduleStage("");
          setPaymentScheduleStageOther("");
          setPaymentSchedulePercentage("");
          setEditingPaymentScheduleIndex(null);
          addToast({ type: "success", title: "Payment schedule added successfully" });
        }}
        saveText="Add"
        loading={isLoading}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Schedule Type</label>
            <div className="flex gap-4">
              <RadioPill
                label="Date"
                checked={paymentScheduleType === "Date"}
                onChange={() => {
                  setPaymentScheduleType("Date");
                  setPaymentScheduleStage("");
                  setPaymentScheduleStageOther("");
                }}
                name="paymentScheduleType"
                value="Date"
              />
              <RadioPill
                label="Stage"
                checked={paymentScheduleType === "Stage"}
                onChange={() => {
                  setPaymentScheduleType("Stage");
                  setPaymentScheduleDate("");
                  setPaymentScheduleStageOther("");
                }}
                name="paymentScheduleType"
                value="Stage"
              />
            </div>
          </div>

          {paymentScheduleType === "Date" && (
            <div>
              <DatePickerInput label="Date" value={paymentScheduleDate} onChange={(value) => setPaymentScheduleDate(value || "")} placeholder="DD-MM-YYYY" required />
            </div>
          )}

          {paymentScheduleType === "Stage" && (
            <div>
              <SinglePageSelection
                label="Stage"
                placeholder="Select Stage"
                value={paymentScheduleStage}
                onChange={(e) => {
                  const selectedStage = String(e);
                  setPaymentScheduleStage(selectedStage);
                  if (selectedStage !== "Other") {
                    setPaymentScheduleStageOther("");
                  }
                }}
                options={paymentScheduleOptions}
              />
            </div>
          )}

          {paymentScheduleType === "Stage" && paymentScheduleStage === "Other" && (
            <div>
              <Input label="Other Stage" value={paymentScheduleStageOther} onChange={(e) => setPaymentScheduleStageOther(String(e.target.value))} placeholder="Enter Stage" required />
            </div>
          )}

          <div>
            <Input
              label="Percentage (%)"
              value={paymentSchedulePercentage}
              onChange={(e) => {
                const val = allowPercentage(e.target.value);
                if (val !== null) {
                  setPaymentSchedulePercentage(filterNumbersWithDecimal(e.target.value));
                }
              }}
              placeholder="Enter Percentage"
              rightIcon="%"
              required
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showOtpSection}
        onClose={() => {
          setOtp("");
          setIsOtpSent(false);
          setIsOtpVerified(false);
          setShowOtpSection(false);
        }}
        title="Complete Verification"
        saveText={formData.BookingId ? "Update" : "Verify OTP & Add"}
        size="md"
        onSubmit={(e) => {
          e.preventDefault();

          if (!otp) {
            addToast({ type: "error", title: "Please enter OTP" });
            return;
          }

          setIsOtpVerified(true);

          handleSubmit();
        }}
      >
        <CompleteVerificationSection steps={getBookingVerificationSteps(formData)} otp={otp} onOtpChange={setOtp} mobileNumber={applicantList.find((x) => x.ApplicantType === "Applicant")?.ApplicantMobileNumber ?? ""} />
      </Modal>
    </div>
  );
  //#endregion
};

export default AddUpdateBooking;
