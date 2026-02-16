// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Input } from '@/ui/components/forms/Input';
// import * as E from 'fp-ts/Either';
// import { runApiWithLoader } from '@/core/utils';
// import { useToast } from '@/core/hooks/useToast';
// import { Loader } from '@/core/utils/loader';
// import type { AddUpdateBookingRequest, FilterWithPaginationBookingRequest, AddUpdateBookingApplicantRequest, BookingApplicantData } from '../models/BookingModel';
// import { DatePickerInput } from '@/ui/components/forms/Datepicker';
// import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from '@/core/utils/dateFormat';
// import { TextArea } from '@/ui/components/forms/Textarea';
// import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
// import BottomActionBar from '@/ui/components/forms/BottomActionBar';
// import { bookingService } from '../services/BookingService';
// import { calculateMergedFiles, calculateRemovedFiles, createFileUrlString, filterAadhaar, filterDrivingLicenseNumber, filterEmail, filterGST, filterLetters, filterMobile, filterNumbersWithDecimal, filterPAN, filterPassportNumber, filterVoterId, isValidAadhaar, isValidDrivingLicenseNumber, isValidEmail, isValidGST, isValidMobile, isValidPAN, isValidPassportNumber, isValidVoterId, mergeFiles } from '@/core/utils/fileValidation';
// import { useProject } from '@/features/projectMaster/context/ProjectContext';
// import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
// import { useBookingListState } from '@/features/booking/context/BookingListStateContext';
// import { Button } from '@/ui/components/forms';
// import { Edit, IdCardIcon, Trash2 } from 'lucide-react';
// import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
// import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
// import { parseDocumentUrls } from '@/core/utils/documentUtils';
// import { Modal } from '@/ui/components/Modal/Modal';
// import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
// import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
// import { APPLICANT_TYPE, SOURCE_TYPE_OPTIONS, PAYMENT_MODE, UNIT_SQFT_LUMPSUM } from '@/core/constants';
// import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
// import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
// import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
// import { inventoryService } from '@/features/inventory/services/InventoryServices';
// import type { InventoryData, InventoryFlatData } from '@/features/inventory/models/InventoryMasterModel';
// import { fetchBankListMasterDropdown } from '@/features/bankListMaster/bankListMasterDropDown';
// import { Plus } from 'lucide-react';
// import RadioPill from '@/ui/components/forms/RadioPill';
// import type { BookingPaymentScheduleData, PaymentScheduleStagesData, BookingOtherChargesData } from '../models/BookingModel';

// const initialFormState = (): AddUpdateBookingRequest => ({
//     BookingId: 0,
//     Uniquekey: null,
//     ProjectId: 0,
//     PermanentAddress: '',
//     CommunicationAddress: '',
//     Source: '',
//     SubSource: '',
//     BrokeragePercentage: 0,
//     BrokerageAmount: 0,
//     InventoryFlatId: 0,
//     AgreementValue: 0,
//     AgreementValueTDS: 0,
//     AgreementValueGSTPercentage: 0,
//     AgreementValueGSTAmount: 0,
//     StampDutyPercentage: 0,
//     StampDutyAmount: 0,
//     RegistrationFees: 0,
//     ParkingId: '',
//     HandoverType: '',
//     RegistrationDate: null,
//     ModeOfPayment: '',
//     FlatAlterationRemark: '',
//     TermsAndConditionsDescription: '',
//     BookingType: '',
//     OtherChargesDetailJSON: null,
//     PaymentScheduleDetailJSON: null,
//     BookingAmount: 0,
//     ChequeRTGSNumber: '',
//     ChequeRTGSDate: null,
//     BankListMasterId: 0,
//     TransferBookingId: 0,
//     TenantId: 0,
// });

// const initialFormStateApplicantDetails = (): AddUpdateBookingApplicantRequest => ({
//     BookingApplicantId: 0,
//     ApplicantType: '',
//     ApplicantName: '',
//     ApplicantMobileNumber: '',
//     ApplicantEmailId: '',
//     PhotoURL: null,
//     RemovePhotoURL: '',
//     AadharCardNumber: '',
//     AadharCardURL: null,
//     RemoveAadharCardURL: '',
//     PanNumber: '',
//     PanCardURL: null,
//     RemovePanCardURL: '',
//     PassportNumber: '',
//     PassportURL: null,
//     RemovePassportURL: '',
//     DrivingLicenseNumber: '',
//     DrivingLicenseURL: null,
//     RemoveDrivingLicenseURL: '',
//     VotingIdNumber: '',
//     VotingIdURL: null,
//     RemoveVotingIdURL: '',
//     GSTNumber: '',
//     GSTNumberURL: null,
//     RemoveGSTNumberURL: '',
// });

// type BookingApplicantWithFiles = BookingApplicantData & {
//     _photoFiles?: (File | string)[];
//     _aadharFiles?: (File | string)[];
//     _panFiles?: (File | string)[];
//     _passportFiles?: (File | string)[];
//     _drivingFiles?: (File | string)[];
//     _votingFiles?: (File | string)[];
//     _gstFiles?: (File | string)[];
//     RemovePhotoURL?: string;
//     RemoveAadharCardURL?: string;
//     RemovePanCardURL?: string;
//     RemovePassportURL?: string;
//     RemoveDrivingLicenseURL?: string;
//     RemoveVotingIdURL?: string;
//     RemoveGSTNumberURL?: string;
// };

// export const AddUpdateBooking: React.FC = () => {

//     //#region STATE MANAGEMENT
//     const [formData, setFormData] = useState<AddUpdateBookingRequest>(() => initialFormState());
//     const [applicantList, setApplicantList] = useState<BookingApplicantWithFiles[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [loadingMessage, setLoadingMessage] = useState('');
//     const navigate = useNavigate();
//     const { projectId } = useProject();

//     //#region BOOKING LIST STATE CONTEXT
//     const { listState } = useBookingListState();
//     const { bookingId, bookingName } = listState;
//     //#endregion

//     const isAddMode = bookingId === 0;
//     const { addToast } = useToast();
//     const { canAction } = useMenuPermissions('/booking');
//     const [errors, setErrors] = useState<{ [k: string]: string }>({});
//     //#endregion

//     //#region BOOKING APPLICANT
//     const [formDataForApplicant, setFormDataForApplicant] = useState<AddUpdateBookingApplicantRequest>(() => initialFormStateApplicantDetails());
//     const [editingApplicantData, setEditingApplicantData] = useState<{ row: BookingApplicantWithFiles; index: number } | null>(null);
//     const [isAddUpdateApplicantModalOpen, setIsAddUpdateApplicantModalOpen] = useState(false);

//     // ================= PHOTO =================
//     const [applicantPhotoFiles, setApplicantPhotoFiles] = useState<(File | string)[]>([]);
//     const [removedApplicantPhotoURLs, setRemovedApplicantPhotoURLs] = useState<string[]>([]);

//     // ================= AADHAR =================
//     const [aadharCardFiles, setAadharCardFiles] = useState<(File | string)[]>([]);
//     const [removedAadharCardURLs, setRemovedAadharCardURLs] = useState<string[]>([]);

//     // ================= PAN =================
//     const [panCardFiles, setPanCardFiles] = useState<(File | string)[]>([]);
//     const [removedPanCardURLs, setRemovedPanCardURLs] = useState<string[]>([]);

//     // ================= PASSPORT =================
//     const [passportFiles, setPassportFiles] = useState<(File | string)[]>([]);
//     const [removedPassportURLs, setRemovedPassportURLs] = useState<string[]>([]);

//     // ================= DRIVING LICENSE =================
//     const [drivingLicenseFiles, setDrivingLicenseFiles] = useState<(File | string)[]>([]);
//     const [removedDrivingLicenseURLs, setRemovedDrivingLicenseURLs] = useState<string[]>([]);

//     // ================= VOTING ID =================
//     const [votingIdFiles, setVotingIdFiles] = useState<(File | string)[]>([]);
//     const [removedVotingIdURLs, setRemovedVotingIdURLs] = useState<string[]>([]);

//     // ================= GST =================
//     const [gstFiles, setGstFiles] = useState<(File | string)[]>([]);
//     const [removedGstURLs, setRemovedGstURLs] = useState<string[]>([]);

//     //ERROR SET UP
//     const [errorsBookingApplicant, setErrorsBookingApplicant] = useState<{ [k: string]: string }>({});

//     //DELETE BOOKING APPLICANT STATES
//     const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
//     const [deleteBookingApplicantData, setDeleteBookingApplicantData] = useState<{ row: BookingApplicantWithFiles; index: number } | null>(null);
//     //#endregion

//     //#region INVENTORY SELECTION STATE
//     const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
//     const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
//     const [selectedWing, setSelectedWing] = useState<string>('');
//     const [selectedFloor, setSelectedFloor] = useState<string>('');
//     const [selectedFlatId, setSelectedFlatId] = useState<number | null>(null);
//     const [selectedFlatData, setSelectedFlatData] = useState<InventoryFlatData | null>(null);
    
//     const [dropdownLabels, setDropdownLabels] = useState<{
//         buildingName?: string;
//         bankName?: string;
//         sourcingManager?: string;
//         closingManager?: string;
//     }>({});

//     //#region PAYMENT SCHEDULE STATE
//     const [paymentSchedules, setPaymentSchedules] = useState<BookingPaymentScheduleData[]>([]);
//     const [isPaymentScheduleModalOpen, setIsPaymentScheduleModalOpen] = useState(false);
//     const [paymentScheduleType, setPaymentScheduleType] = useState<'Date' | 'Stage'>('Date');
//     const [paymentScheduleDate, setPaymentScheduleDate] = useState<string>('');
//     const [paymentScheduleStage, setPaymentScheduleStage] = useState<string>('');
//     const [paymentSchedulePercentage, setPaymentSchedulePercentage] = useState<string>('');
//     const [paymentScheduleStages, setPaymentScheduleStages] = useState<PaymentScheduleStagesData[]>([]);
//     const [editingPaymentScheduleIndex, setEditingPaymentScheduleIndex] = useState<number | null>(null);
//     //#endregion

//     //#region OTHER CHARGES STATE
//     const [otherCharges, setOtherCharges] = useState<BookingOtherChargesData[]>([]);
//     const [isOtherChargesModalOpen, setIsOtherChargesModalOpen] = useState(false);
//     const [otherChargeName, setOtherChargeName] = useState<string>('');
//     const [otherChargeCalculatedOn, setOtherChargeCalculatedOn] = useState<string>('');
//     const [otherChargeValue, setOtherChargeValue] = useState<string>('');
//     const [otherChargeGSTPercentage, setOtherChargeGSTPercentage] = useState<string>('');
//     const [editingOtherChargeIndex, setEditingOtherChargeIndex] = useState<number | null>(null);
//     //#endregion

//     //#region PAYMENT SCHEDULE CALCULATIONS
//     const totalPercentage = useMemo(() => {
//         return paymentSchedules.reduce((sum, schedule) => {
//             return sum + (schedule.PaymentSchedulePercentage || 0);
//         }, 0);
//     }, [paymentSchedules]);

//     const cumulativePercentages = useMemo(() => {
//         let cumulative = 0;
//         return paymentSchedules.map((schedule) => {
//             cumulative += schedule.PaymentSchedulePercentage || 0;
//             return cumulative;
//         });
//     }, [paymentSchedules]);

//     //#endregion

//     //#region FETCH INVENTORY DATA
//     useEffect(() => {
//         if (!projectId) return;
//         (async () => {
//             try {
//                 const response = await inventoryService.apiCallpullInventory({
//                     ProjectId: Number(projectId)
//                 });
//                 if (E.isRight(response)) {
//                     setInventoryData(response.right.Data || []);
//                 }
//             } catch (error) {
//                 console.error('Error fetching inventory:', error);
//             }
//         })();
//     }, [projectId]);

