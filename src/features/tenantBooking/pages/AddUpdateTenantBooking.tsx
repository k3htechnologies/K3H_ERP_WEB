import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import type { AddUpdateBookingRequest, FilterWithPaginationBookingRequest, AddUpdateBookingPaymentScheduleRequest, AddUpdateBookingOtherChargesRequest } from "@/features/booking/models/BookingModel";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { TextArea } from "@/ui/components/forms/Textarea";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { bookingService } from "@/features/booking/services/BookingService";
import { allowPercentage, filterNumbers, filterNumbersWithDecimal, } from "@/core/utils/fileValidation";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useTenantBookingListState } from "@/features/tenantBooking/context/TenantBookingListStateContext";
import { Button } from "@/ui/components/forms";
import { Edit, Search, Trash2 } from "lucide-react";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { Modal } from "@/ui/components/Modal/Modal";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { HANDOVER_TYPE, SOURCE_OF_FUNDING_TYPE } from "@/core/constants";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import type { InventoryFlatData } from "@/features/inventory/models/InventoryMasterModel";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { Plus } from "lucide-react";
import RadioPill from "@/ui/components/forms/RadioPill";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { fetchPaymentScheduleDropdown } from "@/features/paymentScheduleMaster/paymentScheduleDropDown";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { fetchParkingDropdown } from "@/features/parking/parkingDropDown";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import type { ParkingData } from "@/features/parking/models/ParkingModel";
import { fetchTncMasterDropdown } from "@/features/tnc/tncDropDown";
import RichTextEditor from "@/ui/components/forms/RichTextEditor";
import type { FilterWithPaginationOtherChargesRequest, OtherChargesData } from "@/features/otherCharges/models/OtherChargesModel";
import { otherChargesService } from "@/features/otherCharges/services/OtherChargesService";
import { mapOtherChargesToBookingOtherCharges } from "@/features/booking/utils/MapOtherCharges";
import { fetchPaymentScheduleSchemeMasterDropDown } from "@/features/paymentScheduleSchemeMaster/PaymentScheduleSchemeMasterDropdown";
import type { FilterWithPaginationPaymentScheduleMasterRequest } from "@/features/paymentScheduleMaster/models/PaymentScheduleMasterModel";
import { paymentScheduleMasterService } from "@/features/paymentScheduleMaster/services/PaymentScheduleMasterService";
import { mapPaymentScheduleToBookingPaymentSchedule } from "@/features/booking/utils/MapPaymentSchedule";
import { DataTableDraggable } from "@/ui/components/DataTable/DataTableDraggable";
import { formatCurrency, getSafeString } from "@/core/utils/comman";
import ToggleSwitch from "@/ui/components/forms/ToggleSwitch";
import type { TenantData } from "@/features/tenant/models/TenantModel";
import { fetchTenantBySystemGeneratedCode } from "@/features/tenant/tenantDropDown";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { fetchBuildingDropdown } from "@/features/building/buildingDropdown";
import Tabs from "@/ui/components/Tab/Tab";

const initialFormState = (): AddUpdateBookingRequest => ({
  BookingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  ProjectId: 0,
  EnquiryId: 0,
  PermanentAddress: "",
  CommunicationAddress: "",
  BrokeragePercentage: 0,
  BrokerageAmount: 0,
  ReferralPercentage: 0,
  ReferralAmount: 0,

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
  TenantBuildingId: 0,
  CarpetAreaPurchasedSqFt: "",
  OTP: "",
  IsApplicableOtherCharge: false,
});


