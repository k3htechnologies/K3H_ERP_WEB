import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProposedOfferExtraCarpetAreaData,
  FilterWithPaginationProposedOfferExtraCarpetAreaRequest,
  AddUpdateProposedOfferExtraCarpetAreaRequest,
  ProposedOfferCorpusDetailsData,
  FilterWithPaginationProposedOfferCorpusDetailsRequest,
  AddUpdateProposedOfferCorpusDetailsRequest,
  ProposedOfferCorpusDetailsWithPaymentStageData,
  ProposedOfferSecurityDepositDetailsData,
  FilterWithPaginationProposedOfferSecurityDepositDetailsRequest,
  AddUpdateProposedOfferSecurityDepositDetailsRequest,
  ProposedOfferSecurityDepositDetailsWithPaymentStageData,
  ProposedOfferShiftingDetailsData,
  FilterWithPaginationProposedOfferShiftingDetailsRequest,
  AddUpdateProposedOfferShiftingDetailsRequest,
  ProposedOfferShiftingDetailsWithPaymentStageData,
  ProposedOfferLienToSocietyDetailsData,
  FilterWithPaginationProposedOfferLienToSocietyDetailsRequest,
  AddUpdateProposedOfferLienToSocietyDetailsRequest,
  ProposedOfferLienToSocietyDetailsWithPaymentStageData,
  ProposedOfferParkingAllotmentData,
  FilterWithPaginationProposedOfferParkingAllotmentRequest,
  AddUpdateProposedOfferParkingAllotmentRequest,
  ProposedOfferGSTonExistingPlusFreeAreaData,
  FilterWithPaginationProposedOfferGSTonExistingPlusFreeAreaRequest,
  AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest,
  ProposedOfferProjectCompletionData,
  FilterWithPaginationProposedOfferProjectCompletionRequest,
  AddUpdateProposedOfferProjectCompletionRequest,
  ProposedOfferRentDetailsData,
  FilterWithPaginationProposedOfferRentDetailsRequest,
  AddUpdateProposedOfferRentDetailsRequest,
  DeleteProposedOfferRentDetailsRequest,
  ProposedOfferProposedPlanData,
  FilterWithPaginationProposedOfferProposedPlanRequest,
  AddUpdateProposedOfferProposedPlanRequest
} from '@/features/proposedOffer/models/ProposedOfferModel';

import { ProposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Loader } from '@/core/utils/loader';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { Tabs } from '@/ui/components/Tab/Tab';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { filterNumbersWithDecimal, filterNumbers, isValidPercentage, calculatePercentageAmount } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Edit, Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Checkbox } from '@/ui/components/forms/Checkbox';
import { CARPET_AREA_TYPE, FLAT_UNIT_TYPE, TENURE, UNIT_SQFT_LUMPSUM } from '@/core/constants';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchBuildingDropdown } from '@/features/building/buildingDropdown';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import DatePickerInput from '@/ui/components/forms/Datepicker';

//#region INITIAL FORM STATE - EXTRA CARPET AREA
const initialFormStateExtraCarpetArea = (): AddUpdateProposedOfferExtraCarpetAreaRequest => ({
  ProposedOfferExtraCarpetAreaId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  ExtraCarpetAreaOfferedType: '',
  ResidentialExtraCarpetPercent: 0,
  CommercialExtraCarpetPercent: 0
});
//#endregion

//#region INITIAL FORM STATE - CORPUS DETAILS
const initialFormStateCorpusDetails = (): AddUpdateProposedOfferCorpusDetailsRequest => ({
  ProposedOfferCorpusDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  CorpusOfferedToResidentialAmount: 0,
  CorpusOfferedToCommercialAmount: 0,
  CorpusDetailsWithPaymentStageJSON: ''
});
//#endregion

//#region INITIAL FORM STATE - CORPUS PAYMENT STAGE

const initialFormStateCorpusPaymentStage = (): ProposedOfferCorpusDetailsWithPaymentStageData => ({
  ProposedOfferCorpusDetailsWithPaymentStageId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  Type: '',
  Stage: '',
  StagePercentage: 0,
  StagePercentageText: '',
  Amount: 0,
  CreatedById: 0,
  CreatedBy: '',
  CreatedDate: null,
  ModifiedById: 0,
  ModifiedBy: '',
  ModifiedDate: null,
  LastModifiedBy: '',
  LastModifiedDate: null

});
//#endregion

//#region INITIAL FORM STATE - SECURITY DEPOSIT DETAILS
const initialFormStateSecurityDepositDetails = (): AddUpdateProposedOfferSecurityDepositDetailsRequest => ({
  ProposedOfferSecurityDepositDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  SecurityDepositToSocietyAmount: 0,
  SecurityDepositToSocietyWithPaymentStageJSON: ''
});
//#endregion

//#region INITIAL FORM STATE - SECURITY DEPOSIT PAYMENT STAGE
const initialFormStateSecurityDepositPaymentStage = (): ProposedOfferSecurityDepositDetailsWithPaymentStageData => ({
  ProposedOfferSecurityDepositDetailsWithPaymentStageId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  Type: '',
  Stage: '',
  Amount: 0,
  CreatedById: 0,
  CreatedBy: '',
  CreatedDate: null,
  ModifiedById: 0,
  ModifiedBy: '',
  ModifiedDate: null,
  LastModifiedBy: '',
  LastModifiedDate: null
});
//#endregion

//#region INITIAL FORM STATE - SHIFTING DETAILS
const initialFormStateShiftingDetails = (): AddUpdateProposedOfferShiftingDetailsRequest => ({
  ProposedOfferShiftingDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  ShiftingOfferedToResidentialAmount: 0,
  ShiftingOfferedToCommercialAmount: 0,
  ShiftingDetailsWithPaymentStageJSON: ''
});
//#endregion

//#region INITIAL FORM STATE - SHIFTING PAYMENT STAGE
const initialFormStateShiftingPaymentStage = (): ProposedOfferShiftingDetailsWithPaymentStageData => ({
  ProposedOfferShiftingDetailsWithPaymentStageId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  Type: '',
  Stage: '',
  StagePercentage: 0,
  StagePercentageText: '',
  Amount: 0,
  CreatedById: 0,
  CreatedBy: '',
  CreatedDate: null,
  ModifiedById: 0,
  ModifiedBy: '',
  ModifiedDate: null,
  LastModifiedBy: '',
  LastModifiedDate: null
});
//#endregion

//#region INITIAL FORM STATE - LIEN TO SOCIETY DETAILS
const initialFormStateLienToSocietyDetails = (): AddUpdateProposedOfferLienToSocietyDetailsRequest => ({
  ProposedOfferLienToSocietyDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  ResidentialAreaSqFt: 0,
  CommercialAreaSqFt: 0,
  NumberOfResidentialLienUnits: 0,
  NumberOfCommercialLienUnits: 0,
  LienToSocietyWithPaymentStageJSON: ''
});
//#endregion

//#region INITIAL FORM STATE - LIEN TO SOCIETY PAYMENT STAGE
const initialFormStateLienToSocietyPaymentStage = (): ProposedOfferLienToSocietyDetailsWithPaymentStageData => ({
  ProposedOfferLienToSocietyDetailsWithPaymentStageId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  Type: '',
  Stage: '',
  CarpetAreaSqFt: 0,
  IsRelease: false,
  CreatedById: 0,
  CreatedBy: '',
  CreatedDate: null,
  ModifiedById: 0,
  ModifiedBy: '',
  ModifiedDate: null,
  LastModifiedBy: '',
  LastModifiedDate: null
});
//#endregion

//#region INITIAL FORM STATE - PARKING ALLOTMENT
const initialFormStateParkingAllotment = (): AddUpdateProposedOfferParkingAllotmentRequest => ({
  ProposedOfferParkingAllotmentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  NumberOfParkingAllottedToMembers: 0,
  TotalParkingPercentageAllottedToSociety: 0
});
//#endregion

//#region INITIAL FORM STATE - GST ON EXISTING PLUS FREE AREA
const initialFormStateGSTonExistingPlusFreeArea = (): AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest => ({
  ProposedOfferGSTonExistingPlusFreeAreaId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  GSTOnAreaByMemberPercent: 0,
  GSTOnAreaByDeveloperPercent: 0
});
//#endregion

//#region INITIAL FORM STATE - PROJECT COMPLETION
const initialFormStateProjectCompletion = (): AddUpdateProposedOfferProjectCompletionRequest => ({
  ProposedOfferProjectCompletionId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  CompletionTimelineMonths: 0,
  GracePeriodMonths: 0
});
//#endregion

//#region INITIAL FORM STATE - PROPOSED PLAN
const initialFormStateProposedPlan = (): AddUpdateProposedOfferProposedPlanRequest => ({
  ProposedOfferProposedPlanId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  TotalNumberOfFloors: 0,
  TotalUnits: 0,
  PlanDocumentURL: null,
  RemovePlanDocumentURL: '',
  TotalParking: 0,
  Amenities: ''
});
//#endregion

//#region INITIAL FORM STATE - RENT DETAILS
const initialFormStateRentDetails = (): AddUpdateProposedOfferRentDetailsRequest => ({
  ProposedOfferRentDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  IsAdditionalRent: false,
  Type: '',
  Tenure: '',
  Amount: 0,
  UnitSqFtLumsum: '',
  CarpetAreaSqFt: 0,
  RentStartDate: '',
  RentEndDate: '',
  IsPayBrokerage: false
});
//#endregion