//     // Set inventory selection when both inventory data and flat ID are available
//     useEffect(() => {
//         if (!formData.InventoryFlatId || !inventoryData.length) return;

//         // Find the flat in inventory
//         for (const building of inventoryData) {
//             for (const wing of building.InventoryFlatFloorBasementPodiumWingData || []) {
//                 for (const floor of wing.InventoryFloorData || []) {
//                     const flat = floor.InventoryFlatData?.find(f => f.InventoryFlatId === formData.InventoryFlatId);
//                     if (flat) {
//                         setSelectedBuildingId(building.InventoryBuildingId);
//                         setSelectedWing(wing.Wing || '');
//                         setSelectedFloor(floor.Floor || '');
//                         setSelectedFlatId(formData.InventoryFlatId);
//                         setSelectedFlatData(flat);

//                         // Fetch payment schedule stages for this wing
//                         if (wing.InventoryFlatFloorBasementPodiumWingId && projectId) {
//                             (async () => {
//                                 const response = await bookingService.apiCallPullPaymentScheduleStages({
//                                     ProjectId: Number(projectId),
//                                     InventoryFlatFloorBasementPodiumWingId: wing.InventoryFlatFloorBasementPodiumWingId
//                                 });
//                                 if (E.isRight(response)) {
//                                     setPaymentScheduleStages(response.right.Data || []);
//                                 }
//                             })();
//                         }
//                         return;
//                     }
//                 }
//             }
//         }
//     }, [inventoryData, formData.InventoryFlatId, projectId]);

//     // Fetch payment schedule stages when wing is selected
//     useEffect(() => {
//         if (!selectedWing || !inventoryData.length || !projectId) return;

//         const building = inventoryData.find(b => b.InventoryBuildingId === selectedBuildingId);
//         const wing = building?.InventoryFlatFloorBasementPodiumWingData?.find(w => w.Wing === selectedWing);

//         if (wing?.InventoryFlatFloorBasementPodiumWingId) {
//             (async () => {
//                 const response = await bookingService.apiCallPullPaymentScheduleStages({
//                     ProjectId: Number(projectId),
//                     InventoryFlatFloorBasementPodiumWingId: wing.InventoryFlatFloorBasementPodiumWingId
//                 });
//                 if (E.isRight(response)) {
//                     setPaymentScheduleStages(response.right.Data || []);
//                 }
//             })();
//         }
//     }, [selectedWing, selectedBuildingId, inventoryData, projectId]);
//     //#endregion

//     //#region INITIALIZATION
//     useEffect(() => {
//         if (!projectId) return;
//         if (!isAddMode && bookingId) {
//             fetchBookingDetails();
//         } else {
//             setFormData(prev => ({ ...prev, ProjectId: Number(projectId) }));
//         }
//     }, [bookingId, projectId, isAddMode]);
//     //#endregion

//     //#region FETCH BOOKING DETAILS
//     const fetchBookingDetails = async () => {
//         await runApiWithLoader(
//             setIsLoading,
//             setLoadingMessage,
//             async () => {
//                 const params: FilterWithPaginationBookingRequest = {
//                     PageNumber: 1,
//                     PageSize: 1,
//                     BookingId: bookingId,
//                     ProjectId: Number(projectId),
//                 };

//                 const response = await bookingService.apiCallPullBooking(params);

//                 if (E.isRight(response)) {
//                     const booking = response.right.Data?.[0];
//                     if (booking) {
//                         setFormData({
//                             BookingId: booking.BookingId ?? 0,
//                             Uniquekey: booking.Uniquekey,
//                             ProjectId: booking.ProjectId ?? Number(projectId),
//                             PermanentAddress: booking.PermanentAddress ?? '',
//                             CommunicationAddress: booking.CommunicationAddress ?? '',
//                             Source: booking.Source ?? '',
//                             SubSource: booking.SubSource ?? '',
//                             BrokeragePercentage: booking.BrokeragePercentage ?? 0,
//                             BrokerageAmount: booking.BrokerageAmount ?? 0,
//                             InventoryFlatId: booking.InventoryFlatId ?? 0,
//                             AgreementValue: booking.AgreementValue ?? 0,
//                             AgreementValueTDS: booking.AgreementValueTDS ?? 0,
//                             AgreementValueGSTPercentage: booking.AgreementValueGSTPercentage ?? 0,
//                             AgreementValueGSTAmount: booking.AgreementValueGSTAmount ?? 0,
//                             StampDutyPercentage: booking.StampDutyPercentage ?? 0,
//                             StampDutyAmount: booking.StampDutyAmount ?? 0,
//                             RegistrationFees: booking.RegistrationFees ?? 0,
//                             ParkingId: booking.ParkingId ?? '',
//                             HandoverType: booking.HandoverType ?? '',
//                             RegistrationDate: booking.RegistrationDate,
//                             ModeOfPayment: booking.ModeOfPayment ?? '',
//                             FlatAlterationRemark: booking.FlatAlterationRemark ?? '',
//                             TermsAndConditionsDescription: booking.TermsAndConditionsDescription ?? '',
//                             BookingType: booking.BookingType ?? '',
//                             OtherChargesDetailJSON: booking.BookingOtherChargesData ? JSON.stringify(booking.BookingOtherChargesData) : null,
//                             PaymentScheduleDetailJSON: booking.BookingPaymentScheduleData ? JSON.stringify(booking.BookingPaymentScheduleData) : null,
//                             BookingAmount: booking.BookingAmount ?? 0,
//                             ChequeRTGSNumber: booking.ChequeRTGSNumber ?? '',
//                             ChequeRTGSDate: booking.ChequeRTGSDate,
//                             BankListMasterId: booking.BankListMasterId ?? 0,
//                             TransferBookingId: booking.TransferBookingId ?? 0,
//                             TenantId: booking.TenantId ?? 0,
//                         });

//                         // Set inventory selection from booking data (will be set after inventory loads)
//                         if (booking.InventoryFlatId) {
//                             setSelectedFlatId(booking.InventoryFlatId);
//                             handleFieldChange('InventoryFlatId', booking.InventoryFlatId);
//                         }

//                         setDropdownLabels({
//                             bankName: booking.BankName || '',
//                         });

//                         const applicantsWithFiles = (booking?.BookingApplicantData || []).map(a => ({
//                             ...a,
//                             _photoFiles: parseDocumentUrls(a.PhotoURL ?? ''),
//                             _aadharFiles: parseDocumentUrls(a.AadharCardURL ?? ''),
//                             _panFiles: parseDocumentUrls(a.PanCardURL ?? ''),
//                             _passportFiles: parseDocumentUrls(a.PassportURL ?? ''),
//                             _drivingFiles: parseDocumentUrls(a.DrivingLicenseURL ?? ''),
//                             _votingFiles: parseDocumentUrls(a.VotingIdURL ?? ''),
//                             _gstFiles: parseDocumentUrls(a.GSTNumberURL ?? ''),
//                         }));

//                         setApplicantList(applicantsWithFiles);
//                         setPaymentSchedules(booking?.BookingPaymentScheduleData || []);
//                         setOtherCharges(booking?.BookingOtherChargesData || []);
//                     }
//                 } else {
//                     addToast({ type: 'error', title: response.left.message });
//                 }

//                 return response;
//             },
//             undefined,
//             (error: any) => {
//                 addToast({ type: 'error', title: error.message });
//             },
//             undefined,
//             'Loading Booking'
//         );
//     };
//     //#endregion

//     //#region HANDLE FIELD CHANGE
//     const handleFieldChange = (field: keyof AddUpdateBookingRequest, value: any) => {
//         setFormData((prev) => ({ ...prev, [field]: value }));
//         if (errors[field]) {
//             setErrors((prev) => ({ ...prev, [field]: '' }));
//         }
//     };
//     //#endregion

//     //#region EDIT BOOKING APPLICANT
//     const handleEditApplicant = useCallback((row: BookingApplicantWithFiles, index: number) => {
//         const applicantData: AddUpdateBookingApplicantRequest = {
//             BookingApplicantId: row.BookingApplicantId ?? 0,
//             ApplicantType: row.ApplicantType || '',
//             ApplicantName: row.ApplicantName || '',
//             ApplicantMobileNumber: row.ApplicantMobileNumber || '',
//             ApplicantEmailId: row.ApplicantEmailId || '',
//             RemovePhotoURL: '',
//             AadharCardNumber: row.AadharCardNumber || '',
//             RemoveAadharCardURL: '',
//             PanNumber: row.PanNumber || '',
//             RemovePanCardURL: '',
//             PassportNumber: row.PassportNumber || '',
//             RemovePassportURL: '',
//             DrivingLicenseNumber: row.DrivingLicenseNumber || '',
//             RemoveDrivingLicenseURL: '',
//             VotingIdNumber: row.VotingIdNumber || '',
//             RemoveVotingIdURL: '',
//             GSTNumber: row.GSTNumber || '',
//             RemoveGSTNumberURL: '',
//             PhotoURL: null,
//             AadharCardURL: null,
//             PanCardURL: null,
//             PassportURL: null,
//             DrivingLicenseURL: null,
//             VotingIdURL: null,
//             GSTNumberURL: null
//         };

//         setEditingApplicantData({ row, index });
//         setFormDataForApplicant(applicantData);

//         setApplicantPhotoFiles(row._photoFiles ?? []);
//         setRemovedApplicantPhotoURLs([]);
//         setAadharCardFiles(row._aadharFiles ?? []);
//         setRemovedAadharCardURLs([]);
//         setPanCardFiles(row._panFiles ?? []);
//         setRemovedPanCardURLs([]);
//         setPassportFiles(row._passportFiles ?? []);
//         setRemovedPassportURLs([]);
//         setDrivingLicenseFiles(row._drivingFiles ?? []);
//         setRemovedDrivingLicenseURLs([]);
//         setVotingIdFiles(row._votingFiles ?? []);
//         setRemovedVotingIdURLs([]);
//         setGstFiles(row._gstFiles ?? []);
//         setRemovedGstURLs([]);

//         setIsAddUpdateApplicantModalOpen(true);
//     }, []);
//     //#endregion

//     //#region DELETE BOOKING APPLICANT CONFIRMATION DIALOG
//     const handleConfirmationDialogBoxOpen = (row: BookingApplicantWithFiles, index: number) => {
//         setDeleteBookingApplicantData({ row, index });
//         setIsConfirmationDialogBoxOpen(true);
//     };
//     //#endregion

