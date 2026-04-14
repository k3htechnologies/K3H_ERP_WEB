import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader'
import { Button } from '@/ui/components/forms/Button';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import type { AddUpdateCompanyMasterRequest, AddUpdateCompanyPartnerRequest, CompanyPartnerData, FilterWithPaginationCompanyMasterRequest } from '@/features/companyMaster/models/CompanyMasterModel';
import { Input } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { FIRMS_TYPE_OPTIONS, GENDER_OPTIONS } from '@/core/constants';
import { useCountryStateCityDistrictVillageData } from '@/core/hooks/useCountryStateCityDistrictVillage';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';
import { Edit, IdCard, Mail, Phone, Trash2 } from 'lucide-react';
import { calculateMergedFiles, createFileUrlString, filterCIN, filterEmail, filterGST, filterLandline, filterLetters, filterMobile, filterPAN, filterPercentage, filterTAN, hasAnyDocumentFile, hasAnyFile, isAtLeastAge, isValidAadhaar, isValidCIN, isValidEmail, isValidGST, isValidMobile, isValidPAN, isValidTAN, mergeFiles } from '@/core/utils/fileValidation';
import { runApiWithLoader } from '@/core/utils';
import { companyMasterService } from '@/features/companyMaster/services/CompanyMasterService';
import * as E from 'fp-ts/Either';
import { Modal } from '@/ui/components/Modal/Modal';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

const initialFormState = (): AddUpdateCompanyMasterRequest => ({
  CompanyId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  CompanyName: '',
  FirmsType: '',
  ContactPerson: '',
  MobileNumber: '',
  EmailId: '',
  LandLineNumber: '',

  GSTNumber: '',
  GSTCertificateURL: null,
  RemoveGSTCertificateURL: '',

  CINNumber: '',
  CINURL: null,
  RemoveCINURL: '',

  PanNumber: '',
  PanCardURL: null,
  RemovePanCardURL: '',

  TANNumber: '',
  TANURL: null,
  RemoveTANURL: '',

  CountryMasterId: 0,
  StateMasterId: 0,
  DistrictMasterId: 0,
  CityMasterId: 0,
  CompanyLetterheadHeaderURL: null,
  RemoveCompanyLetterheadHeaderURL: '',
  CompanyLetterheadFooterURL: null,
  RemoveCompanyLetterheadFooterURL: ''

});

const initialFormStateCompanyPartner = (): AddUpdateCompanyPartnerRequest => ({
  CompanyPartnerId: 0,
  FirstName: '',
  LastName: '',
  MiddleName: '',
  DateOfBirth: null,
  Gender: '',
  MobileNumber: '',
  EmailId: '',
  PartnerPercentage: 0,
  PanNumber: '',
  PanCardURL: null,
  RemovePanCardURL: '',
  AadharCardNumber: '',
  AadharCardURL: null,
  RemoveAadharCardURL: '',
  PhotoURL: null,
  RemovePhotoURL: ''
});

type PartnerDetailsWithFiles = CompanyPartnerData & {
  _photoFiles?: (File | string)[];
  _aadharCardFiles?: (File | string)[];
  _panCardFiles?: (File | string)[];
  RemovePhotoURL?: string;
  RemoveAadharCardURL?: string;
  RemovePanCardURL?: string;
};

