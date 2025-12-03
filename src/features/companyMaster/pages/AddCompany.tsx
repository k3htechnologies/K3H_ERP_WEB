import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader'
import { Button } from '@/ui/components/forms/Button';
import ToastContainer from '@/ui/components/Toast/ToastContainer'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import type { AddUpdateCompanyMasterRequest, AddUpdateCompanyPartnerRequest, CompanyMasterData, CompanyPartnerData } from '@/features/companyMaster/models/CompanyMasterModel';
import { Input } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { COMPANY_TYPE_OPTIONS, GENDER_OPTIONS } from '@/core/constants';
import { useCountryStateCityDistrictVillageData } from '@/core/hooks/useCountryStateCityDistrictVillage';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { MultiImageViewer } from '@/ui/components/ImageViewer/ImageViewer';
import { Mail, Phone } from 'lucide-react';
import { filterCIN, filterEmail, filterGST, filterLandline, filterLetters, filterMobile, filterPAN, filterRERA, isValidAadhaar, isValidCIN, isValidEmail, isValidMobile, isValidPAN, isValidRERA } from '@/core/utils/fileValidation';
import { runApiWithLoader } from '@/core/utils';
import { CompanyMasterService } from '@/features/companyMaster/services/CompanyMasterService';
import * as E from 'fp-ts/Either';
import { Modal } from '@/ui/components/Modal/Modal';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { parseDocumentUrls } from '@/core/utils/documentUtils';