//     //#region APPLICANT TABLE COLUMN
//     const applicantColumns = useMemo<TableColumn[]>(
//         () => [
//             {
//                 key: 'ApplicantName',
//                 label: 'Applicant Name',
//                 width: '15',
//                 sortable: false,
//                 align: 'left',
//                 fixed: 'left',
//                 render: (value, row) => {
//                     return (
//                         <MultiImageViewer
//                             images={parseDocumentUrls(row.PhotoURL)}
//                             title="Applicant Document"
//                             triggerLabel={value || '-'}
//                             isWrap={false}
//                         />
//                     );
//                 }
//             },
//             {
//                 key: 'ApplicantType',
//                 label: 'Type',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value) => value || '-'
//             },
//             {
//                 key: 'ApplicantMobileNumber',
//                 label: 'Mobile Number',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value) => value || '-'
//             },
//             {
//                 key: 'ApplicantEmailId',
//                 label: 'Email Id',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value) => value || '-'
//             },
//             {
//                 key: 'AadharCardNumber',
//                 label: 'Aadhaar',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value: string, row: any) => {
//                     return (
//                         <MultiImageViewer
//                             images={parseDocumentUrls(row.AadharCardURL)}
//                             title="Aadhar Card Document"
//                             triggerLabel={value || '-'}
//                             isWrap={false}
//                         />
//                     );
//                 }
//             },
//             {
//                 key: 'PanNumber',
//                 label: 'PAN',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value: string, row: any) => {
//                     return (
//                         <MultiImageViewer
//                             images={parseDocumentUrls(row.PanCardURL)}
//                             title="Pan Card Document"
//                             triggerLabel={value || '-'}
//                             isWrap={false}
//                         />
//                     );
//                 }
//             },
//             {
//                 key: 'PassportNumber',
//                 label: 'Passport',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value: string, row: any) => {
//                     return (
//                         <MultiImageViewer
//                             images={parseDocumentUrls(row.PassportURL)}
//                             title="Passport Number Document"
//                             triggerLabel={value || '-'}
//                             isWrap={false}
//                         />
//                     );
//                 }
//             },
//             {
//                 key: 'DrivingLicenseNumber',
//                 label: 'Driving License',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value: string, row: any) => {
//                     return (
//                         <MultiImageViewer
//                             images={parseDocumentUrls(row.DrivingLicenseURL)}
//                             title="Driving License Document"
//                             triggerLabel={value || '-'}
//                             isWrap={false}
//                         />
//                     );
//                 }
//             },
//             {
//                 key: 'VotingIdNumber',
//                 label: 'Voting',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value: string, row: any) => {
//                     return (
//                         <MultiImageViewer
//                             images={parseDocumentUrls(row.VotingIdURL)}
//                             title="Voting Id Document"
//                             triggerLabel={value || '-'}
//                             isWrap={false}
//                         />
//                     );
//                 }
//             },
//             {
//                 key: 'GSTNumber',
//                 label: 'GST',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value: string, row: any) => {
//                     return (
//                         <MultiImageViewer
//                             images={parseDocumentUrls(row.GSTNumberURL)}
//                             title="GST Document"
//                             triggerLabel={value || '-'}
//                             isWrap={false}
//                         />
//                     );
//                 }
//             },
//             {
//                 key: 'actions',
//                 label: 'Actions',
//                 width: '12',
//                 fixed: 'right',
//                 align: 'center',
//                 render: (_value, row, index) => (
//                     canAction ? (
//                         <div className="flex items-center justify-center gap-2">
//                             <Button
//                                 onClick={(e) => {
//                                     e.preventDefault();
//                                     e.stopPropagation();
//                                     handleEditApplicant(row, index);
//                                 }}
//                                 color='transparent'
//                                 isborderRadius
//                                 size='sm'
//                                 title="Edit Applicant"
//                                 leftIcon={<Edit className="h-4 w-4" />}
//                             >
//                             </Button>
//                             <Button
//                                 onClick={(e) => {
//                                     e.preventDefault();
//                                     e.stopPropagation();
//                                     handleConfirmationDialogBoxOpen(row, index);
//                                 }}
//                                 color="transparent"
//                                 isborderRadius
//                                 size="sm"
//                                 style={{ color: 'red' }}
//                                 title="Delete"
//                             >
//                                 <Trash2 className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     ) : null
//                 )
//             }
//         ],
//         [handleEditApplicant, handleConfirmationDialogBoxOpen, applicantList, canAction]
//     );
//     //#endregion

//     //#region PAYMENT SCHEDULE TABLE COLUMN
//     const paymentScheduleColumns = useMemo<TableColumn[]>(
//         () => [
//             {
//                 key: 'Type',
//                 label: 'Type',
//                 width: '12',
//                 sortable: false,
//                 align: 'center',
//                 render: (value) => value || '-'
//             },
//             {
//                 key: 'Date',
//                 label: 'Date / Stage',
//                 width: '20',
//                 sortable: false,
//                 align: 'left',
//                 render: (_value, row) => {
//                     if (row.Type === 'Date' && row.Date) {
//                         return formatDate_dd_mm_yyyy(row.Date);
//                     } else if (row.Type === 'Stage' && row.Name) {
//                         return row.Name;
//                     }
//                     return '-';
//                 }
//             },
//             {
//                 key: 'PaymentSchedulePercentage',
//                 label: 'Percentage',
//                 width: '12',
//                 sortable: false,
//                 align: 'center',
//                 render: (value) => `${value || 0}%`
//             },
//             {
//                 key: 'Cumulative',
//                 label: 'Cumulative %',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (_value, _row, index) => {
//                     return `${cumulativePercentages[index]?.toFixed(2) || 0}%`;
//                 }
//             },
//             {
//                 key: 'PaymentScheduleAmount',
//                 label: 'Amount',
//                 width: '18',
//                 sortable: false,
//                 align: 'right',
//                 render: (value) => {
//                     if (!value) return '-';
//                     return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//                 }
//             },
//             {
//                 key: 'actions',
//                 label: 'Actions',
//                 width: '12',
//                 fixed: 'right',
//                 align: 'center',
//                 render: (_value, row, index) => (
//                     canAction ? (
//                         <div className="flex items-center justify-center gap-2">
//                             <Button
//                                 onClick={(e) => {
//                                     e.preventDefault();
//                                     e.stopPropagation();
//                                     setEditingPaymentScheduleIndex(index);
//                                     setPaymentScheduleType((row.Type === 'Date' || row.Type === 'Stage') ? row.Type : 'Date');
//                                     setPaymentScheduleDate(row.Date ? formatDate_dd_mm_yyyy(row.Date) : '');
//                                     setPaymentScheduleStage(row.Name || '');
//                                     setPaymentSchedulePercentage(String(row.PaymentSchedulePercentage || ''));
//                                     setIsPaymentScheduleModalOpen(true);
//                                 }}
//                                 color='transparent'
//                                 isborderRadius
//                                 size='sm'
//                                 title="Edit Payment Schedule"
//                                 leftIcon={<Edit className="h-4 w-4" />}
//                             >
//                             </Button>
//                             <Button
//                                 onClick={(e) => {
//                                     e.preventDefault();
//                                     e.stopPropagation();
//                                     setPaymentSchedules(prev => prev.filter((_, i) => i !== index));
//                                 }}
//                                 color="transparent"
//                                 isborderRadius
//                                 size="sm"
//                                 style={{ color: 'red' }}
//                                 title="Delete"
//                             >
//                                 <Trash2 className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     ) : null
//                 )
//             }
//         ],
//         [cumulativePercentages, canAction]
//     );
//     //#endregion

//     //#region OTHER CHARGES TABLE COLUMN
//     const otherChargesColumns = useMemo<TableColumn[]>(
//         () => [
//             {
//                 key: 'ChargeName',
//                 label: 'Name',
//                 width: '20',
//                 sortable: false,
//                 align: 'left',
//                 fixed: 'left',
//                 render: (value) => value || '-'
//             },
//             {
//                 key: 'CalculatedOn',
//                 label: 'Calculated On',
//                 width: '15',
//                 sortable: false,
//                 align: 'center',
//                 render: (value) => value || '-'
//             },
//             {
//                 key: 'Value',
//                 label: 'Value',
//                 width: '18',
//                 sortable: false,
//                 align: 'right',
//                 render: (value) => {
//                     if (!value) return '-';
//                     return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//                 }
//             },
//             {
//                 key: 'GSTPercentage',
//                 label: 'GST %',
//                 width: '12',
//                 sortable: false,
//                 align: 'center',
//                 render: (value) => `${value || 0}%`
//             },
//             {
//                 key: 'GSTValue',
//                 label: 'GST Value',
//                 width: '18',
//                 sortable: false,
//                 align: 'right',
//                 render: (value) => {
//                     if (!value) return '-';
//                     return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//                 }
//             },
//             {
//                 key: 'actions',
//                 label: 'Actions',
//                 width: '12',
//                 fixed: 'right',
//                 align: 'center',
//                 render: (_value, row, index) => (
//                     canAction ? (
//                         <div className="flex items-center justify-center gap-2">
//                             <Button
//                                 onClick={(e) => {
//                                     e.preventDefault();
//                                     e.stopPropagation();
//                                     setEditingOtherChargeIndex(index);
//                                     setOtherChargeName(row.ChargeName || '');
//                                     setOtherChargeCalculatedOn(row.CalculatedOn || '');
//                                     setOtherChargeValue(String(row.Value || ''));
//                                     setOtherChargeGSTPercentage(String(row.GSTPercentage || ''));
//                                     setIsOtherChargesModalOpen(true);
//                                 }}
//                                 color='transparent'
//                                 isborderRadius
//                                 size='sm'
//                                 title="Edit Other Charge"
//                                 leftIcon={<Edit className="h-4 w-4" />}
//                             >
//                             </Button>
//                             <Button
//                                 onClick={(e) => {
//                                     e.preventDefault();
//                                     e.stopPropagation();
//                                     setOtherCharges(prev => prev.filter((_, i) => i !== index));
//                                 }}
//                                 color="transparent"
//                                 isborderRadius
//                                 size="sm"
//                                 style={{ color: 'red' }}
//                                 title="Delete"
//                             >
//                                 <Trash2 className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     ) : null
//                 )
//             }
//         ],
//         [canAction]
//     );
//     //#endregion

//     //#region HANDLE CHANGE EVENT FOR APPLICANT
//     const handleFieldChangeBookingApplicant = (field: keyof AddUpdateBookingApplicantRequest, value: any) => {
//         setFormDataForApplicant((prev) => ({ ...prev, [field]: value }));
//         if (errorsBookingApplicant[field]) {
//             setErrorsBookingApplicant((prev) => ({ ...prev, [field]: "" }));
//         }
//     };
//     //#endregion

//     //#region VALIDATION
//     const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
//         const newErrors: { [key: string]: string } = {};

//         if (!formData.ProjectId || formData.ProjectId === 0) {
//             newErrors.ProjectId = 'Project is required';
//         }

//         if (!formData.BookingType) {
//             newErrors.BookingType = 'Booking Type is required';
//         }

//         if (!formData.InventoryFlatId || formData.InventoryFlatId === 0) {
//             newErrors.InventoryFlatId = 'Flat is required';
//         }

//         if (!formData.AgreementValue || formData.AgreementValue === 0) {
//             newErrors.AgreementValue = 'Agreement Value is required';
//         }

//         if (!formData.RegistrationDate) {
//             newErrors.RegistrationDate = 'Registration Date is required';
//         }

//         if (applicantList.length === 0) {
//             addToast({ type: 'error', title: "At least one applicant is required" });
//             return { isValid: false, errors: newErrors };
//         }

//         return {
//             isValid: Object.keys(newErrors).length === 0,
//             errors: newErrors
//         };
//     };

//     const validateAddApplicantForm = (): {
//         isValid: boolean;
//         errorsBookingApplicant: { [key: string]: string };
//     } => {
//         const newErrorsBookingApplicant: { [key: string]: string } = {};

//         if (!formDataForApplicant.ApplicantType?.trim()) {
//             newErrorsBookingApplicant.ApplicantType = 'Applicant Type is required';
//         }

//         if (!formDataForApplicant.ApplicantName?.trim()) {
//             newErrorsBookingApplicant.ApplicantName = 'Applicant Name is required';
//         }

//         if (!formDataForApplicant.ApplicantMobileNumber?.trim()) {
//             newErrorsBookingApplicant.ApplicantMobileNumber = 'Mobile Number is required';
//         } else if (!isValidMobile(formDataForApplicant.ApplicantMobileNumber.trim())) {
//             newErrorsBookingApplicant.ApplicantMobileNumber = 'Enter a valid 10-Digit Mobile Number';
//         }

//         if (formDataForApplicant.ApplicantEmailId?.trim() && !isValidEmail(formDataForApplicant.ApplicantEmailId.trim())) {
//             newErrorsBookingApplicant.ApplicantEmailId = 'Enter a valid Email Id';
//         }

//         const mergedPhotoFiles = editingApplicantData
//             ? calculateMergedFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, removedApplicantPhotoURLs)
//             : applicantPhotoFiles.slice();

//         if (mergedPhotoFiles.length === 0) {
//             newErrorsBookingApplicant.PhotoURL = "Applicant Photo is required";
//         }

