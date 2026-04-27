import { runApiWithLoader } from "@/core/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { bookingService } from '@/features/booking/services/BookingService';
import type { BookingData, FilterWithPaginationBookingRequest } from '@/features/booking/models/BookingModel';
import type { FilterWithPaginationFlatAlterationRequest, FlatAlterationRequestData, AddUpdateFlatAlterationRequest } from '@/features/crmPayTrack/models/FlatAlterationRequestModel';
import type { FilterWithPaginationBookingApplicantModificationRequest, BookingApplicantModificationDataRequest, BookingApplicantModificationRequest } from '@/features/crmPayTrack/models/BookingApplicantModificationModel';
import type { ParkingModificationDetailsData } from '@/features/crmPayTrack/models/ParkingModificationModel';
import { APPLICANT_TYPE } from "@/core/constants";
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import * as E from 'fp-ts/Either';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { usePayTrackBookingListState } from "../context/PayTrackBookingListStateContext";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button, Input } from "@/ui/components/forms";
import { IdCardIcon, Plus } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { fetchParkingDropdown } from "@/features/parking/parkingDropDown";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import type { AddUpdateParkingModificationRequest } from '@/features/crmPayTrack/models/ParkingModificationModel';
import { parkingModificationService } from '@/features/crmPayTrack/services/ParkingModificationService';
import { flatAlterationService } from '@/features/crmPayTrack/services/FlatAlterationService';
import { bookingApplicantModificationService } from '@/features/crmPayTrack/services/BookingApplicantModelCrmService';
import usePagination from "@/core/hooks/usePagination";
import { TextArea } from "@/ui/components/forms/Textarea";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { filterEmail, filterAadhaar, filterPAN, filterPassportNumber, filterDrivingLicenseNumber, filterVoterId, filterGST, isValidMobile, isValidEmail, calculateMergedFiles, isValidAadhaar, isValidPAN, isValidPassportNumber, isValidDrivingLicenseNumber, isValidVoterId, isValidGST, mergeFiles, calculateRemovedFiles, createFileUrlString, filterMobile } from "@/core/utils/fileValidation";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";

const initialFormState = (): AddUpdateParkingModificationRequest => ({
    ParkingModificationRequestId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    BookingId: 0,
    ProjectId: 0,
    ParkingId: '',
    ParkingData: [],
    IsApproval: false,
    ApprovalStatus: '',
    VersionNumber: '',
    ParkingModificationDocumentURL: [],
    RemoveParkingModificationDocumentURL: '',
    CreatedById: 0,
    CreatedBy: '',
    CreatedDate: '',
    ModifiedById: 0,
    ModifiedBy: '',
    ModifiedDate: ''
});

const initialFormStateForFlatAlterationRequest = (): AddUpdateFlatAlterationRequest => ({
    FlatAlterationRequestId: 0,
    UniqueKey: "7b14cc10-2533-f111-854a-c7681b271aa8",
    BookingId: 0,
    ProjectId: 0,
    FlatAlterationRemark: '',
    IsApproval: false,
    ApprovalStatus: '',
    VersionNumber: '',
    CreatedById: 0,
    CreatedBy: '',
    CreatedDate: '',
    ModifiedById: 0,
    ModifiedBy: '',
    ModifiedDate: '',
    FlatAlterationDocumentURL: [],
    RemoveFlatAlterationDocumentURL: '',
});

const initialFormStateForDetailsRequest = (): BookingApplicantModificationRequest => ({
    BookingApplicantModificationRequestId: 0,
    RemovePhotoURL: '',
    RemoveGSTNumberURL: '',
    PanCardURL: [],
    DrivingLicenseNumber: '',
    RemoveAadharCardURL: '',
    RemovePanCardURL: '',
    PanNumber: '',
    RemoveVotingIdURL: '',
    AadharCardURL: [],
    VotingIdNumber: '',
    ApplicantName: '',
    VotingIdURL: [],
    ApplicantMobileNumber: '',
    AadharCardNumber: '',
    RemoveDrivingLicenseURL: '',
    GSTNumber: '',
    DrivingLicenseURL: [],
    ApplicantEmailId: '',
    RemovePassportURL: '',
    PassportNumber: '',
    ApplicantType: '',
    PhotoURL: [],
    PassportURL: [],
    GSTNumberURL: [],
    CancelledChequeURL: [],
    POAURL: [],
    IncomeForm16ITRURL: [],
    NreNroBankDetailsURL: [],
    NomineeFormURL: [],
    StatementOfSourceOfFundsURL: [],
    PaymentProofURL: [],
    BookingApplicantModificationDocumentUploadURL: [],
    RemoveBookingApplicantModificationDocumentUploadURL: '',
});

type RequestBookingApplicantWithFiles = BookingApplicantModificationDataRequest & {
    _photoFiles?: (File | string)[];
    _aadharFiles?: (File | string)[];
    _panFiles?: (File | string)[];
    _passportFiles?: (File | string)[];
    _drivingFiles?: (File | string)[];
    _votingFiles?: (File | string)[];
    _gstFiles?: (File | string)[];

    _cancelledChequeFiles?: (File | string)[];
    _pOAFiles?: (File | string)[];
    _incomeForm16ITRFiles?: (File | string)[];
    _nreNroBankDetailsFiles?: (File | string)[];
    _nomineeFormFiles?: (File | string)[];
    _statementOfSourceOfFundsFiles?: (File | string)[];
    _paymentProofFiles?: (File | string)[];
    _bookingApplicantModificationDocumentUploadFiles?: (File | string)[];

    RemovePhotoURL?: string;
    RemoveAadharCardURL?: string;
    RemovePanCardURL?: string;
    RemovePassportURL?: string;
    RemoveDrivingLicenseURL?: string;
    RemoveVotingIdURL?: string;
    RemoveGSTNumberURL?: string;
    RemoveCancelledChequeURL?: string;
    RemovePOAURL?: string;
    RemoveIncomeForm16ITRURL?: string;
    RemoveNreNroBankDetailsURL?: string;
    RemoveNomineeFormURL?: string;
    RemoveStatementOfSourceOfFundsURL?: string;
    RemovePaymentProofURL?: string;
    CreatedDate?: string | null;
    ModifiedDate?: string | null;
    RemoveBookingApplicantModificationDocumentUploadURL?: string;

}

