import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { tenantService } from "@/features/tenant/services/TenantService";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import type { AddUpdateTenantApplicant, AddUpdateTenantRequest, FilterWithPaginationTenantRequest, TenantApplicant, TenantData } from "@/features/tenant/models/TenantModel";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { APPLICANT_TYPE, COMMERCIAL_FLAT_CONFIGURATION, FLAT_UNIT_FACING, FLAT_UNIT_TYPE, RESIDENTIAL_FLAT_CONFIGURATION } from "@/core/constants";
import { allowPercentage, calculateMergedFiles, calculateRemovedFiles, createFileUrlString, filterAadhaar, filterDrivingLicenseNumber, filterEmail, filterGST, filterIFSC, filterLetters, filterMobile, filterNumbers, filterNumbersWithDecimal, filterPAN, filterPassportNumber, filterVoterId, isValidAadhaar, isValidAccount, isValidDrivingLicenseNumber, isValidEmail, isValidGST, isValidIFSC, isValidMobile, isValidPAN, isValidPassportNumber, isValidVoterId, mergeFiles } from "@/core/utils/fileValidation";
import { Button } from "@/ui/components/forms";
import { Edit, IdCardIcon, Trash2 } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { useTenantListState } from "@/features/tenant/context/TenantListStateContext";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";


const initialFormState = (): AddUpdateTenantRequest => ({
  TenantId: 0,
  Uniquekey: null,
  BuildingId: 0,
  ProjectId: 0,
  FlatNumber: "",
  FlatCarpetAreaSqFt: null,
  Facing: "",
  FlatType: "",
  FlatConfiguration: "",
  FreeAreaOfferedPercent: null,
  ExtraAreaPurchasedSqFt: null,
  TotalAreaSqFt: null,
});

const initialFormStateApplicantDetails = (): AddUpdateTenantApplicant => ({
  TenantApplicantId: 0,
  TenantId: 0,
  BuildingId: 0,
  ProjectId: 0,

  ApplicantType: '',
  ApplicantName: '',
  ApplicantMobileNumber: '',
  ApplicantEmailId: '',

  // Photo
  PhotoURL: null,
  RemovePhotoURL: '',

  // Aadhar
  AadharCardNumber: '',
  AadharCardURL: null,
  RemoveAadharCardURL: '',

  // PAN
  PanNumber: '',
  PanCardURL: null,
  RemovePanCardURL: '',

  // Passport
  PassportNumber: '',
  PassportURL: null,
  RemovePassportURL: '',

  // Driving License
  DrivingLicenseNumber: '',
  DrivingLicenseURL: null,
  RemoveDrivingLicenseURL: '',

  // Voting ID
  VotingIdNumber: '',
  VotingIdURL: null,
  RemoveVotingIdURL: '',

  // GST
  GSTNumber: '',
  GSTNumberURL: null,
  RemoveGSTNumberURL: '',

  // Bank Details
  BankListMasterId: 0,
  AccountNumber: '',
  IFSCCode: '',
  ChequeURL: null,
  RemoveChequeURL: ''
});


// --- add after imports, before component ---
type TenantApplicantWithFiles = TenantApplicant & {
  _photoFiles?: (File | string)[];
  _aadharFiles?: (File | string)[];
  _panFiles?: (File | string)[];
  _passportFiles?: (File | string)[];
  _drivingFiles?: (File | string)[];
  _votingFiles?: (File | string)[];
  _gstFiles?: (File | string)[];
  _chequeFiles?: (File | string)[];
  RemovePhotoURL?: string;
  RemoveAadharCardURL?: string;
  RemovePanCardURL?: string;
  RemovePassportURL?: string;
  RemoveDrivingLicenseURL?: string;
  RemoveVotingIdURL?: string;
  RemoveGSTNumberURL?: string;
  RemoveChequeURL?: string;
};