//         const mergedAadharFiles = editingApplicantData
//             ? calculateMergedFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, removedAadharCardURLs)
//             : aadharCardFiles.slice();
//         const AadharCardNumber = formDataForApplicant.AadharCardNumber?.trim() || "";
//         const hasAadharCardNumber = AadharCardNumber !== "";
//         const hasAadharCardNumberFile = mergedAadharFiles.length > 0;

//         if (hasAadharCardNumber && !isValidAadhaar(AadharCardNumber)) {
//             newErrorsBookingApplicant.AadharCardNumber = "Enter a valid Aadhaar Card Number";
//         }
//         if (hasAadharCardNumber && !hasAadharCardNumberFile) {
//             newErrorsBookingApplicant.AadharCardURL = "Aadhaar document is required";
//         }
//         if (hasAadharCardNumberFile && !hasAadharCardNumber) {
//             newErrorsBookingApplicant.AadharCardNumber = "Aadhaar Card Number is required";
//         }

//         const mergedPanFiles = editingApplicantData
//             ? calculateMergedFiles(editingApplicantData.row._panFiles, panCardFiles, removedPanCardURLs)
//             : panCardFiles.slice();
//         const PanNumber = formDataForApplicant.PanNumber?.trim() || "";
//         const hasPanNumber = PanNumber !== "";
//         const hasPanFile = mergedPanFiles.length > 0;

//         if (hasPanNumber && !isValidPAN(PanNumber)) {
//             newErrorsBookingApplicant.PanNumber = "Enter a valid PAN Card Number";
//         }
//         if (hasPanNumber && !hasPanFile) {
//             newErrorsBookingApplicant.PanCardURL = "PAN document is required";
//         }
//         if (hasPanFile && !hasPanNumber) {
//             newErrorsBookingApplicant.PanNumber = "PAN Card Number is required";
//         }

//         const mergedPassportFiles = editingApplicantData
//             ? calculateMergedFiles(editingApplicantData.row._passportFiles, passportFiles, removedPassportURLs)
//             : passportFiles.slice();
//         const PassportNumber = formDataForApplicant.PassportNumber?.trim() || "";
//         const hasPassportNumber = PassportNumber !== "";
//         const hasPassportFile = mergedPassportFiles.length > 0;

//         if (hasPassportNumber && !isValidPassportNumber(PassportNumber)) {
//             newErrorsBookingApplicant.PassportNumber = "Enter a valid Passport Number";
//         }
//         if (hasPassportNumber && !hasPassportFile) {
//             newErrorsBookingApplicant.PassportURL = "Passport document is required";
//         }
//         if (hasPassportFile && !hasPassportNumber) {
//             newErrorsBookingApplicant.PassportNumber = "Passport Number is required";
//         }

//         const mergedDrivingFiles = editingApplicantData
//             ? calculateMergedFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, removedDrivingLicenseURLs)
//             : drivingLicenseFiles.slice();
//         const DLNumber = formDataForApplicant.DrivingLicenseNumber?.trim() || "";
//         const hasDLNumber = DLNumber !== "";
//         const hasDLFile = mergedDrivingFiles.length > 0;

//         if (hasDLNumber && !isValidDrivingLicenseNumber(DLNumber)) {
//             newErrorsBookingApplicant.DrivingLicenseNumber = "Enter a valid Driving License Number";
//         }
//         if (hasDLNumber && !hasDLFile) {
//             newErrorsBookingApplicant.DrivingLicenseURL = "Driving License document is required";
//         }
//         if (hasDLFile && !hasDLNumber) {
//             newErrorsBookingApplicant.DrivingLicenseNumber = "Driving License Number is required";
//         }

//         const mergedVotingFiles = editingApplicantData
//             ? calculateMergedFiles(editingApplicantData.row._votingFiles, votingIdFiles, removedVotingIdURLs)
//             : votingIdFiles.slice();
//         const VotingIdNumber = formDataForApplicant.VotingIdNumber?.trim() || "";
//         const hasVotingIdNumber = VotingIdNumber !== "";
//         const hasVotingFile = mergedVotingFiles.length > 0;

//         if (hasVotingIdNumber && !isValidVoterId(VotingIdNumber)) {
//             newErrorsBookingApplicant.VotingIdNumber = "Enter a valid Voting Id Number";
//         }
//         if (hasVotingIdNumber && !hasVotingFile) {
//             newErrorsBookingApplicant.VotingIdURL = "Voting ID document is required";
//         }
//         if (hasVotingFile && !hasVotingIdNumber) {
//             newErrorsBookingApplicant.VotingIdNumber = "Voting ID Number is required";
//         }

//         const mergedGstFiles = editingApplicantData
//             ? calculateMergedFiles(editingApplicantData.row._gstFiles, gstFiles, removedGstURLs)
//             : gstFiles.slice();
//         const GSTNumber = formDataForApplicant.GSTNumber?.trim() || "";
//         const hasGSTNumber = GSTNumber !== "";
//         const hasGSTFile = mergedGstFiles.length > 0;

//         if (hasGSTNumber && !isValidGST(GSTNumber)) {
//             newErrorsBookingApplicant.GSTNumber = "Enter a valid GST Number";
//         }
//         if (hasGSTNumber && !hasGSTFile) {
//             newErrorsBookingApplicant.GSTNumberURL = "GST document is required";
//         }
//         if (hasGSTFile && !hasGSTNumber) {
//             newErrorsBookingApplicant.GSTNumber = "GST Number is required";
//         }

//         return {
//             isValid: Object.keys(newErrorsBookingApplicant).length === 0,
//             errorsBookingApplicant: newErrorsBookingApplicant
//         };
//     };
//     //#endregion

//     //#region ADD UPDATE BOOKING APPLICANT
//     const handleAddUpdateBookingApplicant = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setErrorsBookingApplicant({});

//         const validation = validateAddApplicantForm();

//         if (!validation.isValid) {
//             setErrorsBookingApplicant(validation.errorsBookingApplicant);
//             return;
//         }

//         const finalRemovedPhotoURLs = editingApplicantData
//             ? calculateRemovedFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, removedApplicantPhotoURLs)
//             : removedApplicantPhotoURLs;
//         const finalRemovedAadharURLs = editingApplicantData
//             ? calculateRemovedFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, removedAadharCardURLs)
//             : removedAadharCardURLs;
//         const finalRemovedPanURLs = editingApplicantData
//             ? calculateRemovedFiles(editingApplicantData.row._panFiles, panCardFiles, removedPanCardURLs)
//             : removedPanCardURLs;
//         const finalRemovedPassportURLs = editingApplicantData
//             ? calculateRemovedFiles(editingApplicantData.row._passportFiles, passportFiles, removedPassportURLs)
//             : removedPassportURLs;
//         const finalRemovedDrivingURLs = editingApplicantData
//             ? calculateRemovedFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, removedDrivingLicenseURLs)
//             : removedDrivingLicenseURLs;
//         const finalRemovedVotingURLs = editingApplicantData
//             ? calculateRemovedFiles(editingApplicantData.row._votingFiles, votingIdFiles, removedVotingIdURLs)
//             : removedVotingIdURLs;
//         const finalRemovedGstURLs = editingApplicantData
//             ? calculateRemovedFiles(editingApplicantData.row._gstFiles, gstFiles, removedGstURLs)
//             : removedGstURLs;

//         const mergedPhotoFiles = editingApplicantData
//             ? mergeFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, finalRemovedPhotoURLs)
//             : applicantPhotoFiles.slice();
//         const mergedAadharFiles = editingApplicantData
//             ? mergeFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, finalRemovedAadharURLs)
//             : aadharCardFiles.slice();
//         const mergedPanFiles = editingApplicantData
//             ? mergeFiles(editingApplicantData.row._panFiles, panCardFiles, finalRemovedPanURLs)
//             : panCardFiles.slice();
//         const mergedPassportFiles = editingApplicantData
//             ? mergeFiles(editingApplicantData.row._passportFiles, passportFiles, finalRemovedPassportURLs)
//             : passportFiles.slice();
//         const mergedDrivingFiles = editingApplicantData
//             ? mergeFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, finalRemovedDrivingURLs)
//             : drivingLicenseFiles.slice();
//         const mergedVotingFiles = editingApplicantData
//             ? mergeFiles(editingApplicantData.row._votingFiles, votingIdFiles, finalRemovedVotingURLs)
//             : votingIdFiles.slice();
//         const mergedGstFiles = editingApplicantData
//             ? mergeFiles(editingApplicantData.row._gstFiles, gstFiles, finalRemovedGstURLs)
//             : gstFiles.slice();

//         const applicantToSave: BookingApplicantWithFiles = {
//             BookingApplicantId: editingApplicantData?.row.BookingApplicantId ?? 0,
//             ApplicantType: formDataForApplicant.ApplicantType || '',
//             ApplicantName: formDataForApplicant.ApplicantName || '',
//             ApplicantMobileNumber: formDataForApplicant.ApplicantMobileNumber || '',
//             ApplicantEmailId: formDataForApplicant.ApplicantEmailId || '',
//             PhotoURL: createFileUrlString(mergedPhotoFiles),
//             AadharCardNumber: formDataForApplicant.AadharCardNumber || '',
//             AadharCardURL: createFileUrlString(mergedAadharFiles),
//             PanNumber: formDataForApplicant.PanNumber || '',
//             PanCardURL: createFileUrlString(mergedPanFiles),
//             PassportNumber: formDataForApplicant.PassportNumber || '',
//             PassportURL: createFileUrlString(mergedPassportFiles),
//             DrivingLicenseNumber: formDataForApplicant.DrivingLicenseNumber || '',
//             DrivingLicenseURL: createFileUrlString(mergedDrivingFiles),
//             VotingIdNumber: formDataForApplicant.VotingIdNumber || '',
//             VotingIdURL: createFileUrlString(mergedVotingFiles),
//             GSTNumber: formDataForApplicant.GSTNumber || '',
//             GSTNumberURL: createFileUrlString(mergedGstFiles),
//             CreatedById: 0,
//             CreatedBy: '',
//             CreatedDate: null,
//             ModifiedById: 0,
//             ModifiedBy: '',
//             ModifiedDate: null,
//             _photoFiles: mergedPhotoFiles,
//             _aadharFiles: mergedAadharFiles,
//             _panFiles: mergedPanFiles,
//             _passportFiles: mergedPassportFiles,
//             _drivingFiles: mergedDrivingFiles,
//             _votingFiles: mergedVotingFiles,
//             _gstFiles: mergedGstFiles,
//             RemovePhotoURL: finalRemovedPhotoURLs.join(','),
//             RemoveAadharCardURL: finalRemovedAadharURLs.join(','),
//             RemovePanCardURL: finalRemovedPanURLs.join(','),
//             RemovePassportURL: finalRemovedPassportURLs.join(','),
//             RemoveDrivingLicenseURL: finalRemovedDrivingURLs.join(','),
//             RemoveVotingIdURL: finalRemovedVotingURLs.join(','),
//             RemoveGSTNumberURL: finalRemovedGstURLs.join(','),
//         };

//         setApplicantList(prev => {
//             if (editingApplicantData) {
//                 const updated = [...prev];
//                 updated[editingApplicantData.index] = applicantToSave;
//                 return updated;
//             }
//             return [...prev, applicantToSave];
//         });

//         setIsAddUpdateApplicantModalOpen(false);
//         setEditingApplicantData(null);
//         setFormDataForApplicant(initialFormStateApplicantDetails());
//         setApplicantPhotoFiles([]);
//         setAadharCardFiles([]);
//         setPanCardFiles([]);
//         setPassportFiles([]);
//         setDrivingLicenseFiles([]);
//         setVotingIdFiles([]);
//         setGstFiles([]);
//     };
//     //#endregion

//     //#region DELETE BOOKING APPLICANT
//     const handleDeleteApplicant = () => {
//         if (!deleteBookingApplicantData) return;

//         const removeIndex = deleteBookingApplicantData.index;

