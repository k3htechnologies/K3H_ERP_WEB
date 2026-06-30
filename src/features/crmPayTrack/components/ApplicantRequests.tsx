
import { runApiWithLoader } from "@/core/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterWithPaginationBookingApplicantModificationRequest, BookingApplicantModificationDataRequest, BookingApplicantModificationRequest, DeleteBookingApplicantModificationModelRequest } from '@/features/crmPayTrack/models/BookingApplicantModificationModel';
import { APPLICANT_TYPE } from "@/core/constants";
import { useToast } from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import * as E from 'fp-ts/Either';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { type TableColumn } from "@/ui/components/DataTable/DataTable";
import { usePayTrackBookingListState } from '@/features/crmPayTrack/context/PayTrackBookingListStateContext';
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Button, Input } from "@/ui/components/forms";
import { IdCardIcon, Plus, Trash2,Edit } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import { bookingApplicantModificationService } from '@/features/crmPayTrack/services/BookingApplicantModelCrmService';
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { filterEmail, filterAadhaar, filterPAN, filterPassportNumber, filterDrivingLicenseNumber, filterVoterId, filterGST, isValidMobile, isValidEmail, calculateMergedFiles, isValidAadhaar, isValidPAN, isValidPassportNumber, isValidDrivingLicenseNumber, isValidVoterId, isValidGST, mergeFiles, calculateRemovedFiles, createFileUrlString } from "@/core/utils/fileValidation";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import ApprovalActions from "@/features/modulesWorkflowApproval/components/ApprovalActionsButton";
import type { ModulesApprovalStatusRequest, UpdateModulesWorkflowApprovalRequest } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import { ApprovalLogModal } from "@/features/modulesWorkflowApproval/components/ApprovalLogModal";
import ApprovalActionModal from "@/features/modulesWorkflowApproval/components/ApprovalActionModal";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import MobileNumberInput from "@/ui/components/forms/MobileNumberInput";
import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import usePagination from "@/core/hooks/usePagination";

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
    ApplicantMobileNumberCountryCode: "+91",
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
    ProofOfDocumentURL: [],
    RemoveProofOfDocumentURL: '',
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
    _proofOfDocumentFiles?: (File | string)[];

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
    RemoveProofOfDocumentURL?: string;

    CreatedDate?: string | null;
    ModifiedDate?: string | null;

}
interface Props {
    onLoaded?: () => void;
}