export const Requests: React.FC = () => {

    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [bookingApplicantModificationData, setBookingApplicantModificationData] = useState<BookingApplicantModificationDataRequest[]>([]);
    const [flatAlterationData, setFlatAlterationData] = useState<FlatAlterationRequestData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // ParkingSwapModal
    const [isAddUpdateParkingSwapModalOpen, setIsAddUpdateParkingSwapModalOpen] = useState(false);
    const [swapParkingFormData, setSwapParkingFormData] = useState<any>({});
    const [swapParkingErrors, setSwapParkingErrors] = useState<any>({});

    // FlatAlterationModal
    const [isAddUpdateFlatAlterationModalOpen, setIsAddUpdateFlatAlterationModalOpen] = useState(false);

    // Applicant Details Modal
    const [isAddUpdateApplicantDetailsModalOpen, setIsAddUpdateApplicantDetailsModalOpen] = useState(false);
    const [applicantList, setApplicantList] = useState<RequestBookingApplicantWithFiles[]>([]);

    // BookingApplicantModificationDocumentUpload
    const [bookingApplicantModificationDocumentUploadFiles, setBookingApplicantModificationDocumentUploadFiles] = useState<(File | string)[]>([]);
    const [removedBookingApplicantModificationDocumentUploadURLs, setRemovedBookingApplicantModificationDocumentUploadURLs] = useState<string[]>([]);

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

    // ================= CANCELLED CHEQUE =================
    const [cancelledChequeFiles, setCancelledChequeFiles] = useState<(File | string)[]>([]);
    const [removedCancelledChequeURLs, setRemovedCancelledChequeURLs] = useState<string[]>([]);

    // ================= POA =================
    const [pOAFiles, setPOAFiles] = useState<(File | string)[]>([]);
    const [removedPOAURLs, setRemovedPOAURLs] = useState<string[]>([]);

    // ================= INCOME FORM 16 / ITR =================
    const [incomeForm16ITRFiles, setIncomeForm16ITRFiles] = useState<(File | string)[]>([]);
    const [removedIncomeForm16ITRURLs, setRemovedIncomeForm16ITRURLs] = useState<string[]>([]);

    // ================= NRE / NRO BANK DETAILS =================
    const [nreNroBankDetailsFiles, setNreNroBankDetailsFiles] = useState<(File | string)[]>([]);
    const [removedNreNroBankDetailsURLs, setRemovedNreNroBankDetailsURLs] = useState<string[]>([]);

    // ================= NOMINEE FORM =================
    const [nomineeFormFiles, setNomineeFormFiles] = useState<(File | string)[]>([]);
    const [removedNomineeFormURLs, setRemovedNomineeFormURLs] = useState<string[]>([]);

    // ================= STATEMENT OF SOURCE OF FUNDS =================
    const [statementOfSourceOfFundsFiles, setStatementOfSourceOfFundsFiles] = useState<(File | string)[]>([]);
    const [removedStatementOfSourceOfFundsURLs, setRemovedStatementOfSourceOfFundsURLs] = useState<string[]>([]);

    // ================= PAYMENT PROOF =================
    const [paymentProofFiles, setPaymentProofFiles] = useState<(File | string)[]>([]);
    const [removedPaymentProofURLs, setRemovedPaymentProofURLs] = useState<string[]>([]);

    //ADD UPDATE PARKING MODIFICATION REQUEST 
    const [formData, setFormData] = useState<AddUpdateParkingModificationRequest>(() => initialFormState());

    // ADD UPDATE FLAT ALTERATION REQUEST
    const [formDataForFlatAlteration, setFormDataForFlatAlteration] = useState<AddUpdateFlatAlterationRequest>(() => initialFormStateForFlatAlterationRequest());

    // ADD UPDATE APPLICANT DETAILS REQUEST
    const [formDataDetails, setFormDataDetails] = useState<BookingApplicantModificationRequest>(() => initialFormStateForDetailsRequest());
    const [editingApplicantData, setEditingApplicantData] = useState<{ row: RequestBookingApplicantWithFiles; index: number } | null>(null);

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    // ERROR SET UP FOR APPLICANT DETAILS
    const [errorsBookingApplicant, setErrorsBookingApplicant] = useState<{ [k: string]: string }>({});

    // APPROVAL LOG MODAL FOR BOOKING APPLICANT MODIFICATION REQUEST
    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [ownerName, setOwnerName] = useState<string | null>("");

    // APPROVAL LOG MODAL FOR PARKING MODIFICATION REQUEST
    const [isParkingApprovalLogModalOpen, setIsParkingApprovalLogModalOpen] = useState(false);
    const [approvalParkingLogRequest, setApprovalParkingLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [parkingNumber, setParkingNumber] = useState<string | null>("");


    // APPROVAL ACTION MODAL FOR BOOKING APPLICANT MODIFICATION REQUEST
    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<BookingApplicantModificationDataRequest | null>(null);

    // APPROVAL ACTION MODAL FOR PARKING MODIFICATION REQUEST
    const [isParkingApprovalActionModalOpen, setIsParkingApprovalActionModalOpen] = useState(false);
    const [approvalParkingActionType, setApprovalParkingActionType] = useState<"approve" | "reject">("approve");
    const [approvalParkingRowData, setApprovalParkingRowData] = useState<ParkingModificationDetailsData | null>(null);


    const { canAction } = useMenuPermissions("/payTrack");
    const { pagination, setPagination } = usePagination(10);
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState } = usePayTrackBookingListState();
    const { bookingId } = listState;

    const isBookingCancelled = bookingData?.ApprovalStatus == 'Cancel' || bookingData?.ApprovalStatus == 'Refund';
    const isParkingDetailsEmpty = !bookingData?.ParkingNumber || bookingData.ParkingNumber === "-";
    const isParkingEmpty = !bookingData?.ParkingNumber || bookingData?.ParkingNumber === "-";

    const latestApplicantData = useMemo(() => {
        if (!bookingApplicantModificationData || bookingApplicantModificationData.length === 0) return [];
        const latestRecord = bookingApplicantModificationData[bookingApplicantModificationData.length - 1];
        return [latestRecord];

    }, [bookingApplicantModificationData]);

    // #region INIT
    useEffect(() => {
        if (!projectId || !bookingId) return;

        loadBookingForSummary();
        fetchFlatAlterationRequest();
        fetchBookingApplicantModificationList();

    }, [projectId, bookingId]);
    // #endregion

    const handleFieldChange = (field: keyof AddUpdateFlatAlterationRequest, value: any) => {

        setFormDataForFlatAlteration((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleFieldChangeBookingApplicantDetails = (field: keyof BookingApplicantModificationRequest, value: any) => {

        setFormDataDetails((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const PushParkingModificationFormData = (): AddUpdateParkingModificationRequest => {
        return {
            ParkingModificationRequestId: formData.ParkingModificationRequestId,
            Uniquekey: formData.Uniquekey,
            BookingId: bookingId,
            ProjectId: Number(projectId),
            ParkingId: swapParkingFormData?.ParkingId,
            ParkingData: formData.ParkingData,
            IsApproval: formData.IsApproval,
            ApprovalStatus: formData.ApprovalStatus,
            VersionNumber: formData.VersionNumber,
            CreatedById: formData.CreatedById,
            CreatedBy: formData.CreatedBy,
            CreatedDate: formData.CreatedDate,
            ModifiedById: formData.ModifiedById,
            ModifiedBy: formData.ModifiedBy,
            ModifiedDate: formData.ModifiedDate
        };
    };

    const PushFlatAlterationFormData = (): AddUpdateFlatAlterationRequest => {
        return {
            FlatAlterationRequestId: formDataForFlatAlteration.FlatAlterationRequestId,
            UniqueKey: formDataForFlatAlteration.UniqueKey,
            BookingId: bookingId,
            ProjectId: Number(projectId),
            FlatAlterationRemark: formDataForFlatAlteration.FlatAlterationRemark,
            IsApproval: formDataForFlatAlteration.IsApproval,
            ApprovalStatus: formDataForFlatAlteration.ApprovalStatus,
            VersionNumber: formDataForFlatAlteration.VersionNumber,
            CreatedById: formDataForFlatAlteration.CreatedById,
            CreatedBy: formDataForFlatAlteration.CreatedBy,
            CreatedDate: formDataForFlatAlteration.CreatedDate,
            ModifiedById: formDataForFlatAlteration.ModifiedById,
            ModifiedBy: formDataForFlatAlteration.ModifiedBy,
            ModifiedDate: formDataForFlatAlteration.ModifiedDate
        };
    };

    const handleApprovalSubmit = async (remark: string) => {

        if (!approvalRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "BOOKING APPLICANT MODIFICATION APPROVAL",
            Id: bookingId ?? 0,
            ProjectId: projectId ?? 0,
            IsApproved: approvalActionType === "approve",
            Remarks: remark ?? null,
            SubId: approvalRowData.BookingApplicantModificationRequestId ?? 0
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsApprovalActionModalOpen(false);
                    await loadBookingForSummary();
                    await fetchBookingApplicantModificationList();

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
            approvalActionType === "approve" ? "Approving Booking" : "Rejecting Booking"
        );
    };

    const handleParkingApprovalSubmit = async (remark: string) => {

        if (!approvalParkingRowData) return;

        const payload: UpdateModulesWorkflowApprovalRequest = {
            ModuleName: "PARKING MODIFICATION APPROVAL",
            Id: bookingId ?? 0,
            ProjectId: projectId ?? 0,
            IsApproved: approvalParkingActionType === "approve",
            Remarks: remark ?? null,
            SubId: approvalParkingRowData.ParkingModificationRequestId ?? 0
        };

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await modulesWorkflowApprovalService.apiCallupdateModulesWorkflowApproval(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });

                    setIsApprovalActionModalOpen(false);
                    await loadBookingForSummary();
                    await fetchBookingApplicantModificationList();
                    // await fetchParkingModificationListNewParking();

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
            approvalActionType === "approve" ? "Approving Booking" : "Rejecting Booking"
        );
    };

    const validateAddApplicantForm = (): {
        isValid: boolean;
        errorsBookingApplicant: { [key: string]: string };
    } => {
        const newErrorsBookingApplicant: { [key: string]: string } = {};

        if (!formDataDetails.ApplicantType?.trim()) {
            newErrorsBookingApplicant.ApplicantType = "Applicant Type is required";
        }

        if (!formDataDetails.ApplicantName?.trim()) {
            newErrorsBookingApplicant.ApplicantName = "Applicant Name is required";
        }

        if (!formDataDetails.ApplicantMobileNumber?.trim()) {
            newErrorsBookingApplicant.ApplicantMobileNumber = "Mobile Number is required";
        } else if (!isValidMobile(formDataDetails.ApplicantMobileNumber.trim())) {
            newErrorsBookingApplicant.ApplicantMobileNumber = "Enter a valid 10-Digit Mobile Number";
        }

        if (formDataDetails.ApplicantEmailId?.trim() && !isValidEmail(formDataDetails.ApplicantEmailId.trim())) {
            newErrorsBookingApplicant.ApplicantEmailId = "Enter a valid Email Id";
        }

        const mergedPhotoFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, removedApplicantPhotoURLs) : applicantPhotoFiles.slice();

        if (mergedPhotoFiles.length === 0) {
            newErrorsBookingApplicant.PhotoURL = "Applicant Photo is required";
        }

        const mergedAadharFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, removedAadharCardURLs) : aadharCardFiles.slice();
        const AadharCardNumber = formDataDetails.AadharCardNumber?.trim() || "";
        const hasAadharCardNumber = AadharCardNumber !== "";
        const hasAadharCardNumberFile = mergedAadharFiles.length > 0;

        if (!hasAadharCardNumber) {
            newErrorsBookingApplicant.AadharCardNumber = "Enter a valid Aadhaar Card Number";
        }
        else if (!isValidAadhaar(AadharCardNumber)) {
            newErrorsBookingApplicant.AadharCardNumber = "Enter a valid Aadhaar Card Number";
        }

        if (!hasAadharCardNumberFile) {
            newErrorsBookingApplicant.AadharCardURL = "Aadhaar document is required";
        }

        const mergedPanFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._panFiles, panCardFiles, removedPanCardURLs) : panCardFiles.slice();
        const PanNumber = formDataDetails.PanNumber?.trim() || "";
        const hasPanNumber = PanNumber !== "";
        const hasPanFile = mergedPanFiles.length > 0;

        if (!hasPanNumber) {
            newErrorsBookingApplicant.PanNumber = "Enter a valid PAN Card Number";
        }
        else if (!isValidPAN(PanNumber)) {
            newErrorsBookingApplicant.PanNumber = "Enter a valid PAN Card Number";
        }
        if (!hasPanFile) {
            newErrorsBookingApplicant.PanCardURL = "PAN document is required";
        }

        const mergedPassportFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._passportFiles, passportFiles, removedPassportURLs) : passportFiles.slice();
        const PassportNumber = formDataDetails.PassportNumber?.trim() || "";
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
        const DLNumber = formDataDetails.DrivingLicenseNumber?.trim() || "";
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
        const VotingIdNumber = formDataDetails.VotingIdNumber?.trim() || "";
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
        const GSTNumber = formDataDetails.GSTNumber?.trim() || "";
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

    const validateAddParkingSwapForm = (): {
        isValid: boolean;
        errors: { [k: string]: string };
    } => {
        const errors: { [k: string]: string } = {};

        if (!swapParkingFormData.ParkingId) {
            errors.ParkingId = "Parking is required";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };

    const validateAddFlatAlterationForm = (): {
        isValid: boolean;
        errors: { [k: string]: string };
    } => {
        const errors: { [k: string]: string } = {};

        if (!formDataForFlatAlteration.FlatAlterationRemark) {
            errors.FlatAlterationRemark = "Flat Alteration Remark is required";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };

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
        const finalRemovedCancelledChequeURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._cancelledChequeFiles, cancelledChequeFiles, removedCancelledChequeURLs) : removedCancelledChequeURLs;
        const finalRemovedPOAURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._pOAFiles, pOAFiles, removedPOAURLs) : removedPOAURLs;
        const finalRemovedIncomeForm16ITRURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._incomeForm16ITRFiles, incomeForm16ITRFiles, removedIncomeForm16ITRURLs) : removedIncomeForm16ITRURLs;
        const finalRemovedNreNroBankDetailsURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._nreNroBankDetailsFiles, nreNroBankDetailsFiles, removedNreNroBankDetailsURLs) : removedNreNroBankDetailsURLs;
        const finalRemovedNomineeFormURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._nomineeFormFiles, nomineeFormFiles, removedNomineeFormURLs) : removedNomineeFormURLs;
        const finalRemovedStatementOfSourceOfFundsURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._statementOfSourceOfFundsFiles, statementOfSourceOfFundsFiles, removedStatementOfSourceOfFundsURLs) : removedStatementOfSourceOfFundsURLs;
        const finalRemovedPaymentProofURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._paymentProofFiles, paymentProofFiles, removedPaymentProofURLs) : removedPaymentProofURLs;
        const finalRemovedBookingApplicantModificationDocumentUploadURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._bookingApplicantModificationDocumentUploadFiles, bookingApplicantModificationDocumentUploadFiles, removedBookingApplicantModificationDocumentUploadURLs) : removedBookingApplicantModificationDocumentUploadURLs.slice();

        const mergedPhotoFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, finalRemovedPhotoURLs) : applicantPhotoFiles.slice();
        const mergedAadharFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, finalRemovedAadharURLs) : aadharCardFiles.slice();
        const mergedPanFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._panFiles, panCardFiles, finalRemovedPanURLs) : panCardFiles.slice();
        const mergedPassportFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._passportFiles, passportFiles, finalRemovedPassportURLs) : passportFiles.slice();
        const mergedDrivingFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, finalRemovedDrivingURLs) : drivingLicenseFiles.slice();
        const mergedVotingFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._votingFiles, votingIdFiles, finalRemovedVotingURLs) : votingIdFiles.slice();
        const mergedGstFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._gstFiles, gstFiles, finalRemovedGstURLs) : gstFiles.slice();
        const mergedCancelledChequeFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._cancelledChequeFiles, cancelledChequeFiles, finalRemovedCancelledChequeURLs) : cancelledChequeFiles.slice();
        const mergedPOAFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._pOAFiles, pOAFiles, finalRemovedPOAURLs) : pOAFiles.slice();
        const mergedIncomeForm16ITRFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._incomeForm16ITRFiles, incomeForm16ITRFiles, finalRemovedIncomeForm16ITRURLs) : incomeForm16ITRFiles.slice();
        const mergedNreNroBankDetailsFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._nreNroBankDetailsFiles, nreNroBankDetailsFiles, finalRemovedNreNroBankDetailsURLs) : nreNroBankDetailsFiles.slice();
        const mergedNomineeFormFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._nomineeFormFiles, nomineeFormFiles, finalRemovedNomineeFormURLs) : nomineeFormFiles.slice();
        const mergedStatementOfSourceOfFundsFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._statementOfSourceOfFundsFiles, statementOfSourceOfFundsFiles, finalRemovedStatementOfSourceOfFundsURLs) : statementOfSourceOfFundsFiles.slice();
        const mergedPaymentProofFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._paymentProofFiles, paymentProofFiles, finalRemovedPaymentProofURLs) : paymentProofFiles.slice();
        const mergedBookingApplicantModificationDocumentUploadFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._bookingApplicantModificationDocumentUploadFiles, bookingApplicantModificationDocumentUploadFiles, finalRemovedBookingApplicantModificationDocumentUploadURLs) : bookingApplicantModificationDocumentUploadFiles.slice();

        const applicantToSave: RequestBookingApplicantWithFiles = {

            BookingApplicantModificationRequestId: editingApplicantData?.row.BookingApplicantModificationRequestId ?? 0,
            BookingApplicantModificationDocumentUploadURL: createFileUrlString(mergedBookingApplicantModificationDocumentUploadFiles),
            ApplicantType: formDataDetails.ApplicantType || "",
            ApplicantName: formDataDetails.ApplicantName || "",
            ApplicantMobileNumber: formDataDetails.ApplicantMobileNumber || "",
            ApplicantEmailId: formDataDetails.ApplicantEmailId || "",
            PhotoURL: createFileUrlString(mergedPhotoFiles),
            AadharCardNumber: formDataDetails.AadharCardNumber || "",
            AadharCardURL: createFileUrlString(mergedAadharFiles),
            PanNumber: formDataDetails.PanNumber || "",
            PanCardURL: createFileUrlString(mergedPanFiles),
            PassportNumber: formDataDetails.PassportNumber || "",
            PassportURL: createFileUrlString(mergedPassportFiles),
            DrivingLicenseNumber: formDataDetails.DrivingLicenseNumber || "",
            DrivingLicenseURL: createFileUrlString(mergedDrivingFiles),
            VotingIdNumber: formDataDetails.VotingIdNumber || "",
            VotingIdURL: createFileUrlString(mergedVotingFiles),
            GSTNumber: formDataDetails.GSTNumber || "",
            GSTNumberURL: createFileUrlString(mergedGstFiles),
            CancelledChequeURL: createFileUrlString(mergedCancelledChequeFiles),
            POAURL: createFileUrlString(mergedPOAFiles),
            IncomeForm16ITRURL: createFileUrlString(mergedIncomeForm16ITRFiles),
            NreNroBankDetailsURL: createFileUrlString(mergedNreNroBankDetailsFiles),
            NomineeFormURL: createFileUrlString(mergedNomineeFormFiles),
            StatementOfSourceOfFundsURL: createFileUrlString(mergedStatementOfSourceOfFundsFiles),
            PaymentProofURL: createFileUrlString(mergedPaymentProofFiles),
            IsApproval: false,
            ApprovalStatus: "",
            VersionNumber: "1",
            CreatedById: null,
            CreatedBy: null,
            CreatedDate: null,
            ModifiedById: null,
            ModifiedBy: null,
            ModifiedDate: null,

            _photoFiles: mergedPhotoFiles,
            _aadharFiles: mergedAadharFiles,
            _panFiles: mergedPanFiles,
            _passportFiles: mergedPassportFiles,
            _drivingFiles: mergedDrivingFiles,
            _votingFiles: mergedVotingFiles,
            _gstFiles: mergedGstFiles,
            _cancelledChequeFiles: mergedCancelledChequeFiles,
            _pOAFiles: mergedPOAFiles,
            _incomeForm16ITRFiles: mergedIncomeForm16ITRFiles,
            _nreNroBankDetailsFiles: mergedNreNroBankDetailsFiles,
            _nomineeFormFiles: mergedNomineeFormFiles,
            _statementOfSourceOfFundsFiles: mergedStatementOfSourceOfFundsFiles,
            _paymentProofFiles: mergedPaymentProofFiles,

            RemovePhotoURL: finalRemovedPhotoURLs.join(','),
            RemoveAadharCardURL: finalRemovedAadharURLs.join(','),
            RemovePanCardURL: finalRemovedPanURLs.join(','),
            RemovePassportURL: finalRemovedPassportURLs.join(','),
            RemoveDrivingLicenseURL: finalRemovedDrivingURLs.join(','),
            RemoveVotingIdURL: finalRemovedVotingURLs.join(','),
            RemoveGSTNumberURL: finalRemovedGstURLs.join(','),
            RemoveCancelledChequeURL: finalRemovedCancelledChequeURLs.join(','),
            RemovePOAURL: finalRemovedPOAURLs.join(','),
            RemoveIncomeForm16ITRURL: finalRemovedIncomeForm16ITRURLs.join(','),
            RemoveNreNroBankDetailsURL: finalRemovedNreNroBankDetailsURLs.join(','),
            RemoveNomineeFormURL: finalRemovedNomineeFormURLs.join(','),
            RemoveStatementOfSourceOfFundsURL: finalRemovedStatementOfSourceOfFundsURLs.join(','),
            RemovePaymentProofURL: finalRemovedPaymentProofURLs.join(','),
            RemoveBookingApplicantModificationDocumentUploadURL: finalRemovedBookingApplicantModificationDocumentUploadURLs.join(','),
        };

        const updatedApplicantList: RequestBookingApplicantWithFiles[] = editingApplicantData
            ? applicantList.map((item, i) => (i === editingApplicantData.index ? applicantToSave : item))
            : [...applicantList, applicantToSave];

        setApplicantList(updatedApplicantList);
        setIsAddUpdateApplicantDetailsModalOpen(false);
        setEditingApplicantData(null);
        setFormDataDetails(initialFormStateForDetailsRequest());
        setApplicantPhotoFiles([]);
        setAadharCardFiles([]);
        setPanCardFiles([]);
        setPassportFiles([]);
        setDrivingLicenseFiles([]);
        setVotingIdFiles([]);
        setGstFiles([]);
        setCancelledChequeFiles([]);
        setPOAFiles([]);
        setIncomeForm16ITRFiles([]);
        setNreNroBankDetailsFiles([]);
        setNomineeFormFiles([]);
        setStatementOfSourceOfFundsFiles([]);
        setPaymentProofFiles([]);

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,
            async () => {

                const formDataToSend = new FormData();
                formDataToSend.append('ProjectId', String(projectId));
                formDataToSend.append('BookingId', String(bookingId));

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

                updatedApplicantList.forEach((app, index) => {
                    const prefix = `bookingApplicantModificationRequests[${index}]`;

                    formDataToSend.append(`${prefix}.BookingApplicantModificationRequestId`, String(app.BookingApplicantModificationRequestId ?? 0));
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
                    formDataToSend.append(`${prefix}.RemoveCancelledChequeURL`, app.RemoveCancelledChequeURL ?? "");
                    formDataToSend.append(`${prefix}.RemovePOAURL`, app.RemovePOAURL ?? "");
                    formDataToSend.append(`${prefix}.RemoveIncomeForm16ITRURL`, app.RemoveIncomeForm16ITRURL ?? "");
                    formDataToSend.append(`${prefix}.RemoveNreNroBankDetailsURL`, app.RemoveNreNroBankDetailsURL ?? "");
                    formDataToSend.append(`${prefix}.RemoveNomineeFormURL`, app.RemoveNomineeFormURL ?? "");
                    formDataToSend.append(`${prefix}.RemoveStatementOfSourceOfFundsURL`, app.RemoveStatementOfSourceOfFundsURL ?? "");
                    formDataToSend.append(`${prefix}.RemovePaymentProofURL`, app.RemovePaymentProofURL ?? "");
                    formDataToSend.append(`${prefix}.RemoveBookingApplicantModificationDocumentUploadURL`, app.RemoveBookingApplicantModificationDocumentUploadURL ?? "");

                    formDataToSend.append(`${prefix}.CancelledChequeURL`, app.CancelledChequeURL ?? "");
                    formDataToSend.append(`${prefix}.POAURL`, app.POAURL ?? "");
                    formDataToSend.append(`${prefix}.IncomeForm16ITRURL`, app.IncomeForm16ITRURL ?? "");
                    formDataToSend.append(`${prefix}.NreNroBankDetailsURL`, app.NreNroBankDetailsURL ?? "");
                    formDataToSend.append(`${prefix}.NomineeFormURL`, app.NomineeFormURL ?? "");
                    formDataToSend.append(`${prefix}.StatementOfSourceOfFundsURL`, app.StatementOfSourceOfFundsURL ?? "");
                    formDataToSend.append(`${prefix}.PaymentProofURL`, app.PaymentProofURL ?? "");

                    const realApp: any = app;
                    addFilesWithExisting(formDataToSend, prefix, realApp._photoFiles, "PhotoURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._aadharFiles, "AadharCardURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._panFiles, "PanCardURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._passportFiles, "PassportURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._drivingFiles, "DrivingLicenseURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._votingFiles, "VotingIdURL");


                    addFilesWithExisting(formDataToSend, prefix, realApp._gstFiles, "GSTNumberURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._cancelledChequeFiles, "CancelledChequeURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._pOAFiles, "POAURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._incomeForm16ITRFiles, "IncomeForm16ITRURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._nreNroBankDetailsFiles, "NreNroBankDetailsURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._nomineeFormFiles, "NomineeFormURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._statementOfSourceOfFundsFiles, "StatementOfSourceOfFundsURL");
                    addFilesWithExisting(formDataToSend, prefix, realApp._paymentProofFiles, "PaymentProofURL");
                });

                const response = await bookingApplicantModificationService.apiCallAddUpdateBookingApplicantModification(formDataToSend);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });
                    fetchBookingApplicantModificationList();

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
        );
    };

    const handleAddUpdateParkingSwap = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateAddParkingSwapForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushParkingModificationFormData();

                const response = await parkingModificationService.apiCallAddUpdateParkingModificationDetails(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateParkingSwapModalOpen(false);

                    const isAdd = formData.ParkingModificationRequestId === 0;

                    if (isAdd) {
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    } else {
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

                    loadBookingForSummary();
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
            'Add Parking Modification Data'
        )
    };

    const handleAddUpdateFlatAlteration = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})

        const validation = validateAddFlatAlterationForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload = PushFlatAlterationFormData();
                const response = await flatAlterationService.apiCallAddUpdateFlatAlterationRequest(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateFlatAlterationModalOpen(false);

                    const isAdd = formDataForFlatAlteration.FlatAlterationRequestId === 0;

                    if (isAdd) {
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        fetchFlatAlterationRequest();
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                        setFormDataForFlatAlteration({
                            FlatAlterationRequestId: 0,
                            UniqueKey: "",
                            BookingId: bookingId,
                            ProjectId: Number(projectId),
                            FlatAlterationRemark: "",
                            IsApproval: false,
                            ApprovalStatus: "",
                            VersionNumber: "",
                        });
                    } else {
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

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
        )
    };

    const fetchParkingProjectWise = useCallback(async (pageNumber: number, params?: { value?: string }) => {
        return fetchParkingDropdown(pageNumber, {
            ...params,
            value: params?.value || "",
            projectId: Number(projectId) || 0,
            displayParkingId: swapParkingFormData?.ParkingId || "",
        });
    }, [projectId, swapParkingFormData?.ParkingId]);

    const parkingDropdown = useMultiSelectDropdown({
        value: swapParkingFormData?.ParkingId || null,
        fetchCallback: fetchParkingProjectWise,
        autoFetchOptions: isAddUpdateParkingSwapModalOpen,
    });


    const fetchBookingApplicantModificationList = async () => {
        return await loadBookingApplicantModificationRequest();
    };

    const loadBookingApplicantModificationRequest = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBookingApplicantModificationRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                };

                const response = await bookingApplicantModificationService.apiCallPullBookingApplicantModification(params);

                if (E.isRight(response)) {
                    setBookingApplicantModificationData(response.right.Data);

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
            'Loading Booking Applicant Modification Request'
        );
    };

    const loadBookingForSummary = async () => {
        if (!bookingId) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBookingRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    BookingId: bookingId,
                    ProjectId: Number(projectId),
                    IsCheckPermission: false
                };

                const response = await bookingService.apiCallPullBooking(params);

                if (E.isRight(response)) {
                    const booking = response.right.Data?.[0] ?? null;
                    setBookingData(booking);

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
            'Loading Booking Data'
        );
    };

    const fetchFlatAlterationRequest = async (page: number = pagination.currentPage) => {
        return await loadFlatAlterationRequest(page);
    };

    const loadFlatAlterationRequest = async (page: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationFlatAlterationRequest = {
                    PageNumber: page,
                    PageSize: 100,
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };

                const response = await flatAlterationService.apiCallPullFlatAlterationRequest(params);

                if (E.isRight(response)) {
                    if (response.right.Data && response.right.Data.length > 0) {
                        const latestDataIndex = response.right.Data.length - 1;

                        setFlatAlterationData(response.right.Data[latestDataIndex]);
                    } else {
                        setFlatAlterationData(null);
                    }

                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Flat Alteration Data'
        );

    };

    const summaryColumns = useMemo<TableColumn[]>(
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
                key: "VotingIdNumber",
                label: "Voting",
                width: "15",
                sortable: false,
                align: "center",
                render: (value) => value || "-",
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
                key: "CancelledChequeURL",
                label: "Cancelled Cheque",
                width: "15",
                align: "center",
                render: (_value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.CancelledChequeURL)}
                            title="Cancelled Cheque"
                            triggerLabel="-"
                            isWrap={false}
                        />
                    );
                },
            },
            {
                key: "POAURL",
                label: "POA",
                width: "15",
                align: "center",
                render: (_value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.POAURL)}
                            title="POA Document"
                            triggerLabel="-"
                            isWrap={false}
                        />
                    );
                },
            },
            {
                key: "IncomeForm16ITRURL",
                label: "Income / ITR",
                width: "15",
                align: "center",
                render: (_value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.IncomeForm16ITRURL)}
                            title="Income Document"
                            triggerLabel="-"
                            isWrap={false}
                        />
                    );
                },
            },
            {
                key: "NreNroBankDetailsURL",
                label: "NRE / NRO Bank Details",
                width: "15",
                align: "center",
                render: (_value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.NreNroBankDetailsURL)}
                            title="NRE / NRO Bank Details"
                            triggerLabel="-"
                            isWrap={false}
                        />
                    );
                },
            },
            {
                key: "NomineeFormURL",
                label: "Nominee Form",
                width: "15",
                align: "center",
                render: (_value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.NomineeFormURL)}
                            title="Nominee Form"
                            triggerLabel="-"
                            isWrap={false}
                        />
                    );
                },
            },
            {
                key: "StatementOfSourceOfFundsURL",
                label: "Statement of Source of Funds",
                width: "15",
                align: "center",
                render: (_value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.StatementOfSourceOfFundsURL)}
                            title="Statement of Source of Funds"
                            triggerLabel="-"
                            isWrap={false}
                        />
                    );
                },
            },
            {
                key: "PaymentProofURL",
                label: "Payment Proof",
                width: "15",
                align: "center",
                render: (_value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.PaymentProofURL)}
                            title="Payment Proof"
                            triggerLabel="-"
                            isWrap={false}
                        />
                    );
                },
            },
            {
                key: "ApprovalStatus",
                label: "Approval Status",
                width: "18",
                sortable: false,
                align: "center",
                render: (value, row) => (

                    <ApprovalActions
                        approvalStatus={value || "-"}
                        showApproval={row.IsApproval}
                        isIcons={true}
                        onHistory={() => handleApprovalLog(row)}
                        onApprove={() => handleApproveRejectDocument(row, "approve")}
                        onReject={() => handleApproveRejectDocument(row, "reject")}
                    />

                )
            },
        ],
        [applicantList, canAction]
    )

    const parkingColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "ParkingNumber",
                label: "Parking Number",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",

            },
            {
                key: "ParkingCategory",
                label: "Category",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },
            {
                key: "ParkingType",
                label: "Type",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },
            {
                key: "ParkingSubType",
                label: "Size",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },
            {
                key: "ParkingDimensions",
                label: "Dimensions",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },
            {
                key: "ParkingStatus",
                label: "Parking Status",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value) => value || "-",
            },

            {
                key: "ApprovalStatus",
                label: "Approval Status",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value, row) => (

                    <ApprovalActions
                        approvalStatus={value || "-"}
                        showApproval={row.IsApproval}
                        isIcons={true}
                        onHistory={() => handleParkingApprovalLog(row)}
                        onApprove={() => handleParkingApproveRejectDocument(row, "approve")}
                        onReject={() => handleParkingApproveRejectDocument(row, "reject")}
                    />
                )
            },
        ],
        []
    )

    const handleCreateRequestModal = () => {
        setIsAddUpdateApplicantDetailsModalOpen(true);
    }

    const handleCreateParkingSwapModal = () => {
        setIsAddUpdateParkingSwapModalOpen(true);
    }

    const handleCreateRequestFlatSpecificationModal = () => {
        setIsAddUpdateFlatAlterationModalOpen(true);
    }

    const handleApprovalLog = (row: BookingApplicantModificationDataRequest) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "BOOKING APPLICANT MODIFICATION APPROVAL",
            Id: bookingId ?? 0,
            ProjectId: projectId ?? 0,
            SubId: row.BookingApplicantModificationRequestId ?? 0
        };
        setOwnerName(row.ApplicantName);
        setApprovalLogRequest(request);
        setIsApprovalLogModalOpen(true);

    };

    const handleApproveRejectDocument = (row: BookingApplicantModificationDataRequest, approvalType: "approve" | "reject") => {

        setApprovalRowData(row);
        setOwnerName(row.ApplicantName);
        setApprovalActionType(approvalType);
        setIsApprovalActionModalOpen(true);

    };

    const handleParkingApprovalLog = (row: ParkingModificationDetailsData) => {
        const request: ModulesApprovalStatusRequest = {
            ModuleName: "PARKING MODIFICATION APPROVAL",
            Id: bookingId ?? 0,
            ProjectId: projectId ?? 0,
            SubId: row.ParkingModificationRequestId ?? 0
        };
        setParkingNumber(row.ParkingData?.[0]?.ParkingNumber ?? "-");
        setApprovalParkingLogRequest(request);
        setIsParkingApprovalLogModalOpen(true);
    };

    const handleParkingApproveRejectDocument = (row: ParkingModificationDetailsData, approvalType: "approve" | "reject") => {

        setApprovalParkingRowData(row);
        setParkingNumber(row.ParkingData?.[0]?.ParkingNumber ?? "-");
        setApprovalParkingActionType(approvalType);
        setIsParkingApprovalActionModalOpen(true);
    };


    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            {/* =================Applicant Details ================= */}
            <section className="bg-white rounded-xl pt-5">
                <div className="flex justify-between items-center mb-8">
                    <h4 className="text-lg font-semibold text-gray-900">
                        Applicant Details
                    </h4>

                    {canAction && (
                        <Button
                            onClick={handleCreateRequestModal}
                            color="blue"
                            size="sm"
                            variant="solid"
                            style={{ width: '190px' }}
                            leftIcon={<Plus className="h-4 w-4" />}
                            disabled={isBookingCancelled}
                        >
                            Create Requests
                        </Button>
                    )}
                </div>

                {latestApplicantData.length > 0 ? (
                    <DataTable
                        columns={summaryColumns}
                        data={latestApplicantData}
                        fixedHeight={false}
                        className="shadow-sm border border-gray-100 rounded-lg"
                    />
                ) : (
                    <div className="text-center py-10  rounded-xl text-gray-400">
                        No applicant records found.
                    </div>
                )}
            </section>

            {/* =================Parking Details ================= */}
            <section className="bg-white rounded-xl pt-5">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 ">
                        Parking Details
                    </h4>

                    <div className="">
                        {canAction && (
                            <div className="flex justify-end pb-2">
                                <Button
                                    onClick={() => {
                                        handleCreateParkingSwapModal();
                                    }}
                                    color="blue"
                                    size="sm"
                                    variant="solid"
                                    defineWidth
                                    style={{ width: '190px' }}
                                    leftIcon={<Plus className="h-4 w-4" />}
                                    disabled={isBookingCancelled || isParkingDetailsEmpty}
                                >
                                    Create Requests
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <DataTable
                    columns={parkingColumns}
                    data={bookingData?.ParkingData || []}
                    fixedHeight={true}
                    className="flex-1"
                />
            </section>

            {/* =================Flat Specification Remark ================= */}
            <div className="col-span-7 pt-5">

                <div className="flex justify-between items-center pb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                        Flat Specification Remark
                    </h4>

                    {canAction && (
                        <Button
                            onClick={handleCreateRequestFlatSpecificationModal}
                            color="blue"
                            size="sm"
                            variant="solid"
                            style={{ width: '190px' }}
                            leftIcon={<Plus className="h-4 w-4" />}
                            disabled={isBookingCancelled}
                        >
                            Create Requests
                        </Button>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
                    <div className="lg:col-span-3 pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                            <FieldItem label="" value={flatAlterationData?.FlatAlterationRemark || "-"} />
                        </div>
                    </div>
                </div>

            </div>

            {/* ADD BOOKING APPLICANT MODAL */}
            <Modal
                isOpen={isAddUpdateApplicantDetailsModalOpen}
                onClose={() => {
                    setIsAddUpdateApplicantDetailsModalOpen(false);
                    setFormDataDetails(initialFormStateForDetailsRequest());
                    setEditingApplicantData(null);
                    setApplicantList([]);
                    setErrorsBookingApplicant({});
                    setApplicantPhotoFiles([]);
                    setAadharCardFiles([]);
                    setPanCardFiles([]);
                    setPassportFiles([]);
                    setDrivingLicenseFiles([]);
                    setVotingIdFiles([]);
                    setGstFiles([]);
                    setCancelledChequeFiles([]);
                    setPOAFiles([]);
                    setIncomeForm16ITRFiles([]);
                    setNreNroBankDetailsFiles([]);
                    setNomineeFormFiles([]);
                    setStatementOfSourceOfFundsFiles([]);
                    setPaymentProofFiles([]);
                    setRemovedApplicantPhotoURLs([]);
                    setRemovedAadharCardURLs([]);
                    setRemovedPanCardURLs([]);
                    setRemovedPassportURLs([]);
                    setRemovedDrivingLicenseURLs([]);
                    setRemovedVotingIdURLs([]);
                    setRemovedGstURLs([]);
                    setRemovedCancelledChequeURLs([]);
                    setRemovedPOAURLs([]);
                    setRemovedIncomeForm16ITRURLs([]);
                    setRemovedNreNroBankDetailsURLs([]);
                    setRemovedNomineeFormURLs([]);
                    setRemovedStatementOfSourceOfFundsURLs([]);
                    setRemovedPaymentProofURLs([]);
                }}

                onCancel={() => {
                    setIsAddUpdateApplicantDetailsModalOpen(false);
                    setFormDataDetails(initialFormStateForDetailsRequest());
                    setEditingApplicantData(null);
                    setApplicantList([]);
                    setErrorsBookingApplicant({});
                    setApplicantPhotoFiles([]);
                    setAadharCardFiles([]);
                    setPanCardFiles([]);
                    setPassportFiles([]);
                    setDrivingLicenseFiles([]);
                    setVotingIdFiles([]);
                    setGstFiles([]);
                    setCancelledChequeFiles([]);
                    setPOAFiles([]);
                    setIncomeForm16ITRFiles([]);
                    setNreNroBankDetailsFiles([]);
                    setNomineeFormFiles([]);
                    setStatementOfSourceOfFundsFiles([]);
                    setPaymentProofFiles([]);
                    setRemovedApplicantPhotoURLs([]);
                    setRemovedAadharCardURLs([]);
                    setRemovedPanCardURLs([]);
                    setRemovedPassportURLs([]);
                    setRemovedDrivingLicenseURLs([]);
                    setRemovedVotingIdURLs([]);
                    setRemovedGstURLs([]);
                    setRemovedCancelledChequeURLs([]);
                    setRemovedPOAURLs([]);
                    setRemovedIncomeForm16ITRURLs([]);
                    setRemovedNreNroBankDetailsURLs([]);
                    setRemovedNomineeFormURLs([]);
                    setRemovedStatementOfSourceOfFundsURLs([]);
                    setRemovedPaymentProofURLs([]);
                }}

                title="Add Applicant"
                saveText="Add"
                cancelText="Cancel"
                onSubmit={handleAddUpdateBookingApplicant}
                loading={isLoading}
                size='half-screen'
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

                        <div>
                            <div>
                                <MultiFilePicker label="Proof of Document" placeholder="Upload Document" error={errorsBookingApplicant.BookingApplicantModificationDocumentUploadURL} value={bookingApplicantModificationDocumentUploadFiles} onChange={setBookingApplicantModificationDocumentUploadFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedBookingApplicantModificationDocumentUploadURLs((prev) => [...prev, url])} />
                            </div>
                        </div>
                        <div>
                            <SinglePageSelection label="Applicant Type" placeholder="Select Applicant Type" required value={formDataDetails?.ApplicantType ?? ""} onChange={(e) => handleFieldChangeBookingApplicantDetails("ApplicantType", String(e))} options={APPLICANT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))} error={errorsBookingApplicant.ApplicantType} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Name"
                                placeholder="Enter Your Name"
                                type="text"
                                value={formDataDetails.ApplicantName ?? ''}
                                onChange={(e) => handleFieldChangeBookingApplicantDetails('ApplicantName', e.target.value)}
                                error={errorsBookingApplicant.ApplicantName}
                                required
                            />
                        </div>

                        <div>
                            <Input label="Mobile Number" required error={errorsBookingApplicant.ApplicantMobileNumber} type="text" value={formDataDetails.ApplicantMobileNumber ?? ""} maxLength={10} leftIcon="+91" onChange={(e) => handleFieldChangeBookingApplicantDetails("ApplicantMobileNumber", filterMobile(e.target.value))} placeholder="Enter Mobile Number" />
                        </div>

                        <div>
                            <Input label="Email Id" error={errorsBookingApplicant.ApplicantEmailId} type="text" value={formDataDetails.ApplicantEmailId ?? ""} onChange={(e) => handleFieldChangeBookingApplicantDetails("ApplicantEmailId", filterEmail(e.target.value))} placeholder="Enter Email Id" />
                        </div>
                        <div>
                            <MultiFilePicker label="Profile Photo" placeholder="Select Photo" required error={errorsBookingApplicant.PhotoURL} value={applicantPhotoFiles} onChange={setApplicantPhotoFiles} allowedTypes={["image/jpeg", "image/png"]} maxFiles={1} maxSizeMB={5} onRemoveExisting={(url) => setRemovedApplicantPhotoURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="Aadhaar Card Number" error={errorsBookingApplicant.AadharCardNumber} required type="text" value={formDataDetails.AadharCardNumber ?? ""} maxLength={12} onChange={(e) => handleFieldChangeBookingApplicantDetails("AadharCardNumber", filterAadhaar(e.target.value))} placeholder="Enter Aadhaar Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="Aadhaar Card" required placeholder="Select Aadhaar Card" error={errorsBookingApplicant.AadharCardURL} value={aadharCardFiles} onChange={setAadharCardFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={2} maxSizeMB={10} onRemoveExisting={(url) => setRemovedAadharCardURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="PAN Card Number" required error={errorsBookingApplicant.PanNumber} type="text" value={formDataDetails.PanNumber ?? ""} maxLength={10} onChange={(e) => handleFieldChangeBookingApplicantDetails("PanNumber", filterPAN(e.target.value).toUpperCase())} placeholder="Enter PAN Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="PAN Card" required placeholder="Select PAN Card" error={errorsBookingApplicant.PanCardURL} value={panCardFiles} onChange={setPanCardFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]} maxFiles={2} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPanCardURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="Passport Number" error={errorsBookingApplicant.PassportNumber} type="text" value={formDataDetails.PassportNumber ?? ""} maxLength={8} onChange={(e) => handleFieldChangeBookingApplicantDetails("PassportNumber", filterPassportNumber(e.target.value.toUpperCase()))} placeholder="Enter Passport Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="Upload Passport" placeholder="Select Passport" error={errorsBookingApplicant.PassportURL} value={passportFiles} onChange={setPassportFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPassportURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="Driving License Number" error={errorsBookingApplicant.DrivingLicenseNumber} type="text" value={formDataDetails.DrivingLicenseNumber ?? ""} maxLength={15} onChange={(e) => handleFieldChangeBookingApplicantDetails("DrivingLicenseNumber", filterDrivingLicenseNumber(e.target.value.toUpperCase()))} placeholder="Enter Driving License Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="Upload Driving License" placeholder="Select Driving License" error={errorsBookingApplicant.DrivingLicenseURL} value={drivingLicenseFiles} onChange={setDrivingLicenseFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedDrivingLicenseURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="Voting ID Number" error={errorsBookingApplicant.VotingIdNumber} type="text" value={formDataDetails.VotingIdNumber ?? ""} maxLength={10} onChange={(e) => handleFieldChangeBookingApplicantDetails("VotingIdNumber", filterVoterId(e.target.value.toUpperCase()))} placeholder="Enter Voting ID Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="Voting ID" placeholder="Select Voting ID" error={errorsBookingApplicant.VotingIdURL} value={votingIdFiles} onChange={setVotingIdFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedVotingIdURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="GST Number" error={errorsBookingApplicant.GSTNumber} type="text" value={formDataDetails.GSTNumber ?? ""} maxLength={15} onChange={(e) => handleFieldChangeBookingApplicantDetails("GSTNumber", filterGST(e.target.value.toUpperCase()))} placeholder="Enter GST Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="Upload GST" placeholder="Select GST" error={errorsBookingApplicant.GSTNumberURL} value={gstFiles} onChange={setGstFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedGstURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Cancelled Cheque" placeholder="Select Cancelled Cheque" error={errorsBookingApplicant.CancelledChequeURL} value={cancelledChequeFiles} onChange={setCancelledChequeFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedCancelledChequeURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="POA (Power of Attorney)" placeholder="Select POA Document" error={errorsBookingApplicant.POAURL} value={pOAFiles} onChange={setPOAFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPOAURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Income Form 16 / ITR" placeholder="Select Income Form 16 / ITR" error={errorsBookingApplicant.IncomeForm16ITRURL} value={incomeForm16ITRFiles} onChange={setIncomeForm16ITRFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedIncomeForm16ITRURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="NRE / NRO Bank Details" placeholder="Select NRE / NRO Bank Details" error={errorsBookingApplicant.NreNroBankDetailsURL} value={nreNroBankDetailsFiles} onChange={setNreNroBankDetailsFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedNreNroBankDetailsURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Nominee Form" placeholder="Select Nominee Form" error={errorsBookingApplicant.NomineeFormURL} value={nomineeFormFiles} onChange={setNomineeFormFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedNomineeFormURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Statement of Source of Funds" placeholder="Select Statement of Source of Funds" error={errorsBookingApplicant.StatementOfSourceOfFundsURL} value={statementOfSourceOfFundsFiles} onChange={setStatementOfSourceOfFundsFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedStatementOfSourceOfFundsURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Payment Proof" placeholder="Select Payment Proof" error={errorsBookingApplicant.PaymentProofURL} value={paymentProofFiles} onChange={setPaymentProofFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPaymentProofURLs((prev) => [...prev, url])} />
                        </div>
                    </div>
                </div>
            </Modal>

            {/*MODAL FOR PARKING REQUEST */}
            <Modal
                isOpen={isAddUpdateParkingSwapModalOpen}
                onClose={() => {
                    setIsAddUpdateParkingSwapModalOpen(false);
                    setSwapParkingFormData(initialFormState());
                    setSwapParkingErrors({});
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateParkingSwapModalOpen(false);
                    setSwapParkingFormData(initialFormState());
                    setSwapParkingErrors({});
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title="Swap Parking"
                saveText="Save"
                onSubmit={handleAddUpdateParkingSwap}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >
                        <div>
                            <MultiFilePicker label="Proof of Document" placeholder="Upload Document" error={errorsBookingApplicant.PaymentProofURL} value={paymentProofFiles} onChange={setPaymentProofFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPaymentProofURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="Current Parking Number" value={bookingData?.ParkingNumber || "-"} disabled />
                        </div>
                        <MultiSelectPagination
                            label="Parking Type"
                            dataFetchCallBack={fetchParkingProjectWise}
                            selectedValues={parkingDropdown.selectedValues}
                            options={parkingDropdown.initialOptions}
                            disabled={isParkingEmpty}
                            onChange={(values) => {
                                const { idsString } = parkingDropdown.handleChange(values);
                                setSwapParkingFormData((prev: any) => ({ ...prev, ParkingId: idsString }));
                                if (swapParkingErrors.ParkingId) {
                                    setSwapParkingErrors((prev: any) => ({ ...prev, ParkingId: "" }));
                                }
                            }}
                            error={errors.ParkingId}
                        />
                    </div>
                </div>
            </Modal>

            {/* MODAL FOR FLAT ALTERATION REQUEST */}
            <Modal
                isOpen={isAddUpdateFlatAlterationModalOpen}
                onClose={() => {
                    setIsAddUpdateFlatAlterationModalOpen(false);
                    setFormDataForFlatAlteration(initialFormStateForFlatAlterationRequest());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateFlatAlterationModalOpen(false);
                    setFormDataForFlatAlteration(initialFormStateForFlatAlterationRequest());
                    setErrors({});
                }}
                title="Flat Alteration Request"
                saveText="Add"
                onSubmit={handleAddUpdateFlatAlteration}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-5 p-3 bg-blue-100">
                    <div>
                        <MultiFilePicker label="Proof of Document" placeholder="Upload Document" error={errorsBookingApplicant.PaymentProofURL} value={paymentProofFiles} onChange={setPaymentProofFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPaymentProofURLs((prev) => [...prev, url])} />
                    </div>
                    <TextArea
                        label="Remark"
                        required
                        placeholder="Enter Remark"
                        value={formDataForFlatAlteration.FlatAlterationRemark}
                        onChange={(e) => handleFieldChange("FlatAlterationRemark", e.target.value)}
                        error={errors.FlatAlterationRemark}
                    />
                </div>
            </Modal >

            {/* Approval for Applicant Details */}
            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Applicant Details'
                titleText={ownerName ?? ""}
                onClose={() => setIsApprovalLogModalOpen(false)}
                request={approvalLogRequest} />

            <ApprovalActionModal
                title="Applicant Details"
                isOpen={isApprovalActionModalOpen}
                onClose={() => setIsApprovalActionModalOpen(false)}
                actionType={approvalActionType}
                titleText={ownerName ?? ""}
                onSubmit={handleApprovalSubmit}
                loading={isLoading}
            />


            {/* Approval for Parking Details */}
            <ApprovalLogModal
                isOpen={isParkingApprovalLogModalOpen}
                title='Parking Details'
                titleText={parkingNumber ?? ""}
                onClose={() => setIsParkingApprovalLogModalOpen(false)}
                request={approvalParkingLogRequest} />

            <ApprovalActionModal
                title="Parking Details"
                isOpen={isParkingApprovalActionModalOpen}
                onClose={() => setIsParkingApprovalActionModalOpen(false)}
                actionType={approvalParkingActionType}
                titleText={parkingNumber ?? ""}
                onSubmit={handleParkingApprovalSubmit}
                loading={isLoading}
            />


        </div >
    )
}

export default Requests