const AddCompany: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateCompanyMasterRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  //FILE PICKER

  const [gstGSTCertificateFiles, setGSTCertificateFiles] = useState<(File | string)[]>([]);
  const [removedGSTCertificateUrls, setRemovedGSTCertificateUrls] = useState<string[]>([]);
  const [gSTCertificateURL, setGSTCertificateURL] = useState<string>();

  const [panURLFiles, setPANURLFiles] = useState<(File | string)[]>([]);
  const [removedPanUrls, setRemovedPanUrls] = useState<string[]>([]);
  const [panURL, setPanURL] = useState<string>();

  const [cinURLFiles, setCINURLFiles] = useState<(File | string)[]>([]);
  const [removedCinUrls, setRemovedCinUrls] = useState<string[]>([]);
  const [cinURL, setCinURL] = useState<string>();

  const [tanURLFiles, setTANURLFiles] = useState<(File | string)[]>([]);
  const [removedTanUrls, setRemovedTanUrls] = useState<string[]>([]);
  const [tanURL, setTanURL] = useState<string>();

  const [companyLetterHeadHeaderFiles, setCompanyLetterHeadHeaderFiles] = useState<(File | string)[]>([]);
  const [removedCompanyLetterHeadHeaderUrls, setRemovedCompanyLetterHeadHeaderUrls] = useState<string[]>([]);
  const [companyLetterHeadHeaderURL, setCompanyLetterHeadHeaderURL] = useState<string>();

  const [companyLetterHeadFooterFiles, setCompanyLetterHeadFooterFiles] = useState<(File | string)[]>([]);
  const [removedCompanyLetterHeadFooterUrls, setRemovedCompanyLetterHeadFooterUrls] = useState<string[]>([]);
  const [companyLetterHeadFooterURL, setCompanyLetterHeadFooterURL] = useState<string>();

  // NAVIGATE
  const navigate = useNavigate();

  //GET VALUE FROM URL :COMPANYID
  const { companyId } = useParams<{ companyId?: string }>();
  // TOAST
  const { addToast } = useToast()

  //PERMISSION
  const { canAction } = useMenuPermissions('/companyMaster');

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //COMPANY PARTNER LIST
  const [companyPartnerList, setCompanyPartnerList] = useState<PartnerDetailsWithFiles[]>([]);
  const [formDataCompanyPartner, setFormDataCompanyPartner] = useState<AddUpdateCompanyPartnerRequest>(() => initialFormStateCompanyPartner());

  const [editingCompanyPartnerMasterData, setEditingCompanyPartnerMasterData] = useState<{ row: PartnerDetailsWithFiles; index: number } | null>(null);
  const [isAddUpdateCompanyPartnerModalOpen, setIsAddUpdateCompanyPartnerModalOpen] = useState(false)

  //DELETE COMPANY PARTNER
  const [isConfirmationDialogBoxOpenCompanyPartner, setIsConfirmationDialogBoxOpenCompanyPartner] = useState(false);
  const [deleteCompanyPartnerData, setDeleteCompanyPartnerData] = useState<{ row: PartnerDetailsWithFiles; index: number } | null>(null);


  const [companyPartnerAadhaarCardURLFiles, setCompanyPartnerAadhaarCardURLFiles] = useState<(File | string)[]>([]);
  const [removedCompanyPartnerAadhaarCardURLs, setRemovedCompanyPartnerAadhaarCardURLs] = useState<string[]>([]);


  const [companyPartnerPANURLFiles, setCompanyPartnerPANURLFiles] = useState<(File | string)[]>([]);
  const [removedCompanyPartnerPANURLs, setRemovedCompanyPartnerPANURLs] = useState<string[]>([]);


  const [companyPartnerPhotoURLFiles, setCompanyPartnerPhotoURLFiles] = useState<(File | string)[]>([]);
  const [removedCompanyPartnerPhotoURLs, setRemovedCompanyPartnerPhotoURLs] = useState<string[]>([]);

  //ERROR SET UP
  const [errorsCompanyPartner, setErrorsCompanyPartner] = useState<{ [k: string]: string }>({});

  //#endregion

  //#region COUNTRY STATE CITY DISTRICT 
  const {
    isLoading: isLocationLoading,
    countries,
    statesByCountryId,
    districtsByStateId,
    citiesByDistrictId,
  } = useCountryStateCityDistrictVillageData()

  const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1)
  const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null)
  const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null)

  const countryOptions = countries.map(c => ({ label: c.name, value: c.id }))

  const stateOptions =
    selectedCountryId != null
      ? (statesByCountryId[selectedCountryId] || []).map(s => ({
        label: s.name,
        value: s.id,
      }))
      : []

  const districtOptions =
    selectedStateId != null
      ? (districtsByStateId[selectedStateId] || []).map(d => ({
        label: d.name,
        value: d.id,
      }))
      : []

  const cityOptions =
    selectedDistrictId != null
      ? (citiesByDistrictId[selectedDistrictId] || []).map(c => ({
        label: c.name,
        value: c.id,
      }))
      : [];



  //#endregion

  //#region HANDLE CHNAGE EVENT WHEN INPUT BOX ANY OTHER
  const handleFieldChange = (field: keyof AddUpdateCompanyMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //#endregion 

  //#region INITIALIZATION
  useEffect(() => {

    if (companyId) {

      fetchCompanyMasterDetails();
      return;
    }

    setSelectedCountryId(1);
    handleFieldChange('CountryMasterId', 1);
  }, [companyId]);

  //#endregion

  //#region LOAD COMPANY MASTER DATA
  const fetchCompanyMasterDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationCompanyMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          IsCheckPermission: false,
          CompanyId: Number(companyId)
        }

        const response = await companyMasterService.apiCallPullCompanyMaster(params);

        if (E.isRight(response)) {

          const row = response.right.Data?.[0];

          if (row) {

            setFormData(prev => ({
              ...prev,
              CompanyId: row.CompanyId ?? prev.CompanyId,
              Uniquekey: row.Uniquekey ?? prev.Uniquekey,
              CompanyName: row.CompanyName ?? prev.CompanyName ?? '',
              FirmsType: row.FirmsType ?? prev.FirmsType ?? '',
              ContactPerson: row.ContactPerson ?? prev.ContactPerson ?? '',
              MobileNumber: row.MobileNumber ?? prev.MobileNumber ?? '',
              EmailId: row.EmailId ?? prev.EmailId ?? '',
              LandLineNumber: row.LandLineNumber ?? prev.LandLineNumber ?? '',
              GSTNumber: row.GSTNumber ?? prev.GSTNumber ?? '',
              GSTCertificateURL: null,
              RemoveGSTCertificateURL: "",
              CINNumber: row.CINNumber ?? prev.CINNumber ?? '',
              CINURL: null,
              RemoveCINURL: '',
              PanNumber: row.PANNumber ?? prev.PanNumber ?? '',
              PanCardURL: null,
              RemovePanCardURL: '',
              TANNumber: row.TANNumber ?? prev.TANNumber,
              CountryMasterId: row.CountryMasterId ?? prev.CountryMasterId ?? 1,
              DistrictMasterId: row.DistrictMasterId ?? prev.DistrictMasterId ?? 0,
              StateMasterId: row.StateMasterId ?? prev.StateMasterId ?? 0,
              CityMasterId: row.CityMasterId ?? prev.CityMasterId ?? 0,
              CompanyLetterheadHeaderURL: null,
              RemoveCompanyLetterheadHeaderURL: '',
              CompanyLetterheadFooterURL: null,
              RemoveCompanyLetterheadFooterURL: ''
            }));


            setGSTCertificateFiles([]);
            setGSTCertificateURL(row.GSTCertificateURL)
            setRemovedGSTCertificateUrls([]);

            setPANURLFiles([]);
            setPanURL(row.PanCardURL)
            setRemovedPanUrls([]);

            setCINURLFiles([]);
            setCinURL(row.CINURL)
            setRemovedCinUrls([]);

            setTANURLFiles([]);
            setTanURL(row.TANURL)
            setRemovedTanUrls([]);

            setCompanyLetterHeadHeaderFiles([]);
            setCompanyLetterHeadHeaderURL(row.CompanyLetterheadHeaderURL)
            setRemovedCompanyLetterHeadHeaderUrls([]);

            setCompanyLetterHeadFooterFiles([]);
            setCompanyLetterHeadFooterURL(row.CompanyLetterheadFooterURL)
            setRemovedCompanyLetterHeadFooterUrls([]);

            setSelectedCountryId(row.CountryMasterId ?? null);
            setSelectedStateId(row.StateMasterId ?? null);
            setSelectedDistrictId(row.DistrictMasterId ?? null);
            setSelectedCityId(row.CityMasterId ?? null);


            const partnerWithFiles = (row?.CompanyPartnerData || []).map(a => ({
              ...a,
              _photoFiles: parseDocumentUrls(a.PhotoURL ?? ''),
              _aadharCardFiles: parseDocumentUrls(a.AadharCardURL ?? ''),
              _panCardFiles: parseDocumentUrls(a.PanCardURL ?? '')
            }));

            setCompanyPartnerList(partnerWithFiles);

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
      'Loading Project Data'
    )
  }
  //#endregion

  //#region [VALIDATION FUNCTION]


  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateCompanyMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    // Company Name
    if (!formData.CompanyName?.trim()) {
      newErrors.CompanyName = "Company Name is required";
    } else if (formData.CompanyName?.length > 50) {
      newErrors.CompanyName = "Company Name must be at most 50 characters";
    }

    // Firms Type
    if (!formData.FirmsType?.trim()) {
      newErrors.FirmsType = "Firms Type is required";
    }

    // Contact Person
    if (!formData.ContactPerson?.trim()) {
      newErrors.ContactPerson = "Contact Person is required";
    }

    // Mobile
    if (!formData.MobileNumber?.trim()) {
      newErrors.MobileNumber = "Mobile Number is required";
    } else if (!isValidMobile(formData.MobileNumber?.trim())) {
      newErrors.MobileNumber = "Enter a Valid 10-digit Mobile Number";
    }

    // Email
    if (!formData.EmailId?.trim()) {
      newErrors.EmailId = "Email Id is required.";
    } else if (!isValidEmail(formData.EmailId?.trim())) {
      newErrors.EmailId = "Enter a Valid E-mail Address";
    }


    // ===== GST =====
    const gst = formData.GSTNumber?.trim() || "";
    const hasGSTNumber = gst !== "";
    const hasGSTFile = hasAnyFile(gstGSTCertificateFiles, gSTCertificateURL);

    // Rule 1 — number present but invalid
    if (hasGSTNumber && !isValidGST(gst)) {
      newErrors.GSTNumber = "Enter a Valid GST Number";
    }

    if (hasGSTNumber && !isValidGST(gst)) {
      newErrors.GSTNumber = "Enter a Valid GST Number";
    }

    // Rule 2 — number entered but NO document
    if (hasGSTNumber && !hasGSTFile) {
      newErrors.GSTCertificateURL = "GST Document is required";
    } else if (formData.GSTNumber !== "" && !hasAnyDocumentFile(gstGSTCertificateFiles, gSTCertificateURL, removedGSTCertificateUrls)) {
      newErrors.GSTCertificateURL = "GST Document is required.";
    }

    // Rule 3 — document uploaded but NO number
    if (hasGSTFile && !hasGSTNumber) {
      newErrors.GSTNumber = "GST Number is required";
    }
    // ===== PAN =====
    const pan = formData.PanNumber?.trim() || "";
    const hasPANNumber = pan !== "";
    const hasPANFile = hasAnyFile(panURLFiles, panURL);

    if (hasPANNumber && !isValidPAN(pan)) {
      newErrors.PanNumber = "Enter a Valid PAN Number";
    }

    if (hasPANNumber && !isValidPAN(pan)) {
      newErrors.PanNumber = "Enter a Valid PAN Number";
    }

    if (hasPANNumber && !hasPANFile) {
      newErrors.PanCardURL = "PAN Card Document is required";
    } else if (formData.PanNumber !== "" && !hasAnyDocumentFile(panURLFiles, panURL, removedPanUrls)) {
      newErrors.PanCardURL = "PAN Card Document is required.";
    }

    if (hasPANFile && !hasPANNumber) {
      newErrors.PanNumber = "PAN Number is required";
    }

    // ===== CIN =====
    const cin = formData.CINNumber?.trim() || "";
    const hasCINNumber = cin !== "";
    const hasCINFile = hasAnyFile(cinURLFiles, cinURL);

    if (hasCINNumber && !isValidCIN(cin)) {
      newErrors.CINNumber = "Enter a Valid CIN Number";
    }

    if (hasCINNumber && !isValidCIN(cin)) {
      newErrors.CINNumber = "Enter a Valid CIN Number";
    }

    if (hasCINNumber && !hasCINFile) {
      newErrors.CINURL = "CIN Document is required";
    } else if (formData.CINNumber !== "" && !hasAnyDocumentFile(cinURLFiles, cinURL, removedCinUrls)) {
      newErrors.CINURL = "CIN Document is required.";
    }

    if (hasCINFile && !hasCINNumber) {
      newErrors.CINNumber = "CIN Number is required";
    }


    // ===== TAN =====
    const tan = formData.TANNumber?.trim() || "";
    const hasTANNumber = tan !== "";
    const hasTANFile = hasAnyFile(tanURLFiles, tanURL);

    if (hasTANNumber && !isValidTAN(tan)) {
      newErrors.TANNumber = "Enter a Valid TAN Number";
    }

    if (hasTANNumber && !isValidTAN(tan)) {
      newErrors.TANNumber = "Enter a Valid TAN Number";
    }

    if (hasTANNumber && !hasTANFile) {
      newErrors.TANURL = "TAN Document is required";
    } else if (formData.TANNumber !== "" && !hasAnyDocumentFile(tanURLFiles, tanURL, removedTanUrls)) {
      newErrors.TANURL = "TAN Document is required.";
    }

    if (hasTANFile && !hasTANNumber) {
      newErrors.TANNumber = "TAN Number is required";
    }

    // Location
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

    // ===== Company Letter Head Header URL =====
    ;
    const hasCompanyLetterHeadHeaderFile = hasAnyFile(companyLetterHeadHeaderFiles, companyLetterHeadHeaderURL);

    if (!hasCompanyLetterHeadHeaderFile) {
      newErrors.CompanyLetterheadHeaderURL = "Company Letterhead Header Document is required";
    } else if (!hasAnyDocumentFile(companyLetterHeadHeaderFiles, companyLetterHeadHeaderURL, removedCompanyLetterHeadHeaderUrls)) {
      newErrors.CompanyLetterheadHeaderURL = "Company Letterhead Header Document is required";
    }

    // ===== COMANY LETTER FOOTER FOOTER URL =====

    const hasCompanyLetterHeadFooterFile = hasAnyFile(companyLetterHeadFooterFiles, companyLetterHeadFooterURL);

    if (!hasCompanyLetterHeadFooterFile) {
      newErrors.CompanyLetterheadFooterURL = "Company Letterhead Footer Document is required";
    } else if (!hasAnyDocumentFile(companyLetterHeadFooterFiles, companyLetterHeadFooterURL, removedCompanyLetterHeadFooterUrls)) {
      newErrors.CompanyLetterheadFooterURL = "Company Letterhead Footer Document is required";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  //#endregion

  //#region ADD UPDATE COMPANY MASTER

  const handleAddUpdateCompanyMaster = async () => {

    // Clear previous errors
    setErrors({})

    // Validate form
    const validation = validateCompanyMasterForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      addToast({ type: "error", title: "Please fill the required filed" });
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const pushCompanyFormData = buildCompanyMultipartFormData();

        const response = await companyMasterService.apiCallAddUpdateCompanyMaster(pushCompanyFormData);

        if (E.isRight(response)) {

          addToast({ type: "success", title: formData.CompanyId ? "Company details updated successfully" : "New Company added successfully" });

          // Get list state from navigation if available, otherwise use defaults
          navigate("/companyMaster");

        } else {

          addToast({ type: 'error', title: response.left.message });
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Operation failed' })
      },
      undefined,
      Number(companyId) === 0 ? 'Add Company Master' : 'Update Company Master...'
    )
  }


  //#endregion


  //#region EDIT DEPARTMENT MASTER

  const handleEditCompanyPartner = useCallback((row: PartnerDetailsWithFiles, index: number) => {

    const partnerData: AddUpdateCompanyPartnerRequest = {
      CompanyPartnerId: row.CompanyPartnerId ?? 0,
      FirstName: row.FirstName || '',
      LastName: row.LastName || '',
      MiddleName: row.MiddleName || '',
      DateOfBirth: row.DateOfBirth ?? null,
      Gender: row.Gender || '',
      MobileNumber: row.MobileNumber || '',
      EmailId: row.EmailId || '',
      PartnerPercentage: row.PartnerPercentage ?? 0,
      PanNumber: row.PanNumber || '',
      PanCardURL: null,
      RemovePanCardURL: '',
      AadharCardNumber: row.AadharCardNumber || '',
      AadharCardURL: null,
      RemoveAadharCardURL: '',
      PhotoURL: null,
      RemovePhotoURL: ''
    };

    setEditingCompanyPartnerMasterData({ row, index });
    setFormDataCompanyPartner(partnerData);

    // PHOTO
    setCompanyPartnerPhotoURLFiles(row._photoFiles ?? []);
    setRemovedCompanyPartnerPhotoURLs([]); // always reset

    // AADHAR
    setCompanyPartnerAadhaarCardURLFiles(row._aadharCardFiles ?? []);
    setRemovedCompanyPartnerAadhaarCardURLs([]);

    // PAN
    setCompanyPartnerPANURLFiles(row._panCardFiles ?? []);
    setRemovedCompanyPartnerPANURLs([]);

    setIsAddUpdateCompanyPartnerModalOpen(true);
  }, []);



  //#endregion

  //#region COMPANY PARTNER DELETE CONFIRMATION DAILOG BOX
  const handleConfirmationDialogBoxOpenCompanyPartner = useCallback((row: PartnerDetailsWithFiles, index: number) => {
    setDeleteCompanyPartnerData({ row, index });
    setIsConfirmationDialogBoxOpenCompanyPartner(true);

  }, []);

  //#endregion

  //#region VIEW PARTNER DATA

  const companyListForTable = useMemo(() => companyPartnerList, [companyPartnerList]);

  const companyPartnerColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'FullName',
        label: 'Full Name',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row, index) => {
          return (
            <div className="flex items-center justify-between w-full gap-1">

              <TooltipText
                text={value || "-"}
                maxWidth="250px"
                tooltipThreshold={25}
              />


              {/* RIGHT: actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button

                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditCompanyPartner(row, index);
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
                    handleConfirmationDialogBoxOpenCompanyPartner(row, index);
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
            </div>
          );

        }
      },

      {
        key: 'DateOfBirth',
        label: 'Date of Birth',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      },
      {
        key: 'Gender',
        label: 'Gender',
        width: '10',
        sortable: false,
        align: 'left',
        render: (value) => value || '-',
      },
      {
        key: 'MobileNumber',
        label: 'Mobile Number',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-',
      },
      {
        key: 'EmailId',
        label: 'Email ID',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => value || '-',
      },
      {
        key: 'PartnerPercentage',
        label: 'Share (%)',
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => (value !== null && value !== undefined ? value : '-'),
      },
      {
        key: 'PanNumber',
        label: 'PAN Number',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value: string, row: any) => {
          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.PanCardURL)}
              title="PAN Document"
              triggerLabel={value || '-'}
            />
          );
        }
      },


      {
        key: 'AadharCardNumber',
        label: 'Aadhaar Number',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value: string, row: any) => {

          return (
            <MultiImageViewer
              images={parseDocumentUrls(row.AadharCardURL)}
              title="Aadhar Document"
              triggerLabel={value || '-'}
            />
          );
        }

      }
    ],
    [handleEditCompanyPartner, handleConfirmationDialogBoxOpenCompanyPartner, companyPartnerList]
  )
  //#endregion

  //#region HANDLE CHNAGE EVENT WHEN INPUT BOX ANY OTHER
  const handleFieldChangeCompanyPartner = (field: keyof AddUpdateCompanyPartnerRequest, value: any) => {

    setFormDataCompanyPartner((prev) => ({ ...prev, [field]: value }));

    if (errorsCompanyPartner[field]) {
      setErrorsCompanyPartner((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //#endregion 

  //#region ADD UPDATE COMPANY PARTNER DATA

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddCompanyPartnerForm = (): {

    isValid: boolean

    errorsCompanyPartner: { [key: string]: string }

  } => {
    const newErrorsCompanyPartner: { [key: string]: string } = {}

    // First Name
    if (!formDataCompanyPartner.FirstName?.trim()) {
      newErrorsCompanyPartner.FirstName = 'First Name is required'
    } else if (formDataCompanyPartner.FirstName.trim().length > 50) {
      newErrorsCompanyPartner.FirstName = 'First Name must be at most 50 characters'
    }

    // Middle Name
    if (!formDataCompanyPartner.MiddleName?.trim()) {
      newErrorsCompanyPartner.MiddleName = 'Middle Name is required'
    } else if (formDataCompanyPartner.MiddleName.trim().length > 50) {
      newErrorsCompanyPartner.MiddleName = 'Middle Name must be at most 50 characters'
    }

    // Middle Name
    if (!formDataCompanyPartner.LastName?.trim()) {
      newErrorsCompanyPartner.LastName = 'Last Name is required'
    } else if (formDataCompanyPartner.LastName.trim().length > 50) {
      newErrorsCompanyPartner.LastName = 'Last Name must be at most 50 characters'
    }

    // Mobile
    if (!formDataCompanyPartner.MobileNumber?.trim()) {
      newErrorsCompanyPartner.MobileNumber = 'Mobile Number is required.'
    } else if (!isValidMobile(formDataCompanyPartner.MobileNumber.trim())) {
      newErrorsCompanyPartner.MobileNumber = 'Enter a Valid 10-Digit Mobile Number'
    }

    // Partner Percentage
    const percentage = Number(formDataCompanyPartner.PartnerPercentage ?? 0)

    if (isNaN(percentage)) {
      newErrorsCompanyPartner.PartnerPercentage = 'Partner Percentage must be a number'
    } else if (percentage <= 0 || percentage > 100) {
      newErrorsCompanyPartner.PartnerPercentage = 'Partner Percentage must be between 1 and 100'
    }

    // PAN
    if (!formDataCompanyPartner.PanNumber?.trim()) {
      newErrorsCompanyPartner.PanNumber = 'PAN Number is required'
    } else if (!isValidPAN(formDataCompanyPartner.PanNumber.trim())) {
      newErrorsCompanyPartner.PanNumber = 'Enter a valid PAN Number'
    }

    // Aadhar
    if (!formDataCompanyPartner.AadharCardNumber?.trim()) {
      newErrorsCompanyPartner.AadharCardNumber = 'Aadhar Number is required'
    } else if (!isValidAadhaar(formDataCompanyPartner.AadharCardNumber.trim())) {
      newErrorsCompanyPartner.AadharCardNumber = 'Enter a Valid 12-Digit Aadhar Number'
    }

    if (!formDataCompanyPartner.DateOfBirth) {
      newErrorsCompanyPartner.DateOfBirth = 'DOB is required'

    }

    if (!formDataCompanyPartner.Gender?.trim()) {
      newErrorsCompanyPartner.Gender = "Gender is required";
    }

    if (!formDataCompanyPartner.EmailId?.trim()) {
      newErrorsCompanyPartner.EmailId = 'E-mail Id is required'
    } else if (!isValidEmail(formDataCompanyPartner.EmailId.trim())) {
      newErrorsCompanyPartner.EmailId = 'Enter a Valid E-mail Id'
    }


    // Date of Birth (optional future date check)
    if (!formDataCompanyPartner.DateOfBirth) {
      newErrorsCompanyPartner.DateOfBirth = "DOB is required";

    } else {
      const dob = new Date(formDataCompanyPartner.DateOfBirth);
      const today = new Date();

      if (dob > today) {
        newErrorsCompanyPartner.DateOfBirth = "Date of Birth cannot be in the future";

      } else if (!isAtLeastAge(dob, 18)) {
        newErrorsCompanyPartner.DateOfBirth = "User must be at least 18 years old";
      }
    }

    // ===== PAN =====
    const mergedPanFiles = editingCompanyPartnerMasterData
      ? calculateMergedFiles(editingCompanyPartnerMasterData.row._panCardFiles, companyPartnerPANURLFiles, removedCompanyPartnerPANURLs)
      : companyPartnerPANURLFiles.slice();

    const PanNumber = formDataCompanyPartner.PanNumber?.trim() || "";
    const hasPanNumber = PanNumber !== "";
    const hasPanFile = mergedPanFiles.length > 0;

    // Rule 1
    if (hasPanNumber && !isValidPAN(PanNumber)) {
      newErrorsCompanyPartner.PanNumber = "Enter a valid PAN Card Number";
    }

    // Rule 2
    if (hasPanNumber && !hasPanFile) {
      newErrorsCompanyPartner.PanCardURL = "PAN Document is required";
    }

    // Rule 3
    if (hasPanFile && !hasPanNumber) {
      newErrorsCompanyPartner.PanNumber = "PAN Card Number is required";
    }


    // ===== Aadhaar =====

    const mergedAadharFiles = editingCompanyPartnerMasterData
      ? calculateMergedFiles(editingCompanyPartnerMasterData.row._aadharCardFiles, companyPartnerAadhaarCardURLFiles, removedCompanyPartnerAadhaarCardURLs)
      : companyPartnerAadhaarCardURLFiles.slice();

    const AadharCardNumber = formDataCompanyPartner.AadharCardNumber?.trim() || "";
    const hasAadharCardNumber = AadharCardNumber !== "";
    const hasAadharCardNumberFile = mergedAadharFiles.length > 0;

    // 🔹 Rule 1 — If number present, validate number
    if (hasAadharCardNumber && !isValidAadhaar(AadharCardNumber)) {
      newErrorsCompanyPartner.AadharCardNumber = "Enter a valid Aadhaar Card Number";
    }

    // 🔹 Rule 2 — If number present, file is required
    if (hasAadharCardNumber && !hasAadharCardNumberFile) {
      newErrorsCompanyPartner.AadharCardURL = "Aadhaar Document is required";
    }

    // 🔹 Rule 3 — If file present, number is required
    if (hasAadharCardNumberFile && !hasAadharCardNumber) {
      newErrorsCompanyPartner.AadharCardNumber = "Aadhaar Card Number is required";
    }


    // ===== PHOTO =====
    const mergedPhotoFiles = editingCompanyPartnerMasterData
      ? calculateMergedFiles(editingCompanyPartnerMasterData.row._photoFiles, companyPartnerPhotoURLFiles, removedCompanyPartnerPhotoURLs)
      : companyPartnerPhotoURLFiles.slice();

    if (mergedPhotoFiles.length === 0) {
      newErrorsCompanyPartner.PhotoURL = "Partner Photo is required";
    }

    return {
      isValid: Object.keys(newErrorsCompanyPartner).length === 0,
      errorsCompanyPartner: newErrorsCompanyPartner
    }
  }

  const handleAddUpdateCompanyPartner = async (e: React.FormEvent) => {
    e.preventDefault();

    // clear partner-specific errors
    setErrorsCompanyPartner({})

    const validation = validateAddCompanyPartnerForm()

    if (!validation.isValid) {
      setErrorsCompanyPartner(validation.errorsCompanyPartner)
      return
    }

    const mergedPhotoFiles = editingCompanyPartnerMasterData
      ? mergeFiles(editingCompanyPartnerMasterData.row._photoFiles, companyPartnerPhotoURLFiles, removedCompanyPartnerPhotoURLs)
      : companyPartnerPhotoURLFiles.slice();

    const mergedAadharFiles = editingCompanyPartnerMasterData
      ? mergeFiles(editingCompanyPartnerMasterData.row._aadharCardFiles, companyPartnerAadhaarCardURLFiles, removedCompanyPartnerAadhaarCardURLs)
      : companyPartnerAadhaarCardURLFiles.slice();

    const mergedPanFiles = editingCompanyPartnerMasterData
      ? mergeFiles(editingCompanyPartnerMasterData.row._panCardFiles, companyPartnerPANURLFiles, removedCompanyPartnerPANURLs)
      : companyPartnerPANURLFiles.slice();

    const partnerToSave: CompanyPartnerData & {
      _photoFiles?: (File | string)[];
      _aadharCardFiles?: (File | string)[];
      _panCardFiles?: (File | string)[];
      RemovePhotoURL?: string;
      RemoveAadharCardURL?: string;
      RemovePanCardURL?: string;
    } = {
      CompanyPartnerId: editingCompanyPartnerMasterData?.row.CompanyPartnerId ?? 0,
      Uniquekey: editingCompanyPartnerMasterData?.row.Uniquekey || '',
      CompanyId: formData.CompanyId ?? 0,

      FirstName: formDataCompanyPartner.FirstName || '',
      MiddleName: formDataCompanyPartner.MiddleName || '',
      LastName: formDataCompanyPartner.LastName || '',
      FullName: `${formDataCompanyPartner.FirstName} ${formDataCompanyPartner.MiddleName} ${formDataCompanyPartner.LastName}`.trim(),

      DateOfBirth: formDataCompanyPartner.DateOfBirth || null,
      Gender: formDataCompanyPartner.Gender || '',
      MobileNumber: formDataCompanyPartner.MobileNumber || '',
      EmailId: formDataCompanyPartner.EmailId || '',
      PartnerPercentage: formDataCompanyPartner.PartnerPercentage ?? 0,

      PanNumber: formDataCompanyPartner.PanNumber || '',
      AadharCardNumber: formDataCompanyPartner.AadharCardNumber || '',

      // -------- MERGE FILE NAMES (existing + new uploads) ----------
      PhotoURL: createFileUrlString(mergedPhotoFiles),

      PanCardURL: createFileUrlString(mergedPanFiles),

      AadharCardURL: createFileUrlString(mergedAadharFiles),

      // -------- SET "_FILES" FOR UI DISPLAY / EDITING ----------
      _photoFiles: mergedPhotoFiles,

      _panCardFiles: mergedPanFiles,

      _aadharCardFiles: mergedAadharFiles,

      // -------- REMOVED URLS ----------
      RemovePhotoURL: removedCompanyPartnerPhotoURLs.join(','),
      RemovePanCardURL: removedCompanyPartnerPANURLs.join(','),
      RemoveAadharCardURL: removedCompanyPartnerAadhaarCardURLs.join(','),

      CreatedById: editingCompanyPartnerMasterData?.row.CreatedById ?? 0,
      CreatedBy: editingCompanyPartnerMasterData?.row.CreatedBy || '',
      CreatedDate: editingCompanyPartnerMasterData?.row.CreatedDate || null,

      ModifiedById: 0,
      ModifiedBy: '',
      ModifiedDate: null,
    };

    setCompanyPartnerList(prev => {
      if (editingCompanyPartnerMasterData) {
        const updated = [...prev];
        updated[editingCompanyPartnerMasterData.index] = partnerToSave;
        return updated;
      }
      return [...prev, partnerToSave];
    });

    // Cleanup and close modal — do this AFTER updating list
    setIsAddUpdateCompanyPartnerModalOpen(false);
    setEditingCompanyPartnerMasterData(null);
    setFormDataCompanyPartner(initialFormStateCompanyPartner());
    setCompanyPartnerPANURLFiles([]);
    setCompanyPartnerAadhaarCardURLFiles([]);
    setCompanyPartnerPhotoURLFiles([]);
    setRemovedCompanyPartnerPhotoURLs([]);
    setRemovedCompanyPartnerAadhaarCardURLs([]);
    setRemovedCompanyPartnerPANURLs([]);
  };

  //#endregion

  //#region  DELETE COMPANY PARTNER DATA


  const handleDeleteCompanyPartner = () => {

    if (!deleteCompanyPartnerData) return;

    const removeIndex = deleteCompanyPartnerData.index;

    if (removeIndex < 0) {

      setIsConfirmationDialogBoxOpenCompanyPartner(false);

      setDeleteCompanyPartnerData(null);

      addToast({ type: 'error', title: 'Unable to find the selected record to delete' });

      return;

    }


    setCompanyPartnerList(prev => prev.filter((_, i) => i !== removeIndex));

    setIsConfirmationDialogBoxOpenCompanyPartner(false);

    setDeleteCompanyPartnerData(null);

    addToast({ type: 'success', title: 'Company Partner Removed' });

  };

  //#endregion

  //#region  COMPANY DETAILS WITH PARTNER DETAILS
  const buildCompanyMultipartFormData = (): FormData => {

    const fd = new FormData();

    // -------- Top-Level Company Fields --------
    fd.append('CompanyId', String(formData.CompanyId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey ?? '');
    fd.append('CompanyName', formData.CompanyName ?? '');
    fd.append('FirmsType', formData.FirmsType ?? '');
    fd.append('ContactPerson', formData.ContactPerson ?? '');
    fd.append('MobileNumber', formData.MobileNumber ?? '');
    fd.append('EmailId', formData.EmailId ?? '');
    fd.append('LandLineNumber', formData.LandLineNumber ?? '');
    fd.append('GSTNumber', formData.GSTNumber ?? '');
    fd.append('PanNumber', formData.PanNumber ?? '');
    fd.append('CINNumber', formData.CINNumber ?? '');
    fd.append('TANNumber', formData.TANNumber ?? '');
    fd.append('CountryMasterId', String(formData.CountryMasterId ?? 0));
    fd.append('StateMasterId', String(formData.StateMasterId ?? 0));
    fd.append('DistrictMasterId', String(formData.DistrictMasterId ?? 0));
    fd.append('CityMasterId', String(formData.CityMasterId ?? 0));

    // -------- Company Files (New Uploads Only) --------
    gstGSTCertificateFiles.forEach(file => file instanceof File && fd.append('GSTCertificateURL', file));
    fd.append('RemoveGSTCertificateURL', removedGSTCertificateUrls.join(','));

    panURLFiles.forEach(file => file instanceof File && fd.append('PanCardURL', file));
    fd.append('RemovePanCardURL', removedPanUrls.join(','));

    cinURLFiles.forEach(file => file instanceof File && fd.append('CINURL', file));
    fd.append('RemoveCINURL', removedCinUrls.join(','));

    tanURLFiles.forEach(file => file instanceof File && fd.append('TANURL', file));
    fd.append('RemoveTANURL', removedTanUrls.join(','));

    companyLetterHeadHeaderFiles.forEach(file => file instanceof File && fd.append('CompanyLetterheadHeaderURL', file));
    fd.append('RemoveCompanyLetterheadHeaderURL', removedCompanyLetterHeadHeaderUrls.join(','));

    companyLetterHeadFooterFiles.forEach(file => file instanceof File && fd.append('CompanyLetterheadFooterURL', file));
    fd.append('RemoveCompanyLetterheadFooterURL', removedCompanyLetterHeadFooterUrls.join(','));


    // -------- Helper (Existing + New Files Together) --------
    const addFilesWithExisting = (
      fdLocal: FormData,
      prefix: string,
      fileArray: (File | string)[] | undefined,
      fieldKey: string
    ) => {
      if (!fileArray || fileArray.length === 0) return;

      // Existing URLs → comma-separated string
      const existingNames = fileArray
        .filter(x => typeof x === 'string' && String(x).trim().length > 0)
        .map(x => String(x).trim())
        .join(',');

      if (existingNames) {
        fdLocal.append(`${prefix}.${fieldKey}`, existingNames);
      }

      // New uploads → append as File
      fileArray.forEach(item => {
        if (item instanceof File) {
          fdLocal.append(`${prefix}.${fieldKey}`, item, item.name);
        }
      });
    };


    // -------- Company Partner List --------
    companyPartnerList.forEach((partner, index) => {

      const prefix = `AddUpdateCompanyPartner[${index}]`;

      fd.append(`${prefix}.CompanyPartnerId`, String(partner.CompanyPartnerId ?? 0));
      fd.append(`${prefix}.CompanyId`, String(formData.CompanyId ?? 0));
      fd.append(`${prefix}.FirstName`, partner.FirstName ?? '');
      fd.append(`${prefix}.MiddleName`, partner.MiddleName ?? '');
      fd.append(`${prefix}.LastName`, partner.LastName ?? '');
      fd.append(`${prefix}.FullName`, partner.FullName ?? '');
      fd.append(`${prefix}.DateOfBirth`, partner.DateOfBirth ? String(partner.DateOfBirth) : '');
      fd.append(`${prefix}.Gender`, partner.Gender ?? '');
      fd.append(`${prefix}.MobileNumber`, partner.MobileNumber ?? '');
      fd.append(`${prefix}.EmailId`, partner.EmailId ?? '');
      fd.append(`${prefix}.PartnerPercentage`, String(partner.PartnerPercentage ?? 0));
      fd.append(`${prefix}.PanNumber`, partner.PanNumber ?? '');
      fd.append(`${prefix}.AadharCardNumber`, partner.AadharCardNumber ?? '');

      // ---- Removed URLs ----
      const appendIfNonEmpty = (key: string, val?: string) => {
        if (val && String(val).trim().length > 0) {
          fd.append(`${prefix}.${key}`, String(val));
        }
      };

      appendIfNonEmpty('RemovePhotoURL', partner.RemovePhotoURL);
      appendIfNonEmpty('RemovePanCardURL', partner.RemovePanCardURL);
      appendIfNonEmpty('RemoveAadharCardURL', partner.RemoveAadharCardURL);


      // ---- Existing + New Files ----
      const realPartner: any = partner;

      addFilesWithExisting(fd, prefix, realPartner._photoFiles, 'PhotoURL');
      addFilesWithExisting(fd, prefix, realPartner._panCardFiles, 'PanCardURL');
      addFilesWithExisting(fd, prefix, realPartner._aadharCardFiles, 'AadharCardURL');
    });

    return fd;
  };
  //#region 


  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
      {/* ✅ Fixed HEADER */}

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
        {/* ============================================================= [BASIC COMPANY DETAILS] ============================================================================================= */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">Basic Company Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>

              <Input
                label='Company Name'
                required
                error={errors.CompanyName}
                type="text"
                value={formData.CompanyName}
                onChange={(e) => {
                  handleFieldChange('CompanyName', e.target.value)
                }}
                minLength={5}
                maxLength={50}
                placeholder="Enter company Name"
              />

            </div>
            <div>

              <SinglePageSelection
                label='Firms Type'
                required
                error={errors.FirmsType}
                value={formData.FirmsType}
                onChange={(e) => {
                  handleFieldChange('FirmsType', String(e))
                }}

                options={FIRMS_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />


            </div>
            <div>

              <Input
                label='Mobile Number'
                required
                error={errors.MobileNumber}
                type="text"
                value={formData.MobileNumber}
                maxLength={10}
                leftIcon="+91"
                rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                onChange={(e) => {
                  const mobileNumber = filterMobile(e.target.value);
                  handleFieldChange('MobileNumber', mobileNumber)
                }}
                placeholder="Enter Valid Mobile Number"
              />

            </div>
            <div>

              <Input
                label='Contact Person'
                required
                error={errors.ContactPerson}
                type="text"
                value={formData.ContactPerson}
                minLength={5}
                maxLength={50}
                onChange={(e) => {
                  const contactPerson = filterLetters(e.target.value);
                  handleFieldChange('ContactPerson', contactPerson)
                }}
                placeholder="Enter Contact Person Name"
              />

            </div>
            <div>

              <Input
                label='Email Id'
                required
                type="text"
                value={formData.EmailId}
                error={errors.EmailId}
                rightIcon={<Mail className="h-4 w-4 text-gray-400" />}
                onChange={(e) => {
                  const emailId = filterEmail(e.target.value);
                  handleFieldChange('EmailId', emailId)
                }}
                placeholder="Enter Valid E-mail Id"
              />

            </div>
            <div>

              <Input
                label='Land Line Number'
                type="text"
                value={formData.LandLineNumber}
                error={errors.LandLineNumber}
                leftIcon="+91"
                rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                onChange={(e) => {
                  const landLineNumber = filterLandline(e.target.value);
                  handleFieldChange('LandLineNumber', landLineNumber)
                }}
                placeholder="Enter Land Line Number"
              />

            </div>
          </div>
        </div>
        {/* ============================================================= [GOVERNMENT IDENTIFIERS] ============================================================================================= */}
        <div className="space-y-4 pt-5">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Government Identifiers</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>

              <Input
                label='GST Number'
                type="text"
                value={formData.GSTNumber}
                error={errors.GSTNumber}
                rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                onChange={(e) => {
                  const gstNumber = filterGST(e.target.value);
                  handleFieldChange('GSTNumber', gstNumber)
                }}
                placeholder="Enter Valid GST Number"
              />

            </div>
            <div>

              <MultiFilePicker
                label="GST Certificate"
                placeholder='Select GST Certificate'
                error={errors.GSTCertificateURL}
                value={gstGSTCertificateFiles}
                onChange={setGSTCertificateFiles}
                availableFilesURL={gSTCertificateURL ?? ""}
                allowedTypes={["image/jpeg",
                  "image/png",
                  "image/jpg",
                  "application/pdf",
                  "application/vnd.ms-excel",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ]}
                maxFiles={5}
                onRemoveExisting={(url) => {
                  setRemovedGSTCertificateUrls((prev) => [...prev, url])
                }}
              />

            </div>
            <div>

              <Input
                label='PAN Number'
                type="text"
                value={formData.PanNumber}
                error={errors.PanNumber}
                rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                onChange={(e) => {
                  const panNumber = filterPAN(e.target.value);
                  handleFieldChange('PanNumber', panNumber)
                }}
                placeholder="Enter Valid PAN Number"
              />

            </div>
            <div>

              <MultiFilePicker
                label="PAN Card"
                placeholder='Select Pan Card'
                error={errors.PanCardURL}
                value={panURLFiles}
                onChange={setPANURLFiles}
                availableFilesURL={panURL ?? ""}
                allowedTypes={["image/jpeg",
                  "image/png",
                  "image/jpg",
                  "application/pdf",
                  "application/vnd.ms-excel",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                ]}
                maxFiles={5}
                onRemoveExisting={(url) => {
                  setRemovedPanUrls((prev) => [...prev, url])
                }}
              />

            </div>
            <div>

              <Input
                label='CIN Number'
                type="text"
                value={formData.CINNumber}
                error={errors.CINNumber}
                rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                maxLength={21}
                onChange={(e) => {
                  const cinNumber = filterCIN(e.target.value);
                  handleFieldChange('CINNumber', cinNumber)
                }}
                placeholder="Enter Valid CIN Number"
              />

            </div>
            <div>


              <MultiFilePicker
                label='CIN'
                placeholder='Select CIN'
                value={cinURLFiles}
                error={errors.CINURL}
                onChange={setCINURLFiles}
                availableFilesURL={cinURL ?? ""}
                allowedTypes={[
                  "image/jpeg",
                  "image/png",
                  "application/pdf",
                  "application/vnd.ms-excel",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ]}
                maxFiles={5}
                onRemoveExisting={(url) => {
                  setRemovedCinUrls((prev) => [...prev, url])
                }}
              />

            </div>

            <div>

              <Input
                label='TAN Number'
                type="text"
                value={formData.TANNumber}
                error={errors.TANNumber}
                rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
                maxLength={20}
                onChange={(e) => {
                  const tanNumber = filterTAN(e.target.value);
                  handleFieldChange('TANNumber', tanNumber)
                }}
                placeholder="Enter Valid TAN Number"
              />

            </div>

            <div>
              <MultiFilePicker
                label='TAN'
                placeholder='Select TAN'
                value={tanURLFiles}
                error={errors.TANURL}
                onChange={setTANURLFiles}
                availableFilesURL={tanURL ?? ""}
                allowedTypes={[
                  "image/jpeg",
                  "image/png",
                  "application/pdf",
                  "application/vnd.ms-excel",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ]}
                maxFiles={5}
                onRemoveExisting={(url) => {
                  setRemovedTanUrls((prev) => [...prev, url])
                }}
              />

            </div>
          </div>
        </div>

        {/* ============================================================= [ADDRESS] ============================================================================================= */}
        <div className="space-y-4 pt-5">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div>

              <SinglePageSelection
                label='Country'
                placeholder="Select Country"
                required
                value={selectedCountryId || ''}
                error={errors.CountryMasterId}
                onChange={(item) => {

                  if (!item) {
                    setSelectedCountryId(null);
                    setSelectedStateId(null);
                    setSelectedDistrictId(null);
                    setSelectedCityId(null);

                    handleFieldChange('CountryMasterId', 0);
                    handleFieldChange('StateMasterId', 0);
                    handleFieldChange('DistrictMasterId', 0);
                    handleFieldChange('CityMasterId', 0);

                    return;
                  }

                  const id = Number(item);

                  setSelectedCountryId(id);
                  setSelectedStateId(null);
                  setSelectedDistrictId(null);
                  setSelectedCityId(null);

                  handleFieldChange('CountryMasterId', id);
                  handleFieldChange('StateMasterId', 0);
                  handleFieldChange('DistrictMasterId', 0);
                  handleFieldChange('CityMasterId', 0);
                }}
                disabled={isLocationLoading}
                options={countryOptions}
              />


            </div>

            <div>

              <SinglePageSelection
                label='State'
                placeholder="Select State"
                required
                value={selectedStateId ?? ''}
                error={errors.StateMasterId}
                onChange={(item) => {

                  if (!item) {
                    setSelectedStateId(null);
                    setSelectedDistrictId(null);
                    setSelectedCityId(null);

                    handleFieldChange("StateMasterId", 0);
                    handleFieldChange("DistrictMasterId", 0);
                    handleFieldChange("CityMasterId", 0);

                    return;
                  }

                  const id = Number(item);

                  setSelectedStateId(id);
                  setSelectedDistrictId(null);
                  setSelectedCityId(null);

                  handleFieldChange("StateMasterId", id);
                  handleFieldChange("DistrictMasterId", 0);
                  handleFieldChange("CityMasterId", 0);
                }}
                disabled={!selectedCountryId || stateOptions.length === 0}
                options={stateOptions}
              />


            </div>

            <div>

              <SinglePageSelection
                label='District'
                placeholder="Select District"
                required
                value={selectedDistrictId ?? ''}
                error={errors.DistrictMasterId}
                onChange={(item) => {

                  if (!item) {
                    setSelectedDistrictId(null);
                    setSelectedCityId(null);

                    handleFieldChange('DistrictMasterId', 0);
                    handleFieldChange('CityMasterId', 0);
                    return;
                  }

                  const id = Number(item);

                  setSelectedDistrictId(id);
                  setSelectedCityId(null);

                  handleFieldChange('DistrictMasterId', id);
                  handleFieldChange('CityMasterId', 0);
                }}
                disabled={!selectedStateId || districtOptions.length === 0}
                options={districtOptions}
              />
            </div>

            <div>

              <SinglePageSelection
                label='City'
                placeholder="Select City"
                required
                value={selectedCityId ?? ''}
                error={errors.CityMasterId}
                onChange={(item) => {

                  if (!item) {
                    setSelectedCityId(null);
                    handleFieldChange('CityMasterId', 0);
                    return;
                  }

                  const id = Number(item);

                  setSelectedCityId(id);
                  handleFieldChange('CityMasterId', id);
                }}
                disabled={!selectedDistrictId || cityOptions.length === 0}
                options={cityOptions}
              />

            </div>

          </div>
        </div>

        {/* ============================================================= [COMPANY VERIFICATION] ============================================================================================= */}
        <div className="space-y-4 pt-5">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Company Verification</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div>

              <MultiFilePicker
                label='Company Letterhead Header'
                placeholder='Select Letterhead Header'
                required
                error={errors.CompanyLetterheadHeaderURL}
                value={companyLetterHeadHeaderFiles}
                onChange={setCompanyLetterHeadHeaderFiles}
                availableFilesURL={companyLetterHeadHeaderURL ?? ""}
                allowedTypes={[
                  "image/jpeg",
                  "image/png",
                  "application/pdf",
                  "application/vnd.ms-excel",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ]}
                maxFiles={1}
                onRemoveExisting={(url) => {
                  setRemovedCompanyLetterHeadHeaderUrls((prev) => [...prev, url])
                }}
              />


            </div>

            <div>

              <MultiFilePicker
                label='Company Letterhead Footer'
                placeholder='Select Letterhead Footer'
                required
                value={companyLetterHeadFooterFiles}
                error={errors.CompanyLetterheadFooterURL}
                onChange={setCompanyLetterHeadFooterFiles}
                availableFilesURL={companyLetterHeadFooterURL ?? ""}
                allowedTypes={[
                  "image/jpeg",
                  "image/png",
                  "application/pdf",
                  "application/vnd.ms-excel",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ]}
                maxFiles={1}
                onRemoveExisting={(url) => {
                  setRemovedCompanyLetterHeadFooterUrls((prev) => [...prev, url])
                }}
              />


            </div>
          </div>
        </div>


        {/* ============================================================= [COMPANY PARTNER ] ============================================================================================= */}
        <div className="space-y-4 pt-5 pb-5">
          <div className="flex items-center justify-between border-b border-gray-500 pb-2">
            <h3 className="text-lg font-semibold text-gray-900  pb-2">
              Company Partner
            </h3>

            <Button
              color="blue"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditingCompanyPartnerMasterData(null);
                setFormDataCompanyPartner(initialFormStateCompanyPartner());

                setCompanyPartnerPhotoURLFiles([]);
                setCompanyPartnerAadhaarCardURLFiles([]);
                setCompanyPartnerPANURLFiles([]);

                setRemovedCompanyPartnerPhotoURLs([]);
                setRemovedCompanyPartnerPANURLs([]);
                setRemovedCompanyPartnerAadhaarCardURLs([]);
                setIsAddUpdateCompanyPartnerModalOpen(true);

              }}
            >
              Add Partner
            </Button>
          </div>

          <div className='pt-1'>
            <DataTable
              data={companyListForTable ?? []}
              columns={companyPartnerColumns}
              emptyMessage="No company Partner found"
              fixedHeight={true}
              maxHeight="calc(100vh - 200px)"
              recordsPerPage={20}
              className="flex-1"
            />
          </div>
        </div>

        {/* ✅ Fixed Bottom  */}

        <BottomActionBar
          cancelText="Cancel"
          saveText={formData.CompanyId ? "Update" : "Add"}
          onCancel={() => navigate(-1)}
          canAction={canAction}
          onSave={() => {
            handleAddUpdateCompanyMaster();
          }}
          isLoading={isLoading}
        />
      </div>


      {/*  ADD EDIT UPDATE COMPANY PARTNER MODAL */}

      <Modal
        isOpen={isAddUpdateCompanyPartnerModalOpen}
        onClose={() => {
          setIsAddUpdateCompanyPartnerModalOpen(false)
          setEditingCompanyPartnerMasterData(null)
          setFormDataCompanyPartner(initialFormStateCompanyPartner());
          setCompanyPartnerPANURLFiles([]);
          setCompanyPartnerAadhaarCardURLFiles([]);
          setCompanyPartnerPhotoURLFiles([]);
          setRemovedCompanyPartnerPhotoURLs([]);
          setRemovedCompanyPartnerAadhaarCardURLs([]);
          setRemovedCompanyPartnerPANURLs([]);
          setErrorsCompanyPartner({});

        }}
        onCancel={() => {
          setIsAddUpdateCompanyPartnerModalOpen(false)
          setEditingCompanyPartnerMasterData(null)
          setFormDataCompanyPartner(initialFormStateCompanyPartner());
          setCompanyPartnerPANURLFiles([]);
          setCompanyPartnerAadhaarCardURLFiles([]);
          setCompanyPartnerPhotoURLFiles([]);
          setRemovedCompanyPartnerPhotoURLs([]);
          setRemovedCompanyPartnerAadhaarCardURLs([]);
          setRemovedCompanyPartnerPANURLs([]);
          setErrorsCompanyPartner({});

        }}
        title={editingCompanyPartnerMasterData ? 'Update Company Partner' : 'Add Company Partner'}
        onSubmit={handleAddUpdateCompanyPartner}
        saveText={editingCompanyPartnerMasterData ? 'Update' : 'Add'}
        loading={isLoading}
        size='small50'
      >
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              label='First Name'
              required
              error={errorsCompanyPartner.FirstName}
              type="text"
              value={formDataCompanyPartner.FirstName}
              maxLength={50}
              onChange={e =>
                handleFieldChangeCompanyPartner('FirstName', filterLetters(e.target.value))
              }
              placeholder="Enter First Name"
            />
            <Input
              label='Middle Name'
              required
              error={errorsCompanyPartner.MiddleName}
              type="text"
              value={formDataCompanyPartner.MiddleName}
              maxLength={50}
              onChange={e =>
                handleFieldChangeCompanyPartner('MiddleName', filterLetters(e.target.value))
              }
              placeholder="Enter Middle Name"
            />

            <Input
              label='Last Name'
              required
              error={errorsCompanyPartner.LastName}
              type="text"
              value={formDataCompanyPartner.LastName}
              maxLength={50}
              onChange={e =>
                handleFieldChangeCompanyPartner('LastName', filterLetters(e.target.value))
              }
              placeholder="Enter Last Name"
            />

            <DatePickerInput
              label='Date of Birth'
              required
              value={formatDate_dd_mm_yyyy(formDataCompanyPartner.DateOfBirth)}
              onChange={(val) => handleFieldChangeCompanyPartner('DateOfBirth', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}

              error={errorsCompanyPartner.DateOfBirth}
            />

            <SinglePageSelection
              label='Gender'
              required
              error={errorsCompanyPartner.Gender}
              value={formDataCompanyPartner.Gender}
              onChange={(e) => {
                handleFieldChangeCompanyPartner('Gender', String(e))
              }}

              options={GENDER_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />

            <Input
              label='Share (%)'
              required
              error={errorsCompanyPartner.PartnerPercentage}
              type="text"
              rightIcon='%'
              value={formDataCompanyPartner.PartnerPercentage ?? 0}
              onChange={e =>
                handleFieldChangeCompanyPartner('PartnerPercentage', filterPercentage(e.target.value))
              }
              placeholder="Enter Share %"
            />

            <Input
              label='Mobile Number'
              required
              error={errorsCompanyPartner.MobileNumber}
              type="text"
              value={formDataCompanyPartner.MobileNumber}
              rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
              leftIcon="+91"
              maxLength={10}
              onChange={e =>
                handleFieldChangeCompanyPartner('MobileNumber', filterMobile(e.target.value))
              }
              placeholder="Enter Mobile Number"
            />


            <Input
              label='Email Id'
              required
              error={errorsCompanyPartner.EmailId}
              type="text"
              value={formDataCompanyPartner.EmailId}
              rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
              onChange={e =>
                handleFieldChangeCompanyPartner('EmailId', filterEmail(e.target.value))
              }
              placeholder="Enter E-mail Id"
            />


            <Input
              label='PAN Number'
              required
              error={errorsCompanyPartner.PanNumber}
              type="text"
              value={formDataCompanyPartner.PanNumber}
              rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
              maxLength={10}
              onChange={e =>
                handleFieldChangeCompanyPartner('PanNumber', filterPAN(e.target.value).toUpperCase()
                )
              }
              placeholder="Enter PAN Number Number"
            />

            <MultiFilePicker
              label='PAN Card'
              placeholder='Select PAN Card'
              required
              error={errorsCompanyPartner.PanCardURL}
              value={companyPartnerPANURLFiles}
              onChange={setCompanyPartnerPANURLFiles}
              allowedTypes={[
                "image/jpeg",
                "image/png",
                "application/pdf",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              ]}
              maxFiles={2}
              onRemoveExisting={(url) => {
                setRemovedCompanyPartnerPANURLs((prev) => [...prev, url])
              }}
            />


            <Input
              label='Aadhaar Number'
              required
              error={errorsCompanyPartner.AadharCardNumber}
              type="text"
              value={formDataCompanyPartner.AadharCardNumber}
              rightIcon={<IdCard className="h-4 w-4 text-gray-400" />}
              maxLength={12}
              onChange={e => handleFieldChangeCompanyPartner('AadharCardNumber', e.target.value)
              }
              placeholder="Enter Aadhaar Card Number"
            />


            <MultiFilePicker
              label='Aadhaar Card'
              placeholder='Select Aadhaar Card'
              required
              error={errorsCompanyPartner.AadharCardURL}
              value={companyPartnerAadhaarCardURLFiles}
              onChange={setCompanyPartnerAadhaarCardURLFiles}
              allowedTypes={[
                "image/jpeg",
                "image/png",
                "application/pdf",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              ]}
              maxFiles={2}
              onRemoveExisting={(url) => {
                setRemovedCompanyPartnerAadhaarCardURLs((prev) => [...prev, url])
              }}
            />

            <MultiFilePicker
              label='Photo'
              placeholder='Select Photo'
              required
              error={errorsCompanyPartner.PhotoURL}
              value={companyPartnerPhotoURLFiles}
              onChange={setCompanyPartnerPhotoURLFiles}
              allowedTypes={[
                "image/jpeg",
                "image/png",
                "application/pdf",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              ]}
              maxFiles={1}
              maxSizeMB={10}
              onRemoveExisting={(url) => {
                setRemovedCompanyPartnerPhotoURLs((prev) => [...prev, url])
              }}

            />
          </div>
        </div>
      </Modal>


      {/* DELETE CONFIRMATION APPLICANT MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenCompanyPartner}
        onClose={() => {
          setIsConfirmationDialogBoxOpenCompanyPartner(false)
          setDeleteCompanyPartnerData(null)
        }}
        onConfirm={handleDeleteCompanyPartner}
        loading={isLoading}
        pageName='company partner'
      />
    </div >
  )
}

export default AddCompany
