import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { filterEmail, filterIFSC, filterLetters, filterMobile, filterNumbers, filterNumbersWithDecimal, filterPAN } from "@/core/utils/fileValidation";
import { Button } from "@/ui/components/forms";
import { Edit, Trash2 } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import { MultiFilePicker } from "@/ui/components/ImagePicker/MultiFilePicker";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { useProject } from "@/features/projectMaster/context/ProjectContext";


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
  const location = useLocation();

  const locationStateDetails = useLocation() as {
    state?: {
      editTenantData?: TenantData | null;
      fromList?: boolean;
      listState?: {
        page: number;
        filters: any;
        sortInfo?: any;
        searchTerm?: string;
        buildingId?: number;
        buildingName?: string;
      };
    };
  };
  const preservedListState = locationStateDetails.state?.listState;

  //GET VALUE FROM URL :EMPLOYEEID
  const { tenantId } = useParams<{ tenantId?: string }>();

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //#endregion

  //#region PROJECT SELECTION GET ID

  const { projectId } = useProject()

  //#endregion

  //#region  TENANT APPLICANT

  //SET DROP DOWN 
  const [dropdownLabels, setDropdownLabels] = useState<{
    bankName?: string;
  }>({});

  const [formDataForApplicant, setFormDataForApplicant] = useState<AddUpdateTenantApplicant>(() => initialFormStateApplicantDetails());

  const [editingApplicantData, setEditingApplicantData] = useState<{row: TenantApplicantWithFiles ; index: number } | null>(null);

  const [isAddUpdateApplicantModalOpen, setIsAddUpdateApplicantModalOpen] = useState(false)


  // ================= PHOTO =================
  const [applicantPhotoFiles, setApplicantPhotoFiles] = useState<(File | string)[]>([]);
  const [removedApplicantPhotoURLs, setRemovedApplicantPhotoURLs] = useState<string[]>([]);
  //const [applicantPhotoURL, setApplicantPhotoURL] = useState<string>();

  // ================= AADHAR =================
  const [aadharCardFiles, setAadharCardFiles] = useState<(File | string)[]>([]);
  const [removedAadharCardURLs, setRemovedAadharCardURLs] = useState<string[]>([]);
  //const [aadharCardPreviewURL, setAadharCardPreviewURL] = useState<string>();

  // ================= PAN =================
  const [panCardFiles, setPanCardFiles] = useState<(File | string)[]>([]);
  const [removedPanCardURLs, setRemovedPanCardURLs] = useState<string[]>([]);
  //const [panCardPreviewURL, setPanCardPreviewURL] = useState<string>();

  // ================= PASSPORT =================
  const [passportFiles, setPassportFiles] = useState<(File | string)[]>([]);
  const [removedPassportURLs, setRemovedPassportURLs] = useState<string[]>([]);
  //const [passportPreviewURL, setPassportPreviewURL] = useState<string>();

  // ================= DRIVING LICENSE =================
  const [drivingLicenseFiles, setDrivingLicenseFiles] = useState<(File | string)[]>([]);
  const [removedDrivingLicenseURLs, setRemovedDrivingLicenseURLs] = useState<string[]>([]);
  //const [drivingLicensePreviewURL, setDrivingLicensePreviewURL] = useState<string>();

  // ================= VOTING ID =================
  const [votingIdFiles, setVotingIdFiles] = useState<(File | string)[]>([]);
  const [removedVotingIdURLs, setRemovedVotingIdURLs] = useState<string[]>([]);
  //const [votingIdPreviewURL, setVotingIdPreviewURL] = useState<string>();

  // ================= GST =================
  const [gstFiles, setGstFiles] = useState<(File | string)[]>([]);
  const [removedGstURLs, setRemovedGstURLs] = useState<string[]>([]);
  //const [gstPreviewURL, setGstPreviewURL] = useState<string>();

  // ================= CHEQUE =================
  const [chequeFiles, setChequeFiles] = useState<(File | string)[]>([]);
  const [removedChequeURLs, setRemovedChequeURLs] = useState<string[]>([]);
  //const [chequePreviewURL, setChequePreviewURL] = useState<string>();

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
          BuildingId: preservedListState?.buildingId
        }

        const response = await tenantService.apiCallPullTenant(params);

        if (E.isRight(response)) {

          const tenant = response.right.Data?.[0] as TenantData | undefined;

          if (tenant) {
            setFormData(prev => ({
              ...prev,
              TenantId: tenant.TenantId ?? prev.TenantId,
              Uniquekey: tenant.Uniquekey ?? prev.Uniquekey,
              BuildingId: Number(preservedListState?.buildingId),
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
      newErrors.FlatNumber = 'Flat Number is required.'
    } else if (formData.FlatNumber.trim().length > 50) {
      newErrors.FlatNumber = 'Flat Number must be at most 50 characters'
    }

    if (!formData.FlatType?.trim()) {
      newErrors.FlatType = 'Flat Type is required.'
    }

    if (formData.FlatCarpetAreaSqFt != null && formData.FlatCarpetAreaSqFt < 0) {
      newErrors.FlatCarpetAreaSqFt = 'Carpet area must be positive';
    }

    if (formData.TotalAreaSqFt != null && formData.TotalAreaSqFt < 0) {
      newErrors.TotalAreaSqFt = 'Total area must be positive';
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

          addToast({ type: "success", title: formData.TenantId ? "Tenant updated successfully" : "Tenant added successfully" });

          // Get list state from navigation if available, otherwise use defaults
          const locationState = location.state as {
            listState?: {
              page?: number;
              filters?: any;
              sortInfo?: any;
              searchTerm?: string;
              buildingId?: number;
              buildingName?: string;
            };
          } | null;

          const listState = locationState?.listState || {
            page: 1,
            filters: {},
            sortInfo: undefined,
            searchTerm: '',
            buildingId: 0,
            buildingName: ''
          };

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
      BuildingId: Number(preservedListState?.buildingId),
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


    setEditingApplicantData({row,index});
    setFormDataForApplicant(applicantData);

    // PHOTO
    setApplicantPhotoFiles(parseDocumentUrls(row.PhotoURL ?? ''));
    setRemovedApplicantPhotoURLs([]); // always reset

    // AADHAR
    setAadharCardFiles(parseDocumentUrls(row.AadharCardURL ?? ''));
    setRemovedAadharCardURLs([]);

    // PAN
    setPanCardFiles(parseDocumentUrls(row.PanCardURL ?? ''));
    setRemovedPanCardURLs([]);

    // PASSPORT
    setPassportFiles(parseDocumentUrls(row.PassportURL ?? ''));
    setRemovedPassportURLs([]);

    // DRIVING LICENSE
    setDrivingLicenseFiles(parseDocumentUrls(row.DrivingLicenseURL ?? ''));
    setRemovedDrivingLicenseURLs([]);

    // VOTING ID
    setVotingIdFiles(parseDocumentUrls(row.VotingIdURL ?? ''));
    setRemovedVotingIdURLs([]);

    // GST
    setGstFiles(parseDocumentUrls(row.GSTNumberURL ?? ''));
    setRemovedGstURLs([]);

    // CHEQUE
    setChequeFiles(parseDocumentUrls(row.ChequeURL ?? ''));
    setRemovedChequeURLs([]);

    setIsAddUpdateApplicantModalOpen(true);
  }, [preservedListState]);
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
        label: 'Name',
        width: '15',
        sortable: false,
        align: 'left',
        fixed:'left',
        render: (value, row) => {
          return (
            
              <MultiImageViewer
                images={parseDocumentUrls(row.PhotoURL)}
                title="Applicant Document"
                triggerLabel={value || '-'}
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
        label: 'Aadhar',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.AadharCardURL)}
              title="Aadhar Card Document"
              triggerLabel={value || '-'}
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
            />
          );
        }
      },

      {
        key: 'BankName',
        label: 'Bank',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.ChequeURL)}
              title="Cheque Document"
              triggerLabel={value || '-'}
            />
          );
        }
      },

      {
        key: 'AccountNumber',
        label: 'Account Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
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
        render: (_value, row,index) => (
          canAction ? (
            <div className="flex items-center justify-center gap-2">
              <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleEditApplicant(row,index)
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
    }

    if (!applicantPhotoFiles.length) {
      newErrorsTenantApplicant.PhotoURL = "Applicant Photo is required";
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
      TenantApplicantId:  editingApplicantData?.row.TenantApplicantId ?? 0,
      TenantId: formDataForApplicant.TenantId ?? 0,
      BuildingId: formDataForApplicant.BuildingId ?? 0,
      ProjectId: formDataForApplicant.ProjectId ?? 0,
      ApplicantType: formDataForApplicant.ApplicantType || '',
      ApplicantName: formDataForApplicant.ApplicantName || '',
      ApplicantMobileNumber: formDataForApplicant.ApplicantMobileNumber || '',
      ApplicantEmailId: formDataForApplicant.ApplicantEmailId || '',

      PhotoURL: applicantPhotoFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
      AadharCardNumber: formDataForApplicant.AadharCardNumber || '',
      AadharCardURL: aadharCardFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
      PanNumber: formDataForApplicant.PanNumber || '',
      PanCardURL: panCardFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
      PassportNumber: formDataForApplicant.PassportNumber || '',
      PassportURL: passportFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
      DrivingLicenseNumber: formDataForApplicant.DrivingLicenseNumber || '',
      DrivingLicenseURL: drivingLicenseFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
      VotingIdNumber: formDataForApplicant.VotingIdNumber || '',
      VotingIdURL: votingIdFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
      GSTNumber: formDataForApplicant.GSTNumber || '',
      GSTNumberURL: gstFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
      BankListMasterId: formDataForApplicant.BankListMasterId ?? null,
      AccountNumber: formDataForApplicant.AccountNumber || '',
      IFSCCode: formDataForApplicant.IFSCCode || '',
      ChequeURL: chequeFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),

      BankName: null,
      CreatedById: 0,
      CreatedBy: '',
      CreatedDate: null,
      ModifiedById: 0,
      ModifiedBy: '',
      ModifiedDate: null,
      LastModifiedBy: '',
      LastModifiedDate: null,

      _photoFiles: applicantPhotoFiles.slice(),
      _aadharFiles: aadharCardFiles.slice(),
      _panFiles: panCardFiles.slice(),
      _passportFiles: passportFiles.slice(),
      _drivingFiles: drivingLicenseFiles.slice(),
      _votingFiles: votingIdFiles.slice(),
      _gstFiles: gstFiles.slice(),
      _chequeFiles: chequeFiles.slice(),

      RemovePhotoURL: removedApplicantPhotoURLs.join(','),
      RemoveAadharCardURL: removedAadharCardURLs.join(','),
      RemovePanCardURL: removedPanCardURLs.join(','),
      RemovePassportURL: removedPassportURLs.join(','),
      RemoveDrivingLicenseURL: removedDrivingLicenseURLs.join(','),
      RemoveVotingIdURL: removedVotingIdURLs.join(','),
      RemoveGSTNumberURL: removedGstURLs.join(','),
      RemoveChequeURL: removedChequeURLs.join(','),
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
    fd.append('BuildingId', String(preservedListState?.buildingId));
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

      fd.append(`${prefix}.BuildingId`, String(preservedListState?.buildingId));
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
      // be consistent with your model naming — use same casing as backend expects:
      fd.append(`${prefix}.GSTNumber`, app.GSTNumber ?? app.GSTNumber ?? '');
      fd.append(`${prefix}.BankListMasterId`, String(app.BankListMasterId ?? 0));
      fd.append(`${prefix}.AccountNumber`, app.AccountNumber ?? '');
      fd.append(`${prefix}.IFSCCode`, app.IFSCCode ?? '');

      const appendIfNonEmpty = (key: string, val?: string) => {
        if (val && String(val).trim().length > 0) fd.append(`${prefix}.${key}`, String(val));
      };

      appendIfNonEmpty('RemovePhotoURL', (app as any).RemovePhotoURL);
      appendIfNonEmpty('RemoveAadharCardURL', (app as any).RemoveAadharCardURL);
      appendIfNonEmpty('RemovePanCardURL', (app as any).RemovePanCardURL);
      appendIfNonEmpty('RemovePassportURL', (app as any).RemovePassportURL);
      appendIfNonEmpty('RemoveDrivingLicenseURL', (app as any).RemoveDrivingLicenseURL);
      appendIfNonEmpty('RemoveVotingIdURL', (app as any).RemoveVotingIdURL);
      appendIfNonEmpty('RemoveGSTNumberURL', (app as any).RemoveGSTNumberURL);
      appendIfNonEmpty('RemoveChequeURL', (app as any).RemoveChequeURL);

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

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


      <div className="flex-1 space-y-2 px-6 py-3">
        <form onSubmit={handleSubmit}>
          {/* ============================================================= [FLAT DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 border-b border-gray-300 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Applicant Details
                </h3>
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
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Unit Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Unit Number"
                  value={formData.FlatNumber}
                  required
                  onChange={e => handleFieldChange('FlatNumber', e.target.value)}
                  error={errors.FlatNumber}
                  placeholder="Enter Unit Number"
                />
              </div>
              <div>
                <Input
                  label="Carpet Area SqFt"
                  value={formData.FlatCarpetAreaSqFt ?? ''}
                  required
                  onChange={e => handleFieldChange('FlatCarpetAreaSqFt', filterNumbersWithDecimal(e.target.value))}
                  error={errors.FlatCarpetAreaSqFt}
                  placeholder="Enter Carpet Area SqFt"
                />
              </div>
              <div>
                <SinglePageSelection
                  label="Unit Type"
                  required
                  value={formData.FlatType}
                  onChange={(e) => handleFieldChange('FlatType', String(e))}
                  options={FLAT_UNIT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
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

                <SinglePageSelection
                  label="Facing"
                  required
                  value={formData.Facing ?? ""}
                  onChange={(e) => handleFieldChange('Facing', String(e))}
                  options={FLAT_UNIT_FACING.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errors.Facing}
                />
              </div>

              <div>
                <Input
                  label="Free Area Offered (%)"
                  value={formData.FreeAreaOfferedPercent ?? ''}
                  onChange={(e) => handleFieldChange("FreeAreaOfferedPercent", filterNumbersWithDecimal(e.target.value))}
                  error={errors.FreeAreaOfferedPercent}
                  placeholder="Enter Free Area Offered (%)"
                />
              </div>
              <div>
                <Input
                  label="Extra Area Purchased SqFt"
                  value={formData.ExtraAreaPurchasedSqFt ?? ''}
                  onChange={(e) => handleFieldChange("ExtraAreaPurchasedSqFt", filterNumbersWithDecimal(e.target.value))}
                  error={errors.ExtraAreaPurchasedSqFt}
                  placeholder="Enter Extra Area Purchased SqFt"
                />
              </div>
              <div>
                <Input
                  label="Total Area SqFt"
                  value={formData.TotalAreaSqFt ?? ''}
                  onChange={(e) => handleFieldChange("TotalAreaSqFt", filterNumbersWithDecimal(e.target.value))}
                  error={errors.TotalAreaSqFt}
                  placeholder="Enter Total Area SqFt"
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

        }}
        onCancel={() => {
          setIsAddUpdateApplicantModalOpen(false)
          setEditingApplicantData(null)
          setFormDataForApplicant(initialFormStateApplicantDetails());
          setErrorsTenantApplicant({});

        }}
        title={editingApplicantData ? 'Update Tenant Applicant' : 'Add Tenant Applicant'}
        onSubmit={handleAddUpdateTenantApplicant}
        saveText={editingApplicantData ? 'Update' : 'Save'}
        cancelText="Cancel"
        loading={isLoading}
        size='large-half'
      >
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SinglePageSelection
                label="Applicant Type"
                required
                value={formDataForApplicant?.ApplicantType ?? ""}
                onChange={(e) => handleFieldChangeTenantApplicant('ApplicantType', String(e))}
                options={APPLICANT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                error={errorsTenantApplicant.ApplicantType}
              />
            </div>
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

          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                required
                error={errorsTenantApplicant.PhotoURL}
                value={applicantPhotoFiles}
                onChange={setApplicantPhotoFiles}
                availableFilesURL={editingApplicantData?.row._photoFiles}
                allowedTypes={['image/jpeg', 'image/png']}
                maxFiles={1}
                maxSizeMB={5}
                onRemoveExisting={(url) => setRemovedApplicantPhotoURLs((prev) => [...prev, url])}
              />
            </div>
            <div>

            </div>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Aadhar Number"

                error={errorsTenantApplicant.AadharCardNumber}
                type="text"
                value={formDataForApplicant.AadharCardNumber ?? ''}
                maxLength={12}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('AadharCardNumber', filterNumbers(e.target.value))
                }
                placeholder="Enter Aadhar number"
              />
            </div>
            <div>
              <MultiFilePicker
                label="Aadhaar Card"

                error={errorsTenantApplicant.AadharCardURL}
                value={aadharCardFiles}
                onChange={setAadharCardFiles}
                availableFilesURL={editingApplicantData?.row._aadharFiles}
                allowedTypes={[
                  'image/jpeg',
                  'image/png',
                  'application/pdf',
                ]}
                maxFiles={2}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedAadharCardURLs((prev) => [...prev, url])}
              />
            </div>
            <div>

            </div>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Enter PAN number"
              />
            </div>
            <div>
              <MultiFilePicker
                label="PAN Card"

                error={errorsTenantApplicant.PanCardURL}
                value={panCardFiles}
                onChange={setPanCardFiles}
                availableFilesURL={editingApplicantData?.row._panFiles}
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

            </div>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Passport Number"
                error={errorsTenantApplicant.PassportNumber}
                type="text"
                value={formDataForApplicant.PassportNumber ?? ''}
                maxLength={20}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('PassportNumber', e.target.value.toUpperCase())
                }
                placeholder="Enter Passport number"
              />
            </div>
            <div>
              <MultiFilePicker
                label="Passport"
                error={errorsTenantApplicant.PassportURL}
                value={passportFiles}
                onChange={setPassportFiles}
                availableFilesURL={editingApplicantData?.row._passportFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={3}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedPassportURLs((prev) => [...prev, url])}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Driving License Number"
                error={errorsTenantApplicant.DrivingLicenseNumber}
                type="text"
                value={formDataForApplicant.DrivingLicenseNumber ?? ''}
                maxLength={30}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('DrivingLicenseNumber', e.target.value.toUpperCase())
                }
                placeholder="Enter Driving License number"
              />
            </div>
            <div>
              <MultiFilePicker
                label="Driving License"
                error={errorsTenantApplicant.DrivingLicenseURL}
                value={drivingLicenseFiles}
                onChange={setDrivingLicenseFiles}
                availableFilesURL={editingApplicantData?.row._drivingFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={3}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedDrivingLicenseURLs((prev) => [...prev, url])}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Voting ID Number"
                error={errorsTenantApplicant.VotingIdNumber}
                type="text"
                value={formDataForApplicant.VotingIdNumber ?? ''}
                maxLength={30}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('VotingIdNumber', e.target.value.toUpperCase())
                }
                placeholder="Enter Voting ID number"
              />
            </div>
            <div>
              <MultiFilePicker
                label="Voting ID"
                error={errorsTenantApplicant.VotingIdURL}
                value={votingIdFiles}
                onChange={setVotingIdFiles}
                availableFilesURL={editingApplicantData?.row._votingFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={3}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedVotingIdURLs((prev) => [...prev, url])}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="GST Number"
                error={errorsTenantApplicant.GSTNumber}
                type="text"
                value={formDataForApplicant.GSTNumber ?? ''}
                maxLength={15}
                onChange={(e) =>
                  handleFieldChangeTenantApplicant('GSTNumber', e.target.value.toUpperCase())
                }
                placeholder="Enter GST number"
              />
            </div>
            <div>
              <MultiFilePicker
                label="GST Documents"
                error={errorsTenantApplicant.GSTNumberURL}
                value={gstFiles}
                onChange={setGstFiles}
                availableFilesURL={editingApplicantData?.row._gstFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={5}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedGstURLs((prev) => [...prev, url])}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SingleSelectDropdownWithPagination
                label="Bank"
                title="Select Bank"
                size="lg"
                dataFetchCallBack={fetchBankListMasterDropdown}
                onSelected={(item) => { handleFieldChangeTenantApplicant("BankListMasterId", Number(item?.value || 0)); }}
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <MultiFilePicker
                label="Cheque / Cancelled Cheque"
                error={errorsTenantApplicant.ChequeURL}
                value={chequeFiles}
                onChange={setChequeFiles}
                availableFilesURL={editingApplicantData?.row._chequeFiles}
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={2}
                maxSizeMB={10}
                onRemoveExisting={(url) => setRemovedChequeURLs((prev) => [...prev, url])}
              />
            </div>

          </div>

        </div>
      </Modal>

      {/* DELETE CONFIRMATION APPLICANT MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteTenantApplicantData(null)
        }}
        onConfirm={handleDeleteApplicant}
        title="You are about to delete a applicant?"
        message="Deleting this applicant will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />
    </div >
  );
};

export default AddUpdateTenant;