export const AddUpdateTenantBooking: React.FC = () => {
  const [formData, setFormData] = useState<AddUpdateBookingRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [parkingId, setParkingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useProject();
  const { listState, updateTenantListState } = useTenantBookingListState();
  const { bookingId } = listState;
  const [sourcePage, setSourcePage] = useState<"inventory" | "parking" | "booking" | null>(null);

  const isAddMode = bookingId === 0;
  const { addToast } = useToast();
  const { canAction } = useMenuPermissions("/tenantBooking");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [tenantList, setTenantList] = useState<TenantData | null>(null)
  const [applicantList, setApplicantList] = useState<any[]>([]);
  const [tenantUniqueCode, setTenantUniqueCode] = useState<string>();
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number>(0);
  const [isTenantDataFromState, setIsTenantDataFromState] = useState(false);
  const CarpetAreaPurchasedSqFtTabList = [
    { id: "RERA", label: "RERA" },
    { id: "MOFA", label: "MOFA" },
  ];
  const [activeTab, setActiveTab] = useState(CarpetAreaPurchasedSqFtTabList[0].id);

  const [selectedWing, setSelectedWing] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedFlatData, setSelectedFlatData] = useState<InventoryFlatData | null>(null);
  const [parkingData, setParkingData] = useState<ParkingData[]>([]);
  const [selectedParkingValues, setSelectedParkingValues] = useState<string | number | null>(null);

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
    tenantBuildingName?: string;
  }>({});
  const [paymentSchedules, setPaymentSchedules] = useState<AddUpdateBookingPaymentScheduleRequest[]>([]);
  const [paymentScheduleOptions, setPaymentScheduleOptions] = useState<{ label: string; value: string }[]>([]);

  const [isPaymentScheduleModalOpen, setIsPaymentScheduleModalOpen] = useState(false);
  const [paymentScheduleType, setPaymentScheduleType] = useState<"Date" | "Stage">("Date");
  const [paymentScheduleDate, setPaymentScheduleDate] = useState<string>("");
  const [paymentScheduleStage, setPaymentScheduleStage] = useState<string>("");
  const [paymentScheduleStageOther, setPaymentScheduleStageOther] = useState<string>("");
  const [paymentSchedulePercentage, setPaymentSchedulePercentage] = useState<string>("");
  const [editingPaymentScheduleIndex, setEditingPaymentScheduleIndex] = useState<number | null>(null);

  const [otherCharges, setOtherCharges] = useState<AddUpdateBookingOtherChargesRequest[]>([]);
  const [otherChargesData, setOtherChargesData] = useState<OtherChargesData[]>([]);

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

  useEffect(() => {
    if (!projectId) return;

    const flatDataFromState = (location.state as any)?.flatData;

    const parkingDataFromState = (location.state as any)?.parkingData;

    if (flatDataFromState && flatDataFromState.PageName === "UNIT BOOK") {

      setSourcePage("inventory");

      const existingTenantId = flatDataFromState.tenantId || 0;

      const existingTenantCode = flatDataFromState.tenantSystemGeneratedCode || "";

      const existingTenantBuildingId = Number(flatDataFromState.tenantBuildingId || 0);

      const existingTenantBuildingName = flatDataFromState.tenantBuildingName || "";

      const hasTenantDataFromState = existingTenantId > 0 || existingTenantBuildingId > 0 || !!existingTenantCode;

      setIsTenantDataFromState(hasTenantDataFromState);

      setFormData((prev) => ({
        ...prev,
        ProjectId: Number(projectId),
        InventoryFlatId: flatDataFromState.InventoryFlatId || 0,
        BookingType: "FLAT",
        TenantId: existingTenantId,
        TenantBuildingId: existingTenantBuildingId,
        TenantBuildingName: existingTenantBuildingName
      }));

      setDropdownLabels((prev) => ({
        ...prev,
        tenantBuildingName: existingTenantBuildingName,
      }));

      setTenantId(existingTenantId);
      setTenantUniqueCode(existingTenantCode);
      setSelectedBuildingId(existingTenantBuildingId);

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
        Note: "",
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
        TenantId: existingTenantId,
        TenantSystemGeneratedCode: existingTenantCode,
        TenantBuildingId: existingTenantBuildingId,
        TenantBuildingName: existingTenantBuildingName
      });

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

  useEffect(() => {

    const code = tenantUniqueCode?.trim();
    const hasTenantId = Number(tenantId) > 0;
    const hasValidCode = code && code.length === 18;
    const hasBuildingId = Number(selectedBuildingId) > 0;


    if (!hasBuildingId) {
      setTenantId(0);
      setTenantList(null);
      setApplicantList([]);
      return;
    }

    if (hasTenantId) {

      fetchTenantBySystemGeneratedCode("", Number(projectId), Number(tenantId), Number(selectedBuildingId)).then(handleTenantResponse);

      return;
    }

    if (hasValidCode) {

      fetchTenantBySystemGeneratedCode(code, Number(projectId), 0, Number(selectedBuildingId)).then(handleTenantResponse);
      return;

    }

    if (!hasTenantId || !hasValidCode) {

      setTenantId(0);

      setFormData(prev => ({
        ...prev,
        TenantId: 0
      }));

      setTenantList(null);
      setApplicantList([]);
    }

  }, [tenantUniqueCode, projectId, tenantId, selectedBuildingId]);

  const validateTenantDetails = (tenant: any): string[] => {
    const errors: string[] = [];

    const applicants = tenant?.TenantApplicantData || [];

    applicants.forEach((applicant: any, index: number) => {

      const applicantName = applicant?.ApplicantName || `Applicant ${index + 1}`;

      if (!applicant?.PhotoURL?.trim()) {
        errors.push(`${applicantName}: Photo is required.`);
      }

      if (!applicant?.AadharCardNumber?.trim()) {
        errors.push(`${applicantName}: Aadhaar Card Number is required.`);
      }

      if (!applicant?.AadharCardURL?.trim()) {
        errors.push(`${applicantName}: Aadhaar Card Document is required.`);
      }

      if (!applicant?.PanNumber?.trim()) {
        errors.push(`${applicantName}: PAN Card Number is required.`);
      }

      if (!applicant?.PanCardURL?.trim()) {
        errors.push(`${applicantName}: PAN Card Document is required.`);
      }
    });

    return errors;
  };

  const handleTenantResponse = (tenant: any) => {

    setTenantId(Number(tenant?.TenantId ?? 0));

    setFormData(prev => ({
      ...prev,
      TenantId: Number(tenant?.TenantId ?? 0)
    }));

    setTenantList(tenant);

    setApplicantList(tenant?.TenantApplicantData || []);

    if (!tenantList) return;

    const validationErrors = validateTenantDetails(tenantList);

    if (validationErrors.length > 0) {

      addToast({ type: "error", title: validationErrors[0] });
    }
    return;
  };

  const fetchBookingDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationBookingRequest = {
          PageNumber: 1,
          PageSize: 1,
          BookingId: bookingId,
          BookingSearchKey: "TENANT BOOKING",
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
              ReferralPercentage: booking.ReferralPercentage ?? 0,
              ReferralAmount: booking.ReferralAmount ?? 0,

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
              TenantBuildingId: booking.TenantBuildingId ?? 0,
              CarpetAreaPurchasedSqFt: booking.CarpetAreaPurchasedSqFt ?? "",
              IsApplicableOtherCharge: booking.IsApplicableOtherCharge ?? false,
            });

            const savedTab = booking.CarpetAreaPurchasedSqFt?.toUpperCase();

            setActiveTab(savedTab === "MOFA" ? "MOFA" : "RERA");

            setTenantUniqueCode(booking.SystemGeneratedCode ?? "");

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
                Note: "",
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
                TenantId: booking.TenantId || 0,
                TenantSystemGeneratedCode: "",
                TenantBuildingId: booking.TenantBuildingId || 0,
              });
            }
            setParkingId(booking.ParkingId ?? null);
            setSelectedParkingValues(booking.ParkingId ?? "");
            setParkingData(booking.ParkingData || []);

            setTenantId(booking.TenantId ?? 0);
            setSelectedBuildingId(booking.TenantBuildingId ?? 0);

            if (booking.InventoryFlatId) {
              handleFieldChange("InventoryFlatId", booking.InventoryFlatId);
            }

            setDropdownLabels({
              bankName: booking.BankName || "",
              paymentScheduleScheme: booking.PaymentScheduleScheme || "",
              tenantBuildingName: booking.TenantBuildingName || "",
            });

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

            if (booking.IsApplicableOtherCharge) {
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
  const handleFieldChange = (field: keyof AddUpdateBookingRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const paymentScheduleColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: "Type",
        label: "Type",
        sortable: false,
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "Date",
        label: "Date / Stage (Milestone)",
        sortable: false,
        align: "center",

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
        align: "right",
        render: (value) => `${value || 0}%`,
      },
      {
        key: "Cumulative",
        label: "Cumulative (%)",
        sortable: false,
        align: "right",
        render: (_value, _row, index) => {
          return `${cumulativePercentages[index]?.toFixed(2) || 0}%`;
        },
      },
      {
        key: "PaymentScheduleAmount",
        label: "Amount Without TDS (₹)",
        sortable: false,
        align: "right",
        render: (value) => formatCurrency(value) || "0",
      },
      {
        key: "PaymentScheduleGSTAmount",
        label: "GST Amount (₹)",
        sortable: false,
        align: "right",
        render: (value) => formatCurrency(value) || "0",
      },
      {
        key: "PaymentScheduleTDSAmount",
        label: "TDS Amount (₹)",
        sortable: false,
        align: "right",
        render: (value) => formatCurrency(value) || "0",
      },
      {
        key: "PaymentScheduleTotalAmount",
        label: "Total Amount With TDS (₹)",
        sortable: false,
        align: "right",
        render: (_, row) =>
          formatCurrency(
            (row?.PaymentScheduleAmount || 0) +
            (row?.PaymentScheduleTDSAmount || 0)
          ) || "0",
      },
      ...(Number(formData.PaymentScheduleSchemeMasterId) !== 0 ? [] : [
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
        align: "left",
        render: (value) => value || "-",
      },
      {
        key: "Value",
        label: "Value (₹)",
        width: "18",
        sortable: false,
        align: "right",
        render: (value) => formatCurrency(value) || "0",
      },
      {
        key: "GSTPercentage",
        label: "GST (%)",
        width: "12",
        sortable: false,
        align: "right",
        render: (value) => `${value || 0}%`,
      },
      {
        key: "GSTValue",
        label: "GST Value (₹)",
        width: "18",
        sortable: false,
        align: "right",
        render: (value) => formatCurrency(value) || "0",
      },
    ],
    [canAction],
  );
  const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ProjectId || formData.ProjectId === 0) {
      newErrors.ProjectId = "Project is required";
    }
    if (!formData.TenantBuildingId || formData.TenantBuildingId === 0) {
      newErrors.TenantBuildingId = "Building is required";
    }
    if (!formData.TenantId || formData.TenantId === 0) {
      newErrors.TenantId = "Tenant Code is required";
    }

    if (Number(tenantList?.InventoryFlatId) > 0 && formData.InventoryFlatId !== tenantList?.InventoryFlatId) {
      newErrors.TenantId = "The allotted unit does not match the unit selected in the tenant booking";
    }

    if (!formData.PermanentAddress) {
      newErrors.PermanentAddress = "Permanent Address is required";
    } else if (formData.PermanentAddress.trim().length < 25) {
      newErrors.PermanentAddress = "Permanent Address must be at least 25 characters";
    }

    if (!formData.CommunicationAddress) {
      newErrors.CommunicationAddress = "Communication Address is required";
    } else if (formData.CommunicationAddress.trim().length < 25) {
      newErrors.CommunicationAddress = "Communication Address must be at least 25 characters";
    }

    if (formData.AgreementValue === null || formData.AgreementValue === undefined || String(formData.AgreementValue).trim() === "") {
      newErrors.AgreementValue = "Agreement Value is required";
    }

    if (!formData.AgreementValueGSTPercentage === null || formData.AgreementValueGSTPercentage === undefined) {
      newErrors.AgreementValueGSTPercentage = "Agreement GST (%) is required";
    }

    if (!formData.StampDutyPercentage === null || formData.StampDutyPercentage === undefined) {
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

    if (!formData.FlatAlterationRemark?.trim()) {
      newErrors.FlatAlterationRemark = "Unit / Modulation / Customization Remark is required";
    } else if (formData.FlatAlterationRemark.trim().length < 25) {
      newErrors.FlatAlterationRemark = "Unit / Modulation / Customization Remark must be at least 25 characters";
    }


    if (!formData.PaymentRemark?.trim()) {
      newErrors.PaymentRemark = "Payment Related Remark is required";
    } else if (formData.PaymentRemark.trim().length < 25) {
      newErrors.PaymentRemark = "Payment Remark must be at least 25 characters";
    }

    if (!formData.TermsAndConditionsDescription?.trim()) {
      newErrors.TermsAndConditionsDescription = "Terms and Conditions Description is required";
    }

    if (Number(formData.AgreementValue) < 0 && paymentSchedules.length === 0) {
      addToast({ type: "error", title: "Payment schedule is required" });
      return { isValid: false, errors: newErrors };
    }



    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };


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

    const validationErrors = validateTenantDetails(tenantList);

    if (validationErrors.length > 0) {

      addToast({ type: "error", title: validationErrors[0] });

      return;
    }

    const validation = validateForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      addToast({ type: "error", title: "Please fill the required filed" });

      return;
    }



    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const formDataToSend = new FormData();
        formDataToSend.append("BookingId", String(formData.BookingId ?? 0));
        formDataToSend.append("Uniquekey", formData.Uniquekey ?? "3fa85f64-5717-4562-b3fc-2c963f66afa6");
        formDataToSend.append("ProjectId", String(formData.ProjectId ?? 0));
        formDataToSend.append("EnquiryId", String(formData.EnquiryId ?? 0));
        formDataToSend.append("PermanentAddress", formData.PermanentAddress ?? "");
        formDataToSend.append("CommunicationAddress", formData.CommunicationAddress ?? "");
        formDataToSend.append("BrokeragePercentage", String(formData.BrokeragePercentage ?? 0));
        formDataToSend.append("BrokerageAmount", String(formData.BrokerageAmount ?? 0));

        formDataToSend.append("ReferralPercentage", String(formData.ReferralPercentage ?? 0));
        formDataToSend.append("ReferralAmount", String(formData.ReferralAmount ?? 0));

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

        formDataToSend.append("IsApplicableOtherCharge", String(formData.IsApplicableOtherCharge ?? false));

        const otherChargesJSON = formData.IsApplicableOtherCharge && otherCharges.length > 0 ? JSON.stringify(otherCharges) : "";
        formDataToSend.append("OtherChargesDetailJSON", otherChargesJSON);

        formDataToSend.append("PaymentScheduleSchemeMasterId", String(formData.PaymentScheduleSchemeMasterId ?? 0));

        const paymentScheduleJSON = paymentSchedules.length > 0 ? JSON.stringify(paymentSchedules) : "";
        formDataToSend.append("PaymentScheduleDetailJSON", paymentScheduleJSON);
        formDataToSend.append("BookingAmount", String(formData.BookingAmount ?? 0));
        formDataToSend.append("ChequeRTGSNumber", formData.ChequeRTGSNumber ?? "");
        formDataToSend.append("ChequeRTGSDate", formData.ChequeRTGSDate ?? "");
        formDataToSend.append("BankListMasterId", String(formData.BankListMasterId ?? 0));
        formDataToSend.append("TransferBookingId", String(formData.TransferBookingId ?? 0));
        formDataToSend.append("TenantId", String(formData.TenantId ?? 0));
        formDataToSend.append("TenantBuildingId", String(formData.TenantBuildingId ?? 0));

        const carpetArea = Number(formData.TenantId ?? 0) > 0 && !String(formData.CarpetAreaPurchasedSqFt ?? "").trim() ? "RERA" : String(formData.CarpetAreaPurchasedSqFt ?? "");

        formDataToSend.append("CarpetAreaPurchasedSqFt", carpetArea);
        formDataToSend.append("OTP", "");

        const response = await bookingService.apiCallAddUpdateBooking(formDataToSend);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

          updateTenantListState({ bookingId: 0, bookingName: "" });

          const redirectPage = sourcePage;

          setSourcePage(null);

          if (redirectPage === "inventory") {
            navigate("/inventory");

          } else if (redirectPage === "parking") {

            navigate("/parking");

          } else {

            navigate("/tenantBooking");

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

  const fetchTncByModuleName = (moduleName: string) => (page: number, params?: { value?: string }) =>
    fetchTncMasterDropdown(page, {
      value: params?.value || "",
      moduleName: moduleName,
    });

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

  const fetchPaymentScheduleSchemeMaster = () => (page: number) =>
    fetchPaymentScheduleSchemeMasterDropDown(page, {
      projectId: Number(projectId),
      inventoryBuildingId: (location.state as any)?.flatData.InventoryBuildingId ?? selectedFlatData?.InventoryBuildingId ?? 0,
      inventoryFlatFloorBasementPodiumWingId: (location.state as any)?.flatData!.InventoryFlatFloorBasementPodiumWingId ?? selectedFlatData?.InventoryFlatFloorBasementPodiumWingId ?? 0,
    });

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
          IsCheckPermission: false
        };

        const response = await paymentScheduleMasterService.apiCallPullPaymentScheduleMaster(params);

        if (E.isRight(response)) {

          const mappedPaymentSchedule = mapPaymentScheduleToBookingPaymentSchedule(response.right.Data, Number(formData.AgreementValue), Number(formData.AgreementValueGSTPercentage), Number((formData.AgreementValue || 0) - Number((formData.AgreementValueTDS || 0))));

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

  const fetchBuildingCallback = useCallback((pageNumber: number, params?: { value?: string }) =>
    fetchBuildingDropdown(pageNumber, { projectId: Number(projectId), buildingName: params?.value || "" }),
    [projectId]
  );



  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
            <div>
              <SingleSelectDropdownWithPagination
                key={projectId}
                required
                label="Building"
                disabled={Number(bookingId) > 0 || isTenantDataFromState}
                title="Select Building"
                isShowClearSelection={false}
                size="lg"
                error={errors.TenantBuildingId}
                initialValue={createDropdownInitialValue(formData.TenantBuildingId, dropdownLabels.tenantBuildingName)}
                dataFetchCallBack={fetchBuildingCallback}
                onSelected={(item) => {
                  if (!item) {

                    handleFieldChange("TenantBuildingId", null);

                    setSelectedBuildingId(0);

                    setTenantId(0);
                    setTenantList(null);
                    setApplicantList([]);

                    return;
                  }

                  const selectedBuildingId = Number(item?.value ?? 0);
                  handleFieldChange("TenantBuildingId", selectedBuildingId);
                  setSelectedBuildingId(selectedBuildingId);
                  setTenantId(0);
                  setTenantList(null);
                  setApplicantList([]);

                }}
              />
            </div>

            <div>
              <Input
                type="text"
                required
                disabled={Number(bookingId) > 0 || isTenantDataFromState}
                label="Tenant Code"
                value={tenantUniqueCode}
                onChange={(e) => {
                  setTenantList(null);
                  setApplicantList([]);
                  setTenantUniqueCode((e.target.value).toUpperCase());
                  setTenantId(0);

                }}
                placeholder="Search By Tenant Code"
                leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                error={errors.TenantId}
              />
            </div>
          </div>
          {tenantUniqueCode && tenantUniqueCode.trim() !== "" && (
            Number(tenantId) > 0 ? (
              <div className="pt-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">
                  <div className="lg:col-span-3 space-y-6">

                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                      <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#C2410C]">
                          Applicant Details
                        </h4>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="space-y-5">
                          {applicantList.length > 0 ? (
                            applicantList.map((tenantData, i) => {

                              return (
                                <div key={tenantData.TenantApplicantId ?? i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  {/* SECTION 1 */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <FieldItem label="Type" value={tenantData.ApplicantType} className='text-blue-900 bold' />
                                    <FieldItem label="Applicant Name" value={tenantData.ApplicantName} urls={tenantData?.PhotoURL} isIcon />
                                    <FieldItem label="Mobile Number" value={`${getSafeString(tenantData?.ApplicantMobileNumberCountryCode ?? "+91")}  ${getSafeString(tenantData?.ApplicantMobileNumber)}`} />
                                    <FieldItem label="E-Mail ID" value={tenantData?.ApplicantEmailId} />

                                    <FieldItem label="Aadhaar Card No." value={tenantData?.AadharCardNumber} urls={tenantData?.AadharCardURL} isIcon />
                                    <FieldItem label="PAN No." value={tenantData?.PanNumber} urls={tenantData?.PanCardURL} isIcon />
                                    <FieldItem label="Passport No." value={tenantData?.PassportNumber} urls={tenantData?.PassportURL} isIcon />
                                    <FieldItem label="Driving License" value={tenantData?.DrivingLicenseNumber} urls={tenantData?.DrivingLicenseURL} isIcon />
                                    <FieldItem label="Voting ID No." value={tenantData?.VotingIdNumber} urls={tenantData?.VotingIdURL} isIcon />
                                    <FieldItem label="GST No." value={tenantData?.GSTNumber} urls={tenantData?.GSTNumberURL} isIcon />

                                    <FieldItem label="Bank Name" value={tenantData?.BankName} />
                                    <FieldItem label="Account No." value={tenantData?.AccountNumber} urls={tenantData?.ChequeURL} isIcon />
                                    <FieldItem label="IFSC" value={tenantData?.IFSCCode} />
                                  </div>

                                </div>
                              );
                            })
                          ) : (
                            <div className="py-6 text-center text-gray-500 text-sm">
                              <NoDataView message="No Applicant Data Found" />
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                  </div>
                </div>

                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

                  <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                    <h4 className="text-sm font-semibold text-[#13367A]">
                      Exisiting Unit Details
                    </h4>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                      <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FieldItem label="Tenant Code" value={tenantList?.SystemGeneratedCode} />
                          <FieldItem label="Unit / Annexure / Survey Number" value={tenantList?.UnitAnnexureSurveyNumber} />
                          <FieldItem label="Unit Type" value={tenantList?.UnitType} />
                        </div>
                      </div>

                      <div className="lg:col-span-3 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tenantList?.UnitType?.toUpperCase() !== "GYM"
                            ?
                            <FieldItem label="Unit Configuration" value={tenantList?.UnitConfiguration} />
                            : <FieldItem label="Unit Carpet Area (SqFt)" value={tenantList?.UnitCarpetAreaSqFt} />
                          }

                          {tenantList?.UnitType?.toUpperCase() !== "GYM"
                            ?
                            <FieldItem label="Unit Carpet Area (SqFt)" value={tenantList?.UnitCarpetAreaSqFt} />
                            : ""
                          }
                          <FieldItem label="Unit Facing" value={tenantList?.UnitFacing} />

                        </div>
                      </div>


                    </div>

                  </div>
                </section>

                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-5">

                  <div className="bg-[#FFFFE4] px-3 py-2 border-b border-[#D0D7DE]">
                    <h4 className="text-sm font-semibold text-[#7B6B28]">
                      Eligibility Details in Carpet Area (SqFt)
                    </h4>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                      <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FieldItem label="Extra Free Carpet Area Offered (%)" value={tenantList?.ExtraFreeCarpetAreaOfferedPercent} />
                          <FieldItem label="Free MOFA Carpet Area (SqFt)" value={tenantList?.FreeMOFACarpetAreaSqFt} />

                        </div>
                      </div>


                      <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FieldItem label="Existing Terrace Area (SqFt)" value={tenantList?.ExistingTerraceAreaSqFt} />
                          <FieldItem label="New Eligibility MOFA Carpet Area (SqFt)" value={tenantList?.NewEligibilityMOFACarpetAreaSqFt} />
                          <FieldItem label="New Eligibility RERA Carpet Area (SqFt)" value={tenantList?.NewEligibilityRERACarpetAreaSqFt} />


                        </div>
                      </div>


                      <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FieldItem label="(A) Area Against Terrace (SqFt)" value={tenantList?.AreaAgainstTerraceSqFt} />
                          <FieldItem label="MOFA Carpet Area Purchased (SqFt)" value={tenantList?.MOFACarpetAreaPurchasedSqFt} />
                          <FieldItem label="RERA Carpet Area Purchased (SqFt)" value={tenantList?.RERACarpetAreaPurchasedSqFt} />


                        </div>
                      </div>
                      <div className="lg:col-span-3 pt-3 pb-3 border-b border-[#135bec2e] pb-3 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FieldItem label="(B) Deck Area (SqFt)" value={tenantList?.DeckAreaSqFt} />
                          <FieldItem label="Total New MOFA Carpet Area (SqFt)" value={tenantList?.TotalNewMOFACarpetAreaSqFt} />
                          <FieldItem label="(C) Total New Rera Carpet Area (SqFt)" value={tenantList?.TotalNewRERACarpetAreaSqFt} />



                        </div>
                      </div>
                      <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                        <div className='flex'>
                          <FieldItem
                            label="Area Against Terrace + Deck Area + Total New RERA Carpet Area (SqFt) (A + B + C)"
                            value={(
                              (Number(tenantList?.TotalNewRERACarpetAreaSqFt) || 0) +
                              (Number(tenantList?.DeckAreaSqFt) || 0) +
                              (Number(tenantList?.AreaAgainstTerraceSqFt) || 0)
                            ).toFixed(2)}
                          />
                        </div>

                      </div>

                      <div className="lg:col-span-3 pt-3 pb-3">
                        <div className='flex'>
                          <FieldItem label="Remark" value={tenantList?.Remark} />
                        </div>

                      </div>


                    </div>
                  </div>

                </section>
              </div>
            )
              :
              (
                <div className="pt-5 mt-5 p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700">
                  {"No Tenant details found for this Unique Code"}
                </div>
              )
          )}

          <div className="space-y-4 pt-5">
            <Tabs
              tabs={CarpetAreaPurchasedSqFtTabList}
              defaultActive={activeTab}
              islarge={true}
              onTabChange={(t) => {
                setActiveTab(t.id);

                handleFieldChange("CarpetAreaPurchasedSqFt", t.id);
              }}
              istoggleTab={true}
            />
          </div>
          {/* ============================================================= [ADDRESS DETAILS] ============================================================================================= */}
          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

              <TextArea
                label="Permanent Address"
                maxLength={500}
                required
                value={formData.PermanentAddress ?? ""}
                onChange={(e) => handleFieldChange("PermanentAddress", e.target.value)}
                placeholder="Enter Permanent Address"
                error={errors.PermanentAddress} />

              <TextArea
                label="Communication Address"
                maxLength={500}
                required
                value={formData.CommunicationAddress ?? ""}
                onChange={(e) => handleFieldChange("CommunicationAddress", e.target.value)}
                placeholder="Enter Communication Address"
                error={errors.CommunicationAddress} />

            </div>
          </div>

          {/* ============================================================= [PROJECT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Project Details</h3>

            {formData.BookingType === "FLAT" && selectedFlatData && (
              <div className="pt-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  <FieldItem label="Building" value={selectedFlatData?.BuildingNumber || "-"} />

                  <FieldItem label="Wing" value={selectedFlatData?.Wing || selectedWing || "-"} />

                  <FieldItem label="Floor" value={selectedFlatData?.Floor || selectedFloor || "-"} />

                  <FieldItem label="Unit No" value={selectedFlatData?.Flat || "-"} />

                  <FieldItem label="Type" value={selectedFlatData?.FlatType || "-"} />

                  <FieldItem label="Configuration" value={selectedFlatData?.FlatConfiguration || "-"} />

                  <FieldItem label="RERA Carpet Area" value={selectedFlatData?.RERACarpetAreaSqFt ? `${selectedFlatData.RERACarpetAreaSqFt} SqFt` : "-"} />
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


              <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f]">
                <h4 className="text-lg font-semibold text-gray-900">
                  Parking Details
                </h4>

                {parkingData.map((parking, index) => {

                  const isLast = index === (parkingData?.length ?? 0) - 1;

                  return (
                    <div key={parking.ParkingId || index} className="pt-4">
                      <h3 className="text-sm font-semibold text-gray-500">
                        Parking {index + 1}
                      </h3>
                      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${!isLast ? "border-b border-[#135bec2e] pb-4" : "border-b border-[#135bec2e] pb-4 pt-4"} `} >
                        <FieldItem label="Parking Number" value={parking.ParkingNumber} />
                        <FieldItem label="Building" value={parking.BuildingNumber} />
                        <FieldItem label="Wing" value={parking.Wing} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pt-4 pb-4">
                        <FieldItem label="Floor" value={parking.Floor} />
                        <FieldItem label="Category" value={parking.ParkingCategory} />
                        <FieldItem label="Type" value={parking.ParkingType} />
                      </div>
                      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${!isLast ? "border-b border-[#135bec2e] pb-4" : ""} `} >
                        <FieldItem label="Size" value={parking.ParkingSubType} />
                        <FieldItem label="Dimensions" value={parking.ParkingDimensions} />
                        <FieldItem label="EV Charging" value={parking.IsEVChargingAvailable ? 'Yes' : 'No'} />
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
          </div>

          {/* ============================================================= [AGREEMENT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Agreement Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Agreement Value (With TDS) (₹)"
                value={formData.AgreementValue?.toString() ?? ""}
                onChange={(e) => {
                  const value = filterNumbersWithDecimal(e.target.value);

                  const agreementValue = Number(value || 0);

                  handleFieldChange("AgreementValue", value);
                  const tdsAmount = agreementValue > 4999999.99 ? (agreementValue * 1) / 100 : 0;

                  handleFieldChange("AgreementValueTDS", tdsAmount.toFixed(2));

                  /* ================= REGISTRATION FEES ================= */
                  const registrationFees = agreementValue > 2999999.99 ? 30000 : (agreementValue * 1) / 100;

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
                  const referelAMount = (agreementValue * Number(formData.ReferralPercentage)) / 100;

                  handleFieldChange("ReferralAmount", referelAMount.toFixed(2));

                  /* ================= LOYALTY % ================= */
                  const loyaltyAMount = (agreementValue * Number(formData.LoyaltyPercentage)) / 100;

                  handleFieldChange("LoyaltyAmount", loyaltyAMount.toFixed(2));

                  /* ================= EMPLOYEE REFERENCE % ================= */
                  const employeeReferenceAMount = (agreementValue * Number(formData.EmployeeReferencePercentage)) / 100;

                  handleFieldChange("EmployeeReferenceAmount", employeeReferenceAMount.toFixed(2));
                  const agreementValueWithoutTDS = Number(agreementValue || 0) - Number(tdsAmount || 0);

                  if (paymentSchedules.length > 0) {
                    setPaymentSchedules((prev) =>
                      prev.map((schedule) => ({
                        ...schedule,

                        PaymentScheduleAmount: Number(((agreementValueWithoutTDS * (schedule.PaymentSchedulePercentage || 0)) / 100).toFixed(2)),

                        PaymentScheduleGSTAmount: Number(((((agreementValue * (schedule.PaymentSchedulePercentage || 0)) / 100) * (formData.AgreementValueGSTPercentage || 0)) / 100).toFixed(2)),

                        PaymentScheduleTDSAmount: agreementValue > 4999999.99 ? Number((((agreementValue * (schedule.PaymentSchedulePercentage || 0)) / 100) * 1 / 100).toFixed(2)) : 0,

                      })),
                    );
                  }
                  if (Boolean(formData.IsApplicableOtherCharge)) {

                    if (otherCharges.length === 0) {
                      loadOtherCharges();
                    }

                    else {

                      const flatDataFromState = (location.state as any)?.flatData;

                      const rERACarpetAreaSqFt = flatDataFromState?.RERACarpetAreaSqFt ?? selectedFlatData?.RERACarpetAreaSqFt ?? 0;
                      const mappedCharges = mapOtherChargesToBookingOtherCharges(Number(rERACarpetAreaSqFt), otherChargesData);

                      setOtherCharges(mappedCharges);

                    }
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
          <div className="space-y-4 pt-5">
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

                    const agreementValue = formData.AgreementValue || 0;

                    const cstAmount = (agreementValue * Number(percentage)) / 100;
                    if (paymentSchedules.length > 0) {
                      setPaymentSchedules((prev) =>
                        prev.map((schedule) => ({
                          ...schedule,
                          PaymentScheduleGSTAmount: Number(((((agreementValue * (schedule.PaymentSchedulePercentage || 0)) / 100) * (Number(percentage) || 0)) / 100).toFixed(2)),
                        })),
                      );
                    }

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


          {/* ============================================================= [OTHER DETAILS] ============================================================================================= */}
          <div className="space-y-4 pt-5">
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

          <div className="space-y-4 pt-5">
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
              initialValue={createDropdownInitialValue(bookingId > 0 ? String(formData.PaymentScheduleSchemeMasterId) : '', dropdownLabels.paymentScheduleScheme)}
              error={errors.PaymentScheduleSchemeMasterId}
            />
          </div>


          {/* ============================================================= [PAYMENT SCHEDULE TABLE] ============================================================================================= */}
          <div className="space-y-4 pt-5">
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
          <div className="space-y-4 pt-5">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">

              <h3 className="text-lg font-semibold text-gray-900">
                Other Charges
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Applicable</span>

                <ToggleSwitch
                  label=""
                  name="IsApplicableOtherCharge"
                  value={formData.IsApplicableOtherCharge ?? false}
                  onChange={(_, value) => {

                    handleFieldChange("IsApplicableOtherCharge", Boolean(value));

                    if (value) {

                      if (otherCharges.length === 0) {

                        loadOtherCharges();

                      } else {

                        const flatDataFromState = (location.state as any)?.flatData;

                        const rERACarpetAreaSqFt = flatDataFromState?.RERACarpetAreaSqFt ?? selectedFlatData?.RERACarpetAreaSqFt ?? 0;

                        const mappedCharges = mapOtherChargesToBookingOtherCharges(Number(rERACarpetAreaSqFt), otherChargesData);

                        setOtherCharges(mappedCharges);
                      }

                    } else {

                      setOtherCharges([]);

                      handleFieldChange("OtherChargesDetailJSON", null);

                    }
                  }}
                />
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
          <div className="space-y-4 pt-5">
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
          <div className="space-y-4 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5">
              <div>
                <TextArea required className='thin-scroll' label="Unit / Modulation / Customization Remark" value={formData.FlatAlterationRemark ?? ""} onChange={(e) => handleFieldChange("FlatAlterationRemark", e.target.value)} placeholder="Enter Unit / Modulation / Customization" error={errors.FlatAlterationRemark} />
              </div>
              <div>
                <TextArea required className='thin-scroll' label="Payment Related Remark" value={formData.PaymentRemark ?? ""} onChange={(e) => handleFieldChange("PaymentRemark", e.target.value)} placeholder="Enter Payment Related Remark" error={errors.PaymentRemark} />
              </div>
              <div>
                <TextArea className='thin-scroll' label="Other Remark" value={formData.OtherRemark ?? ""} onChange={(e) => handleFieldChange("OtherRemark", e.target.value)} placeholder="Enter Other Remark" error={errors.OtherRemark} />
              </div>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Term & Condition"
                  title="Term & Condition"
                  required
                  size="lg"
                  dataFetchCallBack={fetchTncByModuleName("Booking")}
                  onSelected={(item) => handleFieldChange("TermsAndConditionsDescription", item?.value)}
                  error={errors.TermsAndConditionsDescription} />
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
            navigate("/tenantBooking");
          }
        }}
        canAction={canAction}
        onSave={() => {
          handleSubmit();
        }}
        isLoading={isLoading}
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
          const agreementValueMinusTDS = Number(formData.AgreementValue || 0) - Number(formData.AgreementValueTDS || 0);
          const percentage = Number(paymentSchedulePercentage);
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

          const amountMinusTDS = (agreementValueMinusTDS * percentage) / 100;

          const newSchedule: AddUpdateBookingPaymentScheduleRequest = {
            BookingPaymentScheduleId: editingPaymentScheduleIndex !== null ? (paymentSchedules[editingPaymentScheduleIndex]?.BookingPaymentScheduleId ?? 0) : 0,
            Type: paymentScheduleType,
            Name: scheduleName,
            Date: scheduleDate,
            PaymentSchedulePercentage: percentage,
            PaymentScheduleAmount: amountMinusTDS,
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


    </div>
  );
};

export default AddUpdateTenantBooking;
