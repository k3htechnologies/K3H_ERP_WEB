import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader'
import { Button } from '@/ui/components/forms/Button';
import ToastContainer from '@/ui/components/Toast/ToastContainer'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import type { AddUpdateCompanyMasterRequest, CompanyMasterData } from '../models/CompanyMasterModel';
import { Input } from '@/ui/components/forms';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { COMPANY_TYPE_OPTIONS } from '@/core/constants';
import { useCountryStateCityDistrictVillageData } from '@/core/hooks/useCountryStateCityDistrictVillage';

const AddCompany: React.FC = () => {

  //#region STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  //#region NAVIGATE
  const navigate = useNavigate();

  //#region LOCATION
  const location = useLocation()

  //#region ERROR SET
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Get COMPANY EDIT DATA FROM LOCATION STATE
  const editCompanyData = location.state?.editCompanyMasterData as CompanyMasterData | null
  const isCompanyEdit = !!editCompanyData
  //#endregion


  //#region COUNTRY STATE CITY DISTRICT 
  const {
    isLoading: isLocationLoading,
    countries,
    statesByCountryId,
    districtsByStateId,
    citiesByDistrictId,
    villagesByCityId,
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

  const villageOptions =
    selectedCityId != null
      ? (villagesByCityId[selectedCityId] || []).map(v => ({
        label: v.name,
        value: v.id,
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

  // set default country = 1 in form also
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
        PanNumber: '',
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
    }
  }, [isCompanyEdit, editCompanyData])


  const handleFieldChange = (field: keyof AddUpdateCompanyMasterRequest, value: string | number | boolean) => {

    setCompanyFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {

      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="flex flex-col h-screen overflow-hidden">

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        {/* ✅ Fixed HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md h-16 flex items-center justify-between px-6">

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">
              Company Master
            </h1>

          </div>

        </div>

        <div className="flex-1 space-y-2 px-6 py-3 pt-20 pb-20 overflow-y-auto thin-scroll">
          {/* ============================================================= [BASIC COMPANY DETAILS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Company Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  value={companyFormData.CompanyName}
                  onChange={(e) => {
                    const companyName = e.target.value.replace(/[^a-zA-Z]/g, '');
                    handleFieldChange('CompanyName', companyName)
                  }}
                  placeholder="Enter first name"
                />
                {errors.FirstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Type <span className="text-red-500">*</span>
                </label>

                <SinglePageSelection
                  value={companyFormData.CompanyType}
                  onChange={(e) => {
                    handleFieldChange('CompanyType', String(e))
                  }}

                  options={COMPANY_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} />

                {errors.CompanyType && (
                  <p className="text-red-500 text-xs mt-1">{errors.CompanyType}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  value={companyFormData.MobileNumber}
                  onChange={(e) => {
                    const mobileNumber = e.target.value.replace(/[^a-zA-Z]/g, '');
                    handleFieldChange('MobileNumber', mobileNumber)
                  }}
                  placeholder="Enter valid mobile number"
                />
                {errors.MobileNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.MobileNumber}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  value={companyFormData.ContactPerson}
                  onChange={(e) => {
                    const contactPerson = e.target.value.replace(/[^a-zA-Z]/g, '');
                    handleFieldChange('CompanyName', contactPerson)
                  }}
                  placeholder="Enter contact person name"
                />
                {errors.contactPerson && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Id <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  value={companyFormData.EmailId}
                  onChange={(e) => {
                    const emailId = e.target.value.replace(/[^a-zA-Z]/g, '');
                    handleFieldChange('EmailId', emailId)
                  }}
                  placeholder="Enter valid email id"
                />
                {errors.EmailId && (
                  <p className="text-red-500 text-xs mt-1">{errors.EmailId}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Land Line Number<span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  value={companyFormData.LandLineNumber}
                  onChange={(e) => {
                    const landLineNumber = e.target.value.replace(/[^a-zA-Z]/g, '');
                    handleFieldChange('LandLineNumber', landLineNumber)
                  }}
                  placeholder="Enter land line number"
                />
                {errors.LandLineNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.LandLineNumber}</p>
                )}
              </div>
            </div>
          </div>
          {/* ============================================================= [GOVERNMENT IDENTIFIERS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Government Identifiers</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  value={companyFormData.GSTNumber}
                  onChange={(e) => {
                    const gstNumber = e.target.value.replace(/[^a-zA-Z]/g, '');
                    handleFieldChange('GSTNumber', gstNumber)
                  }}
                  placeholder="Enter GST Number"
                />
                {errors.GSTNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.GSTNumber}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Certificate <span className="text-red-500">*</span>
                </label>


                {errors.GSTCertificateURL && (
                  <p className="text-red-500 text-xs mt-1">{errors.GSTCertificateURL}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  value={companyFormData.PanNumber}
                  onChange={(e) => {
                    const panNumber = e.target.value.replace(/[^a-zA-Z]/g, '');
                    handleFieldChange('PanNumber', panNumber)
                  }}
                  placeholder="Enter valid PAN number"
                />
                {errors.PanNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.PanNumber}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN URL <span className="text-red-500">*</span>
                </label>

                {errors.PanCardURL && (
                  <p className="text-red-500 text-xs mt-1">{errors.PanCardURL}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIN Number <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  value={companyFormData.CINNumber}
                  onChange={(e) => {
                    const cinNumber = e.target.value.replace(/[^a-zA-Z]/g, '');
                    handleFieldChange('CINNumber', cinNumber)
                  }}
                  placeholder="Enter valid CIN Number"
                />
                {errors.CINNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.CINNumber}</p>
                )}
              </div>
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIN URL<span className="text-red-500">*</span>
                </label>

                {errors.CINURL && (
                  <p className="text-red-500 text-xs mt-1">{errors.CINURL}</p>
                )}
              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RERA Number <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  value={companyFormData.RERANumber}
                  onChange={(e) => {
                    const reraNumber = e.target.value.replace(/[^a-zA-Z]/g, '');
                    handleFieldChange('RERANumber', reraNumber)
                  }}
                  placeholder="Enter valid RERA Number"
                />
                {errors.RERANumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.RERANumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================= [ADDRESS] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* COUNTRY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>

                <SinglePageSelection
                  value={selectedCountryId || ''}
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

                {errors.CountryMasterId && (
                  <p className="text-red-500 text-xs mt-1">{errors.CountryMasterId}</p>
                )}
              </div>

              {/* STATE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>

                <SinglePageSelection
                  value={selectedStateId ?? ''}
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

                {errors.StateMasterId && (
                  <p className="text-red-500 text-xs mt-1">{errors.StateMasterId}</p>
                )}
              </div>

              {/* DISTRICT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>

                <SinglePageSelection
                  value={selectedDistrictId ?? ''}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedDistrictId(id)
                    setSelectedCityId(null)

                    handleFieldChange('DistrictMasterId', id)
                  }}
                  disabled={!selectedStateId || districtOptions.length === 0}
                  options={districtOptions}
                />

                {errors.DistrictMasterId && (
                  <p className="text-red-500 text-xs mt-1">{errors.DistrictMasterId}</p>
                )}
              </div>

              {/* CITY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>

                <SinglePageSelection
                  value={selectedCityId ?? ''}
                  onChange={val => {
                    const id = Number(val)
                    setSelectedCityId(id)
                    handleFieldChange('CityMasterId', id)
                  }}
                  disabled={!selectedDistrictId || cityOptions.length === 0}
                  options={cityOptions}
                />

                {errors.CityMasterId && (
                  <p className="text-red-500 text-xs mt-1">{errors.CityMasterId}</p>
                )}
              </div>

            </div>
          </div>

          {/* ============================================================= [COMPANY VERIFICATION] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Company Verification</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Letterhead Header <span className="text-red-500">*</span>
                </label>
                {errors.CompanyLetterheadHeaderURL && (
                  <p className="text-red-500 text-xs mt-1">{errors.CompanyLetterheadHeaderURL}</p>
                )}
              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Letterhead Footer <span className="text-red-500">*</span>
                </label>
                {errors.CompanyLetterheadFooterURL && (
                  <p className="text-red-500 text-xs mt-1">{errors.CompanyLetterheadFooterURL}</p>
                )}
              </div>
            </div>
          </div>


          {/* ============================================================= [COMPANY PARTNER ] ============================================================================================= */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Company Partner</h3>


          </div>
        </div>
        {/* ✅ Fixed Bottom  */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2 flex justify-end items-center gap-3 shadow-md h-16"
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
            // onClick={() => handleSavePermissions()}
            className="px-6"
          >
            Save
          </Button>
        </div>
      </div >
    </>
  )
}

export default AddCompany