//         if (removeIndex < 0) {
//             setIsConfirmationDialogBoxOpen(false);
//             setDeleteBookingApplicantData(null);
//             addToast({ type: 'error', title: 'Unable to find the selected applicant to delete' });
//             return;
//         }

//         setApplicantList(prev => prev.filter((_, i) => i !== removeIndex));
//         setIsConfirmationDialogBoxOpen(false);
//         setDeleteBookingApplicantData(null);
//         addToast({ type: 'success', title: 'Applicant Removed' });
//     };
//     //#endregion

//     //#region SUBMIT FORM
//     const handleSubmit = async () => {
//         setErrors({});

//         // Validate payment schedule total percentage
//         if (paymentSchedules.length > 0 && totalPercentage !== 100) {
//             addToast({
//                 type: 'error',
//                 title: `Payment schedule total must be exactly 100%. Current total is ${totalPercentage.toFixed(2)}%`
//             });
//             return;
//         }

//         const validation = validateForm();

//         if (!validation.isValid) {
//             setErrors(validation.errors);
//             addToast({ type: 'error', title: 'Please fix the validation errors' });
//             return;
//         }

//         await runApiWithLoader(
//             setIsLoading,
//             setLoadingMessage,
//             async () => {
//                 const formDataToSend = new FormData();

//                 // Add booking data
//                 formDataToSend.append('BookingId', String(formData.BookingId ?? 0));
//                 if (formData.Uniquekey) {
//                     formDataToSend.append('Uniquekey', formData.Uniquekey);
//                 }
//                 formDataToSend.append('ProjectId', String(formData.ProjectId ?? 0));
//                 formDataToSend.append('PermanentAddress', formData.PermanentAddress ?? '');
//                 formDataToSend.append('CommunicationAddress', formData.CommunicationAddress ?? '');
//                 formDataToSend.append('Source', formData.Source ?? '');
//                 formDataToSend.append('SubSource', formData.SubSource ?? '');
//                 formDataToSend.append('BrokeragePercentage', String(formData.BrokeragePercentage ?? 0));
//                 formDataToSend.append('BrokerageAmount', String(formData.BrokerageAmount ?? 0));
//                 formDataToSend.append('InventoryFlatId', String(formData.InventoryFlatId ?? 0));
//                 formDataToSend.append('AgreementValue', String(formData.AgreementValue ?? 0));
//                 formDataToSend.append('AgreementValueTDS', String(formData.AgreementValueTDS ?? 0));
//                 formDataToSend.append('AgreementValueGSTPercentage', String(formData.AgreementValueGSTPercentage ?? 0));
//                 formDataToSend.append('AgreementValueGSTAmount', String(formData.AgreementValueGSTAmount ?? 0));
//                 formDataToSend.append('StampDutyPercentage', String(formData.StampDutyPercentage ?? 0));
//                 formDataToSend.append('StampDutyAmount', String(formData.StampDutyAmount ?? 0));
//                 formDataToSend.append('RegistrationFees', String(formData.RegistrationFees ?? 0));
//                 formDataToSend.append('ParkingId', formData.ParkingId ?? '');
//                 formDataToSend.append('HandoverType', formData.HandoverType ?? '');
//                 if (formData.RegistrationDate) {
//                     const regDate = convert_dd_mm_yyyy_To_Yyyy_mm_dd(formData.RegistrationDate);
//                     if (regDate) {
//                         formDataToSend.append('RegistrationDate', regDate);
//                     }
//                 }
//                 formDataToSend.append('ModeOfPayment', formData.ModeOfPayment ?? '');
//                 formDataToSend.append('FlatAlterationRemark', formData.FlatAlterationRemark ?? '');
//                 formDataToSend.append('TermsAndConditionsDescription', formData.TermsAndConditionsDescription ?? '');
//                 formDataToSend.append('BookingType', formData.BookingType ?? '');
//                 // Convert other charges to JSON
//                 const otherChargesJSON = otherCharges.length > 0 ? JSON.stringify(otherCharges) : '';
//                 formDataToSend.append('OtherChargesDetailJSON', otherChargesJSON);
//                 // Convert payment schedules to JSON
//                 const paymentScheduleJSON = paymentSchedules.length > 0 ? JSON.stringify(paymentSchedules) : '';
//                 formDataToSend.append('PaymentScheduleDetailJSON', paymentScheduleJSON);
//                 formDataToSend.append('BookingAmount', String(formData.BookingAmount ?? 0));
//                 formDataToSend.append('ChequeRTGSNumber', formData.ChequeRTGSNumber ?? '');
//                 if (formData.ChequeRTGSDate) {
//                     const chequeDate = convert_dd_mm_yyyy_To_Yyyy_mm_dd(formData.ChequeRTGSDate);
//                     if (chequeDate) {
//                         formDataToSend.append('ChequeRTGSDate', chequeDate);
//                     }
//                 }
//                 formDataToSend.append('BankListMasterId', String(formData.BankListMasterId ?? 0));
//                 formDataToSend.append('TransferBookingId', String(formData.TransferBookingId ?? 0));
//                 formDataToSend.append('TenantId', String(formData.TenantId ?? 0));

//                 // Helper function to add files with existing
//                 const addFilesWithExisting = (
//                     fdLocal: FormData,
//                     prefix: string,
//                     fileArray: (File | string)[] | undefined,
//                     fieldKey: string
//                 ) => {
//                     if (!fileArray || fileArray.length === 0) return;

//                     const existingNames = fileArray
//                         .filter(x => typeof x === 'string' && String(x).trim().length > 0)
//                         .map(x => String(x).trim())
//                         .join(',');

//                     if (existingNames) {
//                         fdLocal.append(`${prefix}.${fieldKey}`, existingNames);
//                     }

//                     fileArray.forEach(item => {
//                         if (item instanceof File) {
//                             fdLocal.append(`${prefix}.${fieldKey}`, item, item.name);
//                         }
//                     });
//                 };

//                 // Add applicants
//                 applicantList.forEach((app, index) => {
//                     const prefix = `AddUpdateBookingApplicant[${index}]`;

//                     formDataToSend.append(`${prefix}.BookingApplicantId`, String(app.BookingApplicantId ?? 0));
//                     formDataToSend.append(`${prefix}.ApplicantType`, app.ApplicantType ?? '');
//                     formDataToSend.append(`${prefix}.ApplicantName`, app.ApplicantName ?? '');
//                     formDataToSend.append(`${prefix}.ApplicantMobileNumber`, app.ApplicantMobileNumber ?? '');
//                     formDataToSend.append(`${prefix}.ApplicantEmailId`, app.ApplicantEmailId ?? '');
//                     formDataToSend.append(`${prefix}.AadharCardNumber`, app.AadharCardNumber ?? '');
//                     formDataToSend.append(`${prefix}.PanNumber`, app.PanNumber ?? '');
//                     formDataToSend.append(`${prefix}.PassportNumber`, app.PassportNumber ?? '');
//                     formDataToSend.append(`${prefix}.DrivingLicenseNumber`, app.DrivingLicenseNumber ?? '');
//                     formDataToSend.append(`${prefix}.VotingIdNumber`, app.VotingIdNumber ?? '');
//                     formDataToSend.append(`${prefix}.GSTNumber`, app.GSTNumber ?? '');

//                     formDataToSend.append(`${prefix}.RemovePhotoURL`, app.RemovePhotoURL ?? '');
//                     formDataToSend.append(`${prefix}.RemoveAadharCardURL`, app.RemoveAadharCardURL ?? '');
//                     formDataToSend.append(`${prefix}.RemovePanCardURL`, app.RemovePanCardURL ?? '');
//                     formDataToSend.append(`${prefix}.RemovePassportURL`, app.RemovePassportURL ?? '');
//                     formDataToSend.append(`${prefix}.RemoveDrivingLicenseURL`, app.RemoveDrivingLicenseURL ?? '');
//                     formDataToSend.append(`${prefix}.RemoveVotingIdURL`, app.RemoveVotingIdURL ?? '');
//                     formDataToSend.append(`${prefix}.RemoveGSTNumberURL`, app.RemoveGSTNumberURL ?? '');

//                     const realApp: any = app;
//                     addFilesWithExisting(formDataToSend, prefix, realApp._photoFiles, 'PhotoURL');
//                     addFilesWithExisting(formDataToSend, prefix, realApp._aadharFiles, 'AadharCardURL');
//                     addFilesWithExisting(formDataToSend, prefix, realApp._panFiles, 'PanCardURL');
//                     addFilesWithExisting(formDataToSend, prefix, realApp._passportFiles, 'PassportURL');
//                     addFilesWithExisting(formDataToSend, prefix, realApp._drivingFiles, 'DrivingLicenseURL');
//                     addFilesWithExisting(formDataToSend, prefix, realApp._votingFiles, 'VotingIdURL');
//                     addFilesWithExisting(formDataToSend, prefix, realApp._gstFiles, 'GSTNumberURL');
//                 });

//                 const response = await bookingService.apiCallAddUpdateBooking(formDataToSend);

//                 if (E.isRight(response)) {
//                     addToast({ type: 'success', title: response.right.SuccessMessage?.[0] || 'Booking saved successfully' });
//                     navigate('/booking');
//                 } else {
//                     addToast({ type: 'error', title: response.left.message });
//                 }

//                 return response;
//             },
//             undefined,
//             (error: any) => {
//                 addToast({ type: 'error', title: error.message });
//             },
//             undefined,
//             isAddMode ? 'Adding Booking' : 'Updating Booking'
//         );
//     };
//     //#endregion

//     //#region RENDER
//     return (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <Loader loading={isLoading} title={loadingMessage}>
//                 <div></div>
//             </Loader>

//             <div className="flex-1 space-y-2 px-6 py-3">
//                 <form onSubmit={handleSubmit}>
//                     {/* ============================================================= [APPLICANT DETAILS] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <div className="flex items-center justify-between">
//                             <div className="flex-1 border-b border-gray-500 pb-2">
//                                 <HeaderActionBar
//                                     titleText="Applicant Detail : "
//                                     subTitleText={bookingName || ''}
//                                     isLoading={isLoading}
//                                 />
//                             </div>
//                             <div className="ml-4">
//                                 <Button
//                                     type="button"
//                                     onClick={(e) => {
//                                         e.preventDefault();
//                                         e.stopPropagation();
//                                         setEditingApplicantData(null);
//                                         setFormDataForApplicant(initialFormStateApplicantDetails());
//                                         setApplicantPhotoFiles([]);
//                                         setAadharCardFiles([]);
//                                         setPanCardFiles([]);
//                                         setPassportFiles([]);
//                                         setDrivingLicenseFiles([]);
//                                         setVotingIdFiles([]);
//                                         setGstFiles([]);
//                                         setRemovedApplicantPhotoURLs([]);
//                                         setRemovedAadharCardURLs([]);
//                                         setRemovedPanCardURLs([]);
//                                         setRemovedPassportURLs([]);
//                                         setRemovedDrivingLicenseURLs([]);
//                                         setRemovedVotingIdURLs([]);
//                                         setRemovedGstURLs([]);
//                                         setIsAddUpdateApplicantModalOpen(true);
//                                     }}
//                                     color="blue"
//                                     size="sm"
//                                     title="Add Applicant"
//                                 >
//                                     <Plus className="h-4 w-4 mr-2" />
//                                     Add Applicant
//                                 </Button>
//                             </div>
//                         </div>
//                         {applicantList.length > 0 ? (
//                             <DataTable
//                                 data={applicantList}
//                                 columns={applicantColumns}
//                                 emptyMessage="No applicants found"
//                                 fixedHeight={false}
//                                 recordsPerPage={20}
//                                 className="min-w-full"
//                                 aria-label="Applicant list"
//                             />
//                         ) :
//                             <div className="flex items-center justify-center">
//                                 <span className="text-gray-500 text-sm font-medium">
//                                     No applicants found
//                                 </span>
//                             </div>
//                         }
//                     </div>

