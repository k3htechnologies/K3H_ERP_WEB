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
    }
  }, [isCompanyEdit, editCompanyData])


  const handleFieldChange = (field: keyof AddUpdateCompanyMasterRequest, value: string | number | boolean) => {

    setCompanyFormData(prev => ({ ...prev, [field]: value }))

    // Clear error while typing
    if (errors[field]) {

      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        {/* ✅ Fixed HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">
              Company Master
            </h1>

          </div>

        </div>

        {/* ✅ BODY  */}
        <div className="space-y-2 px-6 py-3 pt-20 pb-20 overflow-y-auto">
          {/* ============================================================= [PERSONAL INFORMATION] ============================================================================================= */}
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
      </div>
    </>
  )
}

export default AddCompany
