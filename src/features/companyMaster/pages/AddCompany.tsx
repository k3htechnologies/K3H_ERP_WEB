import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader'
import { Button } from '@/ui/components/forms/Button';
import ToastContainer from '@/ui/components/Toast/ToastContainer'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { AddUpdateCompanyMasterRequest, AddUpdateCompanyPartnerRequest, CompanyPartnerData, FilterWithPaginationCompanyMasterRequest } from '@/features/companyMaster/models/CompanyMasterModel';
import { Input } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { COMPANY_TYPE_OPTIONS, GENDER_OPTIONS } from '@/core/constants';
import { useCountryStateCityDistrictVillageData } from '@/core/hooks/useCountryStateCityDistrictVillage';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';
import { Edit, Mail, Phone } from 'lucide-react';
import { filterCIN, filterEmail, filterGST, filterLandline, filterLetters, filterMobile, filterPAN, filterRERA, isValidAadhaar, isValidCIN, isValidEmail, isValidGST, isValidMobile, isValidPAN, isValidRERA } from '@/core/utils/fileValidation';
import { runApiWithLoader } from '@/core/utils';
import { CompanyMasterService } from '@/features/companyMaster/services/CompanyMasterService';
import * as E from 'fp-ts/Either';
import { Modal } from '@/ui/components/Modal/Modal';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { parseDocumentUrls } from '@/core/utils/documentUtils';