export const ApplicantRequests: React.FC<Props> = ({ onLoaded }) => {

    const [bookingApplicantModificationData, setBookingApplicantModificationData] = useState<BookingApplicantModificationDataRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isAddUpdateApplicantDetailsModalOpen, setIsAddUpdateApplicantDetailsModalOpen] = useState(false);
    const [applicantList, setApplicantList] = useState<RequestBookingApplicantWithFiles[]>([]);

    const [applicantPhotoFiles, setApplicantPhotoFiles] = useState<(File | string)[]>([]);
    const [removedApplicantPhotoURLs, setRemovedApplicantPhotoURLs] = useState<string[]>([]);

    const [aadharCardFiles, setAadharCardFiles] = useState<(File | string)[]>([]);
    const [removedAadharCardURLs, setRemovedAadharCardURLs] = useState<string[]>([]);

    const [panCardFiles, setPanCardFiles] = useState<(File | string)[]>([]);
    const [removedPanCardURLs, setRemovedPanCardURLs] = useState<string[]>([]);

    const [passportFiles, setPassportFiles] = useState<(File | string)[]>([]);
    const [removedPassportURLs, setRemovedPassportURLs] = useState<string[]>([]);

    const [drivingLicenseFiles, setDrivingLicenseFiles] = useState<(File | string)[]>([]);
    const [removedDrivingLicenseURLs, setRemovedDrivingLicenseURLs] = useState<string[]>([]);

    const [votingIdFiles, setVotingIdFiles] = useState<(File | string)[]>([]);
    const [removedVotingIdURLs, setRemovedVotingIdURLs] = useState<string[]>([]);

    const [gstFiles, setGstFiles] = useState<(File | string)[]>([]);
    const [removedGstURLs, setRemovedGstURLs] = useState<string[]>([]);

    const [cancelledChequeFiles, setCancelledChequeFiles] = useState<(File | string)[]>([]);
    const [removedCancelledChequeURLs, setRemovedCancelledChequeURLs] = useState<string[]>([]);

    const [pOAFiles, setPOAFiles] = useState<(File | string)[]>([]);
    const [removedPOAURLs, setRemovedPOAURLs] = useState<string[]>([]);

    const [incomeForm16ITRFiles, setIncomeForm16ITRFiles] = useState<(File | string)[]>([]);
    const [removedIncomeForm16ITRURLs, setRemovedIncomeForm16ITRURLs] = useState<string[]>([]);

    const [nreNroBankDetailsFiles, setNreNroBankDetailsFiles] = useState<(File | string)[]>([]);
    const [removedNreNroBankDetailsURLs, setRemovedNreNroBankDetailsURLs] = useState<string[]>([]);

    const [nomineeFormFiles, setNomineeFormFiles] = useState<(File | string)[]>([]);
    const [removedNomineeFormURLs, setRemovedNomineeFormURLs] = useState<string[]>([]);

    const [statementOfSourceOfFundsFiles, setStatementOfSourceOfFundsFiles] = useState<(File | string)[]>([]);
    const [removedStatementOfSourceOfFundsURLs, setRemovedStatementOfSourceOfFundsURLs] = useState<string[]>([]);

    const [paymentProofFiles, setPaymentProofFiles] = useState<(File | string)[]>([]);
    const [removedPaymentProofURLs, setRemovedPaymentProofURLs] = useState<string[]>([]);

    const [proofOfDocumentFiles, setProofOfDocumentFiles] = useState<(File | string)[]>([]);
    const [removedProofOfDocumentURLs, setRemovedProofOfDocumentURLs] = useState<string[]>([]);

    const [formDataDetails, setFormDataDetails] = useState<BookingApplicantModificationRequest>(() => initialFormStateForDetailsRequest());
    const [editingApplicantData, setEditingApplicantData] = useState<{ row: RequestBookingApplicantWithFiles; index: number } | null>(null);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [errorsBookingApplicant, setErrorsBookingApplicant] = useState<{ [k: string]: string }>({});
    const [isApprovalLogModalOpen, setIsApprovalLogModalOpen] = useState(false);
    const [approvalLogRequest, setApprovalLogRequest] = useState<ModulesApprovalStatusRequest | null>(null);
    const [ownerName, setOwnerName] = useState<string | null>("");
    const [isApprovalActionModalOpen, setIsApprovalActionModalOpen] = useState(false);
    const [approvalActionType, setApprovalActionType] = useState<"approve" | "reject">("approve");
    const [approvalRowData, setApprovalRowData] = useState<BookingApplicantModificationDataRequest | null>(null);
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);

    const { canAction } = useMenuPermissions("/modificationRequest");
    const { addToast } = useToast();
    const { projectId } = useProject();
    const { listState } = usePayTrackBookingListState();
    const { bookingId, bookingData, bookingApprovalStatus } = listState;
    const { pagination, setPagination } = usePagination(20);

    const isBookingCancelled = bookingData?.ApprovalStatus == 'Cancel' || bookingData?.ApprovalStatus == 'Refund';

    const applicantModificationList = useMemo(() => {
        if (!bookingApplicantModificationData?.length) {
            return [];
        }

        const highestVersion = Math.max(
            ...bookingApplicantModificationData.map(item => Number(item.VersionNumber) || 0)
        );

        return bookingApplicantModificationData.filter(
            item => Number(item.VersionNumber) === highestVersion
        );
    }, [bookingApplicantModificationData]);


    useEffect(() => {
        if (!projectId || !bookingId) return;

        fetchBookingApplicantModificationList();


    }, [projectId, bookingId]);


    const fetchBookingApplicantModificationList = async () => {
        await loadBookingApplicantModificationRequest();
        onLoaded?.();
    };

    const loadBookingApplicantModificationRequest = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBookingApplicantModificationRequest = {
                    PageNumber: 1,
                    PageSize: 10,
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                    TabName:"REQUESTS",
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

    const handleEditLocalApplicant = (row: RequestBookingApplicantWithFiles, index: number) => {
        setEditingApplicantData({ row, index });
        setFormDataDetails({
            BookingApplicantModificationRequestId: row.BookingApplicantModificationRequestId ?? 0,
            ApplicantType: row.ApplicantType ?? '',
            ApplicantName: row.ApplicantName ?? '',
            ApplicantMobileNumber: row.ApplicantMobileNumber ?? '',
            ApplicantMobileNumberCountryCode: row.ApplicantMobileNumberCountryCode ?? '+91',
            ApplicantEmailId: row.ApplicantEmailId ?? '',
            AadharCardNumber: row.AadharCardNumber ?? '',
            PanNumber: row.PanNumber ?? '',
            PassportNumber: row.PassportNumber ?? '',
            DrivingLicenseNumber: row.DrivingLicenseNumber ?? '',
            VotingIdNumber: row.VotingIdNumber ?? '',
            GSTNumber: row.GSTNumber ?? '',
            RemovePhotoURL: row.RemovePhotoURL ?? '',
            RemoveAadharCardURL: row.RemoveAadharCardURL ?? '',
            RemovePanCardURL: row.RemovePanCardURL ?? '',
            RemovePassportURL: row.RemovePassportURL ?? '',
            RemoveDrivingLicenseURL: row.RemoveDrivingLicenseURL ?? '',
            RemoveVotingIdURL: row.RemoveVotingIdURL ?? '',
            RemoveGSTNumberURL: row.RemoveGSTNumberURL ?? '',
            RemoveProofOfDocumentURL: row.RemoveProofOfDocumentURL ?? '',
            PhotoURL: [],
            AadharCardURL: [],
            PanCardURL: [],
            PassportURL: [],
            DrivingLicenseURL: [],
            VotingIdURL: [],
            GSTNumberURL: [],
            CancelledChequeURL: [],
            POAURL: [],
            IncomeForm16ITRURL: [],
            NreNroBankDetailsURL: [],
            NomineeFormURL: [],
            StatementOfSourceOfFundsURL: [],
            PaymentProofURL: [],
            ProofOfDocumentURL: [],
        });
        setApplicantPhotoFiles(row._photoFiles ?? []);
        setAadharCardFiles(row._aadharFiles ?? []);
        setPanCardFiles(row._panFiles ?? []);
        setPassportFiles(row._passportFiles ?? []);
        setDrivingLicenseFiles(row._drivingFiles ?? []);
        setVotingIdFiles(row._votingFiles ?? []);
        setGstFiles(row._gstFiles ?? []);
        setCancelledChequeFiles(row._cancelledChequeFiles ?? []);
        setPOAFiles(row._pOAFiles ?? []);
        setIncomeForm16ITRFiles(row._incomeForm16ITRFiles ?? []);
        setNreNroBankDetailsFiles(row._nreNroBankDetailsFiles ?? []);
        setNomineeFormFiles(row._nomineeFormFiles ?? []);
        setStatementOfSourceOfFundsFiles(row._statementOfSourceOfFundsFiles ?? []);
        setPaymentProofFiles(row._paymentProofFiles ?? []);
        setProofOfDocumentFiles(row._proofOfDocumentFiles ?? []);
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
        setRemovedProofOfDocumentURLs([]);
        setErrorsBookingApplicant({});
        setIsAddUpdateApplicantDetailsModalOpen(true);
    };

    const handleFieldChangeBookingApplicantDetails = (field: keyof BookingApplicantModificationRequest, value: any) => {

        setFormDataDetails((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateAddApplicantForm = (): {
        isValid: boolean;
        errorsBookingApplicant: { [key: string]: string };
    } => {
        const newErrorsBookingApplicant: { [key: string]: string } = {};

        const mergedProofOfDocumentFiles = editingApplicantData ? calculateMergedFiles(editingApplicantData.row._proofOfDocumentFiles, proofOfDocumentFiles, removedProofOfDocumentURLs) : proofOfDocumentFiles.slice();

        if (mergedProofOfDocumentFiles.length === 0) {
            newErrorsBookingApplicant.ProofOfDocumentURL = "Proof of Document is required";
        }


        if (!formDataDetails.ApplicantType?.trim()) {
            newErrorsBookingApplicant.ApplicantType = "Applicant Type is required";
        }

        if (!formDataDetails.ApplicantName?.trim()) {
            newErrorsBookingApplicant.ApplicantName = "Applicant Name is required";
        }
        if (!formDataDetails.ApplicantMobileNumber?.trim()) {
            newErrorsBookingApplicant.ApplicantMobileNumber = "Mobile Number is required";
        } else if (!isValidMobile(formDataDetails.ApplicantMobileNumber.trim(), formDataDetails.ApplicantMobileNumberCountryCode!.trim())) {
            newErrorsBookingApplicant.ApplicantMobileNumber = "Enter a valid Mobile Number";
        }


        if (!formDataDetails.ApplicantEmailId?.trim()) {
            newErrorsBookingApplicant.ApplicantEmailId = "E-mail Id is required";
        }
        else if (!isValidEmail(formDataDetails.ApplicantEmailId.trim())) {
            newErrorsBookingApplicant.ApplicantEmailId = "Enter a Valid E-mail Id";
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
        const finalRemovedProofOfDocumentURLs = editingApplicantData ? calculateRemovedFiles(editingApplicantData.row._proofOfDocumentFiles, proofOfDocumentFiles, removedProofOfDocumentURLs) : removedProofOfDocumentURLs.slice();

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
        const mergedProofOfDocumentFiles = editingApplicantData ? mergeFiles(editingApplicantData.row._proofOfDocumentFiles, proofOfDocumentFiles, finalRemovedProofOfDocumentURLs) : proofOfDocumentFiles.slice();

        const applicantToSave: RequestBookingApplicantWithFiles = {

            BookingApplicantModificationRequestId: editingApplicantData?.row.BookingApplicantModificationRequestId ?? 0,

            ApplicantType: formDataDetails.ApplicantType || "",
            ApplicantName: formDataDetails.ApplicantName || "",
            ApplicantMobileNumber: formDataDetails.ApplicantMobileNumber || "",
            ApplicantMobileNumberCountryCode: formDataDetails.ApplicantMobileNumberCountryCode!.trim() || "",
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
            ProofOfDocumentURL: createFileUrlString(mergedProofOfDocumentFiles),
            IsApproval: false,
            ApprovalStatus: "",
            VersionNumber: "1",
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
            _cancelledChequeFiles: mergedCancelledChequeFiles,
            _pOAFiles: mergedPOAFiles,
            _incomeForm16ITRFiles: mergedIncomeForm16ITRFiles,
            _nreNroBankDetailsFiles: mergedNreNroBankDetailsFiles,
            _nomineeFormFiles: mergedNomineeFormFiles,
            _statementOfSourceOfFundsFiles: mergedStatementOfSourceOfFundsFiles,
            _paymentProofFiles: mergedPaymentProofFiles,
            _proofOfDocumentFiles: mergedProofOfDocumentFiles,

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
            RemoveProofOfDocumentURL: finalRemovedProofOfDocumentURLs.join(','),
        };

        setApplicantList((prev) => {
            if (editingApplicantData) {
                const updated = [...prev];
                updated[editingApplicantData.index] = applicantToSave;
                return updated;
            }
            return [...prev, applicantToSave];
        });

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
        setProofOfDocumentFiles([]);
    };

    

    const handleSaveApplicantRequests = async () => {
        if (applicantList.length === 0) return;

        const applicantCount = applicantList.filter(item => item.ApplicantType === "Applicant").length;

        if (applicantCount === 0) {
            addToast({ type: "error", title: "At least one Applicant is required." });
            return;
        }
        if (applicantCount > 1) {

            addToast({ type: "error", title: "Only one Applicant is allowed." });
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const formDataToSend = new FormData();
                formDataToSend.append('ProjectId', String(projectId));
                formDataToSend.append('BookingId', String(bookingId));

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

                applicantList.forEach((app, index) => {
                    const prefix = `bookingApplicantModificationRequests[${index}]`;

                    formDataToSend.append(`${prefix}.BookingApplicantModificationRequestId`, String(app.BookingApplicantModificationRequestId ?? 0));
                    formDataToSend.append(`${prefix}.ApplicantType`, app.ApplicantType ?? "");
                    formDataToSend.append(`${prefix}.ApplicantName`, app.ApplicantName ?? "");
                    formDataToSend.append(`${prefix}.ApplicantMobileNumber`, app.ApplicantMobileNumber ?? "");
                    formDataToSend.append(`${prefix}.ApplicantMobileNumberCountryCode`, app.ApplicantMobileNumberCountryCode ?? "");
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
                    formDataToSend.append(`${prefix}.RemoveProofOfDocumentURL`, app.RemoveProofOfDocumentURL ?? "");

                    formDataToSend.append(`${prefix}.CancelledChequeURL`, app.CancelledChequeURL ?? "");
                    formDataToSend.append(`${prefix}.POAURL`, app.POAURL ?? "");
                    formDataToSend.append(`${prefix}.IncomeForm16ITRURL`, app.IncomeForm16ITRURL ?? "");
                    formDataToSend.append(`${prefix}.NreNroBankDetailsURL`, app.NreNroBankDetailsURL ?? "");
                    formDataToSend.append(`${prefix}.NomineeFormURL`, app.NomineeFormURL ?? "");
                    formDataToSend.append(`${prefix}.StatementOfSourceOfFundsURL`, app.StatementOfSourceOfFundsURL ?? "");
                    formDataToSend.append(`${prefix}.PaymentProofURL`, app.PaymentProofURL ?? "");
                    formDataToSend.append(`${prefix}.ProofOfDocumentURL`, app.ProofOfDocumentURL ?? "");

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
                    addFilesWithExisting(formDataToSend, prefix, realApp._proofOfDocumentFiles, "ProofOfDocumentURL");
                });

                const response = await bookingApplicantModificationService.apiCallAddUpdateBookingApplicantModification(formDataToSend);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage?.[0] });
                    setApplicantList([]);
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
            "Saving Applicant Requests"
        );
    };

    const handleConfirmationDialogBoxOpen = useCallback((row: BookingApplicantModificationDataRequest) => {
        setBookingApplicantModificationData([row])
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const summaryColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: "ProofOfDocumentURL",
                label: "Proof of Document",
                width: "15",
                align: "center",
                render: (_value: string, row: any) => {
                    return (
                        <MultiImageViewer
                            images={parseDocumentUrls(row.ProofOfDocumentURL)}
                            title="Proof of Document"
                            triggerLabel="-"
                            isIcon={false}
                            isWrap={false}
                        />
                    );
                },
            },
            {
                key: "ApplicantName",
                label: "Applicant Name",
                width: "15",
                sortable: false,
                align: "left",
                fixed: "left",
                render: (value: string, row: any) => {
                    return (
                        <div className="flex flex-col gap-1">
                            <MultiImageViewer images={parseDocumentUrls(row.PhotoURL)} title="Applicant Document" triggerLabel={value || "-"} isWrap={false} />
                        </div>
                    );
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
                render: (value, row) => value ? `${row.ApplicantMobileNumberCountryCode || "+91"} ${value}` : '-'
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
                render: (value, row) => {
                    if (row.ApplicantType !== "Applicant") {
                        return "-";
                    }
                    return (
                        <ApprovalActions
                            approvalStatus={value || "-"}
                            showApproval={row.IsApproval}
                            isIcons={true}
                            onHistory={() => handleApprovalLog(row)}
                            onApprove={() => handleApproveRejectDocument(row, "approve")}
                            onReject={() => handleApproveRejectDocument(row, "reject")}
                        />
                    );
                }
            },
            {
                key: 'Actions',
                label: 'Actions',
                width: '15',
                align: 'center',
                render: (_value, row) => {

                    const isDisabled = row.ApprovalStatus !== "Pending";

                    return (
                        <div>
                            <Button
                                color="transparent"
                                size="sm"
                                style={{
                                    color: (!isDisabled) ? 'red' : '#9CA3AF',
                                    cursor: (!isDisabled) ? 'pointer' : 'not-allowed',
                                    opacity: (!isDisabled) ? 1 : 0.5
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmationDialogBoxOpen(row);
                                }}
                                leftIcon={<Trash2 className="h-4 w-4" />}
                                disabled={isDisabled}
                            />

                        </div>

                    )
                }
            }
        ],
        [bookingApplicantModificationData, canAction, handleConfirmationDialogBoxOpen]
    )

    const pendingColumns = useMemo<TableColumn[]>(
        () => [
            ...summaryColumns.filter(
                (col) => col.key !== "ApprovalStatus" && col.key !== "VersionNumber" && col.key!=="Actions"
            ),
            {
                key: "actions",
                label: "Actions",
                width: "10",
                sortable: false,
                align: "center" as const,
                render: (_v: any, row: RequestBookingApplicantWithFiles, index: number) => (
                    <div className="flex justify-center gap-1">
                        <Button
                            onClick={() => handleEditLocalApplicant(row, index)}
                            variant="outline"
                            color="transparent"
                            size="sm"
                            title="Edit"
                        >
                            <Edit className="h-4 w-4 text-blue-700" />
                        </Button>
                        <Button
                            onClick={() => setApplicantList((prev) => prev.filter((_, i) => i !== index))}
                            variant="outline"
                            color="transparent"
                            size="sm"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ),
            },

        ],
        [summaryColumns, handleEditLocalApplicant]
    );

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setBookingApplicantModificationData([]);
    }, [setIsConfirmationDialogBoxOpen, setBookingApplicantModificationData]);



    const handleDeleteBookingApplicantRequest = async () => {
        setIsConfirmationDialogBoxOpen(false);
        if (!bookingApplicantModificationData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteBookingApplicantModificationModelRequest = {
                    BookingId: bookingId ?? 0,
                    ProjectId: projectId ?? 0,
                    BookingApplicantModificationRequestId: bookingApplicantModificationData[0].BookingApplicantModificationRequestId,

                }
                const response = await bookingApplicantModificationService.apiCallDeleteBookingApplicantModificationRequest(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (applicantModificationList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await fetchBookingApplicantModificationList();

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });
                    
                    setIsConfirmationDialogBoxOpen(false);
                    setBookingApplicantModificationData([]);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Delete Applicant Requests'
        )
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



    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="pt-5">
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden  justify-between">
                    <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE] flex items-center justify-between overflow-hidden">
                        <h4 className="text-sm font-semibold text-[#C2410C]">
                            Applicant Details
                        </h4>

                        {canAction && bookingApprovalStatus?.toUpperCase() === 'APPROVED' && (

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => { setIsAddUpdateApplicantDetailsModalOpen(true); }}
                                    color="blue"
                                    size="sm"
                                    variant="solid"
                                    leftIcon={<Plus className="h-4 w-4" />}
                                    disabled={isBookingCancelled}
                                >
                                    Add
                                </Button>

                                {applicantList.length > 0 && (
                                    <Button
                                        onClick={handleSaveApplicantRequests}
                                        size="sm"

                                        color="transparent"
                                        variant="transparent_border_background"

                                        loading={isLoading}
                                        style={{ width: '140px' }}
                                        disabled={isBookingCancelled}
                                    >
                                        Save
                                    </Button>
                                )}
                            </div>

                        )}
                    </div>

                    {applicantList.length > 0 && (
                        <div className="p-6">
                            <DataTableWithHeaderRowDivider
                                columns={pendingColumns}
                                data={applicantList}
                                fixedHeight={false}
                            />
                        </div>
                    )}

                    {applicantModificationList.length > 0 ? (
                        <div className="p-5">
                            <DataTableWithHeaderRowDivider
                                columns={summaryColumns}
                                data={applicantModificationList}
                                fixedHeight={false}
                            />
                        </div>
                    ) : (
                        applicantList.length === 0 && (
                            <section className="md:col-span-4 bg-white rounded-xl p-6">
                                <NoDataView message="No Applicant Found" />
                            </section>
                        )
                    )}

                </section>
            </div>
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
                    setProofOfDocumentFiles([]);
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
                    setRemovedProofOfDocumentURLs([]);
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
                    setProofOfDocumentFiles([]);
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
                    setRemovedProofOfDocumentURLs([]);
                }}

                title={editingApplicantData ? "Edit Applicant" : "Add Applicant"}
                saveText={editingApplicantData ? "Update" : "Add"}
                cancelText="Cancel"
                onSubmit={handleAddUpdateBookingApplicant}
                loading={isLoading}
                size='half-screen'
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                            <div>
                                <MultiFilePicker
                                    label="Proof of Document"
                                    placeholder="Select Proof of Document"
                                    required
                                    error={errorsBookingApplicant.ProofOfDocumentURL}
                                    value={proofOfDocumentFiles}
                                    onChange={setProofOfDocumentFiles}
                                    allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
                                    maxFiles={3} maxSizeMB={10}
                                    onRemoveExisting={(url) => setRemovedProofOfDocumentURLs((prev) => [...prev, url])} />
                            </div>
                        </div>
                        <div>
                            <SinglePageSelection
                                label="Applicant Type"
                                placeholder="Select Applicant Type"
                                required value={formDataDetails?.ApplicantType ?? ""}
                                onChange={(e) => handleFieldChangeBookingApplicantDetails("ApplicantType", String(e))}
                                options={APPLICANT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                                error={errorsBookingApplicant.ApplicantType} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input label="Applicant Name" placeholder="Enter Applicant Name" type="text" value={formDataDetails.ApplicantName ?? ''} onChange={(e) => handleFieldChangeBookingApplicantDetails('ApplicantName', e.target.value)} error={errorsBookingApplicant.ApplicantName} required
                            />
                        </div>
                        <div>
                            <MobileNumberInput
                                mobileNumber={formDataDetails.ApplicantMobileNumber ?? ""}
                                countryCode={formDataDetails.ApplicantMobileNumberCountryCode ?? "+91"}
                                required
                                error={errorsBookingApplicant.ApplicantMobileNumber}
                                onMobileChange={(value) =>
                                    handleFieldChangeBookingApplicantDetails("ApplicantMobileNumber", value)
                                }
                                onCountryCodeChange={(value) =>
                                    handleFieldChangeBookingApplicantDetails("ApplicantMobileNumberCountryCode", value)
                                }
                            />
                        </div>
                        <div>
                            <Input label="Email Id" required error={errorsBookingApplicant.ApplicantEmailId} type="text" value={formDataDetails.ApplicantEmailId ?? ""} onChange={(e) => handleFieldChangeBookingApplicantDetails("ApplicantEmailId", filterEmail(e.target.value))} placeholder="Enter Email Id" />
                        </div>
                        <div>
                            <MultiFilePicker label="Profile Photo" placeholder="Select Photo" required error={errorsBookingApplicant.PhotoURL} value={applicantPhotoFiles} onChange={setApplicantPhotoFiles} allowedTypes={["image/jpeg", "image/png"]} maxFiles={1} maxSizeMB={5} onRemoveExisting={(url) => setRemovedApplicantPhotoURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="Aadhaar Number" error={errorsBookingApplicant.AadharCardNumber} required type="text" value={formDataDetails.AadharCardNumber ?? ""} maxLength={12} onChange={(e) => handleFieldChangeBookingApplicantDetails("AadharCardNumber", filterAadhaar(e.target.value))} placeholder="Enter Aadhaar Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="Aadhaar Card" required placeholder="Select Aadhaar Card" error={errorsBookingApplicant.AadharCardURL} value={aadharCardFiles} onChange={setAadharCardFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={2} maxSizeMB={10} onRemoveExisting={(url) => setRemovedAadharCardURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="PAN Number" required error={errorsBookingApplicant.PanNumber} type="text" value={formDataDetails.PanNumber ?? ""} maxLength={10} onChange={(e) => handleFieldChangeBookingApplicantDetails("PanNumber", filterPAN(e.target.value).toUpperCase())} placeholder="Enter PAN Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="PAN Card" required placeholder="Select PAN Card" error={errorsBookingApplicant.PanCardURL} value={panCardFiles} onChange={setPanCardFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]} maxFiles={2} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPanCardURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="Passport Number" error={errorsBookingApplicant.PassportNumber} type="text" value={formDataDetails.PassportNumber ?? ""} maxLength={8} onChange={(e) => handleFieldChangeBookingApplicantDetails("PassportNumber", filterPassportNumber(e.target.value.toUpperCase()))} placeholder="Enter Passport Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="Passport" placeholder="Select Passport" error={errorsBookingApplicant.PassportURL} value={passportFiles} onChange={setPassportFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPassportURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <Input label="Driving License Number" error={errorsBookingApplicant.DrivingLicenseNumber} type="text" value={formDataDetails.DrivingLicenseNumber ?? ""} maxLength={15} onChange={(e) => handleFieldChangeBookingApplicantDetails("DrivingLicenseNumber", filterDrivingLicenseNumber(e.target.value.toUpperCase()))} placeholder="Enter Driving License Number" rightIcon={<IdCardIcon />} />
                        </div>
                        <div>
                            <MultiFilePicker label="Driving License" placeholder="Select Driving License" error={errorsBookingApplicant.DrivingLicenseURL} value={drivingLicenseFiles} onChange={setDrivingLicenseFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedDrivingLicenseURLs((prev) => [...prev, url])} />
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
                            <MultiFilePicker label="GST Documents" placeholder="Select GST Documents" error={errorsBookingApplicant.GSTNumberURL} value={gstFiles} onChange={setGstFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedGstURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Cancelled Cheque" placeholder="Select Cancelled Cheque" error={errorsBookingApplicant.CancelledChequeURL} value={cancelledChequeFiles} onChange={setCancelledChequeFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedCancelledChequeURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="POA (if NRI Execution)" placeholder="Select POA Document" error={errorsBookingApplicant.POAURL} value={pOAFiles} onChange={setPOAFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPOAURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Income Docs (Form 16 / ITR)" placeholder="Select Income Document" error={errorsBookingApplicant.IncomeForm16ITRURL} value={incomeForm16ITRFiles} onChange={setIncomeForm16ITRFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedIncomeForm16ITRURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="NRE / NRO Bank Details" placeholder="Select NRE / NRO Bank Document" error={errorsBookingApplicant.NreNroBankDetailsURL} value={nreNroBankDetailsFiles} onChange={setNreNroBankDetailsFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedNreNroBankDetailsURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Nominee Form" placeholder="Select Nominee Form" error={errorsBookingApplicant.NomineeFormURL} value={nomineeFormFiles} onChange={setNomineeFormFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedNomineeFormURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Statement of Source of Funds" placeholder="Select Source Document" error={errorsBookingApplicant.StatementOfSourceOfFundsURL} value={statementOfSourceOfFundsFiles} onChange={setStatementOfSourceOfFundsFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedStatementOfSourceOfFundsURLs((prev) => [...prev, url])} />
                        </div>
                        <div>
                            <MultiFilePicker label="Payment Proof" placeholder="Select Payment Proof" error={errorsBookingApplicant.PaymentProofURL} value={paymentProofFiles} onChange={setPaymentProofFiles} allowedTypes={["image/jpeg", "image/png", "application/pdf"]} maxFiles={3} maxSizeMB={10} onRemoveExisting={(url) => setRemovedPaymentProofURLs((prev) => [...prev, url])} />
                        </div>
                    </div>
                </div>
            </Modal>

           <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteBookingApplicantRequest}
                loading={isLoading}
                pageName='Booking Applicant'
            />
            <ApprovalLogModal
                isOpen={isApprovalLogModalOpen}
                title='Applicant Details '
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
        </div >
    )
}

export default ApplicantRequests
