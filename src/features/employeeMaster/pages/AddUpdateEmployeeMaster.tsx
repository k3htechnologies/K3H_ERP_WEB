import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import { TextArea } from "@/ui/components/forms/Textarea";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { SingleSelectDropdownWithPagination } from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { employeeMasterService } from "@/features/employeeMaster/services/EmployeeMasterService";
import { useToast } from "@/core/hooks/useToast";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { Loader } from "@/core/utils/loader";
import {
  BLOOD_GROUP_OPTIONS,
  EMERGENCY_RELATION_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from "@/core/constants/staticData";
import { useEffect, useState } from "react";
import { useCountryStateCityDistrictVillageData } from "@/core/hooks/useCountryStateCityDistrictVillage";
import React from "react";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { filterEmail, filterIFSC, filterLetters, filterMobile, filterNumbers, isValidEmail, isValidIFSC, isValidMobile } from "@/core/utils/fileValidation";
import { fetchDepartmentMasterDropdown } from "@/features/departmentMaster/departmentMasterDropdown";
import { fetchDesignationMasterDropdown } from "@/features/designationMaster/designationMasterDropDown";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { fetchCompanyMasterDropdown } from "@/features/companyMaster/companyMasterDropDown";
import { fetchBranchMasterDropdown } from "@/features/branchMaster/branchMasterDropDown";
import { fetchBankListMasterDropdown } from "@/features/bankListMaster/bankListMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import type { AddUpdateEmployeeMasterRequest, FilterWithPaginationEmployeeMasterRequest } from "@/features/employeeMaster/models/EmployeeMasterModel";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { Mail, Phone } from "lucide-react";


const initialFormState = (): AddUpdateEmployeeMasterRequest => ({
  EmployeeId: 0,
  UniqueKey: null,
  FirstName: "",
  MiddleName: "",
  LastName: "",
  DepartmentMasterId: null,
  DesignationMasterId: null,
  BranchMasterId: null,
  Gender: "",
  MaritalStatus: "",
  DateOfBirth: null,
  JoiningDate: null,
  IsGeoFenceLocation: false,
  EmailId: "",
  OfficeEmailId: "",
  ReportPersonId: null,
  PersonalMobileNumber: "",
  OfficeMobileNumber: "",
  BankListMasterId: null,
  BankBranchName: "",
  IFSCCode: "",
  AccountNo: "",
  EmployeeType: "",
  EmergencyMobileNumber: "",
  EmergencyContactPersonRelationship: "",
  CommunicationAddress: "",
  PermanentAddress: "",
  BloodGroup: "",
  CompanyId: null,
  CountryMasterId: 1,
  StateMasterId: null,
  DistrictMasterId: null,
  CityMasterId: null,
});

const AddUpdateEmployeePage: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateEmployeeMasterRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // NAVIGATE
  const navigate = useNavigate();

  //GET VALUE FROM URL :EMPLOYEEID
  const { employeeId } = useParams<{ employeeId?: string }>();

  // TOAST
  const { addToast } = useToast();

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //SET DROP DOWN 
  const [dropdownLabels, setDropdownLabels] = useState<{
    companyName?: string;
    departmentName?: string;
    branchName?: string;
    designationName?: string;
    reportPersonName?: string;
    stateName?: string;
    districtName?: string;
    cityName?: string;
    bankName?: string;
  }>({});

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/employeeMaster');
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

  //#region HANDLE FILED CHNAGE EVENT
  const handleFieldChange = (field: keyof AddUpdateEmployeeMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (employeeId) {
      fetchEmployeeMasterDetails();
      return;
    }

    setSelectedCountryId(1);
    handleFieldChange('CountryMasterId', 1);

  }, [employeeId]);


  //#endregion

  //#region FETCH EMPLOYEE MASTER DETAILS
  const fetchEmployeeMasterDetails = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationEmployeeMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          IsCheckPermission: false,
          EmployeeId: Number(employeeId)
        }

        const response = await employeeMasterService.apiCallPullEmployeeMaster(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {

            setFormData(prev => ({
              ...prev,
              EmployeeId: e.EmployeeId ?? prev.EmployeeId,
              UniqueKey: e.UniqueKey ?? prev.UniqueKey,
              FirstName: e.FirstName ?? prev.FirstName,
              MiddleName: e.MiddleName ?? prev.MiddleName,
              LastName: e.LastName ?? prev.LastName,
              DepartmentMasterId: e.DepartmentMasterId ?? prev.DepartmentMasterId,
              DesignationMasterId: e.DesignationMasterId ?? prev.DesignationMasterId,
              BranchMasterId: e.BranchMasterId ?? prev.BranchMasterId,
              Gender: e.Gender ?? prev.Gender,
              MaritalStatus: e.MaritalStatus ?? prev.MaritalStatus,
              DateOfBirth: convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(e.DateOfBirth),
              JoiningDate: convert_yy_mm_dd_tt_mm_To_Yyyy_mm_dd(e.JoiningDate),
              IsGeoFenceLocation: !!e.IsGeoFenceLocation,
              EmailId: e.EmailId ?? prev.EmailId,
              OfficeEmailId: e.OfficeEmailId ?? prev.OfficeEmailId,
              ReportPersonId: e.ReportPersonId ?? prev.ReportPersonId,
              PersonalMobileNumber: e.PersonalMobileNumber ?? prev.PersonalMobileNumber,
              OfficeMobileNumber: e.OfficeMobileNumber ?? prev.OfficeMobileNumber,
              BankListMasterId: e.BankListMasterId ?? prev.BankListMasterId,
              BankBranchName: e.BankBranchName ?? prev.BankBranchName,
              IFSCCode: e.IFSCCode ?? prev.IFSCCode,
              AccountNo: e.AccountNo ?? prev.AccountNo,
              EmployeeType: e.EmployeeType ?? prev.EmployeeType,
              EmergencyMobileNumber: e.EmergencyMobileNumber ?? prev.EmergencyMobileNumber,
              EmergencyContactPersonRelationship: e.EmergencyContactPersonRelationship ?? prev.EmergencyContactPersonRelationship,
              CommunicationAddress: e.CommunicationAddress ?? prev.CommunicationAddress,
              PermanentAddress: e.PermanentAddress ?? prev.PermanentAddress,
              BloodGroup: e.BloodGroup ?? prev.BloodGroup,
              CompanyId: e.CompanyId ?? prev.CompanyId,
              CountryMasterId: e.CountryMasterId ?? prev.CountryMasterId,
              StateMasterId: e.StateMasterId ?? prev.StateMasterId,
              DistrictMasterId: e.DistrictMasterId ?? prev.DistrictMasterId,
              CityMasterId: e.CityMasterId ?? prev.CityMasterId,
            }));

            setSelectedCountryId(e.CountryMasterId ?? null);
            setSelectedStateId(e.StateMasterId ?? null);
            setSelectedDistrictId(e.DistrictMasterId ?? null);
            setSelectedCityId(e.CityMasterId ?? null);

            setDropdownLabels({
              companyName: e.CompanyName || "",
              departmentName: e.Department || "",
              branchName: e.Branch || "",
              designationName: e.Designation || "",
              reportPersonName: e.ReportPersonName || "",
              bankName: e.BankName || "",
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
      'Loading Employee Data'
    )
  }
  //#endregion

  //#region EMPLOYEE MASTER VALIDATION | ADD | UPDATE ACTION
  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddEmployeeMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}


    if (!formData.FirstName?.trim()) {
      newErrors.FirstName = 'First Name is required.'
    } else if (formData.FirstName.trim().length > 50) {
      newErrors.FirstName = 'First Name must be at most 50 characters'
    }

    if (!formData.MiddleName?.trim()) {
      newErrors.MiddleName = 'Middle Name is required.'
    } else if (formData.MiddleName.trim().length > 50) {
      newErrors.MiddleName = 'Middle Name must be at most 50 characters'
    }

    if (!formData.LastName?.trim()) {
      newErrors.LastName = 'Last Name is required.'
    } else if (formData.LastName.trim().length > 50) {
      newErrors.LastName = 'Last Name must be at most 50 characters'
    }

    if (!formData.Gender?.trim()) {
      newErrors.Gender = "Gender is required";
    }

    if (!formData.MaritalStatus?.trim()) {
      newErrors.MaritalStatus = "Marital Status is required";
    }

    if (!formData.BloodGroup?.trim()) {
      newErrors.BloodGroup = "Blood Group is required";
    }

    if (!formData.DateOfBirth) {
      newErrors.DateOfBirth = 'DOB is required'

    }
    else if (formData.DateOfBirth) {
      const dob = new Date(formData.DateOfBirth as unknown as string)
      const today = new Date()
      if (dob > today) {
        newErrors.DateOfBirth = 'Date of Birth cannot be in the future'
      }
    }

    if (!formData.EmailId?.trim()) {
      newErrors.EmailId = 'E-mail Id is required'
    } else if (!isValidEmail(formData.EmailId.trim())) {
      newErrors.EmailId = 'Enter a Valid E-mail Id'
    }


    if (formData.OfficeEmailId?.trim() && !isValidEmail(formData.OfficeEmailId.trim())) {
      newErrors.OfficeEmailId = 'Enter a valid office Email Address';
    }


    if (!formData.PersonalMobileNumber?.trim()) {
      newErrors.PersonalMobileNumber = 'Mobile Number is required.'
    } else if (!isValidMobile(formData.PersonalMobileNumber.trim())) {
      newErrors.PersonalMobileNumber = 'Enter a valid 10-Digit Mobile Number'
    }

    if (formData.OfficeMobileNumber != '' && !formData.OfficeMobileNumber?.trim()) {
      newErrors.OfficeMobileNumber = 'Office Mobile Number is required.'
    } else if (formData.OfficeMobileNumber != '' && !isValidMobile(formData.OfficeMobileNumber.trim())) {
      newErrors.OfficeMobileNumber = 'Enter a valid 10-digit Office Mobile Number'
    }

    if (!formData.EmployeeType?.trim()) {
      newErrors.EmployeeType = "Employee Type is required";
    }

    if (!formData.EmergencyContactPersonRelationship?.trim()) {
      newErrors.EmergencyContactPersonRelationship = "Relation to Emergency Contact is required";
    }

    if (!formData.EmergencyMobileNumber?.trim()) {
      newErrors.EmergencyMobileNumber = 'Emergency Contact Number is required'
    } else if (!isValidMobile(formData.EmergencyMobileNumber.trim())) {
      newErrors.EmergencyMobileNumber = 'Enter a valid 10-digit Emergency Contact Number'
    }

    if (!formData.CompanyId) {
      newErrors.CompanyId = "Company is required";
    }
    if (!formData.BranchMasterId) {
      newErrors.BranchMasterId = "Branch is required";
    }
    if (!formData.DepartmentMasterId) {
      newErrors.DepartmentMasterId = "Department is required";
    }
    if (!formData.DesignationMasterId) {
      newErrors.DesignationMasterId = "Designation is required";
    }

    if (!formData.JoiningDate) {
      newErrors.JoiningDate = 'Joining Date is required'

    }
    if (!formData.ReportPersonId) {
      newErrors.ReportPersonId = "Report Person is required";
    }
    if (!formData.CommunicationAddress?.trim()) {
      newErrors.CommunicationAddress = 'Communication Address is required'
    } else if (formData.CommunicationAddress.trim().length > 500) {
      newErrors.CommunicationAddress = 'Communication Address must be at most 500 characters'
    }

    if (!formData.PermanentAddress?.trim()) {
      newErrors.PermanentAddress = 'Permanent Address Name is required'
    } else if (formData.PermanentAddress.trim().length > 500) {
      newErrors.PermanentAddress = 'Permanent Address must be at most 500 characters'
    }

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

    if (!formData.BankListMasterId) {
      newErrors.BankListMasterId = "Bank Name is required";
    }

    if (!formData.BankBranchName?.trim()) {
      newErrors.BankBranchName = 'Bank Branch Name is required.'
    } else if (formData.BankBranchName.trim().length > 50) {
      newErrors.BankBranchName = 'Bank Branch Name must be at most 50 characters'
    }

    if (!formData.AccountNo?.trim()) {
      newErrors.AccountNo = 'Account Number is required.'
    } else if (formData.AccountNo.trim().length > 18) {
      newErrors.AccountNo = 'Account Number must be at most 50 characters'
    }

    if (!formData.IFSCCode?.trim()) {
      newErrors.IFSCCode = 'IFSC Code is required.'
    }
    else if (formData.IFSCCode.trim().length > 12) {
      newErrors.IFSCCode = 'IFSC Code must be at most 50 characters'
    }
    else if (!isValidIFSC(formData.IFSCCode.trim())) {
      newErrors.IFSCCode = 'Enter a valid IFSC Code'
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushEmployeeMasterFormData = (): AddUpdateEmployeeMasterRequest => {
    return {
      EmployeeId: formData.EmployeeId,
      UniqueKey: formData.UniqueKey,
      FirstName: formData.FirstName,
      MiddleName: formData.MiddleName,
      LastName: formData.LastName,
      DepartmentMasterId: formData.DepartmentMasterId ?? 0,
      DesignationMasterId: formData.DesignationMasterId ?? 0,
      BranchMasterId: formData.BranchMasterId ?? 0,
      Gender: formData.Gender,
      MaritalStatus: formData.MaritalStatus,
      DateOfBirth: formData.DateOfBirth,
      JoiningDate: formData.JoiningDate,
      IsGeoFenceLocation: formData.IsGeoFenceLocation,
      EmailId: formData.EmailId,
      OfficeEmailId: formData.OfficeEmailId,
      ReportPersonId: formData.ReportPersonId ?? 0,
      PersonalMobileNumber: formData.PersonalMobileNumber,
      OfficeMobileNumber: formData.OfficeMobileNumber,
      BankListMasterId: formData.BankListMasterId ?? 0,
      BankBranchName: formData.BankBranchName,
      IFSCCode: formData.IFSCCode,
      AccountNo: formData.AccountNo,
      EmployeeType: formData.EmployeeType,
      EmergencyMobileNumber: formData.EmergencyMobileNumber,
      EmergencyContactPersonRelationship: formData.EmergencyContactPersonRelationship,
      CommunicationAddress: formData.CommunicationAddress,
      PermanentAddress: formData.PermanentAddress,
      BloodGroup: formData.BloodGroup,
      CompanyId: formData.CompanyId ?? 0,
      CountryMasterId: formData.CountryMasterId ?? 1,
      StateMasterId: formData.StateMasterId ?? 0,
      DistrictMasterId: formData.DistrictMasterId ?? 0,
      CityMasterId: formData.CityMasterId ?? 0,
    };

  };

  const handleSubmit = async () => {

    setErrors({})


    const validation = validateAddEmployeeMasterForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushEmployeeMasterFormData();

        const response = await employeeMasterService.apiCallAddUpdateEmployeeMaster(payload);

        if (E.isRight(response)) {

          addToast({ type: "success", title: formData.EmployeeId ? "Employee updated successfully" : "Employee added successfully" });

          navigate("/employeeMaster");

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

      Number(employeeId) === 0 ? 'Add Employee' : 'Update Employee'
    )

  };

  //#endregion
  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>


      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
        <form onSubmit={handleSubmit}>
          {/* ============================================================= [BASIC EMPLOYEE DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Basic Employee Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Input
                  label="First Name"
                  placeholder="Enter First Name"
                  value={formData.FirstName}
                  required
                  onChange={e => handleFieldChange('FirstName', filterLetters(e.target.value))}
                  error={errors.FirstName} />
              </div>
              <div>
                <Input
                  value={formData.MiddleName}
                  label="Middle Name"
                  placeholder="Enter Middle Name"
                  required
                  onChange={e => handleFieldChange('MiddleName', filterLetters(e.target.value))}
                  error={errors.MiddleName} />
              </div>
              <div>
                <Input
                  value={formData.LastName}
                  label="Last Name"
                  placeholder="Enter Last Name"
                  required
                  onChange={e => handleFieldChange('LastName', filterLetters(e.target.value))}
                  error={errors.LastName} />
              </div>
              <div>
                <SinglePageSelection
                  label="Gender"
                  placeholder="Select Gender"
                  required
                  value={formData.Gender}
                  onChange={(e) => handleFieldChange('Gender', String(e))}
                  options={GENDER_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errors.Gender}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="Marital Status"
                  placeholder="Select Marital Status"
                  value={formData.MaritalStatus}
                  onChange={(val) => handleFieldChange("MaritalStatus", String(val))}
                  options={MARITAL_STATUS_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))} required
                  error={errors.MaritalStatus}
                />
              </div>
              <div>
                <SinglePageSelection
                  value={formData.BloodGroup}
                  label="Blood Group"
                  placeholder="Select Blood Group"
                  onChange={(val) => handleFieldChange("BloodGroup", String(val))} required
                  options={BLOOD_GROUP_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errors.BloodGroup}
                />
              </div>
              <div>
                <DatePickerInput
                  label="DOB"
                  value={formatDate_dd_mm_yyyy(formData.DateOfBirth)}
                  onChange={(val) => handleFieldChange('DateOfBirth', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                   required
                  error={errors.DateOfBirth}

                />

              </div>
              <div>
                <Input
                  label="E-mail Id"
                  placeholder="Enter E-mail Id"
                  value={formData.EmailId}
                  rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
                  required
                  onChange={(e) => handleFieldChange("EmailId", filterEmail(e.target.value))}
                  error={errors.EmailId} />
              </div>
              <div>
                <Input
                  label="Office E-mail Id"
                  placeholder="Enter Office E-mail Id"
                  value={formData.OfficeEmailId}
                  rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
                  onChange={(e) => handleFieldChange("OfficeEmailId", filterEmail(e.target.value))}
                  error={errors.OfficeEmailId}
                />
              </div>

              <div>
                <Input
                  leftIcon="+91"
                  label="Personal Mobile Number"
                  placeholder="Enter Personal Mobile Number"
                  required
                  value={formData.PersonalMobileNumber}
                  rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                  onChange={(e) => handleFieldChange("PersonalMobileNumber", filterMobile(e.target.value))}
                  error={errors.PersonalMobileNumber} />
              </div>
              <div>
                <Input

                  value={formData.OfficeMobileNumber}
                  leftIcon="+91"
                  label="Office Mobile Number"
                  placeholder="Enter Office Mobile Number"
                  rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                  onChange={(e) => handleFieldChange("OfficeMobileNumber", filterMobile(e.target.value))}
                  error={errors.OfficeMobileNumber}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="Employee Type"
                  placeholder="Select Employee Type"
                  value={formData.EmployeeType} required
                  onChange={(val) => handleFieldChange("EmployeeType", String(val))}
                  options={EMPLOYEE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errors.EmployeeType}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="Relation to Emergency Contact"
                  placeholder="Select Relation"
                  value={formData.EmergencyContactPersonRelationship} required
                  onChange={(val) => handleFieldChange("EmergencyContactPersonRelationship", String(val))}
                  options={EMERGENCY_RELATION_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                  error={errors.EmergencyContactPersonRelationship}
                />
              </div>
              <div>
                <Input
                  label="Emergency Contact Number"
                  placeholder="Enter Emergency Contact Number"
                  leftIcon="+91"
                  value={formData.EmergencyMobileNumber}
                  rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                  required
                  onChange={(e) => handleFieldChange("EmergencyMobileNumber", filterMobile(e.target.value))}
                  error={errors.EmergencyMobileNumber} />
              </div>
            </div>
          </div>
          {/* ============================================================= [EMPLOYEE INFO SHEET] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Employee Info Sheet</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <SingleSelectDropdownWithPagination
                  label="Company"
                  title="Select Company"
                  required
                  size="lg"
                  dataFetchCallBack={fetchCompanyMasterDropdown}
                  onSelected={(item) => handleFieldChange("CompanyId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.CompanyId, dropdownLabels.companyName)}
                  error={errors.CompanyId}
                />
              </div>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Department"
                  required
                  title="Select Department"
                  size="lg"
                  dataFetchCallBack={fetchDepartmentMasterDropdown}
                  onSelected={(item) => handleFieldChange("DepartmentMasterId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.DepartmentMasterId, dropdownLabels.departmentName)}
                  error={errors.DepartmentMasterId}
                />
              </div>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Branch"
                  required
                  title="Select Branch"
                  size="lg"
                  dataFetchCallBack={fetchBranchMasterDropdown}
                  onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.BranchMasterId, dropdownLabels.branchName)}
                  error={errors.BranchMasterId}
                />
              </div>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Designation"
                  required
                  title="Select Designation"
                  size="lg"
                  dataFetchCallBack={fetchDesignationMasterDropdown}
                  onSelected={(item) => handleFieldChange("DesignationMasterId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.DesignationMasterId, dropdownLabels.designationName)}
                  error={errors.DesignationMasterId}
                />
              </div>
              <div>
                <DatePickerInput
                  label="Joining Date"
                  value={formatDate_dd_mm_yyyy(formData.JoiningDate)}
                  onChange={(val) => handleFieldChange('JoiningDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  required
                  error={errors.JoiningDate}

                />

              </div>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Reporting Person"
                  required
                  title="Select Reporting Person"
                  size="lg"
                  dataFetchCallBack={fetchEmployeeMasterDropdown}
                  onSelected={(item) => handleFieldChange("ReportPersonId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.ReportPersonId, dropdownLabels.reportPersonName)}
                  error={errors.ReportPersonId}
                />
              </div>
            </div>
          </div>
          {/* ============================================================= [ADDRESS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextArea
                  label="Communication Address"
                  placeholder="Enter Communication Address"
                  required
                  className='thin-scroll'
                  value={formData.CommunicationAddress}
                  onChange={(e) => handleFieldChange("CommunicationAddress", e.target.value)}
                  error={errors.CommunicationAddress} />
              </div>
              <div>
                <TextArea
                  label="Permanent Address"
                  placeholder="Enter Permanent Address"
                  required
                  className='thin-scroll'
                  value={formData.PermanentAddress}
                  onChange={(e) => handleFieldChange("PermanentAddress", e.target.value)}
                  error={errors.PermanentAddress} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <SinglePageSelection
                  label="Country"
                  value={selectedCountryId || ''} required
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
                  error={errors.CountryMasterId}
                />
              </div>
              <div>

                <SinglePageSelection
                  label="State"
                  placeholder="Select State"
                  value={selectedStateId ?? ''} required
                  onChange={val => {
                    const id = Number(val)
                    setSelectedStateId(id)
                    setSelectedDistrictId(null)
                    setSelectedCityId(null)

                    handleFieldChange('StateMasterId', id)
                  }}
                  disabled={!selectedCountryId || stateOptions.length === 0}
                  options={stateOptions}
                  error={errors.StateMasterId}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="District"
                  placeholder="Select District"
                  value={selectedDistrictId ?? ''} required
                  onChange={val => {
                    const id = Number(val)
                    setSelectedDistrictId(id)
                    setSelectedCityId(null)

                    handleFieldChange('DistrictMasterId', id)
                  }}
                  disabled={!selectedStateId || districtOptions.length === 0}
                  options={districtOptions}
                  error={errors.DistrictMasterId}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="City"
                  placeholder="Select City"
                  value={selectedCityId ?? ''} required
                  onChange={val => {
                    const id = Number(val)
                    setSelectedCityId(id)
                    handleFieldChange('CityMasterId', id)
                  }}
                  disabled={!selectedDistrictId || cityOptions.length === 0}
                  options={cityOptions}
                  error={errors.CityMasterId}
                />
              </div>

            </div>
          </div>

          {/* ============================================================= [BANK DETAILS] ============================================================================================= */}
          <div className="space-y-4 pb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Bank Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <SingleSelectDropdownWithPagination
                  label="Bank"
                  required
                  title="Select Bank"
                  size="lg"
                  dataFetchCallBack={fetchBankListMasterDropdown}
                  onSelected={(item) => { handleFieldChange("BankListMasterId", Number(item?.value || 0)); }}
                  initialValue={createDropdownInitialValue(formData.BankListMasterId, dropdownLabels.bankName)}
                  error={errors.BankListMasterId}
                />
              </div>
              <div>
                <Input
                  label="Bank Branch Name"
                  placeholder="Enter Bank Branch Name"
                  required value={formData.BankBranchName}
                  onChange={(e) => handleFieldChange("BankBranchName", filterLetters(e.target.value))}
                  error={errors.BankBranchName} />
              </div>
              <div>
                <Input
                  label="Account Number"
                  placeholder="Enter Account Number"
                  required value={formData.AccountNo}
                  maxLength={18}
                  onChange={(e) => handleFieldChange("AccountNo", filterNumbers(e.target.value))}
                  error={errors.AccountNo} />
              </div>
              <div>
                <Input
                  label="IFSC Code"
                  placeholder="Enter IFSC Code"
                  required
                  value={formData.IFSCCode}
                  onChange={(e) => handleFieldChange("IFSCCode", filterIFSC(e.target.value))}
                  error={errors.IFSCCode} />
              </div>
            </div>
          </div>
        </form>
      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.EmployeeId ? "Update" : "Add"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleSubmit();
        }}
        isLoading={isLoading}
      />


    </div>
  );
};

export default AddUpdateEmployeePage;