export const ProposedOffer: React.FC = () => {

  const [buildingId, setBuildingId] = useState(0);

  const [buildingName, setBuildingName] = useState('');
  //#region STATE
  const [, setExtraCarpetAreaData] = useState<ProposedOfferExtraCarpetAreaData | null>(null);
  const [, setCorpusDetailsData] = useState<ProposedOfferCorpusDetailsData | null>(null);
  const [, setSecurityDepositDetailsData] = useState<ProposedOfferSecurityDepositDetailsData | null>(null);
  const [, setShiftingDetailsData] = useState<ProposedOfferShiftingDetailsData | null>(null);
  const [, setLienToSocietyDetailsData] = useState<ProposedOfferLienToSocietyDetailsData | null>(null);
  const [, setParkingAllotmentData] = useState<ProposedOfferParkingAllotmentData | null>(null);
  const [, setGSTonExistingPlusFreeAreaData] = useState<ProposedOfferGSTonExistingPlusFreeAreaData | null>(null);
  const [, setProjectCompletionData] = useState<ProposedOfferProjectCompletionData | null>(null);
  const [, setProposedPlanData] = useState<ProposedOfferProposedPlanData | null>(null);
  const [rentDetailsList, setRentDetailsList] = useState<ProposedOfferRentDetailsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [errorsCorpusDetails, setErrorsCorpusDetails] = useState<{ [k: string]: string }>({});
  const [errorsCorpusPaymentStage, setErrorsCorpusPaymentStage] = useState<{ [k: string]: string }>({});
  const [errorsSecurityDepositDetails, setErrorsSecurityDepositDetails] = useState<{ [k: string]: string }>({});
  const [errorsSecurityDepositPaymentStage, setErrorsSecurityDepositPaymentStage] = useState<{ [k: string]: string }>({});
  const [errorsShiftingDetails, setErrorsShiftingDetails] = useState<{ [k: string]: string }>({});
  const [errorsShiftingPaymentStage, setErrorsShiftingPaymentStage] = useState<{ [k: string]: string }>({});
  const [errorsLienToSocietyDetails, setErrorsLienToSocietyDetails] = useState<{ [k: string]: string }>({});
  const [errorsLienToSocietyPaymentStage, setErrorsLienToSocietyPaymentStage] = useState<{ [k: string]: string }>({});
  const [errorsParkingAllotment, setErrorsParkingAllotment] = useState<{ [k: string]: string }>({});
  const [errorsGSTonExistingPlusFreeArea, setErrorsGSTonExistingPlusFreeArea] = useState<{ [k: string]: string }>({});
  const [errorsProjectCompletion, setErrorsProjectCompletion] = useState<{ [k: string]: string }>({});
  const [errorsProposedPlan, setErrorsProposedPlan] = useState<{ [k: string]: string }>({});
  const [errorsRentDetails, setErrorsRentDetails] = useState<{ [k: string]: string }>({});

  // ADD UPDATE EXTRA CARPET AREA
  const [formDataExtraCarpetArea, setFormDataExtraCarpetArea] = useState<AddUpdateProposedOfferExtraCarpetAreaRequest>(() => initialFormStateExtraCarpetArea());

  // ADD UPDATE CORPUS DETAILS
  const [formDataCorpusDetails, setFormDataCorpusDetails] = useState<AddUpdateProposedOfferCorpusDetailsRequest>(() => initialFormStateCorpusDetails());

  // CORPUS PAYMENT STAGE LIST
  const [corpusPaymentStageList, setCorpusPaymentStageList] = useState<ProposedOfferCorpusDetailsWithPaymentStageData[]>([]);

  // EDIT CORPUS PAYMENT STAGE
  const [editingCorpusPaymentStageData, setEditingCorpusPaymentStageData] = useState<{ row: ProposedOfferCorpusDetailsWithPaymentStageData; index: number } | null>(null);
  const [isAddUpdateCorpusPaymentStageModalOpen, setIsAddUpdateCorpusPaymentStageModalOpen] = useState(false);
  const [formDataCorpusPaymentStage, setFormDataCorpusPaymentStage] = useState<ProposedOfferCorpusDetailsWithPaymentStageData>(() => initialFormStateCorpusPaymentStage());

  //DELETE CORPUS PAYMENT STAGE STATES
  const [isConfirmationDialogBoxOpenCorpusPaymentStage, setIsConfirmationDialogBoxOpenCorpusPaymentStage] = useState(false);
  const [deleteCorpusPaymentStageData, setDeleteCorpusPaymentStageData] = useState<{ row: ProposedOfferCorpusDetailsWithPaymentStageData; index: number } | null>(null);

  // ADD UPDATE SECURITY DEPOSIT DETAILS
  const [formDataSecurityDepositDetails, setFormDataSecurityDepositDetails] = useState<AddUpdateProposedOfferSecurityDepositDetailsRequest>(() => initialFormStateSecurityDepositDetails());

  // SECURITY DEPOSIT PAYMENT STAGE LIST
  const [securityDepositPaymentStageList, setSecurityDepositPaymentStageList] = useState<ProposedOfferSecurityDepositDetailsWithPaymentStageData[]>([]);

  // EDIT SECURITY DEPOSIT PAYMENT STAGE
  const [editingSecurityDepositPaymentStageData, setEditingSecurityDepositPaymentStageData] = useState<{ row: ProposedOfferSecurityDepositDetailsWithPaymentStageData; index: number } | null>(null);
  const [isAddUpdateSecurityDepositPaymentStageModalOpen, setIsAddUpdateSecurityDepositPaymentStageModalOpen] = useState(false);
  const [formDataSecurityDepositPaymentStage, setFormDataSecurityDepositPaymentStage] = useState<ProposedOfferSecurityDepositDetailsWithPaymentStageData>(() => initialFormStateSecurityDepositPaymentStage());

  //DELETE SECURITY DEPOSIT PAYMENT STAGE STATES
  const [isConfirmationDialogBoxOpenSecurityDepositPaymentStage, setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage] = useState(false);
  const [deleteSecurityDepositPaymentStageData, setDeleteSecurityDepositPaymentStageData] = useState<{ row: ProposedOfferSecurityDepositDetailsWithPaymentStageData; index: number } | null>(null);

  // ADD UPDATE SHIFTING DETAILS
  const [formDataShiftingDetails, setFormDataShiftingDetails] = useState<AddUpdateProposedOfferShiftingDetailsRequest>(() => initialFormStateShiftingDetails());

  // SHIFTING PAYMENT STAGE LIST
  const [shiftingPaymentStageList, setShiftingPaymentStageList] = useState<ProposedOfferShiftingDetailsWithPaymentStageData[]>([]);

  // EDIT SHIFTING PAYMENT STAGE
  const [editingShiftingPaymentStageData, setEditingShiftingPaymentStageData] = useState<{ row: ProposedOfferShiftingDetailsWithPaymentStageData; index: number } | null>(null);
  const [isAddUpdateShiftingPaymentStageModalOpen, setIsAddUpdateShiftingPaymentStageModalOpen] = useState(false);
  const [formDataShiftingPaymentStage, setFormDataShiftingPaymentStage] = useState<ProposedOfferShiftingDetailsWithPaymentStageData>(() => initialFormStateShiftingPaymentStage());

  //DELETE SHIFTING PAYMENT STAGE STATES
  const [isConfirmationDialogBoxOpenShiftingPaymentStage, setIsConfirmationDialogBoxOpenShiftingPaymentStage] = useState(false);
  const [deleteShiftingPaymentStageData, setDeleteShiftingPaymentStageData] = useState<{ row: ProposedOfferShiftingDetailsWithPaymentStageData; index: number } | null>(null);

  // ADD UPDATE LIEN TO SOCIETY DETAILS
  const [formDataLienToSocietyDetails, setFormDataLienToSocietyDetails] = useState<AddUpdateProposedOfferLienToSocietyDetailsRequest>(() => initialFormStateLienToSocietyDetails());

  // ADD UPDATE PARKING ALLOTMENT
  const [formDataParkingAllotment, setFormDataParkingAllotment] = useState<AddUpdateProposedOfferParkingAllotmentRequest>(() => initialFormStateParkingAllotment());

  // ADD UPDATE GST ON EXISTING PLUS FREE AREA
  const [formDataGSTonExistingPlusFreeArea, setFormDataGSTonExistingPlusFreeArea] = useState<AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest>(() => initialFormStateGSTonExistingPlusFreeArea());

  // ADD UPDATE PROJECT COMPLETION
  const [formDataProjectCompletion, setFormDataProjectCompletion] = useState<AddUpdateProposedOfferProjectCompletionRequest>(() => initialFormStateProjectCompletion());

  // ADD UPDATE PROPOSED PLAN
  const [formDataProposedPlan, setFormDataProposedPlan] = useState<AddUpdateProposedOfferProposedPlanRequest>(() => initialFormStateProposedPlan());

  // ADD UPDATE RENT DETAILS
  const [editingRentDetailsData, setEditingRentDetailsData] = useState<ProposedOfferRentDetailsData | null>(null);
  const [isAddUpdateRentDetailsModalOpen, setIsAddUpdateRentDetailsModalOpen] = useState(false);
  const [formDataRentDetails, setFormDataRentDetails] = useState<AddUpdateProposedOfferRentDetailsRequest>(() => initialFormStateRentDetails());

  //DELETE RENT DETAILS STATES
  const [isConfirmationDialogBoxOpenRentDetails, setIsConfirmationDialogBoxOpenRentDetails] = useState(false);
  const [deleteRentDetailsData, setDeleteRentDetailsData] = useState<ProposedOfferRentDetailsData | null>(null);

  // LIEN TO SOCIETY PAYMENT STAGE LIST
  const [lienToSocietyPaymentStageList, setLienToSocietyPaymentStageList] = useState<ProposedOfferLienToSocietyDetailsWithPaymentStageData[]>([]);

  // EDIT LIEN TO SOCIETY PAYMENT STAGE
  const [editingLienToSocietyPaymentStageData, setEditingLienToSocietyPaymentStageData] = useState<{ row: ProposedOfferLienToSocietyDetailsWithPaymentStageData; index: number } | null>(null);
  const [isAddUpdateLienToSocietyPaymentStageModalOpen, setIsAddUpdateLienToSocietyPaymentStageModalOpen] = useState(false);
  const [formDataLienToSocietyPaymentStage, setFormDataLienToSocietyPaymentStage] = useState<ProposedOfferLienToSocietyDetailsWithPaymentStageData>(() => initialFormStateLienToSocietyPaymentStage());

  //DELETE LIEN TO SOCIETY PAYMENT STAGE STATES
  const [isConfirmationDialogBoxOpenLienToSocietyPaymentStage, setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage] = useState(false);
  const [deleteLienToSocietyPaymentStageData, setDeleteLienToSocietyPaymentStageData] = useState<{ row: ProposedOfferLienToSocietyDetailsWithPaymentStageData; index: number } | null>(null);


  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions();
  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject();
  //#endregion

  //#region TAB ACTIVITY
  const proposedOfferTabList = [
    { id: "ExtraCarpetArea", label: "Extra Carpet Area" },
    { id: "CorpusDetails", label: "Corpus Details" },
    { id: "SecurityDeposit", label: "Security Deposit" },
    { id: "ShiftingDetails", label: "Shifting Details" },
    { id: "LienToSocietyDetails", label: "Lien to Society Details" },
    { id: "ParkingAllotment", label: "Parking Allotment" },
    { id: "GSTonExistingPlusFreeArea", label: "GST on Existing + Free Area" },
    { id: "ProjectCompletion", label: "Project Completion" },
    { id: "RentDetails", label: "Rent Details" },
    { id: "ProposedPlan", label: "Proposed Plan" },
  ];

  const [activeTab, setActiveTab] = useState<string>(proposedOfferTabList[0].id);
  //#endregion

  //#region INIT

  useEffect(() => {
    if (!projectId || !buildingId) return;

    if (activeTab === 'ExtraCarpetArea') {
      fetchExtraCarpetAreaData();
    } else if (activeTab === 'CorpusDetails') {
      fetchCorpusDetailsData();
    } else if (activeTab === 'SecurityDeposit') {
      fetchSecurityDepositDetailsData();
    } else if (activeTab === 'ShiftingDetails') {
      fetchShiftingDetailsData();
    } else if (activeTab === 'LienToSocietyDetails') {
      fetchLienToSocietyDetailsData();
    } else if (activeTab === 'ParkingAllotment') {
      fetchParkingAllotmentData();
    } else if (activeTab === 'GSTonExistingPlusFreeArea') {
      fetchGSTonExistingPlusFreeAreaData();
    } else if (activeTab === 'ProjectCompletion') {
      fetchProjectCompletionData();
    } else if (activeTab === 'ProposedPlan') {
      fetchProposedPlanData();
    } else if (activeTab === 'RentDetails') {
      fetchRentDetailsData();
    }
  }, [activeTab, projectId, buildingId]);

  const selectedBuilding = useMemo(() => {
    if (!projectId || !buildingId) return null;
    return { label: buildingName, value: buildingId };
  }, [buildingId, buildingName]);

  const fetchBuildingCallback = useCallback(
    (pageNumber: number) =>
      fetchBuildingDropdown(pageNumber, { projectId: Number(projectId) }),
    [projectId]
  );

  useEffect(() => {
    // project changed → reset building
    setBuildingId(0);
    setBuildingName('');
  }, [projectId]);


  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - EXTRA CARPET AREA
  const handleFieldChangeExtraCarpetArea = (field: keyof AddUpdateProposedOfferExtraCarpetAreaRequest, value: any) => {
    setFormDataExtraCarpetArea((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - CORPUS DETAILS
  const handleFieldChangeCorpusDetails = (field: keyof AddUpdateProposedOfferCorpusDetailsRequest, value: any) => {
    setFormDataCorpusDetails((prev) => ({ ...prev, [field]: value }));

    if (errorsCorpusDetails[field]) {
      setErrorsCorpusDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - CORPUS PAYMENT STAGE
  const handleFieldChangeCorpusPaymentStage = (field: keyof ProposedOfferCorpusDetailsWithPaymentStageData, value: any) => {
    setFormDataCorpusPaymentStage((prev) => ({ ...prev, [field]: value }));

    if (errorsCorpusPaymentStage[field]) {
      setErrorsCorpusPaymentStage((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - SECURITY DEPOSIT DETAILS
  const handleFieldChangeSecurityDepositDetails = (field: keyof AddUpdateProposedOfferSecurityDepositDetailsRequest, value: any) => {
    setFormDataSecurityDepositDetails((prev) => ({ ...prev, [field]: value }));

    if (errorsSecurityDepositDetails[field]) {
      setErrorsSecurityDepositDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - SECURITY DEPOSIT PAYMENT STAGE
  const handleFieldChangeSecurityDepositPaymentStage = (field: keyof ProposedOfferSecurityDepositDetailsWithPaymentStageData, value: any) => {
    setFormDataSecurityDepositPaymentStage((prev) => ({ ...prev, [field]: value }));

    if (errorsSecurityDepositPaymentStage[field]) {
      setErrorsSecurityDepositPaymentStage((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - SHIFTING DETAILS
  const handleFieldChangeShiftingDetails = (field: keyof AddUpdateProposedOfferShiftingDetailsRequest, value: any) => {
    setFormDataShiftingDetails((prev) => ({ ...prev, [field]: value }));

    if (errorsShiftingDetails[field]) {
      setErrorsShiftingDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - SHIFTING PAYMENT STAGE
  const handleFieldChangeShiftingPaymentStage = (field: keyof ProposedOfferShiftingDetailsWithPaymentStageData, value: any) => {
    setFormDataShiftingPaymentStage((prev) => ({ ...prev, [field]: value }));

    if (errorsShiftingPaymentStage[field]) {
      setErrorsShiftingPaymentStage((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - LIEN TO SOCIETY DETAILS
  const handleFieldChangeLienToSocietyDetails = (field: keyof AddUpdateProposedOfferLienToSocietyDetailsRequest, value: any) => {
    setFormDataLienToSocietyDetails((prev) => ({ ...prev, [field]: value }));

    if (errorsLienToSocietyDetails[field]) {
      setErrorsLienToSocietyDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - LIEN TO SOCIETY PAYMENT STAGE
  const handleFieldChangeLienToSocietyPaymentStage = (field: keyof ProposedOfferLienToSocietyDetailsWithPaymentStageData, value: any) => {
    setFormDataLienToSocietyPaymentStage((prev) => ({ ...prev, [field]: value }));

    if (errorsLienToSocietyPaymentStage[field]) {
      setErrorsLienToSocietyPaymentStage((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - PARKING ALLOTMENT
  const handleFieldChangeParkingAllotment = (field: keyof AddUpdateProposedOfferParkingAllotmentRequest, value: any) => {
    setFormDataParkingAllotment((prev) => ({ ...prev, [field]: value }));

    if (errorsParkingAllotment[field]) {
      setErrorsParkingAllotment((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - GST ON EXISTING PLUS FREE AREA
  const handleFieldChangeGSTonExistingPlusFreeArea = (field: keyof AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest, value: any) => {
    setFormDataGSTonExistingPlusFreeArea((prev) => ({ ...prev, [field]: value }));

    if (errorsGSTonExistingPlusFreeArea[field]) {
      setErrorsGSTonExistingPlusFreeArea((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - PROJECT COMPLETION
  const handleFieldChangeProjectCompletion = (field: keyof AddUpdateProposedOfferProjectCompletionRequest, value: any) => {
    setFormDataProjectCompletion((prev) => ({ ...prev, [field]: value }));

    if (errorsProjectCompletion[field]) {
      setErrorsProjectCompletion((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - PROPOSED PLAN
  const handleFieldChangeProposedPlan = (field: keyof AddUpdateProposedOfferProposedPlanRequest, value: any) => {
    setFormDataProposedPlan((prev) => ({ ...prev, [field]: value }));

    if (errorsProposedPlan[field]) {
      setErrorsProposedPlan((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region HANDLE FIELD CHANGE EVENT - RENT DETAILS
  const handleFieldChangeRentDetails = (field: keyof AddUpdateProposedOfferRentDetailsRequest, value: any) => {
    setFormDataRentDetails((prev) => ({ ...prev, [field]: value }));

    if (errorsRentDetails[field]) {
      setErrorsRentDetails((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region EXTRA CARPET AREA
  const fetchExtraCarpetAreaData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const params: FilterWithPaginationProposedOfferExtraCarpetAreaRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullExtraCarpetArea(params);

        if (E.isRight(response)) {

          const data = response.right.Data?.[0] || null;

          setExtraCarpetAreaData(data);

          if (data) {
            setFormDataExtraCarpetArea({
              ProposedOfferExtraCarpetAreaId: data.ProposedOfferExtraCarpetAreaId || 0,
              Uniquekey: data.Uniquekey || initialFormStateExtraCarpetArea().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              ExtraCarpetAreaOfferedType: data.ExtraCarpetAreaOfferedType || '',
              ResidentialExtraCarpetPercent: data.ResidentialExtraCarpetPercent ?? 0,
              CommercialExtraCarpetPercent: data.CommercialExtraCarpetPercent ?? 0
            });
          } else {
            setFormDataExtraCarpetArea({
              ...initialFormStateExtraCarpetArea()
            });
          }
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
      'Loading Extra Carpet Area'
    );
  };


  const validateExtraCarpetAreaForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataExtraCarpetArea.ExtraCarpetAreaOfferedType?.trim()) {
      newErrors.ExtraCarpetAreaOfferedType = "Extra Carpet Area Type is required"
    }

    if (!formDataExtraCarpetArea.ResidentialExtraCarpetPercent) {
      newErrors.ResidentialExtraCarpetPercent = 'Residential Extra Carpet Percentage is required'
    } else if (!isValidPercentage(String(formDataExtraCarpetArea.ResidentialExtraCarpetPercent))) {
      newErrors.ResidentialExtraCarpetPercent = 'Enter a valid percentage'
    }

    if (!formDataExtraCarpetArea.CommercialExtraCarpetPercent) {
      newErrors.CommercialExtraCarpetPercent = 'Commercial Extra Carpet Percentage is required'
    } else if (!isValidPercentage(String(formDataExtraCarpetArea.CommercialExtraCarpetPercent))) {
      newErrors.CommercialExtraCarpetPercent = 'Enter a valid percentage'
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveExtraCarpetArea = async () => {
    setErrors({})

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    const validation = validateExtraCarpetAreaForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload: AddUpdateProposedOfferExtraCarpetAreaRequest = {
          ProposedOfferExtraCarpetAreaId: formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId,
          Uniquekey: formDataExtraCarpetArea.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ExtraCarpetAreaOfferedType: formDataExtraCarpetArea.ExtraCarpetAreaOfferedType,
          ResidentialExtraCarpetPercent: formDataExtraCarpetArea.ResidentialExtraCarpetPercent ?? 0,
          CommercialExtraCarpetPercent: formDataExtraCarpetArea.CommercialExtraCarpetPercent ?? 0
        };

        const response = await ProposedOfferService.apiCallAddUpdateExtraCarpetArea(payload);

        if (E.isRight(response)) {
          const isAdd = formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferExtraCarpetAreaData;

            setExtraCarpetAreaData(newRecord);

            setFormDataExtraCarpetArea({
              ...formDataExtraCarpetArea,
              ProposedOfferExtraCarpetAreaId: newRecord.ProposedOfferExtraCarpetAreaId || 0,
              Uniquekey: newRecord.Uniquekey || formDataExtraCarpetArea.Uniquekey
            });

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as ProposedOfferExtraCarpetAreaData;

            setExtraCarpetAreaData(updatedRecord);

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
      Number(formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId) === 0 ? 'Add Extra Carpet Area' : 'Update Extra Carpet Area'
    )
  };
  //#endregion

  //#region CORPUS DETAILS
  const fetchCorpusDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferCorpusDetailsRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullCorpusDetails(params);

        if (E.isRight(response)) {

          const data = response.right.Data?.[0] || null;

          setCorpusDetailsData(data);

          if (data) {
            setFormDataCorpusDetails({
              ProposedOfferCorpusDetailsId: data.ProposedOfferCorpusDetailsId || 0,
              Uniquekey: data.Uniquekey || initialFormStateCorpusDetails().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              CorpusOfferedToResidentialAmount: data.CorpusOfferedToResidentialAmount ?? 0,
              CorpusOfferedToCommercialAmount: data.CorpusOfferedToCommercialAmount ?? 0,
              CorpusDetailsWithPaymentStageJSON: ''
            });

            // Load payment stage list
            if (data.ProposedOfferCorpusDetailsWithPaymentStageData && data.ProposedOfferCorpusDetailsWithPaymentStageData.length > 0) {

              setCorpusPaymentStageList(data.ProposedOfferCorpusDetailsWithPaymentStageData);

            } else {

              setCorpusPaymentStageList([]);
            }

          } else {

            setFormDataCorpusDetails({
              ...initialFormStateCorpusDetails()

            });
            setCorpusPaymentStageList([]);
          }
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
      'Loading Corpus Details'
    );
  };

  const validateCorpusDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataCorpusDetails.CorpusOfferedToResidentialAmount) {
      newErrors.CorpusOfferedToResidentialAmount = 'Residential Corpus Amount is required'
    }

    if (!formDataCorpusDetails.CorpusOfferedToCommercialAmount) {
      newErrors.CorpusOfferedToCommercialAmount = 'Commercial Corpus Amount is required'
    }



    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveCorpusDetails = async () => {

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    else if (corpusPaymentStageList.length === 0) {
      addToast({ type: "error", title: "Please add atleast one corpus" });
      return
    }

    setErrorsCorpusDetails({})

    const validation = validateCorpusDetailsForm()

    if (!validation.isValid) {
      setErrorsCorpusDetails(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const paymentStageJSON = JSON.stringify(corpusPaymentStageList.map(item => ({
          ProposedOfferCorpusDetailsWithPaymentStageId: item.ProposedOfferCorpusDetailsWithPaymentStageId ?? 0,
          Type: item.Type || '',
          Stage: item.Stage || '',
          StagePercentage: item.StagePercentage ?? 0,
          Amount: item.Amount ?? 0
        })));

        const payload: AddUpdateProposedOfferCorpusDetailsRequest = {
          ProposedOfferCorpusDetailsId: formDataCorpusDetails.ProposedOfferCorpusDetailsId,
          Uniquekey: formDataCorpusDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          CorpusOfferedToResidentialAmount: formDataCorpusDetails.CorpusOfferedToResidentialAmount,
          CorpusOfferedToCommercialAmount: formDataCorpusDetails.CorpusOfferedToCommercialAmount,
          CorpusDetailsWithPaymentStageJSON: paymentStageJSON
        };

        const response = await ProposedOfferService.apiCallAddUpdateCorpusDetails(payload);

        if (E.isRight(response)) {
          const isAdd = formDataCorpusDetails.ProposedOfferCorpusDetailsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferCorpusDetailsData;

            setCorpusDetailsData(newRecord);

            setFormDataCorpusDetails({
              ...formDataCorpusDetails,
              ProposedOfferCorpusDetailsId: newRecord.ProposedOfferCorpusDetailsId || 0,
              Uniquekey: newRecord.Uniquekey || formDataCorpusDetails.Uniquekey
            });

            if (newRecord.ProposedOfferCorpusDetailsWithPaymentStageData) {
              setCorpusPaymentStageList(newRecord.ProposedOfferCorpusDetailsWithPaymentStageData);
            }

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as ProposedOfferCorpusDetailsData;

            setCorpusDetailsData(updatedRecord);

            if (updatedRecord.ProposedOfferCorpusDetailsWithPaymentStageData) {

              setCorpusPaymentStageList(updatedRecord.ProposedOfferCorpusDetailsWithPaymentStageData);
            }

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
      Number(formDataCorpusDetails.ProposedOfferCorpusDetailsId) === 0 ? 'Add Corpus Details' : 'Update Corpus Details'
    )
  };

  const handleAddCorpusPaymentStageModal = () => {
    setEditingCorpusPaymentStageData(null);
    setFormDataCorpusPaymentStage({
      ...initialFormStateCorpusPaymentStage()
    });
    setErrorsCorpusPaymentStage({});
    setIsAddUpdateCorpusPaymentStageModalOpen(true);
  };

  const handleEditCorpusPaymentStage = useCallback((row: ProposedOfferCorpusDetailsWithPaymentStageData, index: number) => {

    setEditingCorpusPaymentStageData({ row, index });

    setFormDataCorpusPaymentStage({
      ...row,
      Type: row.Type || '',
      Stage: row.Stage || '',
      StagePercentage: row.StagePercentage || 0,
      StagePercentageText: String(row.StagePercentage) || '',
      Amount: row.Amount || 0
    });
    setErrorsCorpusPaymentStage({});
    setIsAddUpdateCorpusPaymentStageModalOpen(true);
  }, []);


  const validateCorpusPaymentStageForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}


    if (!formDataCorpusPaymentStage.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (!formDataCorpusPaymentStage.Stage?.trim()) {
      newErrors.Stage = "Stage is required"
    }

    if (!formDataCorpusPaymentStage.StagePercentage) {
      newErrors.StagePercentage = 'Stage Percentage is required'
    } else if (!isValidPercentage(String(formDataCorpusPaymentStage.StagePercentage))) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    } else if (formDataCorpusPaymentStage.StagePercentage === undefined) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddUpdateCorpusPaymentStage = async (e: React.FormEvent) => {

    e.preventDefault();
    setErrorsCorpusPaymentStage({});

    const validation = validateCorpusPaymentStageForm();

    if (formDataCorpusPaymentStage.Type?.toUpperCase() === 'RESIDENTIAL' &&
      (
        formDataCorpusDetails.CorpusOfferedToResidentialAmount == null ||
        formDataCorpusDetails.CorpusOfferedToResidentialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Residential Corpus Amount is required'
      });
      return;
    }


    else if (formDataCorpusPaymentStage.Type?.toUpperCase() === 'COMMERCIAL' &&
      (
        formDataCorpusDetails.CorpusOfferedToCommercialAmount == null ||
        formDataCorpusDetails.CorpusOfferedToCommercialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Commercial Corpus Amount is required'
      });
      return;
    }


    if (!validation.isValid) {

      setErrorsCorpusPaymentStage(validation.errors);
      return;

    }

    const paymentStageToSave: ProposedOfferCorpusDetailsWithPaymentStageData = {
      ...formDataCorpusPaymentStage,
      ProposedOfferCorpusDetailsWithPaymentStageId: editingCorpusPaymentStageData?.row.ProposedOfferCorpusDetailsWithPaymentStageId ?? 0,
      ProjectId: Number(projectId),
      BuildingId: Number(buildingId)
    };

    setCorpusPaymentStageList(prev => {
      if (editingCorpusPaymentStageData) {
        const updated = [...prev];
        updated[editingCorpusPaymentStageData.index] = paymentStageToSave;
        return updated;
      }

      return [...prev, paymentStageToSave];
    });

    setIsAddUpdateCorpusPaymentStageModalOpen(false);
    setEditingCorpusPaymentStageData(null);
    setFormDataCorpusPaymentStage(initialFormStateCorpusPaymentStage());
    setErrorsCorpusPaymentStage({});
  };

  const handleConfirmationDialogBoxOpenCorpusPaymentStage = useCallback((row: ProposedOfferCorpusDetailsWithPaymentStageData, index: number) => {
    setDeleteCorpusPaymentStageData({ row, index });
    setIsConfirmationDialogBoxOpenCorpusPaymentStage(true);

  }, []);

  const handleDeleteCorpusPaymentStage = () => {

    if (!deleteCorpusPaymentStageData) return;

    const removeIndex = deleteCorpusPaymentStageData.index;

    if (removeIndex < 0) {

      setIsConfirmationDialogBoxOpenCorpusPaymentStage(false);

      setDeleteCorpusPaymentStageData(null);

      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });

      return;

    }


    setCorpusPaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenCorpusPaymentStage(false);

    setDeleteCorpusPaymentStageData(null);

    addToast({ type: 'success', title: 'Corpus Payment Stage Removed' });

  };

  const corpusPaymentStageColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Type',
        label: 'Type',
        width: '20',
        sortable: false,
        align: 'left',
        fixed: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Stage',
        label: 'Stage',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'StagePercentage',
        label: 'Stage %',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value} %` : 0
      },
      {
        key: 'Amount',
        label: 'Amount (₹)',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `₹${value}` : 0
      },
      {
        key: 'Action',
        label: 'Action',
        width: '20',
        sortable: false,
        fixed: 'right',
        align: 'center',
        render: (_value, row, index) => (
          <div className="flex items-center justify-center gap-2">
            {canAction && (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    handleEditCorpusPaymentStage(row, index);

                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConfirmationDialogBoxOpenCorpusPaymentStage(row, index);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{ color: 'red' }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )
      }
    ],
    [canAction, handleEditCorpusPaymentStage, handleConfirmationDialogBoxOpenCorpusPaymentStage]
  );

  const recalculateCorpusPaymentAmount = useCallback(
    (
      type: string | null | undefined,
      percentage: number | null | undefined
    ) => {
      if (!type || percentage == null) {
        handleFieldChangeCorpusPaymentStage('Amount', null);
        return;
      }

      const upperType = type.toUpperCase();

      const baseAmount =
        upperType === 'RESIDENTIAL'
          ? formDataCorpusDetails.CorpusOfferedToResidentialAmount
          : upperType === 'COMMERCIAL'
            ? formDataCorpusDetails.CorpusOfferedToCommercialAmount
            : null;

      if (!baseAmount || baseAmount <= 0) {
        handleFieldChangeCorpusPaymentStage('Amount', null);
        return;
      }

      const calculatedAmount = calculatePercentageAmount(
        baseAmount,
        percentage
      );

      handleFieldChangeCorpusPaymentStage('Amount', calculatedAmount);
    },
    [formDataCorpusDetails]
  );


  //#endregion

  //#region SECURITY DEPOSIT DETAILS

  const fetchSecurityDepositDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferSecurityDepositDetailsRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullSecurityDepositDetails(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;

          setSecurityDepositDetailsData(data);

          if (data) {
            setFormDataSecurityDepositDetails({
              ProposedOfferSecurityDepositDetailsId: data.ProposedOfferSecurityDepositDetailsId || 0,
              Uniquekey: data.Uniquekey || initialFormStateSecurityDepositDetails().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              SecurityDepositToSocietyAmount: data.SecurityDepositToSocietyAmount ?? 0,
              SecurityDepositToSocietyWithPaymentStageJSON: ''
            });

            // Load payment stage list
            if (data.ProposedOfferSecurityDepositDetailsWithPaymentStageData && data.ProposedOfferSecurityDepositDetailsWithPaymentStageData.length > 0) {
              setSecurityDepositPaymentStageList(data.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            } else {
              setSecurityDepositPaymentStageList([]);
            }
          } else {
            setFormDataSecurityDepositDetails({
              ...initialFormStateSecurityDepositDetails(),
              ProjectId: Number(projectId)
            });
            setSecurityDepositPaymentStageList([]);
          }
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
      'Loading Security Deposit Details'
    );
  };

  const validateSecurityDepositDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataSecurityDepositDetails.SecurityDepositToSocietyAmount) {
      newErrors.SecurityDepositToSocietyAmount = 'Security Deposit Amount is required'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveSecurityDepositDetails = async () => {

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    else if (securityDepositPaymentStageList.length === 0) {
      addToast({ type: "error", title: "Please add atleast one security deposit" });
      return
    }

    setErrorsSecurityDepositDetails({})

    const validation = validateSecurityDepositDetailsForm()

    if (!validation.isValid) {
      setErrorsSecurityDepositDetails(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Convert payment stage list to JSON
        const paymentStageJSON = JSON.stringify(securityDepositPaymentStageList.map(item => ({
          ProposedOfferSecurityDepositDetailsWithPaymentStageId: item.ProposedOfferSecurityDepositDetailsWithPaymentStageId ?? 0,
          Type: item.Type || '',
          Stage: item.Stage || '',
          Amount: item.Amount ?? 0
        })));

        const payload: AddUpdateProposedOfferSecurityDepositDetailsRequest = {
          ProposedOfferSecurityDepositDetailsId: formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId,
          Uniquekey: formDataSecurityDepositDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          SecurityDepositToSocietyAmount: formDataSecurityDepositDetails.SecurityDepositToSocietyAmount,
          SecurityDepositToSocietyWithPaymentStageJSON: paymentStageJSON
        };

        const response = await ProposedOfferService.apiCallAddUpdateSecurityDepositDetails(payload);

        if (E.isRight(response)) {
          const isAdd = formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferSecurityDepositDetailsData;
            setSecurityDepositDetailsData(newRecord);
            setFormDataSecurityDepositDetails({
              ...formDataSecurityDepositDetails,
              ProposedOfferSecurityDepositDetailsId: newRecord.ProposedOfferSecurityDepositDetailsId || 0,
              Uniquekey: newRecord.Uniquekey || formDataSecurityDepositDetails.Uniquekey
            });
            if (newRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData) {
              setSecurityDepositPaymentStageList(newRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            }
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferSecurityDepositDetailsData;
            setSecurityDepositDetailsData(updatedRecord);
            if (updatedRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData) {
              setSecurityDepositPaymentStageList(updatedRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            }
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
      Number(formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId) === 0 ? 'Add Security Deposit Details' : 'Update Security Deposit Details'
    )
  };

  const validateSecurityDepositPaymentStageForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataSecurityDepositPaymentStage.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (!formDataSecurityDepositPaymentStage.Stage?.trim()) {
      newErrors.Stage = "Stage is required"
    }

    if (!formDataSecurityDepositPaymentStage.Amount) {
      newErrors.Amount = "Amount is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddSecurityDepositPaymentStageModal = () => {
    setEditingSecurityDepositPaymentStageData(null);
    setFormDataSecurityDepositPaymentStage({
      ...initialFormStateSecurityDepositPaymentStage(),
      ProjectId: Number(projectId),
      BuildingId: formDataSecurityDepositDetails.BuildingId || 0
    });
    setErrorsSecurityDepositPaymentStage({});
    setIsAddUpdateSecurityDepositPaymentStageModalOpen(true);
  };

  const handleEditSecurityDepositPaymentStage = useCallback((row: ProposedOfferSecurityDepositDetailsWithPaymentStageData, index: number) => {
    setEditingSecurityDepositPaymentStageData({ row, index });
    setFormDataSecurityDepositPaymentStage({
      ...row,
      Type: row.Type || '',
      Stage: row.Stage || '',
      Amount: row.Amount || 0
    });
    setErrorsSecurityDepositPaymentStage({});
    setIsAddUpdateSecurityDepositPaymentStageModalOpen(true);
  }, []);

  const handleAddUpdateSecurityDepositPaymentStage = async (e: React.FormEvent) => {

    e.preventDefault();

    setErrorsSecurityDepositPaymentStage({});

    const validation = validateSecurityDepositPaymentStageForm();

    if (!validation.isValid) {
      setErrorsSecurityDepositPaymentStage(validation.errors);
      return;
    }

    const paymentStageToSave: ProposedOfferSecurityDepositDetailsWithPaymentStageData = {
      ...formDataSecurityDepositPaymentStage,
      ProposedOfferSecurityDepositDetailsWithPaymentStageId: editingSecurityDepositPaymentStageData?.row.ProposedOfferSecurityDepositDetailsWithPaymentStageId ?? 0,
      ProjectId: Number(projectId),
      BuildingId: buildingId
    };

    setSecurityDepositPaymentStageList(prev => {
      if (editingSecurityDepositPaymentStageData) {
        const updated = [...prev];
        updated[editingSecurityDepositPaymentStageData.index] = paymentStageToSave;
        return updated;
      }

      return [...prev, paymentStageToSave];
    });



    setIsAddUpdateSecurityDepositPaymentStageModalOpen(false);
    setEditingSecurityDepositPaymentStageData(null);
    setFormDataSecurityDepositPaymentStage(initialFormStateSecurityDepositPaymentStage());
    setErrorsSecurityDepositPaymentStage({});
  };

  const handleConfirmationDialogBoxOpenSecurityDepositPaymentStage = useCallback((row: ProposedOfferSecurityDepositDetailsWithPaymentStageData, index: number) => {
    setDeleteSecurityDepositPaymentStageData({ row, index });
    setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage(true);
  }, []);

  const handleDeleteSecurityDepositPaymentStage = () => {
    if (!deleteSecurityDepositPaymentStageData) return;

    const removeIndex = deleteSecurityDepositPaymentStageData.index;

    if (removeIndex < 0) {

      setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage(false);

      setDeleteSecurityDepositPaymentStageData(null);

      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });

      return;

    }

    setSecurityDepositPaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage(false);

    setDeleteSecurityDepositPaymentStageData(null);

    addToast({ type: 'success', title: 'Security Deposit Payment Stage Removed' });
  };

  const securityDepositPaymentStageColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Type',
        label: 'Type',
        width: '25',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Stage',
        label: 'Stage',
        width: '25',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Amount',
        label: 'Amount (₹)',
        width: '25',
        sortable: false,
        align: 'right',
        render: (value) => value ? `₹${value}` : '-'
      },
      {
        key: 'Action',
        label: 'Action',
        width: '25',
        sortable: false,
        align: 'center',
        render: (_value, row, index) => (
          <div className="flex items-center justify-center gap-2">
            {canAction && (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditSecurityDepositPaymentStage(row, index);

                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConfirmationDialogBoxOpenSecurityDepositPaymentStage(row, index);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{ color: 'red' }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )
      }
    ],
    [canAction, handleEditSecurityDepositPaymentStage, handleConfirmationDialogBoxOpenSecurityDepositPaymentStage]
  );




  //#endregion

  //#region SHIFTING DETAILS
  const fetchShiftingDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferShiftingDetailsRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullShiftingDetails(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setShiftingDetailsData(data);

          if (data) {
            setFormDataShiftingDetails({
              ProposedOfferShiftingDetailsId: data.ProposedOfferShiftingDetailsId || 0,
              Uniquekey: data.Uniquekey || initialFormStateShiftingDetails().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              ShiftingOfferedToResidentialAmount: data.ShiftingOfferedToResidentialAmount ?? 0,
              ShiftingOfferedToCommercialAmount: data.ShiftingOfferedToCommercialAmount ?? 0,
              ShiftingDetailsWithPaymentStageJSON: ''
            });

            // Load payment stage list
            if (data.ProposedOfferShiftingDetailsWithPaymentStageData && data.ProposedOfferShiftingDetailsWithPaymentStageData.length > 0) {
              setShiftingPaymentStageList(data.ProposedOfferShiftingDetailsWithPaymentStageData);
            } else {
              setShiftingPaymentStageList([]);
            }
          } else {
            setFormDataShiftingDetails({
              ...initialFormStateShiftingDetails(),
              ProjectId: Number(projectId)
            });
            setShiftingPaymentStageList([]);
          }
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
      'Loading Shifting Details'
    );
  };

  const validateShiftingDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataShiftingDetails.ShiftingOfferedToResidentialAmount) {
      newErrors.ShiftingOfferedToResidentialAmount = "Residential Shifting Amount is required "
    }

    if (!formDataShiftingDetails.ShiftingOfferedToCommercialAmount) {
      newErrors.ShiftingOfferedToCommercialAmount = "Commercial Shifting Amount is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveShiftingDetails = async () => {

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    else if (shiftingPaymentStageList.length === 0) {
      addToast({ type: "error", title: "Please add atleast one Shifting details" });
      return
    }

    setErrorsShiftingDetails({})

    const validation = validateShiftingDetailsForm()

    if (!validation.isValid) {
      setErrorsShiftingDetails(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Convert payment stage list to JSON
        const paymentStageJSON = JSON.stringify(shiftingPaymentStageList.map(item => ({
          ProposedOfferShiftingDetailsWithPaymentStageId: item.ProposedOfferShiftingDetailsWithPaymentStageId ?? 0,
          Type: item.Type || '',
          Stage: item.Stage || '',
          StagePercentage: item.StagePercentage ?? 0,
          Amount: item.Amount ?? 0
        })));

        const payload: AddUpdateProposedOfferShiftingDetailsRequest = {
          ProposedOfferShiftingDetailsId: formDataShiftingDetails.ProposedOfferShiftingDetailsId,
          Uniquekey: formDataShiftingDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ShiftingOfferedToResidentialAmount: formDataShiftingDetails.ShiftingOfferedToResidentialAmount,
          ShiftingOfferedToCommercialAmount: formDataShiftingDetails.ShiftingOfferedToCommercialAmount,
          ShiftingDetailsWithPaymentStageJSON: paymentStageJSON
        };

        const response = await ProposedOfferService.apiCallAddUpdateShiftingDetails(payload);

        if (E.isRight(response)) {
          const isAdd = formDataShiftingDetails.ProposedOfferShiftingDetailsId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as ProposedOfferShiftingDetailsData;

            setShiftingDetailsData(newRecord);

            setFormDataShiftingDetails({
              ...formDataShiftingDetails,
              ProposedOfferShiftingDetailsId: newRecord.ProposedOfferShiftingDetailsId || 0,
              Uniquekey: newRecord.Uniquekey || formDataShiftingDetails.Uniquekey
            });

            if (newRecord.ProposedOfferShiftingDetailsWithPaymentStageData) {
              setShiftingPaymentStageList(newRecord.ProposedOfferShiftingDetailsWithPaymentStageData);
            }

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as ProposedOfferShiftingDetailsData;

            setShiftingDetailsData(updatedRecord);

            if (updatedRecord.ProposedOfferShiftingDetailsWithPaymentStageData) {

              setShiftingPaymentStageList(updatedRecord.ProposedOfferShiftingDetailsWithPaymentStageData);

            }

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
      Number(formDataShiftingDetails.ProposedOfferShiftingDetailsId) === 0 ? 'Add Shifting Details' : 'Update Shifting Details'
    )
  };

  const validateShiftingPaymentStageForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataShiftingPaymentStage.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (!formDataShiftingPaymentStage.Stage?.trim()) {
      newErrors.Stage = "Stage is required"
    }

    if (!formDataShiftingPaymentStage.StagePercentage) {
      newErrors.StagePercentage = 'Stage Percentage is required'
    } else if (!isValidPercentage(String(formDataShiftingPaymentStage.StagePercentage))) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    } else if (formDataShiftingPaymentStage.StagePercentage === undefined) {
      newErrors.StagePercentage = 'Enter a valid percentage'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddShiftingPaymentStageModal = () => {
    setEditingShiftingPaymentStageData(null);
    setFormDataShiftingPaymentStage({
      ...initialFormStateShiftingPaymentStage(),
      ProjectId: Number(projectId),
      BuildingId: formDataShiftingDetails.BuildingId || 0
    });
    setErrorsShiftingPaymentStage({});
    setIsAddUpdateShiftingPaymentStageModalOpen(true);
  };

  const handleEditShiftingPaymentStage = useCallback((row: ProposedOfferShiftingDetailsWithPaymentStageData, index: number) => {
    setEditingShiftingPaymentStageData({ row, index });
    setFormDataShiftingPaymentStage({
      ...row,
      Type: row.Type || '',
      Stage: row.Stage || '',
      StagePercentage: row.StagePercentage || 0,
      StagePercentageText: String(row.StagePercentage) || '',
      Amount: row.Amount || 0
    });
    setErrorsShiftingPaymentStage({});
    setIsAddUpdateShiftingPaymentStageModalOpen(true);
  }, []);

  const handleAddUpdateShiftingPaymentStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsShiftingPaymentStage({});

    if (formDataShiftingPaymentStage.Type?.toUpperCase() === 'RESIDENTIAL' &&
      (
        formDataShiftingDetails.ShiftingOfferedToResidentialAmount == null ||
        formDataShiftingDetails.ShiftingOfferedToResidentialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Residential Shifting Amount is required'
      });
      return;
    }


    else if (formDataShiftingPaymentStage.Type?.toUpperCase() === 'COMMERCIAL' &&
      (
        formDataShiftingDetails.ShiftingOfferedToCommercialAmount == null ||
        formDataShiftingDetails.ShiftingOfferedToCommercialAmount <= 0
      )
    ) {
      addToast({
        type: 'error',
        title: 'Commercial Shifting Amount is required'
      });
      return;
    }

    const validation = validateShiftingPaymentStageForm();

    if (!validation.isValid) {
      setErrorsShiftingPaymentStage(validation.errors);
      return;
    }

    const paymentStageToSave: ProposedOfferShiftingDetailsWithPaymentStageData = {
      ...formDataShiftingPaymentStage,
      ProposedOfferShiftingDetailsWithPaymentStageId: editingShiftingPaymentStageData?.row.ProposedOfferShiftingDetailsWithPaymentStageId ?? 0,
      ProjectId: Number(projectId),
      BuildingId: Number(buildingId)
    };

    setShiftingPaymentStageList(prevList => {
      if (editingShiftingPaymentStageData) {
        const updated = [...prevList];
        updated[editingShiftingPaymentStageData.index] = paymentStageToSave;
        return updated;
      }

      return [...prevList, paymentStageToSave];
    });

    setIsAddUpdateShiftingPaymentStageModalOpen(false);
    setEditingShiftingPaymentStageData(null);
    setFormDataShiftingPaymentStage(initialFormStateShiftingPaymentStage());
    setErrorsShiftingPaymentStage({});
  };


  const handleConfirmationDialogBoxOpenShiftingPaymentStage = useCallback((row: ProposedOfferShiftingDetailsWithPaymentStageData, index: number) => {
    setDeleteShiftingPaymentStageData({ row, index });
    setIsConfirmationDialogBoxOpenShiftingPaymentStage(true);
  }, []);

  const handleDeleteShiftingPaymentStage = () => {
    if (!deleteShiftingPaymentStageData) return;


    const removeIndex = deleteShiftingPaymentStageData.index;

    if (removeIndex < 0) {

      setIsConfirmationDialogBoxOpenShiftingPaymentStage(false);

      setDeleteShiftingPaymentStageData(null);

      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });

      return;

    }

    setShiftingPaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenShiftingPaymentStage(false);
    setDeleteShiftingPaymentStageData(null);
    addToast({ type: 'success', title: 'Shifting Payment Stage Removed' });
  };

  const shiftingPaymentStageColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Type',
        label: 'Type',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Stage',
        label: 'Stage',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'StagePercentage',
        label: 'Stage %',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value}%` : '-'
      },
      {
        key: 'Amount',
        label: 'Amount (₹)',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `₹${value}` : '-'
      },
      {
        key: 'Action',
        label: 'Action',
        width: '20',
        sortable: false,
        align: 'center',
        render: (_value, row, index) => (
          <div className="flex items-center justify-center gap-2">
            {canAction && (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();


                    handleEditShiftingPaymentStage(row, index);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConfirmationDialogBoxOpenShiftingPaymentStage(row, index);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{ color: 'red' }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )
            }
          </div >
        )
      }
    ],
    [canAction, handleEditShiftingPaymentStage, handleConfirmationDialogBoxOpenShiftingPaymentStage]
  );

  const recalculateShiftingPaymentAmount = useCallback(
    (
      type: string | null | undefined,
      percentage: number | null | undefined
    ) => {
      if (!type || percentage == null) {
        handleFieldChangeShiftingPaymentStage('Amount', null);
        return;
      }

      const upperType = type.toUpperCase();

      const baseAmount =
        upperType === 'RESIDENTIAL'
          ? formDataShiftingDetails.ShiftingOfferedToResidentialAmount
          : upperType === 'COMMERCIAL'
            ? formDataShiftingDetails.ShiftingOfferedToCommercialAmount
            : null;

      if (!baseAmount || baseAmount <= 0) {
        handleFieldChangeShiftingPaymentStage('Amount', null);
        return;
      }

      const calculatedAmount = calculatePercentageAmount(
        baseAmount,
        percentage
      );

      handleFieldChangeShiftingPaymentStage('Amount', calculatedAmount);
    },
    [formDataShiftingDetails]
  );

  //#endregion

  //#region LIEN TO SOCIETY setCorpusPaymentStageList

  const fetchLienToSocietyDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferLienToSocietyDetailsRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullLienToSocietyDetails(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setLienToSocietyDetailsData(data);

          if (data) {
            setFormDataLienToSocietyDetails({
              ProposedOfferLienToSocietyDetailsId: data.ProposedOfferLienToSocietyDetailsId || 0,
              Uniquekey: data.Uniquekey || initialFormStateLienToSocietyDetails().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              ResidentialAreaSqFt: data.ResidentialAreaSqFt ?? 0,
              CommercialAreaSqFt: data.CommercialAreaSqFt ?? 0,
              NumberOfResidentialLienUnits: data.NumberOfResidentialLienUnits ?? 0,
              NumberOfCommercialLienUnits: data.NumberOfCommercialLienUnits ?? 0,
              LienToSocietyWithPaymentStageJSON: ''
            });

            // Load payment stage list
            if (data.ProposedOfferSecurityDepositDetailsWithPaymentStageData && data.ProposedOfferSecurityDepositDetailsWithPaymentStageData.length > 0) {

              setLienToSocietyPaymentStageList(data.ProposedOfferSecurityDepositDetailsWithPaymentStageData);

            } else {
              setLienToSocietyPaymentStageList([]);
            }
          } else {
            setFormDataLienToSocietyDetails({
              ...initialFormStateLienToSocietyDetails(),
              ProjectId: Number(projectId)
            });
            setLienToSocietyPaymentStageList([]);
          }
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
      'Loading Lien to Society Details'
    );
  };

  const validateLienToSocietyDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataLienToSocietyDetails.ResidentialAreaSqFt) {
      newErrors.ResidentialAreaSqFt = "Residential Area is required"
    }

    if (!formDataLienToSocietyDetails.CommercialAreaSqFt) {
      newErrors.CommercialAreaSqFt = "Commercial Area is required"
    }

    if (!formDataLienToSocietyDetails.NumberOfResidentialLienUnits) {
      newErrors.NumberOfResidentialLienUnits = "Number of Residential Lien Units is required"
    }

    if (!formDataLienToSocietyDetails.NumberOfCommercialLienUnits) {
      newErrors.NumberOfCommercialLienUnits = "Number of Commercial Lien Units is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveLienToSocietyDetails = async () => {

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    else if (lienToSocietyPaymentStageList.length === 0) {
      addToast({ type: "error", title: "Please add atleast one Lien to Society details" });
      return
    }

    setErrorsLienToSocietyDetails({})

    const validation = validateLienToSocietyDetailsForm()

    if (!validation.isValid) {
      setErrorsLienToSocietyDetails(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Convert payment stage list to JSON
        const paymentStageJSON = JSON.stringify(lienToSocietyPaymentStageList.map(item => ({
          ProposedOfferLienToSocietyDetailsWithPaymentStageId: item.ProposedOfferLienToSocietyDetailsWithPaymentStageId ?? 0,
          Type: item.Type || '',
          Stage: item.Stage || '',
          CarpetAreaSqFt: item.CarpetAreaSqFt ?? 0,
          IsRelease: item.IsRelease ?? false
        })));

        const payload: AddUpdateProposedOfferLienToSocietyDetailsRequest = {
          ProposedOfferLienToSocietyDetailsId: formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId,
          Uniquekey: formDataLienToSocietyDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          ResidentialAreaSqFt: formDataLienToSocietyDetails.ResidentialAreaSqFt,
          CommercialAreaSqFt: formDataLienToSocietyDetails.CommercialAreaSqFt,
          NumberOfResidentialLienUnits: formDataLienToSocietyDetails.NumberOfResidentialLienUnits,
          NumberOfCommercialLienUnits: formDataLienToSocietyDetails.NumberOfCommercialLienUnits,
          LienToSocietyWithPaymentStageJSON: paymentStageJSON
        };

        const response = await ProposedOfferService.apiCallAddUpdateLienToSocietyDetails(payload);

        if (E.isRight(response)) {
          const isAdd = formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferLienToSocietyDetailsData;
            setLienToSocietyDetailsData(newRecord);
            setFormDataLienToSocietyDetails({
              ...formDataLienToSocietyDetails,
              ProposedOfferLienToSocietyDetailsId: newRecord.ProposedOfferLienToSocietyDetailsId || 0,
              Uniquekey: newRecord.Uniquekey || formDataLienToSocietyDetails.Uniquekey
            });
            if (newRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData) {
              setLienToSocietyPaymentStageList(newRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            }
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferLienToSocietyDetailsData;
            setLienToSocietyDetailsData(updatedRecord);
            if (updatedRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData) {
              setLienToSocietyPaymentStageList(updatedRecord.ProposedOfferSecurityDepositDetailsWithPaymentStageData);
            }
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
      Number(formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId) === 0 ? 'Add Lien to Society Details' : 'Update Lien to Society Details'
    )
  };

  const handleAddLienToSocietyPaymentStageModal = () => {
    setEditingLienToSocietyPaymentStageData(null);
    setFormDataLienToSocietyPaymentStage({
      ...initialFormStateLienToSocietyPaymentStage(),
      ProjectId: Number(projectId),
      BuildingId: formDataLienToSocietyDetails.BuildingId || 0
    });
    setErrorsLienToSocietyPaymentStage({});
    setIsAddUpdateLienToSocietyPaymentStageModalOpen(true);
  };

  const handleEditLienToSocietyPaymentStage = useCallback((row: ProposedOfferLienToSocietyDetailsWithPaymentStageData, index: number) => {
    setEditingLienToSocietyPaymentStageData({ row, index });
    setFormDataLienToSocietyPaymentStage({
      ...row,
      Type: row.Type || '',
      Stage: row.Stage || '',
      CarpetAreaSqFt: row.CarpetAreaSqFt || 0,
      IsRelease: row.IsRelease ?? false
    });
    setErrorsLienToSocietyPaymentStage({});
    setIsAddUpdateLienToSocietyPaymentStageModalOpen(true);
  }, []);

  const validateLienToSocietyPaymentStageForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataLienToSocietyPaymentStage.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (!formDataLienToSocietyPaymentStage.Stage?.trim()) {
      newErrors.Stage = "Stage is required"
    }

    if (!formDataLienToSocietyPaymentStage.CarpetAreaSqFt) {
      newErrors.CarpetAreaSqFt = "Carpet Area is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddUpdateLienToSocietyPaymentStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsLienToSocietyPaymentStage({});

    const validation = validateLienToSocietyPaymentStageForm();

    if (!validation.isValid) {
      setErrorsLienToSocietyPaymentStage(validation.errors);
      return;
    }

    const paymentStageToSave: ProposedOfferLienToSocietyDetailsWithPaymentStageData = {
      ...formDataLienToSocietyPaymentStage,
      ProposedOfferLienToSocietyDetailsWithPaymentStageId: editingLienToSocietyPaymentStageData?.row.ProposedOfferLienToSocietyDetailsWithPaymentStageId ?? 0,
      ProjectId: Number(projectId),
      BuildingId: Number(buildingId)
    };

    setLienToSocietyPaymentStageList(prevList => {
      if (editingLienToSocietyPaymentStageData) {
        const updated = [...prevList];
        updated[editingLienToSocietyPaymentStageData.index] = paymentStageToSave;
        return updated;
      }

      return [...prevList, paymentStageToSave];
    });

    setIsAddUpdateLienToSocietyPaymentStageModalOpen(false);
    setEditingLienToSocietyPaymentStageData(null);
    setFormDataLienToSocietyPaymentStage(initialFormStateLienToSocietyPaymentStage());
    setErrorsLienToSocietyPaymentStage({});
  };

  const handleConfirmationDialogBoxOpenLienToSocietyPaymentStage = useCallback((row: ProposedOfferLienToSocietyDetailsWithPaymentStageData, index: number) => {
    setDeleteLienToSocietyPaymentStageData({ row, index });
    setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage(true);
  }, []);

  const handleDeleteLienToSocietyPaymentStage = () => {
    if (!deleteLienToSocietyPaymentStageData) return;

    const removeIndex = deleteLienToSocietyPaymentStageData.index;

    if (removeIndex < 0) {

      setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage(false);

      setDeleteLienToSocietyPaymentStageData(null);

      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });

      return;

    }

    setLienToSocietyPaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage(false);
    setDeleteLienToSocietyPaymentStageData(null);
    addToast({ type: 'success', title: 'Lien to Society Payment Stage Removed' });
  };

  const lienToSocietyPaymentStageColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Type',
        label: 'Type',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Stage',
        label: 'Stage',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'CarpetAreaSqFt',
        label: 'Carpet Area (Sq Ft)',
        width: '20',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value}` : '-'
      },
      {
        key: 'IsRelease',
        label: 'Is Release',
        width: '20',
        sortable: false,
        align: 'center',
        render: (value) => value ? 'Yes' : 'No'
      },
      {
        key: 'Action',
        label: 'Action',
        width: '20',
        sortable: false,
        align: 'center',
        render: (_value, row, index) => (
          <div className="flex items-center justify-center gap-2">
            {canAction && (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    handleEditLienToSocietyPaymentStage(row, index);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConfirmationDialogBoxOpenLienToSocietyPaymentStage(row, index);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{ color: 'red' }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )
      }
    ],
    [canAction, handleEditLienToSocietyPaymentStage, handleConfirmationDialogBoxOpenLienToSocietyPaymentStage]
  );

  //#endregion

  //#region PARKING ALLOTMENT

  const fetchParkingAllotmentData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferParkingAllotmentRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullParkingAllotment(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setParkingAllotmentData(data);

          if (data) {
            setFormDataParkingAllotment({
              ProposedOfferParkingAllotmentId: data.ProposedOfferParkingAllotmentId || 0,
              Uniquekey: data.Uniquekey || initialFormStateParkingAllotment().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              NumberOfParkingAllottedToMembers: data.NumberOfParkingAllottedToMembers ?? 0,
              TotalParkingPercentageAllottedToSociety: data.TotalParkingPercentageAllottedToSociety ?? 0
            });
          } else {
            setFormDataParkingAllotment({
              ...initialFormStateParkingAllotment(),
              ProjectId: Number(projectId)
            });
          }
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
      'Loading Parking Allotment'
    );
  };

  const validateParkingAllotmentForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataParkingAllotment.NumberOfParkingAllottedToMembers) {
      newErrors.NumberOfParkingAllottedToMembers = "Number of Parking Allotted to Members is required"
    }

    if (!formDataParkingAllotment.TotalParkingPercentageAllottedToSociety) {
      newErrors.TotalParkingPercentageAllottedToSociety = 'Total Parking Percentage is required'
    } else if (!isValidPercentage(String(formDataParkingAllotment.TotalParkingPercentageAllottedToSociety))) {
      newErrors.TotalParkingPercentageAllottedToSociety = 'Enter a valid percentage'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveParkingAllotment = async () => {

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    setErrorsParkingAllotment({})

    const validation = validateParkingAllotmentForm()

    if (!validation.isValid) {
      setErrorsParkingAllotment(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferParkingAllotmentRequest = {
          ProposedOfferParkingAllotmentId: formDataParkingAllotment.ProposedOfferParkingAllotmentId,
          Uniquekey: formDataParkingAllotment.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          NumberOfParkingAllottedToMembers: formDataParkingAllotment.NumberOfParkingAllottedToMembers,
          TotalParkingPercentageAllottedToSociety: formDataParkingAllotment.TotalParkingPercentageAllottedToSociety
        };

        const response = await ProposedOfferService.apiCallAddUpdateParkingAllotment(payload);

        if (E.isRight(response)) {
          const isAdd = formDataParkingAllotment.ProposedOfferParkingAllotmentId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferParkingAllotmentData;
            setParkingAllotmentData(newRecord);
            setFormDataParkingAllotment({
              ...formDataParkingAllotment,
              ProposedOfferParkingAllotmentId: newRecord.ProposedOfferParkingAllotmentId || 0,
              Uniquekey: newRecord.Uniquekey || formDataParkingAllotment.Uniquekey
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferParkingAllotmentData;
            setParkingAllotmentData(updatedRecord);
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
      Number(formDataParkingAllotment.ProposedOfferParkingAllotmentId) === 0 ? 'Add Parking Allotment' : 'Update Parking Allotment'
    )
  };
  //#endregion

  //#region GST ON EXISTING PLUS FREE AREA

  const fetchGSTonExistingPlusFreeAreaData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferGSTonExistingPlusFreeAreaRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullGSTonExistingPlusFreeArea(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setGSTonExistingPlusFreeAreaData(data);

          if (data) {
            setFormDataGSTonExistingPlusFreeArea({
              ProposedOfferGSTonExistingPlusFreeAreaId: data.ProposedOfferGSTonExistingPlusFreeAreaId || 0,
              Uniquekey: data.Uniquekey || initialFormStateGSTonExistingPlusFreeArea().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              GSTOnAreaByMemberPercent: data.GSTOnAreaByMemberPercent ?? 0,
              GSTOnAreaByDeveloperPercent: data.GSTOnAreaByDeveloperPercent ?? 0
            });
          } else {
            setFormDataGSTonExistingPlusFreeArea({
              ...initialFormStateGSTonExistingPlusFreeArea(),
              ProjectId: Number(projectId)
            });
          }
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
      'Loading GST on Existing Plus Free Area'
    );
  };

  const validateGSTonExistingPlusFreeAreaForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}


    if (!formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent) {
      newErrors.GSTOnAreaByMemberPercent = 'GST on Area by Member Percentage is required'
    } else if (!isValidPercentage(String(formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent))) {
      newErrors.GSTOnAreaByMemberPercent = 'Enter a valid percentage'
    }


    if (!formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent) {
      newErrors.GSTOnAreaByDeveloperPercent = 'GST on Area by Developer Percentage is required'
    } else if (!isValidPercentage(String(formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent))) {
      newErrors.GSTOnAreaByDeveloperPercent = 'Enter a valid percentage'
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveGSTonExistingPlusFreeArea = async () => {

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    setErrorsGSTonExistingPlusFreeArea({})

    const validation = validateGSTonExistingPlusFreeAreaForm()

    if (!validation.isValid) {
      setErrorsGSTonExistingPlusFreeArea(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest = {
          ProposedOfferGSTonExistingPlusFreeAreaId: formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId,
          Uniquekey: formDataGSTonExistingPlusFreeArea.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          GSTOnAreaByMemberPercent: formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent,
          GSTOnAreaByDeveloperPercent: formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent
        };

        const response = await ProposedOfferService.apiCallAddUpdateGSTonExistingPlusFreeArea(payload);

        if (E.isRight(response)) {
          const isAdd = formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferGSTonExistingPlusFreeAreaData;
            setGSTonExistingPlusFreeAreaData(newRecord);
            setFormDataGSTonExistingPlusFreeArea({
              ...formDataGSTonExistingPlusFreeArea,
              ProposedOfferGSTonExistingPlusFreeAreaId: newRecord.ProposedOfferGSTonExistingPlusFreeAreaId || 0,
              Uniquekey: newRecord.Uniquekey || formDataGSTonExistingPlusFreeArea.Uniquekey
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferGSTonExistingPlusFreeAreaData;
            setGSTonExistingPlusFreeAreaData(updatedRecord);
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
      Number(formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId) === 0 ? 'Add GST on Existing Plus Free Area' : 'Update GST on Existing Plus Free Area'
    )
  };
  //#endregion

  //#region PROJECT COMPLETION

  const fetchProjectCompletionData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferProjectCompletionRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullProjectCompletion(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setProjectCompletionData(data);

          if (data) {
            setFormDataProjectCompletion({
              ProposedOfferProjectCompletionId: data.ProposedOfferProjectCompletionId || 0,
              Uniquekey: data.Uniquekey || initialFormStateProjectCompletion().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              CompletionTimelineMonths: data.CompletionTimelineMonths ?? 0,
              GracePeriodMonths: data.GracePeriodMonths ?? 0
            });
          } else {
            setFormDataProjectCompletion({
              ...initialFormStateProjectCompletion(),
              ProjectId: Number(projectId)
            });
          }
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
      'Loading Project Completion'
    );
  };

  const validateProjectCompletionForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataProjectCompletion.CompletionTimelineMonths) {
      newErrors.CompletionTimelineMonths = "Completion Timeline (Months) is required"
    }

    if (!formDataProjectCompletion.GracePeriodMonths) {
      newErrors.GracePeriodMonths = "Grace Period (Months) is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveProjectCompletion = async () => {

    if (buildingId === 0) {
      addToast({ type: "error", title: "Please select proper building first" });
      return
    }

    setErrorsProjectCompletion({})

    const validation = validateProjectCompletionForm()

    if (!validation.isValid) {
      setErrorsProjectCompletion(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferProjectCompletionRequest = {
          ProposedOfferProjectCompletionId: formDataProjectCompletion.ProposedOfferProjectCompletionId,
          Uniquekey: formDataProjectCompletion.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          CompletionTimelineMonths: formDataProjectCompletion.CompletionTimelineMonths,
          GracePeriodMonths: formDataProjectCompletion.GracePeriodMonths
        };

        const response = await ProposedOfferService.apiCallAddUpdateProjectCompletion(payload);

        if (E.isRight(response)) {
          const isAdd = formDataProjectCompletion.ProposedOfferProjectCompletionId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferProjectCompletionData;
            setProjectCompletionData(newRecord);
            setFormDataProjectCompletion({
              ...formDataProjectCompletion,
              ProposedOfferProjectCompletionId: newRecord.ProposedOfferProjectCompletionId || 0,
              Uniquekey: newRecord.Uniquekey || formDataProjectCompletion.Uniquekey
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferProjectCompletionData;
            setProjectCompletionData(updatedRecord);
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
      Number(formDataProjectCompletion.ProposedOfferProjectCompletionId) === 0 ? 'Add Project Completion' : 'Update Project Completion'
    )
  };
  //#endregion

  //#region PROPOSED PLAN

  const fetchProposedPlanData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferProposedPlanRequest = {
          ProjectId: projectId ?? undefined,
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullProposedPlan(params);

        if (E.isRight(response)) {
          const data = response.right.Data?.[0] || null;
          setProposedPlanData(data);

          if (data) {
            setFormDataProposedPlan({
              ProposedOfferProposedPlanId: data.ProposedOfferProposedPlanId || 0,
              Uniquekey: data.Uniquekey || initialFormStateProposedPlan().Uniquekey,
              BuildingId: buildingId,
              ProjectId: Number(projectId),
              TotalNumberOfFloors: data.TotalNumberOfFloors ?? 0,
              TotalUnits: data.TotalUnits ?? 0,
              PlanDocumentURL: null,
              RemovePlanDocumentURL: '',
              TotalParking: data.TotalParking ?? 0,
              Amenities: data.Amenities || ''
            });
          } else {
            setFormDataProposedPlan({
              ...initialFormStateProposedPlan(),
              ProjectId: Number(projectId)
            });
          }
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
      'Loading Proposed Plan'
    );
  };

  const validateProposedPlanForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataProposedPlan.TotalNumberOfFloors) {
      newErrors.TotalNumberOfFloors = "Total Number of Floors is required"
    }

    if (!formDataProposedPlan.TotalUnits) {
      newErrors.TotalUnits = "Total Units is required"
    }

    if (!formDataProposedPlan.TotalParking) {
      newErrors.TotalParking = "Total Parking is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSaveProposedPlan = async () => {
    setErrorsProposedPlan({})

    const validation = validateProposedPlanForm()

    if (!validation.isValid) {
      setErrorsProposedPlan(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const formDataPayload = new FormData();
        formDataPayload.append('ProposedOfferProposedPlanId', String(formDataProposedPlan.ProposedOfferProposedPlanId ?? 0));
        formDataPayload.append('Uniquekey', formDataProposedPlan.Uniquekey || '');
        formDataPayload.append('BuildingId', String(buildingId));
        formDataPayload.append('ProjectId', String(projectId));
        formDataPayload.append('TotalNumberOfFloors', String(formDataProposedPlan.TotalNumberOfFloors ?? 0));
        formDataPayload.append('TotalUnits', String(formDataProposedPlan.TotalUnits ?? 0));
        formDataPayload.append('TotalParking', String(formDataProposedPlan.TotalParking ?? 0));
        formDataPayload.append('Amenities', formDataProposedPlan.Amenities || '');
        formDataPayload.append('RemovePlanDocumentURL', formDataProposedPlan.RemovePlanDocumentURL || '');

        const response = await ProposedOfferService.apiCallAddUpdateProposedPlan(formDataPayload);

        if (E.isRight(response)) {
          const isAdd = formDataProposedPlan.ProposedOfferProposedPlanId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as ProposedOfferProposedPlanData;
            setProposedPlanData(newRecord);
            setFormDataProposedPlan({
              ...formDataProposedPlan,
              ProposedOfferProposedPlanId: newRecord.ProposedOfferProposedPlanId || 0,
              Uniquekey: newRecord.Uniquekey || formDataProposedPlan.Uniquekey
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as ProposedOfferProposedPlanData;
            setProposedPlanData(updatedRecord);
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
      Number(formDataProposedPlan.ProposedOfferProposedPlanId) === 0 ? 'Add Proposed Plan' : 'Update Proposed Plan'
    )
  };
  //#endregion

  //#region RENT DETAILS

  const fetchRentDetailsData = async () => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const params: FilterWithPaginationProposedOfferRentDetailsRequest = {
          ProjectId: Number(projectId),
          BuildingId: buildingId
        };

        const response = await ProposedOfferService.apiCallPullRentDetails(params);

        if (E.isRight(response)) {
          const data = response.right.Data || [];
          setRentDetailsList(data);
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
      'Loading Rent Details'
    );
  };



  const handleAddRentDetailsModal = () => {
    setEditingRentDetailsData(null);
    setFormDataRentDetails({
      ...initialFormStateRentDetails(),
      ProjectId: Number(projectId),
      BuildingId: buildingId
    });
    setErrorsRentDetails({});
    setIsAddUpdateRentDetailsModalOpen(true);
  };

  const handleEditRentDetails = useCallback((row: ProposedOfferRentDetailsData) => {
    setEditingRentDetailsData(row);
    setFormDataRentDetails({
      ProposedOfferRentDetailsId: row.ProposedOfferRentDetailsId || 0,
      Uniquekey: row.Uniquekey || initialFormStateRentDetails().Uniquekey,
      BuildingId: buildingId,
      ProjectId: Number(projectId),
      IsAdditionalRent: row.IsAdditionalRent ?? false,
      Type: row.Type || '',
      Tenure: row.Tenure || '',
      Amount: row.Amount ?? 0,
      UnitSqFtLumsum: row.UnitSqFtLumsum || '',
      CarpetAreaSqFt: row.CarpetAreaSqFt ?? 0,
      RentStartDate: row.RentStartDate || '',
      RentEndDate: row.RentEndDate || '',
      IsPayBrokerage: row.IsPayBrokerage ?? false
    });

    setErrorsRentDetails({});
    setIsAddUpdateRentDetailsModalOpen(true);
  }, [projectId]);


  const validateRentDetailsForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formDataRentDetails.Type?.trim()) {
      newErrors.Type = "Type is required"
    }

    if (formDataRentDetails.IsAdditionalRent === false && !formDataRentDetails.Tenure?.trim()) {
      newErrors.Tenure = "Tenure is required"
    }

    if (!formDataRentDetails.Amount) {
      newErrors.Amount = "Amount is required"
    }

    if (!formDataRentDetails.UnitSqFtLumsum?.trim()) {
      newErrors.UnitSqFtLumsum = "Unit / SqFt / Lumsum is required"
    }

    if (!formDataRentDetails.RentStartDate || formDataRentDetails.RentStartDate.trim() === "") {
      newErrors.RentStartDate = "Rent Start Date is required"
    }

    if (!formDataRentDetails.RentEndDate || formDataRentDetails.RentEndDate.trim() === "") {
      newErrors.RentEndDate = "Rent End Date is required"
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleAddUpdateRentDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsRentDetails({});

    const validation = validateRentDetailsForm();

    if (!validation.isValid) {
      setErrorsRentDetails(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const payload: AddUpdateProposedOfferRentDetailsRequest = {
          ProposedOfferRentDetailsId: formDataRentDetails.ProposedOfferRentDetailsId,
          Uniquekey: formDataRentDetails.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId),
          IsAdditionalRent: formDataRentDetails.IsAdditionalRent || false,
          Type: formDataRentDetails.Type || "",
          Tenure: formDataRentDetails.Tenure || "",
          Amount: formDataRentDetails.Amount || 0,
          UnitSqFtLumsum: formDataRentDetails.UnitSqFtLumsum || "",
          CarpetAreaSqFt: formDataRentDetails.CarpetAreaSqFt || 0,
          RentStartDate: formDataRentDetails.RentStartDate,
          RentEndDate: formDataRentDetails.RentEndDate,
          IsPayBrokerage: formDataRentDetails.IsPayBrokerage || false
        };

        const response = await ProposedOfferService.apiCallAddUpdateRentDetails(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsAddUpdateRentDetailsModalOpen(false);

          setEditingRentDetailsData(null);

          setFormDataRentDetails(initialFormStateRentDetails());

          setErrorsRentDetails({});

          fetchRentDetailsData();

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
      Number(formDataRentDetails.ProposedOfferRentDetailsId) === 0 ? 'Add Rent Details' : 'Update Rent Details'
    )
  };

  const handleConfirmationDialogBoxOpenRentDetails = useCallback((row: ProposedOfferRentDetailsData) => {
    setDeleteRentDetailsData(row);
    setIsConfirmationDialogBoxOpenRentDetails(true);
  }, []);

  const handleDeleteRentDetails = async () => {
    if (!deleteRentDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const payload: DeleteProposedOfferRentDetailsRequest = {
          ProposedOfferRentDetailsId: deleteRentDetailsData.ProposedOfferRentDetailsId || 0,
          Uniquekey: deleteRentDetailsData.Uniquekey,
          BuildingId: buildingId,
          ProjectId: Number(projectId)
        };

        const response = await ProposedOfferService.apiCallDeleteRentDetails(payload);

        if (E.isRight(response)) {

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpenRentDetails(false);

          setDeleteRentDetailsData(null);

          fetchRentDetailsData();

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
      'Delete Rent Details'
    )
  };


  const rentDetailsColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Type',
        label: 'Type',
        width: '15',
        sortable: false,
        align: 'left',
        fixed: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Tenure',
        label: 'Tenure',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Amount',
        label: 'Amount (₹)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value ? `₹${value}` : '-'
      },
      {
        key: 'UnitSqFtLumsum',
        label: 'Unit / Sq Ft / Lumsum',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'CarpetAreaSqFt',
        label: 'Carpet Area (Sq Ft)',
        width: '15',
        sortable: false,
        align: 'right',
        render: (value) => value ? `${value}` : '-'
      },
      {
        key: 'RentStartDate',
        label: 'Rent Start Date',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'RentEndDate',
        label: 'Rent End Date',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'IsAdditionalRent',
        label: 'Additional Rent',
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => value ? 'Yes' : 'No'
      },
      {
        key: 'IsPayBrokerage',
        label: 'Pay Brokerage',
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => value ? 'Yes' : 'No'
      },
      {
        key: 'Action',
        label: 'Action',
        width: '10',
        sortable: false,
        align: 'center',
        fixed: 'right',
        render: (_value, row) => (
          <div className="flex items-center justify-center gap-2">
            {canAction && (
              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditRentDetails(row);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleConfirmationDialogBoxOpenRentDetails(row);
                  }}
                  color="transparent"
                  isborderRadius
                  size="sm"
                  style={{ color: 'red' }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )
      }
    ],
    [canAction, handleEditRentDetails, handleConfirmationDialogBoxOpenRentDetails]
  );



  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>
      <div className="pb-5 flex">

        <div className="relative min-w-0 w-[526px]">

          <SingleSelectDropdownWithPagination
            label="Building"
            title="Select Building"
            size="lg"
            initialValue={selectedBuilding}
            dataFetchCallBack={fetchBuildingCallback}
            onSelected={(item) => {
              if (!item) return;
              setBuildingId(Number(item.value));
              setBuildingName(item.label);
            }}
          />

        </div>
      </div>
      <Tabs
        tabs={proposedOfferTabList}
        defaultActive={activeTab}
        onTabChange={(t) => {
          setActiveTab(t.id);
        }}
        islarge={true}
      />

      <div className="mt-6">
        {activeTab === 'ExtraCarpetArea'}
        {activeTab === 'CorpusDetails'}
        {activeTab === 'SecurityDeposit'}
        {activeTab === 'ShiftingDetails'}
        {activeTab === 'LienToSocietyDetails'}
        {activeTab === 'ParkingAllotment'}
        {activeTab === 'GSTonExistingPlusFreeArea'}
        {activeTab === 'ProjectCompletion'}
        {activeTab === 'RentDetails'}
        {activeTab === 'ProposedPlan'}
      </div>

      {activeTab === 'ExtraCarpetArea' && (
        <>
          <div className="space-y-6">
            {/* Basic Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Basic Details*
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <SinglePageSelection
                    label="Extra Carpet Area Type"
                    required
                    value={formDataExtraCarpetArea.ExtraCarpetAreaOfferedType}
                    onChange={(e) => handleFieldChangeExtraCarpetArea('ExtraCarpetAreaOfferedType', String(e))}

                    options={CARPET_AREA_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                    error={errors.ExtraCarpetAreaOfferedType}
                  />

                </div>
              </div>
            </div>

            {/* Percentage Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Percentage Details*
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Residential Extra Carpet (%)"
                    required
                    type="text"
                    value={formDataExtraCarpetArea.ResidentialExtraCarpetPercent || ''}
                    onChange={(e) => handleFieldChangeExtraCarpetArea('ResidentialExtraCarpetPercent', filterNumbersWithDecimal(e.target.value))}
                    error={errors.ResidentialExtraCarpetPercent}
                    placeholder="Enter Residential Extra Carpet %"
                  />
                </div>
                <div>
                  <Input
                    label="Commercial Extra Carpet (%)"
                    required
                    type="text"
                    value={formDataExtraCarpetArea.CommercialExtraCarpetPercent || ''}
                    onChange={(e) => handleFieldChangeExtraCarpetArea('CommercialExtraCarpetPercent', filterNumbersWithDecimal(e.target.value))}
                    error={errors.CommercialExtraCarpetPercent}
                    placeholder="Enter Commercial Extra Carpet %"
                  />
                </div>
              </div>
            </div>
          </div>

          <BottomActionBar
            cancelText="Cancel"
            saveText={(formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId && formDataExtraCarpetArea.ProposedOfferExtraCarpetAreaId > 0) ? 'Update' : 'Save'}
            onCancel={() => {
              setFormDataExtraCarpetArea({
                ...initialFormStateExtraCarpetArea(),
              });
              setErrors({});
            }}
            canAction={canAction}
            onSave={handleSaveExtraCarpetArea}
            isLoading={isLoading}
          />
        </>
      )}

      {activeTab === 'CorpusDetails' && (
        <>
          <div className="space-y-6">
            {/* Corpus Amount Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Corpus Amount Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Residential Corpus Amount (₹)"
                    required
                    type="text"
                    rightIcon="₹"
                    value={formDataCorpusDetails.CorpusOfferedToResidentialAmount || ''}
                    onChange={(e) =>

                      handleFieldChangeCorpusDetails('CorpusOfferedToResidentialAmount',
                        e.target.value === ''
                          ? null
                          : Number(filterNumbersWithDecimal(e.target.value))
                      )
                    }
                    error={errorsCorpusDetails.CorpusOfferedToResidentialAmount}
                    placeholder="Enter Residential Corpus Amount"
                  />
                </div>
                <div>
                  <Input
                    label="Commercial Corpus Amount (₹)"
                    required
                    type="text"
                    rightIcon="₹"
                    value={formDataCorpusDetails.CorpusOfferedToCommercialAmount || ''}

                    onChange={(e) => handleFieldChangeCorpusDetails('CorpusOfferedToCommercialAmount',
                      e.target.value === ''
                        ? null
                        : Number(filterNumbersWithDecimal(e.target.value)))}

                    error={errorsCorpusDetails.CorpusOfferedToCommercialAmount}
                    placeholder="Enter Commercial Corpus Amount"
                  />
                </div>
              </div>
            </div>

            {/* Corpus List Section */}
            <div className="space-y-4 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex-1 border-b border-gray-300 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Corpus List
                  </h3>
                </div>
                {canAction && (

                  <Button
                    onClick={handleAddCorpusPaymentStageModal}
                    color="blue"
                    size="sm"
                    title="Add Corpus"
                  >

                    Add Corpus
                  </Button>
                )}
              </div>
              <DataTable
                data={corpusPaymentStageList}
                columns={corpusPaymentStageColumns}
                emptyMessage="No Corpus Details Found"
                fixedHeight={false}
                recordsPerPage={20}
                className="min-w-full"
              />

            </div>
          </div>

          <BottomActionBar
            cancelText="Cancel"
            saveText={(formDataCorpusDetails.ProposedOfferCorpusDetailsId && formDataCorpusDetails.ProposedOfferCorpusDetailsId > 0) ? 'Update' : 'Save'}
            onCancel={() => {
              setFormDataCorpusDetails({
                ...initialFormStateCorpusDetails(),
              });
              setCorpusPaymentStageList([]);
              setErrorsCorpusDetails({});
              fetchCorpusDetailsData();
            }}
            canAction={canAction}
            onSave={handleSaveCorpusDetails}
            isLoading={isLoading}
          />
        </>
      )}

      {/* ADD UPDATE CORPUS PAYMENT STAGE MODAL */}
      <Modal
        isOpen={isAddUpdateCorpusPaymentStageModalOpen}
        onClose={() => {
          setIsAddUpdateCorpusPaymentStageModalOpen(false);
          setEditingCorpusPaymentStageData(null);
          setFormDataCorpusPaymentStage(initialFormStateCorpusPaymentStage());
          setErrorsCorpusPaymentStage({});
        }}
        onCancel={() => {
          setIsAddUpdateCorpusPaymentStageModalOpen(false);
          setEditingCorpusPaymentStageData(null);
          setFormDataCorpusPaymentStage(initialFormStateCorpusPaymentStage());
          setErrorsCorpusPaymentStage({});
        }}
        title={editingCorpusPaymentStageData ? 'Update Corpus Payment Stage' : 'Add Corpus Payment Stage'}
        onSubmit={handleAddUpdateCorpusPaymentStage}
        saveText={editingCorpusPaymentStageData ? 'Update' : 'Save'}
        cancelText="Cancel"
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Type"
                required
                value={formDataCorpusPaymentStage.Type || ''}
                onChange={(e) => {
                  const rawType = String(e);

                  handleFieldChangeCorpusPaymentStage('Type', rawType);

                  recalculateCorpusPaymentAmount(
                    rawType,
                    formDataCorpusPaymentStage.StagePercentage
                  );
                }}
                options={FLAT_UNIT_TYPE.map(opt => ({
                  label: opt.name,
                  value: opt.id
                }))}
                error={errorsCorpusPaymentStage.Type}
              />

            </div>
            <div>
              <Input
                label="Stage"
                required
                type="text"
                value={formDataCorpusPaymentStage.Stage || ''}
                onChange={(e) => handleFieldChangeCorpusPaymentStage('Stage', e.target.value)}
                error={errorsCorpusPaymentStage.Stage}
                placeholder="Enter Stage"
              />
            </div>
            <div>
              <Input
                label="Stage Percentage (%)"
                required
                type="text"
                rightIcon="%"
                value={
                  formDataCorpusPaymentStage.StagePercentageText ??
                  formDataCorpusPaymentStage.StagePercentage
                }
                onChange={(e) => {
                  const raw = filterNumbersWithDecimal(e.target.value);

                  handleFieldChangeCorpusPaymentStage('StagePercentageText', raw);

                  if (raw === '') {
                    handleFieldChangeCorpusPaymentStage('StagePercentage', null);
                    handleFieldChangeCorpusPaymentStage('Amount', null);
                    return;
                  }

                  const percent = Number(raw);
                  handleFieldChangeCorpusPaymentStage('StagePercentage', percent);

                  recalculateCorpusPaymentAmount(
                    formDataCorpusPaymentStage.Type,
                    percent
                  );
                }}
                error={errorsCorpusPaymentStage.StagePercentage}
                placeholder="Enter Stage Percentage"
              />
            </div>
            <div>
              <Input
                label="Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                disabled
                value={formDataCorpusPaymentStage.Amount || ''}
                error={errorsCorpusPaymentStage.Amount}
                placeholder="Calculated Amount"
                onChange={(e) => handleFieldChangeCorpusPaymentStage('Amount', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION CORPUS PAYMENT STAGE MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpenCorpusPaymentStage}
        onClose={() => {
          setIsConfirmationDialogBoxOpenCorpusPaymentStage(false);
          setDeleteCorpusPaymentStageData(null);
        }}
        onConfirm={handleDeleteCorpusPaymentStage}
        title="You are about to delete a corpus payment stage?"
        message="Deleting this corpus payment stage will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />

      {activeTab === 'SecurityDeposit' && (
        <>
          <div className="space-y-6">
            {/* Security Deposit Amount Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Security Deposit Amount Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Security Deposit Amount (₹)"
                    required
                    type="text"
                    value={formDataSecurityDepositDetails.SecurityDepositToSocietyAmount || ''}
                    onChange={(e) => handleFieldChangeSecurityDepositDetails('SecurityDepositToSocietyAmount', filterNumbersWithDecimal(e.target.value))}
                    error={errorsSecurityDepositDetails.SecurityDepositToSocietyAmount}
                    placeholder="Enter Security Deposit Amount"
                  />
                </div>
              </div>
            </div>

            {/* Security Deposit List Section */}
            <div className="space-y-4 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex-1 border-b border-gray-300 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Security Deposit List
                  </h3>
                </div>
                {canAction && (
                  <Button
                    onClick={handleAddSecurityDepositPaymentStageModal}
                    color="blue"
                    size="sm"
                    title="Add Security Deposit"
                  >

                    Add Security Deposit
                  </Button>
                )}
              </div>
              <DataTable
                data={securityDepositPaymentStageList}
                columns={securityDepositPaymentStageColumns}
                emptyMessage="No Security Deposit Details Found"
                fixedHeight={false}
                recordsPerPage={20}
                className="min-w-full"
              />

            </div>
          </div>
          <BottomActionBar
            cancelText="Cancel"
            saveText={(formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId && formDataSecurityDepositDetails.ProposedOfferSecurityDepositDetailsId > 0) ? 'Update' : 'Save'}
            onCancel={() => {
              setFormDataSecurityDepositDetails({
                ...initialFormStateSecurityDepositDetails(),
                ProjectId: Number(projectId)
              });
              setSecurityDepositPaymentStageList([]);
              setErrorsSecurityDepositDetails({});
              fetchSecurityDepositDetailsData();
            }}
            canAction={canAction}
            onSave={handleSaveSecurityDepositDetails}
            isLoading={isLoading}
          />
        </>
      )}

      {/* ADD UPDATE SECURITY DEPOSIT PAYMENT STAGE MODAL */}
      <Modal
        isOpen={isAddUpdateSecurityDepositPaymentStageModalOpen}
        onClose={() => {
          setIsAddUpdateSecurityDepositPaymentStageModalOpen(false);
          setEditingSecurityDepositPaymentStageData(null);
          setFormDataSecurityDepositPaymentStage(initialFormStateSecurityDepositPaymentStage());
          setErrorsSecurityDepositPaymentStage({});
        }}
        onCancel={() => {
          setIsAddUpdateSecurityDepositPaymentStageModalOpen(false);
          setEditingSecurityDepositPaymentStageData(null);
          setFormDataSecurityDepositPaymentStage(initialFormStateSecurityDepositPaymentStage());
          setErrorsSecurityDepositPaymentStage({});
        }}
        title={editingSecurityDepositPaymentStageData ? 'Update Security Deposit Payment Stage' : 'Add Security Deposit Payment Stage'}
        onSubmit={handleAddUpdateSecurityDepositPaymentStage}
        saveText={editingSecurityDepositPaymentStageData ? 'Update' : 'Save'}
        cancelText="Cancel"
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Type"
                required
                value={formDataSecurityDepositPaymentStage.Type || ''}
                onChange={(e) => handleFieldChangeSecurityDepositPaymentStage('Type', String(e))}
                options={FLAT_UNIT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsSecurityDepositPaymentStage.Type}
              />
            </div>
            <div>
              <Input
                label="Stage"
                required
                type="text"
                value={formDataSecurityDepositPaymentStage.Stage || ''}
                onChange={(e) => handleFieldChangeSecurityDepositPaymentStage('Stage', e.target.value)}
                error={errorsSecurityDepositPaymentStage.Stage}
                placeholder="Enter Stage"
              />
            </div>
            <div>
              <Input
                label="Amount (₹)"
                required
                type="text"
                value={formDataSecurityDepositPaymentStage.Amount}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeSecurityDepositPaymentStage('Amount', val);
                }}
                error={errorsSecurityDepositPaymentStage.Amount}
                placeholder="Enter Amount"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION SECURITY DEPOSIT PAYMENT STAGE MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpenSecurityDepositPaymentStage}
        onClose={() => {
          setIsConfirmationDialogBoxOpenSecurityDepositPaymentStage(false);
          setDeleteSecurityDepositPaymentStageData(null);
        }}
        onConfirm={handleDeleteSecurityDepositPaymentStage}
        title="You are about to delete a security deposit payment stage?"
        message="Deleting this security deposit payment stage will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />

      {activeTab === 'ShiftingDetails' && (

        <>
          <div className="space-y-6">
            {/* Shifting Amount Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Shifting Amount Details*
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Residential Shifting Amount (₹)"
                    required
                    type="text"
                    rightIcon="₹"
                    value={formDataShiftingDetails.ShiftingOfferedToResidentialAmount || ''}
                    onChange={(e) => handleFieldChangeShiftingDetails('ShiftingOfferedToResidentialAmount', filterNumbersWithDecimal(e.target.value))}
                    error={errorsShiftingDetails.ShiftingOfferedToResidentialAmount}
                    placeholder="Enter Residential Shifting Amount"
                  />
                </div>
                <div>
                  <Input
                    label="Commercial Shifting Amount (₹)"
                    required
                    type="text"
                    rightIcon="₹"
                    value={formDataShiftingDetails.ShiftingOfferedToCommercialAmount || ''}
                    onChange={(e) => handleFieldChangeShiftingDetails('ShiftingOfferedToCommercialAmount', filterNumbersWithDecimal(e.target.value))}
                    error={errorsShiftingDetails.ShiftingOfferedToCommercialAmount}
                    placeholder="Enter Commercial Shifting Amount"
                  />
                </div>
              </div>
            </div>

            {/* Shifting List Section */}
            <div className="space-y-4 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex-1 border-b border-gray-300 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Shifting List
                  </h3>
                </div>
                {canAction && (
                  <Button
                    onClick={handleAddShiftingPaymentStageModal}
                    color="blue"
                    size="sm"
                    title="Add Shifting"
                  >

                    Add Shifting
                  </Button>
                )}
              </div>
              <DataTable
                data={shiftingPaymentStageList}
                columns={shiftingPaymentStageColumns}
                emptyMessage="No Shifting Details Found"
                fixedHeight={false}
                recordsPerPage={20}
                className="min-w-full"
              />

            </div>
          </div>
          <BottomActionBar
            cancelText="Cancel"
            saveText={(formDataShiftingDetails.ProposedOfferShiftingDetailsId && formDataShiftingDetails.ProposedOfferShiftingDetailsId > 0) ? 'Update' : 'Save'}
            onCancel={() => {
              setFormDataShiftingDetails({
                ...initialFormStateShiftingDetails(),
                ProjectId: Number(projectId)
              });
              setShiftingPaymentStageList([]);
              setErrorsShiftingDetails({});
              fetchShiftingDetailsData();
            }}
            canAction={canAction}
            onSave={handleSaveShiftingDetails}
            isLoading={isLoading}
          />
        </>
      )}


      {/* ADD UPDATE SHIFTING PAYMENT STAGE MODAL */}
      <Modal
        isOpen={isAddUpdateShiftingPaymentStageModalOpen}
        onClose={() => {
          setIsAddUpdateShiftingPaymentStageModalOpen(false);
          setEditingShiftingPaymentStageData(null);
          setFormDataShiftingPaymentStage(initialFormStateShiftingPaymentStage());
          setErrorsShiftingPaymentStage({});
        }}
        onCancel={() => {
          setIsAddUpdateShiftingPaymentStageModalOpen(false);
          setEditingShiftingPaymentStageData(null);
          setFormDataShiftingPaymentStage(initialFormStateShiftingPaymentStage());
          setErrorsShiftingPaymentStage({});
        }}
        title={editingShiftingPaymentStageData ? 'Update Shifting Payment Stage' : 'Add Shifting Payment Stage'}
        onSubmit={handleAddUpdateShiftingPaymentStage}
        saveText={editingShiftingPaymentStageData ? 'Update' : 'Save'}
        cancelText="Cancel"
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Type"
                required
                value={formDataShiftingPaymentStage.Type || ''}

                onChange={(e) => {
                  const rawType = String(e);

                  handleFieldChangeShiftingPaymentStage('Type', rawType);

                  recalculateShiftingPaymentAmount(
                    rawType,
                    formDataShiftingPaymentStage.StagePercentage
                  );
                }}

                options={FLAT_UNIT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsShiftingPaymentStage.Type}
              />
            </div>
            <div>
              <Input
                label="Stage"
                required
                type="text"
                value={formDataShiftingPaymentStage.Stage || ''}
                onChange={(e) => handleFieldChangeShiftingPaymentStage('Stage', e.target.value)}
                error={errorsShiftingPaymentStage.Stage}
                placeholder="Enter Stage"
              />
            </div>
            <div>
              <Input
                label="Stage Percentage (%)"
                required
                type="text"
                rightIcon="%"
                value={
                  formDataShiftingPaymentStage.StagePercentageText ??
                  formDataShiftingPaymentStage.StagePercentage
                }
                onChange={(e) => {

                  const raw = filterNumbersWithDecimal(e.target.value);

                  handleFieldChangeShiftingPaymentStage('StagePercentageText', raw);

                  if (raw === '') {
                    handleFieldChangeShiftingPaymentStage('StagePercentage', null);
                    handleFieldChangeShiftingPaymentStage('Amount', null);
                    return;
                  }

                  const percent = Number(raw);

                  handleFieldChangeShiftingPaymentStage('StagePercentage', percent);

                  recalculateShiftingPaymentAmount(
                    formDataShiftingPaymentStage.Type,
                    percent
                  );
                }}
                error={errorsShiftingPaymentStage.StagePercentage}
                placeholder="Enter Stage Percentage"
              />

            </div>
            <div>
              <Input
                label="Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                disabled
                value={formDataShiftingPaymentStage.Amount || ''}
                onChange={(e) => handleFieldChangeShiftingPaymentStage('Amount', e.target.value)}
                error={errorsShiftingDetails.Amount}
                placeholder="Calculated Amount"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION SHIFTING PAYMENT STAGE MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpenShiftingPaymentStage}
        onClose={() => {
          setIsConfirmationDialogBoxOpenShiftingPaymentStage(false);
          setDeleteShiftingPaymentStageData(null);
        }}
        onConfirm={handleDeleteShiftingPaymentStage}
        title="You are about to delete a shifting payment stage?"
        message="Deleting this shifting payment stage will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />

      {activeTab === 'LienToSocietyDetails' && (
        <>
          <div className="space-y-6">
            {/* Lien to Society Area Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Lien to Society Area Details*
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Residential Area (Sq Ft)"
                    required
                    type="text"
                    value={formDataLienToSocietyDetails.ResidentialAreaSqFt || ''}
                    onChange={(e) => handleFieldChangeLienToSocietyDetails('ResidentialAreaSqFt', filterNumbersWithDecimal(e.target.value))}
                    error={errorsLienToSocietyDetails.ResidentialAreaSqFt}
                    placeholder="Enter Residential Area"
                  />
                </div>
                <div>
                  <Input
                    label="Number of Residential Lien Units"
                    required
                    type="text"
                    value={formDataLienToSocietyDetails.NumberOfResidentialLienUnits || ''}
                    onChange={(e) => handleFieldChangeLienToSocietyDetails('NumberOfResidentialLienUnits', filterNumbers(e.target.value))}
                    error={errorsLienToSocietyDetails.NumberOfResidentialLienUnits}
                    placeholder="Enter Number of Residential Lien Units"
                  />
                </div>
                <div>
                  <Input
                    label="Commercial Area (Sq Ft)"
                    required
                    type="text"
                    value={formDataLienToSocietyDetails.CommercialAreaSqFt || ''}
                    onChange={(e) => handleFieldChangeLienToSocietyDetails('CommercialAreaSqFt', filterNumbersWithDecimal(e.target.value))}
                    error={errorsLienToSocietyDetails.CommercialAreaSqFt}
                    placeholder="Enter Commercial Area"
                  />
                </div>
                <div>
                  <Input
                    label="Number of Commercial Lien Units"
                    required
                    type="text"
                    value={formDataLienToSocietyDetails.NumberOfCommercialLienUnits || ''}
                    onChange={(e) => handleFieldChangeLienToSocietyDetails('NumberOfCommercialLienUnits', filterNumbers(e.target.value))}
                    error={errorsLienToSocietyDetails.NumberOfCommercialLienUnits}
                    placeholder="Enter Number of Commercial Lien Units"
                  />
                </div>
              </div>
            </div>

            {/* Lien to Society List Section */}
            <div className="space-y-4 pb-5">
              <div className="flex items-center justify-between">

                <div className="flex-1 border-b border-gray-300 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lien to Society List
                  </h3>
                </div>
                {canAction && (
                  <Button
                    onClick={handleAddLienToSocietyPaymentStageModal}
                    color="blue"
                    size="sm"
                    title="Add Lien Details"
                  >

                    Add Lien Details
                  </Button>
                )}
              </div>
              <DataTable
                data={lienToSocietyPaymentStageList}
                columns={lienToSocietyPaymentStageColumns}
                emptyMessage="No Lien to Society Details Found"
                fixedHeight={false}
                recordsPerPage={20}
                className="min-w-full"
              />

            </div>
          </div>
          <BottomActionBar
            cancelText="Cancel"
            saveText={(formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId && formDataLienToSocietyDetails.ProposedOfferLienToSocietyDetailsId > 0) ? 'Update' : 'Save'}
            onCancel={() => {
              setFormDataLienToSocietyDetails({
                ...initialFormStateLienToSocietyDetails(),
                ProjectId: Number(projectId)
              });
              setLienToSocietyPaymentStageList([]);
              setErrorsLienToSocietyDetails({});
              fetchLienToSocietyDetailsData();
            }}
            canAction={canAction}
            onSave={handleSaveLienToSocietyDetails}
            isLoading={isLoading}
          />
        </>
      )}

      {/* ADD UPDATE LIEN TO SOCIETY PAYMENT STAGE MODAL */}
      <Modal
        isOpen={isAddUpdateLienToSocietyPaymentStageModalOpen}
        onClose={() => {
          setIsAddUpdateLienToSocietyPaymentStageModalOpen(false);
          setEditingLienToSocietyPaymentStageData(null);
          setFormDataLienToSocietyPaymentStage(initialFormStateLienToSocietyPaymentStage());
          setErrorsLienToSocietyPaymentStage({});
        }}
        onCancel={() => {
          setIsAddUpdateLienToSocietyPaymentStageModalOpen(false);
          setEditingLienToSocietyPaymentStageData(null);
          setFormDataLienToSocietyPaymentStage(initialFormStateLienToSocietyPaymentStage());
          setErrorsLienToSocietyPaymentStage({});
        }}
        title={editingLienToSocietyPaymentStageData ? 'Update Lien to Society Payment Stage' : 'Add Lien to Society Payment Stage'}
        onSubmit={handleAddUpdateLienToSocietyPaymentStage}
        saveText={editingLienToSocietyPaymentStageData ? 'Update' : 'Save'}
        cancelText="Cancel"
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Type"
                required
                value={formDataLienToSocietyPaymentStage.Type || ''}
                onChange={(e) => handleFieldChangeLienToSocietyPaymentStage('Type', String(e))}
                options={FLAT_UNIT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsLienToSocietyPaymentStage.Type}
              />
            </div>
            <div>
              <Input
                label="Stage"
                required
                type="text"
                value={formDataLienToSocietyPaymentStage.Stage || ''}
                onChange={(e) => handleFieldChangeLienToSocietyPaymentStage('Stage', e.target.value)}
                error={errorsLienToSocietyPaymentStage.Stage}
                placeholder="Enter Stage"
              />
            </div>
            <div>
              <Input
                label="Carpet Area (Sq Ft)"
                required
                type="text"
                value={formDataLienToSocietyPaymentStage.CarpetAreaSqFt || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeLienToSocietyPaymentStage('CarpetAreaSqFt', val);
                }}
                error={errorsLienToSocietyPaymentStage.CarpetAreaSqFt}
                placeholder="Enter Carpet Area"
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                label="Is Release"
                checked={formDataLienToSocietyPaymentStage.IsRelease ?? false}
                onChange={(e) => handleFieldChangeLienToSocietyPaymentStage('IsRelease', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION LIEN TO SOCIETY PAYMENT STAGE MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpenLienToSocietyPaymentStage}
        onClose={() => {
          setIsConfirmationDialogBoxOpenLienToSocietyPaymentStage(false);
          setDeleteLienToSocietyPaymentStageData(null);
        }}
        onConfirm={handleDeleteLienToSocietyPaymentStage}
        title="You are about to delete a lien to society payment stage?"
        message="Deleting this lien to society payment stage will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />

      {activeTab === 'ParkingAllotment' && (
        <>
          <div className="space-y-6">
            {/* Parking Allotment Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Parking Allotment Details*
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Number of Parking Allotted to Members"
                    required
                    type="text"
                    value={formDataParkingAllotment.NumberOfParkingAllottedToMembers || ''}
                    onChange={(e) => handleFieldChangeParkingAllotment('NumberOfParkingAllottedToMembers', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                    error={errorsParkingAllotment.NumberOfParkingAllottedToMembers}
                    placeholder="Enter Number of Parking Allotted to Members"
                  />
                </div>
                <div>
                  <Input
                    label="Total Parking Percentage Allotted to Society (%)"
                    required
                    type="text"
                    rightIcon="%"
                    value={formDataParkingAllotment.TotalParkingPercentageAllottedToSociety || ''}
                    onChange={(e) => handleFieldChangeParkingAllotment('TotalParkingPercentageAllottedToSociety', filterNumbersWithDecimal(e.target.value))}
                    error={errorsParkingAllotment.TotalParkingPercentageAllottedToSociety}
                    placeholder="Enter Total Parking Percentage"
                  />
                </div>
              </div>
            </div>
          </div>
          <BottomActionBar
            cancelText="Cancel"
            saveText={(formDataParkingAllotment.ProposedOfferParkingAllotmentId && formDataParkingAllotment.ProposedOfferParkingAllotmentId > 0) ? 'Update' : 'Save'}
            onCancel={() => {
              setFormDataParkingAllotment({
                ...initialFormStateParkingAllotment(),
                ProjectId: Number(projectId)
              });
              setErrorsParkingAllotment({});
              fetchParkingAllotmentData();
            }}
            canAction={canAction}
            onSave={handleSaveParkingAllotment}
            isLoading={isLoading}
          />
        </>
      )}

      {activeTab === 'GSTonExistingPlusFreeArea' && (
        <>
          <div className="space-y-6">
            {/* GST on Existing Plus Free Area Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                GST on Existing Plus Free Area Details*
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="GST on Area by Member (%)"
                    required
                    type="text"
                    rightIcon="%"
                    value={formDataGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent || ''}
                    onChange={(e) => handleFieldChangeGSTonExistingPlusFreeArea('GSTOnAreaByMemberPercent', filterNumbersWithDecimal(e.target.value))}
                    error={errorsGSTonExistingPlusFreeArea.GSTOnAreaByMemberPercent}
                    placeholder="Enter GST on Area by Member Percent"
                  />
                </div>
                <div>
                  <Input
                    label="GST on Area by Developer (%)"
                    required
                    type="text"
                    rightIcon="%"
                    value={formDataGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent || ''}
                    onChange={(e) => handleFieldChangeGSTonExistingPlusFreeArea('GSTOnAreaByDeveloperPercent', filterNumbersWithDecimal(e.target.value))}
                    error={errorsGSTonExistingPlusFreeArea.GSTOnAreaByDeveloperPercent}
                    placeholder="Enter GST on Area by Developer Percent"
                  />
                </div>
              </div>
            </div>
          </div>
          <BottomActionBar
            cancelText="Cancel"
            saveText={(formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId && formDataGSTonExistingPlusFreeArea.ProposedOfferGSTonExistingPlusFreeAreaId > 0) ? 'Update' : 'Save'}
            onCancel={() => {
              setFormDataGSTonExistingPlusFreeArea({
                ...initialFormStateGSTonExistingPlusFreeArea(),
                ProjectId: Number(projectId)
              });
              setErrorsGSTonExistingPlusFreeArea({});
              fetchGSTonExistingPlusFreeAreaData();
            }}
            canAction={canAction}
            onSave={handleSaveGSTonExistingPlusFreeArea}
            isLoading={isLoading}
          />
        </>
      )}

      {activeTab === 'ProjectCompletion' && (
        <>
          <div className="space-y-6">
            {/* Project Completion Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Project Completion Details*
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Completion Timeline (Months)"
                    required
                    type="text"
                    value={formDataProjectCompletion.CompletionTimelineMonths || ''}
                    onChange={(e) => handleFieldChangeProjectCompletion('CompletionTimelineMonths', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                    error={errorsProjectCompletion.CompletionTimelineMonths}
                    placeholder="Enter Completion Timeline in Months"
                  />
                </div>
                <div>
                  <Input
                    label="Grace Period (Months)"
                    required
                    type="text"
                    value={formDataProjectCompletion.GracePeriodMonths || ''}
                    onChange={(e) => handleFieldChangeProjectCompletion('GracePeriodMonths', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                    error={errorsProjectCompletion.GracePeriodMonths}
                    placeholder="Enter Grace Period in Months"
                  />
                </div>
              </div>
            </div>
          </div>
          <BottomActionBar
            cancelText="Cancel"
            saveText={(formDataProjectCompletion.ProposedOfferProjectCompletionId && formDataProjectCompletion.ProposedOfferProjectCompletionId > 0) ? 'Update' : 'Save'}
            onCancel={() => {
              setFormDataProjectCompletion({
                ...initialFormStateProjectCompletion(),
                ProjectId: Number(projectId)
              });
              setErrorsProjectCompletion({});
              fetchProjectCompletionData();
            }}
            canAction={canAction}
            onSave={handleSaveProjectCompletion}
            isLoading={isLoading}
          />
        </>
      )}

      {activeTab === 'RentDetails' && (

        <div className="space-y-6">
          {/* Rent Details List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 border-b border-gray-300 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rent Details List
                </h3>
              </div>
              {canAction && (
                <Button
                  onClick={handleAddRentDetailsModal}
                  color="blue"
                  size="sm"
                  title="Add Rent Details"
                >

                  Add Rent Details
                </Button>
              )}
            </div>

            <DataTable
              data={rentDetailsList}
              columns={rentDetailsColumns}
              emptyMessage="No Rent Details Found"
              fixedHeight={false}
              recordsPerPage={20}
              className="min-w-full"
            />

          </div>
        </div>
      )}
      {/* ADD UPDATE RENT DETAILS MODAL */}
      <Modal
        isOpen={isAddUpdateRentDetailsModalOpen}
        onClose={() => {
          setIsAddUpdateRentDetailsModalOpen(false);
          setEditingRentDetailsData(null);
          setFormDataRentDetails(initialFormStateRentDetails());
          setErrorsRentDetails({});
        }}
        onCancel={() => {
          setIsAddUpdateRentDetailsModalOpen(false);
          setEditingRentDetailsData(null);
          setFormDataRentDetails(initialFormStateRentDetails());
          setErrorsRentDetails({});
        }}
        title={editingRentDetailsData ? 'Update Rent Details' : 'Add Rent Details'}
        onSubmit={handleAddUpdateRentDetails}
        saveText={editingRentDetailsData ? 'Update' : 'Save'}
        cancelText="Cancel"
        loading={isLoading}
        size='lg'
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Checkbox
                label="Is Additional Rent"
                checked={!!formDataRentDetails.IsAdditionalRent}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormDataRentDetails(prev => ({
                    ...prev,
                    IsAdditionalRent: checked,
                    IsPayBrokerage: checked ? false : prev.IsPayBrokerage
                  }));
                }}
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                label="Is Pay Brokerage"
                checked={!!formDataRentDetails.IsPayBrokerage}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormDataRentDetails(prev => ({
                    ...prev,
                    IsPayBrokerage: checked,
                    IsAdditionalRent: checked ? false : prev.IsAdditionalRent
                  }));
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Type"
                required
                value={formDataRentDetails.Type || ''}
                onChange={(e) => handleFieldChangeRentDetails('Type', String(e))}
                options={FLAT_UNIT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsRentDetails.Type}
              />
            </div>

            {formDataRentDetails.IsAdditionalRent ? "" :
              <div>
                <SinglePageSelection
                  label="Tenure"
                  required
                  value={formDataRentDetails.Tenure || ''}
                  onChange={(e) => handleFieldChangeRentDetails('Tenure', String(e))}
                  options={TENURE.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errorsRentDetails.Tenure}
                />
              </div>
            }
            <div>
              <Input
                label="Amount (₹)"
                required
                type="text"
                rightIcon="₹"
                value={formDataRentDetails.Amount || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeRentDetails('Amount', val);
                }}
                error={errorsRentDetails.Amount}
                placeholder="Enter Amount"
              />
            </div>
            <div>
              <SinglePageSelection
                label="Unit / Sq Ft / Lumsum"
                required
                value={formDataRentDetails.UnitSqFtLumsum || ''}
                onChange={(e) => handleFieldChangeRentDetails('UnitSqFtLumsum', String(e))}
                options={UNIT_SQFT_LUMPSUM.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsRentDetails.UnitSqFtLumsum}
              />
            </div>
            <div>
              <Input
                label="Carpet Area (Sq Ft)"
                required
                type="text"
                value={formDataRentDetails.CarpetAreaSqFt || ''}
                onChange={(e) => {
                  const val = filterNumbersWithDecimal(e.target.value);
                  handleFieldChangeRentDetails('CarpetAreaSqFt', val);
                }}
                error={errorsRentDetails.CarpetAreaSqFt}
                placeholder="Enter Carpet Area"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>

                <DatePickerInput
                  label="Rent Start Date *"
                  value={formatDate_dd_mm_yyyy(formDataRentDetails.RentStartDate)}
                  error={errorsRentDetails.RentStartDate}
                  onChange={(val) => handleFieldChangeRentDetails('RentStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
              </div>
              <div>
                <DatePickerInput
                  label="Rent End Date *"
                  value={formatDate_dd_mm_yyyy(formDataRentDetails.RentEndDate)}
                  error={errorsRentDetails.RentEndDate}
                  onChange={(val) => handleFieldChangeRentDetails('RentEndDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                />
              </div>
            </div>

          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION RENT DETAILS MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpenRentDetails}
        onClose={() => {
          setIsConfirmationDialogBoxOpenRentDetails(false);
          setDeleteRentDetailsData(null);
        }}
        onConfirm={handleDeleteRentDetails}
        title="You are about to delete rent details?"
        message="Deleting this rent details will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />

      {activeTab === 'ProposedPlan' && (
        <>
          <div className="space-y-6">
            {/* Proposed Plan Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Proposed Plan Details*
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Total Number of Floors"
                    required
                    type="text"
                    value={formDataProposedPlan.TotalNumberOfFloors || ''}
                    onChange={(e) => handleFieldChangeProposedPlan('TotalNumberOfFloors', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                    error={errorsProposedPlan.TotalNumberOfFloors}
                    placeholder="Enter Total Number of Floors"
                  />
                </div>
                <div>
                  <Input
                    label="Total Units"
                    required
                    type="text"
                    value={formDataProposedPlan.TotalUnits || ''}
                    onChange={(e) => handleFieldChangeProposedPlan('TotalUnits', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                    error={errorsProposedPlan.TotalUnits}
                    placeholder="Enter Total Units"
                  />
                </div>
                <div>
                  <Input
                    label="Total Parking"
                    required
                    type="text"
                    value={formDataProposedPlan.TotalParking || ''}
                    onChange={(e) => handleFieldChangeProposedPlan('TotalParking', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                    error={errorsProposedPlan.TotalParking}
                    placeholder="Enter Total Parking"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <Input
                    label="Amenities"
                    type="text"
                    value={formDataProposedPlan.Amenities || ''}
                    onChange={(e) => handleFieldChangeProposedPlan('Amenities', e.target.value)}
                    error={errorsProposedPlan.Amenities}
                    placeholder="Enter Amenities"
                  />
                </div>
              </div>
            </div>
          </div>
          <BottomActionBar
            cancelText="Cancel"
            saveText={(formDataProposedPlan.ProposedOfferProposedPlanId && formDataProposedPlan.ProposedOfferProposedPlanId > 0) ? 'Update' : 'Save'}
            onCancel={() => {
              setFormDataProposedPlan({
                ...initialFormStateProposedPlan(),
                ProjectId: Number(projectId)
              });
              setErrorsProposedPlan({});
              fetchProposedPlanData();
            }}
            canAction={canAction}
            onSave={handleSaveProposedPlan}
            isLoading={isLoading}
          />
        </>
      )}


    </div>
  );
};

export default ProposedOffer;