const initialFormState = (): AddUpdateCompanyMasterRequest => ({
  CompanyId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  CompanyName: '',
  CompanyType: '',
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
  RERANumber: '',
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

  const [companyLetterHeadHeaderFiles, setCompanyLetterHeadHeaderFiles] = useState<(File | string)[]>([]);
  const [removedCompanyLetterHeadHeaderUrls, setRemovedCompanyLetterHeadHeaderUrls] = useState<string[]>([]);
  const [companyLetterHeadHeaderURL, setCompanyLetterHeadHeaderURL] = useState<string>();


  const [companyLetterHeadFooterFiles, setCompanyLetterHeadFooterFiles] = useState<(File | string)[]>([]);
  const [removedCompanyLetterHeadFooterUrls, setRemovedCompanyLetterHeadFooterUrls] = useState<string[]>([]);
  const [companyLetterHeadFooterURL, setCompanyLetterHeadFooterURL] = useState<string>();

  // NAVIGATE
  const navigate = useNavigate();
  const location = useLocation();

  //GET VALUE FROM URL :COMPANYID
  const { companyId } = useParams<{ companyId?: string }>();
  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //COMPANY PARTNER LIST
  const [companyPartnerList, setCompanyPartnerList] = useState<CompanyPartnerData[]>([]);
  const [formDataCompanyPartner, setFormDataCompanyPartner] = useState<AddUpdateCompanyPartnerRequest>(() => initialFormStateCompanyPartner());

  const [editingCompanyPartnerMasterData, setEditingCompanyPartnerMasterData] = useState<CompanyPartnerData | null>(null)
  const [isAddUpdateCompanyPartnerModalOpen, setIsAddUpdateCompanyPartnerModalOpen] = useState(false)

  const [companyPartnerAadhaarCardURLFiles, setCompanyPartnerAadhaarCardURLFiles] = useState<(File | string)[]>([]);
  const [removedCompanyPartnerAadhaarCardURLs, setRemovedCompanyPartnerAadhaarCardURLs] = useState<string[]>([]);
  const [companyPartnerAadhaarCardURL, setCompanyPartnerAadhaarCardURL] = useState<string>();

  const [companyPartnerPANURLFiles, setCompanyPartnerPANURLFiles] = useState<(File | string)[]>([]);
  const [removedCompanyPartnerPANURLs, setRemovedCompanyPartnerPANURLs] = useState<string[]>([]);
  const [companyPartnerPANURL, setCompanyPartnerPANURL] = useState<string>();


  const [companyPartnerPhotoURLFiles, setCompanyPartnerPhotoURLFiles] = useState<(File | string)[]>([]);
  const [removedCompanyPartnerPhotoURLs, setRemovedCompanyPartnerPhotoURLs] = useState<string[]>([]);
  const [companyPartnerPhotoURL, setCompanyPartnerPhotoURL] = useState<string>();

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

        const response = await CompanyMasterService.apiCallPullCompanyMaster(params);

        if (E.isRight(response)) {

          const row = response.right.Data?.[0];

          if (row) {

            setFormData(prev => ({
              ...prev,
              CompanyId: row.CompanyId ?? prev.CompanyId,
              Uniquekey: row.Uniquekey ?? prev.Uniquekey,
              CompanyName: row.CompanyName ?? prev.CompanyName ?? '',
              CompanyType: row.CompanyType ?? prev.CompanyType ?? '',
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
              RERANumber: row.RERANumber ?? prev.RERANumber,
              CountryMasterId: row.CountryMasterId ?? prev.CountryMasterId ?? 1,
              DistrictMasterId: row.DistrictMasterId ?? prev.DistrictMasterId ?? 0,
              StateMasterId: row.StateMasterId ?? prev.StateMasterId ?? 0,
              CityMasterId: row.CityMasterId ?? prev.CityMasterId ?? 0,
              CompanyLetterheadHeaderURL: null,
              RemoveCompanyLetterheadHeaderURL: '',
              CompanyLetterheadFooterURL: null,
              RemoveCompanyLetterheadFooterURL: ''


            }));

            setCompanyPartnerList(row.CompanyPartnerData);

            setGSTCertificateFiles([]);
            setGSTCertificateURL(row.GSTCertificateURL)
            setRemovedGSTCertificateUrls([]);

            setPANURLFiles([]);
            setPanURL(row.PanCardURL)
            setRemovedPanUrls([]);

            setCINURLFiles([]);
            setCinURL(row.CINURL)
            setRemovedCinUrls([]);


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
      newErrors.CompanyName = "Company Name is required.";
    } else if (formData.CompanyName?.length > 50) {
      newErrors.CompanyName = "Company Name must be at most 50 characters.";
    }

    // Company Type
    if (!formData.CompanyType?.trim()) {
      newErrors.CompanyType = "Company Type is required.";
    }

    // Contact Person
    if (!formData.ContactPerson?.trim()) {
      newErrors.ContactPerson = "Contact Person is required.";
    }

    // Mobile
    if (!formData.MobileNumber?.trim()) {
      newErrors.MobileNumber = "Mobile Number is required.";
    } else if (!isValidMobile(formData.MobileNumber?.trim())) {
      newErrors.MobileNumber = "Enter a valid 10-digit mobile number.";
    }

    // Email
    if (!formData.EmailId?.trim()) {
      newErrors.EmailId = "Email Id is required.";
    } else if (!isValidEmail(formData.EmailId?.trim())) {
      newErrors.EmailId = "Enter a valid email address.";
    }

    // Landline (if required)
    if (!formData.LandLineNumber?.trim()) {
      newErrors.LandLineNumber = "Land Line Number is required.";
    }

    // GST Number
    if (!formData.GSTNumber?.trim()) {
      newErrors.GSTNumber = "GST Number is required.";
    }
    else if (!isValidGST(formData.GSTNumber?.trim())) {
      newErrors.PanNumber = "Enter a valid GST Number.";
    }
    // (You can add a GST regex if you want stricter)

    // PAN
    if (!formData.PanNumber?.trim()) {
      newErrors.PanNumber = "PAN Number is required.";
    } else if (!isValidPAN(formData.PanNumber?.trim())) {
      newErrors.PanNumber = "Enter a valid PAN Number.";
    }

    // CIN
    if (!formData.CINNumber?.trim()) {
      newErrors.CINNumber = "CIN Number is required.";
    } else if (!isValidCIN(formData.CINNumber?.trim())) {
      newErrors.CINNumber = "Enter a valid CIN Number.";
    }

    // RERA
    if (!formData.RERANumber?.trim()) {
      newErrors.RERANumber = "RERA Number is required.";
    } else if (!isValidRERA(formData.RERANumber?.trim())) {
      newErrors.RERANumber = "Enter a valid RERA Number.";
    }

    // Location
    if (!formData.CountryMasterId) {
      newErrors.CountryMasterId = "Country is required.";
    }
    if (!formData.StateMasterId) {
      newErrors.StateMasterId = "State is required.";
    }
    if (!formData.DistrictMasterId) {
      newErrors.DistrictMasterId = "District is required.";
    }

    if (!formData.CityMasterId) {
      newErrors.CityMasterId = "City is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  //#endregion

  //#region ADD UPDATE COMPANY MASTER

  const PushCompanyFormData = (): FormData => {

    const fd = new FormData();

    fd.append('CompanyId', String(formData.CompanyId ?? 0));
    fd.append('Uniquekey', formData.Uniquekey ?? '');
    fd.append('CompanyName', formData.CompanyName ?? '');
    fd.append('CompanyType', formData.CompanyType ?? '');
    fd.append('ContactPerson', formData.ContactPerson ?? '');
    fd.append('MobileNumber', formData.MobileNumber ?? '');
    fd.append('EmailId', formData.EmailId ?? '');
    fd.append('LandLineNumber', formData.LandLineNumber ?? '');
    fd.append('GSTNumber', formData.GSTNumber ?? '');
    fd.append('CINNumber', formData.CINNumber ?? '');
    fd.append('PanNumber', formData.PanNumber ?? '');
    fd.append('RERANumber', formData.RERANumber ?? '');
    fd.append('CountryMasterId', String(formData.CountryMasterId ?? 0));
    fd.append('StateMasterId', String(formData.StateMasterId ?? 0));
    fd.append('DistrictMasterId', String(formData.DistrictMasterId ?? 0));
    fd.append('CityMasterId', String(formData.CityMasterId ?? 0));


    gstGSTCertificateFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('GSTCertificateURL', file);
      }
    });

    fd.append('RemoveGSTCertificateURL', removedGSTCertificateUrls.join(','));

    panURLFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('PanCardURL', file);
      }
    });

    fd.append('RemovePanCardURL', removedPanUrls.join(','));

    cinURLFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('CINURL', file);
      }
    });

    fd.append('RemoveCINURL', removedCinUrls.join(','));

    companyLetterHeadHeaderFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('CompanyLetterheadHeaderURL', file);
      }
    });

    fd.append('RemoveCompanyLetterheadHeaderURL', removedCompanyLetterHeadHeaderUrls.join(','));

    companyLetterHeadFooterFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('CompanyLetterheadFooterURL', file);
      }
    });

    fd.append('RemoveCompanyLetterheadFooterURL', removedCompanyLetterHeadFooterUrls.join(','));
    return fd;
  };


  const handleAddUpdateCompanyMaster = async () => {

    // Clear previous errors
    setErrors({})

    // Validate form
    const validation = validateCompanyMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const pushCompanyFormData = PushCompanyFormData();

        const response = await CompanyMasterService.apiCallAddUpdateCompanyMaster(pushCompanyFormData);

        if (E.isRight(response)) {

          addToast({ type: "success", title: formData.CompanyId ? "Company details updated successfully" : "New Company added successfully" });

          // Get list state from navigation if available, otherwise use defaults
          const locationState = location.state as {
            listState?: {
              page?: number;
              filters?: any;
              sortInfo?: any;
              searchTerm?: string;
            };
          } | null;

          const listState = locationState?.listState || {
            page: 1,
            filters: {},
            sortInfo: undefined,
            searchTerm: '',
          };

          navigate("/companyMaster", {
            state: { listState }
          });

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

  const handleEditCompanyPartner = useCallback((row: CompanyPartnerData) => {
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
      RemovePanCardURL: '',
      AadharCardNumber: row.AadharCardNumber || '',
      RemoveAadharCardURL: '',
      RemovePhotoURL: ''
    };


    setEditingCompanyPartnerMasterData(row);
    setFormDataCompanyPartner(partnerData);
    setCompanyPartnerPANURLFiles(parseDocumentUrls(row.PanCardURL ?? '').slice());
    setCompanyPartnerAadhaarCardURLFiles(parseDocumentUrls(row.AadharCardURL ?? '').slice());
    setCompanyPartnerPhotoURLFiles(parseDocumentUrls(row.PhotoURL ?? '').slice());
    setIsAddUpdateCompanyPartnerModalOpen(true);
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
        render: (value, row) => {
          // Get images from PhotoURL CSV
          const images: string[] = (row.PhotoURL || "")
            .split(",")
            .map((x: string) => x.trim())
            .filter((x: string) => x.length > 0);

          const photo = images.length ? images[0] : null;

          return (
            <div className="flex items-center justify-start">

              <MultiImageViewer
                images={images}
                title={`Profile Photo – ${row.FullName}`}
                triggerLabel={
                  photo ? (
                    <img
                      src={photo}
                      alt="Profile"
                      className="h-9 w-9 rounded-full object-cover mr-4 cursor-pointer border"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gray-300 mr-4"></div>
                  )
                }
              />


              <TooltipText
                text={value || "-"}
                maxWidth="250px"
                tooltipThreshold={25}
              />

              <>
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleEditCompanyPartner(row)
                  }}
                  color='transparent'
                  fullWidth
                  isborderRadius
                  size='sm'
                  title="Edit Department"
                  style={{
                    color: '#0B3251',
                    padding: '0px 8px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')} // lighter on hover
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')} // revert
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </>
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
        align: 'center',
        render: (value) => value || '-',
      },
      {
        key: 'MobileNumber',
        label: 'Mobile Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-',
      },
      {
        key: 'EmailId',
        label: 'Email ID',
        width: '20',
        sortable: false,
        align: 'center',
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
        align: 'center',
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
        label: 'Aadhar Number',
        width: '15',
        sortable: false,
        align: 'center',
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
    [handleEditCompanyPartner]
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

  const handleAddCompanyPartnerModal = () => {
    setEditingCompanyPartnerMasterData(null)
    setFormDataCompanyPartner(initialFormStateCompanyPartner());
    setIsAddUpdateCompanyPartnerModalOpen(true)
    setErrorsCompanyPartner({});
  }


  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddCompanyPartnerForm = (): {

    isValid: boolean

    errorsCompanyPartner: { [key: string]: string }

  } => {
    const newErrorsCompanyPartner: { [key: string]: string } = {}

    // First Name
    if (!formDataCompanyPartner.FirstName?.trim()) {
      newErrorsCompanyPartner.FirstName = 'First Name is required.'
    } else if (formDataCompanyPartner.FirstName.trim().length > 50) {
      newErrorsCompanyPartner.FirstName = 'First Name must be at most 50 characters.'
    }

    // Mobile
    if (!formDataCompanyPartner.MobileNumber?.trim()) {
      newErrorsCompanyPartner.MobileNumber = 'Mobile Number is required.'
    } else if (!isValidMobile(formDataCompanyPartner.MobileNumber.trim())) {
      newErrorsCompanyPartner.MobileNumber = 'Enter a valid 10-digit mobile number.'
    }

    // Email (optional but must be valid if present)
    if (formDataCompanyPartner.EmailId?.trim() && !isValidEmail(formDataCompanyPartner.EmailId.trim())) {
      newErrorsCompanyPartner.EmailId = 'Enter a valid email address.'
    }

    // Partner Percentage
    const percentage = Number(formDataCompanyPartner.PartnerPercentage ?? 0)
    if (isNaN(percentage)) {
      newErrorsCompanyPartner.PartnerPercentage = 'Partner Percentage must be a number.'
    } else if (percentage <= 0 || percentage > 100) {
      newErrorsCompanyPartner.PartnerPercentage =
        'Partner Percentage must be between 1 and 100.'
    }

    // PAN
    if (!formDataCompanyPartner.PanNumber?.trim()) {
      newErrorsCompanyPartner.PanNumber = 'PAN Number is required.'
    } else if (!isValidPAN(formDataCompanyPartner.PanNumber.trim())) {
      newErrorsCompanyPartner.PanNumber = 'Enter a valid PAN Number.'
    }

    // Aadhar
    if (!formDataCompanyPartner.AadharCardNumber?.trim()) {
      newErrorsCompanyPartner.AadharCardNumber = 'Aadhar Number is required.'
    } else if (!isValidAadhaar(formDataCompanyPartner.AadharCardNumber.trim())) {
      newErrorsCompanyPartner.AadharCardNumber = 'Enter a valid 12-digit Aadhar Number.'
    }

    // Date of Birth (optional future date check)
    if (formDataCompanyPartner.DateOfBirth) {
      const dob = new Date(formDataCompanyPartner.DateOfBirth as unknown as string)
      const today = new Date()
      if (dob > today) {
        newErrorsCompanyPartner.DateOfBirth = 'Date of Birth cannot be in the future.'
      }
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

    const idToUse =
      editingCompanyPartnerMasterData?.CompanyPartnerId ??
      (formDataCompanyPartner.CompanyPartnerId && formDataCompanyPartner.CompanyPartnerId > 0
        ? formDataCompanyPartner.CompanyPartnerId
        : 0)

    const partnerToSave: CompanyPartnerData = {
      CompanyPartnerId: idToUse,
      FirstName: formDataCompanyPartner.FirstName || '',
      LastName: formDataCompanyPartner.LastName || '',
      MiddleName: formDataCompanyPartner.MiddleName || '',
      DateOfBirth: formDataCompanyPartner.DateOfBirth || null,
      Gender: formDataCompanyPartner.Gender || '',
      MobileNumber: formDataCompanyPartner.MobileNumber || '',
      EmailId: formDataCompanyPartner.EmailId || '',
      PartnerPercentage: formDataCompanyPartner.PartnerPercentage ?? 0,
      PanNumber: formDataCompanyPartner.PanNumber || '',
      PanCardURL: companyPartnerPANURLFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
      AadharCardNumber: formDataCompanyPartner.AadharCardNumber || '',
      AadharCardURL: companyPartnerAadhaarCardURLFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
      PhotoURL: companyPartnerPhotoURLFiles.map(f => (typeof f === 'string' ? f : (f as File).name)).join(','),
    };

    setCompanyPartnerList(prevList => {
      if (editingCompanyPartnerMasterData && editingCompanyPartnerMasterData.CompanyPartnerId) {
        // update existing partner
        return prevList.map(p => (p.CompanyPartnerId === idToUse ? partnerToSave : p));
      } else {
        // add new partner
        return [...prevList, partnerToSave];
      }
    });

    // Cleanup and close modal — do this AFTER updating list
    setIsAddUpdateCompanyPartnerModalOpen(false);
    setEditingCompanyPartnerMasterData(null);
    setFormDataCompanyPartner(initialFormStateCompanyPartner());
    setCompanyPartnerPANURLFiles([]);
    setCompanyPartnerAadhaarCardURLFiles([]);
    setCompanyPartnerPhotoURLFiles([]);
  };



  //#endregion

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        {/* ✅ Fixed HEADER */}

        <div className="flex-1 space-y-2 px-6 py-3 pb-20 overflow-y-auto thin-scroll ">
          {/* ============================================================= [BASIC COMPANY DETAILS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Company Details</h3>

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
                  placeholder="Enter company name"
                />

              </div>
              <div>

                <SinglePageSelection
                  label='Company Type'
                  required
                  error={errors.CompanyType}
                  value={formData.CompanyType}
                  onChange={(e) => {
                    handleFieldChange('CompanyType', String(e))
                  }}

                  options={COMPANY_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />


              </div>
              <div>

                <Input
                  label='Mobile Number'
                  required
                  error={errors.MobileNumber}
                  type="text"
                  value={formData.MobileNumber}
                  maxLength={10}
                  leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                  onChange={(e) => {
                    const mobileNumber = filterMobile(e.target.value);
                    handleFieldChange('MobileNumber', mobileNumber)
                  }}
                  placeholder="Enter valid mobile number"
                />

              </div>
              <div>

                <Input
                  label='Contact Person'
                  required
                  error={errors.ContactPerson}
                  type="text"
                  value={formData.ContactPerson}
                  leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                  minLength={5}
                  maxLength={50}
                  onChange={(e) => {
                    const contactPerson = filterLetters(e.target.value);
                    handleFieldChange('ContactPerson', contactPerson)
                  }}
                  placeholder="Enter contact person name"
                />

              </div>
              <div>

                <Input
                  label='Email Id'
                  required
                  type="text"
                  value={formData.EmailId}
                  error={errors.EmailId}
                  leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                  onChange={(e) => {
                    const emailId = filterEmail(e.target.value);
                    handleFieldChange('EmailId', emailId)
                  }}
                  placeholder="Enter valid email id"
                />

              </div>
              <div>

                <Input
                  label='Land Line Number'
                  required
                  type="text"
                  value={formData.LandLineNumber}
                  error={errors.LandLineNumber}
                  leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                  onChange={(e) => {
                    const landLineNumber = filterLandline(e.target.value);
                    handleFieldChange('LandLineNumber', landLineNumber)
                  }}
                  placeholder="Enter land line number"
                />

              </div>
            </div>
          </div>
          {/* ============================================================= [GOVERNMENT IDENTIFIERS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Government Identifiers</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>

                <Input
                  label='GST Number'
                  required
                  type="text"
                  value={formData.GSTNumber}
                  error={errors.GSTNumber}
                  onChange={(e) => {
                    const gstNumber = filterGST(e.target.value);
                    handleFieldChange('GSTNumber', gstNumber)
                  }}
                  placeholder="Enter valid GST Number"
                />

              </div>
              <div>

                <MultiFilePicker
                  label="GST Certificate"
                  required
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
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemovedGSTCertificateUrls((prev) => [...prev, url])
                  }}
                />

              </div>
              <div>

                <Input
                  label='PAN Number'
                  required
                  type="text"
                  value={formData.PanNumber}
                  error={errors.PanNumber}
                  onChange={(e) => {
                    const panNumber = filterPAN(e.target.value);
                    handleFieldChange('PanNumber', panNumber)
                  }}
                  placeholder="Enter valid PAN number"
                />

              </div>
              <div>

                <MultiFilePicker
                  label="PAN Card"
                  required
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
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemovedPanUrls((prev) => [...prev, url])
                  }}
                />

              </div>
              <div>

                <Input
                  label='CIN Number'
                  required
                  type="text"
                  value={formData.CINNumber}
                  error={errors.CINNumber}
                  maxLength={21}
                  onChange={(e) => {
                    const cinNumber = filterCIN(e.target.value);
                    handleFieldChange('CINNumber', cinNumber)
                  }}
                  placeholder="Enter valid CIN Number"
                />

              </div>
              <div>


                <MultiFilePicker
                  label='CIN'
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
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemovedCinUrls((prev) => [...prev, url])
                  }}
                />

              </div>

              <div>

                <Input
                  label='RERA Number'
                  required
                  type="text"
                  value={formData.RERANumber}
                  error={errors.RERANumber}
                  maxLength={20}
                  onChange={(e) => {
                    const reraNumber = filterRERA(e.target.value);
                    handleFieldChange('RERANumber', reraNumber)
                  }}
                  placeholder="Enter valid RERA Number"
                />

              </div>
            </div>
          </div>

          {/* ============================================================= [ADDRESS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>

                <SinglePageSelection
                  label='Country'
                  required
                  value={selectedCountryId || ''}
                  error={errors.CountryMasterId}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedCountryId(id)
                    setSelectedStateId(null)
                    setSelectedDistrictId(null)
                    setSelectedCityId(null)

                    handleFieldChange('CountryMasterId', id)
                  }}
                  disabled={isLocationLoading}
                  options={countryOptions}
                />

              </div>

              <div>

                <SinglePageSelection
                  label='State'
                  required
                  value={selectedStateId ?? ''}
                  error={errors.StateMasterId}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedStateId(id)
                    setSelectedDistrictId(null)
                    setSelectedCityId(null)

                    handleFieldChange('StateMasterId', id)
                  }}
                  disabled={!selectedCountryId || stateOptions.length === 0}
                  options={stateOptions}
                />

              </div>

              <div>

                <SinglePageSelection
                  label='District'
                  required
                  value={selectedDistrictId ?? ''}
                  error={errors.DistrictMasterId}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedDistrictId(id)
                    setSelectedCityId(null)

                    handleFieldChange('DistrictMasterId', id)
                  }}
                  disabled={!selectedStateId || districtOptions.length === 0}
                  options={districtOptions}
                />


              </div>

              <div>

                <SinglePageSelection
                  label='City'
                  required
                  value={selectedCityId ?? ''}
                  error={errors.CityMasterId}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedCityId(id)
                    handleFieldChange('CityMasterId', id)
                  }}
                  disabled={!selectedDistrictId || cityOptions.length === 0}
                  options={cityOptions}
                />


              </div>

            </div>
          </div>

          {/* ============================================================= [COMPANY VERIFICATION] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Company Verification</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>

                <MultiFilePicker
                  label='Company Letterhead Header'
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
                  maxFiles={5}
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemovedCompanyLetterHeadHeaderUrls((prev) => [...prev, url])
                  }}
                />


              </div>

              <div>

                <MultiFilePicker
                  label='Company Letterhead Footer'
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
                  maxFiles={5}
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemovedCompanyLetterHeadFooterUrls((prev) => [...prev, url])
                  }}
                />

              </div>
            </div>
          </div>


          {/* ============================================================= [COMPANY PARTNER ] ============================================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">
                Company Partner
              </h3>

              <Button
                color="blue"
                size="sm"
                onClick={handleAddCompanyPartnerModal}
              >
                Add Partner
              </Button>
            </div>


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

          {/* ✅ Fixed Bottom  */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)', left: "299px", right: '14px' }}>
            <Button
              color="transparent"
              variant='transparent_border'
              size="sm"
              onClick={() => {
                navigate(-1);
              }}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              color="green"
              size="sm"
              onClick={handleAddUpdateCompanyMaster}
              className="px-6"
            >
              Save
            </Button>
          </div>
        </div>


        {/*  ADD EDIT UPDATE COMPANY PARTNER MODAL */}

        <Modal
          isOpen={isAddUpdateCompanyPartnerModalOpen}
          onClose={() => {
            setIsAddUpdateCompanyPartnerModalOpen(false)
            setEditingCompanyPartnerMasterData(null)
            setFormDataCompanyPartner(initialFormStateCompanyPartner());
            setErrorsCompanyPartner({});

          }}
          onCancel={() => {
            setIsAddUpdateCompanyPartnerModalOpen(false)
            setEditingCompanyPartnerMasterData(null)
            setFormDataCompanyPartner(initialFormStateCompanyPartner());
            setErrorsCompanyPartner({});

          }}
          title={editingCompanyPartnerMasterData ? 'Update Company Partner' : 'Add Company Partner'}
          onSubmit={handleAddUpdateCompanyPartner}
          saveText={editingCompanyPartnerMasterData ? 'Update' : 'Save'}
          cancelText="Cancel"
          loading={isLoading}
          size='large-half'
        >
          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>

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
                  placeholder="Enter first name"
                />
              </div>

              <div>

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
                  placeholder="Enter last name"
                />

              </div>

              <div>

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
                  placeholder="Enter middle name"
                />

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>

                <DatePickerInput
                  label='Date of Birth'
                  required
                  error={errorsCompanyPartner.DateOfBirth}
                  value={formDataCompanyPartner.DateOfBirth || ''}
                  onChange={(val) => handleFieldChangeCompanyPartner('DateOfBirth', val)}
                />

              </div>

              <div>

                <SinglePageSelection
                  label='Gender'
                  required
                  error={errorsCompanyPartner.Gender}
                  value={formDataCompanyPartner.Gender}
                  onChange={(e) => {
                    handleFieldChangeCompanyPartner('Gender', String(e))
                  }}

                  options={GENDER_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />

              </div>

              <div>

                <Input
                  label='Share (%)'
                  required
                  error={errorsCompanyPartner.PartnerPercentage}
                  type="text"
                  value={formDataCompanyPartner.PartnerPercentage ?? 0}
                  onChange={e =>
                    handleFieldChangeCompanyPartner('PartnerPercentage', Number(e.target.value || 0))
                  }
                  placeholder="Enter share %"
                />

              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>

                <Input
                  label='Mobile Number'
                  required
                  error={errorsCompanyPartner.MobileNumber}
                  type="text"
                  value={formDataCompanyPartner.MobileNumber}
                  maxLength={10}
                  onChange={e =>
                    handleFieldChangeCompanyPartner('MobileNumber', filterMobile(e.target.value))
                  }
                  placeholder="Enter mobile number"
                />

              </div>

              <div>

                <Input
                  label='Email Id'
                  required
                  error={errorsCompanyPartner.EmailId}
                  type="text"
                  value={formDataCompanyPartner.EmailId}
                  onChange={e =>
                    handleFieldChangeCompanyPartner('EmailId', filterEmail(e.target.value))
                  }
                  placeholder="Enter email id"
                />

              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>

                <Input
                  label='PAN Number'
                  required
                  error={errorsCompanyPartner.PanNumber}
                  type="text"
                  value={formDataCompanyPartner.PanNumber}
                  maxLength={10}
                  onChange={e =>
                    handleFieldChangeCompanyPartner('PanNumber', filterPAN(e.target.value).toUpperCase()
                    )
                  }
                  placeholder="Enter PAN number"
                />

              </div>

              <div>

                <Input
                  label='Aadhar Number'
                  required
                  error={errorsCompanyPartner.AadharCardNumber}
                  type="text"
                  value={formDataCompanyPartner.AadharCardNumber}
                  maxLength={12}
                  onChange={e => handleFieldChangeCompanyPartner('AadharCardNumber', e.target.value)
                  }
                  placeholder="Enter Aadhar number"
                />

              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <MultiFilePicker
                  label='PAN Card'
                  required
                  error={errorsCompanyPartner.PanCardURL}
                  value={companyPartnerPANURLFiles}
                  onChange={setCompanyPartnerPANURLFiles}
                  availableFilesURL={editingCompanyPartnerMasterData?.PanCardURL ?? ""}
                  allowedTypes={[
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  ]}
                  maxFiles={5}
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemovedCompanyPartnerPANURLs((prev) => [...prev, url])
                  }}
                />

              </div>

              <div>

                <MultiFilePicker
                  label='Aadhaar Card'
                  required
                  error={errorsCompanyPartner.AadharCardURL}
                  value={companyPartnerAadhaarCardURLFiles}
                  onChange={setCompanyPartnerAadhaarCardURLFiles}
                  availableFilesURL={editingCompanyPartnerMasterData?.AadharCardURL ?? ""}
                  allowedTypes={[
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  ]}
                  maxFiles={5}
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemovedCompanyPartnerAadhaarCardURLs((prev) => [...prev, url])
                  }}
                />

              </div>

              <div>
                <MultiFilePicker
                  label='Photo'
                  required
                  error={errorsCompanyPartner.PhotoURL}
                  value={companyPartnerPhotoURLFiles}
                  onChange={setCompanyPartnerPhotoURLFiles}
                  availableFilesURL={editingCompanyPartnerMasterData?.PhotoURL ?? ""}
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
          </div>
        </Modal>

      </div >
    </>
  )
}

export default AddCompany
