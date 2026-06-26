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
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { TextArea } from "@/ui/components/forms/Textarea";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import Checkbox from "@/ui/components/forms/Checkbox";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import type { EmployeeMasterData } from "@/features/employeeMaster/models/EmployeeMasterModel";
import type { AssetMasterData } from "@/features/assetMaster/models/AssetMasterModel";

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

  const [formData, setFormData] = useState<AddUpdateAssetMappingMasterRequest>(() => initialFormState());

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [assetMasterData, setAssetMasterData] = useState<AssetMasterData | null>(null);

  const [employeeDetails, setEmployeeDetails] = useState<EmployeeMasterData | null>(null);
  const [joiningDate, setJoiningDate] = useState<string>();

  const [isReturnAsset, setIsReturnAsset] = useState(false);

  const navigate = useNavigate();
  const { AssetMasterMappingId } = useParams<{ AssetMasterMappingId?: string }>();
  const AssetMappingId = AssetMasterMappingId ? Number(AssetMasterMappingId) : 0;
  const isAddMode = AssetMappingId === 0;

  const { addToast } = useToast();

  const { canAction } = useMenuPermissions("/assetMappingMaster");

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [isEditAllowedForAssetAndEmployee, SetIsEditAllowedForAssetAndEmployee] = useState<boolean>(true);


  const [dropdownLabels, setDropdownLabels] = useState<{
    employeeName?: string;
    assetName?: string;
  }>({});

  const handleFieldChange = (field: keyof AddUpdateAssetMappingMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    if (!isAddMode) {
      fetchAssetMappingMasterDetails();
    }
  }, [AssetMappingId]);

  //#region FETCH ASSET MAPPING MASTER DETAILS
  const fetchAssetMappingMasterDetails = async () => {
    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,

      async () => {
        const params: FilterWithPaginationAssetMappingMasterRequest = {
          PageNumber: 1,
          PageSize: 1,
          AssetMasterMappingId: AssetMappingId,
        };

        const response = await assetMappingMasterService.apiCallPullAssetMappingMaster(params);

        if (E.isRight(response)) {

          const e = response.right.Data?.[0];

          if (e) {
            setFormData((prev) => ({
              ...prev,
              AssetMasterMappingId: e.AssetMasterMappingId ?? prev.AssetMasterMappingId,
              Uniquekey: e.Uniquekey ?? prev.Uniquekey,
              AssetMasterId: e.AssetMasterId ?? prev.AssetMasterId,
              AssignedDate: e.AssignedDate ? e.AssignedDate.split("T")[0] : "",
              EmployeeId: e.EmployeeId ?? prev.EmployeeId,
              ReturnDate: e.ReturnDate ? e.ReturnDate.split("T")[0] : "",
              ConditionOnIssue: e.ConditionOnIssue ?? prev.ConditionOnIssue,
              ConditionOnReturn: e.ConditionOnReturn ?? prev.ConditionOnReturn,
              Remarks: e.Remarks ?? prev.Remarks,

            }));

            if (e.EmployeeId) {

              fetchEmployeeMasterById(e.EmployeeId).then((employee) => {
                if (!employee) return;
                setEmployeeDetails(employee);
                setJoiningDate(formatDate_dd_mm_yyyy(employee.JoiningDate ?? ""));
              });

            }

            if (e.EmployeeId) {

              fetchAssetById(e.AssetMasterId ?? 0).then((assetMaster) => {
                if (!assetMaster) return;
                setAssetMasterData(assetMaster);
              });

            }

            SetIsEditAllowedForAssetAndEmployee(e.IsEditAllowedForAssetAndEmployee);

            setDropdownLabels({
              employeeName: e.EmployeeName || "",
              assetName: e.AssetName || "",
            });
          }
        } else {
          addToast({ type: "error", title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: "error", title: error.message });
      },
      undefined,
      "Loading Asset Mapping",
    );
  };
  //#endregion

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddAssetMappingMasterForm = (): {
    isValid: boolean;

    errors: { [key: string]: string };
  } => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.AssetMasterId) {
      newErrors.AssetMasterId = "Asset is required";
    }

    if (!formData.EmployeeId) {
      newErrors.EmployeeId = "Employee Name is required";
    }

    if (!formData.ConditionOnIssue?.trim()) {
      newErrors.ConditionOnIssue = "Condition On Issue is required";
    }

    if (isReturnAsset === true && !formData.ConditionOnReturn?.trim()) {
      newErrors.ConditionOnReturn = "Condition On Return is required";
    }

    if (isReturnAsset === true && !formData.ReturnDate) {
      newErrors.ReturnDate = "Return Date is required";
    }

    if (!formData.AssignedDate?.trim()) {
      newErrors.AssignedDate = "Assigned Date is required";
    }

    const v_assignedDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.AssignedDate ? new Date(formData.AssignedDate) : undefined);

    const v_returnDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formData.ReturnDate ? new Date(formData.ReturnDate) : undefined);

    if (formData.AssignedDate && !isToDateGreaterOrEqualFromDate(joiningDate!, v_assignedDate!)) {
      newErrors.AssignedDate = "Assigned Date must be greater than or equal to Joining Date";
    }

    if (isReturnAsset === true && formData.ReturnDate && !isToDateGreaterOrEqualFromDate(v_assignedDate!, v_returnDate)) {
      newErrors.ReturnDate = "Return Date must be greater than or equal to Assigned Date";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
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
      Remarks: formData.Remarks,
    };
  };
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
        addToast({ type: "error", title: error.message });
      },
      undefined,
      isAddMode ? "Add Asset" : "Update Asset",
    );
  };
  //#endregion

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      {/* Loader */}

      <Loader loading={isLoading} title={loadingMessage}>
        {" "}
        <div></div>{" "}
      </Loader>

      <div className="flex-1 space-y-2 px-6 py-3 overflow-y-auto thin-scroll ">
        <div className="space-y-4 pb-3">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Asset Details & Mapping</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ================= ASSET COLUMN ================= */}
            <div>
              <SingleSelectDropdownWithPagination
                label="Asset"
                title="Select Asset"
                disabled={!isEditAllowedForAssetAndEmployee}
                size="lg"
                required
                dataFetchCallBack={fetchAssetMasterDropdown}
                onSelected={(item) => {

                  if (!item) {

                    handleFieldChange("AssetMasterId", null);

                    setAssetMasterData(null);
                    return;
                  }

                  handleFieldChange("AssetMasterId", Number(item.value));
                  setAssetMasterData(item as unknown as AssetMasterData);

                }}
                initialValue={createDropdownInitialValue(formData.AssetMasterId, dropdownLabels.assetName)}
                error={errors.AssetMasterId}
              />

              {formData.AssetMasterId != 0 && formData.AssetMasterId != null && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldItem label="Asset Code" value={assetMasterData?.AssetCode || "-"} />
                    <FieldItem label="Asset Name" value={assetMasterData?.AssetName || "-"} />
                    <FieldItem label="Asset Type" value={assetMasterData?.AssetType || "-"} />
                    <FieldItem label="Asset Model" value={assetMasterData?.AssetModel || "-"} />
                    <FieldItem label="Asset Brand" value={assetMasterData?.AssetBrand || "-"} />
                    <FieldItem label="Serial Number" value={assetMasterData?.SerialNumber || "-"} />
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
                disabled={!isEditAllowedForAssetAndEmployee}
                required
                dataFetchCallBack={fetchEmployeeMasterDropdown}
                onSelected={(item) => {

                  if (!item) {

                    handleFieldChange("EmployeeId", 0);

                    setEmployeeDetails(null);
                    setJoiningDate("");
                    return;
                  }
                  setEmployeeDetails(item as unknown as EmployeeMasterData);
                  setJoiningDate(formatDate_dd_mm_yyyy(item.JoiningDate ?? ""));
                  handleFieldChange("EmployeeId", Number(item.value));

                }}
                initialValue={createDropdownInitialValue(formData.EmployeeId, dropdownLabels.employeeName)}
                error={errors.EmployeeId}
              />

              {employeeDetails && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldItem label="Department" value={employeeDetails?.Department || "-"} />
                    <FieldItem label="Designation" value={employeeDetails?.Designation || "-"} />
                    <FieldItem label="Branch" value={employeeDetails?.Branch || "-"} />
                    <FieldItem label="Reporting Person" value={employeeDetails?.ReportPersonName || "-"} />
                    <FieldItem label="Email ID" value={employeeDetails?.EmailId || "-"} />
                    <FieldItem label="Personal Mobile Number" value={employeeDetails?.PersonalMobileNumber || "-"} />
                    <FieldItem label="Joining Date" value={formatDate_dd_mm_yyyy(employeeDetails?.JoiningDate || "-")} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input type="text" required label="Condition On Issue" value={formData.ConditionOnIssue ?? ""} onChange={(e) => handleFieldChange("ConditionOnIssue", e.target.value)} placeholder="Enter Condition On Issue" maxLength={250} error={errors.ConditionOnIssue} />
            </div>
            <div>
              <DatePickerInput label="Assigned Date" value={formatDate_dd_mm_yyyy(formData.AssignedDate)} onChange={(val) => handleFieldChange("AssignedDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))} required error={errors.AssignedDate} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <TextArea label="Remarks" className="thin-scroll" value={formData.Remarks ?? ""} placeholder="Enter Remarks" onChange={(e) => handleFieldChange("Remarks", e.target.value)} error={errors.Remarks} />
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
                    <Input type="text" required label="Condition On Return" value={formData.ConditionOnReturn ?? ""} onChange={(e) => handleFieldChange("ConditionOnReturn", e.target.value)} placeholder="Enter Condition On Return" maxLength={250} error={errors.ConditionOnReturn} />
                  </div>
                  <div>
                    <DatePickerInput label="Return Date" required value={formatDate_dd_mm_yyyy(formData.ReturnDate)} onChange={(val) => handleFieldChange("ReturnDate", convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))} error={errors.ReturnDate} />
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