//                     {/* ============================================================= [ADDRESS DETAILS] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Address Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
//                             <TextArea
//                                 label="Permanent Address"
//                                 value={formData.PermanentAddress ?? ''}
//                                 onChange={(e) => handleFieldChange('PermanentAddress', e.target.value)}
//                                 placeholder="Enter Permanent Address"
//                             />
//                             <TextArea
//                                 label="Communication Address"
//                                 value={formData.CommunicationAddress ?? ''}
//                                 onChange={(e) => handleFieldChange('CommunicationAddress', e.target.value)}
//                                 placeholder="Enter Communication Address"
//                             />
//                             <div>
//                                 <SinglePageSelection
//                                     label="Source"
//                                     required
//                                     value={formData.Source ?? ''}
//                                     onChange={(e) => handleFieldChange('Source', String(e))}
//                                     options={SOURCE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
//                                     error={errors.Source}
//                                     placeholder="Select Source"
//                                 />
//                             </div>
//                             <Input
//                                 label="Sub Source"
//                                 type="text"
//                                 value={formData.SubSource ?? ''}
//                                 onChange={(e) => handleFieldChange('SubSource', e.target.value)}
//                                 placeholder="Enter Sub Source"
//                             />
//                         </div>
//                     </div>

//                     {/* ============================================================= [PROJECT DETAILS] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Project Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             <div>
//                                 <Input
//                                     label="Wing"
//                                     type="text"
//                                     value="A"
//                                     disabled
//                                     placeholder="Wing"
//                                 />
//                             </div>
//                             <div>
//                                 <Input
//                                     label="Floor"
//                                     type="text"
//                                     value="A"
//                                     disabled
//                                     placeholder="Floor"
//                                 />
//                             </div>
//                             <div>
//                                 <Input
//                                     label="Unit No"
//                                     type="text"
//                                     value="A"
//                                     disabled
//                                     placeholder="Unit No"
//                                 />
//                             </div>

//                             <Input
//                                 label="Category"
//                                 type="text"
//                                 value={selectedFlatData?.FlatType ?? ''}
//                                 disabled
//                                 placeholder="Category"
//                             />
//                             <Input
//                                 label="Configuration"
//                                 type="text"
//                                 value={selectedFlatData?.FlatConfiguration ?? ''}
//                                 disabled
//                                 placeholder="Configuration"
//                             />
//                             <Input
//                                 label="RERA Carpet Area"
//                                 type="text"
//                                 value={selectedFlatData?.RERACarpetAreaSqFt?.toString() ?? ''}
//                                 disabled
//                                 placeholder="RERA Carpet Area"
//                                 rightIcon="SqFt"
//                             />
//                         </div>
//                     </div>

//                     {/* ============================================================= [AGREEMENT DETAILS] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Agreement Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             <Input
//                                 label="Unit Value (With TDS)"
//                                 type="number"
//                                 value={formData.AgreementValue?.toString() ?? ''}
//                                 onChange={(e) => {
//                                     const value = filterNumbersWithDecimal(e.target.value);
//                                     handleFieldChange('AgreementValue', value);
//                                 }}
//                                 placeholder="0.00"
//                                 required
//                                 error={errors.AgreementValue}
//                             />
//                             <Input
//                                 label="TDS"
//                                 type="number"
//                                 value={formData.AgreementValueTDS?.toString() ?? ''}
//                                 onChange={(e) => {
//                                     const value = filterNumbersWithDecimal(e.target.value);
//                                     handleFieldChange('AgreementValueTDS', value);
//                                 }}
//                                 placeholder="0.0"
//                             />
//                             <Input
//                                 label="Unit Value (Without TDS)"
//                                 type="number"
//                                 value={((formData.AgreementValue || 0) - (formData.AgreementValueTDS || 0)).toFixed(2)}
//                                 disabled
//                                 placeholder="0.00"
//                             />
//                         </div>
//                     </div>

//                     {/* ============================================================= [TAX DETAILS] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Tax Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             <Input
//                                 label="Agreement CST (%)"
//                                 type="number"
//                                 value={formData.AgreementValueGSTPercentage?.toString() ?? ''}
//                                 onChange={(e) => {
//                                     const percentage = filterNumbersWithDecimal(e.target.value);
//                                     handleFieldChange('AgreementValueGSTPercentage', percentage);
//                                     // Calculate CST Amount
//                                     const agreementValue = formData.AgreementValue || 0;
//                                     const cstAmount = (agreementValue * Number(percentage)) / 100;
//                                     handleFieldChange('AgreementValueGSTAmount', cstAmount.toFixed(2));
//                                 }}
//                                 placeholder="Agreement CST (%)"
//                             />
//                             <Input
//                                 label="Agreement CST Amount"
//                                 type="number"
//                                 value={formData.AgreementValueGSTAmount?.toString() ?? ''}
//                                 disabled
//                                 placeholder="0.00"
//                             />
//                             <Input
//                                 label="Stamp Duty (%)"
//                                 type="number"
//                                 value={formData.StampDutyPercentage?.toString() ?? ''}
//                                 onChange={(e) => {
//                                     const percentage = filterNumbersWithDecimal(e.target.value);
//                                     handleFieldChange('StampDutyPercentage', percentage);
//                                     // Calculate Stamp Duty Amount
//                                     const agreementValue = formData.AgreementValue || 0;
//                                     const stampDutyAmount = (agreementValue * Number(percentage)) / 100;
//                                     handleFieldChange('StampDutyAmount', stampDutyAmount.toFixed(2));
//                                 }}
//                                 placeholder="Stamp Duty (%)"
//                             />
//                             <Input
//                                 label="Stamp Duty Amount"
//                                 type="number"
//                                 value={formData.StampDutyAmount?.toString() ?? ''}
//                                 disabled
//                                 placeholder="0.00"
//                             />
//                             <Input
//                                 label="Registration Fees"
//                                 type="number"
//                                 value={formData.RegistrationFees?.toString() ?? ''}
//                                 onChange={(e) => handleFieldChange('RegistrationFees', filterNumbersWithDecimal(e.target.value))}
//                                 placeholder="0.00"
//                             />
//                         </div>
//                     </div>

//                     {/* ============================================================= [OTHER DETAILS] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Other Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             <Input
//                                 label="Parking"
//                                 type="text"
//                                 value={formData.ParkingId ?? ''}
//                                 onChange={(e) => handleFieldChange('ParkingId', e.target.value)}
//                                 placeholder="0"
//                             />
//                             <div>
//                                 <SinglePageSelection
//                                     label="Handover Type"
//                                     required
//                                     value={formData.HandoverType ?? ''}
//                                     onChange={(e) => handleFieldChange('HandoverType', String(e))}
//                                     options={[]} // TODO: Add HANDOVER_TYPE constant if available
//                                     error={errors.HandoverType}
//                                     placeholder="SELECT Handover Type"
//                                 />
//                             </div>
//                             <DatePickerInput
//                                 label="Registration Date"
//                                 value={formData.RegistrationDate ? formatDate_dd_mm_yyyy(formData.RegistrationDate) : ''}
//                                 onChange={(value) => handleFieldChange('RegistrationDate', value)}
//                                 placeholder="DD/MM/YYYY"
//                                 required
//                                 error={errors.RegistrationDate}
//                             />
//                             <div>
//                                 <SinglePageSelection
//                                     label="Mode Of Payment"
//                                     required
//                                     value={formData.ModeOfPayment ?? ''}
//                                     onChange={(e) => handleFieldChange('ModeOfPayment', String(e))}
//                                     options={PAYMENT_MODE.map((opt) => ({ label: opt.name, value: opt.id }))}
//                                     error={errors.ModeOfPayment}
//                                     placeholder="Select Mode Of Payment"
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* ============================================================= [PAYMENT SCHEDULE TABLE] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <div className="flex items-center justify-between border-b border-gray-300 pb-2">
//                             <div className="flex items-center gap-4">
//                                 <h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>

//                             </div>
//                             {paymentSchedules.length > 0 && (
//                                 <div className="flex items-center gap-4">
//                                     <div className="text-sm">
//                                         <span className="font-semibold text-gray-700">Total: </span>
//                                         <span className={`font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
//                                             {totalPercentage.toFixed(2)}%
//                                         </span>
//                                     </div>
//                                     {totalPercentage !== 100 && (
//                                         <span className="text-xs text-red-600">
//                                             {totalPercentage < 100
//                                                 ? `Missing ${(100 - totalPercentage).toFixed(2)}%`
//                                                 : `Exceeds by ${(totalPercentage - 100).toFixed(2)}%`}
//                                         </span>
//                                     )}
//                                 </div>
//                             )}

//                             <Button
//                                 type="button"
//                                 onClick={() => {
//                                     setPaymentScheduleType('Date');
//                                     setPaymentScheduleDate('');
//                                     setPaymentScheduleStage('');
//                                     setPaymentSchedulePercentage('');
//                                     setEditingPaymentScheduleIndex(null);
//                                     setIsPaymentScheduleModalOpen(true);
//                                 }}
//                                 color="blue"
//                                 size="sm"
//                             >
//                                 <Plus className="h-4 w-4 mr-2" />
//                                 Add Payment Schedule
//                             </Button>
//                         </div>
//                         {paymentSchedules.length > 0 ? (
//                             <DataTable
//                                 data={paymentSchedules}
//                                 columns={paymentScheduleColumns}
//                                 emptyMessage="No payment schedules found. Click 'Add Payment Schedule' to add one."
//                                 fixedHeight={false}
//                                 recordsPerPage={20}
//                                 className="min-w-full"
//                                 aria-label="Payment schedule list"
//                             />
//                         ) :
//                         <div className="flex items-center justify-center">
//                                 <span className="text-gray-500 text-sm font-medium">
//                                     No payment schedules found
//                                 </span>
//                             </div>
//                         }
//                     </div>

//                     {/* ============================================================= [OTHER CHARGES TABLE] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <div className="flex items-center justify-between border-b border-gray-300 pb-2">
//                             <div className="flex items-center gap-4">
//                                 <h3 className="text-lg font-semibold text-gray-900">Other Charges</h3>

//                             </div>
//                             <Button
//                                 type="button"
//                                 onClick={() => {
//                                     setOtherChargeName('');
//                                     setOtherChargeCalculatedOn('');
//                                     setOtherChargeValue('');
//                                     setOtherChargeGSTPercentage('');
//                                     setEditingOtherChargeIndex(null);
//                                     setIsOtherChargesModalOpen(true);
//                                 }}
//                                 color="blue"
//                                 size="sm"
//                             >
//                                 <Plus className="h-4 w-4 mr-2" />
//                                 Add Other Charges
//                             </Button>
//                         </div>
//                         {otherCharges.length > 0 ? (
//                             <DataTable
//                                 data={otherCharges}
//                                 columns={otherChargesColumns}
//                                 emptyMessage="No other charges found. Click 'Add Other Charges' to add one."
//                                 fixedHeight={false}
//                                 recordsPerPage={20}
//                                 className="min-w-full"
//                                 aria-label="Other charges list"
//                             />
//                         ):
//                         <div className="flex items-center justify-center">
//                                 <span className="text-gray-500 text-sm font-medium">
//                                     No other charges found
//                                 </span>
//                             </div>
//                         }
//                     </div>

//                     {/* ============================================================= [PAYMENT DETAILS] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Payment Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             <Input
//                                 label="Booking Amount"
//                                 type="number"
//                                 value={formData.BookingAmount?.toString() ?? ''}
//                                 onChange={(e) => handleFieldChange('BookingAmount', filterNumbersWithDecimal(e.target.value))}
//                                 placeholder="Booking Amount"
//                             />
//                             <Input
//                                 label="Cheque / RTGS No."
//                                 type="text"
//                                 value={formData.ChequeRTGSNumber ?? ''}
//                                 onChange={(e) => handleFieldChange('ChequeRTGSNumber', e.target.value)}
//                                 placeholder="Cheque / RTGS No."
//                             />
//                             <DatePickerInput
//                                 label="Cheque / RTGS Date"
//                                 value={formData.ChequeRTGSDate ? formatDate_dd_mm_yyyy(formData.ChequeRTGSDate) : ''}
//                                 onChange={(value) => handleFieldChange('ChequeRTGSDate', value)}
//                                 placeholder="DD/MM/YYYY"
//                             />
//                             <div>
//                                 <SingleSelectDropdownWithPagination
//                                     label="Bank"
//                                     title="Select Bank"
//                                     size="lg"
//                                     dataFetchCallBack={fetchBankListMasterDropdown}
//                                     onSelected={(item) => {
//                                         if (item) {
//                                             handleFieldChange('BankListMasterId', Number(item.value));
//                                         }
//                                     }}
//                                     initialValue={createDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
//                                     error={errors.BankListMasterId}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* ============================================================= [MANAGEMENT DETAILS] ============================================================================================= */}
//                     <div className="space-y-4 pb-3">
//                         <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Management Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             <div>
//                                 <SingleSelectDropdownWithPagination
//                                     label="Sourcing Manager"
//                                     title="Select Sourcing Manager"
//                                     size="lg"
//                                     dataFetchCallBack={async () => {
//                                         // TODO: Implement fetchEmployeesByDept("Sale") similar to enquiry
//                                         return { totalNumberOfRecord: 0, itemList: [] };
//                                     }}
//                                     onSelected={() => {
//                                         // TODO: Handle sourcing manager selection
//                                     }}
//                                     initialValue={createDropdownInitialValue(0, dropdownLabels.sourcingManager)}
//                                 />
//                             </div>
//                             <div>
//                                 <SingleSelectDropdownWithPagination
//                                     label="Closing Manager"
//                                     title="Select Closing Manager"
//                                     size="lg"
//                                     dataFetchCallBack={async () => {
//                                         // TODO: Implement fetchEmployeesByDept("Sale")
//                                         return { totalNumberOfRecord: 0, itemList: [] };
//                                     }}
//                                     onSelected={() => {
//                                         // TODO: Handle closing manager selection
//                                     }}
//                                     initialValue={createDropdownInitialValue(0, dropdownLabels.closingManager)}
//                                 />
//                             </div>
//                             <DatePickerInput
//                                 label="Client Attended Date"
//                                 value=""
//                                 onChange={() => {
//                                     // TODO: Handle client attended date
//                                 }}
//                                 placeholder="DD/MM/YYYY"
//                             />
//                         </div>
//                     </div>
//                 </form>
//             </div>

//             <BottomActionBar
//                 cancelText="Cancel"
//                 saveText={isAddMode ? 'Add' : 'Update'}
//                 onCancel={() => navigate('/booking')}
//                 canAction={canAction}
//                 onSave={() => {
//                     handleSubmit();
//                 }}
//                 isLoading={isLoading}
//             />

//             {/* ADD EDIT UPDATE BOOKING APPLICANT MODAL */}
//             <Modal
//                 isOpen={isAddUpdateApplicantModalOpen}
//                 onClose={() => {
//                     setIsAddUpdateApplicantModalOpen(false);
//                     setEditingApplicantData(null);
//                     setFormDataForApplicant(initialFormStateApplicantDetails());
//                     setErrorsBookingApplicant({});
//                     setApplicantPhotoFiles([]);
//                     setAadharCardFiles([]);
//                     setPanCardFiles([]);
//                     setPassportFiles([]);
//                     setDrivingLicenseFiles([]);
//                     setVotingIdFiles([]);
//                     setGstFiles([]);
//                     setRemovedApplicantPhotoURLs([]);
//                     setRemovedAadharCardURLs([]);
//                     setRemovedPanCardURLs([]);
//                     setRemovedPassportURLs([]);
//                     setRemovedDrivingLicenseURLs([]);
//                     setRemovedVotingIdURLs([]);
//                     setRemovedGstURLs([]);
//                 }}
//                 onCancel={() => {
//                     setIsAddUpdateApplicantModalOpen(false);
//                     setEditingApplicantData(null);
//                     setFormDataForApplicant(initialFormStateApplicantDetails());
//                     setErrorsBookingApplicant({});
//                     setApplicantPhotoFiles([]);
//                     setAadharCardFiles([]);
//                     setPanCardFiles([]);
//                     setPassportFiles([]);
//                     setDrivingLicenseFiles([]);
//                     setVotingIdFiles([]);
//                     setGstFiles([]);
//                     setRemovedApplicantPhotoURLs([]);
//                     setRemovedAadharCardURLs([]);
//                     setRemovedPanCardURLs([]);
//                     setRemovedPassportURLs([]);
//                     setRemovedDrivingLicenseURLs([]);
//                     setRemovedVotingIdURLs([]);
//                     setRemovedGstURLs([]);
//                 }}
//                 title={editingApplicantData ? 'Update Booking Applicant' : 'Add Booking Applicant'}
//                 onSubmit={handleAddUpdateBookingApplicant}
//                 saveText={editingApplicantData ? 'Update' : 'Add'}
//                 cancelText="Cancel"
//                 loading={isLoading}
//                 size='small50'
//             >
//                 <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
//                         <div>
//                             <SinglePageSelection
//                                 label="Applicant Type"
//                                 placeholder="Select Applicant Type"
//                                 required
//                                 value={formDataForApplicant?.ApplicantType ?? ""}
//                                 onChange={(e) => handleFieldChangeBookingApplicant('ApplicantType', String(e))}
//                                 options={APPLICANT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
//                                 error={errorsBookingApplicant.ApplicantType}
//                             />
//                         </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <Input
//                                 label='Applicant Name'
//                                 required
//                                 error={errorsBookingApplicant.ApplicantName}
//                                 value={formDataForApplicant.ApplicantName ?? ""}
//                                 maxLength={50}
//                                 onChange={e =>
//                                     handleFieldChangeBookingApplicant('ApplicantName', filterLetters(e.target.value))
//                                 }
//                                 placeholder="Enter Applicant Name"
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 label='Mobile Number'
//                                 required
//                                 error={errorsBookingApplicant.ApplicantMobileNumber}
//                                 type="text"
//                                 value={formDataForApplicant.ApplicantMobileNumber ?? ""}
//                                 maxLength={10}
//                                 leftIcon="+91"
//                                 onChange={e =>
//                                     handleFieldChangeBookingApplicant('ApplicantMobileNumber', filterMobile(e.target.value))
//                                 }
//                                 placeholder="Enter Mobile Number"
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 label='Email Id'
//                                 error={errorsBookingApplicant.ApplicantEmailId}
//                                 type="text"
//                                 value={formDataForApplicant.ApplicantEmailId ?? ""}
//                                 onChange={e =>
//                                     handleFieldChangeBookingApplicant('ApplicantEmailId', filterEmail(e.target.value))
//                                 }
//                                 placeholder="Enter Email Id"
//                             />
//                         </div>
//                         <div>
//                             <MultiFilePicker
//                                 label="Photo"
//                                 placeholder="Select Photo"
//                                 required
//                                 error={errorsBookingApplicant.PhotoURL}
//                                 value={applicantPhotoFiles}
//                                 onChange={setApplicantPhotoFiles}
//                                 allowedTypes={['image/jpeg', 'image/png']}
//                                 maxFiles={1}
//                                 maxSizeMB={5}
//                                 onRemoveExisting={(url) => setRemovedApplicantPhotoURLs((prev) => [...prev, url])}
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 label="Aadhaar Number"
//                                 error={errorsBookingApplicant.AadharCardNumber}
//                                 type="text"
//                                 value={formDataForApplicant.AadharCardNumber ?? ''}
//                                 maxLength={12}
//                                 onChange={(e) =>
//                                     handleFieldChangeBookingApplicant('AadharCardNumber', filterAadhaar(e.target.value))
//                                 }
//                                 placeholder="Enter Aadhaar Number"
//                                 rightIcon={<IdCardIcon />}
//                             />
//                         </div>
//                         <div>
//                             <MultiFilePicker
//                                 label="Aadhaar Card"
//                                 placeholder="Select Aadhaar Card"
//                                 error={errorsBookingApplicant.AadharCardURL}
//                                 value={aadharCardFiles}
//                                 onChange={setAadharCardFiles}
//                                 allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
//                                 maxFiles={2}
//                                 maxSizeMB={10}
//                                 onRemoveExisting={(url) =>
//                                     setRemovedAadharCardURLs((prev) => [...prev, url])}
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 label="PAN Number"
//                                 error={errorsBookingApplicant.PanNumber}
//                                 type="text"
//                                 value={formDataForApplicant.PanNumber ?? ''}
//                                 maxLength={10}
//                                 onChange={(e) =>
//                                     handleFieldChangeBookingApplicant('PanNumber', filterPAN(e.target.value).toUpperCase())
//                                 }
//                                 placeholder="Enter PAN Number"
//                                 rightIcon={<IdCardIcon />}
//                             />
//                         </div>
//                         <div>
//                             <MultiFilePicker
//                                 label="PAN Card"
//                                 placeholder="Select PAN Card"
//                                 error={errorsBookingApplicant.PanCardURL}
//                                 value={panCardFiles}
//                                 onChange={setPanCardFiles}
//                                 allowedTypes={['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
//                                 maxFiles={2}
//                                 maxSizeMB={10}
//                                 onRemoveExisting={(url) => setRemovedPanCardURLs((prev) => [...prev, url])}
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 label="Passport Number"
//                                 error={errorsBookingApplicant.PassportNumber}
//                                 type="text"
//                                 value={formDataForApplicant.PassportNumber ?? ''}
//                                 maxLength={8}
//                                 onChange={(e) =>
//                                     handleFieldChangeBookingApplicant('PassportNumber', filterPassportNumber(e.target.value.toUpperCase()))
//                                 }
//                                 placeholder="Enter Passport Number"
//                                 rightIcon={<IdCardIcon />}
//                             />
//                         </div>
//                         <div>
//                             <MultiFilePicker
//                                 label="Passport"
//                                 placeholder="Select Passport"
//                                 error={errorsBookingApplicant.PassportURL}
//                                 value={passportFiles}
//                                 onChange={setPassportFiles}
//                                 allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
//                                 maxFiles={3}
//                                 maxSizeMB={10}
//                                 onRemoveExisting={(url) => setRemovedPassportURLs((prev) => [...prev, url])}
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 label="Driving License Number"
//                                 error={errorsBookingApplicant.DrivingLicenseNumber}
//                                 type="text"
//                                 value={formDataForApplicant.DrivingLicenseNumber ?? ''}
//                                 maxLength={15}
//                                 onChange={(e) =>
//                                     handleFieldChangeBookingApplicant('DrivingLicenseNumber', filterDrivingLicenseNumber(e.target.value.toUpperCase()))
//                                 }
//                                 placeholder="Enter Driving License Number"
//                                 rightIcon={<IdCardIcon />}
//                             />
//                         </div>
//                         <div>
//                             <MultiFilePicker
//                                 label="Driving License"
//                                 placeholder="Select Driving License"
//                                 error={errorsBookingApplicant.DrivingLicenseURL}
//                                 value={drivingLicenseFiles}
//                                 onChange={setDrivingLicenseFiles}
//                                 allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
//                                 maxFiles={3}
//                                 maxSizeMB={10}
//                                 onRemoveExisting={(url) => setRemovedDrivingLicenseURLs((prev) => [...prev, url])}
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 label="Voting ID Number"
//                                 error={errorsBookingApplicant.VotingIdNumber}
//                                 type="text"
//                                 value={formDataForApplicant.VotingIdNumber ?? ''}
//                                 maxLength={10}
//                                 onChange={(e) =>
//                                     handleFieldChangeBookingApplicant('VotingIdNumber', filterVoterId(e.target.value.toUpperCase()))
//                                 }
//                                 placeholder="Enter Voting ID Number"
//                                 rightIcon={<IdCardIcon />}
//                             />
//                         </div>
//                         <div>
//                             <MultiFilePicker
//                                 label="Voting ID"
//                                 placeholder="Select Voting ID"
//                                 error={errorsBookingApplicant.VotingIdURL}
//                                 value={votingIdFiles}
//                                 onChange={setVotingIdFiles}
//                                 allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
//                                 maxFiles={3}
//                                 maxSizeMB={10}
//                                 onRemoveExisting={(url) => setRemovedVotingIdURLs((prev) => [...prev, url])}
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 label="GST Number"
//                                 error={errorsBookingApplicant.GSTNumber}
//                                 type="text"
//                                 value={formDataForApplicant.GSTNumber ?? ''}
//                                 maxLength={15}
//                                 onChange={(e) =>
//                                     handleFieldChangeBookingApplicant('GSTNumber', filterGST(e.target.value.toUpperCase()))
//                                 }
//                                 placeholder="Enter GST Number"
//                                 rightIcon={<IdCardIcon />}
//                             />
//                         </div>
//                         <div>
//                             <MultiFilePicker
//                                 label="GST Documents"
//                                 placeholder="Select GST Documents"
//                                 error={errorsBookingApplicant.GSTNumberURL}
//                                 value={gstFiles}
//                                 onChange={setGstFiles}
//                                 allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
//                                 maxFiles={5}
//                                 maxSizeMB={10}
//                                 onRemoveExisting={(url) => setRemovedGstURLs((prev) => [...prev, url])}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </Modal>

//             <DeleteDialog
//                 isOpen={isConfirmationDialogBoxOpen}
//                 onClose={() => {
//                     setIsConfirmationDialogBoxOpen(false);
//                     setDeleteBookingApplicantData(null);
//                 }}
//                 onConfirm={handleDeleteApplicant}
//                 loading={isLoading}
//                 pageName='applicant'
//             />

//             {/* ADD PAYMENT SCHEDULE MODAL */}
//             <Modal
//                 isOpen={isPaymentScheduleModalOpen}
//                 onClose={() => {
//                     setIsPaymentScheduleModalOpen(false);
//                     setPaymentScheduleType('Date');
//                     setPaymentScheduleDate('');
//                     setPaymentScheduleStage('');
//                     setPaymentSchedulePercentage('');
//                     setEditingPaymentScheduleIndex(null);
//                 }}

//                 title="Add Payment Schedule"
//                 onSubmit={() => {
//                     if (!paymentSchedulePercentage || Number(paymentSchedulePercentage) <= 0) {
//                         addToast({ type: 'error', title: 'Please enter a valid percentage' });
//                         return;
//                     }

//                     if (paymentScheduleType === 'Date' && !paymentScheduleDate) {
//                         addToast({ type: 'error', title: 'Please select a date' });
//                         return;
//                     }

//                     if (paymentScheduleType === 'Stage' && !paymentScheduleStage) {
//                         addToast({ type: 'error', title: 'Please select a stage' });
//                         return;
//                     }

//                     const agreementValue = formData.AgreementValue || 0;
//                     const percentage = Number(paymentSchedulePercentage);

//                     // Calculate new total percentage
//                     const currentTotal = paymentSchedules.reduce((sum, s, idx) => {
//                         if (editingPaymentScheduleIndex !== null && idx === editingPaymentScheduleIndex) {
//                             return sum; // Exclude the one being edited
//                         }
//                         return sum + (s.PaymentSchedulePercentage || 0);
//                     }, 0);

//                     const newTotal = currentTotal + percentage;

//                     if (newTotal > 100) {
//                         addToast({ type: 'error', title: `Total percentage cannot exceed 100%. Current total would be ${newTotal.toFixed(2)}%` });
//                         return;
//                     }

//                     const amount = (agreementValue * percentage) / 100;

//                     const newSchedule: BookingPaymentScheduleData = {
//                         BookingPaymentScheduleId: editingPaymentScheduleIndex !== null ? paymentSchedules[editingPaymentScheduleIndex]?.BookingPaymentScheduleId ?? null : null,
//                         Type: paymentScheduleType,
//                         Name: paymentScheduleType === 'Stage' ? paymentScheduleStage : null,
//                         Date: paymentScheduleType === 'Date' && paymentScheduleDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(paymentScheduleDate) : null,
//                         PaymentSchedulePercentage: percentage,
//                         PaymentScheduleAmount: amount,
//                         PaymentScheduleGSTAmount: 0,
//                         PaymentScheduleTDSAmount: 0,
//                         CreatedById: null,
//                         CreatedBy: null,
//                         CreatedDate: null,
//                         ModifiedById: null,
//                         ModifiedBy: null,
//                         ModifiedDate: null,
//                     };

//                     if (editingPaymentScheduleIndex !== null) {
//                         setPaymentSchedules(prev => {
//                             const updated = [...prev];
//                             updated[editingPaymentScheduleIndex] = newSchedule;
//                             return updated;
//                         });
//                     } else {
//                         setPaymentSchedules(prev => [...prev, newSchedule]);
//                     }

//                     setIsPaymentScheduleModalOpen(false);
//                     setPaymentScheduleType('Date');
//                     setPaymentScheduleDate('');
//                     setPaymentScheduleStage('');
//                     setPaymentSchedulePercentage('');
//                     setEditingPaymentScheduleIndex(null);
//                     addToast({ type: 'success', title: 'Payment schedule added successfully' });
//                 }}
//                 saveText="Add"
//                 loading={isLoading}
//                 size='md'
//             >
//                 <div className="space-y-6">
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Schedule Type</label>
//                         <div className="flex gap-4">
//                             <RadioPill
//                                 label="Date"
//                                 checked={paymentScheduleType === 'Date'}
//                                 onChange={() => {
//                                     setPaymentScheduleType('Date');
//                                     setPaymentScheduleStage('');
//                                 }}
//                                 name="paymentScheduleType"
//                                 value="Date"
//                             />
//                             <RadioPill
//                                 label="Stage"
//                                 checked={paymentScheduleType === 'Stage'}
//                                 onChange={() => {
//                                     setPaymentScheduleType('Stage');
//                                     setPaymentScheduleDate('');
//                                 }}
//                                 name="paymentScheduleType"
//                                 value="Stage"
//                             />
//                         </div>
//                     </div>

//                     {paymentScheduleType === 'Date' && (
//                         <div>
//                             <DatePickerInput
//                                 label="Date"
//                                 value={paymentScheduleDate}
//                                 onChange={(value) => setPaymentScheduleDate(value || '')}
//                                 placeholder="DD-MM-YYYY"
//                                 required
//                             />
//                         </div>
//                     )}

//                     {paymentScheduleType === 'Stage' && (
//                         <div>
//                             <SinglePageSelection
//                                 label="Stage"
//                                 placeholder="Select Stage"
//                                 required
//                                 value={paymentScheduleStage}
//                                 onChange={(e) => setPaymentScheduleStage(String(e))}
//                                 options={paymentScheduleStages.map(stage => ({
//                                     label: stage.Stages || '',
//                                     value: stage.Stages || ''
//                                 }))}
//                             />
//                         </div>
//                     )}

//                     <div>
//                         <Input
//                             label="Percentage"
//                             type="number"
//                             value={paymentSchedulePercentage}
//                             onChange={(e) => setPaymentSchedulePercentage(filterNumbersWithDecimal(e.target.value))}
//                             placeholder="Enter Percentage"
//                             required
//                         />
//                     </div>
//                 </div>
//             </Modal>

//             {/* ADD OTHER CHARGES MODAL */}
//             <Modal
//                 isOpen={isOtherChargesModalOpen}
//                 onClose={() => {
//                     setIsOtherChargesModalOpen(false);
//                     setOtherChargeName('');
//                     setOtherChargeCalculatedOn('');
//                     setOtherChargeValue('');
//                     setOtherChargeGSTPercentage('');
//                     setEditingOtherChargeIndex(null);
//                 }}
//                 title="Add Other Charges"
//                 onSubmit={() => {
//                     if (!otherChargeName || !otherChargeName.trim()) {
//                         addToast({ type: 'error', title: 'Please enter a charge name' });
//                         return;
//                     }

//                     if (!otherChargeValue || Number(otherChargeValue) <= 0) {
//                         addToast({ type: 'error', title: 'Please enter a valid value' });
//                         return;
//                     }

//                     if (!otherChargeGSTPercentage || Number(otherChargeGSTPercentage) < 0) {
//                         addToast({ type: 'error', title: 'Please enter a valid GST percentage' });
//                         return;
//                     }

//                     const value = Number(otherChargeValue);
//                     const gstPercentage = Number(otherChargeGSTPercentage);
//                     const gstValue = (value * gstPercentage) / 100;

//                     const newCharge: BookingOtherChargesData = {
//                         BookingOtherChargesId: editingOtherChargeIndex !== null ? otherCharges[editingOtherChargeIndex]?.BookingOtherChargesId ?? null : null,
//                         Uniquekey: editingOtherChargeIndex !== null ? otherCharges[editingOtherChargeIndex]?.Uniquekey ?? null : null,
//                         ChargeName: otherChargeName.trim(),
//                         CalculatedOn: otherChargeCalculatedOn || null,
//                         Value: value,
//                         GSTPercentage: gstPercentage,
//                         GSTValue: gstValue,
//                         CreatedById: null,
//                         CreatedBy: null,
//                         CreatedDate: null,
//                         ModifiedById: null,
//                         ModifiedBy: null,
//                         ModifiedDate: null,
//                     };

//                     if (editingOtherChargeIndex !== null) {
//                         setOtherCharges(prev => {
//                             const updated = [...prev];
//                             updated[editingOtherChargeIndex] = newCharge;
//                             return updated;
//                         });
//                     } else {
//                         setOtherCharges(prev => [...prev, newCharge]);
//                     }

//                     setIsOtherChargesModalOpen(false);
//                     setOtherChargeName('');
//                     setOtherChargeCalculatedOn('');
//                     setOtherChargeValue('');
//                     setOtherChargeGSTPercentage('');
//                     setEditingOtherChargeIndex(null);
//                     addToast({ type: 'success', title: 'Other charge added successfully' });
//                 }}
//                 saveText="Add"
//                 loading={isLoading}
//                 size='md'
//             >
//                 <div className="space-y-6">
//                     <div>
//                         <Input
//                             label="Name"
//                             type="text"
//                             value={otherChargeName}
//                             onChange={(e) => setOtherChargeName(e.target.value)}
//                             placeholder="Enter Charge Name"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <SinglePageSelection
//                             label="Sq. ft / Lumpsum"
//                             placeholder="Select"
//                             value={otherChargeCalculatedOn}
//                             onChange={(e) => setOtherChargeCalculatedOn(String(e))}
//                             options={UNIT_SQFT_LUMPSUM.map((opt) => ({ label: opt.name, value: opt.id }))}
//                         />
//                     </div>

//                     <div>
//                         <Input
//                             label="Value (in ₹)"
//                             type="number"
//                             value={otherChargeValue}
//                             onChange={(e) => setOtherChargeValue(filterNumbersWithDecimal(e.target.value))}
//                             placeholder="Enter Value"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <Input
//                             label="GST"
//                             type="number"
//                             value={otherChargeGSTPercentage}
//                             onChange={(e) => {
//                                 const gstValue = filterNumbersWithDecimal(e.target.value);
//                                 setOtherChargeGSTPercentage(gstValue);
//                             }}
//                             placeholder="Enter GST Percentage"
//                             required
//                         />
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     );
//     //#endregion
// };

// export default AddUpdateBooking;

import React from "react";

const AddUpdateBooking: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Add / Update Booking
            </h2>

            <p className="text-sm text-gray-600">
                Booking form content will go here.
            </p>
        </div>
    );
};

export default AddUpdateBooking;