const AddCompany: React.FC = () => {

  //#region STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  // NAVIGATE
  const navigate = useNavigate();

  //LOCATION
  const location = useLocation() as {
    state?: {
      editCompanyMasterData?: CompanyMasterData | null;
      fromList?: boolean;
      listState?: {
        page: number;
        filters: any;
      };
    };
  };

  // ERROR SET
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Get COMPANY EDIT DATA FROM LOCATION STATE
  const editCompanyData = (location.state?.editCompanyMasterData ?? null) as CompanyMasterData | null;
  const isCompanyEdit = !!editCompanyData

  //FILE PICKER

  const [gstGSTCertificateFiles, setGSTCertificateFiles] = useState<(File | string)[]>([]);
  const [panURLFiles, setPANURLFiles] = useState<(File | string)[]>([]);
  const [cinURLFiles, setCINURLFiles] = useState<(File | string)[]>([]);
  const [companyLetterHeadHeaderFiles, setCompanyLetterHeadHeaderFiles] = useState<(File | string)[]>([]);
  const [companyLetterHeadFooterFiles, setCompanyLetterHeadFooterFiles] = useState<(File | string)[]>([]);


  // TRACK REMOVED URLS
  const [removedGSTCertificateUrls, setRemovedGSTCertificateUrls] = useState<string[]>([]);
  const [removedPANURLs, setRemovedPANURLs] = useState<string[]>([]);
  const [removedCINURLs, setRemovedCINURLs] = useState<string[]>([]);
  const [removedCompanyLetterHeadHeaderUrls, setRemovedCompanyLetterHeadHeaderUrls] = useState<string[]>([]);
  const [removedCompanyLetterHeadFooterUrls, setRemovedCompanyLetterHeadFooterUrls] = useState<string[]>([]);


  //COMPANY PARTNER LIST
  const [companyPartnerList, setCompanyPartnerList] = useState<CompanyPartnerData[]>([]);

  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!isCompanyEdit) {
      setSelectedCountryId(1)
      handleFieldChange('CountryMasterId', 1)
    }
  }, [isCompanyEdit])


  useEffect(() => {

    if (isCompanyEdit && editCompanyData) {

      setCompanyFormData({
        CompanyId: editCompanyData.CompanyId || 0,
        Uniquekey: editCompanyData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        CompanyName: editCompanyData.CompanyName || '',
        CompanyType: editCompanyData.CompanyType || '',
        ContactPerson: editCompanyData.ContactPerson || '',
        MobileNumber: editCompanyData.MobileNumber || '',
        EmailId: editCompanyData.EmailId || '',
        LandLineNumber: editCompanyData.LandLineNumber || '',
        GSTNumber: editCompanyData.GSTNumber || '',
        GSTCertificateURL: null,
        RemoveGSTCertificateURL: '',
        CINNumber: editCompanyData.CINNumber || '',
        CINURL: null,
        RemoveCINURL: '',
        PanNumber: editCompanyData.PANNumber || '',
        PanCardURL: null,
        RemovePanCardURL: '',
        RERANumber: editCompanyData.RERANumber || '',
        CountryMasterId: editCompanyData.CountryMasterId || 0,
        StateMasterId: editCompanyData.StateMasterId || 0,
        DistrictMasterId: editCompanyData.DistrictMasterId || 0,
        CityMasterId: editCompanyData.CityMasterId || 0,
        CompanyLetterheadHeaderURL: null,
        RemoveCompanyLetterheadHeaderURL: '',
        CompanyLetterheadFooterURL: null,
        RemoveCompanyLetterheadFooterURL: ''
      })

      // 🔥 Sync cascading dropdown selections
      setSelectedCountryId(editCompanyData.CountryMasterId || null)
      setSelectedStateId(editCompanyData.StateMasterId || null)
      setSelectedDistrictId(editCompanyData.DistrictMasterId || null)
      setSelectedCityId(editCompanyData.CityMasterId || null)
      setCompanyPartnerList(editCompanyData.CompanyPartnerData);
    }
  }, [isCompanyEdit, editCompanyData])

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
      : []

  //#endregion

  //#region ADD UPDATE COMPANY REQUEST
  const [companyFormData, setCompanyFormData] = useState<AddUpdateCompanyMasterRequest>({
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
  })
  //#endregion

  //#region HANDLE CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateCompanyMasterRequest, value: string | number | boolean) => {

    setCompanyFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {

      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  //#endregion

  //#region ADD UPDATE COMPANY MASTER

  const PushCompanyFormData = (): FormData => {

    const fd = new FormData();

    fd.append('CompanyId', String(companyFormData.CompanyId ?? 0));
    fd.append('Uniquekey', companyFormData.Uniquekey ?? '');
    fd.append('CompanyName', companyFormData.CompanyName ?? '');
    fd.append('CompanyType', companyFormData.CompanyType ?? '');
    fd.append('ContactPerson', companyFormData.ContactPerson ?? '');
    fd.append('MobileNumber', companyFormData.MobileNumber ?? '');
    fd.append('EmailId', companyFormData.EmailId ?? '');
    fd.append('LandLineNumber', companyFormData.LandLineNumber ?? '');
    fd.append('GSTNumber', companyFormData.GSTNumber ?? '');
    fd.append('CINNumber', companyFormData.CINNumber ?? '');
    fd.append('PanNumber', companyFormData.PanNumber ?? '');
    fd.append('RERANumber', companyFormData.RERANumber ?? '');

    fd.append('CountryMasterId', String(companyFormData.CountryMasterId ?? 0));
    fd.append('StateMasterId', String(companyFormData.StateMasterId ?? 0));
    fd.append('DistrictMasterId', String(companyFormData.DistrictMasterId ?? 0));
    fd.append('CityMasterId', String(companyFormData.CityMasterId ?? 0));


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

    fd.append('RemovePanCardURL', removedPANURLs.join(','));

    cinURLFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('CINURL', file);
      }
    });

    fd.append('RemoveCINURL', removedCINURLs.join(','));

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
      setIsLoadingMessage,
      async () => {


        const pushCompanyFormData = PushCompanyFormData();

        const response = await CompanyMasterService.apiCallAddUpdateCompanyMaster(pushCompanyFormData);

        if (E.isRight(response)) {


          const isAdd = companyFormData.CompanyId === 0

          if (isAdd) {

            addToast({ type: 'success', title: 'Company master added successfully' });

          } else {

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          if (location.state?.fromList && location.state.listState) {
            navigate('/companyMaster', {
              state: {
                listState: location.state.listState,
              },
              replace: true,
            });
          } else {

            navigate('/companyMaster');
          }

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
      companyFormData.CompanyId === 0 ? 'Add Company Master' : 'Update Company Master...'
    )
  }


  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateCompanyMasterForm = (): {
    isValid: boolean;
    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    // Company Name
    if (!companyFormData.CompanyName?.trim()) {
      newErrors.CompanyName = "Company Name is required.";
    } else if (companyFormData.CompanyName?.length > 50) {
      newErrors.CompanyName = "Company Name must be at most 50 characters.";
    }

    // Company Type
    if (!companyFormData.CompanyType?.trim()) {
      newErrors.CompanyType = "Company Type is required.";
    }

    // Contact Person
    if (!companyFormData.ContactPerson?.trim()) {
      newErrors.ContactPerson = "Contact Person is required.";
    }

    // Mobile
    if (!companyFormData.MobileNumber?.trim()) {
      newErrors.MobileNumber = "Mobile Number is required.";
    } else if (!isValidMobile(companyFormData.MobileNumber?.trim())) {
      newErrors.MobileNumber = "Enter a valid 10-digit mobile number.";
    }

    // Email
    if (!companyFormData.EmailId?.trim()) {
      newErrors.EmailId = "Email Id is required.";
    } else if (!isValidEmail(companyFormData.EmailId?.trim())) {
      newErrors.EmailId = "Enter a valid email address.";
    }

    // Landline (if required)
    if (!companyFormData.LandLineNumber?.trim()) {
      newErrors.LandLineNumber = "Land Line Number is required.";
    }

    // GST Number
    if (!companyFormData.GSTNumber?.trim()) {
      newErrors.GSTNumber = "GST Number is required.";
    }
    // (You can add a GST regex if you want stricter)

    // PAN
    if (!companyFormData.PanNumber?.trim()) {
      newErrors.PanNumber = "PAN Number is required.";
    } else if (!isValidPAN(companyFormData.PanNumber?.trim())) {
      newErrors.PanNumber = "Enter a valid PAN Number.";
    }

    // CIN
    if (!companyFormData.CINNumber?.trim()) {
      newErrors.CINNumber = "CIN Number is required.";
    } else if (!isValidCIN(companyFormData.CINNumber?.trim())) {
      newErrors.CINNumber = "Enter a valid CIN Number.";
    }

    // RERA
    if (!companyFormData.RERANumber?.trim()) {
      newErrors.RERANumber = "RERA Number is required.";
    } else if (!isValidRERA(companyFormData.RERANumber?.trim())) {
      newErrors.RERANumber = "Enter a valid RERA Number.";
    }

    // Location
    if (!companyFormData.CountryMasterId) {
      newErrors.CountryMasterId = "Country is required.";
    }
    if (!companyFormData.StateMasterId) {
      newErrors.StateMasterId = "State is required.";
    }
    if (!companyFormData.DistrictMasterId) {
      newErrors.DistrictMasterId = "District is required.";
    }

    if (!companyFormData.CityMasterId) {
      newErrors.CityMasterId = "City is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

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

              {/* Circle Avatar with Viewer */}
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

              {/* Name */}
              <TooltipText
                text={value || "-"}
                maxWidth="250px"
                tooltipThreshold={25}
              />
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
    []
  )
  //#endregion

  //#region ADD UPDATE COMPANY PARTNER DATA


  //FILE PICKER


  const [editingCompanyPartnerMasterData, setEditingCompanyPartnerMasterData] = useState<CompanyPartnerData | null>(null)
  const [isAddUpdateCompanyPartnerModalOpen, setIsAddUpdateCompanyPartnerModalOpen] = useState(false)

  const handleAddCompanyPartnerModal = () => {
    setEditingCompanyPartnerMasterData(null)
    setIsAddUpdateCompanyPartnerModalOpen(true)
  }

  interface AddUpdateCompanyPartnerModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: AddUpdateCompanyPartnerRequest) => void
    data?: CompanyPartnerData | null
    loading?: boolean
  }

  const AddUpdateCompanyPartnerModal: React.FC<
    AddUpdateCompanyPartnerModalProps
  > = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false }) => {

      const [companyPartnerformData, setCompanyPartnerFormData] = useState<AddUpdateCompanyPartnerRequest>({

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
      })

      const [errors, setErrors] = useState<{ [key: string]: string }>({})


      const [companyPartnerAadhaarCardURLFiles, setCompanyPartnerAadhaarCardURLFiles] = useState<(File | string)[]>([]);
      const [companyPartnerPANURLFiles, setCompanyPartnerPANURLFiles] = useState<(File | string)[]>([]);
      const [companyPartnerPhotoURLFiles, setCompanyPartnerPhotoURLFiles] = useState<(File | string)[]>([]);


      // TRACK REMOVED URLS
      const [removedCompanyPartnerAadhaarCardURLs, setRemovedCompanyPartnerAadhaarCardURLs] = useState<string[]>([]);
      const [removedCompanyPartnerPANURLs, setRemovedCompanyPartnerPANURLs] = useState<string[]>([]);
      const [removedCompanyPartnerPhotoURLs, setRemovedCompanyPartnerPhotoURLs] = useState<string[]>([]);



      useEffect(() => {
        if (isOpen) {
          if (data) {
            setCompanyPartnerFormData({
              CompanyPartnerId: data.CompanyPartnerId || 0,
              FirstName: data.FirstName || '',
              LastName: data.LastName || '',
              MiddleName: data.MiddleName || '',
              DateOfBirth: data.DateOfBirth || null,
              Gender: data.Gender || '',
              MobileNumber: data.MobileNumber || '',
              EmailId: data.EmailId || '',
              PartnerPercentage: data.PartnerPercentage || 0,

              PanNumber: data.PanNumber || '',
              PanCardURL: null,
              RemovePanCardURL: '',

              AadharCardNumber: data.AadharCardNumber || '',
              AadharCardURL: null,
              RemoveAadharCardURL: '',

              PhotoURL: null,
              RemovePhotoURL: ''
            })
          } else {
            setCompanyPartnerFormData({
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
            })
          }

          // clear previous errors when modal opens
          setErrors({})
        }
      }, [isOpen, data])

      // ============================================================= [VALIDATION FUNCTION - PARTNER] =============================================================================================
      const validateCompanyPartnerForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

      } => {
        const newErrors: { [key: string]: string } = {}

        // First Name
        if (!companyPartnerformData.FirstName?.trim()) {
          newErrors.FirstName = 'First Name is required.'
        } else if (companyPartnerformData.FirstName.trim().length > 50) {
          newErrors.FirstName = 'First Name must be at most 50 characters.'
        }

        // Mobile
        if (!companyPartnerformData.MobileNumber?.trim()) {
          newErrors.MobileNumber = 'Mobile Number is required.'
        } else if (!isValidMobile(companyPartnerformData.MobileNumber.trim())) {
          newErrors.MobileNumber = 'Enter a valid 10-digit mobile number.'
        }

        // Email (optional but must be valid if present)
        if (companyPartnerformData.EmailId?.trim() && !isValidEmail(companyPartnerformData.EmailId.trim())) {
          newErrors.EmailId = 'Enter a valid email address.'
        }

        // Partner Percentage
        const percentage = Number(companyPartnerformData.PartnerPercentage ?? 0)
        if (isNaN(percentage)) {
          newErrors.PartnerPercentage = 'Partner Percentage must be a number.'
        } else if (percentage <= 0 || percentage > 100) {
          newErrors.PartnerPercentage =
            'Partner Percentage must be between 1 and 100.'
        }

        // PAN
        if (!companyPartnerformData.PanNumber?.trim()) {
          newErrors.PanNumber = 'PAN Number is required.'
        } else if (!isValidPAN(companyPartnerformData.PanNumber.trim())) {
          newErrors.PanNumber = 'Enter a valid PAN Number.'
        }

        // Aadhar
        if (!companyPartnerformData.AadharCardNumber?.trim()) {
          newErrors.AadharCardNumber = 'Aadhar Number is required.'
        } else if (!isValidAadhaar(companyPartnerformData.AadharCardNumber.trim())) {
          newErrors.AadharCardNumber = 'Enter a valid 12-digit Aadhar Number.'
        }

        // Date of Birth (optional future date check)
        if (companyPartnerformData.DateOfBirth) {
          const dob = new Date(companyPartnerformData.DateOfBirth as unknown as string)
          const today = new Date()
          if (dob > today) {
            newErrors.DateOfBirth = 'Date of Birth cannot be in the future.'
          }
        }

        return {
          isValid: Object.keys(newErrors).length === 0,
          errors: newErrors
        }
      }

      const handleFieldChange = (
        field: keyof AddUpdateCompanyPartnerRequest,
        value: string | number | null
      ) => {
        setCompanyPartnerFormData(prev => ({
          ...prev,
          [field]: value
        }))

        setErrors(prev => ({
          ...prev,
          [field]: ''
        }))
      }

      const handleSubmitAddUpdateCompanyPartner = (e: React.FormEvent) => {
        e.preventDefault()

        // Clear previous errors
        setErrors({})

        // Validate form
        const validation = validateCompanyPartnerForm();

        if (!validation.isValid) {
          setErrors(validation.errors)
          return
        }

        const panFiles = companyPartnerPANURLFiles.filter(f => f instanceof File) as File[]
        const aadhaarFiles = companyPartnerAadhaarCardURLFiles.filter(f => f instanceof File) as File[]
        const photoFiles = companyPartnerPhotoURLFiles.filter(f => f instanceof File) as File[]

        const payload: AddUpdateCompanyPartnerRequest = {
          ...companyPartnerformData,
          CompanyPartnerId: data?.CompanyPartnerId || 0,

          PanCardURL: panFiles.length ? panFiles : null,
          AadharCardURL: aadhaarFiles.length ? aadhaarFiles : null,
          PhotoURL: photoFiles.length ? photoFiles : null,

          RemovePanCardURL: removedCompanyPartnerPANURLs.join(','),
          RemoveAadharCardURL: removedCompanyPartnerAadhaarCardURLs.join(','),
          RemovePhotoURL: removedCompanyPartnerPhotoURLs.join(',')
        }

        onSubmit(payload)
      }

      return (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          onCancel={onClose}
          title={data ? 'Update Company' : 'Add Company'}
          onSubmit={handleSubmitAddUpdateCompanyPartner}
          saveText={data ? 'Update' : 'Save'}
          cancelText="Cancel"
          loading={loading}
          size='large-half'
        >
          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>

                <Input
                  label='First Name'
                  required
                  error={errors.FirstName}
                  type="text"
                  value={companyPartnerformData.FirstName}
                  maxLength={50}
                  onChange={e =>
                    handleFieldChange('FirstName', filterLetters(e.target.value))
                  }
                  placeholder="Enter first name"
                />
              </div>

              <div>

                <Input
                  label='Last Name'
                  required
                  error={errors.LastName}
                  type="text"
                  value={companyPartnerformData.LastName}
                  maxLength={50}
                  onChange={e =>
                    handleFieldChange('LastName', filterLetters(e.target.value))
                  }
                  placeholder="Enter last name"
                />

              </div>

              <div>

                <Input
                  label='Middle Name'
                  required
                  error={errors.MiddleName}
                  type="text"
                  value={companyPartnerformData.MiddleName}
                  maxLength={50}
                  onChange={e =>
                    handleFieldChange('MiddleName', filterLetters(e.target.value))
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
                  error={errors.DateOfBirth}
                  value={companyPartnerformData.DateOfBirth || ''}
                  onChange={(val) => handleFieldChange('DateOfBirth', val)}
                />

              </div>

              <div>

                <SinglePageSelection
                  label='Gender'
                  required
                  error={errors.Gender}
                  value={companyPartnerformData.Gender}
                  onChange={(e) => {
                    handleFieldChange('Gender', String(e))
                  }}

                  options={GENDER_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />

              </div>

              <div>

                <Input
                  label='Share (%)'
                  required
                  error={errors.PartnerPercentage}
                  type="text"
                  value={companyPartnerformData.PartnerPercentage ?? 0}
                  onChange={e =>
                    handleFieldChange('PartnerPercentage', Number(e.target.value || 0))
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
                  error={errors.MobileNumber}
                  type="text"
                  value={companyPartnerformData.MobileNumber}
                  maxLength={10}
                  onChange={e =>
                    handleFieldChange('MobileNumber', filterMobile(e.target.value))
                  }
                  placeholder="Enter mobile number"
                />

              </div>

              <div>

                <Input
                  label='Email Id'
                  required
                  error={errors.EmailId}
                  type="text"
                  value={companyPartnerformData.EmailId}
                  onChange={e =>
                    handleFieldChange('EmailId', filterEmail(e.target.value))
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
                  error={errors.PanNumber}
                  type="text"
                  value={companyPartnerformData.PanNumber}
                  maxLength={10}
                  onChange={e =>
                    handleFieldChange('PanNumber', filterPAN(e.target.value).toUpperCase()
                    )
                  }
                  placeholder="Enter PAN number"
                />

              </div>

              <div>

                <Input
                  label='Aadhar Number'
                  required
                  error={errors.AadharCardNumber}
                  type="text"
                  value={companyPartnerformData.AadharCardNumber}
                  maxLength={12}
                  onChange={e => handleFieldChange('AadharCardNumber', e.target.value)
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
                  error={errors.PanCardURL}
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
                  error={errors.AadharCardURL}
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
                  error={errors.PhotoURL}
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
      )
    }

  const handleAddUpdateCompanyPartner = (formData: AddUpdateCompanyPartnerRequest) => {

    setIsAddUpdateCompanyPartnerModalOpen(false)
    setEditingCompanyPartnerMasterData(null)

    const fullName = [
      formData.FirstName,
      formData.MiddleName,
      formData.LastName
    ]
      .filter(x => x && x.trim().length > 0)
      .join(' ');


    const panUrls = (formData.PanCardURL ?? []).map(f =>
      typeof f === 'string' ? f : URL.createObjectURL(f)
    )
    const aadhaarUrls = (formData.AadharCardURL ?? []).map(f =>
      typeof f === 'string' ? f : URL.createObjectURL(f)
    )
    const photoUrls = (formData.PhotoURL ?? []).map(f =>
      typeof f === 'string' ? f : URL.createObjectURL(f)
    )


    if (formData.CompanyPartnerId === 0) {

      const newId = (companyPartnerList[0]?.CompanyPartnerId ?? 0) + 1

      const newRecord: CompanyPartnerData = {
        ...(formData as any),
        CompanyPartnerId: newId,
        FullName: fullName,
        PanCardURL: panUrls.join(','),
        AadharCardURL: aadhaarUrls.join(','),
        PhotoURL: photoUrls.join(',')
      } as CompanyPartnerData

      setCompanyPartnerList(prev => [newRecord, ...prev]);

      addToast({ type: 'success', title: 'Company partner added successfully' });

    } else {

      setCompanyPartnerList(prev =>

        prev.map(item =>

          item.CompanyPartnerId === formData.CompanyPartnerId
            ? ({
              ...(item as any),
              ...(formData as any),
              FullName: fullName,
              PanCardURL: panUrls.join(','),
              AadharCardURL: aadhaarUrls.join(','),
              PhotoURL: photoUrls.join(',')
            } as CompanyPartnerData)
            : item
        )
      )
      addToast({ type: 'success', title: 'Company partner updated successfully' })
    }
  }

  //#endregion

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="flex flex-col h-screen overflow-hidden">

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        {/* ✅ Fixed HEADER */}
        <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 shadow-md h-16 flex items-center justify-between px-6">

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">
              {companyFormData.CompanyId == 0 ? 'Add Company' : 'Update Company'}
            </h1>

          </div>

        </div>

        <div className="flex-1 space-y-2 px-6 py-3 pt-20 pb-20 overflow-y-auto thin-scroll">
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
                  value={companyFormData.CompanyName}
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
                  value={companyFormData.CompanyType}
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
                  value={companyFormData.MobileNumber}
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
                  value={companyFormData.ContactPerson}
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
                  value={companyFormData.EmailId}
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
                  value={companyFormData.LandLineNumber}
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
                  value={companyFormData.GSTNumber}
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
                  label='GST Certificate'
                  required
                  error={errors.GSTCertificateURL}
                  value={gstGSTCertificateFiles}
                  onChange={setGSTCertificateFiles}
                  availableFilesURL={editCompanyData?.GSTCertificateURL ?? ""}
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
                    setRemovedGSTCertificateUrls((prev) => [...prev, url])
                  }}

                />
              </div>
              <div>

                <Input
                  label='PAN Number'
                  required
                  type="text"
                  value={companyFormData.PanNumber}
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
                  label='PAN Card'
                  required
                  error={errors.PanCardURL}
                  value={panURLFiles}
                  onChange={setPANURLFiles}
                  availableFilesURL={editCompanyData?.PanCardURL ?? ""}
                  allowedTypes={[
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  ]}
                  maxFiles={2}
                  maxSizeMB={10}
                  onRemoveExisting={(url) => {
                    setRemovedPANURLs((prev) => [...prev, url])
                  }}
                />

              </div>
              <div>

                <Input
                  label='CIN Number'
                  required
                  type="text"
                  value={companyFormData.CINNumber}
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
                  availableFilesURL={editCompanyData?.CINURL ?? ""}
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
                    setRemovedCINURLs((prev) => [...prev, url])
                  }}
                />

              </div>

              <div>

                <Input
                  label='RERA Number'
                  required
                  type="text"
                  value={companyFormData.RERANumber}
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
                  availableFilesURL={editCompanyData?.CompanyLetterheadHeaderURL ?? ""}
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
                  availableFilesURL={editCompanyData?.CompanyLetterheadFooterURL ?? ""}
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
        </div>
        {/* ✅ Fixed Bottom  */}
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
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

        {/*  ADD EDIT UPDATE COMPANY PARTNER MODAL */}
        <AddUpdateCompanyPartnerModal
          isOpen={isAddUpdateCompanyPartnerModalOpen}
          onClose={() => {
            setIsAddUpdateCompanyPartnerModalOpen(false)
            setEditingCompanyPartnerMasterData(null)

          }}
          onSubmit={handleAddUpdateCompanyPartner}
          data={editingCompanyPartnerMasterData}
          loading={isLoading}
        />

      </div >
    </>
  )
}

export default AddCompany