const AddUpdateTenant: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateTenantRequest>(() => initialFormState());
  const [applicantList, setApplicantList] = useState<TenantApplicantWithFiles[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();

  //GET VALUE FROM URL :TENANTID
  const { tenantId } = useParams<{ tenantId?: string }>();

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject()
  //#endregion

  //#region TENANT LIST STATE CONTEXT
  const { listState } = useTenantListState();
  const { buildingId, buildingName, tenantName } = listState;
  //#endregion

  //#region  TENANT APPLICANT

  //SET DROP DOWN 
  const [dropdownLabels, setDropdownLabels] = useState<{
    bankName?: string;
  }>({});

  const [formDataForApplicant, setFormDataForApplicant] = useState<AddUpdateTenantApplicant>(() => initialFormStateApplicantDetails());

  const [editingApplicantData, setEditingApplicantData] = useState<{ row: TenantApplicantWithFiles; index: number } | null>(null);

  const [isAddUpdateApplicantModalOpen, setIsAddUpdateApplicantModalOpen] = useState(false)


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

  // ================= CHEQUE =================
  const [chequeFiles, setChequeFiles] = useState<(File | string)[]>([]);
  const [removedChequeURLs, setRemovedChequeURLs] = useState<string[]>([]);

  //ERROR SET UP
  const [errorsTenantApplicant, setErrorsTenantApplicant] = useState<{ [k: string]: string }>({});


  //DELETE TENANT APPLICANT STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteTenantApplicantData, setDeleteTenantApplicantData] = useState<{ row: TenantApplicantWithFiles; index: number } | null>(null);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/tenant');
  //#endregion

  //#region HANDLE FILED CHNAGE EVENT
  const handleFieldChange = (field: keyof AddUpdateTenantRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      await fetchTenantDetails();

    })
      ();
  }, [tenantId /* + any stable deps */]);


  //#endregion

  //#region FETCH TENANT DETAILS
  const fetchTenantDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationTenantRequest = {
          PageNumber: 1,
          PageSize: 1,
          IsCheckPermission: false,
          TenantId: Number(tenantId),
          ProjectId: Number(projectId),
          BuildingId: buildingId
        }

        const response = await tenantService.apiCallPullTenant(params);

        if (E.isRight(response)) {

          const tenant = response.right.Data?.[0] as TenantData | undefined;

          if (tenant) {

            setFormData(prev => ({
              ...prev,
              TenantId: tenant.TenantId ?? prev.TenantId,
              Uniquekey: tenant.Uniquekey ?? prev.Uniquekey,
              BuildingId: Number(buildingId),
              ProjectId: tenant.ProjectId ?? prev.ProjectId,
              FlatNumber: tenant.FlatNumber ?? prev.FlatNumber,
              FlatCarpetAreaSqFt: tenant.FlatCarpetAreaSqFt ?? prev.FlatCarpetAreaSqFt,
              Facing: tenant.Facing ?? prev.Facing,
              FlatType: tenant.FlatType ?? prev.FlatType,
              FlatConfiguration: tenant.FlatConfiguration ?? prev.FlatConfiguration,
              FreeAreaOfferedPercent: tenant.FreeAreaOfferedPercent ?? prev.FreeAreaOfferedPercent,
              ExtraAreaPurchasedSqFt: tenant.ExtraAreaPurchasedSqFt ?? prev.ExtraAreaPurchasedSqFt,
              TotalAreaSqFt: tenant.TotalAreaSqFt ?? prev.TotalAreaSqFt,
            }));


            const applicantsWithFiles = (tenant?.TenantApplicantData || []).map(a => ({
              ...a,
              // parseDocumentUrls returns array of filenames/URLs (strings)
              _photoFiles: parseDocumentUrls(a.PhotoURL ?? ''),
              _aadharFiles: parseDocumentUrls(a.AadharCardURL ?? ''),
              _panFiles: parseDocumentUrls(a.PanCardURL ?? ''),
              _passportFiles: parseDocumentUrls(a.PassportURL ?? ''),
              _drivingFiles: parseDocumentUrls(a.DrivingLicenseURL ?? ''),
              _votingFiles: parseDocumentUrls(a.VotingIdURL ?? ''),
              _gstFiles: parseDocumentUrls(a.GSTNumberURL ?? ''),
              _chequeFiles: parseDocumentUrls(a.ChequeURL ?? ''),
            }));

            setApplicantList(applicantsWithFiles);
            setDropdownLabels({
              bankName: tenant?.TenantApplicantData[0].BankName || "",
            });
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
      'Loading Tenant Data'
    )
  }
  //#endregion

  //#region TENANT MASTER VALIDATION | ADD | UPDATE ACTION
  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddTenantForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}


    if (!formData.FlatNumber?.trim()) {
      newErrors.FlatNumber = 'Unit / Annexure / Survey Number is required.'
    } else if (formData.FlatNumber.trim().length > 15) {
      newErrors.FlatNumber = 'Unit / Annexure / Survey Number must be at most 50 characters'
    }

    if (!formData.FlatType?.trim()) {
      newErrors.FlatType = 'Unit Type is required.'
    }

    if (formData.TotalAreaSqFt != null && formData.TotalAreaSqFt < 0) {
      newErrors.TotalAreaSqFt = 'Total area must be positive';
    }
    if (formData.FlatType?.trim().toUpperCase() !== 'GYM') {
      if (!formData.FlatConfiguration?.trim()) {
        newErrors.FlatConfiguration = 'Unit Configuration is required.'
      }
    }

    if (!formData.Facing?.trim()) {
      newErrors.Facing = 'Unit Facing is required.'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const handleSubmit = async () => {

    const countPrimaryApplicants = () =>
      applicantList.filter(a =>
        String(a.ApplicantType ?? '').toUpperCase() === 'APPLICANT'
      ).length;

    if (applicantList.length === 0) {
      addToast({ type: 'error', title: "Atleast one applicant is required" });
      return
    }
    else if (countPrimaryApplicants() === 0) {

      addToast({ type: 'error', title: "In Applicant List - One Applicant is required" });
      return

    }


    setErrors({})


    const validation = validateAddTenantForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = buildMultipartFormData();

        const response = await tenantService.apiCallAddUpdateTenant(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: response.right.SuccessMessage[0] });

          navigate("/tenant", {
            state: { listState }
          });

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

      Number(tenantId) === 0 ? 'Add Tenant' : 'Update Tenant'
    )

  };

  //#endregion

  //#region EDIT TENANT APPLICANT

  const handleEditApplicant = useCallback((row: TenantApplicantWithFiles, index: number) => {

    const applicantData: AddUpdateTenantApplicant = {
      TenantApplicantId: row.TenantApplicantId ?? 0,
      TenantId: row.TenantId ?? 0,
      BuildingId: Number(buildingId),
      ProjectId: row.ProjectId ?? 0,
      ApplicantType: row.ApplicantType || '',
      ApplicantName: row.ApplicantName || '',
      ApplicantMobileNumber: row.ApplicantMobileNumber || '',
      ApplicantEmailId: row.ApplicantEmailId || '',
      RemovePhotoURL: '',
      AadharCardNumber: row.AadharCardNumber || '',
      RemoveAadharCardURL: '',
      PanNumber: row.PanNumber || '',
      RemovePanCardURL: '',
      PassportNumber: row.PassportNumber || '',
      RemovePassportURL: '',
      DrivingLicenseNumber: row.DrivingLicenseNumber || '',
      RemoveDrivingLicenseURL: '',
      VotingIdNumber: row.VotingIdNumber || '',
      RemoveVotingIdURL: '',
      GSTNumber: row.GSTNumber || '',
      RemoveGSTNumberURL: '',
      BankListMasterId: row.BankListMasterId ?? 0,
      AccountNumber: row.AccountNumber || '',
      IFSCCode: row.IFSCCode || '',
      RemoveChequeURL: '',

      PhotoURL: null,
      AadharCardURL: null,
      PanCardURL: null,
      PassportURL: null,
      DrivingLicenseURL: null,
      VotingIdURL: null,
      GSTNumberURL: null,
      ChequeURL: null
    };


    setEditingApplicantData({ row, index });
    setFormDataForApplicant(applicantData);

    // PHOTO
    setApplicantPhotoFiles(row._photoFiles ?? []);
    setRemovedApplicantPhotoURLs([]);

    // AADHAR
    setAadharCardFiles(row._aadharFiles ?? []);
    setRemovedAadharCardURLs([]);

    // PAN
    setPanCardFiles(row._panFiles ?? []);
    setRemovedPanCardURLs([]);

    // PASSPORT
    setPassportFiles(row._passportFiles ?? []);
    setRemovedPassportURLs([]);

    // DL
    setDrivingLicenseFiles(row._drivingFiles ?? []);
    setRemovedDrivingLicenseURLs([]);

    // VOTER
    setVotingIdFiles(row._votingFiles ?? []);
    setRemovedVotingIdURLs([]);

    // GST
    setGstFiles(row._gstFiles ?? []);
    setRemovedGstURLs([]);

    // CHEQUE
    setChequeFiles(row._chequeFiles ?? []);
    setRemovedChequeURLs([]);

    setIsAddUpdateApplicantModalOpen(true);
  }, []);
  //#endregion
  //#region DELETE TENANT APPLICANT CONFIRMATION DIALOG
  const handleConfirmationDialogBoxOpen = (row: TenantApplicantWithFiles, index: number) => {
    setDeleteTenantApplicantData({ row, index });
    setIsConfirmationDialogBoxOpen(true)
  }
  //#endregion
  //#region APPLICANT TABLE COLUMN
  const applicantColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ApplicantName',
        label: 'Applicant Name',
        width: '15',
        sortable: false,
        align: 'left',
        fixed: 'left',
        render: (value, row) => {
          return (

            <MultiImageViewer
              images={parseDocumentUrls(row.PhotoURL)}
              title="Applicant Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />

          );
        }
      },

      {
        key: 'ApplicantType',
        label: 'Type',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'ApplicantMobileNumber',
        label: 'Mobile Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'ApplicantEmailId',
        label: 'Email Id',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'AadharCardNumber',
        label: 'Aadhaar',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.AadharCardURL)}
              title="Aadhar Card Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }
      },
      {
        key: 'PanNumber',
        label: 'PAN',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {

          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.PanCardURL)}
              title="Pan Card Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }
      },
      {
        key: 'PassportNumber',
        label: 'Passport',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.PassportURL)}
              title="Passport Number Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }
      },

      {
        key: 'DrivingLicenseNumber',
        label: 'Driving License',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.DrivingLicenseURL)}
              title="Driving License Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }
      },
      {
        key: 'VotingIdNumber',
        label: 'Voting',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.VotingIdURL)}
              title="Voting Id Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }
      },
      {
        key: 'GSTNumber',
        label: 'GST',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.GSTNumberURL)}
              title="GST Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }
      },

      {
        key: 'BankName',
        label: 'Bank',
        width: '25',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },

      {
        key: 'AccountNumber',
        label: 'Account Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.ChequeURL)}
              title="Cheque Document"
              triggerLabel={value || '-'}
              isWrap={false}
            />
          );
        }

      },
      {
        key: 'IFSCCode',
        label: 'IFSC',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center',
        render: (_value, row, index) => (
          canAction ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleEditApplicant(row, index)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                title="Edit Applicant"
                leftIcon={<Edit className="h-4 w-4" />}
              >
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleConfirmationDialogBoxOpen(row, index);

                }}
                color="transparent"
                isborderRadius
                size="sm"
                style={{ color: 'red' }}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null


        )
      }


    ],
    [handleEditApplicant, handleConfirmationDialogBoxOpen, applicantList]

  );
  //#endregion
  //#region HANDLE CHNAGE EVENT WHEN INPUT BOX ANY OTHER
  const handleFieldChangeTenantApplicant = (field: keyof AddUpdateTenantApplicant, value: any) => {

    setFormDataForApplicant((prev) => ({ ...prev, [field]: value }));

    if (errorsTenantApplicant[field]) {
      setErrorsTenantApplicant((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //#endregion 
  //#region ADD UPDATE TENANT APPLICANT

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddApplicantForm = (): {

    isValid: boolean

    errorsTenantApplicant: { [key: string]: string }

  } => {
    const newErrorsTenantApplicant: { [key: string]: string } = {}

    const countPrimaryApplicants = () =>
      applicantList.filter(a =>
        String(a.ApplicantType ?? '').toUpperCase() === 'APPLICANT'
        && a.ApplicantMobileNumber !== formDataForApplicant.ApplicantMobileNumber
      ).length;

    if (String(formDataForApplicant.ApplicantType ?? '').toUpperCase() === "APPLICANT") {
      if (countPrimaryApplicants() >= 1) {
        newErrorsTenantApplicant.ApplicantType = "Only one primary applicant is allowed.";
      }
    }

    if (!formDataForApplicant.ApplicantType?.trim()) {
      newErrorsTenantApplicant.ApplicantType = 'Applicant Type is required'
    }

    if (!formDataForApplicant.ApplicantName?.trim()) {
      newErrorsTenantApplicant.ApplicantName = 'Applicant Name is required'
    }

    if (!formDataForApplicant.ApplicantMobileNumber?.trim()) {
      newErrorsTenantApplicant.ApplicantMobileNumber = 'Mobile Number is required'
    } else if (!isValidMobile(formDataForApplicant.ApplicantMobileNumber.trim())) {
      newErrorsTenantApplicant.ApplicantMobileNumber = 'Enter a valid 10-Digit Mobile Number'
    }


    if (formDataForApplicant.ApplicantEmailId?.trim() && !isValidEmail(formDataForApplicant.ApplicantEmailId.trim())) {
      newErrorsTenantApplicant.ApplicantEmailId = 'Enter a valid Email Id';
    }

    // Validate Photo - check merged files (what will actually be saved)
    const mergedPhotoFiles = editingApplicantData
      ? calculateMergedFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, removedApplicantPhotoURLs)
      : applicantPhotoFiles.slice();

    if (mergedPhotoFiles.length === 0) {
      newErrorsTenantApplicant.PhotoURL = "Applicant Photo is required";
    }

    const mergedAadharFiles = editingApplicantData
      ? calculateMergedFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, removedAadharCardURLs)
      : aadharCardFiles.slice();
    const AadharCardNumber = formDataForApplicant.AadharCardNumber?.trim() || "";
    const hasAadharCardNumber = AadharCardNumber !== "";
    const hasAadharCardNumberFile = mergedAadharFiles.length > 0;

    // 🔹 Rule 1 — If number present, validate number
    if (hasAadharCardNumber && !isValidAadhaar(AadharCardNumber)) {
      newErrorsTenantApplicant.AadharCardNumber = "Enter a valid Aadhaar Card Number";
    }

    // 🔹 Rule 2 — If number present, file is required
    if (hasAadharCardNumber && !hasAadharCardNumberFile) {
      newErrorsTenantApplicant.AadharCardURL = "Aadhaar document is required";
    }

    // 🔹 Rule 3 — If file present, number is required
    if (hasAadharCardNumberFile && !hasAadharCardNumber) {
      newErrorsTenantApplicant.AadharCardNumber = "Aadhaar Card Number is required";
    }


    const mergedPanFiles = editingApplicantData
      ? calculateMergedFiles(editingApplicantData.row._panFiles, panCardFiles, removedPanCardURLs)
      : panCardFiles.slice();

    const PanNumber = formDataForApplicant.PanNumber?.trim() || "";
    const hasPanNumber = PanNumber !== "";
    const hasPanFile = mergedPanFiles.length > 0;

    // Rule 1
    if (hasPanNumber && !isValidPAN(PanNumber)) {
      newErrorsTenantApplicant.PanNumber = "Enter a valid PAN Card Number";
    }

    // Rule 2
    if (hasPanNumber && !hasPanFile) {
      newErrorsTenantApplicant.PanCardURL = "PAN document is required";
    }

    // Rule 3
    if (hasPanFile && !hasPanNumber) {
      newErrorsTenantApplicant.PanNumber = "PAN Card Number is required";
    }

    const mergedPassportFiles = editingApplicantData
      ? calculateMergedFiles(editingApplicantData.row._passportFiles, passportFiles, removedPassportURLs)
      : passportFiles.slice();

    const PassportNumber = formDataForApplicant.PassportNumber?.trim() || "";
    const hasPassportNumber = PassportNumber !== "";
    const hasPassportFile = mergedPassportFiles.length > 0;

    // Rule 1
    if (hasPassportNumber && !isValidPassportNumber(PassportNumber)) {
      newErrorsTenantApplicant.PassportNumber = "Enter a valid Passport Number";
    }

    // Rule 2
    if (hasPassportNumber && !hasPassportFile) {
      newErrorsTenantApplicant.PassportURL = "Passport document is required";
    }

    // Rule 3
    if (hasPassportFile && !hasPassportNumber) {
      newErrorsTenantApplicant.PassportNumber = "Passport Number is required";
    }

    const mergedDrivingFiles = editingApplicantData
      ? calculateMergedFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, removedDrivingLicenseURLs)
      : drivingLicenseFiles.slice();

    const DLNumber = formDataForApplicant.DrivingLicenseNumber?.trim() || "";
    const hasDLNumber = DLNumber !== "";
    const hasDLFile = mergedDrivingFiles.length > 0;

    // Rule 1
    if (hasDLNumber && !isValidDrivingLicenseNumber(DLNumber)) {
      newErrorsTenantApplicant.DrivingLicenseNumber = "Enter a valid Driving License Number";
    }

    // Rule 2
    if (hasDLNumber && !hasDLFile) {
      newErrorsTenantApplicant.DrivingLicenseURL = "Driving License document is required";
    }

    // Rule 3
    if (hasDLFile && !hasDLNumber) {
      newErrorsTenantApplicant.DrivingLicenseNumber = "Driving License Number is required";
    }


    const mergedVotingFiles = editingApplicantData
      ? calculateMergedFiles(editingApplicantData.row._votingFiles, votingIdFiles, removedVotingIdURLs)
      : votingIdFiles.slice();


    const VotingIdNumber = formDataForApplicant.VotingIdNumber?.trim() || "";
    const hasVotingIdNumber = VotingIdNumber !== "";
    const hasVotingFile = mergedVotingFiles.length > 0;

    // Rule 1
    if (hasVotingIdNumber && !isValidVoterId(VotingIdNumber)) {
      newErrorsTenantApplicant.VotingIdNumber = "Enter a valid Voting Id Number";
    }

    // Rule 2
    if (hasVotingIdNumber && !hasVotingFile) {
      newErrorsTenantApplicant.VotingIdURL = "Voting ID document is required";
    }

    // Rule 3
    if (hasVotingFile && !hasVotingIdNumber) {
      newErrorsTenantApplicant.VotingIdNumber = "Voting ID Number is required";
    }


    const mergedGstFiles = editingApplicantData
      ? calculateMergedFiles(editingApplicantData.row._gstFiles, gstFiles, removedGstURLs)
      : gstFiles.slice();
    const GSTNumber = formDataForApplicant.GSTNumber?.trim() || "";
    const hasGSTNumber = GSTNumber !== "";
    const hasGSTFile = mergedGstFiles.length > 0;

    // Rule 1
    if (hasGSTNumber && !isValidGST(GSTNumber)) {
      newErrorsTenantApplicant.GSTNumber = "Enter a valid GST Number";
    }

    // Rule 2
    if (hasGSTNumber && !hasGSTFile) {
      newErrorsTenantApplicant.GSTNumberURL = "GST document is required";
    }

    // Rule 3
    if (hasGSTFile && !hasGSTNumber) {
      newErrorsTenantApplicant.GSTNumber = "GST Number is required";
    }

    // ================= BANK VALIDATION =================
    const mergedChequeFiles = editingApplicantData
      ? calculateMergedFiles(editingApplicantData.row._chequeFiles, chequeFiles, removedChequeURLs)
      : chequeFiles.slice();
    const bankId = formDataForApplicant.BankListMasterId || 0;
    const account = (formDataForApplicant.AccountNumber || "").trim();
    const ifsc = (formDataForApplicant.IFSCCode || "").trim();

    const hasChequeFile = mergedChequeFiles.length > 0;

    // 👉 If ANY bank info exists → ALL become required
    const hasAnyBankInfo =
      bankId > 0 ||
      account !== "" ||
      ifsc !== "" ||
      hasChequeFile;


    if (hasAnyBankInfo) {

      if (!bankId) {
        newErrorsTenantApplicant.BankListMasterId = "Bank is required";
      }

      if (!account) {
        newErrorsTenantApplicant.AccountNumber = "Account Number is required";
      } else if (!isValidAccount(account)) {
        newErrorsTenantApplicant.AccountNumber = "Enter a valid Account Number (6–18 digits)";
      }

      if (!ifsc) {
        newErrorsTenantApplicant.IFSCCode = "IFSC Code is required";
      } else if (!isValidIFSC(ifsc)) {
        newErrorsTenantApplicant.IFSCCode = "Enter a valid IFSC Code";
      }

      if (!hasChequeFile) {
        newErrorsTenantApplicant.ChequeURL = "Cheque is required";
      }
    }




    return {
      isValid: Object.keys(newErrorsTenantApplicant).length === 0,
      errorsTenantApplicant: newErrorsTenantApplicant
    }
  }


  const handleAddUpdateTenantApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorsTenantApplicant({});

    const validation = validateAddApplicantForm();

    if (!validation.isValid) {

      setErrorsTenantApplicant(validation.errorsTenantApplicant);
      return;

    }

    const finalRemovedPhotoURLs = editingApplicantData
      ? calculateRemovedFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, removedApplicantPhotoURLs)
      : removedApplicantPhotoURLs;

    const finalRemovedAadharURLs = editingApplicantData
      ? calculateRemovedFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, removedAadharCardURLs)
      : removedAadharCardURLs;

    const finalRemovedPanURLs = editingApplicantData
      ? calculateRemovedFiles(editingApplicantData.row._panFiles, panCardFiles, removedPanCardURLs)
      : removedPanCardURLs;

    const finalRemovedPassportURLs = editingApplicantData
      ? calculateRemovedFiles(editingApplicantData.row._passportFiles, passportFiles, removedPassportURLs)
      : removedPassportURLs;

    const finalRemovedDrivingURLs = editingApplicantData
      ? calculateRemovedFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, removedDrivingLicenseURLs)
      : removedDrivingLicenseURLs;

    const finalRemovedVotingURLs = editingApplicantData
      ? calculateRemovedFiles(editingApplicantData.row._votingFiles, votingIdFiles, removedVotingIdURLs)
      : removedVotingIdURLs;

    const finalRemovedGstURLs = editingApplicantData
      ? calculateRemovedFiles(editingApplicantData.row._gstFiles, gstFiles, removedGstURLs)
      : removedGstURLs;

    const finalRemovedChequeURLs = editingApplicantData
      ? calculateRemovedFiles(editingApplicantData.row._chequeFiles, chequeFiles, removedChequeURLs)
      : removedChequeURLs;

    // Merge files for each document type (using final removed URLs)
    const mergedPhotoFiles = editingApplicantData
      ? mergeFiles(editingApplicantData.row._photoFiles, applicantPhotoFiles, finalRemovedPhotoURLs)
      : applicantPhotoFiles.slice();

    const mergedAadharFiles = editingApplicantData
      ? mergeFiles(editingApplicantData.row._aadharFiles, aadharCardFiles, finalRemovedAadharURLs)
      : aadharCardFiles.slice();

    const mergedPanFiles = editingApplicantData
      ? mergeFiles(editingApplicantData.row._panFiles, panCardFiles, finalRemovedPanURLs)
      : panCardFiles.slice();

    const mergedPassportFiles = editingApplicantData
      ? mergeFiles(editingApplicantData.row._passportFiles, passportFiles, finalRemovedPassportURLs)
      : passportFiles.slice();

    const mergedDrivingFiles = editingApplicantData
      ? mergeFiles(editingApplicantData.row._drivingFiles, drivingLicenseFiles, finalRemovedDrivingURLs)
      : drivingLicenseFiles.slice();

    const mergedVotingFiles = editingApplicantData
      ? mergeFiles(editingApplicantData.row._votingFiles, votingIdFiles, finalRemovedVotingURLs)
      : votingIdFiles.slice();

    const mergedGstFiles = editingApplicantData
      ? mergeFiles(editingApplicantData.row._gstFiles, gstFiles, finalRemovedGstURLs)
      : gstFiles.slice();

    const mergedChequeFiles = editingApplicantData
      ? mergeFiles(editingApplicantData.row._chequeFiles, chequeFiles, finalRemovedChequeURLs)
      : chequeFiles.slice();

    const applicantToSave: TenantApplicant & {
      _photoFiles?: (File | string)[];
      _aadharFiles?: (File | string)[];
      _panFiles?: (File | string)[];
      _passportFiles?: (File | string)[];
      _drivingFiles?: (File | string)[];
      _votingFiles?: (File | string)[];
      _gstFiles?: (File | string)[];
      _chequeFiles?: (File | string)[];
      RemovePhotoURL?: string;
      RemoveAadharCardURL?: string;
      RemovePanCardURL?: string;
      RemovePassportURL?: string;
      RemoveDrivingLicenseURL?: string;
      RemoveVotingIdURL?: string;
      RemoveGSTNumberURL?: string;
      RemoveChequeURL?: string;
    } = {
      TenantApplicantId: editingApplicantData?.row.TenantApplicantId ?? 0,
      TenantId: formDataForApplicant.TenantId ?? 0,
      BuildingId: formDataForApplicant.BuildingId ?? 0,
      ProjectId: formDataForApplicant.ProjectId ?? 0,
      ApplicantType: formDataForApplicant.ApplicantType || '',
      ApplicantName: formDataForApplicant.ApplicantName || '',
      ApplicantMobileNumber: formDataForApplicant.ApplicantMobileNumber || '',
      ApplicantEmailId: formDataForApplicant.ApplicantEmailId || '',

      PhotoURL: createFileUrlString(mergedPhotoFiles),
      AadharCardNumber: formDataForApplicant.AadharCardNumber || '',
      AadharCardURL: createFileUrlString(mergedAadharFiles),
      PanNumber: formDataForApplicant.PanNumber || '',
      PanCardURL: createFileUrlString(mergedPanFiles),
      PassportNumber: formDataForApplicant.PassportNumber || '',
      PassportURL: createFileUrlString(mergedPassportFiles),
      DrivingLicenseNumber: formDataForApplicant.DrivingLicenseNumber || '',
      DrivingLicenseURL: createFileUrlString(mergedDrivingFiles),
      VotingIdNumber: formDataForApplicant.VotingIdNumber || '',
      VotingIdURL: createFileUrlString(mergedVotingFiles),
      GSTNumber: formDataForApplicant.GSTNumber || '',
      GSTNumberURL: createFileUrlString(mergedGstFiles),
      BankListMasterId: formDataForApplicant.BankListMasterId ?? null,
      AccountNumber: formDataForApplicant.AccountNumber || '',
      IFSCCode: formDataForApplicant.IFSCCode || '',
      ChequeURL: createFileUrlString(mergedChequeFiles),

      BankName: null,
      CreatedById: 0,
      CreatedBy: '',
      CreatedDate: null,
      ModifiedById: 0,
      ModifiedBy: '',
      ModifiedDate: null,
      LastModifiedBy: '',
      LastModifiedDate: null,

      _photoFiles: mergedPhotoFiles,
      _aadharFiles: mergedAadharFiles,
      _panFiles: mergedPanFiles,
      _passportFiles: mergedPassportFiles,
      _drivingFiles: mergedDrivingFiles,
      _votingFiles: mergedVotingFiles,
      _gstFiles: mergedGstFiles,
      _chequeFiles: mergedChequeFiles,

      RemovePhotoURL: finalRemovedPhotoURLs.join(','),
      RemoveAadharCardURL: finalRemovedAadharURLs.join(','),
      RemovePanCardURL: finalRemovedPanURLs.join(','),
      RemovePassportURL: finalRemovedPassportURLs.join(','),
      RemoveDrivingLicenseURL: finalRemovedDrivingURLs.join(','),
      RemoveVotingIdURL: finalRemovedVotingURLs.join(','),
      RemoveGSTNumberURL: finalRemovedGstURLs.join(','),
      RemoveChequeURL: finalRemovedChequeURLs.join(','),

    };


    setApplicantList(prev => {
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
    setChequeFiles([]);
  };

  //#endregion
  //#region DELETE TENANT APPLICANT


  const handleDeleteApplicant = () => {

    if (!deleteTenantApplicantData) return;

    const removeIndex = deleteTenantApplicantData.index;

    if (removeIndex < 0) {

      setIsConfirmationDialogBoxOpen(false);

      setDeleteTenantApplicantData(null);

      addToast({ type: 'error', title: 'Unable to find the selected applicant to delete' });

      return;

    }

    setApplicantList(prev => prev.filter((_, i) => i !== removeIndex));
    setIsConfirmationDialogBoxOpen(false);
    setDeleteTenantApplicantData(null);
    addToast({ type: 'success', title: 'Applicant Removed' });
  };



  //#endregion
  //#region  TENANT DETAILS WITH APPLICANT DETAILS
  const buildMultipartFormData = (): FormData => {
    const fd = new FormData();

    // top-level tenant fields
    fd.append('TenantId', String(formData.TenantId ?? 0));
    fd.append('Uniquekey', String(formData.Uniquekey ?? ''));
    fd.append('ProjectId', String(projectId ?? 0));
    fd.append('BuildingId', String(buildingId));
    fd.append('FlatNumber', formData.FlatNumber ?? '');
    fd.append('FlatCarpetAreaSqFt', String(formData.FlatCarpetAreaSqFt ?? ''));
    fd.append('Facing', formData.Facing ?? '');
    fd.append('FlatType', formData.FlatType ?? '');
    fd.append('FlatConfiguration', formData.FlatConfiguration ?? '');
    fd.append('FreeAreaOfferedPercent', String(formData.FreeAreaOfferedPercent ?? ''));
    fd.append('ExtraAreaPurchasedSqFt', String(formData.ExtraAreaPurchasedSqFt ?? ''));
    fd.append('TotalAreaSqFt', String(formData.TotalAreaSqFt ?? ''));

    // helper that appends existing CSV and File parts (with filename)
    const addFilesWithExisting = (
      fdLocal: FormData,
      prefix: string,
      fileArray: (File | string)[] | undefined,
      fieldKey: string
    ) => {
      if (!fileArray || fileArray.length === 0) return;

      const existingNames = fileArray
        .filter(x => typeof x === 'string' && String(x).trim().length > 0)
        .map(x => String(x).trim())
        .join(',');

      if (existingNames) {
        fdLocal.append(`${prefix}.${fieldKey}`, existingNames);
      }


      fileArray.forEach(item => {
        if (item instanceof File) {

          fdLocal.append(`${prefix}.${fieldKey}`, item, item.name);
        }
      });
    };

    applicantList.forEach((app, index) => {
      const prefix = `AddUpdateTenantApplicants[${index}]`;

      fd.append(`${prefix}.BuildingId`, String(buildingId));
      fd.append(`${prefix}.ProjectId`, String(app.ProjectId ?? projectId));
      fd.append(`${prefix}.ApplicantType`, String(app.ApplicantType ?? ''));
      fd.append(`${prefix}.TenantId`, String(app.TenantId ?? formData.TenantId ?? 0));
      fd.append(`${prefix}.TenantApplicantId`, String(app.TenantApplicantId ?? 0));
      fd.append(`${prefix}.ApplicantName`, app.ApplicantName ?? '');
      fd.append(`${prefix}.ApplicantMobileNumber`, app.ApplicantMobileNumber ?? '');
      fd.append(`${prefix}.ApplicantEmailId`, app.ApplicantEmailId ?? '');

      // non-file fields
      fd.append(`${prefix}.AadharCardNumber`, app.AadharCardNumber ?? '');
      fd.append(`${prefix}.PanNumber`, app.PanNumber ?? '');
      fd.append(`${prefix}.PassportNumber`, app.PassportNumber ?? '');
      fd.append(`${prefix}.DrivingLicenseNumber`, app.DrivingLicenseNumber ?? '');
      fd.append(`${prefix}.VotingIdNumber`, app.VotingIdNumber ?? '');
      fd.append(`${prefix}.GSTNumber`, app.GSTNumber ?? app.GSTNumber ?? '');
      fd.append(`${prefix}.BankListMasterId`, String(app.BankListMasterId ?? 0));
      fd.append(`${prefix}.AccountNumber`, app.AccountNumber ?? '');
      fd.append(`${prefix}.IFSCCode`, app.IFSCCode ?? '');

      fd.append(`${prefix}.RemovePhotoURL`, app.RemovePhotoURL ?? '');
      fd.append(`${prefix}.RemoveAadharCardURL`, app.RemoveAadharCardURL ?? '');
      fd.append(`${prefix}.RemovePanCardURL`, app.RemovePanCardURL ?? '');
      fd.append(`${prefix}.RemovePassportURL`, app.RemovePassportURL ?? '');
      fd.append(`${prefix}.RemoveDrivingLicenseURL`, app.RemoveDrivingLicenseURL ?? '');
      fd.append(`${prefix}.RemoveVotingIdURL`, app.RemoveVotingIdURL ?? '');
      fd.append(`${prefix}.RemoveGSTNumberURL`, app.RemoveGSTNumberURL ?? '');
      fd.append(`${prefix}.RemoveChequeURL`, app.RemoveChequeURL ?? '');

      const realApp: any = app;

      addFilesWithExisting(fd, prefix, realApp._photoFiles, 'PhotoURL');
      addFilesWithExisting(fd, prefix, realApp._aadharFiles, 'AadharCardURL');
      addFilesWithExisting(fd, prefix, realApp._panFiles, 'PanCardURL');
      addFilesWithExisting(fd, prefix, realApp._passportFiles, 'PassportURL');
      addFilesWithExisting(fd, prefix, realApp._drivingFiles, 'DrivingLicenseURL');
      addFilesWithExisting(fd, prefix, realApp._votingFiles, 'VotingIdURL');
      addFilesWithExisting(fd, prefix, realApp._gstFiles, 'GSTNumberURL'); // check backend expects this key
      addFilesWithExisting(fd, prefix, realApp._chequeFiles, 'ChequeURL');
    });
    return fd;
  };

  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


      <div className="flex-1 space-y-2 px-6 py-3">
        <form onSubmit={handleSubmit}>
          {/* ============================================================= [FLAT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 border-b border-gray-500 pb-2">
                <HeaderActionBar
                  titleText="Applicant Detail : "
                  subTitleText={`${buildingName}`}
                  subSubTitleText={`${formData.TenantId === 0 ? "" : tenantName}`}
                  isLoading={isLoading}
                />


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
                    setChequeFiles([]);

                    setRemovedApplicantPhotoURLs([]);
                    setRemovedAadharCardURLs([]);
                    setRemovedPanCardURLs([]);
                    setRemovedPassportURLs([]);
                    setRemovedDrivingLicenseURLs([]);
                    setRemovedVotingIdURLs([]);
                    setRemovedGstURLs([]);
                    setRemovedChequeURLs([]);

                    setIsAddUpdateApplicantModalOpen(true);

                  }}
                  color="blue"
                  size="sm"
                  title="Add Applicant"
                >
                  Add Applicant
                </Button>
              </div>
            </div>

            <DataTable
              data={applicantList}
              columns={applicantColumns}
              emptyMessage="No applicants found"
              fixedHeight={false}
              recordsPerPage={20}
              className="min-w-full"
              aria-label="Applicant list"
            />
          </div>


          {/* ============================================================= [FLAT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Existing Unit Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Unit / Annexure / Survey Number"
                  value={formData.FlatNumber}
                  required
                  onChange={e => handleFieldChange('FlatNumber', e.target.value)}
                  error={errors.FlatNumber}
                  maxLength={15}
                  placeholder="Enter Unit Number"
                />
              </div>
              <div>

                <SinglePageSelection
                  label="Unit Type"
                  required
                  value={formData.FlatType}
                  onChange={(e) => {
                    handleFieldChange('FlatType', String(e));
                    handleFieldChange('FlatConfiguration', '');
                  }}
                  options={FLAT_UNIT_TYPE
                    .filter(opt => opt.id !== 'Gym' && opt.id !== 'Void')
                    .map(opt => ({
                      label: opt.name,
                      value: opt.id
                    }))
                  }
                  error={errors.FlatType}
                  placeholder="Enter Unit Type"
                />
              </div>
              {formData.FlatType.toUpperCase() === "RESIDENTIAL" ?
                <div>
                  <SinglePageSelection
                    label="Unit Configuration"
                    required
                    value={formData.FlatConfiguration ?? ""}
                    onChange={(e) => handleFieldChange('FlatConfiguration', String(e))}
                    options={RESIDENTIAL_FLAT_CONFIGURATION.map((opt) => ({ label: opt.name, value: opt.id }))}
                    error={errors.FlatConfiguration}
                  />
                </div>
                : ""}

              {formData.FlatType.toUpperCase() === "COMMERCIAL" ?
                <div>
                  <SinglePageSelection
                    label="Unit Configuration"
                    required
                    value={formData.FlatConfiguration ?? ""}
                    onChange={(e) => handleFieldChange('FlatConfiguration', String(e))}
                    options={COMMERCIAL_FLAT_CONFIGURATION.map((opt) => ({ label: opt.name, value: opt.id }))}
                    error={errors.FlatConfiguration}
                  />
                </div>
                : ""}
              <div>
                <Input
                  label="Carpet Area (SqFt)"
                  value={formData.FlatCarpetAreaSqFt ?? ''}
                  onChange={e => handleFieldChange('FlatCarpetAreaSqFt', filterNumbersWithDecimal(e.target.value))}
                  error={errors.FlatCarpetAreaSqFt}
                  placeholder="Enter Carpet Area"
                  rightIcon="SqFt"
                />
              </div>
              <div>

                <SinglePageSelection
                  label="Unit Facing"
                  required
                  value={formData.Facing ?? ""}
                  onChange={(e) => handleFieldChange('Facing', String(e))}
                  options={FLAT_UNIT_FACING.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errors.Facing}
                />
              </div>

            </div>
          </div>

          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Offer</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>
                <Input
                  label="Free Area Offered (%)"
                  value={formData.FreeAreaOfferedPercent ?? ''}
                  onChange={(e) => {
                    const val = allowPercentage(e.target.value);
                    if (val !== null) {

                      handleFieldChange("FreeAreaOfferedPercent", filterNumbersWithDecimal(e.target.value))
                    }
                  }}
                  error={errors.FreeAreaOfferedPercent}
                  placeholder="Enter Free Area Offered"
                  rightIcon="%"
                />
              </div>

              <div>
                <Input
                  label="Free Area Offered (SqFt)"
                  value={(Number(formData?.FlatCarpetAreaSqFt) * (formData?.FreeAreaOfferedPercent || 0) / 100).toFixed(2)}
                  disabled
                  rightIcon="SqFt"
                />
              </div>

              <div>
                <Input
                  label="Total Area (SqFt)"
                  value={formData.TotalAreaSqFt ?? ''}
                  onChange={(e) => handleFieldChange("TotalAreaSqFt", filterNumbersWithDecimal(e.target.value))}
                  error={errors.TotalAreaSqFt}
                  placeholder="Enter Total Area"
                  rightIcon="SqFt"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Extra Area Purchased</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>
                <Input
                  label="Extra Area Purchased (SqFt)"
                  value={formData.ExtraAreaPurchasedSqFt ?? ''}
                  onChange={(e) => handleFieldChange("ExtraAreaPurchasedSqFt", filterNumbersWithDecimal(e.target.value))}
                  error={errors.ExtraAreaPurchasedSqFt}
                  placeholder="Enter Extra Area Purchased"
                  rightIcon="SqFt"
                />
              </div>

            </div>
          </div>
        </form>
      </div >

      <BottomActionBar
        cancelText="Cancel"
        saveText={(formData.TenantId && formData.TenantId > 0) ? 'Update' : 'Add'}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleSubmit();
        }}
        isLoading={isLoading}
      />


      {/*  ADD EDIT UPDATE TENANT APPLICANT MODAL */}

      <Modal
        isOpen={isAddUpdateApplicantModalOpen}
        onClose={() => {
          setIsAddUpdateApplicantModalOpen(false)
          setEditingApplicantData(null)
          setFormDataForApplicant(initialFormStateApplicantDetails());
          setErrorsTenantApplicant({});
          setApplicantPhotoFiles([]);
          setAadharCardFiles([]);
          setPanCardFiles([]);
          setPassportFiles([]);
          setDrivingLicenseFiles([]);
          setVotingIdFiles([]);
          setGstFiles([]);
          setChequeFiles([]);
          setRemovedApplicantPhotoURLs([]);
          setRemovedAadharCardURLs([]);
          setRemovedPanCardURLs([]);
          setRemovedPassportURLs([]);
          setRemovedDrivingLicenseURLs([]);
          setRemovedVotingIdURLs([]);
          setRemovedGstURLs([]);
          setRemovedChequeURLs([]);
        }}
        onCancel={() => {
          setIsAddUpdateApplicantModalOpen(false)
          setEditingApplicantData(null)
          setFormDataForApplicant(initialFormStateApplicantDetails());
          setErrorsTenantApplicant({});
          setApplicantPhotoFiles([]);
          setAadharCardFiles([]);
          setPanCardFiles([]);
          setPassportFiles([]);
          setDrivingLicenseFiles([]);
          setVotingIdFiles([]);
          setGstFiles([]);
          setChequeFiles([]);
          setRemovedApplicantPhotoURLs([]);
          setRemovedAadharCardURLs([]);
          setRemovedPanCardURLs([]);
          setRemovedPassportURLs([]);
          setRemovedDrivingLicenseURLs([]);
          setRemovedVotingIdURLs([]);
          setRemovedGstURLs([]);
          setRemovedChequeURLs([]);
        }}
        title={editingApplicantData ? 'Update Tenant Applicant' : 'Add Tenant Applicant'}
        onSubmit={handleAddUpdateTenantApplicant}
        saveText={editingApplicantData ? 'Update' : 'Add'}
        cancelText="Cancel"
        loading={isLoading}
        size='small50'
      >
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <SinglePageSelection
                label="Applicant Type"
                placeholder="Select Applicant Type"
                required
                value={formDataForApplicant?.ApplicantType ?? ""}
                onChange={(e) => handleFieldChangeTenantApplicant('ApplicantType', String(e))}
                options={APPLICANT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsTenantApplicant.ApplicantType}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label='Applicant Name'
                required
                error={errorsTenantApplicant.ApplicantName}
                value={formDataForApplicant.ApplicantName ?? ""}
                maxLength={50}
                onChange={e =>
                  handleFieldChangeTenantApplicant('ApplicantName', filterLetters(e.target.value))
                }
                placeholder="Enter Applicant Name"
              />
            </div>
            <div>
              <Input
                label='Mobile Number'
                required
                error={errorsTenantApplicant.ApplicantMobileNumber}
                type="text"
                value={formDataForApplicant.ApplicantMobileNumber ?? ""}
                maxLength={10}
                leftIcon="+91"
                onChange={e =>
                  handleFieldChangeTenantApplicant('ApplicantMobileNumber', filterMobile(e.target.value))
                }
                placeholder="Enter Mobile Number"
              />
            </div>
            <div>
              <Input
                label='Email Id'
                error={errorsTenantApplicant.ApplicantEmailId}
                type="text"
                value={formDataForApplicant.ApplicantEmailId ?? ""}
                onChange={e =>
                  handleFieldChangeTenantApplicant('ApplicantEmailId', filterEmail(e.target.value))
                }
                placeholder="Enter Email Id"
              />
            </div>
            <div>

              <MultiFilePicker
                label="Photo"
                placeholder="Select Photo"
                required
                error={errorsTenantApplicant.PhotoURL}
                value={applicantPhotoFiles}
                onChange={setApplicantPhotoFiles}
                allowedTypes={['image/jpeg', 'image/png']}
                maxFiles={1}
                maxSizeMB={5}
                onRemoveExisting={(url) => setRemovedApplicantPhotoURLs((prev) => [...prev, url])}
              />
            </div>
            <div>
              <Input
                label="Aadhaar Number"
                error={errorsTenantApplicant.AadharCardNumber}
                type="text"
                value={formDataForApplicant.AadharCardNumber ?? ''}
                maxLength={12}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('AadharCardNumber', filterAadhaar(e.target.value))
                }
                placeholder="Enter Aadhaar Number"
                rightIcon={<IdCardIcon />}
              />
            </div>
            <div>
              <MultiFilePicker
                label="Aadhaar Card"
                placeholder="Select Aadhaar Card"
                error={errorsTenantApplicant.AadharCardURL}
                value={aadharCardFiles}
                onChange={setAadharCardFiles}
                allowedTypes={[
                  'image/jpeg',
                  'image/png',
                  'application/pdf',
                ]}
                maxFiles={2}
                maxSizeMB={10}
                onRemoveExisting={(url) =>
                  setRemovedAadharCardURLs((prev) => [...prev, url])}
              />
            </div>
            <div>
              <Input
                label="PAN Number"

                error={errorsTenantApplicant.PanNumber}
                type="text"
                value={formDataForApplicant.PanNumber ?? ''}
                maxLength={10}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('PanNumber', filterPAN(e.target.value).toUpperCase())
                }
                placeholder="Enter PAN Number"
                rightIcon={<IdCardIcon />}
              />
            </div>
            <div>
              <MultiFilePicker
                label="PAN Card"
                placeholder="Select PAN Card"
                error={errorsTenantApplicant.PanCardURL}
                value={panCardFiles}
                onChange={setPanCardFiles}
                allowedTypes={[
                  'image/jpeg',
                  'image/png',
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ]}
                maxFiles={2}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedPanCardURLs((prev) => [...prev, url])}
              />

            </div>
            <div>
              <Input
                label="Passport Number"
                error={errorsTenantApplicant.PassportNumber}
                type="text"
                value={formDataForApplicant.PassportNumber ?? ''}
                maxLength={8}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('PassportNumber', filterPassportNumber(e.target.value.toUpperCase()))
                }
                placeholder="Enter Passport Number"
                rightIcon={<IdCardIcon />}
              />
            </div>
            <div>
              <MultiFilePicker
                label="Passport"
                placeholder="Select Passport"
                error={errorsTenantApplicant.PassportURL}
                value={passportFiles}
                onChange={setPassportFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={3}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedPassportURLs((prev) => [...prev, url])}
              />
            </div>
            <div>
              <Input
                label="Driving License Number"
                error={errorsTenantApplicant.DrivingLicenseNumber}
                type="text"
                value={formDataForApplicant.DrivingLicenseNumber ?? ''}
                maxLength={15}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('DrivingLicenseNumber', filterDrivingLicenseNumber(e.target.value.toUpperCase()))
                }
                placeholder="Enter Driving License Number"
                rightIcon={<IdCardIcon />}
              />
            </div>
            <div>
              <MultiFilePicker
                label="Driving License"
                placeholder="Select Driving License"
                error={errorsTenantApplicant.DrivingLicenseURL}
                value={drivingLicenseFiles}
                onChange={setDrivingLicenseFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={3}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedDrivingLicenseURLs((prev) => [...prev, url])}
              />
            </div>
            <div>
              <Input
                label="Voting ID Number"
                error={errorsTenantApplicant.VotingIdNumber}
                type="text"
                value={formDataForApplicant.VotingIdNumber ?? ''}
                maxLength={10}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('VotingIdNumber', filterVoterId(e.target.value.toUpperCase()))
                }
                placeholder="Enter Voting ID Number"
                rightIcon={<IdCardIcon />}
              />
            </div>
            <div>
              <MultiFilePicker
                label="Voting ID"
                placeholder="Select Voting ID"
                error={errorsTenantApplicant.VotingIdURL}
                value={votingIdFiles}
                onChange={setVotingIdFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={3}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedVotingIdURLs((prev) => [...prev, url])}
              />
            </div>
            <div>
              <Input
                label="GST Number"
                error={errorsTenantApplicant.GSTNumber}
                type="text"
                value={formDataForApplicant.GSTNumber ?? ''}
                maxLength={15}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('GSTNumber', filterGST(e.target.value.toUpperCase()))
                }
                placeholder="Enter GST Number"
                rightIcon={<IdCardIcon />}
              />
            </div>
            <div>
              <MultiFilePicker
                label="GST Documents"
                placeholder="Select GST Documents"
                error={errorsTenantApplicant.GSTNumberURL}
                value={gstFiles}
                onChange={setGstFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedGstURLs((prev) => [...prev, url])}
              />
            </div>
            <div>
              <SingleSelectDropdownWithPagination
                label="Bank"
                title="Select Bank"
                size="lg"
                dataFetchCallBack={fetchBankListMasterDropdown}
                onSelected={(item) => {
                  if (!item) {
                    handleFieldChangeTenantApplicant("BankListMasterId", null);
                    return;
                  }

                  handleFieldChangeTenantApplicant("BankListMasterId", Number(item.value));
                }}
                initialValue={createDropdownInitialValue(formDataForApplicant.BankListMasterId, dropdownLabels.bankName)}
                error={errorsTenantApplicant.BankListMasterId}
              />
            </div>
            <div>
              <Input
                label="Account Number"
                value={formDataForApplicant.AccountNumber ?? ""}
                maxLength={18}
                onChange={(e) => handleFieldChangeTenantApplicant("AccountNumber", filterNumbers(e.target.value))}
                error={errorsTenantApplicant.AccountNumber}
                placeholder="Enter Account Number"
              />
            </div>
            <div>
              <Input label="IFSC Code"
                value={formDataForApplicant.IFSCCode ?? ""}
                onChange={(e) => handleFieldChangeTenantApplicant("IFSCCode", filterIFSC(e.target.value))}
                error={errorsTenantApplicant.IFSCCode}
                placeholder="Enter IFSC Code"
              />
            </div>
            <div>
              <MultiFilePicker
                label="Cheque / Cancelled Cheque"
                error={errorsTenantApplicant.ChequeURL}
                value={chequeFiles}
                onChange={setChequeFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={2}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedChequeURLs((prev) => [...prev, url])}
              />
            </div>
          </div>
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteTenantApplicantData(null)
        }}
        onConfirm={handleDeleteApplicant}
        loading={isLoading}
        pageName='applicant'
      />
    </div >
  );
};

export default AddUpdateTenant;
