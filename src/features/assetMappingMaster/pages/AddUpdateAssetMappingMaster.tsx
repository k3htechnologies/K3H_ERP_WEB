import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/ui/components/forms/Input";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { useEffect, useState } from "react";
import React from "react";
import type { AddUpdateAssetMappingMasterRequest, FilterWithPaginationAssetMappingMasterRequest } from "@/features/assetMappingMaster/models/AssetMappingMasterModel";
import { assetMappingMasterService } from "@/features/assetMappingMaster/services/AssetMappingMasterService";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchEmployeeMasterById, fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import { fetchAssetById, fetchAssetMasterDropdown } from "@/features/assetMaster/assetMasterDropDown";
import { DatePickerInput } from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { TextArea } from "@/ui/components/forms/Textarea";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import Checkbox from "@/ui/components/forms/Checkbox";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";

const initialFormState = (): AddUpdateAssetMappingMasterRequest => ({
  AssetMasterMappingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  AssetMasterId: 0,
  AssignedDate: "",
  EmployeeId: 0,
  ReturnDate: "",
  ConditionOnIssue: "",
  ConditionOnReturn: "",
  Remarks: "",
});

export const AddUpdateAssetMappingMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [formData, setFormData] = useState<AddUpdateAssetMappingMasterRequest>(() => initialFormState());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [assetCode, setAssetCode] = useState<string>();
  const [assetName, setAssetName] = useState<string>();
  const [assetType, setAssetType] = useState<string>();
  const [assetModel, setAssetModel] = useState<string>();
  const [assetBrand, setAssetBrand] = useState<string>();
  const [serialNumber, setSerialNumber] = useState<string>();

  const [departmentName, setDepartmentName] = useState<string>();
  const [designationName, setDesignationName] = useState<string>();
  const [branchName, setBranchName] = useState<string>();
  const [reportingPersonName, setReportingPersonName] = useState<string>();
  const [emailId, setEmailId] = useState<string>();
  const [personalMobileNumber, setPersonalMobileNumber] = useState<string>();

  const [isReturnAsset, setIsReturnAsset] = useState(false);

  // NAVIGATE
  const navigate = useNavigate();

  // GET VALUE FROM URL ASSET MAPPING MASTER ID
  const { AssetMasterMappingId } = useParams<{ AssetMasterMappingId?: string }>();
  const AssetMappingId = AssetMasterMappingId ? Number(AssetMasterMappingId) : 0;
  const isAddMode = AssetMappingId === 0;

  // TOAST
  const { addToast } = useToast();

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/assetMappingMaster');
  //#endregion

  // ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  //#endregion

  const [dropdownLabels, setDropdownLabels] = useState<{
    employeeName?: string;
    assetName?: string;
  }>({});

  //#region HANDLE FIELD CHANGE EVENT
  const handleFieldChange = (field: keyof AddUpdateAssetMappingMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  //#endregion

  //#region INITIALIZATION
  useEffect(() => {
    if (!isAddMode) {
      fetchAssetMappingMasterDetails();
    }
  }, [AssetMappingId]);

  useEffect(() => {
    if (!formData.AssetMasterId) return;

    fetchAssetById(formData.AssetMasterId).then(asset => {
      if (!asset) return;

      setAssetCode(asset.AssetCode ?? "");
      setAssetName(asset.AssetName ?? "");
      setAssetType(asset.AssetType ?? "");
      setAssetModel(asset.AssetModel ?? "");
      setAssetBrand(asset.AssetBrand ?? "");
      setSerialNumber(asset.SerialNumber ?? "");
    });
  }, [formData.AssetMasterId]);

  useEffect(() => {
    if (!formData.EmployeeId) return;

    fetchEmployeeMasterById(formData.EmployeeId).then(employee => {
      if (!employee) return;

      setDepartmentName(employee.Department ?? "");
      setDesignationName(employee.Designation ?? "");
      setBranchName(employee.Branch ?? "");
      setReportingPersonName(employee.ReportPersonName ?? "");
      setEmailId(employee.EmailId ?? "");
      setPersonalMobileNumber(employee.PersonalMobileNumber ?? "");
    });
  }, [formData.EmployeeId]);

  //#endregion

  //#region FETCH ASSET MAPPING MASTER DETAILS
  const fetchAssetMappingMasterDetails = async () => {
    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {

        const params: FilterWithPaginationAssetMappingMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          AssetMasterMappingId: AssetMappingId
        };

        const response = await assetMappingMasterService.apiCallPullAssetMappingMaster(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData(prev => ({
              ...prev,
              AssetMasterMappingId: e.AssetMasterMappingId ?? prev.AssetMasterMappingId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              AssetMasterId: e.AssetMasterId ?? prev.AssetMasterId,
              AssignedDate: e.AssignedDate ? e.AssignedDate.split("T")[0] : "",
              EmployeeId: e.EmployeeId ?? prev.EmployeeId,
              ReturnDate: e.ReturnDate ? e.ReturnDate.split("T")[0] : "",
              ConditionOnIssue: e.ConditionOnIssue ?? prev.ConditionOnIssue,
              ConditionOnReturn: e.ConditionOnReturn ?? prev.ConditionOnReturn,
              Remarks: e.Remarks ?? prev.Remarks
            }));

            setDropdownLabels({
              employeeName: e.EmployeeName || "",
              assetName: e.AssetName || ""
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
      'Loading Asset Mapping'
    );
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddAssetMappingMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.AssetMasterId) {
      newErrors.AssetMasterId = 'Asset is required';
    }

    if (!formData.EmployeeId) {
      newErrors.EmployeeId = 'Employee Name is required';
    }

    if (!formData.ConditionOnIssue?.trim()) {
      newErrors.ConditionOnIssue = 'Condition On Issue is required';
    }

    if (isReturnAsset === true && !formData.ConditionOnReturn?.trim()) {
      newErrors.ConditionOnReturn = "Condition On Return is required";
    }

    if (isReturnAsset === true && !formData.ReturnDate) {
      newErrors.ReturnDate = "Return Date is required";
    }

    if (!formData.AssignedDate?.trim()) {
      newErrors.AssignedDate = 'Assigned Date is required';
    }

    if (isReturnAsset === true && formData.ReturnDate && !isToDateGreaterOrEqualFromDate(formData.AssignedDate!, formData.ReturnDate!)) {
      newErrors.ReturnDate = "Return Date must be greater than or equal to Assigned Date";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };
  //#endregion

  //#region PUSH DATA
  const PushAssetMappingMasterFormData = (): AddUpdateAssetMappingMasterRequest => {
    return {
      AssetMasterMappingId: formData.AssetMasterMappingId ?? 0,
      Uniquekey: formData.Uniquekey,
      AssetMasterId: formData.AssetMasterId,
      AssignedDate: formData.AssignedDate,
      EmployeeId: formData.EmployeeId,
      ReturnDate: formData.ReturnDate === "" ? "1997-01-01" : formData.ReturnDate,
      ConditionOnIssue: formData.ConditionOnIssue,
      ConditionOnReturn: formData.ConditionOnReturn ?? "",
      Remarks: formData.Remarks
    };
  }
  //#endregion

  //#region HANDLE ADD AND UPDATE ASSET MAPPING MASTER
  const handleAddUpdateAssetMappingMaster = async () => {

    setErrors({});

    const validation = validateAddAssetMappingMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }

    await runApiWithLoader(

      setIsLoading,

      setLoadingMessage,

      async () => {
        const payload = PushAssetMappingMasterFormData();

        const response = await assetMappingMasterService.apiCallAddUpdateAssetMappingMaster(payload);

        if (E.isRight(response)) {


          addToast({ type: "success", title: isReturnAsset === true ? "Asset returned successfully" : response.right.SuccessMessage[0] });

          navigate("/assetMappingMaster");

        } else {
          addToast({ type: "error", title: response.left?.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      isAddMode ? 'Add Asset' : 'Update Asset'
    );
  };
  //#endregion



  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">

        <div className="space-y-4 pb-3">

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Asset Details & Mapping</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ================= ASSET COLUMN ================= */}
            <div>
              <SingleSelectDropdownWithPagination
                label="Asset"
                title="Select Asset"
                size="lg"
                required
                dataFetchCallBack={fetchAssetMasterDropdown}
                onSelected={(item) => {
                  if (!item) {
                    handleFieldChange("AssetMasterId", null);
                    setAssetCode("");
                    setAssetName("");
                    setAssetType("");
                    setAssetModel("");
                    setAssetBrand("");
                    setSerialNumber("");
                    return;
                  }

                  handleFieldChange("AssetMasterId", Number(item.value));
                }}
                initialValue={createDropdownInitialValue(
                  formData.AssetMasterId,
                  dropdownLabels.assetName
                )}
                error={errors.AssetMasterId}
              />

              {(formData.AssetMasterId != 0 && formData.AssetMasterId != null) && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldItem label="Asset Code" value={assetCode || '-'} />
                    <FieldItem label="Asset Name" value={assetName || '-'} />
                    <FieldItem label="Asset Type" value={assetType || '-'} />
                    <FieldItem label="Asset Model" value={assetModel || '-'} />
                    <FieldItem label="Asset Brand" value={assetBrand || '-'} />
                    <FieldItem label="Serial Number" value={serialNumber || '-'} />
                  </div>
                </div>
              )}
            </div>

            {/* ================= EMPLOYEE COLUMN ================= */}
            <div>
              <SingleSelectDropdownWithPagination
                label="Employee"
                title="Select Employee"
                size="lg"
                required
                dataFetchCallBack={fetchEmployeeMasterDropdown}
                onSelected={(item) => {
                  if (!item) {
                    handleFieldChange("EmployeeId", null);
                    setDepartmentName("");
                    setDesignationName("");
                    setBranchName("");
                    setReportingPersonName("");
                    setEmailId("");
                    setPersonalMobileNumber("");
                    return;
                  }

                  handleFieldChange("EmployeeId", Number(item.value));
                }}
                initialValue={createDropdownInitialValue(
                  formData.EmployeeId,
                  dropdownLabels.employeeName
                )}
                error={errors.EmployeeId}
              />

              {(formData.EmployeeId != 0 && formData.EmployeeId != null) && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldItem label="Department" value={departmentName || '-'} />
                    <FieldItem label="Designation" value={designationName || '-'} />
                    <FieldItem label="Branch" value={branchName || '-'} />
                    <FieldItem label="Reporting Person" value={reportingPersonName || '-'} />
                    <FieldItem label="Email ID" value={emailId || '-'} />
                    <FieldItem label="Personal Mobile Number" value={personalMobileNumber || '-'} />
                  </div>
                </div>
              )}
            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                type="text"
                required
                label='Condition On Issue'
                value={formData.ConditionOnIssue ?? ""}
                onChange={(e) => handleFieldChange("ConditionOnIssue", e.target.value)}
                placeholder="Enter Condition On Issue"
                maxLength={250}
                error={errors.ConditionOnIssue}
              />
            </div>
            <div>
              <DatePickerInput
                label="Assigned Date"
                value={formatDate_dd_mm_yyyy(formData.AssignedDate)}
                onChange={(val) => handleFieldChange('AssignedDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                required
                error={errors.AssignedDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <TextArea
                label="Remarks"
                className='thin-scroll'
                value={formData.Remarks ?? ""}
                placeholder="Enter Remarks"
                onChange={(e) => handleFieldChange("Remarks", e.target.value)}
                error={errors.Remarks} />
            </div>
          </div>

          {formData.AssetMasterMappingId !== 0 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                <Checkbox
                  label="Do you want to return the asset?"
                  checked={isReturnAsset}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsReturnAsset(checked);
                  }}
                />
              </h3>
              {isReturnAsset && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      type="text"
                      label='Condition On Return'
                      value={formData.ConditionOnReturn ?? ""}
                      onChange={(e) => handleFieldChange("ConditionOnReturn", e.target.value)}
                      placeholder="Enter Condition On Return"
                      maxLength={250}
                      error={errors.ConditionOnReturn}
                    />
                  </div>
                  <div>
                    <DatePickerInput
                      label="Return Date"
                      value={formatDate_dd_mm_yyyy(formData.ReturnDate)}
                      onChange={(val) => handleFieldChange('ReturnDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                      error={errors.ReturnDate}
                    />
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

      <BottomActionBar
        cancelText="Cancel"
        saveText={formData.AssetMasterMappingId ? "Update" : "Add"}
        onCancel={() => navigate(-1)}
        canAction={canAction}
        onSave={() => {
          handleAddUpdateAssetMappingMaster();
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddUpdateAssetMappingMaster;
